'use client'
import { useSelectedRowsProduct } from '@/components/Content/ContentProduct';
import TableContent from '@/components/TableContent/TableContent';
import { IProduct } from '@/types/modal.d';
import { DataType } from '@/types/table.d';
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Image, Spin, TableProps, Tag } from 'antd';




export default function TableImportProductCSV({ products, loading }: { products: DataType<IProduct>[], loading: boolean }) {
    const { selectedRows, setSelectedRows } = useSelectedRowsProduct();

    const columns: TableProps<DataType<IProduct>>['columns'] = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Vị trí',
            dataIndex: 'position',
            key: 'position',
            render: (_, { position }) => {
                return (
                    <Tag color="cyan">{position}</Tag>
                )
            }
        },
        {
            title: 'Giá',
            dataIndex: 'oldPrice',
            key: 'oldPrice',
            render: (_, { oldPrice }) => {
                return (
                    <h2>{oldPrice?.toLocaleString()} VND</h2>
                )
            }
        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (_, { images, name }) => {
                return (
                    <Image preview={false} src={images[0]} alt={name} />
                )
            }
        },
        {
            title: 'Số lượng',
            key: 'stock',
            dataIndex: 'stock',
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            dataIndex: 'discount',
            render: (_, { discount }) => {
                return (
                    <Tag color="cyan">{discount * 100} %</Tag>
                )
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
        },
        {
            title: 'Nổi bật',
            key: 'feature',
            dataIndex: 'feature',
            render: (_, { feature }) => {
                return (
                    <h2>{feature ? "Có" : "Không"}</h2>
                )
            }
        },
        {
            title: 'Vị trí',
            key: 'position',
            dataIndex: 'position',
        },
    ];


    let dataTable: DataType<IProduct>[] = [];
    if (products.length > 0) {
        dataTable = products.map((item, index) => (
            {
                key: index.toString(),
                name: item.name,
                description: item.description,
                stock: item.stock,
                discount: item.discount,
                oldPrice: item.oldPrice,
                other: item.other,
                status: item.status,
                feature: item.feature,
                position: item.position,
                _id: item._id,
                images: item.images,
                category: item.category,
                otherString: item.otherString,
            }
        ))
    }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Table product</h2>
                <TableContent<DataType<IProduct>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
            </Spin>
        </>
    );
}
