import { CommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver, Guild, GuildMember } from "discord.js";
import { getRolesId, composeGroup, getRoleId } from "./getGroups";
import { config } from "../config";
import { string } from "yaml/dist/schema/common/string";


export const data = new SlashCommandBuilder()
    .setName("group")
    .setDescription("Select a group to join")
    .addStringOption(option =>
        option.setName("group")
            .setDescription("The group to display the timetable of.")
            .setRequired(true)
            .addChoices(
                { name : "g1", value : "g1" },
                { name : "g2", value : "g2" },
                { name : "g3", value : "g3" },
                { name : "g4", value : "g4" },
                { name : "g5", value : "g5" },
                { name : "but3aged", value : "but3aged" },
                { name : "g3a2", value : "g3a2" },
                { name : "but3dacs", value : "but3dacs" },
                { name : "aspe", value : "aspe" },
                { name : "lpdevops", value : "lpdevops" },
                { name : "lpessir", value : "lpessir" },
                { name : "ra1", value : "but3ra1" },
                { name : "ra2", value : "but3ra2" },
                { name : "ra3", value : "but3ra3" },
            )
    )
    .addStringOption(option =>
        option.setName("semester")
            .setDescription("The semester to display the timetable of.")
            .setRequired(false)
            .addChoices(
                { name : "s1", value : "s1" },
                { name : "s2", value : "s2" },
                { name : "s3", value : "s3" },
                { name : "s4", value : "s4" },
            )
    )
    .addStringOption(option =>
        option.setName("sub_group")
            .setDescription("The sub group to display the timetable of.")
            .setRequired(false)
            .addChoices(
                { name : "a", value : "a" },
                { name : "b", value : "b" }
            )
    );

export async function execute(interaction: CommandInteraction) {
    const options = interaction.options as CommandInteractionOptionResolver;

    const group = options.getString("group") || "";
    const semester = options.getString("semester") || "";
    const sub_group = options.getString("sub_group") || "";

    const composedGroup = composeGroup(group, semester, sub_group);

    if (composedGroup === "noGroup") {
        await interaction.reply("This group is not recognized.\nPlease contact the administrator if you think this is an error.");
        return;
    }

    // get the command sender
    const member = interaction.member as GuildMember;
    if (member === null) {
        await interaction.reply("An error occured while trying to get your member information.");
        return;
    }
    const user = member.user;
    if (user === null) {
        await interaction.reply("An error occured while trying to get your user information.");
        return;
    }
    // get the guild
    const guild = interaction.guild;
    if (guild === null) {
        await interaction.reply("An error occured while trying to get your guild information.");
        return;
    }
    // get the roles
    const memberRoles = member.roles;
    if (memberRoles === null) {
        await interaction.reply("An error occured while trying to get your roles information.");
        return;
    }

    console.log(`User ${user.username}#${user.discriminator} have roles:`);
    memberRoles.cache.forEach(role => {
        console.log(role.name);
    });

    // get the role id list from the config file group -> group.role 
    const roles = getRolesId(config.CONF_YAML_PATH);

    const targetRoleID = getRoleId(composedGroup, config.CONF_YAML_PATH);


    // if the user is already in a group described in the config file, remove him from it
    roles.forEach(role => {
        if (memberRoles.cache.has(role.valueOf())) {
            console.log(`Removing role ${role} as ${memberRoles.cache.get(role.valueOf())?.name}`);
            member.roles.remove(role.valueOf());
        }
    });

    console.log(`targeted role : ${targetRoleID}`)
    member.roles.add(targetRoleID);
    


    await interaction.reply(`You have selected the group ${composedGroup}.`);
    return;


}