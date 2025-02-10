import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { downloadAllICS } from "./downloadIcs";
export const data = new SlashCommandBuilder()
    .setName("init")
    .setDescription("Download all timetables");

export async function execute(interaction: CommandInteraction) {
    downloadAllICS();
    return interaction.reply("Done !");
}


