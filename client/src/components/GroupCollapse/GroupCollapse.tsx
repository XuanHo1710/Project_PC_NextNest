import { Collapse, Switch } from "antd";

interface IProp {
    name?: string;
    path?: string;
    originName?: string;
}

const ContextCollapse = (prop: IProp) => {

    return (
        <div className="grid grid-flow-row grid-cols-12 gap-5">
            <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                <div className="flex gap-4 items-center">
                    <Switch />
                    <div>
                        <h3 className="font-semibold text-lg">Create {prop.name}</h3>
                        <p className="text-slate-500">
                            <span className="text-green-500 font-bold">POST</span>  /api/v1/{prop.path}
                        </p>
                    </div>
                </div>
            </div>
            <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                <div className="flex gap-4 items-center">
                    <Switch />
                    <div>
                        <h3 className="font-semibold text-lg">Get {prop.name} By ID</h3>
                        <p className="text-slate-500"><span className="text-blue-500 font-bold">GET</span>  /api/v1/{prop.path}/:id</p>
                    </div>
                </div>
            </div>
            <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                <div className="flex gap-4 items-center">
                    <Switch />
                    <div>
                        <h3 className="font-semibold text-lg">Get {prop.name} With Paginate</h3>
                        <p className="text-slate-500"><span className="text-blue-500 font-bold">GET</span>  /api/v1/{prop.path}</p>
                    </div>
                </div>
            </div>
            <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                <div className="flex gap-4 items-center">
                    <Switch />
                    <div>
                        <h3 className="font-semibold text-lg">Update {prop.name}</h3>
                        <p className="text-slate-500"><span className="text-neutral-800 font-bold">PATCH</span>  /api/v1/{prop.path}/:id</p>
                    </div>
                </div>
            </div>
            <div className="col-span-6 p-4 rounded-2xl border border-solid border-slate-200">
                <div className="flex gap-4 items-center">
                    <Switch />
                    <div>
                        <h3 className="font-semibold text-lg">Delete {prop.name}</h3>
                        <p className="text-slate-500"><span className="text-red-500 font-bold">DELETE</span>  /api/v1/{prop.path}/:id</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const GroupCollapse = () => {
    return (
        <Collapse
            items={[
                {
                    key: '1',
                    label: <h2 className="text-md font-semibold">USER</h2>,
                    children: (
                        <ContextCollapse
                            originName="USER"
                            path="users"
                            name="User"
                        />
                    ),
                },
                {
                    key: '2',
                    label: <h2 className="text-md font-semibold">PRODUCT</h2>,
                    children: (
                        <ContextCollapse
                            originName="PRODUCT"
                            path="products"
                            name="Product"
                        />
                    ),
                },
                {
                    key: '3',
                    label: <h2 className="text-md font-semibold">CATEGORY</h2>,
                    children: (
                        <ContextCollapse
                            originName="CATEGORY"
                            path="categories"
                            name="Category"
                        />
                    ),
                },
                {
                    key: '4',
                    label: <h2 className="text-md font-semibold">ACCOUNT</h2>,
                    children: (
                        <ContextCollapse
                            originName="ACCOUNT"
                            path="accounts"
                            name="Account"
                        />
                    ),
                }
            ]}
        />
    );
};
