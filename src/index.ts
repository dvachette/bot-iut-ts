
import { logger } from "./logger";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import cron from "node-cron"
import { canRunCommand } from "./util/perm";
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
    logger.info("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
    logger.info(`Deployed commands to guild: ${guild.name}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return
    };

    const { commandName } = interaction;
    logger.info(`Received command: ${commandName} from user: ${interaction.user.id}`);
    if (commands[commandName as keyof typeof commands]) {
        if (!interaction.guild) {
            logger.info(`Command ${commandName} used in DM by user: ${interaction.user.id}, aborting.`);
            return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
        }
        if (interaction.guild.id !== config.GUILD_ID) {
            logger.info(`Command ${commandName} used in unauthorized server: ${interaction.guild.id} by user: ${interaction.user.id}, aborting.`);
            return interaction.reply({ content: "This command is not available in this server.", ephemeral: true });
        }
        if (!canRunCommand(interaction)) {
            logger.info(`User ${interaction.user.id} does not have permission to use command: ${commandName}, aborting.`);
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }
        await commands[commandName as keyof typeof commands].execute(interaction);
    } else {
        logger.info(`Command ${commandName} not found.`);
        await interaction.reply({ content: "Unknown command", ephemeral: true });
    }
});

client.login(config.DISCORD_TOKEN);

cron.schedule('00 18 * * 0-4', async () => {
    await downloadTomorrowICS();
    send_timetables_daily();
});

cron.schedule('50 17 * * 0', async () => {
    await downloadWeekICS();
    send_timetables_week();
});


export { client };
