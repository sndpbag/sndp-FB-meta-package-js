// ============================================
// NEXT.JS TYPESCRIPT - app/api/auth/callback/route.ts
// ============================================
import { createNextAuthHandlers } from '@sndp/meta-auth-server';

const handlers = createNextAuthHandlers({
  appId: process.env.META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!,
  successUrl: '/',
  errorUrl: '/error'
});

export const GET = handlers.callback;