alter table "public"."token_creators" drop column "update_authority";

alter table "public"."token_creators" drop column "wallet_address";

alter table "public"."tokens" add column "creator_address" character varying;

alter table "public"."tokens" add column "image_uri" character varying;

alter table "public"."tokens" add column "market_cap" double precision;

CREATE UNIQUE INDEX constraint_name ON public.tokens USING btree (chain_id, mint_address);

alter table "public"."tokens" add constraint "constraint_name" UNIQUE using index "constraint_name";


