// ============================================
// packages/pages/src/comments/manager.ts
// ============================================
import { HttpClient, paginateResults } from '@sndp/meta-core';
import { Comment } from '../types';

export class CommentManager {
  constructor(private http: HttpClient) {}

  /**
   * Get comments on a post
   */
  async getComments(postId: string, limit: number = 50): Promise<Comment[]> {
    const response: any = await this.http.get(`/${postId}/comments`, {
      params: {
        fields: 'id,message,from,created_time,like_count,comment_count,can_comment,can_remove,can_hide,is_hidden',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get all comments with pagination
   */
  async *getAllComments(postId: string): AsyncGenerator<Comment[]> {
    yield* paginateResults(async (cursor) => {
      return this.http.get(`/${postId}/comments`, {
        params: {
          fields: 'id,message,from,created_time,like_count',
          limit: 100,
          ...(cursor && { after: cursor })
        }
      });
    });
  }

  /**
   * Reply to a comment
   */
  async reply(commentId: string, message: string): Promise<{ id: string }> {
    return this.http.post(`/${commentId}/comments`, {
      message
    });
  }

  /**
   * Delete a comment
   */
  async delete(commentId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/${commentId}`);
  }

  /**
   * Hide a comment
   */
  async hide(commentId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${commentId}`, {
      is_hidden: true
    });
  }

  /**
   * Unhide a comment
   */
  async unhide(commentId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${commentId}`, {
      is_hidden: false
    });
  }

  /**
   * Like a comment (as page)
   */
  async like(commentId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${commentId}/likes`);
  }

  /**
   * Unlike a comment
   */
  async unlike(commentId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/${commentId}/likes`);
  }

  /**
   * Get private replies (messages)
   */
  async getPrivateReplies(commentId: string): Promise<any[]> {
    const response: any = await this.http.get(`/${commentId}/private_replies`);
    return response.data;
  }

  /**
   * Send private reply to a comment
   */
  async sendPrivateReply(commentId: string, message: string): Promise<{ id: string }> {
    return this.http.post(`/${commentId}/private_replies`, {
      message
    });
  }

  /**
   * Auto-reply to comments with specific keywords
   */
  async autoReply(
    postId: string,
    keywords: string[],
    replyMessage: string
  ): Promise<{ replied: number; skipped: number }> {
    const comments = await this.getComments(postId);
    let replied = 0;
    let skipped = 0;

    for (const comment of comments) {
      const hasKeyword = keywords.some(keyword =>
        comment.message.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasKeyword && comment.can_comment) {
        try {
          await this.reply(comment.id, replyMessage);
          replied++;
        } catch (error) {
          console.error(`Failed to reply to comment ${comment.id}:`, error);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    return { replied, skipped };
  }

  /**
   * Moderate comments (hide negative ones)
   */
  async moderateComments(
    postId: string,
    negativeKeywords: string[]
  ): Promise<{ hidden: number; total: number }> {
    const comments = await this.getComments(postId);
    let hidden = 0;

    for (const comment of comments) {
      const hasNegativeKeyword = negativeKeywords.some(keyword =>
        comment.message.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasNegativeKeyword && comment.can_hide && !comment.is_hidden) {
        try {
          await this.hide(comment.id);
          hidden++;
        } catch (error) {
          console.error(`Failed to hide comment ${comment.id}:`, error);
        }
      }
    }

    return { hidden, total: comments.length };
  }
}