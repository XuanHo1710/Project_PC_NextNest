import { Skeleton } from 'antd';
import React from 'react';

const AddressPageSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
                <Skeleton.Input style={{ width: 250, height: 30 }} active />
                <Skeleton.Button style={{ width: 180, height: 40 }} active />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-md">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton.Input style={{ width: 150, height: 28 }} active />
                                <Skeleton.Input style={{ width: 100, height: 24 }} active />
                            </div>
                            <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                            <Skeleton.Input style={{ width: '80%', height: 20 }} active />
                        </div>
                        <div className="flex justify-start gap-4 mt-4 pt-4 border-t">
                            <Skeleton.Button style={{ width: 100, height: 32 }} active />
                            <Skeleton.Button style={{ width: 120, height: 32 }} active />
                            <Skeleton.Button style={{ width: 80, height: 32 }} active />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddressPageSkeleton;
