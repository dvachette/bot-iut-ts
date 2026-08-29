import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    AttachmentBuilder,
    type ChatInputCommandInteraction,
    type CacheType,
} from 'discord.js';
import { SelectorSyntaxError, parseSelector } from '../util/roleParser';
import { UnknownRoleError, applyRoleSelector, type RoleAction } from '../util/roleManager';

export const data = new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Applique un rôle à un ensemble de membres défini par un sélecteur booléen')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
        sub
            .setName('add')
            .setDescription('Ajoute un rôle aux membres correspondant au sélecteur')
            .addRoleOption((opt) => opt.setName('role').setDescription('Rôle à ajouter').setRequired(true))
            .addStringOption((opt) =>
                opt
                    .setName('target')
                    .setDescription('Sélecteur booléen, ex: @grp1 && @grp2 || !@grp3')
                    .setRequired(true),
            ),
    )
    .addSubcommand((sub) =>
        sub
            .setName('remove')
            .setDescription('Retire un rôle aux membres correspondant au sélecteur')
            .addRoleOption((opt) => opt.setName('role').setDescription('Rôle à retirer').setRequired(true))
            .addStringOption((opt) =>
                opt
                    .setName('target')
                    .setDescription('Sélecteur booléen, ex: @grp1 && @grp2 || !@grp3')
                    .setRequired(true),
            ),
    );

function parseRoleAction(raw: string): RoleAction {
    if (raw === 'add' || raw === 'remove') {
        return raw;
    }
    throw new Error(`Sous-commande inattendue : ${raw}`);
}

export async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (interaction.guild === null) {
        await interaction.reply({ content: 'Commande utilisable uniquement sur un serveur.', ephemeral: true });
        return;
    }

    const action = parseRoleAction(interaction.options.getSubcommand(true));
    const targetRole = interaction.options.getRole('role', true);
    const selectorInput = interaction.options.getString('target', true);

    try {
        parseSelector(selectorInput);
    } catch (error) {
        if (error instanceof SelectorSyntaxError) {
            await interaction.reply({ content: `Sélecteur invalide : ${error.message}`, ephemeral: true });
            return;
        }
        throw error;
    }

    await interaction.deferReply();

    try {
        const guildRole = interaction.guild.roles.cache.get(targetRole.id);
        if (guildRole === undefined) {
            await interaction.editReply(`Rôle cible introuvable sur le serveur : ${targetRole.id}`);
            return;
        }

        const result = await applyRoleSelector(interaction.guild, action, guildRole, selectorInput);

        const summary = [
            `Membres correspondant au sélecteur : ${result.matchedCount}`,
            `Modifications réussies : ${result.succeededCount}`,
            result.failures.length > 0 ? `Échecs : ${result.failures.length} (détail en pièce jointe)` : 'Échecs : 0',
        ].join('\n');

        if (result.failures.length === 0) {
            await interaction.editReply(summary);
            return;
        }

        const failureLines = result.failures.map(
            (failure) => `${failure.memberUsername} (${failure.memberId}) : ${failure.reason}`,
        );
        const attachment = new AttachmentBuilder(Buffer.from(failureLines.join('\n'), 'utf-8'), {
            name: 'echecs.txt',
        });

        await interaction.editReply({ content: summary, files: [attachment] });
    } catch (error) {
        if (error instanceof UnknownRoleError) {
            await interaction.editReply(`Rôle référencé dans le sélecteur introuvable : <@&${error.roleId}>`);
            return;
        }
        throw error;
    }
}