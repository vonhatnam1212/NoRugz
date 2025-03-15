alter table "public"."wallet_holdings" drop constraint "wallet_holdings_token_id_fkey";

alter table "public"."token_chains" add column "mint_address" character varying not null;

alter table "public"."tokens" drop column "mint_address";

alter table "public"."tokens" drop column "token_creator_wallet_address";

alter table "public"."wallet_holdings" drop column "token_id";

alter table "public"."wallet_holdings" add column "token_chain_id" bigint not null;

alter table "public"."wallet_holdings" add constraint "wallet_holdings_token_chain_id_fkey" FOREIGN KEY (token_chain_id) REFERENCES token_chains(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."wallet_holdings" validate constraint "wallet_holdings_token_chain_id_fkey";


