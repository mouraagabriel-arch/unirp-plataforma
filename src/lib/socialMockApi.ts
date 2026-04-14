/**
 * Social Listening Mock API Service
 * Simula busca de menções em redes sociais utilizando palavras-chave focais
 */

export type RedeDisponivel = 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'facebook' | 'google' | 'tiktok';

export interface SocialPost {
  id: string;
  rede: RedeDisponivel;
  autor: string;
  handle: string;
  foto_perfil?: string;
  conteudo: string;
  /** Para Google: título da matéria/artigo */
  titulo_materia?: string;
  data: string;
  engajamento: {
    curtidas: number;
    comentarios: number;
    compartilhamentos: number;
  };
  /** Alias semântico com nomes em inglês (para compatibilidade SQL futura) */
  metricas: {
    likes: number;
    comments: number;
    shares: number;
  };
  /** TikTok: visualizações do vídeo */
  visualizacoes?: number;
  sentimento?: 'positivo' | 'negativo' | 'neutro';
  /** URL do perfil do autor */
  url_perfil: string;
  /** URL da postagem específica */
  url_post: string;
  /** @deprecated Use url_perfil ou url_post */
  url_original: string;
  topico?: string;
  risco?: 'alto' | 'medio' | 'baixo';
  geo?: string;
  geolocalizacao: {
    estado: string;
    cidade: string;
    bairro_inferido: string;
  };
  tags_ia: string[];
}

/* ── Nomes por rede ──────────────────────────────────────────────── */
const nomes_instagram = ['Marina Silva', 'João Costa', 'Carla Mendes', 'Rafael Oliveira', 'Beatriz Santos'];
const nomes_twitter   = ['@NewsAgency', '@CidadãoAtivo', '@JornalistaVoice', '@VerdadePublica'];
const nomes_linkedin  = ['Carolina Tech', 'Fernando Estratéga', 'Daniela Inovação'];
const nomes_youtube   = ['Canal Notícias BR', 'Análise & Fatos', 'Voz Popular'];
const nomes_facebook  = ['Pedro Alves', 'Grupo Notícias UNIRP', 'Fórum Cidadania SP', 'Ana Paula Freitas', 'Comunidade Comunicação BR'];
const nomes_google    = ['G1 – Portal de Notícias', 'Folha de S. Paulo', 'Agência Brasil', 'UOL Notícias', 'Estadão Online', 'Blog Comunicação Pública'];
const nomes_tiktok    = ['@comunicabrasil', '@jornalistinha_sp', '@noticiasnow', '@cidadaodigital_br', '@transparenciabr'];

/* ── Conteúdos genéricos ────────────────────────────────────────── */
const conteudos_genericos = [
  'Excelente iniciativa de transparência! Muito bom ver instituições públicas modernizando seus processos.',
  'Muita preocupação com a falta de agilidade nas respostas. Cidadãos precisam de mais rapidez.',
  'Ótima comunicação da instituição. Conseguiu esclarecer bem a situação para o público.',
  'Continua faltando acesso ao serviço para população de baixa renda. Precisa melhorar cobertura.',
  'Parabéns pela transparência nas ações. Isso é o que mais apreciamos em gestão pública.',
  'Informações confusas e de difícil compreensão. Comunicação deveria ser mais clara.',
  'Que bom finalmente ter uma resposta institucional rápida. Muito profissional!',
];

const conteudos_facebook = [
  '💬 Estou acompanhando de perto as ações desta instituição. Muita coisa boa acontecendo!',
  '😤 Já mandei três mensagens e não fui atendido. Alguém mais passa por isso?',
  '👍 Compartilhando para que mais pessoas saibam das novidades! Comunicação de qualidade.',
  '❤️ Que iniciativa linda! Finalmente uma gestão que ouve o cidadão.',
  '😕 A página não responde os comentários há dias. Triste isso...',
  '🔥 Tá todo mundo falando sobre isso aqui no grupo! Vejam o link nos comentários.',
  '🤝 Parabéns à equipe envolvida. Ótimo trabalho de comunicação institucional.',
];

