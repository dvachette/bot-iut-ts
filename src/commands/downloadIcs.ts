import fs from 'fs';
import https from 'https';
import { config } from '../config';
import { getGroups } from './getGroups';
import { dateStart, dateEnd } from './dateSet';
import { EventEmitter } from "events";

class ErrorEmitter extends EventEmitter {}

export const downloadICSErrorEmitter = new ErrorEmitter();


export function downloadICS(url: string, destination: string) {
    console.log(`working directory: ${process.cwd()}`);
    const file = fs.createWriteStream(destination);

    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Erreur: ${response.statusCode} - ${response.statusMessage}`);
            downloadICSErrorEmitter.emit('error', response.statusCode, response.statusMessage);
            return;
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
        });
    }).on('error', (err) => {
        console.error(`Erreur de téléchargement : ${err.message}`);
    });
}

export function downloadAllICS() {
    console.log("downloadAllICS");
    const groups = getGroups(config.CONF_YAML_PATH);
    ["today", "tomorrow"].forEach(range => {
        for (const group in groups) {
            const link = groups[group].edturl.toString()
                .replace("START", dateStart(range).toISOString().slice(0, 10))
                .replace("END", dateEnd(range).toISOString().slice(0, 10));
            console.log(`[GET] Timetable for group ${group} at ${link} for ${range}`);
            console.log(`path: src/calendars/${range}/${group}.ics`);
            downloadICS(link, `src/calendars/${range}/${group}.ics`);
        }
    });
}