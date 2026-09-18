import dotenv from "dotenv";
import { logger } from "./logger";
import { required } from "@dvachette/easy.env";

dotenv.config();

export const config = {
  DISCORD_TOKEN: required("DISCORD_TOKEN"),
  DISCORD_CLIENT_ID: required("DISCORD_CLIENT_ID"),
  CONF_YAML_PATH: required("CONF_YAML_PATH"),
  GUILD_ID: required("GUILD_ID"),
  GROUPS_FILE: required("GROUPS_FILE"),
  PERMISSIONS_FILE: required("PERMISSIONS_FILE"),
  ADMIN_ROLE_ID: required("ADMIN_ROLE_ID"),
  NO_CLASS_ROLE_ID: required("NO_CLASS_ROLE_ID"),
};


