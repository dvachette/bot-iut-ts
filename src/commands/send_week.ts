import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { send_timetables_week } from "../util/daily_task";   
import { downloadWeekICS } from "../util/downloadIcs";
export const data = new SlashCommandBuilder()
    .setName("send_week")
    .setDescription("send_week");

export async function execute(interaction: CommandInteraction) {

    await interaction.deferReply();  // Informe Discord que la réponse viendra plus tard

    try {
        await downloadWeekICS();
        send_timetables_week();
        await interaction.editReply("✅ Terminé.");
    } catch (err) {
        await interaction.editReply("❌ Erreur.");
        console.error(err);
    }
}
