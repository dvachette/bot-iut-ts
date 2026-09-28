// web/backend/src/tokenStore.ts
interface TokenEntry {
    guildId: string;
    expiresAt: number;
    sessionId: string | null;
}

const store = new Map<string, TokenEntry>();

export function registerToken(token: string, guildId: string, ttlMs: number): void {
    store.set(token, { guildId, expiresAt: Date.now() + ttlMs, sessionId: null });
}

export function getEntry(token: string): TokenEntry | null {
    const entry = store.get(token);
    if (!entry) {
        return null;
    }
    if (entry.expiresAt < Date.now()) {
        store.delete(token);
        return null;
    }
    return entry;
}

// Renvoie true si sessionId obtient/possède déjà le lock, false s'il est pris par une autre session
export function claimOrCheckLock(token: string, sessionId: string): boolean {
    const entry = store.get(token);
    if (!entry) {
        return false;
    }
    if (entry.sessionId === null) {
        entry.sessionId = sessionId;
        return true;
    }
    return entry.sessionId === sessionId;
}