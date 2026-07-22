import type {
  MetodoPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
} from "./tipos";

const IDS_SAIS_HALOGENETOS_PRATA = new Set([
  "AgCl",
  "AgBr",
  "AgI",
]);

function resultadoValido(
  resultado: ResultadoTitulacaoDiretaPrecipitacao | null
) {
  return (
    resultado !== null &&
    resultado.status !== "dados_invalidos"
  );
}

function ordenarMetodos(
  metodos: MetodoPrecipitacao[]
) {
  const pesoStatus: Record<
    MetodoPrecipitacao["status"],
    number
  > = {
    recomendado: 0,
    possivel: 1,
    nao_recomendado: 2,
  };

  return [...metodos].sort(
    (metodoA, metodoB) =>
      pesoStatus[metodoA.status] -
      pesoStatus[metodoB.status]
  );
}

export function avaliarMetodosPrecipitacao(
  resultado: ResultadoTitulacaoDiretaPrecipitacao | null
): MetodoPrecipitacao[] {
  if (!resultadoValido(resultado)) {
    return [
      {
        id: "potenciometrico",
        nome: "Potenciometria",
        principio:
          "Acompanha a variação do potencial relacionada à concentração livre de uma espécie eletroativa.",
        status: "possivel",
        justificativa:
          "Informe dados válidos da titulação para que o sistema possa comparar os métodos de determinação do ponto final.",
      },
    ];
  }

  if (!resultado) {
    return [];
  }

  const sal = resultado.sal;

  const formulaAnalito =
    resultado.especieAnalito === "cation"
      ? sal.cation.formulaExibicao
      : sal.anion.formulaExibicao;

  const formulaTitulante =
    resultado.especieTitulante === "cation"
      ? sal.cation.formulaExibicao
      : sal.anion.formulaExibicao;

  const titulanteEhPrata =
    resultado.especieTitulante === "cation" &&
    sal.cation.id === "Ag+";

  const analitoEhHaleto =
    resultado.especieAnalito === "anion" &&
    (
      sal.anion.id === "Cl-" ||
      sal.anion.id === "Br-" ||
      sal.anion.id === "I-"
    );

  const salEhHalogenetoPrata =
    IDS_SAIS_HALOGENETOS_PRATA.has(
      sal.id
    );

  const ehAgCl = sal.id === "AgCl";
  const ehAgBr = sal.id === "AgBr";
  const ehAgI = sal.id === "AgI";
  const ehAgSCN = sal.id === "AgSCN";
  const ehAg2CrO4 =
    sal.id === "Ag2CrO4";

  const metodos: MetodoPrecipitacao[] =
    [];

  /*
   * POTENCIOMETRIA
   *
   * É o método mais geral entre os avaliados, desde
   * que exista eletrodo apropriado para acompanhar
   * uma das espécies livres.
   */
  metodos.push({
    id: "potenciometrico",
    nome: "Potenciometria",
    principio:
      "Determina o ponto final pela variação do potencial de um eletrodo sensível à espécie livre presente na solução.",
    status: "recomendado",
    justificativa:
      `É uma alternativa geral para acompanhar a titulação de ${formulaAnalito} com ${formulaTitulante}, especialmente quando a mudança visual de um indicador é pouco nítida ou quando a amostra é colorida ou turva.`,
  });

  /*
   * MÉTODO DE MOHR
   *
   * Aplicação clássica:
   *
   * Cl⁻ ou Br⁻ titulados diretamente com Ag⁺,
   * usando CrO₄²⁻ como indicador.
   *
   * O ponto final é indicado pela formação persistente
   * de Ag₂CrO₄ após o consumo do haleto.
   */
  let statusMohr:
    MetodoPrecipitacao["status"];

  let justificativaMohr: string;

  if (
    titulanteEhPrata &&
    analitoEhHaleto &&
    (ehAgCl || ehAgBr)
  ) {
    statusMohr = "recomendado";

    justificativaMohr =
      `O método de Mohr é adequado para a titulação direta de ${formulaAnalito} com ${formulaTitulante}. Após o consumo do analito, um pequeno excesso de Ag⁺ reage com o cromato indicador e forma Ag₂CrO₄, produzindo a mudança visual do ponto final. O meio deve permanecer aproximadamente neutro ou levemente alcalino.`;
  } else if (ehAgI) {
    statusMohr = "nao_recomendado";

    justificativaMohr =
      "O método de Mohr não é normalmente recomendado para iodeto. A forte adsorção do iodeto e do cromato sobre o AgI pode tornar o ponto final impreciso.";
  } else if (ehAg2CrO4) {
    statusMohr = "nao_recomendado";

    justificativaMohr =
      "O cromato é o próprio indicador do método de Mohr. Não é coerente utilizá-lo como indicador quando o sistema principal já envolve a formação de Ag₂CrO₄.";
  } else if (
    titulanteEhPrata &&
    analitoEhHaleto
  ) {
    statusMohr = "possivel";

    justificativaMohr =
      "O sistema envolve um haleto titulado com Ag⁺, mas a adequação do método de Mohr depende da identidade do haleto e das condições experimentais. Sua aplicação clássica é mais confiável para Cl⁻ e Br⁻.";
  } else {
    statusMohr = "nao_recomendado";

    justificativaMohr =
      `O método de Mohr é destinado principalmente à titulação direta de Cl⁻ ou Br⁻ com Ag⁺. O sistema selecionado envolve ${formulaAnalito} e ${formulaTitulante}, portanto não corresponde à aplicação clássica do método.`;
  }

  metodos.push({
    id: "mohr",
    nome: "Método de Mohr",
    principio:
      "Utiliza cromato como indicador. Após o consumo do haleto, o primeiro excesso persistente de Ag⁺ forma Ag₂CrO₄ de coloração vermelho-tijolo.",
    status: statusMohr,
    justificativa: justificativaMohr,
  });

  /*
   * MÉTODO DE VOLHARD
   *
   * Aplicação clássica:
   *
   * Ag⁺ é titulado com SCN⁻ em meio ácido,
   * usando Fe³⁺ como indicador.
   *
   * Para haletos, geralmente é empregado por retorno:
   *
   * 1. adiciona-se excesso conhecido de Ag⁺;
   * 2. o haleto precipita;
   * 3. o Ag⁺ restante é titulado com SCN⁻.
   */
  let statusVolhard:
    MetodoPrecipitacao["status"];

  let justificativaVolhard: string;

  if (ehAgSCN) {
    statusVolhard = "recomendado";

    justificativaVolhard =
      "O sistema Ag⁺/SCN⁻ corresponde diretamente à reação titulométrica do método de Volhard. O excesso de SCN⁻ é detectado pela formação do complexo avermelhado com Fe³⁺ em meio ácido.";
  } else if (
    salEhHalogenetoPrata &&
    analitoEhHaleto
  ) {
    statusVolhard = "possivel";

    justificativaVolhard =
      `O método de Volhard pode ser utilizado para determinar ${formulaAnalito} por retrotitulação. Adiciona-se uma quantidade conhecida e excessiva de Ag⁺, precipita-se o haleto e titula-se o Ag⁺ restante com SCN⁻ em meio ácido.`;
  } else if (
    resultado.especieAnalito === "cation" &&
    sal.cation.id === "Ag+"
  ) {
    statusVolhard = "recomendado";

    justificativaVolhard =
      "O método de Volhard é diretamente aplicável à determinação de Ag⁺ por titulação com SCN⁻ em meio ácido, usando Fe³⁺ como indicador.";
  } else {
    statusVolhard = "nao_recomendado";

    justificativaVolhard =
      `O método de Volhard é destinado principalmente à determinação de Ag⁺ ou de haletos por retorno. O sistema selecionado, baseado em ${sal.formulaExibicao}, não corresponde diretamente a essa aplicação.`;
  }

  metodos.push({
    id: "volhard",
    nome: "Método de Volhard",
    principio:
      "Titula Ag⁺ com SCN⁻ em meio ácido. Após o consumo da prata, o primeiro excesso de SCN⁻ forma um complexo vermelho com Fe³⁺.",
    status: statusVolhard,
    justificativa: justificativaVolhard,
  });

  /*
   * MÉTODO DE FAJANS
   *
   * O indicador é adsorvido na superfície do precipitado
   * quando ocorre a inversão da carga superficial próxima
   * ao ponto de equivalência.
   *
   * A adequação depende de:
   *
   * - precipitado finamente dividido;
   * - indicador apropriado;
   * - pH controlado;
   * - baixa interferência de outros íons;
   * - ausência de coagulação excessiva.
   */
  let statusFajans:
    MetodoPrecipitacao["status"];

  let justificativaFajans: string;

  if (
    titulanteEhPrata &&
    (ehAgCl || ehAgBr)
  ) {
    statusFajans = "recomendado";

    justificativaFajans =
      `O precipitado ${sal.formulaExibicao} pode apresentar mudança de carga superficial próxima ao ponto de equivalência, permitindo o uso de um indicador de adsorção apropriado. O pH, a força iônica e a dispersão do precipitado devem ser controlados.`;
  } else if (
    titulanteEhPrata &&
    ehAgI
  ) {
    statusFajans = "possivel";

    justificativaFajans =
      "Indicadores de adsorção podem ser empregados em alguns sistemas com AgI, mas a forte adsorção e as características superficiais do precipitado exigem seleção cuidadosa do indicador e das condições experimentais.";
  } else if (salEhHalogenetoPrata) {
    statusFajans = "possivel";

    justificativaFajans =
      `O sistema forma ${sal.formulaExibicao}, que pode permitir o uso de indicador de adsorção. Entretanto, a adequação depende da ordem de adição dos reagentes e da carga superficial predominante perto do ponto final.`;
  } else {
    statusFajans = "nao_recomendado";

    justificativaFajans =
      `O método de Fajans depende de uma mudança previsível na carga superficial do precipitado e da adsorção seletiva de um indicador. Não há, para ${sal.formulaExibicao}, uma aplicação geral tão estabelecida quanto nos haletos de prata.`;
  }

  metodos.push({
    id: "fajans",
    nome: "Método de Fajans",
    principio:
      "Utiliza um indicador de adsorção cuja cor muda quando ele é adsorvido na superfície do precipitado após a inversão da carga superficial próxima ao ponto final.",
    status: statusFajans,
    justificativa: justificativaFajans,
  });

  return ordenarMetodos(metodos);
}