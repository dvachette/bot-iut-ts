import * as repo from "./repo";
import * as ping from "./ping";
import * as edt from "./edt";
import * as init from "./init_daily";
import * as group from "./group";
import { downloadAllICS, downloadICSErrorEmitter } from "./downloadIcs";
import { send } from "./send"

export const commands = {
  ping,
  repo,
  edt,
  init,
  group
};

export const funcs = {
  downloadAllICS,
}

export const emitters = {
  downloadICSErrorEmitter
}