-- ORBE: pedidos de demonstração da landing (já aplicado no projeto syiwgiaezobzmeyugajr em 2026-11-13)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 120),
  email text not null check (char_length(email) between 3 and 255),
  empresa text not null check (char_length(empresa) between 1 and 160),
  whatsapp text not null check (char_length(whatsapp) between 10 and 20),
  faixa_parceiros text not null check (faixa_parceiros in ('Até 10','11 a 30','31 a 100','Mais de 100')),
  plano_interesse text not null check (plano_interesse in ('Ainda não sei','Essencial','Gratuito','Pro','Completo')),
  como_acompanham text check (como_acompanham is null or char_length(como_acompanham) <= 1000),
  origem text check (origem is null or char_length(origem) <= 500),
  utm_source text check (utm_source is null or char_length(utm_source) <= 200),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 200),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 200)
);
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon, authenticated;
drop policy if exists "Visitantes podem enviar leads" on public.leads;
create policy "Visitantes podem enviar leads" on public.leads for insert to anon, authenticated with check (true);
