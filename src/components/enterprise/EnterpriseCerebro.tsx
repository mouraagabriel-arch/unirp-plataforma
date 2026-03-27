import { useState } from 'react';
import { 
  BrainCircuit, Upload, Download, Trash2, 
  Settings, Palette, Plug, Plus, 
  Search, FileText, CheckCircle2, X,
  Globe, Mail, MessageSquare, Zap,
  Image as ImageIcon, Layout, Type,
  Link as LinkIcon, Shield, Cloud,
  Database, Share2, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function EnterpriseCerebro({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'white-label' | 'integrations'>('knowledge');

  return (
    <div className="space-y-12 pb-20 overflow-x-hidden min-h-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black tracking-tighter leading-none text-white"
          >
            Cérebro <span className="text-blue-500 underline decoration-blue-500/30 decoration-8 underline-offset-8">Institucional</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-bold mt-8 text-xl max-w-2xl leading-relaxed"
          >
            O núcleo de inteligência da organização. Configure a base de conhecimento, identidade visual e integrações estratégicas.
          </motion.p>
        </div>

        <div className="flex gap-4 p-2 glass-card border-white/5 rounded-[2rem]">
          {[
            { id: 'knowledge', label: 'Base de Dados', icon: Database },
            { id: 'white-label', label: 'Identidade', icon: Palette },
            { id: 'integrations', label: 'Conexões', icon: Share2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'knowledge' && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Drag and Drop Area */}
            <div className="p-20 glass-card border-dashed border-2 border-white/10 hover:border-blue-500/50 transition-all group flex flex-col items-center justify-center text-center cursor-pointer rounded-[4rem]">
              <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <Upload className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-white mb-4">Alimentar o Cérebro</h3>
              <p className="text-slate-500 font-bold max-w-md leading-relaxed">
                Arraste manuais, diretrizes, PDFs ou documentos oficiais para treinar a IA com o tom de voz da instituição.
              </p>
              <button className="mt-10 px-10 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-lg">
                Selecionar Arquivos
              </button>
            </div>

            {/* File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Manual_Identidade_2024.pdf', size: '12.4 MB', date: '2 horas atrás', type: 'PDF' },
                { name: 'Diretrizes_Comunicacao.docx', size: '2.1 MB', date: 'Ontem', type: 'DOC' },
                { name: 'Relatorio_Impacto_Q4.pdf', size: '45.8 MB', date: '3 dias atrás', type: 'PDF' },
              ].map((file, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 glass-card border-white/5 hover:border-blue-500/30 transition-all group rounded-[2.5rem]"
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-blue-500/10 transition-colors">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-white truncate tracking-tight">{file.name}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{file.size} • {file.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{file.date}</span>
                    <button className="p-3 glass-item text-rose-500 hover:bg-rose-500/10 border-white/5 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'white-label' && (
          <motion.div
            key="white-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <div className="p-12 glass-card border-white/5 space-y-10 rounded-[3rem]">
              <h3 className="text-3xl font-black tracking-tighter text-white">Identidade Visual</h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nome da Instituição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Prefeitura de São Paulo"
                    className="w-full px-8 py-5 glass-item border-white/5 focus:border-blue-500/50 outline-none text-white font-bold rounded-2xl transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cor Primária</label>
                    <div className="flex items-center gap-4 p-4 glass-item border-white/5 rounded-2xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg" />
                      <span className="text-sm font-mono text-white">#2563EB</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px) font-black text-slate-500 uppercase tracking-[0.2em]">Cor Secundária</label>
                    <div className="flex items-center gap-4 p-4 glass-item border-white/5 rounded-2xl">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl shadow-lg" />
                      <span className="text-sm font-mono text-white">#1E293B</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Logotipo Principal</label>
                  <div className="p-12 glass-item border-dashed border-2 border-white/5 hover:border-blue-500/30 transition-all rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-500 mb-4" />
                    <p className="text-xs font-bold text-slate-500">PNG, SVG ou EPS (Máx 5MB)</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl">
                Salvar Configurações
              </button>
            </div>

            <div className="p-12 glass-card border-white/5 flex flex-col rounded-[3rem]">
              <h3 className="text-3xl font-black tracking-tighter text-white mb-10">Preview em Tempo Real</h3>
              <div className="flex-1 glass-item border-white/5 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50" />
                <div className="relative p-12 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                    <Palette className="w-12 h-12 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight mb-4">Sua Marca Aqui</p>
                  <p className="text-slate-500 font-bold max-w-xs leading-relaxed">
                    Visualize como sua identidade visual será aplicada em todos os módulos do sistema.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'integrations' && (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {[
              { name: 'WhatsApp Business', desc: 'Envio de pautas e alertas diretos.', status: 'Conectado', icon: MessageSquare, color: 'emerald-500' },
              { name: 'Google Workspace', desc: 'Sincronização de documentos e agendas.', status: 'Pendente', icon: Share2, color: 'blue-500' },
              { name: 'Meta Ads', desc: 'Monitoramento de campanhas oficiais.', status: 'Desconectado', icon: Activity, color: 'indigo-500' },
              { name: 'Twitter / X API', desc: 'Tracking de menções em tempo real.', status: 'Conectado', icon: Globe, color: 'sky-500' },
              { name: 'Slack Institutional', desc: 'Alertas de crise para equipes internas.', status: 'Desconectado', icon: Zap, color: 'amber-500' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="p-10 glass-card border-white/5 hover:border-blue-500/30 transition-all group rounded-[3rem]"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className={cn("p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner")}>
                    <item.icon className={cn("w-8 h-8", `text-${item.color}`)} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase",
                    item.status === 'Conectado' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                    item.status === 'Pendente' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                    "bg-slate-500/20 text-slate-500 border border-slate-500/30"
                  )}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-white tracking-tight mb-4">{item.name}</h4>
                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10">{item.desc}</p>
                <button className={cn(
                  "w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all",
                  item.status === 'Conectado' ? "glass-item border-rose-500/30 text-rose-500 hover:bg-rose-500/10" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                )}>
                  {item.status === 'Conectado' ? 'Desconectar' : 'Configurar'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
