import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Activity,
  Database,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Palette,
  Plug,
  Share2,
  Slack,
  Upload,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

type CerebroTab = 'knowledge' | 'white-label' | 'integrations';
type IntegrationStatus = 'Conectado' | 'Desconectado' | 'Pendente';

interface IntegrationItem {
  name: string;
  desc: string;
  status: IntegrationStatus;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}

const BASE_FILES = [
  { name: 'Manual_Identidade_2024.pdf', size: '12.4 MB', date: '2 horas atrás', type: 'PDF' },
  { name: 'Diretrizes_Comunicacao.docx', size: '2.1 MB', date: 'Ontem', type: 'DOC' },
  { name: 'Relatorio_Impacto_Q4.pdf', size: '45.8 MB', date: '3 dias atrás', type: 'PDF' },
  { name: 'Guia_Atendimento_Imprensa.pdf', size: '7.2 MB', date: '4 dias atrás', type: 'PDF' },
];

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: 'WhatsApp Business',
    desc: 'Envio de pautas e alertas diretos.',
    status: 'Conectado',
    icon: MessageSquare,
    tone: 'text-emerald-300',
  },
  {
    name: 'Google Workspace',
    desc: 'Sincronização de documentos e agendas.',
    status: 'Pendente',
    icon: Share2,
    tone: 'text-cyan-300',
  },
  {
    name: 'Meta Ads',
    desc: 'Monitoramento de campanhas oficiais.',
    status: 'Desconectado',
    icon: Activity,
    tone: 'text-indigo-300',
  },
  {
    name: 'Twitter / X API',
    desc: 'Tracking de menções em tempo real.',
    status: 'Conectado',
    icon: Globe,
    tone: 'text-sky-300',
  },
  {
    name: 'Slack Institutional',
    desc: 'Alertas de crise para equipes internas.',
    status: 'Desconectado',
    icon: Slack,
    tone: 'text-amber-300',
  },
  {
    name: 'Domínio de E-mail Institucional (SMTP/CRM)',
    desc: 'Disparo institucional, retorno e rastreio no CRM.',
    status: 'Desconectado',
    icon: Mail,
    tone: 'text-violet-300',
  },
  {
    name: 'Diário Oficial Eletrônico (API)',
    desc: 'Captura automática de publicações oficiais.',
    status: 'Pendente',
    icon: FileText,
    tone: 'text-yellow-300',
  },
];

function getStatusClass(status: IntegrationStatus) {
  if (status === 'Conectado') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  }

  if (status === 'Pendente') {
    return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
  }

  return 'bg-slate-500/15 text-slate-300 border-slate-400/30';
}

