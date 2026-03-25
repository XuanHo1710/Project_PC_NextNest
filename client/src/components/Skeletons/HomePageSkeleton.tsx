'use client';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HomePageSkeleton = () => {
    return (
        <div className="md:pt-3 pt-52 py-10 bg-slate-50">
            <div className='content-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12 grid-flow-row gap-2 xl:gap-5'>
                {/* Category sidebar skeleton */}
                <div className='row-span-3 hidden xl:block col-span-3 rounded-lg shadow-lg bg-white'>
                    <div className='m-0 pl-0 rounded-lg max-h-[700px] overflow-y-hidden'>
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className='w-full px-6 py-3 flex items-center justify-between'>
                                <Skeleton width={180} height={24} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main carousel skeleton */}
                <div className='col-span-12 xl:col-span-6 row-span-2'>
                    <Skeleton height={350} className="rounded-lg" />
                </div>

                {/* Banner skeletons */}
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className='col-span-6 xl:col-span-3 relative overflow-hidden'>
                        <Skeleton height={150} className="rounded-lg" />
                    </div>
                ))}

                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className='col-span-6 xl:col-span-3 relative overflow-hidden'>
                        <Skeleton height={150} className="rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Button categories skeleton */}
            <div className='content-center my-10'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-flow-row grid-cols-6 lg:flex gap-2 lg:gap-4 my-16'>
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className='col-span-2 lg:basis-1/5'>
                            <Skeleton height={60} className="w-full rounded-3xl" />
                        </div>
                    ))}
                </div>

                {/* Product carousel skeleton */}
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-10 pb-12 border-none'>
                    <div className='grid grid-cols-5 gap-4'>
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className='px-1.5'>
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <Skeleton height={150} className="mb-3" />
                                    <Skeleton count={2} className="mb-2" />
                                    <Skeleton width={100} className="mb-3" />
                                    <Skeleton height={30} className="mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product categories sections skeleton */}
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className='box-promotion max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10'>
                    <div className='rounded-lg bg-white py-10 px-7 shadow-lg'>
                        <div className='flex items-center justify-between mb-8'>
                            <Skeleton width={200} height={36} />
                            <Skeleton width={80} height={24} />
                        </div>

                        <div className='grid grid-cols-5 gap-4'>
                            {Array(5).fill(0).map((_, j) => (
                                <div key={j} className='px-1.5'>
                                    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                        <Skeleton height={150} className="mb-3" />
                                        <Skeleton count={2} className="mb-2" />
                                        <Skeleton width={100} className="mb-3" />
                                        <Skeleton height={30} className="mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Slogan skeleton */}
            <div className='h-60 content-center text-white my-10 flex flex-wrap items-center justify-center'>
                <Skeleton width={500} height={50} />
            </div>

            {/* Showroom information skeleton */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='rounded-lg bg-white py-10 px-7 shadow-md'>
                    <div className='flex items-center justify-center mb-8'>
                        <Skeleton width={500} height={36} />
                    </div>
                    <div className='mt-12 grid grid-flow-row grid-cols-12 gap-3'>
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className='col-span-12 my-3 sm:col-span-6 xl:col-span-3'>
                                <div className='flex items-center mb-3'>
                                    <Skeleton width={60} height={60} className="mr-4 rounded-md" />
                                    <div>
                                        <Skeleton width={150} height={16} className="mb-2" />
                                        <Skeleton width={180} height={20} />
                                    </div>
                                </div>
                                <Skeleton count={5} className="mb-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageSkeleton;