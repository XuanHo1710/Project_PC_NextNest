'use client'
import useAuthEmployee from "@/hooks/AuthEmployeeContext";

export function useHasPermission(): (method: string, path: string) => boolean {
    const { accountLogin } = useAuthEmployee();

    return (method: string, path: string): boolean => {
        const permissions = accountLogin?.role?.permission;
        if (!permissions || permissions.length === 0) {
            return false;
        }
        const normalize = (value: string) =>
            value.replace(/\/+$/, "").toLowerCase();
        const target = normalize(path);
        return permissions.some(
            (p) =>
                p.method.toLowerCase() === method.toLowerCase() &&
                (() => {
                    const granted = normalize(p.path);
                    // Exact match or true sub-path only — prevents
                    // '/admin/product' from granting '/admin/product-variant'
                    return (
                        target === granted ||
                        target.startsWith(granted + "/")
                    );
                })()
        );
    };
}
