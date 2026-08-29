import fs from 'fs';
import https from 'https';
import { config } from '../config';
import { getGroups } from './getGroups';
import { getRangeStart, getRangeEnd, type TimetableRange } from './dateSet';
import { logger } from '../logger';

export function downloadICS(url: string, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);
        logger.info(`Downloading ICS file from ${url} to ${destination}`);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(destination, () => { });
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
                fs.unlink(destination, () => { });
                reject(err);
            });
        }).on('error', (err) => {
            logger.error(`Error downloading file from ${url}: ${err.message}`);
            file.close();
            fs.unlink(destination, () => { });
            reject(err);
        });
    });
}

export function directoryForRange(range: TimetableRange, reference: Date): string {
    const isoDate = reference.toISOString().slice(0, 10);
    return `src/calendars/adhoc/${range}-${isoDate}`;
}

export async function downloadRangeICS(range: TimetableRange, reference: Date): Promise<string> {
    const groups = getGroups(config.CONF_YAML_PATH);
    const dir = directoryForRange(range, reference);

    logger.info(`Downloading ICS files for ${range} (${reference.toISOString().slice(0, 10)}) for groups: ${Object.keys(groups).join(', ')}`);

    if (!fs.existsSync(dir)) {
        logger.info(`Creating directory ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
    }

    const start = getRangeStart(range, reference);
    const end = getRangeEnd(range, reference);

    for (const group in groups) {
        const link = groups[group].edturl.toString()
            .replace("START", start.toISOString().slice(0, 10))
            .replace("END", end.toISOString().slice(0, 10));

        const dest = `${dir}/${group}.ics`;

        try {
            await downloadICS(link, dest);
            logger.info(`ICS file for ${group} downloaded successfully.`);
        } catch (err) {
            logger.error(`Échec du téléchargement pour ${group} :`, err);
        }
    }

    return dir;
}

export function cleanupRangeDir(dir: string): void {
    fs.rm(dir, { recursive: true, force: true }, (err) => {
        if (err) {
            logger.error(`Failed to clean up directory ${dir}: ${err.message}`);
        } else {
            logger.info(`Cleaned up directory ${dir}`);
        }
    });
}