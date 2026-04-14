-- Extensoes para Cérebro Institucional e Clipping IA.
-- Idempotente: pode ser executado multiplas vezes.

ALTER TABLE IF EXISTS public.enterprise_settings
  ADD COLUMN IF NOT EXISTS porta_vozes_oficiais jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS clipping_monitoramento jsonb DEFAULT '{"focais": [], "contexto": []}'::jsonb;

ALTER TABLE IF EXISTS public.enterprise_clipping
  ADD COLUMN IF NOT EXISTS tonalidade_ia text,
  ADD COLUMN IF NOT EXISTS narrativa_ia text,
  ADD COLUMN IF NOT EXISTS risco_ia text,
  ADD COLUMN IF NOT EXISTS monitor_tags jsonb DEFAULT '{"focais": [], "contexto": []}'::jsonb;

DO $$
BEGIN
  IF to_regclass('public.enterprise_clipping') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'enterprise_clipping_risco_ia_check'
    ) THEN
      ALTER TABLE public.enterprise_clipping
        ADD CONSTRAINT enterprise_clipping_risco_ia_check
        CHECK (risco_ia IS NULL OR risco_ia IN ('baixo', 'medio', 'alto', 'critico'));
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'enterprise_clipping_tonalidade_ia_check'
    ) THEN
      ALTER TABLE public.enterprise_clipping
        ADD CONSTRAINT enterprise_clipping_tonalidade_ia_check
        CHECK (tonalidade_ia IS NULL OR tonalidade_ia IN ('favoravel', 'neutra', 'hostil'));
    END IF;
  END IF;
END
$$;
