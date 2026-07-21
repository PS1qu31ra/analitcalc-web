import type {
    EntradaSeletividadePrecipitacao,
    ResultadoItemSeletividadePrecipitacao,
    ResultadoSeletividadePrecipitacao,
  } from "./tipos";
  
  export function calcularSeletividadePrecipitacao(
    entrada: EntradaSeletividadePrecipitacao
  ): ResultadoSeletividadePrecipitacao {
    const { especieTitulante, itens } = entrada;
  
    if (!itens || itens.length < 2) {
      return {
        especieTitulante,
        itens: [],
        status: "mistura_insuficiente",
        mensagem:
          "Informe pelo menos dois sistemas para comparar a ordem de precipitação.",
      };
    }
  
    const itensValidos = itens.filter((item) => {
      const sal = item.sal;
  
      const especieComplementar =
        item.especieAnalito === "anion" ? "cation" : "anion";
  
      return (
        especieComplementar === especieTitulante &&
        Number.isFinite(item.concentracaoAnalito) &&
        item.concentracaoAnalito > 0 &&
        Number.isFinite(sal.kps) &&
        sal.kps > 0
      );
    });
  
    if (itensValidos.length < 2) {
      return {
        especieTitulante,
        itens: [],
        status: "dados_invalidos",
        mensagem:
          "A mistura precisa ter pelo menos dois analitos válidos que reajam com o mesmo titulante.",
      };
    }
  
    const resultadosSemOrdem: Omit<
      ResultadoItemSeletividadePrecipitacao,
      "ordemPrecipitacao"
    >[] = itensValidos.map((item) => {
      const { sal, especieAnalito, concentracaoAnalito } = item;
  
      const coeficienteAnalito =
        especieAnalito === "anion"
          ? sal.coeficienteAnion
          : sal.coeficienteCation;
  
      const coeficienteTitulante =
        especieTitulante === "anion"
          ? sal.coeficienteAnion
          : sal.coeficienteCation;
  
      const formulaAnalito =
        especieAnalito === "anion"
          ? sal.anion.formulaExibicao
          : sal.cation.formulaExibicao;
  
      const formulaTitulante =
        especieTitulante === "anion"
          ? sal.anion.formulaExibicao
          : sal.cation.formulaExibicao;
  
      const termoAnalito = Math.pow(concentracaoAnalito, coeficienteAnalito);
  
      const concentracaoTitulanteInicioPrecipitacao = Math.pow(
        sal.kps / termoAnalito,
        1 / coeficienteTitulante
      );
  
      const pTitulanteInicioPrecipitacao =
        concentracaoTitulanteInicioPrecipitacao > 0
          ? -Math.log10(concentracaoTitulanteInicioPrecipitacao)
          : NaN;
  
      const criterio = `[${formulaTitulante}] início = (Kps / [${formulaAnalito}]^${coeficienteAnalito})^(1/${coeficienteTitulante})`;
  
      const interpretacao = `Quanto menor a concentração necessária de ${formulaTitulante}, mais cedo esse precipitado começa a se formar.`;
  
      return {
        sal,
        especieAnalito,
        concentracaoAnalito,
        especieTitulante,
        concentracaoTitulanteInicioPrecipitacao,
        pTitulanteInicioPrecipitacao,
        criterio,
        interpretacao,
      };
    });
  
    const itensOrdenados = [...resultadosSemOrdem]
      .sort(
        (a, b) =>
          a.concentracaoTitulanteInicioPrecipitacao -
          b.concentracaoTitulanteInicioPrecipitacao
      )
      .map((item, index) => ({
        ...item,
        ordemPrecipitacao: index + 1,
      }));
  
    return {
      especieTitulante,
      itens: itensOrdenados,
      status: "adequado",
      mensagem:
        "A ordem de precipitação foi estimada pela concentração mínima de titulante necessária para iniciar a formação de cada precipitado.",
    };
  }