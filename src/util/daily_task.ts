import { EmbedBuilder } from "discord.js";
import { send, sendEmbed } from "./send";
import { config } from "../config";
import { getGroups } from "./getGroups";
import { downloadRangeICS, cleanupRangeDir } from "./downloadIcs";
import type { TimetableRange } from "./dateSet";
import fs from "fs";
import * as ical from "node-ical";
import { logger } from "../logger";

export async function sendTimetables(range: TimetableRange, reference: Date): Promise<void> {
    logger.info(`Sending timetables for range=${range}, reference=${reference.toISOString().slice(0, 10)}`);

    const dir = await downloadRangeICS(range, reference);

    try {
        sendAllGroups(dir, range, reference);
    } finally {
        cleanupRangeDir(dir);
    }

    logger.info(`Timetables sent for range=${range}, reference=${reference.toISOString().slice(0, 10)}`);
}

function sendAllGroups(dir: string, range: TimetableRange, reference: Date): void {
    const groups = getGroups(config.CONF_YAML_PATH);

    for (const group in groups) {
        const groupData = groups[group];

        if (!groupData.channel) {
            logger.warn(`No channel found for group ${group}. Skipping.`);
            continue;
        }

        try {
            const embeds = buildEmbedsForGroup(dir, group, range, reference);

            if (embeds === null) {
                send(groupData.channel, `Aucun calendrier trouvé pour le groupe ${group}.`);
                continue;
            }
            if (embeds.length === 0) {
                send(groupData.channel, `Aucun événement trouvé pour le groupe ${group}.`);
                continue;
            }

            for (const embed of embeds) {
                sendEmbed(groupData.channel, embed);
            }
        } catch (error) {
            logger.error(`Failed to process timetable for group ${group} (${dir}): ${error}`);
        }
    }
}

function buildEmbedsForGroup(
    dir: string,
    group: string,
    range: TimetableRange,
    reference: Date,
): EmbedBuilder[] | null {
    const filePath = `${dir}/${group}.ics`;

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const calendarFile = fs.readFileSync(filePath, "utf8");
    const data = ical.parseICS(calendarFile);

    const events = Object.values(data).filter(
        (entry): entry is ical.VEvent => entry.type === "VEVENT",
    );
    events.sort((a, b) => a.start.getTime() - b.start.getTime());

    if (events.length === 0) {
        return [];
    }

    const isoDate = reference.toISOString().slice(0, 10);
    const rangeLabel = range === "day" ? `le ${isoDate}` : `la semaine du ${isoDate}`;
    const dayFields = groupEventsByDay(events);
    const fieldChunks = chunk(dayFields, 25);

    return fieldChunks.map((fields, index) => {
        const suffix = fieldChunks.length > 1 ? ` (${index + 1}/${fieldChunks.length})` : "";
        return new EmbedBuilder()
            .setTitle(`📅 Emploi du temps pour le groupe ${group} ${rangeLabel}${suffix}`)
            .addFields(fields)
            .setColor(0x2b6cb0);
    });
}

function groupEventsByDay(
    events: readonly ical.VEvent[],
): { readonly name: string; readonly value: string }[] {
    const byDay = new Map<string, ical.VEvent[]>();

    for (const event of events) {
        const dayKey = event.start.toISOString().slice(0, 10);
        if (!byDay.has(dayKey)) {
            byDay.set(dayKey, []);
        }
        byDay.get(dayKey)!.push(event);
    }

    return Array.from(byDay.values()).map((dayEvents) => {
        const dayTs = Math.floor(dayEvents[0].start.getTime() / 1000);
        return {
            name: `<t:${dayTs}:D>`,
            value: dayEvents.map(eventToLine).join("\n\n"),
        };
    });
}

function eventToLine(event: ical.VEvent): string {
    const startTs = Math.floor(event.start.getTime() / 1000);
    const endTs = Math.floor(event.end.getTime() / 1000);

    const descriptionLines = (event.description ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .reverse();
    const description = descriptionLines.length >= 2 ? descriptionLines[1] : "";

    const location = event.location ? event.location : "Lieu inconnu";
    const summary = event.summary ?? "Sans titre";

    return `**${summary}** : ${description}\n<t:${startTs}:t> - <t:${endTs}:t> en __${location}__`;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }
    return result;
}