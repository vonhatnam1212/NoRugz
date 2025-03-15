alter table "public"."token_trades" alter column "buyer_wallet_address" drop not null;

alter table "public"."token_trades" alter column "seller_wallet_address" drop not null;


