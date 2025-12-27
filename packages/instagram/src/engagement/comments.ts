// ============================================
// packages/instagram/src/engagement/comments.ts
// ============================================
import { HttpClient, paginateResults } from '@sndp/meta-core';
import { Comment } from '../types';

export class CommentManager {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Get comments on a media
   */
  async getComments(mediaId: string, limit: number = 50): Promise<Comment[]> {
    const response: any = await this.http.get(`/${mediaId}/comments`, {
      params: {
        fields: 'id,text,username,timestamp,like_count,from{id,username},replies{id,text,username,timestamp}',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get all comments with pagination
   */
  async *getAllComments(mediaId: string): AsyncGenerator<Comment[]> {
    yield* paginateResults(async (cursor) => {
      return this.http.get(`/${mediaId}/comments`, {
        params: {
          fields: 'id,text,username,timestamp,like_count,from{id,username}',
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
    return this.http.post(`/${commentId}/replies`, {
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
      hide: true
    });
  }

  /**
   * Unhide a comment
   */
  async unhide(commentId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${commentId}`, {
      hide: false
    });
  }

  /**
   * Get replied comments (for auto-reply tracking)
   */
  async getRepliedComments(mediaId: string): Promise<Comment[]> {
    const response: any = await this.http.get(`/${mediaId}/comments`, {
      params: {
        fields: 'id,text,replies{id,text}',
        filter: 'stream'
      }
    });

    return response.data.filter((comment: Comment) => 
      comment.replies && comment.replies.data && comment.replies.data.length > 0
    );
  }

  /**
   * Auto-reply to comments containing specific keywords
   */
  async autoReply(
    mediaId: string,
    keywords: string[],
    replyMessage: string
  ): Promise<{ replied: number; skipped: number }> {
    const comments = await this.getComments(mediaId);
    let replied = 0;
    let skipped = 0;

    for (const comment of comments) {
      const hasKeyword = keywords.some(keyword =>
        comment.text.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        // Check if already replied
        const hasReplies = comment.replies?.data && comment.replies.data.length > 0;
        
        if (!hasReplies) {
          try {
            await this.reply(comment.id, replyMessage);
            replied++;
          } catch (error) {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }

    return { replied, skipped };
  }
}