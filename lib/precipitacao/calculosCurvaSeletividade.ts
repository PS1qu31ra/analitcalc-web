import {
  classificarSeparacaoPorPercentual,
} from "./classificacaoSeparacao";

import type {
  AvaliacaoSeparacaoPrecipitacao,
  ResultadoItemSeletividadePrecipitacao,
  ResultadoSeletividadePrecipitacao,
  SalPrecipitacao,
} from "./tipos";

export type PontoCurvaSeletividadePrecipitacao = {
  volumeAdicionado: number;
  volumeTotal: number;
  concentracaoTitulanteLivre: number;
  pTitulante: number;
  concentracaoAnalitoLivre: number;
  percentualPrecipitado: number;
  regiao:
    | "Antes da precipitação"
    | "Durante a precipitação"
    | "No ponto de equivalência"
    | "Após a precipitação";
};

export type SerieCurvaSeletividadePrecipitacao = {
  sal: SalPrecipitacao;
  formulaPrecipitado: string;
  ordemPrecipitacao: number;
  volumeInicio: number;
  volumeEquivalencia: number;
  pontos: PontoCurvaSeletividadePrecipitacao[];
};

export type StatusSeparacaoQuantitativa =
  | "atende"
  | "nao_atende"
  | "nao_avaliada";

  export type ComparacaoKpsSeletividade = {
    primeiroSal: SalPrecipitacao;
  
    segundoSal: SalPrecipitacao;
  
    /**
     * Informações auxiliares.
     *
     * A razão entre Kps não é o critério predominante
     * da classificação de seletividade.
     */
    razaoKps: number;
  
    logRazaoKps: number;
  
    /**
     * Volume da mistura no qual o segundo precipitado
     * começa a se formar.
     *
     * null indica que esse início não foi localizado
     * dentro do intervalo calculado.
     */
    volumeInicioSegundo:
      number | null;
  
    /**
     * Nova classificação predominante.
     *
     * Baseada no percentual do primeiro analito já
     * precipitado quando o segundo precipitado começa
     * a se formar.
     */
    avaliacao:
      AvaliacaoSeparacaoPrecipitacao;
  
    /**
     * Campos mantidos temporariamente para
     * compatibilidade com componentes antigos.
     */
    statusSeparacaoQuantitativa:
      StatusSeparacaoQuantitativa;
  
    atendeCriterioConfiabilidade:
      boolean | null;
  
    fracaoPrimeiroPrecipitada:
      number | null;
  
    interpretacao: string;
  };

  export type EstadoEspecieNoPontoSeletividade =
  | "nao_iniciada"
  | "inicio"
  | "em_precipitacao"
  | "majoritariamente_precipitada"
  | "praticamente_completa";

export type RegiaoPontoMisturaSeletividade =
  | "antes_da_primeira_precipitacao"
  | "precipitacao_seletiva"
  | "inicio_de_coprecipitacao"
  | "coprecipitacao"
  | "apos_precipitacao"
  | "nao_avaliada";

export type AvaliacaoItemPontoSeletividade = {
  sal: SalPrecipitacao;
  formulaPrecipitado: string;
  ordemPrecipitacao: number;

  concentracaoAnalitoTotal: number;
  concentracaoAnalitoLivre: number;

  molAnalitoInicial: number;
  molAnalitoLivre: number;
  molAnalitoPrecipitado: number;

  percentualPrecipitado: number;
  percentualEmSolucao: number;

  estado: EstadoEspecieNoPontoSeletividade;
  descricaoEstado: string;

  iniciouPrecipitacao: boolean;
  praticamenteCompleta: boolean;
};

export type AvaliacaoPontoSeletividadePrecipitacao = {
  status: "adequado" | "invalido";

  volumeAdicionado: number;
  volumeAmostra: number;
  volumeTotal: number;

  molTitulanteAdicionado: number;
  concentracaoTitulanteFormal: number;
  concentracaoTitulanteLivre: number;
  pTitulante: number | null;

  percentualPrecipitadoMistura: number;
  percentualEmSolucaoMistura: number;

  regiao: RegiaoPontoMisturaSeletividade;
  tituloRegiao: string;
  interpretacao: string;

  quantidadeEspeciesIniciadas: number;
  quantidadeEspeciesPraticamenteCompletas: number;

  primeiraEspecie: AvaliacaoItemPontoSeletividade | null;
  segundaEspecie: AvaliacaoItemPontoSeletividade | null;

  itens: AvaliacaoItemPontoSeletividade[];

  formulaTitulante: string;

  dentroIntervaloCalculado: boolean;
  volumeMaximoAvaliado: number;

  mensagemErro: string | null;
};

export type CurvaSeletividadePrecipitacao = {
  serieMistura: {
    nome: string;
    pontos: PontoCurvaSeletividadePrecipitacao[];
  };

  seriesIsoladas: SerieCurvaSeletividadePrecipitacao[];

  /**
   * Mantido para compatibilidade com o gráfico antigo.
   */
  series: SerieCurvaSeletividadePrecipitacao[];

  comparacoesKps: ComparacaoKpsSeletividade[];

  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximo: number;
  passo: number;
  formulaTitulante: string;
};

const MAX_ITERACOES_BISSECAO = 250;
const TOLERANCIA_RELATIVA = 1e-12;

/**
 * Fração mínima usada apenas para identificar numericamente
 * o primeiro traço de um precipitado na mistura.
 *
 * Não representa precipitação quantitativa.
 */
const FRACAO_MINIMA_INICIO_PRECIPITACAO =
  1e-10;

function ehNumeroPositivo(valor: number) {
  return Number.isFinite(valor) && valor > 0;
}

function limitar(
  valor: number,
  minimo: number,
  maximo: number
) {
  return Math.min(
    Math.max(valor, minimo),
    maximo
  );
}

