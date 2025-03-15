alter table "public"."tokens" drop constraint "tokens_mint_address_key";

drop index if exists "public"."tokens_mint_address_key";

alter table "public"."tokens" drop column "usd_price";

alter table "public"."tokens" add column "chain_id" bigint not null;

alter table "public"."tokens" add column "description" character varying not null default ''::character varying;

alter table "public"."tokens" add column "liquidity" double precision not null;

alter table "public"."tokens" add column "market_cap" double precision not null;

alter table "public"."tokens" add column "metadata" json not null;

alter table "public"."tokens" add column "price" double precision not null;

alter table "public"."tokens" add column "token_creator_wallet_address" bigint not null;

alter table "public"."tokens" add column "token_supply" bigint not null;

alter table "public"."tokens" add column "total_trade_volume" double precision not null;

alter table "public"."tokens" alter column "created_at" set not null;

alter table "public"."tokens" alter column "mint_address" set not null;

alter table "public"."tokens" alter column "symbol" set not null;

alter table "public"."tokens" alter column "updated_at" set not null;


