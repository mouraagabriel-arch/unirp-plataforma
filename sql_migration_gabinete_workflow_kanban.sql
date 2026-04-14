-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: garante estrutura completa de gabinete_workflow_tarefas
-- para suportar o Kanban (status_coluna, responsavel, prioridade)
-- Execute no painel SQL do Supabase
-- ─────────────────────────────────────────────────────────────────────────────

-- Cria a tabela se ainda não existir
CREATE TABLE IF NOT EXISTS public.gabinete_workflow_tarefas (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text        NOT NULL,
  descricao    text,
  data         text,
  tenant_id    uuid        REFERENCES public.enterprise_tenants(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now()
);

-- Adiciona colunas Kanban (idempotente: ADD COLUMN IF NOT EXISTS)
ALTER TABLE public.gabinete_workflow_tarefas
  ADD COLUMN IF NOT EXISTS tenant_id     uuid        REFERENCES public.enterprise_tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS responsavel   text        DEFAULT 'Vereador',
  ADD COLUMN IF NOT EXISTS prioridade    text        NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS status_coluna text        NOT NULL DEFAULT 'todo';

-- CHECK constraints separados (safe para tabelas com dados existentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gabinete_workflow_tarefas_prioridade_check'
  ) THEN
    ALTER TABLE public.gabinete_workflow_tarefas
      ADD CONSTRAINT gabinete_workflow_tarefas_prioridade_check
      CHECK (prioridade IN ('alta', 'media', 'baixa'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gabinete_workflow_tarefas_status_check'
  ) THEN
    ALTER TABLE public.gabinete_workflow_tarefas
      ADD CONSTRAINT gabinete_workflow_tarefas_status_check
      CHECK (status_coluna IN ('todo', 'doing', 'review', 'done'));
  END IF;
END $$;

-- Índices para performance multi-tenant
CREATE INDEX IF NOT EXISTS idx_gabinete_workflow_tenant
  ON public.gabinete_workflow_tarefas (tenant_id);

CREATE INDEX IF NOT EXISTS idx_gabinete_workflow_status
  ON public.gabinete_workflow_tarefas (status_coluna);

-- RLS (garante que cada tenant só vê suas próprias tarefas)
ALTER TABLE public.gabinete_workflow_tarefas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_gabinete_workflow" ON public.gabinete_workflow_tarefas;
CREATE POLICY "tenant_isolation_gabinete_workflow"
  ON public.gabinete_workflow_tarefas
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  );
