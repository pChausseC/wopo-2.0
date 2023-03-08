import { Client } from "tmi.js";

import { db } from "../services/db";
import { ChatBotConfig, TwitchTokenDetails } from "../types/chat-bot.types";
import {
  MalformedTwitchRequestError,
  NoTwitchResponseError,
  TwitchResponseError,
} from "../types/error.types";

import Chat from "./chat";

// Set the prefix
const prefix = "!";

//regex to determine if message is a link
const regex = /[-a-zA-Z0-9@:%_\\+~#?&//=]{2,256}\.[a-z]{2,3}\b(\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?/gi;
const regex2 = /(clips\.twitch\.tv)/gi;

export class Wopo {
  public twitchClient?: Client;
  public chat?: Chat;

  private tokenDetails!: TwitchTokenDetails;

  constructor(private config: ChatBotConfig) {}

  async launch() {
    const { data } = await db.getChannelRefreshToken(this.config.twitchChannel);
    if (data) {
      this.tokenDetails = await this.fetchAccessToken(data.token);
      db.updateChannelRefreshToken(data.id, this.tokenDetails.refresh_token);
    } else {
      this.tokenDetails = await this.fetchAccessToken();
      db.addChannelRefreshToken(this.config.twitchChannel, this.tokenDetails.refresh_token);
    }
    this.twitchClient = new Client(
      this.buildConnectionConfig(
        this.config.twitchChannel,
        this.config.twitchUser,
        this.tokenDetails.access_token,
      ),
    );
    this.setupBotBehavior();
    this.twitchClient.connect();
    this.chat = new Chat(this.twitchClient);
  }

  private async fetchAccessToken(refreshToken?: string): Promise<TwitchTokenDetails> {
    const axios = require("axios");
    console.log("Fetching Twitch OAuth Token");
    const params = refreshToken
      ? {
          client_id: this.config.twitchClientId,
          client_secret: this.config.twitchClientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }
      : {
          client_id: this.config.twitchClientId,
          client_secret: this.config.twitchClientSecret,
          code: this.config.twitchAuthorizationCode,
          grant_type: "authorization_code",
          redirect_uri: "http://localhost",
        };
    return axios({
      method: "post",
      url: this.config.twitchTokenEndpoint,
      params,
      responseType: "json",
    })
      .then(async function (response: { data: TwitchTokenDetails }) {
        // handle success
        return response.data;
      })
      .catch(function (error: any) {
        console.log("Failed to get Twitch OAuth Token");
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          throw new TwitchResponseError(error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          throw new NoTwitchResponseError(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new MalformedTwitchRequestError(error.request);
        }
      });
  }

  private setupBotBehavior() {
    if (!this.twitchClient) {
      console.error("launch bot");
      return;
    }
    this.twitchClient.on("message", (channel, user, message, self) => {
      const isLink = message.match(regex);
      const isClip = message.match(regex2);
      const timeoutMSG = `@${user.username}no links in chat. Whisper the link to a mod.`;
      //allow subs to post clip links, timeout all other links
      if (user.subscriber && isClip) {
        /* empty */
      } else if (!(self || user.mod) && isLink) {
        this.twitchClient?.timeout(channel, `${user.username}`, 5, "posted link");
        this.twitchClient?.say(channel, timeoutMSG);
      }

      //Short circuit messages that have no prefix OR are by the bot
      if (!message.startsWith(prefix)) return;

      //if we have a response for this
      const command = message.split(" ")[0];
      this.chat?.runCommand({ command, channel, user, message });
    });
  }

  private buildConnectionConfig(channel: string, username: string, accessToken: string) {
    return {
      options: { debug: true },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: `${username}`,
        password: `oauth:${accessToken}`,
      },
      channels: [`${channel}`],
    };
  }
}
