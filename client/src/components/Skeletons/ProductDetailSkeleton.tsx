'use client';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductDetailSkeleton = () => {
    return (
        <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-gray-900 dark:text-white">
            {/* Breadcrumb skeleton */}
            <div className='mx-5 xl:mx-32 flex items-center gap-2 py-3'>
                <Skeleton width={80} height={18} />
                <span className="text-gray-300">/</span>
                <Skeleton width={120} height={18} />
                <span className="text-gray-300">/</span>
                <Skeleton width={200} height={18} />
            </div>

            {/* Product info section skeleton */}
            <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 md:p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg'>
                {/* Product title skeleton */}
                <div className='py-3 border-solid border-b-2 border-blue-200 flex items-center'>
                    <Skeleton width="70%" height={36} />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 my-6 gap-8'>
                    {/* Image gallery skeleton - Left column */}
                    <div className='lg:col-span-5 xl:col-span-4'>
                        <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
                            <Skeleton height={400} className="rounded-lg" />
                        </div>

                        {/* Thumbnails skeleton */}
                        <div className='grid grid-cols-5 gap-2'>
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="border border-gray-200 rounded-md overflow-hidden">
                                    <Skeleton height={60} />
                                </div>
                            ))}
                        </div>

                        {/* Rating box skeleton */}
                        <div className='mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                            <div className="flex justify-between">
                                <div className="flex flex-col items-center">
                                    <Skeleton width={40} height={24} className="mb-2" />
                                    <Skeleton width={120} height={20} className="mb-1" />
                                    <Skeleton width={80} height={16} />
                                </div>
                                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
                                <div className="flex flex-col">
                                    <Skeleton width={100} height={20} className="mb-2" />
                                    <Skeleton width={120} height={20} />
                                </div>
                            </div>
                        </div>

                        {/* Share buttons skeleton */}
                        <div className="mt-4 flex items-center">
                            <Skeleton width={60} height={20} className="mr-3" />
                            <Skeleton circle width={32} height={32} className="mr-2" />
                            <Skeleton circle width={32} height={32} className="mr-2" />
                            <Skeleton circle width={32} height={32} />
                        </div>
                    </div>

                    {/* Product details skeleton - Right column */}
                    <div className='lg:col-span-7 xl:col-span-8'>
                        {/* Product specs skeleton */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                            <Skeleton width={180} height={24} className="mb-3" />
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-y-2'>
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className='flex items-start'>
                                        <Skeleton width={16} height={16} className="mr-2 mt-1" />
                                        <div className="flex-1">
                                            <Skeleton width="90%" height={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="my-4">
                                <Skeleton height={1} />
                            </div>
                            <Skeleton count={2} />
                        </div>

                        {/* Price section skeleton */}
                        <div className='px-4 py-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-sm'>
                            <div className='md:flex items-end mb-4'>
                                <Skeleton width={150} height={40} className="mb-2" />
                                <div className="flex items-center ml-4">
                                    <Skeleton width={120} height={24} className="mr-2" />
                                    <Skeleton width={60} height={24} />
                                </div>
                            </div>
                            <Skeleton width={300} height={28} />
                        </div>

                        {/* Gift promo skeleton */}
                        <div className='border-solid border-2 border-red-400 rounded-lg shadow-md mb-6'>
                            <div className='p-3 flex items-center border-b-2 border-solid border-red-100'>
                                <Skeleton width={300} height={24} />
                            </div>
                            <div className='p-4'>
                                <Skeleton width={280} height={24} className="mb-4" />
                                <div className="space-y-3 mt-4">
                                    {Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="mr-2">
                                                <Skeleton width={16} height={16} />
                                            </div>
                                            <div className="flex-1">
                                                <Skeleton count={1} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Shipping info skeleton */}
                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                            <Skeleton width={180} height={24} className="mb-3" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="mr-2">
                                            <Skeleton circle width={16} height={16} />
                                        </div>
                                        <Skeleton width={120} height={20} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buy buttons skeleton */}
                        <div className='flex flex-wrap gap-4 mt-6'>
                            <Skeleton width={180} height={50} />
                            <Skeleton width={180} height={50} />
                            <Skeleton width={120} height={50} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product tabs skeleton */}
            <div className='rounded-lg mx-5 xl:mx-32 content-body my-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>
                <div className="mb-4">
                    <div className="flex border-b">
                        <div className="py-2 px-4 border-b-2 border-blue-500">
                            <Skeleton width={120} height={24} />
                        </div>
                        <div className="py-2 px-4">
                            <Skeleton width={120} height={24} />
                        </div>
                        <div className="py-2 px-4">
                            <Skeleton width={120} height={24} />
                        </div>
                        <div className="py-2 px-4">
                            <Skeleton width={120} height={24} />
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <Skeleton width={300} height={28} className="mb-4" />
                    <Skeleton count={6} className="mb-3" />

                    <div className="my-6">
                        <Skeleton height={250} className="mb-2" />
                        <div className="text-center">
                            <Skeleton width={200} height={16} />
                        </div>
                    </div>

                    <Skeleton width={240} height={28} className="mb-4" />
                    <Skeleton count={4} className="mb-3" />
                </div>
            </div>

            {/* Related products skeleton */}
            <div className='rounded-lg mx-5 my-10 xl:mx-32 content-body py-5 p-4 bg-white dark:bg-gray-800 shadow-lg'>
                <div className='font-bold text-xl lg:text-3xl line-clamp-1 py-2 border-solid border-b-2 border-blue-200 flex items-center mb-8'>
                    <Skeleton width={240} height={36} />
                </div>

                <div className="grid grid-cols-5 gap-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="px-1.5">
                            <div className="bg-white dark:bg-gray-750 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700">
                                <Skeleton height={140} className="mb-3" />
                                <Skeleton count={2} className="mb-2" />
                                <Skeleton width={100} className="mb-2" />
                                <Skeleton height={32} className="mt-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;