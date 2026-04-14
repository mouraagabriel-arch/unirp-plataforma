import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Brain,
  Building2,
  CheckCircle2,
  Folder,
  Image,
  Link as LinkIcon,
  MoreVertical,
  Palette,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

type TabId = 'dna' | 'portaVozes' | 'identidade';
type ToneOption = 'Tecnico' | 'Acolhedor' | 'Juridico' | 'Informal' | 'Motivacional';

type PortaVoz = {
  id: string;
  nome: string;
  cargo: string;
  redeSocial: string;
  tomIndividual: string;
};

type PublicoAlvoPayload = {
  slogan?: string;
  pilares?: string[];
  glossario?: string;
  redLines?: string;
  formalidade?: number;
  tomPrincipal?: ToneOption;
  corPrimaria?: string;
  corSecundaria?: string;
};

const INITIAL_PORTA_VOZES: PortaVoz[] = [
  {
    id: 'voz-1',
    nome: 'Maria Fernanda Costa',
    cargo: 'Prefeita',
    redeSocial: 'https://instagram.com/prefeita.maria',
    tomIndividual: 'Fala com serenidade, foco em resultados e linguagem de proximidade com o cidadão.',
  },
  {
    id: 'voz-2',
    nome: 'Carlos Henrique Lima',
    cargo: 'Secretario de Obras',
    redeSocial: 'https://linkedin.com/in/carlos-obras',
    tomIndividual: 'Comunicacao objetiva, tecnica e orientada a cronogramas e entregas concretas.',
  },
];

function parsePublicoAlvo(raw: unknown): PublicoAlvoPayload | null {
  if (typeof raw !== 'string' || !raw.trim().startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw) as PublicoAlvoPayload;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function parsePortaVozes(raw: unknown): PortaVoz[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const nome = typeof item?.nome === 'string' ? item.nome.trim() : '';
      const cargo = typeof item?.cargo === 'string' ? item.cargo.trim() : '';
      const redeSocial = typeof item?.redeSocial === 'string' ? item.redeSocial.trim() : '';
      const tomIndividual = typeof item?.tomIndividual === 'string' ? item.tomIndividual.trim() : '';
      if (!nome && !cargo) return null;
      return {
        id: typeof item?.id === 'string' ? item.id : `voz-loaded-${index}`,
        nome,
        cargo,
        redeSocial,
        tomIndividual,
      } satisfies PortaVoz;
    })
    .filter((item): item is PortaVoz => Boolean(item));
}

