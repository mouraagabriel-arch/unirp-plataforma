export type StatusAta = 'processando' | 'concluida';

export interface AtaReuniao {
  id: string;
  titulo: string;
  data: string;
  participantes: string[];
  conteudo_html: string;
  status: StatusAta;
  tags: string[];
  pasta: 'Gabinete' | 'Obras' | 'Saude';
}

export const ATAS_MOCK: AtaReuniao[] = [
  {
    id: 'ATA-2401',
    titulo: 'Comite de Obras e Mobilidade - Sprint Semanal',
    data: '2026-04-10',
    participantes: ['Gabinete', 'Secretaria de Obras', 'Mobilidade Urbana', 'Controladoria'],
    conteudo_html: '<p><strong>[Speaker 1 - Gabinete]</strong> Validar cronograma de recape no eixo norte.</p><p><strong>[Speaker 2 - Obras]</strong> Equipes alocadas para entrega em duas frentes ate sexta-feira.</p><p><strong>[Speaker 3 - Mobilidade]</strong> Necessario plano de desvio para horario de pico.</p>',
    status: 'concluida',
    tags: ['obras', 'mobilidade', 'prioridade-alta'],
    pasta: 'Obras',
  },
  {
    id: 'ATA-2402',
    titulo: 'Mesa de Crise - Saude Territorial',
    data: '2026-04-11',
    participantes: ['Gabinete', 'Secretaria de Saude', 'Comunicao Institucional', 'Atencao Basica'],
    conteudo_html: '<p><strong>[Speaker 1 - Saude]</strong> Atualizar cobertura das equipes no setor leste.</p><p><strong>[Speaker 2 - Comunicacao]</strong> Produzir orientacao objetiva para redes e imprensa local.</p><p><strong>[Speaker 3 - Gabinete]</strong> Encaminhar boletim executivo ate 17h.</p>',
    status: 'processando',
    tags: ['saude', 'crise', 'territorio'],
    pasta: 'Saude',
  },
  {
    id: 'ATA-2403',
    titulo: 'Governanca de Entregas - Planejamento Q2',
    data: '2026-04-12',
    participantes: ['Gabinete', 'Fazenda', 'Planejamento', 'Juridico'],
    conteudo_html: '<p><strong>[Speaker 1 - Planejamento]</strong> Consolidar marcos de entrega por secretaria.</p><p><strong>[Speaker 2 - Fazenda]</strong> Ajustar previsao orcamentaria com foco em contratos ativos.</p><p><strong>[Speaker 3 - Juridico]</strong> Revisao de clausulas para novos aditivos.</p>',
    status: 'concluida',
    tags: ['planejamento', 'orcamento', 'governanca'],
    pasta: 'Gabinete',
  },
];
