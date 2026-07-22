import type {
  ResultadoEquilibrioPrecipitacao,
  SalPrecipitacao,
} from "./tipos";

import { formatarPotenciaTexto } from "./formatadores";

const TOLERANCIA_RELATIVA_PI_KPS = 1e-6;
const MAX_ITERACOES_BISSECAO = 200;

function dadosSalValidos(sal: SalPrecipitacao) {
  return (
    Number.isFinite(sal.kps) &&
    sal.kps > 0 &&
    Number.isFinite(sal.coeficienteCation) &&
    Number.isFinite(sal.coeficienteAnion) &&
    sal.coeficienteCation > 0 &&
    sal.coeficienteAnion > 0
  );
}

function calcularProdutoIonicoAPartirDaSolubilidade({
  sal,
  solubilidade,
  concentracaoInicialCation = 0,
  concentracaoInicialAnion = 0,
}: {
  sal: SalPrecipitacao;
  solubilidade: number;
  concentracaoInicialCation?: number;
  concentracaoInicialAnion?: number;
}) {
  const concentracaoCation =
    concentracaoInicialCation +
    sal.coeficienteCation * solubilidade;

  const concentracaoAnion =
    concentracaoInicialAnion +
    sal.coeficienteAnion * solubilidade;

  return (
    Math.pow(concentracaoCation, sal.coeficienteCation) *
    Math.pow(concentracaoAnion, sal.coeficienteAnion)
  );
}

function resolverSolubilidadeComConcentracoesIniciais({
  sal,
  concentracaoInicialCation = 0,
  concentracaoInicialAnion = 0,
}: {
  sal: SalPrecipitacao;
  concentracaoInicialCation?: number;
  concentracaoInicialAnion?: number;
}) {
  if (
    !dadosSalValidos(sal) ||
    !Number.isFinite(concentracaoInicialCation) ||
    !Number.isFinite(concentracaoInicialAnion) ||
    concentracaoInicialCation < 0 ||
    concentracaoInicialAnion < 0
  ) {
    return NaN;
  }

  const produtoIonicoInicial =
    Math.pow(concentracaoInicialCation, sal.coeficienteCation) *
    Math.pow(concentracaoInicialAnion, sal.coeficienteAnion);

  /*
   * Caso as concentrações iniciais já produzam PI >= Kps,
   * não existe dissolução adicional líquida do sólido.
   */
  if (produtoIonicoInicial >= sal.kps) {
    return 0;
  }

  let limiteInferior = 0;
  let limiteSuperior = calcularSolubilidadeMolar(sal);

  if (!Number.isFinite(limiteSuperior) || limiteSuperior <= 0) {
    limiteSuperior = 1e-12;
  }

  /*
   * Amplia o intervalo até encontrar um valor de S para o qual
   * o produto iônico seja igual ou superior ao Kps.
   */
  while (
    calcularProdutoIonicoAPartirDaSolubilidade({
      sal,
      solubilidade: limiteSuperior,
      concentracaoInicialCation,
      concentracaoInicialAnion,
    }) < sal.kps
  ) {
    limiteSuperior *= 2;

    if (!Number.isFinite(limiteSuperior) || limiteSuperior > 1e6) {
      return NaN;
    }
  }

  for (let iteracao = 0; iteracao < MAX_ITERACOES_BISSECAO; iteracao += 1) {
    const pontoMedio = (limiteInferior + limiteSuperior) / 2;

    const produtoIonico = calcularProdutoIonicoAPartirDaSolubilidade({
      sal,
      solubilidade: pontoMedio,
      concentracaoInicialCation,
      concentracaoInicialAnion,
    });

    if (!Number.isFinite(produtoIonico)) {
      return NaN;
    }

    const erroRelativo = Math.abs(produtoIonico - sal.kps) / sal.kps;

    if (erroRelativo <= 1e-12) {
      return pontoMedio;
    }

    if (produtoIonico < sal.kps) {
      limiteInferior = pontoMedio;
    } else {
      limiteSuperior = pontoMedio;
    }
  }

  return (limiteInferior + limiteSuperior) / 2;
}

export function calcularSolubilidadeMolar(sal: SalPrecipitacao) {
  if (!dadosSalValidos(sal)) {
    return NaN;
  }

  const a = sal.coeficienteCation;
  const b = sal.coeficienteAnion;

  /*
   * Para:
   *
   * AₐBᵦ(s) ⇌ a A + b B
   *
   * [A] = aS
   * [B] = bS
   *
   * Kps = (aS)ᵃ(bS)ᵇ
   */
  const fatorEstequiometrico =
    Math.pow(a, a) * Math.pow(b, b);

  const ordemTotal = a + b;

  return Math.pow(
    sal.kps / fatorEstequiometrico,
    1 / ordemTotal
  );
}

