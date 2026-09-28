// web/backend/src/services/discord.ts
import { REST } from "@discordjs/rest";
import {
    Routes,
    ChannelType,
    type RESTGetAPIGuildChannelsResult,
    type RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";
import { config } from "@/config";

const rest: REST = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export interface ChannelOption {
    readonly id: string;
    readonly label: string;
}

export interface RoleOption {
    readonly id: string;
    readonly name: string;
}

export async function fetchChannelOptions(guildId: string): Promise<ChannelOption[]> {
    const channels = (await rest.get(Routes.guildChannels(guildId))) as RESTGetAPIGuildChannelsResult;
    const categoryNames = new Map<string, string>();
    for (const channel of channels) {
        if (channel.type === ChannelType.GuildCategory) {
            categoryNames.set(channel.id, channel.name);
        }
    }

    return channels
        .filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
        .map((c) => {
            const category: string | undefined = c.parent_id ? categoryNames.get(c.parent_id) : undefined;
            return { id: c.id, label: category ? `${category} > ${c.name}` : c.name };
        });
}

export async function fetchRoleOptions(guildId: string): Promise<RoleOption[]> {
    const roles = (await rest.get(Routes.guildRoles(guildId))) as RESTGetAPIGuildRolesResult;
    return roles.map((r) => ({ id: r.id, name: r.name }));
}