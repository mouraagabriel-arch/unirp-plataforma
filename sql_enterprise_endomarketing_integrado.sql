-- Endomarketing Integrado | EnterpriseComunicacao
-- Execute este script no SQL Editor do Supabase

-- 1) Comunicados
create table if not exists enterprise_comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensagem text,
  secretaria_alvo text,
  canal_envio text,
  data_programada timestamptz,
  autor_id text,
  publico_alvo text,
  badge text default 'Publicado',
  autor text default 'Sistema',
  ambiente text not null default 'padrao',
  created_at timestamptz default now()
);

alter table enterprise_comunicados add column if not exists titulo text;
alter table enterprise_comunicados add column if not exists mensagem text;
alter table enterprise_comunicados add column if not exists secretaria_alvo text;
alter table enterprise_comunicados add column if not exists canal_envio text;
alter table enterprise_comunicados add column if not exists data_programada timestamptz;
alter table enterprise_comunicados add column if not exists autor_id text;
alter table enterprise_comunicados add column if not exists ambiente text not null default 'padrao';
alter table enterprise_comunicados add column if not exists publico_alvo text;
alter table enterprise_comunicados add column if not exists badge text default 'Publicado';
alter table enterprise_comunicados add column if not exists autor text default 'Sistema';

create index if not exists idx_enterprise_comunicados_ambiente on enterprise_comunicados (ambiente);
create index if not exists idx_enterprise_comunicados_secretaria on enterprise_comunicados (secretaria_alvo);
create index if not exists idx_enterprise_comunicados_programacao on enterprise_comunicados (data_programada);

-- 2) Pesquisas
create table if not exists enterprise_pesquisas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug_url text not null unique,
  perguntas jsonb not null default '[]'::jsonb,
  status text not null default 'Ativa',
  ambiente text not null default 'padrao',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint chk_enterprise_pesquisas_status check (status in ('Ativa', 'Encerrada'))
);

alter table enterprise_pesquisas add column if not exists titulo text;
alter table enterprise_pesquisas add column if not exists slug_url text;
alter table enterprise_pesquisas add column if not exists perguntas jsonb default '[]'::jsonb;
alter table enterprise_pesquisas add column if not exists status text default 'Ativa';
alter table enterprise_pesquisas add column if not exists ambiente text not null default 'padrao';
alter table enterprise_pesquisas add column if not exists created_at timestamptz default now();
alter table enterprise_pesquisas add column if not exists updated_at timestamptz default now();

create unique index if not exists uq_enterprise_pesquisas_slug on enterprise_pesquisas (slug_url);
create index if not exists idx_enterprise_pesquisas_ambiente on enterprise_pesquisas (ambiente);
create index if not exists idx_enterprise_pesquisas_status on enterprise_pesquisas (status);

-- 3) Respostas da pesquisa
create table if not exists enterprise_pesquisa_respostas (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references enterprise_pesquisas(id) on delete cascade,
  secretaria_id text,
  satisfacao integer,
  respostas jsonb default '{}'::jsonb,
  resposta_texto text,
  ambiente text not null default 'padrao',
  created_at timestamptz default now(),
  constraint chk_enterprise_pesquisa_satisfacao check (satisfacao is null or satisfacao between 1 and 5)
);

alter table enterprise_pesquisa_respostas add column if not exists pesquisa_id uuid;
alter table enterprise_pesquisa_respostas add column if not exists secretaria_id text;
alter table enterprise_pesquisa_respostas add column if not exists satisfacao integer;
alter table enterprise_pesquisa_respostas add column if not exists respostas jsonb default '{}'::jsonb;
alter table enterprise_pesquisa_respostas add column if not exists resposta_texto text;
alter table enterprise_pesquisa_respostas add column if not exists ambiente text not null default 'padrao';
alter table enterprise_pesquisa_respostas add column if not exists created_at timestamptz default now();

create index if not exists idx_enterprise_pesquisa_resp_pesquisa on enterprise_pesquisa_respostas (pesquisa_id);
create index if not exists idx_enterprise_pesquisa_resp_secretaria on enterprise_pesquisa_respostas (secretaria_id);
create index if not exists idx_enterprise_pesquisa_resp_ambiente on enterprise_pesquisa_respostas (ambiente);

-- 4) Campanhas + conexão com workflow
create table if not exists enterprise_campanhas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  objetivo text,
  data_inicio date,
  data_fim date,
  secretaria text,
  progresso integer default 0,
  status text default 'planejado',
  prioridade text default 'media',
  ambiente text not null default 'padrao',
  created_at timestamptz default now()
);

alter table enterprise_campanhas add column if not exists objetivo text;
alter table enterprise_campanhas add column if not exists ambiente text not null default 'padrao';

-- vinculo opcional no workflow
alter table enterprise_pautas add column if not exists campanha_id uuid references enterprise_campanhas(id) on delete set null;
create index if not exists idx_enterprise_pautas_campanha_id on enterprise_pautas (campanha_id);
create index if not exists idx_enterprise_campanhas_ambiente on enterprise_campanhas (ambiente);

-- ─────────────────────────────────────────────────────────────
-- RLS — Blindagem multi-tenant (OBRIGATÓRIO para dados governamentais)
-- ─────────────────────────────────────────────────────────────
alter table enterprise_pesquisas          enable row level security;
alter table enterprise_pesquisa_respostas enable row level security;
alter table enterprise_campanhas          enable row level security;
alter table enterprise_comunicados        enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'enterprise_pesquisas', 'enterprise_pesquisa_respostas',
    'enterprise_campanhas', 'enterprise_comunicados'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_super_admin_all', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      t || '_super_admin_all', t
    );
    execute format('drop policy if exists %I on public.%I', t || '_tenant_scope', t);
    execute format(
      'create policy %I on public.%I for all using (ambiente = public.current_tenant_id()::text) with check (ambiente = public.current_tenant_id()::text)',
      t || '_tenant_scope', t
    );
  end loop;
end;
$$;

