import { SlashCommandBuilder, CommandInteractionOptionResolver, CommandInteraction, ChatInputCommandInteraction } from "discord.js";
import { logger } from "../logger";
import { PermissionGroup, getPermissions, savePermissions } from "../util/perm"; // Assuming this is the correct path for the interface

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

export async function execute(interaction: ChatInputCommandInteraction) {
    const options = interaction.options as CommandInteractionOptionResolver;

    const action = options.getString("action");
    const role = options.getRole("role");
    const command = options.getString("command");

    logger.info(`Received permission command: action=${action}, role=${role ? role.name : "none"}, command=${command}`);

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
                "`/permission list` pour lister les permissions.\n" +
                "`/permission listall` pour lister toutes les permissions.\n" +
                "`/permission help` pour afficher cette aide.\n" + 
                "Attention, il faut mettre le nom de la commande sans le slash, par exemple `permission` pour `/permission`.\n" + 
                "Les administrateurs peuvent toujours exécuter toutes les commandes, même sans permissions explicites.\n");
        default:
            return interaction.editReply("❗Action non reconnue.");
    }
}