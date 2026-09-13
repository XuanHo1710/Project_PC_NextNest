"use client";
import { useQuery } from "@tanstack/react-query";
import { categoryClientService } from "@/services/client";
import { ICategory } from "@/types/category";

/**
 * Full category tree data (parents + children) for hover panels.
 * Loads every page internally — no visible pagination/load-more.
 */
export function useCategories() {
    const query = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryClientService.getAllCategories(),
        staleTime: 1000 * 60 * 5,
    });

    const categories: ICategory[] = query.data ?? [];

    return { ...query, categories };
}
