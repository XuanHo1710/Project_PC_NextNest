'use client'
import axios from '@/config/axiosClient';
import { ICategoryPreview } from '@/types/model.client';
import { create } from 'zustand'

const BASE_URL = 'category';



interface ICategoryState {
    categoriesPreview: Array<ICategoryPreview> | [],
    loading: boolean,
    message: string,
    getCategoriesPreview: () => Promise<Array<ICategoryPreview> | []>
}

export const useCategoryStoreClient = create<ICategoryState>((set) => ({
    categoriesPreview: [],
    loading: false,
    category: null,
    message: '',
    getCategoriesPreview: async () => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/preview")

        set({ categoriesPreview: res.data, loading: false })
        return res.data as Array<ICategoryPreview> | [];
    }
}))
