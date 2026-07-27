import type {
    AvaliacaoSeparacaoPrecipitacao,
  } from "./tipos";
  
  /**
   * Faixas didáticas adotadas pelo AnalitCalc:
   *
   * X < 90,0%
   * Não seletiva — risco alto
   *
   * 90,0% ≤ X < 99,0%
   * Separação ruim — risco alto
   *
   * 99,0% ≤ X < 99,9%
   * Separação parcial — risco moderado
   *
   * 99,9% ≤ X < 99,99%
   * Separação quantitativa — risco baixo
   *
   * X ≥ 99,99%
   * Separação muito favorável — risco baixo
   */
  export function classificarSeparacaoPorPercentual({
    percentualPrecipitado,
    precipitacaoSimultanea = false,
  }: {
    percentualPrecipitado:
      number | null;
  
    precipitacaoSimultanea?: boolean;
  }): AvaliacaoSeparacaoPrecipitacao {
    if (precipitacaoSimultanea) {
      const percentualValido =
        percentualPrecipitado !== null &&
        Number.isFinite(
          percentualPrecipitado
        );
  
      const percentualLimitado =
        percentualValido
          ? Math.min(
              100,
              Math.max(
                0,
                percentualPrecipitado
              )
            )
          : null;
  
      return {
        classificacao:
          "precipitacao_simultanea",
  
        risco: "alto",
  
        percentualPrecipitado:
          percentualLimitado,
  
        percentualRemanescente:
          percentualLimitado === null
            ? null
            : 100 -
              percentualLimitado,
  
        titulo:
          "Precipitação praticamente simultânea",
  
        interpretacao:
          "Os precipitados começam a se formar em condições praticamente iguais. Não há separação seletiva confiável entre as espécies.",
      };
    }
  
    if (
      percentualPrecipitado === null ||
      !Number.isFinite(
        percentualPrecipitado
      )
    ) {
      return {
        classificacao:
          "nao_avaliada",
  
        risco: null,
  
        percentualPrecipitado:
          null,
  
        percentualRemanescente:
          null,
  
        titulo:
          "Separação não avaliada",
  
        interpretacao:
          "Não foi possível determinar quanto do primeiro analito estava precipitado quando o precipitado seguinte começou a se formar.",
      };
    }
  
    const percentualLimitado =
      Math.min(
        100,
        Math.max(
          0,
          percentualPrecipitado
        )
      );
  
    const percentualRemanescente =
      100 -
      percentualLimitado;
  
    if (
      percentualLimitado < 90
    ) {
      return {
        classificacao:
          "nao_seletiva",
  
        risco: "alto",
  
        percentualPrecipitado:
          percentualLimitado,
  
        percentualRemanescente,
  
        titulo:
          "Precipitação não seletiva",
  
        interpretacao:
          "Uma fração importante do primeiro analito ainda permanece em solução quando o precipitado seguinte começa a se formar.",
      };
    }
  
    if (
      percentualLimitado < 99
    ) {
      return {
        classificacao:
          "separacao_ruim",
  
        risco: "alto",
  
        percentualPrecipitado:
          percentualLimitado,
  
        percentualRemanescente,
  
        titulo:
          "Separação insuficiente",
  
        interpretacao:
          "Há sobreposição relevante entre os precipitados. A quantidade remanescente do primeiro analito é elevada para uma separação seletiva.",
      };
    }
  
    if (
      percentualLimitado < 99.9
    ) {
      return {
        classificacao:
          "separacao_parcial",
  
        risco: "moderado",
  
        percentualPrecipitado:
          percentualLimitado,
  
        percentualRemanescente,
  
        titulo:
          "Separação parcial",
  
        interpretacao:
          "A maior parte do primeiro analito já precipitou, mas o critério quantitativo de 99,9% ainda não foi atingido.",
      };
    }
  
    if (
      percentualLimitado < 99.99
    ) {
      return {
        classificacao:
          "separacao_quantitativa",
  
        risco: "baixo",
  
        percentualPrecipitado:
          percentualLimitado,
  
        percentualRemanescente,
  
        titulo:
          "Separação quantitativa",
  
        interpretacao:
          "Quando o precipitado seguinte começa a se formar, pelo menos 99,9% do primeiro analito já está precipitado.",
      };
    }
  
    return {
      classificacao:
        "separacao_muito_favoravel",
  
      risco: "baixo",
  
      percentualPrecipitado:
        percentualLimitado,
  
      percentualRemanescente,
  
      titulo:
        "Separação muito favorável",
  
      interpretacao:
        "Quando o precipitado seguinte começa a se formar, pelo menos 99,99% do primeiro analito já está precipitado.",
    };
  }