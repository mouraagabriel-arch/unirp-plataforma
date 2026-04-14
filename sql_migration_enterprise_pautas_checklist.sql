-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: adiciona colunas deadline, checklist e attachments à enterprise_pautas
-- Execute no painel SQL do Supabase
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.enterprise_pautas
  ADD COLUMN IF NOT EXISTS deadline     date     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS checklist    jsonb    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments  integer  DEFAULT 0;
