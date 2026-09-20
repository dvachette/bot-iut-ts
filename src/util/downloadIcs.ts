import fs from 'fs';
import https from 'https';
import { config } from '../config';
import { getEdtGroups } from './getGroups';
import { getRangeStart, getRangeEnd, type TimetableRange } from './dateSet';
import { logger } from '../logger';
import { getGuildDataPath } from './guildData';
import { client } from '..';

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

export function directoryForRange(range: TimetableRange, reference: Date, guildId: string): string {
    const isoDate = reference.toISOString().slice(0, 10);
    return `edt/adhoc/${guildId}/${range}-${isoDate}`;
}


// downloadIcs.ts
export async function downloadAllRangeIcs(
    range: TimetableRange,
    reference: Date,
): Promise<{ guildId: string; dir: string }[]> {
    return await Promise.all(
        client.guilds.cache.map(async (guild) => ({
            guildId: guild.id,
            dir: await downloadRangeICS(range, reference, guild.id),
        })),
    );
}

export async function downloadRangeICS(range: TimetableRange, reference: Date, guildId: string): Promise<string> {
    const groups = getEdtGroups(guildId);
    const dir = directoryForRange(range, reference, guildId);

    logger.info(`Downloading ICS files for ${range} (${reference.toISOString().slice(0, 10)}) for guild ${guildId} for groups: ${Object.keys(groups).join(', ')}`);

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