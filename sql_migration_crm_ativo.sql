
ALTER TABLE enterprise_jornalistas
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS status_financeiro VARCHAR(50) DEFAULT 'Em dia',
ADD COLUMN IF NOT EXISTS categorias JSONB DEFAULT '["Jornalista"]',
ADD COLUMN IF NOT EXISTS tenant_id UUID;

CREATE INDEX IF NOT EXISTS idx_enterprise_crm_status_financeiro 
ON enterprise_jornalistas(tenant_id, status_financeiro);

CREATE INDEX IF NOT EXISTS idx_enterprise_crm_nascimento 
ON enterprise_jornalistas(tenant_id, data_nascimento);

CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
  contato_id UUID NOT NULL REFERENCES enterprise_jornalistas(id) ON DELETE CASCADE,
  tipo_interacao VARCHAR(50) NOT NULL,
  resumo_mensagem TEXT,
  dados_estruturados JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_tenant_contato 
ON crm_interactions(tenant_id, contato_id);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_data 
ON crm_interactions(tenant_id, created_at DESC);

COMMENT ON COLUMN enterprise_jornalistas.data_nascimento IS 'Data de nascimento do contato para alertas de aniversário';
COMMENT ON COLUMN enterprise_jornalistas.status_financeiro IS 'Status financeiro: Em dia, Inadimplente, Pendência Cadastral';
COMMENT ON COLUMN enterprise_jornalistas.categorias IS 'Array JSON de categorias: Jornalista, Cidadão, Servidor, Liderança, etc.';

COMMENT ON TABLE crm_interactions IS 'Histórico de interações (emails, WhatsApp, etc) com contatos do CRM';
COMMENT ON COLUMN crm_interactions.tipo_interacao IS 'Tipo: email, whatsapp, ligacao, reunion, etc';
COMMENT ON COLUMN crm_interactions.dados_estruturados IS 'Dados estruturados da interação (timestamps, status delivery, etc)';

-- ─────────────────────────────────────────────────────────────
-- RLS — Blindagem multi-tenant via tenant_id (UUID)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_interactions_super_admin_all ON public.crm_interactions;
CREATE POLICY crm_interactions_super_admin_all
  ON public.crm_interactions FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS crm_interactions_tenant_scope ON public.crm_interactions;
CREATE POLICY crm_interactions_tenant_scope
  ON public.crm_interactions FOR ALL
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

