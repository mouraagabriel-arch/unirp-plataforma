import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { EnterpriseModule } from './components/EnterpriseModule';
import { GabineteModule } from './components/GabineteModule';
import { 
  LayoutGrid, Inbox, FileSearch, Swords, MessageCircle, 
  BrainCircuit, Newspaper, Users, BarChart3, Building2, 
  Layout, Target, Moon, RefreshCw, Power, Mic,
  Bell, Search, Activity, Globe, Mail, Landmark,
  Share2, Calendar, CheckSquare, FileText, LayoutDashboard, Wallet,
   UserCheck, Trello, ShieldAlert, MessageSquare, Settings, User, KeyRound,
   Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SidebarItem } from './components/SidebarItem';
import { useAuthContext, type TenantModuleType } from './contexts/AuthContext';
import { TenantSwitcher } from './components/TenantSwitcher';
import { LoginPage } from './components/LoginPage';
import { useTerminologia } from './hooks/useTerminologia';
import { useTenantService } from './services/useTenantService';

// Types based on index.html state
interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: string;
  tenant_id?: string | null;
  tipo_modulo?: TenantModuleType | null;
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

function getModulePrefix(moduleType: TenantModuleType | null | undefined) {
  return moduleType === 'autarquia' ? '/gabinete' : '/enterprise';
}

function resolveHomePath(role: string | undefined, moduleType: TenantModuleType | null | undefined) {
  if (role === 'super_admin') {
    return '/enterprise/dashboard';
  }
  return `${getModulePrefix(moduleType)}/dashboard`;
}

function getModuleLabel(moduleType: TenantModuleType | null | undefined) {
  return moduleType === 'autarquia' ? 'Gabinete Digital' : 'Órgão Público';
}

