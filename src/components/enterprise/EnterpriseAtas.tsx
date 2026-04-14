import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  Bold,
  Brain,
  CalendarDays,
  Clock3,
  Folder,
  FileAudio,
  FileText,
  Italic,
  Link as LinkIcon,
  List,
  Mic,
  MoreVertical,
  PauseCircle,
  Pencil,
  Search,
  Smile,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { ATAS_MOCK, type AtaReuniao, type StatusAta } from '../../lib/atasMockApi';

const QUICK_ACTIONS = [
  { id: 'resumo', label: 'Gerar Resumo Executivo', icon: FileText, emoji: '📝' },
  { id: 'tarefas', label: 'Extrair Encaminhamentos (Tarefas)', icon: List, emoji: '✅' },
  { id: 'release', label: 'Criar Release de Imprensa', icon: Sparkles, emoji: '📰' },
  { id: 'legenda', label: 'Gerar Legenda p/ Redes Sociais', icon: Smile, emoji: '📱' },
  { id: 'roteiro', label: 'Criar Roteiro p/ Video (Reels)', icon: Wand2, emoji: '🎬' },
  { id: 'email', label: 'Gerar Email de Minuta', icon: FileAudio, emoji: '✉️' },
] as const;

const STATUS_STYLE: Record<StatusAta, string> = {
  processando: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  concluida: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
};

const TAG_STYLE = [
  'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
  'border-violet-400/30 bg-violet-500/10 text-violet-200',
  'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  'border-amber-400/30 bg-amber-500/10 text-amber-200',
] as const;

const DIARIZACAO_INICIAL = [
  '[Speaker 1 - Editavel] "Abrimos a reuniao alinhando riscos e metas de entrega para esta semana."',
  '[Speaker 2 - Editavel] "Solicito consolidar os encaminhamentos por secretaria ate as 16h."',
  '[Speaker 3 - Editavel] "Vamos transformar os pontos em plano de comunicacao acionavel."',
].join('\n\n');

const AI_MOCK_BY_ACTION: Record<string, string> = {
  resumo:
    'Resumo executivo\n\nA reuniao consolidou prioridades de prazo, dependencias entre secretarias e riscos operacionais. Ficou definido foco em entregas de alto impacto e comunicacao intersetorial diaria.',
  tarefas:
    'Encaminhamentos\n\n1. Secretaria de Obras: enviar cronograma revisado ate 14h.\n2. Comunicacao: preparar nota tecnica para alinhamento externo.\n3. Gabinete: validar matriz de responsabilidade (RACI).',
  release:
    'Release de imprensa\n\nA administracao municipal reforcou hoje o compromisso com execucao transparente, metas verificaveis e coordenacao integrada entre as equipes tecnicas.',
  legenda:
    'Legenda para redes\n\nPlanejamento, execucao e transparencia: hoje alinhamos prioridades para acelerar entregas que impactam o dia a dia da cidade. #Gestao #Entregas #Cidade',
  roteiro:
    'Roteiro Reels (30-45s)\n\nCena 1: abertura com dados-chave.\nCena 2: falas curtas sobre decisoes da reuniao.\nCena 3: chamada para proximos passos e canais oficiais.',
  email:
    'Email de minuta\n\nPrezados,\n\nCompartilho a minuta consolidada da reuniao com os pontos de decisao e encaminhamentos validados.\n\nAtenciosamente,\nGabinete',
};

