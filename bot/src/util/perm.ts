import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";
import * as fs from "fs";
import { getGuildConfig, getGuildDataPath } from "./guildData";
export interface PermissionGroup {
    [command: string]: string[];
}

export function getPermissions(guildId: string): PermissionGroup {
    return JSON.parse(fs.readFileSync(getGuildDataPath(guildId, "permissions"), "utf-8"));
}

export function savePermissions(permissions: PermissionGroup, guildId: string): void {
    fs.writeFileSync(getGuildDataPath(guildId, "permissions"), JSON.stringify(permissions, null, 4));
}

export function canRunCommand(interaction: ChatInputCommandInteraction): boolean {
    if (!interaction.guildId) {
        return false; // No guild context, cannot check permissions
    }
    if (!interaction.member) {
        return false; // No member context, cannot check permissions
    }
    const permissions = getPermissions(interaction.guildId);
    const command = interaction.commandName;
    const member = interaction.member;
    if (!member || !member.roles || member instanceof GuildMember === false) {
        return false; // No roles available, cannot check permissions
    }
    if (interaction.guild!.ownerId === member.id) {
        return true;
    }
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }
    const userRoles = member.roles.cache.map(role => role.id) || [];
    let allowed = false;
    if (permissions[command]) {

        allowed = permissions[command].some(roleId => userRoles.includes(roleId));
    }
    if (!allowed) {
        const adminRoleId = getGuildConfig(interaction.guildId).adminRoleId;
        if (adminRoleId && userRoles.includes(adminRoleId)) {
            allowed = true; // Admins can always run commands
        }
    }
    return allowed;
}