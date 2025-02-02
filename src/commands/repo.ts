import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("repo")
  .setDescription("Display the url for the source code of the bot.");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("https://github.com/dvachette/bot-iut-ts");
}


