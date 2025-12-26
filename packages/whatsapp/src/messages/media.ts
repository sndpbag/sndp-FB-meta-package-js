// ============================================
// packages/whatsapp/src/messages/media.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, MediaMessageOptions } from '../types';

export class MediaMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async sendImage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMedia(to, 'image', imageUrl, { caption });
  }

  async sendVideo(
    to: string,
    videoUrl: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMedia(to, 'video', videoUrl, { caption });
  }

  async sendAudio(
    to: string,
    audioUrl: string
  ): Promise<SendMessageResponse> {
    return this.sendMedia(to, 'audio', audioUrl);
  }

  async sendDocument(
    to: string,
    documentUrl: string,
    options?: MediaMessageOptions
  ): Promise<SendMessageResponse> {
    return this.sendMedia(to, 'document', documentUrl, options);
  }

  private async sendMedia(
    to: string,
    type: 'image' | 'video' | 'audio' | 'document',
    url: string,
    options?: MediaMessageOptions
  ): Promise<SendMessageResponse> {
    const mediaObject: any = { link: url };

    if (options?.caption && (type === 'image' || type === 'video' || type === 'document')) {
      mediaObject.caption = options.caption;
    }

    if (options?.filename && type === 'document') {
      mediaObject.filename = options.filename;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      [type]: mediaObject
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }
}