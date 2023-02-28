import { createClient } from "@supabase/supabase-js";

import { ChatBotConfig, TwitchTokenDetails, User } from "../types/chat-bot.types";
import {
  MalformedTwitchRequestError,
  NoTwitchResponseError,
  TwitchResponseError,
} from "../types/error.types";

export class TwitchChatBot {
  tmi = require("tmi.js");

  public twitchClient: any;
  private supabaseClient = createClient(
    process.env.supabaseURL ?? "",
    process.env.supabaseKey ?? "",
  );

  private tokenDetails!: TwitchTokenDetails;

  constructor(private config: ChatBotConfig) {}

  async launch() {
    const { data, error } = await this.supabaseClient
      .from("channel_refresh_tokens")
      .select("channel_token, id")
      .eq("channel", this.config.twitchChannel);
    if (data && data.length > 0) {
      this.tokenDetails = await this.fetchAccessToken(data[0].channel_token);
      this.supabaseClient
        .from("channel_refresh_tokens")
        .update({
          channel_token: this.tokenDetails.refresh_token,
        })
        .eq("id", data[0].id);
    } else {
      this.tokenDetails = await this.fetchAccessToken();
      await this.supabaseClient.from("channel_refresh_tokens").insert({
        channel: this.config.twitchChannel,
        channel_token: this.tokenDetails.refresh_token,
      });
    }
    this.twitchClient = new this.tmi.Client(
      this.buildConnectionConfig(
        this.config.twitchChannel,
        this.config.twitchUser,
        this.tokenDetails.access_token,
      ),
    );
    this.setupBotBehavior();
    this.twitchClient.connect();
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
    this.twitchClient.on(
      "message",
      (channel: string, tags: string[], message: string, self: User) => {
        const helloCommand = "!beep";
        console.log(tags, self);

        //! means a command is coming by, and we check if it matches the command we currently support
        if (message.startsWith("!") && message === helloCommand) this.sayHelloToUser(channel, tags);
      },
    );
  }

  private sayHelloToUser(channel: any, tags: any) {
    this.twitchClient.say(channel, `Hello, ${tags.username}! Welcome to the channel.`);
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
