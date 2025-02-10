import { CommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver} from "discord.js";
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
        { name: "Tomorrow", value: "tomorrow" }
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


  const range = options.getString("range") || "today";
  const group = options.getString("group") || "";
  const semester = options.getString("semester") || "";
  const sub_group = options.getString("sub_group") || "";

  const group_composed = composeGroup(group, semester, sub_group);

  console.log(`Range: ${range}, Group: ${group}, Semester: ${semester}, Sub-group: ${sub_group}`);
  console.log(`Group composed: ${group_composed}`);

  if (group_composed === "noGroup") {
    await interaction.reply("Either no group was specified or the group was not found.");
    return;
  }

  var message = createMessageFromGroup(group_composed, range);

  await interaction.reply(`${message}`);
}

function createMessageFromGroup(group : string,range : string) {

  // parse the timetable to get the events
  var calendarFile = fs.readFileSync(`src/calendars/${range}/${group}.ics`, 'utf8');
  var data = ical.parseICS(calendarFile);
  var message : String = "";
  var events = [];
  // sort the events by date
  for (let e in data) {
    if (data.hasOwnProperty(e)) {
      let ev = data[e];
      if (ev.type == 'VEVENT') {
        events.push(ev);
      }
    }
  }

  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  console.log("Events sorted");
  console.log(events);
  // Create the message
  for (let k in events) {

    if (events.hasOwnProperty(k)) {
      let ev = events[k];
      console.log("Event");
      console.log(k);
      console.log(ev);
      if (ev.type == 'VEVENT') {
        message += eventToString(ev);
      }
    }
  }
  if (message == "") {
    return "No events found.";
  }
  return message;

}

function eventToString(event : ical.VEvent) {
  return `===========================\n**${event.summary}** ${event.description} \n ${event.start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${event.location}\n \n`;
}
