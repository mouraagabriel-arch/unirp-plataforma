import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Brain,
  Building2,
  Cake,
  Check,
  FileText,
  Flame,
  FolderPlus,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Users,
  UserRound,
  X,
  MessageCircle,
  Loader2,
  Calendar,
  History,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiWithRetry, cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import EmailIntegrationService, { type EmailPayload } from '../../lib/emailIntegrationService';
import { CRMInteractionHistory } from './CRMInteractionHistory';
import { useTerminologia } from '../../hooks/useTerminologia';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface Journalist {
  id: string;
  nome: string;
  veiculo: string;
  cargo: string;
  email: string;
  telefone: string;
  regiao: string;
  tags: string[];
  status: 'ativo' | 'inativo';
  data_nascimento?: string;
  categorias?: string[];
  categoria_matriz?: string;
  tags_dinamicas?: string[];
  grau_influencia?: 'Alto' | 'Médio' | 'Baixo';
  engajamento_calor?: 'Frio' | 'Morno' | 'Quente';
  interesses?: string[];
  status_jornada?: 'Lead' | 'Relacionamento Ativo' | 'Multiplicador';
}

interface JournalistForm {
  nome: string;
  veiculo: string;
  cargo: string;
  email: string;
  telefone: string;
  regiao: string;
  data_nascimento?: string;
  categorias?: string[];
  categoria_matriz?: string;
  tags_dinamicas?: string[];
  grau_influencia?: 'Alto' | 'Médio' | 'Baixo';
  engajamento_calor?: 'Frio' | 'Morno' | 'Quente';
  interesses?: string[];
  status_jornada?: 'Lead' | 'Relacionamento Ativo' | 'Multiplicador';
}

interface ProfileForm extends JournalistForm {
  tags: string[];
  status: 'ativo' | 'inativo';
}

interface MailingGroup {
  id: string;
  nome: string;
  ambiente: string;
  jornalistas_ids: string[];
}

interface HubRelease {
  id: string;
  title: string;
  content: string;
  date: string;
}

const INITIAL_JOURNALIST_FORM: JournalistForm = {
  nome: '',
  veiculo: '',
  cargo: '',
  email: '',
  telefone: '',
  regiao: '',
  data_nascimento: '',
  categorias: [],
  categoria_matriz: undefined,
  tags_dinamicas: [],
  grau_influencia: undefined,
  engajamento_calor: undefined,
  interesses: [],
  status_jornada: undefined,
};

const INITIAL_PROFILE_FORM: ProfileForm = {
  ...INITIAL_JOURNALIST_FORM,
  tags: [],
  status: 'ativo',
};

const TAG_STYLES = [
  'bg-cyan-400/15 text-cyan-200 border-cyan-300/30',
  'bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/30',
  'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
  'bg-amber-400/15 text-amber-200 border-amber-300/30',
];

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);
}

