import { ChatInputCommandInteraction, SlashCommandBuilder, type CacheType } from "discord.js";
import { sendTimetables } from "../util/daily_task";
import { parseIsoDate } from "../util/dateSet";

export const data = new SlashCommandBuilder()
    .setName("send_edt_day")
    .setDescription("Envoie l'emploi du temps d'un jour donné (par défaut : demain)")
    .addStringOption((opt) =>
        opt
            .setName("date")
            .setDescription("Date au format YYYY-MM-DD (par défaut : demain)")
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
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
        reference = new Date();
        reference.setDate(reference.getDate() + 1);
    }

    try {
        await sendTimetables("day", reference);
        await interaction.editReply("✅ Terminé.");
    } catch (err) {
        await interaction.editReply("❌ Erreur.");
        console.error(err);
    }
}