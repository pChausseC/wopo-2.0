import { Events } from "tmi.js";
import { ZipObj } from "ts-toolbelt/out/List/_api";

export type OnMessage = ZipObj<
  ["channel", "user", "message", "self"],
  Parameters<Events["message"]>
>;

export type ResponseProps = Omit<OnMessage, "self">;

export type Broadcaster = {
  broadcaster_name: string;
  game_name: string;
};
