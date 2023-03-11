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
      console.error(error);
      return { data: null, error };
    });

const getDBCommand = (command: string) =>
  queryWrapper(
    pgClient.one<{ isMod: boolean; response: string }>(
      "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1;",
      command,
    ),
  );

// exports.doesCommandExist = function (command) {
//   return new Promise((resolve, reject) => {
//     db.one(
//       "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1",
//       command,
//     )
//       .then(commandInfo => {
//         resolve(true);
//       })
//       .catch(error => {
//         reject(false);
//       });
//   });
// };

//#region CREATE
// const newCommand = (command, isMod, response, creator, channel, callback, eCallback) => {
//   pgClient
//     .one(
//       "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1",
//       command,
//     )
//     .then(function (commandInfo) {
//       pgClient
//         .none(
//           "INSERT INTO public.commands(command, isMod, response, creator, channel) VALUES ($1, $2, $3, $4, $5);",
//           [command, isMod, response, creator, channel],
//         )
//         .then(function (data) {
//           callback(data);
//         })
//         .catch(function (error) {
//           console.log("ERROR:", error);
//         });
//     })
//     .catch(function (error) {
//       eCallback(command, creator, error);
//     });
// };
//#endregion

//#region READ
// exports.getCommand = (command, channel, isMod, callback, eCallback) => {
//   getDBCommand(command, channel, isMod, callback, eCallback);
// };
//#endregion

//#region UPDATE
// exports.updateCommand = (command, isMod, response, creator, channel, callback, eCallback) => {
//   db.none(
//     "UPDATE public.commands SET command = $1, isMod = $2, response = $3, creator = $4, channel = $5 WHERE command = $1",
//     [command, isMod, response, creator, channel],
//   )
//     .then(() => {
//       if (isMod) {
//         callback(config.ch, command);
//       } else {
//         callback(config.ch, command);
//       }
//     })
//     .catch(err => {
//       console.log("Error: ", err);
//       eCallback(creator);
//     });
// };
// #endregion

//#region DELETE
const removeCommand = (command: string) =>
  queryWrapper(pgClient.one<ICommands>("DELETE public.commands WHERE command = $1;", command));
//#endregion
const getChannelRefreshToken = (channel: string) =>
  queryWrapper(
    pgClient.one<{ token: string; id: number }>(
      "SELECT channel_refresh_tokens.token, id FROM public.channel_refresh_tokens WHERE channel = $1 limit 1;",
      channel,
    ),
  );

const updateChannelRefreshToken = (id: number, token: string) =>
  queryWrapper(
    pgClient.none("UPDATE public.channel_refresh_tokens SET token = $2 WHERE id = $1;", [
      id,
      token,
    ]),
  );

const addChannelRefreshToken = (channel: string, token: string) =>
  queryWrapper(
    pgClient.none("INSERT public.channel_refresh_tokens(channel, token) VALUES ($1,$2);", [
      channel,
      token,
    ]),
  );

export const db = {
  getDBCommand,
  getChannelRefreshToken,
  updateChannelRefreshToken,
  addChannelRefreshToken,
  removeCommand,
};
