// web/backend/src/services/guildFiles.ts
import fs from "fs";

export function readJsonFile<T>(filePath: string, fallback: T): T {
    if (!fs.existsSync(filePath)) {
        return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function writeAtomic(filePath: string, content: string): void {
    const tmpPath = `${filePath}.tmp`;
    fs.writeFileSync(tmpPath, content, "utf-8");
    fs.renameSync(tmpPath, filePath);
}