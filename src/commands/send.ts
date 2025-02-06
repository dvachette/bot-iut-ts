import { CommandInteraction, Channel, TextChannel} from "discord.js";
import { client } from "../index";
import { getGroups } from "./getGroups";
import { config } from "../config";
import fs from 'fs';
export function send(channel : String, group : String, T_Start : Date, T_End : Date) {
    const _channel = client.channels.cache.get(channel.toString()) as TextChannel;
    _channel.send(`Here is the timetable for ${group} from ${T_Start} to ${T_End}`);
}


