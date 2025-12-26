# @sndp/meta-sdk - Development Brief 🚀

## Project Overview

A production-ready, modular SDK for Meta Platforms (Facebook, Instagram, WhatsApp) with exceptional developer experience. Built with TypeScript, designed for Next.js, React, and Node.js applications.

**Core Philosophy:** Simplicity without sacrificing power. Every feature should "just work" with minimal configuration.

---

## 🏗 Architecture

### Monorepo Structure
```
@sndp/meta-sdk/
├── packages/
│   ├── auth-client/       # Frontend OAuth handling
│   ├── auth-server/       # Backend token management
│   ├── whatsapp/          # WhatsApp Cloud API
│   ├── instagram/         # Instagram Business API
│   ├── pages/             # Facebook Pages API
│   ├── core/              # Shared utilities & types
│   └── cli/               # npx meta-sdk commands
├── examples/              # Usage examples
└── docs/                  # Documentation site
```

**Tooling:** Turborepo or PNPM Workspaces for monorepo management

---

## 📦 Module Specifications

### 1. @sndp/meta-auth-client (Frontend)

**Purpose:** Client-side Facebook OAuth with zero security risks

**Key Features:**
- Popup and redirect login flows
- CSRF protection (state parameter)
- TypeScript-first API
- Framework adapters (React hooks, Next.js helpers)

**API Design:**
```typescript
import { createFacebookLogin } from '@sndp/meta-auth-client';

const { login, logout, getStatus } = createFacebookLogin({
  appId: string,
  scopes: string[],
  version?: string,
  redirectUri?: string
});

// React Hook
const { login, user, loading } = useFacebookAuth({ appId, scopes });
```

### 2. @sndp/meta-auth-server (Backend)

**Purpose:** Secure token exchange and management

**Key Features:**
- Short-lived → Long-lived token conversion
- Token refresh automation
- Secure verification endpoints
- Debug token validation

**API Design:**
```typescript
import { MetaAuthServer } from '@sndp/meta-auth-server';

const auth = new MetaAuthServer({
  appId: string,
  appSecret: string
});

await auth.exchangeToken(shortLivedToken);
await auth.refreshToken(longLivedToken);
await auth.debugToken(token);
```

### 3. @sndp/meta-whatsapp

**Purpose:** Complete WhatsApp Business Cloud API implementation

**Key Features:**
- Text, media, location, contact sharing
- Template messages with dynamic variables
- Interactive buttons and lists
- Webhook event handling
- Media upload/download
- Message status tracking

**API Design:**
```typescript
import { WhatsAppClient } from '@sndp/meta-whatsapp';

const wa = new WhatsAppClient({
  accessToken: string,
  phoneNumberId: string,
  version?: string
});

// Simple text
await wa.sendText(to, message);

// Template with variables
await wa.sendTemplate({
  to: string,
  templateName: string,
  language: string,
  components: TemplateComponent[]
});

// Interactive buttons
await wa.sendButtons({
  to: string,
  bodyText: string,
  buttons: Button[]
});

// Webhook handler
const webhook = createWhatsAppWebhook({
  verifyToken: string,
  onMessage: (msg) => {},
  onStatus: (status) => {}
});
```

### 4. @sndp/meta-instagram

**Purpose:** Instagram Business and Creator automation

**Key Features:**
- Auto-posting (feed, stories, reels)
- Comment management and auto-reply
- Mentions tracking
- Media insights
- Hashtag performance

**API Design:**
```typescript
import { InstagramClient } from '@sndp/meta-instagram';

const ig = new InstagramClient({
  accessToken: string,
  accountId: string
});

// Post content
await ig.publishPost({
  imageUrl: string,
  caption: string,
  location?: Location
});

await ig.publishReel({
  videoUrl: string,
  caption: string,
  coverUrl?: string
});

// Engagement
await ig.getComments(mediaId);
await ig.replyToComment(commentId, text);

// Analytics
await ig.getInsights({
  metrics: ['reach', 'engagement', 'impressions'],
  period: 'day' | 'week' | 'month'
});
```

### 5. @sndp/meta-pages

