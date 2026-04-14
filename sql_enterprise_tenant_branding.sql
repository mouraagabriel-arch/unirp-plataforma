-- Suporte de branding por tenant (idempotente)
ALTER TABLE public.enterprise_tenants
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Opcional: cor padrão para tenants sem personalização
UPDATE public.enterprise_tenants
SET primary_color = '#6366f1'
WHERE primary_color IS NULL OR trim(primary_color) = '';
