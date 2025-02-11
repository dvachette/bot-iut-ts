

import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { funcs } from "./commands";
import { emitters } from "./commands"
import cron from "node-cron"
import { error } from "console";


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessages, 
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", async () => {
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


//============================================


const downloadAllICS = funcs.downloadAllICS

emitters.downloadICSErrorEmitter.on('error', (code, msg) => {
  console.log("ADE est en PLS");
});

cron.schedule('0 */2 * * *', () => {
    downloadAllICS();
});


downloadAllICS();

console.log("Timetables will be downloaded every 2 hours")


export { client };