**Purpose:** Facebook Page management and automation

**Key Features:**
- Page token generation
- Multi-page management
- Scheduled posting
- Comment moderation
- Page insights

**API Design:**
```typescript
import { PagesClient } from '@sndp/meta-pages';

const pages = new PagesClient({ accessToken: string });

// Get managed pages
const pageList = await pages.getPages();

// Post to page
await pages.publishPost(pageId, {
  message: string,
  link?: string,
  media?: Media[]
});

// Insights
await pages.getPageInsights(pageId, metrics);
```

### 6. @sndp/meta-core

**Purpose:** Shared utilities and base functionality

**Exports:**
- Base HTTP client with retry logic
- Error normalization
- Type definitions
- Validation schemas (Zod)
- Rate limit handler
- Pagination helper
- Mock/dry-run system

---

## 🎯 Sprint-Based Development Plan

### Sprint 1: Foundation & Auth (Week 1)

**Goals:**
- Monorepo setup complete
- Auth modules functional
- Type system established

**Tasks:**
1. Initialize Turborepo/PNPM workspace
2. Setup TypeScript configs (strict mode)
3. Build `@sndp/meta-auth-client`:
   - OAuth popup/redirect flows
   - CSRF state handling
   - React hooks implementation
4. Build `@sndp/meta-auth-server`:
   - Token exchange endpoints
   - Token refresh logic
   - Debug token validation
5. Create base type definitions in `@sndp/meta-core`
6. Setup testing framework (Vitest/Jest)

**Deliverables:**
- Working Facebook login (client + server)
- Unit tests for auth flows
- Initial documentation

---

### Sprint 2: WhatsApp Module (Week 2)

**Goals:**
- Complete WhatsApp Cloud API integration
- Webhook system operational

**Tasks:**
1. Build `WhatsAppClient` class with retry mechanism
2. Implement message sending:
   - Text messages
   - Media (image, video, audio, document)
   - Location and contacts
3. Template message engine:
   - Variable injection
   - Header/body/footer support
   - Button actions
4. Interactive messages:
   - Button lists
   - Reply buttons
   - List messages
5. Webhook middleware:
   - Signature verification (X-Hub-Signature-256)
   - Event routing (message, status, etc.)
   - Type-safe event handlers
6. Media handling (upload/download)

**Deliverables:**
- Full WhatsApp API coverage
- Webhook integration guide
- Example Next.js app

---

### Sprint 3: Instagram & Pages (Week 3)

**Goals:**
- Social media automation complete
- Analytics integration

**Tasks:**
1. Build `InstagramClient`:
   - Content publishing (feed, stories, reels)
   - Comment fetching and replies
   - Mention tracking
   - Media insights
2. Build `PagesClient`:
   - Page discovery and token generation
   - Post publishing (text, link, media)
   - Scheduled posts
   - Comment moderation
   - Page analytics
3. Create unified analytics interface
4. Implement Graph API pagination helper

**Deliverables:**
- Instagram automation ready
- Pages management ready
- Analytics dashboard example

---

### Sprint 4: DX & Polish (Week 4)

**Goals:**
- Best-in-class developer experience
- Production-ready release

**Tasks:**
1. Build CLI tool (`@sndp/meta-cli`):
   ```bash
   npx meta-sdk init        # Project setup wizard
   npx meta-sdk auth        # Auth diagnostics
   npx meta-sdk whatsapp    # WhatsApp testing
   npx meta-sdk webhook     # Webhook verification
   npx meta-sdk doctor      # Complete health check
   npx meta-sdk info        # SDK information
   ```
2. CLI features:
   - Interactive prompts (inquirer)
   - Colored output (chalk)
   - Loading spinners (ora)
   - Pretty boxes (boxen)
   - Environment validation
3. Mock/dry-run mode implementation
4. Error normalization layer
5. Rate limit handling with backoff
6. Permission scope resolver
7. Complete documentation site
8. Migration guides
9. Security audit
10. NPM publishing preparation

**Deliverables:**
- Production-ready SDK
- Complete documentation
- Published to NPM
- Example projects

