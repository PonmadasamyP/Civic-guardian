/**
 * Anonymity helpers for Civic Guardian
 * Guarantees that no real identities (names, emails, phone numbers) are ever exposed.
 */

export function generateCitizenAlias(): string {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  return `Citizen #${randomCode}`;
}

export function generateAuthorityAlias(wardNumber?: number): string {
  const ward = wardNumber || Math.floor(1 + Math.random() * 25);
  return `Civic Official (Ward ${ward})`;
}

/**
 * Creates a deterministic alias from a UUID or ID string so the same user keeps
 * their consistent anonymous identity without storing personal identifiable data.
 */
export function getDeterministicAlias(userId: string, role: string = 'citizen'): string {
  if (role === 'authority') {
    return 'Municipal Authority (Dept. Public Works)';
  }
  if (role === 'admin') {
    return 'Admin Guardian #01';
  }

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 9000) + 1000;
  return `Citizen #${code}`;
}

/**
 * Strips any sensitive data fields before publishing or storing
 */
export function sanitizeUserData(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    alias: user.alias || getDeterministicAlias(user.id, user.role),
    role: user.role || 'citizen',
    points: user.points || 0,
    badges: user.badges || ['First Step'],
  };
}
