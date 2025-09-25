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
    soldCount: number
}