import { CommandInteractionOptionResolver, CommandInteraction, SlashCommandBuilder } from "discord.js";
import * as fs from "fs";

import { config } from "../config";
import { send } from "./send";

interface BroadcastGroup {
    [groupName: string]: string[];
}

function readGroups(): BroadcastGroup {
    return JSON.parse(fs.readFileSync(config.GROUPS_FILE, "utf-8"));
}

function writeGroups(groups: BroadcastGroup): void {
    fs.writeFileSync(config.GROUPS_FILE, JSON.stringify(groups, null, 4));
}
/*
        /broadcast send <group> <message> - Send a message to all channels in a group
        /broadcast create <group> - Create a new broadcast group
        /broadcast delete <group> - Delete a broadcast group
        /broadcast list - List all broadcast groups
        /broadcast list <group> - List all channels in a specific broadcast group
        /broadcast add <group> <channel_id> - Add a channel to a broadcast group
        /broadcast remove <group> <channel_id> - Remove a channel from a broadcast group
        /broadcast help - Show this help message
        /broadcast - Show this help message
*/

export const data = new SlashCommandBuilder()
    .setName("broadcast")
    .setDescription("Broadcast a message to a specific group of channels.")
    .addStringOption(option =>
        option.setName("action")
            .setDescription("L'action à réaliser")
            .setRequired(true)
            .addChoices(
                { name : "send", value : "send" },
                { name : "create", value : "create" },
                { name : "list", value : "list" },
                { name : "add", value : "add" },
                { name : "remove", value : "remove" },
                { name : "delete", value : "delete" },
                { name : "help", value : "help" }
            )
    )
    .addStringOption(option =>
        option.setName("group")
            .setDescription("Le groupe visé")
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName("message")
            .setDescription("Le message à envoyer")
            .setRequired(false)
    )
    .addChannelOption(option =>
        option.setName("channel")
            .setDescription("Le channel à ajouter ou supprimer")
            .setRequired(false)
    );


export async function execute(interaction: CommandInteraction) {
    const options = interaction.options as CommandInteractionOptionResolver;

    const action = options.getString("action");
    const group = options.getString("group");
    const message = options.getString("message");
    const channel = options.getChannel("channel");


    if (!action) {  
        return interaction.reply({ content: "Veuillez spécifier une action.", ephemeral: true });
    }

    let groups: BroadcastGroup;
    
    try {
        groups = readGroups();
    } catch (error) {
        return interaction.reply("Erreur lors de la lecture des groupes. Veuillez réessayer plus tard.");
    }

    switch (action) {
        case "send":
            if (!group || !message) {
                return interaction.reply("Veuillez spécifier un groupe et un message.");
            }
            if (!groups[group]) {
                return interaction.reply(`Le groupe "${group}" n'existe pas.`);
            }
            const channels = groups[group];
            if (channels.length === 0) {
                return interaction.reply(`Le groupe "${group}" ne contient aucun channel.`);
            }
            for (const channelId of channels) {
                send(channelId, message)
            }
            return interaction.reply(`Message envoyé à tous les channels du groupe "${group}".`);
            break
        case "create":
            if (!group) {
                return interaction.reply("Veuillez spécifier un nom de groupe.");
            }
            if (groups[group]) {
                return interaction.reply(`Le groupe "${group}" existe déjà.`);
            }
            groups[group] = [];
            try {
                writeGroups(groups);
            } catch (error) {
                return interaction.reply("Erreur lors de la création du groupe. Veuillez réessayer plus tard.");
            }
            return interaction.reply(`Groupe "${group}" créé avec succès.`);
        case "list":
            if (group) {
                if (!groups[group]) {
                    return interaction.reply(`Le groupe "${group}" n'existe pas.`);
                }
                return interaction.reply(`Channels dans le groupe "${group}":\n - ${groups[group].join("\n - ")}`);
            }
            const groupList = Object.keys(groups).length ? Object.keys(groups).join(", ") : "Aucun groupe disponible.";
            return interaction.reply(`Groupes disponibles : ${groupList}`);
        case "add":
            if (!group || !channel) {
                return interaction.reply("Veuillez spécifier un groupe et un channel.");
            }
            if (!groups[group]) {
                return interaction.reply(`Le groupe "${group}" n'existe pas.`);
            }
            if (groups[group].includes(channel.id)) {
                return interaction.reply(`Le channel ${channel.name} est déjà dans le groupe "${group}".`);
            }
            groups[group].push(channel.id);
            try {
                writeGroups(groups);
            } catch (error) {
                return interaction.reply("Erreur lors de l'ajout du channel. Veuillez réessayer plus tard.");
            }
            return interaction.reply(`Channel ${channel.name} ajouté au groupe "${group}".`);
        case "remove":
            if (!group || !channel) {
                return interaction.reply("Veuillez spécifier un groupe et un channel.");
            }
            if (!groups[group]) {
                return interaction.reply(`Le groupe "${group}" n'existe pas.`);
            }
            const index = groups[group].indexOf(channel.id);
            if (index === -1) {
                return interaction.reply(`Le channel ${channel.name} n'est pas dans le groupe "${group}".`);
            }
            groups[group].splice(index, 1);
            try {
                writeGroups(groups);
            } catch (error) {
                return interaction.reply("Erreur lors de la suppression du channel. Veuillez réessayer plus tard.");
            }
            return interaction.reply(`Channel ${channel.name} supprimé du groupe "${group}".`);
        case "delete":
            if (!group) {
                return interaction.reply("Veuillez spécifier un groupe à supprimer.");
            }
            if (!groups[group]) {
                return interaction.reply(`Le groupe "${group}" n'existe pas.`);
            }
            delete groups[group];
            try {
                writeGroups(groups);
            } catch (error) {
                return interaction.reply("Erreur lors de la suppression du groupe. Veuillez réessayer plus tard.");
            }
            return interaction.reply(`Groupe "${group}" supprimé avec succès.`);
            break;
        case "help":
        default:
            return interaction.reply("Aide pour la commande broadcast : ```\n\
        /broadcast send <group> <message> - Send a message to all channels in a group\n\
        /broadcast create <group> - Create a new broadcast group\n\
        /broadcast delete <group> - Delete a broadcast group\n\
        /broadcast list - List all broadcast groups\n\
        /broadcast list <group> - List all channels in a specific broadcast group\n\
        /broadcast add <group> <channel> - Add a channel to a broadcast group\n\
        /broadcast remove <group> <channel> - Remove a channel from a broadcast group\n\
        /broadcast help - Show this help message\n\
        /broadcast - Show this help message\n\
        ```");
    }
}


