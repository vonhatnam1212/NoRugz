revoke delete on table "public"."tokens" from "anon";

revoke insert on table "public"."tokens" from "anon";

revoke references on table "public"."tokens" from "anon";

revoke select on table "public"."tokens" from "anon";

revoke trigger on table "public"."tokens" from "anon";

revoke truncate on table "public"."tokens" from "anon";

revoke update on table "public"."tokens" from "anon";

revoke delete on table "public"."tokens" from "authenticated";

revoke insert on table "public"."tokens" from "authenticated";

revoke references on table "public"."tokens" from "authenticated";

revoke select on table "public"."tokens" from "authenticated";

revoke trigger on table "public"."tokens" from "authenticated";

revoke truncate on table "public"."tokens" from "authenticated";

revoke update on table "public"."tokens" from "authenticated";

revoke delete on table "public"."tokens" from "service_role";

revoke insert on table "public"."tokens" from "service_role";

revoke references on table "public"."tokens" from "service_role";

revoke select on table "public"."tokens" from "service_role";

revoke trigger on table "public"."tokens" from "service_role";

revoke truncate on table "public"."tokens" from "service_role";

revoke update on table "public"."tokens" from "service_role";

alter table "public"."token_chains" drop constraint "token_chains_token_id_fkey";

alter table "public"."token_trades" drop constraint "token_trades_token_id_fkey";

alter table "public"."tokens" drop constraint "tokens_pkey";

drop index if exists "public"."tokens_pkey";

drop table "public"."tokens";

alter table "public"."token_chains" drop column "token_id";

alter table "public"."token_chains" add column "metadata" json not null;

alter table "public"."token_chains" add column "name" character varying not null;

alter table "public"."token_chains" add column "symbol" character varying not null;

alter table "public"."token_chains" alter column "created_at" drop default;

alter table "public"."token_chains" alter column "updated_at" drop default;

alter table "public"."token_trades" add constraint "token_trades_token_id_fkey1" FOREIGN KEY (token_id) REFERENCES token_chains(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."token_trades" validate constraint "token_trades_token_id_fkey1";


