import { Skeleton } from 'antd';

export const CommentsSkeleton = () => {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((item) => (
                <div key={item} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex gap-5 items-start">
                        <Skeleton.Avatar size={48} />
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="space-y-1">
                                    <Skeleton.Input style={{ width: 120, height: 20 }} />
                                    <div className="flex items-center space-x-2">
                                        <Skeleton.Input style={{ width: 80, height: 16 }} />
                                        <Skeleton.Input style={{ width: 100, height: 16 }} />
                                    </div>
                                </div>
                            </div>
                            <Skeleton paragraph={{ rows: 2, width: ['100%', '80%'] }} />
                            <div className="mt-3 flex items-center space-x-4">
                                <Skeleton.Input style={{ width: 80, height: 20 }} />
                                <Skeleton.Input style={{ width: 100, height: 20 }} />
                                <Skeleton.Input style={{ width: 60, height: 20 }} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const RepliesSkeleton = () => {
    return (
        <div className="ml-16 mt-4 space-y-2">
            {[1, 2].map((item) => (
                <div key={item} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <Skeleton.Avatar size={32} />
                        <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-1">
                                <Skeleton.Input style={{ width: 80, height: 16 }} />
                                <Skeleton.Input style={{ width: 60, height: 14 }} />
                            </div>
                            <Skeleton paragraph={{ rows: 1, width: '90%' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};