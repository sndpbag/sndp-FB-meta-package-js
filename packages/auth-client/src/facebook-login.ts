import { generateCSRFToken } from './utils/csrf';

export interface FacebookLoginConfig {
  appId: string;
  scopes: string[];
  redirectUri?: string;
  version?: string;
  responseType?: 'code' | 'token';
}

export interface FacebookLoginResult {
  code?: string;
  accessToken?: string;
  error?: string;
}

export function createFacebookLogin(config: FacebookLoginConfig) {
  const {
    appId,
    scopes,
    redirectUri = window.location.origin + '/auth/callback',
    version = 'v18.0',
    responseType = 'code'
  } = config;

  const state = generateCSRFToken();
  sessionStorage.setItem('meta_auth_state', state);

  const loginWithPopup = async (): Promise<FacebookLoginResult> => {
    const authUrl = buildAuthUrl(appId, scopes, redirectUri, state, version, responseType);
    
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'facebook-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error('Popup blocked'));
        return;
      }

      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            reject(new Error('Popup closed'));
            return;
          }

          const popupUrl = popup.location.href;
          
          if (popupUrl.includes(redirectUri)) {
            const params = new URLSearchParams(popup.location.search);
            const code = params.get('code');
            const returnedState = params.get('state');
            const error = params.get('error');

            clearInterval(checkPopup);
            popup.close();

            if (error) {
              reject(new Error(error));
              return;
            }

            if (returnedState !== state) {
              reject(new Error('CSRF validation failed'));
              return;
            }

            resolve({ code: code || undefined });
          }
        } catch (e) {
          // Cross-origin error - popup hasn't redirected yet
        }
      }, 100);
    });
  };

  const loginWithRedirect = () => {
    const authUrl = buildAuthUrl(appId, scopes, redirectUri, state, version, responseType);
    window.location.href = authUrl;
  };

  const logout = () => {
    sessionStorage.removeItem('meta_auth_state');
    sessionStorage.removeItem('meta_access_token');
  };

  return {
    loginWithPopup,
    loginWithRedirect,
    logout
  };
}

function buildAuthUrl(
  appId: string,
  scopes: string[],
  redirectUri: string,
  state: string,
  version: string,
  responseType: string
): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    state,
    response_type: responseType
  });

  return `https://www.facebook.com/${version}/dialog/oauth?${params.toString()}`;
}