"use client";

import { useState } from "react";
import { Pagination, Empty, Spin } from "antd";
import { useProductComments } from "@/hooks/client/useProductInteraction";
import useAuthUser from "@/hooks/useAuthUser";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import RatingOverview from "./RatingOverview";

interface ProductInteractionSectionProps {
    productId: string;
}

export default function ProductInteractionSection({
    productId,
}: ProductInteractionSectionProps) {
    const { user } = useAuthUser();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useProductComments(
        productId,
        page,
        limit,
        user?._id,
    );

    const statistics = data?.statistics || {
        totalRatingAll: 0,
        totalRating1: 0,
        totalRating2: 0,
        totalRating3: 0,
        totalRating4: 0,
        totalRating5: 0,
        averageRating: 0,
    };

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Đánh giá & Bình luận</h2>

            {/* Rating Overview */}
            <RatingOverview statistics={statistics} />

            {/* Comment Form */}
            <div className="mt-8">
                <CommentForm productId={productId} />
            </div>

            {/* Comments List */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold m-0 text-gray-800 dark:text-white">
                        Tất cả bình luận ({data?.pagination?.totalItems || 0})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" />
                    </div>
                ) : data?.comments?.length === 0 ? (
                    <Empty
                        description="Chưa có đánh giá nào. Hãy là người đầu tiên!"
                        className="py-12"
                    />
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            {data?.comments?.map((comment) => (
                                <CommentItem
                                    key={comment._id}
                                    comment={comment}
                                    productId={productId}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(data?.pagination?.totalPages ?? 0) > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={page}
                                    total={data?.pagination?.totalItems || 0}
                                    pageSize={limit}
                                    onChange={(p) => setPage(p)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
