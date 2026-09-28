// web/backend/src/routes/internal.ts
import { Router } from "express";
import { config } from "@/config";
import { registerToken } from "@/tokenStore";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const internalRouter: Router = Router();

// Appelé par le bot, pas par le frontend
internalRouter.post("/tokens", (req, res) => {
    if (req.header("Authorization") !== `Bearer ${config.INTERNAL_API_SECRET}`) {
        res.sendStatus(401);
        return;
    }

    const { token, guildId } = req.body as { token?: string; guildId?: string };
    if (!token || !guildId) {
        res.status(400).json({ error: "token and guildId are required" });
        return;
    }

    registerToken(token, guildId, ONE_HOUR_MS);
    res.sendStatus(201);
});