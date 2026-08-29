import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { sendTimetables } from "../util/daily_task";
import { parseIsoDate, nextMonday } from "../util/dateSet";

export const data = new SlashCommandBuilder()
    .setName("send_edt_week")
    .setDescription("Envoie l'emploi du temps de la semaine contenant une date donnée (par défaut : semaine prochaine)")
    .addStringOption((opt) =>
        opt
            .setName("date")
            .setDescription("Date au format YYYY-MM-DD, dans la semaine visée (par défaut : semaine prochaine)")
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const dateOption = interaction.options.getString("date");
    let reference: Date;

    if (dateOption !== null) {
        const parsed = parseIsoDate(dateOption);
        if (parsed === null) {
            await interaction.editReply("❌ Date invalide. Format attendu : YYYY-MM-DD.");
            return;
        }
        reference = parsed;
    } else {
        reference = nextMonday(new Date());
    }

    try {
        await sendTimetables("week", reference);
        await interaction.editReply("✅ Terminé.");
    } catch (err) {
        await interaction.editReply("❌ Erreur.");
        console.error(err);
    }
}