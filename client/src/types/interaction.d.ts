// ============== PRODUCT INTERACTION ==============

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
  statistics: {
    totalRatingAll: number;
    totalRating1: number;
    totalRating2: number;
    totalRating3: number;
    totalRating4: number;
    totalRating5: number;
  };
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
