import type {
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
  razaoKps: number;
  logRazaoKps: number;
  statusSeparacaoQuantitativa:
    StatusSeparacaoQuantitativa;
  atendeCriterioConfiabilidade:
    boolean | null;
  fracaoPrimeiroPrecipitada:
    number | null;
  interpretacao: string;
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
 * Critério adotado para considerar uma precipitação quantitativa:
 *
 * 99,9% do primeiro analito já deve estar precipitado
 * quando o segundo precipitado começar a se formar.
 */
const FRACAO_PRECIPITADA_QUANTITATIVA = 0.999;

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

    const atendeCriterioConfiabilidade =
      avaliacaoDisponivel
        ? fracaoPrimeiroPrecipitada >=
          FRACAO_PRECIPITADA_QUANTITATIVA
        : null;

    const statusSeparacaoQuantitativa:
      StatusSeparacaoQuantitativa =
      !avaliacaoDisponivel
        ? "nao_avaliada"
        : atendeCriterioConfiabilidade
          ? "atende"
          : "nao_atende";

    let interpretacao: string;

    if (
      statusSeparacaoQuantitativa ===
      "atende"
    ) {
      interpretacao =
        `Quando ${segundo.sal.formulaExibicao} começa a precipitar ` +
        `na mistura, aproximadamente ${(
          fracaoPrimeiroPrecipitada * 100
        ).toFixed(3)}% de ${primeiro.sal.formulaExibicao} já precipitou. ` +
        "O sistema atende ao critério adotado de 99,9% para " +
        "separação quantitativa.";
    } else if (
      statusSeparacaoQuantitativa ===
      "nao_atende"
    ) {
      interpretacao =
        `Quando ${segundo.sal.formulaExibicao} começa a precipitar ` +
        `na mistura, aproximadamente ${(
          fracaoPrimeiroPrecipitada * 100
        ).toFixed(3)}% de ${primeiro.sal.formulaExibicao} precipitou. ` +
        "Há sobreposição relevante e o critério de 99,9% não é atendido.";
    } else {
      interpretacao =
        `O precipitado ${segundo.sal.formulaExibicao} não começou ` +
        "a se formar dentro do intervalo calculado para a mistura. " +
        `Portanto, não foi observada sobreposição com ` +
        `${primeiro.sal.formulaExibicao} dentro da faixa simulada.`;
    }

    comparacoes.push({
      primeiroSal:
        primeiro.sal,
      segundoSal:
        segundo.sal,
      razaoKps,
      logRazaoKps,
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

export function gerarCurvaSeletividadePrecipitacao({
  resultado,
  volumeAmostra,
  concentracaoTitulante,
  passo = 0.1,
  volumeMaximoManual,
}: {
  resultado: ResultadoSeletividadePrecipitacao;
  volumeAmostra: number;
  concentracaoTitulante: number;
  passo?: number;
  volumeMaximoManual?: number;
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

      volumesObrigatorios: [
        ...volumesInicio,
        ...volumesEquivalenciaAcumulados,
      ],
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