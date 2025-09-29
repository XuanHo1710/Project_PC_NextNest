import { Skeleton } from 'antd';
import React from 'react';

const CartPageSkeleton = () => {
    return (
        <div className="md:pt-3 pt-52 dark:bg-slate-900 animate-pulse">
            <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                <Skeleton.Input style={{ width: 100 }} active />
                <i className="fa-solid fa-chevron-right text-stone-500 mx-3"></i>
                <Skeleton.Input style={{ width: 150 }} active />
            </div>
            <h1 className='mx-5 xl:mx-32 py-2 border-b-blue-400 border-solid border-b-2 md:w-2/3 xl:w-1/3'>
                <Skeleton.Input style={{ width: 250, height: 40 }} active />
            </h1>
            <div className='mx-5 xl:mx-32 mt-5 pb-10 content-body grid grid-flow-row grid-cols-12 gap-8 '>
                <div className='col-span-12 lg:col-span-7 max-h-max bg-white shadow-lg rounded-lg p-4'>
                    <div className='cart-list-product' style={{ maxHeight: "550px" }}>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex items-center mb-4 border-b pb-4">
                                <Skeleton.Image style={{ width: 100, height: 100 }} />
                                <div className="ml-4 flex-grow">
                                    <Skeleton.Input style={{ width: '80%', height: 20 }} active />
                                    <Skeleton.Input style={{ width: '50%', marginTop: 8, height: 20 }} active />
                                </div>
                                <div className="ml-auto">
                                    <Skeleton.Input style={{ width: 80, height: 30 }} active />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='subtotal mt-4 p-4 flex items-center justify-between bg-gray-50 rounded-md'>
                        <Skeleton.Input style={{ width: 200, height: 24 }} active />
                        <Skeleton.Input style={{ width: 150, height: 30 }} active />
                    </div>
                </div>
                <div className='col-span-12 lg:col-span-5 py-3 px-5 border-solid border-2 rounded-lg shadow-xl border-gray-200'>
                    <Skeleton.Input style={{ width: '60%', height: 30 }} active />
                    <Skeleton paragraph={{ rows: 3 }} className='mt-5' active />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-5">
                        <div>
                            <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                            <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                        </div>
                        <div>
                            <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                            <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                        </div>
                    </div>
                    <div className='mb-3'>
                        <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                        <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                    </div>
                    <div className='mb-3'>
                        <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                        <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                    </div>
                    <div className='mb-3'>
                        <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                        <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                    </div>
                    <div className='mb-3'>
                        <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                        <Skeleton.Input className='mt-2' style={{ width: '100%', height: 40 }} active />
                    </div>
                    <Skeleton.Button style={{ width: '100%', height: 96 }} active block />
                </div>
            </div >
        </div >
    );
};

export default CartPageSkeleton;
