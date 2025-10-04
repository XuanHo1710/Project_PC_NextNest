import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductInteractionDto } from 'src/admin/product/dto/create-product-interaction.entity';
import { ProductInteractionDetail } from 'src/admin/product/entities/product-interaction-detail.entity';
import { ProductInteraction } from 'src/admin/product/entities/product-interaction.entity';
import { Product } from 'src/admin/product/entities/product.entity';


@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductInteraction.name) private productModelInteraction: Model<ProductInteraction>,
    @InjectModel(ProductInteractionDetail.name) private productModelInteractionDetail: Model<ProductInteractionDetail>


  ) { }

  async findProductByIdCategory(categoryId: string, page: number, sort: string) {
    const filterProduct = {
      category: categoryId
    }

    const sortProduct = {

    };

    if (sort !== "") {
      const keySort = sort.split("=")[1].split("_")[0];
      const valueSort = parseInt(sort.split("=")[1].split("_")[1]);
      sortProduct[keySort] = valueSort;
    }

    const limit = 8;
    const skip = (page - 1) * limit;
    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await this.productModel.countDocuments({ category: categoryId });


    const products = await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1 }
    ).sort(sortProduct).skip(skip).limit(limit).populate("category");

    return {
      products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    }

  }

  async findOne(id: string) {
    return await this.productModel.findOne(
      { _id: id },
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, other: 1, ratingAvg: 1, totalRatings: 1 }
    ).populate("category");
  }


  async searchProductByName(keyname: string = "") {
    const filterProduct = {};

    if (keyname !== "") {
      filterProduct["$or"] = [
        { name: { $regex: keyname, $options: "i" } },   // tìm trong tên
      ];
    }
    return await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1 }
    ).limit(10).populate("category");

  }


  async postCommentOnProduct(createProductInteractionDto: CreateProductInteractionDto) {
    const dataComment = {
      productId: createProductInteractionDto.productId,
      guestId: createProductInteractionDto.guestId,
      content: createProductInteractionDto.content,
      rating: createProductInteractionDto.rating,
      images: createProductInteractionDto.images,
      isRating: true,
    }

    const product = await this.productModel.findOne({ _id: createProductInteractionDto.productId });

    if (product != null) {
      const newTotal = product.totalRatings + 1;
      const newAvg = (product.ratingAvg * product.totalRatings + dataComment.rating) / newTotal;
      await this.productModel.updateOne(
        { _id: product._id },
        {
          $set: { ratingAvg: newAvg, totalRatings: newTotal },
        }
      );
    }
    return await this.productModelInteraction.create(dataComment);
  }

  async getAllCommentByProductId(productId: string, page: number) {
    const filterProduct = {
      productId: productId,
      isRating: true
    }
    const limit = 4 * page;
    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await this.productModelInteraction.countDocuments(filterProduct);
    const commentsProduct = await this.productModelInteraction.find(
      filterProduct,
      { guestId: 1, content: 1, rating: 1, images: 1, createdAt: 1, likes: 1, dislikes: 1 }
    ).sort({ createdAt: -1 }).limit(limit).populate("guestId", { _id: 1, name: 1, email: 1, avatar: 1 });


    const comments = await Promise.all(
      commentsProduct.map(async (comment) => {
        const replies = await this.productModelInteractionDetail
          .find({ productInteractionId: comment._id.toString() })
          .populate("guestIdInteractedBy", { _id: 1, name: 1, email: 1, avatar: 1, isReply: 1 });

        return {
          ...comment.toObject(),
          replies: replies || []
        };
      })
    );


    return {
      comments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: +page,
        limit,
      }
    }
  }

  async replyCommentProduct(guestId: string, productId: string, guestReplyId: string, content: string, images: string[], isAdminReply: boolean = false) {
    const interaction = await this.productModelInteraction.findOne({ productId: productId, guestId: guestId, isRating: true });
    if (interaction == null) {
      throw new BadRequestException('Bình luận không tồn tại');
    }
    const dataReply = {
      guestIdInteractedBy: guestReplyId,
      productInteractionId: interaction._id,
      content: content,
      images: images,
      isLiked: false,
      isAdminReply: isAdminReply,
      isReply: true
    }
    return await this.productModelInteractionDetail.create(dataReply);
  }


  async interactCommentProduct(commentId: string, guestIdInteractedBy: string, isLike: boolean) {
    // Neu isLike = true => like, false => dislike
    const interaction = await this.productModelInteraction.findOne({ _id: commentId, isRating: true });
    if (interaction == null) {
      throw new BadRequestException('Bình luận không tồn tại');
    }
    const interactionDetail = await this.productModelInteractionDetail.findOne(
      {
        guestIdInteractedBy: guestIdInteractedBy,
        productInteractionId: interaction._id
      });


    if (interactionDetail != null) {
      let updateData = {};
      let updateDataDetail = {};

      if (isLike && !interactionDetail.isLiked) {  //Like lần đầu
        if (interactionDetail.isDisLiked) // Dislike roi
          updateData = { $inc: { dislikes: -1, likes: 1 } };
        else
          updateData = { $inc: { likes: 1 } };
        updateDataDetail = { $set: { isLiked: true, isDisLiked: false } };
      } else if (isLike && interactionDetail.isLiked) { // Bỏ like
        updateData = { $inc: { likes: -1 } };
        updateDataDetail = { $set: { isLiked: false, isDisLiked: false } };
      } else if (!isLike && !interactionDetail.isDisLiked) { // Dislike lần đầu
        if (interactionDetail.isLiked) // Like roi
          updateData = { $inc: { likes: -1, dislikes: 1 } };
        else
          updateData = { $inc: { dislikes: 1 } };
        updateDataDetail = { $set: { isLiked: false, isDisLiked: true } };
      } else if (!isLike && interactionDetail.isDisLiked) { // Bỏ Dislike
        updateData = { $inc: { dislikes: -1 } };
        updateDataDetail = { $set: { isLiked: false, isDisLiked: false } };
      }

      if (Object.keys(updateData).length > 0) {
        await this.productModelInteraction.updateOne(
          { _id: interaction._id },
          updateData
        );
      }

      if (Object.keys(updateDataDetail).length > 0) {
        await this.productModelInteractionDetail.updateOne(
          { _id: interactionDetail._id },
          updateDataDetail
        );
      }

      return { message: 'Cập nhật tương tác thành công' };
    } else {
      await this.productModelInteractionDetail.create({
        guestIdInteractedBy: guestIdInteractedBy,
        productInteractionId: interaction._id,
        isLiked: isLike,
        isDisLiked: !isLike,
        isReply: false
      });
      if (isLike) {
        await this.productModelInteraction.updateOne(
          { _id: interaction._id },
          { $inc: { likes: 1 } }
        );
      } else {
        await this.productModelInteraction.updateOne(
          { _id: interaction._id },
          { $inc: { dislikes: 1 } }
        );
      }
      return { message: 'Tạo tương tác thành công' };
    }
  }


  async handleWishlist(guestId: string, productId: string, isWishlisted: boolean) {
    // isWishlisted = true => thêm vào wishlist, false => bỏ khỏi wishlist
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }
    const userWishlist = await this.productModelInteraction.findOne({ guestId: guestId, productId: productId });
    if (userWishlist) {
      if (isWishlisted) {
        await this.productModelInteraction.updateOne(
          { _id: userWishlist._id },
          { $set: { isWishlisted: true } }
        );
        return { message: 'Thêm sản phẩm vào danh sách yêu thích thành công' };
      } else {
        await this.productModelInteraction.updateOne(
          { _id: userWishlist._id },
          { $set: { isWishlisted: false } }
        );
        return { message: 'Bỏ sản phẩm khỏi danh sách yêu thích thành công' };
      }
    } else {
      // Tạo mới mục yêu thích
      const wishlistEntry = new this.productModelInteraction({
        guestId: guestId,
        productId: productId,
        isWishlisted: true
      });
      await wishlistEntry.save();
      return { message: 'Thêm sản phẩm vào danh sách yêu thích thành công' };
    }
  }

  async isWishlistByGuestAndProduct(guestId: string, productId: string) {
    const wishlistEntries = await this.productModelInteraction.find({ productId: productId, guestId: guestId, isWishlisted: true });
    return { isWishlisted: wishlistEntries.length > 0 }
  }
}
