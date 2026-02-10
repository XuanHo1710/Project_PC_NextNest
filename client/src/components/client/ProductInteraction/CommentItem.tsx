"use client";

import { useState, useRef } from "react";
import {
    Avatar,
    Button,
    Rate,
    Space,
    Tooltip,
    Input,
    Popconfirm,
    Tag,
    Image as AntImage,
    message,
} from "antd";
import {
    LikeOutlined,
    LikeFilled,
    DislikeOutlined,
    DislikeFilled,
    CommentOutlined,
    EditOutlined,
    DeleteOutlined,
    SendOutlined,
    UserOutlined,
    PictureOutlined,
    CloseCircleFilled,
} from "@ant-design/icons";
import type {
    IProductComment,
    IProductCommentReply,
} from "@/types";
import {
    useReplyComment,
    useUpdateComment,
    useDeleteComment,
    useToggleReaction,
} from "@/hooks/client/useProductInteraction";
import { interactionClientService } from "@/services/client/interaction.client.service";
import { UploadImages } from "@/utils/uploadImage";
import useAuthUser from "@/hooks/useAuthUser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;

// ================== Helper: detect media type ==================
function isVideoUrl(url: string) {
    // Check common video file extensions
    if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url)) return true;
    // Cloudinary video URLs contain /video/upload/
    if (/\/video\/upload\//i.test(url)) return true;
    return false;
}

// ================== Media Gallery (images + videos) ==================
function MediaGallery({ items, size = 80 }: { items: string[]; size?: number }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="flex gap-2 mb-3 flex-wrap">
            {items.map((url, idx) => {
                const isVideo = isVideoUrl(url);
                return isVideo ? (
                    <video
                        key={idx}
                        src={url}
                        controls
                        preload="metadata"
                        className="rounded-xl border border-gray-200 dark:border-gray-600 object-cover cursor-pointer hover:opacity-90 transition-opacity bg-black"
                        style={{ width: size * 2, height: size, maxWidth: 240 }}
                    />
                ) : (
                    <AntImage
                        key={idx}
                        src={url}
                        alt=""
                        width={size}
                        height={size}
                        className="rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                        style={{ borderRadius: 12, objectFit: "cover" }}
                    />
                );
            })}
        </div>
    );
}

