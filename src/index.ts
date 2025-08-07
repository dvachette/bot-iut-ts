

import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { emitters } from "./commands"
import cron from "node-cron"
import { canRunCommand } from "./commands/perm";
import { send_timetables_daily, send_timetables_week } from "./util/daily_task";
import { downloadTomorrowICS, downloadWeekICS } from "./util/downloadIcs";


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
        if (!interaction.guild) {
            return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
        }
        if (interaction.guild.id !== config.GUILD_ID) {
            return interaction.reply({ content: "This command is not available in this server.", ephemeral: true });
        }
        if (!canRunCommand(interaction)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }
        await commands[commandName as keyof typeof commands].execute(interaction);
    } else {
        console.error(`Command ${commandName} not found.`);
        await interaction.reply({ content: "Unknown command", ephemeral: true });
    }
});

client.login(config.DISCORD_TOKEN);

emitters.downloadICSErrorEmitter.on('error', (code, msg) => {
    console.log("ADE est en PLS");
});

cron.schedule('00 18 * * 0-4', async () => {
    await downloadTomorrowICS();
    send_timetables_daily();
});

cron.schedule('50 17 * * 0', async () => {
    await downloadWeekICS();
    send_timetables_week();
});


export { client };
