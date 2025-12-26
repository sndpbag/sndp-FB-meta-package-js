/ ============================================
// packages/whatsapp/src/webhook/handler.ts
// ============================================
import { WebhookMessage, MessageStatus, WebhookHandlers, WebhookMetadata } from '../types';

export class WebhookHandler {
  constructor(private handlers: WebhookHandlers) {}

  async process(body: any): Promise<void> {
    try {
      if (body.object !== 'whatsapp_business_account') {
        return;
      }

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== 'messages') continue;

          const value = change.value;
          const metadata: WebhookMetadata = {
            displayPhoneNumber: value.metadata.display_phone_number,
            phoneNumberId: value.metadata.phone_number_id
          };

          // Handle incoming messages
          if (value.messages && this.handlers.onMessage) {
            for (const message of value.messages) {
              await this.handlers.onMessage(message as WebhookMessage, metadata);
            }
          }

          // Handle message statuses
          if (value.statuses && this.handlers.onStatus) {
            for (const status of value.statuses) {
              await this.handlers.onStatus(status as MessageStatus, metadata);
            }
          }
        }
      }
    } catch (error) {
      if (this.handlers.onError) {
        await this.handlers.onError(error as Error);
      } else {
        throw error;
      }
    }
  }
}
