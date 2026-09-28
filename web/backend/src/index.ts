// web/backend/src/index.ts
import express from "express";
import { config } from "@/config";
import { tokenAuth } from "@/middleware/tokenAuth";
import { internalRouter } from "@/routes/internal";
import { commandsRouter } from "@/routes/commands";
import { edtRouter } from "@/routes/edt";
import { permissionsRouter } from "@/routes/permissions";
import { broadcastsRouter } from "@/routes/broadcasts";
import { settingsRouter } from "@/routes/settings";


const app: express.Express = express();
app.use(express.json());

app.use("/internal", internalRouter);

// tokenAuth doit rester AVANT toutes les routes /api/:token/*
app.use("/api/:token", tokenAuth);
app.use("/api/:token/commands", commandsRouter);
app.use("/api/:token/edt", edtRouter);
app.use("/api/:token/permissions", permissionsRouter);
app.use("/api/:token/broadcasts", broadcastsRouter);
app.use("/api/:token/settings", settingsRouter);

app.listen(config.SERVER_PORT, () => {
    console.log(`Backend listening on port ${config.SERVER_PORT}`);
});