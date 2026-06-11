const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? '';
const REALM = 'bill-buddy';
const CLIENT_ID = 'bill-buddy-api';

function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const getAuthUrl = () => {
  const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
  const nonce = generateNonce();
  sessionStorage.setItem('kc_nonce', nonce);
  return `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=id_token token&scope=openid&nonce=${nonce}`;
};

export function redirectToLogin() {
  window.location.href = getAuthUrl();
}

export function getTokenFromCode(): string | null {
  const hash = window.location.hash;
  if (!hash) return null;
  
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  const idToken = params.get('id_token');
  
  if (token) {
    window.history.replaceState({}, '', window.location.pathname);
    sessionStorage.setItem('kc_token', token);
    if (idToken) {
      sessionStorage.setItem('kc_id_token', idToken);
    }
    sessionStorage.removeItem('kc_nonce');
    return token;
  }
  
  return sessionStorage.getItem('kc_token');
}

export function getToken(): string | null {
  return sessionStorage.getItem('kc_token');
}

export function getUsername(): string | null {
  const token = sessionStorage.getItem('kc_id_token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.preferred_username || payload.name || null;
  } catch {
    return null;
  }
}

export function getFullName(): string | null {
  const token = sessionStorage.getItem('kc_id_token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const name = payload.name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (name) {
      return name;
    }
    return payload.preferred_username || null;
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem('kc_token');
  sessionStorage.removeItem('kc_id_token');
  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
}
