import { CommandInteraction, Channel, TextChannel} from "discord.js";
import { client } from "../index";
import { getGroups } from "./getGroups";
import { config } from "../config";
import fs from 'fs';
export function send(channel : String, message : String) {
    const _channel = client.channels.cache.get(channel.toString()) as TextChannel;
    _channel.send(message.valueOf());
}


