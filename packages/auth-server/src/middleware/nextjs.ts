// ============================================
// packages/auth-server/src/middleware/nextjs.ts
// ============================================
import { MetaAuthServer } from '../auth-server';
import { AuthServerConfig } from '../types';

export interface NextAuthConfig extends AuthServerConfig {
  successUrl?: string;
  errorUrl?: string;
}

/**
 * Create Next.js API route handlers for Meta OAuth
 */
export function createNextAuthHandlers(config: NextAuthConfig) {
  const auth = new MetaAuthServer(config);

  return {
    /**
     * GET /api/auth/login
     */
    login: (scopes: string[]) => {
      return async (req: Request) => {
        const state = auth.generateState();
        const authUrl = auth.getAuthorizationUrl(scopes, state);

        // Store state in cookie
        const response = Response.redirect(authUrl);
        response.headers.set(
          'Set-Cookie',
          `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
        );

        return response;
      };
    },

    /**
     * GET /api/auth/callback
     */
    callback: async (req: Request) => {
      try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          const errorUrl = config.errorUrl || '/error';
          return Response.redirect(`${errorUrl}?error=${error}`);
        }

        // Verify state from cookie
        const cookies = req.headers.get('cookie') || '';
        const stateCookie = cookies.split(';')
          .find(c => c.trim().startsWith('oauth_state='))
          ?.split('=')[1];

        if (!stateCookie || stateCookie !== state) {
          throw new Error('Invalid state parameter');
        }

        // Exchange code for token
        const tokens = await auth.exchangeCodeForToken(code!);

        // Get long-lived token
        const longLivedToken = await auth.exchangeForLongLivedToken(tokens.access_token);

        // Redirect to success URL with token
        const successUrl = config.successUrl || '/';
        const response = Response.redirect(successUrl);

        // Clear state cookie and set token cookie
        response.headers.set(
          'Set-Cookie',
          [
            'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
            `access_token=${longLivedToken.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${longLivedToken.expires_in}`
          ].join(', ')
        );

        return response;
      } catch (error: any) {
        const errorUrl = config.errorUrl || '/error';
        return Response.redirect(`${errorUrl}?error=${encodeURIComponent(error.message)}`);
      }
    },

    /**
     * POST /api/auth/refresh
     */
    refresh: async (req: Request) => {
      try {
        const { token } = await req.json();

        if (!token) {
          return Response.json({ error: 'No token provided' }, { status: 400 });
        }

        const refreshed = await auth.refreshToken(token);
        return Response.json(refreshed);
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    },

    /**
     * POST /api/auth/validate
     */
    validate: async (req: Request) => {
      try {
        const { token } = await req.json();

        if (!token) {
          return Response.json({ error: 'No token provided' }, { status: 400 });
        }

        const validation = await auth.validateToken(token);
        return Response.json(validation);
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    },

    /**
     * DELETE /api/auth/logout
     */
    logout: async (req: Request) => {
      try {
        const cookies = req.headers.get('cookie') || '';
        const token = cookies.split(';')
          .find(c => c.trim().startsWith('access_token='))
          ?.split('=')[1];

        if (token) {
          await auth.revokeToken(token);
        }

        // Clear token cookie
        const response = Response.json({ success: true });
        response.headers.set(
          'Set-Cookie',
          'access_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
        );

        return response;
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
  };
}