function obterCoeficienteAnalito(
  item: ResultadoItemSeletividadePrecipitacao
) {
  return item.especieAnalito === "cation"
    ? item.sal.coeficienteCation
    : item.sal.coeficienteAnion;
}

function obterCoeficienteTitulante(
  item: ResultadoItemSeletividadePrecipitacao
) {
  return item.especieTitulante === "cation"
    ? item.sal.coeficienteCation
    : item.sal.coeficienteAnion;
}

function obterFormulaTitulante(
  item: ResultadoItemSeletividadePrecipitacao
) {
  return item.especieTitulante === "cation"
    ? item.sal.cation.formulaExibicao
    : item.sal.anion.formulaExibicao;
}

function calcularMolAnalitoInicial({
  item,
  volumeAmostra,
}: {
  item: ResultadoItemSeletividadePrecipitacao;
  volumeAmostra: number;
}) {
  return (
    item.concentracaoAnalito *
    (volumeAmostra / 1000)
  );
}

function calcularMolTitulanteEquivalenciaItem({
  item,
  volumeAmostra,
}: {
  item: ResultadoItemSeletividadePrecipitacao;
  volumeAmostra: number;
}) {
  const coeficienteAnalito =
    obterCoeficienteAnalito(item);

  const coeficienteTitulante =
    obterCoeficienteTitulante(item);

  const molAnalito =
    calcularMolAnalitoInicial({
      item,
      volumeAmostra,
    });

  return (
    molAnalito *
    (
      coeficienteTitulante /
      coeficienteAnalito
    )
  );
}

/**
 * Para uma concentração livre de titulante T, calcula
 * a concentração livre do analito em equilíbrio com
 * o precipitado:
 *
 * Kps = [A]^a × [T]^t
 *
 * Quando a concentração prevista pelo Kps é maior que
 * a concentração analítica total do analito, ainda não
 * há precipitado:
 *
 * [A]livre = [A]total
 */
function calcularAnalitoLivreParaTitulante({
  item,
  concentracaoAnalitoTotal,
  concentracaoTitulanteLivre,
}: {
  item: ResultadoItemSeletividadePrecipitacao;
  concentracaoAnalitoTotal: number;
  concentracaoTitulanteLivre: number;
}) {
  if (concentracaoTitulanteLivre <= 0) {
    return concentracaoAnalitoTotal;
  }

  const coeficienteAnalito =
    obterCoeficienteAnalito(item);

  const coeficienteTitulante =
    obterCoeficienteTitulante(item);

  /*
   * O cálculo em logaritmos reduz problemas numéricos
   * para valores de Kps muito pequenos.
   */
  const logAnalitoEquilibrio =
    (
      Math.log(item.sal.kps) -
      coeficienteTitulante *
        Math.log(concentracaoTitulanteLivre)
    ) /
    coeficienteAnalito;

  const concentracaoAnalitoEquilibrio =
    Math.exp(logAnalitoEquilibrio);

  return limitar(
    concentracaoAnalitoEquilibrio,
    0,
    concentracaoAnalitoTotal
  );
}

/**
 * Resolve simultaneamente todos os precipitados que
 * compartilham o mesmo titulante.
 *
 * A incógnita é a concentração livre do titulante.
 *
 * Balanço do titulante:
 *
 * nT,adicionado =
 * [T]livre × Vtotal +
 * Σ nT,consumido,i
 */
function resolverEquilibrioMistura({
  itens,
  volumeAmostra,
  volumeAdicionado,
  concentracaoTitulante,
}: {
  itens: ResultadoItemSeletividadePrecipitacao[];
  volumeAmostra: number;
  volumeAdicionado: number;
  concentracaoTitulante: number;
}) {
  const volumeTotalLitros =
    (
      volumeAmostra +
      volumeAdicionado
    ) / 1000;

  const molTitulanteAdicionado =
    concentracaoTitulante *
    (volumeAdicionado / 1000);

  const dadosItens = itens.map(
    (item) => {
      const molAnalitoInicial =
        calcularMolAnalitoInicial({
          item,
          volumeAmostra,
        });

      return {
        item,
        molAnalitoInicial,

        concentracaoAnalitoTotal:
          molAnalitoInicial /
          volumeTotalLitros,

        coeficienteAnalito:
          obterCoeficienteAnalito(item),

        coeficienteTitulante:
          obterCoeficienteTitulante(item),
      };
    }
  );

  /*
   * Sem titulante adicionado, nenhum precipitado
   * pode ter sido formado pelo processo de titulação.
   */
  if (molTitulanteAdicionado <= 0) {
    return {
      concentracaoTitulanteLivre: 0,

      itens: dadosItens.map(
        (dado) => ({
          ...dado,

          concentracaoAnalitoLivre:
            dado.concentracaoAnalitoTotal,

          molAnalitoPrecipitado: 0,

          percentualPrecipitado: 0,
        })
      ),
    };
  }

  function avaliarBalanço(
    concentracaoTitulanteLivre: number
  ) {
    let molTitulanteConsumido = 0;

    const resultados =
      dadosItens.map(
        (dado) => {
          const concentracaoAnalitoLivre =
            calcularAnalitoLivreParaTitulante({
              item: dado.item,

              concentracaoAnalitoTotal:
                dado.concentracaoAnalitoTotal,

              concentracaoTitulanteLivre,
            });

          const molAnalitoLivre =
            concentracaoAnalitoLivre *
            volumeTotalLitros;

          const molAnalitoPrecipitado =
            limitar(
              dado.molAnalitoInicial -
                molAnalitoLivre,

              0,
              dado.molAnalitoInicial
            );

          molTitulanteConsumido +=
            molAnalitoPrecipitado *
            (
              dado.coeficienteTitulante /
              dado.coeficienteAnalito
            );

          return {
            ...dado,

            concentracaoAnalitoLivre,

            molAnalitoPrecipitado,

            percentualPrecipitado:
              dado.molAnalitoInicial > 0
                ? (
                    molAnalitoPrecipitado /
                    dado.molAnalitoInicial
                  ) * 100
                : NaN,
          };
        }
      );

    const molTitulanteCalculado =
      concentracaoTitulanteLivre *
        volumeTotalLitros +
      molTitulanteConsumido;

    return {
      erro:
        molTitulanteCalculado -
        molTitulanteAdicionado,

      resultados,
    };
  }

  let limiteInferior = 0;

  /*
   * A concentração livre nunca pode ser maior que
   * a concentração formal obtida caso nenhum
   * titulante fosse consumido.
   */
  let limiteSuperior =
    molTitulanteAdicionado /
    volumeTotalLitros;

  let melhor =
    avaliarBalanço(limiteSuperior);

  for (
    let iteracao = 0;
    iteracao < MAX_ITERACOES_BISSECAO;
    iteracao += 1
  ) {
    const meio =
      (
        limiteInferior +
        limiteSuperior
      ) / 2;

    const avaliacao =
      avaliarBalanço(meio);

    melhor = avaliacao;

    const escala =
      Math.max(
        molTitulanteAdicionado,
        1e-30
      );

    if (
      Math.abs(avaliacao.erro) /
        escala <=
      TOLERANCIA_RELATIVA
    ) {
      return {
        concentracaoTitulanteLivre:
          meio,

        itens:
          avaliacao.resultados,
      };
    }

    if (avaliacao.erro > 0) {
      limiteSuperior = meio;
    } else {
      limiteInferior = meio;
    }
  }

  const concentracaoTitulanteLivre =
    (
      limiteInferior +
      limiteSuperior
    ) / 2;

  melhor =
    avaliarBalanço(
      concentracaoTitulanteLivre
    );

  return {
    concentracaoTitulanteLivre,
    itens: melhor.resultados,
  };
}

