import {
  saisPrecipitacao,
} from "../data/precipitacao/sais";

import {
  calcularSeletividadePrecipitacao,
} from "./calculosSeletividade";

import {
  gerarCurvaSeletividadePrecipitacao,
} from "./calculosCurvaSeletividade";

import type {
  AvaliacaoSeparacaoPrecipitacao,
  EspecieAnalitoPrecipitacao,
  EspeciePrecipitacao,
  IonPrecipitacao,
  ResultadoTitulacaoRetornoPrecipitacao,
  RiscoInterferenciaPrecipitacao,
  SalPrecipitacao,
} from "./tipos";

export type EtapaInterferenciaRetorno =
  | "precipitacao-principal"
  | "titulacao-retorno";

export type InterferenciaRetornoPrecipitacao = {
  id: string;

  etapa:
    EtapaInterferenciaRetorno;

  especieInterferente:
    IonPrecipitacao;

  salInterferente:
    SalPrecipitacao;

  especieConsumida:
    "Ag⁺" | "SCN⁻";

  risco:
    RiscoInterferenciaPrecipitacao;

  concentracaoCritica: number;

  concentracaoCriticaReferencia: number;

  razaoConcentracoesCriticas: number;

  /**
   * Avaliação predominante baseada no percentual
   * do sistema de referência já precipitado quando
   * o concorrente começa a se formar.
   */
  avaliacaoSeparacao:
    AvaliacaoSeparacaoPrecipitacao;

  percentualReferenciaPrecipitada:
    number | null;

  volumeInicioInterferente:
    number | null;

  impactoAnalitico: string;

  motivo: string;

  recomendacao: string;
};

const FORMULA_AG = "Ag⁺";
const FORMULA_SCN = "SCN⁻";

function ehNumeroPositivo(
  valor: number
) {
  return (
    Number.isFinite(valor) &&
    valor > 0
  );
}

function coeficienteValido(
  valor: number
) {
  return (
    Number.isFinite(valor) &&
    Number.isInteger(valor) &&
    valor > 0
  );
}

function salValido(
  sal: SalPrecipitacao
) {
  return (
    ehNumeroPositivo(sal.kps) &&
    coeficienteValido(
      sal.coeficienteCation
    ) &&
    coeficienteValido(
      sal.coeficienteAnion
    )
  );
}

function resultadoValido(
  resultado:
    | ResultadoTitulacaoRetornoPrecipitacao
    | null
): resultado is ResultadoTitulacaoRetornoPrecipitacao {
  return (
    resultado !== null &&
    resultado.status !==
      "dados_invalidos" &&
    salValido(
      resultado.salPrincipal
    ) &&
    ehNumeroPositivo(
      resultado.concentracaoAnalito
    ) &&
    ehNumeroPositivo(
      resultado.concentracaoPrecipitanteExcesso
    ) &&
    ehNumeroPositivo(
      resultado.concentracaoTitulanteRetorno
    )
  );
}

function obterCoeficienteIon({
  sal,
  ion,
}: {
  sal: SalPrecipitacao;
  ion: IonPrecipitacao;
}) {
  if (
    sal.cation.id === ion.id
  ) {
    return sal.coeficienteCation;
  }

  if (
    sal.anion.id === ion.id
  ) {
    return sal.coeficienteAnion;
  }

  return NaN;
}

function obterIonOposto({
  sal,
  ion,
}: {
  sal: SalPrecipitacao;
  ion: IonPrecipitacao;
}) {
  if (
    sal.cation.id === ion.id
  ) {
    return sal.anion;
  }

  return sal.cation;
}

function salContemIon({
  sal,
  ion,
}: {
  sal: SalPrecipitacao;
  ion: IonPrecipitacao;
}) {
  return (
    sal.cation.id === ion.id ||
    sal.anion.id === ion.id
  );
}

function obterEspecieAnalitoDoSal({
  sal,
  ion,
}: {
  sal: SalPrecipitacao;
  ion: IonPrecipitacao;
}): EspecieAnalitoPrecipitacao | null {
  if (
    sal.cation.id === ion.id
  ) {
    return "cation";
  }

  if (
    sal.anion.id === ion.id
  ) {
    return "anion";
  }

  return null;
}

