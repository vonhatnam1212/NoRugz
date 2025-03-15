alter table "public"."tokens" add constraint "tokens_chain_id_fkey" FOREIGN KEY (chain_id) REFERENCES chains(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tokens" validate constraint "tokens_chain_id_fkey";


