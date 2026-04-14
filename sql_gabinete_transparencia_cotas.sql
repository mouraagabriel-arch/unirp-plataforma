-- Tabela de persistencia financeira do modulo Gabinete (Cota Parlamentar)
-- Execute no SQL Editor do Supabase

create table if not exists public.gabinete_transparencia_cotas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.enterprise_tenants(id) on delete cascade,
  categoria text not null,
  usado numeric not null default 0,
  limite numeric,
  data_lancamento date,
  comprovante_nome text,
  ambiente text not null default 'gabinete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, categoria)
);

-- Garante colunas em cenarios onde a tabela ja existia sem tenant_id
alter table public.gabinete_transparencia_cotas
  add column if not exists tenant_id uuid;

alter table public.gabinete_transparencia_cotas
  add column if not exists categoria text;

alter table public.gabinete_transparencia_cotas
  add column if not exists usado numeric not null default 0;

alter table public.gabinete_transparencia_cotas
  add column if not exists limite numeric;

alter table public.gabinete_transparencia_cotas
  add column if not exists data_lancamento date;

alter table public.gabinete_transparencia_cotas
  add column if not exists comprovante_nome text;

alter table public.gabinete_transparencia_cotas
  add column if not exists ambiente text not null default 'gabinete';

alter table public.gabinete_transparencia_cotas
  add column if not exists created_at timestamptz not null default now();

alter table public.gabinete_transparencia_cotas
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_gabinete_transparencia_cotas_tenant'
  ) then
    alter table public.gabinete_transparencia_cotas
      add constraint fk_gabinete_transparencia_cotas_tenant
      foreign key (tenant_id)
      references public.enterprise_tenants(id)
      on delete cascade;
  end if;
end;
$$;

create unique index if not exists uq_gabinete_transparencia_cotas_tenant_categoria
  on public.gabinete_transparencia_cotas (tenant_id, categoria);

create index if not exists idx_gabinete_transparencia_cotas_tenant_id
  on public.gabinete_transparencia_cotas (tenant_id);

create index if not exists idx_gabinete_transparencia_cotas_ambiente
  on public.gabinete_transparencia_cotas (ambiente);

alter table public.gabinete_transparencia_cotas enable row level security;

drop policy if exists gabinete_transparencia_cotas_super_admin_all on public.gabinete_transparencia_cotas;
create policy gabinete_transparencia_cotas_super_admin_all
on public.gabinete_transparencia_cotas
for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists gabinete_transparencia_cotas_tenant_scope on public.gabinete_transparencia_cotas;
create policy gabinete_transparencia_cotas_tenant_scope
on public.gabinete_transparencia_cotas
for all
using (tenant_id = public.current_tenant_id())
with check (tenant_id = public.current_tenant_id());
