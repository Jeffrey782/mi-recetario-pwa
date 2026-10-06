-- Ejecutar una vez en Supabase > SQL Editor > New query > Run.
-- Una fila privada por usuario: recetas e inventario se guardan juntos.
create table if not exists public.recetario_data (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint recetario_payload_valid check (
  jsonb_typeof(payload)='object' and jsonb_typeof(payload->'recipes')='array'
  and jsonb_typeof(payload->'pantry')='object'
 )
);
alter table public.recetario_data enable row level security;
drop policy if exists recetario_own on public.recetario_data;
create policy recetario_own on public.recetario_data for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.recetario_data from anon;
grant select, insert, update on public.recetario_data to authenticated;
create or replace function public.save_recetario(p_payload jsonb,p_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare new_revision bigint;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_revision=0 then
  insert into public.recetario_data(user_id,payload,revision)
   values(auth.uid(),p_payload,1) on conflict(user_id) do nothing
   returning revision into new_revision;
 else
  update public.recetario_data set payload=p_payload,revision=revision+1,updated_at=now()
   where user_id=auth.uid() and revision=p_revision returning revision into new_revision;
 end if;
 if new_revision is null then raise exception 'revision conflict'; end if;
 return new_revision;
end; $$;
revoke all on function public.save_recetario(jsonb,bigint) from public, anon;
grant execute on function public.save_recetario(jsonb,bigint) to authenticated;
