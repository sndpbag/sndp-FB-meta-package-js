// ============================================
// packages/whatsapp/src/messages/text.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, TextMessageOptions } from '../types';

export class TextMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async send(
    to: string,
    message: string,
    options?: TextMessageOptions
  ): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: options?.previewUrl || false,
        body: message
      }
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }
}