function classificarEstadoEspecieNoPonto(
  percentualPrecipitado: number
): {
  estado: EstadoEspecieNoPontoSeletividade;
  descricao: string;
} {
  if (
    !Number.isFinite(
      percentualPrecipitado
    ) ||
    percentualPrecipitado <=
      1e-8
  ) {
    return {
      estado: "nao_iniciada",
      descricao:
        "A precipitação desta espécie ainda não começou em quantidade numericamente relevante.",
    };
  }

  if (
    percentualPrecipitado <
    0.01
  ) {
    return {
      estado: "inicio",
      descricao:
        "A espécie apresenta apenas os primeiros traços calculados de precipitação.",
    };
  }

  if (
    percentualPrecipitado <
    95
  ) {
    return {
      estado:
        "em_precipitacao",
      descricao:
        "A espécie está em processo de precipitação e uma fração relevante ainda permanece dissolvida.",
    };
  }

  if (
    percentualPrecipitado <
    99.9
  ) {
    return {
      estado:
        "majoritariamente_precipitada",
      descricao:
        "A maior parte da espécie já precipitou, embora ainda exista uma fração mensurável em solução.",
    };
  }

  return {
    estado:
      "praticamente_completa",
    descricao:
      "A precipitação desta espécie encontra-se praticamente completa no ponto consultado.",
  };
}

function classificarRegiao({
  percentualPrecipitado,
  molTitulanteAdicionado,
  molTitulanteEquivalencia,
}: {
  percentualPrecipitado: number;
  molTitulanteAdicionado: number;
  molTitulanteEquivalencia: number;
}): PontoCurvaSeletividadePrecipitacao["regiao"] {
  if (
    percentualPrecipitado <= 1e-8
  ) {
    return "Antes da precipitação";
  }

  const toleranciaMol =
    Math.max(
      molTitulanteEquivalencia *
        1e-8,

      1e-14
    );

  if (
    Math.abs(
      molTitulanteAdicionado -
      molTitulanteEquivalencia
    ) <= toleranciaMol
  ) {
    return "No ponto de equivalência";
  }

  if (
    molTitulanteAdicionado >
    molTitulanteEquivalencia
  ) {
    return "Após a precipitação";
  }

  return "Durante a precipitação";
}

function calcularPontoSerieIsolada({
  item,
  volumeAdicionado,
  volumeAmostra,
  concentracaoTitulante,
}: {
  item: ResultadoItemSeletividadePrecipitacao;
  volumeAdicionado: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
}): PontoCurvaSeletividadePrecipitacao {
  const volumeTotal =
    volumeAmostra +
    volumeAdicionado;

  const equilibrio =
    resolverEquilibrioMistura({
      itens: [item],
      volumeAmostra,
      volumeAdicionado,
      concentracaoTitulante,
    });

  const resultadoItem =
    equilibrio.itens[0];

  const molTitulanteAdicionado =
    concentracaoTitulante *
    (volumeAdicionado / 1000);

  const molTitulanteEquivalencia =
    calcularMolTitulanteEquivalenciaItem({
      item,
      volumeAmostra,
    });

  return {
    volumeAdicionado,
    volumeTotal,

    concentracaoTitulanteLivre:
      equilibrio
        .concentracaoTitulanteLivre,

    pTitulante:
      equilibrio
        .concentracaoTitulanteLivre > 0
        ? -Math.log10(
            equilibrio
              .concentracaoTitulanteLivre
          )
        : NaN,

    concentracaoAnalitoLivre:
      resultadoItem
        .concentracaoAnalitoLivre,

    percentualPrecipitado:
      limitar(
        resultadoItem
          .percentualPrecipitado,

        0,
        100
      ),

    regiao:
      classificarRegiao({
        percentualPrecipitado:
          resultadoItem
            .percentualPrecipitado,

        molTitulanteAdicionado,

        molTitulanteEquivalencia,
      }),
  };
}

