-- uniRP Enterprise - Generated Database Schema (PostgreSQL / Supabase)
-- Based on reverse engineering of frontend code
-- Created: 2026-03-19

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (User Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'client',
    entity_type TEXT DEFAULT 'Gabinete Digital',
    active_profile TEXT DEFAULT 'Gabinete Digital',
    instituicoes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Settings (Institutional Brain)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    gemini_key TEXT,
    tom_de_voz TEXT,
    missao TEXT,
    visao TEXT,
    valores TEXT,
    historico TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Press Contacts (CRM)
CREATE TABLE IF NOT EXISTS press_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    veiculo TEXT,
    editoria TEXT,
    email TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Cabinet Demands (Citizen Demands)
CREATE TABLE IF NOT EXISTS cabinet_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cidadao TEXT NOT NULL,
    bairro TEXT,
    categoria TEXT,
    email TEXT,
    telefone TEXT,
    relato TEXT,
    status TEXT DEFAULT 'Pendente',
    origem TEXT DEFAULT 'form',
    data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Demands (Workflow Cards)
CREATE TABLE IF NOT EXISTS demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    coluna_id TEXT,
    responsaveis JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    links JSONB DEFAULT '[]',
    assets JSONB DEFAULT '[]',
    published BOOLEAN DEFAULT FALSE,
    logs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Hub Influenciadores
CREATE TABLE IF NOT EXISTS hub_influenciadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    nicho TEXT,
    seguidores TEXT,
    engajamento NUMERIC,
    cache NUMERIC,
    redes JSONB DEFAULT '[]',
    roi NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Atas Inteligentes (Meeting AI)
CREATE TABLE IF NOT EXISTS atas_inteligentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    data_reuniao DATE DEFAULT CURRENT_DATE,
    participantes TEXT[],
    transcricao_completa TEXT,
    resumo_executivo TEXT,
    action_items JSONB DEFAULT '[]',
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Plano Estratégico
CREATE TABLE IF NOT EXISTS plano_estrategico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    objetivo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    progresso INTEGER DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Workflow Colunas
CREATE TABLE IF NOT EXISTS workflow_colunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    titulo TEXT NOT NULL,
    cor TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Hub Contents (Content Hub)
CREATE TABLE IF NOT EXISTS hub_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    formato TEXT,
    status TEXT DEFAULT 'Rascunho',
    data TEXT,
    conteudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Press Assets (Brand Assets)
CREATE TABLE IF NOT EXISTS press_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    categoria TEXT,
    tamanho TEXT,
    url TEXT,
    data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SECURITY POLICIES (Row Level Security)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabinet_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_influenciadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas_inteligentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_estrategico ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_colunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_assets ENABLE ROW LEVEL SECURITY;

-- Create Policies (Open for development, scoped to user_id)
CREATE POLICY "Manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Manage own settings" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own press contacts" ON press_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own cabinet demands" ON cabinet_demands FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own demands" ON demands FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own influencers" ON hub_influenciadores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own meeting minutes" ON atas_inteligentes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own strategic plan" ON plano_estrategico FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own workflow columns" ON workflow_colunas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own hub contents" ON hub_contents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own press assets" ON press_assets FOR ALL USING (auth.uid() = user_id);

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

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_press_contacts_modtime BEFORE UPDATE ON press_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cabinet_demands_modtime BEFORE UPDATE ON cabinet_demands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_demands_modtime BEFORE UPDATE ON demands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hub_influenciadores_modtime BEFORE UPDATE ON hub_influenciadores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_atas_inteligentes_modtime BEFORE UPDATE ON atas_inteligentes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_plano_estrategico_modtime BEFORE UPDATE ON plano_estrategico FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hub_contents_modtime BEFORE UPDATE ON hub_contents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_press_assets_modtime BEFORE UPDATE ON press_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
