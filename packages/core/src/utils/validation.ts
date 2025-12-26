import { z } from 'zod';

export const MetaConfigSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App Secret is required'),
  accessToken: z.string().optional(),
  version: z.string().default('v18.0')
});

export const WhatsAppConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access Token is required'),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  version: z.string().default('v18.0')
});

export function validateConfig<T>(schema: z.ZodSchema<T>, config: unknown): T {
  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Configuration validation failed: ${messages}`);
    }
    throw error;
  }
}