function calcularPontoMistura({
  itens,
  volumeAdicionado,
  volumeAmostra,
  concentracaoTitulante,
}: {
  itens: ResultadoItemSeletividadePrecipitacao[];
  volumeAdicionado: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
}): PontoCurvaSeletividadePrecipitacao {
  const volumeTotal =
    volumeAmostra +
    volumeAdicionado;

  const equilibrio =
    resolverEquilibrioMistura({
      itens,
      volumeAmostra,
      volumeAdicionado,
      concentracaoTitulante,
    });

  const molAnalitoInicialTotal =
    equilibrio.itens.reduce(
      (soma, item) =>
        soma +
        item.molAnalitoInicial,

      0
    );

  const molAnalitoPrecipitadoTotal =
    equilibrio.itens.reduce(
      (soma, item) =>
        soma +
        item.molAnalitoPrecipitado,

      0
    );

  const concentracaoAnalitoLivreTotal =
    equilibrio.itens.reduce(
      (soma, item) =>
        soma +
        item.concentracaoAnalitoLivre,

      0
    );

  const percentualPrecipitado =
    molAnalitoInicialTotal > 0
      ? (
          molAnalitoPrecipitadoTotal /
          molAnalitoInicialTotal
        ) * 100
      : NaN;

  const molTitulanteAdicionado =
    concentracaoTitulante *
    (volumeAdicionado / 1000);

  const molTitulanteEquivalenciaTotal =
    itens.reduce(
      (soma, item) =>
        soma +
        calcularMolTitulanteEquivalenciaItem({
          item,
          volumeAmostra,
        }),

      0
    );

  return {
    volumeAdicionado,
    volumeTotal,

    concentracaoTitulanteLivre:
      equilibrio
        .concentracaoTitulanteLivre,

    pTitulante:
      equilibrio
        .concentracaoTitulanteLivre > 0
        ? -Math.log10(
            equilibrio
              .concentracaoTitulanteLivre
          )
        : NaN,

    concentracaoAnalitoLivre:
      concentracaoAnalitoLivreTotal,

    percentualPrecipitado:
      limitar(
        percentualPrecipitado,
        0,
        100
      ),

    regiao:
      classificarRegiao({
        percentualPrecipitado,

        molTitulanteAdicionado,

        molTitulanteEquivalencia:
          molTitulanteEquivalenciaTotal,
      }),
  };
}

/**
 * Calcula o volume em que um precipitado começa
 * a se formar:
 *
 * PI = Kps
 *
 * A diluição da amostra e do titulante é considerada.
 */
function calcularVolumeInicioPrecipitacao({
  item,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximo,
}: {
  item: ResultadoItemSeletividadePrecipitacao;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximo: number;
}) {
  function funcao(
    volumeAdicionado: number
  ) {
    const volumeTotalLitros =
      (
        volumeAmostra +
        volumeAdicionado
      ) / 1000;

    const concentracaoAnalitoTotal =
      calcularMolAnalitoInicial({
        item,
        volumeAmostra,
      }) /
      volumeTotalLitros;

    const concentracaoTitulanteFormal =
      (
        concentracaoTitulante *
        (volumeAdicionado / 1000)
      ) /
      volumeTotalLitros;

    const coeficienteAnalito =
      obterCoeficienteAnalito(item);

    const coeficienteTitulante =
      obterCoeficienteTitulante(item);

    const produtoIonico =
      Math.pow(
        concentracaoAnalitoTotal,
        coeficienteAnalito
      ) *
      Math.pow(
        concentracaoTitulanteFormal,
        coeficienteTitulante
      );

    return produtoIonico -
      item.sal.kps;
  }

  /*
   * O precipitado não começa a se formar dentro
   * do intervalo calculado.
   */
  if (funcao(volumeMaximo) < 0) {
    return NaN;
  }

  let limiteInferior = 0;
  let limiteSuperior = volumeMaximo;

  for (
    let iteracao = 0;
    iteracao < MAX_ITERACOES_BISSECAO;
    iteracao += 1
  ) {
    const meio =
      (
        limiteInferior +
        limiteSuperior
      ) / 2;

    if (funcao(meio) >= 0) {
      limiteSuperior = meio;
    } else {
      limiteInferior = meio;
    }
  }

  return (
    limiteInferior +
    limiteSuperior
  ) / 2;
}

