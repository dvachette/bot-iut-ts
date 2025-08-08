import { createLogger, format, transports } from "winston";

export const logger = createLogger({
    level: "debug", // niveau minimum
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "app.log" })
    ]
});
