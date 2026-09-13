import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, UpdateCartDto } from '@project-pc/common';
import { Cart } from 'src/cart/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariant>,
  ) {}

  /**
   * Ownership guard: khi cả requesterId và guestId được cung cấp thì phải khớp nhau.
   */
  private assertOwnership(requesterId?: string | null, guestId?: string | null) {
    const requester = requesterId ? String(requesterId) : '';
    const target = guestId ? String(guestId) : '';
    if (requester && target && requester !== target) {
      throw new UnauthorizedException('Không có quyền truy cập giỏ hàng');
    }
  }

  /**
   * Tìm cart theo guestId, populate đầy đủ thông tin variant → product → brand/category
   * The populate chain:
   * - cartItems.product: references ProductVariant by its _id
   * - ProductVariant.product: references Product by its _id
   * - Product.brand & Product.category: references Brand and Category
   */
  async findOne(guestId: string, requesterId?: string) {
    this.assertOwnership(requesterId, guestId);

    const cart = await this.cartModel
      .findOne({ guestId: new Types.ObjectId(guestId) })
      .populate({
        path: 'cartItems.product',
        populate: {
          path: 'product',
          select: '_id name slug brand category',
          populate: [
            { path: 'brand', select: '_id name logo' },
            { path: 'category', select: '_id name slug' },
          ],
        },
      })
      .lean();

    return cart;
  }

  /**
   * Upsert cart theo guestId — luôn chỉ tạo 1 cart duy nhất cho mỗi guest.
   * Nếu chưa có → tạo mới, nếu đã có → cập nhật.
   *
   * Server-side re-pricing: price/subtotal/total luôn được tính lại từ
   * ProductVariant trong DB, không bao giờ persist giá trị client gửi lên.
   */
  async update(
    guestIdParam: string,
    updateCartDto: UpdateCartDto,
    requesterId?: string,
  ) {
    this.assertOwnership(requesterId, guestIdParam);

    // Use guestId from URL param as authoritative source
    const guestId = new Types.ObjectId(guestIdParam);
    const rawItems = updateCartDto.cartItems || [];

    for (const item of rawItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new BadRequestException(
          'Số lượng phải là số nguyên trong khoảng 1 đến 99',
        );
      }
    }

    // Resolve every variant from the DB — never trust client prices
    const variantIds = [
      ...new Set(rawItems.map((item) => String(item.product?._id || ''))),
    ];
    const variants = await this.productVariantModel
      .find({
        _id: {
          $in: variantIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id)),
        },
      })
      .lean();
    const variantMap = new Map(variants.map((v) => [String(v._id), v]));

    let total = 0;
    const cartItems = rawItems.map((item) => {
      const variantKey = String(item.product?._id || '');
      const variant = variantMap.get(variantKey);
      if (!variant) {
        throw new BadRequestException(`Sản phẩm không tồn tại: ${variantKey}`);
      }
      const price = Number(variant.price ?? 0);
      const quantity = Number(item.quantity);
      const subtotal = price * quantity;
      total += subtotal;

      return {
        product: new Types.ObjectId(variantKey),
        quantity,
        price,
        subtotal,
      };
    });

    const result = await this.cartModel.findOneAndUpdate(
      { guestId },
      { $set: { guestId, cartItems, total } },
      { upsert: true, new: true },
    );

    return result;
  }
}
