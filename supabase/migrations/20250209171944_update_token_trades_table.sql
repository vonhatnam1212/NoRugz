alter table "public"."token_trades" drop constraint "token_trades_token_id_key";

drop index if exists "public"."token_trades_token_id_key";

CREATE UNIQUE INDEX chain_address ON public.tokens USING btree (chain_id, mint_address);

CREATE UNIQUE INDEX token_create_at ON public.token_trades USING btree (token_id, buyer_wallet_address, seller_wallet_address, trade_price, created_at);