const trechos_google = [
  'A instituição anunciou nesta semana novas medidas voltadas à transparência pública e acesso à informação. Segundo a nota divulgada, o objetivo é ampliar o diálogo com a sociedade civil.',
  'Em meio a críticas, porta-voz confirmou que as demandas estão sendo tratadas internamente. Especialistas avaliam a resposta como adequada, mas pedem mais agilidade.',
  'Levantamento aponta crescimento de 18% na satisfação dos cidadãos após adoção do novo canal digital de comunicação lançado no último trimestre.',
  'Relatório divulgado aponta irregularidades no processo de comunicação. Entidade cobra posicionamento oficial até o fim da semana.',
  'Evento reuniu representantes e jornalistas para debate sobre comunicação pública no Brasil. Tema gerou discussão acalorada nas redes sociais.',
  'Nova plataforma digital é lançada com foco na melhoria do atendimento ao cidadão e modernização dos serviços de comunicação institucional.',
];

const titulos_google = [
  'Instituição lança novo canal de transparência pública digital',
  'Cidadãos cobram resposta mais rápida a demandas on-line',
  'Pesquisa aponta alta na aprovação de serviços de comunicação',
  'Auditoria detecta falhas no fluxo de comunicação institucional',
  'Debate reuniu especialistas para discutir comunicação pública',
  'Plataforma digital moderniza atendimento ao cidadão',
];

const conteudos_tiktok = [
  '🎯 Isso que é comunicação pública de qualidade!! #transparencia #comunicacao #institucional',
  '😱 Vocês viram o que aconteceu?! Conta nos comentários! #viral #noticiasdohoje #comunicação',
  '✅ Explicando em 60 segundos tudo que você precisa saber sobre isso 📲 #educação #informação',
  '🗣️ A VERDADE QUE NINGUÉM CONTA sobre a comunicação das instituições públicas 🧵 #denuncia #cidadão',
  '🔥 POV: você finalmente entende como funciona a assessoria de imprensa #assessoria #comunicacao #pr',
  '💡 Dica pra quem trabalha com comunicação pública! Salva esse vídeo 📌 #dica #carreira',
  '📰 Resumindo a notícia do dia em 15 segundos ⏱️ #resumo #noticia #rapido',
];

/* ── Tópicos, geolocalização e risco ────────────────────────────── */
const topicos_possiveis = [
  'Transporte Público', 'Saúde', 'Educação', 'Infraestrutura',
  'Segurança Pública', 'Meio Ambiente', 'Saneamento', 'Habitação',
  'Tecnologia & Inovação', 'Comunicação Institucional',
];

const estados_br = [
  'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná',
  'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Goiás', 'Distrito Federal',
];

const geo_dados: { estado: string; cidade: string; bairros: string[] }[] = [
  { estado: 'São Paulo',       cidade: 'São Paulo',             bairros: ['Pinheiros', 'Lapa', 'Mooca', 'Santana', 'Consolidação', 'Vila Mariana'] },
  { estado: 'São Paulo',       cidade: 'Campinas',               bairros: ['Cambuí', 'Barão Geraldo', 'Nova Campinas', 'Taquaral'] },
  { estado: 'São Paulo',       cidade: 'São José do Rio Preto',   bairros: ['Centro', 'Redentora', 'Bonfim', 'Quinta das Paineiras'] },
  { estado: 'Rio de Janeiro',   cidade: 'Rio de Janeiro',         bairros: ['Copacabana', 'Barra da Tijuca', 'Botafogo', 'Tijuca', 'Santa Teresa'] },
  { estado: 'Minas Gerais',     cidade: 'Belo Horizonte',         bairros: ['Savassi', 'Lourdes', 'Pampulha', 'Centro', 'Contagem'] },
  { estado: 'Bahia',            cidade: 'Salvador',               bairros: ['Pelourinho', 'Barra', 'Itaigara', 'Pituba', 'Ondina'] },
  { estado: 'Paraná',           cidade: 'Curitiba',               bairros: ['Bátel', 'Água Verde', 'Centro Cívico', 'Ahu', 'Cabral'] },
  { estado: 'Pernambuco',       cidade: 'Recife',                 bairros: ['Boa Viagem', 'Casa Forte', 'Espinheiro', 'Boa Vista', 'Aflitos'] },
  { estado: 'Ceará',            cidade: 'Fortaleza',              bairros: ['Meireles', 'Mucuripe', 'Aldeota', 'Benfica', 'Fátima'] },
  { estado: 'Goiás',            cidade: 'Goiânia',               bairros: ['Setor Bueno', 'Jardim América', 'Setor Sul', 'Centro', 'Marista'] },
  { estado: 'Rio Grande do Sul', cidade: 'Porto Alegre',          bairros: ['Moinhos de Vento', 'Mont Serrat', 'Petrópolis', 'Bom Fim', 'Menino Deus'] },
  { estado: 'Distrito Federal', cidade: 'Brasília',               bairros: ['Asa Norte', 'Asa Sul', 'Lago Norte', 'Sudoeste', 'Park Way'] },
];

