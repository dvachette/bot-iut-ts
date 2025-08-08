import { ChatInputCommandInteraction, GuildMember} from "discord.js";
import { config } from "../config";
import * as fs from "fs";
export interface PermissionGroup {
    [command: string]: string[];
}

export function getPermissions(): PermissionGroup {
    return JSON.parse(fs.readFileSync(config.PERMISSIONS_FILE, "utf-8"));
}

export function savePermissions(permissions: PermissionGroup): void {
    fs.writeFileSync(config.PERMISSIONS_FILE, JSON.stringify(permissions, null, 4));
}

export function canRunCommand(interaction : ChatInputCommandInteraction): boolean {
    const permissions = getPermissions();
    const command = interaction.commandName;
    const member = interaction.member;
    if (!member || !member.roles || member instanceof GuildMember === false) {
        return false; // No roles available, cannot check permissions
    }
    const userRoles = member.roles.cache.map(role => role.id) || [];
    let allowed = false;
    if (permissions[command]) {
        
        allowed = permissions[command].some(roleId => userRoles.includes(roleId));
    }
    if (!allowed) {
        const adminRoleId = config.ADMIN_ROLE_ID;
        if (adminRoleId && userRoles.includes(adminRoleId)) {
            allowed = true; // Admins can always run commands
        }
    }
    return allowed;
}