export default function App() {
  const { session, profile, loading, activeModuleType, activeTenantId, availableTenants, setActiveTenant, signOut } = useAuthContext();
  const tenantService = useTenantService();
  const { termo } = useTerminologia();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [perfilAtivo, setPerfilAtivo] = useState<string>('Órgão Público');
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab = pathParts.length >= 2 ? pathParts[1] : (pathParts[0] || 'dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [superAdminClientMode, setSuperAdminClientMode] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const BILLING_TAB_ID = 'plano';
  const BILLING_ROUTE = '/plano';
   const PROFILE_ROUTE = '/meu-perfil';
   const PASSWORD_ROUTE = '/trocar-senha';

  useEffect(() => {
    if (!profile) {
      setUserProfile(null);
      return;
    }

    const resolvedModule = activeModuleType ?? profile.tipo_modulo ?? 'orgao_publico';
    const mappedUser: UserProfile = {
      id: profile.id,
      email: profile.email ?? '',
      nome: profile.full_name ?? profile.email ?? 'Usuário',
      role: profile.role,
      tenant_id: profile.tenant_id,
      tipo_modulo: resolvedModule,
      entity_type: getModuleLabel(resolvedModule),
      perfil_ativo: getModuleLabel(resolvedModule),
      nivel_acesso: profile.role === 'super_admin' ? 'Super Administrador' : 'Usuário',
    };

    setUserProfile(mappedUser);
    setPerfilAtivo(mappedUser.perfil_ativo);
  }, [activeModuleType, profile]);

  useEffect(() => {
    if (loading || !profile) {
      return;
    }

    if (profile.role === 'super_admin') {
      return;
    }

    const moduleType = activeModuleType ?? profile.tipo_modulo ?? 'orgao_publico';
    const expectedPrefix = getModulePrefix(moduleType);
    if (!location.pathname.startsWith(expectedPrefix)) {
      navigate(`${expectedPrefix}/dashboard`, { replace: true });
    }
  }, [activeModuleType, loading, location.pathname, navigate, profile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscClose);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscClose);
    };
  }, []);

  const handleProfileSwitch = (newProfile: string) => {
    if (userProfile?.role !== 'super_admin') {
      return;
    }
    setPerfilAtivo(newProfile);
    if (userProfile) {
      setUserProfile({ ...userProfile, perfil_ativo: newProfile });
    }
    navigate(newProfile === 'Gabinete Digital' ? '/gabinete/dashboard' : '/enterprise/dashboard');
    setIsProfileModalOpen(false);
  };

  const handleUserMenuNavigation = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    tabId: string,
    route: string
  ) => {
    event.preventDefault();
    navigate(route);
    setIsUserMenuOpen(false);
  };

  const handleSidebarNavigation = (tabId: string) => {
    const currentModuleType: TenantModuleType = location.pathname.startsWith('/gabinete')
      ? 'autarquia'
      : location.pathname.startsWith('/enterprise')
      ? 'orgao_publico'
      : (activeModuleType ?? userProfile?.tipo_modulo ?? 'orgao_publico');
    const prefix = getModulePrefix(currentModuleType);
    navigate(`${prefix}/${tabId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleSuperAdminTenantSelect = async (tenantId: string) => {
    if (!tenantId || tenantId === activeTenantId) return;

    await setActiveTenant(tenantId);
    const selectedTenant = availableTenants.find((tenant) => tenant.id === tenantId);
    const prefix = getModulePrefix(selectedTenant?.tipo_modulo ?? 'orgao_publico');
    setSuperAdminClientMode(true);
    navigate(`${prefix}/dashboard`);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/gabinete')) {
      setPerfilAtivo('Gabinete Digital');
    } else if (location.pathname.startsWith('/enterprise')) {
      setPerfilAtivo('Órgão Público');
    } else if (activeModuleType) {
      setPerfilAtivo(getModuleLabel(activeModuleType));
    }
  }, [activeModuleType, location.pathname]);

  useEffect(() => {
    const applyTenantBranding = async () => {
      if (!activeTenantId) {
        setTenantLogoUrl(null);
        document.documentElement.style.setProperty('--color-brand-accent', '#6366f1');
        return;
      }

      const { data } = await tenantService.getActiveTenant();
      const primaryColor = typeof data?.primary_color === 'string' ? data.primary_color : null;
      const logoUrl = typeof data?.logo_url === 'string' ? data.logo_url : null;

      document.documentElement.style.setProperty('--color-brand-accent', primaryColor || '#6366f1');
      setTenantLogoUrl(logoUrl);
    };

    void applyTenantBranding();
  }, [activeTenantId, tenantService]);

  if (loading) return null;

  if (!session) {
    return <LoginPage />;
  }

  if (!userProfile) return null;

  const SIDEBAR_ITEMS = {
    enterprise: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'hub', label: 'Hub de Conteúdo', icon: Share2 },
      { id: 'crm', label: 'CRM de Imprensa', icon: Users },
      { id: 'clipping', label: 'Clipping & Crise', icon: Newspaper },
      { id: 'social-listening', label: 'Social Listening', icon: Share2 },
      { id: 'comunicacao', label: 'Comunicação Interna', icon: MessageSquare },
      { id: 'influenciadores', label: 'Relacionamento & Demandas', icon: UserCheck },
      { id: 'ouvidoria', label: 'Ouvidoria', icon: Inbox },
      { id: 'workflow', label: 'Workflow & Pautas', icon: Trello },
      { id: 'sala-imprensa', label: 'Sala de Imprensa', icon: Globe },
      { id: 'atas', label: 'Inteligência de Atas', icon: Mic },
      { id: 'configuracoes', label: 'Configurações', icon: Settings },
      { id: 'ajuda', label: 'Ajuda & Suporte', icon: MessageCircle },
    ],
    gabinete: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'demandas', label: 'Caixa de Entrada', icon: Inbox },
      { id: 'projetos', label: 'Análise de Projetos', icon: FileText },
      { id: 'transparencia', label: 'Transparência e Recursos', icon: Wallet },
      { id: 'arsenal', label: 'Arsenal de Embate', icon: ShieldAlert },
      { id: 'cerebro', label: 'Cérebro Estratégico', icon: BrainCircuit },
      { id: 'posicionamento', label: 'Posicionamento', icon: Target },
      { id: 'hub', label: 'Hub de Conteúdo', icon: Share2 },
      { id: 'crm', label: `Base de ${termo('cidadaos')}`, icon: Users },
      { id: 'planejamento', label: 'Planejamento', icon: Calendar },
      { id: 'workflow', label: 'Workflow & Pautas', icon: Trello },
      { id: 'plano', label: 'Plano', icon: CheckSquare },
    ]
  };

  const currentItems = perfilAtivo === 'Gabinete Digital' ? SIDEBAR_ITEMS.gabinete : SIDEBAR_ITEMS.enterprise;
  const isSuperAdmin = userProfile.role === 'super_admin';
  const resolvedSuperAdminModuleType = (activeModuleType as unknown as string | null) ?? null;
  const superAdminClientItems =
    resolvedSuperAdminModuleType === 'autarquia' ||
    resolvedSuperAdminModuleType === 'gabinete' ||
    location.pathname.startsWith('/gabinete')
      ? SIDEBAR_ITEMS.gabinete
      : SIDEBAR_ITEMS.enterprise;

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-300 font-sans bg-brand-bg text-slate-200"
    )}>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-72 lg:w-80 bg-brand-surface/95 backdrop-blur-2xl border-r border-white/5 flex flex-col shadow-2xl",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 lg:p-10 border-b border-white/5 flex items-center gap-4 lg:gap-5">
            {/* Botão fechar sidebar no mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors absolute right-4 top-4"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
            <img 
                src={tenantLogoUrl || userProfile.instituicoes?.logo_url || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23ccc\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23666\'%3ELOGO%3C/text%3E%3C/svg%3E'} 
                className="max-h-full max-w-full object-contain"
              alt="Logo"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-black text-xl truncate leading-tight text-white">{userProfile.instituicoes?.nome || 'uniRP Enterprise'}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-bold mt-1">Enterprise</p>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="px-8 pt-4 pb-2">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Entrar como cliente</label>
            <select
              value={activeTenantId ?? ''}
              onChange={(event) => {
                setSuperAdminClientMode(true);
                void handleSuperAdminTenantSelect(event.target.value);
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="" className="bg-slate-900">Selecione um tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-slate-900">
                  {tenant.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 p-4 lg:p-8 space-y-2 lg:space-y-3 overflow-y-auto">
          {isSuperAdmin ? (
            <>
              <div className="border-l-4 border-indigo-500 pl-3 space-y-3">
                <SidebarItem
                  icon={<LayoutDashboard />}
                  label="Dashboard Estratégico"
                  active={currentTab === 'dashboard'}
                  onClick={() => navigate('/enterprise/dashboard')}
                />
                <SidebarItem
                  icon={<ShieldAlert />}
                  label="Console de Administração"
                  active={currentTab === 'admin-console' || currentTab === 'audit-logs' || currentTab === 'admin-tenants' || currentTab === 'admin-site' || currentTab === 'admin-overview'}
                  onClick={() => navigate('/enterprise/admin-console')}
                />
              </div>

              {superAdminClientMode && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSuperAdminClientMode(false);
                      navigate('/enterprise/admin-console');
                    }}
                    className="w-full text-left rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-black text-indigo-300"
                  >
                    ← Painel Admin
                  </button>
                  {superAdminClientItems.map((item) => (
                    <SidebarItem
                      key={item.id}
                      icon={<item.icon />}
                      label={item.label}
                      active={currentTab === item.id}
                      onClick={() => handleSidebarNavigation(item.id)}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            currentItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={<item.icon />} 
                label={item.label} 
                active={currentTab === item.id} 
                onClick={() => handleSidebarNavigation(item.id)} 
              />
            ))
          )}
        </nav>

        <div className="p-4 lg:p-8 border-t border-white/5 space-y-2 lg:space-y-4 bg-brand-bg/50">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="flex items-center gap-4 p-4 w-full text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-2xl transition-all"
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm font-bold">Modo Escuro</span>
          </button>
          {userProfile.role === 'super_admin' && (
            <button 
              onClick={() => setIsProfileModalOpen(true)} 
              className="flex items-center gap-4 p-4 w-full text-brand-accent hover:bg-brand-accent/10 rounded-2xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-bold">Trocar Perfil de Acesso</span>
            </button>
          )}
          <button onClick={handleSignOut} className="flex items-center gap-4 p-4 w-full text-brand-rose hover:bg-brand-rose/10 rounded-2xl font-bold transition-all">
            <Power className="w-5 h-5" />
            <span className="text-sm font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-bg relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
        
        <header className={cn(
          "h-16 lg:h-24 border-b flex items-center justify-between px-4 lg:px-12 z-40 shadow-sm bg-brand-surface/50 backdrop-blur-xl border-white/5"
        )}>
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Botão hambúrguer — apenas mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-accent/20 border border-brand-accent/30 rounded-2xl flex items-center justify-center text-brand-accent shadow-lg shadow-brand-accent/10">
              <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div>
              <h2 className="text-base lg:text-2xl font-black tracking-tight uppercase text-white truncate max-w-[140px] sm:max-w-none">
                {currentTab.replace('_', ' ')}
              </h2>
              <p className="text-[9px] lg:text-[10px] font-bold text-brand-accent uppercase tracking-widest mt-0.5 hidden sm:block">
                {perfilAtivo} • {userProfile.nivel_acesso}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <TenantSwitcher />
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
              
              <div ref={userMenuRef} className="relative flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white">{userProfile.nome}</p>
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{userProfile.role}</p>
                </div>
                <button
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="w-12 h-12 bg-gradient-to-br from-brand-accent to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg hover:scale-[1.03] transition-transform"
                  aria-label="Abrir menu do usuário"
                  aria-expanded={isUserMenuOpen}
                >
                  {userProfile.nome.charAt(0)}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-3 z-[100] w-[20rem] rounded-2xl bg-slate-900 border border-white/10 shadow-xl p-2"
                    >
                      <a
                         href={PROFILE_ROUTE}
                         onClick={(event) => handleUserMenuNavigation(event, 'meu-perfil', PROFILE_ROUTE)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 transition-colors"
                      >
                         <User className="w-4 h-4 text-slate-400" />
                         Meu Perfil
                      </a>
                      <a
                         href={PASSWORD_ROUTE}
                         onClick={(event) => handleUserMenuNavigation(event, 'trocar-senha', PASSWORD_ROUTE)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 transition-colors"
                      >
                         <KeyRound className="w-4 h-4 text-slate-400" />
                         Trocar Senha
                      </a>
                      {perfilAtivo === 'Órgão Público' && (
                        <a
                           href={location.pathname.startsWith('/gabinete') ? '/gabinete/dashboard' : '/enterprise/configuracoes'}
                           onClick={(event) => handleUserMenuNavigation(event, 'configuracoes', location.pathname.startsWith('/gabinete') ? '/gabinete/dashboard' : '/enterprise/configuracoes')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 transition-colors"
                        >
                          <BrainCircuit className="w-4 h-4 text-slate-400" />
                          ⚙️ Cérebro & Configurações
                        </a>
                      )}
                      <a
                        href={BILLING_ROUTE}
                        onClick={(event) => handleUserMenuNavigation(event, BILLING_TAB_ID, BILLING_ROUTE)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        Assinatura & Faturamento
                      </a>
                      <div className="my-2 h-px bg-white/10" />
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-brand-rose hover:bg-brand-rose/10 transition-colors"
                        type="button"
                        onClick={handleSignOut}
                      >
                        <Power className="w-4 h-4" />
                        Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route path="/" element={<Navigate to={resolveHomePath(userProfile.role, activeModuleType ?? userProfile.tipo_modulo)} replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/enterprise/*" element={<EnterpriseModule activeTab={currentTab} isDarkMode={isDarkMode} />} />
                <Route path="/gabinete/*" element={<GabineteModule activeTab={currentTab} isDarkMode={isDarkMode} />} />
                <Route path="/configuracoes" element={
                  <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 text-slate-200">
                    <h3 className="text-2xl font-black text-white">Configurações da Conta</h3>
                    <p className="text-slate-400 mt-2">Placeholder de rota ativa em /configuracoes.</p>
                  </div>
                } />
                 <Route path="/meu-perfil" element={
                   <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 text-slate-200 space-y-2">
                     <h3 className="text-2xl font-black text-white">Meu Perfil</h3>
                     <p className="text-slate-400">Nome: {userProfile.nome}</p>
                     <p className="text-slate-400">Email: {userProfile.email || 'Não informado'}</p>
                     <p className="text-slate-400">Nível: {userProfile.nivel_acesso}</p>
                   </div>
                 } />
                 <Route path="/trocar-senha" element={
                   <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 text-slate-200 space-y-2">
                     <h3 className="text-2xl font-black text-white">Trocar Senha</h3>
                     <p className="text-slate-400">Use o fluxo de redefinição na autenticação para atualizar sua senha com segurança.</p>
                   </div>
                 } />
                <Route path="/equipe" element={
                  <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 text-slate-200">
                    <h3 className="text-2xl font-black text-white">Gestão de Equipe</h3>
                    <p className="text-slate-400 mt-2">Placeholder de rota ativa em /equipe.</p>
                  </div>
                } />
                <Route path="/plano" element={
                  <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 text-slate-200">
                    <h3 className="text-2xl font-black text-white">Assinatura & Faturamento</h3>
                    <p className="text-slate-400 mt-2">Placeholder de rota ativa em /plano.</p>
                  </div>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Profile Switch Modal */}
      <AnimatePresence>
        {isProfileModalOpen && userProfile.role === 'super_admin' && (
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
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Trocar Perfil de Acesso</h3>
                <p className="text-slate-500 text-lg font-medium">Selecione o ambiente que deseja operar agora.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => handleProfileSwitch('Órgão Público')} 
                  className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 text-left"
                >
                  <div className="w-16 h-16 bg-blue-100 text-brand-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:text-white transition-all">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Enterprise</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">Gestão Institucional e Órgão Público</p>
                </button>

                <button 
                  onClick={() => handleProfileSwitch('Gabinete Digital')} 
                  className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all duration-300 text-left"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Landmark className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Gabinete Digital</h4>
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
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '700',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#1e293b' } },
        }}
      />
    </div>
  );
}
