import { useEffect, useState } from 'react';
import { Loader2, Heart, MessageCircle, Share2, Globe, Filter, TrendingUp, Radio, Eye, Newspaper, AlertTriangle, X, Download, FileText, Sparkles, MapPin, ShieldAlert, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import { buscarMencoesRedes, redesDisponiveis, type SocialPost, type RedeDisponivel } from '../../lib/socialMockApi';

interface MonitoringConfig {
  focais: string[];
  contexto: string[];
}

function getSocialIcon(rede: string) {
  switch (rede) {
    case 'instagram': return '📷';
    case 'twitter':   return '𝕏';
    case 'linkedin':  return '💼';
    case 'youtube':   return '▶️';
    case 'facebook':  return '📘';
    case 'google':    return '🔍';
    case 'tiktok':    return '🎵';
    default:          return '📱';
  }
}

function getSocialLabel(rede: string): string {
  const labels: Record<string, string> = {
    instagram: 'Instagram',
    twitter: 'X/Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    facebook: 'Facebook',
    google: 'Google News',
    tiktok: 'TikTok',
  };
  return labels[rede] ?? rede.toUpperCase();
}

function getSocialColor(rede: string): string {
  switch (rede) {
    case 'instagram': return 'from-pink-600 to-purple-600';
    case 'twitter':   return 'from-slate-600 to-slate-500';
    case 'linkedin':  return 'from-blue-700 to-blue-500';
    case 'youtube':   return 'from-red-600 to-red-500';
    case 'facebook':  return 'from-blue-800 to-blue-600';
    case 'google':    return 'from-amber-500 to-red-500';
    case 'tiktok':    return 'from-cyan-400 to-black';
    default:          return 'from-slate-600 to-slate-500';
  }
}

function getSocialBgAccent(rede: string): string {
  switch (rede) {
    case 'instagram': return 'border-pink-500/30 bg-pink-500/10';
    case 'twitter':   return 'border-slate-400/30 bg-slate-400/10';
    case 'linkedin':  return 'border-blue-500/30 bg-blue-500/10';
    case 'youtube':   return 'border-red-500/30 bg-red-500/10';
    case 'facebook':  return 'border-blue-700/40 bg-blue-700/15';
    case 'google':    return 'border-amber-400/30 bg-amber-400/10';
    case 'tiktok':    return 'border-cyan-400/30 bg-cyan-400/10';
    default:          return 'border-slate-500/30 bg-slate-500/10';
  }
}

function getSentimentColor(sentimento?: string): string {
  switch (sentimento) {
    case 'positivo':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
    case 'negativo':
      return 'bg-red-500/20 text-red-300 border-red-400/30';
    default:
      return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  }
}

function getRiscoStyle(risco?: string): { badge: string; label: string } {
  switch (risco) {
    case 'alto':  return { badge: 'border-red-400/40 bg-red-400/15 text-red-300',       label: '🔴 Alto' };
    case 'medio': return { badge: 'border-amber-400/40 bg-amber-400/15 text-amber-300', label: '🟡 Médio' };
    default:      return { badge: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300', label: '🟢 Baixo' };
  }
}

export function EnterpriseSocial({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfig>({ focais: [], contexto: [] });
  const [redesFiltro, setRedesFiltro] = useState<RedeDisponivel[]>([
    'instagram',
    'twitter',
    'linkedin',
    'youtube',
    'facebook',
    'google',
    'tiktok',
  ]);
  const [statusMsg, setStatusMsg] = useState('');
  const [filtroRisco, setFiltroRisco] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos');
  const [filtroGeo, setFiltroGeo] = useState('Todos');
  const [filtroTag, setFiltroTag] = useState('');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Carrega configuração de monitoramento na montagem
  useEffect(() => {
    const load = async () => {
      const response = await tenantService.getClippingMonitoringConfig();
      if (!response.error && response.data) {
        setMonitoringConfig(response.data);
      }
    };
    void load();
  }, []);

  const handleBuscarMencoes = async () => {
    if (monitoringConfig.focais.length === 0) {
      alert('Configure palavras-chave focais para buscar menções em redes sociais.');
      return;
    }

    setLoading(true);
    setStatusMsg('Buscando menções em redes sociais...');
    try {
      const resultado = await buscarMencoesRedes(monitoringConfig.focais, redesFiltro);
      setPosts(resultado);
      setAlertDismissed(false);
      setStatusMsg('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[EnterpriseSocial] Erro ao buscar menções:', error);
      alert(`Erro ao buscar menções:\n${msg}`);
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  };

  const toggleRede = (rede: typeof redesFiltro[0]) => {
    setRedesFiltro(prev =>
      prev.includes(rede) ? prev.filter(r => r !== rede) : [...prev, rede]
    );
  };

  const distribuicaoRedes = redesFiltro.map(rede => ({
    rede,
    quantidade: posts.filter(p => p.rede === rede).length,
  }));

  const sentimentoDistribuicao = {
    positivo: posts.filter(p => p.sentimento === 'positivo').length,
    neutro: posts.filter(p => p.sentimento === 'neutro').length,
    negativo: posts.filter(p => p.sentimento === 'negativo').length,
  };

  const engajamentoTotal = posts.reduce(
    (acc, post) => ({
      curtidas: acc.curtidas + post.engajamento.curtidas,
      comentarios: acc.comentarios + post.engajamento.comentarios,
      compartilhamentos: acc.compartilhamentos + post.engajamento.compartilhamentos,
    }),
    { curtidas: 0, comentarios: 0, compartilhamentos: 0 }
  );

  const postsFiltered = posts
    .filter(p => filtroRisco === 'todos' || p.risco === filtroRisco)
    .filter(p => filtroGeo === 'Todos' || p.geolocalizacao?.cidade === filtroGeo)
    .filter(p => !filtroTag || p.tags_ia?.includes(filtroTag));

  const topicosRanking = Object.entries(
    posts.reduce<Record<string, number>>((acc, p) => {
      const t = p.topico ?? 'Outros';
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([topico, count]) => ({ topico, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topicosMax = topicosRanking[0]?.count ?? 1;

  const geoOptions = [
    'Todos',
    ...Array.from(
      new Set(posts.map(p => p.geolocalizacao?.cidade).filter((c): c is string => !!c))
    ).sort(),
  ];

  // Word Cloud: contagem de tags_ia em todos os posts
  const wordCloud = Object.entries(
    posts.reduce<Record<string, number>>((acc, p) => {
      (p.tags_ia ?? []).forEach(t => { acc[t] = (acc[t] ?? 0) + 1; });
      return acc;
    }, {})
  )
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);

  const wordCloudMax = wordCloud[0]?.count ?? 1;

  const WORD_COLORS = [
    'text-cyan-300', 'text-violet-300', 'text-pink-300', 'text-emerald-300',
    'text-amber-300', 'text-blue-300', 'text-red-300', 'text-teal-300',
  ];

  const alertaNegCount = posts.filter(p => p.sentimento === 'negativo').length;
  const alertaPercent = posts.length > 0 ? Math.round((alertaNegCount / posts.length) * 100) : 0;
  const alertaTema = topicosRanking.find(t =>
    posts.some(p => p.topico === t.topico && p.sentimento === 'negativo')
  )?.topico ?? 'Comunicação Institucional';

  const dispararExportacao = (tipo: string) => {
    setToastMsg(`⏳ Gerando ${tipo}...`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <section className="w-full max-w-7xl mx-auto py-8 text-slate-100 space-y-6">
      {statusMsg && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Social <span className="text-cyan-400">Listening</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">Monitoramento automático de menções em redes sociais</p>
        </div>
        {/* Ações de exportação */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => dispararExportacao('PDF')}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
          <button
            onClick={() => dispararExportacao('Excel')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Excel
          </button>
          <button
            onClick={() => dispararExportacao('Relatório de IA')}
            className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-300 hover:bg-violet-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Relatório IA
          </button>
        </div>
      </div>

      {/* ALERTAS & ANOMALIAS */}
      <AnimatePresence>
        {posts.length > 0 && !alertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'rounded-2xl border p-4 flex items-start gap-4',
              alertaPercent >= 35
                ? 'border-red-500/40 bg-red-500/10'
                : 'border-amber-500/40 bg-amber-500/10'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              alertaPercent >= 35 ? 'bg-red-500/20' : 'bg-amber-500/20'
            )}>
              <AlertTriangle className={cn('w-5 h-5', alertaPercent >= 35 ? 'text-red-400' : 'text-amber-400')} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-xs font-black uppercase tracking-widest mb-1',
                alertaPercent >= 35 ? 'text-red-400' : 'text-amber-400'
              )}>
                {alertaPercent >= 35 ? '🚨 Alerta Crítico' : '⚠️ Anomalia Detectada'}
              </p>
              <p className="text-sm font-semibold text-white leading-snug">
                Pico de{' '}
                <span className={alertaPercent >= 35 ? 'text-red-300 font-black' : 'text-amber-300 font-black'}>
                  {alertaPercent}% de menções negativas
                </span>{' '}
                detectado nas últimas 2 horas.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tema principal em destaque:{' '}
                <span className="font-black text-slate-200">{alertaTema}</span>
                {' '}— {alertaNegCount} posts negativos de {posts.length} total.
              </p>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTROS DE REDES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Filter className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecione Redes Sociais</p>
            <p className="text-sm font-semibold text-slate-300">Escolha quais redes deseja monitorar</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {redesDisponiveis.map(rede => (
            <motion.button
              key={rede}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleRede(rede)}
              className={cn(
                'px-4 py-3 rounded-xl font-black text-sm transition-all border flex items-center gap-2',
                redesFiltro.includes(rede)
                  ? `bg-gradient-to-r ${getSocialColor(rede)} text-white border-transparent shadow-lg`
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
              )}
            >
              <span>{getSocialIcon(rede)}</span>
              <span className="truncate">{getSocialLabel(rede)}</span>
            </motion.button>
          ))}
        </div>

        {/* Filtros estratégicos avançados */}
        <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              <MapPin className="w-3.5 h-3.5" /> Geolocalização
            </label>
            <select
              value={filtroGeo}
              onChange={e => setFiltroGeo(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {geoOptions.map(g => {
                const post = posts.find(p => p.geolocalizacao?.cidade === g);
                const estado = post?.geolocalizacao?.estado ?? '';
                return (
                  <option key={g} value={g}>
                    {g === 'Todos' ? 'Todas as cidades' : `${g}${estado ? ` — ${estado}` : ''}`}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Grau de Risco
            </label>
            <select
              value={filtroRisco}
              onChange={e => setFiltroRisco(e.target.value as typeof filtroRisco)}
              className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="todos">Todos os níveis</option>
              <option value="alto">🔴 Alto</option>
              <option value="medio">🟡 Médio</option>
              <option value="baixo">🟢 Baixo</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => void handleBuscarMencoes()}
          disabled={loading || redesFiltro.length === 0}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 font-black text-sm hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando menções...
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              Buscar Menções em Redes
            </>
          )}
        </button>
      </motion.div>

      {/* DASHBOARD DE MÉTRICAS */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Card Distribuição por Rede */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Posts por Rede</p>
            <div className="space-y-2">
              {distribuicaoRedes.map(item => (
                <div key={item.rede} className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-300">
                    {getSocialIcon(item.rede)} {getSocialLabel(item.rede)}
                  </span>
                  <span className="text-lg font-black text-cyan-400">{item.quantidade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Sentimento */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribuição de Sentimento</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-300">Positivos</span>
                <span className="text-lg font-black text-emerald-400">{sentimentoDistribuicao.positivo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-amber-300">Neutros</span>
                <span className="text-lg font-black text-amber-400">{sentimentoDistribuicao.neutro}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-red-300">Negativos</span>
                <span className="text-lg font-black text-red-400">{sentimentoDistribuicao.negativo}</span>
              </div>
            </div>
          </div>

          {/* Card Engajamento */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Engajamento Total</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-red-300 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Curtidas
                </span>
                <span className="text-lg font-black text-red-400">{engajamentoTotal.curtidas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Comentários
                </span>
                <span className="text-lg font-black text-blue-400">{engajamentoTotal.comentarios}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Compartilhamentos
                </span>
                <span className="text-lg font-black text-purple-400">{engajamentoTotal.compartilhamentos}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* NUVEM DE PALAVRAS (WORD CLOUD) */}
      {wordCloud.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nuvem de Palavras — IA</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {filtroTag ? (
                    <span>Filtrando por <span className="text-cyan-300 font-bold">{filtroTag}</span> — <button onClick={() => setFiltroTag('')} className="underline hover:text-slate-300">limpar</button></span>
                  ) : 'Clique em um termo para filtrar a timeline'}
                </p>
              </div>
            </div>
            {filtroTag && (
              <button
                onClick={() => setFiltroTag('')}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-600 rounded-lg px-2 py-1 transition-colors"
              >
                <X className="w-3 h-3" /> Limpar filtro
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center py-2">
            {wordCloud.map((item, idx) => {
              const sizeRatio = item.count / wordCloudMax;
              // px de fonte: 11px (mínimo) até 28px (máximo)
              const fontSize = Math.round(11 + sizeRatio * 17);
              const color = WORD_COLORS[idx % WORD_COLORS.length];
              const isActive = filtroTag === item.word;
              return (
                <motion.button
                  key={item.word}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltroTag(prev => prev === item.word ? '' : item.word)}
                  style={{ fontSize: `${fontSize}px` }}
                  className={cn(
                    'font-black rounded-lg px-2.5 py-1 transition-all border',
                    isActive
                      ? 'border-cyan-400/60 bg-cyan-400/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : `border-transparent bg-slate-800/60 hover:bg-slate-700/60 ${color}`
                  )}
                  title={`${item.count} menções`}
                >
                  {item.word}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ANÁLISE DE TÓPICOS */}
      {topicosRanking.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Principais Temas Mencionados</p>
          </div>
          <div className="space-y-2.5">
            {topicosRanking.map(item => (
              <div key={item.topico} className="flex items-center gap-3">
                <span className="w-48 shrink-0 text-xs font-semibold text-slate-300 truncate">{item.topico}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-700/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((item.count / topicosMax) * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  />
                </div>
                <span className="w-6 text-right text-xs font-black text-cyan-400">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FEED DE POSTS */}
      <div className="space-y-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Timeline de Menções ({postsFiltered.length} posts
          {(filtroRisco !== 'todos' || filtroGeo !== 'Todos' || filtroTag) && (
            <span className="text-cyan-400"> — filtrado</span>
          )})
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Clique em "Buscar Menções em Redes" para visualizar posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {postsFiltered.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4',
                    'hover:border-white/20 transition-all'
                  )}
                >
                  {/* Header do Post */}
                  <div className="flex items-start gap-4">
                    <a
                      href={post.url_perfil ?? post.url_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={post.foto_perfil}
                        alt={post.autor}
                        className="w-12 h-12 rounded-full object-cover border border-white/10 hover:border-cyan-400/60 transition-colors"
                      />
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={post.url_perfil ?? post.url_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-black text-white hover:text-cyan-300 transition-colors"
                        >
                          {post.autor}
                        </a>
                        <span className="text-sm text-slate-400 font-semibold">{post.handle}</span>
                        <a
                          href={post.url_post ?? post.url_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-black tracking-wider border transition-opacity hover:opacity-80',
                            getSocialBgAccent(post.rede)
                          )}
                        >
                          {getSocialIcon(post.rede)} {getSocialLabel(post.rede)}
                        </a>
                        {post.sentimento && (
                          <span className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                            getSentimentColor(post.sentimento)
                          )}>
                            {post.sentimento === 'positivo' ? '👍 Positivo' :
                             post.sentimento === 'negativo' ? '👎 Negativo' : '➖ Neutro'}
                          </span>
                        )}
                        {post.risco && (() => {
                          const r = getRiscoStyle(post.risco);
                          return (
                            <span className={cn('px-2 py-1 rounded-full text-[10px] font-black tracking-wider border', r.badge)}>
                              {r.label}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <a
                          href={post.url_post ?? post.url_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 font-medium hover:text-slate-300 transition-colors"
                        >
                          {new Date(post.data).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </a>
                        {post.geolocalizacao && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            📍 {post.geolocalizacao.bairro_inferido}, {post.geolocalizacao.cidade}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={post.url_post ?? post.url_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Ver post original"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Título de matéria (Google) */}
                  {post.titulo_materia && (
                    <a
                      href={post.url_post ?? post.url_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-black text-white flex items-center gap-2 hover:text-cyan-300 transition-colors"
                    >
                      <Newspaper className="w-4 h-4 text-amber-400 shrink-0" />
                      {post.titulo_materia}
                    </a>
                  )}

                  {/* Conteúdo */}
                  <p className="text-sm text-slate-300 leading-relaxed">{post.conteudo}</p>

                  {/* Tags IA */}
                  {post.tags_ia && post.tags_ia.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags_ia.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFiltroTag(prev => prev === tag ? '' : tag)}
                          className={cn(
                            'text-[10px] font-black rounded-full px-2 py-0.5 transition-all border',
                            filtroTag === tag
                              ? 'border-cyan-400/60 bg-cyan-400/20 text-cyan-200'
                              : 'border-slate-600/60 bg-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          )}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Engajamento */}
                  <div className="flex flex-wrap gap-5 pt-2 border-t border-white/10 text-xs text-slate-400">
                    {post.visualizacoes !== undefined && (
                      <div className="flex items-center gap-1.5 font-semibold hover:text-cyan-400 transition-colors cursor-pointer">
                        <Eye className="w-4 h-4" />
                        {post.visualizacoes.toLocaleString('pt-BR')} views
                      </div>
                    )}
                    {post.rede !== 'google' && (
                      <div className="flex items-center gap-1.5 font-semibold hover:text-red-400 transition-colors cursor-pointer">
                        <Heart className="w-4 h-4" />
                        {post.engajamento.curtidas.toLocaleString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-semibold hover:text-blue-400 transition-colors cursor-pointer">
                      <MessageCircle className="w-4 h-4" />
                      {post.engajamento.comentarios.toLocaleString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold hover:text-purple-400 transition-colors cursor-pointer">
                      <Share2 className="w-4 h-4" />
                      {post.engajamento.compartilhamentos.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {/* Toast de exportação */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-white/10 bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-2xl whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
