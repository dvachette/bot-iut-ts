import dotenv from "dotenv";
import { required } from "@dvachette/easy.env";

dotenv.config();
export const config = {
  DISCORD_TOKEN: required("DISCORD_TOKEN"),
  DISCORD_CLIENT_ID: required("DISCORD_CLIENT_ID"),
};


