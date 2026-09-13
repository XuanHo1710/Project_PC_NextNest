import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductComment,
  ProductCommentDocument,
} from './entities/product-comment.entity';
import {
  ProductReaction,
  ProductReactionDocument,
} from './entities/product-reaction.entity';
import {
  CreateProductCommentDto,
  UpdateProductCommentDto,
  ToggleReactionDto,
  Product,
} from '@project-pc/common';

@Injectable()
export class ProductInteractionService {
  constructor(
    @InjectModel(ProductComment.name)
    private commentModel: Model<ProductCommentDocument>,
    @InjectModel(ProductReaction.name)
    private reactionModel: Model<ProductReactionDocument>,
    @InjectModel(Product.name)
    private productModel: Model<any>,
  ) {}

  // ============= HELPER: Recalculate product rating stats =============

  /**
   * Tính lại totalRatings + avgRating cho 1 product,
   * rồi cập nhật vào document Product.
   */
  private async updateProductRatingStats(
    productId: Types.ObjectId | string,
  ): Promise<void> {
    const productObjId =
      productId instanceof Types.ObjectId
        ? productId
        : new Types.ObjectId(productId);

    const stats = await this.commentModel.aggregate([
      {
        $match: {
          product: productObjId,
          depth: 0,
          isDeleted: false,
          rating: { $gte: 1, $lte: 5 },
        },
      },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const totalRatings = stats[0]?.totalRatings || 0;
    const avgRating = stats[0] ? +stats[0].avgRating.toFixed(1) : 0;

    await this.productModel.updateOne(
      { _id: productObjId },
      { $set: { totalRatings, avgRating } },
    );
  }

  // ============= COMMENTS =============

  /**
   * Tạo comment gốc hoặc reply (tối đa 2 cấp)
   */
  async createComment(dto: CreateProductCommentDto) {
    let depth = 0;
    let parentCommentId: Types.ObjectId | null = null;

    if (dto.parentComment) {
      const parent = await this.commentModel
        .findOne({
          _id: new Types.ObjectId(dto.parentComment),
          isDeleted: false,
        })
        .exec();

      if (!parent) {
        throw new NotFoundException('Comment gốc không tồn tại');
      }

      // Nếu parent là reply (depth=1), gán parentComment = comment gốc (depth=0)
      // Đảm bảo tối đa 2 cấp
      if (parent.depth >= 1) {
        parentCommentId = parent.parentComment || parent._id;
        depth = 1;
      } else {
        parentCommentId = parent._id;
        depth = 1;
      }
    }

    // Comment gốc bắt buộc phải có rating (1-5)
    if (depth === 0 && !dto.rating) {
      throw new BadRequestException('Rating là bắt buộc khi đánh giá sản phẩm');
    }

    const payload: any = {
      product: new Types.ObjectId(dto.product),
      guest: new Types.ObjectId(dto.guest),
      content: dto.content,
      images: dto.images || [],
      depth,
      isAdminReply: dto.isAdminReply || false,
    };

    if (depth === 0) {
      payload.rating = dto.rating;
    }

    if (parentCommentId) {
      payload.parentComment = parentCommentId;
    }

    const comment = new this.commentModel(payload);
    const saved = await comment.save();

    // Tăng repliesCount của comment cha
    if (parentCommentId) {
      await this.commentModel.updateOne(
        { _id: parentCommentId },
        { $inc: { repliesCount: 1 } },
      );
    }

    // Cập nhật rating stats cho product (nếu là comment gốc có rating)
    if (depth === 0 && payload.rating) {
      await this.updateProductRatingStats(payload.product);
    }

    // Populate guest info trước khi trả về
    return this.commentModel
      .findById(saved._id)
      .populate('guest', 'fullname email avatar')
      .lean()
      .exec();
  }

  /**
   * Lấy comments (paginated) + replies cho 1 sản phẩm
   * Trả thêm thống kê rating
   */
  async getCommentsByProduct(
    productId: string,
    page = 1,
    limit = 10,
    guestId?: string,
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new NotFoundException('Invalid product ID');
    }

    const productObjId = new Types.ObjectId(productId);

    // Thống kê rating
    const ratingStats = await this.commentModel.aggregate([
      {
        $match: {
          product: productObjId,
          depth: 0,
          isDeleted: false,
          rating: { $gte: 1, $lte: 5 },
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const statistics = {
      totalRatingAll: 0,
      totalRating1: 0,
      totalRating2: 0,
      totalRating3: 0,
      totalRating4: 0,
      totalRating5: 0,
      averageRating: 0,
    };

    let totalScore = 0;
    ratingStats.forEach((stat) => {
      statistics[`totalRating${stat._id}`] = stat.count;
      statistics.totalRatingAll += stat.count;
      totalScore += stat._id * stat.count;
    });
    if (statistics.totalRatingAll > 0) {
      statistics.averageRating = +(
        totalScore / statistics.totalRatingAll
      ).toFixed(1);
    }

    // Lấy comments gốc (depth=0) paginated
    const skip = (page - 1) * limit;
    const query = {
      product: productObjId,
      depth: 0,
      isDeleted: false,
    };

    const [comments, totalItems] = await Promise.all([
      this.commentModel
        .find(query)
        .populate('guest', 'fullname email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.commentModel.countDocuments(query).exec(),
    ]);

    // Lấy replies cho mỗi comment gốc (bounded để tránh OOM trên bài viết hot;
    // lấy mới nhất trước rồi đảo lại để vẫn hiển thị cũ -> mới)
    const commentIds = comments.map((c) => c._id);
    const MAX_REPLIES_PER_PAGE = 300;
    const repliesDesc = await this.commentModel
      .find({
        parentComment: { $in: commentIds },
        isDeleted: false,
      })
      .populate('guest', 'fullname email avatar')
      .sort({ createdAt: -1 })
      .limit(MAX_REPLIES_PER_PAGE)
      .lean()
      .exec();
    const replies = repliesDesc.reverse();

    // Nếu guestId được cung cấp, kiểm tra reaction của guest này
    let myReactions: Record<string, boolean> = {};
    if (guestId) {
      const allCommentIds = [...commentIds, ...replies.map((r) => r._id)];
      const reactions = await this.reactionModel
        .find({
          comment: { $in: allCommentIds },
          guest: new Types.ObjectId(guestId),
        })
        .lean()
        .exec();

      reactions.forEach((r) => {
        myReactions[r.comment.toString()] = r.isLike;
      });
    }

    // Group replies by parentComment
    const repliesMap = new Map<string, any[]>();
    replies.forEach((reply) => {
      const parentId = reply.parentComment.toString();
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push({
        ...reply,
        myReaction: guestId
          ? (myReactions[reply._id.toString()] ?? null)
          : null,
      });
    });

    // Attach replies + myReaction vào comments
    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment._id.toString()) || [],
      myReaction: guestId
        ? (myReactions[comment._id.toString()] ?? null)
        : null,
    }));

    return {
      statistics,
      comments: commentsWithReplies,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  }

  /**
   * Cập nhật comment (chỉ chủ comment)
   */
  async updateComment(
    commentId: string,
    guestId: string,
    dto: UpdateProductCommentDto,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new NotFoundException('Invalid comment ID');
    }

    const comment = await this.commentModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(commentId),
          guest: new Types.ObjectId(guestId),
          isDeleted: false,
        },
        {
          $set: {
            content: dto.content,
            ...(dto.images ? { images: dto.images } : {}),
            ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
          },
        },
        { new: true },
      )
      .populate('guest', 'fullname email avatar')
      .lean()
      .exec();

    if (!comment) {
      throw new NotFoundException(
        'Comment không tồn tại hoặc bạn không có quyền chỉnh sửa',
      );
    }

    // Nếu rating đã thay đổi → cập nhật lại stats
    if (dto.rating !== undefined && comment.depth === 0) {
      await this.updateProductRatingStats(comment.product);
    }

    return comment;
  }

