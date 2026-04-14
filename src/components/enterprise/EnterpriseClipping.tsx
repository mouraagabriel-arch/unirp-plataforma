import { useState, useMemo, useEffect } from 'react';
import { 
  Newspaper, Search, Filter, Plus, 
  Sparkles, Loader2, MessageSquare, 
  TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, X, Share2, Globe,
  MoreVertical, Edit2, Trash2, Zap,
  BarChart3, PieChart, Activity, Gauge,
  ChevronRight, ArrowRight, MessageCircle,
  Radio, Cloud, MapPin, Users, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, callGeminiWithRetry } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useTenantService } from '../../services/useTenantService';
import { buscarNoticiasAutomatico, paisesInternacionais, type NewsArticle } from '../../lib/newsApiMock';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface NewsItem {
  id: string;
  titulo: string;
  veiculo: string;
  data: string;
  sentimento?: 'positivo' | 'neutro' | 'negativo';
  resumo?: string;
  nota_gerada?: string;
  tonalidade_ia?: 'favoravel' | 'neutra' | 'hostil';
  narrativa_ia?: string;
  risco_ia?: 'baixo' | 'medio' | 'alto' | 'critico';
  monitor_tags?: { focais: string[]; contexto: string[] };
  url: string;
  origem: 'imprensa' | 'redes_sociais';
}

interface MonitoringConfig {
  focais: string[];
  contexto: string[];
}

interface StructuredCrisisPlan {
  plano_acao_imediato: string[];
  responsaveis: string[];
  draft_nota_oficial: string;
}

