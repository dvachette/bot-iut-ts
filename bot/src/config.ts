import dotenv from "dotenv";
import { required } from "@dvachette/easy.env";

dotenv.config();
export const config = {
  DISCORD_TOKEN: required("DISCORD_TOKEN"),
  DISCORD_CLIENT_ID: required("DISCORD_CLIENT_ID"),
  INTERNAL_PORT: required("INTERNAL_PORT"),
  INTERNAL_API_SECRET: required("INTERNAL_API_SECRET"),
  WEB_INTERNAL_URL: required("WEB_INTERNAL_URL"),
  WEB_PUBLIC_URL: required("WEB_PUBLIC_URL")
};

