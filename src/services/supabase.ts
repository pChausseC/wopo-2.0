import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(process.env.supabaseURL ?? "", process.env.supabaseKey ?? "");

export { supabaseClient };
