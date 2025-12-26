// ============================================
// packages/whatsapp/src/webhook/middleware.ts
// ============================================
import { verifyWebhookSignature } from './signature';
import { WebhookHandler } from './handler';
import { WebhookHandlers } from '../types';

export interface WebhookConfig {
  verifyToken: string;
  appSecret: string;
  handlers: WebhookHandlers;
}

/**
 * Express middleware for WhatsApp webhooks
 */
export function createExpressWebhook(config: WebhookConfig) {
  const handler = new WebhookHandler(config.handlers);

  return {
    verify: (req: any, res: any) => {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === config.verifyToken) {
        console.log('✅ Webhook verified');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Webhook verification failed');
        res.sendStatus(403);
      }
    },

    handle: async (req: any, res: any) => {
      const signature = req.headers['x-hub-signature-256'];
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!signature) {
        return res.status(401).json({ error: 'Missing signature' });
      }

      const isValid = verifyWebhookSignature(body, signature, config.appSecret);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      try {
        await handler.process(JSON.parse(body));
        res.sendStatus(200);
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.sendStatus(500);
      }
    }
  };
}

/**
 * Next.js API route handler for WhatsApp webhooks
 */
export function createNextWebhook(config: WebhookConfig) {
  const handler = new WebhookHandler(config.handlers);

  return {
    GET: async (req: Request) => {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === config.verifyToken) {
        console.log('✅ Webhook verified');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('❌ Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    },

    POST: async (req: Request) => {
      const signature = req.headers.get('x-hub-signature-256');
      const body = await req.text();

      if (!signature) {
        return new Response(JSON.stringify({ error: 'Missing signature' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const isValid = verifyWebhookSignature(body, signature, config.appSecret);

      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        await handler.process(JSON.parse(body));
        return new Response('OK', { status: 200 });
      } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  };
}