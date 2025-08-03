import { send } from "./send";
import { config } from "../config";
import { getGroups } from "./getGroups";
import fs from 'fs';
import * as ical from "node-ical";

export function send_timetables_daily() {
    const groups = getGroups(config.CONF_YAML_PATH);
    for (const group in groups) {
        const groupData = groups[group];
        if (groupData.channel) {
            const message = createMessageFromGroup(group, "tomorrow");
            console.log(`Sending message to channel ${groupData.channel} for group ${group}`);
            send(groupData.channel, message);
        } else {
            console.error(`No channel found for group: ${group}`);
        }
    }
}

export function send_timetables_week() {
    const groups = getGroups(config.CONF_YAML_PATH);
    for (const group in groups) {
        const groupData = groups[group];
        if (groupData.channel) {
            const message = createMessageFromGroup(group, "week");
            console.log(`Sending message to channel ${groupData.channel} for group ${group}`);
            send(groupData.channel, message);
        } else {
            console.error(`No channel found for group: ${group}`);
        }
    }
}

function createMessageFromGroup(group : string, range : string) {

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
        return "Aucun événement trouvé pour le groupe " + group + " pour demain.\n(Si vous pensez que c'est une erreur, contactez les développeurs.)";
    }
    return message;
}   

function eventToString(event : ical.VEvent) {
    return `**${event.summary}** : ${event.description.replace(/\s+/g, " ")} -> ${event.start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} en __${event.location}__\n`;
}

