import express from "express";
import { commands } from "./commands";
import { config } from "./config";
import { logger } from "./logger";

const app = express();

app.get("/internal/commands", (req, res) => {
    if (req.header("Authorization") !== `Bearer ${config.INTERNAL_API_SECRET}`) {
        return res.sendStatus(401);
    }
    res.json({ commands: Object.keys(commands) });
});

export function startInternalServer(): void {
    app.listen(config.INTERNAL_PORT, () => {
        logger.info(`Internal server listening on port ${config.INTERNAL_PORT}`);
    });
}