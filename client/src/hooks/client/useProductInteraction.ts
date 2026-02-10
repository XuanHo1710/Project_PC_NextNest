"use client";

import { useRef, useCallback } from "react";
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
  IProductInteractionResponse,
  IProductComment,
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
 * Hook toggle like/dislike with optimistic update + debounce.
 * Instantly updates the UI cache, then debounces the actual API call
 * so rapid clicks don't fire multiple requests.
 */
export const useToggleReaction = (productId: string) => {
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  // Track the latest intended state per comment so we send the correct one
  const pendingStates = useRef<Map<string, IToggleReactionDto>>(new Map());

  const mutation = useMutation({
    mutationFn: (dto: IToggleReactionDto) =>
      interactionClientService.toggleReaction(dto),
    // No onSuccess invalidation — we already updated cache optimistically.
    // Only invalidate on error to re-sync.
    onError: (_error: Error, _dto: IToggleReactionDto) => {
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });
    },
  });

  /**
   * Call this from the component. It will:
   * 1. Immediately update the query cache (optimistic)
   * 2. Debounce the real API call by 600ms
   */
  const toggle = useCallback(
    (dto: IToggleReactionDto) => {
      const { commentId, isLike } = dto;

      // ---- Optimistic cache update ----
      // Update ALL pages that might contain this comment
      queryClient.setQueriesData<IProductInteractionResponse>(
        { queryKey: ["product-comments", productId] },
        (old) => {
          if (!old) return old;
          const updateComment = (c: IProductComment) => {
            if (c._id !== commentId) {
              // Check replies
              if (c.replies) {
                c.replies = c.replies.map((r: any) => {
                  if (r._id !== commentId) return r;
                  return applyReactionOptimistic(r, isLike);
                });
              }
              return c;
            }
            return applyReactionOptimistic(c, isLike);
          };
          return {
            ...old,
            comments: old.comments.map(updateComment),
          };
        },
      );

      // ---- Debounce the API call ----
      pendingStates.current.set(commentId, dto);

      const existing = debounceTimers.current.get(commentId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        debounceTimers.current.delete(commentId);
        const latestDto = pendingStates.current.get(commentId);
        pendingStates.current.delete(commentId);
        if (latestDto) {
          mutation.mutate(latestDto);
        }
      }, 600);

      debounceTimers.current.set(commentId, timer);
    },
    [queryClient, productId, mutation],
  );

  return { toggle, isPending: mutation.isPending };
};

/** Helper: apply like/dislike optimistically on a comment object */
function applyReactionOptimistic<
  T extends {
    myReaction: boolean | null;
    likesCount: number;
    dislikesCount: number;
  },
>(comment: T, isLike: boolean): T {
  const prev = comment.myReaction;
  let { likesCount, dislikesCount } = comment;
  let next: boolean | null;

  if (prev === isLike) {
    // Toggle off (remove reaction)
    next = null;
    if (isLike) likesCount = Math.max(0, likesCount - 1);
    else dislikesCount = Math.max(0, dislikesCount - 1);
  } else {
    // New reaction or switch
    if (prev === true) likesCount = Math.max(0, likesCount - 1);
    if (prev === false) dislikesCount = Math.max(0, dislikesCount - 1);
    next = isLike;
    if (isLike) likesCount += 1;
    else dislikesCount += 1;
  }

  return { ...comment, myReaction: next, likesCount, dislikesCount };
}
