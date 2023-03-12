import { z } from "zod";

const envSchema = z.object({
  CLIENT_SECRET: z.string(),
  CLIENT_ID: z.string(),
  AUTHORIZATION_CODE: z.string(),
  CHANNEL: z.string(),
  BOT_USERNAME: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_ACCESS_TOKEN: z.string(),
  DB_URL: z.string(),
  DB_PW: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
