import type {
  EntradaTitulacaoDiretaPrecipitacao,
  EspecieAnalitoPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
  SalPrecipitacao,
} from "./tipos";

function coeficientesDoSistemaValidos(sal: SalPrecipitacao) {
  return (
    Number.isFinite(sal.coeficienteCation) &&
    Number.isFinite(sal.coeficienteAnion) &&
    Number.isInteger(sal.coeficienteCation) &&
    Number.isInteger(sal.coeficienteAnion) &&
    sal.coeficienteCation > 0 &&
    sal.coeficienteAnion > 0
  );
}

function especieAnalitoValida(
  especieAnalito: EspecieAnalitoPrecipitacao
) {
  return especieAnalito === "cation" || especieAnalito === "anion";
}

function obterCoeficienteEspecie({
  sal,
  especie,
}: {
  sal: SalPrecipitacao;
  especie: EspecieAnalitoPrecipitacao;
}) {
  return especie === "cation"
    ? sal.coeficienteCation
    : sal.coeficienteAnion;
}

function obterFormulaEspecie({
  sal,
  especie,
}: {
  sal: SalPrecipitacao;
  especie: EspecieAnalitoPrecipitacao;
}) {
  return especie === "cation"
    ? sal.cation.formulaExibicao
    : sal.anion.formulaExibicao;
}

function criarResultadoInvalido({
  entrada,
  especieTitulante,
  coeficienteAnalito,
  coeficienteTitulante,
  mensagem,
}: {
  entrada: EntradaTitulacaoDiretaPrecipitacao;
  especieTitulante: EspecieAnalitoPrecipitacao;
  coeficienteAnalito: number;
  coeficienteTitulante: number;
  mensagem: string;
}): ResultadoTitulacaoDiretaPrecipitacao {
  return {
    sal: entrada.sal,
    especieAnalito: entrada.especieAnalito,
    especieTitulante,

    concentracaoAnalito: entrada.concentracaoAnalito,
    volumeAmostra: entrada.volumeAmostra,
    concentracaoTitulante: entrada.concentracaoTitulante,
    volumeMaximoBureta: entrada.volumeMaximoBureta,

    molAnalito: NaN,
    molTitulantePE: NaN,
    volumePE: NaN,

    coeficienteAnalito,
    coeficienteTitulante,

    relacaoEstequiometrica: "-",

    status: "dados_invalidos",
    mensagem,
  };
}

export function calcularTitulacaoDiretaPrecipitacao(
  entrada: EntradaTitulacaoDiretaPrecipitacao
): ResultadoTitulacaoDiretaPrecipitacao {
  const {
    sal,
    especieAnalito,
    concentracaoAnalito,
    volumeAmostra,
    concentracaoTitulante,
    volumeMaximoBureta,
  } = entrada;

  const especieTitulante: EspecieAnalitoPrecipitacao =
    especieAnalito === "anion" ? "cation" : "anion";

  const coeficienteAnalito = obterCoeficienteEspecie({
    sal,
    especie: especieAnalito,
  });

  const coeficienteTitulante = obterCoeficienteEspecie({
    sal,
    especie: especieTitulante,
  });

  if (!especieAnalitoValida(especieAnalito)) {
    return criarResultadoInvalido({
      entrada,
      especieTitulante,
      coeficienteAnalito,
      coeficienteTitulante,
      mensagem:
        "A espécie presente na amostra deve ser definida como cátion ou ânion.",
    });
  }

  if (!coeficientesDoSistemaValidos(sal)) {
    return criarResultadoInvalido({
      entrada,
      especieTitulante,
      coeficienteAnalito,
      coeficienteTitulante,
      mensagem:
        "Os coeficientes estequiométricos do precipitado devem ser números inteiros positivos.",
    });
  }

  const dadosNumericosValidos =
    Number.isFinite(concentracaoAnalito) &&
    Number.isFinite(volumeAmostra) &&
    Number.isFinite(concentracaoTitulante) &&
    Number.isFinite(volumeMaximoBureta) &&
    concentracaoAnalito > 0 &&
    volumeAmostra > 0 &&
    concentracaoTitulante > 0 &&
    volumeMaximoBureta > 0;

  if (!dadosNumericosValidos) {
    return criarResultadoInvalido({
      entrada,
      especieTitulante,
      coeficienteAnalito,
      coeficienteTitulante,
      mensagem:
        "Informe valores positivos e finitos para a concentração do analito, volume da amostra, concentração da solução titulante e capacidade da bureta.",
    });
  }

  /*
   * Os volumes informados na interface estão em mL.
   * Para calcular quantidade de matéria, o volume da amostra
   * precisa ser convertido para litros.
   */
  const volumeAmostraL = volumeAmostra / 1000;

  const molAnalito =
    concentracaoAnalito * volumeAmostraL;

  /*
   * Para um precipitado genérico:
   *
   * CₐAᵦ(s)
   *
   * a quantidade estequiométrica obedece:
   *
   * n(cátion) / a = n(ânion) / b
   *
   * Portanto:
   *
   * n(titulante) =
   * n(analito) × coeficienteTitulante / coeficienteAnalito
   */
  const molTitulantePE =
    molAnalito *
    (coeficienteTitulante / coeficienteAnalito);

  /*
   * C = n / V
   *
   * V = n / C
   *
   * O resultado inicial é obtido em litros e convertido para mL.
   */
  const volumePEL =
    molTitulantePE / concentracaoTitulante;

  const volumePE =
    volumePEL * 1000;

  if (
    !Number.isFinite(molAnalito) ||
    !Number.isFinite(molTitulantePE) ||
    !Number.isFinite(volumePE) ||
    molAnalito <= 0 ||
    molTitulantePE <= 0 ||
    volumePE <= 0
  ) {
    return criarResultadoInvalido({
      entrada,
      especieTitulante,
      coeficienteAnalito,
      coeficienteTitulante,
      mensagem:
        "Não foi possível calcular o volume de equivalência com os dados informados.",
    });
  }

  /*
   * Pequena tolerância numérica evita classificar como fora da
   * bureta um valor que difira apenas por arredondamento computacional.
   */
  const toleranciaVolume =
    Math.max(volumeMaximoBureta, volumePE, 1) * 1e-10;

  const volumeDentroDaBureta =
    volumePE <= volumeMaximoBureta + toleranciaVolume;

  const status: ResultadoTitulacaoDiretaPrecipitacao["status"] =
    volumeDentroDaBureta
      ? "adequado"
      : "fora_da_bureta";

  const formulaAnalito = obterFormulaEspecie({
    sal,
    especie: especieAnalito,
  });

  const formulaTitulante = obterFormulaEspecie({
    sal,
    especie: especieTitulante,
  });

  const relacaoEstequiometrica =
    `${coeficienteAnalito} ${formulaAnalito} : ` +
    `${coeficienteTitulante} ${formulaTitulante}`;

  return {
    sal,
    especieAnalito,
    especieTitulante,

    concentracaoAnalito,
    volumeAmostra,
    concentracaoTitulante,
    volumeMaximoBureta,

    molAnalito,
    molTitulantePE,
    volumePE,

    coeficienteAnalito,
    coeficienteTitulante,

    relacaoEstequiometrica,

    status,

    mensagem:
      status === "adequado"
        ? `A quantidade estequiométrica de ${formulaTitulante} pode ser adicionada dentro da capacidade informada da bureta.`
        : `O volume necessário de ${formulaTitulante} ultrapassa a capacidade informada da bureta. Aumente a concentração da solução titulante, reduza a quantidade de amostra ou utilize uma bureta de maior capacidade.`,
  };
}