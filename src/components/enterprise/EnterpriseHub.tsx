import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bold,
  Calendar,
  Clock,
  GitBranch,
  Edit2,
  Facebook,
  FileText,
  Image as ImageIcon,
  Instagram,
  Italic,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  Newspaper,
  Paperclip,
  Save,
  Search,
  Send,
  Share2,
  Sparkles,
  Palette,
  Smile,
  Trash2,
  Twitter,
  UploadCloud,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { cn, callGeminiWithRetry } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import {
  PostRedeSocial,
  cancelarAgendamentoPostMock,
  criarPostRedeSocialMock,
  listarPostsRedeSocialMock,
  refinarLegendaInstitucionalMock,
} from '../../lib/postsMockApi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type HubTab = 'editor' | 'social' | 'history';

interface HubHistoryItem {
  id: string;
  title: string;
  date: string;
  status: 'Publicado' | 'Agendado' | 'Rascunho';
  type: string;
  content: string;
}

interface PressContact {
  id: string;
  nome: string;
  email: string;
  veiculo: string;
}

interface MailingGroup {
  id: string;
  nome: string;
  jornalistas_ids: string[];
}

type PieceType = 'Release' | 'Nota Oficial' | 'Matéria para Blog' | 'Script de Rádio/Vídeo' | 'Post para Redes Sociais';

function sanitizeAiText(text: string) {
  return text
    .replace(/```[a-zA-Z]*\n?/g, '')
    .replace(/```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .trim();
}

function isShortDraft(title: string, body: string) {
  const normalizedBody = body.trim();
  if (!normalizedBody) return true;
  if (normalizedBody.length < 140) return true;
  if (normalizedBody.split(/\n+/).filter(Boolean).length < 2) return true;
  return title.trim().length > 0 && normalizedBody.length < 220;
}

function getPieceInstruction(pieceType: PieceType) {
  if (pieceType === 'Nota Oficial') {
    return 'Escreva em formato de nota de esclarecimento, tom estritamente jurídico e objetivo, sem floreios.';
  }

  if (pieceType === 'Script de Rádio/Vídeo') {
    return 'Escreva em formato de roteiro (Áudio/Vídeo) com marcações de locutor, indicação de passagem e fechamento.';
  }

  if (pieceType === 'Matéria para Blog') {
    return 'Escreva em formato de matéria para blog institucional: título SEO amigável, intertítulos e conclusão orientada a serviço público.';
  }

  if (pieceType === 'Post para Redes Sociais') {
    return 'Escreva em formato de post para redes sociais com linguagem clara, objetiva, escaneável e chamada de ação adequada.';
  }

  return 'Escreva em formato de release jornalístico institucional com lead, desenvolvimento e fechamento.';
}

function buildReleasePrompt(title: string, body: string, pieceType: PieceType) {
  const pieceInstruction = getPieceInstruction(pieceType);
  const shortDraft = isShortDraft(title, body);

  if (shortDraft) {
    return `Você é um redator institucional sênior.

Crie um release completo, claro e pronto para publicação com base no material abaixo.

Objetivo:
- Entregar um release maior, organizado e publicável.
- Se o texto estiver curto ou incompleto, desenvolva a mensagem central de forma institucional.
- Não invente dados específicos verificáveis como números, datas, nomes de autoridades, endereços, falas entre aspas ou resultados concretos que não estejam no texto.
- Você pode ampliar o texto com linguagem institucional genérica e segura, desde que permaneça fiel ao tema informado.
- Tipo de peça selecionado: ${pieceType}.
- Instrução de formato obrigatória: ${pieceInstruction}

Estrutura esperada:
- Título forte.
- Lead de abertura.
- 2 a 4 parágrafos de desenvolvimento.
- Fechamento institucional.

Responda somente com o release final, sem markdown e sem comentários extras.

Título informado:
${title || 'Sem título informado'}

Texto/base informada:
${body || 'Sem texto adicional informado.'}`;
  }

  return `Você é um editor institucional sênior.

Reescreva o release abaixo para ficar mais claro, fluido, mais robusto e pronto para publicação.

Regras obrigatórias:
- Preserve somente os fatos já presentes no texto.
- Não invente citações, números, datas, locais, nomes, resultados ou promessas.
- Não acrescente contexto externo.
- Expanda a redação com melhor organização, coesão e acabamento editorial.
- Entregue um texto final mais completo do que o original.
- Tipo de peça selecionado: ${pieceType}.
- Instrução de formato obrigatória: ${pieceInstruction}
- Responda somente com a nova versão do release, sem markdown e sem comentários extras.

Título:
${title}

Release atual:
${body}`;
}

function isSocialContentType(type: string) {
  return type.toLowerCase().includes('social');
}

function formatChannelLabel(channel: string) {
  if (channel === 'x') return 'X/Twitter';
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

function isFutureSchedule(isoDate?: string) {
  if (!isoDate) return false;
  return new Date(isoDate).getTime() > Date.now();
}

function getTimelineStatusLabel(status: PostRedeSocial['status']) {
  if (status === 'postado') return 'Postado';
  if (status === 'agendado') return 'Agendado';
  return 'Rascunho';
}

const LS_KEY = 'hub_editor_draft';

function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { title: string; body: string; pieceType: PieceType };
  } catch {
    return null;
  }
}

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: 'Expressões', emojis: ['😀','😂','🤣','😍','🥰','😎','🤩','🙌','💪','🤔','👀','😤','🙏','🥳','😅','🤗','😢','😡','🤯','🫶'] },
  { label: 'Coração & Status', emojis: ['❤️','💙','💚','💛','🧡','💜','🖤','🤍','💯','✅','❌','⚡','🔥','⭐','🌟','✨','💫','🎯','👑','🏆'] },
  { label: 'Reações & Gestos', emojis: ['👍','👎','👏','🤝','🎉','🎊','🥳','🎵','🎤','📸','🎁','💡','🔑','📌','🔔','📅','⏰'] },
  { label: 'Comunicação', emojis: ['📢','📣','📰','📊','📋','✍️','💼','📜','📱','💻','🌐','🔗','📧','📞','💬','🗣️','🗂️'] },
  { label: 'Natureza & Mundo', emojis: ['🌈','☀️','🌙','🌸','🌿','🍃','🌊','🌱','🌺','🍀','🌍','🌎','🌏','🇧🇷','🏛️','🗳️','🏗️','⚖️'] },
];

const TEXT_COLORS: { label: string; hex: string }[] = [
  { label: 'Vermelho', hex: '#ef4444' },
  { label: 'Laranja', hex: '#f97316' },
  { label: 'Amarelo', hex: '#eab308' },
  { label: 'Verde', hex: '#22c55e' },
  { label: 'Ciano', hex: '#06b6d4' },
  { label: 'Azul', hex: '#3b82f6' },
  { label: 'Roxo', hex: '#a855f7' },
  { label: 'Rosa', hex: '#ec4899' },
];

