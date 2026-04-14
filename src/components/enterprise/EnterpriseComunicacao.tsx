import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  FileText,
  Mail,
  Megaphone,
  MessageCircle,
  Plus,
  QrCode,
  Send,
  Sparkles,
  UserRound,
  X,
  ChevronDown,
  Smartphone,
  Paperclip,
  Wifi,
  WifiOff,
  Bold,
  Italic,
  Link2,
  List,
  Smile,
  ImageIcon,
  Settings2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Star,
  Eye,
  Trash2,
  Pencil,
  Video,
  Megaphone as MegaphoneIcon,
  CalendarCheck2,
  DollarSign,
  Layers3,
  ArrowRightLeft,
  Download,
  Upload,
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from '@google/genai';
import { useTenantService } from '../../services/useTenantService';
import toast from 'react-hot-toast';
import {
  COMUNICADOS_MOCK, CANAIS_MOCK, SECRETARIAS_MOCK, TEMPLATES_MOCK,
  PESQUISAS_MOCK, CAMPANHAS_MOCK, ACOES_CAMPANHA_MOCK,
  type Comunicado, type CanalDisparo, type StatusComunicado,
  type Pesquisa, type StatusPesquisa, type PerguntaPesquisa, type TipoPergunta,
  type Campanha, type AcaoCampanha, type StatusCampanha, type TipoAcao,
} from '../../lib/comunicacaoMockApi';

interface CommunicationCard {
  id: string;
  title: string;
  author: string;
  date: string;
  target: string;
  content: string;
  badge: string;
}

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'escala' | 'texto';
}

interface EnterpriseSurvey {
  id: string;
  titulo: string;
  slug_url: string;
  perguntas: SurveyQuestion[];
  status: 'Ativa' | 'Encerrada';
}

interface SurveyResponse {
  id: string;
  pesquisa_id: string;
  secretaria_id: string | null;
  satisfacao: number | null;
  resposta_texto: string | null;
}

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  audience: string;
  status: string;
  accent: 'rose' | 'amber' | 'emerald' | 'brand';
}

interface PautaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  prazo_texto: string | null;
  status_coluna: string;
  prioridade: string | null;
}

const AI_KEY = 'AIzaSyDqel7vKvYMogiJpLAHkEGlfM4FqrgeCAI';
const AI_MODEL = 'gemini-2.5-flash';

const tabOptions = [
  { id: 'comunicados', label: '📢 Comunicados' },
  { id: 'pesquisas', label: '📊 Pesquisas & Clima' },
  { id: 'endomarketing', label: '📅 Endomarketing' },
] as const;

const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: 'q1', text: 'Como você avalia a comunicação interna hoje?', type: 'escala' },
  { id: 'q2', text: 'Você se sente bem informado sobre decisões da sua secretaria?', type: 'escala' },
  { id: 'q3', text: 'Qual melhoria você sugere para os próximos comunicados?', type: 'texto' },
];

