// web/backend/src/routes/edt.ts
import { Router } from "express";
import fs from "fs";
import YAML from "yaml";
import { getGuildDataPath } from "#/guildData";
import { validateEdtConfig, type EdtConfig } from "#/edtConfig";
import { fetchChannelOptions, fetchRoleOptions } from "@/services/discord";
import { writeAtomic } from "@/services/guildFiles";

export const edtRouter: Router = Router();

function readGroups(filePath: string): EdtConfig["groups"] {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    const parsed = YAML.parse(fs.readFileSync(filePath, "utf-8")) as EdtConfig | null;
    return parsed?.groups ?? {};
}


edtRouter.get("/", async (_req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const [channels, roles] = await Promise.all([fetchChannelOptions(guildId), fetchRoleOptions(guildId)]);
        res.json({ groups: readGroups(getGuildDataPath(guildId, "timetables")), channels, roles });
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});

edtRouter.put("/", async (req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const [channels, roles] = await Promise.all([fetchChannelOptions(guildId), fetchRoleOptions(guildId)]);
        const error: string | null = validateEdtConfig(
            req.body,
            new Set(roles.map((r) => r.id)),
            new Set(channels.map((c) => c.id)),
        );
        if (error !== null) {
            res.status(400).json({ error });
            return;
        }
        const { groups } = req.body as EdtConfig;
        writeAtomic(getGuildDataPath(guildId, "timetables"), YAML.stringify({ groups }));
        res.sendStatus(204);
    } catch (error) {
        res.status(502).json({ error: `Discord API error: ${String(error)}` });
    }
});