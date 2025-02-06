import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, CONF_YAML_PATH} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !CONF_YAML_PATH) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  CONF_YAML_PATH,
};


