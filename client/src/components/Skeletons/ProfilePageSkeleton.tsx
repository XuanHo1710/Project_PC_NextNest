import { Skeleton } from 'antd';
import React from 'react';

const ProfilePageSkeleton = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 animate-pulse">
            <div className='mx-5 xl:mx-32 flex items-center gap-2 py-3'>
                <Skeleton.Input style={{ width: 80, height: 18 }} active />
                <span className="text-gray-300">/</span>
                <Skeleton.Input style={{ width: 120, height: 18 }} active />
                <span className="text-gray-300">/</span>
                <Skeleton.Input style={{ width: 140, height: 18 }} active />
            </div>

            <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                {/* Sidebar Skeleton */}
                <div className='col-span-12 lg:col-span-3'>
                    <div className='flex items-center'>
                        <Skeleton.Avatar size={64} active />
                        <div className='mx-4'>
                            <Skeleton.Input style={{ width: 100, height: 20 }} active />
                            <Skeleton.Input style={{ width: 150, height: 24, marginTop: 8 }} active />
                        </div>
                    </div>
                    <ul className='pl-0 my-5 space-y-3'>
                        {[...Array(5)].map((_, index) => (
                            <li key={index}>
                                <Skeleton.Button style={{ width: '100%', height: 50 }} active block />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Content Skeleton */}
                <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800'>
                    <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 mb-6'>
                        <Skeleton.Input style={{ width: 200, height: 30 }} active />
                    </h2>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProfilePageSkeleton;