  /**
   * Xóa comment (soft delete, chỉ chủ comment)
   */
  async deleteComment(commentId: string, guestId: string) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new NotFoundException('Invalid comment ID');
    }

    const comment = await this.commentModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(commentId),
          guest: new Types.ObjectId(guestId),
          isDeleted: false,
        },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!comment) {
      throw new NotFoundException(
        'Comment không tồn tại hoặc bạn không có quyền xóa',
      );
    }

    // Giảm repliesCount của parent nếu là reply
    if (comment.parentComment) {
      await this.commentModel.updateOne(
        { _id: comment.parentComment },
        { $inc: { repliesCount: -1 } },
      );
    }

    // Soft delete các reply con (nếu là comment gốc)
    if (comment.depth === 0) {
      await this.commentModel.updateMany(
        { parentComment: comment._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      );

      // Cập nhật rating stats (comment gốc bị xóa → rating thay đổi)
      await this.updateProductRatingStats(comment.product);
    }

    return { message: 'Xóa bình luận thành công' };
  }

  // ============= REACTIONS (Like/Dislike) =============

  /**
   * Toggle like/dislike trên 1 comment
   * - Nếu chưa react: tạo mới
   * - Nếu đã react cùng loại: xóa reaction (bỏ react)
   * - Nếu đã react khác loại: đổi reaction
   */
  async toggleReaction(dto: ToggleReactionDto) {
    const commentId = new Types.ObjectId(dto.commentId);
    const guestId = new Types.ObjectId(dto.guest);

    // Kiểm tra comment tồn tại
    const comment = await this.commentModel
      .findOne({ _id: commentId, isDeleted: false })
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại');
    }

    const existingReaction = await this.reactionModel
      .findOne({ comment: commentId, guest: guestId })
      .exec();

    if (!existingReaction) {
      // Chưa react → Tạo mới
      await this.reactionModel.create({
        comment: commentId,
        guest: guestId,
        isLike: dto.isLike,
      });

      if (dto.isLike) {
        await this.commentModel.updateOne(
          { _id: commentId },
          { $inc: { likesCount: 1 } },
        );
      } else {
        await this.commentModel.updateOne(
          { _id: commentId },
          { $inc: { dislikesCount: 1 } },
        );
      }

      return {
        action: 'created',
        isLike: dto.isLike,
      };
    }

    if (existingReaction.isLike === dto.isLike) {
      // Đã react cùng loại → Bỏ react
      await this.reactionModel.deleteOne({ _id: existingReaction._id });

      if (dto.isLike) {
        await this.commentModel.updateOne(
          { _id: commentId },
          { $inc: { likesCount: -1 } },
        );
      } else {
        await this.commentModel.updateOne(
          { _id: commentId },
          { $inc: { dislikesCount: -1 } },
        );
      }

      return {
        action: 'removed',
        isLike: null,
      };
    }

    // React khác loại → Đổi
    existingReaction.isLike = dto.isLike;
    await existingReaction.save();

    if (dto.isLike) {
      // Đổi từ dislike sang like
      await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { likesCount: 1, dislikesCount: -1 } },
      );
    } else {
      // Đổi từ like sang dislike
      await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { likesCount: -1, dislikesCount: 1 } },
      );
    }

    return {
      action: 'toggled',
      isLike: dto.isLike,
    };
  }

  /**
   * Lấy reaction của 1 guest trên nhiều comments
   */
  async getMyReactions(guestId: string, commentIds: string[]) {
    const reactions = await this.reactionModel
      .find({
        guest: new Types.ObjectId(guestId),
        comment: {
          $in: commentIds.map((id) => new Types.ObjectId(id)),
        },
      })
      .lean()
      .exec();

    const map: Record<string, boolean> = {};
    reactions.forEach((r) => {
      map[r.comment.toString()] = r.isLike;
    });

    return map;
  }
}
