import {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
} from "discord.js";
import { getEdtGroups } from "../util/getGroups";
import { config } from "../config";

export const data = new SlashCommandBuilder()
    .setName("select_group")
    .setDescription("Poste le sélecteur de groupe permanent dans ce salon");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        return interaction.reply({ content: "Vous n'etes pas sur un serveur.", flags: ["Ephemeral"] })
    }
    const guildId = interaction.guildId;

    const groups = Object.keys(getEdtGroups(guildId)).filter(g => !g.endsWith("b"));

    const groupSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("groupSelectMenu")
        .setPlaceholder("Select a group")
        .addOptions(
            groups.map(group => new StringSelectMenuOptionBuilder()
                .setLabel(group.endsWith("a") ? group.slice(0, -1) : group)
                .setValue(group)
            )
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(groupSelectMenu);

    await interaction.reply({ content: "Veuillez sélectionner votre groupe :", components: [row] });
}