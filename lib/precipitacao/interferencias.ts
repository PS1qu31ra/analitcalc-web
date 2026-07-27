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
  InterferenciaPrecipitacao,
  IonPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
  SalPrecipitacao,
} from "./tipos";

/**
 * Como a concentração real do possível interferente
 * não é informada neste módulo, o sistema utiliza,
 * apenas para comparação, a mesma concentração
 * analítica informada para o analito principal.
 *
 * Essa hipótese permite considerar:
 *
 * - o Kps;
 * - a estequiometria do precipitado;
 * - a concentração do sistema.
 *
 * A classificação continua sendo uma avaliação
 * potencial, e não uma confirmação experimental.
 */

function ehNumeroPositivo(valor: number) {
  return Number.isFinite(valor) && valor > 0;
}

function coeficienteValido(valor: number) {
  return (
    Number.isFinite(valor) &&
    Number.isInteger(valor) &&
    valor > 0
  );
}

function salValido(sal: SalPrecipitacao) {
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
    | ResultadoTitulacaoDiretaPrecipitacao
    | null
): resultado is ResultadoTitulacaoDiretaPrecipitacao {
  return (
    resultado !== null &&
    resultado.status !== "dados_invalidos" &&
    salValido(resultado.sal) &&
    ehNumeroPositivo(
      resultado.concentracaoAnalito
    )
  );
}

function obterIonTitulante(
  resultado:
    ResultadoTitulacaoDiretaPrecipitacao
): IonPrecipitacao {
  return resultado.especieTitulante ===
    "cation"
    ? resultado.sal.cation
    : resultado.sal.anion;
}

function obterCoeficienteTitulante({
  sal,
  titulante,
}: {
  sal: SalPrecipitacao;
  titulante: IonPrecipitacao;
}) {
  if (sal.cation.id === titulante.id) {
    return sal.coeficienteCation;
  }

  if (sal.anion.id === titulante.id) {
    return sal.coeficienteAnion;
  }

  return NaN;
}

function obterCoeficienteEspecieConcorrente({
  sal,
  titulante,
}: {
  sal: SalPrecipitacao;
  titulante: IonPrecipitacao;
}) {
  if (sal.cation.id === titulante.id) {
    return sal.coeficienteAnion;
  }

  if (sal.anion.id === titulante.id) {
    return sal.coeficienteCation;
  }

  return NaN;
}

function salUsaMesmoTitulante({
  sal,
  titulante,
}: {
  sal: SalPrecipitacao;
  titulante: IonPrecipitacao;
}) {
  return (
    sal.cation.id === titulante.id ||
    sal.anion.id === titulante.id
  );
}