export function EnterpriseHub({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const location = useLocation();
  const _draft = loadDraft();
  const [activeTab, setActiveTab] = useState<HubTab>('editor');
  const [crmContactIds, setCrmContactIds] = useState<string[]>([]);
  const [crmContactNames, setCrmContactNames] = useState<string[]>([]);
  const [crmBannerDismissed, setCrmBannerDismissed] = useState(false);
  const [pieceType, setPieceType] = useState<PieceType>(_draft?.pieceType ?? 'Release');
  const [releaseTitle, setReleaseTitle] = useState(_draft?.title ?? '');
  const [releaseBody, setReleaseBody] = useState(_draft?.body ?? '');
  const [socialCaption, setSocialCaption] = useState('');
  const [socialMediaFiles, setSocialMediaFiles] = useState<File[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'release' | 'social'>('todos');
  const [pressContacts, setPressContacts] = useState<PressContact[]>([]);
  const [mailingGroups, setMailingGroups] = useState<MailingGroup[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [pressSearch, setPressSearch] = useState('');
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [isRefiningCaption, setIsRefiningCaption] = useState(false);
  const [isSendingPress, setIsSendingPress] = useState(false);
  const [isRegisteringWorkflow, setIsRegisteringWorkflow] = useState(false);
  const [socialTimelineItems, setSocialTimelineItems] = useState<PostRedeSocial[]>([]);
  const [isLoadingSocialTimeline, setIsLoadingSocialTimeline] = useState(false);
  const [isSavingSocialTimeline, setIsSavingSocialTimeline] = useState(false);

  // Modal — Agendar
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleChannels, setScheduleChannels] = useState<Record<string, boolean>>({
    instagram: true, facebook: true, x: false, linkedin: false,
  });

  // Modal — Postar Agora
  const [isPostNowModalOpen, setIsPostNowModalOpen] = useState(false);

  // Modal — Workflow
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [wfTitle, setWfTitle] = useState('');
  const [wfColumn, setWfColumn] = useState<'backlog' | 'producao' | 'revisao'>('backlog');
  const [wfPriority, setWfPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [wfResponsavel, setWfResponsavel] = useState('Equipe Hub');
  const [wfDeadline, setWfDeadline] = useState('');

  const [channels, setChannels] = useState({
    facebook: true,
    instagram: true,
    x: false,
    linkedin: true,
  });

  const [historyItems, setHistoryItems] = useState<HubHistoryItem[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [aiAssistantMessage, setAiAssistantMessage] = useState('A IA usa somente o texto que estiver preenchido na tela e nao deve inventar fatos.');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorAttachmentInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const captionToolbarRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCaptionEmojiPicker, setShowCaptionEmojiPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
        setShowColorPicker(false);
      }
      if (captionToolbarRef.current && !captionToolbarRef.current.contains(e.target as Node)) {
        setShowCaptionEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const getSelectedSocialChannels = () => {
    return Object.entries(channels)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  };

  const loadHistory = async (filter: 'todos' | 'release' | 'social' = historyFilter) => {
    const { data, error } = await tenantService.listHubHistory();

    if (error) {
      alert(`Erro ao carregar histórico: ${error.message}`);
      return;
    }

    const rows = (data ?? []).filter((row: any) => {
      if (filter === 'social') return row.tipo_peca === 'Post Social';
      if (filter === 'release') return row.tipo_peca === 'Release';
      return true;
    });
    const labels: Record<string, 'Publicado' | 'Agendado' | 'Rascunho'> = {
      entregue: 'Publicado',
      revisao: 'Agendado',
      producao: 'Agendado',
      triagem: 'Rascunho',
    };

    setHistoryItems(rows.map(row => ({
      id: row.id,
      title: row.titulo,
      date: new Date(row.created_at).toISOString().split('T')[0],
      status: labels[row.status_ticket] ?? 'Rascunho',
      type: row.tipo_peca ?? 'Release',
      content: row.briefing ?? '',
    })));
  };

  const persistHubContent = async (status: 'rascunho' | 'agendado' | 'publicado') => {
    const ticketCodigo = `DM-${Date.now().toString().slice(-6)}`;
    const statusTicketMap: Record<'rascunho' | 'agendado' | 'publicado', 'triagem' | 'revisao' | 'entregue'> = {
      rascunho: 'triagem',
      agendado: 'revisao',
      publicado: 'entregue',
    };

    const contentType = activeTab === 'social' ? 'Post Social' : pieceType;
    const currentBody = activeTab === 'social' ? socialCaption : releaseBody;
    const currentTitle = releaseTitle.trim() || (activeTab === 'social' ? 'Post social sem título' : 'Release sem título');
    const enabledChannels = getSelectedSocialChannels();
    const socialPrefix = activeTab === 'social' && enabledChannels.length > 0
      ? `Canais selecionados: ${enabledChannels.join(', ')}\n\n`
      : '';

    const payload = {
      ticket_codigo: ticketCodigo,
      titulo: currentTitle,
      secretaria_solicitante: 'Hub de Conteudo',
      tipo_peca: contentType,
      prazo_texto: new Date().toLocaleDateString('pt-BR'),
      status_ticket: statusTicketMap[status],
      briefing: `${socialPrefix}${currentBody}`,
      responsavel: 'Equipe Hub',
      prioridade: 'Média',
    };

    const { data, error } = await tenantService.createHubDemanda(payload);

    if (error) {
      throw error;
    }

    return data?.[0];
  };

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ title: releaseTitle, body: releaseBody, pieceType }));
    } catch { /* storage quota */ }
  }, [releaseTitle, releaseBody, pieceType]);

  useEffect(() => {
    void loadHistory(historyFilter);
  }, [historyFilter]);

  useEffect(() => {
    const loadSocialTimeline = async () => {
      setIsLoadingSocialTimeline(true);
      try {
        const items = await listarPostsRedeSocialMock();
        setSocialTimelineItems(items);
      } finally {
        setIsLoadingSocialTimeline(false);
      }
    };

    void loadSocialTimeline();
  }, []);

  useEffect(() => {
    const loadContacts = async () => {
      const { data, error } = await tenantService.listEnterpriseJournalists();

      if (error) {
        console.error('[EnterpriseHub] Erro ao carregar contatos de imprensa:', error);
        return;
      }

      setPressContacts((data ?? []).map((row) => ({
        id: row.id,
        nome: row.nome ?? 'Sem nome',
        email: row.email ?? '',
        veiculo: row.veiculo ?? 'Veículo não informado',
      })).filter((row) => row.email));
    };

    void loadContacts();
  }, []);

  useEffect(() => {
    const loadMailingGroups = async () => {
      const { data, error } = await tenantService.listEnterpriseCRMGroups();

      if (error) {
        console.error('[EnterpriseHub] Erro ao carregar grupos de mailing:', error);
        return;
      }

      setMailingGroups((data ?? []).map((row) => ({
        id: row.id,
        nome: row.nome ?? 'Grupo sem nome',
        jornalistas_ids: Array.isArray(row.jornalistas_ids) ? row.jornalistas_ids : [],
      })));
    };

    void loadMailingGroups();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('contacts');
    if (!raw) return;
    const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      setCrmContactIds(ids);
      setCrmBannerDismissed(false);
      setSelectedRecipientIds(ids);
    }
  }, [location.search]);

  useEffect(() => {
    if (crmContactIds.length === 0 || pressContacts.length === 0) return;
    const names = crmContactIds
      .map((id) => pressContacts.find((c) => c.id === id)?.nome)
      .filter((n): n is string => Boolean(n));
    setCrmContactNames(names);
  }, [crmContactIds, pressContacts]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const insertAtCursor = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = releaseBody.substring(start, end);
    const newText = releaseBody.substring(0, start) + before + selected + after + releaseBody.substring(end);
    setReleaseBody(newText);
    setTimeout(() => {
      if (selected) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + before.length + selected.length + after.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + before.length;
      }
      textarea.focus();
    }, 0);
  };

  const insertBold = () => insertAtCursor('**', '**');
  const insertItalic = () => insertAtCursor('_', '_');

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const newText = releaseBody.substring(0, pos) + emoji + releaseBody.substring(pos);
    setReleaseBody(newText);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = pos + emoji.length;
      textarea.focus();
    }, 0);
  };

  const insertColor = (hex: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = releaseBody.substring(start, end);
    if (!selected) {
      setToastMessage({ text: '⚠️ Selecione um trecho de texto para colorir', type: 'error' });
      setShowColorPicker(false);
      return;
    }
    const tag = `<span style="color:${hex}">${selected}</span>`;
    const newText = releaseBody.substring(0, start) + tag + releaseBody.substring(end);
    setReleaseBody(newText);
    setShowColorPicker(false);
    setTimeout(() => textarea.focus(), 0);
  };

  const insertLink = () => {
    setIsLinkModalOpen(true);
  };

  const insertLinkConfirm = () => {
    if (!linkUrl.trim()) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = releaseBody.substring(start, end) || 'clique aqui';
    
    const newText = releaseBody.substring(0, start) + `[${selected}](${linkUrl})` + releaseBody.substring(end);
    setReleaseBody(newText);
    setLinkUrl('');
    setIsLinkModalOpen(false);
    setTimeout(() => textarea.focus(), 0);
  };

  const insertAttachment = () => {
    editorAttachmentInputRef.current?.click();
  };

  const handleEditorAttachmentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const textarea = textareaRef.current;
    const pos = textarea ? textarea.selectionStart : releaseBody.length;
    const tag = `\n📎 [Anexo: ${file.name}]`;
    const newText = releaseBody.substring(0, pos) + tag + releaseBody.substring(pos);
    setReleaseBody(newText);
    e.target.value = '';
    setTimeout(() => {
      if (textarea) { textarea.selectionStart = textarea.selectionEnd = pos + tag.length; textarea.focus(); }
    }, 0);
  };

  const insertImage = () => {
    editorImageInputRef.current?.click();
  };

  const captionInsertAtCursor = (before: string, after = '') => {
    const ta = captionRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = socialCaption.substring(start, end);
    const newText = socialCaption.substring(0, start) + before + sel + after + socialCaption.substring(end);
    setSocialCaption(newText);
    setTimeout(() => {
      ta.selectionStart = sel ? start : start + before.length;
      ta.selectionEnd = sel ? start + before.length + sel.length + after.length : start + before.length;
      ta.focus();
    }, 0);
  };

  const captionInsertEmoji = (emoji: string) => {
    const ta = captionRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    setSocialCaption(prev => prev.substring(0, pos) + emoji + prev.substring(pos));
    setShowCaptionEmojiPicker(false);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = pos + emoji.length; ta.focus(); }, 0);
  };

  const handleEditorImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const textarea = textareaRef.current;
    const pos = textarea ? textarea.selectionStart : releaseBody.length;
    const tag = `\n🖼️ [Imagem: ${file.name}]`;
    const newText = releaseBody.substring(0, pos) + tag + releaseBody.substring(pos);
    setReleaseBody(newText);
    e.target.value = '';
    setTimeout(() => {
      if (textarea) { textarea.selectionStart = textarea.selectionEnd = pos + tag.length; textarea.focus(); }
    }, 0);
  };

  const handleTransformToSocialPost = async () => {
    if (!releaseTitle.trim() && !releaseBody.trim()) {
      setToastMessage({ text: '❌ Escreva um release antes de converter', type: 'error' });
      return;
    }

    setIsGeneratingSocial(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.buildInstitutionalPrompt(`Transforme o conteúdo abaixo em uma legenda curta e envolvente para redes sociais.

Regras obrigatórias:
- Use apenas as informações explicitamente presentes no texto.
- Não invente nomes, datas, números, locais, promessas, citações ou benefícios.
- Se faltar contexto, não complete lacunas.
- Mantenha um tom institucional, claro e natural.
- Inclua de 3 a 5 hashtags relevantes ao tema ao final do texto.
- Entregue somente a legenda final com as hashtags, sem markdown e sem explicações.

Título:
${releaseTitle}

Texto base:
${releaseBody}`);
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: institutionalPrompt,
        }),
        (msg) => setAiAssistantMessage(msg || 'Aguardando IA...'),
      );

      const generatedText = sanitizeAiText(response.text ?? '');
      if (!generatedText) {
        throw new Error('Resposta vazia da API do Gemini ao transformar o release em post.');
      }

      setSocialCaption(generatedText);
      setActiveTab('social');
      setAiAssistantMessage('Legenda gerada com base exclusiva no texto atual do editor, directives do Cérebro e sem adicionar fatos novos.');
      setToastMessage({ text: '✅ Post gerado com IA — aba Social aberta com a legenda e hashtags.', type: 'success' });
    } catch (error) {
      console.error('[EnterpriseHub] Erro ao transformar release em post com Gemini:', error);
      alert('Erro ao gerar post com IA. Verifique a chave do Gemini, a conexão com a internet e tente novamente.');
      setAiAssistantMessage('Falha ao consultar a IA para gerar a legenda do release.');
      setToastMessage({ text: '❌ Falha ao gerar post com IA.', type: 'error' });
    } finally {
      setIsGeneratingSocial(false);
    }
  };
  const handleSaveRelease = async (status: 'rascunho' | 'agendado' | 'publicado', extraNote?: string) => {
    const statusLabels = {
      rascunho: 'Rascunho salvo com sucesso!',
      agendado: 'Post agendado com sucesso!',
      publicado: 'Post registrado como publicado!',
    };
    setIsSaving(true);
    try {
      const row = await persistHubContent(status);
      if (!row) {
        setToastMessage({ text: extraNote ?? statusLabels[status], type: 'success' });
        void loadHistory(historyFilter);
        return;
      }
      setHistoryItems(prev => [{
        id: row.id,
        title: row.titulo,
        date: new Date(row.created_at).toISOString().split('T')[0],
        status: status === 'publicado' ? 'Publicado' : status === 'agendado' ? 'Agendado' : 'Rascunho',
        type: row.tipo_peca ?? 'Release',
        content: row.briefing ?? '',
      }, ...prev]);
      setToastMessage({ text: extraNote ?? statusLabels[status], type: 'success' });
      void loadHistory(historyFilter);
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshSocialTimeline = async () => {
    const items = await listarPostsRedeSocialMock();
    setSocialTimelineItems(items);
  };

  const resetSocialComposer = () => {
    setSocialCaption('');
    setSocialMediaFiles([]);
    setChannels({
      facebook: true,
      instagram: true,
      x: false,
      linkedin: true,
    });
  };

  const persistSocialTimelineItem = async (params: {
    status: 'rascunho' | 'agendado' | 'postado';
    agendadoPara?: string;
  }) => {
    const selectedChannels = getSelectedSocialChannels();
    const post = await criarPostRedeSocialMock({
      titulo: releaseTitle.trim() || 'Post social sem título',
      legenda: socialCaption.trim() || releaseBody.trim(),
      canais: selectedChannels,
      status: params.status,
      agendadoPara: params.agendadoPara,
      arquivosMidia: socialMediaFiles.map((file) => file.name),
    });

    setSocialTimelineItems((prev) => [post, ...prev]);
  };

  // Agendar — abre modal
  const handleOpenScheduleModal = () => {
    if (!socialCaption.trim() && !releaseBody.trim()) {
      setToastMessage({ text: '❌ Escreva o conteúdo antes de agendar.', type: 'error' });
      return;
    }
    // Default: tomorrow 09:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
    setScheduleChannels({ instagram: true, facebook: true, x: false, linkedin: false });
    setIsScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDate || !scheduleTime) {
      setToastMessage({ text: '❌ Informe data e hora.', type: 'error' });
      return;
    }
    const chosen = Object.entries(scheduleChannels).filter(([, v]) => v).map(([k]) => k);
    if (chosen.length === 0) {
      setToastMessage({ text: '❌ Selecione ao menos uma rede social.', type: 'error' });
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setToastMessage({ text: '❌ Data/hora inválida para agendamento.', type: 'error' });
      return;
    }

    setIsSavingSocialTimeline(true);
    setIsScheduleModalOpen(false);
    try {
      await persistSocialTimelineItem({
        status: 'agendado',
        agendadoPara: scheduledAt.toISOString(),
      });
      await handleSaveRelease('agendado');
      setToastMessage({ text: `✅ Agendado para ${scheduleDate} às ${scheduleTime} em: ${chosen.map(formatChannelLabel).join(', ')}.`, type: 'success' });
      resetSocialComposer();
    } catch (error: any) {
      setToastMessage({ text: `❌ Falha ao agendar: ${error?.message ?? 'erro inesperado'}`, type: 'error' });
    } finally {
      setIsSavingSocialTimeline(false);
      void refreshSocialTimeline();
    }
  };

  // Postar Agora — abre modal de confirmação
  const handleOpenPostNowModal = () => {
    if (!socialCaption.trim() && !releaseBody.trim()) {
      setToastMessage({ text: '❌ Escreva o conteúdo antes de publicar.', type: 'error' });
      return;
    }
    setIsPostNowModalOpen(true);
  };

  const handlePostNowConfirm = async () => {
    const selectedChannels = getSelectedSocialChannels();
    if (selectedChannels.length === 0) {
      setToastMessage({ text: '❌ Selecione ao menos uma rede antes de postar.', type: 'error' });
      return;
    }

    setIsSavingSocialTimeline(true);
    setIsPostNowModalOpen(false);
    try {
      await persistSocialTimelineItem({ status: 'postado' });
      await handleSaveRelease('publicado');
      setToastMessage({ text: '✅ Publicação registrada com sucesso!', type: 'success' });
      resetSocialComposer();
    } catch (error: any) {
      setToastMessage({ text: `❌ Falha ao publicar: ${error?.message ?? 'erro inesperado'}`, type: 'error' });
    } finally {
      setIsSavingSocialTimeline(false);
      void refreshSocialTimeline();
    }
  };

  const handleSaveSocialDraft = async () => {
    if (!socialCaption.trim() && socialMediaFiles.length === 0) {
      setToastMessage({ text: '❌ Escreva uma legenda ou adicione mídia antes de salvar.', type: 'error' });
      return;
    }

    setIsSavingSocialTimeline(true);
    try {
      await persistSocialTimelineItem({ status: 'rascunho' });
      await handleSaveRelease('rascunho');
      setToastMessage({ text: '✅ Rascunho salvo no workflow social.', type: 'success' });
    } catch (error: any) {
      setToastMessage({ text: `❌ Falha ao salvar rascunho: ${error?.message ?? 'erro inesperado'}`, type: 'error' });
    } finally {
      setIsSavingSocialTimeline(false);
      void refreshSocialTimeline();
    }
  };

  const handleDistributeToPress = async () => {
    if (!releaseTitle.trim() && !releaseBody.trim()) {
      setToastMessage({ text: '❌ Escreva o release antes de enviar para o mailing.', type: 'error' });
      return;
    }

    setIsSendingPress(true);
    try {
      await persistHubContent('rascunho');
      setToastMessage({ text: '✅ Release salvo. Preparando distribuição no CRM...', type: 'success' });
      setIsPressModalOpen(true);
      void loadHistory(historyFilter);
    } catch (error: any) {
      alert(`Erro ao preparar distribuição: ${error.message}`);
    } finally {
      setIsSendingPress(false);
    }
  };

  const handleRegisterInWorkflow = async () => {
    // Open modal pre-filled
    setWfTitle(releaseTitle.trim() || 'Post social sem título');
    setWfColumn('backlog');
    setWfPriority('media');
    setWfResponsavel('Equipe Hub');
    setWfDeadline('');
    setIsWorkflowModalOpen(true);
  };

  const handleWorkflowConfirm = async () => {
    const content = activeTab === 'social' ? socialCaption.trim() : releaseBody.trim();
    if (!content && !wfTitle.trim()) {
      setToastMessage({ text: '❌ Preencha o título ou o conteúdo antes de registrar.', type: 'error' });
      return;
    }
    const channelsText = getSelectedSocialChannels();
    setIsRegisteringWorkflow(true);
    const payload = {
      titulo: wfTitle.trim() || 'Post social sem título',
      descricao: `${content}${channelsText.length ? `\n\nCanais: ${channelsText.join(', ')}` : ''}`,
      prioridade: wfPriority,
      responsavel: wfResponsavel.trim() || 'Equipe Hub',
      tags: channelsText,
      status_coluna: wfColumn,
      ...(wfDeadline ? { prazo_texto: wfDeadline } : {}),
    };
    const { error } = await tenantService.registerEnterprisePauta(payload);
    setIsRegisteringWorkflow(false);
    setIsWorkflowModalOpen(false);
    if (error) {
      alert(`Erro ao registrar no workflow: ${error.message}`);
      return;
    }
    setToastMessage({ text: '✅ Tarefa registrada no Workflow!', type: 'success' });
  };

  const handleDeleteHistoryItem = async (id: string) => {
    const { error } = await tenantService.deleteHubHistoryItem(id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    setHistoryItems((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSocialMediaFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleMediaDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    setSocialMediaFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveMediaFile = (index: number) => {
    setSocialMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkDeleteHistory = async () => {
    if (!selectedHistoryIds.length) return;
    await Promise.allSettled(selectedHistoryIds.map((id) => tenantService.deleteHubHistoryItem(id)));
    setHistoryItems((prev) => prev.filter((item) => !selectedHistoryIds.includes(item.id)));
    setToastMessage({ text: `✅ ${selectedHistoryIds.length} item(s) excluído(s).`, type: 'success' });
    setSelectedHistoryIds([]);
  };

  const toggleHistorySelection = (id: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportPdf = () => {
    const content = `${releaseTitle}\n\n${releaseBody}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${releaseTitle || 'release'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAiSuggestion = async () => {
    if (!releaseTitle.trim() && !releaseBody.trim()) {
      setToastMessage({ text: '❌ Escreva um release antes de solicitar uma sugestão da IA', type: 'error' });
      return;
    }

    setIsApplyingSuggestion(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.buildInstitutionalPrompt(buildReleasePrompt(releaseTitle, releaseBody, pieceType));
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: institutionalPrompt,
        }),
        (msg) => setAiAssistantMessage(msg || 'Aguardando IA...'),
      );

      const suggestedText = sanitizeAiText(response.text ?? '');
      if (!suggestedText) {
        throw new Error('Resposta vazia da API do Gemini ao gerar sugestão editorial.');
      }

      setReleaseBody(suggestedText);
      setAiAssistantMessage(
        isShortDraft(releaseTitle, releaseBody)
          ? 'A IA gerou um release mais completo a partir do tema e do rascunho curto informado.'
          : 'A IA expandiu e refinou o release atual sem adicionar fatos novos.'
      );
      setToastMessage({ text: '✅ Release gerado/melhorado com IA.', type: 'success' });
    } catch (error) {
      console.error('[EnterpriseHub] Erro ao aplicar sugestão com Gemini:', error);
      alert('Erro ao aplicar sugestão da IA. Verifique a chave do Gemini, a conexão com a internet e tente novamente.');
      setAiAssistantMessage('Falha ao consultar a IA para revisar o release.');
      setToastMessage({ text: '❌ Falha ao aplicar sugestão da IA.', type: 'error' });
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  const handleRefineSocialCaption = async () => {
    if (!socialCaption.trim()) {
      setToastMessage({ text: '❌ Escreva uma legenda antes de pedir refinamento da IA.', type: 'error' });
      return;
    }

    setIsRefiningCaption(true);
    setAiAssistantMessage('Analisando tom institucional e refinando a legenda...');
    try {
      const refinedText = await refinarLegendaInstitucionalMock(socialCaption);
      setSocialCaption(refinedText);
      setAiAssistantMessage('Legenda refinada com simulação institucional e pronta para operação.');
      setToastMessage({ text: '✅ Legenda refinada com IA institucional (simulação).', type: 'success' });
    } catch {
      setAiAssistantMessage('Falha ao refinar a legenda no modo de simulação.');
      setToastMessage({ text: '❌ Falha ao refinar a legenda.', type: 'error' });
    } finally {
      setIsRefiningCaption(false);
    }
  };

  const handleCancelScheduledPost = async (postId: string) => {
    setIsSavingSocialTimeline(true);
    try {
      const updated = await cancelarAgendamentoPostMock(postId);
      if (!updated) {
        setToastMessage({ text: '❌ Post não encontrado para cancelar.', type: 'error' });
        return;
      }
      setToastMessage({ text: '✅ Agendamento cancelado e retorno para rascunho.', type: 'success' });
    } finally {
      setIsSavingSocialTimeline(false);
      void refreshSocialTimeline();
    }
  };

  const handleOpenPressModal = () => {
    setIsPressModalOpen(true);
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const handleSendReleaseToRecipients = async () => {
    if (!selectedRecipientIds.length) {
      alert('Selecione ao menos um contato de imprensa para enviar o release.');
      return;
    }

    const selectedContacts = pressContacts.filter((contact) => selectedRecipientIds.includes(contact.id));
    const recipients = selectedContacts.map((contact) => contact.email).join(';');
    const body = `${releaseTitle || 'Release'}\n\n${releaseBody}`.trim();

    if (!body) {
      alert('Escreva o release antes de enviar para a lista de contatos.');
      return;
    }

    setIsSendingPress(true);
    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(releaseTitle || 'Release de Imprensa')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    // Registra interação na timeline do CRM para cada jornalista selecionado
    const releaseDesc = releaseTitle.trim() || 'Release de Imprensa';
    await Promise.allSettled(
      selectedRecipientIds.map((contactId) =>
        tenantService.createCRMInteraction({
          contato_id: contactId,
          tipo_interacao: 'hub_release',
          resumo_mensagem: releaseDesc,
          dados_estruturados: {
            source: 'hub',
            canais: ['email'],
            destinatarios_total: selectedRecipientIds.length,
          },
        })
      )
    );

    setToastMessage({ text: '✅ Release enviado e timeline do CRM atualizada.', type: 'success' });
    setIsPressModalOpen(false);
    setIsSendingPress(false);
  };

  const handleClearEditor = () => {
    setReleaseTitle('');
    setReleaseBody('');
    setPieceType('Release');
    try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
    setToastMessage({ text: '🗑️ Rascunho local apagado.', type: 'success' });
  };

  const handleEditHistoryItem = (item: HubHistoryItem) => {
    setReleaseTitle(item.title);
    if (isSocialContentType(item.type)) {
      setSocialCaption(item.content);
      setActiveTab('social');
      return;
    }

    setReleaseBody(item.content);
    setActiveTab('editor');
  };

  const filteredHistoryItems = historyItems.filter((item) => {
    return true;
  });

  const filteredPressContacts = pressContacts.filter((contact) => {
    const term = pressSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      contact.nome.toLowerCase().includes(term)
      || contact.email.toLowerCase().includes(term)
      || contact.veiculo.toLowerCase().includes(term)
    );
  });

  const allVisibleSelected = filteredPressContacts.length > 0
    && filteredPressContacts.every((contact) => selectedRecipientIds.includes(contact.id));

  const handleToggleVisibleRecipients = () => {
    if (allVisibleSelected) {
      setSelectedRecipientIds((current) => current.filter((id) => !filteredPressContacts.some((contact) => contact.id === id)));
      return;
    }

    setSelectedRecipientIds((current) => Array.from(new Set([
      ...current,
      ...filteredPressContacts.map((contact) => contact.id),
    ])));
  };

  const handleToggleGroupRecipients = (group: MailingGroup) => {
    const validIds = group.jornalistas_ids.filter((id) => pressContacts.some((contact) => contact.id === id));
    const allSelected = validIds.length > 0 && validIds.every((id) => selectedRecipientIds.includes(id));

    if (allSelected) {
      setSelectedRecipientIds((current) => current.filter((id) => !validIds.includes(id)));
      return;
    }

    setSelectedRecipientIds((current) => Array.from(new Set([...current, ...validIds])));
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100">

      {/* ── Banner CRM: contatos pré-selecionados vindos do CRM ── */}
      <AnimatePresence>
        {crmContactIds.length > 0 && !crmBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-brand-accent/40 bg-brand-accent/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-accent/20 border border-brand-accent/30 shrink-0">
                <Users className="w-4 h-4 text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-black text-white">
                  🎯 Gerando conteúdo direcionado para {crmContactIds.length} contato{crmContactIds.length > 1 ? 's' : ''} do CRM
                </p>
                {crmContactNames.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {crmContactNames.slice(0, 4).join(', ')}
                    {crmContactNames.length > 4 ? ` e mais ${crmContactNames.length - 4}...` : ''}
                  </p>
                )}
                <p className="text-xs text-brand-accent/80 mt-1">
                  Esses contatos já estão pré-selecionados na lista de distribuição. Escreva o release e clique em "Enviar para Mailing".
                </p>
              </div>
            </div>
            <button
              onClick={() => setCrmBannerDismissed(true)}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-slate-300 hover:bg-white/10 transition-colors"
            >
              Dispensar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Hub de <span className="text-brand-accent">Conteúdo</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Redação de releases, distribuição social e histórico operacional com foco em produtividade da assessoria.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'editor', label: '📝 Editor de Release', icon: Newspaper },
            { id: 'social', label: '📱 Distribuição Social', icon: Share2 },
            { id: 'history', label: '🗂️ Histórico', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as HubTab)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-brand-accent/20 border-brand-accent/40 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Editor */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Título do Release</label>
                <input
                  type="text"
                  value={releaseTitle}
                  onChange={(event) => setReleaseTitle(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Peça</label>
                <select
                  value={pieceType}
                  onChange={(event) => setPieceType(event.target.value as PieceType)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
                >
                  <option className="bg-slate-900">Release</option>
                  <option className="bg-slate-900">Nota Oficial</option>
                  <option className="bg-slate-900">Matéria para Blog</option>
                  <option className="bg-slate-900">Script de Rádio/Vídeo</option>
                  <option className="bg-slate-900">Post para Redes Sociais</option>
                </select>
              </div>

              <div ref={toolbarRef} className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden">
                <div className="border-b border-white/10 bg-white/5 px-3 py-2 flex flex-wrap items-center gap-1">
                  {/* Negrito */}
                  <button type="button" title="Negrito (**texto**)" onMouseDown={(e) => e.preventDefault()} onClick={insertBold}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <Bold className="w-4 h-4" />
                  </button>
                  {/* Itálico */}
                  <button type="button" title="Itálico (_texto_)" onMouseDown={(e) => e.preventDefault()} onClick={insertItalic}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <Italic className="w-4 h-4" />
                  </button>
                  {/* Link */}
                  <button type="button" title="Inserir link" onMouseDown={(e) => e.preventDefault()} onClick={insertLink}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <Link2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  {/* Cor do texto */}
                  <div className="relative">
                    <button type="button" title="Cor do texto (selecione o texto primeiro)"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setShowColorPicker(v => !v); setShowEmojiPicker(false); }}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-10 left-0 z-50 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl min-w-[180px]">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Selecione o texto → aplique a cor</p>
                        <div className="grid grid-cols-4 gap-2">
                          {TEXT_COLORS.map(c => (
                            <button key={c.hex} type="button" title={c.label}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertColor(c.hex)}
                              className="w-8 h-8 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                              style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Emojis */}
                  <div className="relative">
                    <button type="button" title="Inserir emoji"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setShowEmojiPicker(v => !v); setShowColorPicker(false); }}
                      className={cn('w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 transition-colors flex items-center justify-center', showEmojiPicker ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10')}>
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-10 left-0 z-50 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl w-72 max-h-64 overflow-y-auto">
                        {EMOJI_CATEGORIES.map(cat => (
                          <div key={cat.label} className="mb-3 last:mb-0">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{cat.label}</p>
                            <div className="flex flex-wrap gap-0.5">
                              {cat.emojis.map(emoji => (
                                <button key={emoji} type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => insertEmoji(emoji)}
                                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-lg flex items-center justify-center transition-colors leading-none">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  {/* Anexo */}
                  <button type="button" title="Anexar arquivo" onMouseDown={(e) => e.preventDefault()} onClick={insertAttachment}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  {/* Imagem */}
                  <button type="button" title="Inserir imagem" onMouseDown={(e) => e.preventDefault()} onClick={insertImage}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={releaseBody}
                  onChange={(event) => setReleaseBody(event.target.value)}
                  onMouseDown={() => { setShowEmojiPicker(false); setShowColorPicker(false); }}
                  className="w-full min-h-[340px] px-4 py-4 bg-transparent text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 outline-none resize-none"
                  placeholder="Escreva o release aqui..."
                />
                {/* Hidden file inputs for editor toolbar */}
                <input
                  ref={editorAttachmentInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleEditorAttachmentSelected}
                />
                <input
                  ref={editorImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditorImageSelected}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleSaveRelease('rascunho')} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
                <button onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  <FileText className="w-4 h-4" />
                  Exportar PDF
                </button>
                <button onClick={handleApplyAiSuggestion} disabled={isApplyingSuggestion} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-60">
                  {isApplyingSuggestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isApplyingSuggestion ? 'Gerando Release...' : 'Gerar/Melhorar Release (IA)'}
                </button>
                <button onClick={() => handleTransformToSocialPost()} disabled={isGeneratingSocial} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-950 px-4 py-2.5 text-sm font-black shadow-[0_0_24px_rgba(45,212,191,0.45)] hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:hover:scale-100">
                  {isGeneratingSocial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGeneratingSocial ? 'Gerando Post...' : 'Transformar em Post Social (IA)'}
                </button>
                <button onClick={handleDistributeToPress} disabled={isSendingPress} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-400/15 transition-colors disabled:opacity-60">
                  {isSendingPress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  {isSendingPress ? 'Preparando CRM...' : 'Distribuir para Imprensa'}
                </button>
                <button onClick={handleClearEditor} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-black text-red-300 hover:bg-red-400/15 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Limpar Editor
                </button>
              </div>
            </div>

            {/* Assistente IA */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5">
                <h3 className="text-lg font-black text-white mb-4">Checklist de Qualidade</h3>
                <div className="space-y-3">
                  {[
                    'Título impactante e claro',
                    'Lead com quem, onde e quando',
                    'Citação de autoridade institucional',
                    'Serviço e contato para imprensa',
                    'CTA e próximos passos',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                      <p className="text-sm text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-brand-accent/20 bg-brand-accent/10 backdrop-blur-xl p-5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-6 h-6 text-brand-accent mb-3" />
                <h3 className="text-lg font-black text-white">Sugestão de IA</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {aiAssistantMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'social' && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Criação */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Seleção de Canais</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'facebook', label: 'Facebook', icon: Facebook },
                    { key: 'instagram', label: 'Instagram', icon: Instagram },
                    { key: 'x', label: 'X', icon: Twitter },
                    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  ].map((channel) => {
                    const Icon = channel.icon;
                    const enabled = channels[channel.key as keyof typeof channels];

                    return (
                      <button
                        key={channel.key}
                        type="button"
                        onClick={() => toggleChannel(channel.key as keyof typeof channels)}
                        className={cn(
                          'rounded-xl border px-3 py-3 flex items-center justify-between transition-colors',
                          enabled
                            ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        )}
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-black">
                          <Icon className="w-4 h-4" />
                          {channel.label}
                        </span>
                        <span
                          className={cn(
                            'relative inline-block h-5 w-9 rounded-full transition-colors',
                            enabled ? 'bg-emerald-400' : 'bg-slate-600'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
                              enabled ? 'left-4.5' : 'left-0.5'
                            )}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white mb-3">Mídia</h3>
                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleMediaDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 rounded-2xl bg-white/5 p-8 text-center cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <UploadCloud className="w-7 h-7 text-cyan-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-white">Arraste fotos/vídeos aqui</p>
                  <p className="text-xs text-slate-500 mt-1">ou clique para selecionar arquivos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleMediaFileChange}
                  />
                </div>
                {/* Previews */}
                {socialMediaFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socialMediaFiles.map((file, idx) => (
                      <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-slate-800">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveMediaFile(idx); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-white">Legenda</h3>
                  {/* Instagram char counter */}
                  {(() => {
                    const len = socialCaption.length;
                    const ig = 2200;
                    const pct = Math.min(len / ig, 1);
                    const color = len > ig ? 'text-red-400' : len > ig * 0.8 ? 'text-amber-400' : 'text-slate-400';
                    return (
                      <div className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
                          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                          <circle cx="14" cy="14" r="11" fill="none"
                            stroke={len > ig ? '#ef4444' : len > ig * 0.8 ? '#f59e0b' : '#6366f1'}
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 11}`}
                            strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={`text-xs font-black tabular-nums ${color}`}>
                          {len > ig ? `+${len - ig}` : ig - len}
                          <span className="text-slate-600 font-normal"> / {ig}</span>
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Caption toolbar */}
                <div ref={captionToolbarRef} className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-visible">
                  <div className="border-b border-white/10 bg-white/5 px-3 py-2 flex flex-wrap items-center gap-1">
                    {/* Negrito */}
                    <button type="button" title="Negrito" onMouseDown={e => e.preventDefault()}
                      onClick={() => captionInsertAtCursor('**', '**')}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                      <Bold className="w-4 h-4" />
                    </button>
                    {/* Itálico */}
                    <button type="button" title="Itálico" onMouseDown={e => e.preventDefault()}
                      onClick={() => captionInsertAtCursor('_', '_')}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    {/* Emoji picker */}
                    <div className="relative">
                      <button type="button" title="Inserir emoji" onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowCaptionEmojiPicker(v => !v)}
                        className={cn('w-8 h-8 rounded-lg border border-white/10 bg-slate-900/60 transition-colors flex items-center justify-center', showCaptionEmojiPicker ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10')}>
                        <Smile className="w-4 h-4" />
                      </button>
                      {showCaptionEmojiPicker && (
                        <div className="absolute top-10 left-0 z-50 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl w-72 max-h-64 overflow-y-auto">
                          {EMOJI_CATEGORIES.map(cat => (
                            <div key={cat.label} className="mb-3 last:mb-0">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{cat.label}</p>
                              <div className="flex flex-wrap gap-0.5">
                                {cat.emojis.map(emoji => (
                                  <button key={emoji} type="button"
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => captionInsertEmoji(emoji)}
                                    className="w-8 h-8 rounded-lg hover:bg-white/10 text-lg flex items-center justify-center transition-colors leading-none">
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    {/* Dicas rápidas de hashtag */}
                    {['#mandato','#politica','#gestão'].map(tag => (
                      <button key={tag} type="button" onMouseDown={e => e.preventDefault()}
                        onClick={() => captionInsertAtCursor(` ${tag}`)}
                        className="px-2 h-7 rounded-lg border border-white/10 bg-slate-900/60 text-[11px] font-black text-brand-accent hover:bg-white/10 transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>

                  <textarea
                    ref={captionRef}
                    value={socialCaption}
                    onChange={e => setSocialCaption(e.target.value)}
                    onFocus={() => setShowCaptionEmojiPicker(false)}
                    className="w-full min-h-[220px] px-4 py-4 bg-transparent text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 outline-none resize-none"
                    placeholder="Escreva a legenda da publicação...&#10;&#10;Dica: no Instagram, linhas em branco criam parágrafos visíveis."
                    maxLength={2500}
                  />

                  {/* Limites por rede */}
                  <div className="border-t border-white/10 bg-white/5 px-3 py-2 flex flex-wrap gap-3">
                    {[
                      { label: 'Instagram', max: 2200, icon: '📸' },
                      { label: 'Facebook', max: 63206, icon: '📘' },
                      { label: 'LinkedIn', max: 3000, icon: '💼' },
                      { label: 'X / Twitter', max: 280, icon: '𝕏' },
                    ].map(n => {
                      const over = socialCaption.length > n.max;
                      const near = !over && socialCaption.length > n.max * 0.85;
                      return (
                        <span key={n.label} className={cn('inline-flex items-center gap-1.5 text-[11px] font-black rounded-full px-2.5 py-1 border', over ? 'bg-red-500/10 border-red-400/20 text-red-300' : near ? 'bg-amber-400/10 border-amber-400/20 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400')}>
                          <span>{n.icon}</span>
                          {over ? `⚠️ ${socialCaption.length - n.max} acima do limite` : `${n.max - socialCaption.length} restantes`}
                          <span className="text-slate-600">({n.label})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={handleRefineSocialCaption} disabled={isRefiningCaption} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-60">
                  {isRefiningCaption ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isRefiningCaption ? 'Refinando Legenda...' : 'Refinar Legenda com IA'}
                </button>
                <button onClick={handleSaveSocialDraft} disabled={isSaving || isSavingSocialTimeline} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {isSaving || isSavingSocialTimeline ? 'Salvando...' : 'Salvar Rascunho de Post'}
                </button>
                <button onClick={handleOpenScheduleModal} disabled={isSaving || isSavingSocialTimeline} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-60">
                  <Calendar className="w-4 h-4" />
                  Agendar
                </button>
                <button onClick={handleOpenPostNowModal} disabled={isSaving || isSavingSocialTimeline} className="inline-flex items-center gap-2 rounded-xl bg-brand-accent text-white px-4 py-2.5 text-sm font-black hover:bg-brand-accent/90 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-60">
                  <Send className="w-4 h-4" />
                  {isSaving || isSavingSocialTimeline ? 'Postando...' : 'Postar Agora'}
                </button>
                <button onClick={handleRegisterInWorkflow} disabled={isRegisteringWorkflow} className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-black text-amber-100 hover:bg-amber-400/15 transition-colors disabled:opacity-60">
                  {isRegisteringWorkflow ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                  {isRegisteringWorkflow ? 'Registrando...' : 'Registrar no Planejamento/Workflow'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Preview celular */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 flex items-center justify-center">
                <div className="w-full max-w-[360px] rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl">
                  <div className="w-16 h-1 mx-auto rounded-full bg-slate-700 mb-4" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-brand-accent" />
                      <div>
                        <p className="text-sm font-black text-white">Prefeitura de Exemplo</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Patrocinado • Agora</p>
                      </div>
                    </div>
                    <div className="aspect-[4/3] rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center mb-3 overflow-hidden">
                      {socialMediaFiles.length > 0 && socialMediaFiles[0].type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(socialMediaFiles[0])} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed line-clamp-5">{socialCaption}</p>
                  </div>
                </div>
              </div>

              {/* Timeline de workflow social */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">Workflow de Publicações</h3>
                    <p className="text-xs text-slate-400 mt-1">Rastro de rascunhos, agendamentos e posts enviados.</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {socialTimelineItems.length} itens
                  </span>
                </div>

                {isLoadingSocialTimeline ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando timeline...
                  </div>
                ) : socialTimelineItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
                    Nenhum item no workflow social. Salve um rascunho, agende ou publique para iniciar.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {socialTimelineItems.map((post) => (
                      <div key={post.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white line-clamp-1">{post.titulo}</p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Criado em {new Date(post.criadoEm).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <span className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
                            post.status === 'postado'
                              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                              : post.status === 'agendado'
                              ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                              : 'bg-slate-500/15 border-slate-400/30 text-slate-300'
                          )}>
                            {getTimelineStatusLabel(post.status)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {post.canais.map((channel) => (
                            <span key={`${post.id}-${channel}`} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                              {formatChannelLabel(channel)}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-wrap">{post.legenda}</p>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-8 h-8 rounded-lg border border-white/10 bg-slate-800 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            {post.arquivosMidia.length > 0 ? post.arquivosMidia[0] : 'Sem mídia anexada'}
                          </div>

                          {post.status === 'agendado' && isFutureSchedule(post.agendadoPara) && (
                            <button
                              type="button"
                              onClick={() => void handleCancelScheduledPost(post.id)}
                              disabled={isSavingSocialTimeline}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-black text-red-300 hover:bg-red-400/20 transition-colors disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancelar agendamento
                            </button>
                          )}
                        </div>

                        {post.status === 'agendado' && post.agendadoPara && (
                          <p className="text-[11px] text-amber-300 font-semibold">
                            Agendado para {new Date(post.agendadoPara).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">Histórico Operacional</h3>
                <p className="text-xs text-slate-400 mt-1">Clique em Editar para retomar qualquer conteúdo no editor.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedHistoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleBulkDeleteHistory()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-400/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Selecionados ({selectedHistoryIds.length})
                  </button>
                )}
                {([
                  { id: 'todos', label: 'Tudo' },
                  { id: 'release', label: 'Releases' },
                  { id: 'social', label: 'Social' },
                ] as const).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setHistoryFilter(filter.id)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-xs font-black transition-colors',
                      historyFilter === filter.id
                        ? 'bg-brand-accent/20 border-brand-accent/40 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela profissional */}
            {filteredHistoryItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                <Clock className="w-10 h-10" />
                <p className="text-sm font-black">Nenhum conteúdo salvo ainda.</p>
                <p className="text-xs">Salve um release ou post para ele aparecer aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="pl-3 pr-1 pb-1">
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-white/10 accent-brand-accent"
                          checked={selectedHistoryIds.length === filteredHistoryItems.length && filteredHistoryItems.length > 0}
                          onChange={(e) =>
                            setSelectedHistoryIds(e.target.checked ? filteredHistoryItems.map((i) => i.id) : [])
                          }
                          aria-label="Selecionar todos"
                        />
                      </th>
                      {['Status', 'Título', 'Tipo', 'Data', 'Ações'].map((h) => (
                        <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 pb-1">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryItems.map((item) => (
                      <tr
                        key={item.id}
                        className="group"
                      >
                        {/* Checkbox */}
                        <td className="pl-3 pr-1 py-3 rounded-l-xl bg-white/5 border-y border-l border-white/8 align-middle w-8">
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-white/10 accent-brand-accent"
                            checked={selectedHistoryIds.includes(item.id)}
                            onChange={() => toggleHistorySelection(item.id)}
                            aria-label={`Selecionar ${item.title}`}
                          />
                        </td>
                        {/* Status */}
                        <td className="px-3 py-3 bg-white/5 border-y border-white/8 align-middle w-32">
                          <span className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
                            item.status === 'Publicado'
                              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                              : item.status === 'Agendado'
                              ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                              : 'bg-slate-500/15 border-slate-400/30 text-slate-300'
                          )}>
                            {item.status === 'Publicado' ? '✓ ' : item.status === 'Agendado' ? '⏰ ' : '○ '}
                            {item.status}
                          </span>
                        </td>
                        {/* Título */}
                        <td className="px-3 py-3 bg-white/5 border-y border-white/8 align-middle max-w-xs">
                          <p className="font-black text-white truncate">{item.title || <span className="text-slate-500 font-normal italic">Sem título</span>}</p>
                          {item.content && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{item.content.slice(0, 80)}{item.content.length > 80 ? '…' : ''}</p>
                          )}
                        </td>
                        {/* Tipo */}
                        <td className="px-3 py-3 bg-white/5 border-y border-white/8 align-middle whitespace-nowrap">
                          <span className={cn(
                            'text-[10px] font-black uppercase tracking-widest',
                            isSocialContentType(item.type) ? 'text-cyan-300' : 'text-slate-400'
                          )}>
                            {isSocialContentType(item.type) ? '📱 ' : '📰 '}{item.type}
                          </span>
                        </td>
                        {/* Data */}
                        <td className="px-3 py-3 bg-white/5 border-y border-white/8 align-middle whitespace-nowrap text-xs text-slate-400 font-black">
                          {item.date}
                        </td>
                        {/* Ações */}
                        <td className="pl-2 pr-3 py-3 rounded-r-xl bg-white/5 border-y border-r border-white/8 align-middle">
                          <div className="flex items-center gap-2">
                            <button
                              title="Editar / Carregar no editor"
                              onClick={() => { handleEditHistoryItem(item); setActiveTab('editor'); }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-xs font-black text-white hover:bg-brand-accent/20 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              title="Excluir"
                              onClick={() => void handleDeleteHistoryItem(item.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-black text-red-300 hover:bg-red-400/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsPressModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Distribuição de release</p>
                  <h3 className="text-2xl font-black text-white mt-2">Selecionar contatos de imprensa</h3>
                  <p className="text-sm text-slate-400 mt-2">Busque no CRM, selecione contatos soltos ou lote visível e abra o envio por e-mail.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPressModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors"
                >
                  Fechar
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 mb-5">
                <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={pressSearch}
                    onChange={(event) => setPressSearch(event.target.value)}
                    placeholder="Buscar por nome, e-mail ou veículo..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleToggleVisibleRecipients}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors"
                >
                  {allVisibleSelected ? 'Limpar visíveis' : 'Selecionar visíveis'}
                </button>
              </div>

              {mailingGroups.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-3">Grupos de Mailing do CRM</p>
                  <div className="flex flex-wrap gap-2">
                    {mailingGroups.map((group) => {
                      const validIds = group.jornalistas_ids.filter((id) => pressContacts.some((contact) => contact.id === id));
                      const allSelected = validIds.length > 0 && validIds.every((id) => selectedRecipientIds.includes(id));

                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleToggleGroupRecipients(group)}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-xs font-black transition-colors',
                            allSelected
                              ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-100'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          )}
                        >
                          {group.nome} • {validIds.length}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 max-h-[420px] overflow-y-auto space-y-3">
                {filteredPressContacts.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-400">
                    Nenhum contato encontrado com esse filtro.
                  </div>
                ) : (
                  filteredPressContacts.map((contact) => (
                    <label key={contact.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRecipientIds.includes(contact.id)}
                        onChange={() => toggleRecipient(contact.id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-800 text-brand-accent focus:ring-brand-accent/40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-white truncate">{contact.nome}</p>
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100">
                            {contact.veiculo}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-300 truncate mt-2">{contact.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-white/10">
                <p className="text-sm text-slate-400">
                  {selectedRecipientIds.length} contato(s) selecionado(s)
                </p>

                <button
                  type="button"
                  onClick={handleSendReleaseToRecipients}
                  disabled={isSendingPress}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-950 px-5 py-3 text-sm font-black hover:brightness-105 transition-colors disabled:opacity-60"
                >
                  {isSendingPress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {isSendingPress ? 'Abrindo envio...' : 'Enviar Release para Selecionados'}
                </button>
              </div>
            </motion.div>
          </motion.div>
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

      {/* Link Modal */}
      <AnimatePresence>
        {isLinkModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsLinkModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-96 max-w-[90vw]"
            >
              <h3 className="text-white font-black text-lg mb-4">Inserir Link</h3>
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/40 mb-4"
                onKeyPress={e => e.key === 'Enter' && insertLinkConfirm()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors font-black"
                >
                  Cancelar
                </button>
                <button
                  onClick={insertLinkConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-accent text-white hover:bg-brand-accent/90 transition-colors font-black"
                >
                  Inserir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>

      {/* ── Modal: Agendar ───────────────────────────────────────── */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsScheduleModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent" />
                Agendar publicação
              </h2>

              {/* Data e hora */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Data</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">Hora</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              {/* Canais */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-slate-400">Redes sociais</p>
                <div className="flex flex-wrap gap-3">
                  {(['instagram', 'facebook', 'x', 'linkedin'] as const).map(ch => (
                    <label key={ch} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={!!scheduleChannels[ch]}
                        onChange={e => setScheduleChannels(prev => ({ ...prev, [ch]: e.target.checked }))}
                        className="rounded accent-brand-accent"
                      />
                      {ch === 'x' ? 'X/Twitter' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview legenda truncada */}
              {socialCaption.trim() && (
                <div className="mb-4 rounded-lg border border-white/10 bg-slate-800/60 p-3">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Prévia da legenda</p>
                  <p className="text-sm text-slate-300 line-clamp-3 whitespace-pre-wrap">{socialCaption}</p>
                </div>
              )}

              {/* Aviso */}
              <p className="mb-5 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-300">
                ⏰ O registro ficará salvo no Hub. A publicação automática nas plataformas exige integração com APIs externas (Meta, LinkedIn etc.).
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleScheduleConfirm}
                  disabled={isSaving || isSavingSocialTimeline}
                  className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors disabled:opacity-60"
                >
                  {isSaving || isSavingSocialTimeline ? 'Salvando...' : 'Confirmar agendamento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Postar Agora ──────────────────────────────────── */}
      <AnimatePresence>
        {isPostNowModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsPostNowModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-green-400" />
                Confirmar publicação
              </h2>

              {/* Plataformas seleccionadas */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-slate-400">Plataformas ativas</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(channels).filter(([, v]) => v).map(([ch]) => (
                    <span key={ch} className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-0.5 text-xs font-semibold text-green-300">
                      ✅ {ch === 'x' ? 'X/Twitter' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Aviso de limite de caracteres por plataforma */}
              {socialCaption.trim() && (() => {
                const len = socialCaption.length;
                const overLimits = [
                  { name: 'X/Twitter', limit: 280 },
                  { name: 'LinkedIn', limit: 3000 },
                  { name: 'Instagram', limit: 2200 },
                ].filter(p => len > p.limit);
                return overLimits.length > 0 ? (
                  <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3">
                    <p className="text-xs font-bold text-red-300 mb-1">⚠️ Legenda ultrapassa o limite em:</p>
                    {overLimits.map(p => (
                      <p key={p.name} className="text-xs text-red-200">• {p.name}: {len}/{p.limit} caracteres</p>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Preview legenda */}
              {socialCaption.trim() && (
                <div className="mb-4 rounded-lg border border-white/10 bg-slate-800/60 p-3">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Prévia</p>
                  <p className="text-sm text-slate-300 line-clamp-4 whitespace-pre-wrap">{socialCaption}</p>
                </div>
              )}

              <p className="mb-5 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-300">
                ⚡ O registro será salvo no Hub como "Publicado". A postagem efetiva nas redes exige API externa.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsPostNowModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePostNowConfirm}
                  disabled={isSaving || isSavingSocialTimeline}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-black text-white hover:bg-green-500 transition-colors disabled:opacity-60"
                >
                  {isSaving || isSavingSocialTimeline ? 'Registrando...' : 'Confirmar publicação'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Registrar no Workflow ─────────────────────────── */}
      <AnimatePresence>
        {isWorkflowModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsWorkflowModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-black text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-400" />
                Registrar no Planejamento / Workflow
              </h2>

              {/* Título */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Título da tarefa</label>
                <input
                  type="text"
                  value={wfTitle}
                  onChange={e => setWfTitle(e.target.value)}
                  placeholder="Ex: Post sobre evento X"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              {/* Coluna Kanban */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Coluna Kanban</label>
                <select
                  value={wfColumn}
                  onChange={e => setWfColumn(e.target.value as typeof wfColumn)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  <option value="backlog">Backlog</option>
                  <option value="producao">Em Produção</option>
                  <option value="revisao">Revisão</option>
                </select>
              </div>

              {/* Prioridade */}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold text-slate-400">Prioridade</p>
                <div className="flex gap-3">
                  {(['baixa', 'media', 'alta'] as const).map(p => (
                    <label key={p} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-300 capitalize">
                      <input
                        type="radio"
                        name="wf-priority"
                        value={p}
                        checked={wfPriority === p}
                        onChange={() => setWfPriority(p)}
                        className="accent-brand-accent"
                      />
                      {p === 'baixa' ? 'Baixa' : p === 'media' ? 'Média' : 'Alta'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Responsável */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Responsável</label>
                <input
                  type="text"
                  value={wfResponsavel}
                  onChange={e => setWfResponsavel(e.target.value)}
                  placeholder="Nome ou equipe"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              {/* Prazo (opcional) */}
              <div className="mb-5">
                <label className="mb-1 block text-xs font-semibold text-slate-400">Prazo (opcional)</label>
                <input
                  type="date"
                  value={wfDeadline}
                  onChange={e => setWfDeadline(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsWorkflowModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleWorkflowConfirm}
                  disabled={isRegisteringWorkflow}
                  className="rounded-lg border border-amber-400/20 bg-amber-400/20 px-4 py-2 text-sm font-black text-amber-100 hover:bg-amber-400/30 transition-colors disabled:opacity-60"
                >
                  {isRegisteringWorkflow ? 'Registrando...' : 'Registrar tarefa'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
