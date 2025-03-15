alter table "public"."tokens" drop constraint "tokens_token_id_fkey";

alter table "public"."token_chains" add column "token_id" bigint not null;

alter table "public"."tokens" drop column "token_id";

alter table "public"."token_chains" add constraint "token_chains_token_id_fkey" FOREIGN KEY (token_id) REFERENCES tokens(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."token_chains" validate constraint "token_chains_token_id_fkey";


