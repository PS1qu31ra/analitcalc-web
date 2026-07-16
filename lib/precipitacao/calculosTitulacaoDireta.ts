import type {
    EntradaTitulacaoDiretaPrecipitacao,
    ResultadoTitulacaoDiretaPrecipitacao,
  } from "./tipos";
  
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
  
    const especieTitulante = especieAnalito === "anion" ? "cation" : "anion";
  
    const coeficienteAnalito =
      especieAnalito === "anion"
        ? sal.coeficienteAnion
        : sal.coeficienteCation;
  
    const coeficienteTitulante =
      especieTitulante === "anion"
        ? sal.coeficienteAnion
        : sal.coeficienteCation;
  
    const dadosInvalidos =
      !Number.isFinite(concentracaoAnalito) ||
      !Number.isFinite(volumeAmostra) ||
      !Number.isFinite(concentracaoTitulante) ||
      !Number.isFinite(volumeMaximoBureta) ||
      concentracaoAnalito <= 0 ||
      volumeAmostra <= 0 ||
      concentracaoTitulante <= 0 ||
      volumeMaximoBureta <= 0;
  
    if (dadosInvalidos) {
      return {
        sal,
        especieAnalito,
        especieTitulante,
        concentracaoAnalito,
        volumeAmostra,
        concentracaoTitulante,
        volumeMaximoBureta,
        molAnalito: NaN,
        molTitulantePE: NaN,
        volumePE: NaN,
        coeficienteAnalito,
        coeficienteTitulante,
        relacaoEstequiometrica: "-",
        status: "dados_invalidos",
        mensagem:
          "Preencha concentração do analito, volume da amostra, concentração do titulante e volume máximo da bureta com valores positivos.",
      };
    }
  
    const volumeAmostraL = volumeAmostra / 1000;
  
    const molAnalito = concentracaoAnalito * volumeAmostraL;
  
    const molTitulantePE =
      molAnalito * (coeficienteTitulante / coeficienteAnalito);
  
    const volumePEL = molTitulantePE / concentracaoTitulante;
  
    const volumePE = volumePEL * 1000;
  
    const status =
      volumePE <= volumeMaximoBureta ? "adequado" : "fora_da_bureta";
  
    const formulaAnalito =
      especieAnalito === "anion"
        ? sal.anion.formulaExibicao
        : sal.cation.formulaExibicao;
  
    const formulaTitulante =
      especieTitulante === "anion"
        ? sal.anion.formulaExibicao
        : sal.cation.formulaExibicao;
  
    const relacaoEstequiometrica = `${coeficienteTitulante} ${formulaTitulante} : ${coeficienteAnalito} ${formulaAnalito}`;
  
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
          ? "O volume de equivalência está dentro do volume máximo da bureta informado."
          : "O volume de equivalência ultrapassa o volume máximo da bureta informado. Ajuste a concentração do titulante, o volume da amostra ou a bureta.",
    };
  }