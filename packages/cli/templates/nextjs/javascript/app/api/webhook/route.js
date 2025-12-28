// ============================================
// NEXT.JS JAVASCRIPT - app/api/webhook/route.js
// ============================================
import { createNextWebhook } from '@sndp/meta-whatsapp';

const webhook = createNextWebhook({
  verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN,
  appSecret: process.env.META_APP_SECRET,
  handlers: {
    onMessage: async (message, metadata) => {
      console.log('Received message:', message);
      
      // Auto-reply example
      if (message.type === 'text' && message.text?.body) {
        console.log('Message from:', message.from);
        console.log('Message text:', message.text.body);
      }
    },
    onStatus: async (status) => {
      console.log('Message status:', status);
    },
    onError: async (error) => {
      console.error('Webhook error:', error);
    }
  }
});

export const GET = webhook.GET;
export const POST = webhook.POST;
