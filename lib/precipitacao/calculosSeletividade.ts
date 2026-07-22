import type {
  EntradaSeletividadePrecipitacao,
  EspecieAnalitoPrecipitacao,
  ResultadoItemSeletividadePrecipitacao,
  ResultadoSeletividadePrecipitacao,
  SalPrecipitacao,
} from "./tipos";

const TOLERANCIA_RELATIVA_EMPATE = 1e-9;

function especieValida(
  especie: EspecieAnalitoPrecipitacao
) {
  return especie === "cation" || especie === "anion";
}

function obterEspecieComplementar(
  especie: EspecieAnalitoPrecipitacao
): EspecieAnalitoPrecipitacao {
  return especie === "anion"
    ? "cation"
    : "anion";
}

function obterCoeficienteEspecie({
  sal,
  especie,
}: {
  sal: SalPrecipitacao;
  especie: EspecieAnalitoPrecipitacao;
}) {
  return especie === "anion"
    ? sal.coeficienteAnion
    : sal.coeficienteCation;
}

function obterFormulaEspecie({
  sal,
  especie,
}: {
  sal: SalPrecipitacao;
  especie: EspecieAnalitoPrecipitacao;
}) {
  return especie === "anion"
    ? sal.anion.formulaExibicao
    : sal.cation.formulaExibicao;
}

function coeficienteValido(
  coeficiente: number
) {
  return (
    Number.isFinite(coeficiente) &&
    Number.isInteger(coeficiente) &&
    coeficiente > 0
  );
}

function salValidoParaSeletividade(
  sal: SalPrecipitacao
) {
  return (
    Number.isFinite(sal.kps) &&
    sal.kps > 0 &&
    coeficienteValido(
      sal.coeficienteCation
    ) &&
    coeficienteValido(
      sal.coeficienteAnion
    )
  );
}

function concentracoesPraticamenteIguais(
  valorA: number,
  valorB: number
) {
  if (
    !Number.isFinite(valorA) ||
    !Number.isFinite(valorB)
  ) {
    return false;
  }

  const escala = Math.max(
    Math.abs(valorA),
    Math.abs(valorB),
    Number.MIN_VALUE
  );

  return (
    Math.abs(valorA - valorB) / escala <=
    TOLERANCIA_RELATIVA_EMPATE
  );
}

function calcularConcentracaoInicio({
  kps,
  concentracaoAnalito,
  coeficienteAnalito,
  coeficienteTitulante,
}: {
  kps: number;
  concentracaoAnalito: number;
  coeficienteAnalito: number;
  coeficienteTitulante: number;
}) {
  /*
   * Para um precipitado genérico:
   *
   * CₐAᵦ(s)
   *
   * Kps =
   * [C]ᵃ[A]ᵇ
   *
   * No instante em que a precipitação começa:
   *
   * [titulante] =
   * (
   *   Kps /
   *   [analito]^coeficienteAnalito
   * )^(1/coeficienteTitulante)
   */
  const log10Kps =
    Math.log10(kps);

  const log10ConcentracaoAnalito =
    Math.log10(concentracaoAnalito);

  const log10ConcentracaoInicio =
    (
      log10Kps -
      coeficienteAnalito *
        log10ConcentracaoAnalito
    ) /
    coeficienteTitulante;

  return Math.pow(
    10,
    log10ConcentracaoInicio
  );
}

