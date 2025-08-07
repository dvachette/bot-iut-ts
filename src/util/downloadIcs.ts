import fs from 'fs';
import https from 'https';
import { config } from '../config';
import { getGroups } from './getGroups';
import { dateStart, dateEnd } from './dateSet';
import { EventEmitter } from "events";

class ErrorEmitter extends EventEmitter {}

export const downloadICSErrorEmitter = new ErrorEmitter();


export function downloadICS(url: string, destination: string) : Promise<void>  {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(destination, () => {}); // Delete the file if it was created
                return reject(new Error(`Failed to download file: ${response.statusCode}`));
            }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            resolve();
        });

        file.on('error', (err) => {
            file.close();
            fs.unlink(destination, () => {}); // Delete the file on error
            reject(err);
        });
        }).on('error', (err) => {
            fs.unlink(destination, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

export async function downloadTomorrowICS(): Promise<void> {
    const groups = getGroups(config.CONF_YAML_PATH);

    for (const group in groups) {
        const link = groups[group].edturl.toString()
            .replace("START", dateStart("tomorrow").toISOString().slice(0, 10))
            .replace("END", dateEnd("tomorrow").toISOString().slice(0, 10));

        const dest = `src/calendars/tomorrow/${group}.ics`;


        try {
            await downloadICS(link, dest);  // Attente explicite
        } catch (err) {
            console.error(`Échec du téléchargement pour ${group} :`, err);
        }
    }
}

export async function downloadWeekICS(): Promise<void> {
    const groups = getGroups(config.CONF_YAML_PATH);

    for (const group in groups) {
        const link = groups[group].edturl.toString()
            .replace("START", dateStart("nextweek").toISOString().slice(0, 10))
            .replace("END", dateEnd("nextweek").toISOString().slice(0, 10));

        const dest = `src/calendars/nextweek/${group}.ics`;


        try {
            await downloadICS(link, dest);  // Attente explicite
        } catch (err) {
            console.error(`Échec du téléchargement pour ${group} :`, err);
        }
    }
}
