// stores/accountEmployeeStore.ts
'use client'
import axios from '@/config/configError';
import { IEmployee } from '@/stores/employeeStore';
import { IRole } from '@/stores/roleStore';
import { create } from 'zustand'

const BASE_URL = 'account-employee';


export interface IAccountEmployee {
    IDEmp: string;
    password: string;
    employee: IEmployee;
    employeeId: string;
    role: IRole;
    roleId: string;
    status: string;
    _id?: string;
}

interface IAccountEmployeeState {
    accountEmployees: IAccountEmployee[],
    accountEmployee: IAccountEmployee | null,
    loading: boolean,
    message: string,
    fetchAccountEmployees: (queryParams?: string) => Promise<void>,
    addAccountEmployee: (accountEmployee: Omit<IAccountEmployee, 'id'>) => Promise<number>,
    updateAccountEmployee: (accountEmployee: IAccountEmployee) => Promise<number>,
    deleteAccountEmployee: (id: string) => Promise<number>,
    updateManyAccountEmployee: (ids: Array<string>, typeUpdate: string) => Promise<number>,
}

export const useAccountEmployeeStore = create<IAccountEmployeeState>((set) => ({
    accountEmployees: [],
    loading: false,
    accountEmployee: null,
    message: '',
    fetchAccountEmployees: async (queryParams: string = "") => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ accountEmployees: res.data, loading: false })
    },
    getOneAccountEmployee: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ accountEmployee: res.data, loading: false })
    },
    addAccountEmployee: async (accountEmployee) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, accountEmployee)
            return res.status;
        } catch (error) {
            console.log('Error adding accountEmployee:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyAccountEmployee: async (ids, typeUpdate) => {
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
            console.log('Error updating accountEmployee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateAccountEmployee: async (accountEmployee) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${accountEmployee._id}`, accountEmployee)
            return res.status;
        } catch (err) {
            console.log('Error updating accountEmployee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteAccountEmployee: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            set((state) => ({
                accountEmployees: state.accountEmployees.filter((p) => p._id !== id),
            }))
            return res.status;
        } catch (err) {
            console.log('Error deleting accountEmployee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
}))
