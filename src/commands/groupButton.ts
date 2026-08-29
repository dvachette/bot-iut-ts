import {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
} from "discord.js";
import { getGroups } from "../util/getGroups";
import { config } from "../config";

export const data = new SlashCommandBuilder()
    .setName("select_group")
    .setDescription("Poste le sélecteur de groupe permanent dans ce salon");

export async function execute(interaction: ChatInputCommandInteraction) {
    const groups = Object.keys(getGroups(config.CONF_YAML_PATH)).filter(g => !g.endsWith("b"));

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