function normalizeWord(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferSourceColor(source: string): string {
  const base = normalizeWord(source);
  if (base.includes('twitter') || base.includes('x')) return '#1DA1F2';
  if (base.includes('facebook')) return '#1877F2';
  if (base.includes('instagram')) return '#E1306C';
  if (base.includes('youtube')) return '#FF0000';
  if (base.includes('g1') || base.includes('folha') || base.includes('portal')) return '#6366F1';
  return '#22D3EE';
}

function parseJsonObject<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function cleanKeywordList(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

function matchMonitoringTags(text: string, config: MonitoringConfig): { focais: string[]; contexto: string[] } {
  const normalizedText = normalizeWord(text);
  const pick = (items: string[]) =>
    items.filter((item) => normalizedText.includes(normalizeWord(item)));

  return {
    focais: pick(config.focais),
    contexto: pick(config.contexto),
  };
}

function parseStructuredCrisisPlan(raw: string): StructuredCrisisPlan {
  const normalized = raw.trim();
  const direct = parseJsonObject<StructuredCrisisPlan | null>(normalized, null);

  if (direct && Array.isArray(direct.plano_acao_imediato) && Array.isArray(direct.responsaveis) && typeof direct.draft_nota_oficial === 'string') {
    return {
      plano_acao_imediato: direct.plano_acao_imediato.filter(Boolean).slice(0, 3),
      responsaveis: direct.responsaveis.filter(Boolean),
      draft_nota_oficial: direct.draft_nota_oficial.trim(),
    };
  }

  const jsonMatch = normalized.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('A IA nao retornou JSON valido para o simulador de crise.');
  }

  const parsed = parseJsonObject<StructuredCrisisPlan | null>(jsonMatch[0], null);
  if (!parsed || !Array.isArray(parsed.plano_acao_imediato) || !Array.isArray(parsed.responsaveis) || typeof parsed.draft_nota_oficial !== 'string') {
    throw new Error('JSON de crise sem os campos obrigatorios: plano_acao_imediato, responsaveis, draft_nota_oficial.');
  }

  return {
    plano_acao_imediato: parsed.plano_acao_imediato.filter(Boolean).slice(0, 3),
    responsaveis: parsed.responsaveis.filter(Boolean),
    draft_nota_oficial: parsed.draft_nota_oficial.trim(),
  };
}

export function EnterpriseClipping({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzingAdvancedId, setAnalyzingAdvancedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [aiStatusMsg, setAiStatusMsg] = useState('');
  const [hubLoadingId, setHubLoadingId] = useState<string | null>(null);
  const [workflowLoadingId, setWorkflowLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scenarioText, setScenarioText] = useState('');
  const [isSubmittingScenario, setIsSubmittingScenario] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [crisisDescription, setCrisisDescription] = useState('');
  const [crisisPlan, setCrisisPlan] = useState<StructuredCrisisPlan | null>(null);
  const [isGeneratingCrisisPlan, setIsGeneratingCrisisPlan] = useState(false);
  const [isSavingCrisis, setIsSavingCrisis] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'negativos' | 'hoje' | '7dias'>('todos');
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfig>({ focais: [], contexto: [] });
  const [focalInput, setFocalInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [savingMonitoringConfig, setSavingMonitoringConfig] = useState(false);
  const [searchingNews, setSearchingNews] = useState(false);
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
  const [isShowingSearchResults, setIsShowingSearchResults] = useState(false);
  const [abrangenciaGeografica, setAbrangenciaGeografica] = useState<'nacional' | 'internacional'>('nacional');
  const [paisSelected, setPaisSelected] = useState<string>('');

  // Carrega notícias do Supabase na montagem
  useEffect(() => {
    const load = async () => {
      const [{ data, error }, monitoringResponse] = await Promise.all([
        tenantService
          .from('enterprise_clipping')
          .select('*')
          .order('data_publicacao', { ascending: false }),
        tenantService.getClippingMonitoringConfig(),
      ]);

      if (error) {
        alert(`Erro ao carregar: ${error.message}`);
        return;
      }

      if (!monitoringResponse.error && monitoringResponse.data) {
        setMonitoringConfig(monitoringResponse.data);
        setFocalInput(monitoringResponse.data.focais.join(', '));
        setContextInput(monitoringResponse.data.contexto.join(', '));
      }

      const rows = data ?? [];
      setNews(rows.map((row) => ({
        id: row.id,
        titulo: row.titulo_materia,
        veiculo: row.fonte,
        data: row.data_publicacao,
        sentimento: row.sentimento ?? undefined,
        resumo: row.resumo_ia ?? undefined,
        nota_gerada: row.nota_resposta_ia ?? undefined,
        tonalidade_ia: row.tonalidade_ia ?? undefined,
        narrativa_ia: row.narrativa_ia ?? undefined,
        risco_ia: row.risco_ia ?? undefined,
        monitor_tags: parseJsonObject(row.monitor_tags, { focais: [], contexto: [] }),
        url: row.link ?? '',
        origem: row.origem as NewsItem['origem'],
      })));
    };

    void load();
  }, []);

  const openCrisisModal = () => {
    setIsCrisisModalOpen(true);
    setCrisisDescription('');
    setCrisisPlan(null);
  };

  const handleDeleteNews = async (id: string) => {
    const { error } = await tenantService
      .from('enterprise_clipping')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    setNews((prev) => prev.filter((c) => c.id !== id));
  };

  const riskLevel = useMemo(() => {
    if (news.length === 0) return 0;
    const negative = news.filter((n) => n.sentimento === 'negativo').length;
    const neutral = news.filter((n) => n.sentimento === 'neutro').length;
    const unknown = news.filter((n) => !n.sentimento).length;
    const weighted = negative * 1 + neutral * 0.55 + unknown * 0.35;
    return Math.min(100, Math.round((weighted / news.length) * 100));
  }, [news]);

  // Dados computados para o Radar
  const riskLabel = riskLevel <= 30 ? 'Baixo' : riskLevel <= 60 ? 'Moderado' : riskLevel <= 85 ? 'Alto' : 'Crítico';
  const riskColor = riskLevel <= 30 ? 'text-emerald-400' : riskLevel <= 60 ? 'text-amber-400' : riskLevel <= 85 ? 'text-orange-400' : 'text-red-500';
  const riskBgColor = riskLevel <= 30 ? 'bg-emerald-500/20' : riskLevel <= 60 ? 'bg-amber-500/20' : riskLevel <= 85 ? 'bg-orange-500/20' : 'bg-red-500/20';

  const noiseSources = useMemo(() => {
    if (news.length === 0) return [] as Array<{ source: string; percentage: number; color: string }>;

    const counts = new Map<string, number>();
    news.forEach((item) => {
      const key = item.veiculo?.trim() || 'Fonte não informada';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const total = news.length;
    return Array.from(counts.entries())
      .map(([source, count]) => ({
        source,
        percentage: Math.round((count / total) * 100),
        color: inferSourceColor(source),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);
  }, [news]);

  const hotTerms = useMemo(() => {
    const stopwords = new Set([
      'para', 'com', 'sem', 'das', 'dos', 'que', 'uma', 'por', 'nos', 'nas', 'sobre', 'mais',
      'hoje', 'apos', 'após', 'entre', 'essa', 'esse', 'isso', 'de', 'da', 'do', 'e', 'o', 'a',
      'um', 'na', 'no', 'em', 'ao', 'as', 'os', 'se', 'foi', 'ser', 'tem', 'esta', 'está',
    ]);

    const counts = new Map<string, number>();
    news.forEach((item) => {
      item.titulo
        .split(/[^\p{L}\p{N}]+/u)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4)
        .forEach((word) => {
          const normalized = normalizeWord(word);
          if (stopwords.has(normalized)) return;
          counts.set(word, (counts.get(word) ?? 0) + 1);
        });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => (word.startsWith('#') ? word : `#${word}`));
  }, [news]);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.veiculo.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'negativos') return matchesSearch && item.sentimento === 'negativo';
      if (filterType === 'hoje') {
        const today = new Date().toISOString().split('T')[0];
        return matchesSearch && item.data.startsWith(today);
      }
      if (filterType === '7dias') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return matchesSearch && item.data >= sevenDaysAgo;
      }
      return matchesSearch;
    });
  }, [news, searchTerm, filterType]);

  const analyzeSentiment = async (item: NewsItem) => {
    setAnalyzingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${institutionalPrompt}\n\nAnalise o sentimento desta notícia institucional: "${item.titulo}". 
        Responda apenas com uma palavra: POSITIVO, NEUTRO ou NEGATIVO. 
        E forneça um breve resumo de 1 parágrafo sobre o impacto para a instituição.`,
        }),
        setAiStatusMsg,
      );
      
      const text = (response.text ?? '').trim();
      if (!text) throw new Error('A API do Gemini retornou uma resposta vazia.');

      const sentiment = text.toUpperCase().includes('POSITIVO') ? 'positivo' : 
                        text.toUpperCase().includes('NEGATIVO') ? 'negativo' : 'neutro';
      
      setNews(prev => prev.map(n => n.id === item.id ? { ...n, sentimento: sentiment as any, resumo: text } : n));

      const { error } = await tenantService
        .from('enterprise_clipping')
        .update({ sentimento: sentiment, resumo_ia: text })
        .eq('id', item.id);

      if (error) {
        alert(`Erro ao salvar: ${error.message}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[analyzeSentiment] Falha na chamada à API do Gemini:', error);
      alert(`Erro na análise de sentimento com IA:\n${msg}\n\nVerifique o console para detalhes.`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const generateCrisisResponse = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${institutionalPrompt}\n\nComo porta-voz oficial da instituição, escreva uma "Nota de Resposta" para a seguinte notícia: "${item.titulo}". 
        A nota deve ser transparente, técnica e propositiva, focando na solução do problema. Máximo 200 palavras.`,
        }),
        setAiStatusMsg,
      );
      
      const text = (response.text ?? '').trim();
      if (!text) throw new Error('A API do Gemini retornou uma resposta vazia.');

      setNews(prev => prev.map(n => n.id === item.id ? { ...n, nota_gerada: text } : n));

      const { error } = await tenantService
        .from('enterprise_clipping')
        .update({ nota_resposta_ia: text })
        .eq('id', item.id);

      if (error) {
        alert(`Erro ao salvar: ${error.message}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[generateCrisisResponse] Falha na chamada à API do Gemini:', error);
      alert(`Erro ao gerar nota de crise com IA:\n${msg}\n\nVerifique o console para detalhes.`);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSaveDraftNote = async (item: NewsItem) => {
    if (!item.nota_gerada) return;

    const { error } = await tenantService
      .from('enterprise_clipping')
      .update({ nota_resposta_ia: item.nota_gerada })
      .eq('id', item.id);

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }

    alert('Rascunho salvo com sucesso.');
  };

  const handlePublishNote = async (item: NewsItem) => {
    await handleSaveDraftNote(item);
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveMonitoringConfig = async () => {
    const nextConfig: MonitoringConfig = {
      focais: cleanKeywordList(focalInput),
      contexto: cleanKeywordList(contextInput),
    };

    setSavingMonitoringConfig(true);
    const { error } = await tenantService.upsertClippingMonitoringConfig(nextConfig);
    setSavingMonitoringConfig(false);

    if (error) {
      alert(`Erro ao salvar monitoramento: ${error.message}`);
      return;
    }

    setMonitoringConfig(nextConfig);
    alert('Configurações de monitoramento salvas.');
  };

  const handleSearchNews = async () => {
    if (monitoringConfig.focais.length === 0) {
      alert('Configure palavras-chave focais para buscar notícias.');
      return;
    }

    setSearchingNews(true);
    try {
      const paises = abrangenciaGeografica === 'internacional' && paisSelected ? [paisSelected] : undefined;
      const results = await buscarNoticiasAutomatico(
        monitoringConfig.focais,
        abrangenciaGeografica,
        paises
      );
      setSearchResults(results);
      setIsShowingSearchResults(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleSearchNews]:', error);
      alert(`Erro ao buscar notícias: ${msg}`);
    } finally {
      setSearchingNews(false);
    }
  };

  const handleAddSearchResultToClipping = async (article: NewsArticle) => {
    try {
      const nowIso = new Date().toISOString();
      const matchedTags = matchMonitoringTags(article.titulo, monitoringConfig);
      
      const novoItem = {
        titulo_materia: article.titulo,
        fonte: article.fonte,
        data_publicacao: article.dataPublicacao,
        sentimento: null,
        resumo_ia: article.descricao,
        nota_resposta_ia: null,
        tonalidade_ia: null,
        narrativa_ia: null,
        risco_ia: null,
        monitor_tags: matchedTags,
        link: article.url,
        origem: 'imprensa' as const,
        abrangencia_geografica: abrangenciaGeografica === 'internacional' ? paisSelected : 'Brasil',
      };

      const { data, error } = await tenantService
        .from('enterprise_clipping')
        .insert([novoItem])
        .select();

      if (error) {
        alert(`Erro ao adicionar notícia: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        const saved: NewsItem = {
          id: row.id,
          titulo: row.titulo_materia,
          veiculo: row.fonte,
          data: row.data_publicacao,
          sentimento: row.sentimento ?? undefined,
          resumo: row.resumo_ia ?? undefined,
          nota_gerada: row.nota_resposta_ia ?? undefined,
          tonalidade_ia: row.tonalidade_ia ?? undefined,
          narrativa_ia: row.narrativa_ia ?? undefined,
          risco_ia: row.risco_ia ?? undefined,
          monitor_tags: parseJsonObject(row.monitor_tags, matchedTags),
          url: row.link ?? '',
          origem: row.origem as NewsItem['origem'],
        };
        setNews((prev) => [saved, ...prev]);
        setSearchResults((prev) => prev.filter((r) => r.id !== article.id));
        alert('Notícia adicionada ao clipping com sucesso.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleAddSearchResultToClipping]:', error);
      alert(`Erro ao adicionar notícia ao clipping: ${msg}`);
    }
  };

  const analyzeNarrativeRisk = async (item: NewsItem, tags?: { focais: string[]; contexto: string[] }) => {
    setAnalyzingAdvancedId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      const referenceTags = tags || item.monitor_tags || { focais: [], contexto: [] };

      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${institutionalPrompt}\n\nAnalise a noticia abaixo e responda SOMENTE em JSON valido com as chaves: tonalidade, narrativa, risco, recomendacao.\n\nValores aceitos:\n- tonalidade: favoravel | neutra | hostil\n- risco: baixo | medio | alto | critico\n- narrativa: frase curta resumindo o enquadramento narrativo\n- recomendacao: frase curta com acao sugerida\n\nTitulo: ${item.titulo}\nFonte: ${item.veiculo}\nTags focais encontradas: ${(referenceTags.focais || []).join(', ') || 'nenhuma'}\nTags de contexto encontradas: ${(referenceTags.contexto || []).join(', ') || 'nenhuma'}`,
        }),
        setAiStatusMsg,
      );

      const raw = (response.text ?? '').trim();
      if (!raw) throw new Error('Resposta vazia da API para analise estruturada.');

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const payload = JSON.parse((jsonMatch ? jsonMatch[0] : raw).trim()) as {
        tonalidade?: string;
        narrativa?: string;
        risco?: string;
        recomendacao?: string;
      };

      const tonalidade = ['favoravel', 'neutra', 'hostil'].includes((payload.tonalidade || '').toLowerCase())
        ? (payload.tonalidade || '').toLowerCase()
        : 'neutra';
      const risco = ['baixo', 'medio', 'alto', 'critico'].includes((payload.risco || '').toLowerCase())
        ? (payload.risco || '').toLowerCase()
        : 'medio';
      const narrativa = (payload.narrativa || '').trim() || 'Sem narrativa identificada';
      const recomendacao = (payload.recomendacao || '').trim();
      const resumoAtualizado = recomendacao
        ? `${item.resumo || ''}${item.resumo ? '\n\n' : ''}Recomendação IA: ${recomendacao}`
        : item.resumo;

      setNews((prev) => prev.map((entry) => (
        entry.id === item.id
          ? {
              ...entry,
              tonalidade_ia: tonalidade as NewsItem['tonalidade_ia'],
              narrativa_ia: narrativa,
              risco_ia: risco as NewsItem['risco_ia'],
              resumo: resumoAtualizado,
              monitor_tags: referenceTags,
            }
          : entry
      )));

      const { error } = await tenantService
        .from('enterprise_clipping')
        .update({
          tonalidade_ia: tonalidade,
          narrativa_ia: narrativa,
          risco_ia: risco,
          monitor_tags: referenceTags,
          resumo_ia: resumoAtualizado,
        })
        .eq('id', item.id);

      if (error) {
        alert(`Erro ao salvar analise estruturada: ${error.message}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[analyzeNarrativeRisk] Falha na analise estruturada com Gemini:', error);
      alert(`Erro na analise estruturada de tonalidade/risco:\n${msg}`);
    } finally {
      setAnalyzingAdvancedId(null);
    }
  };

  const handleAnalyzeScenario = async () => {
    const titulo = scenarioText.trim();
    if (!titulo) {
      alert('Digite um cenário/notícia para analisar.');
      return;
    }

    setIsSubmittingScenario(true);
    try {
      const nowIso = new Date().toISOString();
      const matchedTags = matchMonitoringTags(titulo, monitoringConfig);
      const novoItem = {
        titulo_materia: titulo,
        fonte: 'Entrada Manual',
        data_publicacao: nowIso,
        sentimento: null,
        resumo_ia: null,
        nota_resposta_ia: null,
        tonalidade_ia: null,
        narrativa_ia: null,
        risco_ia: null,
        monitor_tags: matchedTags,
        link: 'https://example.org/entrada-manual',
        origem: 'redes_sociais',
      };

      const { data, error } = await tenantService
        .from('enterprise_clipping')
        .insert([novoItem])
        .select();

      if (error) {
        alert(`Erro ao salvar: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        alert('Não foi possível registrar o cenário para análise.');
        return;
      }

      const row = data[0];
      const saved: NewsItem = {
        id: row.id,
        titulo: row.titulo_materia,
        veiculo: row.fonte,
        data: row.data_publicacao,
        sentimento: row.sentimento ?? undefined,
        resumo: row.resumo_ia ?? undefined,
        nota_gerada: row.nota_resposta_ia ?? undefined,
        tonalidade_ia: row.tonalidade_ia ?? undefined,
        narrativa_ia: row.narrativa_ia ?? undefined,
        risco_ia: row.risco_ia ?? undefined,
        monitor_tags: parseJsonObject(row.monitor_tags, matchedTags),
        url: row.link ?? '',
        origem: row.origem as NewsItem['origem'],
      };

      setNews((prev) => [saved, ...prev]);
      setScenarioText('');
      await analyzeSentiment(saved);
      await analyzeNarrativeRisk(saved, matchedTags);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleAnalyzeScenario] Falha ao enviar cenário para análise:', error);
      alert(`Erro ao analisar cenário com IA:\n${msg}`);
    } finally {
      setIsSubmittingScenario(false);
    }
  };

  const handleGenerateCrisisPlan = async () => {
    const description = crisisDescription.trim();
    if (!description) {
      alert('Descreva o problema para gerar o plano de ação.');
      return;
    }

    setIsGeneratingCrisisPlan(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      const { data: settingsData } = await tenantService.getEnterpriseSettings();
      const missao = settingsData?.missao || 'servir ao interesse publico com transparencia e eficiencia';
      const tom = settingsData?.tom_de_voz || 'Tecnico';
      const autoridades = settingsData?.autoridades_principais || 'Nao informadas';
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${institutionalPrompt}\n\nCEREBRO INSTITUCIONAL:\n- Missao: ${missao}\n- Tom institucional: ${tom}\n- Autoridades e liderancas: ${autoridades}\n\nVoce e coordenador de crise institucional. Gere resposta em JSON estrito, sem markdown, sem texto extra e sem comentarios.\n\nFormato obrigatorio:\n{ "plano_acao_imediato": ["passo 1", "passo 2", "passo 3"], "responsaveis": ["Nome 1", "Nome 2"], "draft_nota_oficial": "Texto da nota" }\n\nRegras:\n- plano_acao_imediato: exatamente 3 itens objetivos para as proximas 24h.\n- responsaveis: somente nomes reais das autoridades/porta-vozes do cerebro institucional quando disponiveis.\n- draft_nota_oficial: texto formal, juridicamente cauteloso, com empatia e compromisso de acao.

Cenário:
${description}
`,
        }),
        setAiStatusMsg,
      );

      const text = (response.text ?? '').trim();
      if (!text) throw new Error('Resposta vazia da API ao gerar plano de crise.');
      const structuredPlan = parseStructuredCrisisPlan(text);
      setCrisisPlan(structuredPlan);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleGenerateCrisisPlan] Falha ao gerar plano de crise:', error);
      alert(`Erro ao gerar plano de ação com IA:\n${msg}`);
    } finally {
      setIsGeneratingCrisisPlan(false);
    }
  };

  const handleSaveCrisisSimulation = async () => {
    const description = crisisDescription.trim();
    if (!description) {
      alert('Descreva o problema para registrar a simulação.');
      return;
    }

    setIsSavingCrisis(true);
    try {
      const nowIso = new Date().toISOString();
      const monitorTags = matchMonitoringTags(description, monitoringConfig);
      const novoItem = {
        titulo_materia: `Simulação de crise: ${description}`,
        fonte: 'Simulador de Crise',
        data_publicacao: nowIso,
        sentimento: 'negativo',
        resumo_ia: crisisPlan ? JSON.stringify(crisisPlan) : null,
        nota_resposta_ia: null,
        tonalidade_ia: 'hostil',
        narrativa_ia: 'Simulação de crise institucional',
        risco_ia: 'alto',
        monitor_tags: monitorTags,
        link: 'https://example.org/simulador-crise',
        origem: 'redes_sociais',
      };

      const { data, error } = await tenantService
        .from('enterprise_clipping')
        .insert([novoItem])
        .select();

      if (error) {
        alert(`Erro ao salvar simulação: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        const saved: NewsItem = {
          id: row.id,
          titulo: row.titulo_materia,
          veiculo: row.fonte,
          data: row.data_publicacao,
          sentimento: row.sentimento ?? undefined,
          resumo: row.resumo_ia ?? undefined,
          nota_gerada: row.nota_resposta_ia ?? undefined,
          tonalidade_ia: row.tonalidade_ia ?? undefined,
          narrativa_ia: row.narrativa_ia ?? undefined,
          risco_ia: row.risco_ia ?? undefined,
          monitor_tags: parseJsonObject(row.monitor_tags, monitorTags),
          url: row.link ?? '',
          origem: row.origem as NewsItem['origem'],
        };
        setNews((prev) => [saved, ...prev]);
      }

      setIsCrisisModalOpen(false);
      setCrisisDescription('');
      setCrisisPlan(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleSaveCrisisSimulation] Falha ao salvar simulação:', error);
      alert(`Erro ao registrar simulação de crise:\n${msg}`);
    } finally {
      setIsSavingCrisis(false);
    }
  };

  const handleGenerateResponseInHub = async (item: NewsItem) => {
    setHubLoadingId(item.id);
    try {
      const body = (item.nota_gerada || item.resumo || '').trim();
      if (!body) {
        alert('Gere ao menos uma análise ou resposta para enviar ao Hub.');
        return;
      }

      const title = `Resposta ao Clipping • ${item.veiculo}`;
      const briefing = `Notícia monitorada:\n${item.titulo}\n\nResposta sugerida:\n${body}`;

      const { error } = await tenantService
        .from('enterprise_demandas')
        .insert([{
          ticket_codigo: `CLP-HUB-${Date.now().toString().slice(-6)}`,
          titulo: title,
          secretaria_solicitante: 'Clipping & Crise',
          tipo_peca: 'Release',
          prazo_texto: new Date().toLocaleDateString('pt-BR'),
          status_ticket: 'triagem',
          briefing,
          responsavel: 'Equipe Hub',
          prioridade: item.sentimento === 'negativo' ? 'Alta' : 'Média',
        }]);

      if (error) {
        alert(`Erro ao enviar para o Hub: ${error.message}`);
        return;
      }

      localStorage.setItem('enterprise_hub_prefill', JSON.stringify({
        source: 'clipping',
        clippingId: item.id,
        title,
        body: briefing,
      }));

      alert('Conteúdo enviado ao Hub com sucesso. Ele já está disponível no histórico do Hub de Conteúdo.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleGenerateResponseInHub] Falha ao enviar contexto para Hub:', error);
      alert(`Erro ao preparar resposta para o Hub:\n${msg}`);
    } finally {
      setHubLoadingId(null);
    }
  };

  const handleCreateCrisisTask = async (item: NewsItem) => {
    setWorkflowLoadingId(item.id);
    try {
      const descricao = (item.resumo || item.nota_gerada || item.titulo).trim();
      const tags = ['Crise', item.veiculo, item.sentimento || 'neutro'].filter(Boolean);

      const { error } = await tenantService
        .from('enterprise_pautas')
        .insert([{
          titulo: `Crise: ${item.titulo}`.slice(0, 140),
          descricao,
          prioridade: 'alta',
          responsavel: 'Gabinete de Crise',
          tags,
          status_coluna: 'backlog',
        }]);

      if (error) {
        alert(`Erro ao criar pauta de crise: ${error.message}`);
        return;
      }

      alert('Pauta de crise criada no Workflow com prioridade alta.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[handleCreateCrisisTask] Falha ao criar pauta no Workflow:', error);
      alert(`Erro ao criar pauta de crise:\n${msg}`);
    } finally {
      setWorkflowLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100">
      
      {/* BANNER DE STATUS DA API DE IA */}
      {aiStatusMsg && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm font-medium animate-pulse">
          <span>{aiStatusMsg}</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Clipping & <span className="text-red-500">Crise</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">Radar de Monitoramento & Gestão de Reputação</p>
        </div>
        <button onClick={openCrisisModal} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-[1.5rem] font-black hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 hover:scale-105">
          <AlertCircle className="w-5 h-5" />
          🚨 Simular Crise
        </button>
      </div>

      {/* LÂMINA 1: RADAR DE IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Termômetro de Risco */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4"
        >
          <Gauge className={`w-12 h-12 ${riskColor}`} />
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nível de Risco Atual</p>
            <h3 className={`text-5xl font-black ${riskColor}`}>{riskLevel}</h3>
            <p className={`text-xl font-bold mt-2 ${riskColor}`}>{riskLabel}</p>
          </div>
          {/* Barra de progresso circular visual */}
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${riskBgColor} border-current`}>
            <div className="text-4xl font-black text-slate-100">{riskLevel}%</div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Calculado com base em sentimentos negativos e menções alarmantes</p>
        </motion.div>

        {/* Card: Fontes de Ruído */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6"
        >
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Distribuição de Menções</p>
            <h3 className="text-2xl font-black text-white">Fontes de Ruído</h3>
          </div>
          <div className="space-y-4">
            {noiseSources.map((src, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-300">{src.source}</span>
                  <span className="text-sm font-black" style={{ color: src.color }}>{src.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${src.percentage}%` }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.8 }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-6">Total: {news.length} menções identificadas</p>
        </motion.div>

        {/* Card: Termos Quentes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col"
        >
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Nuvem de Palavras</p>
            <h3 className="text-2xl font-black text-white">Termos Quentes</h3>
          </div>
          <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
            {hotTerms.map((term, idx) => (
              <motion.span 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-black tracking-wider transition-all hover:scale-110 cursor-pointer",
                  idx % 3 === 0 ? "bg-purple-500/30 text-purple-300 border border-purple-400/30" :
                  idx % 3 === 1 ? "bg-blue-500/30 text-blue-300 border border-blue-400/30" :
                  "bg-cyan-500/30 text-cyan-300 border border-cyan-400/30"
                )}
              >
                {term}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* LÂMINA 2: FILTROS E BUSCA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center gap-4"
      >
        <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar notícias ou menções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder-slate-500 text-slate-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
          {[
            { label: 'Todas as Fontes', value: 'todos' },
            { label: 'Apenas Negativas', value: 'negativos' },
            { label: 'Hoje', value: 'hoje' },
            { label: 'Últimos 7 dias', value: '7dias' }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilterType(btn.value as any)}
              className={cn(
                "px-4 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap",
                filterType === btn.value 
                  ? "bg-brand-accent text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-slate-500"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Configurações de Monitoramento</p>
          <button
            type="button"
            onClick={() => void handleSaveMonitoringConfig()}
            disabled={savingMonitoringConfig}
            className="px-4 py-2 rounded-xl bg-cyan-600/90 text-white text-xs font-black hover:bg-cyan-500 transition-all disabled:opacity-60"
          >
            {savingMonitoringConfig ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="space-y-2 block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Palavras-Chave Focais</span>
            <textarea
              value={focalInput}
              onChange={(e) => setFocalInput(e.target.value)}
              className="w-full min-h-[88px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none"
              placeholder="Ex: saúde, educação, saneamento, mobilidade"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Palavras de Contexto</span>
            <textarea
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              className="w-full min-h-[88px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none"
              placeholder="Ex: crise, denúncia, oposição, investigação"
            />
          </label>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48 }}
        onSubmit={(event) => {
          event.preventDefault();
          void handleAnalyzeScenario();
        }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center gap-4"
      >
        <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Descreva uma notícia/cenário para a IA analisar..."
            value={scenarioText}
            onChange={(e) => setScenarioText(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder-slate-500 text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmittingScenario || analyzingId !== null}
          className="px-6 py-4 rounded-2xl font-bold text-sm border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg backdrop-blur-xl"
        >
          {isSubmittingScenario ? 'Enviando...' : 'Analisar Cenário (IA)'}
        </button>
      </motion.form>

      {/* BUSCA AUTOMÁTICA DE NOTÍCIAS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 border border-blue-400/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Busca Automática de Notícias</p>
              <p className="text-sm font-semibold text-slate-300">Busca na web por palavras-chave focais</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-black">Abrangência</label>
            <select
              value={abrangenciaGeografica}
              onChange={(e) => {
                setAbrangenciaGeografica(e.target.value as 'nacional' | 'internacional');
                setPaisSelected('');
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
            >
              <option value="nacional" className="bg-slate-900">Nacional</option>
              <option value="internacional" className="bg-slate-900">Internacional</option>
            </select>
          </div>

          {abrangenciaGeografica === 'internacional' && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-black">País</label>
              <select
                value={paisSelected}
                onChange={(e) => setPaisSelected(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
              >
                <option value="" className="bg-slate-900">Todos os países</option>
                {paisesInternacionais.map((pais) => (
                  <option key={pais} value={pais} className="bg-slate-900">
                    {pais}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={abrangenciaGeografica === 'internacional' ? '' : 'md:col-span-3'} />

          <div className={`flex items-end ${abrangenciaGeografica === 'internacional' ? '' : 'md:col-span-2'}`}>
            <button
              type="button"
              onClick={() => void handleSearchNews()}
              disabled={searchingNews}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 font-black text-sm hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {searchingNews ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Buscar Notícias
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* LÂMINA 3: FEED DE CLIPPING */}
      <div className="space-y-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Feed de Clipping ({filteredNews.length} itens)</p>
        
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Cloud className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Nenhuma notícia encontrada com os filtros aplicados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all hover:border-white/20 hover:shadow-lg hover:shadow-white/5",
                  "border-l-4",
                  item.sentimento === 'negativo' ? "border-l-red-500" :
                  item.sentimento === 'positivo' ? "border-l-emerald-500" :
                  "border-l-amber-500"
                )}
              >
                <div className="p-8 space-y-6">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 flex-col",
                        item.origem === 'imprensa' ? "bg-blue-500/20 text-blue-400" : "bg-indigo-500/20 text-indigo-400"
                      )}>
                        {item.origem === 'imprensa' ? <Newspaper className="w-6 h-6" /> : <Radio className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                            {item.veiculo}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {item.data}
                          </span>
                          {item.sentimento && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block",
                              item.sentimento === 'positivo' ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30" : 
                              item.sentimento === 'negativo' ? "bg-red-500/30 text-red-300 border border-red-400/30" : 
                              "bg-amber-500/30 text-amber-300 border border-amber-400/30"
                            )}>
                              {item.sentimento === 'positivo' ? '🟢 Positivo' :
                               item.sentimento === 'negativo' ? '🔴 Negativo' : '🟡 Neutro'}
                            </span>
                          )}
                          {item.tonalidade_ia && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block",
                              item.tonalidade_ia === 'favoravel' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                              item.tonalidade_ia === 'hostil' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                              'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                            )}>
                              {item.tonalidade_ia === 'favoravel' ? 'Tonalidade Favorável' :
                                item.tonalidade_ia === 'hostil' ? 'Tonalidade Hostil' : 'Tonalidade Neutra'}
                            </span>
                          )}
                          {item.risco_ia && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block",
                              item.risco_ia === 'baixo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                              item.risco_ia === 'medio' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                              item.risco_ia === 'alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                              'bg-red-600/20 text-red-300 border border-red-500/40'
                            )}>
                              {`Risco ${item.risco_ia.toUpperCase()}`}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black leading-snug text-white">
                          {item.titulo}
                        </h3>
                        {item.narrativa_ia && (
                          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                            Narrativa detectada: <span className="font-semibold text-slate-100">{item.narrativa_ia}</span>
                          </p>
                        )}
                        {item.monitor_tags && (item.monitor_tags.focais.length > 0 || item.monitor_tags.contexto.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.monitor_tags.focais.map((tag) => (
                              <span key={`f-${item.id}-${tag}`} className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                Focal: {tag}
                              </span>
                            ))}
                            {item.monitor_tags.contexto.map((tag) => (
                              <span key={`c-${item.id}-${tag}`} className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30">
                                Contexto: {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resumo IA */}
                  {item.resumo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">📊 Análise IA</p>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed">
                          {item.resumo.substring(0, 200)}...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Ações Rápidas */}
                  <div className="flex flex-wrap gap-3">
                    {!item.sentimento && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => analyzeSentiment(item)}
                        disabled={analyzingId === item.id}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {analyzingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Análise de Sentimento
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => void analyzeNarrativeRisk(item)}
                      disabled={analyzingAdvancedId === item.id}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-2xl font-bold text-sm hover:from-cyan-700 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                      {analyzingAdvancedId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                      IA Tonalidade/Narrativa/Risco
                    </motion.button>
                    
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-700/50 transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      Ver Original
                    </a>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => generateCrisisResponse(item)}
                      disabled={generatingId === item.id}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold text-sm hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 ml-auto"
                    >
                      {generatingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                      ✍️ Elaborar Resposta
                    </motion.button>

                    <button
                      onClick={() => void handleDeleteNews(item.id)}
                      className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-700/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>

                  {(item.sentimento || item.resumo || item.nota_gerada) && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
                      <button
                        onClick={() => void handleGenerateResponseInHub(item)}
                        disabled={hubLoadingId === item.id}
                        className="flex items-center gap-2 px-5 py-3 bg-cyan-600/90 text-white rounded-2xl font-bold text-sm hover:bg-cyan-500 transition-all disabled:opacity-60"
                      >
                        {hubLoadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        📝 Gerar Resposta no Hub
                      </button>

                      <button
                        onClick={() => void handleCreateCrisisTask(item)}
                        disabled={workflowLoadingId === item.id}
                        className="flex items-center gap-2 px-5 py-3 bg-red-600/90 text-white rounded-2xl font-bold text-sm hover:bg-red-500 transition-all disabled:opacity-60"
                      >
                        {workflowLoadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                        🚨 Criar Pauta de Crise
                      </button>
                    </div>
                  )}

                  {/* Resposta Gerada */}
                  <AnimatePresence>
                    {item.nota_gerada && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 p-6 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl space-y-4"
                      >
                        <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
                          <Zap className="w-4 h-4" />
                          Nota de Resposta (IA)
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                          "{item.nota_gerada}"
                        </p>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => void handlePublishNote(item)} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20">
                            Publicar Nota
                          </button>
                          <button onClick={() => void handleSaveDraftNote(item)} className="flex-1 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700/50 transition-all">
                            Salvar Rascunho
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCrisisModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCrisisModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/95 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">🚨 Simulador de Crise</h3>
                <button
                  onClick={() => setIsCrisisModalOpen(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <label className="space-y-2 block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Descreva o problema</span>
                <textarea
                  value={crisisDescription}
                  onChange={(e) => setCrisisDescription(e.target.value)}
                  className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none"
                  placeholder="Ex: Vídeo viral mostrando alagamento em bairro central com críticas à resposta da prefeitura."
                />
              </label>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => void handleGenerateCrisisPlan()}
                  disabled={isGeneratingCrisisPlan}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-60"
                >
                  {isGeneratingCrisisPlan ? 'Gerando plano...' : 'Gerar Plano de Ação (IA)'}
                </button>

                <button
                  onClick={() => void handleSaveCrisisSimulation()}
                  disabled={isSavingCrisis}
                  className="px-5 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-all disabled:opacity-60"
                >
                  {isSavingCrisis ? 'Salvando...' : 'Registrar no Clipping'}
                </button>
              </div>

              {crisisPlan && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300 mb-3">🚨 Plano de Ação (24h)</p>
                    <ul className="space-y-2">
                      {crisisPlan.plano_acao_imediato.map((step, idx) => (
                        <li key={`${step}-${idx}`} className="text-sm text-slate-100 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-3">👥 Responsáveis</p>
                    <ul className="space-y-2">
                      {crisisPlan.responsaveis.map((name, idx) => (
                        <li key={`${name}-${idx}`} className="text-sm text-slate-100 flex items-start gap-2">
                          <Users className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                          <span>{name}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300 mb-3">📝 Rascunho da Nota Oficial</p>
                    <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed flex items-start gap-2">
                      <FileText className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                      <p>{crisisPlan.draft_nota_oficial}</p>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {isShowingSearchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShowingSearchResults(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[80vh] rounded-3xl border border-white/10 bg-slate-900/95 p-6 space-y-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="text-2xl font-black text-white">Resultados da Busca</h3>
                </div>
                <button
                  onClick={() => setIsShowingSearchResults(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Cloud className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">Nenhuma notícia encontrada com as palavras-chave fornecidas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((article, idx) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 space-y-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                              {article.fonte}
                            </span>
                            {article.pais && (
                              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {article.pais}
                              </span>
                            )}
                            <span className="text-xs font-medium text-slate-500">
                              {article.dataPublicacao}
                            </span>
                          </div>
                          <h4 className="text-lg font-black leading-snug text-white mb-2">
                            {article.titulo}
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {article.descricao}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-2 border-t border-white/10">
                        <button
                          onClick={() => void handleAddSearchResultToClipping(article)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-sm hover:bg-emerald-500 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar ao Clipping
                        </button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 font-bold text-sm hover:bg-slate-600/50 transition-all"
                        >
                          <Globe className="w-4 h-4" />
                          Ver Original
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
