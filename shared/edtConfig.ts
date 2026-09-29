// shared/edtConfig.ts
const GROUP_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const URL_PATTERN = /^https\:\/\/edt\.univ\-lyon1\.fr\/jsp\/custom\/modules\/plannings\/anonymous_cal\.jsp\?resources=\d+&projectId=1&calType=ical&firstDate=START&lastDate=END$/;
export interface EdtGroupEntry {
    readonly role: string;
    readonly channel: string;
    readonly edturl: string;
}

export interface EdtConfig {
    readonly groups: Readonly<Record<string, EdtGroupEntry>>;
}

export function validateEdtConfig(
    raw: unknown,
    roleIds: ReadonlySet<string>,
    channelIds: ReadonlySet<string>,
): string | null {
    if (typeof raw !== "object" || raw === null || !("groups" in raw)) {
        return "Le fichier doit contenir une clé racine `groups`.";
    }
    const groups: unknown = (raw as { groups: unknown }).groups;
    if (typeof groups !== "object" || groups === null) {
        return "`groups` doit être un objet.";
    }

    for (const [name, entry] of Object.entries(groups as Record<string, unknown>)) {
        if (!GROUP_NAME_PATTERN.test(name)) {
            return `Le nom de groupe "${name}" est invalide (lettres, chiffres, _ et - uniquement).`;
        }
        if (typeof entry !== "object" || entry === null) {
            return `Le groupe "${name}" est invalide.`;
        }
        const { role, channel, edturl } = entry as Record<string, unknown>;

        if (typeof role !== "string" || role.length === 0) {
            return `Le groupe "${name}" : champ "role" manquant ou invalide.`;
        }
        if (typeof channel !== "string" || channel.length === 0) {
            return `Le groupe "${name}" : champ "channel" manquant ou invalide.`;
        }
        if (typeof edturl !== "string" || edturl.length === 0) {
            return `Le groupe "${name}" : champ "edturl" manquant ou invalide.`;
        }
        if (!edturl.startsWith("https://")) {
            return `Le groupe "${name}" : "edturl" doit commencer par https://.`;
        }
        if (!URL_PATTERN.test(edturl)) {
            return `Le groupe "${name}" : "edturl" ne correspond pas au format attendu.`;
        }
        if (!roleIds.has(role)) {
            return `Le groupe "${name}" référence un rôle introuvable sur ce serveur : ${role}.`;
        }
        if (!channelIds.has(channel)) {
            return `Le groupe "${name}" référence un salon introuvable sur ce serveur : ${channel}.`;
        }
    }
    return null;
}