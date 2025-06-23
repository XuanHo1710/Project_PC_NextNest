import dayjs from "dayjs";

export interface ICategory {
    _id?: string;
    name: string;
    parent: {
        _id: string,
        name: string
    },
    children?: ICategory[]
}

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

export interface IEmployee {
    avatar: string;
    name: string;
    email: string;
    age: number;
    address: string;
    gender: string;
    _id?: string;
}

export interface IProduct {
    name: string;
    description: string;
    category: ICategory,
    images: Array<string>;
    oldPrice: number;
    newPrice?: number;
    discount: number;
    stock: number;
    soldCount?: number;
    otherString: string,
    other: [
        {
            key: string,
            value: string
        }
    ];
    position: number;
    feature: boolean
    status: string;
    _id?: string;
}

export interface IRole {
    name: string;
    description: string;
    permission:
    {
        method: string,
        path: string
    }[];

    _id?: string;
}


export interface IAccountEmployee {
    IDEmp: string;
    password: string;
    employee: IEmployee;
    employeeId: string;
    role: IRole;
    roleId: string;
    status: string;
    _id?: string;
    refreshToken: string;
    expireToken: number;
}
