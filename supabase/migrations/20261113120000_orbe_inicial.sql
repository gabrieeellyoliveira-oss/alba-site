-- Orbe: contas, planos e templates gratuitos (parceiros + vendas por mês)

-- Perfis (um por usuário) ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  empresa text,
  plano text not null default 'gratuito' check (plano in ('gratuito', 'pro')),
  templates text[] not null default '{}',
  criado_em timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "perfil: editar o próprio" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- O usuário só altera nome, empresa e templates. O plano só muda por SQL (admin).
revoke update on public.profiles from authenticated, anon;
grant update (nome, empresa, templates) on public.profiles to authenticated;

-- Cria o perfil quando a conta nasce
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, empresa)
  values (new.id, new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'empresa')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

-- Parceiros -----------------------------------------------------------------
create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  tipo text check (char_length(tipo) <= 60),
  cidade text check (char_length(cidade) <= 80),
  status text not null default 'ativo' check (status in ('onboarding', 'ativo', 'parado')),
  entrou_em date not null default current_date,
  criado_em timestamptz not null default now()
);
create index if not exists parceiros_user_idx on public.parceiros (user_id);
alter table public.parceiros enable row level security;

create policy "parceiros: dono lê" on public.parceiros for select to authenticated using (user_id = auth.uid());
create policy "parceiros: dono cria" on public.parceiros for insert to authenticated with check (user_id = auth.uid());
create policy "parceiros: dono edita" on public.parceiros for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "parceiros: dono apaga" on public.parceiros for delete to authenticated using (user_id = auth.uid());

-- Limite do plano gratuito: até 10 parceiros
create or replace function public.checar_limite_plano()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plano text;
  v_total int;
begin
  select plano into v_plano from public.profiles where id = new.user_id;
  if coalesce(v_plano, 'gratuito') = 'gratuito' then
    select count(*) into v_total from public.parceiros where user_id = new.user_id;
    if v_total >= 10 then
      raise exception 'LIMITE_GRATUITO: o plano gratuito permite até 10 parceiros' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists limite_plano on public.parceiros;
create trigger limite_plano before insert on public.parceiros
  for each row execute function public.checar_limite_plano();

-- Resultados por mês de cada parceiro -----------------------------------------
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parceiro_id uuid not null references public.parceiros (id) on delete cascade,
  mes date not null check (extract(day from mes) = 1),
  clientes int not null default 0 check (clientes >= 0),
  valor numeric(14, 2) not null default 0 check (valor >= 0),
  criado_em timestamptz not null default now(),
  unique (parceiro_id, mes)
);
create index if not exists vendas_user_mes_idx on public.vendas (user_id, mes);
alter table public.vendas enable row level security;

create policy "vendas: dono lê" on public.vendas for select to authenticated using (user_id = auth.uid());
create policy "vendas: dono cria" on public.vendas for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.parceiros p where p.id = parceiro_id and p.user_id = auth.uid()));
create policy "vendas: dono edita" on public.vendas for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "vendas: dono apaga" on public.vendas for delete to authenticated using (user_id = auth.uid());
