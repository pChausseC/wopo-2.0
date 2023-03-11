import SpotifyWebApi from "spotify-web-api-node";
import { Client } from "tmi.js";

import env from "../env";
import * as db from "../services/db";
import { OnMessage, ResponseProps } from "../types/twitch.types";
import { isMod } from "../utils";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_ACCESS_TOKEN } = env;

export default class Chat {
  private api: any;
  private fn: any;
  private cron: any;
  private spotify?: SpotifyWebApi;
  constructor(private twitchClient: Client) {
    this.spotify = new SpotifyWebApi({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      accessToken: SPOTIFY_ACCESS_TOKEN,
    });
  }
  responses: {
    [key: string]: (arg: Omit<OnMessage, "self">) => void;
  } = {
    "!beep": this.boop,
    "!hi": ({ user }) => {
      if (user.username) this.twitchClient.whisper(user.username, "HeyGuys");
    },
    "!addcomm?": ({ channel, user }) => {
      if (user.mod) {
        this.twitchClient.say(channel, "format: !addcomm <!command> <response>");
      }
    },
    "!addcomm": this.addCommand,
    "!updatecomm?": ({ channel, user }) => {
      if (user.mod) {
        this.twitchClient.say(channel, "Format: !updatecomm <!command> <New Response>");
      }
    },
    "!updatecomm": this.updateCommand,
    "!deletecomm?": ({ channel, user }) => {
      if (user.mod) {
        this.twitchClient.say(channel, "Format: !deletecom <!Command>");
      }
    },

    "!deletecom": this.deleteCommand,
    "!ftn": this.getStats,
    "!caster": this.getCasterInfo,
    "!uptime": this.getUptime,
    "!followage": this.getFollowAge,
    "!clip": this.getClip,
    "!hug": this.giveHug,
    "!multi": this.setMultilink,
    "!?": this.searchInfo,
    // "!cycle": this.cycleCommand,
    "!song": this.nowPlayingCommand,
    // "!botengagement": this.botEngagement,
  };
  private doesCommandExist = async (command: string): Promise<boolean> => {
    const { data: exists } = await db.doesCommandExist(command);
    return !!this.responses[command] || exists;
  };
  async runCommand({
    command,
    channel,
    user,
    message,
  }: Omit<OnMessage, "self"> & { command: string }) {
    if (this.responses[command]) {
      this.responses[command].bind(this)({ channel, user, message });
    } else {
      const { data } = await db.getDBCommand(command);
      if (data) {
        if ((data.isMod && user.mod) || !data.isMod) this.twitchClient.say(channel, data.response);
      }
    }
  }
  //Simple response
  private boop({ channel }: ResponseProps) {
    this.twitchClient.say(channel, "boop!");
  }

  // Add command
  private async addCommand({ channel, user, message }: ResponseProps) {
    if (isMod(user)) {
      const command = message.split(" ")[1];
      if (!command.toString().startsWith("!")) return;

      const exists = await this.doesCommandExist(command);
      if (exists) {
        this.twitchClient.say(channel, `"${command}" already exists`);
        return;
      }

      const response = message.split(" ").slice(2).join(" ");
      const { error } = await db.newCommand(
        command,
        false,
        response,
        user.username ?? "unknown",
        channel,
      );
      if (error) {
        if (user.username)
          this.twitchClient.whisper(user.username, `Error adding the command: ${error.message}`);
      } else {
        this.twitchClient.say(channel, `created command ${command}`);
      }
    }
  }

