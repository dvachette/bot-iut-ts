import dotenv from "dotenv";
import { optional, required } from "@dvachette/easy.env"

dotenv.config();

export const config = {
    INTERNAL_PORT: required("INTERNAL_PORT"),
    INTERNAL_API_SECRET: required("INTERNAL_API_SECRET"),
    SERVER_PORT: optional("SERVER_PORT", "3100"),
    DISCORD_TOKEN: required("DISCORD_TOKEN")
};