import type {
  CurvaTitulacaoRetornoPrecipitacao,
  PontoCurvaTitulacaoRetornoPrecipitacao,
  ResultadoTitulacaoRetornoPrecipitacao,
} from "./tipos";

const KPS_AGSCN = 1.1e-12;

function ehNumeroValido(valor: number) {
  return Number.isFinite(valor) && valor >= 0;
}

export function calcularPontoCurvaTitulacaoRetorno(
  resultado: ResultadoTitulacaoRetornoPrecipitacao,
  volumeAdicionado: number
): PontoCurvaTitulacaoRetornoPrecipitacao {
  const {
    concentracaoTitulanteRetorno,
    volumeAmostra,
    volumePrecipitanteExcesso,
    molPrecipitanteEmExcesso,
  } = resultado;

  const dadosInvalidos =
    resultado.status === "dados_invalidos" ||
    !ehNumeroValido(volumeAdicionado) ||
    !ehNumeroValido(concentracaoTitulanteRetorno) ||
    !ehNumeroValido(volumeAmostra) ||
    !ehNumeroValido(volumePrecipitanteExcesso) ||
    !ehNumeroValido(molPrecipitanteEmExcesso) ||
    concentracaoTitulanteRetorno <= 0 ||
    volumeAmostra <= 0 ||
    volumePrecipitanteExcesso <= 0;

  if (dadosInvalidos) {
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

  const volumeTotal =
    volumeAmostra + volumePrecipitanteExcesso + volumeAdicionado;

  const volumeTotalLitros = volumeTotal / 1000;

  const molSCNAdicionado =
    concentracaoTitulanteRetorno * (volumeAdicionado / 1000);

  const volumePontoFinalRetorno =
    (molPrecipitanteEmExcesso / concentracaoTitulanteRetorno) * 1000;

  const tolerancia = Math.max(volumePontoFinalRetorno * 0.002, 0.000001);

  const antesDoPontoFinal =
    volumeAdicionado < volumePontoFinalRetorno - tolerancia;

  const noPontoFinal =
    Math.abs(volumeAdicionado - volumePontoFinalRetorno) <= tolerancia;

  const molAgRestante = Math.max(
    molPrecipitanteEmExcesso - molSCNAdicionado,
    0
  );

  const molSCNLivre = Math.max(
    molSCNAdicionado - molPrecipitanteEmExcesso,
    0
  );

  const concentracaoAgLivreEstequiometrica =
    molAgRestante / volumeTotalLitros;

  const concentracaoSCNLivre =
    molSCNLivre / volumeTotalLitros;

  const concentracaoAgLivre = antesDoPontoFinal
    ? concentracaoAgLivreEstequiometrica
    : noPontoFinal
      ? Math.sqrt(KPS_AGSCN)
      : concentracaoSCNLivre > 0
        ? KPS_AGSCN / concentracaoSCNLivre
        : Math.sqrt(KPS_AGSCN);

  const pAg =
    concentracaoAgLivre > 0 && Number.isFinite(concentracaoAgLivre)
      ? -Math.log10(concentracaoAgLivre)
      : NaN;

  const percentualRetorno =
    molPrecipitanteEmExcesso > 0
      ? Math.min((molSCNAdicionado / molPrecipitanteEmExcesso) * 100, 100)
      : NaN;

  return {
    volumeAdicionado,
    volumeTotal,
    regiao: antesDoPontoFinal
      ? "Antes do retorno"
      : noPontoFinal
        ? "No ponto final do retorno"
        : "Após o retorno",
    molPrecipitanteRestante: molAgRestante,
    molTitulanteRetornoLivre: molSCNLivre,
    concentracaoPrecipitanteLivre: concentracaoAgLivre,
    concentracaoTitulanteRetornoLivre: concentracaoSCNLivre,
    pPrecipitante: pAg,
    percentualRetorno,
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
    resultado.status === "dados_invalidos" ||
    !Number.isFinite(resultado.molPrecipitanteEmExcesso) ||
    !Number.isFinite(resultado.concentracaoTitulanteRetorno) ||
    resultado.molPrecipitanteEmExcesso <= 0 ||
    resultado.concentracaoTitulanteRetorno <= 0 ||
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
    (resultado.molPrecipitanteEmExcesso /
      resultado.concentracaoTitulanteRetorno) *
    1000;

  const volumeMaximo = Math.max(
    volumePontoFinalRetorno * 1.6,
    resultado.volumeTitulanteRetorno,
    1
  );

  const pontos: PontoCurvaTitulacaoRetornoPrecipitacao[] = [];

  for (let volume = 0; volume <= volumeMaximo; volume += passo) {
    pontos.push(calcularPontoCurvaTitulacaoRetorno(resultado, volume));
  }

  if (
    !pontos.some(
      (ponto) =>
        Math.abs(ponto.volumeAdicionado - volumePontoFinalRetorno) <
        passo / 2
    )
  ) {
    pontos.push(
      calcularPontoCurvaTitulacaoRetorno(resultado, volumePontoFinalRetorno)
    );
  }

  pontos.sort((a, b) => a.volumeAdicionado - b.volumeAdicionado);

  return {
    pontos,
    volumePontoFinalRetorno,
    volumeMaximo,
    passo,
  };
}