export function EnterpriseComunicacao({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [activeTab, setActiveTab] = useState<(typeof tabOptions)[number]['id']>('comunicados');
  const [isAdding, setIsAdding] = useState(false);
  const [communicationCards, setCommunicationCards] = useState<CommunicationCard[]>([]);
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefiningTone, setIsRefiningTone] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [surveys, setSurveys] = useState<EnterpriseSurvey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<EnterpriseSurvey | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('Pesquisa de Clima Organizacional');
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(DEFAULT_SURVEY_QUESTIONS);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('');
  const [campaignStart, setCampaignStart] = useState('');
  const [campaignEnd, setCampaignEnd] = useState('');
  const [campaignLeader, setCampaignLeader] = useState('Comunicação Interna');
  const [campaignPriority, setCampaignPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [communicationChannel, setCommunicationChannel] = useState<'Email' | 'Wpp'>('Email');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignPautas, setCampaignPautas] = useState<PautaItem[]>([]);
  const [isLoadingPautas, setIsLoadingPautas] = useState(false);

  // ── NOVOS ESTADOS — ABA ENDOMARKETING (Master-Detail) ────────────────────
  const [localCampanhas] = useState<Campanha[]>(CAMPANHAS_MOCK);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(CAMPANHAS_MOCK[0]);
  const [localAcoes, setLocalAcoes] = useState<AcaoCampanha[]>(ACOES_CAMPANHA_MOCK);
  const [detalheAbaAtiva, setDetalheAbaAtiva] = useState<'kanban' | 'arquivos'>('kanban');
  // Modal Nova Ação
  const [isNovaAcaoModalOpen, setIsNovaAcaoModalOpen] = useState(false);
  const [novaAcaoTitulo, setNovaAcaoTitulo] = useState('');
  const [novaAcaoTipo, setNovaAcaoTipo] = useState<TipoAcao>('texto');
  const [novaAcaoResponsavel, setNovaAcaoResponsavel] = useState('');
  const [novaAcaoDataLimite, setNovaAcaoDataLimite] = useState('');
  // Arquivo dropzone
  const [dragOverFileZone, setDragOverFileZone] = useState(false);
  const [localArquivos, setLocalArquivos] = useState<{ id: string; nome: string; tipo: 'imagem' | 'pdf'; tamanho: number }[]>([
    { id: 'arq-001', nome: 'Logotipo_Campanha.png', tipo: 'imagem', tamanho: 245 },
    { id: 'arq-002', nome: 'Briefing_Outubro_Rosa.pdf', tipo: 'pdf', tamanho: 1200 },
    { id: 'arq-003', nome: 'Banner_Web.jpg', tipo: 'imagem', tamanho: 580 },
  ]);

  // ── NOVOS ESTADOS — ABA COMUNICADOS ──────────────────────────────────────
  const [isCanaisDrawerOpen, setIsCanaisDrawerOpen] = useState(false);
  const [isComunicadoModalOpen, setIsComunicadoModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | StatusComunicado>('todos');
  const [expandedComunicadoId, setExpandedComunicadoId] = useState<string | null>(null);
  const [localComunicados, setLocalComunicados] = useState<Comunicado[]>(COMUNICADOS_MOCK);
  // Formulário do novo modal
  const [formTitulo, setFormTitulo] = useState('');
  const [formConteudo, setFormConteudo] = useState('');
  const [formCanais, setFormCanais] = useState<CanalDisparo[]>(['email']);
  const [formSecretarias, setFormSecretarias] = useState<string[]>(['Todas as Secretarias']);
  const [formDataAgendamento, setFormDataAgendamento] = useState('');
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [isSendingComunicado, setIsSendingComunicado] = useState(false);
  // Upload / Dropzone
  const [formAnexo, setFormAnexo] = useState<{ name: string; previewUrl: string | null; type: 'image' | 'file' } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── ESTADOS — ABA PESQUISAS ───────────────────────────────────────────────
  const [localPesquisas, setLocalPesquisas] = useState<Pesquisa[]>(PESQUISAS_MOCK);
  const [expandedPesquisaId, setExpandedPesquisaId] = useState<string | null>(null);
  const [isNovaPesquisaModalOpen, setIsNovaPesquisaModalOpen] = useState(false);
  // Formulário Nova Pesquisa
  const [npTitulo, setNpTitulo] = useState('');
  const [npDescricao, setNpDescricao] = useState('');
  const [npAnonima, setNpAnonima] = useState(true);
  const [npPerguntas, setNpPerguntas] = useState<PerguntaPesquisa[]>([
    { id: 'np-1', enunciado: '', tipo: 'nota_0_10' },
  ]);
  const [isSavingPesquisa, setIsSavingPesquisa] = useState(false);

  const tituloRef = useRef<HTMLInputElement>(null);
  const publicoRef = useRef<HTMLSelectElement>(null);
  const mensagemRef = useRef<HTMLTextAreaElement>(null);

  const climateData = (() => {
    if (!surveyResponses.length) {
      return [
        { name: 'Satisfeito', value: 0, color: '#10b981' },
        { name: 'Neutro', value: 0, color: '#f59e0b' },
        { name: 'Insatisfeito', value: 0, color: '#ef4444' },
      ];
    }
    const withScore = surveyResponses.filter((r) => typeof r.satisfacao === 'number') as Array<SurveyResponse & { satisfacao: number }>;
    const total = withScore.length || 1;
    const positive = withScore.filter((r) => r.satisfacao >= 4).length;
    const neutral = withScore.filter((r) => r.satisfacao === 3).length;
    const negative = withScore.filter((r) => r.satisfacao <= 2).length;
    return [
      { name: 'Satisfeito', value: Math.round((positive / total) * 100), color: '#10b981' },
      { name: 'Neutro', value: Math.round((neutral / total) * 100), color: '#f59e0b' },
      { name: 'Insatisfeito', value: Math.round((negative / total) * 100), color: '#ef4444' },
    ];
  })();

  const satisfactionByDept = (() => {
    const byDept = new Map<string, { total: number; count: number }>();
    surveyResponses.forEach((row) => {
      const dept = row.secretaria_id || 'Não informado';
      if (typeof row.satisfacao !== 'number') return;
      const current = byDept.get(dept) || { total: 0, count: 0 };
      current.total += row.satisfacao;
      current.count += 1;
      byDept.set(dept, current);
    });
    return Array.from(byDept.entries()).map(([dept, value]) => ({
      dept,
      score: Math.round((value.total / value.count) * 20),
    }));
  })();

  const lowSatisfactionDept = (() => {
    if (!satisfactionByDept.length) return null;
    const sorted = [...satisfactionByDept].sort((a, b) => a.score - b.score);
    return sorted[0]?.score < 65 ? sorted[0] : null;
  })();

  const feedbackItems = (() => {
    const rows = surveyResponses
      .filter((row) => row.resposta_texto && row.resposta_texto.trim().length > 0)
      .slice(0, 8)
      .map((row) => {
        const score = row.satisfacao ?? 3;
        const sentiment = score >= 4 ? 'positivo' : score <= 2 ? 'negativo' : 'neutro';
        return {
          text: row.resposta_texto as string,
          sentiment,
          note: row.secretaria_id || 'Entrada anônima',
        };
      });
    return rows.length ? rows : [
      {
        text: 'Aguardando coleta de respostas textuais.',
        sentiment: 'neutro',
        note: 'Pesquisa ativa',
      },
    ];
  })();

  useEffect(() => {
    tenantService
      .from('enterprise_comunicados')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[Comunicacao] Erro ao carregar comunicados:', error); return; }
        setCommunicationCards((data ?? []).map((row) => ({
          id: row.id,
          title: row.titulo,
          author: row.autor ?? 'Sistema',
          date: new Date(row.created_at).toLocaleDateString('pt-BR'),
          target: row.publico_alvo,
          content: row.mensagem,
          badge: row.badge ?? 'Publicado',
        })));
      });
  }, []);

  useEffect(() => {
    const loadTargetOptions = async () => {
      const unique = new Set<string>();
      const { data, error } = await tenantService
        .from('enterprise_jornalistas')
        .select('tags, cargo');

      if (error) {
        console.error('[Comunicacao] Erro ao carregar setores do CRM:', error);
      } else {
        (data ?? []).forEach((row: any) => {
          const tagList: string[] = Array.isArray(row.tags) ? row.tags : [];
          tagList.forEach((tag) => {
            const value = (tag || '').trim();
            if (value) unique.add(value);
          });
          if (row.cargo && (row.cargo as string).trim()) unique.add((row.cargo as string).trim());
        });
      }

      const options = Array.from(unique);
      setTargetOptions(options.length ? options : ['Todos os Servidores']);
    };

    void loadTargetOptions();
  }, []);

  useEffect(() => {
    const loadSurveyData = async () => {
      const { data, error } = await tenantService
        .from('enterprise_pesquisas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Comunicacao] Erro ao carregar pesquisas:', error);
        return;
      }

      const parsed = (data ?? []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        slug_url: row.slug_url,
        perguntas: Array.isArray(row.perguntas) ? row.perguntas : DEFAULT_SURVEY_QUESTIONS,
        status: row.status === 'Encerrada' ? 'Encerrada' : 'Ativa',
      })) as EnterpriseSurvey[];

      setSurveys(parsed);
      const active = parsed.find((row) => row.status === 'Ativa') || parsed[0] || null;
      setActiveSurvey(active);
    };

    void loadSurveyData();
  }, []);

  useEffect(() => {
    const loadCampaigns = async () => {
      const { data, error } = await tenantService
        .from('enterprise_campanhas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('[Comunicacao] Erro ao carregar campanhas:', error);
        return;
      }

      if (!data || !data.length) return;
      setCampaigns(data.map((row: any, index: number) => ({
        id: row.id,
        title: row.titulo,
        description: row.objetivo || 'Campanha interna',
        audience: row.secretaria || 'Todos os servidores',
        status: row.status || 'Planejamento',
        accent: (['rose', 'amber', 'emerald'][index % 3] as 'rose' | 'amber' | 'emerald'),
      })));
    };

    void loadCampaigns();
  }, []);

  useEffect(() => {
    if (!activeSurvey?.id) {
      setSurveyResponses([]);
      return;
    }
    const loadResponses = async () => {
      const { data, error } = await tenantService
        .from('enterprise_pesquisa_respostas')
        .select('id, pesquisa_id, secretaria_id, satisfacao, resposta_texto')
        .eq('pesquisa_id', activeSurvey.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Comunicacao] Erro ao carregar respostas:', error);
        return;
      }

      setSurveyResponses((data ?? []) as SurveyResponse[]);
    };
    void loadResponses();
  }, [activeSurvey?.id]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setCampaignPautas([]);
      return;
    }
    const loadPautas = async () => {
      setIsLoadingPautas(true);
      const { data, error } = await tenantService
        .from('enterprise_pautas')
        .select('id, titulo, descricao, responsavel, prazo_texto, status_coluna, prioridade')
        .eq('campanha_id', selectedCampaignId)
        .order('created_at', { ascending: true });
      setIsLoadingPautas(false);
      if (error) {
        console.error('[Comunicacao] Erro ao carregar ações da campanha:', error);
        return;
      }
      setCampaignPautas((data ?? []).map((row) => ({
        id: row.id,
        titulo: row.titulo,
        descricao: row.descricao ?? null,
        responsavel: row.responsavel ?? null,
        prazo_texto: row.prazo_texto ?? null,
        status_coluna: row.status_coluna ?? 'backlog',
        prioridade: row.prioridade ?? null,
      })));
    };
    void loadPautas();
  }, [selectedCampaignId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const resetCommunicationForm = () => {
    if (tituloRef.current) tituloRef.current.value = '';
    if (publicoRef.current) publicoRef.current.value = 'Todos os Servidores';
    if (mensagemRef.current) mensagemRef.current.value = '';
    setCommunicationChannel('Email');
    setEditingCommunicationId(null);
  };

  const handleSaveCommunication = async () => {
    const titulo = tituloRef.current?.value?.trim() ?? '';
    if (!titulo) return;
    const publico_alvo = publicoRef.current?.value ?? 'Todos os Servidores';
    const mensagem = mensagemRef.current?.value ?? '';

    setIsSaving(true);
    if (editingCommunicationId) {
      const { data, error } = await tenantService
        .from('enterprise_comunicados')
        .update({ titulo, publico_alvo, secretaria_alvo: publico_alvo, mensagem, canal_envio: communicationChannel })
        .eq('id', editingCommunicationId)
        .select()
        .single();

      if (error) {
        console.error('[Comunicacao] Erro ao atualizar comunicado:', error);
        alert(`Erro ao atualizar: ${error.message}`);
        setIsSaving(false);
        return;
      }

      if (data) {
        setCommunicationCards((prev) => prev.map((item) => (
          item.id === editingCommunicationId
            ? {
                ...item,
                title: data.titulo,
                target: data.publico_alvo,
                content: data.mensagem,
                badge: data.badge ?? item.badge,
                author: data.autor ?? item.author,
              }
            : item
        )));
      }
    } else {
      const { data, error } = await tenantService
        .from('enterprise_comunicados')
        .insert({
          titulo,
          publico_alvo,
          secretaria_alvo: publico_alvo,
          mensagem,
          canal_envio: communicationChannel,
          data_programada: null,
          autor_id: 'sistema',
          badge: 'Publicado',
        })
        .select()
        .single();

      if (error) {
        console.error('[Comunicacao] Erro ao publicar:', error);
        alert(`Erro ao publicar: ${error.message}`);
        setIsSaving(false);
        return;
      }

      if (data) {
        setCommunicationCards((prev) => [{
          id: data.id,
          title: titulo,
          author: data.autor ?? 'Sistema',
          date: 'Agora',
          target: publico_alvo,
          content: mensagem,
          badge: data.badge ?? 'Publicado',
        }, ...prev]);
      }
    }

    if (!editingCommunicationId) {
      setIsDispatching(true);
      setToastMessage({ text: `Enviando para ${publico_alvo} via ${communicationChannel === 'Wpp' ? 'WhatsApp' : 'E-mail'}...`, type: 'success' });
      await tenantService
        .from('enterprise_demandas')
        .insert({
          ticket_codigo: `CM-${Date.now().toString().slice(-6)}`,
          titulo,
          secretaria_solicitante: publico_alvo,
          tipo_peca: 'Comunicado Interno',
          prazo_texto: new Date().toLocaleDateString('pt-BR'),
          status_ticket: 'triagem',
          briefing: mensagem,
          responsavel: 'Comunicação Interna',
          prioridade: 'Média',
        });

      if (communicationChannel === 'Wpp') {
        const { data: crmContacts } = await tenantService
          .from('enterprise_jornalistas')
          .select('nome, telefone, tags')
          .not('telefone', 'is', null)
          .neq('telefone', '');
        const matchingContacts = (crmContacts ?? []).filter((c: any) => {
          const tagList: string[] = Array.isArray(c.tags) ? c.tags : [];
          return publico_alvo === 'Todos os Servidores' || tagList.includes(publico_alvo);
        });
        if (matchingContacts.length === 0) {
          setToastMessage({ text: `⚠️ Nenhum contato com WhatsApp no CRM para "${publico_alvo}". Adicione contatos com telefone no CRM.`, type: 'error' });
        } else {
          const msgText = encodeURIComponent(`${titulo}\n\n${mensagem}`);
          const firstPhone = (matchingContacts[0].telefone as string).replace(/\D/g, '');
          window.open(`https://wa.me/${firstPhone}?text=${msgText}`, '_blank');
          setToastMessage({
            text: `✅ WhatsApp aberto para ${matchingContacts[0].nome}. ${matchingContacts.length > 1 ? `+${matchingContacts.length - 1} outro(s) contato(s) encontrado(s) para "${publico_alvo}".` : ''}`,
            type: 'success',
          });
        }
      }

      setIsDispatching(false);
    }

    setIsSaving(false);
    setIsAdding(false);
    resetCommunicationForm();
  };

  const handleRefineTone = async () => {
    const titulo = tituloRef.current?.value?.trim() ?? '';
    const mensagem = mensagemRef.current?.value?.trim() ?? '';
    if (!mensagem) {
      alert('Digite uma mensagem antes de refinar com IA.');
      return;
    }
    setIsRefiningTone(true);
    try {
      const ai = new GoogleGenAI({ apiKey: AI_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: `${institutionalPrompt}\n\nRefine o comunicado interno abaixo mantendo os fatos e criando um tom institucional motivador. Retorne somente o texto final em português.

Título: ${titulo || 'Comunicado Interno'}
Mensagem: ${mensagem}`,
      });
      const refined = (response.text ?? '').trim();
      if (!refined) {
        alert('A IA não retornou texto. Tente novamente.');
        return;
      }
      if (mensagemRef.current) mensagemRef.current.value = refined;
      setToastMessage({ text: '🪄 Tom refinado com IA.', type: 'success' });
    } catch (error) {
      console.error('[Comunicacao] Erro ao refinar tom com IA:', error);
      alert('Erro ao refinar com IA. Verifique sua conexão e tente novamente.');
    } finally {
      setIsRefiningTone(false);
    }
  };

  const handleCreateSurvey = async () => {
    const cleanTitle = surveyTitle.trim();
    if (!cleanTitle) return;
    const slug = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const { data, error } = await tenantService
      .from('enterprise_pesquisas')
      .insert({
        titulo: cleanTitle,
        slug_url: slug,
        perguntas: surveyQuestions,
        status: 'Ativa',
      })
      .select()
      .single();

    if (error) {
      console.error('[Comunicacao] Erro ao criar pesquisa:', error);
      alert(`Erro ao criar pesquisa: ${error.message}`);
      return;
    }

    const created: EnterpriseSurvey = {
      id: data.id,
      titulo: data.titulo,
      slug_url: data.slug_url,
      perguntas: Array.isArray(data.perguntas) ? data.perguntas : DEFAULT_SURVEY_QUESTIONS,
      status: data.status === 'Encerrada' ? 'Encerrada' : 'Ativa',
    };

    setSurveys((prev) => [created, ...prev]);
    setActiveSurvey(created);
    setIsSurveyModalOpen(false);
    setToastMessage({ text: '✅ Pesquisa criada com sucesso.', type: 'success' });
  };

  const handleSyncCampaignWithWorkflow = async () => {
    const title = campaignTitle.trim();
    if (!title) return;

    const { data, error } = await tenantService
      .from('enterprise_campanhas')
      .insert({
        titulo: title,
        objetivo: campaignObjective || null,
        data_inicio: campaignStart || null,
        data_fim: campaignEnd || null,
        secretaria: campaignLeader,
        progresso: 0,
        status: 'planejado',
        prioridade: campaignPriority.toLowerCase() === 'alta' ? 'alta' : campaignPriority.toLowerCase() === 'baixa' ? 'baixa' : 'media',
      })
      .select()
      .single();

    if (error) {
      console.error('[Comunicacao] Erro ao criar campanha:', error);
      alert(`Erro ao criar campanha: ${error.message}`);
      return;
    }

    const steps = [
      { titulo: `Lançamento da Campanha ${title}`, descricao: campaignObjective || 'Etapa de lançamento da campanha.', prazo: campaignStart || '' },
      { titulo: 'Monitoramento de Adesão', descricao: campaignObjective || 'Acompanhamento de engajamento e adesão.', prazo: campaignStart || '' },
      { titulo: 'Relatório Final de Impacto', descricao: campaignObjective || 'Consolidação de resultados da campanha.', prazo: campaignEnd || '' },
    ];

    const { error: workflowError } = await tenantService
      .from('enterprise_pautas')
      .insert(steps.map((step) => ({
        titulo: step.titulo,
        descricao: step.descricao,
        prioridade: campaignPriority.toLowerCase() === 'alta' ? 'alta' : campaignPriority.toLowerCase() === 'baixa' ? 'baixa' : 'media',
        responsavel: campaignLeader || 'Comunicação Interna',
        tags: ['endomarketing', 'campanha'],
        status_coluna: 'backlog',
        prazo_texto: step.prazo,
        campanha_id: data.id,
      })));

    if (workflowError) {
      console.error('[Comunicacao] Erro ao sincronizar com workflow:', workflowError);
      alert(`Campanha criada, mas houve erro ao sincronizar com workflow: ${workflowError.message}`);
    }

    setCampaigns((prev) => [{
      id: data.id,
      title,
      description: campaignObjective || 'Campanha interna em execução.',
      audience: campaignLeader || 'Todos os servidores',
      status: 'Planejamento',
      accent: 'brand',
    }, ...prev]);

    setIsCampaignModalOpen(false);
    setCampaignTitle('');
    setCampaignObjective('');
    setCampaignStart('');
    setCampaignEnd('');
    setCampaignLeader('Comunicação Interna');
    setCampaignPriority('Média');
    setToastMessage({ text: '📅 Campanha sincronizada com o Workflow.', type: 'success' });
  };

  const handleSendEmail = (card: CommunicationCard) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(card.title)}&body=${encodeURIComponent(`Para: ${card.target}\n\n${card.content}`)}`;
    window.location.href = mailtoLink;
    setToastMessage?.({ text: '📧 Email aberto em seu cliente padrão', type: 'success' });
  };

  const handleExportWhatsApp = (card: CommunicationCard) => {
    const whatsappText = `${card.title}\n\n${card.content}\n\nPara: ${card.target}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGeneratePDF = (card: CommunicationCard) => {
    const content = `${card.title}\n\nPara: ${card.target}\nData: ${card.date}\n\n${card.content}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comunicado_${card.title.replace(/\s/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEditCommunication = (card: CommunicationCard) => {
    if (tituloRef.current) tituloRef.current.value = card.title;
    if (publicoRef.current) publicoRef.current.value = card.target;
    if (mensagemRef.current) mensagemRef.current.value = card.content;
    setEditingCommunicationId(card.id);
    setIsAdding(true);
  };

  const handleArchiveCommunication = async (cardId: string) => {
    const { error } = await tenantService
      .from('enterprise_comunicados')
      .delete()
      .eq('id', cardId);
    
    if (error) {
      console.error('Erro ao arquivar:', error);
      return;
    }
    setCommunicationCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleCopyPublicLink = () => {
    if (!activeSurvey) {
      alert('Crie uma pesquisa primeiro para gerar link público.');
      return;
    }
    const publishLink = `https://arsaemg.gov.br/clima/${activeSurvey.id}`;
    navigator.clipboard.writeText(publishLink).then(() => {
      setToastMessage({ text: '✅ Link copiado para a área de transferência!', type: 'success' });
    }).catch(() => {
      setToastMessage({ text: '❌ Erro ao copiar link', type: 'error' });
    });
  };

  const handleGenerateQRCode = async () => {
    if (!activeSurvey) {
      alert('Crie uma pesquisa primeiro para gerar QR Code.');
      return;
    }
    const publishLink = `https://arsaemg.gov.br/clima/${activeSurvey.id}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(publishLink, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
        color: { dark: '#fff', light: '#1e293b' }
      });
      setQrImageUrl(qrDataUrl);
      setIsQRModalOpen(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setToastMessage({ text: '❌ Erro ao gerar QR Code', type: 'error' });
    }
  };

  // ── NOVOS HANDLERS — MODAL COMUNICADO ────────────────────────────────────
  const resetNovoForm = () => {
    setFormTitulo('');
    setFormConteudo('');
    setFormCanais(['email']);
    setFormSecretarias(['Todas as Secretarias']);
    setFormDataAgendamento('');
    setIsScheduleMode(false);
    setFormAnexo(null);
    setIsDragOver(false);
  };

  // ── TOOLBAR Helpers ───────────────────────────────────────────────────────
  const insertMarkdown = (prefix: string, suffix = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = formConteudo.slice(start, end);
    const before = formConteudo.slice(0, start);
    const after = formConteudo.slice(end);
    const wrapped = selected ? `${prefix}${selected}${suffix}` : `${prefix}texto${suffix}`;
    const next = `${before}${wrapped}${after}`;
    setFormConteudo(next);
    // Reposiciona cursor
    requestAnimationFrame(() => {
      el.focus();
      const cursor = selected ? start + wrapped.length : start + prefix.length + 5;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = formConteudo.slice(0, start);
    const after = formConteudo.slice(start);
    const next = `${before}${text}${after}`;
    setFormConteudo(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + text.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  // ── Upload Helpers ─────────────────────────────────────────────────────────
  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormAnexo({ name: file.name, previewUrl: ev.target?.result as string, type: 'image' });
      };
      reader.readAsDataURL(file);
    } else {
      setFormAnexo({ name: file.name, previewUrl: null, type: 'file' });
    }
  };

  const handleDropzoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleTemplateChange = (templateLabel: string) => {    const tpl = TEMPLATES_MOCK.find((t) => t.label === templateLabel);
    if (!tpl) return;
    if (tpl.titulo) setFormTitulo(tpl.titulo);
    setFormConteudo(tpl.conteudo);
  };

  const toggleCanal = (canal: CanalDisparo) => {
    setFormCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal],
    );
  };

  const toggleSecretariaForm = (sec: string) => {
    setFormSecretarias((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec],
    );
  };

  const handleSalvarRascunho = () => {
    const titulo = formTitulo.trim();
    if (!titulo) { toast.error('Informe o título do comunicado.'); return; }
    const novo: Comunicado = {
      id: `com-${Date.now()}`,
      titulo,
      conteudo: formConteudo,
      autor: 'Comunicação Interna',
      data_criacao: new Date().toISOString(),
      data_envio: null,
      status: 'rascunho',
      canais: formCanais,
      secretarias_alvo: formSecretarias,
      tem_anexo: false,
      metricas: { enviados: 0, entregues: 0, lidos: 0 },
    };
    setLocalComunicados((prev) => [novo, ...prev]);
    setIsComunicadoModalOpen(false);
    resetNovoForm();
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleAgendar = async () => {
    const titulo = formTitulo.trim();
    if (!titulo) { toast.error('Informe o título do comunicado.'); return; }
    if (!formDataAgendamento) { toast.error('Selecione data e hora para o agendamento.'); return; }
    const novo: Comunicado = {
      id: `com-${Date.now()}`,
      titulo,
      conteudo: formConteudo,
      autor: 'Comunicação Interna',
      data_criacao: new Date().toISOString(),
      data_envio: new Date(formDataAgendamento).toISOString(),
      status: 'agendado',
      canais: formCanais,
      secretarias_alvo: formSecretarias,
      tem_anexo: false,
      metricas: { enviados: 0, entregues: 0, lidos: 0 },
    };
    await toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 1200)),
      { loading: 'Agendando comunicado...', success: 'Comunicado agendado!', error: 'Erro ao agendar.' },
    );
    setLocalComunicados((prev) => [novo, ...prev]);
    setIsComunicadoModalOpen(false);
    resetNovoForm();
  };

  const handleEnviarAgora = async () => {
    const titulo = formTitulo.trim();
    if (!titulo) { toast.error('Informe o título do comunicado.'); return; }
    setIsSendingComunicado(true);
    const novo: Comunicado = {
      id: `com-${Date.now()}`,
      titulo,
      conteudo: formConteudo,
      autor: 'Comunicação Interna',
      data_criacao: new Date().toISOString(),
      data_envio: new Date().toISOString(),
      status: 'enviado',
      canais: formCanais,
      secretarias_alvo: formSecretarias,
      tem_anexo: false,
      metricas: { enviados: 500, entregues: 0, lidos: 0 },
    };
    await toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 1800)),
      {
        loading: 'Enviando para os canais selecionados...',
        success: `✅ Comunicado "${titulo}" enviado!`,
        error: 'Erro ao enviar comunicado.',
      },
    );
    setIsSendingComunicado(false);
    setLocalComunicados((prev) => [novo, ...prev]);
    setIsComunicadoModalOpen(false);
    resetNovoForm();
  };

  // ── HANDLERS — PESQUISAS ─────────────────────────────────────────────────
  const resetNovaPesquisaForm = () => {
    setNpTitulo('');
    setNpDescricao('');
    setNpAnonima(true);
    setNpPerguntas([{ id: 'np-1', enunciado: '', tipo: 'nota_0_10' }]);
  };

  const addPergunta = () => {
    setNpPerguntas((prev) => [
      ...prev,
      { id: `np-${Date.now()}`, enunciado: '', tipo: 'texto' },
    ]);
  };

  const removePergunta = (id: string) => {
    setNpPerguntas((prev) => (prev.length === 1 ? prev : prev.filter((p) => p.id !== id)));
  };

  const updatePergunta = (id: string, field: keyof PerguntaPesquisa, value: string) => {
    setNpPerguntas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const buildNovaPesquisa = (status: StatusPesquisa): Pesquisa => ({
    id: `pes-${Date.now()}`,
    titulo: npTitulo.trim(),
    descricao: npDescricao.trim(),
    status,
    anonima: npAnonima,
    total_respostas: 0,
    enps_score: 0,
    satisfacao_pct: 0,
    data_criacao: new Date().toISOString(),
    perguntas: npPerguntas.filter((p) => p.enunciado.trim()),
    feedbacks: [],
  });

  const handleSalvarPesquisaRascunho = () => {
    if (!npTitulo.trim()) { toast.error('Informe o título da pesquisa.'); return; }
    const nova = buildNovaPesquisa('rascunho');
    setLocalPesquisas((prev) => [nova, ...prev]);
    setIsNovaPesquisaModalOpen(false);
    resetNovaPesquisaForm();
    toast.success('Rascunho salvo!');
  };

  const handlePublicarPesquisa = async () => {
    if (!npTitulo.trim()) { toast.error('Informe o título da pesquisa.'); return; }
    const nova = buildNovaPesquisa('ativa');
    setIsSavingPesquisa(true);
    await toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      { loading: 'Publicando pesquisa...', success: `✅ Pesquisa "${npTitulo}" publicada!`, error: 'Erro ao publicar.' },
    );
    setIsSavingPesquisa(false);
    setLocalPesquisas((prev) => [nova, ...prev]);
    setIsNovaPesquisaModalOpen(false);
    resetNovaPesquisaForm();
  };

  const handleCopiarLinkPesquisa = (pesquisa: Pesquisa) => {
    const link = `https://pesquisa.orgao.gov.br/${pesquisa.id}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Link copiado para a área de transferência!'),
      () => toast.error('Falha ao copiar o link.'),
    );
  };

  const handleQrCodePesquisa = async (pesquisa: Pesquisa) => {
    const link = `https://pesquisa.orgao.gov.br/${pesquisa.id}`;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(link, { width: 300, margin: 1 });
      setQrImageUrl(dataUrl);
      setIsQRModalOpen(true);
    } catch {
      toast.error('Erro ao gerar QR Code.');
    }
  };

  // ── HANDLERS — ENDOMARKETING ────────────────────────────────────────────
  const handleMoverAcao = (acaoId: string, statusAtual: StatusAcao) => {
    const ordem: StatusAcao[] = ['todo', 'doing', 'done'];
    const idxAtual = ordem.indexOf(statusAtual);
    if (idxAtual === -1 || idxAtual === 2) return; // Não pode mover se já é 'done' (ou deveria ir para 'todo')
    const proximoStatus = ordem[idxAtual + 1];
    
    setLocalAcoes((prev) =>
      prev.map((a) => (a.id === acaoId ? { ...a, status: proximoStatus } : a))
    );
    
    const acaoTemp = localAcoes.find((a) => a.id === acaoId);
    const statusLabels: Record<StatusAcao, string> = { todo: 'Planejado', doing: 'Em Produção', done: 'Concluído' };
    toast.success(`${acaoTemp?.titulo} movida para ${statusLabels[proximoStatus]}`);
  };

  const resetNovaAcaoForm = () => {
    setNovaAcaoTitulo('');
    setNovaAcaoTipo('texto');
    setNovaAcaoResponsavel('');
    setNovaAcaoDataLimite('');
  };

  const handleSalvarNovaAcao = () => {
    if (!novaAcaoTitulo.trim()) { toast.error('Informe o título da ação.'); return; }
    if (!novaAcaoDataLimite) { toast.error('Informe a data limite.'); return; }
    if (!campanhaSelecionada) { toast.error('Selecione uma campanha.'); return; }

    const novaAcao: AcaoCampanha = {
      id: `acao-${Date.now()}`,
      campanha_id: campanhaSelecionada.id,
      titulo: novaAcaoTitulo.trim(),
      tipo: novaAcaoTipo,
      status: 'todo',
      data_limite: novaAcaoDataLimite,
      responsavel: novaAcaoResponsavel.trim() || 'Não atribuído',
    };

    setLocalAcoes((prev) => [novaAcao, ...prev]);
    setIsNovaAcaoModalOpen(false);
    resetNovaAcaoForm();
    toast.success(`✅ Ação "${novaAcaoTitulo}" criada em Planejado!`);
  };

  const handleDownloadArquivo = (nomeArquivo: string) => {
    toast.success(`Download iniciado: ${nomeArquivo}`);
  };

  const handleDeleteArquivo = (id: string) => {
    setLocalArquivos((prev) => prev.filter((a) => a.id !== id));
    toast.success('Arquivo removido!\n');
  };

  const handleDropArquivos = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFileZone(false);
    toast.success('Arquivo(s) enviado(s) com sucesso!');
  };

  // ── RENDER HELPER — CARD DE PESQUISA ────────────────────────────────────
  const renderPesquisaCard = (pesquisa: Pesquisa, index: number) => {
    const isExpanded = expandedPesquisaId === pesquisa.id;
    const statusCfg: Record<StatusPesquisa, { label: string; dot: string; bg: string; border: string; text: string }> = {
      ativa:     { label: 'Ativa',     dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25', text: 'text-emerald-300' },
      encerrada: { label: 'Encerrada', dot: 'bg-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-400/25',   text: 'text-slate-400'   },
      rascunho:  { label: 'Rascunho',  dot: 'bg-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-400/25',   text: 'text-amber-300'   },
    };
    const cfg = statusCfg[pesquisa.status];
    const canExpand = pesquisa.status !== 'rascunho';
    const enpsColor = pesquisa.enps_score >= 50 ? 'text-emerald-300' : pesquisa.enps_score >= 0 ? 'text-amber-300' : 'text-rose-300';

    return (
      <motion.article
        key={pesquisa.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
      >
        {/* Card Header */}
        <div
          className={cn('p-5', canExpand && 'cursor-pointer hover:bg-white/[0.03] transition-colors')}
          onClick={() => canExpand && setExpandedPesquisaId((prev) => (prev === pesquisa.id ? null : pesquisa.id))}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5', cfg.bg, cfg.border, cfg.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                  </span>
                  {pesquisa.anonima && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-500/10 border border-violet-400/20 text-violet-300">
                      🔒 Anônima
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white leading-snug">{pesquisa.titulo}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-1 leading-relaxed">{pesquisa.descricao}</p>
                <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="w-3.5 h-3.5" />
                    {pesquisa.total_respostas} respostas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    {new Date(pesquisa.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {canExpand && (
                    <span className={cn('flex items-center gap-1.5 font-bold', enpsColor)}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      eNPS {pesquisa.enps_score > 0 ? `+${pesquisa.enps_score}` : pesquisa.enps_score}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pesquisa.status === 'ativa' && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCopiarLinkPesquisa(pesquisa); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                    Copiar Link
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void handleQrCodePesquisa(pesquisa); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                  </button>
                </>
              )}
              {canExpand && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setExpandedPesquisaId((prev) => (prev === pesquisa.id ? null : pesquisa.id)); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                    isExpanded
                      ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10',
                  )}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Resultados
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accordion — Dashboard de Resultados */}
        <AnimatePresence>
          {isExpanded && canExpand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="p-5 space-y-5">
                {/* KPI strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className={cn('text-3xl font-black', enpsColor)}>
                      {pesquisa.enps_score > 0 ? `+${pesquisa.enps_score}` : pesquisa.enps_score}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">eNPS Score</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-3xl font-black text-cyan-300">{pesquisa.total_respostas}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">Respostas</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-3xl font-black text-brand-accent">{pesquisa.satisfacao_pct}%</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">Satisfação</p>
                  </div>
                </div>

                {/* Barra de progresso de satisfação */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span>Satisfação geral</span>
                    <span>{pesquisa.satisfacao_pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pesquisa.satisfacao_pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        pesquisa.satisfacao_pct >= 70
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : pesquisa.satisfacao_pct >= 45
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-rose-500 to-rose-400',
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>

                {/* Feedbacks recentes */}
                {pesquisa.feedbacks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Feedbacks Recentes</p>
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                      {pesquisa.feedbacks.map((fb, fi) => (
                        <div
                          key={fi}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm',
                            fb.sentimento === 'positivo' && 'bg-emerald-500/[0.08] border-emerald-400/15',
                            fb.sentimento === 'neutro'   && 'bg-amber-500/[0.08] border-amber-400/15',
                            fb.sentimento === 'negativo' && 'bg-rose-500/[0.08] border-rose-400/15',
                          )}
                        >
                          <Star className={cn(
                            'w-3.5 h-3.5 mt-0.5 shrink-0',
                            fb.sentimento === 'positivo' ? 'text-emerald-400' :
                            fb.sentimento === 'negativo' ? 'text-rose-400' : 'text-amber-400',
                          )} />
                          <div>
                            <p className="text-slate-200 leading-relaxed italic">"{fb.texto}"</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">{fb.secretaria}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    );
  };

  // ── RENDER HELPER — CARD DE COMUNICADO ────────────────────────────────────
  const renderComunicadoCard = (comunicado: Comunicado, index: number) => {
    const isExpanded = expandedComunicadoId === comunicado.id;
    const statusConfig: Record<StatusComunicado, { label: string; color: string; bg: string; border: string }> = {
      enviado:  { label: 'Enviado',  color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25' },
      agendado: { label: 'Agendado', color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-400/25'  },
      rascunho: { label: 'Rascunho', color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-400/25'  },
    };
    const canalLabel: Record<CanalDisparo, string> = { email: '📧 E-mail', whatsapp: '📱 WhatsApp', mural: '📺 Mural' };
    const cfg = statusConfig[comunicado.status];
    return (
      <motion.article
        key={comunicado.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
      >
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border', cfg.bg, cfg.border, cfg.color)}>
                    {cfg.label}
                  </span>
                  {comunicado.canais.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/5 border border-white/10 text-slate-300">
                      {canalLabel[c]}
                    </span>
                  ))}
                  {comunicado.tem_anexo && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/10 border border-blue-400/20 text-blue-300">
                      <Paperclip className="w-3 h-3 inline mr-1" />Anexo
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white leading-snug">{comunicado.titulo}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{comunicado.conteudo}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="w-3.5 h-3.5" />
                    {comunicado.autor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    {new Date(comunicado.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-accent/80">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {comunicado.secretarias_alvo.join(' · ')}
                  </span>
                </div>
              </div>
            </div>
            {comunicado.status === 'enviado' && (
              <button
                onClick={() => setExpandedComunicadoId((prev) => (prev === comunicado.id ? null : comunicado.id))}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0',
                  isExpanded
                    ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10',
                )}
              >
                Analytics
                <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>

        {/* Accordion funil — apenas enviados */}
        <AnimatePresence>
          {isExpanded && comunicado.status === 'enviado' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="px-5 pb-5 pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">Funil de Alcance</p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  {[
                    { label: 'Enviados',  value: comunicado.metricas.enviados,  cls: 'border-brand-accent/30 bg-brand-accent/10', textCls: 'text-brand-accent' },
                    { label: 'Entregues', value: comunicado.metricas.entregues, cls: 'border-cyan-400/30 bg-cyan-500/10',       textCls: 'text-cyan-300'      },
                    { label: 'Lidos',     value: comunicado.metricas.lidos,     cls: 'border-emerald-400/30 bg-emerald-500/10', textCls: 'text-emerald-300'   },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2 flex-1">
                      {i > 0 && <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 hidden sm:block" />}
                      <div className={cn('flex-1 rounded-2xl p-4 text-center border', step.cls)}>
                        <p className={cn('text-2xl font-black', step.textCls)}>{step.value.toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">{step.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {comunicado.metricas.enviados
                            ? `${Math.round((step.value / comunicado.metricas.enviados) * 100)}%`
                            : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-accent via-cyan-500 to-emerald-500 transition-all duration-700"
                    style={{
                      width: `${comunicado.metricas.enviados
                        ? Math.round((comunicado.metricas.lidos / comunicado.metricas.enviados) * 100)
                        : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 text-right font-bold">
                  Taxa de leitura:{' '}
                  {comunicado.metricas.enviados
                    ? `${Math.round((comunicado.metricas.lidos / comunicado.metricas.enviados) * 100)}%`
                    : '—'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    );
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)] pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-[11px] font-black uppercase tracking-[0.25em] text-brand-accent">
              <Sparkles className="w-4 h-4" />
              Hub de Criação e Coleta
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-4">
              Comunicação <span className="text-brand-accent">Interna</span>
            </h1>
            <p className="text-slate-400 font-medium mt-3 max-w-3xl">
              O módulo agora mostra claramente de onde entram os sinais do clima e como os conteúdos saem para e-mail, WhatsApp e mural físico em operações de endomarketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full lg:min-w-[420px] lg:max-w-[460px]">
            {/* Card Canais — abre Drawer */}
            <button
              type="button"
              onClick={() => setIsCanaisDrawerOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4 text-left hover:bg-white/10 hover:border-cyan-400/30 hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 group-hover:text-cyan-400 transition-colors">Canais ativos</p>
              <p className="text-2xl font-black mt-2 text-cyan-300">12</p>
              <p className="text-[9px] text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">Clique para gerenciar →</p>
            </button>
            {/* Card Pesquisa */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Pesquisa em campo</p>
              <p className="text-2xl font-black mt-2 text-emerald-300">1</p>
            </div>
            {/* Card Campanhas */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Campanhas vivas</p>
              <p className="text-2xl font-black mt-2 text-amber-300">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white">Central operacional do endomarketing público</h2>
          <p className="text-slate-500 font-medium mt-2">Criação, distribuição e leitura de retorno no mesmo ambiente.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl w-fit">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all',
                activeTab === tab.id 
                  ? 'bg-brand-accent text-white shadow-[0_0_24px_rgba(99,102,241,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'comunicados' && (
          <motion.div
            key="comunicados"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Header + Botão Novo Comunicado */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
              <div>
                <h3 className="text-2xl font-black text-white">Fluxo de Comunicados</h3>
                <p className="text-sm text-slate-400 mt-1.5">Criação, distribuição e rastreabilidade de cada comunicado em um único painel.</p>
              </div>
              <button
                onClick={() => { resetNovoForm(); setIsComunicadoModalOpen(true); }}
                className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)] shrink-0"
              >
                <Plus className="w-5 h-5" />
                Novo Comunicado
              </button>
            </div>

            {/* Filtros de status */}
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'todos',    label: 'Todos',     count: localComunicados.length },
                { key: 'enviado',  label: 'Enviados',  count: localComunicados.filter((c) => c.status === 'enviado').length },
                { key: 'agendado', label: 'Agendados', count: localComunicados.filter((c) => c.status === 'agendado').length },
                { key: 'rascunho', label: 'Rascunhos', count: localComunicados.filter((c) => c.status === 'rascunho').length },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltroStatus(f.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all',
                    filtroStatus === f.key
                      ? 'bg-brand-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10',
                  )}
                >
                  {f.label}
                  <span className={cn(
                    'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center',
                    filtroStatus === f.key ? 'bg-white/20' : 'bg-white/10',
                  )}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Timeline agrupada ou lista flat */}
            {filtroStatus === 'todos' ? (
              <div className="space-y-6">
                {(['agendado', 'rascunho', 'enviado'] as const).map((grupo) => {
                  const items = localComunicados.filter((c) => c.status === grupo);
                  if (!items.length) return null;
                  const grupoConfig = {
                    agendado: { label: 'Agendados',  dotCls: 'bg-amber-400',   textCls: 'text-amber-300'   },
                    rascunho: { label: 'Rascunhos',  dotCls: 'bg-slate-400',   textCls: 'text-slate-400'   },
                    enviado:  { label: 'Enviados',   dotCls: 'bg-emerald-400', textCls: 'text-emerald-300' },
                  }[grupo];
                  return (
                    <div key={grupo} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-2.5 h-2.5 rounded-full', grupoConfig.dotCls)} />
                        <h4 className={cn('text-xs font-black uppercase tracking-[0.25em]', grupoConfig.textCls)}>
                          {grupoConfig.label} ({items.length})
                        </h4>
                      </div>
                      {items.map((com, i) => renderComunicadoCard(com, i))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {localComunicados.filter((c) => c.status === filtroStatus).map((com, i) => renderComunicadoCard(com, i))}
                {!localComunicados.filter((c) => c.status === filtroStatus).length && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-slate-400 font-bold">Nenhum comunicado com este status.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'pesquisas' && (
          <motion.div
            key="pesquisas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* ── Header ── */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_left,rgba(99,102,241,0.10),transparent_35%)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300 mb-3">
                    <Activity className="w-3.5 h-3.5" />
                    eNPS &amp; Clima Organizacional
                  </div>
                  <h3 className="text-xl font-black text-white">Pesquisas &amp; Clima</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-lg">
                    Colete feedback anônimo, acompanhe o eNPS em tempo real e distribua pesquisas via link ou QR Code.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNovaPesquisaModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nova Pesquisa
                </button>
              </div>
            </div>

            {/* ── Resumo eNPS global ── */}
            {(() => {
              const ativas = localPesquisas.filter((p) => p.status === 'ativa');
              const enpsMedia = ativas.length
                ? Math.round(ativas.reduce((acc, p) => acc + p.enps_score, 0) / ativas.length)
                : null;
              const totalRespostas = localPesquisas.reduce((acc, p) => acc + p.total_respostas, 0);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Pesquisas Ativas', value: ativas.length.toString(), color: 'text-emerald-300', icon: <Activity className="w-4 h-4" /> },
                    { label: 'Total de Respostas', value: totalRespostas.toLocaleString('pt-BR'), color: 'text-cyan-300', icon: <UserRound className="w-4 h-4" /> },
                    { label: 'eNPS Médio', value: enpsMedia !== null ? (enpsMedia > 0 ? `+${enpsMedia}` : String(enpsMedia)) : '—', color: enpsMedia != null && enpsMedia >= 30 ? 'text-emerald-300' : enpsMedia != null && enpsMedia >= 0 ? 'text-amber-300' : 'text-rose-300', icon: <TrendingUp className="w-4 h-4" /> },
                    { label: 'Rascunhos', value: localPesquisas.filter((p) => p.status === 'rascunho').length.toString(), color: 'text-amber-300', icon: <FileText className="w-4 h-4" /> },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        {kpi.icon}
                        <span className="text-[10px] font-black uppercase tracking-wider">{kpi.label}</span>
                      </div>
                      <p className={cn('text-2xl font-black', kpi.color)}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── Lista de pesquisas ── */}
            <div className="space-y-3">
              {localPesquisas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-10 flex flex-col items-center justify-center gap-3 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-600" />
                  <p className="text-slate-400 font-bold">Nenhuma pesquisa criada ainda.</p>
                  <p className="text-sm text-slate-600">Clique em <span className="text-emerald-400 font-bold">Nova Pesquisa</span> para começar.</p>
                </div>
              ) : (
                localPesquisas.map((p, i) => renderPesquisaCard(p, i))
              )}
            </div>

            {/* ── Alerta IA — satisfação baixa ── */}
            {lowSatisfactionDept && (
              <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 backdrop-blur-xl p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-200">Proatividade da IA</p>
                <h4 className="text-lg font-black text-white mt-3">Satisfação baixa detectada em {lowSatisfactionDept.dept}</h4>
                <p className="text-sm text-rose-100/90 mt-2">Sugestão: criar comunicado focado com plano de escuta e ação corretiva para este público.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('comunicados')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 font-black hover:bg-slate-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar comunicado focado
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'endomarketing' && (
          <motion.div
            key="endomarketing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* ── Header ── */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_28%)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 text-[10px] font-black uppercase tracking-[0.22em] text-amber-300 mb-3">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Painel de Campanhas Internas
                  </div>
                  <h3 className="text-xl font-black text-white">Endomarketing com calendário, público e execução</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-lg">
                    Gerencie campanhas internas em um painel Master-Detail com Kanban de ações integrado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-accent to-violet-600 text-white font-black text-sm shadow-lg shadow-brand-accent/25 hover:from-violet-500 hover:to-violet-600 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nova Campanha Interna
                </button>
              </div>
            </div>

            {/* ── Master-Detail grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 items-start">

              {/* ── LEFT: Lista de Campanhas ── */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Campanhas</h4>
                  <span className="text-[10px] font-bold text-slate-500">{localCampanhas.length} total</span>
                </div>

                {localCampanhas.map((campanha) => {
                  const isSelected = campanhaSelecionada?.id === campanha.id;
                  const statusCfg: Record<StatusCampanha, { label: string; dot: string; text: string; border: string; bg: string }> = {
                    planejado: { label: 'Planejado', dot: 'bg-amber-400',   text: 'text-amber-300',   border: 'border-amber-400/30',   bg: 'bg-amber-500/10'   },
                    ativo:     { label: 'Ativo',     dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-400/30', bg: 'bg-emerald-500/10' },
                    concluido: { label: 'Concluído', dot: 'bg-slate-400',   text: 'text-slate-400',   border: 'border-slate-400/25',   bg: 'bg-slate-500/10'   },
                  };
                  const cfg = statusCfg[campanha.status];
                  return (
                    <article
                      key={campanha.id}
                      onClick={() => setCampanhaSelecionada(campanha)}
                      className={cn(
                        'rounded-2xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5',
                        isSelected
                          ? 'border-brand-accent/50 bg-brand-accent/10 ring-1 ring-brand-accent/30'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h5 className="text-sm font-black text-white leading-snug flex-1">{campanha.titulo}</h5>
                        <span className={cn('px-2.5 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border shrink-0', cfg.bg, cfg.border, cfg.text)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-3 flex items-center gap-1.5">
                        <CalendarCheck2 className="w-3 h-3" />
                        {new Date(campanha.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        {' – '}
                        {new Date(campanha.data_fim + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {/* Barra de progresso */}
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                          <span>Progresso</span>
                          <span>{campanha.progresso_percentual}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              campanha.progresso_percentual >= 70
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : campanha.progresso_percentual >= 40
                                ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                : 'bg-gradient-to-r from-brand-accent to-violet-500',
                            )}
                            style={{ width: `${campanha.progresso_percentual}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}

                {localCampanhas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                    <p className="text-sm text-slate-500 font-bold">Nenhuma campanha criada.</p>
                    <p className="text-xs text-slate-600 mt-1">Clique em "Nova Campanha Interna".</p>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Detalhes + Mini-Kanban ── */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 min-h-[400px]">
                {!campanhaSelecionada ? (
                  /* Empty State */
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Layers3 className="w-8 h-8 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-400">Nenhuma campanha selecionada</p>
                      <p className="text-sm text-slate-600 mt-1.5">Selecione uma campanha ao lado para ver os detalhes e o Kanban de ações.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ── Cabeçalho de detalhes ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-white leading-snug">{campanhaSelecionada.titulo}</h3>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarCheck2 className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(campanhaSelecionada.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            {' → '}
                            {new Date(campanhaSelecionada.data_fim + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UserRound className="w-3.5 h-3.5 text-slate-500" />
                            {campanhaSelecionada.publico_alvo}
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <DollarSign className="w-3.5 h-3.5" />
                            {campanhaSelecionada.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        {/* Barra de progresso grande */}
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                            <span>Progresso Geral</span>
                            <span>{campanhaSelecionada.progresso_percentual}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${campanhaSelecionada.progresso_percentual}%` }}
                              key={campanhaSelecionada.id}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={cn(
                                'h-full rounded-full',
                                campanhaSelecionada.progresso_percentual >= 70
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                  : campanhaSelecionada.progresso_percentual >= 40
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                  : 'bg-gradient-to-r from-brand-accent to-violet-500',
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNovaAcaoModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent/15 border border-brand-accent/40 text-brand-accent text-xs font-black hover:bg-brand-accent/25 hover:border-brand-accent/60 transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Nova Ação
                      </button>
                    </div>

                    {/* ── Abas: Fluxo Operacional | Repositório ── */}
                    <div className="flex gap-2 border-b border-white/10">
                      {['kanban', 'arquivos'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setDetalheAbaAtiva(tab as 'kanban' | 'arquivos')}
                          className={cn(
                            'px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2',
                            detalheAbaAtiva === tab
                              ? 'border-brand-accent text-brand-accent'
                              : 'border-transparent text-slate-500 hover:text-slate-400',
                          )}
                        >
                          {tab === 'kanban' ? '⚙️ Fluxo Operacional' : '📁 Repositório de Arquivos'}
                        </button>
                      ))}
                    </div>

                    {/* ── Conteúdo das Abas ── */}
                    {detalheAbaAtiva === 'kanban' ? (
                      /* KANBAN */
                      (() => {
                        const acoes = localAcoes.filter((a) => a.campanha_id === campanhaSelecionada.id);
                        const colunas: { key: 'todo' | 'doing' | 'done'; label: string; color: string; border: string; headerBg: string; dotColor: string }[] = [
                          { key: 'todo',  label: 'Planejado',      color: 'text-amber-300',   border: 'border-amber-400/20',   headerBg: 'bg-amber-500/10',   dotColor: 'bg-amber-400'   },
                          { key: 'doing', label: 'Em Produção',    color: 'text-brand-accent', border: 'border-violet-400/20',  headerBg: 'bg-violet-500/10',  dotColor: 'bg-violet-400'  },
                          { key: 'done',  label: 'Concluído',      color: 'text-emerald-300', border: 'border-emerald-400/20', headerBg: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' },
                        ];
                        const tipoIcon: Record<TipoAcao, React.ReactNode> = {
                          arte:   <ImageIcon className="w-3.5 h-3.5" />,
                          texto:  <Pencil className="w-3.5 h-3.5" />,
                          video:  <Video className="w-3.5 h-3.5" />,
                          evento: <CalendarDays className="w-3.5 h-3.5" />,
                        };
                        return (
                          <div className="mt-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Mini-Kanban de Ações</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {colunas.map((col) => {
                                const cards = acoes.filter((a) => a.status === col.key);
                                return (
                                  <div key={col.key} className={cn('rounded-2xl border p-3 space-y-2.5', col.border, col.headerBg)}>
                                    {/* Coluna Header */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={cn('w-2 h-2 rounded-full', col.dotColor)} />
                                      <span className={cn('text-[10px] font-black uppercase tracking-wider', col.color)}>{col.label}</span>
                                      <span className="ml-auto text-[10px] font-bold text-slate-500">{cards.length}</span>
                                    </div>
                                    {/* Cards */}
                                    {cards.length === 0 ? (
                                      <div className="rounded-xl border border-dashed border-white/10 py-4 text-center">
                                        <p className="text-[10px] text-slate-600">Sem ações</p>
                                      </div>
                                    ) : cards.map((acao) => (
                                      <div
                                        key={acao.id}
                                        className="rounded-xl border border-white/10 bg-slate-900/80 p-3 hover:border-white/20 transition-colors group"
                                      >
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className="text-slate-500 mt-0.5 shrink-0">
                                            {tipoIcon[acao.tipo]}
                                          </span>
                                          <p className="text-[11px] font-bold text-white leading-snug flex-1">{acao.titulo}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 mb-2.5">
                                          <p className="text-[9px] text-slate-500 flex items-center gap-1">
                                            <UserRound className="w-2.5 h-2.5" />
                                            {acao.responsavel}
                                          </p>
                                          <p className="text-[9px] text-slate-500 flex items-center gap-1">
                                            <Clock3 className="w-2.5 h-2.5" />
                                            {new Date(acao.data_limite + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                          </p>
                                        </div>
                                        {/* Botão de mover ação — discreto, aparece no hover */}
                                        {acao.status !== 'done' && (
                                          <button
                                            type="button"
                                            onClick={() => handleMoverAcao(acao.id, acao.status)}
                                            className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold hover:bg-white/10 hover:text-white hover:border-brand-accent/40 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5"
                                          >
                                            <ArrowRightLeft className="w-3 h-3" />
                                            Mover
                                          </button>
                                        )}
                                        {acao.status === 'done' && (
                                          <div className="text-center text-[9px] text-emerald-400 font-bold py-1">
                                            ✓ Concluído
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                            {acoes.length === 0 && (
                              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center mt-2">
                                <p className="text-sm text-slate-500 font-bold">Nenhuma ação cadastrada para esta campanha.</p>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      /* REPOSITÓRIO DE ARQUIVOS */
                      <div className="mt-5 space-y-4">
                        {/* Dropzone */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOverFileZone(true); }}
                          onDragLeave={() => setDragOverFileZone(false)}
                          onDrop={handleDropArquivos}
                          className={cn(
                            'rounded-2xl border-2 border-dashed p-8 text-center transition-all',
                            dragOverFileZone
                              ? 'border-brand-accent/60 bg-brand-accent/10'
                              : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8',
                          )}
                        >
                          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-sm font-black text-white">Arraste arquivos aqui</p>
                          <p className="text-xs text-slate-500 mt-1">ou integre via sistema de arquivo</p>
                        </div>

                        {/* Lista de Arquivos */}
                        <div className="space-y-2">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Arquivos ({localArquivos.length})</p>
                          {localArquivos.length === 0 ? (
                            <div className="rounded-xl border border-white/10 p-4 text-center">
                              <p className="text-sm text-slate-600">Nenhum arquivo enviado.</p>
                            </div>
                          ) : localArquivos.map((arquivo) => (
                            <div key={arquivo.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/8 transition-colors group">
                              {arquivo.tipo === 'imagem' ? (
                                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{arquivo.nome}</p>
                                <p className="text-xs text-slate-500">{(arquivo.tamanho / 1024).toFixed(1)} KB</p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadArquivo(arquivo.nome)}
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-emerald-400 hover:border-emerald-400/40 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArquivo(arquivo.id)}
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-rose-400 hover:border-rose-400/40 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                'w-full max-w-2xl p-12 rounded-[3rem] shadow-2xl relative bg-slate-900 border border-white/10 text-slate-100'
              )}
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
              
              <h2 className="text-3xl font-black mb-10 text-white">{editingCommunicationId ? 'Editar Comunicado' : 'Novo Comunicado'}</h2>
              
              <div className="space-y-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título do Aviso</label>
                  <input ref={tituloRef} type="text" className="w-full px-8 py-5 bg-white/5 rounded-2xl font-bold border border-white/10 outline-none" placeholder="Ex: Manutenção Programada..." />
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Canal de Envio</label>
                  <select
                    value={communicationChannel}
                    onChange={(event) => setCommunicationChannel(event.target.value as 'Email' | 'Wpp')}
                    className="w-full px-8 py-5 bg-white/5 rounded-2xl font-bold text-slate-200 border border-white/10 outline-none appearance-none"
                  >
                    <option value="Email">E-mail</option>
                    <option value="Wpp">WhatsApp</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Público-Alvo</label>
                  <select ref={publicoRef} className="w-full px-8 py-5 bg-white/5 rounded-2xl font-bold text-slate-200 border border-white/10 outline-none appearance-none">
                    {(targetOptions.length ? targetOptions : ['Todos os Servidores']).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mensagem</label>
                  <textarea ref={mensagemRef} className="w-full h-40 px-8 py-6 bg-white/5 rounded-2xl font-medium border border-white/10 outline-none resize-none" placeholder="Digite sua mensagem aqui..." />
                  <button onClick={handleRefineTone} disabled={isRefiningTone} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 font-bold hover:bg-cyan-500/15 transition-all disabled:opacity-60">
                    <Sparkles className="w-4 h-4" />
                    {isRefiningTone ? 'Refinando...' : '🪄 Refinar Tom com IA'}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleSaveCommunication} disabled={isSaving} className="flex-1 py-5 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" />
                  {isSaving ? 'Salvando...' : isDispatching ? 'Enviando...' : editingCommunicationId ? 'Salvar Alterações' : 'Publicar Aviso'}
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    resetCommunicationForm();
                  }}
                  className="px-10 py-5 bg-white/5 text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'fixed bottom-6 right-6 rounded-xl border px-6 py-4 font-black text-sm flex items-center gap-3 shadow-2xl z-50',
              toastMessage.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-red-500/20 border-red-400/40 text-red-300'
            )}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center">✕</span>
            )}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isSurveyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsSurveyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4"
            >
              <h3 className="text-xl font-black text-white">Nova Pesquisa</h3>
              <input value={surveyTitle} onChange={(event) => setSurveyTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Título da pesquisa" />
              <div className="space-y-3">
                {surveyQuestions.map((question, qIndex) => (
                  <div key={question.id} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pergunta {qIndex + 1}</p>
                    <div className="flex gap-2">
                      <input
                        value={question.text}
                        onChange={(event) => setSurveyQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item))}
                        placeholder="Digite o texto da pergunta aqui..."
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm"
                      />
                      <select
                        value={question.type}
                        onChange={(event) => setSurveyQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, type: event.target.value as SurveyQuestion['type'] } : item))}
                        className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white text-sm"
                      >
                        <option value="escala">Escala (1–5)</option>
                        <option value="texto">Texto livre</option>
                      </select>
                      <button
                        onClick={() => setSurveyQuestions((prev) => prev.length === 1 ? prev : prev.filter((item) => item.id !== question.id))}
                        className="px-3 rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-300 text-sm font-bold hover:bg-rose-500/20 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSurveyQuestions((prev) => [...prev, { id: `q-${Date.now()}`, text: 'Nova pergunta', type: 'texto' }])} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-bold">+ Adicionar Pergunta</button>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateSurvey} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-white font-black">Criar Pesquisa</button>
                <button onClick={() => setIsSurveyModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 font-black">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCampaignModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsCampaignModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4"
            >
              <h3 className="text-xl font-black text-white">Nova Campanha de Endomarketing</h3>
              <input value={campaignTitle} onChange={(event) => setCampaignTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Nome da Campanha" />
              <textarea value={campaignObjective} onChange={(event) => setCampaignObjective(event.target.value)} className="w-full min-h-[110px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Objetivo Estratégico" />
              <div className="grid grid-cols-2 gap-3">
                <input value={campaignStart} onChange={(event) => setCampaignStart(event.target.value)} type="date" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input value={campaignEnd} onChange={(event) => setCampaignEnd(event.target.value)} type="date" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={campaignLeader} onChange={(event) => setCampaignLeader(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  {(targetOptions.length ? targetOptions : ['Comunicação Interna']).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <select value={campaignPriority} onChange={(event) => setCampaignPriority(event.target.value as 'Alta' | 'Média' | 'Baixa')} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <option value="Alta">Prioridade Alta</option>
                  <option value="Média">Prioridade Média</option>
                  <option value="Baixa">Prioridade Baixa</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSyncCampaignWithWorkflow} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-white font-black">Sincronizar com Calendário</button>
                <button onClick={() => setIsCampaignModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 font-black">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isQRModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQRModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-8 space-y-4 text-center"
            >
              <h3 className="text-lg font-black text-white">QR Code da Pesquisa</h3>
              
              {qrImageUrl && (
                <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                  <img src={qrImageUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}

              <p className="text-sm text-slate-400">Escaneie com seu celular para acessar a pesquisa de clima.</p>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button onClick={() => {
                  if (qrImageUrl) {
                    const link = document.createElement('a');
                    link.href = qrImageUrl;
                    link.download = 'qr-code-pesquisa.png';
                    link.click();
                  }
                }} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors">
                  Baixar QR Code
                </button>
                <button onClick={() => setIsQRModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: NOVO COMUNICADO — layout 2 colunas (formulário | preview)
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isComunicadoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden mb-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-black text-white">📢 Novo Comunicado</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Crie, segmente e distribua em múltiplos canais</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsComunicadoModalOpen(false); resetNovoForm(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: 2 colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
                {/* Coluna esquerda — Formulário */}
                <div className="p-7 space-y-5 border-r border-white/10">

                  {/* Template */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Modelo</label>
                    <select
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 font-bold text-sm outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                      defaultValue=""
                    >
                      <option value="" className="bg-slate-900">— Selecione um modelo —</option>
                      {TEMPLATES_MOCK.map((t) => (
                        <option key={t.label} value={t.label} className="bg-slate-900">{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Título */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Título do Comunicado *</label>
                    <input
                      type="text"
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      placeholder="Ex: Aviso de Manutenção Programada"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-sm outline-none placeholder:text-slate-600 focus:border-brand-accent/50 transition-colors"
                    />
                  </div>

                  {/* Conteúdo — Rich Text simulado */}
                  <div className="space-y-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Conteúdo</label>
                      <span className={cn(
                        'text-xs font-black transition-colors',
                        formConteudo.length > 1024 ? 'text-amber-400' : 'text-slate-500',
                      )}>
                        {formConteudo.length} chars
                      </span>
                    </div>

                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 border-b-0 rounded-t-xl">
                      {[
                        { icon: <Bold className="w-3.5 h-3.5" />,   title: 'Negrito',   action: () => insertMarkdown('*', '*')         },
                        { icon: <Italic className="w-3.5 h-3.5" />, title: 'Itálico',   action: () => insertMarkdown('_', '_')         },
                        { icon: <Link2 className="w-3.5 h-3.5" />,  title: 'Link',       action: () => insertMarkdown('[', '](https://) ') },
                        { icon: <List className="w-3.5 h-3.5" />,   title: 'Lista',      action: () => insertAtCursor('\n• ')           },
                        { icon: <Smile className="w-3.5 h-3.5" />,  title: 'Emoji',      action: () => insertAtCursor('😊 ')            },
                      ].map((btn) => (
                        <button
                          key={btn.title}
                          type="button"
                          onClick={btn.action}
                          title={btn.title}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                          {btn.icon}
                        </button>
                      ))}
                      <div className="ml-auto w-px h-4 bg-white/10" />
                      <span className="text-[9px] font-bold text-slate-600 px-1">Markdown</span>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={formConteudo}
                      onChange={(e) => setFormConteudo(e.target.value)}
                      placeholder="Digite o conteúdo... Use *negrito*, _itálico_, • listas"
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-b-xl text-white text-sm outline-none placeholder:text-slate-600 resize-none focus:border-brand-accent/50 transition-colors leading-relaxed font-mono"
                    />

                    {formConteudo.length > 1024 && formCanais.includes('whatsapp') && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 mt-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs font-bold text-amber-300">
                          Atenção: O texto passa de 1.024 caracteres e será truncado no WhatsApp.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dropzone — Upload de Mídia e Anexos */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Mídia e Anexos</label>

                    {formAnexo ? (
                      /* Mini-card do arquivo anexado */
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-accent/30 bg-brand-accent/10">
                        <div className="w-9 h-9 rounded-lg bg-brand-accent/20 flex items-center justify-center shrink-0">
                          {formAnexo.type === 'image'
                            ? <ImageIcon className="w-4 h-4 text-brand-accent" />
                            : <Paperclip className="w-4 h-4 text-brand-accent" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{formAnexo.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formAnexo.type === 'image' ? 'Imagem · aparece no preview' : 'Arquivo PDF · será encaminhado'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormAnexo(null)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/15 border border-rose-400/25 text-rose-300 hover:bg-rose-500/20 transition-all shrink-0"
                          aria-label="Remover anexo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Dropzone tracejada */
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                          isDragOver
                            ? 'border-brand-accent/70 bg-brand-accent/10 scale-[1.01]'
                            : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5',
                        )}
                      >
                        <div className="flex items-center gap-3 text-slate-500">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-lg font-black">+</span>
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 text-center leading-snug">
                          Arraste uma imagem ou PDF aqui
                          <br />
                          <span className="text-xs text-slate-600 font-medium">ou clique para buscar (máx. 5 MB)</span>
                        </p>
                      </div>
                    )}

                    {/* Input oculto */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleDropzoneChange}
                    />
                  </div>

                  {/* Secretarias Alvo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Secretarias Alvo</label>
                      <button
                        type="button"
                        onClick={() => toast('⚙️ Gerenciar segmentações em Configurações → Estrutura Org.', { icon: '⚙️' })}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-brand-accent transition-colors"
                        title="Gerenciar origens de segmentação"
                      >
                        <Settings2 className="w-3 h-3" />
                        Gerenciar Segmentações
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SECRETARIAS_MOCK.map((sec) => (
                        <label
                          key={sec}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-bold',
                            formSecretarias.includes(sec)
                              ? 'bg-brand-accent/15 border-brand-accent/40 text-white'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formSecretarias.includes(sec)}
                            onChange={() => toggleSecretariaForm(sec)}
                            className="w-3.5 h-3.5 accent-indigo-500 shrink-0"
                          />
                          <span className="truncate">{sec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Canais de Disparo */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Canais de Disparo</label>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { id: 'email'    as CanalDisparo, label: '📧 E-mail',    cls: 'border-sky-400/30 bg-sky-500/10 text-sky-200'         },
                        { id: 'whatsapp' as CanalDisparo, label: '📱 WhatsApp',  cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' },
                        { id: 'mural'    as CanalDisparo, label: '📺 Mural',     cls: 'border-amber-400/30 bg-amber-500/10 text-amber-200'    },
                      ]).map((canal) => (
                        <label
                          key={canal.id}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-bold',
                            formCanais.includes(canal.id)
                              ? canal.cls
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formCanais.includes(canal.id)}
                            onChange={() => toggleCanal(canal.id)}
                            className="w-3.5 h-3.5 accent-indigo-500"
                          />
                          {canal.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna direita — Preview no Celular */}
                <div className="hidden lg:flex flex-col items-center gap-4 p-6 bg-black/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 flex items-center gap-2 self-start">
                    <Smartphone className="w-3.5 h-3.5" />
                    Preview no Celular
                  </p>

                  {/* Frame do celular */}
                  <div className="w-[200px] rounded-[2rem] border-[3px] border-slate-600 bg-slate-950 shadow-2xl overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-slate-900 px-4 pt-2 pb-1.5 flex items-center justify-between">
                      <div className="w-14 h-3 bg-slate-700 rounded-full" />
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />
                    </div>
                    {/* Mensagem simulada */}
                    <div className="p-3 min-h-[320px] bg-[#0b141a]">
                      <div className="bg-[#202c33] rounded-lg rounded-tl-none p-3 relative max-w-[90%]">
                        <p className="text-[10px] font-black text-emerald-400 mb-1">Comunicação Oficial</p>

                        {/* Prévia de imagem no celular */}
                        {formAnexo?.type === 'image' && formAnexo.previewUrl && (
                          <div className="w-full rounded-md overflow-hidden mb-2 bg-slate-800">
                            <img
                              src={formAnexo.previewUrl}
                              alt="Anexo"
                              className="w-full object-cover max-h-28"
                            />
                          </div>
                        )}
                        {formAnexo?.type === 'file' && (
                          <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-md bg-slate-800/80">
                            <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[9px] text-slate-300 truncate font-medium">{formAnexo.name}</span>
                          </div>
                        )}

                        <p className="text-[11px] font-bold text-white leading-snug break-words">
                          {formTitulo || 'Título do comunicado'}
                        </p>
                        {formConteudo && (
                          <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed break-words">
                            {formConteudo.length > 160 ? `${formConteudo.slice(0, 160)}...` : formConteudo}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-500 mt-2 text-right">
                          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                        </p>
                      </div>
                      {/* Canais selecionados */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formCanais.map((c) => (
                          <span key={c} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Home bar */}
                    <div className="bg-slate-900 py-2.5 flex items-center justify-center">
                      <div className="w-16 h-1 bg-slate-700 rounded-full" />
                    </div>
                  </div>

                  {/* Contador de chars */}
                  <div className={cn(
                    'text-center px-3 py-2 rounded-xl text-xs font-bold transition-colors',
                    formConteudo.length > 1024 && formCanais.includes('whatsapp')
                      ? 'bg-amber-500/15 border border-amber-400/25 text-amber-300'
                      : 'bg-white/5 border border-white/10 text-slate-500',
                  )}>
                    {formConteudo.length} / 1024 chars (WhatsApp)
                    {formConteudo.length > 1024 && formCanais.includes('whatsapp') && (
                      <p className="text-[10px] mt-0.5">⚠ será truncado</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer — 4 ações */}
              <div className="px-7 py-5 border-t border-white/10 flex flex-wrap items-center gap-3 justify-between">
                <button
                  type="button"
                  onClick={() => { setIsComunicadoModalOpen(false); resetNovoForm(); }}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSalvarRascunho}
                    className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    Salvar Rascunho
                  </button>
                  {isScheduleMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={formDataAgendamento}
                        onChange={(e) => setFormDataAgendamento(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-white/5 border border-amber-400/30 text-amber-200 text-sm font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleAgendar()}
                        className="px-5 py-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 font-bold text-sm hover:bg-amber-500/20 transition-all"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsScheduleMode(false)}
                        className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsScheduleMode(true)}
                      className="px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200 font-bold text-sm hover:bg-amber-500/15 transition-all"
                    >
                      Agendar Disparo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleEnviarAgora()}
                    disabled={isSendingComunicado}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-white font-bold text-sm hover:bg-brand-accent/90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isSendingComunicado ? 'Enviando...' : 'Enviar Agora'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: NOVA AÇÃO (Endomarketing)
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isNovaAcaoModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsNovaAcaoModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed inset-x-4 top-8 bottom-8 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[580px] max-w-[580px] z-50 flex flex-col rounded-3xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-white">Nova Ação da Campanha</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Adicione uma tarefa ao Kanban</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNovaAcaoModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Título da Tarefa *</label>
                  <input
                    type="text"
                    value={novaAcaoTitulo}
                    onChange={(e) => setNovaAcaoTitulo(e.target.value)}
                    placeholder="Ex.: Revisar roteiro do vídeo"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 focus:bg-white/8 text-sm transition-all"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Tipo de Ação *</label>
                  <select
                    value={novaAcaoTipo}
                    onChange={(e) => setNovaAcaoTipo(e.target.value as TipoAcao)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50 text-sm transition-all"
                  >
                    <option value="texto">📝 Texto / Redação</option>
                    <option value="arte">🎨 Arte / Design</option>
                    <option value="video">🎬 Vídeo / Produção</option>
                    <option value="evento">📅 Evento</option>
                  </select>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Responsável</label>
                  <input
                    type="text"
                    value={novaAcaoResponsavel}
                    onChange={(e) => setNovaAcaoResponsavel(e.target.value)}
                    placeholder="Ex.: Bruna Ferreira — Design"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 focus:bg-white/8 text-sm transition-all"
                  />
                </div>

                {/* Data Limite */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Data Limite *</label>
                  <input
                    type="date"
                    value={novaAcaoDataLimite}
                    onChange={(e) => setNovaAcaoDataLimite(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 shrink-0 flex flex-col-reverse sm:flex-row gap-3 justify-end bg-slate-950/80 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => { setIsNovaAcaoModalOpen(false); resetNovaAcaoForm(); }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarNovaAcao}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-violet-600 text-white text-sm font-black shadow-lg shadow-brand-accent/25 hover:from-violet-500 hover:to-violet-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Criar Ação
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: NOVA PESQUISA
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isNovaPesquisaModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsNovaPesquisaModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed inset-x-4 top-8 bottom-8 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[640px] max-w-[640px] z-50 flex flex-col rounded-3xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-white">Nova Pesquisa</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure as perguntas e publique ou salve como rascunho</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNovaPesquisaModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Título */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Título da pesquisa *</label>
                  <input
                    type="text"
                    value={npTitulo}
                    onChange={(e) => setNpTitulo(e.target.value)}
                    placeholder="Ex.: Pesquisa de Clima — Março 2025"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 text-sm transition-all"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Descrição / Contexto</label>
                  <textarea
                    rows={3}
                    value={npDescricao}
                    onChange={(e) => setNpDescricao(e.target.value)}
                    placeholder="Explique brevemente o objetivo da pesquisa para os participantes..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/8 text-sm transition-all resize-none"
                  />
                </div>

                {/* Toggle Anônima */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <p className="text-sm font-black text-white">Respostas anônimas</p>
                    <p className="text-xs text-slate-500 mt-0.5">Os participantes não serão identificados</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNpAnonima((v) => !v)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors duration-200',
                      npAnonima ? 'bg-emerald-500' : 'bg-slate-700',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                      npAnonima ? 'translate-x-6' : 'translate-x-0',
                    )} />
                  </button>
                </div>

                {/* Perguntas */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Perguntas</label>
                    <button
                      type="button"
                      onClick={addPergunta}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar pergunta
                    </button>
                  </div>
                  <div className="space-y-3">
                    {npPerguntas.map((pergunta, idx) => (
                      <div key={pergunta.id} className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                        <span className="w-6 h-6 rounded-lg bg-white/10 text-slate-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-2 min-w-0">
                          <input
                            type="text"
                            value={pergunta.enunciado}
                            onChange={(e) => updatePergunta(pergunta.id, 'enunciado', e.target.value)}
                            placeholder="Digite a pergunta..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400/40 text-sm transition-all"
                          />
                          <select
                            value={pergunta.tipo}
                            onChange={(e) => updatePergunta(pergunta.id, 'tipo', e.target.value as TipoPergunta)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-400/40 transition-all"
                          >
                            <option value="nota_0_10">Nota 0–10 (eNPS)</option>
                            <option value="multipla_escolha">Múltipla escolha</option>
                            <option value="texto">Resposta aberta</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePergunta(pergunta.id)}
                          disabled={npPerguntas.length === 1}
                          className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 mt-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 shrink-0 flex flex-col-reverse sm:flex-row gap-3 justify-end bg-slate-950/80 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => { setIsNovaPesquisaModalOpen(false); resetNovaPesquisaForm(); }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarPesquisaRascunho}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 text-sm font-black hover:bg-amber-500/20 transition-all"
                >
                  Salvar Rascunho
                </button>
                <button
                  type="button"
                  onClick={() => void handlePublicarPesquisa()}
                  disabled={isSavingPesquisa}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingPesquisa ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Publicar Pesquisa
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          DRAWER: GERENCIADOR DE CANAIS (slide from right)
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCanaisDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCanaisDrawerOpen(false)}
              className="fixed inset-0 z-[55] bg-black/50"
            />
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-[56] w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-black text-white">Gerenciador de Canais</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Status em tempo real dos canais de distribuição</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCanaisDrawerOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  aria-label="Fechar drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {CANAIS_MOCK.map((canal) => (
                  <div
                    key={canal.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      canal.tipo === 'email'    && 'bg-sky-500/15 text-sky-300',
                      canal.tipo === 'whatsapp' && 'bg-emerald-500/15 text-emerald-300',
                      canal.tipo === 'mural'    && 'bg-amber-500/15 text-amber-300',
                    )}>
                      {canal.tipo === 'email'    && <Mail className="w-5 h-5" />}
                      {canal.tipo === 'whatsapp' && <MessageCircle className="w-5 h-5" />}
                      {canal.tipo === 'mural'    && <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{canal.nome}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{canal.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        canal.conectado ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400',
                      )} />
                      <span className={cn(
                        'text-[10px] font-black px-2 py-1 rounded-full border',
                        canal.conectado
                          ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-400/25 text-rose-300',
                      )}>
                        {canal.conectado ? 'Conectado' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    {CANAIS_MOCK.filter((c) => c.conectado).length} conectados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                    {CANAIS_MOCK.filter((c) => !c.conectado).length} offline
                  </span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
