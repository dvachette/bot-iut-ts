import { TextChannel, EmbedBuilder } from "discord.js";
import { client } from "../index";
import { logger } from "../logger";

export function send(channelID: string, message: string): void {
    const channel = client.channels.cache.get(channelID) as TextChannel;
    if (!channel) {
        logger.error(`Channel with ID ${channelID} not found.`);
        return;
    }
    if (!message || message.length === 0) {
        logger.error(`Message is empty, not sending to channel ${channelID}.`);
        return;
    }

    if (message.length >= 2000) {
        const chunks = message.match(/[\s\S]{1,2000}/g);
        if (chunks) {
            for (const chunk of chunks) {
                channel.send(chunk);
            }
            logger.info(`Message sent to channel ${channelID} in ${chunks.length} parts.`);
        } else {
            logger.error(`Failed to split message for channel ${channelID}.`);
        }
        return;
    }

    channel.send(message);
    logger.info(`Message sent to channel ${channelID}: ${message}`);
}

export function sendEmbed(channelID: string, embed: EmbedBuilder): void {
    const channel = client.channels.cache.get(channelID) as TextChannel;
    if (!channel) {
        logger.error(`Channel with ID ${channelID} not found.`);
        return;
    }

    channel.send({ embeds: [embed] });
    logger.info(`Embed sent to channel ${channelID}.`);
}