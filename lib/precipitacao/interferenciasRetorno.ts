import {
    saisPrecipitacao,
  } from "../data/precipitacao/sais";
  
  import type {
    IonPrecipitacao,
    ResultadoTitulacaoRetornoPrecipitacao,
    RiscoInterferenciaPrecipitacao,
    SalPrecipitacao,
  } from "./tipos";
  
  export type EtapaInterferenciaRetorno =
    | "precipitacao-principal"
    | "titulacao-retorno";
  
  export type InterferenciaRetornoPrecipitacao = {
    id: string;
  
    etapa:
      EtapaInterferenciaRetorno;
  
    especieInterferente:
      IonPrecipitacao;
  
    salInterferente:
      SalPrecipitacao;
  
    especieConsumida:
      "Ag⁺" | "SCN⁻";
  
    risco:
      RiscoInterferenciaPrecipitacao;
  
    concentracaoCritica: number;
  
    concentracaoCriticaReferencia: number;
  
    razaoConcentracoesCriticas: number;
  
    impactoAnalitico: string;
  
    motivo: string;
  
    recomendacao: string;
  };
  
  const FATOR_RISCO_MODERADO = 10;
  
  const FORMULA_AG = "Ag⁺";
  const FORMULA_SCN = "SCN⁻";
  
  function ehNumeroPositivo(
    valor: number
  ) {
    return (
      Number.isFinite(valor) &&
      valor > 0
    );
  }
  
  function coeficienteValido(
    valor: number
  ) {
    return (
      Number.isFinite(valor) &&
      Number.isInteger(valor) &&
      valor > 0
    );
  }
  
  function salValido(
    sal: SalPrecipitacao
  ) {
    return (
      ehNumeroPositivo(sal.kps) &&
      coeficienteValido(
        sal.coeficienteCation
      ) &&
      coeficienteValido(
        sal.coeficienteAnion
      )
    );
  }
  
  function resultadoValido(
    resultado:
      | ResultadoTitulacaoRetornoPrecipitacao
      | null
  ): resultado is ResultadoTitulacaoRetornoPrecipitacao {
    return (
      resultado !== null &&
      resultado.status !==
        "dados_invalidos" &&
      salValido(
        resultado.salPrincipal
      ) &&
      ehNumeroPositivo(
        resultado.concentracaoAnalito
      ) &&
      ehNumeroPositivo(
        resultado.concentracaoPrecipitanteExcesso
      ) &&
      ehNumeroPositivo(
        resultado.concentracaoTitulanteRetorno
      )
    );
  }
  
  function obterCoeficienteIon({
    sal,
    ion,
  }: {
    sal: SalPrecipitacao;
    ion: IonPrecipitacao;
  }) {
    if (
      sal.cation.id === ion.id
    ) {
      return sal.coeficienteCation;
    }
  
    if (
      sal.anion.id === ion.id
    ) {
      return sal.coeficienteAnion;
    }
  
    return NaN;
  }
  
  function obterIonOposto({
    sal,
    ion,
  }: {
    sal: SalPrecipitacao;
    ion: IonPrecipitacao;
  }) {
    if (
      sal.cation.id === ion.id
    ) {
      return sal.anion;
    }
  
    return sal.cation;
  }
  
  function salContemIon({
    sal,
    ion,
  }: {
    sal: SalPrecipitacao;
    ion: IonPrecipitacao;
  }) {
    return (
      sal.cation.id === ion.id ||
      sal.anion.id === ion.id
    );
  }
  
  /**
   * Para:
   *
   * CₐAᵦ(s) ⇌ a C + b A
   *
   * se o reagente avaliado for C:
   *
   * [C]crítica =
   * (Kps / [A]ᵇ)^(1/a)
   */
  function calcularConcentracaoCritica({
    sal,
    ionAvaliado,
    concentracaoIonOposto,
  }: {
    sal: SalPrecipitacao;
    ionAvaliado: IonPrecipitacao;
    concentracaoIonOposto: number;
  }) {
    const coeficienteAvaliado =
      obterCoeficienteIon({
        sal,
        ion: ionAvaliado,
      });
  
    const ionOposto =
      obterIonOposto({
        sal,
        ion: ionAvaliado,
      });
  
    const coeficienteOposto =
      obterCoeficienteIon({
        sal,
        ion: ionOposto,
      });
  
    if (
      !coeficienteValido(
        coeficienteAvaliado
      ) ||
      !coeficienteValido(
        coeficienteOposto
      ) ||
      !ehNumeroPositivo(
        concentracaoIonOposto
      )
    ) {
      return NaN;
    }
  
    const logConcentracaoCritica =
      (
        Math.log10(sal.kps) -
        coeficienteOposto *
          Math.log10(
            concentracaoIonOposto
          )
      ) /
      coeficienteAvaliado;
  
    return Math.pow(
      10,
      logConcentracaoCritica
    );
  }
  
  function classificarRisco({
    concentracaoCriticaInterferente,
    concentracaoCriticaReferencia,
  }: {
    concentracaoCriticaInterferente: number;
    concentracaoCriticaReferencia: number;
  }): RiscoInterferenciaPrecipitacao {
    const razao =
      concentracaoCriticaInterferente /
      concentracaoCriticaReferencia;
  
    if (razao <= 1) {
      return "alto";
    }
  
    if (
      razao <=
      FATOR_RISCO_MODERADO
    ) {
      return "moderado";
    }
  
    return "baixo";
  }
  
  function obterTextoInterferenciaAg({
    risco,
    especie,
    sal,
    razao,
    formulaAnalito,
  }: {
    risco:
      RiscoInterferenciaPrecipitacao;
    especie: IonPrecipitacao;
    sal: SalPrecipitacao;
    razao: number;
    formulaAnalito: string;
  }) {
    const razaoFormatada =
      razao.toExponential(3);
  
    if (risco === "alto") {
      return {
        motivo:
          `${especie.formulaExibicao} pode precipitar com Ag⁺ antes ou aproximadamente ao mesmo tempo que ${formulaAnalito}. ` +
          `Sob a hipótese de concentrações iguais, a formação de ${sal.formulaExibicao} exige aproximadamente ${razaoFormatada} vez(es) a concentração crítica de Ag⁺ do precipitado principal.`,
  
        impactoAnalitico:
          `O interferente consome parte do Ag⁺ adicionado. Esse consumo pode ser atribuído incorretamente ao analito, provocando tendência de superestimação.`,
  
        recomendacao:
          "Considere remover ou separar previamente o interferente, utilizar uma etapa de mascaramento validada ou selecionar outro procedimento analítico.",
      };
    }
  
    if (risco === "moderado") {
      return {
        motivo:
          `${especie.formulaExibicao} tende a formar ${sal.formulaExibicao} depois do precipitado principal, mas as concentrações críticas são relativamente próximas. A razão calculada é ${razaoFormatada}.`,
  
        impactoAnalitico:
          "Pode ocorrer consumo parcial de Ag⁺ pelo interferente, reduzindo a quantidade de prata disponível para a etapa de retorno.",
  
        recomendacao:
          "Avalie a concentração real do interferente e confirme experimentalmente se a precipitação concorrente é significativa.",
      };
    }
  
    return {
      motivo:
        `${especie.formulaExibicao} necessita de uma concentração de Ag⁺ aproximadamente ${razaoFormatada} vez(es) maior para iniciar a formação de ${sal.formulaExibicao}.`,
  
      impactoAnalitico:
        "A interferência tende a ser pequena nas condições comparadas, mas pode aumentar quando o interferente estiver em concentração elevada.",
  
      recomendacao:
        "Mantenha controle da composição da amostra e considere a concentração real do interferente antes de descartá-lo.",
    };
  }
  
  function obterTextoInterferenciaSCN({
    risco,
    especie,
    sal,
    razao,
  }: {
    risco:
      RiscoInterferenciaPrecipitacao;
    especie: IonPrecipitacao;
    sal: SalPrecipitacao;
    razao: number;
  }) {
    const razaoFormatada =
      razao.toExponential(3);
  
    if (risco === "alto") {
      return {
        motivo:
          `${especie.formulaExibicao} pode consumir SCN⁻ por formação de ${sal.formulaExibicao} antes ou nas proximidades da condição de referência do AgSCN. A razão entre as concentrações críticas é ${razaoFormatada}.`,
  
        impactoAnalitico:
          "Parte do SCN⁻ pode reagir com o interferente em vez de permanecer disponível para titular o Ag⁺ remanescente. Isso pode aumentar o volume observado e deslocar o ponto final.",
  
        recomendacao:
          "Considere remover o cátion interferente antes da retrotitulação ou utilizar outro procedimento para determinar a prata remanescente.",
      };
    }
  
    if (risco === "moderado") {
      return {
        motivo:
          `${especie.formulaExibicao} pode formar ${sal.formulaExibicao} com SCN⁻ em condições próximas às da etapa de retorno. A razão calculada é ${razaoFormatada}.`,
  
        impactoAnalitico:
          "O consumo concorrente de SCN⁻ pode produzir uma diferença mensurável entre o ponto final observado e o ponto final teórico.",
  
        recomendacao:
          "Avalie a concentração real do cátion e a persistência da mudança visual do indicador.",
      };
    }
  
    return {
      motivo:
        `${especie.formulaExibicao} necessita de uma condição de SCN⁻ aproximadamente ${razaoFormatada} vez(es) maior para iniciar a formação de ${sal.formulaExibicao}.`,
  
      impactoAnalitico:
        "A tendência de interferência na etapa de retorno é menor sob a hipótese de concentrações iguais.",
  
      recomendacao:
        "A interferência não deve ser descartada quando a espécie estiver presente em concentração muito superior à da prata remanescente.",
    };
  }
  
  export function avaliarInterferenciasRetornoPrecipitacao(
    resultado:
      | ResultadoTitulacaoRetornoPrecipitacao
      | null
  ): InterferenciaRetornoPrecipitacao[] {
    if (
      !resultadoValido(
        resultado
      )
    ) {
      return [];
    }
  
    const salAgSCN =
      saisPrecipitacao.find(
        (sal) =>
          sal.id === "AgSCN"
      );
  
    if (
      !salAgSCN ||
      !salValido(salAgSCN)
    ) {
      return [];
    }
  
    const ionAg =
      salAgSCN.cation;
  
    const ionSCN =
      salAgSCN.anion;
  
    const formulaAnalito =
      resultado.especieAnalito ===
      "cation"
        ? resultado.salPrincipal
            .cation.formulaExibicao
        : resultado.salPrincipal
            .anion.formulaExibicao;
  
    /*
     * Como a concentração verdadeira do interferente
     * não foi informada, a triagem usa inicialmente
     * a concentração do analito principal.
     */
    const concentracaoComparacao =
      resultado.concentracaoAnalito;
  
    const concentracaoCriticaPrincipal =
      calcularConcentracaoCritica({
        sal:
          resultado.salPrincipal,
        ionAvaliado:
          ionAg,
        concentracaoIonOposto:
          concentracaoComparacao,
      });
  
    const concentracaoCriticaAgSCN =
      calcularConcentracaoCritica({
        sal:
          salAgSCN,
        ionAvaliado:
          ionSCN,
        /*
         * Para a triagem da etapa de retorno,
         * usa-se uma concentração de comparação
         * baseada na prata remanescente.
         */
        concentracaoIonOposto:
          resultado.concentracaoPrecipitanteExcesso,
      });
  
      const interferenciasAg:
      InterferenciaRetornoPrecipitacao[] =
      ehNumeroPositivo(
        concentracaoCriticaPrincipal
      )
        ? saisPrecipitacao
            .filter(salValido)
            .filter(
              (sal) =>
                sal.id !==
                resultado.salPrincipal.id
            )
            .filter(
              (sal) =>
                sal.id !==
                "AgSCN"
            )
            .filter((sal) =>
              salContemIon({
                sal,
                ion: ionAg,
              })
            )
            .map((sal) => {
              const especie =
                obterIonOposto({
                  sal,
                  ion: ionAg,
                });
  
              const concentracaoCritica =
                calcularConcentracaoCritica({
                  sal,
                  ionAvaliado:
                    ionAg,
                  concentracaoIonOposto:
                    concentracaoComparacao,
                });
  
              if (
                !ehNumeroPositivo(
                  concentracaoCritica
                )
              ) {
                return null;
              }
  
              const risco =
                classificarRisco({
                  concentracaoCriticaInterferente:
                    concentracaoCritica,
                  concentracaoCriticaReferencia:
                    concentracaoCriticaPrincipal,
                });
  
              const razao =
                concentracaoCritica /
                concentracaoCriticaPrincipal;
  
              const textos =
                obterTextoInterferenciaAg({
                  risco,
                  especie,
                  sal,
                  razao,
                  formulaAnalito,
                });
  
              return {
                id:
                  `ag-${sal.id}`,
  
                etapa:
                  "precipitacao-principal" as const,
  
                especieInterferente:
                  especie,
  
                salInterferente:
                  sal,
  
                especieConsumida:
                  FORMULA_AG as "Ag⁺",
  
                risco,
  
                concentracaoCritica,
  
                concentracaoCriticaReferencia:
                  concentracaoCriticaPrincipal,
  
                razaoConcentracoesCriticas:
                  razao,
  
                impactoAnalitico:
                  textos.impactoAnalitico,
  
                motivo:
                  textos.motivo,
  
                recomendacao:
                  textos.recomendacao,
              };
            })
            .filter(
                (
                  item
                ): item is NonNullable<typeof item> =>
                  item !== null
              )
        : [];
  
        const interferenciasSCN:
        InterferenciaRetornoPrecipitacao[] =
      ehNumeroPositivo(
        concentracaoCriticaAgSCN
      )
        ? saisPrecipitacao
            .filter(salValido)
            .filter(
              (sal) =>
                sal.id !==
                "AgSCN"
            )
            .filter((sal) =>
              salContemIon({
                sal,
                ion: ionSCN,
              })
            )
            .map((sal) => {
              const especie =
                obterIonOposto({
                  sal,
                  ion: ionSCN,
                });
  
              const concentracaoCritica =
                calcularConcentracaoCritica({
                  sal,
                  ionAvaliado:
                    ionSCN,
                  concentracaoIonOposto:
                    concentracaoComparacao,
                });
  
              if (
                !ehNumeroPositivo(
                  concentracaoCritica
                )
              ) {
                return null;
              }
  
              const risco =
                classificarRisco({
                  concentracaoCriticaInterferente:
                    concentracaoCritica,
                  concentracaoCriticaReferencia:
                    concentracaoCriticaAgSCN,
                });
  
              const razao =
                concentracaoCritica /
                concentracaoCriticaAgSCN;
  
              const textos =
                obterTextoInterferenciaSCN({
                  risco,
                  especie,
                  sal,
                  razao,
                });
  
              return {
                id:
                  `scn-${sal.id}`,
  
                etapa:
                  "titulacao-retorno" as const,
  
                especieInterferente:
                  especie,
  
                salInterferente:
                  sal,
  
                especieConsumida:
                  FORMULA_SCN as "SCN⁻",
  
                risco,
  
                concentracaoCritica,
  
                concentracaoCriticaReferencia:
                  concentracaoCriticaAgSCN,
  
                razaoConcentracoesCriticas:
                  razao,
  
                impactoAnalitico:
                  textos.impactoAnalitico,
  
                motivo:
                  textos.motivo,
  
                recomendacao:
                  textos.recomendacao,
              };
            })
            .filter(
                (
                  item
                ): item is NonNullable<typeof item> =>
                  item !== null
              )
        : [];
  
    return [
      ...interferenciasAg,
      ...interferenciasSCN,
    ].sort(
      (itemA, itemB) => {
        const ordemRisco = {
          alto: 0,
          moderado: 1,
          baixo: 2,
        };
  
        const diferencaRisco =
          ordemRisco[itemA.risco] -
          ordemRisco[itemB.risco];
  
        if (
          diferencaRisco !== 0
        ) {
          return diferencaRisco;
        }
  
        return (
          itemA.razaoConcentracoesCriticas -
          itemB.razaoConcentracoesCriticas
        );
      }
    );
  }