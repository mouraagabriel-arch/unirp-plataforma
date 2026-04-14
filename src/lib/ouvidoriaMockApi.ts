export type PrioridadeOuvidoria = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type StatusOuvidoria = 'Pendente' | 'Em Análise' | 'Encaminhado' | 'Concluído';

export interface ChamadoOuvidoria {
  id: string;
  cidadao: string;
  bairro: string;
  assunto: string;
  prioridade: PrioridadeOuvidoria;
  categoria: 'Saneamento' | 'Iluminação' | 'Asfalto' | 'Zeladoria' | 'Mobilidade';
  status: StatusOuvidoria;
  data: string;
  avatar: string;
  relato: string;
  foto: string;
  urgenciaTecnica: string;
  riscoSeguranca: string;
  impactoComunitario: 'Alto' | 'Médio' | 'Baixo';
  secretariaResponsavel: string;
  perfilMunicipe: 'Recorrente' | 'Novo Cadastro' | 'Ativo na Comunidade';
  historicoProtocolos: number;
  statusLogistica: 'Obras em Andamento' | 'Manutenções Agendadas' | 'Sem previsão operacional';
  logisticaDetalhe: string;
  tags: string[];
}

export const CHAMADOS_OUVIDORIA_MOCK: ChamadoOuvidoria[] = [
  {
    id: 'OUV-2401',
    cidadao: 'Maria Silva',
    bairro: 'Vila Nova',
    assunto: 'Buraco profundo na Rua das Flores',
    prioridade: 'Alta',
    categoria: 'Asfalto',
    status: 'Pendente',
    data: '25 Mar, 14:30',
    avatar: 'https://picsum.photos/seed/maria-ouv/100/100',
    relato: 'Há um buraco grande em frente ao número 450 da Rua das Flores. Carros desviam para a contramão e motos quase caem diariamente.',
    foto: 'https://picsum.photos/seed/asfalto-ouv/900/650',
    urgenciaTecnica: 'Risco de acidente por desvio brusco e perda de controle de veículos.',
    riscoSeguranca: 'Via parcialmente bloqueada em horário de pico.',
    impactoComunitario: 'Alto',
    secretariaResponsavel: 'Secretaria de Obras e Mobilidade',
    perfilMunicipe: 'Recorrente',
    historicoProtocolos: 3,
    statusLogistica: 'Manutenções Agendadas',
    logisticaDetalhe: '🚧 Pavimentação prevista para Junho/2026.',
    tags: ['Asfalto', 'Mobilidade', 'Risco viário'],
  },
  {
    id: 'OUV-2402',
    cidadao: 'João Pereira',
    bairro: 'Centro',
    assunto: 'Postes sem iluminação na praça central',
    prioridade: 'Média',
    categoria: 'Iluminação',
    status: 'Em Análise',
    data: '25 Mar, 11:15',
    avatar: 'https://picsum.photos/seed/joao-ouv/100/100',
    relato: 'A praça central está escura no período noturno. Os postes do lado leste estão apagados há mais de uma semana.',
    foto: 'https://picsum.photos/seed/iluminacao-ouv/900/650',
    urgenciaTecnica: 'Baixa visibilidade em área de circulação noturna.',
    riscoSeguranca: 'Potencial aumento de ocorrências em área sem iluminação.',
    impactoComunitario: 'Médio',
    secretariaResponsavel: 'Secretaria de Serviços Urbanos',
    perfilMunicipe: 'Ativo na Comunidade',
    historicoProtocolos: 1,
    statusLogistica: 'Obras em Andamento',
    logisticaDetalhe: '💡 Equipe elétrica em rota de manutenção setorial.',
    tags: ['Iluminação', 'Praça', 'Segurança'],
  },
  {
    id: 'OUV-2403',
    cidadao: 'Ana Santos',
    bairro: 'Jardim Sul',
    assunto: 'Vazamento de água em calçada pública',
    prioridade: 'Crítica',
    categoria: 'Saneamento',
    status: 'Encaminhado',
    data: '24 Mar, 09:10',
    avatar: 'https://picsum.photos/seed/ana-ouv/100/100',
    relato: 'Há um vazamento contínuo na calçada, formando poça extensa e tornando a passagem escorregadia para idosos e crianças.',
    foto: 'https://picsum.photos/seed/saneamento-ouv/900/650',
    urgenciaTecnica: 'Perda de água tratada e erosão do piso da calçada.',
    riscoSeguranca: 'Risco de queda de pedestres em piso encharcado.',
    impactoComunitario: 'Alto',
    secretariaResponsavel: 'Secretaria de Saneamento e Zeladoria',
    perfilMunicipe: 'Recorrente',
    historicoProtocolos: 4,
    statusLogistica: 'Manutenções Agendadas',
    logisticaDetalhe: '🛠️ Ordem de visita técnica prevista para 26/03/2026.',
    tags: ['Saneamento', 'Vazamento', 'Calçada'],
  },
  {
    id: 'OUV-2404',
    cidadao: 'Carlos Oliveira',
    bairro: 'Bairro Alto',
    assunto: 'Acúmulo de entulho em via local',
    prioridade: 'Baixa',
    categoria: 'Zeladoria',
    status: 'Concluído',
    data: '23 Mar, 16:40',
    avatar: 'https://picsum.photos/seed/carlos-ouv/100/100',
    relato: 'Entulho foi acumulado no canteiro lateral e impedia a passagem de carrinhos de bebê. A rua foi parcialmente liberada após limpeza.',
    foto: 'https://picsum.photos/seed/zeladoria-ouv/900/650',
    urgenciaTecnica: 'Necessidade de recolhimento programado em área residencial.',
    riscoSeguranca: 'Sem bloqueio viário no momento.',
    impactoComunitario: 'Baixo',
    secretariaResponsavel: 'Secretaria de Zeladoria',
    perfilMunicipe: 'Novo Cadastro',
    historicoProtocolos: 1,
    statusLogistica: 'Obras em Andamento',
    logisticaDetalhe: '✅ Limpeza concluída e monitoramento quinzenal iniciado.',
    tags: ['Zeladoria', 'Entulho', 'Limpeza urbana'],
  },
];
