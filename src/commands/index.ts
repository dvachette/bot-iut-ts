import * as repo from "./repo";
import * as ping from "./ping";
import * as send_today from "./send_today";
import * as send_week from "./send_week";
import * as group from "./group";
import { downloadICSErrorEmitter } from "./downloadIcs";
import * as broadcast from "./broadcast";
import { send } from "./send"

export const commands = {
  ping,
  repo,
  group,
  send_today,
  send_week,
  broadcast,
};



export const emitters = {
  downloadICSErrorEmitter
}