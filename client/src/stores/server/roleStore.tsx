// stores/roleStore.ts
'use client'
import axios from '@/config/axios';
import { IRole } from '@/types/modal.d';
import { create } from 'zustand'

const BASE_URL = 'role';


interface IRoleState {
    roles: IRole[],
    role: IRole | null,
    loading: boolean,
    message: string,
    fetchRoles: (queryParams?: string) => Promise<void>,
    getRoleById: (id: string) => Promise<IRole>,
    addRole: (role: Omit<IRole, 'id'>) => Promise<number>,
    updateRole: (role: IRole) => Promise<number>,
    deleteRole: (id: string) => Promise<number>,
    updateManyRole: (ids: Array<string>, typeUpdate: string) => Promise<number>,
}

export const useRoleStore = create<IRoleState>((set) => ({
    roles: [],
    loading: false,
    role: null,
    message: '',
    fetchRoles: async (queryParams: string = "") => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + queryParams)
        set({ roles: res.data, loading: false })
    },
    getRoleById: async (id: string) => {
        set({ loading: true })
        const res = await axios.get(BASE_URL + "/" + id)
        set({ role: res.data, loading: false })
        return res.data
    },
    addRole: async (role) => {
        set({ loading: true })
        try {
            const res = await axios.post(BASE_URL, role)
            set((state) => ({
                roles: [...state.roles, res.data]
            }))
            return res.status;
        } catch (error) {
            console.log('Error adding role:', error);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateManyRole: async (ids, typeUpdate) => {
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
            console.log('Error updating role:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    updateRole: async (role) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`${BASE_URL}/${role._id}`, role)
            return res.status;
        } catch (err) {
            console.log('Error updating role:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
    deleteRole: async (id: string) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`${BASE_URL}/${id}`)
            set((state) => ({
                roles: state.roles.filter((p) => p._id !== id),
            }))
            return res.status;
        } catch (err) {
            console.log('Error deleting role:', err);
            return 500;
        } finally {
            set({ loading: false })
        }
    },
}))