---

## 🔧 Technical Requirements

### Mandatory Guidelines

#### 1. **TypeScript Excellence**
```typescript
// ❌ NEVER use 'any'
function bad(data: any) { }

// ✅ ALWAYS provide proper types
interface MetaResponse<T> {
  data: T;
  error?: MetaError;
}

function good(data: MetaResponse<User>) { }
```

#### 2. **Modular Imports**
```typescript
// ✅ Allow granular imports
import { WhatsAppClient } from '@sndp/meta-sdk/whatsapp';
import { sendText } from '@sndp/meta-sdk/whatsapp/messages';
```

#### 3. **Retry Mechanism**
```typescript
// Exponential backoff: 1s, 2s, 4s
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  onRetry: (attempt, error) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  }
};
```

#### 4. **Error Normalization**
```typescript
// Meta Error Code → Human Message + Action
const errorMap = {
  190: {
    message: 'Access token expired',
    action: 'Please re-authenticate',
    recoverable: true
  },
  10: {
    message: 'Permission not granted',
    action: 'Request permission in App Review',
    recoverable: false
  }
};

class MetaSDKError extends Error {
  code: number;
  action: string;
  recoverable: boolean;
}
```

#### 5. **Environment Validation**
```typescript
import { z } from 'zod';

const configSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App Secret is required'),
  phoneNumberId: z.string().optional(),
  accessToken: z.string().min(1, 'Access Token is required')
});

// Validate at initialization
const validateConfig = (config: unknown) => {
  return configSchema.parse(config);
};
```

#### 6. **Rate Limit Awareness**
```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Implement queue-based rate limiting
    // Auto-backoff on 429 errors
  }
}
```

#### 7. **Mock Mode**
```typescript
// Environment variable
META_SDK_MODE=mock

// Implementation
class WhatsAppClient {
  constructor(config: Config) {
    this.client = config.mode === 'mock' 
      ? new MockMetaClient()
      : new RealMetaClient();
  }
}

// Returns fake but realistic responses
```

#### 8. **Webhook Router**
```typescript
// Unified webhook handler for all Meta products
const webhook = createMetaWebhook({
  verifyToken: string,
  appSecret: string,
  handlers: {
    whatsapp: {
      onMessage: (msg) => {},
      onStatus: (status) => {}
    },
    instagram: {
      onComment: (comment) => {},
      onMention: (mention) => {}
    },
    pages: {
      onPost: (post) => {},
      onComment: (comment) => {}
    }
  }
});
```

#### 9. **Pluggable Token Storage**
```typescript
interface TokenStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Built-in: Memory, Redis, Database
// Custom: User-provided
```

#### 10. **Pagination Helper**
```typescript
async function* paginateResults<T>(
  endpoint: string,
  params: object
): AsyncGenerator<T[]> {
  let nextUrl = endpoint;
  
  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();
    
    yield data.data;
    nextUrl = data.paging?.next;
  }
}

// Usage
for await (const batch of paginateResults('/me/posts', {})) {
  console.log(batch);
}
```

---

## ✅ Final Implementation Checklist

Copy this checklist for the developer:

### Core Features
- [ ] Rate limit awareness & auto backoff
- [ ] Permission / scope resolver
- [ ] Unified webhook router (WhatsApp + IG + Pages)
- [ ] Retry engine (exponential backoff, 3 attempts)
- [ ] Meta error normalization layer
- [ ] Mock / dry-run mode
- [ ] Environment validation (Zod)
- [ ] Pluggable token storage interface
- [ ] Graph API pagination helper
- [ ] Feature flag system (Free/Pro tiers ready)

### Auth Module
- [ ] OAuth 2.0 (popup + redirect)
- [ ] CSRF protection (state parameter)
- [ ] Short → Long token conversion
- [ ] Token auto-refresh
- [ ] React hooks
- [ ] Next.js API route helpers

### WhatsApp Module
- [ ] Text messages
- [ ] Media messages (all types)
- [ ] Template messages with variables
- [ ] Interactive buttons
- [ ] Interactive lists
- [ ] Location & contacts
- [ ] Webhook signature verification
- [ ] Message status tracking
- [ ] Media upload/download

