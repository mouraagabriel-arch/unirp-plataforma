import { useState } from 'react';
import { 
  Globe, Download, Image as ImageIcon, 
  FileText, Video, Share2, 
  Search, Filter, Plus, 
  CheckCircle2, X, Eye, 
  Lock, Unlock, Settings,
  ChevronRight, ArrowRight, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function EnterpriseSalaImprensa({ isDarkMode }: { isDarkMode: boolean }) {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Sala de <span className="text-blue-600">Imprensa</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Portal público para jornalistas e veículos.</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-[2rem]">
          <div className="flex items-center gap-3 px-4">
            {isPublic ? <Unlock className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-rose-600" />}
            <span className="text-sm font-black uppercase tracking-widest text-slate-600">
              Acesso {isPublic ? 'Público' : 'Privado'}
            </span>
          </div>
          <div 
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              "w-14 h-8 rounded-full p-1 transition-all cursor-pointer relative",
              isPublic ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <div className={cn(
              "w-6 h-6 bg-white rounded-full transition-all shadow-sm",
              isPublic ? "translate-x-6" : "translate-x-0"
            )} />
          </div>
        </div>
      </div>

      {/* Public View Simulator */}
      <div className={cn(
        "p-12 rounded-[4rem] shadow-2xl border relative overflow-hidden",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      )}>
        {/* Browser Header Mockup */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-50 border-b border-slate-100 flex items-center px-8 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 max-w-md mx-auto h-7 bg-white rounded-lg border border-slate-200 flex items-center px-4 gap-2">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-400">imprensa.prefeitura.gov.br</span>
          </div>
        </div>

        <div className="mt-12 pt-12 space-y-12">
          {/* Public Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl">
                P
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter">Sala de Imprensa Oficial</h2>
                <p className="text-slate-500 font-medium">Prefeitura Municipal de Exemplo</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-3">
                <Share2 className="w-5 h-5" />
                Compartilhar Portal
              </button>
            </div>
          </div>

          {/* Press Kits Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">Press Kits & Ativos</h3>
              <div className="flex gap-4">
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Logotipos Oficiais', items: '12 arquivos', icon: ImageIcon, color: 'blue' },
                { title: 'Fotos da Gestão', items: '45 arquivos', icon: ImageIcon, color: 'emerald' },
                { title: 'Vídeos Institucionais', items: '8 arquivos', icon: Video, color: 'indigo' },
                { title: 'Releases Recentes', items: '24 arquivos', icon: FileText, color: 'amber' },
                { title: 'Contatos de Assessoria', items: '1 arquivo', icon: Globe, color: 'rose' },
                { title: 'Manuais de Marca', items: '3 arquivos', icon: FileText, color: 'slate' },
              ].map((kit, i) => (
                <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                  <div className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform",
                    `bg-${kit.color}-50 text-${kit.color}-600`
                  )}>
                    <kit.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black mb-1">{kit.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{kit.items}</p>
                  <button className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                    <Download className="w-4 h-4" />
                    Baixar Kit Completo
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Releases Preview */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black">Últimos Releases</h3>
            <div className="space-y-4">
              {[
                { title: 'Novo Hospital Municipal abre as portas amanhã', date: '25 Mar, 2024' },
                { title: 'Prefeitura anuncia redução de 20% no IPTU', date: '24 Mar, 2024' },
                { title: 'Obras de saneamento no bairro Sul avançam', date: '22 Mar, 2024' },
              ].map((release, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg">{release.title}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{release.date}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
