import { ICategory } from "@/types/modal.d";

export interface ICategoryPreview {
    _id?: string;
    name: string;
    products: {
        _id: string,
        name: string,
        description: string,
        images: Array<string>,
        oldPrice: number,
        newPrice: number,
        discount: number,
        stock: number,
        soldCount: number
    }[],
}

export interface IProductCard {
    _id: string,
    name: string,
    description: string,
    images: Array<string>,
    oldPrice: number,
    newPrice: number,
    discount: number,
    stock: number,
    soldCount: number,
    category?: ICategory,
    other?: [
        {
            key: string,
            value: string
        }
    ];
    ratingAvg?: number;
    totalRatings?: number;
}


export interface IProductWithPagination {
    products: IProductCard[];
    pagination: {
        totalItems: number,
        totalPages: number,
        currentPage: number,
        limit: number,
    }
}



export interface ICartItem {
    product: IProductCard,
    quantity: number,
    subtotal: number,
    price: number
}

export interface ICart {
    _id: string,
    cartItems: ICartItem[],
    total: number,
    guestId: string
}