/**
 * Para:
 *
 * CₐAᵦ(s) ⇌ a C + b A
 *
 * se o reagente avaliado for C:
 *
 * [C]crítica =
 * (Kps / [A]ᵇ)^(1/a)
 */
function calcularConcentracaoCritica({
  sal,
  ionAvaliado,
  concentracaoIonOposto,
}: {
  sal: SalPrecipitacao;
  ionAvaliado: IonPrecipitacao;
  concentracaoIonOposto: number;
}) {
  const coeficienteAvaliado =
    obterCoeficienteIon({
      sal,
      ion: ionAvaliado,
    });

  const ionOposto =
    obterIonOposto({
      sal,
      ion: ionAvaliado,
    });

  const coeficienteOposto =
    obterCoeficienteIon({
      sal,
      ion: ionOposto,
    });

  if (
    !coeficienteValido(
      coeficienteAvaliado
    ) ||
    !coeficienteValido(
      coeficienteOposto
    ) ||
    !ehNumeroPositivo(
      concentracaoIonOposto
    )
  ) {
    return NaN;
  }

  const logConcentracaoCritica =
    (
      Math.log10(sal.kps) -
      coeficienteOposto *
        Math.log10(
          concentracaoIonOposto
        )
    ) /
    coeficienteAvaliado;

  return Math.pow(
    10,
    logConcentracaoCritica
  );
}

function criarAvaliacaoIndeterminada():
  AvaliacaoSeparacaoPrecipitacao {
  return {
    classificacao:
      "nao_avaliada",

    risco: null,

    percentualPrecipitado:
      null,

    percentualRemanescente:
      null,

    titulo:
      "Separação não avaliada",

    interpretacao:
      "Não foi possível determinar quanto do sistema de referência estava precipitado quando o precipitado concorrente começou a se formar.",
  };
}

type ResultadoAvaliacaoEtapa = {
  avaliacao:
    AvaliacaoSeparacaoPrecipitacao;

  risco:
    RiscoInterferenciaPrecipitacao;

  referenciaFormaPrimeiro:
    boolean;

  precipitacaoSimultanea:
    boolean;

  percentualReferenciaPrecipitada:
    number | null;

  volumeInicioInterferente:
    number | null;
};

