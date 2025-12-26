// ============================================
// packages/whatsapp/src/messages/location.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, LocationMessage as LocationMessageType } from '../types';

export class LocationMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async send(
    to: string,
    location: LocationMessageType
  ): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'location',
      location
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }
}