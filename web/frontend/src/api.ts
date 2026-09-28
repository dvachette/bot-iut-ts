// web/frontend/src/api.ts
import { ref } from "vue";

export type LinkStatus = "ok" | "locked" | "expired";

export const linkStatus = ref<LinkStatus>("ok");

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;
const SESSION_KEY = "sessionId";

function readToken(): string | null {
    const candidate: string = window.location.pathname.replace(/^\/+|\/+$/g, "");
    return TOKEN_PATTERN.test(candidate) ? candidate : null;
}

export const LINK_TOKEN: string | null = readToken();

export class ApiError extends Error {
    public constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

function getSessionId(): string {
    const stored: string | null = sessionStorage.getItem(SESSION_KEY);
    if (stored !== null) {
        return stored;
    }
    const created: string = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as { error?: string };
        return body.error ?? response.statusText;
    } catch {
        return response.statusText || `HTTP ${response.status}`;
    }
}

export async function apiRequest<T>(
    resource: string,
    method: "GET" | "PUT" = "GET",
    body?: unknown,
): Promise<T> {
    if (LINK_TOKEN === null) {
        throw new ApiError(404, "Lien invalide");
    }

    const headers: Record<string, string> = { "X-Session-Id": getSessionId() };
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response: Response = await fetch(`/api/${LINK_TOKEN}/${resource}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 423) {
        linkStatus.value = "locked";
    }
    if (response.status === 404) {
        linkStatus.value = "expired";
    }
    if (!response.ok) {
        throw new ApiError(response.status, await readErrorMessage(response));
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}

export function errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}