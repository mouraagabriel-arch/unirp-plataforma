import { useEffect, useState } from 'react';
import {
  Copy,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Monitor,
  Settings2,
  UploadCloud,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

export function EnterpriseSalaImprensa({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [activeTab, setActiveTab] = useState<'press-kits' | 'releases' | 'config'>('press-kits');
  const [publicFolders, setPublicFolders] = useState<Record<string, boolean>>({
    logos: true,
    fotos: true,
    videos: false,
    manuais: true,
    estatisticas: false,
    institucional: true,
  });

  const pressKitItems = [
    { id: 'logos', title: 'Logotipos Oficiais', files: '12 arquivos', icon: ImageIcon, tone: 'text-cyan-300' },
    { id: 'fotos', title: 'Fotos da Gestão', files: '45 arquivos', icon: ImageIcon, tone: 'text-emerald-300' },
    { id: 'videos', title: 'Vídeos Institucionais', files: '8 arquivos', icon: Video, tone: 'text-violet-300' },
    { id: 'manuais', title: 'Manuais de Marca', files: '3 arquivos', icon: FileText, tone: 'text-amber-300' },
    { id: 'estatisticas', title: 'Relatórios e Dados', files: '9 arquivos', icon: Monitor, tone: 'text-rose-300' },
    { id: 'institucional', title: 'Banco Institucional', files: '28 arquivos', icon: FolderOpen, tone: 'text-indigo-300' },
  ];

  const releaseItems = [
    { id: 'rel-1', title: 'Novo Hospital Municipal abre as portas amanhã', date: '25 Mar 2026', sector: 'Saúde' },
    { id: 'rel-2', title: 'Prefeitura anuncia pacote de mobilidade urbana', date: '24 Mar 2026', sector: 'Obras' },
    { id: 'rel-3', title: 'Programa de inovação no serviço público é lançado', date: '22 Mar 2026', sector: 'Administração' },
  ];

  useEffect(() => {
    tenantService
      .from('enterprise_sala_configuracao')
      .select('*')
      .then(({ data, error }) => {
        if (error) { console.error('Erro ao carregar configuração da sala:', error); return; }
        if (data && data.length > 0) {
          const config: Record<string, boolean> = {};
          data.forEach(row => { config[row.pasta_id] = row.visivel; });
          setPublicFolders(prev => ({ ...prev, ...config }));
        }
      });
  }, []);

  const toggleFolderVisibility = (folderId: string) => {
    setPublicFolders((prev) => {
      const newValue = !prev[folderId];
      tenantService
        .from('enterprise_sala_configuracao')
        .upsert(
          { pasta_id: folderId, visivel: newValue },
          { onConflict: 'pasta_id,ambiente' }
        )
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar visibilidade da pasta:', error);
        });
      return { ...prev, [folderId]: newValue };
    });
  };

  return (
    <section className={cn('flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100', isDarkMode ? 'text-slate-100' : 'text-slate-100')}>
      <div className="rounded-3xl border border-indigo-500/30 bg-indigo-900/30 backdrop-blur-xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_36%)] pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200">URL Pública Ativa</p>
            <h1 className="text-3xl font-black text-white mt-2">Construtor da Sala de Imprensa</h1>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-300/30 bg-white/10 text-indigo-100 font-bold">
              <Link2 className="w-4 h-4" />
              imprensa.instituicao.gov.br
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold hover:bg-white/15 transition-all">
              <Copy className="w-4 h-4" />
              🔗 Copiar Link
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-indigo-300/30 bg-indigo-500/20 text-indigo-100 font-bold hover:bg-indigo-500/25 transition-all">
              <Eye className="w-4 h-4" />
              👁️ Ver Portal Público
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
        {[
          { id: 'press-kits', label: '📁 Press Kits & Arquivos' },
          { id: 'releases', label: '📰 Releases Publicados' },
          { id: 'config', label: '🎨 Configurar Portal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'press-kits' | 'releases' | 'config')}
            className={cn(
              'px-5 py-3 rounded-xl font-bold transition-all',
              activeTab === tab.id
                ? 'bg-brand-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'press-kits' && (
          <motion.div
            key="press-kits"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pressKitItems.map((kit) => {
              const Icon = kit.icon;
              const isVisible = publicFolders[kit.id];

              return (
                <article key={kit.id} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Icon className={cn('w-5 h-5', kit.tone)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Visível ao Público</span>
                      <button
                        type="button"
                        onClick={() => toggleFolderVisibility(kit.id)}
                        className={cn(
                          'w-12 h-7 rounded-full p-1 transition-all border',
                          isVisible ? 'bg-emerald-500/80 border-emerald-300/40' : 'bg-slate-700/80 border-white/10'
                        )}
                      >
                        <span className={cn('block w-5 h-5 rounded-full bg-white transition-all', isVisible ? 'translate-x-5' : 'translate-x-0')} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white">{kit.title}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2">{kit.files}</p>

                  <button className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
                    <UploadCloud className="w-4 h-4" />
                    + Fazer Upload
                  </button>
                </article>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'releases' && (
          <motion.div
            key="releases"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6"
          >
            <div className="space-y-3">
              {releaseItems.map((release) => (
                <article key={release.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{release.sector}</p>
                    <h3 className="text-lg font-black text-white mt-1">{release.title}</h3>
                    <p className="text-xs text-slate-400 mt-2">Publicado em {release.date}</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:text-rose-200 hover:bg-rose-500/15 hover:border-rose-400/30 transition-all">
                    Despublicar
                  </button>
                </article>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nome da Sala de Imprensa</span>
                  <input
                    type="text"
                    defaultValue="Sala de Imprensa Oficial - Prefeitura Municipal"
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">E-mail de Contato para Jornalistas</span>
                  <input
                    type="email"
                    defaultValue="imprensa@instituicao.gov.br"
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none"
                  />
                </label>

                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 min-h-[170px]">
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-6 h-6 text-brand-accent" />
                    <h4 className="text-base font-black text-white mt-3">Banner do Portal</h4>
                    <p className="text-xs text-slate-400 mt-2">Área de upload para arte principal da página pública.</p>
                    <button className="mt-4 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-slate-100 hover:bg-white/10 transition-all">
                      Enviar Banner
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings2 className="w-4 h-4 text-indigo-300" />
                  <p className="text-sm font-black text-white">Pré-visualização da Configuração</p>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>Portal público com vitrine de releases, arquivos e canal direto com assessoria.</p>
                  <p>As alterações desta aba controlam apenas o que o jornalista visualiza externamente.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
