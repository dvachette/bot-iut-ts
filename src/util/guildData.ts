import fs from "fs";
import { logger } from "../logger";
const paths = {
    permissions: "permissions.json",
    groups: "groups.json",
    timetables: "edt.yaml",
    config: "config.json"
}
export type ResourceType = keyof typeof paths;
export function getGuildDataPath(guildId: string, ressource: ResourceType): string {
    return `var/${guildId}/${paths[ressource]}`;
}

export function getGuildConfig(guildId: string): { adminRoleId: string, noClassRoleId: string } {
    const configPath = getGuildDataPath(guildId, "config");
    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return {
        adminRoleId: configData.adminRoleId,
        noClassRoleId: configData.noClassRoleId
    };
}

export function generateDefaultGuildData(guildId: string): void {
    const guildDir = `var/${guildId}`;
    if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir, { recursive: true });
        logger.info(`Created directory for guild ${guildId}`);
    } else {
        logger.info(`Directory for guild ${guildId} already exists`);
    }

    const defaultPermissions = {};
    const permissionsPath = getGuildDataPath(guildId, "permissions");
    if (!fs.existsSync(permissionsPath)) {
        fs.writeFileSync(permissionsPath, JSON.stringify(defaultPermissions, null, 4));
        logger.info(`Created default permissions file for guild ${guildId}`);
    } else {
        logger.info(`Permissions file for guild ${guildId} already exists`);
    }

    const defaultGroups = {};
    const groupsPath = getGuildDataPath(guildId, "groups");
    if (!fs.existsSync(groupsPath)) {
        fs.writeFileSync(groupsPath, JSON.stringify(defaultGroups, null, 4));
        logger.info(`Created default groups file for guild ${guildId}`);
    } else {
        logger.info(`Groups file for guild ${guildId} already exists`);
    }

    const defaultConfig = {
        adminRoleId: "",
        noClassRoleId: ""
    };
    const configPath = getGuildDataPath(guildId, "config");
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
        logger.info(`Created default config file for guild ${guildId}`);
    } else {
        logger.info(`Config file for guild ${guildId} already exists`);
    }

    const edtPath = getGuildDataPath(guildId, "timetables")
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
        logger.info(`Created default timetable config file for guild ${guildId}`);
    } else {
        logger.info(`Timetables config file for guild ${guildId} already exists`);
    }
}
