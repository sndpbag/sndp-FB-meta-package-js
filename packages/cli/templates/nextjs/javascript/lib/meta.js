// ============================================
// NEXT.JS JAVASCRIPT - lib/meta.js
// ============================================
import { WhatsAppClient } from '@sndp/meta-whatsapp';
import { InstagramClient } from '@sndp/meta-instagram';
import { MetaAuthServer } from '@sndp/meta-auth-server';

// Singleton instances
let whatsappClient = null;
let instagramClient = null;
let authServer = null;

export function getWhatsAppClient(accessToken) {
  if (!whatsappClient || accessToken) {
    whatsappClient = new WhatsAppClient({
      accessToken: accessToken || process.env.META_ACCESS_TOKEN,
      phoneNumberId: process.env.META_PHONE_NUMBER_ID
    });
  }
  return whatsappClient;
}

export function getInstagramClient(accessToken) {
  if (!instagramClient || accessToken) {
    instagramClient = new InstagramClient({
      accessToken: accessToken || process.env.META_ACCESS_TOKEN,
      accountId: process.env.META_INSTAGRAM_ACCOUNT_ID
    });
  }
  return instagramClient;
}

export function getAuthServer() {
  if (!authServer) {
    authServer = new MetaAuthServer({
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET
    });
  }
  return authServer;
}
