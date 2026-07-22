import { saisPrecipitacao } from "../data/precipitacao/sais";

import type {
  CurvaTitulacaoRetornoPrecipitacao,
  PontoCurvaTitulacaoRetornoPrecipitacao,
  ResultadoTitulacaoRetornoPrecipitacao,
} from "./tipos";

const salAgSCN = saisPrecipitacao.find(
  (sal) => sal.id === "AgSCN"
);

const KPS_AGSCN = salAgSCN?.kps ?? 1.1e-12;

function ehNumeroNaoNegativo(valor: number) {
  return Number.isFinite(valor) && valor >= 0;
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
  return Math.min(
    Math.max(valor, minimo),
    maximo
  );
}

function calcularPConcentracao(
  concentracao: number
) {
  if (
    !Number.isFinite(concentracao) ||
    concentracao <= 0
  ) {
    return NaN;
  }

  return -Math.log10(concentracao);
}

function criarPontoInvalido(
  volumeAdicionado: number
): PontoCurvaTitulacaoRetornoPrecipitacao {
  return {
    volumeAdicionado,
    volumeTotal: NaN,
    regiao: "Dados inválidos",

    molPrecipitanteRestante: NaN,
    molTitulanteRetornoLivre: NaN,

    concentracaoPrecipitanteLivre: NaN,
    concentracaoTitulanteRetornoLivre: NaN,

    pPrecipitante: NaN,
    percentualRetorno: NaN,
  };
}

function resultadoValidoParaCurva(
  resultado: ResultadoTitulacaoRetornoPrecipitacao
) {
  return (
    resultado.status !== "dados_invalidos" &&
    resultado.status !== "excesso_insuficiente" &&
    Number.isFinite(KPS_AGSCN) &&
    KPS_AGSCN > 0 &&
    Number.isFinite(
      resultado.concentracaoTitulanteRetorno
    ) &&
    resultado.concentracaoTitulanteRetorno > 0 &&
    Number.isFinite(resultado.volumeAmostra) &&
    resultado.volumeAmostra > 0 &&
    Number.isFinite(
      resultado.volumePrecipitanteExcesso
    ) &&
    resultado.volumePrecipitanteExcesso > 0 &&
    Number.isFinite(
      resultado.molPrecipitanteEmExcesso
    ) &&
    resultado.molPrecipitanteEmExcesso > 0
  );
}

/**
 * Resolve o equilíbrio:
 *
 * AgSCN(s) ⇌ Ag⁺ + SCN⁻
 *
 * usando:
 *
 * [Ag⁺][SCN⁻] = Kps
 *
 * e:
 *
 * [Ag⁺] - [SCN⁻]
 * =
 * CAg,total - CSCN,total
 */
function resolverEquilibrioAgSCN({
  concentracaoTotalAg,
  concentracaoTotalSCN,
}: {
  concentracaoTotalAg: number;
  concentracaoTotalSCN: number;
}) {
  const produtoIonicoSemPrecipitacao =
    concentracaoTotalAg *
    concentracaoTotalSCN;

  /*
   * Caso PI ≤ Kps, a solução ainda não está
   * supersaturada. Portanto, não há precipitação
   * líquida de AgSCN.
   */
  if (
    !Number.isFinite(
      produtoIonicoSemPrecipitacao
    ) ||
    produtoIonicoSemPrecipitacao <= KPS_AGSCN
  ) {
    return {
      existePrecipitado: false,
      concentracaoAgLivre: concentracaoTotalAg,
      concentracaoSCNLivre:
        concentracaoTotalSCN,
    };
  }

  const diferenca =
    concentracaoTotalAg -
    concentracaoTotalSCN;

  /*
   * Seja:
   *
   * x = [Ag⁺]
   * y = [SCN⁻]
   *
   * x - y = diferença
   * xy = Kps
   *
   * A solução física positiva é:
   *
   * x =
   * (diferença + √(diferença² + 4Kps)) / 2
   *
   * y =
   * (-diferença + √(diferença² + 4Kps)) / 2
   */
  const discriminante =
    Math.sqrt(
      diferenca * diferenca +
      4 * KPS_AGSCN
    );

  const concentracaoAgLivre =
    (diferenca + discriminante) / 2;

  const concentracaoSCNLivre =
    (-diferenca + discriminante) / 2;

  return {
    existePrecipitado: true,
    concentracaoAgLivre,
    concentracaoSCNLivre,
  };
}

