import * as repo from "./repo";
import * as ping from "./ping";
import * as send_today from "./send_today";
import * as group from "./group";
import { downloadICSErrorEmitter } from "./downloadIcs";
import { send } from "./send"

export const commands = {
  ping,
  repo,
  group,
  send_today,
};



export const emitters = {
  downloadICSErrorEmitter
}