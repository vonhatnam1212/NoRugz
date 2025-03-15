alter table "public"."token_creators" drop column "total_supply";

alter table "public"."token_creators" add column "wallet_address" character varying;

CREATE UNIQUE INDEX token_creators_token_id_wallet_address_idx ON public.token_creators USING btree (token_id, wallet_address);


