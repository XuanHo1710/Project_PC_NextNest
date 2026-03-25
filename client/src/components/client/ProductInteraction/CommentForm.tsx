"use client";

import { useState, useRef } from "react";
import { Rate, Button, Input, Space, message, Image as AntImage } from "antd";
import { SendOutlined, PictureOutlined, VideoCameraOutlined, CloseCircleFilled } from "@ant-design/icons";
import { useCreateComment } from "@/hooks/client/useProductInteraction";
import { UploadImages } from "@/utils/uploadImage";
import useAuthUser from "@/hooks/useAuthUser";
import type { ICreateCommentDto } from "@/types";

const { TextArea } = Input;

interface MediaItem {
    id: string;
    url: string;
    type: "image" | "video";
    file?: File;
}

interface CommentFormProps {
    productId: string;
}

export default function CommentForm({ productId }: CommentFormProps) {
    const { user, isAuthenticated } = useAuthUser();
    const createComment = useCreateComment(productId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newItems: MediaItem[] = [];
        Array.from(files).forEach((file) => {
            if (mediaItems.length + newItems.length >= 10) {
                message.warning("Tối đa 10 ảnh/video");
                return;
            }
            const isVideo = file.type.startsWith("video/");
            const isImage = file.type.startsWith("image/");
            if (!isVideo && !isImage) return;

            const url = URL.createObjectURL(file);
            newItems.push({
                id: `${Date.now()}-${Math.random()}`,
                url,
                type: isVideo ? "video" : "image",
                file,
            });
        });

        setMediaItems((prev) => [...prev, ...newItems]);
        e.target.value = "";
    };

    const removeMedia = (id: string) => {
        setMediaItems((prev) => {
            const item = prev.find((m) => m.id === id);
            if (item) URL.revokeObjectURL(item.url);
            return prev.filter((m) => m.id !== id);
        });
    };

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

        // Upload media files to server first, get real URLs
        let imageUrls: string[] = [];
        const filesToUpload = mediaItems.filter((m) => m.file).map((m) => m.file!);
        if (filesToUpload.length > 0) {
            setIsUploading(true);
            try {
                imageUrls = await UploadImages(filesToUpload);
            } catch {
                setIsUploading(false);
                message.error("Upload ảnh/video thất bại. Vui lòng thử lại.");
                return;
            }
            setIsUploading(false);
        }

        const dto: ICreateCommentDto = {
            product: productId,
            content: content.trim(),
            rating,
            images: imageUrls,
        };

        await createComment.mutateAsync(dto);
        setContent("");
        setRating(5);
        mediaItems.forEach((m) => URL.revokeObjectURL(m.url));
        setMediaItems([]);
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-base">
                    Đăng nhập để đánh giá sản phẩm này
                </p>
                <Button type="primary" size="large" href="/auth/login">
                    Đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 dark:text-white">
                ✍️ Viết đánh giá của bạn
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Đánh giá:</span>
                <Rate value={rating} onChange={setRating} className="text-lg" />
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
                className="mb-4"
                style={{ borderRadius: 12 }}
            />

            {/* Media previews */}
            {mediaItems.length > 0 && (
                <div className="flex gap-3 mb-4 flex-wrap">
                    {mediaItems.map((item) => (
                        <div key={item.id} className="relative group">
                            {item.type === "image" ? (
                                <AntImage
                                    src={item.url}
                                    alt="Preview"
                                    width={88}
                                    height={88}
                                    className="rounded-xl object-cover border border-gray-200"
                                    style={{ borderRadius: 12 }}
                                />
                            ) : (
                                <video
                                    src={item.url}
                                    className="w-[88px] h-[88px] rounded-xl object-cover border border-gray-200"
                                    muted
                                />
                            )}
                            <button
                                onClick={() => removeMedia(item.id)}
                                className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                            >
                                <CloseCircleFilled style={{ fontSize: 20 }} />
                            </button>
                            {item.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <VideoCameraOutlined className="text-white text-xl drop-shadow-lg" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || createComment.isPending}
                        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PictureOutlined /> Ảnh/Video
                    </button>
                    <span className="text-xs text-gray-400">
                        {user?.fullname && (
                            <>Đăng với tên <strong className="text-gray-500">{user.fullname}</strong></>
                        )}
                    </span>
                </div>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={createComment.isPending || isUploading}
                    disabled={!content.trim() || rating === 0 || createComment.isPending || isUploading}
                    size="large"
                    style={{ borderRadius: 10 }}
                >
                    {isUploading ? "Đang tải ảnh..." : "Gửi đánh giá"}
                </Button>
            </div>
        </div>
    );
}
