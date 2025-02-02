import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("edt")
  .setDescription("Reply with the timetable of the specified range. If no range is specified, the timetable of the current day is returned. The ranges are 'today', 'tomorrow', 'week' and 'nextweek'.");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("EDT!");
}