export function calcularEquilibrioPrecipitacao(
  sal: SalPrecipitacao
): ResultadoEquilibrioPrecipitacao {
  const solubilidadeMolar = calcularSolubilidadeMolar(sal);

  const concentracaoCationEquilibrio =
    sal.coeficienteCation * solubilidadeMolar;

  const concentracaoAnionEquilibrio =
    sal.coeficienteAnion * solubilidadeMolar;

  const pCation =
    Number.isFinite(concentracaoCationEquilibrio) &&
    concentracaoCationEquilibrio > 0
      ? -Math.log10(concentracaoCationEquilibrio)
      : NaN;

  const pAnion =
    Number.isFinite(concentracaoAnionEquilibrio) &&
    concentracaoAnionEquilibrio > 0
      ? -Math.log10(concentracaoAnionEquilibrio)
      : NaN;

  const termoCation = formatarPotenciaTexto(
    `[${sal.cation.formulaExibicao}]`,
    sal.coeficienteCation
  );

  const termoAnion = formatarPotenciaTexto(
    `[${sal.anion.formulaExibicao}]`,
    sal.coeficienteAnion
  );

  const termoSolubilidadeCation = formatarPotenciaTexto(
    `(${sal.coeficienteCation}S)`,
    sal.coeficienteCation
  );

  const termoSolubilidadeAnion = formatarPotenciaTexto(
    `(${sal.coeficienteAnion}S)`,
    sal.coeficienteAnion
  );

  const expressaoKps =
    `Kps = ${termoCation} × ${termoAnion}`;

  const expressaoSolubilidade =
    `Kps = ${termoSolubilidadeCation} × ${termoSolubilidadeAnion}`;

  return {
    sal,
    solubilidadeMolar,
    concentracaoCationEquilibrio,
    concentracaoAnionEquilibrio,
    pCation,
    pAnion,
    expressaoKps,
    expressaoSolubilidade,
    mensagem:
      sal.coeficienteCation === 1 &&
      sal.coeficienteAnion === 1
        ? "Para este sal 1:1 e na ausência de outros íons, a solubilidade molar é obtida por S = √Kps."
        : "A solubilidade molar foi calculada considerando os coeficientes estequiométricos completos da dissolução. Para este sal, não se deve usar diretamente S = √Kps.",
  };
}

export function calcularProdutoIonicoPrecipitacao({
  sal,
  concentracaoCation,
  concentracaoAnion,
}: {
  sal: SalPrecipitacao;
  concentracaoCation: number;
  concentracaoAnion: number;
}) {
  if (
    !dadosSalValidos(sal) ||
    !Number.isFinite(concentracaoCation) ||
    !Number.isFinite(concentracaoAnion) ||
    concentracaoCation < 0 ||
    concentracaoAnion < 0
  ) {
    return NaN;
  }

  return (
    Math.pow(
      concentracaoCation,
      sal.coeficienteCation
    ) *
    Math.pow(
      concentracaoAnion,
      sal.coeficienteAnion
    )
  );
}

export function classificarProdutoIonico(
  pi: number,
  kps: number
) {
  if (
    !Number.isFinite(pi) ||
    !Number.isFinite(kps) ||
    pi < 0 ||
    kps <= 0
  ) {
    return {
      status: "Dados inválidos",
      interpretacao:
        "Informe concentrações não negativas e um Kps válido para avaliar o estado da solução.",
    };
  }

  const razao = pi / kps;
  const diferencaRelativa = Math.abs(razao - 1);

  if (diferencaRelativa <= TOLERANCIA_RELATIVA_PI_KPS) {
    return {
      status: "Solução saturada",
      interpretacao:
        "PI ≈ Kps. A solução está no limite de saturação e em equilíbrio com o precipitado.",
    };
  }

  if (razao < 1) {
    return {
      status: "Solução insaturada",
      interpretacao:
        "PI < Kps. Nas condições informadas, a solução ainda não atingiu a saturação e não há precipitação termodinamicamente prevista.",
    };
  }

  return {
    status: "Solução supersaturada",
    interpretacao:
      "PI > Kps. A solução está supersaturada e há tendência termodinâmica de formação de precipitado até que o produto iônico seja reduzido ao Kps.",
  };
}

export function calcularSolubilidadeComCationComum({
  sal,
  concentracaoCationComum,
}: {
  sal: SalPrecipitacao;
  concentracaoCationComum: number;
}) {
  if (
    !Number.isFinite(concentracaoCationComum) ||
    concentracaoCationComum <= 0
  ) {
    return NaN;
  }

  /*
   * Equilíbrio completo:
   *
   * Kps = (C_cátion + aS)ᵃ(bS)ᵇ
   *
   * Não se assume que aS seja desprezível em relação
   * à concentração de cátion comum adicionada.
   */
  return resolverSolubilidadeComConcentracoesIniciais({
    sal,
    concentracaoInicialCation: concentracaoCationComum,
    concentracaoInicialAnion: 0,
  });
}

export function calcularSolubilidadeComAnionComum({
  sal,
  concentracaoAnionComum,
}: {
  sal: SalPrecipitacao;
  concentracaoAnionComum: number;
}) {
  if (
    !Number.isFinite(concentracaoAnionComum) ||
    concentracaoAnionComum <= 0
  ) {
    return NaN;
  }

  /*
   * Equilíbrio completo:
   *
   * Kps = (aS)ᵃ(C_ânion + bS)ᵇ
   *
   * Não se assume que bS seja desprezível em relação
   * à concentração de ânion comum adicionada.
   */
  return resolverSolubilidadeComConcentracoesIniciais({
    sal,
    concentracaoInicialCation: 0,
    concentracaoInicialAnion: concentracaoAnionComum,
  });
}