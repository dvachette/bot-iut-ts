import { send } from "./send";
import { config } from "../config";
import { getGroups } from "./getGroups";
import fs from 'fs';
import * as ical from "node-ical";
import { logger } from "../logger";


export function send_timetables_daily() {
    logger.info("Sending daily timetables");
    const groups = getGroups(config.CONF_YAML_PATH);
    for (const group in groups) {
        const groupData = groups[group];
        if (groupData.channel) {
            const message = createMessageFromGroup(group, "tomorrow");
            if (message !== "") {
                send(groupData.channel, message);
            }
        } else {
            logger.warn(`No channel found for group ${group}. Skipping.`);
        }
    }
    logger.info("Daily timetables sent");
}

export function send_timetables_week() {
    logger.info("Sending weekly timetables");
    const groups = getGroups(config.CONF_YAML_PATH);
    for (const group in groups) {
        const groupData = groups[group];
        if (groupData.channel) {
            const message = createMessageFromGroup(group, "nextweek");
            if (message !== "") {
                send(groupData.channel, message);
            }
        } else {
            logger.warn(`No channel found for group ${group}. Skipping.`);  
        }
    }
    logger.info("Weekly timetables sent");
}

function createMessageFromGroup(group : string, range : string) {

    // parse the timetable to get the events
    if (!fs.existsSync(`src/calendars/${range}/${group}.ics`)) {
        return `Aucun calendrier trouvé pour le groupe ${group} pour ${range}.`;
    }
    // Read the calendar file
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
            ev.start.setHours(ev.start.getHours() + 1);
            ev.end.setHours(ev.end.getHours() + 1);
            if (ev.type == 'VEVENT') {
                message += eventToString(ev);
            }
        }
    }
    return message;
}   

function eventToString(event : ical.VEvent) {
    return `**${event.summary}** : ${event.description.split("\n").map(s => s.trim()).filter(Boolean).reverse()[1]} -> ${event.start.toLocaleDateString("fr-FR")} : ${event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} en __${event.location}__\n`;
}

