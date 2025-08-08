import fs from 'fs';
import https from 'https';
import { config } from '../config';
import { getGroups } from './getGroups';
import { dateStart, dateEnd } from './dateSet';
import { EventEmitter } from "events";
import { logger } from '../logger';

export function downloadICS(url: string, destination: string) : Promise<void>  {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);
        logger.info(`Downloading ICS file from ${url} to ${destination}`);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(destination, () => {});
                logger.error(`Failed to download file at ${url}, ERROR: ${response.statusCode}`);
                return reject(new Error(`Failed to download file: ${response.statusCode}`));
            }

        response.pipe(file);

        file.on('finish', () => {
            logger.info(`ICS file downloaded successfully to ${destination}`);
            file.close();
            resolve();
        });

        file.on('error', (err) => {
            logger.error(`Error writing file to ${destination}: ${err.message}`);
            file.close();
            fs.unlink(destination, () => {}); // Delete the file on error
            reject(err);
        });
        }).on('error', (err) => {
            logger.error(`Error downloading file from ${url}: ${err.message}`);
            file.close();
            fs.unlink(destination, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

export async function downloadTomorrowICS(): Promise<void> {
    const groups = getGroups(config.CONF_YAML_PATH);
    logger.info(`Downloading ICS files for tomorrow for groups: ${Object.keys(groups).join(', ')}`);
    if (!fs.existsSync('src/calendars/tomorrow')) {
        logger.info(`Creating directory src/calendars/tomorrow`);
        fs.mkdirSync('src/calendars/tomorrow', { recursive: true });
    }
    for (const group in groups) {
        const link = groups[group].edturl.toString()
            .replace("START", dateStart("tomorrow").toISOString().slice(0, 10))
            .replace("END", dateEnd("tomorrow").toISOString().slice(0, 10));

        const dest = `src/calendars/tomorrow/${group}.ics`;


        try {
            await downloadICS(link, dest);  // Attente explicite
            logger.info(`ICS file for ${group} downloaded successfully.`);
        } catch (err) {
            logger.error(`Échec du téléchargement pour ${group} :`, err);
        }
    }
}

export async function downloadWeekICS(): Promise<void> {
    const groups = getGroups(config.CONF_YAML_PATH);
    logger.info(`Downloading ICS files for next week for groups: ${Object.keys(groups).join(', ')}`);
    if (!fs.existsSync('src/calendars/nextweek')) {
        logger.info(`Creating directory src/calendars/nextweek`);
        fs.mkdirSync('src/calendars/nextweek', { recursive: true });
    }

    for (const group in groups) {
        const link = groups[group].edturl.toString()
            .replace("START", dateStart("nextweek").toISOString().slice(0, 10))
            .replace("END", dateEnd("nextweek").toISOString().slice(0, 10));

        const dest = `src/calendars/nextweek/${group}.ics`;


        try {
            await downloadICS(link, dest);
            logger.info(`ICS file for ${group} downloaded successfully.`);
        } catch (err) {
            logger.error(`Échec du téléchargement pour ${group} :`, err);
        }
    }
}
