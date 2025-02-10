

import { REST, Routes, Snowflake } from "discord.js";
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
    console.log("Started unregistering application (/) commands.");

    // Get the current commands

    const currentCommands = await rest.get(
      Routes.applicationCommands(config.DISCORD_CLIENT_ID as Snowflake)
    );
    console.log("Current commands", currentCommands);
    console.log(await rest.get(Routes.applicationCommands(config.DISCORD_CLIENT_ID as Snowflake)));
    
    // Remove each command individually
    if (Array.isArray(currentCommands)) {
      await Promise.all(
        currentCommands.map((cmd) =>
          
          {console.log("Deleting command", cmd.id, cmd.name);

          rest.delete(
            Routes.applicationCommand(config.DISCORD_CLIENT_ID, cmd.id)
          )}
        )
      );
    }

    console.log("Successfully unregistered application (/) commands.");
  } catch (error) {
    console.error("Error while unregistering commands:", error);
  }



  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}


