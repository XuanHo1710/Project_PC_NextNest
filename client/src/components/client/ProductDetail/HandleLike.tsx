'use client';

import { productClientService } from "@/services/client";
import { ILoginResponse } from "@/types/account";
import { IComment } from "@/types/modal";
import { IProductCard } from "@/types/model.client";
import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type User = ILoginResponse['user'];

export default function HandleLike({ user, product, comment }: { user: User | null, product: IProductCard, comment: IComment }) {
    const [isLiked, setIsLiked] = useState<boolean>(
        comment.replies.filter(r => !r.isReply && r.isLiked).map(r => r.guestIdInteractedBy._id).includes(user?.id || "#")
    );
    const [isDisliked, setIsDisliked] = useState<boolean>(
        comment.replies.filter(r => !r.isReply && r.isDisLiked).map(r => r.guestIdInteractedBy._id).includes(user?.id || "#")
    );

    const [totalLikes, setTotalLikes] = useState<number>(comment.likes);
    const [totalDislikes, setTotalDislikes] = useState<number>(comment.dislikes);

    const queryClient = useQueryClient();

    // Mutation for posting comments
    const interactMutation = useMutation({
        mutationFn: ({ commentId, guestIdInteractedBy, isLike }: { commentId: string, guestIdInteractedBy: string, isLike: boolean }) =>
            productClientService.interactCommentProduct(commentId, guestIdInteractedBy, isLike),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-comments', product._id] })
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    const handleLikeComment = (commentId: string) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thực hiện hành động này.');
            return;
        }
        if (isLiked) {
            setTotalLikes(totalLikes - 1);
        } else if (isDisliked) {
            setTotalDislikes(totalDislikes - 1);
            setIsDisliked(false);
            setTotalLikes(totalLikes + 1);
        } else {
            setTotalLikes(totalLikes + 1);
        }
        setIsLiked(!isLiked);
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
        if (isDisliked) {
            setTotalDislikes(totalDislikes - 1);
        } else if (isLiked) {
            setTotalLikes(totalLikes - 1);
            setIsLiked(false);
            setTotalDislikes(totalDislikes + 1);
        } else {
            setTotalDislikes(totalDislikes + 1);
        }
        setIsDisliked(!isDisliked);
        const dataInteract = {
            commentId: commentId,
            guestIdInteractedBy: user?.id || "",
            isLike: false
        }
        interactMutation.mutate(dataInteract);
    };

    return (
        <>
            <button
                className={"dark:text-gray-400 cursor-pointer text-sm flex items-center hover:text-blue-600 "
                    + (isLiked ? "text-blue-600" : "text-gray-500")
                }
                onClick={() => handleLikeComment(comment._id)}
            >

                <LikeOutlined className="mr-1" />
                Hữu ích ({totalLikes})
            </button>
            <button
                className={"dark:text-gray-400 cursor-pointer text-sm flex items-center hover:text-red-600 "
                    + (isDisliked ? "text-red-600" : "text-gray-500")
                }
                onClick={() => handleDislikeComment(comment._id)}
            >
                <DislikeOutlined className="mr-1" />
                Không hữu ích ({totalDislikes})
            </button>
        </>
    );
}