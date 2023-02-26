require("dotenv").config();
import { TwitchChatBot } from "./chat-bot/chat-bot";

const bot = new TwitchChatBot({
  twitchTokenEndpoint: "https://id.twitch.tv/oauth2/token",
  twitchAuthorizationCode: process.env.authorization_code ?? "",
  twitchClientId: process.env.client_id ?? "",
  twitchClientSecret: process.env.client_secret ?? "",
  twitchChannel: "pabz_z", // the channel you want to connect to
  twitchUser: "pabz_Z", // the bot user account
});
bot.launch();
