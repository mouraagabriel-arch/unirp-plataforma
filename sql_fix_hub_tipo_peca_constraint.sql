-- =============================================================
-- FIX: enterprise_demandas — constraint tipo_peca
-- Problema: violates check constraint "enterprise_demandas_tipo_peca_check"
-- Causa: o Front-end envia valores que não estavam na constraint original
-- Execute no Supabase Dashboard → SQL Editor
-- =============================================================

-- ---------------------------------------------------------------
-- ETAPA 1: Remover constraint antigo de tipo_peca (qualquer nome)
-- ---------------------------------------------------------------
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  FOR v_constraint IN
    SELECT conname
    FROM pg_constraint
    JOIN pg_class ON conrelid = pg_class.oid
    JOIN pg_attribute ON attrelid = pg_class.oid AND attnum = ANY(conkey)
    WHERE pg_class.relname = 'enterprise_demandas'
      AND attname = 'tipo_peca'
      AND contype = 'c'
  LOOP
    EXECUTE 'ALTER TABLE enterprise_demandas DROP CONSTRAINT ' || quote_ident(v_constraint);
    RAISE NOTICE 'Dropped constraint: %', v_constraint;
  END LOOP;
END $$;

-- ---------------------------------------------------------------
-- ETAPA 2: Remover constraint de status_ticket (recriar limpo)
-- ---------------------------------------------------------------
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  FOR v_constraint IN
    SELECT conname
    FROM pg_constraint
    JOIN pg_class ON conrelid = pg_class.oid
    JOIN pg_attribute ON attrelid = pg_class.oid AND attnum = ANY(conkey)
    WHERE pg_class.relname = 'enterprise_demandas'
      AND attname = 'status_ticket'
      AND contype = 'c'
  LOOP
    EXECUTE 'ALTER TABLE enterprise_demandas DROP CONSTRAINT ' || quote_ident(v_constraint);
    RAISE NOTICE 'Dropped status_ticket constraint: %', v_constraint;
  END LOOP;
END $$;

-- ---------------------------------------------------------------
-- ETAPA 3: Recriar constraints com TODOS os valores permitidos
-- ---------------------------------------------------------------

-- tipo_peca: todos os valores enviados pelo Hub
ALTER TABLE enterprise_demandas
  ADD CONSTRAINT enterprise_demandas_tipo_peca_check
    CHECK (tipo_peca IS NULL OR tipo_peca IN (
      'Release',
      'Nota Oficial',
      'Matéria para Blog',
      'Script de Rádio/Vídeo',
      'Post para Redes Sociais',
      'Post Social',
      'Social',
      'Outros'
    ));

-- status_ticket: mantém os valores originais + extensível
ALTER TABLE enterprise_demandas
  ADD CONSTRAINT enterprise_demandas_status_ticket_check
    CHECK (status_ticket IN (
      'triagem',
      'producao',
      'revisao',
      'entregue',
      'arquivado'
    ));

-- ---------------------------------------------------------------
-- ETAPA 4: Verificação dos constraints ativos
-- ---------------------------------------------------------------
SELECT
  conname   AS constraint_name,
  pg_get_constraintdef(pg_constraint.oid) AS definition
FROM pg_constraint
JOIN pg_class ON conrelid = pg_class.oid
WHERE pg_class.relname = 'enterprise_demandas'
  AND contype = 'c'
ORDER BY conname;
