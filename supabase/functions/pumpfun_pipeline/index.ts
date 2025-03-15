import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  fillTokenCreators,
  fillTokens,
  fillTokenTrades,
} from "./utils/pumpfun.ts";

const FILL_TOKEN_DATA = 1;
const FILL_TOKEN_TRADES = 2;
const FILL_TOKEN_CREATORS = 3;

Deno.serve(async (req: Request) => {
  const supabase: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { action } = await req.json();
  let processStatus = false;

  switch (action) {
    case FILL_TOKEN_DATA:
      processStatus = await fillTokens(supabase);
      break;
    case FILL_TOKEN_TRADES:
      processStatus = await fillTokenTrades(supabase);
      break;
    case FILL_TOKEN_CREATORS:
      processStatus = await fillTokenCreators(supabase);
      break;
    default:
      console.error("Invalid action");
  }

  if (processStatus) {
    console.log("Data fetched and processed successfully");
    return new Response(
      JSON.stringify({
        message: "success",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  } else {
    return new Response(
      JSON.stringify({
        message: "error",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
});