function avaliarSeparacaoEtapa({
  salReferencia,
  especieAnalitoReferencia,
  concentracaoReferencia,
  salInterferente,
  especieAnalitoInterferente,
  concentracaoInterferente,
  especieTitulante,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximo,
}: {
  salReferencia:
    SalPrecipitacao;

  especieAnalitoReferencia:
    EspecieAnalitoPrecipitacao;

  concentracaoReferencia: number;

  salInterferente:
    SalPrecipitacao;

  especieAnalitoInterferente:
    EspecieAnalitoPrecipitacao;

  concentracaoInterferente: number;

  especieTitulante:
    EspeciePrecipitacao;

  volumeAmostra: number;

  concentracaoTitulante: number;

  volumeMaximo: number;
}): ResultadoAvaliacaoEtapa {
  const avaliacaoIndeterminada =
    criarAvaliacaoIndeterminada();

  const seletividade =
    calcularSeletividadePrecipitacao({
      especieTitulante,

      itens: [
        {
          sal:
            salReferencia,

          especieAnalito:
            especieAnalitoReferencia,

          concentracaoAnalito:
            concentracaoReferencia,
        },

        {
          sal:
            salInterferente,

          especieAnalito:
            especieAnalitoInterferente,

          concentracaoAnalito:
            concentracaoInterferente,
        },
      ],
    });

  if (
    seletividade.status !==
    "adequado"
  ) {
    return {
      avaliacao:
        avaliacaoIndeterminada,

      risco:
        "alto",

      referenciaFormaPrimeiro:
        false,

      precipitacaoSimultanea:
        false,

      percentualReferenciaPrecipitada:
        null,

      volumeInicioInterferente:
        null,
    };
  }

  const itemReferencia =
    seletividade.itens.find(
      (item) =>
        item.sal.id ===
        salReferencia.id
    );

  const itemInterferente =
    seletividade.itens.find(
      (item) =>
        item.sal.id ===
        salInterferente.id
    );

  if (
    !itemReferencia ||
    !itemInterferente
  ) {
    return {
      avaliacao:
        avaliacaoIndeterminada,

      risco:
        "alto",

      referenciaFormaPrimeiro:
        false,

      precipitacaoSimultanea:
        false,

      percentualReferenciaPrecipitada:
        null,

      volumeInicioInterferente:
        null,
    };
  }

  const precipitacaoSimultanea =
    itemReferencia
      .ordemPrecipitacao ===
    itemInterferente
      .ordemPrecipitacao;

  const referenciaFormaPrimeiro =
    itemReferencia
      .ordemPrecipitacao <
    itemInterferente
      .ordemPrecipitacao;

  const curva =
    gerarCurvaSeletividadePrecipitacao({
      resultado:
        seletividade,

      volumeAmostra,

      concentracaoTitulante,

      passo: 0.1,

      volumeMaximoManual:
        volumeMaximo,
    });

  const comparacao =
    curva.comparacoesKps[0];

  const avaliacao =
    comparacao?.avaliacao ??
    avaliacaoIndeterminada;

  let risco:
    RiscoInterferenciaPrecipitacao;

  if (
    precipitacaoSimultanea ||
    !referenciaFormaPrimeiro
  ) {
    risco = "alto";
  } else if (
    avaliacao.risco === null
  ) {
    /*
     * O concorrente não começou dentro da faixa
     * simulada. Não foi observada sobreposição no
     * intervalo calculado.
     */
    risco = "baixo";
  } else {
    risco =
      avaliacao.risco;
  }

  const volumeInicioInterferente =
    comparacao &&
    comparacao.segundoSal.id ===
      salInterferente.id
      ? comparacao.volumeInicioSegundo
      : null;

  return {
    avaliacao,

    risco,

    referenciaFormaPrimeiro,

    precipitacaoSimultanea,

    percentualReferenciaPrecipitada:
      referenciaFormaPrimeiro
        ? avaliacao
            .percentualPrecipitado
        : null,

    volumeInicioInterferente,
  };
}

