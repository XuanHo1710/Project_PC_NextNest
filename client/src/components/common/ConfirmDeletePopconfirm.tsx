'use client'
import { Popconfirm } from "antd";
import type { PopconfirmProps } from "antd";

interface ConfirmDeletePopconfirmProps extends Omit<PopconfirmProps, "title"> {
    onConfirm: () => void;
    loading?: boolean;
}

export default function ConfirmDeletePopconfirm({
    onConfirm,
    loading = false,
    children,
    ...rest
}: ConfirmDeletePopconfirmProps) {
    return (
        <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading }}
            onConfirm={onConfirm}
            {...rest}
        >
            {children}
        </Popconfirm>
    );
}
