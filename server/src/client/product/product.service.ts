import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { CreateProductInteractionDto } from 'src/admin/product/dto/create-product-interaction.entity';
import { ProductInteractionDetail } from 'src/admin/product/entities/product-interaction-detail.entity';
import { ProductInteraction } from 'src/admin/product/entities/product-interaction.entity';
import { Product } from 'src/admin/product/entities/product.entity';

interface ProductCondition {
  other?: {
    $elemMatch: {
      key: string;
      value: {
        $in: RegExp[];
      };
    };
  };
}


@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductInteraction.name) private productModelInteraction: Model<ProductInteraction>,
    @InjectModel(ProductInteractionDetail.name) private productModelInteractionDetail: Model<ProductInteractionDetail>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }


  async getBannerProducts(type: string = "") {
    switch (type) {
      case "pc":
        return this.productModel.find(
          { name: { $regex: /.*pc.*/i } },
          { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
        ).limit(10).populate("category");
      case "screen":
        return this.productModel.find(
          { name: { $regex: /.*screen.*/i } },
          { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
        ).limit(10).populate("category");
      case "aio":
        return this.productModel.find(
          { name: { $regex: /.*aio.*/i } },
          { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
        ).limit(10).populate("category");
      case "discount":
        return this.productModel.find(
          {},
          { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
        ).sort({ discount: -1 }).limit(10).populate("category");
      default:
        return this.productModel.find(
          {},
          { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
        ).sort({ soldCount: -1 }).limit(10).populate("category");
    }
  }

  async findProductByIdCategory(categoryId: string, page: number, sort: string, cpu: string, ram: string, price: string) {
    // Generate cache key based on all filters
    const cacheKey = `products:category:${categoryId}:page:${page}:sort:${sort}:cpu:${cpu}:ram:${ram}:price:${price}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const filterProduct = {
      category: categoryId
    }

    const sortProduct = {

    };

    const conditions: ProductCondition[] = [];


    if (sort !== "") {
      const keySort = sort.split("_")[0];
      const valueSort = parseInt(sort.split("_")[1]);
      sortProduct[keySort] = valueSort;
    }

    if (cpu !== "") {
      const cpuValues = cpu.split(",").map(value => new RegExp(value.trim(), "i"));
      conditions.push({
        other: { $elemMatch: { key: "CPU", value: { $in: cpuValues } } }
      });
    }

    if (ram !== "") {
      const ramValues = ram.split(",").map(value => new RegExp(value.trim(), "i"));
      conditions.push({
        other: { $elemMatch: { key: "RAM", value: { $in: ramValues } } }
      });
    }

    if (conditions.length > 0) {
      filterProduct["$and"] = conditions;
    }

    if (price !== "") {
      filterProduct["newPrice"] = { $gte: (+price.split("-")[0] * 1000000), $lte: (+price.split("-")[1] * 1000000) };
    }


    const limit = 8;
    const skip = (page - 1) * limit;
    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await this.productModel.countDocuments(filterProduct);


    const products = await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
    ).sort(sortProduct).skip(skip).limit(limit).populate("category");

    const result = {
      products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    };

    // Cache for 30 minutes (products change frequently)
    await this.cacheManager.set(cacheKey, result, 1800000);

    return result;

  }

  async findOne(slug: string) {
    // Generate cache key
    const cacheKey = `product:slug:${slug}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productModel.findOne(
      { slug: slug },
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, other: 1, ratingAvg: 1, totalRatings: 1 }
    ).populate("category");

    // Cache for 1 hour
    if (product) {
      await this.cacheManager.set(cacheKey, product, 3600000);
    }

    return product;
  }


  async searchProductByName(keyname: string = "") {
    // Generate cache key
    const cacheKey = `products:search:${keyname}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const filterProduct = {};

    if (keyname !== "") {
      filterProduct["$or"] = [
        { name: { $regex: keyname, $options: "i" } },   // tìm trong tên
      ];
    }
    const products = await this.productModel.find(
      filterProduct,
      { oldPrice: 1, name: 1, newPrice: 1, discount: 1, stock: 1, soldCount: 1, description: 1, images: 1, category: 1, slug: 1 }
    ).limit(10).populate("category");

    // Cache for 15 minutes (search results can change)
    await this.cacheManager.set(cacheKey, products, 900000);

    return products;
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
      // Delete cache of product details to update average rating and total ratings
      const productCacheKey = `product:slug:${product.slug}`;
      await this.cacheManager.del(productCacheKey);
    }

    const result = await this.productModelInteraction.create(dataComment);

    // Invalidate comment cache for this product (all pages)
    for (let page = 1; page <= 30; page++) {
      const cacheKey = `product:comments:${createProductInteractionDto.productId}:page:${page}`;
      await this.cacheManager.del(cacheKey);
    }

    return result;
  }

  async getAllCommentByProductId(productId: string, page: number) {
    // Generate cache key
    const cacheKey = `product:comments:${productId}:page:${page}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

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

    // Đếm tổng số đánh giá theo từng sao
    const totalRating1 = await this.productModelInteraction.countDocuments({ ...filterProduct, rating: 1 });
    const totalRating2 = await this.productModelInteraction.countDocuments({ ...filterProduct, rating: 2 });
    const totalRating3 = await this.productModelInteraction.countDocuments({ ...filterProduct, rating: 3 });
    const totalRating4 = await this.productModelInteraction.countDocuments({ ...filterProduct, rating: 4 });
    const totalRating5 = await this.productModelInteraction.countDocuments({ ...filterProduct, rating: 5 });



    const statistics = {
      totalRatingAll: totalItems,
      totalRating1: totalRating1,
      totalRating2: totalRating2,
      totalRating3: totalRating3,
      totalRating4: totalRating4,
      totalRating5: totalRating5,
    }


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


    const result = {
      statistics,
      comments,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: +page,
        limit,
      }
    };

    // Cache for 10 minutes (comments change frequently)
    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }

  async replyCommentProduct(commentId: string, guestReplyId: string, content: string, images: string[], isAdminReply: boolean = false) {
    const interaction = await this.productModelInteraction.findOne({ _id: commentId, isRating: true });
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

    const result = await this.productModelInteractionDetail.create(dataReply);

    // Invalidate comment cache for this product (all pages)
    for (let page = 1; page <= 10; page++) {
      const cacheKey = `product:comments:${interaction.productId}:page:${page}`;
      await this.cacheManager.del(cacheKey);
    }
    return result;
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

      // Invalidate comment cache for this product (all pages)
      for (let page = 1; page <= 10; page++) {
        const cacheKey = `product:comments:${interaction.productId}:page:${page}`;
        await this.cacheManager.del(cacheKey);
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

      // Invalidate comment cache for this product (all pages)
      for (let page = 1; page <= 10; page++) {
        const cacheKey = `product:comments:${interaction.productId}:page:${page}`;
        await this.cacheManager.del(cacheKey);
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

        // Invalidate wishlist cache
        const cacheKey = `guest:wishlist:${guestId}`;
        await this.cacheManager.del(cacheKey);

        return { message: 'Thêm sản phẩm vào danh sách yêu thích thành công' };
      } else {
        await this.productModelInteraction.updateOne(
          { _id: userWishlist._id },
          { $set: { isWishlisted: false } }
        );

        // Invalidate wishlist cache
        const cacheKey = `guest:wishlist:${guestId}`;
        await this.cacheManager.del(cacheKey);

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

      // Invalidate wishlist cache
      const cacheKey = `guest:wishlist:${guestId}`;
      await this.cacheManager.del(cacheKey);

      return { message: 'Thêm sản phẩm vào danh sách yêu thích thành công' };
    }
  }

  async isWishlistByGuestAndProduct(guestId: string, productId: string) {
    const wishlistEntries = await this.productModelInteraction.find({ productId: productId, guestId: guestId, isWishlisted: true });
    return { isWishlisted: wishlistEntries.length > 0 }
  }

}
