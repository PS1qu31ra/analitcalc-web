import type {
  CurvaTitulacaoDiretaPrecipitacao,
  EspecieAnalitoPrecipitacao,
  PontoCurvaTitulacaoDiretaPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
} from "./tipos";

const MAX_ITERACOES_BISSECAO = 250;
const TOLERANCIA_RELATIVA_EQUILIBRIO = 1e-12;

function calcularPLivre(concentracao: number) {
  if (!Number.isFinite(concentracao) || concentracao <= 0) {
    return NaN;
  }

  return -Math.log10(concentracao);
}

function limitarValor({
  valor,
  minimo,
  maximo,
}: {
  valor: number;
  minimo: number;
  maximo: number;
}) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function dadosDoResultadoValidos(
  resultado: ResultadoTitulacaoDiretaPrecipitacao
) {
  return (
    resultado.status !== "dados_invalidos" &&
    Number.isFinite(resultado.sal.kps) &&
    resultado.sal.kps > 0 &&
    Number.isFinite(resultado.sal.coeficienteCation) &&
    Number.isFinite(resultado.sal.coeficienteAnion) &&
    resultado.sal.coeficienteCation > 0 &&
    resultado.sal.coeficienteAnion > 0 &&
    Number.isFinite(resultado.molAnalito) &&
    resultado.molAnalito > 0 &&
    Number.isFinite(resultado.concentracaoTitulante) &&
    resultado.concentracaoTitulante > 0 &&
    Number.isFinite(resultado.volumeAmostra) &&
    resultado.volumeAmostra > 0 &&
    Number.isFinite(resultado.volumePE) &&
    resultado.volumePE > 0
  );
}

function calcularProdutoIonico({
  concentracaoCation,
  concentracaoAnion,
  coeficienteCation,
  coeficienteAnion,
}: {
  concentracaoCation: number;
  concentracaoAnion: number;
  coeficienteCation: number;
  coeficienteAnion: number;
}) {
  if (
    !Number.isFinite(concentracaoCation) ||
    !Number.isFinite(concentracaoAnion) ||
    concentracaoCation < 0 ||
    concentracaoAnion < 0
  ) {
    return NaN;
  }

  return (
    Math.pow(concentracaoCation, coeficienteCation) *
    Math.pow(concentracaoAnion, coeficienteAnion)
  );
}

/**
 * Resolve o equilíbrio de um precipitado genérico:
 *
 * CₐAᵦ(s) ⇌ a C + b A
 *
 * considerando simultaneamente:
 *
 * Kps = [C]ᵃ[A]ᵇ
 *
 * e o balanço normalizado:
 *
 * [C]/a - [A]/b =
 * Ctotal/a - Atotal/b
 *
 * O método evita as aproximações separadas de "antes" e "após"
 * o ponto de equivalência.
 */
function resolverConcentracoesLivresComPrecipitado({
  kps,
  coeficienteCation,
  coeficienteAnion,
  concentracaoTotalCation,
  concentracaoTotalAnion,
}: {
  kps: number;
  coeficienteCation: number;
  coeficienteAnion: number;
  concentracaoTotalCation: number;
  concentracaoTotalAnion: number;
}) {
  const diferencaNormalizada =
    concentracaoTotalCation / coeficienteCation -
    concentracaoTotalAnion / coeficienteAnion;

  /*
   * A partir do balanço:
   *
   * [A] = b × ([C]/a - diferença)
   */
  function calcularAnionAPartirDoCation(
    concentracaoCation: number
  ) {
    return (
      coeficienteAnion *
      (
        concentracaoCation / coeficienteCation -
        diferencaNormalizada
      )
    );
  }

  /*
   * Para que [A] seja não negativa:
   *
   * [C] >= a × diferença
   */
  let limiteInferiorCation = Math.max(
    0,
    coeficienteCation * diferencaNormalizada
  );

  let limiteSuperiorCation =
    concentracaoTotalCation;

  /*
   * Pequena proteção contra ruído numérico.
   */
  limiteInferiorCation = limitarValor({
    valor: limiteInferiorCation,
    minimo: 0,
    maximo: limiteSuperiorCation,
  });

  for (
    let iteracao = 0;
    iteracao < MAX_ITERACOES_BISSECAO;
    iteracao += 1
  ) {
    const concentracaoCation =
      (limiteInferiorCation + limiteSuperiorCation) / 2;

    const concentracaoAnion =
      calcularAnionAPartirDoCation(concentracaoCation);

    const produtoIonico = calcularProdutoIonico({
      concentracaoCation,
      concentracaoAnion,
      coeficienteCation,
      coeficienteAnion,
    });

    if (!Number.isFinite(produtoIonico)) {
      return {
        concentracaoCation: NaN,
        concentracaoAnion: NaN,
      };
    }

    const erroRelativo =
      Math.abs(produtoIonico - kps) / kps;

    if (erroRelativo <= TOLERANCIA_RELATIVA_EQUILIBRIO) {
      return {
        concentracaoCation,
        concentracaoAnion,
      };
    }

    if (produtoIonico < kps) {
      limiteInferiorCation = concentracaoCation;
    } else {
      limiteSuperiorCation = concentracaoCation;
    }
  }

  const concentracaoCation =
    (limiteInferiorCation + limiteSuperiorCation) / 2;

  const concentracaoAnion =
    calcularAnionAPartirDoCation(concentracaoCation);

  return {
    concentracaoCation,
    concentracaoAnion,
  };
}

