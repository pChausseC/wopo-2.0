type ChatBotConfig = {
  twitchTokenEndpoint: string;
  twitchUser: string;
  twitchClientId: string;
  twitchClientSecret: string;
  twitchAuthorizationCode: string;
  twitchChannel: string;
}

type TwitchTokenDetails = {
    access_token: string;
    refresh_token: string;
    expires_in_secs: number;
    scope: string[];
    token_type: string;
}
type user = {
    
}