function gerarPontosVolume({
  volumeMaximo,
  passo,
  volumesObrigatorios,
}: {
  volumeMaximo: number;
  passo: number;
  volumesObrigatorios: number[];
}) {
  const pontos =
    new Set<number>();

  const numeroPassos =
    Math.floor(
      volumeMaximo /
      passo
    );

  for (
    let indice = 0;
    indice <= numeroPassos;
    indice += 1
  ) {
    pontos.add(
      Number(
        (
          indice *
          passo
        ).toFixed(10)
      )
    );
  }

  pontos.add(
    Number(
      volumeMaximo.toFixed(10)
    )
  );

  for (
    const volume of
    volumesObrigatorios
  ) {
    if (
      Number.isFinite(volume) &&
      volume >= 0 &&
      volume <= volumeMaximo
    ) {
      pontos.add(
        Number(
          volume.toFixed(10)
        )
      );
    }
  }

  return Array.from(pontos)
    .sort(
      (volumeA, volumeB) =>
        volumeA - volumeB
    );
}
function calcularVolumeInicioNaMistura({
  itens,
  indiceItem,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximo,
}: {
  itens: ResultadoItemSeletividadePrecipitacao[];
  indiceItem: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximo: number;
}) {
  const itemAlvo =
    itens[indiceItem];

  if (
    !itemAlvo ||
    !ehNumeroPositivo(volumeAmostra) ||
    !ehNumeroPositivo(concentracaoTitulante) ||
    !ehNumeroPositivo(volumeMaximo)
  ) {
    return NaN;
  }

  function calcularFracaoPrecipitada(
    volumeAdicionado: number
  ) {
    const equilibrio =
      resolverEquilibrioMistura({
        itens,
        volumeAmostra,
        volumeAdicionado,
        concentracaoTitulante,
      });

    const resultadoItem =
      equilibrio.itens[indiceItem];

    if (
      !resultadoItem ||
      !Number.isFinite(
        resultadoItem.percentualPrecipitado
      )
    ) {
      return NaN;
    }

    return (
      resultadoItem.percentualPrecipitado /
      100
    );
  }

  const fracaoNoVolumeMaximo =
    calcularFracaoPrecipitada(
      volumeMaximo
    );

  /*
   * O item ainda não começou a precipitar dentro
   * da faixa calculada.
   */
  if (
    !Number.isFinite(
      fracaoNoVolumeMaximo
    ) ||
    fracaoNoVolumeMaximo <
      FRACAO_MINIMA_INICIO_PRECIPITACAO
  ) {
    return NaN;
  }

  let limiteInferior = 0;
  let limiteSuperior =
    volumeMaximo;

  for (
    let iteracao = 0;
    iteracao < MAX_ITERACOES_BISSECAO;
    iteracao += 1
  ) {
    const meio =
      (
        limiteInferior +
        limiteSuperior
      ) / 2;

    const fracaoNoMeio =
      calcularFracaoPrecipitada(
        meio
      );

    if (
      Number.isFinite(
        fracaoNoMeio
      ) &&
      fracaoNoMeio >=
        FRACAO_MINIMA_INICIO_PRECIPITACAO
    ) {
      limiteSuperior = meio;
    } else {
      limiteInferior = meio;
    }
  }

  return (
    limiteInferior +
    limiteSuperior
  ) / 2;
}

function gerarComparacoesKps({
  itensOrdenados,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximo,
}: {
  itensOrdenados:
    ResultadoItemSeletividadePrecipitacao[];
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximo: number;
}): ComparacaoKpsSeletividade[] {
  const comparacoes:
    ComparacaoKpsSeletividade[] = [];

  for (
    let indice = 0;
    indice <
    itensOrdenados.length - 1;
    indice += 1
  ) {
    const primeiro =
      itensOrdenados[indice];

    const segundo =
      itensOrdenados[indice + 1];

    const kpsMenor =
      Math.min(
        primeiro.sal.kps,
        segundo.sal.kps
      );

    const kpsMaior =
      Math.max(
        primeiro.sal.kps,
        segundo.sal.kps
      );

    const razaoKps =
      kpsMaior / kpsMenor;

    const logRazaoKps =
      Math.log10(razaoKps);

    /*
     * Diferentemente da versão anterior, o início do
     * segundo precipitado é localizado dentro da mistura
     * completa, considerando o consumo de titulante por
     * todos os precipitados que se formam antes dele.
     */
    const volumeInicioSegundoNaMistura =
      calcularVolumeInicioNaMistura({
        itens:
          itensOrdenados,
        indiceItem:
          indice + 1,
        volumeAmostra,
        concentracaoTitulante,
        volumeMaximo,
      });

    let fracaoPrimeiroPrecipitada =
      NaN;

    if (
      Number.isFinite(
        volumeInicioSegundoNaMistura
      )
    ) {
      const equilibrioNoInicioDoSegundo =
        resolverEquilibrioMistura({
          itens:
            itensOrdenados,
          volumeAmostra,
          volumeAdicionado:
            volumeInicioSegundoNaMistura,
          concentracaoTitulante,
        });

      const resultadoPrimeiro =
        equilibrioNoInicioDoSegundo
          .itens[indice];

      if (
        resultadoPrimeiro &&
        Number.isFinite(
          resultadoPrimeiro
            .percentualPrecipitado
        )
      ) {
        fracaoPrimeiroPrecipitada =
          resultadoPrimeiro
            .percentualPrecipitado /
          100;
      }
    }

    const avaliacaoDisponivel =
  Number.isFinite(
    fracaoPrimeiroPrecipitada
  );

const percentualPrimeiroPrecipitado =
  avaliacaoDisponivel
    ? fracaoPrimeiroPrecipitada *
      100
    : null;

/**
 * Dois precipitados são considerados praticamente
 * simultâneos quando o cálculo de ordem atribui a
 * mesma posição aos dois sistemas.
 */
const precipitacaoSimultanea =
  primeiro.ordemPrecipitacao ===
  segundo.ordemPrecipitacao;

const avaliacao =
  classificarSeparacaoPorPercentual({
    percentualPrecipitado:
      percentualPrimeiroPrecipitado,

    precipitacaoSimultanea,
  });

/**
 * Conversão temporária para os campos antigos.
 *
 * Esses valores permanecem até que todos os
 * componentes sejam migrados para avaliacao.
 */
const statusSeparacaoQuantitativa:
  StatusSeparacaoQuantitativa =
  avaliacao.classificacao ===
    "nao_avaliada"
    ? "nao_avaliada"
    : avaliacao.classificacao ===
          "separacao_quantitativa" ||
        avaliacao.classificacao ===
          "separacao_muito_favoravel"
      ? "atende"
      : "nao_atende";

const atendeCriterioConfiabilidade =
  statusSeparacaoQuantitativa ===
    "nao_avaliada"
    ? null
    : statusSeparacaoQuantitativa ===
      "atende";

let interpretacao: string;

if (
  avaliacao.classificacao ===
  "nao_avaliada"
) {
  interpretacao =
    `O precipitado ${segundo.sal.formulaExibicao} não começou ` +
    "a se formar dentro do intervalo calculado para a mistura. " +
    `Não foi possível calcular o percentual de ` +
    `${primeiro.sal.formulaExibicao} precipitado no início do ` +
    "segundo sistema. A classificação permanece indeterminada.";
} else {
  interpretacao =
    `Quando ${segundo.sal.formulaExibicao} começa a precipitar ` +
    `na mistura, aproximadamente ${(
      avaliacao.percentualPrecipitado ??
      0
    ).toFixed(4)}% de ${primeiro.sal.formulaExibicao} já precipitou. ` +
    avaliacao.interpretacao;
}

comparacoes.push({
  primeiroSal:
    primeiro.sal,

  segundoSal:
    segundo.sal,

  razaoKps,

  logRazaoKps,

  volumeInicioSegundo:
    Number.isFinite(
      volumeInicioSegundoNaMistura
    )
      ? volumeInicioSegundoNaMistura
      : null,

  avaliacao,

  /**
   * Compatibilidade temporária.
   */
  statusSeparacaoQuantitativa,

  atendeCriterioConfiabilidade,

  fracaoPrimeiroPrecipitada:
    avaliacaoDisponivel
      ? fracaoPrimeiroPrecipitada
      : null,

  interpretacao,
});
  }

  return comparacoes;
}