export function EnterpriseSettings({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabId>('dna');

  const [nomeInstituicao, setNomeInstituicao] = useState('');
  const [slogan, setSlogan] = useState('');
  const [missao, setMissao] = useState('');

  const [tomDeVoz, setTomDeVoz] = useState<ToneOption>('Tecnico');
  const [formalidadeNivel, setFormalidadeNivel] = useState(3);

  const [pilarInput, setPilarInput] = useState('');
  const [pilaresGestao, setPilaresGestao] = useState<string[]>(['Saude', 'Mobilidade', 'Transparencia']);

  const [glossarioOficial, setGlossarioOficial] = useState('Cidadao; Entrega; Investimento; Rede Municipal');
  const [palavrasProibidas, setPalavrasProibidas] = useState('gasto, cliente, improviso, sem prazo');

  const [portaVozes, setPortaVozes] = useState<PortaVoz[]>(INITIAL_PORTA_VOZES);
  const [isPortaVozModalOpen, setIsPortaVozModalOpen] = useState(false);
  const [editingPortaVozId, setEditingPortaVozId] = useState<string | null>(null);

  const [pvNome, setPvNome] = useState('');
  const [pvCargo, setPvCargo] = useState('');
  const [pvRedeSocial, setPvRedeSocial] = useState('');
  const [pvTomIndividual, setPvTomIndividual] = useState('');

  const [logoPrincipalName, setLogoPrincipalName] = useState('');
  const [logoNegativaName, setLogoNegativaName] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#2563EB');
  const [corSecundaria, setCorSecundaria] = useState('#0F172A');

  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: tenantData }, { data: settingsData }] = await Promise.all([
          tenantService.getActiveTenant(),
          tenantService.getEnterpriseSettings(),
        ]);

        if (tenantData?.nome) setNomeInstituicao(tenantData.nome);
        if (settingsData?.missao) setMissao(settingsData.missao);

        if (settingsData?.tom_de_voz) {
          const value = settingsData.tom_de_voz as ToneOption;
          if (['Tecnico', 'Acolhedor', 'Juridico', 'Informal', 'Motivacional'].includes(value)) {
            setTomDeVoz(value);
          }
        }

        const meta = parsePublicoAlvo(settingsData?.publico_alvo);
        if (meta?.slogan) setSlogan(meta.slogan);
        if (Array.isArray(meta?.pilares) && meta.pilares.length > 0) setPilaresGestao(meta.pilares);
        if (meta?.glossario) setGlossarioOficial(meta.glossario);
        if (meta?.redLines) setPalavrasProibidas(meta.redLines);
        if (typeof meta?.formalidade === 'number') setFormalidadeNivel(Math.min(5, Math.max(1, Math.round(meta.formalidade))));
        if (meta?.tomPrincipal) setTomDeVoz(meta.tomPrincipal);
        if (meta?.corPrimaria) setCorPrimaria(meta.corPrimaria);
        if (meta?.corSecundaria) setCorSecundaria(meta.corSecundaria);

        const loadedPortaVozes = parsePortaVozes(settingsData?.porta_vozes_oficiais);
        if (loadedPortaVozes.length > 0) setPortaVozes(loadedPortaVozes);
      } catch (error) {
        console.error('[EnterpriseSettings] Falha ao carregar configuracoes:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tenantService]);

  const pillarsCounter = useMemo(() => pilaresGestao.length, [pilaresGestao]);

  const resetPortaVozForm = () => {
    setPvNome('');
    setPvCargo('');
    setPvRedeSocial('');
    setPvTomIndividual('');
    setEditingPortaVozId(null);
  };

  const handleAddPilar = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const value = pilarInput.trim();
    if (!value) return;
    if (!pilaresGestao.includes(value)) {
      setPilaresGestao((prev) => [...prev, value]);
    }
    setPilarInput('');
  };

  const openCreatePortaVoz = () => {
    resetPortaVozForm();
    setIsPortaVozModalOpen(true);
  };

  const openEditPortaVoz = (id: string) => {
    const target = portaVozes.find((item) => item.id === id);
    if (!target) return;
    setPvNome(target.nome);
    setPvCargo(target.cargo);
    setPvRedeSocial(target.redeSocial);
    setPvTomIndividual(target.tomIndividual);
    setEditingPortaVozId(target.id);
    setIsPortaVozModalOpen(true);
    setMenuAbertoId(null);
  };

  const handleSavePortaVoz = () => {
    if (!pvNome.trim() || !pvCargo.trim()) {
      toast.error('Preencha nome e cargo do porta-voz.');
      return;
    }

    if (editingPortaVozId) {
      setPortaVozes((prev) => prev.map((item) => (
        item.id === editingPortaVozId
          ? { ...item, nome: pvNome.trim(), cargo: pvCargo.trim(), redeSocial: pvRedeSocial.trim(), tomIndividual: pvTomIndividual.trim() }
          : item
      )));
      toast.success('Porta-voz atualizado.');
    } else {
      const novo: PortaVoz = {
        id: `voz-${Date.now()}`,
        nome: pvNome.trim(),
        cargo: pvCargo.trim(),
        redeSocial: pvRedeSocial.trim(),
        tomIndividual: pvTomIndividual.trim(),
      };
      setPortaVozes((prev) => [novo, ...prev]);
      toast.success('Porta-voz cadastrado.');
    }

    setIsPortaVozModalOpen(false);
    resetPortaVozForm();
  };

  const handleDeletePortaVoz = (id: string) => {
    setPortaVozes((prev) => prev.filter((item) => item.id !== id));
    setMenuAbertoId(null);
    toast.success('Porta-voz removido.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const publicoAlvoPayload: PublicoAlvoPayload = {
      slogan,
      pilares: pilaresGestao,
      glossario: glossarioOficial,
      redLines: palavrasProibidas,
      formalidade: formalidadeNivel,
      tomPrincipal: tomDeVoz,
      corPrimaria,
      corSecundaria,
    };

    const operation = (async () => {
      const { error: tenantError } = await tenantService.updateActiveTenant({ nome: nomeInstituicao });
      if (tenantError) throw new Error(tenantError.message);

      const { error: settingsError } = await tenantService.upsertEnterpriseSettings({
        missao,
        tom_de_voz: tomDeVoz,
        publico_alvo: JSON.stringify(publicoAlvoPayload),
        porta_vozes_oficiais: portaVozes.map((item) => ({
          id: item.id,
          nome: item.nome,
          cargo: item.cargo,
          redeSocial: item.redeSocial,
          tomIndividual: item.tomIndividual,
        })),
      });

      if (settingsError) throw new Error(settingsError.message);
    })();

    try {
      await toast.promise(operation, {
        loading: 'Treinando Inteligencia...',
        success: 'Cerebro institucional salvo e sincronizado.',
        error: 'Nao foi possivel salvar o cerebro institucional.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-6xl mx-auto py-8 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 text-sm text-slate-300">
          Carregando configurações do Cérebro...
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-8 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Cérebro Institucional</h1>
            <p className="text-sm text-slate-400">Painel de DNA, porta-vozes e brand kit para treinar a IA da plataforma.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl w-fit">
          {[
            { id: 'dna', label: 'DNA e Tom de Voz', icon: SlidersHorizontal },
            { id: 'portaVozes', label: 'Porta-Vozes', icon: UserRound },
            { id: 'identidade', label: 'Identidade Visual', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all border',
                  activeTab === tab.id
                    ? 'bg-brand-accent text-white border-brand-accent/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'dna' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Nome da Instituição</span>
                  <input
                    type="text"
                    value={nomeInstituicao}
                    onChange={(event) => setNomeInstituicao(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Ex: Prefeitura Municipal de ..."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Slogan / Lema</span>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(event) => setSlogan(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Ex: Cuidar das pessoas, transformar a cidade"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Missão</span>
                <textarea
                  value={missao}
                  onChange={(event) => setMissao(event.target.value)}
                  className="w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none resize-none"
                />
              </label>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Pilares da Gestão</span>
                <input
                  type="text"
                  value={pilarInput}
                  onChange={(event) => setPilarInput(event.target.value)}
                  onKeyDown={handleAddPilar}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  placeholder="Digite e pressione Enter (ex: Inovação, Saúde, Transparência)"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {pilaresGestao.map((pilar) => (
                    <button
                      key={pilar}
                      type="button"
                      onClick={() => setPilaresGestao((prev) => prev.filter((item) => item !== pilar))}
                      className="px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-black uppercase tracking-wider"
                    >
                      #{pilar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Tom Principal</span>
                  <select
                    value={tomDeVoz}
                    onChange={(event) => setTomDeVoz(event.target.value as ToneOption)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option className="bg-slate-900">Tecnico</option>
                    <option className="bg-slate-900">Acolhedor</option>
                    <option className="bg-slate-900">Juridico</option>
                    <option className="bg-slate-900">Informal</option>
                    <option className="bg-slate-900">Motivacional</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Quão formal? ({formalidadeNivel}/5)</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formalidadeNivel}
                    onChange={(event) => setFormalidadeNivel(Number(event.target.value))}
                    className="w-full accent-brand-accent mt-3"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Termos e Jargões Oficiais</span>
                  <textarea
                    value={glossarioOficial}
                    onChange={(event) => setGlossarioOficial(event.target.value)}
                    className="w-full min-h-[130px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none resize-none"
                    placeholder="Como a instituição chama as coisas."
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Palavras Proibidas / Red Lines</span>
                  <textarea
                    value={palavrasProibidas}
                    onChange={(event) => setPalavrasProibidas(event.target.value)}
                    className="w-full min-h-[130px] rounded-xl border border-rose-400/20 bg-rose-500/5 px-4 py-3 text-sm text-white outline-none resize-none"
                    placeholder="Termos que a IA nunca deve usar."
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'portaVozes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-black">Perfis oficiais</p>
                  <h2 className="text-xl font-black text-white mt-1">Porta-vozes e tom individual</h2>
                </div>
                <button
                  type="button"
                  onClick={openCreatePortaVoz}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-accent text-white px-4 py-2.5 text-sm font-black hover:bg-brand-accent/90"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Porta-Voz
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portaVozes.map((pessoa) => (
                  <article key={pessoa.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 relative">
                    <div className="absolute right-3 top-3">
                      <button
                        type="button"
                        onClick={() => setMenuAbertoId((prev) => prev === pessoa.id ? null : pessoa.id)}
                        className="p-2 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-white/10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuAbertoId === pessoa.id && (
                        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-slate-950/95 overflow-hidden z-20">
                          <button
                            type="button"
                            onClick={() => openEditPortaVoz(pessoa.id)}
                            className="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePortaVoz(pessoa.id)}
                            className="w-full px-3 py-2.5 text-left text-sm text-rose-300 hover:bg-rose-500/10 border-t border-white/10"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-black text-white pr-12">{pessoa.nome}</p>
                    <p className="text-xs text-slate-400 mt-1">{pessoa.cargo}</p>
                    {pessoa.redeSocial && (
                      <a href={pessoa.redeSocial} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-300 mt-3 hover:underline">
                        <LinkIcon className="w-3.5 h-3.5" />
                        Rede principal
                      </a>
                    )}
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">{pessoa.tomIndividual || 'Tom individual ainda não definido.'}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'identidade' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-5 cursor-pointer hover:bg-white/10 transition-colors block">
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-slate-300" />
                    <div>
                      <p className="text-sm font-black text-white">Logo Principal (Fundo Claro)</p>
                      <p className="text-xs text-slate-400 mt-1">PNG/SVG, até 5MB</p>
                    </div>
                  </div>
                  {logoPrincipalName && <p className="text-xs text-slate-300 mt-3">{logoPrincipalName}</p>}
                  <input
                    type="file"
                    accept="image/png,image/svg+xml"
                    className="hidden"
                    onChange={(event) => setLogoPrincipalName(event.target.files?.[0]?.name ?? '')}
                  />
                </label>

                <label className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-5 cursor-pointer hover:bg-white/10 transition-colors block">
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-slate-300" />
                    <div>
                      <p className="text-sm font-black text-white">Logo Negativa (Fundo Escuro)</p>
                      <p className="text-xs text-slate-400 mt-1">PNG/SVG, até 5MB</p>
                    </div>
                  </div>
                  {logoNegativaName && <p className="text-xs text-slate-300 mt-3">{logoNegativaName}</p>}
                  <input
                    type="file"
                    accept="image/png,image/svg+xml"
                    className="hidden"
                    onChange={(event) => setLogoNegativaName(event.target.files?.[0]?.name ?? '')}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Cor Primária</span>
                  <div className="flex items-center gap-3">
                    <input type="color" value={corPrimaria} onChange={(event) => setCorPrimaria(event.target.value)} className="w-10 h-10 rounded-lg bg-transparent p-0" />
                    <input type="text" value={corPrimaria} onChange={(event) => setCorPrimaria(event.target.value)} className="flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
                  </div>
                </label>

                <label className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Cor Secundária</span>
                  <div className="flex items-center gap-3">
                    <input type="color" value={corSecundaria} onChange={(event) => setCorSecundaria(event.target.value)} className="w-10 h-10 rounded-lg bg-transparent p-0" />
                    <input type="text" value={corSecundaria} onChange={(event) => setCorSecundaria(event.target.value)} className="flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="sticky bottom-3 z-30 pt-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] break-words">
                {nomeInstituicao || 'Instituição'} • {pillarsCounter} pilares • {portaVozes.length} porta-vozes
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent text-white px-5 py-3 text-sm font-black hover:bg-brand-accent/90 disabled:opacity-70 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Treinando Inteligência...' : 'Salvar Cérebro Institucional'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isPortaVozModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsPortaVozModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Porta-voz</p>
                <h3 className="text-xl font-black text-white mt-1">{editingPortaVozId ? 'Editar Porta-Voz' : 'Novo Porta-Voz'}</h3>
              </div>
              <button type="button" onClick={() => setIsPortaVozModalOpen(false)} className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input value={pvNome} onChange={(event) => setPvNome(event.target.value)} placeholder="Nome" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={pvCargo} onChange={(event) => setPvCargo(event.target.value)} placeholder="Cargo" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={pvRedeSocial} onChange={(event) => setPvRedeSocial(event.target.value)} placeholder="Link da rede social principal" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <textarea value={pvTomIndividual} onChange={(event) => setPvTomIndividual(event.target.value)} placeholder="Tom de voz individual (como essa autoridade se comunica)" className="w-full min-h-[110px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none resize-none" />
            </div>

            <div className="flex gap-3 mt-5">
              <button type="button" onClick={handleSavePortaVoz} className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-black text-white hover:bg-brand-accent/90">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Salvar
              </button>
              <button type="button" onClick={() => setIsPortaVozModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 hover:bg-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
