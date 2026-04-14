-- Migration: Adicionar coluna abrangencia_geografica em enterprise_clipping
-- Data: 2024
-- Descrição: Adiciona suporte para filtrar notícias por escopo geográfico (Nacional/Internacional)

ALTER TABLE enterprise_clipping
ADD COLUMN IF NOT EXISTS abrangencia_geografica VARCHAR(50) DEFAULT 'Brasil';

-- Criar índice para melhorar performance de queries por abrangência
CREATE INDEX IF NOT EXISTS idx_enterprise_clipping_abrangencia 
ON enterprise_clipping(tenant_id, abrangencia_geografica);

-- Comentário para documentação
COMMENT ON COLUMN enterprise_clipping.abrangencia_geografica IS 
'Escopo geográfico da notícia: Brasil (Nacional) ou país específico (Internacional). Padrão: Brasil';
