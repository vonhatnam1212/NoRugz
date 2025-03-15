revoke delete on table "public"."token_developers" from "anon";

revoke insert on table "public"."token_developers" from "anon";

revoke references on table "public"."token_developers" from "anon";

revoke select on table "public"."token_developers" from "anon";

revoke trigger on table "public"."token_developers" from "anon";

revoke truncate on table "public"."token_developers" from "anon";

revoke update on table "public"."token_developers" from "anon";

revoke delete on table "public"."token_developers" from "authenticated";

revoke insert on table "public"."token_developers" from "authenticated";

revoke references on table "public"."token_developers" from "authenticated";

revoke select on table "public"."token_developers" from "authenticated";

revoke trigger on table "public"."token_developers" from "authenticated";

revoke truncate on table "public"."token_developers" from "authenticated";

revoke update on table "public"."token_developers" from "authenticated";

revoke delete on table "public"."token_developers" from "service_role";

revoke insert on table "public"."token_developers" from "service_role";

revoke references on table "public"."token_developers" from "service_role";

revoke select on table "public"."token_developers" from "service_role";

revoke trigger on table "public"."token_developers" from "service_role";

revoke truncate on table "public"."token_developers" from "service_role";

revoke update on table "public"."token_developers" from "service_role";

alter table "public"."token_creators" drop constraint "token_creators_creator_id_fkey";

alter table "public"."token_creators" drop constraint "token_creators_token_chain_id_fkey";

alter table "public"."token_developers" drop constraint "token_developer_chain_id_fkey";

alter table "public"."wallet_holdings" drop constraint "wallet_holdings_token_chain_id_fkey";

alter table "public"."token_developers" drop constraint "token_developer_pkey";

drop index if exists "public"."token_developer_pkey";

drop table "public"."token_developers";

alter table "public"."token_creators" drop column "creator_id";

alter table "public"."token_creators" drop column "token_chain_id";

alter table "public"."token_creators" add column "token_id" bigint not null;

alter table "public"."token_creators" add column "wallet_address" character varying not null;

alter table "public"."wallet_holdings" drop column "token_chain_id";

alter table "public"."wallet_holdings" add column "token_id" bigint not null;

alter table "public"."wallet_holdings" alter column "created_at" set not null;

alter table "public"."wallet_holdings" alter column "updated_at" set not null;

alter table "public"."token_creators" add constraint "token_creators_token_id_fkey" FOREIGN KEY (token_id) REFERENCES tokens(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."token_creators" validate constraint "token_creators_token_id_fkey";

alter table "public"."wallet_holdings" add constraint "wallet_holdings_token_id_fkey" FOREIGN KEY (token_id) REFERENCES tokens(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."wallet_holdings" validate constraint "wallet_holdings_token_id_fkey";


