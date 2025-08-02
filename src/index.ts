

import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { emitters } from "./commands"
import cron from "node-cron"
import { error } from "console";
import { send } from "./commands/send";
import { send_timetables_daily } from "./commands/daily_task";
import { downloadTomorrowICS, downloadWeekICS } from "./commands/downloadIcs";


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.GuildMembers
    ]
});

client.once("ready", async () => {
    await deployCommands({ guildId: config.GUILD_ID });
    console.log("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
    console.log(`Deployed commands to guild: ${guild.name}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
    }
});

client.login(config.DISCORD_TOKEN);

emitters.downloadICSErrorEmitter.on('error', (code, msg) => {
    console.log("ADE est en PLS");
});

cron.schedule('00 18 * * *', async () => {
    await downloadTomorrowICS();
    send_timetables_daily();
});

cron.schedule('50 17 * * 0', async () => {
    await downloadWeekICS();
    send_timetables_daily();
});


export { client };
