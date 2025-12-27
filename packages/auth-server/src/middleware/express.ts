// ============================================
// packages/auth-server/src/middleware/express.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { MetaAuthServer } from '../auth-server';
import { AuthServerConfig } from '../types';

export interface ExpressAuthMiddlewareConfig extends AuthServerConfig {
  callbackPath?: string;
  successRedirect?: string;
  failureRedirect?: string;
  onSuccess?: (req: Request, res: Response, tokens: any) => void | Promise<void>;
  onError?: (req: Request, res: Response, error: Error) => void | Promise<void>;
}

/**
 * Create Express middleware for Meta OAuth
 */
export function createExpressAuthMiddleware(config: ExpressAuthMiddlewareConfig) {
  const auth = new MetaAuthServer(config);

  return {
    /**
     * Redirect to Meta OAuth
     */
    login: (scopes: string[]) => {
      return (req: Request, res: Response) => {
        const state = auth.generateState();
        req.session = req.session || {};
        req.session.oauth_state = state;

        const authUrl = auth.getAuthorizationUrl(scopes, state);
        res.redirect(authUrl);
      };
    },

    /**
     * Handle OAuth callback
     */
    callback: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { code, state, error, error_description } = req.query;

        // Check for OAuth errors
        if (error) {
          throw new Error(error_description as string || error as string);
        }

        // Verify state (CSRF protection)
        const sessionState = req.session?.oauth_state;
        if (!sessionState || sessionState !== state) {
          throw new Error('Invalid state parameter (CSRF protection)');
        }

        // Exchange code for token
        const tokens = await auth.exchangeCodeForToken(code as string);

        // Get long-lived token
        const longLivedToken = await auth.exchangeForLongLivedToken(tokens.access_token);

        // Clean up session
        delete req.session?.oauth_state;

        // Call custom success handler
        if (config.onSuccess) {
          await config.onSuccess(req, res, longLivedToken);
        } else if (config.successRedirect) {
          res.redirect(config.successRedirect);
        } else {
          res.json(longLivedToken);
        }
      } catch (error) {
        if (config.onError) {
          await config.onError(req, res, error as Error);
        } else if (config.failureRedirect) {
          res.redirect(`${config.failureRedirect}?error=${encodeURIComponent((error as Error).message)}`);
        } else {
          next(error);
        }
      }
    },

    /**
     * Middleware to validate token in request
     */
    requireAuth: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const validation = await auth.validateToken(token);

        if (!validation.valid) {
          return res.status(401).json({ error: validation.error });
        }

        // Attach user info to request
        (req as any).user = {
          userId: validation.userId,
          scopes: validation.scopes,
          expiresAt: validation.expiresAt
        };

        next();
      } catch (error) {
        res.status(401).json({ error: 'Token validation failed' });
      }
    }
  };
}
