// ============================================
// packages/cli/src/types.ts
// ============================================
export interface ProjectConfig {
  framework: 'nextjs' | 'react' | 'nodejs' | 'express';
  modules: {
    auth: boolean;
    whatsapp: boolean;
    instagram: boolean;
    pages: boolean;
  };
  language: 'typescript' | 'javascript';
  generateEnv: boolean;
  webhookSupport: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface EnvConfig {
  META_APP_ID?: string;
  META_APP_SECRET?: string;
  META_ACCESS_TOKEN?: string;
  META_PHONE_NUMBER_ID?: string;
  META_WEBHOOK_VERIFY_TOKEN?: string;
  META_BUSINESS_ACCOUNT_ID?: string;
}