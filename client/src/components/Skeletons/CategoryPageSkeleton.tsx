'use client';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CategoryPageSkeleton = () => {
    return (
        <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Breadcrumb skeleton */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-3'>
                <Skeleton width={80} height={18} />
                <span className="text-gray-300">/</span>
                <Skeleton width={140} height={18} />
            </div>

            {/* Category title skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b-blue-400 border-solid border-b-2 md:w-2/3 xl:w-1/3">
                <Skeleton width={300} height={40} />
                <Skeleton width={120} height={16} className="ml-2 mt-1" />
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 content-body grid grid-flow-row grid-cols-12 lg:gap-12'>
                {/* Filter sidebar skeleton - Desktop */}
                <div className='hidden lg:block lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-lg max-h-max'>
                    <Skeleton height={40} className="w-full mb-5" />

                    {/* Price range filter skeleton */}
                    <div className='my-5'>
                        <Skeleton width={120} height={24} className="mb-3" />
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 mt-3">
                                <Skeleton circle width={16} height={16} />
                                <Skeleton width={160} height={20} />
                            </div>
                        ))}
                    </div>

                    {/* CPU filter skeleton */}
                    <div className='my-5'>
                        <Skeleton width={80} height={24} className="mb-3" />
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 mt-3">
                                <Skeleton circle width={16} height={16} />
                                <Skeleton width={160} height={20} />
                            </div>
                        ))}
                    </div>

                    {/* RAM filter skeleton */}
                    <div className='my-5'>
                        <Skeleton width={80} height={24} className="mb-3" />
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 mt-3">
                                <Skeleton circle width={16} height={16} />
                                <Skeleton width={160} height={20} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main content skeleton */}
                <div className='col-span-12 lg:col-span-9'>
                    {/* Banner carousel skeleton */}
                    <Skeleton height={250} className="rounded-lg" />

                    {/* Filter and display options skeleton */}
                    <div className='mt-5 mb-28 shadow-lg px-3 py-5 bg-white dark:bg-gray-800 rounded-md'>
                        <div className='lg:flex items-center justify-between mb-6'>
                            <div className='flex gap-2'>
                                {Array(4).fill(0).map((_, i) => (
                                    <Skeleton key={i} width={100} height={36} />
                                ))}
                            </div>
                            <div className='flex items-center justify-between text-right my-5 md:my-0'>
                                <Skeleton width={100} height={36} className="mr-4" />
                                <div className="flex gap-2">
                                    <Skeleton circle width={28} height={28} />
                                    <Skeleton circle width={28} height={28} />
                                </div>
                            </div>
                        </div>

                        {/* Grid view products skeleton */}
                        <div className='grid grid-cols-12 gap-2 mt-6'>
                            {Array(12).fill(0).map((_, i) => (
                                <div key={i} className='col-span-6 lg:col-span-3 p-3 border-solid border-2 border-stone-100 dark:border-stone-900'>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg h-full">
                                        <Skeleton height={150} className="mb-3" />
                                        <Skeleton count={1} width="85%" className="mb-2" />
                                        <Skeleton count={1} width="70%" className="mb-2" />
                                        <div className="mt-2">
                                            <Skeleton height={20} width="60%" className="mb-1" />
                                            <div className="flex items-center">
                                                <Skeleton height={16} width="40%" className="mr-3" />
                                                <Skeleton height={16} width="30%" />
                                            </div>
                                        </div>
                                        <div className="mt-3 mb-2 flex justify-between">
                                            <div className="flex">
                                                <Skeleton circle width={20} height={20} className="mr-2" />
                                                <Skeleton circle width={20} height={20} />
                                            </div>
                                            <Skeleton width={100} height={32} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination skeleton */}
                        <div className='pagination mt-4 flex gap-2 items-center justify-end'>
                            <Skeleton width={300} height={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPageSkeleton;