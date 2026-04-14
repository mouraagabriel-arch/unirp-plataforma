import { useState } from 'react';
import { 
  BrainCircuit, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Sparkles, Loader2, Upload, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface KnowledgeItem {
  id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  data_criacao: string;
  status: 'rascunho' | 'publicado';
}

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'KNB-001',
    titulo: 'Diretrizes de Comunicação 2024',
    categoria: 'Estratégia',
    conteudo: 'Focar em transparência e agilidade no atendimento ao cidadão.',
    data_criacao: '2024-01-15',
    status: 'publicado'
  },
  {
    id: 'KNB-002',
    titulo: 'Manual de Crise - Enchentes',
    categoria: 'Gestão de Crise',
    conteudo: 'Protocolos de evacuação e canais de comunicação de emergência.',
    data_criacao: '2024-02-10',
    status: 'rascunho'
  }
];

export function BrainModule({ isDarkMode, label }: { isDarkMode: boolean, label: string }) {
  const [items, setItems] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">
            {label.split(' ')[0]} <span className="text-brand-accent">{label.split(' ')[1]}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Base de conhecimento e inteligência estratégica centralizada.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            layout
            className={cn(
              "p-8 rounded-[2.5rem] shadow-xl border transition-all",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-2xl flex items-center justify-center shrink-0">
                <BrainCircuit className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    item.status === 'publicado' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {item.id} • {item.categoria}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black">{item.titulo}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.conteudo}</p>
                
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-brand-accent font-bold text-xs uppercase tracking-widest transition-all">
                    <Upload className="w-4 h-4" />
                    Anexar Arquivo
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-brand-accent font-bold text-xs uppercase tracking-widest transition-all">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-slate-100">
                <button 
                  onClick={() => setIsEditing(item.id)}
                  className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-brand-accent rounded-2xl transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
