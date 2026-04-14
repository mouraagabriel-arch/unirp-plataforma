-- =============================================================
-- SCRIPT SQL DEFINITIVO — MÓDULO ENTERPRISE (v2 — CORRIGIDO)
-- Gerado em: 2026-03-31
-- Projeto: unirp-plataforma
-- DBA: Auditoria automática do front-end (src/components/enterprise)
-- Padrão: Multi-tenant via coluna `ambiente` (default 'padrao')
-- Executar no: SQL Editor do Supabase
--
-- REGRA DE OURO APLICADA:
--   Para cada tabela, a sequência obrigatória é:
--     1. CREATE TABLE IF NOT EXISTS  (cria se não existir, com `ambiente`)
--     2. ALTER TABLE … ADD COLUMN IF NOT EXISTS ambiente  (garante a coluna
--        em tabelas que JÁ EXISTIAM sem ela — é no-op se já existir)
--     3. CREATE INDEX / CREATE UNIQUE INDEX  (só executados DEPOIS que a
--        coluna está garantida nos passos anteriores)
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. enterprise_pautas  (EnterpriseWorkflow.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_pautas (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        text        NOT NULL,
  descricao     text,
  prioridade    text        NOT NULL DEFAULT 'media'
                              CHECK (prioridade IN ('alta', 'media', 'baixa')),
  responsavel   text,
  tags          text[]      DEFAULT '{}',
  status_coluna text        NOT NULL DEFAULT 'backlog'
                              CHECK (status_coluna IN ('backlog', 'doing', 'review', 'done')),
  prazo_texto   text,
  deadline      text,
  attachments   integer     DEFAULT 0,
  ambiente      text        NOT NULL DEFAULT 'padrao',
  created_at    timestamptz DEFAULT now()
);

-- Garante a coluna em tabelas pré-existentes sem ela
ALTER TABLE enterprise_pautas
  ADD COLUMN IF NOT EXISTS ambiente text NOT NULL DEFAULT 'padrao';

CREATE INDEX IF NOT EXISTS idx_enterprise_pautas_ambiente
  ON enterprise_pautas (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 2. enterprise_atas  (EnterpriseAtas.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_atas (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_reuniao        text        NOT NULL,
  participantes_texto text,
  status_transcricao  text        DEFAULT 'processing'
                        CHECK (status_transcricao IN ('processing', 'done', 'error')),
  duracao             text,
  tags                text[]      DEFAULT '{}',
  ambiente            text        NOT NULL DEFAULT 'padrao',
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE enterprise_atas
  ADD COLUMN IF NOT EXISTS ambiente text NOT NULL DEFAULT 'padrao';

-- Outras colunas que podem faltar em tabelas pré-existentes
ALTER TABLE enterprise_atas
  ADD COLUMN IF NOT EXISTS participantes_texto text;

ALTER TABLE enterprise_atas
  ADD COLUMN IF NOT EXISTS status_transcricao  text DEFAULT 'processing';

CREATE INDEX IF NOT EXISTS idx_enterprise_atas_ambiente
  ON enterprise_atas (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 3. enterprise_clipping  (EnterpriseClipping.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_clipping (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo_materia   text        NOT NULL,
  fonte            text,
  data_publicacao  timestamptz DEFAULT now(),
  sentimento       text        CHECK (sentimento IN ('positivo', 'neutro', 'negativo')),
  resumo_ia        text,
  nota_resposta_ia text,
  link             text,
  origem           text        DEFAULT 'imprensa'
                     CHECK (origem IN ('imprensa', 'redes_sociais')),
  ambiente         text        NOT NULL DEFAULT 'padrao',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE enterprise_clipping
  ADD COLUMN IF NOT EXISTS ambiente         text NOT NULL DEFAULT 'padrao';

ALTER TABLE enterprise_clipping
  ADD COLUMN IF NOT EXISTS nota_resposta_ia text;

ALTER TABLE enterprise_clipping
  ADD COLUMN IF NOT EXISTS resumo_ia        text;

CREATE INDEX IF NOT EXISTS idx_enterprise_clipping_ambiente
  ON enterprise_clipping (ambiente);

CREATE INDEX IF NOT EXISTS idx_enterprise_clipping_data
  ON enterprise_clipping (data_publicacao DESC);


-- ─────────────────────────────────────────────────────────────
-- 4. enterprise_demandas  (EnterpriseHub.tsx + EnterpriseInfluenciadores.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_demandas (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_codigo          text        UNIQUE,
  titulo                 text        NOT NULL,
  secretaria_solicitante text,
  tipo_peca              text,
  prazo_texto            text,
  status_ticket          text        NOT NULL DEFAULT 'triagem'
                           CHECK (status_ticket IN
                             ('triagem', 'producao', 'revisao', 'entregue')),
  briefing               text,
  responsavel            text,
  prioridade             text        DEFAULT 'Média'
                           CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  ambiente               text        NOT NULL DEFAULT 'padrao',
  created_at             timestamptz DEFAULT now()
);

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS ambiente               text NOT NULL DEFAULT 'padrao';

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS ticket_codigo          text;

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS secretaria_solicitante text;

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS tipo_peca              text;

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS prazo_texto            text;

ALTER TABLE enterprise_demandas
  ADD COLUMN IF NOT EXISTS briefing               text;

CREATE INDEX IF NOT EXISTS idx_enterprise_demandas_ambiente
  ON enterprise_demandas (ambiente);

CREATE INDEX IF NOT EXISTS idx_enterprise_demandas_status
  ON enterprise_demandas (status_ticket);


-- ─────────────────────────────────────────────────────────────
-- 5. enterprise_relacionamento  (EnterpriseInfluenciadores.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_relacionamento (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text        NOT NULL,
  cargo      text,
  influencia text        DEFAULT 'Médio'
               CHECK (influencia IN ('Alto', 'Médio', 'Baixo')),
  regioes    text[]      DEFAULT '{}',
  resumo     text,
  prioridade text,
  canal      text,
  agenda     text,
  timeline   jsonb       DEFAULT '[]',
  ambiente   text        NOT NULL DEFAULT 'padrao',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enterprise_relacionamento
  ADD COLUMN IF NOT EXISTS ambiente  text  NOT NULL DEFAULT 'padrao';

ALTER TABLE enterprise_relacionamento
  ADD COLUMN IF NOT EXISTS timeline  jsonb DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_enterprise_relacionamento_ambiente
  ON enterprise_relacionamento (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 6. enterprise_cerebro_configuracao  (EnterpriseCerebro.tsx)
--    upsert usa onConflict: 'ambiente' → requer UNIQUE em ambiente
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_cerebro_configuracao (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color   text        DEFAULT '#2563EB',
  secondary_color text        DEFAULT '#1E293B',
  tone_directive  text        DEFAULT 'Institucional, técnico e acolhedor.',
  ambiente        text        NOT NULL DEFAULT 'padrao',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Passo 2: garante a coluna ANTES de criar o índice único
ALTER TABLE enterprise_cerebro_configuracao
  ADD COLUMN IF NOT EXISTS ambiente        text NOT NULL DEFAULT 'padrao';

ALTER TABLE enterprise_cerebro_configuracao
  ADD COLUMN IF NOT EXISTS primary_color   text DEFAULT '#2563EB';

ALTER TABLE enterprise_cerebro_configuracao
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#1E293B';

ALTER TABLE enterprise_cerebro_configuracao
  ADD COLUMN IF NOT EXISTS tone_directive  text DEFAULT 'Institucional, técnico e acolhedor.';

ALTER TABLE enterprise_cerebro_configuracao
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz DEFAULT now();

-- Passo 3: índice único (habilita o upsert onConflict: 'ambiente')
CREATE UNIQUE INDEX IF NOT EXISTS idx_cerebro_config_ambiente_unique
  ON enterprise_cerebro_configuracao (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 7. enterprise_sala_configuracao  (EnterpriseSalaImprensa.tsx)
--    upsert usa onConflict: 'pasta_id,ambiente' → requer UNIQUE(pasta_id, ambiente)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_sala_configuracao (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pasta_id   text        NOT NULL,
  visivel    boolean     NOT NULL DEFAULT true,
  ambiente   text        NOT NULL DEFAULT 'padrao',
  created_at timestamptz DEFAULT now()
);

-- Passo 2: garante a coluna ANTES de criar o índice único composto
ALTER TABLE enterprise_sala_configuracao
  ADD COLUMN IF NOT EXISTS ambiente text NOT NULL DEFAULT 'padrao';

-- Passo 3: índice único composto (habilita o upsert onConflict: 'pasta_id,ambiente')
CREATE UNIQUE INDEX IF NOT EXISTS idx_sala_config_pasta_ambiente_unique
  ON enterprise_sala_configuracao (pasta_id, ambiente);

CREATE INDEX IF NOT EXISTS idx_sala_config_ambiente
  ON enterprise_sala_configuracao (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 8. enterprise_jornalistas  (EnterpriseCRM.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_jornalistas (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text        NOT NULL,
  veiculo    text,
  cargo      text,
  email      text,
  telefone   text,
  regiao     text,
  tags       text[]      DEFAULT '{}',
  status     text        DEFAULT 'ativo'
               CHECK (status IN ('ativo', 'inativo')),
  ambiente   text        NOT NULL DEFAULT 'padrao',
  created_at timestamptz DEFAULT now()
);

-- Garante a coluna em tabelas pré-existentes (ex.: criadas via database.sql sem ambiente)
ALTER TABLE enterprise_jornalistas
  ADD COLUMN IF NOT EXISTS ambiente text NOT NULL DEFAULT 'padrao';

CREATE INDEX IF NOT EXISTS idx_enterprise_jornalistas_ambiente
  ON enterprise_jornalistas (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 9. enterprise_campanhas  (EnterprisePlanning.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_campanhas (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text        NOT NULL,
  data_inicio text,
  data_fim    text,
  secretaria  text,
  progresso   integer     DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  status      text        DEFAULT 'planejado'
                CHECK (status IN ('planejado', 'em_andamento', 'concluido')),
  prioridade  text        DEFAULT 'media'
                CHECK (prioridade IN ('alta', 'media', 'baixa')),
  ambiente    text        NOT NULL DEFAULT 'padrao',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE enterprise_campanhas
  ADD COLUMN IF NOT EXISTS ambiente text NOT NULL DEFAULT 'padrao';

CREATE INDEX IF NOT EXISTS idx_enterprise_campanhas_ambiente
  ON enterprise_campanhas (ambiente);


-- ─────────────────────────────────────────────────────────────
-- 10. enterprise_comunicados  (EnterpriseComunicacao.tsx)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprise_comunicados (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text        NOT NULL,
  publico_alvo text,
  mensagem     text,
  badge        text        DEFAULT 'Publicado',
  autor        text        DEFAULT 'Sistema',
  ambiente     text        NOT NULL DEFAULT 'padrao',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE enterprise_comunicados
  ADD COLUMN IF NOT EXISTS ambiente     text NOT NULL DEFAULT 'padrao';

ALTER TABLE enterprise_comunicados
  ADD COLUMN IF NOT EXISTS publico_alvo text;

ALTER TABLE enterprise_comunicados
  ADD COLUMN IF NOT EXISTS badge        text DEFAULT 'Publicado';

ALTER TABLE enterprise_comunicados
  ADD COLUMN IF NOT EXISTS autor        text DEFAULT 'Sistema';

CREATE INDEX IF NOT EXISTS idx_enterprise_comunicados_ambiente
  ON enterprise_comunicados (ambiente);


-- ─────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — ATIVO (blindagem multi-tenant via função current_tenant_id)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE enterprise_pautas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_atas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_clipping           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_demandas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_relacionamento     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_cerebro_configuracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_sala_configuracao  ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_jornalistas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_campanhas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_comunicados        ENABLE ROW LEVEL SECURITY;

-- Super-admin tem acesso irrestrito
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'enterprise_pautas','enterprise_atas','enterprise_clipping','enterprise_demandas',
    'enterprise_relacionamento','enterprise_cerebro_configuracao','enterprise_sala_configuracao',
    'enterprise_jornalistas','enterprise_campanhas','enterprise_comunicados'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_super_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin())',
      t || '_super_admin_all', t
    );
    -- Isolamento por tenant: cada tabela tem coluna `ambiente` mapeada ao tenant corrente
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant_scope', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (ambiente = public.current_tenant_id()::text) WITH CHECK (ambiente = public.current_tenant_id()::text)',
      t || '_tenant_scope', t
    );
  END LOOP;
END;
$$;

