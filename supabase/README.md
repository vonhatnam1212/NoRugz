### Set up Supabase locally

1. Ensure that you have the following tools installed locally

- [Supabase CLI](https://supabase.com/docs/guides/local-development)
- [Docker](https://docs.docker.com/desktop/setup/install/mac-install/)
- [Deno](https://docs.deno.com/runtime/getting_started/installation/)

2. Create a new Supabase project and start it. This will take awhile in the
   initial run as it needs to pull all the relevant docker images.
   ```
   supabase init
   cd supbase
   supabase start
   ```

The Supabase webpage is accessible at http://localhost:54323.

3. Helpful Supbase CLI commands

- `supabase status`: shows all the secrets variables
- `supabase db diff --use-migra -f {migration_file_name}`: generates migration
  file when schema is changed
- `supabase functions new`: create new serverless function

---

### Supabase function project

Let's start with a simple task of retrieving top meme tokens from Bitquery and
populate them into our database.

1. Head over to the Supabase webpage, under Database, to create a
   `public.tokens` table that has the following simple fields
   ```
   "id" BIGINT
   "name" CHARACTER VARYING,
   "symbol" CHARACTER VARYING,
   "mint_address" CHARACTER VARYING,
   "usd_price" DOUBLE PRECISION,
   "created_at" TIMESTAMP WITHOUT TIME ZONE
   "updated_at" TIMESTAMP WITHOUT TIME ZONE
   ```

2. After creating the table, we need to keep track of our database changes by
   generating the migration file that shows the changes
   ```
   supabase db diff --use-migra -f create_tokens_table
   ```

3. Now that we have a table, it is time to create a function to pump data in.
   Since the goal is to pull meme token data of Pumpfun, let's set a generic
   function name
   ```
   supabase functions new pumpfun_pipeline
   ```
   This will create a `pumpfun_pipeline` folder under `functions/`.

4. In order to use Supabase API within our function to interact with other
   Supabase services such as Database, we need to install the `supabase-js` lib
   ```
   cd functions/pumpfun_pipeline
   deno add jsr:@supabase/supabase-js
   ```

5. Within the `index.ts`, we can start the logic of fetching data from data
   source Bitquery to get treding tokens for Pumpfun. Here we just get the top
   10 trending coins at the time of query. When querying from Bitquery, we need
   auth token so we need to store it in our `.env.local` file.

   ```
   # ./supabase/.env.local
   BITQUERY_TOKEN=
   ```

6. Now we can see how the function by serving it and invoking the function
   locally.
   ```
     supabase functions serve --env-file ./.env.local

     curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pumpfun_pipeline' \
     --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
     --header 'Content-Type: application/json'
   ```
   `SUPABASE_ANON_KEY` can be retrieved via `supabase status`.
