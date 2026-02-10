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
        <div className="flex gap-8 items-start bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border">
            {/* Left: Average score */}
            <div className="text-center min-w-[120px]">
                <div className="text-4xl font-bold text-blue-600">
                    {averageRating || 0}
                </div>
                <Rate
                    disabled
                    value={averageRating}
                    allowHalf
                    className="text-sm mt-1"
                    style={{ fontSize: 16 }}
                />
                <div className="text-sm text-gray-500 mt-1">
                    {totalRatingAll} đánh giá
                </div>
            </div>

            {/* Right: Rating bars */}
            <div className="flex-1">
                {ratingBars.map(({ stars, count }) => {
                    const percent =
                        totalRatingAll > 0 ? (count / totalRatingAll) * 100 : 0;
                    return (
                        <div key={stars} className="flex items-center gap-3 mb-1">
                            <span className="text-sm text-gray-600 w-12 text-right">
                                {stars} sao
                            </span>
                            <Progress
                                percent={percent}
                                showInfo={false}
                                strokeColor="#faad14"
                                trailColor="#f0f0f0"
                                className="flex-1 m-0"
                                size="small"
                            />
                            <span className="text-xs text-gray-400 w-8 text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
