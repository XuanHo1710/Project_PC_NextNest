"use client";

import { useState } from "react";
import { Rate, Button, Input, Upload, Space, message } from "antd";
import { SendOutlined, PictureOutlined } from "@ant-design/icons";
import { useCreateComment } from "@/hooks/client/useProductInteraction";
import useAuthUser from "@/hooks/useAuthUser";
import type { ICreateCommentDto } from "@/types";
import Image from "next/image";

const { TextArea } = Input;

interface CommentFormProps {
    productId: string;
}

export default function CommentForm({ productId }: CommentFormProps) {
    const { user, isAuthenticated } = useAuthUser();
    const createComment = useCreateComment(productId);

    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [images, setImages] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!isAuthenticated || !user) {
            message.warning("Vui lòng đăng nhập để đánh giá sản phẩm");
            return;
        }

        if (!content.trim()) {
            message.warning("Vui lòng nhập nội dung bình luận");
            return;
        }

        if (rating === 0) {
            message.warning("Vui lòng chọn số sao đánh giá");
            return;
        }

        const dto: ICreateCommentDto = {
            product: productId,
            content: content.trim(),
            rating,
            images,
        };

        await createComment.mutateAsync(dto);
        setContent("");
        setRating(5);
        setImages([]);
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500 mb-3">
                    Đăng nhập để đánh giá sản phẩm này
                </p>
                <Button type="primary" href="/auth/login">
                    Đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border p-6">
            <h3 className="text-base font-semibold mb-4">Viết đánh giá của bạn</h3>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600">Đánh giá:</span>
                <Rate value={rating} onChange={setRating} />
                <span className="text-sm text-gray-400">
                    {rating > 0 ? `${rating} sao` : "Chưa đánh giá"}
                </span>
            </div>

            {/* Content */}
            <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={4}
                maxLength={2000}
                showCount
                className="mb-3"
            />

            {/* Image previews */}
            {images.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                            <Image
                                src={img}
                                alt={`Preview ${idx}`}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover border"
                            />
                            <button
                                onClick={() =>
                                    setImages((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                    {user?.fullname && (
                        <span>
                            Đăng với tên <strong>{user.fullname}</strong>
                        </span>
                    )}
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={createComment.isPending}
                        disabled={!content.trim() || rating === 0}
                    >
                        Gửi đánh giá
                    </Button>
                </Space>
            </div>
        </div>
    );
}
