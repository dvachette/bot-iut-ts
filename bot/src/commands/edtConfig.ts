import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    type CacheType,
} from "discord.js";
import YAML from "yaml";
import { logger } from "../logger";
import { getGuildDataPath } from "../util/guildData";
import fs from "fs";

interface EdtGroupEntry {
    readonly role: string;
    readonly channel: string;
    readonly edturl: string;
}

interface EdtConfig {
    readonly groups: Record<string, EdtGroupEntry>;
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

function validateEdtConfig(raw: unknown, interaction: ChatInputCommandInteraction<CacheType>): string | null {
    if (typeof raw !== "object" || raw === null || !("groups" in raw)) {
        return "Le fichier doit contenir une clé racine `groups`.";
    }

    const groups = (raw as { groups: unknown }).groups;
    if (typeof groups !== "object" || groups === null) {
        return "`groups` doit être un objet.";
    }

    const guild = interaction.guild;
    if (!guild) {
        return "Commande utilisable uniquement sur un serveur.";
    }

    for (const [name, entry] of Object.entries(groups as Record<string, unknown>)) {
        if (typeof entry !== "object" || entry === null) {
            return `Le groupe "${name}" est invalide.`;
        }
        const { role, channel, edturl } = entry as Record<string, unknown>;

        if (typeof role !== "string" || role.length === 0) {
            return `Le groupe "${name}" : champ "role" manquant ou invalide.`;
        }
        if (typeof channel !== "string" || channel.length === 0) {
            return `Le groupe "${name}" : champ "channel" manquant ou invalide.`;
        }
        if (typeof edturl !== "string" || edturl.length === 0) {
            return `Le groupe "${name}" : champ "edturl" manquant ou invalide.`;
        }

        if (!guild.roles.cache.has(role)) {
            return `Le groupe "${name}" référence un rôle introuvable sur ce serveur : ${role}.`;
        }
        if (!guild.channels.cache.has(channel)) {
            return `Le groupe "${name}" référence un salon introuvable sur ce serveur : ${channel}.`;
        }
    }

    return null;
}

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

    const validationError = validateEdtConfig(parsed, interaction);
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