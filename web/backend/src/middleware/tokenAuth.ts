// web/backend/src/middleware/tokenAuth.ts
import type { NextFunction, Request, Response } from "express";
import { claimOrCheckLock, getEntry } from "@/tokenStore";

export function tokenAuth(req: Request<{ token: string }>, res: Response, next: NextFunction): void {
    const { token } = req.params;

    const entry = getEntry(token);
    if (!entry) {
        res.status(404).json({ error: "invalid or expired token" });
        return;
    }

    const sessionId: string | undefined = req.header("X-Session-Id");
    if (!sessionId) {
        res.status(400).json({ error: "X-Session-Id header required" });
        return;
    }

    if (!claimOrCheckLock(token, sessionId)) {
        res.sendStatus(423);
        return;
    }

    res.locals.guildId = entry.guildId;
    next();
}