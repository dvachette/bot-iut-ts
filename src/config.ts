import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, CONF_YAML_PATH, GUILD_ID, GROUPS_FILE, PERMISSIONS_FILE, ADMIN_ROLE_ID} = process.env;

if (!DISCORD_TOKEN) {
  logger.error("DISCORD_TOKEN is not set in the environment variables");
  throw new Error("DISCORD_TOKEN is not set in the environment variables");
}
if (!DISCORD_CLIENT_ID) {
  logger.error("DISCORD_CLIENT_ID is not set in the environment variables");
  throw new Error("DISCORD_CLIENT_ID is not set in the environment variables");
}
if (!CONF_YAML_PATH) {
  logger.error("CONF_YAML_PATH is not set in the environment variables");
  throw new Error("CONF_YAML_PATH is not set in the environment variables");  
}
if (!GUILD_ID) {
  logger.error("GUILD_ID is not set in the environment variables");
  throw new Error("GUILD_ID is not set in the environment variables");
}
if (!GROUPS_FILE) {
  logger.error("GROUPS_FILE is not set in the environment variables");
  throw new Error("GROUPS_FILE is not set in the environment variables");
}
if (!PERMISSIONS_FILE) {
  logger.error("PERMISSIONS_FILE is not set in the environment variables");
  throw new Error("PERMISSIONS_FILE is not set in the environment variables");
}
if (!ADMIN_ROLE_ID) {
  logger.error("ADMIN_ROLE_ID is not set in the environment variables");
  throw new Error("ADMIN_ROLE_ID is not set in the environment variables");
}
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !CONF_YAML_PATH || !GUILD_ID || !GROUPS_FILE || !PERMISSIONS_FILE || !ADMIN_ROLE_ID) {
  logger.error("Missing environment variables");
  throw new Error("Missing environment variables");
}



export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  CONF_YAML_PATH,
  GUILD_ID,
  GROUPS_FILE,
  PERMISSIONS_FILE,
  ADMIN_ROLE_ID,
};