export function calcularPontoCurvaTitulacaoRetorno(
  resultado: ResultadoTitulacaoRetornoPrecipitacao,
  volumeAdicionado: number
): PontoCurvaTitulacaoRetornoPrecipitacao {
  if (
    !resultadoValidoParaCurva(resultado) ||
    !ehNumeroNaoNegativo(volumeAdicionado)
  ) {
    return criarPontoInvalido(
      volumeAdicionado
    );
  }

  const volumeTotal =
    resultado.volumeAmostra +
    resultado.volumePrecipitanteExcesso +
    volumeAdicionado;

  const volumeTotalLitros =
    volumeTotal / 1000;

  if (
    !Number.isFinite(volumeTotalLitros) ||
    volumeTotalLitros <= 0
  ) {
    return criarPontoInvalido(
      volumeAdicionado
    );
  }

  const molSCNAdicionado =
    resultado.concentracaoTitulanteRetorno *
    (volumeAdicionado / 1000);

  /*
   * Quantidades analíticas totais antes de considerar
   * a formação de AgSCN.
   */
  const concentracaoTotalAg =
    resultado.molPrecipitanteEmExcesso /
    volumeTotalLitros;

  const concentracaoTotalSCN =
    molSCNAdicionado /
    volumeTotalLitros;

  const equilibrio =
    resolverEquilibrioAgSCN({
      concentracaoTotalAg,
      concentracaoTotalSCN,
    });

  const concentracaoAgLivre =
    equilibrio.concentracaoAgLivre;

  const concentracaoSCNLivre =
    equilibrio.concentracaoSCNLivre;

  if (
    !ehNumeroNaoNegativo(
      concentracaoAgLivre
    ) ||
    !ehNumeroNaoNegativo(
      concentracaoSCNLivre
    )
  ) {
    return criarPontoInvalido(
      volumeAdicionado
    );
  }

  const molAgLivre =
    concentracaoAgLivre *
    volumeTotalLitros;

  const molSCNLivre =
    concentracaoSCNLivre *
    volumeTotalLitros;

  /*
   * Pela estequiometria:
   *
   * Ag⁺ + SCN⁻ → AgSCN(s)
   *
   * A quantidade precipitada pode ser calculada
   * por qualquer um dos dois balanços.
   */
  const molAgSCNFormadoPeloAg =
    resultado.molPrecipitanteEmExcesso -
    molAgLivre;

  const molAgSCNFormadoPeloSCN =
    molSCNAdicionado -
    molSCNLivre;

  let molAgSCNFormado =
    equilibrio.existePrecipitado
      ? Math.min(
          molAgSCNFormadoPeloAg,
          molAgSCNFormadoPeloSCN
        )
      : 0;

  /*
   * Evita pequenos resultados negativos gerados
   * por arredondamento de ponto flutuante.
   */
  molAgSCNFormado = limitarValor({
    valor: molAgSCNFormado,
    minimo: 0,
    maximo:
      resultado.molPrecipitanteEmExcesso,
  });

  const percentualRetorno =
    (
      molAgSCNFormado /
      resultado.molPrecipitanteEmExcesso
    ) * 100;

  const volumePontoFinalRetorno =
    (
      resultado.molPrecipitanteEmExcesso /
      resultado.concentracaoTitulanteRetorno
    ) * 1000;

  /*
   * A tolerância é usada somente para nomear
   * visualmente a região da curva.
   *
   * Ela não interfere no cálculo químico.
   */
  const toleranciaPontoFinal =
    Math.max(
      volumePontoFinalRetorno * 1e-8,
      1e-10
    );

  const diferencaVolume =
    Math.abs(
      volumeAdicionado -
      volumePontoFinalRetorno
    );

  let regiao:
    PontoCurvaTitulacaoRetornoPrecipitacao["regiao"];

  if (
    diferencaVolume <=
    toleranciaPontoFinal
  ) {
    regiao = "No ponto final do retorno";
  } else if (
    volumeAdicionado <
    volumePontoFinalRetorno
  ) {
    regiao = "Antes do retorno";
  } else {
    regiao = "Após o retorno";
  }

  return {
    volumeAdicionado,
    volumeTotal,
    regiao,

    /*
     * Estes campos agora representam as quantidades
     * realmente livres no equilíbrio, e não apenas
     * os excessos estequiométricos aproximados.
     */
    molPrecipitanteRestante:
      molAgLivre,

    molTitulanteRetornoLivre:
      molSCNLivre,

    concentracaoPrecipitanteLivre:
      concentracaoAgLivre,

    concentracaoTitulanteRetornoLivre:
      concentracaoSCNLivre,

    pPrecipitante:
      calcularPConcentracao(
        concentracaoAgLivre
      ),

    percentualRetorno:
      limitarValor({
        valor: percentualRetorno,
        minimo: 0,
        maximo: 100,
      }),
  };
}

