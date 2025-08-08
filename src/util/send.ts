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
    channel.send(message.toString());
    logger.info(`Message sent to channel ${channelID}: ${message}`);
}


