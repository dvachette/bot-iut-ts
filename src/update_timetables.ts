import { functions } from "./commands";

import cron from "node-cron"

const downloadAllICS = functions.downloadAllICS


cron.schedule('0 */2 * * *', () => {
    downloadAllICS();
});


downloadAllICS();

console.log("Timetables will be downloaded every 2 hours")