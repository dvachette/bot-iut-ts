// web/backend/src/routes/commands.ts
import { Router } from "express";
import { fetchCommandNames } from "@/services/botCommands";

export const commandsRouter: Router = Router();

commandsRouter.get("/", async (_req, res) => {
    try {
        res.json({ commands: await fetchCommandNames() });
    } catch (error) {
        res.status(502).json({ error: String(error) });
    }
});