function criarPontoInvalido(
  volumeAdicionado: number
): PontoCurvaTitulacaoDiretaPrecipitacao {
  return {
    volumeAdicionado,
    volumeTotal: NaN,
    regiao: "Dados inválidos",

    concentracaoAnalitoLivre: NaN,
    concentracaoTitulanteLivre: NaN,

    concentracaoEspecieMonitorada: NaN,
    pEspecieMonitorada: NaN,

    percentualPrecipitado: NaN,
  };
}

export function calcularPontoCurvaTitulacaoDireta(
  resultado: ResultadoTitulacaoDiretaPrecipitacao,
  volumeAdicionado: number,
  especieMonitorada: EspecieAnalitoPrecipitacao =
    resultado.especieTitulante
): PontoCurvaTitulacaoDiretaPrecipitacao {
  if (
    !dadosDoResultadoValidos(resultado) ||
    !Number.isFinite(volumeAdicionado) ||
    volumeAdicionado < 0 ||
    (
      especieMonitorada !== "cation" &&
      especieMonitorada !== "anion"
    )
  ) {
    return criarPontoInvalido(volumeAdicionado);
  }

  const volumeAmostraL =
    resultado.volumeAmostra / 1000;

  const volumeAdicionadoL =
    volumeAdicionado / 1000;

  const volumeTotalL =
    volumeAmostraL + volumeAdicionadoL;

  if (
    !Number.isFinite(volumeTotalL) ||
    volumeTotalL <= 0
  ) {
    return criarPontoInvalido(volumeAdicionado);
  }

  const molTitulanteAdicionado =
    resultado.concentracaoTitulante *
    volumeAdicionadoL;

  /*
   * Quantidades totais de cátion e ânion antes de considerar
   * a formação do precipitado.
   */
  const molTotalCation =
    resultado.especieAnalito === "cation"
      ? resultado.molAnalito
      : molTitulanteAdicionado;

  const molTotalAnion =
    resultado.especieAnalito === "anion"
      ? resultado.molAnalito
      : molTitulanteAdicionado;

  const concentracaoTotalCation =
    molTotalCation / volumeTotalL;

  const concentracaoTotalAnion =
    molTotalAnion / volumeTotalL;

  const coeficienteCation =
    resultado.sal.coeficienteCation;

  const coeficienteAnion =
    resultado.sal.coeficienteAnion;

  /*
   * Antes da formação do primeiro traço de precipitado,
   * as concentrações livres são iguais às concentrações
   * analíticas totais.
   */
  const produtoIonicoSemPrecipitacao =
    calcularProdutoIonico({
      concentracaoCation: concentracaoTotalCation,
      concentracaoAnion: concentracaoTotalAnion,
      coeficienteCation,
      coeficienteAnion,
    });

  let concentracaoCationLivre =
    concentracaoTotalCation;

  let concentracaoAnionLivre =
    concentracaoTotalAnion;

  let existePrecipitado = false;

  if (
    Number.isFinite(produtoIonicoSemPrecipitacao) &&
    produtoIonicoSemPrecipitacao > resultado.sal.kps
  ) {
    existePrecipitado = true;

    const equilibrio =
      resolverConcentracoesLivresComPrecipitado({
        kps: resultado.sal.kps,
        coeficienteCation,
        coeficienteAnion,
        concentracaoTotalCation,
        concentracaoTotalAnion,
      });

    concentracaoCationLivre =
      equilibrio.concentracaoCation;

    concentracaoAnionLivre =
      equilibrio.concentracaoAnion;
  }

  if (
    !Number.isFinite(concentracaoCationLivre) ||
    !Number.isFinite(concentracaoAnionLivre) ||
    concentracaoCationLivre < 0 ||
    concentracaoAnionLivre < 0
  ) {
    return criarPontoInvalido(volumeAdicionado);
  }

  const concentracaoAnalitoLivre =
    resultado.especieAnalito === "cation"
      ? concentracaoCationLivre
      : concentracaoAnionLivre;

  const concentracaoTitulanteLivre =
    resultado.especieTitulante === "cation"
      ? concentracaoCationLivre
      : concentracaoAnionLivre;

  const concentracaoEspecieMonitorada =
    especieMonitorada === "cation"
      ? concentracaoCationLivre
      : concentracaoAnionLivre;

  /*
   * Quantidade de fórmula do sólido formada.
   *
   * Cada mol de precipitado retira:
   *
   * a mol de cátion e b mol de ânion.
   */
  const molPrecipitadoPeloCation =
    (
      molTotalCation -
      concentracaoCationLivre * volumeTotalL
    ) / coeficienteCation;

  const molPrecipitadoPeloAnion =
    (
      molTotalAnion -
      concentracaoAnionLivre * volumeTotalL
    ) / coeficienteAnion;

  let molFormulaPrecipitado = existePrecipitado
    ? Math.min(
        molPrecipitadoPeloCation,
        molPrecipitadoPeloAnion
      )
    : 0;

  /*
   * Elimina valores negativos muito pequenos produzidos por
   * arredondamento numérico.
   */
  molFormulaPrecipitado = Math.max(
    molFormulaPrecipitado,
    0
  );

  const molAnalitoPrecipitado =
    molFormulaPrecipitado *
    resultado.coeficienteAnalito;

  const percentualPrecipitado =
    resultado.molAnalito > 0
      ? limitarValor({
          valor:
            (
              molAnalitoPrecipitado /
              resultado.molAnalito
            ) * 100,
          minimo: 0,
          maximo: 100,
        })
      : NaN;

  const diferencaVolume =
    Math.abs(
      volumeAdicionado -
      resultado.volumePE
    );

  /*
   * A tolerância é usada somente para nomear a região.
   * Ela não interfere no cálculo químico do equilíbrio.
   */
  const toleranciaPE = Math.max(
    resultado.volumePE * 1e-8,
    1e-10
  );

  let regiao: PontoCurvaTitulacaoDiretaPrecipitacao["regiao"];

  if (diferencaVolume <= toleranciaPE) {
    regiao = "No PE";
  } else if (volumeAdicionado < resultado.volumePE) {
    regiao = "Antes do PE";
  } else {
    regiao = "Após o PE";
  }

  return {
    volumeAdicionado,
    volumeTotal: volumeTotalL * 1000,

    regiao,

    concentracaoAnalitoLivre,
    concentracaoTitulanteLivre,

    concentracaoEspecieMonitorada,

    pEspecieMonitorada:
      calcularPLivre(
        concentracaoEspecieMonitorada
      ),

    percentualPrecipitado,
  };
}

