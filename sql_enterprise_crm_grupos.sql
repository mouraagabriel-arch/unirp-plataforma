create table if not exists enterprise_crm_grupos (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    ambiente text not null default 'padrao',
    jornalistas_ids uuid[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table enterprise_crm_grupos
    add column if not exists nome text;

alter table enterprise_crm_grupos
    add column if not exists ambiente text default 'padrao';

alter table enterprise_crm_grupos
    add column if not exists jornalistas_ids uuid[] default '{}';

alter table enterprise_crm_grupos
    add column if not exists created_at timestamptz default now();

alter table enterprise_crm_grupos
    add column if not exists updated_at timestamptz default now();

create index if not exists idx_enterprise_crm_grupos_ambiente
    on enterprise_crm_grupos (ambiente);

create index if not exists idx_enterprise_crm_grupos_nome
    on enterprise_crm_grupos (nome);

-- ─────────────────────────────────────────────────────────────
-- RLS — Blindagem multi-tenant
-- ─────────────────────────────────────────────────────────────
alter table enterprise_crm_grupos enable row level security;

drop policy if exists enterprise_crm_grupos_super_admin_all on public.enterprise_crm_grupos;
create policy enterprise_crm_grupos_super_admin_all
  on public.enterprise_crm_grupos for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists enterprise_crm_grupos_tenant_scope on public.enterprise_crm_grupos;
create policy enterprise_crm_grupos_tenant_scope
  on public.enterprise_crm_grupos for all
  using (ambiente = public.current_tenant_id()::text)
  with check (ambiente = public.current_tenant_id()::text);
