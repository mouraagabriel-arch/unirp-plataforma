-- =============================================================
-- CRM MARTECH UPGRADE — UNIRP PLATAFORMA
-- Adiciona colunas estratégicas de MarTech na tabela enterprise_jornalistas
-- Execute no Supabase Dashboard → SQL Editor
-- =============================================================

-- ---------------------------------------------------------------
-- ETAPA 1: Adicionar colunas MarTech
-- ---------------------------------------------------------------

ALTER TABLE enterprise_jornalistas
  ADD COLUMN IF NOT EXISTS grau_influencia   TEXT
    CHECK (grau_influencia   IN ('Destaque', 'Médio', 'Baixo')),
  ADD COLUMN IF NOT EXISTS engajamento_calor TEXT
    CHECK (engajamento_calor IN ('Frio', 'Morno', 'Quente')),
  ADD COLUMN IF NOT EXISTS interesses        TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status_jornada    TEXT
    CHECK (status_jornada    IN ('Lead', 'Relacionamento Ativo', 'Multiplicador'));

-- ---------------------------------------------------------------
-- ETAPA 2: Índices para segmentação com alta performance
-- ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ej_tenant_grau_influencia
  ON enterprise_jornalistas (tenant_id, grau_influencia)
  WHERE grau_influencia IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ej_tenant_engajamento_calor
  ON enterprise_jornalistas (tenant_id, engajamento_calor)
  WHERE engajamento_calor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ej_tenant_status_jornada
  ON enterprise_jornalistas (tenant_id, status_jornada)
  WHERE status_jornada IS NOT NULL;

-- Índice GIN para busca eficiente dentro do array de interesses
CREATE INDEX IF NOT EXISTS idx_ej_interesses_gin
  ON enterprise_jornalistas USING GIN (interesses);

-- ---------------------------------------------------------------
-- ETAPA 3: Verificação — consulta os contatos com os novos campos
-- ---------------------------------------------------------------

SELECT
  id,
  nome,
  grau_influencia,
  engajamento_calor,
  interesses,
  status_jornada,
  tenant_id
FROM enterprise_jornalistas
ORDER BY created_at DESC
LIMIT 20;

-- ---------------------------------------------------------------
-- OPCIONAL: Popular dados de exemplo para testes
-- Substitua <SEU_TENANT_ID> pelo UUID do seu tenant antes de rodar
-- ---------------------------------------------------------------
/*
UPDATE enterprise_jornalistas
SET
  grau_influencia   = CASE
    WHEN random() < 0.3 THEN 'Destaque'
    WHEN random() < 0.6 THEN 'Médio'
    ELSE 'Baixo'
  END,
  engajamento_calor = CASE
    WHEN random() < 0.3 THEN 'Quente'
    WHEN random() < 0.6 THEN 'Morno'
    ELSE 'Frio'
  END,
  status_jornada    = CASE
    WHEN random() < 0.33 THEN 'Lead'
    WHEN random() < 0.66 THEN 'Relacionamento Ativo'
    ELSE 'Multiplicador'
  END,
  interesses        = ARRAY['Saúde', 'Política']
WHERE tenant_id = '<SEU_TENANT_ID>';
*/
