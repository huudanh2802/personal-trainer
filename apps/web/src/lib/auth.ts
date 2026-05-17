const TOKEN_KEY = 'ptAuthToken';

export type AuthSession = {
  token: string;
  email: string;
  roles: string[];
  expiresAt: string;
};

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdmin(session: AuthSession | null): boolean {
  return Boolean(session?.roles?.includes('Admin'));
}
