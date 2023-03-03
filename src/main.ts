require("dotenv").config();
import { Wopo } from "./chat-bot/wopo";

const bot = new Wopo({
  twitchTokenEndpoint: "https://id.twitch.tv/oauth2/token",
  twitchAuthorizationCode: process.env.authorization_code ?? "",
  twitchClientId: process.env.client_id ?? "",
  twitchClientSecret: process.env.client_secret ?? "",
  twitchChannel: process.env.channel ?? "", // the channel you want to connect to
  twitchUser: process.env.user ?? "", // the bot user account
});
bot.launch();