export function EnterpriseAtas({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'transcricao' | 'biblioteca' | 'insights'>('transcricao');
  const [atas, setAtas] = useState<AtaReuniao[]>(ATAS_MOCK);
  const [searchTerm, setSearchTerm] = useState('');

  const [meetingTitle, setMeetingTitle] = useState('Sala Integrada de Entregas - Reuniao Estrategica');
  const [editorText, setEditorText] = useState(DIARIZACAO_INICIAL);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [novaTagInput, setNovaTagInput] = useState('');
  const [transcricaoTags, setTranscricaoTags] = useState<string[]>(['captacao', 'minuta']);
  const [transcricaoPasta, setTranscricaoPasta] = useState<AtaReuniao['pasta']>('Gabinete');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAction, setGeneratedAction] = useState<string | null>(null);
  const [typedOutput, setTypedOutput] = useState('');
  const [insightsGeneratedCount, setInsightsGeneratedCount] = useState(0);
  const [filtroPasta, setFiltroPasta] = useState<'Todas' | AtaReuniao['pasta']>('Todas');
  const [menuAtaAbertaId, setMenuAtaAbertaId] = useState<string | null>(null);
  const [isEditAtaModalOpen, setIsEditAtaModalOpen] = useState(false);
  const [ataEditando, setAtaEditando] = useState<AtaReuniao | null>(null);
  const [ataEditTitulo, setAtaEditTitulo] = useState('');
  const [ataEditTagsInput, setAtaEditTagsInput] = useState('');

  const totalAtas = atas.length;
  const pautasCriticas = atas.filter((item) => item.tags.includes('crise') || item.tags.includes('prioridade-alta')).length;
  const totalProcessando = atas.filter((item) => item.status === 'processando').length;

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRecording]);

  const formattedRecordingTime = useMemo(() => {
    const min = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
    const sec = (recordingSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }, [recordingSeconds]);

  const filteredAtas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return atas;
    return atas.filter((item) => {
      const passouPasta = filtroPasta === 'Todas' || item.pasta === filtroPasta;
      if (!passouPasta) return false;

      return (
      item.titulo.toLowerCase().includes(term)
      || item.tags.some((tag) => tag.toLowerCase().includes(term))
      || item.participantes.some((p) => p.toLowerCase().includes(term))
      );
    });
  }, [atas, searchTerm, filtroPasta]);

  const pastasDisponiveis = useMemo(() => {
    const base: Array<'Todas' | AtaReuniao['pasta']> = ['Todas'];
    const pastas = Array.from(new Set(atas.map((item) => item.pasta)));
    return [...base, ...pastas];
  }, [atas]);

  const insertAtCursorFallback = (snippet: string) => {
    setEditorText((prev) => `${prev}${prev ? '\n' : ''}${snippet}`);
  };

  const handleToolbarAction = (kind: 'bold' | 'italic' | 'list' | 'link' | 'smile') => {
    const map = {
      bold: '**trecho em destaque**',
      italic: '*trecho em enfase*',
      list: '- ponto 1\n- ponto 2',
      link: '[referencia](https://)',
      smile: '🙂 observacao de tom e contexto',
    } as const;

    insertAtCursorFallback(map[kind]);
  };

  const handleUploadArquivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    toast.success(`Arquivo anexado: ${file.name}`);

    if (file.type.startsWith('text/')) {
      const text = await file.text();
      if (text.trim()) {
        setEditorText(text);
      }
    }
  };

  const handleIniciarGravacao = () => {
    setRecordingSeconds(0);
    setIsRecording(true);
    toast.success('Captação iniciada. Gravacao em andamento.');
  };

  const handlePararGravacao = () => {
    setIsRecording(false);
    setEditorText((prev) => {
      const diarizacaoNova = `\n\n[Speaker 1 - Editavel] "Trecho captado automaticamente em ${formattedRecordingTime}."`;
      return `${prev}${diarizacaoNova}`;
    });
    toast.success('Gravacao finalizada e enviada para transcricao.');
  };

  const handleSalvarAtaNaBiblioteca = async () => {
    if (!meetingTitle.trim()) {
      toast.error('Informe o titulo da reuniao.');
      return;
    }

    const novaAta: AtaReuniao = {
      id: `ATA-${Math.floor(1000 + Math.random() * 9000)}`,
      titulo: meetingTitle.trim(),
      data: new Date().toISOString().split('T')[0],
      participantes: ['Speaker 1', 'Speaker 2', 'Speaker 3'],
      conteudo_html: `<p>${editorText.replace(/\n/g, '<br/>')}</p>`,
      status: 'processando',
      tags: transcricaoTags.length > 0 ? transcricaoTags : ['transcricao'],
      pasta: transcricaoPasta,
    };

    await toast.promise(
      new Promise<void>((resolve) => window.setTimeout(resolve, 700)),
      {
        loading: 'Salvando ata na biblioteca...',
        success: 'Ata registrada no cofre.',
        error: 'Falha ao salvar ata.',
      },
    );

    setAtas((prev) => [novaAta, ...prev]);
    setTranscricaoTags(['captacao']);
    setNovaTagInput('');
    setActiveTab('biblioteca');
  };

  const handleAddTagTranscricao = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const nextTag = novaTagInput.trim().toLowerCase();
    if (!nextTag) return;
    if (transcricaoTags.includes(nextTag)) {
      setNovaTagInput('');
      return;
    }
    setTranscricaoTags((prev) => [...prev, nextTag]);
    setNovaTagInput('');
  };

  const handleRemoverTagTranscricao = (tag: string) => {
    setTranscricaoTags((prev) => prev.filter((item) => item !== tag));
  };

  const abrirEdicaoAta = (ata: AtaReuniao) => {
    setAtaEditando(ata);
    setAtaEditTitulo(ata.titulo);
    setAtaEditTagsInput(ata.tags.join(', '));
    setMenuAtaAbertaId(null);
    setIsEditAtaModalOpen(true);
  };

  const salvarEdicaoAta = async () => {
    if (!ataEditando) return;
    const tags = ataEditTagsInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const atualizado: AtaReuniao = {
      ...ataEditando,
      titulo: ataEditTitulo.trim() || ataEditando.titulo,
      tags,
    };

    setAtas((prev) => prev.map((item) => item.id === atualizado.id ? atualizado : item));
    setIsEditAtaModalOpen(false);
    setAtaEditando(null);
    toast.success('Ata atualizada.');
  };

  const moverAtaParaPasta = (ataId: string, pasta: AtaReuniao['pasta']) => {
    setAtas((prev) => prev.map((item) => item.id === ataId ? { ...item, pasta } : item));
    setMenuAtaAbertaId(null);
    toast.success(`Ata movida para ${pasta}.`);
  };

  const excluirAta = (ataId: string) => {
    setAtas((prev) => prev.filter((item) => item.id !== ataId));
    setMenuAtaAbertaId(null);
    toast.success('Ata excluida da biblioteca.');
  };

  const simulateTyping = (finalText: string) => {
    setTypedOutput('');
    let cursor = 0;
    const interval = window.setInterval(() => {
      cursor += 3;
      setTypedOutput(finalText.slice(0, cursor));
      if (cursor >= finalText.length) {
        window.clearInterval(interval);
      }
    }, 18);
  };

  const handleQuickAction = async (actionId: (typeof QUICK_ACTIONS)[number]['id']) => {
    setIsGeneratingAi(true);
    setGeneratedAction(actionId);
    await toast.promise(
      new Promise<void>((resolve) => window.setTimeout(resolve, 900)),
      {
        loading: 'Executando pipeline de IA...',
        success: 'Conteudo gerado com sucesso.',
        error: 'Falha ao gerar conteudo.',
      },
    );

    simulateTyping(AI_MOCK_BY_ACTION[actionId]);
    setInsightsGeneratedCount((prev) => prev + 1);
    setIsGeneratingAi(false);
  };

  const handleRoteamentoConteudo = () => {
    if (!generatedAction) return;
    if (generatedAction === 'legenda') {
      toast.success('Conteudo enviado para o Hub de Redes Sociais.');
      return;
    }
    if (generatedAction === 'release') {
      toast.success('Release enviado para criar card no Kanban de Demandas.');
      return;
    }
    if (generatedAction === 'email') {
      toast.success('Minuta encaminhada para o modulo de Comunicacao Interna.');
    }
  };

  const ctaRoteamento = generatedAction === 'legenda'
    ? '🚀 Enviar para Hub de Redes Sociais'
    : generatedAction === 'release'
      ? '🗂️ Criar Card no Kanban de Demandas'
      : generatedAction === 'email'
        ? '✉️ Abrir no Modulo de Comunicacao Interna'
        : null;

  return (
    <section className={cn('flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100', isDarkMode ? 'text-slate-100' : 'text-slate-100')}>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)] pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-[11px] font-black uppercase tracking-[0.25em] text-brand-accent">
              <Sparkles className="w-4 h-4" />
              Sala de Situacao de Atas
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-4">
              Inteligencia de <span className="text-brand-accent">Atas</span>
            </h1>
            <p className="text-slate-400 font-medium mt-3 max-w-3xl">
              Estudio de captacao, edicao rica e fabrica de conteudo institucional com rastreabilidade de ponta a ponta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full xl:min-w-[500px] xl:max-w-[560px]">
            {[
              { label: 'Atas no trimestre', value: totalAtas.toString(), tone: 'text-cyan-300' },
              { label: 'Pautas criticas', value: pautasCriticas.toString(), tone: 'text-amber-300' },
              { label: 'Insights gerados', value: insightsGeneratedCount.toString(), tone: 'text-emerald-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className={cn('text-2xl font-black mt-2', item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
        {[
          { id: 'transcricao', label: '🎙️ Nova Transcricao' },
          { id: 'biblioteca', label: '📚 Biblioteca de Atas' },
          { id: 'insights', label: '🤖 Fabrica de Conteudo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'transcricao' | 'biblioteca' | 'insights')}
            className={cn(
              'px-5 py-3 rounded-xl font-bold transition-all',
              activeTab === tab.id
                ? 'bg-brand-accent text-white shadow-[0_0_22px_rgba(99,102,241,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'transcricao' && (
          <motion.div
            key="transcricao"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleIniciarGravacao}
                className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-left hover:bg-rose-500/15 transition-all"
              >
                <div className="inline-flex items-center gap-2 text-rose-200 font-black text-lg">
                  <Mic className="w-5 h-5" />
                  Gravar Reuniao Agora
                </div>
                <p className="text-sm text-rose-100/80 mt-3">Capture ao vivo com diarizacao simulada e envio imediato para o editor.</p>
              </button>

              <label className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-left hover:bg-cyan-500/15 transition-all cursor-pointer block">
                <div className="inline-flex items-center gap-2 text-cyan-200 font-black text-lg">
                  <UploadCloud className="w-5 h-5" />
                  Upload de Arquivo
                </div>
                <p className="text-sm text-cyan-100/80 mt-3">Envie transcricao, minuta ou audio para iniciar a estruturacao da ata.</p>
                <input type="file" className="hidden" onChange={(event) => void handleUploadArquivo(event)} />
                {uploadedFileName && <p className="text-xs text-cyan-100 mt-3">Arquivo: {uploadedFileName}</p>}
              </label>
            </div>

            <article className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Editor de documento rico</p>
                  <h3 className="text-2xl font-black text-white mt-2">Ata em construcao com diarizacao</h3>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSalvarAtaNaBiblioteca()}
                  className="px-5 py-3 rounded-xl border border-brand-accent/30 bg-brand-accent/10 text-brand-accent font-bold hover:bg-brand-accent/20 transition-all"
                >
                  Salvar na Biblioteca
                </button>
              </div>

              <label className="space-y-2 block mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Titulo da reuniao</span>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(event) => setMeetingTitle(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none"
                />
              </label>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2 mb-3">
                <button type="button" onClick={() => handleToolbarAction('bold')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Bold className="w-4 h-4 text-slate-200" />
                </button>
                <button type="button" onClick={() => handleToolbarAction('italic')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Italic className="w-4 h-4 text-slate-200" />
                </button>
                <button type="button" onClick={() => handleToolbarAction('list')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <List className="w-4 h-4 text-slate-200" />
                </button>
                <button type="button" onClick={() => handleToolbarAction('link')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <LinkIcon className="w-4 h-4 text-slate-200" />
                </button>
                <button type="button" onClick={() => handleToolbarAction('smile')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Smile className="w-4 h-4 text-slate-200" />
                </button>
                <span className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Speaker names editaveis</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <label className="space-y-2 block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tags</span>
                  <input
                    type="text"
                    value={novaTagInput}
                    onChange={(event) => setNovaTagInput(event.target.value)}
                    onKeyDown={handleAddTagTranscricao}
                    placeholder="Aperte Enter para adicionar a tag"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-medium outline-none"
                  />
                  {transcricaoTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {transcricaoTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleRemoverTagTranscricao(tag)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </label>

                <label className="space-y-2 block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pasta / Categoria</span>
                  <select
                    value={transcricaoPasta}
                    onChange={(event) => setTranscricaoPasta(event.target.value as AtaReuniao['pasta'])}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none"
                  >
                    <option value="Gabinete">Gabinete</option>
                    <option value="Obras">Obras</option>
                    <option value="Saude">Saude</option>
                  </select>
                </label>
              </div>

              <textarea
                value={editorText}
                onChange={(event) => setEditorText(event.target.value)}
                className="w-full min-h-[230px] px-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-slate-100 font-medium outline-none resize-none"
              />
            </article>
          </motion.div>
        )}

        {activeTab === 'biblioteca' && (
          <motion.div
            key="biblioteca"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap gap-2">
              {pastasDisponiveis.map((pasta) => (
                <button
                  key={pasta}
                  type="button"
                  onClick={() => setFiltroPasta(pasta)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.16em] border transition-all',
                    filtroPasta === pasta
                      ? 'border-brand-accent/40 bg-brand-accent/15 text-brand-accent'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                  )}
                >
                  {pasta === 'Todas' ? 'Todas' : `📁 ${pasta}`}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por titulo, tag ou participante..."
                className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAtas.map((ata, index) => (
                <article key={ata.id} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{ata.id}</p>
                    <div className="flex items-center gap-2 relative">
                      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border', STATUS_STYLE[ata.status])}>
                        {ata.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => setMenuAtaAbertaId((prev) => prev === ata.id ? null : ata.id)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuAtaAbertaId === ata.id && (
                        <div className="absolute right-0 top-9 z-20 w-56 rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => abrirEdicaoAta(ata)}
                            className="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar Tags/Nome
                          </button>

                          <div className="px-3 py-2 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">Mover para pasta</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(['Gabinete', 'Obras', 'Saude'] as AtaReuniao['pasta'][]).map((pasta) => (
                                <button
                                  key={`${ata.id}-${pasta}`}
                                  type="button"
                                  onClick={() => moverAtaParaPasta(ata.id, pasta)}
                                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold text-slate-300 hover:bg-white/10"
                                >
                                  {pasta}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => excluirAta(ata.id)}
                            className="w-full px-3 py-2.5 text-left text-sm text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir Ata
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mt-3 leading-snug">{ata.titulo}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(`${ata.data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <Folder className="w-4 h-4" />
                    Pasta: {ata.pasta}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {ata.tags.map((tag) => (
                      <span
                        key={`${ata.id}-${tag}`}
                        className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border', TAG_STYLE[(index + tag.length) % TAG_STYLE.length])}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMeetingTitle(ata.titulo);
                      setEditorText(ata.conteudo_html.replace(/<[^>]+>/g, ''));
                      setActiveTab('transcricao');
                      toast.success('Ata aberta no estúdio de edicao.');
                    }}
                    className="mt-5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10 transition-all"
                  >
                    Ver Ata
                  </button>
                </article>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6"
          >
            <article className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Brain className="w-5 h-5 text-emerald-300" />
                <h3 className="text-2xl font-black text-white">Painel de Comando de IA</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => void handleQuickAction(action.id)}
                      disabled={isGeneratingAi}
                      className={cn(
                        'text-left rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                      )}
                    >
                      <div className="flex items-center gap-2 text-slate-100 font-black">
                        <Icon className="w-4 h-4 text-brand-accent" />
                        <span>{action.emoji}</span>
                        <span>{action.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Pipeline de IA institucional com saída pronta para operação.</p>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <FileAudio className="w-5 h-5 text-cyan-300" />
                <h3 className="text-2xl font-black text-white">Output de IA</h3>
              </div>

              {isGeneratingAi && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-10/12" />
                  <div className="h-4 bg-white/10 rounded w-9/12" />
                  <div className="h-4 bg-white/10 rounded w-11/12" />
                </div>
              )}

              {!isGeneratingAi && generatedAction && (
                <div className="rounded-xl border border-brand-accent/30 bg-brand-accent/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">Resultado em digitacao</p>
                  <p className="text-sm text-slate-200 mt-3 whitespace-pre-wrap leading-relaxed min-h-[180px]">{typedOutput || '...'}</p>

                  {ctaRoteamento && (
                    <button
                      type="button"
                      onClick={handleRoteamentoConteudo}
                      className="mt-4 w-full px-4 py-3 rounded-xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all"
                    >
                      {ctaRoteamento}
                    </button>
                  )}
                </div>
              )}

              {!isGeneratingAi && !generatedAction && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Dispare uma ação rápida para iniciar a geração de conteúdo e visualizar o retorno da IA em tempo real.
                </div>
              )}

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="w-4 h-4" />
                  {generatedAction ? 'Ultima execução concluída há instantes.' : 'Aguardando comando de geração.'}
                </div>
              </div>
            </article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-rose-400/30 bg-slate-900/95 p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">Captação ao vivo</p>
              <h3 className="text-3xl font-black text-white mt-3">{formattedRecordingTime}</h3>
              <p className="text-sm text-slate-300 mt-2">Microfones ativos e diarização simulada em processamento.</p>

              <div className="mt-6 flex items-end justify-center gap-1 h-16">
                {[12, 22, 35, 18, 28, 40, 26, 14].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-2 rounded-full bg-rose-400/70 animate-pulse"
                    style={{ height }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handlePararGravacao}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 font-black hover:bg-rose-500/20 transition-all"
              >
                <PauseCircle className="w-5 h-5" />
                Parar Gravacao
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditAtaModalOpen && ataEditando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsEditAtaModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/95 p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Editar ata</p>
              <h3 className="text-2xl font-black text-white mt-2">Nome e Tags</h3>

              <label className="space-y-2 block mt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Titulo</span>
                <input
                  type="text"
                  value={ataEditTitulo}
                  onChange={(event) => setAtaEditTitulo(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none"
                />
              </label>

              <label className="space-y-2 block mt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tags (separadas por vírgula)</span>
                <input
                  type="text"
                  value={ataEditTagsInput}
                  onChange={(event) => setAtaEditTagsInput(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-medium outline-none"
                />
              </label>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => void salvarEdicaoAta()}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditAtaModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
