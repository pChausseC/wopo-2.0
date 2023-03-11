import axios from "axios";

import { Broadcaster } from "../types/twitch.types";

export const channelInfo = (caster: string) =>
  axios
    .get<Broadcaster>("https://api.twitch.tv/helix/channels", {
      params: { broadcaster_id: caster },
    })
    .then(d => {
      console.log(d.data);
      return d.data;
    })
    .catch(e => {
      console.log(e);
    });
