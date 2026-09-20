
import { logger } from "./logger";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import cron from "node-cron"
import { canRunCommand } from "./util/perm";
import { sendAllTimetables, sendTimetables } from "./util/daily_task";
import { handleGroupSelect } from "./util/groupSelect";
import { generateDefaultGuildData } from "./util/guildData";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ]
});

client.once("ready", async () => {
    const guildIds = client.guilds.cache.map(guild => guild.id);
    for (const guildId of guildIds) {
        try {
            await deployCommands({ guildId });
            generateDefaultGuildData(guildId)
            logger.info(`Deployed commands to guild: ${guildId}`);
        } catch (error) {
            logger.error(`Error deploying commands to guild ${guildId}:`, error);
        }
    }
    logger.info("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
    generateDefaultGuildData(guild.id)
    logger.info(`Deployed commands to guild: ${guild.name}`);
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === "groupSelectMenu") {
        await handleGroupSelect(interaction);
        return;
    }

    if (!interaction.isChatInputCommand()) {
        return
    };

    const { commandName } = interaction;
    logger.info(`Received command: ${commandName} from user: ${interaction.user.id} in guild: ${interaction.guild?.id} (${interaction.guild?.name})`);
    if (commands[commandName as keyof typeof commands]) {
        if (!interaction.guild) {
            logger.info(`Command ${commandName} used in DM by user: ${interaction.user.id}, aborting.`);
            return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    await sendAllTimetables("day", tomorrow);
});

cron.schedule('50 17 * * 0', async () => {
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + 1);
    await sendAllTimetables("week", nextMonday);
});


export { client };
