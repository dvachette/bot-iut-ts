// bot/src/commands/configCommand.ts
import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    type CacheType,
} from "discord.js";
import { randomBytes } from "crypto";
import { config } from "../config";
import { logger } from "../logger";

export const data = new SlashCommandBuilder()
    .setName("config")
    .setDescription("Gère la configuration du bot sur ce serveur")
    .addSubcommand((sub) =>
        sub
            .setName("gui")
            .setDescription("Génère un lien à usage unique vers l'interface web de configuration"),
    );

export async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const subcommand = interaction.options.getSubcommand(true);
    if (subcommand !== "gui") {
        await interaction.reply({ content: "Sous-commande inconnue.", ephemeral: true });
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId!;
    const token = randomBytes(32).toString("hex");

    try {
        const response = await fetch(`${config.WEB_INTERNAL_URL}/internal/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.INTERNAL_API_SECRET}`,
            },
            body: JSON.stringify({ token, guildId }),
        });

        if (!response.ok) {
            logger.error(`Token registration failed for guild ${guildId}: HTTP ${response.status}`);
            await interaction.editReply("❌ Impossible de générer le lien (le service web a refusé la requête).");
            return;
        }
    } catch (error) {
        logger.error(`Token registration unreachable for guild ${guildId}: ${error}`);
        await interaction.editReply("❌ Impossible de joindre le service web.");
        return;
    }

    const baseUrl = config.WEB_PUBLIC_URL.replace(/\/+$/, "");
    logger.info(`Config GUI link generated for guild ${guildId} by user ${interaction.user.id}`);
    await interaction.editReply(
        `🔗 ${baseUrl}/${token}\nValable 1 heure. Une seule personne à la fois peut utiliser ce lien.`,
    );
}