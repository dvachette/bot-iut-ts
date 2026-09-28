// bot/src/util/guildData.ts
import fs from "fs";
import { logger } from "../logger";
import { getGuildDataPath, type ResourceType } from "#/guildData";

export { getGuildDataPath, getGuildConfig, type ResourceType } from "#/guildData";

const DEFAULT_CONTENT: Readonly<Record<ResourceType, string>> = {
    permissions: JSON.stringify({}, null, 4),
    groups: JSON.stringify({}, null, 4),
    config: JSON.stringify({ adminRoleId: "", noClassRoleId: "" }, null, 4),
    timetables: "groups: {}\n",
};

export function generateDefaultGuildData(guildId: string): void {
    const guildDir = `var/${guildId}`;
    if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir, { recursive: true });
        logger.info(`Created directory for guild ${guildId}`);
    }

    for (const resource of Object.keys(DEFAULT_CONTENT) as ResourceType[]) {
        const filePath: string = getGuildDataPath(guildId, resource);
        if (fs.existsSync(filePath)) {
            logger.info(`${resource} file for guild ${guildId} already exists`);
            continue;
        }
        fs.writeFileSync(filePath, DEFAULT_CONTENT[resource]);
        logger.info(`Created default ${resource} file for guild ${guildId}`);
    }
}