function obterTextoInterferencia({
  etapa,
  especie,
  salReferencia,
  salInterferente,
  avaliacaoEtapa,
}: {
  etapa:
    EtapaInterferenciaRetorno;

  especie:
    IonPrecipitacao;

  salReferencia:
    SalPrecipitacao;

  salInterferente:
    SalPrecipitacao;

  avaliacaoEtapa:
    ResultadoAvaliacaoEtapa;
}) {
  const {
    avaliacao,
    referenciaFormaPrimeiro,
    precipitacaoSimultanea,
    risco,
  } = avaliacaoEtapa;

  let motivo: string;

  if (
    precipitacaoSimultanea
  ) {
    motivo =
      `${salReferencia.formulaExibicao} e ` +
      `${salInterferente.formulaExibicao} começam a se formar ` +
      "em condições praticamente iguais. O reagente pode ser " +
      `consumido simultaneamente pelo sistema de referência e por ` +
      `${especie.formulaExibicao}.`;
  } else if (
    !referenciaFormaPrimeiro
  ) {
    motivo =
      `${salInterferente.formulaExibicao} começa a precipitar antes de ` +
      `${salReferencia.formulaExibicao}. Assim, ` +
      `${especie.formulaExibicao} começa a consumir o reagente antes ` +
      "da precipitação predominante do sistema de referência.";
  } else if (
    avaliacao.classificacao ===
    "nao_avaliada"
  ) {
    motivo =
      `${salReferencia.formulaExibicao} precipita primeiro e ` +
      `${salInterferente.formulaExibicao} não começou a se formar ` +
      "dentro do intervalo calculado. Não foi observada precipitação " +
      "concorrente na faixa simulada.";
  } else {
    motivo =
      `${salReferencia.formulaExibicao} precipita antes de ` +
      `${salInterferente.formulaExibicao}. Quando o concorrente ` +
      "começa a se formar, aproximadamente " +
      `${(
        avaliacao
          .percentualPrecipitado ??
        0
      ).toFixed(4)}% do sistema de referência já precipitou. ` +
      avaliacao.interpretacao;
  }

  if (
    etapa ===
    "precipitacao-principal"
  ) {
    if (risco === "alto") {
      return {
        motivo,

        impactoAnalitico:
          "O interferente pode consumir parte do Ag⁺ adicionado antes que a precipitação do analito principal esteja quantitativamente concluída. Esse consumo pode ser atribuído incorretamente ao analito e causar superestimação.",

        recomendacao:
          "Considere remover ou separar previamente o interferente, reduzir sua concentração, utilizar mascaramento validado ou selecionar outro procedimento analítico.",
      };
    }

    if (
      risco === "moderado"
    ) {
      return {
        motivo,

        impactoAnalitico:
          "A maior parte do sistema principal já precipitou, mas ainda existe sobreposição antes de atingir o critério quantitativo de 99,9%. Pode ocorrer consumo adicional de Ag⁺.",

        recomendacao:
          "Avalie a concentração real do interferente e confirme experimentalmente se a sobreposição é aceitável para o nível de exatidão desejado.",
      };
    }

    return {
      motivo,

      impactoAnalitico:
        "A precipitação do sistema principal está quantitativamente avançada antes do início do concorrente, ou o concorrente não aparece dentro da faixa simulada.",

      recomendacao:
        "Mantenha controle da composição da amostra. A classificação continua dependente da concentração assumida para o interferente.",
    };
  }

  if (risco === "alto") {
    return {
      motivo,

      impactoAnalitico:
        "Parte do SCN⁻ pode reagir com o interferente em vez de titular exclusivamente o Ag⁺ remanescente. Isso pode aumentar o volume observado e deslocar o ponto final.",

      recomendacao:
        "Considere remover o cátion interferente antes da retrotitulação ou utilizar outro procedimento para determinar a prata remanescente.",
    };
  }

  if (
    risco === "moderado"
  ) {
    return {
      motivo,

      impactoAnalitico:
        "A precipitação de AgSCN está bastante avançada, mas o concorrente começa antes que o critério quantitativo de 99,9% seja alcançado.",

      recomendacao:
        "Avalie a concentração real do cátion interferente e confirme a persistência e a nitidez do ponto final.",
    };
  }

  return {
    motivo,

    impactoAnalitico:
      "A formação de AgSCN está quantitativamente avançada antes do início do precipitado concorrente, ou o concorrente não surge dentro da faixa simulada.",

    recomendacao:
      "A interferência tende a ser baixa nas condições assumidas, mas deve ser reconsiderada se o interferente estiver em concentração muito elevada.",
  };
}