function obterEspecieConcorrente({
  sal,
  titulante,
}: {
  sal: SalPrecipitacao;
  titulante: IonPrecipitacao;
}): IonPrecipitacao {
  if (sal.cation.id === titulante.id) {
    return sal.anion;
  }

  return sal.cation;
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
 * Calcula a concentração livre de titulante necessária
 * para iniciar a precipitação.
 *
 * Para um precipitado genérico:
 *
 * CₐAᵦ(s) ⇌ a C + b A
 *
 * Kps = [C]ᵃ[A]ᵇ
 *
 * Caso o titulante seja C:
 *
 * [C]início =
 * (
 *   Kps / [A]ᵇ
 * )^(1/a)
 *
 * O cálculo é feito em escala logarítmica para reduzir
 * problemas numéricos com valores muito pequenos.
 */
function calcularConcentracaoCriticaTitulante({
  sal,
  titulante,
  concentracaoEspecieConcorrente,
}: {
  sal: SalPrecipitacao;
  titulante: IonPrecipitacao;
  concentracaoEspecieConcorrente: number;
}) {
  const coeficienteTitulante =
    obterCoeficienteTitulante({
      sal,
      titulante,
    });

  const coeficienteConcorrente =
    obterCoeficienteEspecieConcorrente({
      sal,
      titulante,
    });

  if (
    !coeficienteValido(
      coeficienteTitulante
    ) ||
    !coeficienteValido(
      coeficienteConcorrente
    ) ||
    !ehNumeroPositivo(
      concentracaoEspecieConcorrente
    )
  ) {
    return NaN;
  }

  const log10ConcentracaoCritica =
    (
      Math.log10(sal.kps) -
      coeficienteConcorrente *
        Math.log10(
          concentracaoEspecieConcorrente
        )
    ) /
    coeficienteTitulante;

  return Math.pow(
    10,
    log10ConcentracaoCritica
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
      "Não foi possível calcular quanto do precipitado principal estava formado quando o precipitado concorrente começou a se formar.",
  };
}

function obterRiscoPredominante({
  avaliacao,
  principalFormaPrimeiro,
  precipitacaoSimultanea,
}: {
  avaliacao:
    AvaliacaoSeparacaoPrecipitacao;
  principalFormaPrimeiro: boolean;
  precipitacaoSimultanea: boolean;
}): InterferenciaPrecipitacao["risco"] {
  if (
    precipitacaoSimultanea ||
    !principalFormaPrimeiro
  ) {
    return "alto";
  }

  if (
    avaliacao.risco === null
  ) {
    return "baixo";
  }

  return avaliacao.risco;
}

function criarDescricaoAvaliacao({
  salPrincipal,
  salInterferente,
  especieConcorrente,
  avaliacao,
  principalFormaPrimeiro,
  precipitacaoSimultanea,
}: {
  salPrincipal: SalPrecipitacao;
  salInterferente: SalPrecipitacao;
  especieConcorrente: IonPrecipitacao;
  avaliacao:
    AvaliacaoSeparacaoPrecipitacao;
  principalFormaPrimeiro: boolean;
  precipitacaoSimultanea: boolean;
}) {
  if (precipitacaoSimultanea) {
    return (
      `${salPrincipal.formulaExibicao} e ` +
      `${salInterferente.formulaExibicao} começam a se formar ` +
      "em condições praticamente iguais. O titulante pode ser " +
      `consumido simultaneamente pelo analito principal e por ` +
      `${especieConcorrente.formulaExibicao}.`
    );
  }

  if (!principalFormaPrimeiro) {
    return (
      `${salInterferente.formulaExibicao} começa a precipitar antes de ` +
      `${salPrincipal.formulaExibicao}. Assim, ` +
      `${especieConcorrente.formulaExibicao} começa a consumir o ` +
      "titulante antes da precipitação predominante do analito principal. " +
      "A interferência é classificada como de alto risco."
    );
  }

  if (
    avaliacao.classificacao ===
    "nao_avaliada"
  ) {
    return (
      `${salPrincipal.formulaExibicao} precipita primeiro e ` +
      `${salInterferente.formulaExibicao} não começou a se formar ` +
      "dentro do intervalo calculado. Não foi observada precipitação " +
      "concorrente na faixa simulada."
    );
  }

  return (
    `${salPrincipal.formulaExibicao} precipita antes de ` +
    `${salInterferente.formulaExibicao}. Quando o precipitado ` +
    `concorrente começa a se formar, aproximadamente ` +
    `${(
      avaliacao.percentualPrecipitado ??
      0
    ).toFixed(4)}% do sistema principal já precipitou. ` +
    avaliacao.interpretacao
  );
}

export function avaliarInterferenciasPrecipitacao(
  resultado:
    | ResultadoTitulacaoDiretaPrecipitacao
    | null
): InterferenciaPrecipitacao[] {
  if (
    !resultadoValido(resultado)
  ) {
    return [];
  }

  const salPrincipal =
    resultado.sal;

  const titulante =
    obterIonTitulante(resultado);

  const concentracaoComparacao =
    resultado.concentracaoAnalito;

  const concentracaoCriticaPrincipal =
    calcularConcentracaoCriticaTitulante({
      sal:
        salPrincipal,

      titulante,

      concentracaoEspecieConcorrente:
        concentracaoComparacao,
    });

  if (
    !ehNumeroPositivo(
      concentracaoCriticaPrincipal
    )
  ) {
    return [];
  }

  const volumeMaximoCurva =
    Math.max(
      resultado.volumeMaximoBureta,
      resultado.volumePE * 1.3,
      1
    );

  return saisPrecipitacao
    .filter(
      (sal) =>
        sal.id !==
        salPrincipal.id
    )
    .filter(salValido)
    .filter((sal) =>
      salUsaMesmoTitulante({
        sal,
        titulante,
      })
    )
    .map((sal) => {
      const especieConcorrente =
        obterEspecieConcorrente({
          sal,
          titulante,
        });

      const especieAnalitoInterferente =
        obterEspecieAnalitoDoSal({
          sal,
          ion:
            especieConcorrente,
        });

      if (
        !especieAnalitoInterferente
      ) {
        return null;
      }

      const concentracaoCriticaInterferente =
        calcularConcentracaoCriticaTitulante({
          sal,
          titulante,

          /*
           * A triagem continua usando inicialmente a
           * mesma concentração analítica do analito
           * principal para o possível interferente.
           */
          concentracaoEspecieConcorrente:
            concentracaoComparacao,
        });

      if (
        !ehNumeroPositivo(
          concentracaoCriticaInterferente
        )
      ) {
        return null;
      }

      const razaoConcentracoesCriticas =
        concentracaoCriticaInterferente /
        concentracaoCriticaPrincipal;

      const seletividade =
        calcularSeletividadePrecipitacao({
          especieTitulante:
            resultado.especieTitulante,

          itens: [
            {
              sal:
                salPrincipal,

              especieAnalito:
                resultado.especieAnalito,

              concentracaoAnalito:
                resultado.concentracaoAnalito,
            },

            {
              sal,

              especieAnalito:
                especieAnalitoInterferente,

              concentracaoAnalito:
                concentracaoComparacao,
            },
          ],
        });

      let avaliacao =
        criarAvaliacaoIndeterminada();

      let primeiroSalId:
        string | null = null;

      let segundoSalId:
        string | null = null;

      let volumeInicioInterferente:
        number | null = null;

      if (
        seletividade.status ===
        "adequado"
      ) {
        const curva =
          gerarCurvaSeletividadePrecipitacao({
            resultado:
              seletividade,

            volumeAmostra:
              resultado.volumeAmostra,

            concentracaoTitulante:
              resultado.concentracaoTitulante,

            passo: 0.1,

            volumeMaximoManual:
              volumeMaximoCurva,
          });

        const comparacao =
          curva.comparacoesKps[0];

        if (comparacao) {
          avaliacao =
            comparacao.avaliacao;

          primeiroSalId =
            comparacao
              .primeiroSal.id;

          segundoSalId =
            comparacao
              .segundoSal.id;

          /*
           * O volume armazenado representa o início do
           * segundo precipitado da comparação.
           *
           * Só corresponde ao interferente quando ele é
           * realmente o segundo sistema.
           */
          volumeInicioInterferente =
            comparacao
                .segundoSal.id ===
              sal.id
              ? comparacao
                  .volumeInicioSegundo
              : null;
        }
      }

      const principalFormaPrimeiro =
        primeiroSalId ===
        salPrincipal.id;

      const precipitacaoSimultanea =
        primeiroSalId !== null &&
        segundoSalId !== null &&
        seletividade.status ===
          "adequado" &&
        seletividade.itens.some(
          (item) =>
            item.sal.id ===
              salPrincipal.id &&
            item.ordemPrecipitacao ===
              seletividade.itens.find(
                (outroItem) =>
                  outroItem.sal.id ===
                  sal.id
              )?.ordemPrecipitacao
        );

        const risco =
        obterRiscoPredominante({
          avaliacao,
          principalFormaPrimeiro,
          precipitacaoSimultanea,
        });

      const razaoKps =
        sal.kps /
        salPrincipal.kps;

      const motivo =
        criarDescricaoAvaliacao({
          salPrincipal,

          salInterferente:
            sal,

          especieConcorrente,

          avaliacao,

          principalFormaPrimeiro,

          precipitacaoSimultanea,
        });

      return {
        salInterferente:
          sal,

        especieConcorrente,

        risco,

        motivo,

        razaoKps,

        concentracaoCriticaPrincipal,

        concentracaoCriticaInterferente,

        razaoConcentracoesCriticas,

        avaliacaoSeparacao:
          avaliacao,

        percentualPrincipalPrecipitado:
          principalFormaPrimeiro
            ? avaliacao
                .percentualPrecipitado
            : null,

        volumeInicioInterferente,
      };
    })
    .filter(
      (
        item
      ): item is NonNullable<typeof item> =>
        item !== null
    )
    .sort(
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
            .percentualPrincipalPrecipitado ??
          -1;

        const percentualB =
          itemB
            .percentualPrincipalPrecipitado ??
          -1;

        return (
          percentualA -
          percentualB
        );
      }
    );
}