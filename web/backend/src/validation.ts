// web/backend/src/validation.ts
export type PermissionMap = Record<string, string[]>;
export type BroadcastMap = Record<string, string[]>;

export interface GuildSettings {
    adminRoleId: string;
    noClassRoleId: string;
}

const SETTINGS_KEYS: readonly string[] = ["adminRoleId", "noClassRoleId"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validatePermissions(
    raw: unknown,
    commandNames: ReadonlySet<string>,
    roleIds: ReadonlySet<string>,
): string | null {
    if (!isPlainObject(raw)) {
        return "Le corps doit être un objet.";
    }
    for (const [command, roles] of Object.entries(raw)) {
        if (!commandNames.has(command)) {
            return `Commande inconnue : ${command}.`;
        }
        if (!isStringArray(roles)) {
            return `"${command}" doit être un tableau d'identifiants de rôle.`;
        }
        const missing: string | undefined = roles.find((id) => !roleIds.has(id));
        if (missing !== undefined) {
            return `"${command}" référence un rôle introuvable : ${missing}.`;
        }
    }
    return null;
}

export function validateBroadcasts(raw: unknown, channelIds: ReadonlySet<string>): string | null {
    if (!isPlainObject(raw)) {
        return "Le corps doit être un objet.";
    }
    for (const [group, channels] of Object.entries(raw)) {
        if (group.length === 0) {
            return "Un nom de groupe ne peut pas être vide.";
        }
        if (!isStringArray(channels)) {
            return `"${group}" doit être un tableau d'identifiants de salon.`;
        }
        const missing: string | undefined = channels.find((id) => !channelIds.has(id));
        if (missing !== undefined) {
            return `"${group}" référence un salon introuvable : ${missing}.`;
        }
    }
    return null;
}

export function validateSettings(raw: unknown, roleIds: ReadonlySet<string>): string | null {
    if (!isPlainObject(raw)) {
        return "Le corps doit être un objet.";
    }
    for (const [key, value] of Object.entries(raw)) {
        if (!SETTINGS_KEYS.includes(key)) {
            return `Champ inconnu : ${key}.`;
        }
        if (typeof value !== "string") {
            return `"${key}" doit être une chaîne.`;
        }
        if (value !== "" && !roleIds.has(value)) {
            return `"${key}" référence un rôle introuvable : ${value}.`;
        }
    }
    return null;
}