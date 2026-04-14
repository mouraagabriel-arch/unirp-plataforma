// Mock API — Influenciadores e Lideranças (CRM Político)
// Tipagem robusta para relacionamento político e gestão de stakeholders

export type NivelInfluencia = 'Alta' | 'Média' | 'Baixa';
export type TemperaturaRelacionamento = 'Quente' | 'Neutro' | 'Frio';
export type TipoInteracao = 'reunião' | 'ligação' | 'email' | 'evento' | 'outro';

export interface InteracaoHistorico {
  id: string;
  data: string;             // 'YYYY-MM-DD'
  resumo: string;
  tipo: TipoInteracao;
  responsavel?: string;
}

export interface Lideranca {
  id: string;
  nome: string;
  cargo?: string;
  zona_atuacao: string;     // bairro, região, setor
  influencia: NivelInfluencia;
  temperatura: TemperaturaRelacionamento;
  ultimo_contato: string;   // 'YYYY-MM-DD'
  email?: string;
  telefone?: string;
  endereco?: string;
  historico: InteracaoHistorico[];
}

export const LIDERANCAS_MOCK: Lideranca[] = [
  {
    id: 'lid-001',
    nome: 'Vereador Marcos Silva',
    cargo: 'Vereador — Bloco Oposição',
    zona_atuacao: 'Zona Leste',
    influencia: 'Alta',
    temperatura: 'Quente',
    ultimo_contato: '2026-04-10',
    email: 'marcos.silva@camara.gov.br',
    telefone: '(11) 98765-4321',
    endereco: 'Av. Paulista, 1000 — São Paulo',
    historico: [
      { id: 'int-001', data: '2026-04-10', resumo: 'Reunião sobre projeto de pavimentação na Zona Leste', tipo: 'reunião', responsavel: 'Ana Costa' },
      { id: 'int-002', data: '2026-04-05', resumo: 'Ligação de agradecimento pela votação a favor', tipo: 'ligação', responsavel: 'Ana Costa' },
      { id: 'int-003', data: '2026-03-28', resumo: 'Email com proposição de emenda parlamentar', tipo: 'email', responsavel: 'RH' },
      { id: 'int-004', data: '2026-03-15', resumo: 'Presença em evento de lançamento da campanha', tipo: 'evento', responsavel: 'Comunicação' },
    ],
  },
  {
    id: 'lid-002',
    nome: 'Dra. Patricia Oliveira',
    cargo: 'Secretária de Saúde',
    zona_atuacao: 'Zona Centro',
    influencia: 'Alta',
    temperatura: 'Neutro',
    ultimo_contato: '2026-04-08',
    email: 'patricia.oliveira@sms.gov.br',
    telefone: '(11) 93333-2222',
    endereco: 'R. Marquês de Pombal, 25 — Centro',
    historico: [
      { id: 'int-005', data: '2026-04-08', resumo: 'Reunião sobre alinhamento de prioridades de saúde', tipo: 'reunião', responsavel: 'Carlos Mendes' },
      { id: 'int-006', data: '2026-03-30', resumo: 'Email com proposta de parceria em campanhas de conscientização', tipo: 'email', responsavel: 'Comunicação' },
      { id: 'int-007', data: '2026-03-10', resumo: 'Presença em congresso de gestores municipais', tipo: 'evento', responsavel: 'Comunicação' },
    ],
  },
  {
    id: 'lid-003',
    nome: 'Padre João Benedito',
    cargo: 'Líder Comunitário — Zona Oeste',
    zona_atuacao: 'Zona Oeste',
    influencia: 'Média',
    temperatura: 'Frio',
    ultimo_contato: '2026-03-12',
    email: 'padre.joao@paroquia.org.br',
    telefone: '(11) 99999-8888',
    endereco: 'Rua das Flores, 500 — Vila Mariana',
    historico: [
      { id: 'int-008', data: '2026-03-12', resumo: 'Reunião para discussão de demandas comunitárias', tipo: 'reunião', responsavel: 'Natália Costa' },
      { id: 'int-009', data: '2026-02-20', resumo: 'Ligação sem retorno — pendente recontato', tipo: 'ligação', responsavel: 'Natália Costa' },
      { id: 'int-010', data: '2026-02-05', resumo: 'Email com convite para participar de conselho consultivo', tipo: 'email', responsavel: 'Comunicação' },
    ],
  },
  {
    id: 'lid-004',
    nome: 'Empresário Roberto Costa',
    cargo: 'Presidente ACSP (Associação Comercial)',
    zona_atuacao: 'Zona Centro',
    influencia: 'Alta',
    temperatura: 'Quente',
    ultimo_contato: '2026-04-12',
    email: 'roberto.costa@acsp.org.br',
    telefone: '(11) 91111-2222',
    endereco: 'Av. Paulista, 500 — Bela Vista',
    historico: [
      { id: 'int-011', data: '2026-04-12', resumo: 'Almoço de trabalho para discutir agenda 2026', tipo: 'evento', responsavel: 'Direção' },
      { id: 'int-012', data: '2026-04-02', resumo: 'Ligação confirmando presença em fórum de gestores', tipo: 'ligação', responsavel: 'Comunicação' },
      { id: 'int-013', data: '2026-03-20', resumo: 'Reunião sobre impactos das obras em comércios locais', tipo: 'reunião', responsavel: 'Ana Costa' },
    ],
  },
];

export function getNivelInfluenciaCorStatus(nivel: NivelInfluencia): { bg: string; text: string; dot: string; border: string } {
  const map: Record<NivelInfluencia, { bg: string; text: string; dot: string; border: string }> = {
    Alta:   { bg: 'bg-rose-500/15', text: 'text-rose-300', dot: 'bg-rose-400', border: 'border-rose-400/30' },
    Média:  { bg: 'bg-amber-500/15', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-400/30' },
    Baixa:  { bg: 'bg-emerald-500/15', text: 'text-emerald-300', dot: 'bg-emerald-400', border: 'border-emerald-400/30' },
  };
  return map[nivel];
}

export function getTemperaturaCorStatus(temp: TemperaturaRelacionamento): { bg: string; text: string; dot: string; border: string } {
  const map: Record<TemperaturaRelacionamento, { bg: string; text: string; dot: string; border: string }> = {
    Quente: { bg: 'bg-orange-500/15', text: 'text-orange-300', dot: 'bg-orange-400', border: 'border-orange-400/30' },
    Neutro: { bg: 'bg-slate-500/15', text: 'text-slate-300', dot: 'bg-slate-400', border: 'border-slate-400/30' },
    Frio:   { bg: 'bg-blue-500/15', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-400/30' },
  };
  return map[temp];
}

export function getTipoInteracaoLabel(tipo: TipoInteracao): string {
  const labels: Record<TipoInteracao, string> = {
    reunião: '👥 Reunião',
    ligação: '📞 Ligação',
    email: '📧 Email',
    evento: '🎤 Evento',
    outro: '📝 Outro',
  };
  return labels[tipo];
}
