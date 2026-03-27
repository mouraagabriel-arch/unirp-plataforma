import { useState } from 'react';
import { 
  MessageSquare, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Users, Activity, TrendingUp, 
  CheckCircle2, AlertCircle, Clock,
  BarChart3, PieChart, Send, User,
  ChevronRight, ArrowRight, MoreVertical
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const CLIMATE_DATA = [
  { name: 'Satisfeito', value: 65, color: '#10b981' },
  { name: 'Neutro', value: 25, color: '#f59e0b' },
  { name: 'Insatisfeito', value: 10, color: '#ef4444' },
];

const SATISFACTION_BY_DEPT = [
  { dept: 'Saúde', score: 85 },
  { dept: 'Educação', score: 78 },
  { dept: 'Obras', score: 62 },
  { dept: 'Segurança', score: 92 },
  { dept: 'Cultura', score: 88 },
];

export function EnterpriseComunicacao({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'mural' | 'clima'>('mural');
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Comunicação <span className="text-blue-600">Interna</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de clima e engajamento dos servidores.</p>
        </div>
        
        <div className="flex gap-2 p-2 bg-slate-100 rounded-3xl w-fit">
          {[
            { id: 'mural', label: 'Mural de Recados', icon: MessageSquare },
            { id: 'clima', label: 'Clima Organizacional', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mural' && (
          <motion.div 
            key="mural"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">Mural Interativo</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" />
                Novo Aviso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: '1', title: 'Novo Protocolo de Atendimento', author: 'RH Central', date: 'Hoje, 09:00', target: 'Todos os Servidores', content: 'A partir de segunda-feira, todos os atendimentos devem seguir o novo manual disponível no Cérebro Institucional.' },
                { id: '2', title: 'Manutenção no Sistema de Folha', author: 'TI Institucional', date: 'Ontem, 16:30', target: 'Secretaria de Fazenda', content: 'O sistema ficará instável entre 20h e 22h para atualizações de segurança.' },
                { id: '3', title: 'Campanha de Vacinação Interna', author: 'Saúde Ocupacional', date: '24 Mar, 10:00', target: 'Todos os Servidores', content: 'Iniciaremos a vacinação contra gripe para todos os colaboradores na próxima semana.' },
              ].map((item) => (
                <div key={item.id} className={cn(
                  "p-10 rounded-[3rem] shadow-xl border transition-all hover:shadow-2xl group",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black">{item.author}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                      </div>
                    </div>
                    <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {item.target}
                    </span>
                    <h3 className="text-2xl font-black leading-tight">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{item.content}</p>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                      Editar
                    </button>
                    <button className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'clima' && (
          <motion.div 
            key="clima"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Climate Overview */}
              <div className={cn(
                "p-10 rounded-[3rem] shadow-xl border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}>
                <h3 className="text-2xl font-black mb-8">Clima Organizacional</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePie>
                      <Pie
                        data={CLIMATE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {CLIMATE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RePie>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-sm font-bold text-emerald-900 leading-relaxed">
                    <span className="font-black">Status:</span> A satisfação média subiu 8% após o anúncio do novo plano de carreira.
                  </p>
                </div>
              </div>

              {/* Satisfaction by Dept */}
              <div className={cn(
                "lg:col-span-2 p-10 rounded-[3rem] shadow-xl border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}>
                <h3 className="text-2xl font-black mb-8">Satisfação por Secretaria</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SATISFACTION_BY_DEPT}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Survey Responses */}
            <div className={cn(
              "p-10 rounded-[3rem] shadow-xl border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <h3 className="text-2xl font-black mb-8">Feedbacks Recentes (Anônimos)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { text: 'O novo sistema de chamados facilitou muito o dia a dia.', sentiment: 'positivo' },
                  { text: 'Precisamos de mais treinamentos sobre as novas ferramentas.', sentiment: 'neutro' },
                  { text: 'A iluminação do bloco B está precária há semanas.', sentiment: 'negativo' },
                ].map((feedback, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                    <div className={cn(
                      "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                      feedback.sentiment === 'positivo' ? "bg-emerald-500 text-white" : 
                      feedback.sentiment === 'negativo' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {feedback.sentiment === 'positivo' ? <CheckCircle2 className="w-4 h-4" /> : 
                       feedback.sentiment === 'negativo' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{feedback.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Notice Modal Placeholder */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-2xl p-12 rounded-[3rem] shadow-2xl relative",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
              
              <h2 className="text-4xl font-black mb-10">Novo Aviso</h2>
              
              <div className="space-y-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título do Aviso</label>
                  <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="Ex: Manutenção Programada..." />
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Público-Alvo</label>
                  <select className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-600 border-none outline-none appearance-none">
                    <option>Todos os Servidores</option>
                    <option>Secretaria de Saúde</option>
                    <option>Secretaria de Educação</option>
                    <option>Secretaria de Obras</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mensagem</label>
                  <textarea className="w-full h-32 px-8 py-6 bg-slate-50 rounded-2xl font-medium border-none outline-none resize-none" placeholder="Digite sua mensagem aqui..." />
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" />
                  Publicar Aviso
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
