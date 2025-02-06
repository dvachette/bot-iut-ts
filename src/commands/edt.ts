import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { dateStart, dateEnd } from "./dateSet";
import { composeGroup, getGroups } from "./getGroups";
import fs from 'fs';
import { send } from "./send";
import { config } from "../config";
import { downloadICS } from "./downloadIcs";
import * as ical from "node-ical"
export const data = new SlashCommandBuilder()
  .setName("edt")
  .setDescription("Send the timetable of the specified range and group: today(default); tomorrow; week; nextweek;")
  .addStringOption(option =>
    option.setName("destination")
      .setDescription("The destination channel to send the timetable to.")
      .setRequired(true)
      .addChoices(
        { name : "here", value : "here" },
        { name : "to group timetable channel", value : "toGroupChannel" }
      )
    )
  .addStringOption(option =>
    option.setName("range")
      .setDescription("The range of the timetable to display.")
      .setRequired(false)
      .addChoices(
        { name: "Today", value: "today" },
        { name: "Tomorrow", value: "tomorrow" },
        { name: "This week", value: "week" },
        { name: "Next week", value: "nextweek" }
      )
    )
  .addStringOption(option =>
    option.setName("group")
      .setDescription("The group to display the timetable of.")
      .setRequired(false)
      .addChoices(
        { name : "g1", value : "g1" },
        { name : "g2", value : "g2" },
        { name : "g3", value : "g3" },
        { name : "g4", value : "g4" },
        { name : "g5", value : "g5" },
        { name : "aged", value : "but3aged" },
        { name : "dacs", value : "but3dacs" },
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
  const range = interaction.options.getString("range") || "today";
  const group = interaction.options.getString("group") || null;
  const semester = interaction.options.getString("semester") || null;
  const sub_group = interaction.options.getString("sub_group") || null;

  const group_composed = composeGroup(group, semester, sub_group);

  console.log(`Range: ${range}, Group: ${group}, Semester: ${semester}, Sub-group: ${sub_group}`);
  
  var date_start = dateStart(range);
  var date_end = dateEnd(range);

  if (group_composed === "noGroup") {
    await interaction.reply("Either no group was specified or the group was not found.");
    return;
  }

  // Download the timetable :
  
  // Get the link of the timetable and setup it with start and end dates
  let link = getGroups(config.CONF_YAML_PATH.valueOf())[group_composed].edturl.toString()
  .replace("START", date_start?.toISOString().slice(0, 10))
  .replace("END", date_end?.toISOString().slice(0, 10));

  console.log(`[GET] timetable for group ${group_composed} at ${link}`);
  
  // Download the timetable as ICS file
  downloadICS(link, "src/temp/temp.ics");

  // parse the timetable to get the events
  var calendarFile = fs.readFileSync("src/temp/temp.ics", 'utf8');
  var data = ical.parseICS(calendarFile);
  console.log(data);
  // send the timetable to the destination


  await interaction.reply("EDT!"+date_start?.toString()+"to"+date_end?.toString()+"for"+group_composed);
}