export function calcularSeletividadePrecipitacao(
  entrada: EntradaSeletividadePrecipitacao
): ResultadoSeletividadePrecipitacao {
  const {
    especieTitulante,
    itens,
  } = entrada;

  if (!especieValida(especieTitulante)) {
    return {
      especieTitulante,
      itens: [],
      status: "dados_invalidos",
      mensagem:
        "A espécie titulante deve ser definida como cátion ou ânion.",
    };
  }

  if (!Array.isArray(itens) || itens.length < 2) {
    return {
      especieTitulante,
      itens: [],
      status: "mistura_insuficiente",
      mensagem:
        "Informe pelo menos dois analitos para comparar a ordem de precipitação.",
    };
  }

  const itensValidos = itens.filter(
    (item) => {
      if (
        !item ||
        !item.sal ||
        !especieValida(
          item.especieAnalito
        )
      ) {
        return false;
      }

      const especieComplementar =
        obterEspecieComplementar(
          item.especieAnalito
        );

      return (
        especieComplementar ===
          especieTitulante &&
        salValidoParaSeletividade(
          item.sal
        ) &&
        Number.isFinite(
          item.concentracaoAnalito
        ) &&
        item.concentracaoAnalito > 0
      );
    }
  );

  if (itensValidos.length < 2) {
    return {
      especieTitulante,
      itens: [],
      status: "dados_invalidos",
      mensagem:
        "A mistura precisa conter pelo menos dois analitos válidos que formem precipitados com a mesma espécie titulante.",
    };
  }

  const resultadosSemOrdem: Omit<
    ResultadoItemSeletividadePrecipitacao,
    "ordemPrecipitacao"
  >[] = [];

  for (const item of itensValidos) {
    const {
      sal,
      especieAnalito,
      concentracaoAnalito,
    } = item;

    const coeficienteAnalito =
      obterCoeficienteEspecie({
        sal,
        especie: especieAnalito,
      });

    const coeficienteTitulante =
      obterCoeficienteEspecie({
        sal,
        especie: especieTitulante,
      });

    const formulaAnalito =
      obterFormulaEspecie({
        sal,
        especie: especieAnalito,
      });

    const formulaTitulante =
      obterFormulaEspecie({
        sal,
        especie: especieTitulante,
      });

    const concentracaoTitulanteInicioPrecipitacao =
      calcularConcentracaoInicio({
        kps: sal.kps,
        concentracaoAnalito,
        coeficienteAnalito,
        coeficienteTitulante,
      });

    if (
      !Number.isFinite(
        concentracaoTitulanteInicioPrecipitacao
      ) ||
      concentracaoTitulanteInicioPrecipitacao <= 0
    ) {
      continue;
    }

    const pTitulanteInicioPrecipitacao =
      -Math.log10(
        concentracaoTitulanteInicioPrecipitacao
      );

    const expoenteAnalito =
      coeficienteAnalito === 1
        ? ""
        : `^${coeficienteAnalito}`;

    const expoenteTitulante =
      coeficienteTitulante === 1
        ? ""
        : `^(1/${coeficienteTitulante})`;

    const criterio =
      `[${formulaTitulante}]início = ` +
      `(Kps / [${formulaAnalito}]${expoenteAnalito})` +
      expoenteTitulante;

    const interpretacao =
      `O precipitado ${sal.formulaExibicao} começa a se formar quando a concentração livre de ${formulaTitulante} atinge esse valor. Quanto menor a concentração necessária, mais cedo ocorre o início da precipitação.`;

    resultadosSemOrdem.push({
      sal,
      especieAnalito,
      concentracaoAnalito,

      especieTitulante,

      concentracaoTitulanteInicioPrecipitacao,
      pTitulanteInicioPrecipitacao,

      criterio,
      interpretacao,
    });
  }

  if (resultadosSemOrdem.length < 2) {
    return {
      especieTitulante,
      itens: [],
      status: "dados_invalidos",
      mensagem:
        "Não foi possível calcular pelo menos dois valores válidos de início de precipitação.",
    };
  }

  const resultadosOrdenados = [
    ...resultadosSemOrdem,
  ].sort(
    (itemA, itemB) =>
      itemA
        .concentracaoTitulanteInicioPrecipitacao -
      itemB
        .concentracaoTitulanteInicioPrecipitacao
  );

  /*
   * A ordem não deve aumentar quando dois sistemas
   * apresentam concentrações de início praticamente
   * iguais. Nesses casos, ambos recebem a mesma posição.
   *
   * Exemplo:
   *
   * 1º, 1º, 3º
   */
  const itensOrdenados:
    ResultadoItemSeletividadePrecipitacao[] =
    resultadosOrdenados.map(
      (item, indice) => {
        if (indice === 0) {
          return {
            ...item,
            ordemPrecipitacao: 1,
          };
        }

        const itemAnterior =
          resultadosOrdenados[indice - 1];

        const ordemAnterior =
          resultadosOrdenados
            .slice(0, indice)
            .reduce(
              (
                ordemAtual,
                itemComparado,
                indiceComparado
              ) => {
                if (
                  indiceComparado === 0
                ) {
                  return 1;
                }

                const anterior =
                  resultadosOrdenados[
                    indiceComparado - 1
                  ];

                return concentracoesPraticamenteIguais(
                  itemComparado
                    .concentracaoTitulanteInicioPrecipitacao,
                  anterior
                    .concentracaoTitulanteInicioPrecipitacao
                )
                  ? ordemAtual
                  : indiceComparado + 1;
              },
              1
            );

        const mesmaFaixaDoAnterior =
          concentracoesPraticamenteIguais(
            item
              .concentracaoTitulanteInicioPrecipitacao,
            itemAnterior
              .concentracaoTitulanteInicioPrecipitacao
          );

        return {
          ...item,
          ordemPrecipitacao:
            mesmaFaixaDoAnterior
              ? ordemAnterior
              : indice + 1,
        };
      }
    );

  const primeiro =
    itensOrdenados[0];

  const segundo =
    itensOrdenados[1];

  const razaoEntrePrimeiros =
    segundo
      .concentracaoTitulanteInicioPrecipitacao /
    primeiro
      .concentracaoTitulanteInicioPrecipitacao;

  const mensagem =
    concentracoesPraticamenteIguais(
      primeiro
        .concentracaoTitulanteInicioPrecipitacao,
      segundo
        .concentracaoTitulanteInicioPrecipitacao
    )
      ? "Os primeiros precipitados apresentam concentrações de início praticamente iguais. A ordem de formação pode não ser distinguível apenas pelo Kps e pelas concentrações informadas."
      : `A ordem foi determinada pela concentração livre mínima de titulante necessária para iniciar cada precipitação. O segundo sistema começa a precipitar em uma concentração de titulante aproximadamente ${razaoEntrePrimeiros.toExponential(
          3
        )} vez(es) maior que o primeiro.`;

  return {
    especieTitulante,
    itens: itensOrdenados,
    status: "adequado",
    mensagem,
  };
}