  // Update Command
  private async updateCommand({ channel, user, message }: ResponseProps) {
    // Update stuff here
    if (isMod(user)) {
      const command = message.split(" ")[1];
      if (!command.toString().startsWith("!")) return;
      const response = message.split(" ").splice(2).join(" ");
      const { error } = await db.updateCommand(command, response, user.username ?? "unknown");
      if (error) {
        if (user.username) this.twitchClient.whisper(user.username, "Error adding the command");
      } else {
        this.twitchClient.say(channel, `Command ${command} was updated successfully!`);
      }
    }
  }
  // Get Fortnite Stats
  private async getStats({ channel, message }: ResponseProps) {
    const messageArray = message.split(" ");
    if (messageArray.length <= 1) {
      const strStat = await this.fn.getStats(message + " default");
      this.twitchClient.say(channel, `${strStat.data}`);
    } else {
      const fnData = await this.fn.getStats(message);
      this.twitchClient.say(channel, `${channel} has ${fnData.data} ${fnData.mode} wins!`);
    }
  }
  // Get Caster Info
  private async getCasterInfo({ channel, user, message }: ResponseProps) {
    if (isMod(user)) {
      const messageArray = message.split(" ");
      if (messageArray.length >= 1) {
        const caster = messageArray[1];
        const casterInfo = await this.api.channelInfo(caster);
        this.twitchClient.say(
          channel,
          `Check out ${casterInfo.name} over at ${casterInfo.URL} they are a great friend of the channel and we encourage you to drop them a follow! They were last playing ${casterInfo.lastGame}.`,
        );
      }
    }
  }
  // Give Hug
  private giveHug({ channel, user, message }: ResponseProps) {
    const name = message.split(" ")[1],
      msg1 = "@" + user.username + " embraces " + name + " in the warmth of the Pack",
      msg2 = "@" + user.username + " tries to embrace " + name + " but the Alpha wolf stepped in",
      msg3 = name + " is overwhelmed by the love they received from @" + user.username,
      randNum = Math.floor(Math.random() * 3);

    const messages = [msg1, msg2, msg3];

    if (name != null) {
      this.twitchClient.say(channel, messages[randNum]);
    }
  }
  // Get Uptime
  private async getUptime({ channel }: ResponseProps) {
    const uptimeInfo = await this.api.uptime();
    this.twitchClient.say(channel, uptimeInfo);
  }
  // Get Follow Age
  private async getFollowAge({ user }: ResponseProps) {
    if (user.username) {
      const followAge = await this.api.followage(user["user-id"]);
      this.twitchClient.whisper(user.username, followAge);
    }
  }
  // Get Clip
  private async getClip({ user }: ResponseProps) {
    if (user.username) {
      const clipURL = await this.api.clip();
      this.twitchClient.whisper(user.username, clipURL);
    }
  }
  //Search for information
  private async searchInfo({ channel, message }: ResponseProps) {
    const query = message.split("?")[1].toString().trim();
    const searchI = await this.api.waQuery(query);
    if (searchI != null) {
      this.twitchClient.say(channel, searchI);
    }
  }
  // Delete Command
  private deleteCommand({ channel, user, message }: ResponseProps) {
    if (isMod(user)) {
      const command = message.split(" ")[1];
      if (!command.toString().startsWith("!")) return;
      db.removeCommand(command).then(({ error }) => {
        if (!error) {
          this.twitchClient.say(channel, `Deleted command ${command} successfully!`);
        }
      });
    }
  }
  // set multilink command
  private setMultilink({ channel, user, message }: ResponseProps) {
    const params = message.split(" ");
    if (params.length === 1) {
      db.getDBCommand(message).then(({ data }) => {
        if (data) {
          this.twitchClient.say(channel, data.response);
        }
      });
    } else {
      if (isMod(user)) {
        const partners = params.slice(1);
        console.log(partners);
        let multi = "http://kadgar.net/live/" + channel;
        partners.forEach(function (partner) {
          multi = multi + "/" + partner;
        });
        const updateMessage = "!updatecomm !multi " + multi;
        console.log(`The updated message to pass to the DB is: ${updateMessage}`);
        this.updateCommand({ channel, user, message: updateMessage });
        this.twitchClient.say(channel, multi);
      } else {
        if (user.username)
          this.twitchClient.whisper(user.username, "Only Mods can update the multilink!");
      }
    }
  }

