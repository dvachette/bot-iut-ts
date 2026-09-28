import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    type CacheType,
} from "discord.js";
import YAML from "yaml";
import { logger } from "../logger";
import { getGuildDataPath } from "../util/guildData";
import fs from "fs";
import { validateEdtConfig, type EdtConfig } from "#/edtConfig";
interface EdtGroupEntry {
    readonly role: string;
    readonly channel: string;
    readonly edturl: string;
}


export const data = new SlashCommandBuilder()
    .setName("edt_config")
    .setDescription("Gère la configuration des emplois du temps")
    .addSubcommand((sub) =>
        sub
            .setName("upload")
            .setDescription("Remplace la configuration edt.yaml par un fichier fourni")
            .addAttachmentOption((opt) =>
                opt.setName("fichier").setDescription("Fichier edt.yaml").setRequired(true),
            ),
    );


export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const subcommand = interaction.options.getSubcommand(true);
    if (subcommand !== "upload") {
        await interaction.reply({ content: "Sous-commande inconnue.", ephemeral: true });
        return;
    }

    const attachment = interaction.options.getAttachment("fichier", true);

    if (!attachment.name.endsWith(".yml") && !attachment.name.endsWith(".yaml")) {
        await interaction.reply({ content: "❌ Le fichier doit avoir une extension .yml ou .yaml." });
        return;
    }

    await interaction.deferReply();

    let rawContent: string;
    try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
            await interaction.editReply(`❌ Échec du téléchargement du fichier (HTTP ${response.status}).`);
            return;
        }
        rawContent = await response.text();
    } catch (error) {
        logger.error(`Failed to fetch attachment for edt-config upload: ${error}`);
        await interaction.editReply("❌ Échec du téléchargement du fichier.");
        return;
    }

    let parsed: unknown;
    try {
        parsed = YAML.parse(rawContent);
    } catch (error) {
        await interaction.editReply(`❌ YAML invalide : ${error instanceof Error ? error.message : String(error)}`);
        return;
    }

    const guild = interaction.guild;
    if (!guild) {
        await interaction.editReply("❌ Commande utilisable uniquement sur un serveur.");
        return;
    }
    const validationError: string | null = validateEdtConfig(
        parsed,
        new Set(guild.roles.cache.keys()),
        new Set(guild.channels.cache.keys()),
    );
    if (validationError !== null) {
        await interaction.editReply(`❌ ${validationError}`);
        return;
    }

    const guildId = interaction.guildId!;
    const destPath = getGuildDataPath(guildId, "timetables");

    try {
        fs.mkdirSync(destPath.substring(0, destPath.lastIndexOf("/")), { recursive: true });
        fs.writeFileSync(destPath, rawContent, "utf-8");
    } catch (error) {
        logger.error(`Failed to write edt.yaml for guild ${guildId}: ${error}`);
        await interaction.editReply("❌ Échec de l'écriture du fichier de configuration.");
        return;
    }

    const groupCount = Object.keys((parsed as EdtConfig).groups).length;
    logger.info(`edt.yaml updated for guild ${guildId} by user ${interaction.user.id} (${groupCount} groups)`);
    await interaction.editReply(`✅ Configuration mise à jour (${groupCount} groupe(s)).`);
}