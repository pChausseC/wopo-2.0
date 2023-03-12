require("dotenv").config();
import { Wopo } from "./chat-bot/wopo";
import env from "./env";
const bot = new Wopo({
  twitchTokenEndpoint: "https://id.twitch.tv/oauth2/token",
  twitchAuthorizationCode: env.AUTHORIZATION_CODE,
  twitchClientId: env.CLIENT_ID,
  twitchClientSecret: env.CLIENT_SECRET,
  twitchChannel: env.CHANNEL, // the channel you want to connect to
  twitchUser: env.BOT_USERNAME, // the bot user account
});
bot.launch();
