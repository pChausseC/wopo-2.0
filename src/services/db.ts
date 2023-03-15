import pgPromise from "pg-promise";

import env from "../env";
import { ICommands } from "../types/chat-bot.types";

// Configuration

const connection = {
  user: "wopo",
  host: env.DB_URL,
  database: "wlvs",
  password: env.DB_PW,
  port: 5432,
};
const pgClient = pgPromise()(connection);

const queryWrapper = <T = object>(fn: Promise<T>) =>
  fn
    .then(data => {
      return { data: data, error: null };
    })
    .catch(error => {
      return { data: null, error };
    });

export const getDBCommand = (command: string) =>
  queryWrapper(
    pgClient.one<Pick<ICommands, "isMod" | "response">>(
      "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1;",
      command,
    ),
  );

export const doesCommandExist = (command: string) =>
  queryWrapper(
    pgClient
      .one(
        "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1;",
        command,
      )
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      }),
  );

//#region CREATE
export const newCommand = (
  command: string,
  isMod: boolean,
  response: string,
  creator: string,
  channel: string,
) =>
  queryWrapper(
    pgClient.none(
      "INSERT INTO public.commands(command, isMod, response, creator, channel) VALUES ($1, $2, $3, $4, $5);",
      [command, isMod, response, creator, channel],
    ),
  );
//#endregion

//#region UPDATE
export const updateCommand = (command: string, response: string, username: string) =>
  queryWrapper(
    pgClient.none("UPDATE public.commands SET response = $2, creator = $3 WHERE command = $1;", [
      command,
      response,
      username,
    ]),
  );
// #endregion

//#region DELETE
export const removeCommand = (command: string) =>
  queryWrapper(pgClient.none("DELETE FROM public.commands WHERE command = $1;", command));
//#endregion
export const getChannelRefreshToken = (channel: string) =>
  queryWrapper(
    pgClient.one<{ token: string; id: number }>(
      "SELECT channel_refresh_tokens.token, id FROM public.channel_refresh_tokens WHERE channel = $1 limit 1;",
      channel,
    ),
  );

export const updateChannelRefreshToken = (id: number, token: string) =>
  queryWrapper(
    pgClient.none("UPDATE public.channel_refresh_tokens SET token = $2 WHERE id = $1;", [
      id,
      token,
    ]),
  );

export const addChannelRefreshToken = (channel: string, token: string) =>
  queryWrapper(
    pgClient.none("INSERT INTO public.channel_refresh_tokens(channel, token) VALUES ($1,$2);", [
      channel,
      token,
    ]),
  );
