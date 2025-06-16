// stores/discountStore.ts
'use client'
import axios from '@/config/configError';
import { create } from 'zustand'
import dayjs from 'dayjs';

const BASE_URL = 'discount';


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

interface IDiscountState {
    discounts: IDiscount[],
    discount: IDiscount | null,
    loading: boolean,
    message: string,
    fetchDiscounts: (queryParams: string) => Promise<void>,
    addDiscount: (discount: Omit<IDiscount, 'id'>) => Promise<number>,
    updateDiscount: (discount: IDiscount) => Promise<number>,
    deleteDiscount: (id: string) => Promise<number>,
    updateManyDiscount: (ids: Array<string>, typeUpdate: string) => Promise<number>,
}

export const useDiscountStore = create<IDiscountState>((set) => ({
    discounts: [],
    loading: false,
    discount: null,
    message: '',
    fetchDiscounts: async (queryParams: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ discounts: res.data, loading: false })
    },
    getOneDiscount: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ discount: res.data, loading: false })
    },
    addDiscount: async (discount) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, discount)
            console.log("Response after adding discount:", res.status);

            set((state) => ({
                discounts: [...state.discounts, res.data]
            }))
            return res.status;
        } catch (error) {
            console.log('Error adding discount:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyDiscount: async (ids, typeUpdate) => {
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
            console.log('Error updating discount:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateDiscount: async (discount) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${discount._id}`, discount)
            return res.status;
        } catch (err) {
            console.log('Error updating discount:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteDiscount: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            set((state) => ({
                discounts: state.discounts.filter((p) => p._id !== id),
            }))
            return res.status;
        } catch (err) {
            console.log('Error deleting discount:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
}))
