import {
    saisPrecipitacao,
  } from "../data/precipitacao/sais";
  
  import {
    calcularSeletividadePrecipitacao,
  } from "./calculosSeletividade";
  
  import {
    gerarCurvaSeletividadePrecipitacao,
  } from "./calculosCurvaSeletividade";
  
  import type {
    InterferenciaRetornoPrecipitacao,
  } from "./interferenciasRetorno";
  
  import type {
    EspecieAnalitoPrecipitacao,
    ResultadoTitulacaoRetornoPrecipitacao,
    SalPrecipitacao,
  } from "./tipos";
  
  export type CurvaInterferenciaRetornoCalculada = {
    etapa:
      InterferenciaRetornoPrecipitacao["etapa"];
  
    curva:
      ReturnType<
        typeof gerarCurvaSeletividadePrecipitacao
      > | null;
  
    salReferenciaId: string;
  
    salInterferenteId: string;
  
    formulaReferencia: string;
  
    formulaInterferente: string;
  
    formulaTitulante: string;
  
    concentracaoInterferenteAdotada: number;
  
    mensagem: string;
  };
  
  function ehNumeroPositivo(
    valor: number
  ) {
    return (
      Number.isFinite(valor) &&
      valor > 0
    );
  }
  
  function obterEspecieAnalito({
    sal,
    ionId,
  }: {
    sal: SalPrecipitacao;
    ionId: string;
  }): EspecieAnalitoPrecipitacao | null {
    if (
      sal.cation.id === ionId
    ) {
      return "cation";
    }
  
    if (
      sal.anion.id === ionId
    ) {
      return "anion";
    }
  
    return null;
  }
  
  function criarResultadoInvalido({
    interferencia,
    formulaReferencia,
    formulaTitulante,
    mensagem,
  }: {
    interferencia:
      InterferenciaRetornoPrecipitacao;
  
    formulaReferencia: string;
  
    formulaTitulante: string;
  
    mensagem: string;
  }): CurvaInterferenciaRetornoCalculada {
    return {
      etapa:
        interferencia.etapa,
  
      curva: null,
  
      salReferenciaId: "",
  
      salInterferenteId:
        interferencia
          .salInterferente.id,
  
      formulaReferencia,
  
      formulaInterferente:
        interferencia
          .salInterferente
          .formulaExibicao,
  
      formulaTitulante,
  
      concentracaoInterferenteAdotada:
        NaN,
  
      mensagem,
    };
  }
  
  function calcularCurvaEtapaPrincipal({
    resultado,
    interferencia,
    concentracaoInterferente,
  }: {
    resultado:
      ResultadoTitulacaoRetornoPrecipitacao;
  
    interferencia:
      InterferenciaRetornoPrecipitacao;
  
    concentracaoInterferente: number;
  }): CurvaInterferenciaRetornoCalculada {
    const salPrincipal =
      resultado.salPrincipal;
  
    const especieInterferente =
      obterEspecieAnalito({
        sal:
          interferencia
            .salInterferente,
  
        ionId:
          interferencia
            .especieInterferente.id,
      });
  
    if (
      !especieInterferente
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salPrincipal
            .formulaExibicao,
  
        formulaTitulante:
          "Ag⁺",
  
        mensagem:
          "Não foi possível identificar a espécie interferente no precipitado concorrente.",
      });
    }
  
    const seletividade =
      calcularSeletividadePrecipitacao({
        especieTitulante:
          "cation",
  
        itens: [
          {
            sal:
              salPrincipal,
  
            especieAnalito:
              resultado
                .especieAnalito,
  
            concentracaoAnalito:
              resultado
                .concentracaoAnalito,
          },
  
          {
            sal:
              interferencia
                .salInterferente,
  
            especieAnalito:
              especieInterferente,
  
            concentracaoAnalito:
              concentracaoInterferente,
          },
        ],
      });
  
    if (
      seletividade.status !==
      "adequado"
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salPrincipal
            .formulaExibicao,
  
        formulaTitulante:
          "Ag⁺",
  
        mensagem:
          seletividade.mensagem,
      });
    }
  
    const volumeMaximo =
      Math.max(
        resultado
          .volumePrecipitanteExcesso *
          1.25,
  
        resultado
          .volumePrecipitanteExcesso,
  
        1
      );
  
    const curva =
      gerarCurvaSeletividadePrecipitacao({
        resultado:
          seletividade,
  
        volumeAmostra:
          resultado.volumeAmostra,
  
        concentracaoTitulante:
          resultado
            .concentracaoPrecipitanteExcesso,
  
        passo: 0.1,
  
        volumeMaximoManual:
          volumeMaximo,
      });
  
    return {
      etapa:
        interferencia.etapa,
  
      curva,
  
      salReferenciaId:
        salPrincipal.id,
  
      salInterferenteId:
        interferencia
          .salInterferente.id,
  
      formulaReferencia:
        salPrincipal
          .formulaExibicao,
  
      formulaInterferente:
        interferencia
          .salInterferente
          .formulaExibicao,
  
      formulaTitulante:
        "Ag⁺",
  
      concentracaoInterferenteAdotada:
        concentracaoInterferente,
  
      mensagem:
        "A curva compara o precipitado principal e o precipitado concorrente durante a adição de Ag⁺.",
    };
  }
  
  function calcularCurvaEtapaRetorno({
    resultado,
    interferencia,
    concentracaoInterferente,
  }: {
    resultado:
      ResultadoTitulacaoRetornoPrecipitacao;
  
    interferencia:
      InterferenciaRetornoPrecipitacao;
  
    concentracaoInterferente: number;
  }): CurvaInterferenciaRetornoCalculada {
    const salAgSCN =
      saisPrecipitacao.find(
        (sal) =>
          sal.id === "AgSCN"
      );
  
    if (!salAgSCN) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          "AgSCN",
  
        formulaTitulante:
          "SCN⁻",
  
        mensagem:
          "O precipitado AgSCN não foi encontrado na base de dados.",
      });
    }
  
    const especieInterferente =
      obterEspecieAnalito({
        sal:
          interferencia
            .salInterferente,
  
        ionId:
          interferencia
            .especieInterferente.id,
      });
  
    if (
      !especieInterferente
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salAgSCN
            .formulaExibicao,
  
        formulaTitulante:
          "SCN⁻",
  
        mensagem:
          "Não foi possível identificar o cátion que compete pelo SCN⁻.",
      });
    }
  
    const volumeInicialRetorno =
      resultado.volumeAmostra +
      resultado
        .volumePrecipitanteExcesso;
  
    const volumeInicialRetornoLitros =
      volumeInicialRetorno /
      1000;
  
    if (
      !ehNumeroPositivo(
        volumeInicialRetornoLitros
      )
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salAgSCN
            .formulaExibicao,
  
        formulaTitulante:
          "SCN⁻",
  
        mensagem:
          "O volume inicial da etapa de retorno é inválido.",
      });
    }
  
    const concentracaoAgRemanescente =
      resultado
        .molPrecipitanteEmExcesso /
      volumeInicialRetornoLitros;
  
    if (
      !ehNumeroPositivo(
        concentracaoAgRemanescente
      )
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salAgSCN
            .formulaExibicao,
  
        formulaTitulante:
          "SCN⁻",
  
        mensagem:
          "Não existe concentração positiva de Ag⁺ remanescente para gerar a curva de retorno.",
      });
    }
  
    const seletividade =
      calcularSeletividadePrecipitacao({
        especieTitulante:
          "anion",
  
        itens: [
          {
            sal:
              salAgSCN,
  
            especieAnalito:
              "cation",
  
            concentracaoAnalito:
              concentracaoAgRemanescente,
          },
  
          {
            sal:
              interferencia
                .salInterferente,
  
            especieAnalito:
              especieInterferente,
  
            concentracaoAnalito:
              concentracaoInterferente,
          },
        ],
      });
  
    if (
      seletividade.status !==
      "adequado"
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          salAgSCN
            .formulaExibicao,
  
        formulaTitulante:
          "SCN⁻",
  
        mensagem:
          seletividade.mensagem,
      });
    }
  
    const volumeMaximo =
      Math.max(
        resultado
          .volumeTitulanteRetorno *
          1.6,
  
        resultado
          .volumeTitulanteRetorno,
  
        1
      );
  
    const curva =
      gerarCurvaSeletividadePrecipitacao({
        resultado:
          seletividade,
  
        volumeAmostra:
          volumeInicialRetorno,
  
        concentracaoTitulante:
          resultado
            .concentracaoTitulanteRetorno,
  
        passo: 0.1,
  
        volumeMaximoManual:
          volumeMaximo,
      });
  
    return {
      etapa:
        interferencia.etapa,
  
      curva,
  
      salReferenciaId:
        salAgSCN.id,
  
      salInterferenteId:
        interferencia
          .salInterferente.id,
  
      formulaReferencia:
        salAgSCN
          .formulaExibicao,
  
      formulaInterferente:
        interferencia
          .salInterferente
          .formulaExibicao,
  
      formulaTitulante:
        "SCN⁻",
  
      concentracaoInterferenteAdotada:
        concentracaoInterferente,
  
      mensagem:
        "A curva compara AgSCN e o precipitado concorrente durante a adição de SCN⁻ na etapa de retorno.",
    };
  }
  
  export function calcularCurvaInterferenciaRetorno({
    resultado,
    interferencia,
    concentracaoInterferente,
  }: {
    resultado:
      ResultadoTitulacaoRetornoPrecipitacao;
  
    interferencia:
      InterferenciaRetornoPrecipitacao;
  
    concentracaoInterferente?: number;
  }): CurvaInterferenciaRetornoCalculada {
    const concentracaoAdotada =
      concentracaoInterferente ??
      resultado.concentracaoAnalito;
  
    if (
      !ehNumeroPositivo(
        concentracaoAdotada
      )
    ) {
      return criarResultadoInvalido({
        interferencia,
  
        formulaReferencia:
          interferencia.etapa ===
          "precipitacao-principal"
            ? resultado
                .salPrincipal
                .formulaExibicao
            : "AgSCN",
  
        formulaTitulante:
          interferencia.etapa ===
          "precipitacao-principal"
            ? "Ag⁺"
            : "SCN⁻",
  
        mensagem:
          "A concentração adotada para o interferente deve ser positiva.",
      });
    }
  
    if (
      interferencia.etapa ===
      "precipitacao-principal"
    ) {
      return calcularCurvaEtapaPrincipal({
        resultado,
        interferencia,
  
        concentracaoInterferente:
          concentracaoAdotada,
      });
    }
  
    return calcularCurvaEtapaRetorno({
      resultado,
      interferencia,
  
      concentracaoInterferente:
        concentracaoAdotada,
    });
  }