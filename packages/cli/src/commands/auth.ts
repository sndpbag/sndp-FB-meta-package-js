// ============================================
// packages/cli/src/commands/auth.ts
// ============================================
import * as dotenv from 'dotenv';
import axios from 'axios';
import { logger } from '../utils/logger';

dotenv.config();

export async function authCommand() {
  logger.header('🔐 Meta Auth Diagnostic');

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // Check App ID
  if (appId) {
    logger.success('App ID found');
  } else {
    logger.error('App ID not found in .env');
  }

  // Check App Secret
  if (appSecret) {
    logger.success('App Secret found');
  } else {
    logger.error('App Secret not found in .env');
  }

  // Check Access Token
  if (!accessToken) {
    logger.error('Access Token not found in .env');
    logger.suggestion('Generate a token from https://developers.facebook.com/tools/explorer');
    return;
  }

  logger.success('Access Token found');

  // Validate token
  const spinner = logger.spinner('Validating access token...');

  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name'
      }
    });

    spinner.succeed('Access token is valid');
    logger.info(`Authenticated as: ${response.data.name} (${response.data.id})`);

    // Debug token
    if (appId && appSecret) {
      const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
        params: {
          input_token: accessToken,
          access_token: `${appId}|${appSecret}`
        }
      });

      const data = debugResponse.data.data;

      logger.section('\n📊 Token Information:');
      logger.info(`Type: ${data.type}`);
      logger.info(`App ID: ${data.app_id}`);
      logger.info(`User ID: ${data.user_id}`);
      logger.info(`Expires: ${data.expires_at ? new Date(data.expires_at * 1000).toLocaleString() : 'Never'}`);

      // Check permissions
      if (data.scopes && data.scopes.length > 0) {
        logger.section('\n✅ Permissions:');
        data.scopes.forEach((scope: string) => {
          logger.success(`  ${scope}`);
        });
      }

      // Check if token is expired
      if (data.expires_at && data.expires_at * 1000 < Date.now()) {
        logger.warning('\n⚠️  Token expired');
        logger.suggestion('Re-login required');
      }

    }

  } catch (error: any) {
    spinner.fail('Access token validation failed');
    
    if (error.response?.data?.error) {
      logger.error(`Error: ${error.response.data.error.message}`);
      
      if (error.response.data.error.code === 190) {
        logger.suggestion('Token is invalid or expired. Please generate a new one.');
      }
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}
