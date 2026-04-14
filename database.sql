-- uniRP Enterprise - Database Schema (PostgreSQL / Supabase)
-- Created: 2026-03-16
-- Description: Enterprise-grade schema for PR Agency Management

-- 1. Perfil da Agência (Cérebro Institucional)
CREATE TABLE perfil_agencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_instituicao TEXT NOT NULL,
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#2563eb',
    cor_secundaria TEXT DEFAULT '#1e293b',
    missao TEXT,
    visao TEXT,
    valores TEXT,
    historico TEXT,
    tom_voz TEXT,
    config_ia JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRM de Imprensa (Contatos e Mailing)
CREATE TABLE crm_contatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    veiculo TEXT,
    editoria TEXT,
    email TEXT UNIQUE,
    telefone TEXT,
    status_lgpd TEXT DEFAULT 'pendente', -- 'autorizado', 'pendente', 'opt-out'
    tags TEXT[],
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hub de Influenciadores
CREATE TABLE hub_influenciadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    nicho TEXT,
    seguidores TEXT,
    engajamento NUMERIC,
    cache_medio NUMERIC,
    redes_sociais JSONB, -- { "instagram": "url", "tiktok": "url", ... }
    historico_campanhas JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Workflow Kanban (Colunas e Cards)
CREATE TABLE workflow_colunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL, -- 'pautas', 'producao', etc
    titulo TEXT NOT NULL,
    cor TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coluna_id UUID REFERENCES workflow_colunas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tags JSONB DEFAULT '[]',
    responsaveis TEXT[],
    links JSONB DEFAULT '[]',
    anexos JSONB DEFAULT '[]',
    status_publicacao BOOLEAN DEFAULT FALSE,
    logs_atividade JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inteligência de Atas (Meeting AI)
CREATE TABLE atas_inteligentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    data_reuniao DATE DEFAULT CURRENT_DATE,
    participantes TEXT[],
    transcricao_completa TEXT,
    resumo_executivo TEXT,
    action_items JSONB DEFAULT '[]', -- [ { "text": "...", "status": "...", "card_id": "..." } ]
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Planejamento Estratégico (Meu Plano)
CREATE TABLE plano_estrategico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    objetivo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    progresso INTEGER DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SECURITY POLICIES (Row Level Security)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE perfil_agencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_influenciadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_colunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas_inteligentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_estrategico ENABLE ROW LEVEL SECURITY;

-- Create Policies (User can only see/edit their own data)
CREATE POLICY "Users can manage their own agency profile" ON perfil_agencia
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CRM contacts" ON crm_contatos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own influencers" ON hub_influenciadores
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workflow columns" ON workflow_colunas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workflow cards" ON workflow_cards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meeting minutes" ON atas_inteligentes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own strategic plan" ON plano_estrategico
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfil_agencia_modtime BEFORE UPDATE ON perfil_agencia FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workflow_cards_modtime BEFORE UPDATE ON workflow_cards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- ENTERPRISE CRM - JORNALISTAS
-- ==========================================
CREATE TABLE enterprise_jornalistas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    veiculo text,
    cargo text,
    email text,
    telefone text,
    regiao text,
    tags text[],
    status text DEFAULT 'ativo',
    created_at timestamptz DEFAULT now()
);
