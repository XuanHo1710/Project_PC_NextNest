import { Skeleton } from 'antd';
import React from 'react';

const DetailPageSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Avatar Section Skeleton */}
            <div className="flex items-center mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Skeleton.Avatar size={80} active className="mr-4" />
                <div className="flex-1">
                    <Skeleton.Input style={{ width: 150, height: 24, marginBottom: 8 }} active />
                    <Skeleton.Input style={{ width: '80%', height: 20, marginBottom: 12 }} active />
                    <Skeleton.Button style={{ width: 120, height: 40 }} active />
                </div>
            </div>

            {/* Form Skeleton */}
            <div className="space-y-6">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center">
                        <Skeleton.Input style={{ width: 100, height: 20, marginRight: 16 }} active />
                        <div className="flex-1">
                            <Skeleton.Input style={{ width: '100%', height: 40 }} active />
                        </div>
                    </div>
                ))}
                <div className="flex items-center">
                    <div style={{ width: 116, marginRight: 16 }}></div>
                    <div className="flex-1">
                        <Skeleton.Button style={{ width: 180, height: 48 }} active />
                    </div>
                </div>
            </div>

            {/* Note Section Skeleton */}
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Skeleton.Input style={{ width: 100, height: 24, marginBottom: 12 }} active />
                <Skeleton paragraph={{ rows: 3 }} active />
            </div>
        </div>
    );
};

export default DetailPageSkeleton;
