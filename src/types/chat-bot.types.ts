export type ChatBotConfig = {
  twitchTokenEndpoint: string;
  twitchUser: string;
  twitchClientId: string;
  twitchClientSecret: string;
  twitchAuthorizationCode: string;
  twitchChannel: string;
};

export type TwitchTokenDetails = {
  access_token: string;
  refresh_token: string;
  expires_in_secs: number;
  scope: string[];
  token_type: string;
};
export type User = {};
