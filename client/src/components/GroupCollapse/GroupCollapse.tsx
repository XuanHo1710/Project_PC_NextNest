'use client'
import { IRole } from "@/types/role";
import { Button, Collapse, Switch } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUpdateRole } from "@/hooks/admin";
import { useQueryClient } from "@tanstack/react-query";

interface IProp {
    name?: string;
    path?: string;
    originName?: string;
    handleChange: (isSelected: boolean, method: string, path: string) => void;
    selected: IPermission[]
}

interface IPermission {
    method: string,
    path: string
}

const ContextCollapse = (prop: IProp) => {
    return (
        <>
            <div className="grid grid-flow-row grid-cols-12 gap-5">
                <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                    <div className="flex gap-4 items-center">
                        <Switch
                            checked={prop.selected.some(
                                (p) => p.method === "POST" && p.path === "/api/v1/admin/" + prop.path
                            )}
                            onChange={(isSelected) => prop.handleChange(isSelected, "POST", "/api/v1/admin/" + prop.path)} />
                        <div>
                            <h3 className="font-semibold text-lg">Create {prop.name}</h3>
                            <p className="text-slate-500">
                                <span className="text-green-500 font-bold">POST</span>  /api/v1/admin/{prop.path}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                    <div className="flex gap-4 items-center">
                        <Switch
                            checked={
                                ["/api/v1/admin/" + prop.path, "/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`]
                                    .every(path => prop.selected.some(p => p.method === "GET" && p.path === path))
                            }
                            onChange={(isSelected) => {
                                prop.handleChange(isSelected, "GET", "/api/v1/admin/" + prop.path);
                                prop.handleChange(isSelected, "GET", "/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`)
                            }}
                        />
                        <div>
                            <h3 className="font-semibold text-lg">Get {prop.name} All</h3>
                            <p className="text-slate-500"><span className="text-blue-500 font-bold">GET</span>  /api/v1/admin/{prop.path}</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                    <div className="flex gap-4 items-center">
                        <Switch
                            checked={
                                ["/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`, "/api/v1/admin/" + prop.path + "/updateMany"]
                                    .every(path => prop.selected.some(p => p.method === "PATCH" && p.path === path))
                            }
                            onChange={(isSelected) => {
                                prop.handleChange(isSelected, "PATCH", "/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`);
                                prop.handleChange(isSelected, "PATCH", "/api/v1/admin/" + prop.path + "/updateMany")
                            }}
                        />
                        <div>
                            <h3 className="font-semibold text-lg">Update {prop.name}</h3>
                            <p className="text-slate-500"><span className="text-neutral-800 font-bold">PATCH</span>  /api/v1/admin/{prop.path}{prop.path === "settings" ? "/:key" : "/:id"}</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                    <div className="flex gap-4 items-center">
                        <Switch
                            checked={prop.selected.some(
                                (p) => p.method === "DELETE" && p.path === "/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`
                            )} onChange={(isSelected) => prop.handleChange(isSelected, "DELETE", "/api/v1/admin/" + prop.path + `${prop.path === "settings" ? "/:key" : "/:id"}`)}
                        />
                        <div>
                            <h3 className="font-semibold text-lg">Delete {prop.name}</h3>
                            <p className="text-slate-500"><span className="text-red-500 font-bold">DELETE</span>  /api/v1/admin/{prop.path}{prop.path === "settings" ? "/:key" : "/:id"}</p>
                        </div>
                    </div>
                </div>

                {/* For account employee */}
                {prop.path === "account-employee" && (
                    <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                        <div className="flex gap-4 items-center">
                            <Switch
                                checked={prop.selected.some(
                                    (p) => p.method === "GET" && p.path === "/api/v1/admin/" + prop.path + "/:id/history"
                                )} onChange={(isSelected) => prop.handleChange(isSelected, "GET", "/api/v1/admin/" + prop.path + "/:id/history")}
                            />
                            <div>
                                <h3 className="font-semibold text-lg">Get History {prop.name}</h3>
                                <p className="text-slate-500"><span className="text-blue-500 font-bold">GET</span>  /api/v1/admin/{prop.path}/:id/history</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* For product variant */}
                {prop.path === "product" && (
                    <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                        <div className="flex gap-4 items-center">
                            <Switch
                                checked={prop.selected.some(
                                    (p) => p.method === "GET" && p.path === "/api/v1/admin/" + "product-variant"
                                )} onChange={(isSelected) => prop.handleChange(isSelected, "GET", "/api/v1/admin/" + "product-variant")}
                            />
                            <div>
                                <h3 className="font-semibold text-lg">Get variant {prop.name}</h3>
                                <p className="text-slate-500"><span className="text-neutral-800 font-bold">GET</span>  /api/v1/admin/product-variant</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* For product variant */}
                {prop.path === "order" && (
                    <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                        <div className="flex gap-4 items-center">
                            <Switch
                                checked={prop.selected.some(
                                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/" + prop.path + "/:id/handle-rejection"
                                )} onChange={(isSelected) => prop.handleChange(isSelected, "PATCH", "/api/v1/admin/" + prop.path + "/:id/handle-rejection")}
                            />
                            <div>
                                <h3 className="font-semibold text-lg">Handle Rejection {prop.name}</h3>
                                <p className="text-slate-500"><span className="text-neutral-800 font-bold">PATCH</span>  /api/v1/admin/{prop.path}/:id/handle-rejection</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
};



export const GroupCollapse = ({ roleSelected }: { roleSelected: IRole | null }) => {
    const [selected, setSelected] = useState<IPermission[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (roleSelected !== null) {
            setSelected(roleSelected.permission);
        } else setSelected([]);
    }, [roleSelected]);


    const updateRole = useUpdateRole();

    const handleChange = (isSelected: boolean, method: string, path: string) => {
        if (roleSelected === null) {
            toast.error("Vui lòng chọn vai trò !!");
            return;
        }

        const permissionExists = selected.some(s => s.method === method && s.path === path);

        if (isSelected && !permissionExists) {
            setSelected(prev => [...prev, { method, path }]);
        }

        if (!isSelected && permissionExists) {
            setSelected(prev => prev.filter(s => !(s.method === method && s.path === path)));
        }
    }

    const handleSubmit = async () => {
        if (roleSelected === null || !roleSelected._id) {
            toast.error("Vui lòng chọn vai trò !!")
            return;
        }
        roleSelected.permission = selected;
        try {
            await updateRole.mutateAsync({
                id: roleSelected._id,
                data: {
                    permission: selected,
                    _id: roleSelected._id,
                    name: roleSelected.name,
                    description: roleSelected.description
                }
            });
            // Refetch role data to update UI
            await queryClient.refetchQueries({
                queryKey: ["roles", "detail", roleSelected._id]
            });
            toast.success("Cập nhật quyền vai trò thành công !!");
        } catch (err) {
            toast.error("Cập nhật quyền vai trò thất bại do lỗi: " + err)
        }
    }


    return (
        <>
            <Collapse
                items={[
                    {
                        key: '1',
                        label: <h2 className="text-md font-semibold">ACCOUNT EMPLOYEE</h2>,
                        children: (
                            <ContextCollapse
                                originName="ACCOUNT EMPLOYEE"
                                path="account-employee"
                                name="Account Employee"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '2',
                        label: <h2 className="text-md font-semibold">ACCOUNT GUEST</h2>,
                        children: (
                            <ContextCollapse
                                originName="ACCOUNT GUEST"
                                path="account-guest"
                                name="Account Guest"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '3',
                        label: <h2 className="text-md font-semibold">PRODUCT</h2>,
                        children: (
                            <ContextCollapse
                                originName="PRODUCT"
                                path="product"
                                name="Product"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '4',
                        label: <h2 className="text-md font-semibold">CATEGORY</h2>,
                        children: (
                            <ContextCollapse
                                originName="CATEGORY"
                                path="category"
                                name="Category"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '5',
                        label: <h2 className="text-md font-semibold">EMPLOYEE</h2>,
                        children: (
                            <ContextCollapse
                                originName="EMPLOYEE"
                                path="employee"
                                name="Employee"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '6',
                        label: <h2 className="text-md font-semibold">GUEST</h2>,
                        children: (
                            <ContextCollapse
                                originName="GUEST"
                                path="guest"
                                name="Guest"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '7',
                        label: <h2 className="text-md font-semibold">ROLE</h2>,
                        children: (
                            <ContextCollapse
                                originName="ROLE"
                                path="role"
                                name="Role"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '8',
                        label: <h2 className="text-md font-semibold">ORDER</h2>,
                        children: (
                            <ContextCollapse
                                originName="ORDER"
                                path="order"
                                name="Order"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '9',
                        label: <h2 className="text-md font-semibold">BRAND</h2>,
                        children: (
                            <ContextCollapse
                                originName="BRAND"
                                path="brand"
                                name="Brand"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    },
                    {
                        key: '10',
                        label: <h2 className="text-md font-semibold">SETTING</h2>,
                        children: (
                            <ContextCollapse
                                originName="SETTING"
                                path="settings"
                                name="Setting"
                                handleChange={handleChange}
                                selected={selected}
                            />
                        ),
                    }
                ]}
            />
            <Button onClick={handleSubmit} variant="outlined" color="blue" className="my-5 !py-4 !px-10">Cập nhật quyền</Button>
        </>
    );
};
