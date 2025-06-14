// stores/productStore.ts
'use client'
import axios from '@/config/configError';
import { create } from 'zustand'

const BASE_URL = 'product';


export interface IProduct {
    name: string;
    description: string;
    category: string,
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

interface IProductState {
    products: IProduct[],
    product: IProduct | null,
    loading: boolean,
    message: string,
    fetchProducts: (queryParams: string) => Promise<void>,
    addProduct: (product: Omit<IProduct, 'id'>) => Promise<number>,
    updateProduct: (product: IProduct) => Promise<number>,
    deleteProduct: (id: string) => Promise<number>,
    updateManyProduct: (ids: Array<string>, typeUpdate: string) => Promise<number>,
}

export const useProductStore = create<IProductState>((set) => ({
    products: [],
    loading: false,
    product: null,
    message: '',
    fetchProducts: async (queryParams: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ products: res.data, loading: false })
    },
    getOneProduct: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ product: res.data, loading: false })
    },
    addProduct: async (product) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, product)
            console.log("Response after adding product:", res.status);

            set((state) => ({
                products: [...state.products, res.data]
            }))
            return res.status;
        } catch (error) {
            console.log('Error adding product:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyProduct: async (ids, typeUpdate) => {
        set({ loading: true })
        try {
            const dataUpdate = {
                ids,
                typeUpdate
            }

            const res = await axios.patch(BASE_URL + "/updateMany", dataUpdate)
            // ✅ Gọi lại fetch sau khi update
            return res.status;
        } catch (err) {
            console.log('Error updating product:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateProduct: async (product) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${product._id}`, product)
            set((state) => ({
                products: state.products.map((p: IProduct) =>
                    p._id === product._id ? product : p
                ),
            }))
            return res.status;
        } catch (err) {
            console.log('Error updating product:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteProduct: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            set((state) => ({
                products: state.products.filter((p) => p._id !== id),
            }))
            return res.status;
        } catch (err) {
            console.log('Error deleting product:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
}))