const tags_pool = [
  'Urgente', 'Infraestrutura', 'Transparência', 'Saúde', 'Educação',
  'Segurança', 'Engajamento Alto', 'Crítica', 'Elogio', 'Mobilização',
  'Crise', 'Proposta', 'Transporte', 'Obras', 'Saneamento',
  'Cidadania', 'Meio Ambiente', 'Habitação', 'Governo', 'Fiscalização',
  'Prefeito', 'Vereador', 'Concurso Público', 'Licitálao', 'Decreto',
];

function gerarTagsIa(): string[] {
  const qtd = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...tags_pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, qtd);
}

function gerarGeo(): SocialPost['geolocalizacao'] {
  const g = pick(geo_dados);
  return { estado: g.estado, cidade: g.cidade, bairro_inferido: pick(g.bairros) };
}

const riscos_ponderados = ['baixo', 'baixo', 'medio', 'medio', 'alto'] as const;

/* ── Sentimento ponderado ───────────────────────────────────────── */
const sentimentos_ponderados = [
  'positivo', 'positivo', 'positivo',
  'neutro', 'neutro',
  'negativo', 'negativo',
] as const;

function gerarConteudo(palavra: string): string {
  const conteudo = conteudos_genericos[Math.floor(Math.random() * conteudos_genericos.length)];
  return `Sobre "${palavra}": ${conteudo}`;
}

