# @sndp/meta-sdk 🚀

[![npm version](https://img.shields.io/npm/v/@sndp/meta-sdk.svg)](https://www.npmjs.com/package/@sndp/meta-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Downloads](https://img.shields.io/npm/dm/@sndp/meta-sdk.svg)](https://www.npmjs.com/package/@sndp/meta-sdk)

The most powerful and developer-friendly SDK for Meta Platforms (Facebook, Instagram, WhatsApp). Simplified, modular, and built for modern frameworks like Next.js, React, and Node.js.

## ✨ Features

- 🔐 **Complete Authentication** - OAuth 2.0, token management, auto-refresh
- 📲 **WhatsApp Business API** - Messages, templates, media, webhooks
- 📸 **Instagram Business** - Posts, stories, reels, comments, insights
- 📄 **Facebook Pages** - Posts, comments, analytics, moderation
- 🛠 **Best DX** - TypeScript-first, CLI tools, React hooks
- 🔄 **Auto-Retry** - Smart error handling with exponential backoff
- 🎯 **Type-Safe** - Full TypeScript support with detailed types
- 📦 **Modular** - Import only what you need
- 🚀 **Production-Ready** - Rate limiting, error normalization, mock mode

---

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@sndp/meta-core](./packages/core) | Core utilities and HTTP client | ![npm](https://img.shields.io/npm/v/@sndp/meta-core) |
| [@sndp/meta-auth-client](./packages/auth-client) | Frontend OAuth for React/Next.js | ![npm](https://img.shields.io/npm/v/@sndp/meta-auth-client) |
| [@sndp/meta-auth-server](./packages/auth-server) | Backend token management | ![npm](https://img.shields.io/npm/v/@sndp/meta-auth-server) |
| [@sndp/meta-whatsapp](./packages/whatsapp) | WhatsApp Cloud API | ![npm](https://img.shields.io/npm/v/@sndp/meta-whatsapp) |
| [@sndp/meta-instagram](./packages/instagram) | Instagram Business API | ![npm](https://img.shields.io/npm/v/@sndp/meta-instagram) |
| [@sndp/meta-pages](./packages/pages) | Facebook Pages API | ![npm](https://img.shields.io/npm/v/@sndp/meta-pages) |
| [@sndp/meta-cli](./packages/cli) | CLI development tools | ![npm](https://img.shields.io/npm/v/@sndp/meta-cli) |

---

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @sndp/meta-whatsapp @sndp/meta-auth-server

# Using yarn
yarn add @sndp/meta-whatsapp @sndp/meta-auth-server

# Using pnpm
pnpm add @sndp/meta-whatsapp @sndp/meta-auth-server
```

### CLI Setup (Recommended)

```bash
npx @sndp/meta-cli init
```

This interactive tool will:
- ✅ Choose your framework (Next.js, React, Node.js)
- ✅ Select modules you need
- ✅ Generate starter code
- ✅ Configure environment variables
- ✅ Install dependencies

---

## 📚 Usage Examples

### 🔐 Authentication

#### Client-Side (React/Next.js)

```tsx
import { createFacebookLogin } from '@sndp/meta-auth-client';

const { loginWithPopup, logout } = createFacebookLogin({
  appId: process.env.NEXT_PUBLIC_META_APP_ID!,
  scopes: ['email', 'whatsapp_business_messaging']
});

function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await loginWithPopup();
      console.log('Logged in:', result);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login with Facebook</button>;
}
```

#### Server-Side (Node.js/Next.js)

```typescript
import { MetaAuthServer } from '@sndp/meta-auth-server';

const auth = new MetaAuthServer({
  appId: process.env.META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!
});

// Exchange code for token
const tokens = await auth.exchangeCodeForToken(code);

// Get long-lived token (60 days)
const longLived = await auth.exchangeForLongLivedToken(tokens.access_token);

// Validate token
const validation = await auth.validateToken(longLived.access_token);
console.log('Token valid:', validation.valid);
```

### 📲 WhatsApp

```typescript
import { WhatsAppClient } from '@sndp/meta-whatsapp';

const wa = new WhatsAppClient({
  accessToken: process.env.META_ACCESS_TOKEN!,
  phoneNumberId: process.env.META_PHONE_NUMBER_ID!
});

// Send text message
await wa.sendText('8801712345678', 'Hello from Meta SDK!');

// Send image
await wa.sendImage('8801712345678', 'https://example.com/image.jpg', 'Check this out!');

// Send template
await wa.sendTemplate('8801712345678', {
  name: 'order_confirmation',
  language: 'en_US',
  components: [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John' },
        { type: 'text', text: '12345' }
      ]
    }
  ]
});

// Send interactive buttons
await wa.interactive.sendButtons(
  '8801712345678',
  'Choose an option:',
  [
    { type: 'reply', reply: { id: '1', title: 'Yes' }},
    { type: 'reply', reply: { id: '2', title: 'No' }}
  ]
);

// Send list
await wa.interactive.sendList(
  '8801712345678',
  'Select a product:',
  'View Products',
  [
    {
      title: 'Electronics',
      rows: [
        { id: '1', title: 'Laptop', description: '$999' },
        { id: '2', title: 'Phone', description: '$699' }
      ]
    }
  ]
);
```

### 📸 Instagram

```typescript
import { InstagramClient } from '@sndp/meta-instagram';

const ig = new InstagramClient({
  accessToken: process.env.META_ACCESS_TOKEN!,
  accountId: process.env.META_INSTAGRAM_ACCOUNT_ID!
});

// Publish image post
await ig.feed.publishImage({
  imageUrl: 'https://example.com/photo.jpg',
  caption: 'Beautiful sunset 🌅 #nature'
});

// Publish reel
await ig.reel.publish({
  videoUrl: 'https://example.com/video.mp4',
  caption: 'Check out this amazing video!',
  shareToFeed: true
});

// Publish carousel
await ig.carousel.publish({
  items: [
    { imageUrl: 'https://example.com/img1.jpg', isVideo: false },
    { imageUrl: 'https://example.com/img2.jpg', isVideo: false }
  ],
  caption: 'Swipe to see more!'
});

// Get comments
const comments = await ig.comments.getComments(mediaId);

// Auto-reply to comments
await ig.comments.autoReply(
  mediaId,
  ['price', 'cost'],
  'Check our website for pricing!'
);

// Get insights
const insights = await ig.insights.getReachAndImpressions('week');
console.log('Impressions:', insights.impressions);
console.log('Reach:', insights.reach);
```

### 📄 Facebook Pages

```typescript
import { PagesClient } from '@sndp/meta-pages';

const pages = new PagesClient({
  accessToken: process.env.META_ACCESS_TOKEN!
});

// Get your pages
const myPages = await pages.getPages();
const pageId = myPages[0].id;

// Publish text post
await pages.posts.publishText(pageId, 'Hello from our page!');

// Publish link
await pages.posts.publishLink(pageId, {
  link: 'https://example.com',
  message: 'Check out our website!'
});

// Publish photo
await pages.posts.publishPhoto(pageId, {
  url: 'https://example.com/image.jpg',
  caption: 'New product launch!'
});

// Schedule post
const futureTime = Math.floor(Date.now() / 1000) + 3600;
await pages.posts.publishText(pageId, 'Scheduled post', {
  scheduled_publish_time: futureTime
});

// Get comments
const comments = await pages.comments.getComments(postId);

// Auto-reply
await pages.comments.autoReply(
  postId,
  ['support', 'help'],
  'Please DM us for support!'
);

// Get insights
const report = await pages.insights.getPageReport(pageId, 'week');
console.log('Page views:', report.overview.page_views_total);
console.log('Engagement:', report.engagement.page_engaged_users);
```

### 🔔 Webhooks

#### Next.js App Router

```typescript
// app/api/webhook/route.ts
import { createNextWebhook } from '@sndp/meta-whatsapp';

const webhook = createNextWebhook({
  verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN!,
  appSecret: process.env.META_APP_SECRET!,
  handlers: {
    onMessage: async (message, metadata) => {
      console.log('Received:', message.text?.body);
      
      // Auto-reply
      if (message.text?.body?.toLowerCase().includes('hello')) {
        const wa = new WhatsAppClient({
          accessToken: process.env.META_ACCESS_TOKEN!,
          phoneNumberId: metadata.phoneNumberId
        });
        
        await wa.sendText(message.from, 'Hello! How can I help you?');
      }
    },
    onStatus: async (status) => {
      console.log('Message status:', status.status);
    }
  }
});

export const GET = webhook.GET;
export const POST = webhook.POST;
```

#### Express

```typescript
import express from 'express';
import { createExpressWebhook } from '@sndp/meta-whatsapp';

const app = express();

const webhook = createExpressWebhook({
  verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN!,
  appSecret: process.env.META_APP_SECRET!,
  handlers: {
    onMessage: async (message) => {
      console.log('Message:', message);
    }
  }
});

app.get('/webhook', webhook.verify);
app.post('/webhook', webhook.handle);

app.listen(3000);
```

---

## 🛠 CLI Commands

```bash
# Initialize new project
npx @sndp/meta-cli init

# Diagnose authentication
npx @sndp/meta-cli auth

# Test WhatsApp connection
npx @sndp/meta-cli whatsapp

# Verify webhook setup
npx @sndp/meta-cli webhook

# Complete health check
npx @sndp/meta-cli doctor

# Show SDK info
npx @sndp/meta-cli info
```

### Doctor Output Example

```
🩺 Meta SDK Doctor Report

✓ Node version: v20.10.0
✓ SDK packages installed: 5

📋 Environment Variables:
✓ META_APP_ID ✓
✓ META_APP_SECRET ✓
✓ META_ACCESS_TOKEN ✓

🌐 Meta API Connectivity:
✓ Meta Graph API connection successful
  Connected as: John Doe

🔐 Permissions Check:
✓ whatsapp_business_messaging ✅
✓ instagram_content_publish ✅

📊 Summary:
🎉 Everything looks great! Your setup is ready to go.
```

---

## 🏗 Architecture

### Modular Design

```typescript
// Import only what you need
import { WhatsAppClient } from '@sndp/meta-whatsapp';
import { InstagramClient } from '@sndp/meta-instagram';

// Or use specific modules
import { TextMessage } from '@sndp/meta-whatsapp/messages';
import { FeedMedia } from '@sndp/meta-instagram/media';
```

### Error Handling

```typescript
import { MetaSDKError } from '@sndp/meta-core';

try {
  await wa.sendText('123', 'Hello');
} catch (error) {
  if (error instanceof MetaSDKError) {
    console.log('Error code:', error.code);
    console.log('Message:', error.message);
    console.log('Action:', error.action);
    console.log('Recoverable:', error.recoverable);
  }
}
```

### Auto Retry

```typescript
// Automatic retry with exponential backoff
const wa = new WhatsAppClient({
  accessToken: token,
  phoneNumberId: phoneId
  // Retry automatically on network errors
});

// Retries: 1s, 2s, 4s (3 attempts)
```

### Token Management

```typescript
import { TokenManager } from '@sndp/meta-auth-server';

const manager = new TokenManager({
  appId: process.env.META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!,
  autoRefresh: true,
  refreshThresholdDays: 7 // Refresh 7 days before expiry
});

// Store token (automatically schedules refresh)
await manager.storeToken('user123', accessToken);

// Get token (auto-refreshes if needed)
const token = await manager.getToken('user123');
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Meta App Configuration
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_ACCESS_TOKEN=your_access_token

# WhatsApp Configuration
META_PHONE_NUMBER_ID=your_phone_number_id
META_BUSINESS_ACCOUNT_ID=your_business_account_id

# Instagram Configuration
META_INSTAGRAM_ACCOUNT_ID=your_instagram_account_id

# Webhook Configuration
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
META_WEBHOOK_URL=https://your-domain.com/api/webhook

# Next.js (Client-side)
NEXT_PUBLIC_META_APP_ID=${META_APP_ID}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## 📖 Documentation

### Package Documentation

- [Core](./packages/core/README.md) - HTTP client, error handling, utilities
- [Auth Client](./packages/auth-client/README.md) - Frontend authentication
- [Auth Server](./packages/auth-server/README.md) - Backend token management
- [WhatsApp](./packages/whatsapp/README.md) - WhatsApp Cloud API
- [Instagram](./packages/instagram/README.md) - Instagram Business API
- [Pages](./packages/pages/README.md) - Facebook Pages API
- [CLI](./packages/cli/README.md) - Development tools

### Guides

- [Getting Started](./docs/getting-started.md)
- [Authentication Flow](./docs/authentication.md)
- [WhatsApp Setup](./docs/whatsapp.md)
- [Instagram Setup](./docs/instagram.md)
- [Webhook Configuration](./docs/webhooks.md)
- [Error Handling](./docs/error-handling.md)
- [Best Practices](./docs/best-practices.md)

### API Reference

Full API documentation is available at [docs.sndp.dev/meta-sdk](https://docs.sndp.dev/meta-sdk)

---

## 🎯 Features by Package

### @sndp/meta-whatsapp

- ✅ Text messages with URL preview
- ✅ Media messages (image, video, audio, document)
- ✅ Template messages with variables
- ✅ Interactive buttons (max 3)
- ✅ Interactive lists (up to 10 sections)
- ✅ Location messages
- ✅ Contact messages
- ✅ Mark messages as read
- ✅ Media upload/download
- ✅ Webhook handling with signature verification

### @sndp/meta-instagram

- ✅ Feed posts (image, video)
- ✅ Stories (image, video)
- ✅ Reels with cover image
- ✅ Carousel posts (2-10 items)
- ✅ Comment management
- ✅ Auto-reply to comments
- ✅ Mention tracking
- ✅ Hashtag search and analysis
- ✅ Account insights
- ✅ Post insights
- ✅ Follower demographics

### @sndp/meta-pages

- ✅ Text, link, photo, video posts
- ✅ Scheduled posts
- ✅ Post management (update, delete)
- ✅ Comment moderation
- ✅ Auto-reply to comments
- ✅ Private message replies
- ✅ Page insights and analytics
- ✅ Follower demographics
- ✅ Post promotion/boosting
- ✅ Call-to-action buttons

### @sndp/meta-auth-server

- ✅ OAuth 2.0 code exchange
- ✅ Long-lived token generation (60 days)
- ✅ Token auto-refresh
- ✅ Token validation
- ✅ Page access tokens (never expire)
- ✅ Token revocation
- ✅ CSRF protection
- ✅ Express middleware
- ✅ Next.js API handlers

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific package tests
npm test --workspace=@sndp/meta-whatsapp

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sndp/meta-sdk.git
cd meta-sdk

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

---

## 📝 Examples

### Full Projects

- [Next.js App](./examples/nextjs-app) - Complete Next.js application
- [React App](./examples/react-app) - React with Vite
- [Node.js Server](./examples/nodejs-server) - Express server

### Code Snippets

- [WhatsApp Bot](./examples/snippets/whatsapp-bot.ts)
- [Instagram Auto-Post](./examples/snippets/instagram-scheduler.ts)
- [Comment Moderation](./examples/snippets/comment-moderator.ts)
- [Analytics Dashboard](./examples/snippets/analytics-dashboard.ts)

---

## 🛡 Security

### Best Practices

- ✅ Never commit `.env` files
- ✅ Always use environment variables
- ✅ Validate webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Regularly rotate tokens
- ✅ Follow principle of least privilege

### Reporting Vulnerabilities

Please report security vulnerabilities to security@sndp.dev

---

## 📊 Performance

- **HTTP Client**: Built-in connection pooling
- **Retry Logic**: Exponential backoff (3 attempts)
- **Rate Limiting**: Automatic queue management
- **Caching**: Optional Redis/in-memory support
- **Pagination**: Async generators for large datasets

---

## 🗺 Roadmap

- [x] Core authentication
- [x] WhatsApp Cloud API
- [x] Instagram Business API
- [x] Facebook Pages API
- [x] CLI tools
- [ ] Facebook Ads API
- [ ] Instagram Shopping API
- [ ] Meta Business Suite integration
- [ ] Advanced analytics dashboard
- [ ] Webhook event router
- [ ] Multi-language support

---

## 💬 Support

- 📧 Email: support@sndp.dev
- 💬 Discord: [Join our community](https://discord.gg/sndp-meta-sdk)
- 🐛 Issues: [GitHub Issues](https://github.com/sndp/meta-sdk/issues)
- 📖 Docs: [docs.sndp.dev/meta-sdk](https://docs.sndp.dev/meta-sdk)

---

## 📄 License

MIT © [Sandip (SNDP)](https://github.com/sndp)

---

## 🙏 Acknowledgments

- Meta Developer Platform
- The awesome Node.js community
- All our contributors

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sndp/meta-sdk&type=Date)](https://star-history.com/#sndp/meta-sdk&Date)

---

<div align="center">

**[Website](https://sndp.dev)** • **[Documentation](https://docs.sndp.dev/meta-sdk)** • **[NPM](https://www.npmjs.com/package/@sndp/meta-sdk)** • **[GitHub](https://github.com/sndp/meta-sdk)**

Made with ❤️ by [Sandip](https://github.com/sndp)

</div>