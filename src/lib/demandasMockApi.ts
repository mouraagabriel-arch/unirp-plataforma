export type PrioridadeDemanda = 'Alta' | 'Media' | 'Baixa';
export type StatusDemanda = 'triagem' | 'producao' | 'revisao' | 'entregue';

export interface TicketDemanda {
  id: string; // DM-XXXXXX
  titulo: string;
  prioridade: PrioridadeDemanda;
  categoria: string;
  tipo_peca: string;
  briefing: string;
  deadline: string; // YYYY-MM-DD
  status: StatusDemanda;
  solicitante: string;
  arquivos_anexos: string[];
}

export interface InteracaoDemanda {
  id: string;
  data: string; // YYYY-MM-DD
  autor: string;
  mensagem: string;
}

export interface TicketDemandaDesk extends TicketDemanda {
  interacoes: InteracaoDemanda[];
  arquivo_final?: string;
}

export const TICKETS_DEMANDA_MOCK: TicketDemandaDesk[] = [
  {
    id: 'DM-102341',
    titulo: 'Campanha de vacinação sazonal - peça principal',
    prioridade: 'Alta',
    categoria: 'Saúde Pública',
    tipo_peca: 'Vídeo',
    briefing: 'Criar vídeo vertical de 45s para reforçar calendário de vacinação e postos de atendimento em bairros periféricos.',
    deadline: '2026-04-17',
    status: 'triagem',
    solicitante: 'Secretaria de Saúde',
    arquivos_anexos: ['briefing_vacinacao.pdf', 'identidade_visual_2026.zip'],
    interacoes: [
      { id: 'int-dm-1', data: '2026-04-10', autor: 'Gabinete', mensagem: 'Prioridade alta confirmada. Alinhar com comunicação regional.' },
      { id: 'int-dm-2', data: '2026-04-11', autor: 'Comunicação', mensagem: 'Recebido. Em análise de referências e tom de linguagem.' },
    ],
  },
  {
    id: 'DM-102772',
    titulo: 'Arte estática para edital de mobilidade urbana',
    prioridade: 'Media',
    categoria: 'Infraestrutura',
    tipo_peca: 'Banner',
    briefing: 'Peça para portal e redes com prazo de inscrição e critérios de participação do edital.',
    deadline: '2026-04-19',
    status: 'triagem',
    solicitante: 'Secretaria de Obras',
    arquivos_anexos: ['edital_mobilidade.docx'],
    interacoes: [
      { id: 'int-dm-3', data: '2026-04-12', autor: 'Gabinete', mensagem: 'Necessário destacar prazo limite com alto contraste.' },
    ],
  },
  {
    id: 'DM-103115',
    titulo: 'Série de cards - prestação de contas trimestral',
    prioridade: 'Media',
    categoria: 'Transparência',
    tipo_peca: 'Arte Digital',
    briefing: 'Conjunto com 6 cards resumindo indicadores de execução orçamentária para redes institucionais.',
    deadline: '2026-04-20',
    status: 'producao',
    solicitante: 'Controladoria Geral',
    arquivos_anexos: ['planilha_indicadores.xlsx', 'manual_marca.pdf'],
    interacoes: [
      { id: 'int-dm-4', data: '2026-04-11', autor: 'Comunicação', mensagem: 'Primeiro draft em andamento com foco em legibilidade mobile.' },
      { id: 'int-dm-5', data: '2026-04-12', autor: 'Gabinete', mensagem: 'Validar paleta institucional antes da publicação.' },
    ],
  },
  {
    id: 'DM-103409',
    titulo: 'Release - entrega de novas viaturas',
    prioridade: 'Alta',
    categoria: 'Segurança',
    tipo_peca: 'Release',
    briefing: 'Texto para imprensa com destaque de investimentos, cobertura territorial e autoridades presentes no evento.',
    deadline: '2026-04-16',
    status: 'revisao',
    solicitante: 'Secretaria de Segurança',
    arquivos_anexos: ['pauta_evento.pdf', 'lista_autoridades.xlsx'],
    interacoes: [
      { id: 'int-dm-6', data: '2026-04-12', autor: 'Comunicação', mensagem: 'Release enviado para revisão jurídica.' },
      { id: 'int-dm-7', data: '2026-04-13', autor: 'Gabinete', mensagem: 'Ajustar menção a emendas parlamentares no parágrafo 2.' },
    ],
  },
  {
    id: 'DM-103880',
    titulo: 'Vídeo de encerramento da semana do empreendedor',
    prioridade: 'Baixa',
    categoria: 'Desenvolvimento Econômico',
    tipo_peca: 'Vídeo',
    briefing: 'Edição final com highlights de palestras, feiras e depoimentos de microempreendedores.',
    deadline: '2026-04-14',
    status: 'entregue',
    solicitante: 'Secretaria de Desenvolvimento',
    arquivos_anexos: ['captacoes_drive_link.txt'],
    interacoes: [
      { id: 'int-dm-8', data: '2026-04-12', autor: 'Comunicação', mensagem: 'Versão final aprovada e publicada nas redes.' },
    ],
    arquivo_final: 'video_encerramento_semana_empreendedor.mp4',
  },
  {
    id: 'DM-104022',
    titulo: 'Pacote de stories - mutirão de limpeza urbana',
    prioridade: 'Media',
    categoria: 'Serviços Urbanos',
    tipo_peca: 'Arte Digital',
    briefing: '5 stories com cronograma por bairro, orientações de descarte e canais de atendimento.',
    deadline: '2026-04-15',
    status: 'entregue',
    solicitante: 'Secretaria de Zeladoria',
    arquivos_anexos: ['rota_mutirao_kml.zip', 'texto_apoio.docx'],
    interacoes: [
      { id: 'int-dm-9', data: '2026-04-13', autor: 'Gabinete', mensagem: 'Entrega confirmada. Publicação programada para 08h.' },
    ],
    arquivo_final: 'stories_mutirao_limpeza_final.zip',
  },
];
