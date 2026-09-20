import { StringSelectMenuInteraction, GuildMember, MessageFlags, InteractionReplyOptions } from "discord.js";
import { getRoleId, getRolesId } from "./getGroups";
import { config } from "../config";
import { logger } from "../logger";

export async function handleGroupSelect(interaction: StringSelectMenuInteraction): Promise<void> {
    try {
        const selectedGroup = interaction.values[0];
        const selectedGroupDisplay = selectedGroup.endsWith("a") ? selectedGroup.slice(0, -1) : selectedGroup;

        const member = interaction.member as GuildMember | null;
        if (member === null) {
            await interaction.reply({ content: "Erreur : impossible de récupérer vos informations de membre.", flags: MessageFlags.Ephemeral });
            return;
        }

        const guild = interaction.guild;
        if (guild === null) {
            await interaction.reply({ content: "Erreur : impossible de récupérer les informations du serveur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const targetRoleID = getRoleId(selectedGroup, config.CONF_YAML_PATH);
        if (!guild.roles.cache.has(targetRoleID)) {
            logger.error(`Role ID ${targetRoleID} for group ${selectedGroup} not found on guild ${guild.id}`);
            await interaction.reply({ content: "Le rôle associé à votre groupe est introuvable sur ce serveur. Contactez un développeur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const memberRoles = member.roles;
        const groupRoles = getRolesId(config.CONF_YAML_PATH);

        for (const role of groupRoles) {
            if (memberRoles.cache.has(role.valueOf())) {
                await member.roles.remove(role.valueOf());
            }
        }

        const noClassRoleID = config.NO_CLASS_ROLE_ID;
        if (memberRoles.cache.has(noClassRoleID.valueOf())) {
            await member.roles.remove(noClassRoleID);
        }

        await member.roles.add(targetRoleID);
        logger.info(`Added role ID ${targetRoleID} to user ID ${member.user.id} for group ${selectedGroup}`);

        await interaction.reply({ content: `Vous avez sélectionné le groupe : **${selectedGroupDisplay}**`, flags: MessageFlags.Ephemeral });
    } catch (error) {
        logger.error(`Error handling group selection for user ${interaction.user.id}: ${error}`);

        const errorMessage: InteractionReplyOptions = { content: "❌ Une erreur est survenue lors de l'attribution de votre groupe.", flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}