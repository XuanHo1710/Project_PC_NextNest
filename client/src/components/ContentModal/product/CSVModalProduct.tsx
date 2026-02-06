'use client'
import { useSelectedRowsProduct } from '@/components/Content/ContentProduct';
import TableContent from '@/components/TableContent/TableContent';
import { IProduct } from '@/types/product';
import { DataType } from '@/types/table.d';
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
            title: 'Số lượng',
            key: 'stock',
            dataIndex: 'stock',
        },

        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
        },

        {
            title: 'Vị trí',
            key: 'position',
            dataIndex: 'position',
        },
    ];


    let dataTable: DataType<IProduct>[] = [];
    // if (products.length > 0) {
    //     dataTable = products.map((item, index) => (
    //         {
    //             key: index.toString(),
    //             name: item.name,
    //             description: item.description,
    //             stock: item.stock,
    //             discount: item.discount,
    //             oldPrice: item.oldPrice,
    //             other: item.other,
    //             status: item.status,
    //             feature: item.feature,
    //             position: item.position,
    //             _id: item._id,
    //             images: item.images,
    //             category: item.category,
    //             otherString: item.otherString,
    //         }
    //     ))
    // }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Table product</h2>
                <TableContent<DataType<IProduct>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
            </Spin>
        </>
    );
}
