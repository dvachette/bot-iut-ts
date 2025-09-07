import { TextChannel} from "discord.js";
import { client } from "../index";
import { logger } from "../logger";
export function send(channelID : String, message : String) {
    const channel = client.channels.cache.get(channelID.toString()) as TextChannel;
    if (!channel) {
        logger.error(`Channel with ID ${channelID} not found.`);
        return;
    }
    if (!message || message.length === 0) {
        logger.error(`Message is empty, not sending to channel ${channelID}.`);
        return;
    }
    if (message.length >= 2000) {
        // Split the message into chunks of 2000 characters
        const chunks = message.match(/.{1,2000}/g);
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
    else {
        logger.info(`Sending message to channel ${channelID}: ${message}`);
        channel.send(message.toString());
    }
    
    logger.info(`Message sent to channel ${channelID}: ${message}`);
}


