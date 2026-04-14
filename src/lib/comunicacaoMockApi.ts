// Mock API — Comunicados Internos
// Simula banco de dados relacional com tipagem robusta

export type CanalDisparo = 'email' | 'whatsapp' | 'mural';
export type StatusComunicado = 'rascunho' | 'agendado' | 'enviado';

export interface ComunicadoMetricas {
  enviados: number;
  entregues: number;
  lidos: number;
}

export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  data_criacao: string;   // ISO string
  data_envio: string | null;
  status: StatusComunicado;
  canais: CanalDisparo[];
  secretarias_alvo: string[];
  tem_anexo: boolean;
  metricas: ComunicadoMetricas;
}

export interface CanalStatus {
  id: string;
  nome: string;
  tipo: CanalDisparo;
  conectado: boolean;
  descricao: string;
}

export const CANAIS_MOCK: CanalStatus[] = [
  { id: 'c1', nome: 'WhatsApp Servidores', tipo: 'whatsapp', conectado: true,  descricao: 'Grupo principal — 342 membros' },
  { id: 'c2', nome: 'WhatsApp Lideranças', tipo: 'whatsapp', conectado: true,  descricao: 'Secretários e diretores — 28 membros' },
  { id: 'c3', nome: 'E-mail Geral',        tipo: 'email',    conectado: true,  descricao: 'lista@orgao.gov.br — 500+ destinatários' },
  { id: 'c4', nome: 'E-mail Saúde',        tipo: 'email',    conectado: true,  descricao: 'saude@orgao.gov.br — 80 destinatários' },
  { id: 'c5', nome: 'Mural Recepção',      tipo: 'mural',    conectado: false, descricao: 'TV 55" — Offline / aguardando manutenção' },
  { id: 'c6', nome: 'Mural Refeitório',    tipo: 'mural',    conectado: true,  descricao: 'TV 43" — Ativo' },
];

export const SECRETARIAS_MOCK = [
  'Todas as Secretarias',
  'Secretaria de Saúde',
  'Secretaria de Obras',
  'Secretaria de Educação',
  'Secretaria de Finanças',
  'Secretaria de Administração',
  'Gabinete',
];

export const TEMPLATES_MOCK: { label: string; titulo: string; conteudo: string }[] = [
  { label: 'Em Branco',            titulo: '',                          conteudo: '' },
  { label: 'Aviso de Feriado',     titulo: 'Aviso de Feriado',          conteudo: 'Informamos que no próximo dia __, em virtude do feriado de __, não haverá expediente. Os trabalhos serão retomados normalmente no dia seguinte.' },
  { label: 'Manutenção de Sistema',titulo: 'Aviso de Manutenção',       conteudo: 'O sistema ___ ficará indisponível no dia __ das __h às __h para manutenção programada. Pedimos desculpas pelos transtornos.' },
  { label: 'Nota de Pesar',        titulo: 'Nota de Pesar',             conteudo: 'É com profundo pesar que comunicamos o falecimento de __. Expressamos nossa solidariedade à família e amigos neste momento de dor.' },
  { label: 'Convocação de Reunião',titulo: 'Convocação para Reunião',   conteudo: 'Convocamos todos os servidores da ___ para reunião no dia __ às __h, na sala __. Pauta: ___. Presença obrigatória.' },
];

