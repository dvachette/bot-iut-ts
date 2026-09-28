// web/backend/src/routes/broadcasts.ts
import { Router } from "express";
import { getGuildDataPath } from "#/guildData";
import { fetchChannelOptions } from "@/services/discord";
import { readJsonFile, writeAtomic } from "@/services/guildFiles";
import { validateBroadcasts, type BroadcastMap } from "@/validation";

export const broadcastsRouter: Router = Router();

broadcastsRouter.get("/", async (_req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const channels = await fetchChannelOptions(guildId);
        const broadcasts: BroadcastMap = readJsonFile<BroadcastMap>(getGuildDataPath(guildId, "groups"), {});
        res.json({ broadcasts, channels });
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});

broadcastsRouter.put("/", async (req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const channels = await fetchChannelOptions(guildId);
        const error: string | null = validateBroadcasts(req.body, new Set(channels.map((c) => c.id)));
        if (error !== null) {
            res.status(400).json({ error });
            return;
        }
        writeAtomic(getGuildDataPath(guildId, "groups"), JSON.stringify(req.body, null, 4));
        res.sendStatus(204);
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});