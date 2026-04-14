-- =============================================================
-- CRM REESTRUTURAÇÃO MARTECH — UNIRP PLATAFORMA
-- Execute no Supabase Dashboard → SQL Editor
-- Compatível com a migração anterior (sql_martech_crm_upgrade.sql)
-- =============================================================

-- ---------------------------------------------------------------
-- ETAPA 1: Novas colunas
-- ---------------------------------------------------------------

ALTER TABLE enterprise_jornalistas
  ADD COLUMN IF NOT EXISTS categoria_matriz TEXT,
  ADD COLUMN IF NOT EXISTS tags_dinamicas   TEXT[] DEFAULT '{}';

-- data_nascimento já existe na tabela original — garantir o tipo DATE
-- (se já for DATE, o comando abaixo não altera nada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_jornalistas'
      AND column_name = 'data_nascimento'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE enterprise_jornalistas
      ALTER COLUMN data_nascimento TYPE DATE USING data_nascimento::date;
  END IF;
END $$;

-- ---------------------------------------------------------------
-- ETAPA 2: Atualizar constraint de grau_influencia
--          Sessão anterior usava 'Destaque', agora é 'Alto'
-- ---------------------------------------------------------------

-- Remove o constraint antigo (se existir)
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  JOIN pg_class ON conrelid = pg_class.oid
  JOIN pg_attribute ON attrelid = pg_class.oid AND attnum = ANY (conkey)
  WHERE pg_class.relname = 'enterprise_jornalistas'
    AND attname = 'grau_influencia'
    AND contype = 'c'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE enterprise_jornalistas DROP CONSTRAINT ' || quote_ident(v_constraint_name);
  END IF;
END $$;

-- Migra dados antigos 'Destaque' → 'Alto'
UPDATE enterprise_jornalistas
SET grau_influencia = 'Alto'
WHERE grau_influencia = 'Destaque';

-- Recria constraint com os valores corretos
ALTER TABLE enterprise_jornalistas
  ADD CONSTRAINT ej_grau_influencia_check
    CHECK (grau_influencia IN ('Alto', 'Médio', 'Baixo'));

-- ---------------------------------------------------------------
-- ETAPA 3: Índices para os novos campos
-- ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ej_tenant_categoria_matriz
  ON enterprise_jornalistas (tenant_id, categoria_matriz)
  WHERE categoria_matriz IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ej_tags_dinamicas_gin
  ON enterprise_jornalistas USING GIN (tags_dinamicas);

-- Recria índice de grau_influencia (nome pode ter mudado)
CREATE INDEX IF NOT EXISTS idx_ej_tenant_grau_influencia
  ON enterprise_jornalistas (tenant_id, grau_influencia)
  WHERE grau_influencia IS NOT NULL;

-- ---------------------------------------------------------------
-- ETAPA 4: Verificação
-- ---------------------------------------------------------------

SELECT
  id,
  nome,
  categoria_matriz,
  tags_dinamicas,
  grau_influencia,
  engajamento_calor,
  status_jornada,
  data_nascimento,
  tenant_id
FROM enterprise_jornalistas
ORDER BY created_at DESC
LIMIT 20;
