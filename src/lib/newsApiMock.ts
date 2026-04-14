/**
 * Mock News API Service
 * Simula busca de notícias quando sem chave da NewsAPI ou Google News API
 */

export interface NewsArticle {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  url: string;
  dataPublicacao: string;
  imagem?: string;
  pais?: string;
}

const fontesNacionais = [
  'Folha de S.Paulo',
  'O Globo',
  'Valor Econômico',
  'Estadão',
  'G1',
  'CNN Brasil',
  'Agência Brasil',
  'Exame',
  'IstoÉ',
  'Veja'
];

const fontesInternacionais = {
  'USA': ['AP News', 'Reuters', 'Bloomberg', 'Wall Street Journal', 'New York Times'],
  'China': ['Xinhua News', 'China Daily', 'CCTV'],
  'Europa': ['BBC', 'DW', 'France24', 'El País', 'Guardian'],
  'América Latina': ['Clarín', 'La Nación', 'O Mercurio', 'Reforma'],
  'Ásia': ['Asia Times', 'Bangkok Post', 'Japan Times'],
  'Oceania': ['ABC News', 'NZ Herald'],
  'África': ['AfricaNews', 'Pulse Nigeria', 'Business Insider Africa']
};

const titulosTemplate = [
  'Análise de impacto e tendências no setor',
  'Novas regulamentações afetam mercado',
  'Especialistas discutem perspectivas futuras',
  'Investimentos crescem em novo segmento',
  'Desafios econômicos e oportunidades',
  'Transformação digital acelera na região',
  'Parceria estratégica anuncia expansão',
  'Pesquisa revela mudanças importantes',
  'Autoridades anunciam novas medidas',
  'Setor experimenta crescimento robusto',
  'Inovação tecnológica muda cenário',
  'Consumidores demandam maior transparência',
  'Questões ambientais ganham destaque',
  'Criação de empregos supera expectativas',
  'Startups inovam em segmento crítico'
];

function gerarDescricao(): string {
  const descricoes = [
    'Desenvolvimento significativo marca o período. Análise de especialistas indica cenário promissor para os próximos trimestres.',
    'Mudanças importantes no panorama regulatório afetam estratégias de mercado. Instituições se adaptam às novas exigências.',
    'Pesquisa revela tendências de comportamento do consumidor. Dados indicam preferências bem definidas para próximas fases.',
    'Inovação tecnológica abre novas possibilidades. Especialistas avaliam impacto nas operações tradicionais.',
    'Questões estratégicas ganham relevância. Tomadores de decisão discutem direcionamentos futuros necessários.'
  ];
  return descricoes[Math.floor(Math.random() * descricoes.length)];
}

export async function buscarNoticiasAutomatico(
  palavrasChave: string[],
  abrangencia: 'nacional' | 'internacional' = 'nacional',
  paises?: string[]
): Promise<NewsArticle[]> {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const noticiasGeradas: NewsArticle[] = [];
  const quantidadeNoticias = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < quantidadeNoticias; i++) {
    const palavra = palavrasChave[Math.floor(Math.random() * palavrasChave.length)];
    const agora = new Date();
    const diasAtras = Math.floor(Math.random() * 7);
    const data = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    let fonte: string;
    let pais: string;

    if (abrangencia === 'nacional') {
      fonte = fontesNacionais[Math.floor(Math.random() * fontesNacionais.length)];
      pais = 'Brasil';
    } else {
      // Internacional
      const paisAlvo = paises && paises.length > 0
        ? paises[Math.floor(Math.random() * paises.length)]
        : Object.keys(fontesInternacionais)[Math.floor(Math.random() * Object.keys(fontesInternacionais).length)];
      
      const fontesDoP = (fontesInternacionais as any)[paisAlvo] || fontesInternacionais['Europa'];
      fonte = fontesDoP[Math.floor(Math.random() * fontesDoP.length)];
      pais = paisAlvo;
    }

    const tituloTemplate = titulosTemplate[Math.floor(Math.random() * titulosTemplate.length)];
    const titulo = `${palavra}: ${tituloTemplate}`;

    noticiasGeradas.push({
      id: `mock-${Date.now()}-${i}`,
      titulo,
      descricao: gerarDescricao(),
      fonte,
      pais,
      url: `https://exemplo-noticia.com/${i}`,
      dataPublicacao: data.toISOString().split('T')[0],
      imagem: `https://via.placeholder.com/300x200?text=${encodeURIComponent(fonte)}`
    });
  }

  return noticiasGeradas;
}

export const paisesInternacionais = Object.keys(fontesInternacionais);