export function gerarCurvaTitulacaoDireta({
  resultado,
  passo = 0.25,
  especieMonitorada,
}: {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  passo?: number;
  especieMonitorada?: EspecieAnalitoPrecipitacao;
}): CurvaTitulacaoDiretaPrecipitacao {
  const volumeMaximo =
    resultado.volumeMaximoBureta;

  const especieEfetivamenteMonitorada =
    especieMonitorada ??
    resultado.especieTitulante;

  const pontos: PontoCurvaTitulacaoDiretaPrecipitacao[] =
    [];

  if (
    !dadosDoResultadoValidos(resultado) ||
    !Number.isFinite(volumeMaximo) ||
    volumeMaximo <= 0 ||
    !Number.isFinite(passo) ||
    passo <= 0
  ) {
    return {
      pontos,
      volumePE: resultado.volumePE,
      volumeMaximo,
      passo,
      especieMonitorada:
        especieEfetivamenteMonitorada,
    };
  }

  /*
   * Usar um índice inteiro evita o acúmulo de erros de
   * ponto flutuante produzido por:
   *
   * volume += passo
   */
  const numeroPassos =
    Math.floor(volumeMaximo / passo);

  for (
    let indice = 0;
    indice <= numeroPassos;
    indice += 1
  ) {
    const volume = indice * passo;

    pontos.push(
      calcularPontoCurvaTitulacaoDireta(
        resultado,
        volume,
        especieEfetivamenteMonitorada
      )
    );
  }

  /*
   * Garante que o último ponto corresponda exatamente à
   * capacidade máxima da bureta, mesmo quando o passo não
   * divide o volume máximo de forma exata.
   */
  const ultimoPonto =
    pontos[pontos.length - 1];

  const existePontoNoVolumeMaximo =
    ultimoPonto !== undefined &&
    Math.abs(
      ultimoPonto.volumeAdicionado -
      volumeMaximo
    ) <= 1e-10;

  if (!existePontoNoVolumeMaximo) {
    pontos.push(
      calcularPontoCurvaTitulacaoDireta(
        resultado,
        volumeMaximo,
        especieEfetivamenteMonitorada
      )
    );
  }

  /*
   * Inclui o PE exato, pois ele geralmente não coincide
   * com os volumes gerados pelo passo da curva.
   */
  const existePontoPE = pontos.some(
    (ponto) =>
      Math.abs(
        ponto.volumeAdicionado -
        resultado.volumePE
      ) <= 1e-10
  );

  if (
    !existePontoPE &&
    resultado.volumePE >= 0 &&
    resultado.volumePE <= volumeMaximo
  ) {
    pontos.push(
      calcularPontoCurvaTitulacaoDireta(
        resultado,
        resultado.volumePE,
        especieEfetivamenteMonitorada
      )
    );
  }

  pontos.sort(
    (pontoA, pontoB) =>
      pontoA.volumeAdicionado -
      pontoB.volumeAdicionado
  );

  return {
    pontos,
    volumePE: resultado.volumePE,
    volumeMaximo,
    passo,
    especieMonitorada:
      especieEfetivamenteMonitorada,
  };
}