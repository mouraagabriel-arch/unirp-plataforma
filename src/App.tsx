import { useState, useEffect } from 'react';
import { EnterpriseModule } from './components/EnterpriseModule';
import { GabineteModule } from './components/GabineteModule';
import { 
  LayoutGrid, Inbox, FileSearch, Swords, MessageCircle, 
  BrainCircuit, Newspaper, Users, BarChart3, Building2, 
  Layout, Target, Moon, RefreshCw, Power, Mic,
  Bell, Search, Activity, Globe, Mail, Landmark,
  Share2, Calendar, CheckSquare, FileText, LayoutDashboard,
  UserCheck, Trello, CreditCard, ShieldAlert, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SidebarItem } from './components/SidebarItem';

// Types based on index.html state
interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: string;
  entity_type: string;
  perfil_ativo: string;
  nivel_acesso: string;
  instituicoes?: {
    nome?: string;
    logo_url?: string;
    cor_primaria?: string;
    cor_secundaria?: string;
  };
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [perfilAtivo, setPerfilAtivo] = useState('Gabinete Digital');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Initialize demo user
  useEffect(() => {
    const demoUser: UserProfile = {
      id: 'demo-001',
      email: 'demo@unirp.com',
      nome: 'Usuário Demo',
      role: 'client',
      entity_type: 'Gabinete Digital',
      perfil_ativo: 'Gabinete Digital',
      nivel_acesso: 'Estrategista'
    };
    setUserProfile(demoUser);
    setPerfilAtivo(demoUser.perfil_ativo);
  }, []);

  const handleProfileSwitch = (newProfile: string) => {
    setPerfilAtivo(newProfile);
    if (userProfile) {
      setUserProfile({ ...userProfile, perfil_ativo: newProfile });
    }
    setCurrentTab('dashboard');
    setIsProfileModalOpen(false);
  };

  if (!userProfile) return null;

  const SIDEBAR_ITEMS = {
    enterprise: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'cerebro', label: 'Cérebro Institucional', icon: BrainCircuit },
      { id: 'hub', label: 'Hub de Conteúdo', icon: Share2 },
      { id: 'crm', label: 'CRM de Imprensa', icon: Users },
      { id: 'clipping', label: 'Clipping & Crise', icon: Newspaper },
      { id: 'comunicacao', label: 'Comunicação Interna', icon: MessageSquare },
      { id: 'influenciadores', label: 'Gestão de Influenciadores', icon: UserCheck },
      { id: 'planejamento', label: 'Planejamento Estratégico', icon: Calendar },
      { id: 'workflow', label: 'Workflow & Pautas', icon: Trello },
      { id: 'sala-imprensa', label: 'Sala de Imprensa', icon: Globe },
      { id: 'atas', label: 'Inteligência de Atas', icon: Mic },
      { id: 'plano', label: 'Meu Plano', icon: CreditCard },
    ],
    gabinete: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'demandas', label: 'Caixa de Entrada', icon: Inbox },
      { id: 'projetos', label: 'Análise de Projetos', icon: FileText },
      { id: 'arsenal', label: 'Arsenal de Embate', icon: ShieldAlert },
      { id: 'posicionamento', label: 'Central de Posicionamento', icon: MessageSquare },
      { id: 'cerebro', label: 'Núcleo Ideológico', icon: BrainCircuit },
      { id: 'hub', label: 'Hub de Conteúdo', icon: Share2 },
      { id: 'crm', label: 'Base de Cidadãos', icon: Users },
      { id: 'planejamento', label: 'Planejamento Estratégico', icon: Calendar },
      { id: 'workflow', label: 'Workflow & Pautas', icon: Trello },
      { id: 'plano', label: 'Meu Plano', icon: CreditCard },
    ]
  };

  const currentItems = perfilAtivo === 'Gabinete Digital' ? SIDEBAR_ITEMS.gabinete : SIDEBAR_ITEMS.enterprise;

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-300 font-sans bg-brand-bg text-slate-200"
    )}>
      {/* Sidebar */}
      <aside className="w-80 bg-brand-surface/80 backdrop-blur-2xl border-r border-white/5 flex flex-col shadow-2xl z-50">
        <div className="p-10 border-b border-white/5 flex items-center gap-5">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
            <img 
              src={userProfile.instituicoes?.logo_url || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23ccc\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23666\'%3ELOGO%3C/text%3E%3C/svg%3E'} 
              className="max-h-full max-w-full object-contain brightness-0 invert"
              alt="Logo"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-black text-xl truncate leading-tight text-white">{userProfile.instituicoes?.nome || 'uniRP Enterprise'}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-bold mt-1">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
          {userProfile.role === 'super_admin' ? (
            <>
              <SidebarItem 
                icon={<BarChart3 />} 
                label="Visão Geral" 
                active={currentTab === 'admin_overview'} 
                onClick={() => setCurrentTab('admin_overview')} 
              />
              <SidebarItem 
                icon={<Building2 />} 
                label="Gestão de Tenants" 
                active={currentTab === 'admin_tenants'} 
                onClick={() => setCurrentTab('admin_tenants')} 
              />
              <SidebarItem 
                icon={<Layout />} 
                label="Gestão do Site Público" 
                active={currentTab === 'admin_cms'} 
                onClick={() => setCurrentTab('admin_cms')} 
              />
            </>
          ) : (
            currentItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={<item.icon />} 
                label={item.label} 
                active={currentTab === item.id} 
                onClick={() => setCurrentTab(item.id)} 
              />
            ))
          )}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4 bg-brand-bg/50">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="flex items-center gap-4 p-4 w-full text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-2xl transition-all"
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm font-bold">Modo Escuro</span>
          </button>
          <button 
            onClick={() => setIsProfileModalOpen(true)} 
            className="flex items-center gap-4 p-4 w-full text-brand-accent hover:bg-brand-accent/10 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm font-bold">Trocar Perfil de Acesso</span>
          </button>
          <button className="flex items-center gap-4 p-4 w-full text-brand-rose hover:bg-brand-rose/10 rounded-2xl font-bold transition-all">
            <Power className="w-5 h-5" />
            <span className="text-sm font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-bg relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
        
        <header className={cn(
          "h-24 border-b flex items-center justify-between px-12 z-40 shadow-sm bg-brand-surface/50 backdrop-blur-xl border-white/5"
        )}>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-brand-accent/20 border border-brand-accent/30 rounded-2xl flex items-center justify-center text-brand-accent shadow-lg shadow-brand-accent/10">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase text-white">
                {currentTab.replace('_', ' ')}
              </h2>
              <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mt-0.5">
                {perfilAtivo} • {userProfile.nivel_acesso}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className={cn(
              "hidden lg:flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all bg-white/5 border-white/5"
            )}>
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Pesquisar no uniRP..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-64 text-slate-200 placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative bg-white/5 border border-white/5 hover:bg-white/10"
              )}>
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-brand-rose rounded-full border-2 border-brand-bg"></span>
              </button>
              
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white">{userProfile.nome}</p>
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{userProfile.role}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                  {userProfile.nome.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${perfilAtivo}-${currentTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {perfilAtivo === 'Órgão Público' ? (
                <EnterpriseModule activeTab={currentTab} isDarkMode={isDarkMode} />
              ) : (
                <GabineteModule activeTab={currentTab} isDarkMode={isDarkMode} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Profile Switch Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 space-y-10"
            >
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Trocar Perfil de Acesso</h3>
                <p className="text-slate-500 text-lg font-medium">Selecione o ambiente que deseja operar agora.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => handleProfileSwitch('Órgão Público')} 
                  className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 text-left"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Enterprise</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">Gestão Institucional e Órgão Público</p>
                </button>

                <button 
                  onClick={() => handleProfileSwitch('Gabinete Digital')} 
                  className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all duration-300 text-left"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Landmark className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Gabinete Digital</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">Inteligência de Mandato e Base</p>
                </button>
              </div>

              <button 
                onClick={() => setIsProfileModalOpen(false)} 
                className="w-full py-5 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                Voltar ao painel atual
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
