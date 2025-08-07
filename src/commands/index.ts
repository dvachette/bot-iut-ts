import * as repo from "./repo";
import * as ping from "./ping";
import * as send_today from "./send_today";
import * as send_week from "./send_week";
import * as group from "./group";
import * as broadcast from "./broadcast";
import * as permission from "./permission";
import { downloadICSErrorEmitter } from "../util/downloadIcs";

export const commands = {
  ping,
  repo,
  group,
  send_today,
  send_week,
  broadcast,
  permission,
};



export const emitters = {
  downloadICSErrorEmitter
}