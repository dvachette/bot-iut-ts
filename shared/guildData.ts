// shared/guildData.ts
import fs from "fs";

const paths = {
    permissions: "permissions.json",
    groups: "groups.json",
    timetables: "edt.yaml",
    config: "config.json",
} as const;

export type ResourceType = keyof typeof paths;

export function getGuildDataPath(guildId: string, resource: ResourceType): string {
    return `var/${guildId}/${paths[resource]}`;
}

export function getGuildConfig(guildId: string): { adminRoleId: string; noClassRoleId: string } {
    const configData: { adminRoleId: string; noClassRoleId: string } = JSON.parse(
        fs.readFileSync(getGuildDataPath(guildId, "config"), "utf-8"),
    );
    return { adminRoleId: configData.adminRoleId, noClassRoleId: configData.noClassRoleId };
}