function gerarSentimento(): SocialPost['sentimento'] {
  return sentimentos_ponderados[Math.floor(Math.random() * sentimentos_ponderados.length)];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gerarData(minutosMaximos = 7200): string {
  const agora = new Date();
  const minutosAtras = Math.floor(Math.random() * minutosMaximos);
  return new Date(agora.getTime() - minutosAtras * 60 * 1000).toISOString();
}

/* ── Função principal ───────────────────────────────────────────── */
export async function buscarMencoesRedes(
  palavrasChave: string[],
  redes?: RedeDisponivel[]
): Promise<SocialPost[]> {
  // Simula delay de chamada API
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  const redesParaBuscar: RedeDisponivel[] = redes ?? ['instagram', 'twitter', 'linkedin', 'youtube', 'facebook', 'google', 'tiktok'];
  const resultado: SocialPost[] = [];

  redesParaBuscar.forEach(rede => {
    const quantidade = 2 + Math.floor(Math.random() * 4); // 2–5 posts por rede

    for (let i = 0; i < quantidade; i++) {
      const palavra = pick(palavrasChave);

      let autor: string;
      let handle: string;
      let url_perfil: string;
      let url_post: string;
      let conteudo: string;
      let titulo_materia: string | undefined;
      let visualizacoes: number | undefined;
      let engajamento: SocialPost['engajamento'];

      switch (rede) {
        case 'instagram': {
          autor = pick(nomes_instagram);
          handle = `@${autor.toLowerCase().replace(/\s+/g, '_')}`;
          url_perfil = `https://instagram.com/${handle.slice(1)}`;
          url_post   = `https://instagram.com/p/${Math.random().toString(36).slice(2, 13)}/`;
          conteudo = `Sobre "${palavra}": ${pick(conteudos_genericos)}`;
          engajamento = {
            curtidas: Math.floor(Math.random() * 800) + 50,
            comentarios: Math.floor(Math.random() * 80) + 5,
            compartilhamentos: Math.floor(Math.random() * 40) + 2,
          };
          break;
        }
        case 'twitter': {
          const nomeTw = pick(nomes_twitter);
          autor = nomeTw.replace('@', '');
          handle = nomeTw;
          url_perfil = `https://x.com/${autor}`;
          url_post   = `https://x.com/${autor}/status/${Date.now()}${Math.floor(Math.random() * 999)}`;
          conteudo = `Sobre "${palavra}": ${pick(conteudos_genericos)}`;
          engajamento = {
            curtidas: Math.floor(Math.random() * 1200) + 30,
            comentarios: Math.floor(Math.random() * 150) + 5,
            compartilhamentos: Math.floor(Math.random() * 300) + 10,
          };
          break;
        }
        case 'linkedin': {
          autor = pick(nomes_linkedin);
          handle = autor.toLowerCase().replace(/\s+/g, '-');
          url_perfil = `https://linkedin.com/in/${handle}`;
          url_post   = `https://linkedin.com/posts/${handle}-activity-${Date.now()}`;
          conteudo = `Sobre "${palavra}": ${pick(conteudos_genericos)}`;
          engajamento = {
            curtidas: Math.floor(Math.random() * 300) + 20,
            comentarios: Math.floor(Math.random() * 60) + 3,
            compartilhamentos: Math.floor(Math.random() * 80) + 5,
          };
          break;
        }
        case 'youtube': {
          autor = pick(nomes_youtube);
          handle = `@${autor.toLowerCase().replace(/[\s&]+/g, '')}`;
          url_perfil = `https://youtube.com/${handle}`;
          url_post   = `https://youtube.com/watch?v=${Math.random().toString(36).slice(2, 13)}`;
          conteudo = `Sobre "${palavra}": ${pick(conteudos_genericos)}`;
          engajamento = {
            curtidas: Math.floor(Math.random() * 2000) + 100,
            comentarios: Math.floor(Math.random() * 200) + 10,
            compartilhamentos: Math.floor(Math.random() * 100) + 5,
          };
          break;
        }
        case 'facebook': {
          autor = pick(nomes_facebook);
          handle = `@${autor.toLowerCase().replace(/\s+/g, '')}`;
          url_perfil = `https://facebook.com/${handle.slice(1)}`;
          url_post   = `https://facebook.com/${handle.slice(1)}/posts/${Date.now()}`;
          conteudo = `[Menção a "${palavra}"] ${pick(conteudos_facebook)}`;
          engajamento = {
            curtidas: Math.floor(Math.random() * 1500) + 80,
            comentarios: Math.floor(Math.random() * 120) + 10,
            compartilhamentos: Math.floor(Math.random() * 400) + 20,
          };
          break;
        }
        case 'google': {
          autor = pick(nomes_google);
          handle = autor.toLowerCase().replace(/[^\w]+/g, '').slice(0, 15) + '.com.br';
          url_perfil = `https://${handle}`;
          url_post   = `https://${handle}/noticia/${palavra.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
          titulo_materia = pick(titulos_google).replace('comunicação', palavra).replace('comunicao', palavra);
          conteudo = pick(trechos_google);
          engajamento = {
            curtidas: 0,
            comentarios: Math.floor(Math.random() * 80),
            compartilhamentos: Math.floor(Math.random() * 3000) + 100,
          };
          break;
        }
        case 'tiktok': {
          const tikHandle = pick(nomes_tiktok);
          autor = tikHandle.replace('@', '');
          handle = tikHandle;
          url_perfil = `https://tiktok.com/${tikHandle}`;
          url_post   = `https://tiktok.com/${tikHandle}/video/${Date.now()}`;
          conteudo = `#${palavra.replace(/\s+/g, '')} ${pick(conteudos_tiktok)}`;
          visualizacoes = Math.floor(Math.random() * 1_900_000) + 50_000;
          engajamento = {
            curtidas: Math.floor(Math.random() * 180_000) + 5_000,
            comentarios: Math.floor(Math.random() * 8_000) + 200,
            compartilhamentos: Math.floor(Math.random() * 25_000) + 500,
          };
          break;
        }
        default: {
          autor = 'Usuário';
          handle = '@usuario';
          url_perfil = '#';
          url_post = '#';
          conteudo = gerarConteudo(palavra);
          engajamento = { curtidas: 10, comentarios: 2, compartilhamentos: 1 };
        }
      }

      const geo = gerarGeo();

      resultado.push({
        id: `${rede}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        rede,
        autor,
        handle,
        foto_perfil: `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`,
        conteudo,
        ...(titulo_materia ? { titulo_materia } : {}),
        ...(visualizacoes !== undefined ? { visualizacoes } : {}),
        data: gerarData(),
        engajamento,
        metricas: { likes: engajamento.curtidas, comments: engajamento.comentarios, shares: engajamento.compartilhamentos },
        sentimento: gerarSentimento(),
        url_perfil,
        url_post,
        url_original: url_perfil,
        topico: pick(topicos_possiveis),
        risco: pick(riscos_ponderados),
        geo: geo.estado,
        geolocalizacao: geo,
        tags_ia: gerarTagsIa(),
      });
    }
  });

  return resultado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export const redesDisponiveis: RedeDisponivel[] = [
  'instagram',
  'twitter',
  'linkedin',
  'youtube',
  'facebook',
  'google',
  'tiktok',
];