export function avaliarPontoSeletividadePrecipitacao({
  resultado,
  volumeAdicionado,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoAvaliado,
}: {
  resultado:
    ResultadoSeletividadePrecipitacao;
  volumeAdicionado: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximoAvaliado: number;
}): AvaliacaoPontoSeletividadePrecipitacao {
  const entradaValida =
    resultado.status ===
      "adequado" &&
    resultado.itens.length >= 2 &&
    Number.isFinite(
      volumeAdicionado
    ) &&
    volumeAdicionado >= 0 &&
    ehNumeroPositivo(
      volumeAmostra
    ) &&
    ehNumeroPositivo(
      concentracaoTitulante
    ) &&
    ehNumeroPositivo(
      volumeMaximoAvaliado
    );

  const formulaTitulante =
    resultado.itens.length > 0
      ? obterFormulaTitulante(
          resultado.itens[0]
        )
      : "-";

  if (!entradaValida) {
    return {
      status: "invalido",

      volumeAdicionado,
      volumeAmostra,
      volumeTotal: NaN,

      molTitulanteAdicionado:
        NaN,
      concentracaoTitulanteFormal:
        NaN,
      concentracaoTitulanteLivre:
        NaN,
      pTitulante: null,

      percentualPrecipitadoMistura:
        NaN,
      percentualEmSolucaoMistura:
        NaN,

      regiao: "nao_avaliada",
      tituloRegiao:
        "Ponto não avaliado",
      interpretacao:
        "Não foi possível avaliar o ponto porque um ou mais dados informados são inválidos.",

      quantidadeEspeciesIniciadas:
        0,
      quantidadeEspeciesPraticamenteCompletas:
        0,

      primeiraEspecie: null,
      segundaEspecie: null,

      itens: [],

      formulaTitulante,

      dentroIntervaloCalculado:
        false,
      volumeMaximoAvaliado,

      mensagemErro:
        "Informe um volume válido e verifique os dados da amostra e do titulante.",
    };
  }

  const itensOrdenados =
    [...resultado.itens].sort(
      (itemA, itemB) => {
        const diferencaInicio =
          itemA
            .concentracaoTitulanteInicioPrecipitacao -
          itemB
            .concentracaoTitulanteInicioPrecipitacao;

        return diferencaInicio !==
          0
          ? diferencaInicio
          : itemA.ordemPrecipitacao -
              itemB.ordemPrecipitacao;
      }
    );

  const volumeTotal =
    volumeAmostra +
    volumeAdicionado;

  const volumeTotalLitros =
    volumeTotal / 1000;

  const molTitulanteAdicionado =
    concentracaoTitulante *
    (volumeAdicionado / 1000);

  const concentracaoTitulanteFormal =
    volumeTotalLitros > 0
      ? molTitulanteAdicionado /
        volumeTotalLitros
      : NaN;

  const equilibrio =
    resolverEquilibrioMistura({
      itens: itensOrdenados,
      volumeAmostra,
      volumeAdicionado,
      concentracaoTitulante,
    });

  const itensAvaliados:
    AvaliacaoItemPontoSeletividade[] =
    equilibrio.itens.map(
      (dado) => {
        const percentualPrecipitado =
          limitar(
            dado.percentualPrecipitado,
            0,
            100
          );

        const percentualEmSolucao =
          limitar(
            100 -
              percentualPrecipitado,
            0,
            100
          );

        const molAnalitoLivre =
          dado
            .concentracaoAnalitoLivre *
          volumeTotalLitros;

        const classificacaoEstado =
          classificarEstadoEspecieNoPonto(
            percentualPrecipitado
          );

        return {
          sal: dado.item.sal,
          formulaPrecipitado:
            dado.item.sal
              .formulaExibicao,
          ordemPrecipitacao:
            dado.item
              .ordemPrecipitacao,

          concentracaoAnalitoTotal:
            dado
              .concentracaoAnalitoTotal,
          concentracaoAnalitoLivre:
            dado
              .concentracaoAnalitoLivre,

          molAnalitoInicial:
            dado.molAnalitoInicial,
          molAnalitoLivre:
            limitar(
              molAnalitoLivre,
              0,
              dado.molAnalitoInicial
            ),
          molAnalitoPrecipitado:
            limitar(
              dado
                .molAnalitoPrecipitado,
              0,
              dado.molAnalitoInicial
            ),

          percentualPrecipitado,
          percentualEmSolucao,

          estado:
            classificacaoEstado.estado,
          descricaoEstado:
            classificacaoEstado.descricao,

          iniciouPrecipitacao:
            percentualPrecipitado >
            1e-8,
          praticamenteCompleta:
            percentualPrecipitado >=
            99.9,
        };
      }
    );

  const molAnalitoInicialTotal =
    itensAvaliados.reduce(
      (soma, item) =>
        soma +
        item.molAnalitoInicial,
      0
    );

  const molAnalitoPrecipitadoTotal =
    itensAvaliados.reduce(
      (soma, item) =>
        soma +
        item
          .molAnalitoPrecipitado,
      0
    );

  const percentualPrecipitadoMistura =
    molAnalitoInicialTotal > 0
      ? limitar(
          (
            molAnalitoPrecipitadoTotal /
            molAnalitoInicialTotal
          ) * 100,
          0,
          100
        )
      : NaN;

  const percentualEmSolucaoMistura =
    Number.isFinite(
      percentualPrecipitadoMistura
    )
      ? limitar(
          100 -
            percentualPrecipitadoMistura,
          0,
          100
        )
      : NaN;

  const especiesIniciadas =
    itensAvaliados.filter(
      (item) =>
        item.iniciouPrecipitacao
    );

  const especiesPraticamenteCompletas =
    itensAvaliados.filter(
      (item) =>
        item.praticamenteCompleta
    );

  const primeiraEspecie =
    itensAvaliados[0] ??
    null;

  const segundaEspecie =
    itensAvaliados[1] ??
    null;

  let regiao:
    RegiaoPontoMisturaSeletividade;

  let tituloRegiao: string;

  let interpretacao: string;

  if (
    especiesIniciadas.length ===
    0
  ) {
    regiao =
      "antes_da_primeira_precipitacao";

    tituloRegiao =
      "Antes da primeira precipitação";

    interpretacao =
      `No volume consultado, nenhum dos precipitados avaliados começou a se formar em quantidade numericamente relevante. ` +
      `O titulante adicionado ainda não produziu uma condição suficiente para precipitação detectável no modelo.`;
  } else if (
    especiesIniciadas.length ===
      1 &&
    primeiraEspecie
  ) {
    regiao =
      "precipitacao_seletiva";

    tituloRegiao =
      "Região de precipitação seletiva";

    interpretacao =
      `No volume consultado, apenas ${primeiraEspecie.formulaPrecipitado} apresenta precipitação relevante. ` +
      `Aproximadamente ${primeiraEspecie.percentualPrecipitado.toFixed(
        4
      )}% dessa espécie já precipitou, enquanto os demais sistemas ainda não iniciaram precipitação em quantidade numericamente relevante.`;

    if (
      primeiraEspecie
        .praticamenteCompleta
    ) {
      interpretacao +=
        " O ponto apresenta uma condição especialmente favorável à separação, pois o primeiro precipitado está praticamente completo antes do início relevante das demais espécies.";
    } else {
      interpretacao +=
        " Embora o ponto esteja dentro da região seletiva, parte do primeiro analito ainda permanece em solução.";
    }
  } else if (
    especiesIniciadas.length >=
      2 &&
    segundaEspecie &&
    segundaEspecie
      .percentualPrecipitado <
      0.01
  ) {
    regiao =
      "inicio_de_coprecipitacao";

    tituloRegiao =
      "Início da precipitação seguinte";

    interpretacao =
      `No volume consultado, ${segundaEspecie.formulaPrecipitado} apresenta os primeiros traços calculados de formação. ` +
      `Esse ponto representa o limite da região seletiva anterior. ` +
      `A partir daqui, o aumento do volume favorece a precipitação simultânea de mais de uma espécie.`;
  } else if (
    especiesIniciadas.length >=
    2
  ) {
    regiao =
      "coprecipitacao";

    tituloRegiao =
      "Região de precipitação simultânea";

    const formulasAtivas =
      especiesIniciadas
        .map(
          (item) =>
            item
              .formulaPrecipitado
        )
        .join(", ");

    interpretacao =
      `No volume consultado, mais de uma espécie apresenta precipitação relevante: ${formulasAtivas}. ` +
      `O ponto já não pertence a uma região exclusivamente seletiva, pois há formação simultânea de precipitados.`;
  } else {
    regiao =
      "apos_precipitacao";

    tituloRegiao =
      "Após a precipitação principal";

    interpretacao =
      "O ponto consultado encontra-se após as principais etapas de precipitação previstas para o sistema.";
  }

  const todasPraticamenteCompletas =
    itensAvaliados.length > 0 &&
    itensAvaliados.every(
      (item) =>
        item.praticamenteCompleta
    );

  if (
    todasPraticamenteCompletas
  ) {
    regiao =
      "apos_precipitacao";

    tituloRegiao =
      "Após a precipitação dos analitos";

    interpretacao =
      "No volume consultado, todas as espécies avaliadas apresentam precipitação praticamente completa. O titulante adicional tende a permanecer em maior proporção na forma livre em solução.";
  }

  const concentracaoTitulanteLivre =
    equilibrio
      .concentracaoTitulanteLivre;

  const pTitulante =
    concentracaoTitulanteLivre >
      0 &&
    Number.isFinite(
      concentracaoTitulanteLivre
    )
      ? -Math.log10(
          concentracaoTitulanteLivre
        )
      : null;

  const dentroIntervaloCalculado =
    volumeAdicionado <=
    volumeMaximoAvaliado;

  return {
    status: "adequado",

    volumeAdicionado,
    volumeAmostra,
    volumeTotal,

    molTitulanteAdicionado,
    concentracaoTitulanteFormal,
    concentracaoTitulanteLivre,
    pTitulante,

    percentualPrecipitadoMistura,
    percentualEmSolucaoMistura,

    regiao,
    tituloRegiao,
    interpretacao,

    quantidadeEspeciesIniciadas:
      especiesIniciadas.length,
    quantidadeEspeciesPraticamenteCompletas:
      especiesPraticamenteCompletas.length,

    primeiraEspecie,
    segundaEspecie,

    itens: itensAvaliados,

    formulaTitulante:
      obterFormulaTitulante(
        itensOrdenados[0]
      ),

    dentroIntervaloCalculado,
    volumeMaximoAvaliado,

    mensagemErro:
      dentroIntervaloCalculado
        ? null
        : `O volume consultado ultrapassa o limite de ${volumeMaximoAvaliado.toFixed(
            2
          )} mL exibido no gráfico. O equilíbrio foi calculado, mas o marcador não poderá ser posicionado dentro da área visível atual.`,
  };
}