export function EnterpriseCerebro({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [activeTab, setActiveTab] = useState<CerebroTab>('knowledge');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#1E293B');
  const [toneDirective, setToneDirective] = useState('Institucional, técnico e acolhedor.');

  useEffect(() => {
    tenantService
      .from('enterprise_cerebro_configuracao')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error('Erro ao carregar configuração do cérebro:', error); return; }
        if (data) {
          if (data.primary_color) setPrimaryColor(data.primary_color);
          if (data.secondary_color) setSecondaryColor(data.secondary_color);
          if (data.tone_directive) setToneDirective(data.tone_directive);
        }
      });
  }, []);

  const handleSaveConfig = async () => {
    const { error } = await tenantService
      .from('enterprise_cerebro_configuracao')
      .upsert(
        { primary_color: primaryColor, secondary_color: secondaryColor, tone_directive: toneDirective },
        { onConflict: 'ambiente' }
      );
    if (error) console.error('Erro ao salvar configuração do cérebro:', error);
  };

  const postPreview = useMemo(
    () => ({
      title: 'Comunicado Oficial • Saúde Pública',
      body: 'A gestão reforça o compromisso com transparência e eficiência. As novas ações ampliam o atendimento e reduzem o tempo de resposta.',
    }),
    []
  );

  return (
    <section className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-8 text-slate-100">
      <header className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Cérebro <span className="text-brand-accent">Institucional</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl">
            Núcleo estratégico da organização para base documental, identidade institucional e integrações de operação.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'knowledge', label: '🧠 Base de Dados', icon: Database },
            { id: 'white-label', label: '🎨 Identidade & Tom de Voz', icon: Palette },
            { id: 'integrations', label: '🔌 Conexões & Integrações', icon: Plug },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as CerebroTab)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition-all',
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
        {activeTab === 'knowledge' && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="p-10 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-brand-accent" />
                </div>
                <h3 className="text-lg font-black text-white">Arraste PDFs, Manuais e Diretrizes</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-lg">
                  Alimente o Cérebro Institucional com documentos oficiais para treinar resposta, contexto e consistência da IA.
                </p>
                <button className="mt-5 rounded-xl bg-brand-accent text-white px-5 py-2.5 text-sm font-black hover:bg-brand-accent/90 transition-colors">
                  Selecionar Arquivos
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                🔗 Importar Site Oficial / Portal da Transparência (URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <LinkIcon className="w-4 h-4 text-cyan-300" />
                  <input
                    type="url"
                    placeholder="https://portal.seuorgao.gov.br/transparencia"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                  />
                </div>
                <button className="rounded-xl bg-cyan-500/90 text-slate-950 px-6 py-3 text-sm font-black hover:bg-cyan-400 transition-colors">
                  Sincronizar
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Arquivos Vinculados</p>
              <div className="space-y-3">
                {BASE_FILES.map((file) => (
                  <article
                    key={file.name}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">
                          {file.type} • {file.size} • {file.date}
                        </p>
                      </div>
                    </div>
                    <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                      Ver
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'white-label' && (
          <motion.div
            key="white-label"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cores Institucionais</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="rounded-xl border border-white/10 bg-slate-950/50 p-3 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Primária</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        onBlur={handleSaveConfig}
                        className="w-8 h-8 rounded-md bg-transparent border-none p-0"
                      />
                      <span className="font-mono text-xs text-white">{primaryColor}</span>
                    </div>
                  </label>

                  <label className="rounded-xl border border-white/10 bg-slate-950/50 p-3 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Secundária</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(event) => setSecondaryColor(event.target.value)}
                        onBlur={handleSaveConfig}
                        className="w-8 h-8 rounded-md bg-transparent border-none p-0"
                      />
                      <span className="font-mono text-xs text-white">{secondaryColor}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Logotipo Institucional</p>
                <label className="w-full border-2 border-dashed border-white/20 rounded-2xl bg-slate-950/50 p-7 flex flex-col items-center text-center cursor-pointer hover:bg-white/5 transition-colors">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-sm font-black text-white">Upload do Logotipo</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, SVG ou EPS (máx. 5MB)</p>
                  <input type="file" className="hidden" accept="image/png,image/svg+xml,.eps" />
                </label>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Diretriz de Tom de Voz (Ex: Institucional, Técnico, Acolhedor)
              </label>
              <textarea
                value={toneDirective}
                onChange={(event) => setToneDirective(event.target.value)}
                onBlur={handleSaveConfig}
                className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/40"
                placeholder="Defina o padrão de linguagem institucional para respostas e publicações da IA."
              />
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Preview em Tempo Real</p>

              <article
                className="rounded-2xl border p-4 shadow-[0_0_30px_rgba(99,102,241,0.12)]"
                style={{
                  borderColor: `${primaryColor}66`,
                  background: `linear-gradient(135deg, ${secondaryColor}dd, #0f172acc)`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl border"
                    style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}99` }}
                  />
                  <div>
                    <p className="text-sm font-black text-white">Canal Oficial da Instituição</p>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black">Post institucional simulado</p>
                  </div>
                </div>

                <h4 className="text-base font-black text-white tracking-tight">{postPreview.title}</h4>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">{postPreview.body}</p>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Tom de voz aplicado</p>
                  <p className="text-xs text-slate-100">{toneDirective || 'Nenhuma diretriz definida.'}</p>
                </div>
              </article>
            </div>
          </motion.div>
        )}

        {activeTab === 'integrations' && (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Matriz de Conexões</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATIONS.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-950/70 flex items-center justify-center shrink-0">
                        <Icon className={cn('w-5 h-5', item.tone)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white leading-tight">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest',
                        getStatusClass(item.status)
                      )}
                    >
                      {item.status}
                    </span>
                  </article>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