### Instagram Module
- [ ] Feed post publishing
- [ ] Story publishing
- [ ] Reel publishing
- [ ] Comment fetching
- [ ] Auto-reply system
- [ ] Mention tracking
- [ ] Media insights
- [ ] Hashtag analytics

### Pages Module
- [ ] Page discovery
- [ ] Page token generation
- [ ] Post publishing
- [ ] Scheduled posts
- [ ] Comment moderation
- [ ] Page insights
- [ ] Multi-page management

### CLI Tools
- [ ] `npx meta-sdk init` - Project wizard
- [ ] `npx meta-sdk auth` - Auth diagnostics
- [ ] `npx meta-sdk whatsapp` - WhatsApp test
- [ ] `npx meta-sdk webhook` - Webhook verify
- [ ] `npx meta-sdk doctor` - Health check
- [ ] `npx meta-sdk info` - SDK info

### DX & Quality
- [ ] 100% TypeScript coverage
- [ ] Zero `any` types
- [ ] Full JSDoc documentation
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] Example projects (Next.js, React, Node.js)
- [ ] Migration guides
- [ ] Troubleshooting guides
- [ ] Security audit completed

### Documentation
- [ ] Getting started guide
- [ ] API reference (all modules)
- [ ] Authentication flow diagram
- [ ] Webhook setup guide
- [ ] Error handling guide
- [ ] Best practices
- [ ] FAQ section
- [ ] Video tutorials (optional)

---

## 🎨 CLI Tool Specifications

### Visual Design
```
╭──────────────────────────────────────────╮
│      🚀 Welcome to SNDP Meta SDK          │
│  Build Facebook, Instagram & WhatsApp    │
╰──────────────────────────────────────────╯
```

### Libraries
- **Colors:** `chalk`
- **Prompts:** `inquirer`
- **Spinner:** `ora`
- **Icons:** Unicode / `log-symbols`
- **Boxes:** `boxen`

### Commands

#### `npx meta-sdk init`
Interactive project setup:
1. Framework selection (Next.js, React, Node.js)
2. Module selection (Auth, WhatsApp, Instagram, Pages)
3. Generate `.env.example`
4. Webhook configuration
5. Install dependencies

#### `npx meta-sdk auth`
Auth diagnostics:
- ✅ App ID validation
- ✅ App Secret validation
- ✅ Redirect URI check
- ⚠️ Token expiry warning
- ✅ Permission status

#### `npx meta-sdk whatsapp`
WhatsApp testing:
- ✅ Access token valid
- ✅ Phone Number ID linked
- ✅ Webhook verified
- ✅ Send test message
- ✅ Delivery status

#### `npx meta-sdk doctor`
Complete health check:
- Node.js version
- SDK version
- Environment variables
- Missing permissions
- Configuration issues
- Actionable suggestions

---

## 📚 Documentation Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
├── modules/
│   ├── auth.md
│   ├── whatsapp.md
│   ├── instagram.md
│   └── pages.md
├── guides/
│   ├── authentication-flow.md
│   ├── webhook-setup.md
│   ├── error-handling.md
│   └── best-practices.md
├── api-reference/
│   └── (auto-generated from JSDoc)
└── examples/
    ├── nextjs-app/
    ├── react-app/
    └── nodejs-server/
```

---

## 🚀 Success Metrics

### Developer Experience
- Setup time: < 5 minutes
- First API call: < 10 minutes
- Learning curve: Minimal (clear docs)

### Code Quality
- TypeScript strict mode: ✅
- Test coverage: >80%
- Zero critical security issues
- Performance: <100ms overhead

### Community
- GitHub stars target: 1000+ (6 months)
- NPM downloads: 10k/month (3 months)
- Active contributors: 5+ (6 months)

---

## 📄 License

MIT © Sandip (SNDP)

---

## 🤝 Support

- Documentation: https://docs.sndp.dev/meta-sdk
- Issues: GitHub Issues
- Discord: Community chat
- Email: support@sndp.dev