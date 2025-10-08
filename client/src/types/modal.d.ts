import dayjs from "dayjs";

export interface ICategory {
    _id?: string;
    name: string;
    parent: {
        _id: string,
        name: string,
        slug?: string
    },
    children?: ICategory[];
    slug?: string;
}

export interface IDiscount {
    name: string;
    description: string;
    type: string | boolean,
    startDate: string,
    endDate: string,
    valueDiscount: number,
    status: string;
    _id?: string;
    date: dayjs.Dayjs[]
}

export interface IEmployee {
    avatar: string;
    name: string;
    email: string;
    age: number;
    address: string;
    gender: string;
    _id?: string;
}

export interface IProduct {
    name: string;
    description: string;
    category: ICategory,
    images: Array<string>;
    oldPrice: number;
    newPrice?: number;
    discount: number;
    stock: number;
    soldCount?: number;
    otherString: string,
    other: [
        {
            key: string,
            value: string
        }
    ];
    position: number;
    feature: boolean
    status: string;
    _id?: string;
}

export interface IRole {
    name: string;
    description: string;
    permission:
    {
        method: string,
        path: string
    }[];

    _id?: string;
}


export interface IAccountEmployee {
    IDEmp: string;
    password?: string;
    employee: IEmployee;
    employeeId: string;
    role?: IRole;
    roleId: string;
    status: string;
    _id?: string;
    accessToken: string;
}

export interface IAccountLogin {
    IDEmp: string;
    employeeId: string;
    username: string;
    roleId: string;
    role?: IRole;
    accessToken: string;
}

export interface ICreateProductInteraction {
    productId: string;
    guestId: string;
    content: string;
    rating: number;

    images: string[]; // Ảnh đính kèm trong review
}

export interface IReplyComment {
    productInteractionId: string;
    guestIdInteractedBy: { _id: string, name: string, email: string, avatar: string };
    isLiked: boolean; // Like sản phẩm
    isDisLiked: boolean; // Dislike sản phẩm
    content: string;
    isAdminReply: boolean;
    isReply: boolean; // Moved from guestIdInteractedBy to reply level
    images: string[]; // Ảnh đính kèm trong review
    ratingAt: Date;
}

export interface IComment {
    _id: string,
    guestId: { _id: string, name: string, email: string, avatar: string },
    content: string,
    rating: number,
    images: string[],
    createdAt: Date,
    likes: number,
    dislikes: number,
    replies: IReplyComment[]
}

export interface IProductInteraction {
    statistics: {
        totalRatingAll: number,
        totalRating1: number,
        totalRating2: number,
        totalRating3: number,
        totalRating4: number,
        totalRating5: number,
    }
    comments: IComment[],
    pagination: {
        totalItems: number,
        totalPages: number,
        currentPage: number,
        limit: number,
    }
}

export interface IPostReplyComment {
    guestId: string;
    productId: string;
    guestReplyId: string;
    content: string;
    images: string[];
    isAdminReply?: boolean;
}