import { Skeleton } from 'antd';

export const WishlistSkeleton = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-600'>
                    {/* Image Skeleton */}
                    <div className='h-48 bg-gray-200 dark:bg-gray-600'>
                        <Skeleton.Image active className='!w-full !h-full' />
                    </div>

                    {/* Content Skeleton */}
                    <div className='p-4'>
                        <Skeleton.Input active size="default" className='!w-full !mb-2' />
                        <Skeleton.Input active size="small" className='!w-1/2 !mb-4' />

                        {/* Price Skeleton */}
                        <div className='flex items-center space-x-2 mb-4'>
                            <Skeleton.Input active size="small" className='!w-20' />
                            <Skeleton.Input active size="small" className='!w-16' />
                        </div>

                        {/* Stock Skeleton */}
                        <Skeleton.Input active size="small" className='!w-32 !mb-4' />

                        {/* Buttons Skeleton */}
                        <div className='flex space-x-2'>
                            <Skeleton.Button active className='!w-full' />
                            <Skeleton.Button active />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};