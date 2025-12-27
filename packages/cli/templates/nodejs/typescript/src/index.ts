// ============================================
// NODE.JS TYPESCRIPT - src/index.ts
// ============================================
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { createExpressAuthMiddleware } from '@sndp/meta-auth-server/middleware';
import { createExpressWebhook } from '@sndp/meta-whatsapp';
import { whatsappRouter } from './routes/whatsapp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Auth middleware
const authMiddleware = createExpressAuthMiddleware({
  appId: process.env.META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!,
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
  onSuccess: async (req, res, tokens) => {
    req.session.accessToken = tokens.access_token;
    res.redirect('/');
  }
});

// Webhook
const webhook = createExpressWebhook({
  verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN!,
  appSecret: process.env.META_APP_SECRET!,
  handlers: {
    onMessage: async (message, metadata) => {
      console.log('Received message:', message);
    },
    onStatus: async (status) => {
      console.log('Message status:', status);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Meta SDK Server',
    authenticated: !!req.session.accessToken
  });
});

app.get('/auth/login', authMiddleware.login([
  'email',
  'public_profile',
  'whatsapp_business_messaging'
]));

app.get('/auth/callback', authMiddleware.callback);

app.get('/webhook', webhook.verify);
app.post('/webhook', webhook.handle);

app.use('/api/whatsapp', whatsappRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
