// web/backend/src/routes/permissions.ts
import { Router } from "express";
import { getGuildDataPath } from "#/guildData";
import { fetchRoleOptions } from "@/services/discord";
import { fetchCommandNames } from "@/services/botCommands";
import { readJsonFile, writeAtomic } from "@/services/guildFiles";
import { validatePermissions, type PermissionMap } from "@/validation";

export const permissionsRouter: Router = Router();

permissionsRouter.get("/", async (_req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const [roles, commands] = await Promise.all([fetchRoleOptions(guildId), fetchCommandNames()]);
        const permissions: PermissionMap = readJsonFile<PermissionMap>(getGuildDataPath(guildId, "permissions"), {});
        res.json({ permissions, commands, roles });
    } catch (error) {
        res.status(502).json({ error: `Upstream error: ${String(error)}` });
    }
});

permissionsRouter.put("/", async (req, res) => {
    const guildId = res.locals.guildId as string;
    try {
        const [roles, commands] = await Promise.all([fetchRoleOptions(guildId), fetchCommandNames()]);
        const error: string | null = validatePermissions(
            req.body,
            new Set(commands),
            new Set(roles.map((r) => r.id)),
        );
        if (error !== null) {
            res.status(400).json({ error });
            return;
        }
        writeAtomic(getGuildDataPath(guildId, "permissions"), JSON.stringify(req.body, null, 4));
        res.sendStatus(204);
    } catch (error) {
        res.status(502).json({ error: `Upstream error: ${String(error)}` });
    }
});