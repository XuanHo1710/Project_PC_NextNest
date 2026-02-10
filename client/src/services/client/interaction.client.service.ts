import axiosClient from "@/config/axiosClient";
import type {
  IProductInteractionResponse,
  IProductComment,
  ICreateCommentDto,
  IUpdateCommentDto,
  IToggleReactionDto,
  IReactionResult,
} from "@/types";

class InteractionClientService {
  private baseURL = "/product-interaction";

  // ============== COMMENTS ==============

  /**
   * Lấy comments + replies + thống kê rating cho 1 sản phẩm
   */
  async getProductComments(
    productId: string,
    page = 1,
    limit = 10,
    guestId?: string,
  ): Promise<IProductInteractionResponse> {
    const params: Record<string, string | number> = { page, limit };
    if (guestId) params.guestId = guestId;
    const response = await axiosClient.get(
      `${this.baseURL}/comments/${productId}`,
      { params },
    );
    return response.data;
  }

  /**
   * Tạo comment/review sản phẩm
   */
  async createComment(dto: ICreateCommentDto): Promise<IProductComment> {
    const response = await axiosClient.post(`${this.baseURL}/comment`, dto);
    return response.data;
  }

  /**
   * Reply comment (tối đa 2 cấp)
   */
  async replyComment(dto: ICreateCommentDto): Promise<IProductComment> {
    const response = await axiosClient.post(`${this.baseURL}/comment`, dto);
    return response.data;
  }

  /**
   * Cập nhật comment (chỉ chủ comment)
   */
  async updateComment(
    commentId: string,
    dto: IUpdateCommentDto,
  ): Promise<IProductComment> {
    const response = await axiosClient.patch(
      `${this.baseURL}/comment/${commentId}`,
      dto,
    );
    return response.data;
  }

  /**
   * Xóa comment (chỉ chủ comment)
   */
  async deleteComment(commentId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(
      `${this.baseURL}/comment/${commentId}`,
    );
    return response.data;
  }

  // ============== REACTIONS ==============

  /**
   * Toggle like/dislike trên 1 comment
   */
  async toggleReaction(dto: IToggleReactionDto): Promise<IReactionResult> {
    const response = await axiosClient.post(`${this.baseURL}/reaction`, dto);
    return response.data;
  }

  /**
   * Lấy reactions của current guest trên nhiều comments
   */
  async getMyReactions(commentIds: string[]): Promise<Record<string, boolean>> {
    const response = await axiosClient.post(`${this.baseURL}/my-reactions`, {
      commentIds,
    });
    return response.data;
  }
}

export const interactionClientService = new InteractionClientService();
