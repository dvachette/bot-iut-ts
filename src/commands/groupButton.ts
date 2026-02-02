import { 
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    ActionRowBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { getGroups, getRoleId, getRolesId } from "../util/getGroups";
import { config } from "../config";
import { logger } from "../logger";







export const data = new SlashCommandBuilder()
    .setName("select_group")
    .setDescription("Select your group using a button menu");


export async function execute(interraction: ChatInputCommandInteraction) {
    // Get all groups and remove sub-groups marking ('a' and 'b')
    const groups = Object.keys(getGroups(config.CONF_YAML_PATH)).filter(g => !g.endsWith("b"));
    const groupSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("groupSelectMenu")
        .setPlaceholder("Select a group")
        .addOptions(
            groups.map(group => new StringSelectMenuOptionBuilder()
                .setLabel(group.endsWith("a") ? group.slice(0, -1) : group)
                .setValue(group)
        )
    );
    const row = new ActionRowBuilder().addComponents(groupSelectMenu) as ActionRowBuilder<StringSelectMenuBuilder>;
    const response = await interraction.reply({ content: "Veuillez sélectionner votre groupe :", components: [row] , withResponse: true});
    const collectorFilter = (i: any) => i.user.id === interraction.user.id;
    const collector = await response.resource?.message?.awaitMessageComponent({ filter: collectorFilter, time: 60_000 }) as StringSelectMenuInteraction; // 1 minute to select
    if (!collector) {
        await interraction.editReply({ content: "Temps écoulé. Veuillez réessayer la commande.", components: [] });
        return;
    }

    const selectedGroup = collector.values[0];
    const selectedGroupDisplay = selectedGroup.endsWith("a") ? selectedGroup.slice(0, -1) : selectedGroup;
    await collector.update({ content: `Vous avez sélectionné le groupe : **${selectedGroupDisplay}**`, components: [] });

    // get the command sender
    const member = interraction.member as GuildMember;
    if (member === null) {
        await interraction.followUp("An error occured while trying to get your member information.");
        return;
    }
    const user = member.user;
    if (user === null) {
        await interraction.followUp("An error occured while trying to get your user information.");
        return;
    }
    // get the guild
    const guild = interraction.guild;
    if (guild === null) {
        await interraction.followUp("An error occured while trying to get your guild information.");
        return;
    }

    // get the roles
    const memberRoles = member.roles;
    if (memberRoles === null) {
        await interraction.followUp("An error occured while trying to get your roles information.");
        return;
    }

    const groupRoles = getRolesId(config.CONF_YAML_PATH);
    
    const targetRoleID = getRoleId(selectedGroup, config.CONF_YAML_PATH);
    // Check that the target role ID was found on the guild
    if (!guild.roles.cache.has(targetRoleID)) {
        await interraction.followUp("The role associated with your group was not found on this server. Please contact a developer.");
        logger.error(`Role ID ${targetRoleID} for group ${selectedGroup} not found on guild ${guild.id}`);
        return;
    }

    // if the user is already in a group described in the config file, remove him from it
    groupRoles.forEach(role => {
        if (memberRoles.cache.has(role.valueOf())) {
            member.roles.remove(role.valueOf());
        }
    });
    // Remove the 'Sans classe' role if the user has it
    const noClassRoleID = config.NO_CLASS_ROLE_ID;
    if (memberRoles.cache.has(noClassRoleID.valueOf())) {
        member.roles.remove(noClassRoleID);
    }
    console.log(`Adding role ID ${targetRoleID} to user ID ${user.id} for group ${selectedGroup}`);
    member.roles.add(targetRoleID);
    
    return;
    
    
}
    