import type {
    EntradaTitulacaoRetornoPrecipitacao,
    ResultadoTitulacaoRetornoPrecipitacao,
  } from "./tipos";
  
  export function calcularTitulacaoRetornoPrecipitacao(
    entrada: EntradaTitulacaoRetornoPrecipitacao
  ): ResultadoTitulacaoRetornoPrecipitacao {
    const {
      salPrincipal,
      especieAnalito,
      volumeAmostra,
      concentracaoPrecipitanteExcesso,
      volumePrecipitanteExcesso,
      concentracaoTitulanteRetorno,
      volumeTitulanteRetorno,
      volumeMaximoBuretaRetorno,
    } = entrada;
  
    const especiePrecipitante = especieAnalito === "anion" ? "cation" : "anion";
  
    const coeficienteAnalito =
      especieAnalito === "anion"
        ? salPrincipal.coeficienteAnion
        : salPrincipal.coeficienteCation;
  
    const coeficientePrecipitante =
      especiePrecipitante === "anion"
        ? salPrincipal.coeficienteAnion
        : salPrincipal.coeficienteCation;
  
    const formulaAnalito =
      especieAnalito === "anion"
        ? salPrincipal.anion.formulaExibicao
        : salPrincipal.cation.formulaExibicao;
  
    const formulaPrecipitante =
      especiePrecipitante === "anion"
        ? salPrincipal.anion.formulaExibicao
        : salPrincipal.cation.formulaExibicao;
  
    const dadosInvalidos =
      !Number.isFinite(volumeAmostra) ||
      !Number.isFinite(concentracaoPrecipitanteExcesso) ||
      !Number.isFinite(volumePrecipitanteExcesso) ||
      !Number.isFinite(concentracaoTitulanteRetorno) ||
      !Number.isFinite(volumeTitulanteRetorno) ||
      !Number.isFinite(volumeMaximoBuretaRetorno) ||
      volumeAmostra <= 0 ||
      concentracaoPrecipitanteExcesso <= 0 ||
      volumePrecipitanteExcesso <= 0 ||
      concentracaoTitulanteRetorno <= 0 ||
      volumeTitulanteRetorno <= 0 ||
      volumeMaximoBuretaRetorno <= 0;
  
    const relacaoPrincipal = `${coeficientePrecipitante} ${formulaPrecipitante} : ${coeficienteAnalito} ${formulaAnalito}`;
  
    const relacaoRetorno = `1 titulante de retorno : 1 ${formulaPrecipitante} em excesso`;
  
    if (dadosInvalidos) {
      return {
        salPrincipal,
        especieAnalito,
        especiePrecipitante,
        volumeAmostra,
        concentracaoPrecipitanteExcesso,
        volumePrecipitanteExcesso,
        concentracaoTitulanteRetorno,
        volumeTitulanteRetorno,
        molPrecipitanteAdicionado: NaN,
        molPrecipitanteEmExcesso: NaN,
        molPrecipitanteConsumidoPeloAnalito: NaN,
        molAnalito: NaN,
        concentracaoAnalito: NaN,
        relacaoPrincipal,
        relacaoRetorno,
        status: "dados_invalidos",
        mensagem:
          "Informe valores positivos e válidos para calcular a titulação por retorno.",
      };
    }
  
    const molPrecipitanteAdicionado =
      concentracaoPrecipitanteExcesso * (volumePrecipitanteExcesso / 1000);
  
    const molPrecipitanteEmExcesso =
      concentracaoTitulanteRetorno * (volumeTitulanteRetorno / 1000);
  
    const molPrecipitanteConsumidoPeloAnalito =
      molPrecipitanteAdicionado - molPrecipitanteEmExcesso;
  
    if (molPrecipitanteConsumidoPeloAnalito <= 0) {
      return {
        salPrincipal,
        especieAnalito,
        especiePrecipitante,
        volumeAmostra,
        concentracaoPrecipitanteExcesso,
        volumePrecipitanteExcesso,
        concentracaoTitulanteRetorno,
        volumeTitulanteRetorno,
        molPrecipitanteAdicionado,
        molPrecipitanteEmExcesso,
        molPrecipitanteConsumidoPeloAnalito,
        molAnalito: NaN,
        concentracaoAnalito: NaN,
        relacaoPrincipal,
        relacaoRetorno,
        status: "excesso_insuficiente",
        mensagem:
          "O volume de titulante de retorno indica que não houve consumo positivo do precipitante pelo analito. Verifique se o excesso adicionado foi suficiente e se os volumes estão corretos.",
      };
    }
  
    const molAnalito =
      molPrecipitanteConsumidoPeloAnalito *
      (coeficienteAnalito / coeficientePrecipitante);
  
    const concentracaoAnalito = molAnalito / (volumeAmostra / 1000);
  
    const status =
      volumeTitulanteRetorno > volumeMaximoBuretaRetorno
        ? "fora_da_bureta"
        : "adequado";
  
    const mensagem =
      status === "fora_da_bureta"
        ? "A titulação por retorno foi calculada, mas o volume gasto no retorno ultrapassa o volume máximo da bureta informado."
        : "A titulação por retorno foi calculada pela diferença entre o precipitante adicionado em excesso e o precipitante que sobrou após reagir com o analito.";
  
    return {
      salPrincipal,
      especieAnalito,
      especiePrecipitante,
      volumeAmostra,
      concentracaoPrecipitanteExcesso,
      volumePrecipitanteExcesso,
      concentracaoTitulanteRetorno,
      volumeTitulanteRetorno,
      molPrecipitanteAdicionado,
      molPrecipitanteEmExcesso,
      molPrecipitanteConsumidoPeloAnalito,
      molAnalito,
      concentracaoAnalito,
      relacaoPrincipal,
      relacaoRetorno,
      status,
      mensagem,
    };
  }