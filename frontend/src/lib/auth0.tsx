import { Auth0Provider as Auth0ProviderBase, useAuth0 } from '@auth0/auth0-react';
import { ReactNode } from 'react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-dpqkca4rwoqa3qlp.us.auth0.com';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA';
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
// Auth0 expects the callback URL to be at /callback
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`;

interface Auth0ProviderProps {
  children: ReactNode;
}

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  return (
    <Auth0ProviderBase
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        // Only include audience if it's set (for API access)
        ...(audience ? { audience } : {}),
      }}
      // Only use refresh tokens if audience is set (for API access)
      useRefreshTokens={!!audience}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0ProviderBase>
  );
};

export { useAuth0 };

