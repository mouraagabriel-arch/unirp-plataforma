import { useState } from 'react';
import { 
  Users, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Mail, Phone, MapPin, Globe,
  Download, Upload, Filter, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Contact {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'cidadao' | 'imprensa' | 'influenciador';
  localizacao: string;
  tags: string[];
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'CRM-001',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 99999-9999',
    tipo: 'cidadao',
    localizacao: 'Bairro Jardim das Flores',
    tags: ['Liderança Comunitária', 'Saúde']
  },
  {
    id: 'CRM-002',
    nome: 'Ricardo Santos',
    email: 'ricardo@portal.com',
    telefone: '(11) 88888-8888',
    tipo: 'imprensa',
    localizacao: 'Centro',
    tags: ['Jornalista', 'Política']
  }
];

export function CRMModule({ isDarkMode, label }: { isDarkMode: boolean, label: string }) {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">
            {label.split(' ')[0]} <span className="text-brand-accent">{label.split(' ')[1]}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de contatos, cidadãos e influenciadores.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Novo Contato
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className={cn(
          "flex-1 flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar contatos..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <motion.div 
            key={contact.id}
            layout
            className={cn(
              "p-8 rounded-[2.5rem] shadow-xl border transition-all hover:shadow-2xl group",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-2xl flex items-center justify-center font-black text-xl">
                  {contact.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{contact.nome}</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    contact.tipo === 'cidadao' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-brand-accent"
                  )}>
                    {contact.tipo}
                  </span>
                </div>
              </div>
              <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Phone className="w-4 h-4" />
                <span>{contact.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4" />
                <span>{contact.localizacao}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all">
              <button className="flex-1 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all">
                Ver Perfil
              </button>
              <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                Editar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
