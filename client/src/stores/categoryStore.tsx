
// stores/productStore.ts
'use client'
import axios from '@/config/axios';
import { ICategory } from '@/types/modal.d';
import { create } from 'zustand'

const BASE_URL = 'category';



interface ICategoryState {
    categorys: ICategory[],
    category: ICategory | null,
    loading: boolean,
    message: string,
    fetchCategorys: (queryParams?: string) => Promise<void>,
    addCategory: (category: Omit<ICategory, 'id'>) => Promise<number>,
    updateCategory: (category: ICategory) => Promise<number>,
    deleteCategory: (id: string) => Promise<number>,
    updateManyCategory: (ids: Array<string>, typeUpdate: string) => Promise<number>,
    findOne: (id: string) => Promise<ICategory | null>
}

export const useCategoryStore = create<ICategoryState>((set) => ({
    categorys: [],
    loading: false,
    category: null,
    message: '',
    fetchCategorys: async (queryParams: string = "") => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ categorys: res.data, loading: false })
    },
    getOneCategory: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ category: res.data, loading: false })
    },
    addCategory: async (category) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, category)
            console.log("Response after adding category:", res.status);

            set((state) => ({
                categorys: [...state.categorys, res.data]
            }))
            return res.status;
        } catch (error) {
            console.log('Error adding category:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyCategory: async (ids, typeUpdate) => {
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
            console.log('Error updating category:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateCategory: async (category) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${category._id}`, category)
            return res.status;
        } catch (err) {
            console.log('Error updating category:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteCategory: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            return res.status;
        } catch (err) {
            console.log('Error deleting category:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    findOne: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ category: res.data, loading: false })
        return res.data as ICategory | null;
    }
}))