// ================== Inline Reply Form ==================
function InlineReplyForm({
    productId,
    parentCommentId,
    replyToName,
    onCancel,
}: {
    productId: string;
    parentCommentId: string;
    replyToName: string;
    onCancel: () => void;
}) {
    const { user } = useAuthUser();
    const replyComment = useReplyComment(productId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [content, setContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState<{ file: File; previewUrl: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (mediaFiles.length >= 5) {
                message.warning("Tối đa 5 ảnh/video cho phản hồi");
                return;
            }
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
            setMediaFiles((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
        });
        e.target.value = "";
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;

        // Upload files first
        let imageUrls: string[] = [];
        if (mediaFiles.length > 0) {
            setIsUploading(true);
            try {
                imageUrls = await UploadImages(mediaFiles.map((m) => m.file));
            } catch {
                setIsUploading(false);
                message.error("Upload ảnh/video thất bại");
                return;
            }
            setIsUploading(false);
        }

        await replyComment.mutateAsync({
            product: productId,
            content: content.trim(),
            parentComment: parentCommentId,
            images: imageUrls,
        });
        setContent("");
        mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
        setMediaFiles([]);
        onCancel();
    };

    return (
        <div className="mt-3 ml-2 flex gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <Avatar
                src={user?.avatar}
                icon={!user?.avatar && <UserOutlined />}
                size={28}
            />
            <div className="flex-1">
                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Trả lời ${replyToName}...`}
                    rows={2}
                    maxLength={2000}
                    className="mb-2"
                    style={{ borderRadius: 10 }}
                />
                {/* Media previews */}
                {mediaFiles.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {mediaFiles.map((item, idx) => (
                            <div key={idx} className="relative group">
                                {item.file.type.startsWith('video/') ? (
                                    <video src={item.previewUrl} className="w-14 h-14 rounded-lg object-cover border" muted preload="metadata" />
                                ) : (
                                    <AntImage src={item.previewUrl} alt="" width={56} height={56} className="rounded-lg object-cover border" style={{ borderRadius: 8 }} />
                                )}
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(item.previewUrl);
                                        setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
                                    }}
                                    className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow"
                                >
                                    <CloseCircleFilled style={{ fontSize: 16 }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || replyComment.isPending}
                            className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            <PictureOutlined /> Ảnh/Video
                        </button>
                    </div>
                    <Space size="small">
                        <Button size="small" onClick={onCancel} disabled={isUploading || replyComment.isPending}>Hủy</Button>
                        <Button
                            type="primary"
                            size="small"
                            icon={<SendOutlined />}
                            onClick={handleSubmit}
                            loading={replyComment.isPending || isUploading}
                            disabled={!content.trim() || replyComment.isPending || isUploading}
                        >
                            {isUploading ? "Đang tải..." : "Gửi"}
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    );
}

// ================== REPLY ITEM ==================
interface CommentItemProps {
    comment: IProductComment;
    productId: string;
}

function ReplyItem({
    reply,
    productId,
    rootCommentId,
}: {
    reply: IProductCommentReply;
    productId: string;
    rootCommentId: string;
}) {
    const { user, isAuthenticated } = useAuthUser();
    const toggleReaction = useToggleReaction(productId);
    const deleteComment = useDeleteComment(productId);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(reply.content);
    const [editImages, setEditImages] = useState<string[]>(reply.images || []);
    const [newEditFiles, setNewEditFiles] = useState<{ file: File; previewUrl: string }[]>([]);
    const editFileRef = useRef<HTMLInputElement>(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const updateComment = useUpdateComment(productId);
    const [isUploading, setIsUploading] = useState(false);

    const isOwner = user?._id === reply.guest?._id;

    const handleLike = () => {
        if (!user) return;
        toggleReaction.toggle({ commentId: reply._id, isLike: true });
    };

    const handleDislike = () => {
        if (!user) return;
        toggleReaction.toggle({ commentId: reply._id, isLike: false });
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;
        // Upload any new files
        let uploadedUrls: string[] = [];
        if (newEditFiles.length > 0) {
            setIsUploading(true);
            try {
                uploadedUrls = await UploadImages(newEditFiles.map((f) => f.file));
            } catch {
                setIsUploading(false);
                message.error("Upload ảnh/video thất bại");
                return;
            }
            setIsUploading(false);
        }
        const allImages = [...editImages, ...uploadedUrls];
        await updateComment.mutateAsync({
            commentId: reply._id,
            dto: { content: editContent.trim(), images: allImages },
        });
        newEditFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setNewEditFiles([]);
        setIsEditing(false);
    };

    return (
        <div className="flex gap-3 py-4 pl-6 md:pl-10 border-l-2 border-blue-100 dark:border-blue-800 ml-4">
            <Avatar
                src={reply.guest?.avatar}
                icon={!reply.guest?.avatar && <UserOutlined />}
                size={32}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {reply.guest?.fullname || "Ẩn danh"}
                    </span>
                    {reply.isAdminReply && (
                        <Tag color="blue" className="text-xs !mr-0">QTV</Tag>
                    )}
                    <span className="text-xs text-gray-400">
                        {dayjs(reply.createdAt).fromNow()}
                    </span>
                </div>

                {isEditing ? (
                    <div className="mb-3">
                        <TextArea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={2000}
                            className="mb-2"
                        />
                        {/* Existing images with delete */}
                        {editImages.length > 0 && (
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {editImages.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="relative group">
                                        {isVideoUrl(url) ? (
                                            <video src={url} className="w-14 h-14 rounded-lg object-cover border" muted preload="metadata" />
                                        ) : (
                                            <AntImage src={url} alt="" width={56} height={56} className="rounded-lg object-cover border" style={{ borderRadius: 8 }} preview={false} />
                                        )}
                                        <button
                                            onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                                            className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow"
                                        >
                                            <CloseCircleFilled style={{ fontSize: 16 }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* New files preview */}
                        {newEditFiles.length > 0 && (
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {newEditFiles.map((item, idx) => (
                                    <div key={`new-${idx}`} className="relative group">
                                        {item.file.type.startsWith('video/') ? (
                                            <video src={item.previewUrl} className="w-14 h-14 rounded-lg object-cover border" muted preload="metadata" />
                                        ) : (
                                            <AntImage src={item.previewUrl} alt="" width={56} height={56} className="rounded-lg object-cover border" style={{ borderRadius: 8 }} preview={false} />
                                        )}
                                        <button
                                            onClick={() => {
                                                URL.revokeObjectURL(item.previewUrl);
                                                setNewEditFiles((prev) => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow"
                                        >
                                            <CloseCircleFilled style={{ fontSize: 16 }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input
                            ref={editFileRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (!files) return;
                                Array.from(files).forEach((file) => {
                                    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
                                    setNewEditFiles((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
                                });
                                e.target.value = "";
                            }}
                        />
                        <Space size="small">
                            <button
                                onClick={() => editFileRef.current?.click()}
                                disabled={isUploading || updateComment.isPending}
                                className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                <PictureOutlined /> Thêm ảnh
                            </button>
                            <Button type="primary" size="small" onClick={handleEdit} loading={updateComment.isPending || isUploading} disabled={isUploading || updateComment.isPending}>Lưu</Button>
                            <Button size="small" onClick={() => { setIsEditing(false); setEditContent(reply.content); setEditImages(reply.images || []); setNewEditFiles([]); }}>Hủy</Button>
                        </Space>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                    </p>
                )}

                {/* Media */}
                <MediaGallery items={reply.images} size={64} />

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm hover:text-blue-500 transition-colors cursor-pointer ${reply.myReaction === true ? "text-blue-500 font-medium" : "text-gray-400"}`}
                    >
                        {reply.myReaction === true ? <LikeFilled /> : <LikeOutlined />}
                        {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                    </button>
                    <button
                        onClick={handleDislike}
                        className={`flex items-center gap-1.5 text-sm hover:text-red-500 transition-colors cursor-pointer ${reply.myReaction === false ? "text-red-500 font-medium" : "text-gray-400"}`}
                    >
                        {reply.myReaction === false ? <DislikeFilled /> : <DislikeOutlined />}
                        {reply.dislikesCount > 0 && <span>{reply.dislikesCount}</span>}
                    </button>

                    {/* Reply on reply — button visible, but sends to root comment (max 2 cấp) */}
                    {isAuthenticated && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                        >
                            <CommentOutlined /> Trả lời
                        </button>
                    )}

                    {isOwner && !isEditing && (
                        <>
                            <button onClick={() => { setIsEditing(true); setEditImages(reply.images || []); setNewEditFiles([]); }} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 cursor-pointer transition-colors">
                                <EditOutlined /> Sửa
                            </button>
                            <Popconfirm title="Xóa phản hồi này?" onConfirm={() => deleteComment.mutate(reply._id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                                <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                                    <DeleteOutlined /> Xóa
                                </button>
                            </Popconfirm>
                        </>
                    )}
                </div>

                {/* Inline reply form — sends to root comment for max 2 levels */}
                {showReplyForm && (
                    <InlineReplyForm
                        productId={productId}
                        parentCommentId={rootCommentId}
                        replyToName={reply.guest?.fullname || ""}
                        onCancel={() => setShowReplyForm(false)}
                    />
                )}
            </div>
        </div>
    );
}

// ================== COMMENT ITEM (root) ==================
export default function CommentItem({ comment, productId }: CommentItemProps) {
    const { user, isAuthenticated } = useAuthUser();
    const toggleReaction = useToggleReaction(productId);
    const updateComment = useUpdateComment(productId);
    const deleteComment = useDeleteComment(productId);

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editImages, setEditImages] = useState<string[]>(comment.images || []);
    const [newEditFiles, setNewEditFiles] = useState<{ file: File; previewUrl: string }[]>([]);
    const editFileRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const isOwner = user?._id === comment.guest?._id;

    const handleLike = () => {
        if (!isAuthenticated) return;
        toggleReaction.toggle({ commentId: comment._id, isLike: true });
    };

    const handleDislike = () => {
        if (!isAuthenticated) return;
        toggleReaction.toggle({ commentId: comment._id, isLike: false });
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;
        // Upload any new files
        let uploadedUrls: string[] = [];
        if (newEditFiles.length > 0) {
            setIsUploading(true);
            try {
                uploadedUrls = await UploadImages(newEditFiles.map((f) => f.file));
            } catch {
                setIsUploading(false);
                message.error("Upload ảnh/video thất bại");
                return;
            }
            setIsUploading(false);
        }
        const allImages = [...editImages, ...uploadedUrls];
        await updateComment.mutateAsync({
            commentId: comment._id,
            dto: { content: editContent.trim(), images: allImages },
        });
        newEditFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setNewEditFiles([]);
        setIsEditing(false);
    };

    return (
        <div className="py-6 px-6 md:px-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex gap-4">
                <Avatar
                    src={comment.guest?.avatar}
                    icon={!comment.guest?.avatar && <UserOutlined />}
                    size={44}
                    className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                            {comment.guest?.fullname || "Ẩn danh"}
                        </span>
                        <span className="text-xs text-gray-400">
                            {dayjs(comment.createdAt).fromNow()}
                        </span>
                    </div>

                    {/* Rating */}
                    {comment.rating > 0 && (
                        <Rate
                            disabled
                            value={comment.rating}
                            className="text-sm mb-3"
                            style={{ fontSize: 14 }}
                        />
                    )}

                    {/* Content */}
                    {isEditing ? (
                        <div className="mb-3">
                            <TextArea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                maxLength={2000}
                                className="mb-2"
                            />
                            {/* Existing images with delete */}
                            {editImages.length > 0 && (
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {editImages.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="relative group">
                                            {isVideoUrl(url) ? (
                                                <video src={url} className="w-16 h-16 rounded-lg object-cover border" muted preload="metadata" />
                                            ) : (
                                                <AntImage src={url} alt="" width={64} height={64} className="rounded-lg object-cover border" style={{ borderRadius: 8 }} preview={false} />
                                            )}
                                            <button
                                                onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow"
                                            >
                                                <CloseCircleFilled style={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* New files preview */}
                            {newEditFiles.length > 0 && (
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {newEditFiles.map((item, idx) => (
                                        <div key={`new-${idx}`} className="relative group">
                                            {item.file.type.startsWith('video/') ? (
                                                <video src={item.previewUrl} className="w-16 h-16 rounded-lg object-cover border" muted preload="metadata" />
                                            ) : (
                                                <AntImage src={item.previewUrl} alt="" width={64} height={64} className="rounded-lg object-cover border" style={{ borderRadius: 8 }} preview={false} />
                                            )}
                                            <button
                                                onClick={() => {
                                                    URL.revokeObjectURL(item.previewUrl);
                                                    setNewEditFiles((prev) => prev.filter((_, i) => i !== idx));
                                                }}
                                                className="absolute -top-1.5 -right-1.5 text-red-500 bg-white rounded-full shadow"
                                            >
                                                <CloseCircleFilled style={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                ref={editFileRef}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (!files) return;
                                    Array.from(files).forEach((file) => {
                                        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
                                        setNewEditFiles((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
                                    });
                                    e.target.value = "";
                                }}
                            />
                            <Space size="small">
                                <button
                                    onClick={() => editFileRef.current?.click()}
                                    disabled={isUploading || updateComment.isPending}
                                    className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <PictureOutlined /> Thêm ảnh/video
                                </button>
                                <Button type="primary" size="small" onClick={handleEdit} loading={updateComment.isPending || isUploading} disabled={isUploading || updateComment.isPending}>Lưu</Button>
                                <Button size="small" onClick={() => { setIsEditing(false); setEditContent(comment.content); setEditImages(comment.images || []); setNewEditFiles([]); }} disabled={isUploading || updateComment.isPending}>Hủy</Button>
                            </Space>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                        </p>
                    )}

                    {/* Media (images + videos) */}
                    <MediaGallery items={comment.images} size={88} />

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1">
                        <Tooltip title={isAuthenticated ? "Thích" : "Đăng nhập để thích"}>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-sm hover:text-blue-500 transition-colors cursor-pointer ${comment.myReaction === true ? "text-blue-500 font-medium" : "text-gray-400"}`}
                            >
                                {comment.myReaction === true ? <LikeFilled /> : <LikeOutlined />}
                                <span>{comment.likesCount || 0}</span>
                            </button>
                        </Tooltip>

                        <Tooltip title={isAuthenticated ? "Không thích" : "Đăng nhập để react"}>
                            <button
                                onClick={handleDislike}
                                className={`flex items-center gap-1.5 text-sm hover:text-red-500 transition-colors cursor-pointer ${comment.myReaction === false ? "text-red-500 font-medium" : "text-gray-400"}`}
                            >
                                {comment.myReaction === false ? <DislikeFilled /> : <DislikeOutlined />}
                                <span>{comment.dislikesCount || 0}</span>
                            </button>
                        </Tooltip>

                        {isAuthenticated && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                            >
                                <CommentOutlined /> Trả lời
                            </button>
                        )}

                        {comment.repliesCount > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer font-medium"
                            >
                                {showReplies
                                    ? "Ẩn phản hồi"
                                    : `Xem ${comment.repliesCount} phản hồi`}
                            </button>
                        )}

                        {isOwner && !isEditing && (
                            <>
                                <button onClick={() => { setIsEditing(true); setEditImages(comment.images || []); setNewEditFiles([]); }} className="text-sm text-gray-400 hover:text-blue-500 cursor-pointer">
                                    <EditOutlined /> Sửa
                                </button>
                                <Popconfirm
                                    title="Xóa đánh giá này?"
                                    description="Tất cả phản hồi cũng sẽ bị xóa"
                                    onConfirm={() => deleteComment.mutate(comment._id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <button className="text-sm text-gray-400 hover:text-red-500 cursor-pointer">
                                        <DeleteOutlined /> Xóa
                                    </button>
                                </Popconfirm>
                            </>
                        )}
                    </div>

                    {/* Reply form for root comment */}
                    {showReplyForm && (
                        <InlineReplyForm
                            productId={productId}
                            parentCommentId={comment._id}
                            replyToName={comment.guest?.fullname || ""}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    )}

                    {/* Replies list */}
                    {showReplies && comment.replies?.length > 0 && (
                        <div className="mt-3">
                            {comment.replies.map((reply) => (
                                <ReplyItem
                                    key={reply._id}
                                    reply={reply}
                                    productId={productId}
                                    rootCommentId={comment._id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
