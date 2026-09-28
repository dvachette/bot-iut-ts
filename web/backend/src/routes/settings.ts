// web/backend/src/routes/settings.ts
import { Router } from "express";
import { getGuildDataPath } from "#/guildData";
import { fetchRoleOptions } from "@/services/discord";
import { readJsonFile, writeAtomic } from "@/services/guildFiles";
import { validateSettings, type GuildSettings } from "@/validation";

const DEFAULT_SETTINGS: GuildSettings = { adminRoleId: "", noClassRoleId: "" };

export const settingsRouter: Router = Router();

settingsRouter.get("/", async (_req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const roles = await fetchRoleOptions(guildId);
        const settings: GuildSettings = readJsonFile<GuildSettings>(getGuildDataPath(guildId, "config"), DEFAULT_SETTINGS);
        res.json({ settings, roles });
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});

settingsRouter.put("/", async (req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const roles = await fetchRoleOptions(guildId);
        const error: string | null = validateSettings(req.body, new Set(roles.map((r) => r.id)));
        if (error !== null) {
            res.status(400).json({ error });
            return;
        }
        const filePath: string = getGuildDataPath(guildId, "config");
        const current: Record<string, unknown> = readJsonFile<Record<string, unknown>>(filePath, DEFAULT_SETTINGS as unknown as Record<string, unknown>);
        writeAtomic(filePath, JSON.stringify({ ...current, ...(req.body as Partial<GuildSettings>) }, null, 4));
        res.sendStatus(204);
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});