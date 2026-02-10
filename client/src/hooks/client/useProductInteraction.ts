"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { interactionClientService } from "@/services/client/interaction.client.service";
import type {
  ICreateCommentDto,
  IUpdateCommentDto,
  IToggleReactionDto,
} from "@/types";
import { toast } from "react-toastify";

// ============== QUERY KEYS ==============
export const interactionKeys = {
  comments: (productId: string) => ["product-comments", productId] as const,
  commentsPage: (productId: string, page: number) =>
    ["product-comments", productId, page] as const,
  myReactions: (commentIds: string[]) =>
    ["my-reactions", ...commentIds] as const,
};

// ============== COMMENT HOOKS ==============

/**
 * Hook lấy danh sách comments + thống kê rating cho 1 sản phẩm
 */
export const useProductComments = (
  productId: string,
  page = 1,
  limit = 10,
  guestId?: string,
) => {
  return useQuery({
    queryKey: interactionKeys.commentsPage(productId, page),
    queryFn: () =>
      interactionClientService.getProductComments(
        productId,
        page,
        limit,
        guestId,
      ),
    enabled: !!productId,
    staleTime: 30 * 1000, // 30 giây
  });
};

/**
 * Hook tạo comment/review mới
 */
export const useCreateComment = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateCommentDto) =>
      interactionClientService.createComment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
      toast.success("Đăng bình luận thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Đăng bình luận thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook reply comment
 */
export const useReplyComment = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateCommentDto) =>
      interactionClientService.replyComment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Trả lời bình luận thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook cập nhật comment
 */
export const useUpdateComment = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      dto,
    }: {
      commentId: string;
      dto: IUpdateCommentDto;
    }) => interactionClientService.updateComment(commentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
      toast.success("Cập nhật bình luận thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook xóa comment
 */
export const useDeleteComment = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      interactionClientService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
      toast.success("Xóa bình luận thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa bình luận thất bại: ${error.message}`);
    },
  });
};

// ============== REACTION HOOKS ==============

/**
 * Hook toggle like/dislike
 */
export const useToggleReaction = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IToggleReactionDto) =>
      interactionClientService.toggleReaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Thao tác thất bại: ${error.message}`);
    },
  });
};
