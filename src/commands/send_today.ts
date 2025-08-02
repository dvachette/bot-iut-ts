import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { send_timetables_daily } from "./daily_task";   
import { downloadTomorrowICS } from "./downloadIcs";
export const data = new SlashCommandBuilder()
    .setName("send_today")
    .setDescription("send_today");

export async function execute(interaction: CommandInteraction) {

    await interaction.deferReply();  // Informe Discord que la réponse viendra plus tard

    try {
        await downloadTomorrowICS();
        send_timetables_daily();
        await interaction.editReply("✅ Terminé.");
    } catch (err) {
        await interaction.editReply("❌ Erreur.");
        console.error(err);
    }
}
