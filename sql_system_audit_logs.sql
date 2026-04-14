-- Auditoria de seguranca - Nivel Governo
-- Tabela central de rastreabilidade para acoes criticas do sistema

create table if not exists public.system_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.enterprise_tenants(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  acao text not null check (acao in ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT')),
  tabela_afetada text not null,
  detalhes_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_system_audit_logs_tenant_created
  on public.system_audit_logs (tenant_id, created_at desc);

create index if not exists idx_system_audit_logs_user_created
  on public.system_audit_logs (user_id, created_at desc);

create index if not exists idx_system_audit_logs_acao
  on public.system_audit_logs (acao);

alter table public.system_audit_logs enable row level security;

drop policy if exists system_audit_logs_insert_tenant_scope on public.system_audit_logs;
create policy system_audit_logs_insert_tenant_scope
on public.system_audit_logs
for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  or public.is_super_admin()
);

drop policy if exists system_audit_logs_select_super_admin on public.system_audit_logs;
create policy system_audit_logs_select_super_admin
on public.system_audit_logs
for select
to authenticated
using (public.is_super_admin());

drop policy if exists system_audit_logs_select_admin_tenant on public.system_audit_logs;
create policy system_audit_logs_select_admin_tenant
on public.system_audit_logs
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'super_admin')
  and (
    public.is_super_admin()
    or tenant_id = public.current_tenant_id()
  )
);