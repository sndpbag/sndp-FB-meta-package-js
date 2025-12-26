// ============================================
// packages/whatsapp/src/messages/contact.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, ContactMessage as ContactMessageType } from '../types';

export class ContactMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async send(
    to: string,
    contacts: ContactMessageType[]
  ): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'contacts',
      contacts
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }
}