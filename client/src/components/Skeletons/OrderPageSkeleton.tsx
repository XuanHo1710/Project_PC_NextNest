import { Skeleton } from 'antd';
import React from 'react';

const OrderPageSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Steps Skeleton */}
            <div className="my-6">
                <Skeleton.Input style={{ width: '100%', height: 40 }} active />
            </div>

            {/* Search Bar Skeleton */}
            <div className="mb-6">
                <Skeleton.Input style={{ width: '100%', height: 48 }} active />
            </div>

            {/* Orders List Skeleton */}
            <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <Skeleton.Input style={{ width: 100, height: 24 }} active />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Skeleton.Input style={{ width: 150, height: 24 }} active />
                                <Skeleton.Input style={{ width: 80, height: 24 }} active />
                            </div>
                        </div>

                        <Skeleton.Input style={{ width: '100%', height: 1 }} active />


                        <div className="flex items-center space-x-4 my-4">
                            <Skeleton.Image style={{ width: 80, height: 80 }} />
                            <div className="flex-1">
                                <Skeleton.Input style={{ width: '80%', height: 24 }} active />
                                <Skeleton.Input style={{ width: '20%', height: 20, marginTop: 8 }} active />
                            </div>
                            <div className="text-right">
                                <Skeleton.Input style={{ width: 100, height: 24 }} active />
                            </div>
                        </div>

                        <Skeleton.Input style={{ width: '100%', height: 1 }} active />

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-right">
                                <Skeleton.Input style={{ width: 200, height: 28 }} active />
                            </div>
                            <div className='flex gap-2'>
                                <Skeleton.Button style={{ width: 100, height: 40 }} active />
                                <Skeleton.Button style={{ width: 150, height: 40 }} active />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderPageSkeleton;
