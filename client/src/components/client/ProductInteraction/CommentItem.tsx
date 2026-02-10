"use client";

import { useState } from "react";
import {
    Avatar,
    Button,
    Rate,
    Space,
    Tooltip,
    Input,
    Popconfirm,
    Tag,
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
import useAuthUser from "@/hooks/useAuthUser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;

interface CommentItemProps {
    comment: IProductComment;
    productId: string;
}

function ReplyItem({
    reply,
    productId,
}: {
    reply: IProductCommentReply;
    productId: string;
}) {
    const { user } = useAuthUser();
    const toggleReaction = useToggleReaction(productId);
    const deleteComment = useDeleteComment(productId);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(reply.content);
    const updateComment = useUpdateComment(productId);

    const isOwner = user?._id === reply.guest?._id;

    const handleLike = () => {
        if (!user) return;
        toggleReaction.mutate({ commentId: reply._id, isLike: true });
    };

    const handleDislike = () => {
        if (!user) return;
        toggleReaction.mutate({ commentId: reply._id, isLike: false });
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;
        await updateComment.mutateAsync({
            commentId: reply._id,
            dto: { content: editContent.trim() },
        });
        setIsEditing(false);
    };

    return (
        <div className="flex gap-3 py-3 pl-12 border-l-2 border-gray-100 ml-3">
            <Avatar
                src={reply.guest?.avatar}
                icon={!reply.guest?.avatar && <UserOutlined />}
                size={32}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                        {reply.guest?.fullname || "Ẩn danh"}
                    </span>
                    {reply.isAdminReply && (
                        <Tag color="blue" className="text-xs">
                            QTV
                        </Tag>
                    )}
                    <span className="text-xs text-gray-400">
                        {dayjs(reply.createdAt).fromNow()}
                    </span>
                </div>

                {isEditing ? (
                    <div className="mb-2">
                        <TextArea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={2000}
                            className="mb-2"
                        />
                        <Space size="small">
                            <Button
                                type="primary"
                                size="small"
                                onClick={handleEdit}
                                loading={updateComment.isPending}
                            >
                                Lưu
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(reply.content);
                                }}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                        {reply.content}
                    </p>
                )}

                {/* Images */}
                {reply.images?.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {reply.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                            />
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 text-xs hover:text-blue-500 transition-colors ${reply.myReaction === true
                                ? "text-blue-500 font-medium"
                                : "text-gray-400"
                            }`}
                    >
                        {reply.myReaction === true ? (
                            <LikeFilled className="text-sm" />
                        ) : (
                            <LikeOutlined className="text-sm" />
                        )}
                        {reply.likesCount > 0 && reply.likesCount}
                    </button>
                    <button
                        onClick={handleDislike}
                        className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${reply.myReaction === false
                                ? "text-red-500 font-medium"
                                : "text-gray-400"
                            }`}
                    >
                        {reply.myReaction === false ? (
                            <DislikeFilled className="text-sm" />
                        ) : (
                            <DislikeOutlined className="text-sm" />
                        )}
                        {reply.dislikesCount > 0 && reply.dislikesCount}
                    </button>

                    {isOwner && !isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-gray-400 hover:text-blue-500"
                            >
                                <EditOutlined /> Sửa
                            </button>
                            <Popconfirm
                                title="Xóa phản hồi này?"
                                onConfirm={() => deleteComment.mutate(reply._id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <button className="text-xs text-gray-400 hover:text-red-500">
                                    <DeleteOutlined /> Xóa
                                </button>
                            </Popconfirm>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CommentItem({ comment, productId }: CommentItemProps) {
    const { user, isAuthenticated } = useAuthUser();
    const toggleReaction = useToggleReaction(productId);
    const replyComment = useReplyComment(productId);
    const updateComment = useUpdateComment(productId);
    const deleteComment = useDeleteComment(productId);

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [showReplies, setShowReplies] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    const isOwner = user?._id === comment.guest?._id;

    const handleLike = () => {
        if (!isAuthenticated) return;
        toggleReaction.mutate({ commentId: comment._id, isLike: true });
    };

    const handleDislike = () => {
        if (!isAuthenticated) return;
        toggleReaction.mutate({ commentId: comment._id, isLike: false });
    };

    const handleReply = async () => {
        if (!replyContent.trim() || !isAuthenticated) return;
        await replyComment.mutateAsync({
            product: productId,
            content: replyContent.trim(),
            parentComment: comment._id,
        });
        setReplyContent("");
        setShowReplyForm(false);
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;
        await updateComment.mutateAsync({
            commentId: comment._id,
            dto: { content: editContent.trim() },
        });
        setIsEditing(false);
    };

    return (
        <div className="border-b border-gray-100 last:border-b-0 py-4">
            <div className="flex gap-3">
                <Avatar
                    src={comment.guest?.avatar}
                    icon={!comment.guest?.avatar && <UserOutlined />}
                    size={40}
                />
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
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
                            className="text-sm mb-2"
                            style={{ fontSize: 14 }}
                        />
                    )}

                    {/* Content */}
                    {isEditing ? (
                        <div className="mb-2">
                            <TextArea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                maxLength={2000}
                                className="mb-2"
                            />
                            <Space size="small">
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={handleEdit}
                                    loading={updateComment.isPending}
                                >
                                    Lưu
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    )}

                    {/* Images */}
                    {comment.images?.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {comment.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt=""
                                    className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                />
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Tooltip title={isAuthenticated ? "Thích" : "Đăng nhập để thích"}>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-sm hover:text-blue-500 transition-colors ${comment.myReaction === true
                                        ? "text-blue-500 font-medium"
                                        : "text-gray-400"
                                    }`}
                            >
                                {comment.myReaction === true ? (
                                    <LikeFilled />
                                ) : (
                                    <LikeOutlined />
                                )}
                                <span>{comment.likesCount || 0}</span>
                            </button>
                        </Tooltip>

                        <Tooltip
                            title={isAuthenticated ? "Không thích" : "Đăng nhập để react"}
                        >
                            <button
                                onClick={handleDislike}
                                className={`flex items-center gap-1.5 text-sm hover:text-red-500 transition-colors ${comment.myReaction === false
                                        ? "text-red-500 font-medium"
                                        : "text-gray-400"
                                    }`}
                            >
                                {comment.myReaction === false ? (
                                    <DislikeFilled />
                                ) : (
                                    <DislikeOutlined />
                                )}
                                <span>{comment.dislikesCount || 0}</span>
                            </button>
                        </Tooltip>

                        {isAuthenticated && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <CommentOutlined />
                                Trả lời
                            </button>
                        )}

                        {comment.repliesCount > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-sm text-blue-500 hover:text-blue-600"
                            >
                                {showReplies
                                    ? "Ẩn phản hồi"
                                    : `Xem ${comment.repliesCount} phản hồi`}
                            </button>
                        )}

                        {isOwner && !isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-gray-400 hover:text-blue-500"
                                >
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
                                    <button className="text-sm text-gray-400 hover:text-red-500">
                                        <DeleteOutlined /> Xóa
                                    </button>
                                </Popconfirm>
                            </>
                        )}
                    </div>

                    {/* Reply form */}
                    {showReplyForm && (
                        <div className="mt-3 flex gap-2">
                            <Avatar
                                src={user?.avatar}
                                icon={!user?.avatar && <UserOutlined />}
                                size={28}
                            />
                            <div className="flex-1">
                                <TextArea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Trả lời ${comment.guest?.fullname || ""}...`}
                                    rows={2}
                                    maxLength={2000}
                                    className="mb-2"
                                />
                                <Space size="small">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SendOutlined />}
                                        onClick={handleReply}
                                        loading={replyComment.isPending}
                                        disabled={!replyContent.trim()}
                                    >
                                        Gửi
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setShowReplyForm(false);
                                            setReplyContent("");
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {showReplies && comment.replies?.length > 0 && (
                        <div className="mt-2">
                            {comment.replies.map((reply) => (
                                <ReplyItem
                                    key={reply._id}
                                    reply={reply}
                                    productId={productId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
