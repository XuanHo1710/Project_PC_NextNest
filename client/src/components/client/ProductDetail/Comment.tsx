'use client';

import React, { useEffect, useState } from 'react';
import { Button, Rate, Progress, Image, message } from 'antd';
import { CommentOutlined, DislikeOutlined, LikeOutlined, SendOutlined, StarFilled } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { CommentsSkeleton } from '@/components/Skeletons/CommentsSkeleton';
import { cleanupImageUrls, handleImageFiles, ImagePreview, PreviewImage } from '@/utils/imagePreview';
import { ICreateProductInteraction, IReplyComment } from '@/types/modal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { productClientService } from '@/services/client';
import { formatDateTime } from '@/utils/formatDateTime';
import { IProductCard } from '@/types/model.client';

export default function CommentProduct({ product }: { product: IProductCard }) {
    const queryClient = useQueryClient();
    const [userRating, setUserRating] = useState(0);
    const { user } = useAuthUser();
    const [page, setPage] = useState(1);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyImages, setReplyImages] = useState<PreviewImage[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

    const {
        data: productComments,
        isLoading: isLoadingComments
    } = useQuery({
        queryKey: ['product-comments', product._id, page],
        queryFn: () => productClientService.getCommentOfProduct(product._id, page),
        enabled: !!product._id,
        staleTime: 30000, // 30 seconds
    });

    console.log(productComments);


    // Mutation for posting comments
    const commentMutation = useMutation({
        mutationFn: (data: ICreateProductInteraction) => productClientService.postCommentOnProduct(data),
        onSuccess: () => {
            message.success('Bình luận của bạn đã được gửi thành công!');
            setUserRating(0);
            setIsLoadingSubmit(false);
            queryClient.invalidateQueries({ queryKey: ['product-comments', product._id] });
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    // Mutation for posting comments
    const interactMutation = useMutation({
        mutationFn: ({ commentId, guestIdInteractedBy, isLike }: { commentId: string, guestIdInteractedBy: string, isLike: boolean }) =>
            productClientService.interactCommentProduct(commentId, guestIdInteractedBy, isLike),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-comments', product._id] });
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    // Mutation for posting comments
    const replyMutation = useMutation({
        mutationFn: ({ guestId, productId, guestReplyId, content, images, isAdminReply }: {
            guestId: string,
            productId: string,
            guestReplyId: string,
            content: string,
            images: string[],
            isAdminReply?: boolean
        }) =>
            productClientService.replyCommentProduct(guestId, productId, guestReplyId, content, images, isAdminReply),
        onSuccess: () => {
            message.success('Bình luận của bạn đã được gửi thành công!');
            setIsSubmittingReply(false);
            cleanupImageUrls(replyImages);
            setShowReplyForm(null);
            setReplyImages([]);
            queryClient.invalidateQueries({ queryKey: ['product-comments', product._id] });
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    // Cleanup image URLs when component unmounts
    useEffect(() => {
        return () => {
            cleanupImageUrls(replyImages);
        };
    }, [replyImages]);

    const handleLikeComment = (commentId: string) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thực hiện hành động này.');
            return;
        }
        const dataInteract = {
            commentId: commentId,
            guestIdInteractedBy: user?.id || "",
            isLike: true
        }
        interactMutation.mutate(dataInteract);
    };

    const handleDislikeComment = (commentId: string) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thực hiện hành động này.');
            return;
        }
        const dataInteract = {
            commentId: commentId,
            guestIdInteractedBy: user?.id || "",
            isLike: false
        }
        interactMutation.mutate(dataInteract);
    };

    // Xử lý trả lời comment
    const handleReplyClick = (commentIndex: string) => {
        if (showReplyForm === commentIndex) {
            // Cleanup images when closing
            cleanupImageUrls(replyImages);
            setShowReplyForm(null);
            setReplyImages([]);
        } else {
            setShowReplyForm(commentIndex);
            setReplyImages([]);
        }
    };

    const handleReplySubmit = async (guestId: string, e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            message.error('Vui lòng đăng nhập để trả lời bình luận.');
            return;
        }
        setIsSubmittingReply(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const replyContent = formData.get('replyText') as string;

        if (!replyContent.trim()) {
            message.error('Vui lòng nhập nội dung trả lời.');
            return;
        }
        const dataReply = {
            guestId: guestId,
            productId: product._id,
            guestReplyId: user.id,
            content: replyContent,
            images: [],
            isAdminReply: false
        }

        replyMutation.mutate(dataReply);
    };

    const handleCancelReply = () => {
        // Cleanup image URLs before closing
        cleanupImageUrls(replyImages);
        setShowReplyForm(null);
        setReplyImages([]);
    };

    // Xử lý khi chọn ảnh cho reply
    const handleReplyImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newImages = handleImageFiles(files);
            setReplyImages(prev => [...prev, ...newImages]);
        }
        // Reset input để có thể chọn lại cùng file
        event.target.value = '';
    };

    // Xóa ảnh khỏi preview
    const handleRemoveReplyImage = (imageId: string) => {
        setReplyImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prev.filter(img => img.id !== imageId);
        });
    };


    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            message.error('Vui lòng đăng nhập để bình luận.');
            return;
        }
        setIsLoadingSubmit(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const commentText = formData.get('commentText') as string;

        const dataComment = {
            productId: product._id,
            guestId: user.id,
            content: commentText,
            rating: userRating,
            images: [] // Ảnh đính kèm trong review
        }

        commentMutation.mutate(dataComment as ICreateProductInteraction);
        form.reset();
    };


    // Function để toggle hiển thị replies  
    const toggleRepliesExpansion = async (commentIndex: string) => {
        const commentIndexKey = `comment-${commentIndex}`;

        if (expandedComments.has(commentIndexKey)) {
            // Collapse replies
            setExpandedComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentIndexKey);
                return newSet;
            });
        } else {
            // Expand replies
            setExpandedComments(prev => new Set(prev.add(commentIndexKey)));
        }
    };


    const handleLoadMoreComments = async () => {
        setIsLoadingSubmit(true);
        setPage(prev => prev + 1);
        setIsLoadingSubmit(false);
    }

    const handleCloseComments = async () => {
        setIsLoadingSubmit(true);
        setPage(1);
        setIsLoadingSubmit(false);
    }


    return (
        <>
            <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Đánh giá từ khách hàng</h3>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-5xl font-bold text-yellow-500">{product.ratingAvg?.toFixed(2)}</div>
                        <Rate disabled defaultValue={product.ratingAvg} className="text-lg mb-2" />
                        <p className="text-gray-500 dark:text-gray-300">Dựa trên {product.totalRatings} đánh giá</p>
                    </div>
                    <div className="md:w-2/3">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <span className="w-20 text-sm">5 sao</span>
                                <Progress percent={85} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">85%</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 text-sm">4 sao</span>
                                <Progress percent={12} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">12%</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 text-sm">3 sao</span>
                                <Progress percent={3} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">3%</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 text-sm">2 sao</span>
                                <Progress percent={0} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">0%</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 text-sm">1 sao</span>
                                <Progress percent={0} showInfo={false} className="flex-grow mx-4" strokeColor="#fadb14" />
                                <span className="w-10 text-right text-sm text-gray-500 dark:text-gray-300">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form đánh giá */}
            <form method='post' action="#" onSubmit={handleCommentSubmit} className="mb-10 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <StarFilled className="mr-2 text-yellow-500" /> Viết đánh giá của bạn
                </h3>
                <div>
                    <div className="mb-4">
                        <p className="mb-2 font-medium">Đánh giá sao:</p>
                        <Rate
                            value={userRating}
                            onChange={setUserRating}
                            className="text-xl"
                        />
                    </div>
                    <TextArea
                        rows={4}
                        placeholder="Nhận xét của bạn về sản phẩm..."
                        className="mb-4"
                        name='commentText'
                    />
                    <div className="flex justify-between">
                        <div className="flex items-center">
                            <input type="file" id="image-upload" className="hidden" />
                            <label htmlFor="image-upload" className="cursor-pointer text-blue-600 dark:text-blue-400 flex items-center">
                                <span className="icon-[material-symbols--add-photo-alternate] mr-2"></span>
                                Thêm ảnh
                            </label>
                        </div>
                        <Button
                            type="primary"
                            htmlType='submit'
                            icon={<SendOutlined />}
                            loading={isLoadingSubmit}
                        >
                            Gửi đánh giá
                        </Button>
                    </div>
                </div>
            </form>

            {/* Danh sách bình luận */}
            <div className="space-y-6">
                {isLoadingComments ? (
                    <CommentsSkeleton />
                ) : (
                    productComments && productComments.comments.length > 0 &&
                    productComments.comments.map((comment, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <div className="flex gap-5 items-start">
                                <Image
                                    src={comment.guestId.avatar}
                                    alt={comment.guestId.name}
                                    className="rounded-full"
                                    width={48}
                                    height={48}
                                    preview={false}
                                    style={{ marginRight: '16px' }}
                                />
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium flex items-center">
                                                {comment.guestId.name}
                                            </h4>
                                            <div className="flex items-center mt-1">
                                                <Rate disabled defaultValue={comment.rating} className="text-xs" />
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(comment.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <button
                                            className={"dark:text-gray-400 cursor-pointer text-sm flex items-center hover:text-blue-600 "
                                                + (comment.replies.filter(r => !r.guestIdInteractedBy.isReply && r.isLiked).map(r => r.guestIdInteractedBy._id).includes(user?.id || "#") ? "text-blue-600" : "text-gray-500")
                                            }
                                            onClick={() => handleLikeComment(comment._id)}
                                        >

                                            <LikeOutlined className="mr-1" />
                                            Hữu ích ({comment.likes})
                                        </button>
                                        <button
                                            className={"dark:text-gray-400 cursor-pointer text-sm flex items-center hover:text-red-600 "
                                                + (comment.replies.filter(r => !r.guestIdInteractedBy.isReply && r.isDisLiked).map(r => r.guestIdInteractedBy._id).includes(user?.id || "#") ? "text-red-600" : "text-gray-500")
                                            }
                                            onClick={() => handleDislikeComment(comment._id)}
                                        >
                                            <DislikeOutlined className="mr-1" />
                                            Không hữu ích ({comment.dislikes})
                                        </button>
                                        <button
                                            className="text-gray-500 cursor-pointer dark:text-gray-400 text-sm flex items-center hover:text-blue-600"
                                            onClick={() => handleReplyClick(index.toString())}
                                        >
                                            <CommentOutlined className="mr-1" />
                                            Trả lời
                                        </button>
                                        {/* Nút xem replies */}
                                        {comment.replies && comment.replies.filter(r => r.guestIdInteractedBy.isReply).length > 0 && (
                                            <button
                                                className="text-gray-500 dark:text-gray-400 text-sm flex items-center hover:text-blue-600"
                                                onClick={() => toggleRepliesExpansion(index.toString())}
                                            >
                                                {expandedComments.has(`comment-${index}`) ? (
                                                    <>
                                                        <span className="icon-[material-symbols--expand-less] mr-1"></span>
                                                        Ẩn {comment.replies.length} phản hồi
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="icon-[material-symbols--expand-more] mr-1"></span>
                                                        Xem {comment.replies.length} phản hồi
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Form trả lời */}
                                    {showReplyForm === index.toString() && (
                                        <div className="mt-3 ml-16 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-start space-x-3">
                                                <Image
                                                    src={user?.avatar || "/default-avatar.png"}
                                                    alt={user?.fullname || "User"}
                                                    className="rounded-full"
                                                    width={32}
                                                    height={32}
                                                    preview={false}
                                                />
                                                <form action="#" onSubmit={(e) => handleReplySubmit(comment.guestId._id, e)} method='post' className="flex-1">
                                                    <TextArea
                                                        rows={3}
                                                        placeholder="Viết trả lời của bạn..."
                                                        name='replyText'
                                                        className="mb-3"
                                                    />

                                                    {/* Preview ảnh */}
                                                    <ImagePreview
                                                        images={replyImages}
                                                        onRemove={handleRemoveReplyImage}
                                                        className="mb-3"
                                                    />

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="file"
                                                                id={`reply-image-${index}`}
                                                                className="hidden"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={handleReplyImageChange}
                                                            />
                                                            <label
                                                                htmlFor={`reply-image-${index}`}
                                                                className="cursor-pointer text-blue-600 dark:text-blue-400 flex items-center text-sm hover:text-blue-700"
                                                            >
                                                                <span className="icon-[material-symbols--add-photo-alternate] mr-1"></span>
                                                                Thêm ảnh
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="small"
                                                                onClick={handleCancelReply}
                                                                className="border-gray-300 hover:border-gray-400"
                                                            >
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                htmlType='submit'
                                                                type="primary"
                                                                size="small"
                                                                loading={isSubmittingReply}
                                                                icon={<SendOutlined />}
                                                            >
                                                                Bình luận
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Phần trả lời */}
                            {comment.replies && comment.replies.filter(r => r.guestIdInteractedBy.isReply).length > 0 && expandedComments.has(`comment-${index}`) && (
                                <div className="ml-16 mt-4">
                                    {comment.replies.map((reply: IReplyComment, replyIndex: number) => (
                                        <div key={replyIndex} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-2">
                                            <div className="flex gap-3 items-start">
                                                <Image
                                                    src={reply.guestIdInteractedBy.avatar}
                                                    alt={reply.guestIdInteractedBy.name}
                                                    className="rounded-full"
                                                    width={32}
                                                    height={32}
                                                    preview={false}
                                                    style={{ marginRight: '12px' }}
                                                />
                                                <div>
                                                    <div className="flex items-center">
                                                        <h5 className="font-medium text-sm">
                                                            {reply.guestIdInteractedBy.name}
                                                        </h5>
                                                        {reply.isAdminReply && (
                                                            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs rounded-full">
                                                                Nhân viên
                                                            </span>
                                                        )}
                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(reply.ratingAt)}</span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Nút xem thêm */}
            <div className="mt-6 text-center">
                {productComments && productComments.pagination.totalPages > page ?
                    <Button loading={isLoadingSubmit} onClick={handleLoadMoreComments} type="default" className="hover:border-blue-500 hover:text-blue-600">
                        Xem thêm đánh giá
                    </Button>
                    :
                    <Button loading={isLoadingSubmit} onClick={handleCloseComments} type="default" className="hover:border-blue-500 hover:text-blue-600">
                        Ẩn đánh giá
                    </Button>
                }
            </div>
        </>
    );
}