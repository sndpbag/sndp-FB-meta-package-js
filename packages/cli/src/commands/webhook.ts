// ============================================
// packages/cli/src/commands/webhook.ts
// ============================================
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';

dotenv.config();

export async function webhookCommand() {
  logger.header('🔔 Webhook System Check');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  const appSecret = process.env.META_APP_SECRET;
  const webhookUrl = process.env.META_WEBHOOK_URL;

  // Check verify token
  if (verifyToken) {
    logger.success('Verify Token found');
  } else {
    logger.error('META_WEBHOOK_VERIFY_TOKEN not found in .env');
    logger.suggestion('Generate a random string and add it to your .env file');
  }

  // Check app secret
  if (appSecret) {
    logger.success('App Secret found (for signature verification)');
  } else {
    logger.warning('META_APP_SECRET not found (signature verification will fail)');
  }

  // Check webhook URL
  if (webhookUrl) {
    logger.success(`Webhook URL: ${webhookUrl}`);
  } else {
    logger.warning('META_WEBHOOK_URL not configured');
  }

  // Example signature verification
  logger.section('\n📝 Signature Verification Example:');
  
  if (appSecret) {
    const payload = JSON.stringify({ test: 'data' });
    const signature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');
    
    logger.info('Expected header: X-Hub-Signature-256');
    logger.info(`Sample signature: sha256=${signature}`);
    logger.success('Signature generation working correctly');
  }

  // Setup instructions
  logger.section('\n⚙️  Webhook Setup Instructions:');
  logger.info('1. Go to https://developers.facebook.com/apps');
  logger.info('2. Select your app → WhatsApp → Configuration');
  logger.info('3. Click "Edit" next to Webhook');
  logger.info(`4. Enter your callback URL: ${webhookUrl || 'YOUR_WEBHOOK_URL'}`);
  logger.info(`5. Enter verify token: ${verifyToken || 'YOUR_VERIFY_TOKEN'}`);
  logger.info('6. Subscribe to "messages" field');
  
  logger.suggestion('\nMake sure your webhook endpoint is publicly accessible (use ngrok for local testing)');
}