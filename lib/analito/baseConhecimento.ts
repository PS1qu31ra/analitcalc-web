import type { LinhaConhecimento } from "./tipos";

export const baseConhecimento: LinhaConhecimento[] = [
  {
    modulo: "geral",
    topico: "Titulação",
    intencao: "conceito",
    assunto: "titulacao",
    palavrasChave: [
      "titulação",
      "titulacao",
      "titulção",
      "titulcao",
      "análise volumétrica",
      "analise volumetrica",
      "o que é titulação",
      "oque é titulação",
      "o que é titulacao",
      "oque é titulacao",
    ],
    termosContexto: [
      "titulante",
      "titulado",
      "curva de titulação",
      "ponto de equivalência",
    ],
    perguntaBase: "O que é uma titulação?",
    respostaCurta:
      "Titulação é um método analítico usado para determinar a quantidade ou concentração de uma substância por meio de uma reação química.",
    respostaCompleta:
      "Na titulação, uma solução de concentração conhecida é adicionada gradualmente à amostra até que a reação entre elas atinja o ponto de equivalência. Esse método é amplamente utilizado em diferentes tipos de análises químicas para determinar concentrações de forma precisa.",
    quandoUsar: [
      "significado de titulação",
      "análise volumétrica",
      "método de determinação de concentração",
    ],
    quandoNaoUsar: [
      "curva de titulação específica",
      "indicador",
      "ponto de equivalência específico",
    ],
    prioridade: 10,
  },
  {
    modulo: "complexometria",
    topico: "Ligante auxiliar",
    intencao: "conceito",
    assunto: "ligante_auxiliar",
    palavrasChave: [
      "complexante auxiliar",
      "ligante auxiliar",
      "agente auxiliar",
      "complexante secundário",
      "complexante secundario",
      "complexante de apoio",
      "amônia",
      "amonia",
      "nh3",
    ],
    termosContexto: [
      "complexante auxiliar",
      "ligante auxiliar",
      "α(M livre)",
      "denominador β",
      "Kf efetivo",
    ],
    perguntaBase: "O que é um complexante auxiliar?",
    respostaCurta:
      "Complexante auxiliar é uma espécie que também se liga ao metal e altera sua disponibilidade para reagir com o EDTA.",
    respostaCompleta:
      "Um complexante auxiliar, também chamado de ligante auxiliar, é uma espécie adicionada ou considerada no sistema porque pode se ligar ao metal principal. Ele pode ajudar a manter o metal em solução, evitar precipitação ou controlar a concentração de metal livre. Porém, como também compete com o EDTA, ele pode alterar o Kf efetivo e precisa ser considerado na interpretação da titulação.",
    quandoUsar: [
      "complexante auxiliar",
      "ligante auxiliar",
      "agente auxiliar",
      "amônia",
      "outro ligante ligado ao metal",
    ],
    quandoNaoUsar: [
      "EDTA como titulante principal",
      "mascarante",
      "indicador",
      "interferente metálico",
    ],
    prioridade: 10,
  },
  {
    modulo: "complexometria",
    topico: "Ligante auxiliar",
    intencao: "interpretacao",
    assunto: "ligante_auxiliar",
    palavrasChave: [
      "por que usa complexante auxiliar",
      "pq usa complexante auxiliar",
      "para que serve complexante auxiliar",
      "por que usar ligante auxiliar",
      "função do complexante auxiliar",
      "funcao do complexante auxiliar",
    ],
    termosContexto: [
      "complexante auxiliar",
      "ligante auxiliar",
      "α(M livre)",
      "denominador β",
      "Kf efetivo",
      "precipitação",
    ],
    perguntaBase: "Por que se usa um complexante auxiliar?",
    respostaCurta:
      "Usa-se um complexante auxiliar para controlar a disponibilidade do metal e melhorar as condições da titulação.",
    respostaCompleta:
      "Um complexante auxiliar pode ser usado para manter o metal dissolvido, evitar precipitação, controlar a concentração de metal livre ou melhorar a seletividade da titulação. Ao mesmo tempo, ele pode competir com o EDTA pelo metal, alterando o Kf efetivo. Por isso, seu efeito precisa ser considerado no equilíbrio do sistema.",
    quandoUsar: [
      "por que usar complexante auxiliar",
      "função do ligante auxiliar",
      "efeito da amônia",
      "controle de metal livre",
    ],
    quandoNaoUsar: [
      "Kf efetivo isolado",
      "EDTA como titulante",
      "mascarante",
      "interferente metálico",
    ],
    prioridade: 10,
  },
];