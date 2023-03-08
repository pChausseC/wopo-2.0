import pgPromise from "pg-promise";

// Configuration

const connection = {
  user: "wopo",
  host: "wlvsdb.cy36wqif1j5l.us-east-1.rds.amazonaws.com",
  database: "wlvs",
  password: "I'mgoingbacktobed",
  port: 5432,
};
const db = pgPromise()(connection);

export const getDBCommand = (command: string) =>
  db
    .one(
      "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1",
      command,
    )
    .then(data => {
      return { data, error: null };
    })
    .catch(error => {
      return { data: null, error };
    });

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
// exports.newCommand = (command, isMod, response, creator, channel, callback, eCallback) => {
//   db.one(
//     "SELECT commands.ismod, commands.response FROM public.commands WHERE command = $1 limit 1",
//     command,
//   )
//     .then(function (commandInfo) {
//       db.none(
//         "INSERT INTO public.commands(command, isMod, response, creator, channel) VALUES ($1, $2, $3, $4, $5);",
//         [command, isMod, response, creator, channel],
//       )
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
// exports.removeCommand = (command, callback) => {
//   db.none("DELETE public.commands WHERE command = $1;", command)
//     .then(function (data) {
//       callback(data);
//     })
//     .catch(function (error) {
//       console.log("ERROR:", error);
//     });
// };
//#endregion
export const getChannelRefreshToken = (
  channel: string,
): Promise<{ data: { token: string; id: number }; error: null } | { data: null; error: any }> =>
  db
    .one(
      "SELECT channel_refresh_tokens.token, id FROM public.channel_refresh_tokens WHERE channel = $1 limit 1",
      channel,
    )
    .then(data => {
      return { data: data, error: null };
    })
    .catch(error => {
      return { data: null, error };
    });
export const updateChannelRefreshToken = (
  id: number,
  token: string,
): Promise<{ data: null; error: null } | { data: null; error: any }> =>
  db
    .none("UPDATE public.channel_refresh_tokens SET token = $2,  WHERE id = $1", [id, token])
    .then(data => {
      return { data: data, error: null };
    })
    .catch(error => {
      return { data: null, error };
    });
export const addChannelRefreshToken = (
  channel: string,
  token: string,
): Promise<{ data: null; error: null } | { data: null; error: any }> =>
  db
    .none("INSERT public.channel_refresh_tokens(channel, token) VALUES ($1,$2);", [channel, token])
    .then(data => {
      return { data: data, error: null };
    })
    .catch(error => {
      return { data: null, error };
    });
