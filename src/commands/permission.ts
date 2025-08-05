import { SlashCommandBuilder, CommandInteractionOptionResolver, CommandInteraction } from "discord.js";
import * as fs from "fs";
import { config } from "../config";

interface PermissionGroup {
    [command: string]: string[];
}

function getPermissions(): PermissionGroup {
    return JSON.parse(fs.readFileSync(config.PERMISSIONS_FILE, "utf-8"));
}

function savePermissions(permissions: PermissionGroup): void {
    fs.writeFileSync(config.PERMISSIONS_FILE, JSON.stringify(permissions, null, 4));
}

export const data = new SlashCommandBuilder()
    .setName("permission")
    .setDescription("Gérer les permissions pour les commandes du bot.")
    .addStringOption(option =>
        option.setName("action")
            .setDescription("L'action à réaliser")
            .setRequired(true)
            .addChoices(
                { name: "grant", value: "grant" },
                { name: "revoke", value: "revoke" },
                { name: "list", value: "list" },
                { name: "help", value: "help" }
            )
    )
    .addRoleOption(option =>
        option.setName("role")
            .setDescription("Le rôle à modifier")
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName("command")
            .setDescription("La commande à laquelle appliquer l'action")
            .setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    const options = interaction.options as CommandInteractionOptionResolver;

    const action = options.getString("action");
    const role = options.getRole("role");
    const command = options.getString("command");

    if (!action) {
        return interaction.reply({ content: "Veuillez spécifier une action.", ephemeral: true });
    }
    await interaction.deferReply();
    let permissions: PermissionGroup;
    
    try {
        permissions = getPermissions();
    } catch (error) {
        return interaction.editReply("Erreur lors de la récupération des permissions.");
    }

    switch (action) {
        case "grant":
            if (!role || !command) {
                return interaction.editReply("Veuillez spécifier un rôle et une commande.");
            }
            if (!permissions[command]) {
                permissions[command] = [];
            }
            if (!permissions[command].includes(role.id)) {
                permissions[command].push(role.id);
                savePermissions(permissions);
            }
            return interaction.editReply(`Permission accordée : ${role.name} peut utiliser la commande ${command}.`);
        case "revoke":
            if (!role || !command) {
                return interaction.editReply("Veuillez spécifier un rôle et une commande.");
            }if (!permissions[command] || !permissions[command].includes(role.id)) {
                return interaction.editReply(`Le rôle ${role.name} n'a pas la permission d'utiliser la commande ${command}.`);
            }
            permissions[command] = permissions[command].filter(id => id !== role.id);
            savePermissions(permissions);
            return interaction.editReply(`Permission révoquée : ${role.name} ne peut plus utiliser la commande ${command}.`);
            
        case "list":
            if (!command) {
                return interaction.editReply("Veuillez spécifier une commande pour lister les permissions.");
            }
            if (!permissions[command]) {
                return interaction.editReply(`Aucune permission trouvée pour la commande ${command}.`);
            }
            const roles = permissions[command].map(roleId => `<@&${roleId}>`).join(", ");
            return interaction.editReply(`Rôles ayant la permission d'utiliser la commande ${command} : ${roles || "Aucun"}.`);
        case "listall":
            let response = "Permissions actuelles :\n";
            for (const cmd in permissions) {
                const roles = permissions[cmd].map(roleId => `<@&${roleId}>`).join(", ");
                response += `**${cmd}**: ${roles || "Aucun"}\n`;
            }
            return interaction.editReply( response || "Aucune permission définie.");
            
        case "help":
            return interaction.editReply("Utilisez `/permission grant <role> <command>` pour accorder une permission.\n" +
                "`/permission revoke <role> <command>` pour révoquer une permission.\n" +
                "`/permission list` pour lister les permissions.");
        default:
            return interaction.editReply("❗Action non reconnue.");
    }
}