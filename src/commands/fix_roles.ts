import { ChatInputCommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { getRolesId, composeGroup, getRoleId } from "../util/getGroups";
import { config } from "../config";
import { logger } from "../logger";


export const data = new SlashCommandBuilder()
    .setName("fix_roles")
    .setDescription("Fix the roles (remove) of users who have a group role and the 'Sans classe' role");
    
export async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (guild === null) {
        await interaction.reply("An error occured while trying to get your guild information.");
        return;
    }
    await interaction.deferReply();
        // get the role id list from the config file group -> group.role 
    const roles = getRolesId(config.CONF_YAML_PATH);
    const members = await guild.members.fetch();
    if (members === null) {
        await interaction.editReply("An error occured while trying to get the members of the guild.");
        return;
    }
    for (const [memberId, member] of members) {
        if (member === null) {
            logger.warn(`Member with ID ${memberId} is null, skipping.`);
            continue;
        }
        const memberRoles = member.roles;
        // if the user is already in a group described in the config file, remove him from it
        roles.forEach(role => {
            if (memberRoles.cache.has(role.valueOf())) {
                // Remove the 'Sans classe' role if the user has it
                const noClassRoleID = config.NO_CLASS_ROLE_ID;
                if (memberRoles.cache.has(noClassRoleID.valueOf())) {
                    member.roles.remove(noClassRoleID);
                }  
            }
        });
    }
    await interaction.editReply(`Done! Processed ${members.size} members.`);
    return;


}