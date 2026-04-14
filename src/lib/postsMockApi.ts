export type StatusPostRedeSocial = 'rascunho' | 'agendado' | 'postado';

export interface PostRedeSocial {
  id: string;
  titulo: string;
  legenda: string;
  canais: string[];
  status: StatusPostRedeSocial;
  criadoEm: string;
  agendadoPara?: string;
  arquivosMidia: string[];
}

interface CriarPostInput {
  titulo: string;
  legenda: string;
  canais: string[];
  status: StatusPostRedeSocial;
  agendadoPara?: string;
  arquivosMidia?: string[];
}

const STORAGE_KEY = 'hub_posts_rede_social_mock_v1';

const basePosts: PostRedeSocial[] = [
  {
    id: 'post-social-1',
    titulo: 'Prestacao de contas da semana',
    legenda: 'Seguimos com foco em transparencia e resultado para a populacao. Confira os destaques desta semana.',
    canais: ['instagram', 'facebook'],
    status: 'postado',
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    arquivosMidia: ['prestacao-semana.png'],
  },
  {
    id: 'post-social-2',
    titulo: 'Agenda de atendimento',
    legenda: 'Atendimento ampliado nesta quarta-feira. Organize sua visita e compartilhe com quem precisa.',
    canais: ['instagram', 'linkedin'],
    status: 'agendado',
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    agendadoPara: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    arquivosMidia: ['agenda-atendimento.jpg'],
  },
  {
    id: 'post-social-3',
    titulo: 'Rascunho de campanha institucional',
    legenda: 'Estamos estruturando a proxima campanha com linguagem clara e foco no servico ao cidadao.',
    canais: ['facebook'],
    status: 'rascunho',
    criadoEm: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    arquivosMidia: [],
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadPosts(): PostRedeSocial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(basePosts));
      return [...basePosts];
    }
    const parsed = JSON.parse(raw) as PostRedeSocial[];
    if (!Array.isArray(parsed)) {
      return [...basePosts];
    }
    return parsed;
  } catch {
    return [...basePosts];
  }
}

function savePosts(posts: PostRedeSocial[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function listarPostsRedeSocialMock(): Promise<PostRedeSocial[]> {
  await wait(200);
  const posts = loadPosts();
  return posts.sort((a, b) => {
    const aTime = new Date(a.agendadoPara ?? a.criadoEm).getTime();
    const bTime = new Date(b.agendadoPara ?? b.criadoEm).getTime();
    return bTime - aTime;
  });
}

export async function criarPostRedeSocialMock(input: CriarPostInput): Promise<PostRedeSocial> {
  await wait(400);
  const posts = loadPosts();
  const novoPost: PostRedeSocial = {
    id: `post-social-${Date.now()}`,
    titulo: input.titulo.trim() || 'Post social sem titulo',
    legenda: input.legenda,
    canais: input.canais,
    status: input.status,
    criadoEm: new Date().toISOString(),
    agendadoPara: input.agendadoPara,
    arquivosMidia: input.arquivosMidia ?? [],
  };

  const atualizados = [novoPost, ...posts];
  savePosts(atualizados);
  return novoPost;
}

export async function cancelarAgendamentoPostMock(postId: string): Promise<PostRedeSocial | null> {
  await wait(250);
  const posts = loadPosts();
  const index = posts.findIndex((post) => post.id === postId);
  if (index === -1) return null;

  const alvo = posts[index];
  if (alvo.status !== 'agendado') return alvo;

  const atualizado: PostRedeSocial = {
    ...alvo,
    status: 'rascunho',
    agendadoPara: undefined,
  };

  posts[index] = atualizado;
  savePosts(posts);
  return atualizado;
}

export async function refinarLegendaInstitucionalMock(legenda: string): Promise<string> {
  await wait(1200);
  const textoBase = legenda
    .replace(/\s+/g, ' ')
    .trim();

  if (!textoBase) {
    return legenda;
  }

  const comFechamento = textoBase.endsWith('.') ? textoBase : `${textoBase}.`;
  return `${comFechamento} Comunicacao institucional objetiva, transparente e orientada ao interesse publico.`;
}
