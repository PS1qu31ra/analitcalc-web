import { calcularSolubilidadeMolar } from "./calculosEquilibrio";

import type {
  CurvaTitulacaoDiretaPrecipitacao,
  EspecieAnalitoPrecipitacao,
  PontoCurvaTitulacaoDiretaPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
} from "./tipos";

function calcularPLivre(concentracao: number) {
  if (!Number.isFinite(concentracao) || concentracao <= 0) return NaN;

  return -Math.log10(concentracao);
}

function obterCoeficienteDaEspecie(
  resultado: ResultadoTitulacaoDiretaPrecipitacao,
  especie: EspecieAnalitoPrecipitacao
) {
  return especie === "cation"
    ? resultado.sal.coeficienteCation
    : resultado.sal.coeficienteAnion;
}

export function calcularPontoCurvaTitulacaoDireta(
  resultado: ResultadoTitulacaoDiretaPrecipitacao,
  volumeAdicionado: number
): PontoCurvaTitulacaoDiretaPrecipitacao {
  if (
    resultado.status === "dados_invalidos" ||
    !Number.isFinite(volumeAdicionado) ||
    volumeAdicionado < 0
  ) {
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

  const volumeAmostraL = resultado.volumeAmostra / 1000;
  const volumeAdicionadoL = volumeAdicionado / 1000;
  const volumeTotalL = volumeAmostraL + volumeAdicionadoL;

  const molTitulanteAdicionado =
    resultado.concentracaoTitulante * volumeAdicionadoL;

  const diferencaVolume = Math.abs(volumeAdicionado - resultado.volumePE);

  const toleranciaPE = Math.max(resultado.volumePE * 0.0005, 1e-8);

  const coeficienteAnalito = resultado.coeficienteAnalito;
  const coeficienteTitulante = resultado.coeficienteTitulante;

  const solubilidadeMolar = calcularSolubilidadeMolar(resultado.sal);

  let regiao: PontoCurvaTitulacaoDiretaPrecipitacao["regiao"];

  let concentracaoAnalitoLivre = NaN;
  let concentracaoTitulanteLivre = NaN;
  let percentualPrecipitado = NaN;

  if (diferencaVolume <= toleranciaPE) {
    regiao = "No PE";

    const concentracaoCationEquilibrio =
      resultado.sal.coeficienteCation * solubilidadeMolar;

    const concentracaoAnionEquilibrio =
      resultado.sal.coeficienteAnion * solubilidadeMolar;

    concentracaoAnalitoLivre =
      resultado.especieAnalito === "cation"
        ? concentracaoCationEquilibrio
        : concentracaoAnionEquilibrio;

    concentracaoTitulanteLivre =
      resultado.especieTitulante === "cation"
        ? concentracaoCationEquilibrio
        : concentracaoAnionEquilibrio;

    percentualPrecipitado = 100;
  } else if (volumeAdicionado < resultado.volumePE) {
    regiao = "Antes do PE";

    const molAnalitoConsumido =
      molTitulanteAdicionado *
      (coeficienteAnalito / coeficienteTitulante);

    const molAnalitoExcesso = Math.max(
      resultado.molAnalito - molAnalitoConsumido,
      0
    );

    concentracaoAnalitoLivre = molAnalitoExcesso / volumeTotalL;

    concentracaoTitulanteLivre = Math.pow(
      resultado.sal.kps /
        Math.pow(concentracaoAnalitoLivre, coeficienteAnalito),
      1 / coeficienteTitulante
    );

    percentualPrecipitado =
      resultado.molAnalito > 0
        ? Math.min((molAnalitoConsumido / resultado.molAnalito) * 100, 100)
        : NaN;
  } else {
    regiao = "Após o PE";

    const molTitulanteExcesso = Math.max(
      molTitulanteAdicionado - resultado.molTitulantePE,
      0
    );

    concentracaoTitulanteLivre = molTitulanteExcesso / volumeTotalL;

    concentracaoAnalitoLivre = Math.pow(
      resultado.sal.kps /
        Math.pow(concentracaoTitulanteLivre, coeficienteTitulante),
      1 / coeficienteAnalito
    );

    percentualPrecipitado = 100;
  }

  const concentracaoEspecieMonitorada = concentracaoTitulanteLivre;

  return {
    volumeAdicionado,
    volumeTotal: volumeTotalL * 1000,
    regiao,
    concentracaoAnalitoLivre,
    concentracaoTitulanteLivre,
    concentracaoEspecieMonitorada,
    pEspecieMonitorada: calcularPLivre(concentracaoEspecieMonitorada),
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
  const volumeMaximo = resultado.volumeMaximoBureta;

  const pontos: PontoCurvaTitulacaoDiretaPrecipitacao[] = [];

  if (
    resultado.status === "dados_invalidos" ||
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
      especieMonitorada: especieMonitorada ?? resultado.especieTitulante,
    };
  }

  for (let volume = 0; volume <= volumeMaximo; volume += passo) {
    pontos.push(calcularPontoCurvaTitulacaoDireta(resultado, volume));
  }

  const existePontoPE = pontos.some(
    (ponto) => Math.abs(ponto.volumeAdicionado - resultado.volumePE) < 1e-8
  );

  if (
    !existePontoPE &&
    Number.isFinite(resultado.volumePE) &&
    resultado.volumePE >= 0 &&
    resultado.volumePE <= volumeMaximo
  ) {
    pontos.push(calcularPontoCurvaTitulacaoDireta(resultado, resultado.volumePE));

    pontos.sort((a, b) => a.volumeAdicionado - b.volumeAdicionado);
  }

  return {
    pontos,
    volumePE: resultado.volumePE,
    volumeMaximo,
    passo,
    especieMonitorada: especieMonitorada ?? resultado.especieTitulante,
  };
}