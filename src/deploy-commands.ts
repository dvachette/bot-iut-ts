

import { REST, Routes, Snowflake, RESTGetAPIApplicationCommandsResult } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {

  // unregister all commands before registering them again to ensure a clean state
  try {
    // Get the current commands

    const currentCommands = await rest.get(
      Routes.applicationCommands(config.DISCORD_CLIENT_ID)
    ) as RESTGetAPIApplicationCommandsResult;
    
    // Remove each command individually
    if (Array.isArray(currentCommands)) {
      await Promise.all(
        currentCommands.map((cmd) => {
          rest.delete(
            Routes.applicationCommand(config.DISCORD_CLIENT_ID, cmd.id)
          )}
        )
      );
    }

  } catch (error) {
    console.error("Error while unregistering commands:", error);
  }



  try {
    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
      {
        body: commandsData,
      }
    );

  } catch (error) {
    console.error(error);
  }
}


