// ============================================
// NEXT.JS JAVASCRIPT - app/api/auth/logout/route.js
// ============================================
import { createNextAuthHandlers } from '@sndp/meta-auth-server';

const handlers = createNextAuthHandlers({
  appId: process.env.META_APP_ID,
  appSecret: process.env.META_APP_SECRET
});

export const DELETE = handlers.logout;