export function avaliarInterferenciasRetornoPrecipitacao(
  resultado:
    | ResultadoTitulacaoRetornoPrecipitacao
    | null
): InterferenciaRetornoPrecipitacao[] {
  if (
    !resultadoValido(
      resultado
    )
  ) {
    return [];
  }

  const salAgSCN =
    saisPrecipitacao.find(
      (sal) =>
        sal.id === "AgSCN"
    );

  if (
    !salAgSCN ||
    !salValido(salAgSCN)
  ) {
    return [];
  }

  const ionAg =
    salAgSCN.cation;

  const ionSCN =
    salAgSCN.anion;

  /*
   * Como a concentração verdadeira do interferente
   * não foi informada, a triagem usa inicialmente
   * a concentração do analito principal.
   */
  const concentracaoComparacao =
    resultado.concentracaoAnalito;

  const concentracaoCriticaPrincipal =
    calcularConcentracaoCritica({
      sal:
        resultado.salPrincipal,

      ionAvaliado:
        ionAg,

      concentracaoIonOposto:
        resultado.concentracaoAnalito,
    });

  const volumeInicialRetorno =
    resultado.volumeAmostra +
    resultado.volumePrecipitanteExcesso;

  const volumeInicialRetornoLitros =
    volumeInicialRetorno /
    1000;

  const concentracaoAgRemanescente =
    ehNumeroPositivo(
      volumeInicialRetornoLitros
    )
      ? resultado
          .molPrecipitanteEmExcesso /
        volumeInicialRetornoLitros
      : NaN;

  /*
   * Correção importante:
   *
   * A referência para a formação de AgSCN utiliza
   * a concentração calculada de Ag⁺ remanescente,
   * e não a concentração da solução de Ag⁺ que foi
   * inicialmente adicionada.
   */
  const concentracaoCriticaAgSCN =
    calcularConcentracaoCritica({
      sal:
        salAgSCN,

      ionAvaliado:
        ionSCN,

      concentracaoIonOposto:
        concentracaoAgRemanescente,
    });

  const volumeMaximoPrincipal =
    Math.max(
      resultado
        .volumePrecipitanteExcesso *
        1.25,

      resultado
        .volumePrecipitanteExcesso,

      1
    );

  const volumeMaximoRetorno =
    Math.max(
      resultado
        .volumeTitulanteRetorno *
        1.6,

      resultado
        .volumeTitulanteRetorno,

      1
    );

  const interferenciasAg:
    InterferenciaRetornoPrecipitacao[] =
    ehNumeroPositivo(
      concentracaoCriticaPrincipal
    )
      ? saisPrecipitacao
          .filter(salValido)
          .filter(
            (sal) =>
              sal.id !==
              resultado
                .salPrincipal.id
          )
          .filter(
            (sal) =>
              sal.id !==
              "AgSCN"
          )
          .filter((sal) =>
            salContemIon({
              sal,
              ion:
                ionAg,
            })
          )
          .map((sal) => {
            const especie =
              obterIonOposto({
                sal,
                ion:
                  ionAg,
              });

            const especieAnalitoInterferente =
              obterEspecieAnalitoDoSal({
                sal,
                ion:
                  especie,
              });

            if (
              !especieAnalitoInterferente
            ) {
              return null;
            }

            const concentracaoCritica =
              calcularConcentracaoCritica({
                sal,

                ionAvaliado:
                  ionAg,

                concentracaoIonOposto:
                  concentracaoComparacao,
              });

            if (
              !ehNumeroPositivo(
                concentracaoCritica
              )
            ) {
              return null;
            }

            const razao =
              concentracaoCritica /
              concentracaoCriticaPrincipal;

            const avaliacaoEtapa =
              avaliarSeparacaoEtapa({
                salReferencia:
                  resultado
                    .salPrincipal,

                especieAnalitoReferencia:
                  resultado
                    .especieAnalito,

                concentracaoReferencia:
                  resultado
                    .concentracaoAnalito,

                salInterferente:
                  sal,

                especieAnalitoInterferente,

                concentracaoInterferente:
                  concentracaoComparacao,

                especieTitulante:
                  "cation",

                volumeAmostra:
                  resultado
                    .volumeAmostra,

                concentracaoTitulante:
                  resultado
                    .concentracaoPrecipitanteExcesso,

                volumeMaximo:
                  volumeMaximoPrincipal,
              });

            const textos =
              obterTextoInterferencia({
                etapa:
                  "precipitacao-principal",

                especie,

                salReferencia:
                  resultado
                    .salPrincipal,

                salInterferente:
                  sal,

                avaliacaoEtapa,
              });

            return {
              id:
                `ag-${sal.id}`,

              etapa:
                "precipitacao-principal" as const,

              especieInterferente:
                especie,

              salInterferente:
                sal,

              especieConsumida:
                FORMULA_AG as "Ag⁺",

              risco:
                avaliacaoEtapa.risco,

              concentracaoCritica,

              concentracaoCriticaReferencia:
                concentracaoCriticaPrincipal,

              razaoConcentracoesCriticas:
                razao,

              avaliacaoSeparacao:
                avaliacaoEtapa
                  .avaliacao,

              percentualReferenciaPrecipitada:
                avaliacaoEtapa
                  .percentualReferenciaPrecipitada,

              volumeInicioInterferente:
                avaliacaoEtapa
                  .volumeInicioInterferente,

              impactoAnalitico:
                textos
                  .impactoAnalitico,

              motivo:
                textos.motivo,

              recomendacao:
                textos.recomendacao,
            };
          })
          .filter(
            (
              item
            ): item is NonNullable<
              typeof item
            > =>
              item !== null
          )
      : [];

  const interferenciasSCN:
    InterferenciaRetornoPrecipitacao[] =
    ehNumeroPositivo(
      concentracaoCriticaAgSCN
    ) &&
    ehNumeroPositivo(
      concentracaoAgRemanescente
    )
      ? saisPrecipitacao
          .filter(salValido)
          .filter(
            (sal) =>
              sal.id !==
              "AgSCN"
          )
          .filter((sal) =>
            salContemIon({
              sal,
              ion:
                ionSCN,
            })
          )
          .map((sal) => {
            const especie =
              obterIonOposto({
                sal,
                ion:
                  ionSCN,
              });

            const especieAnalitoInterferente =
              obterEspecieAnalitoDoSal({
                sal,
                ion:
                  especie,
              });

            if (
              !especieAnalitoInterferente
            ) {
              return null;
            }

            const concentracaoCritica =
              calcularConcentracaoCritica({
                sal,

                ionAvaliado:
                  ionSCN,

                concentracaoIonOposto:
                  concentracaoComparacao,
              });

            if (
              !ehNumeroPositivo(
                concentracaoCritica
              )
            ) {
              return null;
            }

            const razao =
              concentracaoCritica /
              concentracaoCriticaAgSCN;

            const avaliacaoEtapa =
              avaliarSeparacaoEtapa({
                salReferencia:
                  salAgSCN,

                especieAnalitoReferencia:
                  "cation",

                concentracaoReferencia:
                  concentracaoAgRemanescente,

                salInterferente:
                  sal,

                especieAnalitoInterferente,

                concentracaoInterferente:
                  concentracaoComparacao,

                especieTitulante:
                  "anion",

                volumeAmostra:
                  volumeInicialRetorno,

                concentracaoTitulante:
                  resultado
                    .concentracaoTitulanteRetorno,

                volumeMaximo:
                  volumeMaximoRetorno,
              });

            const textos =
              obterTextoInterferencia({
                etapa:
                  "titulacao-retorno",

                especie,

                salReferencia:
                  salAgSCN,

                salInterferente:
                  sal,

                avaliacaoEtapa,
              });

            return {
              id:
                `scn-${sal.id}`,

              etapa:
                "titulacao-retorno" as const,

              especieInterferente:
                especie,

              salInterferente:
                sal,

              especieConsumida:
                FORMULA_SCN as "SCN⁻",

              risco:
                avaliacaoEtapa.risco,

              concentracaoCritica,

              concentracaoCriticaReferencia:
                concentracaoCriticaAgSCN,

              razaoConcentracoesCriticas:
                razao,

              avaliacaoSeparacao:
                avaliacaoEtapa
                  .avaliacao,

              percentualReferenciaPrecipitada:
                avaliacaoEtapa
                  .percentualReferenciaPrecipitada,

              volumeInicioInterferente:
                avaliacaoEtapa
                  .volumeInicioInterferente,

              impactoAnalitico:
                textos
                  .impactoAnalitico,

              motivo:
                textos.motivo,

              recomendacao:
                textos.recomendacao,
            };
          })
          .filter(
            (
              item
            ): item is NonNullable<
              typeof item
            > =>
              item !== null
          )
      : [];

  return [
    ...interferenciasAg,
    ...interferenciasSCN,
  ].sort(
    (itemA, itemB) => {
      const ordemRisco = {
        alto: 0,
        moderado: 1,
        baixo: 2,
      };

      const diferencaRisco =
        ordemRisco[
          itemA.risco
        ] -
        ordemRisco[
          itemB.risco
        ];

      if (
        diferencaRisco !== 0
      ) {
        return diferencaRisco;
      }

      const percentualA =
        itemA
          .percentualReferenciaPrecipitada ??
        -1;

      const percentualB =
        itemB
          .percentualReferenciaPrecipitada ??
        -1;

      return (
        percentualA -
        percentualB
      );
    }
  );
}