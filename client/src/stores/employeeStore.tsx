// stores/productStore.ts
'use client'
import axios from '@/config/configError';
import { create } from 'zustand'

const BASE_URL = 'employee';


export interface IEmployee {
    avatar: string;
    name: string;
    email: string;
    age: number;
    address: string;
    gender: string;
    _id?: string;
}

interface IEmployeeState {
    employees: IEmployee[],
    employee: IEmployee | null,
    loading: boolean,
    message: string,
    fetchEmployees: (queryParams?: string) => Promise<void>,
    getEmployeesNoAccount: () => Promise<void>,
    addEmployee: (employee: Omit<IEmployee, 'id'>) => Promise<number>,
    updateEmployee: (employee: IEmployee) => Promise<number>,
    deleteEmployee: (id: string) => Promise<number>,
    updateManyEmployee: (ids: Array<string>, typeUpdate: string) => Promise<number>,
}

export const useEmployeeStore = create<IEmployeeState>((set) => ({
    employees: [],
    loading: false,
    employee: null,
    message: '',
    fetchEmployees: async (queryParams: string = "") => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ employees: res.data, loading: false })
    },
    getEmployeesNoAccount: async () => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/no-account")
        console.log(res);

        set({ employees: res.data, loading: false })
    },
    getOneEmployee: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ employee: res.data, loading: false })
    },
    addEmployee: async (employee) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, employee)
            console.log("Response after adding employee:", res.status);

            set((state) => ({
                employees: [...state.employees, res.data]
            }))
            return res.status;
        } catch (error) {
            console.log('Error adding employee:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyEmployee: async (ids, typeUpdate) => {
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
            console.log('Error updating employee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateEmployee: async (employee) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${employee._id}`, employee)
            set((state) => ({
                employees: state.employees.map((p: IEmployee) =>
                    p._id === employee._id ? employee : p
                ),
            }))
            return res.status;
        } catch (err) {
            console.log('Error updating employee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteEmployee: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            set((state) => ({
                employees: state.employees.filter((p) => p._id !== id),
            }))
            return res.status;
        } catch (err) {
            console.log('Error deleting employee:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
}))