// 4 comunicados em status diferentes
export const COMUNICADOS_MOCK: Comunicado[] = [
  {
    id: 'com-001',
    titulo: 'Recesso de Carnaval 2026 — Expediente Suspenso',
    conteudo: 'Informamos que nos dias 2, 3 e 4 de março de 2026, em virtude do Carnaval, não haverá expediente nas repartições públicas municipais. Os trabalhos serão retomados normalmente na quinta-feira, dia 5, às 8h.',
    autor: 'Dra. Ana Beatriz Costa — Secretaria de Administração',
    data_criacao: '2026-02-18T09:00:00Z',
    data_envio: '2026-02-18T10:00:00Z',
    status: 'enviado',
    canais: ['email', 'whatsapp'],
    secretarias_alvo: ['Todas as Secretarias'],
    tem_anexo: false,
    metricas: { enviados: 500, entregues: 487, lidos: 310 },
  },
  {
    id: 'com-002',
    titulo: 'Nova Política de Uso do Estacionamento Funcional',
    conteudo: 'A partir de 15 de abril de 2026, o estacionamento funcional passará a operar com controle por crachá eletrônico. Todos os servidores deverão cadastrar seu veículo no setor de Patrimônio até dia 10/04. Leia o regulamento completo no portal.',
    autor: 'Adm. Roberto Figueiredo — TI Institucional',
    data_criacao: '2026-04-01T14:30:00Z',
    data_envio: '2026-04-15T08:00:00Z',
    status: 'agendado',
    canais: ['email', 'mural'],
    secretarias_alvo: ['Todas as Secretarias'],
    tem_anexo: true,
    metricas: { enviados: 0, entregues: 0, lidos: 0 },
  },
  {
    id: 'com-003',
    titulo: 'Resultado do Processo Seletivo — Estagiários 2026',
    conteudo: 'A Secretaria de Administração comunica que o resultado do processo seletivo para estagiários referente ao primeiro semestre de 2026 está disponível. Os classificados deverão comparecer dia 12/04 às 9h para entrega de documentação.',
    autor: 'Maria Lúcia Pinheiro — RH',
    data_criacao: '2026-04-08T11:00:00Z',
    data_envio: null,
    status: 'rascunho',
    canais: ['email'],
    secretarias_alvo: ['Secretaria de Administração', 'Secretaria de Educação'],
    tem_anexo: true,
    metricas: { enviados: 0, entregues: 0, lidos: 0 },
  },
  {
    id: 'com-004',
    titulo: 'Manutenção do Sistema de Protocolo — Indisponibilidade Programada',
    conteudo: 'O sistema de protocolo eletrônico ficará indisponível neste sábado, 11/04, das 8h às 14h para atualização de segurança. Protocolos urgentes devem ser registrados manualmente no setor competente.',
    autor: 'Eng. Carlos Moura — TI',
    data_criacao: '2026-04-09T16:00:00Z',
    data_envio: '2026-04-09T17:00:00Z',
    status: 'enviado',
    canais: ['email', 'whatsapp', 'mural'],
    secretarias_alvo: ['Todas as Secretarias'],
    tem_anexo: false,
    metricas: { enviados: 500, entregues: 492, lidos: 401 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ENDOMARKETING — Campanhas e Ações
// ─────────────────────────────────────────────────────────────────────────────

export type StatusCampanha = 'planejado' | 'ativo' | 'concluido';
export type TipoAcao      = 'arte' | 'texto' | 'video' | 'evento';
export type StatusAcao    = 'todo' | 'doing' | 'done';

export interface Campanha {
  id: string;
  titulo: string;
  data_inicio: string;          // 'YYYY-MM-DD'
  data_fim: string;             // 'YYYY-MM-DD'
  status: StatusCampanha;
  publico_alvo: string;
  orcamento: number;            // R$
  progresso_percentual: number; // 0 – 100
}

export interface AcaoCampanha {
  id: string;
  campanha_id: string;
  titulo: string;
  tipo: TipoAcao;
  status: StatusAcao;
  data_limite: string;          // 'YYYY-MM-DD'
  responsavel: string;
}

export const CAMPANHAS_MOCK: Campanha[] = [
  {
    id: 'camp-001',
    titulo: 'Semana do Servidor Público 2026',
    data_inicio: '2026-10-28',
    data_fim: '2026-11-01',
    status: 'planejado',
    publico_alvo: 'Todos os Servidores',
    orcamento: 12000,
    progresso_percentual: 35,
  },
  {
    id: 'camp-002',
    titulo: 'Campanha de Valorização — Equipe de Saúde',
    data_inicio: '2026-04-14',
    data_fim: '2026-05-02',
    status: 'ativo',
    publico_alvo: 'Secretaria de Saúde',
    orcamento: 4500,
    progresso_percentual: 68,
  },
];

export const ACOES_CAMPANHA_MOCK: AcaoCampanha[] = [
  { id: 'acao-001', campanha_id: 'camp-001', titulo: 'Criação do banner digital da campanha',    tipo: 'arte',   status: 'done',  data_limite: '2026-09-10', responsavel: 'Bruna Ferreira — Design'        },
  { id: 'acao-002', campanha_id: 'camp-001', titulo: 'Roteiro do vídeo de homenagem',            tipo: 'texto',  status: 'doing', data_limite: '2026-09-25', responsavel: 'Carlos Mendes — Comunicação'    },
  { id: 'acao-003', campanha_id: 'camp-001', titulo: 'Gravação do vídeo institucional',          tipo: 'video',  status: 'todo',  data_limite: '2026-10-10', responsavel: 'Carla Nunes — Comunicação'      },
  { id: 'acao-004', campanha_id: 'camp-001', titulo: 'Evento de premiação dos destaques',        tipo: 'evento', status: 'todo',  data_limite: '2026-11-01', responsavel: 'RH — Desenvolvimento Humano'    },
  { id: 'acao-005', campanha_id: 'camp-002', titulo: 'Post-its de reconhecimento — mural',       tipo: 'arte',   status: 'done',  data_limite: '2026-04-14', responsavel: 'Bruna Ferreira — Design'        },
  { id: 'acao-006', campanha_id: 'camp-002', titulo: 'Café da manhã especial — Equipe UBS',      tipo: 'evento', status: 'doing', data_limite: '2026-04-18', responsavel: 'Natália Costa — RH'            },
  { id: 'acao-007', campanha_id: 'camp-002', titulo: 'Vídeo-depoimento dos profissionais',       tipo: 'video',  status: 'todo',  data_limite: '2026-04-28', responsavel: 'Carlos Mendes — Comunicação'    },
];

export function getComunicadoStatusLabel(status: StatusComunicado): string {
  const labels: Record<StatusComunicado, string> = {
    rascunho: 'Rascunho',
    agendado:  'Agendado',
    enviado:   'Enviado',
  };
  return labels[status];
}

// ─────────────────────────────────────────────────────────────────────────────
// PESQUISAS — Tipos e Mock
// ─────────────────────────────────────────────────────────────────────────────

export type StatusPesquisa = 'ativa' | 'encerrada' | 'rascunho';
export type TipoPergunta = 'texto' | 'multipla_escolha' | 'nota_0_10';

export interface PerguntaPesquisa {
  id: string;
  enunciado: string;
  tipo: TipoPergunta;
}

export interface FeedbackTexto {
  texto: string;
  secretaria: string;
  sentimento: 'positivo' | 'neutro' | 'negativo';
}

export interface Pesquisa {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusPesquisa;
  anonima: boolean;
  total_respostas: number;
  enps_score: number;               // -100 a +100
  satisfacao_pct: number;           // 0-100
  data_criacao: string;             // ISO string
  perguntas: PerguntaPesquisa[];
  feedbacks: FeedbackTexto[];
}

export const PESQUISAS_MOCK: Pesquisa[] = [
  {
    id: 'pes-001',
    titulo: 'eNPS — Pesquisa de Engajamento Q1 2026',
    descricao: 'Avaliação trimestral de engajamento e satisfação dos servidores com o ambiente de trabalho e liderança.',
    status: 'ativa',
    anonima: true,
    total_respostas: 312,
    enps_score: 45,
    satisfacao_pct: 74,
    data_criacao: '2026-03-01T08:00:00Z',
    perguntas: [
      { id: 'p1', enunciado: 'Em uma escala de 0 a 10, o quanto você recomendaria este órgão como lugar para trabalhar?', tipo: 'nota_0_10' },
      { id: 'p2', enunciado: 'Como você avalia a comunicação entre liderança e equipe?', tipo: 'nota_0_10' },
      { id: 'p3', enunciado: 'Qual melhoria você sugere para os comunicados internos?', tipo: 'texto' },
    ],
    feedbacks: [
      { texto: 'A comunicação melhorou muito depois que começaram a usar o sistema unificado.', secretaria: 'Sec. de Saúde', sentimento: 'positivo' },
      { texto: 'Gostaria de receber avisos mais rápidos sobre mudanças de escala.', secretaria: 'Sec. de Obras', sentimento: 'neutro' },
      { texto: 'O clima ficou mais leve após a última iniciativa de endomarketing.', secretaria: 'Gabinete', sentimento: 'positivo' },
      { texto: 'Falta alinhamento entre as secretarias no momento de comunicar projetos.', secretaria: 'Sec. de Educação', sentimento: 'negativo' },
      { texto: 'Os murais digitais são ótima ideia, mas precisam ser atualizados com mais frequência.', secretaria: 'Sec. de Finanças', sentimento: 'neutro' },
      { texto: 'Me sinto mais reconhecido depois que publicaram a nota de resultado da meta.', secretaria: 'Sec. de Administração', sentimento: 'positivo' },
    ],
  },
  {
    id: 'pes-002',
    titulo: 'Clima Pós-Reestruturação — Fev/2026',
    descricao: 'Diagnóstico rápido após a reestruturação de competências entre secretarias realizada em janeiro.',
    status: 'encerrada',
    anonima: true,
    total_respostas: 489,
    enps_score: 18,
    satisfacao_pct: 54,
    data_criacao: '2026-02-05T08:00:00Z',
    perguntas: [
      { id: 'p1', enunciado: 'Você se sentiu bem informado sobre a reestruturação antes que ela ocorresse?', tipo: 'nota_0_10' },
      { id: 'p2', enunciado: 'Sua liderança explicou as mudanças com clareza?', tipo: 'multipla_escolha' },
      { id: 'p3', enunciado: 'O que poderia ter sido feito de forma diferente?', tipo: 'texto' },
    ],
    feedbacks: [
      { texto: 'A mudança foi necessária mas faltou comunicação prévia adequada.', secretaria: 'Sec. de Obras', sentimento: 'negativo' },
      { texto: 'As reuniões explicativas foram muito úteis para entender os novos fluxos.', secretaria: 'Gabinete', sentimento: 'positivo' },
      { texto: 'Esperava mais transparência nas justificativas das mudanças de cargo.', secretaria: 'Sec. de Saúde', sentimento: 'negativo' },
    ],
  },
  {
    id: 'pes-003',
    titulo: 'Pesquisa de Benefícios 2026 — Rascunho',
    descricao: 'Levantamento de percepção sobre pacote de benefícios vigente e sugestões de novos benefícios.',
    status: 'rascunho',
    anonima: false,
    total_respostas: 0,
    enps_score: 0,
    satisfacao_pct: 0,
    data_criacao: '2026-04-10T15:00:00Z',
    perguntas: [
      { id: 'p1', enunciado: 'Qual benefício você considera mais importante?', tipo: 'multipla_escolha' },
      { id: 'p2', enunciado: 'Você indicaria os benefícios atuais como diferencial para um colega?', tipo: 'nota_0_10' },
    ],
    feedbacks: [],
  },
];
