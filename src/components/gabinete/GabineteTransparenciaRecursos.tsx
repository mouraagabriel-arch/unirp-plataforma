import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { Download, FileText, Landmark, Paperclip, Plus, Sparkles, Wallet, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

type TransparenciaTab = 'cota' | 'emendas' | 'prestacao';
type CategoriaCota = 'Combustível' | 'Correios' | 'Divulgação';

interface CotaItem {
  nome: CategoriaCota;
  usado: number;
  limite: number;
  cor: string;
}

interface HistoricoStatus {
  status: string;
  data: string;
  descricao: string;
}

interface EmendaCard {
  id: string;
  titulo: string;
  valor: string;
  detalhe: string;
  historico: HistoricoStatus[];
}

interface KanbanColuna {
  id: string;
  titulo: string;
  cards: EmendaCard[];
}

interface EmendaSelecionada extends EmendaCard {
  colunaTitulo: string;
}

const TAB_ITEMS: Array<{ id: TransparenciaTab; label: string; icon: typeof Wallet }> = [
  { id: 'cota', label: 'Cota Parlamentar', icon: Wallet },
  { id: 'emendas', label: 'Mapa de Emendas', icon: Landmark },
  { id: 'prestacao', label: 'Prestação de Contas', icon: FileText },
];

const COTA_ITEMS: CotaItem[] = [
  { nome: 'Combustível', usado: 12450, limite: 18000, cor: 'from-cyan-400 to-blue-500' },
  { nome: 'Correios', usado: 3890, limite: 7500, cor: 'from-emerald-400 to-lime-500' },
  { nome: 'Divulgação', usado: 8420, limite: 12000, cor: 'from-fuchsia-400 to-pink-500' },
];

const KANBAN_COLUNAS: KanbanColuna[] = [
  {
    id: 'proposta',
    titulo: 'Proposta Enviada',
    cards: [
      {
        id: 'emd-1',
        titulo: 'UBS Vila Nova',
        valor: 'R$ 320.000',
        detalhe: 'Reforma estrutural e acessibilidade',
        historico: [
          { status: 'Proposta Protocolada', data: '05/03/2026', descricao: 'Proposta cadastrada no sistema.' },
          { status: 'Análise Técnica', data: '10/03/2026', descricao: 'Parecer preliminar emitido.' },
        ],
      },
      {
        id: 'emd-2',
        titulo: 'Praça da Juventude',
        valor: 'R$ 180.000',
        detalhe: 'Esporte e convivência comunitária',
        historico: [
          { status: 'Proposta Protocolada', data: '02/03/2026', descricao: 'Solicitação registrada pela assessoria.' },
          { status: 'Aguardando Empenho', data: '18/03/2026', descricao: 'Em fila de empenho orçamentário.' },
        ],
      },
    ],
  },
  {
    id: 'empenhado',
    titulo: 'Recurso Empenhado',
    cards: [
      {
        id: 'emd-3',
        titulo: 'Laboratório Escolar',
        valor: 'R$ 210.000',
        detalhe: 'Equipamentos de ciência e robótica',
        historico: [
          { status: 'Proposta Aprovada', data: '12/02/2026', descricao: 'Aprovação em comissão temática.' },
          { status: 'Empenho Realizado', data: '20/02/2026', descricao: 'Empenho publicado em diário oficial.' },
        ],
      },
    ],
  },
  {
    id: 'pagamento',
    titulo: 'Pagamento Liberado',
    cards: [
      {
        id: 'emd-4',
        titulo: 'Pavimentação Bairro Sul',
        valor: 'R$ 510.000',
        detalhe: 'Trechos críticos com alto fluxo',
        historico: [
          { status: 'Empenho Realizado', data: '04/01/2026', descricao: 'Recurso empenhado com fonte definida.' },
          { status: 'Pagamento Liberado', data: '17/01/2026', descricao: 'Ordem bancária liberada.' },
        ],
      },
    ],
  },
  {
    id: 'execucao',
    titulo: 'Obra em Execução',
    cards: [
      {
        id: 'emd-5',
        titulo: 'Iluminação LED Centro',
        valor: 'R$ 260.000',
        detalhe: 'Etapa 2 de modernização',
        historico: [
          { status: 'Pagamento Liberado', data: '07/02/2026', descricao: 'Pagamento principal executado.' },
          { status: 'Obra em Execução', data: '22/02/2026', descricao: 'Instalação iniciada no centro.' },
        ],
      },
      {
        id: 'emd-6',
        titulo: 'Quadra Poliesportiva',
        valor: 'R$ 430.000',
        detalhe: 'Cobertura e piso oficial',
        historico: [
          { status: 'Pagamento Liberado', data: '15/02/2026', descricao: 'Repasse concluído.' },
          { status: 'Obra em Execução', data: '01/03/2026', descricao: 'Equipe de obra mobilizada.' },
        ],
      },
    ],
  },
];

const BALANCETES = [
  'Balancete Mensal - Janeiro/2026.pdf',
  'Balancete Mensal - Fevereiro/2026.pdf',
  'Balancete Mensal - Março/2026.pdf',
  'Conciliação de Despesas - 1o Trimestre/2026.pdf',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export function GabineteTransparenciaRecursos({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [activeTab, setActiveTab] = useState<TransparenciaTab>('cota');
  const [cotaItems, setCotaItems] = useState<CotaItem[]>(COTA_ITEMS);
  const [kanbanColunas, setKanbanColunas] = useState<KanbanColuna[]>(KANBAN_COLUNAS);
  const [balancetes, setBalancetes] = useState<string[]>(BALANCETES);

  // Estados solicitados para a interatividade global do módulo
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedEmenda, setSelectedEmenda] = useState<EmendaSelecionada | null>(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const [expenseValor, setExpenseValor] = useState('');
  const [expenseCategoria, setExpenseCategoria] = useState<CategoriaCota>('Combustível');
  const [expenseData, setExpenseData] = useState('');
  const [expenseComprovanteNome, setExpenseComprovanteNome] = useState('');
  const [uploadedBalanceteName, setUploadedBalanceteName] = useState('');

  const resumoCota = useMemo(() => {
    const usado = cotaItems.reduce((acc, item) => acc + item.usado, 0);
    const limite = cotaItems.reduce((acc, item) => acc + item.limite, 0);

    return {
      usado,
      limite,
      saldo: limite - usado,
      percentual: limite > 0 ? Math.round((usado / limite) * 100) : 0,
    };
  }, [cotaItems]);

  const parseCurrencyInput = (input: string) => {
    const sanitized = input.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const value = Number(sanitized);
    return Number.isNaN(value) ? 0 : value;
  };

  useEffect(() => {
    const loadCotas = async () => {
      const { data, error } = await tenantService.listGabineteTransparenciaCotas();
      if (error) {
        console.error('[GabineteTransparenciaRecursos] Erro ao carregar cotas:', error);
        return;
      }

      if (!data || data.length === 0) {
        return;
      }

      const byCategoria = new Map<string, number>();
      data.forEach((row: any) => {
        const categoria = row.categoria as string | undefined;
        const usado = Number(row.usado ?? 0);
        if (!categoria) return;
        byCategoria.set(categoria, Number.isNaN(usado) ? 0 : usado);
      });

      setCotaItems((current) =>
        current.map((item) => ({
          ...item,
          usado: byCategoria.has(item.nome) ? (byCategoria.get(item.nome) as number) : item.usado,
        }))
      );
    };

    void loadCotas();
  }, [tenantService]);

  const handleExpenseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const valorNumerico = parseCurrencyInput(expenseValor);
    if (valorNumerico <= 0 || !expenseData) {
      window.alert('Preencha valor e data para lançar a despesa.');
      return;
    }

    const currentItem = cotaItems.find((item) => item.nome === expenseCategoria);
    if (!currentItem) {
      window.alert('Categoria inválida para lançamento.');
      return;
    }

    const novoUsado = currentItem.usado + valorNumerico;
    const { error } = await tenantService.upsertGabineteTransparenciaCota({
      categoria: expenseCategoria,
      usado: novoUsado,
      limite: currentItem.limite,
      data_lancamento: expenseData,
      comprovante_nome: expenseComprovanteNome || null,
      ambiente: 'gabinete',
    });

    if (error) {
      window.alert(`Erro ao salvar despesa: ${error.message}`);
      return;
    }

    setCotaItems((current) =>
      current.map((item) =>
        item.nome === expenseCategoria
          ? { ...item, usado: novoUsado }
          : item
      )
    );

    setExpenseValor('');
    setExpenseData('');
    setExpenseComprovanteNome('');
    setIsExpenseModalOpen(false);
  };

  const handleComprovanteDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setExpenseComprovanteNome(file.name);
    }
  };

  const handleBalanceteDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setUploadedBalanceteName(file.name);
    setBalancetes((current) => [file.name, ...current]);
  };

  const handleCadastrarEmenda = () => {
    const novaEmenda: EmendaCard = {
      id: `emd-${Date.now()}`,
      titulo: `Nova Emenda ${Date.now().toString().slice(-4)}`,
      valor: 'R$ 0',
      detalhe: 'Nova proposta cadastrada manualmente para acompanhamento.',
      historico: [
        { status: 'Proposta Enviada', data: new Date().toLocaleDateString('pt-BR'), descricao: 'Cadastro inicial da emenda.' },
      ],
    };

    setKanbanColunas((current) =>
      current.map((coluna) =>
        coluna.id === 'proposta'
          ? { ...coluna, cards: [novaEmenda, ...coluna.cards] }
          : coluna
      )
    );
  };

  const handleEditarCategoria = async (categoria: CategoriaCota, valorAtual: number, limite: number) => {
    const novoValor = window.prompt(`Novo valor usado para ${categoria} (apenas numero):`, String(valorAtual));
    if (novoValor === null) return;

    const parsed = Number(novoValor.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0) {
      window.alert('Valor invalido para atualizacao.');
      return;
    }

    const { error } = await tenantService.upsertGabineteTransparenciaCota({
      categoria,
      usado: parsed,
      limite,
      ambiente: 'gabinete',
    });

    if (error) {
      window.alert(`Erro ao editar valor: ${error.message}`);
      return;
    }

    setCotaItems((current) =>
      current.map((item) =>
        item.nome === categoria
          ? { ...item, usado: parsed }
          : item
      )
    );
  };

  const handleZerarCategoria = async (categoria: CategoriaCota) => {
    if (!window.confirm(`Deseja zerar os valores de ${categoria}?`)) return;

    const { error } = await tenantService.deleteGabineteTransparenciaCotaByCategoria(categoria);
    if (error) {
      window.alert(`Erro ao deletar valor financeiro: ${error.message}`);
      return;
    }

    setCotaItems((current) =>
      current.map((item) =>
        item.nome === categoria
          ? { ...item, usado: 0 }
          : item
      )
    );
  };

  const handleDownloadBalancete = (fileName: string) => {
    const content = `Arquivo simulado: ${fileName}\nGerado em ${new Date().toLocaleString('pt-BR')}.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateInfografico = async () => {
    setIsGeneratingIA(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGeneratingIA(false);
    window.alert('Infográfico de transparência gerado com sucesso.');
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Transparência e Recursos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe cota parlamentar, evolução de emendas e prestação pública de contas em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-brand-accent/20 border-brand-accent/40 text-white shadow-[0_0_22px_rgba(99,102,241,0.35)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.id === 'cota' && '📊 '}
                {tab.id === 'emendas' && '🏗️ '}
                {tab.id === 'prestacao' && '📑 '}
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {activeTab === 'cota' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-brand-accent text-white font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-brand-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Lançar Despesa
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {cotaItems.map((item) => {
              const percentual = Math.round((item.usado / item.limite) * 100);

              return (
                <article key={item.nome} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.nome}</p>
                    <p className="text-xs text-slate-300 font-semibold">{percentual}% usado</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(56,189,248,0.65)]', item.cor)}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-300 flex items-center justify-between">
                    <span>{formatCurrency(item.usado)}</span>
                    <span className="text-slate-500">de {formatCurrency(item.limite)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleEditarCategoria(item.nome, item.usado, item.limite)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-white/10"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleZerarCategoria(item.nome)}
                      className="flex-1 rounded-lg border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-200 hover:bg-rose-500/20"
                    >
                      Zerar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">Saldo Disponível do Mês</p>
              <p className="text-3xl font-black text-white mt-1">{formatCurrency(resumoCota.saldo)}</p>
            </div>
            <div className="text-sm text-slate-300">
              <p>Total utilizado: {formatCurrency(resumoCota.usado)}</p>
              <p>Execução mensal: {resumoCota.percentual}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emendas' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-end mb-4">
            <button
              type="button"
              onClick={handleCadastrarEmenda}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-brand-accent text-white font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-brand-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Cadastrar Emenda
            </button>
          </div>

          <div className="flex flex-row overflow-x-auto items-start gap-4 pb-2">
            {kanbanColunas.map((coluna) => (
              <section key={coluna.titulo} className="min-w-[290px] w-[290px] rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{coluna.titulo}</h3>
                {coluna.cards.map((card) => (
                  <article
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedEmenda({ ...card, colunaTitulo: coluna.titulo })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedEmenda({ ...card, colunaTitulo: coluna.titulo });
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-slate-950/70 p-3 space-y-2 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <p className="font-bold text-white text-sm">{card.titulo}</p>
                    <p className="text-[11px] text-slate-400">{card.detalhe}</p>
                    <p className="text-sm font-black text-cyan-300">{card.valor}</p>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prestacao' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
          <label
            onDrop={handleBalanceteDrop}
            onDragOver={(event) => event.preventDefault()}
            className="w-full border-2 border-dashed border-cyan-300/30 bg-white/5 rounded-2xl px-5 py-8 text-center cursor-pointer hover:bg-white/10 transition-colors block"
          >
            <p className="text-sm font-black text-cyan-200">📥 Arraste o balancete do mês aqui</p>
            <p className="text-xs text-slate-400 mt-2">ou clique para anexar o PDF do mês corrente</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadedBalanceteName(file.name);
                setBalancetes((current) => [file.name, ...current]);
              }}
            />
            {uploadedBalanceteName && (
              <p className="text-xs text-emerald-300 mt-3 font-bold">Arquivo carregado: {uploadedBalanceteName}</p>
            )}
          </label>

          <button
            type="button"
            onClick={handleGenerateInfografico}
            disabled={isGeneratingIA}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black shadow-[0_0_24px_rgba(45,212,191,0.45)] hover:scale-[1.01] transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingIA ? 'Gerando com IA...' : '✨ Gerar Infográfico de Transparência (IA)'}
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Balancetes Disponíveis (PDF)</p>
            <ul className="space-y-2">
              {balancetes.map((arquivo) => (
                <li key={arquivo}>
                  <button
                    type="button"
                    onClick={() => handleDownloadBalancete(arquivo)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-sm text-slate-200 hover:border-cyan-300/40 hover:text-white transition-colors"
                  >
                    <span>{arquivo}</span>
                    <Download className="w-4 h-4 text-cyan-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-white">+ Lançar Despesa</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleExpenseSubmit}>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Valor</label>
                <input
                  type="text"
                  placeholder="Ex: 1250,00"
                  value={expenseValor}
                  onChange={(event) => setExpenseValor(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Categoria</label>
                  <select
                    value={expenseCategoria}
                    onChange={(event) => setExpenseCategoria(event.target.value as CategoriaCota)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
                  >
                    <option className="bg-slate-900">Combustível</option>
                    <option className="bg-slate-900">Correios</option>
                    <option className="bg-slate-900">Divulgação</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Data</label>
                  <input
                    type="date"
                    value={expenseData}
                    onChange={(event) => setExpenseData(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
                  />
                </div>
              </div>

              <label
                onDrop={handleComprovanteDrop}
                onDragOver={(event) => event.preventDefault()}
                className="w-full border-2 border-dashed border-cyan-300/30 bg-white/5 rounded-2xl px-5 py-7 text-center cursor-pointer hover:bg-white/10 transition-colors block"
              >
                <p className="text-sm font-black text-cyan-200">Drag & Drop de comprovante/nota fiscal</p>
                <p className="text-xs text-slate-400 mt-2">ou clique para selecionar o arquivo</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setExpenseComprovanteNome(file.name);
                  }}
                />
                {expenseComprovanteNome && (
                  <p className="text-xs text-emerald-300 mt-3 font-bold">Arquivo: {expenseComprovanteNome}</p>
                )}
              </label>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent text-white py-3 font-black text-sm hover:bg-brand-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Confirmar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedEmenda && (
        <>
          <button
            aria-label="Fechar painel"
            className="fixed inset-0 z-[108] bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setSelectedEmenda(null)}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-md z-[109] bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-white">Detalhes da Emenda</h3>
              <button
                type="button"
                onClick={() => setSelectedEmenda(null)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Etapa Atual</p>
              <p className="text-sm text-cyan-300 font-black mt-1">{selectedEmenda.colunaTitulo}</p>
              <p className="text-lg font-black text-white mt-3">{selectedEmenda.titulo}</p>
              <p className="text-sm text-slate-400 mt-2">{selectedEmenda.detalhe}</p>
              <p className="text-xl text-emerald-300 font-black mt-3">{selectedEmenda.valor}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-3">Histórico de Status</p>
              <div className="space-y-3">
                {selectedEmenda.historico.map((statusItem) => (
                  <div key={`${statusItem.status}-${statusItem.data}`} className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-sm font-bold text-white">{statusItem.status}</p>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{statusItem.data}</span>
                    </div>
                    <p className="text-xs text-slate-400">{statusItem.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            <label className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-white/5 text-cyan-200 py-3 px-4 text-sm font-black hover:bg-white/10 transition-colors cursor-pointer">
              <Paperclip className="w-4 h-4" />
              Anexar Contrato (PDF)
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.[0]) {
                    window.alert(`Contrato anexado: ${event.target.files[0].name}`);
                  }
                }}
              />
            </label>
          </aside>
        </>
      )}
    </section>
  );
}
