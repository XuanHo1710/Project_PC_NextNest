import { Skeleton } from 'antd';
import React from 'react';

const PasswordPageSkeleton = () => {
    return (
        <div className="max-w-md animate-pulse">
            <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                    <div key={index}>
                        <Skeleton.Input style={{ width: 150, height: 20, marginBottom: 8 }} active />
                        <Skeleton.Input style={{ width: '100%', height: 40 }} active />
                    </div>
                ))}
                <div>
                    <Skeleton.Button style={{ width: 150, height: 48 }} active />
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Skeleton.Input style={{ width: 200, height: 24, marginBottom: 12 }} active />
                <Skeleton paragraph={{ rows: 3 }} active />
            </div>
        </div>
    );
};

export default PasswordPageSkeleton;
