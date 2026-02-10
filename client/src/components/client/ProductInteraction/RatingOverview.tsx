"use client";

import { Progress, Rate } from "antd";
import type { IRatingStatistics } from "@/types";

interface RatingOverviewProps {
    statistics: IRatingStatistics;
}

export default function RatingOverview({ statistics }: RatingOverviewProps) {
    const {
        totalRatingAll,
        totalRating1,
        totalRating2,
        totalRating3,
        totalRating4,
        totalRating5,
        averageRating,
    } = statistics;

    const ratingBars = [
        { stars: 5, count: totalRating5 },
        { stars: 4, count: totalRating4 },
        { stars: 3, count: totalRating3 },
        { stars: 2, count: totalRating2 },
        { stars: 1, count: totalRating1 },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            {/* Left: Average score */}
            <div className="text-center min-w-[140px] flex flex-col items-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {averageRating || 0}
                </div>
                <Rate
                    disabled
                    value={averageRating}
                    allowHalf
                    className="text-sm mb-2"
                    style={{ fontSize: 18 }}
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {totalRatingAll} đánh giá
                </div>
            </div>

            {/* Right: Rating bars */}
            <div className="flex-1 w-full">
                {ratingBars.map(({ stars, count }) => {
                    const percent =
                        totalRatingAll > 0 ? (count / totalRatingAll) * 100 : 0;
                    return (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 w-14 text-right whitespace-nowrap">
                                {stars} sao
                            </span>
                            <Progress
                                percent={percent}
                                showInfo={false}
                                strokeColor="#faad14"
                                className="flex-1 m-0"
                                size="small"
                            />
                            <span className="text-xs text-gray-400 w-10 text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