  /*
   * !cycle [command to execute] [duration in minutes]
   * !cycle stop
   */
  _cronSchedule = null;

  // private async cycleCommand({ channel, user, message }: ResponseProps) {
  //   const params = message.split(" ");
  //   if (this.util.isMod(user)) {
  //     if (params.slice(1)[0] === "stop" && this._cronSchedule) {
  //       this.twitchClient.say(channel, "Stopping Cycle!");
  //       this._cronSchedule.destroy();
  //       this._cronSchedule = null;
  //     } else {
  //       const _command = params.slice(1, 2);
  //       const _duration = params.slice(2, 3);
  //       const _cronDuration = `*/${_duration} * * * *`;
  //       const _doesCommandExist = await this.util.doesCommandExist(_command);
  //       if (_doesCommandExist && !this._cronSchedule) {
  //         this.twitchClient.say(
  //           channel,
  //           `Starting cycle ${_command} every ${_duration} minutes. Type '!cycle stop' to end the cycle.`,
  //         );

  //         this._cronSchedule = cron.schedule(_cronDuration, () => {
  //           this.runCommand(_command, channel, user, message);
  //         });
  //       } else if (!_doesCommandExist) {
  //         this.twitchClient.say(channel, `That's awkward...I don't know the ${_command} command.`);
  //       } else if (this._cronSchedule) {
  //         this.twitchClient.say(channel, "Only one cycle can be running at once.");
  //       }
  //     }
  //   } else {
  //     this.twitchClient.whisper(user.username, "Only Mods can set a cycle!");
  //   }
  // }

  /*
   * !song: Gets currently playing song on Spotify
   * Note: A spotify refresh token must be set in config to use this command
   */
  private async nowPlayingCommand({ channel }: ResponseProps) {
    try {
      if (!this.spotify) throw new Error("Spotify is not initialized");
      const {
        body: { item },
      } = await this.spotify.getMyCurrentPlayingTrack();
      if (item) {
        if (item.type == "track") {
          this.twitchClient.say(
            channel,
            `Currently Playing: ${item.name} by ${item.artists.join()} ${item.uri}`,
          );
        } else {
          this.twitchClient.say(channel, `Currently Playing: ${item.name} ${item.uri}`);
        }
      } else {
        this.twitchClient.say(channel, "Nothing playing currently");
      }
    } catch (error) {
      console.log(error);
      this.twitchClient.say(channel, "Woops...Spotify isn't connected right now.");
    }
  }

  // Automatic Bot Engagement
  _engagementSchedule: any = null;
  private botEngagement({ channel, user, message }: ResponseProps) {
    const _arrEngagement = [
      "Missed a stream? No problem! Every stream is organized with a title, thumbnail, and date over at www.youtube.com/c/wlvsarchive",
      "Want to stay connected with Jay & The Wolfpack offline? Join the community discord! www.discord.gg/wlvs",
      "New to the stream? Make sure to follow by hitting the :heart: Follow button at the bottom of the stream, also hit the :bell: to be notified every time jay goes live!",
    ];
    const params = message.split(" ");
    let counter = 0;

    // If user is a mod, check if the command is starting or stopping
    if (user.mod) {
      // Stopping
      if (params.slice(1)[0] == "stop" && this._engagementSchedule) {
        this._engagementSchedule.destroy();
        this._engagementSchedule = null;
        if (user.username)
          this.twitchClient.whisper(user.username, "Bot chat user engagement cycle stopped");
      } else {
        if (user.username)
          this.twitchClient.whisper(user.username, "started chat bot user engagement post cycle");
        // Starting
        this._engagementSchedule = this.cron.schedule("*/10 * * * *", () => {
          this.twitchClient.say(channel, _arrEngagement[counter]);

          if (counter == _arrEngagement.length - 1) {
            // recycle message list
            counter = 0;
          } else {
            counter++; // cycle to next message in list
          }
        });
      }
    }
  }
}
