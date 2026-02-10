// ============== PRODUCT INTERACTION ==============
// Based on: product-service/product-interaction entities

// ============== COMMENT GUEST ==============
export interface ICommentGuest {
  _id: string;
  fullname: string;
  email: string;
  avatar?: string;
}

// ============== COMMENT REPLY ==============
export interface IProductCommentReply {
  _id: string;
  product: string;
  guest: ICommentGuest;
  content: string;
  images: string[];
  parentComment: string;
  depth: number;
  isAdminReply: boolean;
  likesCount: number;
  dislikesCount: number;
  myReaction: boolean | null; // true=liked, false=disliked, null=no reaction
  createdAt: string;
  updatedAt: string;
}

// ============== COMMENT ==============
export interface IProductComment {
  _id: string;
  product: string;
  guest: ICommentGuest;
  content: string;
  rating: number;
  images: string[];
  depth: number;
  isAdminReply: boolean;
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
  replies: IProductCommentReply[];
  myReaction: boolean | null;
  createdAt: string;
  updatedAt: string;
}

// ============== RATING STATISTICS ==============
export interface IRatingStatistics {
  totalRatingAll: number;
  totalRating1: number;
  totalRating2: number;
  totalRating3: number;
  totalRating4: number;
  totalRating5: number;
  averageRating: number;
}

// ============== INTERACTION RESPONSE ==============
export interface IProductInteractionResponse {
  statistics: IRatingStatistics;
  comments: IProductComment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// ============== DTOs ==============
export interface ICreateCommentDto {
  product: string;
  content: string;
  rating?: number;
  images?: string[];
  parentComment?: string;
  isAdminReply?: boolean;
}

export interface IUpdateCommentDto {
  content?: string;
  images?: string[];
  rating?: number;
}

export interface IToggleReactionDto {
  commentId: string;
  isLike: boolean;
}

export interface IReactionResult {
  action: "created" | "removed" | "toggled";
  isLike: boolean | null;
}

// ============== BACKWARD COMPATIBLE ==============
export interface ICreateProductInteraction {
  productId: string;
  guestId: string;
  content: string;
  rating: number;
  images: string[];
}

export interface IReplyComment {
  productInteractionId: string;
  guestIdInteractedBy: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  isLiked: boolean;
  isDisLiked: boolean;
  content: string;
  isAdminReply: boolean;
  isReply: boolean;
  images: string[];
  ratingAt: Date;
}

export interface IComment {
  _id: string;
  guestId: { _id: string; name: string; email: string; avatar: string };
  content: string;
  rating: number;
  images: string[];
  createdAt: Date;
  likes: number;
  dislikes: number;
  replies: IReplyComment[];
}

export interface IProductInteraction {
  statistics: IRatingStatistics;
  comments: IComment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface IPostReplyComment {
  guestId: string;
  productId: string;
  guestReplyId: string;
  content: string;
  images: string[];
  isAdminReply?: boolean;
}