export function gerarCurvaSeletividadePrecipitacao({
  resultado,
  volumeAmostra,
  concentracaoTitulante,
  passo = 0.1,
  volumeMaximoManual,
  incluirVolumesObrigatorios = true,
}: {
  resultado: ResultadoSeletividadePrecipitacao;
  volumeAmostra: number;
  concentracaoTitulante: number;
  passo?: number;
  volumeMaximoManual?: number;
  incluirVolumesObrigatorios?: boolean;
}): CurvaSeletividadePrecipitacao {
  if (
    resultado.status !== "adequado" ||
    !ehNumeroPositivo(volumeAmostra) ||
    !ehNumeroPositivo(
      concentracaoTitulante
    ) ||
    !ehNumeroPositivo(passo) ||
    resultado.itens.length < 2
  ) {
    return {
      serieMistura: {
        nome: "Mistura",
        pontos: [],
      },

      seriesIsoladas: [],
      series: [],

      comparacoesKps: [],

      volumeAmostra,
      concentracaoTitulante,

      volumeMaximo: NaN,
      passo,

      formulaTitulante: "-",
    };
  }

  const itensOrdenados =
    [...resultado.itens].sort(
      (itemA, itemB) => {
        const diferencaInicio =
          itemA
            .concentracaoTitulanteInicioPrecipitacao -
          itemB
            .concentracaoTitulanteInicioPrecipitacao;

        return diferencaInicio !== 0
          ? diferencaInicio
          : itemA.ordemPrecipitacao -
              itemB.ordemPrecipitacao;
      }
    );

  const formulaTitulante =
    obterFormulaTitulante(
      itensOrdenados[0]
    );

  const molTitulanteTotal =
    itensOrdenados.reduce(
      (soma, item) =>
        soma +
        calcularMolTitulanteEquivalenciaItem({
          item,
          volumeAmostra,
        }),

      0
    );

  const volumeEquivalenciaTotal =
    (
      molTitulanteTotal /
      concentracaoTitulante
    ) * 1000;

  const volumeMaximo =
    ehNumeroPositivo(
      volumeMaximoManual ?? NaN
    )
      ? (
          volumeMaximoManual as number
        )
      : Math.max(
          volumeEquivalenciaTotal *
            1.2,

          1
        );

  const volumesEquivalenciaAcumulados:
    number[] = [];

  let molAcumulado = 0;

  for (
    const item of
    itensOrdenados
  ) {
    molAcumulado +=
      calcularMolTitulanteEquivalenciaItem({
        item,
        volumeAmostra,
      });

    volumesEquivalenciaAcumulados.push(
      (
        molAcumulado /
        concentracaoTitulante
      ) * 1000
    );
  }

  const volumesInicio =
    itensOrdenados.map(
      (item) =>
        calcularVolumeInicioPrecipitacao({
          item,
          volumeAmostra,
          concentracaoTitulante,
          volumeMaximo,
        })
    );

    const volumesDaCurva =
    gerarPontosVolume({
      volumeMaximo,
      passo,
      volumesObrigatorios:
        incluirVolumesObrigatorios
          ? [
              ...volumesInicio,
              ...volumesEquivalenciaAcumulados,
            ]
          : [],
    });

  const pontosMistura =
    volumesDaCurva.map(
      (volumeAdicionado) =>
        calcularPontoMistura({
          itens:
            itensOrdenados,

          volumeAdicionado,

          volumeAmostra,
          concentracaoTitulante,
        })
    );

  const seriesIsoladas =
    itensOrdenados.map(
      (item, indice) => {
        const molTitulanteEquivalenciaItem =
          calcularMolTitulanteEquivalenciaItem({
            item,
            volumeAmostra,
          });

        const volumeEquivalencia =
          (
            molTitulanteEquivalenciaItem /
            concentracaoTitulante
          ) * 1000;

        const volumesSerie =
          gerarPontosVolume({
            volumeMaximo,
            passo,

            volumesObrigatorios: [
              volumesInicio[indice],
              volumeEquivalencia,
            ],
          });

        return {
          sal: item.sal,

          formulaPrecipitado:
            item.sal.formulaExibicao,

          ordemPrecipitacao:
            item.ordemPrecipitacao,

          volumeInicio:
            volumesInicio[indice],

          volumeEquivalencia,

          pontos:
            volumesSerie.map(
              (volumeAdicionado) =>
                calcularPontoSerieIsolada({
                  item,
                  volumeAdicionado,
                  volumeAmostra,
                  concentracaoTitulante,
                })
            ),
        };
      }
    );

  return {
    serieMistura: {
      nome: "Mistura completa",
      pontos: pontosMistura,
    },

    seriesIsoladas,

    /*
     * Compatibilidade com componentes que ainda
     * utilizam a propriedade antiga.
     */
    series: seriesIsoladas,

    comparacoesKps:
  gerarComparacoesKps({
    itensOrdenados,
    volumeAmostra,
    concentracaoTitulante,
    volumeMaximo,
  }),

    volumeAmostra,
    concentracaoTitulante,
    volumeMaximo,
    passo,
    formulaTitulante,
  };
}