export function gerarCurvaTitulacaoRetorno({
  resultado,
  passo,
}: {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
  passo: number;
}): CurvaTitulacaoRetornoPrecipitacao {
  if (
    !resultadoValidoParaCurva(resultado) ||
    !Number.isFinite(passo) ||
    passo <= 0
  ) {
    return {
      pontos: [],
      volumePontoFinalRetorno: NaN,
      volumeMaximo: NaN,
      passo,
    };
  }

  const volumePontoFinalRetorno =
    (
      resultado.molPrecipitanteEmExcesso /
      resultado.concentracaoTitulanteRetorno
    ) * 1000;

  /*
   * A curva se estende até 60% após o ponto final.
   * Mantemos no mínimo 1 mL para sistemas cujo
   * ponto final seja extremamente pequeno.
   */
  const volumeMaximo =
    Math.max(
      volumePontoFinalRetorno * 1.6,
      resultado.volumeTitulanteRetorno,
      1
    );

  const pontos:
    PontoCurvaTitulacaoRetornoPrecipitacao[] =
    [];

  /*
   * Usar índice inteiro evita o acúmulo de erros
   * provocado por:
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
    const volume =
      indice * passo;

    pontos.push(
      calcularPontoCurvaTitulacaoRetorno(
        resultado,
        volume
      )
    );
  }

  /*
   * Garante a inclusão exata do último volume.
   */
  const ultimoPonto =
    pontos[pontos.length - 1];

  const possuiVolumeMaximo =
    ultimoPonto !== undefined &&
    Math.abs(
      ultimoPonto.volumeAdicionado -
      volumeMaximo
    ) <= 1e-10;

  if (!possuiVolumeMaximo) {
    pontos.push(
      calcularPontoCurvaTitulacaoRetorno(
        resultado,
        volumeMaximo
      )
    );
  }

  /*
   * Inclui explicitamente o ponto final, pois ele
   * normalmente não coincide com o passo definido.
   */
  const possuiPontoFinal =
    pontos.some(
      (ponto) =>
        Math.abs(
          ponto.volumeAdicionado -
          volumePontoFinalRetorno
        ) <= 1e-10
    );

  if (!possuiPontoFinal) {
    pontos.push(
      calcularPontoCurvaTitulacaoRetorno(
        resultado,
        volumePontoFinalRetorno
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
    volumePontoFinalRetorno,
    volumeMaximo,
    passo,
  };
}