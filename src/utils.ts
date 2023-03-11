import { ChatUserstate } from "tmi.js";

import env from "./env";

export const isMod = function (user: ChatUserstate) {
  if (!user.username) return false;
  return (
    user.mod ||
    user.username.toString().toLowerCase() == "decoydix" ||
    user.username.toString().toLowerCase() == env.CHANNEL.toLowerCase()
  );
};