export function EnterpriseCRM({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const { termo } = useTerminologia();
  const navigate = useNavigate();
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [groups, setGroups] = useState<MailingGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('Todas as regiões');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [journalistForm, setJournalistForm] = useState<JournalistForm>(INITIAL_JOURNALIST_FORM);
  const [editingJournalistId, setEditingJournalistId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [selectedJournalist, setSelectedJournalist] = useState<Journalist | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(INITIAL_PROFILE_FORM);
  const [tagInput, setTagInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSelectedIds, setGroupSelectedIds] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [hubReleases, setHubReleases] = useState<HubRelease[]>([]);
  const [useHubRelease, setUseHubRelease] = useState(true);
  const [selectedReleaseId, setSelectedReleaseId] = useState('');
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [isGeneratingWhatsAppMessage, setIsGeneratingWhatsAppMessage] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'dados' | 'historico'>('dados');
  const [filterInfluencia, setFilterInfluencia] = useState<string>('todos');
  const [filterCalor, setFilterCalor] = useState<string>('todos');
  const [filterJornada, setFilterJornada] = useState<string>('todos');
  const [filterMatriz, setFilterMatriz] = useState<string>('todos');
  const [filterInteresses, setFilterInteresses] = useState<string[]>([]);
  const [isHygieneModalOpen, setIsHygieneModalOpen] = useState(false);
  const [hygieneResults, setHygieneResults] = useState<{ incomplete: Journalist[]; duplicates: Journalist[][] }>({ incomplete: [], duplicates: [] });
  const [interestInput, setInterestInput] = useState('');
  const [isAddToGroupBulkModalOpen, setIsAddToGroupBulkModalOpen] = useState(false);
  const [bulkTargetGroupId, setBulkTargetGroupId] = useState('');
  const [kpiPanel, setKpiPanel] = useState<null | 'aniversariantes' | 'estrategicos' | 'base'>(null);

  const mapRowToJournalist = (row: any): Journalist => ({
    id: row.id,
    nome: row.nome ?? 'Sem nome',
    veiculo: row.veiculo ?? '',
    cargo: row.cargo ?? '',
    email: row.email ?? '',
    telefone: row.telefone ?? '',
    regiao: row.regiao ?? '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status === 'inativo' ? 'inativo' : 'ativo',
    data_nascimento: row.data_nascimento ?? '',
    categorias: Array.isArray(row.categorias) ? row.categorias : [],
    categoria_matriz: row.categoria_matriz ?? undefined,
    tags_dinamicas: Array.isArray(row.tags_dinamicas) ? row.tags_dinamicas : [],
    grau_influencia: row.grau_influencia ?? undefined,
    engajamento_calor: row.engajamento_calor ?? undefined,
    interesses: Array.isArray(row.interesses) ? row.interesses : [],
    status_jornada: row.status_jornada ?? undefined,
  });

  const loadJournalists = async () => {
    const { data, error } = await tenantService.listEnterpriseJournalists();

    if (error) {
      alert(`Erro ao carregar jornalistas: ${error.message}`);
      return;
    }

    setJournalists((data ?? []).map(mapRowToJournalist));
  };

  const loadGroups = async () => {
    const { data, error } = await tenantService.listEnterpriseCRMGroups();

    if (error) {
      console.error('[CRM] Erro ao carregar grupos de mailing:', error);
      return;
    }

    setGroups((data ?? []).map((row) => ({
      id: row.id,
      nome: row.nome ?? 'Grupo sem nome',
      ambiente: row.ambiente ?? 'enterprise',
      jornalistas_ids: Array.isArray(row.jornalistas_ids) ? row.jornalistas_ids : [],
    })));
  };

  useEffect(() => {
    void loadJournalists();
    void loadGroups();
  }, []);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setJournalistForm(INITIAL_JOURNALIST_FORM);
      setEditingJournalistId(null);
      setIsCreateModalOpen(true);
    }
  }, [location.search]);

  const handleAddJournalist = () => {
    setJournalistForm(INITIAL_JOURNALIST_FORM);
    setEditingJournalistId(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateJournalist = async () => {
    if (!journalistForm.nome.trim()) {
      alert('Informe o nome do jornalista.');
      return;
    }

    const payload = {
      nome: journalistForm.nome,
      veiculo: journalistForm.veiculo,
      cargo: journalistForm.cargo,
      email: journalistForm.email,
      telefone: journalistForm.telefone,
      regiao: journalistForm.regiao,
      data_nascimento: journalistForm.data_nascimento || null,
      categoria_matriz: journalistForm.categoria_matriz || null,
      tags_dinamicas: journalistForm.tags_dinamicas ?? [],
      grau_influencia: journalistForm.grau_influencia || null,
      engajamento_calor: journalistForm.engajamento_calor || null,
      status_jornada: journalistForm.status_jornada || null,
    };

    if (editingJournalistId) {
      const { data, error } = await tenantService.updateEnterpriseJournalist(editingJournalistId, payload);

      if (error) {
        alert(`Erro ao atualizar: ${error.message}`);
        console.error('[CRM] Erro ao atualizar jornalista:', error);
        return;
      }

      if (data) {
        const updated = mapRowToJournalist(data);
        setJournalists((prev) => prev.map((item) => (item.id === editingJournalistId ? updated : item)));
      }
    } else {
      const { data, error } = await tenantService.createEnterpriseJournalist({ ...payload, tags: [], status: 'ativo' });

      if (error) {
        alert(`Erro ao salvar: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        setJournalists((prev) => [...prev, mapRowToJournalist(data[0])]);
      }
    }

    setIsCreateModalOpen(false);
    setEditingJournalistId(null);
    setJournalistForm(INITIAL_JOURNALIST_FORM);
    void loadGroups();
  };

  const handleEditJournalist = (journalist: Journalist) => {
    setJournalistForm({
      nome: journalist.nome,
      veiculo: journalist.veiculo,
      cargo: journalist.cargo,
      email: journalist.email,
      telefone: journalist.telefone,
      regiao: journalist.regiao,
      data_nascimento: journalist.data_nascimento ?? '',
      categorias: journalist.categorias ?? [],
      categoria_matriz: journalist.categoria_matriz,
      tags_dinamicas: journalist.tags_dinamicas ?? [],
      grau_influencia: journalist.grau_influencia,
      engajamento_calor: journalist.engajamento_calor,
      interesses: journalist.interesses ?? [],
      status_jornada: journalist.status_jornada,
    });
    setEditingJournalistId(journalist.id);
    setIsCreateModalOpen(true);
  };

  const handleDeleteJournalist = async (id: string) => {
    const { error } = await tenantService.deleteEnterpriseJournalist(id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    setJournalists((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setGroupSelectedIds((prev) => prev.filter((item) => item !== id));
    void loadGroups();
  };

  const filteredJournalists = useMemo(() => {
    const term = search.toLowerCase().trim();
    const activeGroup = groups.find((group) => group.id === activeGroupId);

    return journalists.filter((item) => {
      const matchesSearch =
        !term ||
        item.nome.toLowerCase().includes(term) ||
        item.veiculo.toLowerCase().includes(term) ||
        item.cargo.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesRegion = region === 'Todas as regiões' || item.regiao.includes(region);
      const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;
      const matchesGroup = !activeGroup || activeGroup.jornalistas_ids.includes(item.id);
      const matchesInfluencia = filterInfluencia === 'todos' || item.grau_influencia === filterInfluencia;
      const matchesCalor = filterCalor === 'todos' || item.engajamento_calor === filterCalor;
      const matchesJornada = filterJornada === 'todos' || item.status_jornada === filterJornada;
      const matchesMatriz = filterMatriz === 'todos' || item.categoria_matriz === filterMatriz;
      const matchesInteresses = filterInteresses.length === 0 || filterInteresses.some((i) => item.interesses?.includes(i));

      return matchesSearch && matchesRegion && matchesStatus && matchesGroup && matchesInfluencia && matchesCalor && matchesJornada && matchesMatriz && matchesInteresses;
    });
  }, [journalists, search, region, filterStatus, activeGroupId, groups, filterInfluencia, filterCalor, filterJornada, filterMatriz, filterInteresses]);

  const allInteresses = useMemo(() => {
    const set = new Set<string>();
    journalists.forEach((j) => j.interesses?.forEach((i) => set.add(i)));
    return Array.from(set).sort();
  }, [journalists]);

  const activeFilterCount = [
    filterStatus !== 'todos',
    filterInfluencia !== 'todos',
    filterCalor !== 'todos',
    filterJornada !== 'todos',
    filterMatriz !== 'todos',
    filterInteresses.length > 0,
  ].filter(Boolean).length;

  const kpiAniversariantes = useMemo(() => {
    const mesAtual = new Date().getMonth();
    return journalists.filter((j) => {
      if (!j.data_nascimento) return false;
      const d = new Date(j.data_nascimento);
      return !isNaN(d.getTime()) && d.getMonth() === mesAtual;
    }).length;
  }, [journalists]);

  const kpiEstrategicos = useMemo(() => {
    return journalists.filter((j) => j.grau_influencia === 'Alto').length;
  }, [journalists]);

  const kpiListAniversariantes = useMemo(() => {
    const mesAtual = new Date().getMonth();
    return journalists.filter((j) => {
      if (!j.data_nascimento) return false;
      const d = new Date(j.data_nascimento);
      return !isNaN(d.getTime()) && d.getMonth() === mesAtual;
    });
  }, [journalists]);

  const kpiListEstrategicos = useMemo(() => {
    return journalists.filter((j) => j.grau_influencia === 'Alto');
  }, [journalists]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  };

  const selectedCount = selectedIds.length;

  const handleOpenFilters = () => {
    setIsFiltersOpen(true);
  };

  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
  };

  const openProfile = (journalist: Journalist) => {
    setSelectedJournalist(journalist);
    setProfileForm({
      nome: journalist.nome,
      veiculo: journalist.veiculo,
      cargo: journalist.cargo,
      email: journalist.email,
      telefone: journalist.telefone,
      regiao: journalist.regiao,
      tags: journalist.tags,
      status: journalist.status,
      data_nascimento: journalist.data_nascimento ?? '',
      status_financeiro: journalist.status_financeiro ?? 'Em dia',
      categorias: journalist.categorias ?? [],
      grau_influencia: journalist.grau_influencia,
      engajamento_calor: journalist.engajamento_calor,
      interesses: journalist.interesses ?? [],
      status_jornada: journalist.status_jornada,
    });
    setTagInput('');
    setInterestInput('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!selectedJournalist) return;

    setIsSavingProfile(true);
    const payload = {
      nome: profileForm.nome,
      veiculo: profileForm.veiculo,
      cargo: profileForm.cargo,
      email: profileForm.email,
      telefone: profileForm.telefone,
      regiao: profileForm.regiao,
      tags: normalizeTags(profileForm.tags),
      status: profileForm.status,
      data_nascimento: profileForm.data_nascimento || null,
      status_financeiro: profileForm.status_financeiro,
      categorias: profileForm.categorias || [],
      grau_influencia: profileForm.grau_influencia ?? null,
      engajamento_calor: profileForm.engajamento_calor ?? null,
      interesses: profileForm.interesses ?? [],
      status_jornada: profileForm.status_jornada ?? null,
    };

    const { data, error } = await tenantService.updateEnterpriseJournalist(selectedJournalist.id, payload);

    if (error) {
      alert(`Erro ao salvar perfil: ${error.message}`);
      console.error('[CRM] Erro ao salvar perfil:', error);
      setIsSavingProfile(false);
      return;
    }

    if (data) {
      const updated = mapRowToJournalist(data);
      setJournalists((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedJournalist(updated);
      setProfileForm({
        nome: updated.nome,
        veiculo: updated.veiculo,
        cargo: updated.cargo,
        email: updated.email,
        telefone: updated.telefone,
        regiao: updated.regiao,
        tags: updated.tags,
        status: updated.status,
        data_nascimento: updated.data_nascimento ?? '',
        status_financeiro: (updated as any).status_financeiro ?? 'Em dia',
        categorias: updated.categorias ?? [],
        grau_influencia: updated.grau_influencia,
        engajamento_calor: updated.engajamento_calor,
        interesses: updated.interesses ?? [],
        status_jornada: updated.status_jornada,
      });

      // Registrar interação no histórico
      void tenantService.createCRMInteraction({
        contato_id: updated.id,
        tipo_interacao: 'edicao_perfil',
        resumo_mensagem: `Perfil atualizado — ${updated.nome}`,
        dados_estruturados: {
          grau_influencia: updated.grau_influencia ?? null,
          engajamento_calor: updated.engajamento_calor ?? null,
          status_jornada: updated.status_jornada ?? null,
        },
      });
    }

    setIsSavingProfile(false);
  };

  const handleSuggestTags = async () => {
    const veiculo = profileForm.veiculo.trim();
    const cargo = profileForm.cargo.trim();

    if (!veiculo && !cargo) {
      alert('Preencha pelo menos veículo ou cargo antes de sugerir tags.');
      return;
    }

    setIsSuggestingTags(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.buildInstitutionalPrompt(`Você é um estrategista de CRM de imprensa.

Analise os dados abaixo e sugira exatamente 3 tags estratégicas curtas, úteis para segmentação de mailing.

Regras:
- Responda apenas com JSON no formato {"tags":["tag1","tag2","tag3"]}
- Tags curtas, sem frases longas
- Use somente inferências plausíveis a partir de veículo e cargo

Veículo: ${veiculo || 'não informado'}
Cargo: ${cargo || 'não informado'}`);
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: institutionalPrompt,
        }),
      );

      const text = response.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('A IA não retornou JSON válido para as tags.');
      }

      const parsed = JSON.parse(match[0]);
      const nextTags = normalizeTags(Array.isArray(parsed.tags) ? parsed.tags : []);

      if (nextTags.length === 0) {
        throw new Error('Nenhuma tag útil foi sugerida pela IA.');
      }

      setProfileForm((prev) => ({ ...prev, tags: normalizeTags([...prev.tags, ...nextTags]) }));
    } catch (error) {
      console.error('[CRM] Erro ao sugerir tags via IA:', error);
      alert('Erro ao sugerir tags via IA. Tente novamente em alguns instantes.');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleDispatchReleaseMass = async () => {
    if (selectedIds.length === 0) {
      alert('Selecione ao menos um jornalista para disparar release');
      return;
    }

    const selectedJournalists = journalists.filter((j) => selectedIds.includes(j.id));
    const recipients = selectedJournalists.map((j) => j.email).filter(Boolean).join('; ');
    const mailtoLink = `mailto:${recipients}?subject=Release%20de%20Imprensa&body=${encodeURIComponent('Prezados(as) colegas,\n\nSegue o release de imprensa.\n\nAtenciosamente,\nAssessoria de Comunicação')}`;
    window.location.href = mailtoLink;
    setSelectedIds([]);
  };

  const openCreateGroupModal = () => {
    setGroupName('');
    setGroupSearch('');
    setGroupSelectedIds(selectedIds);
    setIsCreateGroupModalOpen(true);
  };

  const filteredGroupCandidates = useMemo(() => {
    const term = groupSearch.trim().toLowerCase();
    if (!term) return journalists;
    return journalists.filter((item) => (
      item.nome.toLowerCase().includes(term)
      || item.email.toLowerCase().includes(term)
      || item.veiculo.toLowerCase().includes(term)
    ));
  }, [groupSearch, journalists]);

  const toggleGroupJournalist = (id: string) => {
    setGroupSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      alert('Informe o nome do grupo de mailing.');
      return;
    }

    setIsSavingGroup(true);
    const { error } = await tenantService.createEnterpriseCRMGroup({
      nome: groupName.trim(),
      jornalistas_ids: groupSelectedIds,
    });

    if (error) {
      alert(`Erro ao salvar grupo: ${error.message}`);
      console.error('[CRM] Erro ao salvar grupo:', error);
      setIsSavingGroup(false);
      return;
    }

    setIsSavingGroup(false);
    setIsCreateGroupModalOpen(false);
    setActiveGroupId('todos');
    void loadGroups();
  };

  const loadHubReleases = async () => {
    const { data, error } = await tenantService.listHubReleaseDemandas();

    if (error) {
      console.error('[CRM] Erro ao carregar releases do Hub:', error);
      return;
    }

    const releases = (data ?? []).map((row) => ({
      id: row.id,
      title: row.titulo ?? 'Release sem título',
      content: row.briefing ?? '',
      date: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : 'Sem data',
    }));

    setHubReleases(releases);
    if (releases[0]) {
      setSelectedReleaseId(releases[0].id);
    }
  };

  const openEmailModal = async () => {
    if (!selectedJournalist) return;
    setUseHubRelease(true);
    setCustomEmailMessage('');
    await loadHubReleases();
    setIsEmailModalOpen(true);
  };


  const handleSendEmailFromModal = () => {
    if (!selectedJournalist) return;

    const selectedRelease = hubReleases.find((item) => item.id === selectedReleaseId);
    const body = useHubRelease
      ? `${selectedRelease?.title ?? 'Release'}\n\n${selectedRelease?.content ?? ''}`.trim()
      : customEmailMessage.trim();

    if (!body) {
      alert('Selecione um release do Hub ou escreva uma mensagem.');
      return;
    }

    const subject = selectedRelease?.title || 'Proposta de Pauta';
    
    // Usar novo serviço de email
    const emailService = new EmailIntegrationService('mock');
    const institutionalName = 'Instituição Pública'; // Vai vir do Cérebro
    
    const emailPayload: EmailPayload = {
      to: selectedJournalist.email,
      from: 'assessoria@instituicao.gov.br',
      subject: subject,
      html: EmailIntegrationService.buildHtmlTemplate({
        titulo: subject,
        corpo: body.replace(/\n/g, '<br>'),
        rodape: `${institutionalName} - Assessoria de Imprensa`
      }),
      text: body,
    };

    void emailService.sendEmail(emailPayload);

    // Registrar interação no CRM
    void tenantService.createCRMInteraction({
      contato_id: selectedJournalist.id,
      tipo_interacao: useHubRelease ? 'hub_release' : 'email',
      resumo_mensagem: `${subject}: ${body.substring(0, 150)}...`,
    });
    
    alert('Email processado com sucesso! Verifique o console para detalhes de envio.');
    setIsEmailModalOpen(false);
  };

  const handleGenerateWhatsAppMessage = async () => {
    if (!selectedJournalist) return;

    setIsGeneratingWhatsAppMessage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${institutionalPrompt}\n\nVocê é um assessor de comunicação. Generate uma mensagem de WhatsApp profissional, cordial e concisa para o jornalista/influenciador abaixo.\n\nRegras:\n- Máximo 400 caracteres\n- Cumprimento personalizado com o nome\n- Mention sua instituição\n- Proposta clara de assunto/pauta\n- Tom conversacional mas profissional\n- Use emojis com moderação (máximo 2)\n\nJornalista: ${selectedJournalist.nome}\nCargo: ${selectedJournalist.cargo}\nVeículo: ${selectedJournalist.veiculo}\n\nResponda somente com a mensagem de WhatsApp pronta para enviar.`,
        }),
      );

      const texto = (response.text ?? '').trim();
      if (!texto) throw new Error('Resposta vazia da IA ao gerar mensagem WhatsApp');

      setWhatsAppMessage(texto);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[EnterpriseCRM] Erro ao gerar mensagem WhatsApp:', error);
      alert(`Erro ao gerar mensagem WhatsApp:\n${msg}`);
    } finally {
      setIsGeneratingWhatsAppMessage(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedJournalist || !selectedJournalist.telefone) {
      alert('Número de telefone não cadastrado para este contato.');
      return;
    }

    if (!whatsAppMessage) {
      alert('Gere uma mensagem antes de enviar.');
      return;
    }

    // Formata o número para o padrão WhatsApp (remove caracteres especiais, adiciona código país)
    let numero = selectedJournalist.telefone.replace(/\D/g, '');
    if (!numero.startsWith('55')) {
      numero = '55' + numero;
    }

    const mensagem = encodeURIComponent(whatsAppMessage);
    const whatsappLink = `https://wa.me/${numero}?text=${mensagem}`;

    // Registrar interação no CRM
    void tenantService.createCRMInteraction({
      contato_id: selectedJournalist.id,
      tipo_interacao: 'whatsapp',
      resumo_mensagem: whatsAppMessage.substring(0, 150),
    });

    // Abre WhatsApp Web/App
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    
    setWhatsAppMessage('');
    setIsProfileModalOpen(false);
  };


  const handleAddTagFromInput = () => {
    if (!tagInput.trim()) return;
    setProfileForm((prev) => ({ ...prev, tags: normalizeTags([...prev.tags, tagInput]) }));
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setProfileForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedIds.length} contato(s) permanentemente? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    const errors: string[] = [];
    for (const id of selectedIds) {
      const { error } = await tenantService.deleteEnterpriseJournalist(id);
      if (error) errors.push(id);
    }

    const removedIds = errors.length > 0
      ? selectedIds.filter((id) => !errors.includes(id))
      : selectedIds;

    setJournalists((prev) => prev.filter((j) => !removedIds.includes(j.id)));
    setSelectedIds([]);
    if (errors.length > 0) {
      alert(`${removedIds.length} contato(s) excluído(s). ${errors.length} falha(s) ao excluir.`);
    }
    void loadGroups();
  };

  const handleBulkAddToGroup = async () => {
    if (!bulkTargetGroupId) {
      alert('Selecione um grupo.');
      return;
    }
    const { error } = await tenantService.bulkAddContactsToGroup(bulkTargetGroupId, selectedIds);
    if (error) {
      alert(`Erro ao adicionar ao grupo: ${error.message}`);
      return;
    }
    setIsAddToGroupBulkModalOpen(false);
    setBulkTargetGroupId('');
    void loadGroups();
    alert(`${selectedIds.length} contato(s) adicionado(s) ao grupo com sucesso!`);
  };

  const handleCreateContentForSelected = () => {
    if (selectedIds.length === 0) return;
    const params = selectedIds.join(',');
    navigate(`/enterprise/hub?contacts=${params}`);
  };

  const handleHygienizeBase = () => {
    const incomplete = journalists.filter((j) => !j.email.trim() || !j.telefone.trim());
    const nameGroups: Record<string, Journalist[]> = {};
    journalists.forEach((j) => {
      const key = j.nome.toLowerCase().trim();
      if (!nameGroups[key]) nameGroups[key] = [];
      nameGroups[key].push(j);
    });
    const duplicates = Object.values(nameGroups).filter((group) => group.length > 1);
    setHygieneResults({ incomplete, duplicates });
    setIsHygieneModalOpen(true);
  };

  const handleAddInterestToProfile = () => {
    if (!interestInput.trim()) return;
    const interest = interestInput.trim();
    setProfileForm((prev) => ({
      ...prev,
      interesses: Array.from(new Set([...(prev.interesses ?? []), interest])),
    }));
    setInterestInput('');
  };

  const handleRemoveInterest = (interest: string) => {
    setProfileForm((prev) => ({
      ...prev,
      interesses: (prev.interesses ?? []).filter((i) => i !== interest),
    }));
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            CRM de <span className="text-brand-accent">Imprensa e {termo('cidadaos')}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mailing definitivo da assessoria para relacionamento com jornalistas e {termo('cidadaos').toLowerCase()}, grupos de disparo e conexão direta com o Hub.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleHygienizeBase} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-amber-400/20 bg-amber-400/10 text-amber-100 font-black text-sm hover:bg-amber-400/15 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Higienizar Base
          </button>
          <button onClick={openCreateGroupModal} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 font-black text-sm hover:bg-cyan-400/15 transition-colors">
            <FolderPlus className="w-4 h-4" />
            + Criar Novo Grupo
          </button>
          <button onClick={() => void handleAddJournalist()} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-brand-accent text-white font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-brand-accent/90 transition-colors">
            <Plus className="w-4 h-4" />
            + Adicionar Jornalista
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setKpiPanel('aniversariantes')}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 flex items-center gap-4 text-left hover:border-rose-400/40 hover:bg-rose-500/5 transition-all cursor-pointer"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
            <Cake className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpiAniversariantes}</p>
            <p className="text-xs text-slate-400 mt-0.5">Aniversariantes do Mês</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setKpiPanel('estrategicos')}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 flex items-center gap-4 text-left hover:border-amber-400/40 hover:bg-amber-500/5 transition-all cursor-pointer"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{kpiEstrategicos}</p>
            <p className="text-xs text-slate-400 mt-0.5">Contatos Estratégicos</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setKpiPanel('base')}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 flex items-center gap-4 text-left hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all cursor-pointer"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{journalists.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Base Ativa · {groups.length} grupos</p>
          </div>
        </button>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, veículo ou editoria..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
            />
          </div>

          <button onClick={() => handleOpenFilters()} className={cn('rounded-xl border px-4 py-3 inline-flex items-center justify-center gap-2 text-sm font-black transition-colors', activeFilterCount > 0 ? 'border-brand-accent/40 bg-brand-accent/15 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}>
            <SlidersHorizontal className="w-4 h-4" />
            Segmentar
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-[10px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 outline-none"
          >
            <option className="bg-slate-900">Todas as regiões</option>
            <option className="bg-slate-900">São Paulo</option>
            <option className="bg-slate-900">Rio de Janeiro</option>
            <option className="bg-slate-900">Brasília</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveGroupId('todos')}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs font-black transition-colors',
              activeGroupId === 'todos' ? 'bg-brand-accent/20 border-brand-accent/40 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            )}
          >
            Todos os contatos
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={cn(
                'rounded-xl border px-3 py-2 text-xs font-black transition-colors',
                activeGroupId === group.id ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              )}
            >
              {group.nome} • {group.jornalistas_ids.length}
            </button>
          ))}
        </div>

          <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-accent text-white text-xs font-black">
                  {selectedCount}
                </div>
                <p className="text-sm font-black text-slate-100">
                  {selectedCount} contato{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
                >
                  Limpar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setBulkTargetGroupId(groups[0]?.id ?? '');
                    setIsAddToGroupBulkModalOpen(true);
                  }}
                  disabled={groups.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-400/15 transition-colors disabled:opacity-50"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Adicionar a Grupo
                </button>

                <button
                  onClick={() => void handleBulkDelete()}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-400/15 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Excluir Selecionados
                </button>

                <button
                  onClick={handleCreateContentForSelected}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-brand-accent to-fuchsia-500 text-white text-xs font-black shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] transition-transform"
                >
                  <FileText className="w-3.5 h-3.5" />
                  🚀 Criar Conteúdo no Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJournalists.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4 relative"
          >
            <div className="absolute top-4 right-4">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="h-4 w-4 rounded border-white/20 bg-slate-800 text-brand-accent focus:ring-brand-accent/40"
                aria-label={`Selecionar ${item.nome}`}
              />
            </div>

            <div className="flex items-start gap-3 pr-7">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white font-black text-base shrink-0">
                {item.nome
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-white leading-tight">{item.nome}</p>
                <p className="text-sm text-slate-400">{item.cargo}</p>
                <span className="inline-flex items-center mt-2 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                  {item.veiculo}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{item.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{item.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{item.regiao}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest',
                      TAG_STYLES[index % TAG_STYLES.length]
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {(item.grau_influencia || item.engajamento_calor || item.status_jornada) && (
                <div className="flex flex-wrap gap-1.5">
                  {item.grau_influencia && (
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black',
                      item.grau_influencia === 'Alto'  ? 'bg-amber-400/15 border-amber-400/30 text-amber-200' :
                      item.grau_influencia === 'Médio' ? 'bg-slate-400/15 border-slate-400/30 text-slate-300' :
                                                         'bg-slate-700/30 border-slate-700/40 text-slate-500')}>
                      <Star className="w-2.5 h-2.5" />{item.grau_influencia}
                    </span>
                  )}
                  {item.engajamento_calor && (
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black',
                      item.engajamento_calor === 'Quente' ? 'bg-red-400/15 border-red-400/30 text-red-300' :
                      item.engajamento_calor === 'Morno'  ? 'bg-orange-400/15 border-orange-400/30 text-orange-300' :
                                                          'bg-sky-400/15 border-sky-400/30 text-sky-300')}>
                      <Flame className="w-2.5 h-2.5" />{item.engajamento_calor}
                    </span>
                  )}
                  {item.status_jornada && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-black text-emerald-200">
                      <TrendingUp className="w-2.5 h-2.5" />{item.status_jornada}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleEditJournalist(item)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-slate-100 hover:bg-white/10 transition-colors">
                  Editar
                </button>
                <button onClick={() => openProfile(item)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-slate-100 hover:bg-white/10 transition-colors">
                  Ver Perfil
                </button>
                <button onClick={() => void handleDeleteJournalist(item.id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-slate-100 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5">
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">{editingJournalistId ? 'Editar Jornalista' : 'Adicionar Jornalista'}</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={journalistForm.nome} onChange={(event) => setJournalistForm((prev) => ({ ...prev, nome: event.target.value }))} placeholder="Nome" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={journalistForm.veiculo} onChange={(event) => setJournalistForm((prev) => ({ ...prev, veiculo: event.target.value }))} placeholder="Veículo" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={journalistForm.cargo} onChange={(event) => setJournalistForm((prev) => ({ ...prev, cargo: event.target.value }))} placeholder="Cargo" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={journalistForm.email} onChange={(event) => setJournalistForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="E-mail" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={journalistForm.telefone} onChange={(event) => setJournalistForm((prev) => ({ ...prev, telefone: event.target.value }))} placeholder="Telefone" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={journalistForm.regiao} onChange={(event) => setJournalistForm((prev) => ({ ...prev, regiao: event.target.value }))} placeholder="Região" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Data de Nascimento</label>
                  <input
                    type="date"
                    value={journalistForm.data_nascimento ?? ''}
                    onChange={(event) => setJournalistForm((prev) => ({ ...prev, data_nascimento: event.target.value }))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Categoria (Matriz)</label>
                  <select
                    value={journalistForm.categoria_matriz ?? ''}
                    onChange={(event) => setJournalistForm((prev) => ({ ...prev, categoria_matriz: event.target.value || undefined }))}
                    className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="">Selecionar...</option>
                    <option>Jornalista</option>
                    <option>Político</option>
                    <option>Influenciador</option>
                    <option>Cidadão</option>
                    <option>Associado</option>
                    <option>Parceiro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Grau de Influência</label>
                  <select
                    value={journalistForm.grau_influencia ?? ''}
                    onChange={(event) => setJournalistForm((prev) => ({ ...prev, grau_influencia: (event.target.value || undefined) as JournalistForm['grau_influencia'] }))}
                    className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="">Selecionar...</option>
                    <option>Alto</option>
                    <option>Médio</option>
                    <option>Baixo</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Calor de Engajamento</label>
                  <select
                    value={journalistForm.engajamento_calor ?? ''}
                    onChange={(event) => setJournalistForm((prev) => ({ ...prev, engajamento_calor: (event.target.value || undefined) as JournalistForm['engajamento_calor'] }))}
                    className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="">Selecionar...</option>
                    <option>Quente</option>
                    <option>Morno</option>
                    <option>Frio</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Tags Dinâmicas (separadas por vírgula)</label>
                <input
                  value={journalistForm.tags_dinamicas?.join(', ') ?? ''}
                  onChange={(event) =>
                    setJournalistForm((prev) => ({
                      ...prev,
                      tags_dinamicas: event.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="Ex: VIP, Saúde, Regional, Podcast"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => void handleCreateJournalist()} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors">
                  {editingJournalistId ? 'Atualizar' : 'Salvar'}
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateGroupModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreateGroupModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Novo Grupo de Mailing</h3>
                  <p className="text-sm text-slate-400 mt-1">Monte listas persistidas para disparos rápidos no Hub e no CRM.</p>
                </div>
                <button onClick={() => setIsCreateGroupModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Nome do grupo (Ex: Imprensa Arsae)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={groupSearch}
                  onChange={(event) => setGroupSearch(event.target.value)}
                  placeholder="Buscar jornalista para incluir no grupo"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>

              <div className="max-h-[360px] overflow-y-auto space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                {filteredGroupCandidates.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={groupSelectedIds.includes(item.id)}
                      onChange={() => toggleGroupJournalist(item.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-800 text-brand-accent focus:ring-brand-accent/40"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white">{item.nome}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.veiculo} • {item.email || 'Sem e-mail'}</p>
                    </div>
                    {groupSelectedIds.includes(item.id) && <Check className="w-4 h-4 text-emerald-300 mt-1" />}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400">{groupSelectedIds.length} contato(s) no grupo</p>
                <button onClick={() => void handleSaveGroup()} disabled={isSavingGroup} className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors disabled:opacity-60">
                  {isSavingGroup ? 'Salvando grupo...' : 'Salvar Grupo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'} — CRM MarTech Enterprise</span>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFiltersOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Painel de Segmentação</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Combine filtros para criar audiências estratégicas</p>
                </div>
                <button onClick={() => setIsFiltersOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <Users className="w-3.5 h-3.5" /> Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'ativo', 'inativo'].map((s) => (
                      <button key={s} type="button" onClick={() => setFilterStatus(s as any)}
                        className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors', filterStatus === s ? 'bg-brand-accent/20 border-brand-accent/40 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                        {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Inativos'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grau de Influência */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Grau de Influência
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'Alto', 'Médio', 'Baixo'].map((v) => (
                      <button key={v} type="button" onClick={() => setFilterInfluencia(v)}
                        className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors',
                          filterInfluencia === v ? 'bg-amber-400/20 border-amber-400/40 text-amber-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                        {v === 'todos' ? 'Todos' : v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engajamento / Calor */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Engajamento
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'Quente', 'Morno', 'Frio'].map((v) => {
                      const colors: Record<string, string> = {
                        Quente: 'bg-red-400/20 border-red-400/40 text-red-200',
                        Morno:  'bg-orange-400/20 border-orange-400/40 text-orange-200',
                        Frio:   'bg-sky-400/20 border-sky-400/40 text-sky-200',
                        todos:  'bg-brand-accent/20 border-brand-accent/40 text-white',
                      };
                      return (
                        <button key={v} type="button" onClick={() => setFilterCalor(v)}
                          className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors',
                            filterCalor === v ? colors[v] : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                          {v === 'todos' ? 'Todos' : v}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categoria da Matriz */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'Jornalista', 'Político', 'Influenciador', 'Cidadão', 'Associado', 'Parceiro'].map((v) => (
                      <button key={v} type="button" onClick={() => setFilterMatriz(v)}
                        className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors',
                          filterMatriz === v ? 'bg-cyan-400/20 border-cyan-400/40 text-cyan-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                        {v === 'todos' ? 'Todas' : v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jornada */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Jornada do Contato
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'Lead', 'Relacionamento Ativo', 'Multiplicador'].map((v) => (
                      <button key={v} type="button" onClick={() => setFilterJornada(v)}
                        className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors',
                          filterJornada === v ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                        {v === 'todos' ? 'Todos' : v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interesses */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-fuchsia-400" /> Interesses
                  </label>
                  {allInteresses.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhum interesse cadastrado ainda. Adicione na ficha de cada contato.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allInteresses.map((interesse) => (
                        <button key={interesse} type="button"
                          onClick={() => setFilterInteresses((prev) => prev.includes(interesse) ? prev.filter((i) => i !== interesse) : [...prev, interesse])}
                          className={cn('rounded-xl border px-3 py-1.5 text-xs font-black transition-colors',
                            filterInteresses.includes(interesse) ? 'bg-fuchsia-400/20 border-fuchsia-400/40 text-fuchsia-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                          {interesse}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setFilterStatus('todos');
                    setFilterInfluencia('todos');
                    setFilterCalor('todos');
                    setFilterJornada('todos');
                    setFilterMatriz('todos');
                    setFilterInteresses([]);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button onClick={() => handleApplyFilters()} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors">
                  Aplicar Segmentação
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProfileModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Perfil do Jornalista</h3>
                  <p className="text-sm text-slate-400 mt-1">Edite os dados, refine a segmentação e dispare conteúdo com apoio do Hub.</p>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setActiveProfileTab('dados')}
                  className={cn(
                    'pb-3 px-2 text-sm font-black transition-colors',
                    activeProfileTab === 'dados'
                      ? 'text-brand-accent border-b-2 border-brand-accent'
                      : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  Dados & Segmentação
                </button>
                <button
                  onClick={() => setActiveProfileTab('historico')}
                  className={cn(
                    'pb-3 px-2 text-sm font-black transition-colors flex items-center gap-1',
                    activeProfileTab === 'historico'
                      ? 'text-brand-accent border-b-2 border-brand-accent'
                      : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  Histórico de Interações
                </button>
              </div>

              {activeProfileTab === 'dados' && (
                <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={profileForm.nome} onChange={(event) => setProfileForm((prev) => ({ ...prev, nome: event.target.value }))} placeholder="Nome" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={profileForm.veiculo} onChange={(event) => setProfileForm((prev) => ({ ...prev, veiculo: event.target.value }))} placeholder="Veículo" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={profileForm.cargo} onChange={(event) => setProfileForm((prev) => ({ ...prev, cargo: event.target.value }))} placeholder="Cargo" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="E-mail" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={profileForm.telefone} onChange={(event) => setProfileForm((prev) => ({ ...prev, telefone: event.target.value }))} placeholder="Telefone" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input value={profileForm.regiao} onChange={(event) => setProfileForm((prev) => ({ ...prev, regiao: event.target.value }))} placeholder="Região" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <input type="date" value={profileForm.data_nascimento || ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, data_nascimento: event.target.value }))} placeholder="Data de Nascimento" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" />
                <select value={profileForm.status_financeiro || 'Em dia'} onChange={(event) => setProfileForm((prev) => ({ ...prev, status_financeiro: event.target.value as any }))} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none">
                  <option value="Em dia" className="bg-slate-900">Status Financeiro: Em dia</option>
                  <option value="Inadimplente" className="bg-slate-900">Status Financeiro: Inadimplente</option>
                  <option value="Pendência Cadastral" className="bg-slate-900">Status Financeiro: Pendência Cadastral</option>
                </select>
                </div>

              {/* ── Seção MarTech ── */}
              <div className="rounded-2xl border border-fuchsia-400/15 bg-fuchsia-400/5 p-4 space-y-4">
                <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-fuchsia-300">
                  <TrendingUp className="w-3.5 h-3.5" /> Perfil MarTech — Segmentação Estratégica
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="space-y-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400"><Star className="w-3 h-3 text-amber-400" /> Grau de Influência</span>
                    <select value={profileForm.grau_influencia ?? ''} onChange={(e) => setProfileForm((prev) => ({ ...prev, grau_influencia: (e.target.value || undefined) as any }))} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none">
                      <option value="" className="bg-slate-900">— Não definido —</option>
                      <option value="Alto" className="bg-slate-900">⭐ Alto</option>
                      <option value="Médio" className="bg-slate-900">Médio</option>
                      <option value="Baixo" className="bg-slate-900">Baixo</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400"><Flame className="w-3 h-3 text-orange-400" /> Engajamento</span>
                    <select value={profileForm.engajamento_calor ?? ''} onChange={(e) => setProfileForm((prev) => ({ ...prev, engajamento_calor: (e.target.value || undefined) as any }))} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none">
                      <option value="" className="bg-slate-900">— Não definido —</option>
                      <option value="Quente" className="bg-slate-900">🔥 Quente</option>
                      <option value="Morno" className="bg-slate-900">🌡 Morno</option>
                      <option value="Frio" className="bg-slate-900">❄️ Frio</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400"><TrendingUp className="w-3 h-3 text-emerald-400" /> Jornada</span>
                    <select value={profileForm.status_jornada ?? ''} onChange={(e) => setProfileForm((prev) => ({ ...prev, status_jornada: (e.target.value || undefined) as any }))} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none">
                      <option value="" className="bg-slate-900">— Não definido —</option>
                      <option value="Lead" className="bg-slate-900">Lead</option>
                      <option value="Relacionamento Ativo" className="bg-slate-900">Relacionamento Ativo</option>
                      <option value="Multiplicador" className="bg-slate-900">Multiplicador</option>
                    </select>
                  </label>
                </div>
                <div className="space-y-2">
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400"><Tag className="w-3 h-3 text-fuchsia-400" /> Interesses</span>
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {(profileForm.interesses ?? []).map((interest) => (
                      <button key={interest} type="button" onClick={() => handleRemoveInterest(interest)}
                        className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2.5 py-0.5 text-[10px] font-black text-fuchsia-200 hover:bg-red-400/15 hover:border-red-400/30 hover:text-red-300 transition-colors">
                        {interest}<X className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterestToProfile(); } }}
                      placeholder="Ex: Saúde, Política, Economia..." className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
                    <button type="button" onClick={handleAddInterestToProfile}
                      className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-2 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-400/15 transition-colors">+ Adicionar</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profileForm.tags.map((tag, idx) => (
                      <button key={`${tag}-${idx}`} type="button" onClick={() => handleRemoveTag(tag)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest', TAG_STYLES[idx % TAG_STYLES.length])}>
                        {tag}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTagFromInput(); } }} placeholder="Adicionar tag manual" className="flex-1 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none" />
                    <button type="button" onClick={handleAddTagFromInput} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">Adicionar</button>
                  </div>
                </div>

                <button type="button" onClick={() => void handleSuggestTags()} disabled={isSuggestingTags} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-400/15 transition-colors disabled:opacity-60">
                  {isSuggestingTags ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Brain className="w-4 h-4" />}
                  {isSuggestingTags ? 'Analisando...' : 'Sugerir Tags via IA'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase text-slate-400">Status</span>
                  <select value={profileForm.status} onChange={(event) => setProfileForm((prev) => ({ ...prev, status: event.target.value as 'ativo' | 'inativo' }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none">
                    <option value="ativo" className="bg-slate-900">Ativo</option>
                    <option value="inativo" className="bg-slate-900">Inativo</option>
                  </select>
                </label>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase text-slate-400">Uso operacional</p>
                  <p className="text-sm text-slate-300 mt-2">Tags e status alimentam a seleção de listas no Hub e ajudam a montar grupos mais inteligentes.</p>
                </div>
              </div>
                </div>
              )}

              {activeProfileTab === 'historico' && selectedJournalist && (
                <div className="space-y-3">
                  <CRMInteractionHistory contatoId={selectedJournalist.id} />
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <button onClick={() => void handleSaveProfile()} disabled={isSavingProfile} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  <UserRound className="w-4 h-4" />
                  {isSavingProfile ? 'Salvando perfil...' : 'Salvar Perfil'}
                </button>
                {!whatsAppMessage && (
                  <>
                    <button onClick={() => void openEmailModal()} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Enviar E-mail
                    </button>
                    <button onClick={() => void handleGenerateWhatsAppMessage()} disabled={isGeneratingWhatsAppMessage || !selectedJournalist?.telefone} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60">
                      {isGeneratingWhatsAppMessage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          💬 WhatsApp (IA)
                        </>
                      )}
                    </button>
                  </>
                )}
                {whatsAppMessage && (
                  <>
                    <div className="w-full rounded-xl border border-green-400/30 bg-green-500/10 p-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-300">Mensagem gerada pela IA:</p>
                      <p className="text-sm text-slate-200">{whatsAppMessage}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleSendWhatsApp()} className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white hover:bg-green-500 transition-colors inline-flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Enviar via WhatsApp
                        </button>
                        <button onClick={() => setWhatsAppMessage('')} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEmailModalOpen && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEmailModalOpen(false)}
            className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Disparo de Conteúdo</h3>
                  <p className="text-sm text-slate-400 mt-1">Deseja usar um Release do Hub para enviar a {selectedJournalist.nome}?</p>
                </div>
                <button onClick={() => setIsEmailModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setUseHubRelease(true)} className={cn('rounded-xl border px-4 py-2.5 text-sm font-black transition-colors', useHubRelease ? 'bg-brand-accent/20 border-brand-accent/40 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                  Usar Release do Hub
                </button>
                <button type="button" onClick={() => setUseHubRelease(false)} className={cn('rounded-xl border px-4 py-2.5 text-sm font-black transition-colors', !useHubRelease ? 'bg-brand-accent/20 border-brand-accent/40 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
                  Escrever Mensagem Manual
                </button>
              </div>

              {useHubRelease ? (
                <div className="space-y-3">
                  <select value={selectedReleaseId} onChange={(event) => setSelectedReleaseId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                    {hubReleases.map((release) => (
                      <option key={release.id} value={release.id} className="bg-slate-900">
                        {release.title} • {release.date}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap">
                    {hubReleases.find((release) => release.id === selectedReleaseId)?.content || 'Nenhum release disponível no Hub.'}
                  </div>
                </div>
              ) : (
                <textarea value={customEmailMessage} onChange={(event) => setCustomEmailMessage(event.target.value)} className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none resize-none" placeholder="Escreva a mensagem que será enviada para este contato..." />
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button onClick={handleSendEmailFromModal} className="flex-1 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-black text-white hover:bg-brand-accent/90 transition-colors inline-flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Abrir Envio
                </button>
                <button onClick={() => setIsEmailModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Adicionar em Massa a Grupo ── */}
      <AnimatePresence>
        {isAddToGroupBulkModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddToGroupBulkModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black text-white">
                    <FolderPlus className="w-5 h-5 text-cyan-400" />
                    Adicionar a Grupo Existente
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedIds.length} contato(s) serão adicionados ao grupo selecionado.
                  </p>
                </div>
                <button onClick={() => setIsAddToGroupBulkModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {groups.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum grupo criado ainda. Crie um grupo primeiro.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {groups.map((group) => (
                    <label key={group.id} className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors',
                      bulkTargetGroupId === group.id
                        ? 'border-cyan-400/40 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    )}>
                      <input
                        type="radio"
                        name="bulkGroup"
                        value={group.id}
                        checked={bulkTargetGroupId === group.id}
                        onChange={() => setBulkTargetGroupId(group.id)}
                        className="w-4 h-4 text-cyan-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white">{group.nome}</p>
                        <p className="text-xs text-slate-500">{group.jornalistas_ids.length} contato(s) atual(is)</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => void handleBulkAddToGroup()}
                  disabled={!bulkTargetGroupId}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-black text-white hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  Confirmar
                </button>
                <button onClick={() => setIsAddToGroupBulkModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHygieneModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHygieneModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black text-white">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Relatório de Higienização da Base
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Contatos que precisam de atenção para manter a qualidade do CRM.</p>
                </div>
                <button onClick={() => setIsHygieneModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {hygieneResults.incomplete.length === 0 && hygieneResults.duplicates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <ShieldCheck className="w-12 h-12 text-emerald-400" />
                  <p className="font-black text-white text-lg">Base está limpa!</p>
                  <p className="text-sm text-slate-400">Nenhum contato com dados críticos faltando ou nomes duplicados.</p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                  {hygieneResults.incomplete.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <p className="text-sm font-black text-amber-300">
                          {hygieneResults.incomplete.length} contato(s) com e-mail ou telefone faltando
                        </p>
                      </div>
                      <div className="space-y-2">
                        {hygieneResults.incomplete.map((j) => (
                          <div key={j.id} className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-black text-white">{j.nome}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {!j.email.trim() && <span className="text-red-400 font-bold mr-2">✗ E-mail vazio</span>}
                                {!j.telefone.trim() && <span className="text-red-400 font-bold">✗ Telefone vazio</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => { setIsHygieneModalOpen(false); openProfile(j); }}
                              className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-100 hover:bg-amber-400/15 transition-colors shrink-0"
                            >
                              Corrigir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hygieneResults.duplicates.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <p className="text-sm font-black text-orange-300">
                          {hygieneResults.duplicates.length} nome(s) duplicado(s) encontrado(s)
                        </p>
                      </div>
                      <div className="space-y-3">
                        {hygieneResults.duplicates.map((group) => (
                          <div key={group[0].id} className="rounded-xl border border-orange-400/20 bg-orange-400/5 p-3 space-y-2">
                            <p className="text-xs font-black uppercase text-orange-300">Duplicatas: "{group[0].nome}"</p>
                            {group.map((j) => (
                              <div key={j.id} className="flex items-center justify-between gap-3 pl-3 border-l border-orange-400/20">
                                <div>
                                  <p className="text-sm font-black text-white">{j.nome}</p>
                                  <p className="text-xs text-slate-500">{j.veiculo} • {j.email || 'sem e-mail'}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => { setIsHygieneModalOpen(false); openProfile(j); }}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-slate-200 hover:bg-white/10 transition-colors"
                                  >
                                    Ver Perfil
                                  </button>
                                  <button
                                    onClick={() => { void handleDeleteJournalist(j.id); setHygieneResults((prev) => ({ ...prev, duplicates: prev.duplicates.map((g) => g.filter((item) => item.id !== j.id)).filter((g) => g.length > 1) })); }}
                                    className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-black text-red-300 hover:bg-red-400/15 transition-colors"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <button onClick={() => setIsHygieneModalOpen(false)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-slate-200 hover:bg-white/10 transition-colors">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">CRM MarTech Enterprise — {journalists.length} contatos</span>

      {/* ── Painel de drill-down dos KPI cards ── */}
      <AnimatePresence>
        {kpiPanel !== null && (() => {
          const panelData = kpiPanel === 'aniversariantes'
            ? { title: '🎂 Aniversariantes do Mês', list: kpiListAniversariantes, empty: 'Nenhum aniversariante este mês.' }
            : kpiPanel === 'estrategicos'
            ? { title: '⭐ Contatos Estratégicos', list: kpiListEstrategicos, empty: 'Nenhum contato com grau Alto cadastrado.' }
            : { title: '👥 Base Completa de Contatos', list: journalists, empty: 'Nenhum contato cadastrado.' };

          return (
            <motion.div
              key="kpi-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setKpiPanel(null)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h3 className="text-base font-black text-white">{panelData.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-black text-slate-300">{panelData.list.length}</span>
                    <button onClick={() => setKpiPanel(null)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                  {panelData.list.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-10">{panelData.empty}</p>
                  ) : (
                    panelData.list.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => { setKpiPanel(null); openProfile(j); }}
                        className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition-all"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sm font-black text-indigo-300 shrink-0">
                          {j.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-white truncate">{j.nome}</p>
                          <p className="text-xs text-slate-500 truncate">{j.veiculo}{j.cargo ? ` · ${j.cargo}` : ''}</p>
                        </div>
                        {kpiPanel === 'aniversariantes' && j.data_nascimento && (
                          <span className="text-xs font-bold text-rose-300 shrink-0">
                            {new Date(j.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                        {kpiPanel === 'estrategicos' && j.grau_influencia && (
                          <span className="text-[10px] font-black text-amber-300 border border-amber-400/30 bg-amber-400/10 rounded-full px-2 py-0.5 shrink-0">
                            {j.grau_influencia}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}