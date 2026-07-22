import { saisPrecipitacao } from "../data/precipitacao/sais";

import type {
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
const FATOR_RISCO_MODERADO = 10;

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

function obterDescricaoRisco({
  risco,
  especieConcorrente,
  salInterferente,
  concentracaoCriticaInterferente,
  concentracaoCriticaPrincipal,
}: {
  risco: InterferenciaPrecipitacao["risco"];
  especieConcorrente: IonPrecipitacao;
  salInterferente: SalPrecipitacao;
  concentracaoCriticaInterferente: number;
  concentracaoCriticaPrincipal: number;
}) {
  const razaoConcentracoesCriticas =
    concentracaoCriticaInterferente /
    concentracaoCriticaPrincipal;

  const razaoFormatada =
    razaoConcentracoesCriticas.toExponential(
      3
    );

  if (risco === "alto") {
    return (
      `${especieConcorrente.formulaExibicao} pode formar ` +
      `${salInterferente.formulaExibicao} antes ou praticamente ` +
      "ao mesmo tempo que o precipitado principal. " +
      "Sob a hipótese de concentrações analíticas iguais, " +
      `o início desse precipitado exige aproximadamente ` +
      `${razaoFormatada} vez(es) a concentração livre de titulante ` +
      "necessária para o sistema principal. A presença desse íon " +
      "pode provocar consumo adicional do titulante e erro positivo."
    );
  }

  if (risco === "moderado") {
    return (
      `${especieConcorrente.formulaExibicao} tende a começar a ` +
      `precipitar depois do sistema principal, formando ` +
      `${salInterferente.formulaExibicao}. Entretanto, as ` +
      "concentrações críticas calculadas estão relativamente próximas: " +
      `a razão estimada é ${razaoFormatada}. Pode ocorrer sobreposição ` +
      "antes que a precipitação do analito principal esteja completa."
    );
  }

  return (
    `${especieConcorrente.formulaExibicao} necessita, sob a hipótese ` +
    "de concentrações analíticas iguais, de uma concentração livre de " +
    `titulante aproximadamente ${razaoFormatada} vez(es) maior para ` +
    `iniciar a formação de ${salInterferente.formulaExibicao}. ` +
    "A tendência de interferência é menor, mas pode aumentar caso esse " +
    "íon esteja presente em concentração significativamente mais alta."
  );
}

export function avaliarInterferenciasPrecipitacao(
  resultado:
    | ResultadoTitulacaoDiretaPrecipitacao
    | null
): InterferenciaPrecipitacao[] {
  if (!resultadoValido(resultado)) {
    return [];
  }

  const salPrincipal = resultado.sal;

  const titulante =
    obterIonTitulante(resultado);

  const concentracaoComparacao =
    resultado.concentracaoAnalito;

  const concentracaoCriticaPrincipal =
    calcularConcentracaoCriticaTitulante({
      sal: salPrincipal,
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

  return saisPrecipitacao
    .filter(
      (sal) =>
        sal.id !== salPrincipal.id
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

      const concentracaoCriticaInterferente =
        calcularConcentracaoCriticaTitulante({
          sal,
          titulante,

          /*
           * A concentração real do possível interferente
           * não está disponível. Para comparar os sistemas,
           * assume-se a mesma concentração do analito
           * principal.
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

      /*
       * Uma razão menor que ou igual a 1 indica que o
       * interferente começa a precipitar antes ou junto
       * com o precipitado principal.
       *
       * Uma razão entre 1 e 10 indica proximidade entre
       * os inícios de precipitação e risco de sobreposição.
       */
      const razaoConcentracoesCriticas =
        concentracaoCriticaInterferente /
        concentracaoCriticaPrincipal;

      let risco:
        InterferenciaPrecipitacao["risco"];

      if (
        razaoConcentracoesCriticas <= 1
      ) {
        risco = "alto";
      } else if (
        razaoConcentracoesCriticas <=
        FATOR_RISCO_MODERADO
      ) {
        risco = "moderado";
      } else {
        risco = "baixo";
      }

      /*
       * Mantemos razaoKps por compatibilidade com os
       * componentes atuais da interface.
       *
       * Ela deve ser exibida apenas como informação
       * complementar, e não como único critério para
       * definir a interferência.
       */
      const razaoKps =
        sal.kps / salPrincipal.kps;

      const motivo =
        obterDescricaoRisco({
          risco,
          especieConcorrente,

          salInterferente: sal,

          concentracaoCriticaInterferente,
          concentracaoCriticaPrincipal,
        });

      return {
        salInterferente: sal,
        especieConcorrente,
        risco,
        motivo,
        razaoKps,

        /*
         * Propriedades adicionais são disponibilizadas
         * para componentes futuros da interface.
         *
         * O tipo atual de InterferenciaPrecipitacao não
         * exige esses campos, então eles não são incluídos
         * no objeto retornado para preservar compatibilidade.
         */
      };
    })
    .filter(
      (
        item
      ): item is InterferenciaPrecipitacao =>
        item !== null
    )
    .sort((itemA, itemB) => {
      const concentracaoCriticaA =
        calcularConcentracaoCriticaTitulante({
          sal: itemA.salInterferente,
          titulante,

          concentracaoEspecieConcorrente:
            concentracaoComparacao,
        });

      const concentracaoCriticaB =
        calcularConcentracaoCriticaTitulante({
          sal: itemB.salInterferente,
          titulante,

          concentracaoEspecieConcorrente:
            concentracaoComparacao,
        });

      return (
        concentracaoCriticaA -
        concentracaoCriticaB
      );
    });
}