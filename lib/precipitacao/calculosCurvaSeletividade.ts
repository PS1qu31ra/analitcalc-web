import type {
    ResultadoItemSeletividadePrecipitacao,
    ResultadoSeletividadePrecipitacao,
    SalPrecipitacao,
  } from "./tipos";
  
  export type PontoCurvaSeletividadePrecipitacao = {
    volumeAdicionado: number;
    volumeTotal: number;
    concentracaoTitulanteLivre: number;
    pTitulante: number;
    concentracaoAnalitoLivre: number;
    percentualPrecipitado: number;
    regiao:
      | "Antes da precipitação"
      | "Durante a precipitação"
      | "No ponto de equivalência"
      | "Após a precipitação";
  };
  
  export type SerieCurvaSeletividadePrecipitacao = {
    sal: SalPrecipitacao;
    formulaPrecipitado: string;
    ordemPrecipitacao: number;
    volumeInicio: number;
    volumeEquivalencia: number;
    pontos: PontoCurvaSeletividadePrecipitacao[];
  };
  
  export type ComparacaoKpsSeletividade = {
    primeiroSal: SalPrecipitacao;
    segundoSal: SalPrecipitacao;
    razaoKps: number;
    logRazaoKps: number;
    atendeCriterioConfiabilidade: boolean;
    interpretacao: string;
  };
  
  export type CurvaSeletividadePrecipitacao = {
    serieMistura: {
      nome: string;
      pontos: PontoCurvaSeletividadePrecipitacao[];
    };
    seriesIsoladas: SerieCurvaSeletividadePrecipitacao[];
  
    /**
     * Mantido para compatibilidade com o gráfico antigo.
     * Depois vamos trocar o componente para usar serieMistura + seriesIsoladas.
     */
    series: SerieCurvaSeletividadePrecipitacao[];
  
    comparacoesKps: ComparacaoKpsSeletividade[];
    volumeAmostra: number;
    concentracaoTitulante: number;
    volumeMaximo: number;
    passo: number;
    formulaTitulante: string;
  };
  
  function ehNumeroPositivo(valor: number) {
    return Number.isFinite(valor) && valor > 0;
  }
  
  function obterCoeficienteAnalito(item: ResultadoItemSeletividadePrecipitacao) {
    return item.especieAnalito === "cation"
      ? item.sal.coeficienteCation
      : item.sal.coeficienteAnion;
  }
  
  function obterCoeficienteTitulante(item: ResultadoItemSeletividadePrecipitacao) {
    return item.especieTitulante === "cation"
      ? item.sal.coeficienteCation
      : item.sal.coeficienteAnion;
  }
  
  function obterFormulaTitulante(item: ResultadoItemSeletividadePrecipitacao) {
    return item.especieTitulante === "cation"
      ? item.sal.cation.formulaExibicao
      : item.sal.anion.formulaExibicao;
  }
  
  function calcularConcentracaoTitulanteNoEquilibrio(
    item: ResultadoItemSeletividadePrecipitacao
  ) {
    const coeficienteAnalito = obterCoeficienteAnalito(item);
    const coeficienteTitulante = obterCoeficienteTitulante(item);
  
    const denominador =
      Math.pow(coeficienteAnalito, coeficienteAnalito) *
      Math.pow(coeficienteTitulante, coeficienteTitulante);
  
    const solubilidade = Math.pow(
      item.sal.kps / denominador,
      1 / (coeficienteAnalito + coeficienteTitulante)
    );
  
    return coeficienteTitulante * solubilidade;
  }
  
  function calcularMolTitulanteEquivalenciaItem({
    item,
    volumeAmostra,
  }: {
    item: ResultadoItemSeletividadePrecipitacao;
    volumeAmostra: number;
  }) {
    const coeficienteAnalito = obterCoeficienteAnalito(item);
    const coeficienteTitulante = obterCoeficienteTitulante(item);
  
    const molAnalito = item.concentracaoAnalito * (volumeAmostra / 1000);
  
    return molAnalito * (coeficienteTitulante / coeficienteAnalito);
  }
  
  function calcularPontoSerieIsolada({
    item,
    volumeAdicionado,
    volumeAmostra,
    concentracaoTitulante,
  }: {
    item: ResultadoItemSeletividadePrecipitacao;
    volumeAdicionado: number;
    volumeAmostra: number;
    concentracaoTitulante: number;
  }): PontoCurvaSeletividadePrecipitacao {
    const volumeTotal = volumeAmostra + volumeAdicionado;
    const volumeTotalLitros = volumeTotal / 1000;
  
    const coeficienteAnalito = obterCoeficienteAnalito(item);
    const coeficienteTitulante = obterCoeficienteTitulante(item);
  
    const molAnalitoInicial =
      item.concentracaoAnalito * (volumeAmostra / 1000);
  
    const molTitulanteAdicionado =
      concentracaoTitulante * (volumeAdicionado / 1000);
  
    const molTitulanteEquivalencia = calcularMolTitulanteEquivalenciaItem({
      item,
      volumeAmostra,
    });
  
    const toleranciaMol = Math.max(molTitulanteEquivalencia * 1e-6, 1e-14);
  
    const concentracaoTitulanteEquilibrio =
      calcularConcentracaoTitulanteNoEquilibrio(item);
  
    if (molTitulanteAdicionado <= 0) {
      return {
        volumeAdicionado,
        volumeTotal,
        concentracaoTitulanteLivre: NaN,
        pTitulante: NaN,
        concentracaoAnalitoLivre: item.concentracaoAnalito,
        percentualPrecipitado: 0,
        regiao: "Antes da precipitação",
      };
    }
  
    const distanciaEquivalencia =
      molTitulanteEquivalencia - molTitulanteAdicionado;
  
    if (Math.abs(distanciaEquivalencia) <= toleranciaMol) {
      return {
        volumeAdicionado,
        volumeTotal,
        concentracaoTitulanteLivre: concentracaoTitulanteEquilibrio,
        pTitulante: -Math.log10(concentracaoTitulanteEquilibrio),
        concentracaoAnalitoLivre:
          (concentracaoTitulanteEquilibrio * coeficienteAnalito) /
          coeficienteTitulante,
        percentualPrecipitado: 100,
        regiao: "No ponto de equivalência",
      };
    }
  
    if (molTitulanteAdicionado > molTitulanteEquivalencia) {
      const molTitulanteLivre =
        molTitulanteAdicionado - molTitulanteEquivalencia;
  
      const concentracaoTitulanteLivre = Math.max(
        molTitulanteLivre / volumeTotalLitros,
        concentracaoTitulanteEquilibrio
      );
  
      return {
        volumeAdicionado,
        volumeTotal,
        concentracaoTitulanteLivre,
        pTitulante: -Math.log10(concentracaoTitulanteLivre),
        concentracaoAnalitoLivre: 0,
        percentualPrecipitado: 100,
        regiao: "Após a precipitação",
      };
    }
  
    const molAnalitoPrecipitado =
      molTitulanteAdicionado * (coeficienteAnalito / coeficienteTitulante);
  
    const molAnalitoLivre = Math.max(
      molAnalitoInicial - molAnalitoPrecipitado,
      0
    );
  
    if (molAnalitoLivre <= molAnalitoInicial * 1e-8) {
      return {
        volumeAdicionado,
        volumeTotal,
        concentracaoTitulanteLivre: concentracaoTitulanteEquilibrio,
        pTitulante: -Math.log10(concentracaoTitulanteEquilibrio),
        concentracaoAnalitoLivre:
          (concentracaoTitulanteEquilibrio * coeficienteAnalito) /
          coeficienteTitulante,
        percentualPrecipitado: 100,
        regiao: "No ponto de equivalência",
      };
    }
  
    const concentracaoAnalitoLivre = molAnalitoLivre / volumeTotalLitros;
  
    const termoAnalito = Math.pow(
      Math.max(concentracaoAnalitoLivre, 1e-30),
      coeficienteAnalito
    );
  
    const concentracaoTitulanteLivre = Math.pow(
      item.sal.kps / termoAnalito,
      1 / coeficienteTitulante
    );
  
    return {
      volumeAdicionado,
      volumeTotal,
      concentracaoTitulanteLivre,
      pTitulante: -Math.log10(concentracaoTitulanteLivre),
      concentracaoAnalitoLivre,
      percentualPrecipitado: Math.min(
        (molAnalitoPrecipitado / molAnalitoInicial) * 100,
        100
      ),
      regiao: "Durante a precipitação",
    };
  }
  
  function calcularPontoMistura({
    itensOrdenados,
    molTitulanteEquivalenciaPorItem,
    volumeAdicionado,
    volumeAmostra,
    concentracaoTitulante,
  }: {
    itensOrdenados: ResultadoItemSeletividadePrecipitacao[];
    molTitulanteEquivalenciaPorItem: number[];
    volumeAdicionado: number;
    volumeAmostra: number;
    concentracaoTitulante: number;
  }): PontoCurvaSeletividadePrecipitacao {
    const volumeTotal = volumeAmostra + volumeAdicionado;
    const volumeTotalLitros = volumeTotal / 1000;
  
    const molTitulanteAdicionado =
      concentracaoTitulante * (volumeAdicionado / 1000);
  
    if (molTitulanteAdicionado <= 0) {
      return {
        volumeAdicionado,
        volumeTotal,
        concentracaoTitulanteLivre: NaN,
        pTitulante: NaN,
        concentracaoAnalitoLivre: NaN,
        percentualPrecipitado: 0,
        regiao: "Antes da precipitação",
      };
    }
  
    let molAcumuladoAntes = 0;
  
    for (let index = 0; index < itensOrdenados.length; index += 1) {
      const item = itensOrdenados[index];
      const molEquivalenciaItem = molTitulanteEquivalenciaPorItem[index];
      const molAcumuladoDepois = molAcumuladoAntes + molEquivalenciaItem;
  
      if (molTitulanteAdicionado <= molAcumuladoDepois) {
        const pontoLocal = calcularPontoSerieIsolada({
          item,
          volumeAdicionado:
            ((molTitulanteAdicionado - molAcumuladoAntes) /
              concentracaoTitulante) *
            1000,
          volumeAmostra,
          concentracaoTitulante,
        });
  
        return {
          ...pontoLocal,
          volumeAdicionado,
          volumeTotal,
        };
      }
  
      molAcumuladoAntes = molAcumuladoDepois;
    }
  
    const ultimoItem = itensOrdenados[itensOrdenados.length - 1];
  
    const molTitulanteLivre = molTitulanteAdicionado - molAcumuladoAntes;
  
    const concentracaoTitulanteEquilibrio =
      calcularConcentracaoTitulanteNoEquilibrio(ultimoItem);
  
    const concentracaoTitulanteLivre = Math.max(
      molTitulanteLivre / volumeTotalLitros,
      concentracaoTitulanteEquilibrio
    );
  
    return {
      volumeAdicionado,
      volumeTotal,
      concentracaoTitulanteLivre,
      pTitulante: -Math.log10(concentracaoTitulanteLivre),
      concentracaoAnalitoLivre: 0,
      percentualPrecipitado: 100,
      regiao: "Após a precipitação",
    };
  }
  
  function gerarPontosVolume({
    volumeMaximo,
    passo,
    volumesObrigatorios,
  }: {
    volumeMaximo: number;
    passo: number;
    volumesObrigatorios: number[];
  }) {
    const pontos = new Set<number>();
  
    for (let volume = 0; volume <= volumeMaximo; volume += passo) {
      pontos.add(Number(volume.toFixed(6)));
    }
  
    for (const volume of volumesObrigatorios) {
      if (Number.isFinite(volume) && volume >= 0 && volume <= volumeMaximo) {
        pontos.add(Number(volume.toFixed(6)));
      }
    }
  
    return Array.from(pontos).sort((a, b) => a - b);
  }
  
  function gerarComparacoesKps(
    itensOrdenados: ResultadoItemSeletividadePrecipitacao[]
  ): ComparacaoKpsSeletividade[] {
    const comparacoes: ComparacaoKpsSeletividade[] = [];
  
    for (let index = 0; index < itensOrdenados.length - 1; index += 1) {
      const primeiro = itensOrdenados[index];
      const segundo = itensOrdenados[index + 1];
  
      const kpsMenor = Math.min(primeiro.sal.kps, segundo.sal.kps);
      const kpsMaior = Math.max(primeiro.sal.kps, segundo.sal.kps);
  
      const razaoKps = kpsMaior / kpsMenor;
      const logRazaoKps = Math.log10(razaoKps);
  
      const atendeCriterioConfiabilidade = razaoKps >= 1e8;
  
      comparacoes.push({
        primeiroSal: primeiro.sal,
        segundoSal: segundo.sal,
        razaoKps,
        logRazaoKps,
        atendeCriterioConfiabilidade,
        interpretacao: atendeCriterioConfiabilidade
          ? "A diferença entre os Kps atende ao critério 10⁸, indicando separação mais favorável para quantificação seletiva."
          : "A diferença entre os Kps não atinge 10⁸. A ordem de precipitação pode existir, mas a quantificação seletiva isolada não é considerada confiável por esse critério.",
      });
    }
  
    return comparacoes;
  }
  
  export function gerarCurvaSeletividadePrecipitacao({
    resultado,
    volumeAmostra,
    concentracaoTitulante,
    passo = 0.1,
    volumeMaximoManual,
  }: {
    resultado: ResultadoSeletividadePrecipitacao;
    volumeAmostra: number;
    concentracaoTitulante: number;
    passo?: number;
    volumeMaximoManual?: number;
  }): CurvaSeletividadePrecipitacao {
    if (
      resultado.status === "dados_invalidos" ||
      resultado.status === "mistura_insuficiente" ||
      !ehNumeroPositivo(volumeAmostra) ||
      !ehNumeroPositivo(concentracaoTitulante) ||
      !ehNumeroPositivo(passo) ||
      resultado.itens.length === 0
    ) {
      return {
        serieMistura: {
          nome: "Mistura",
          pontos: [],
        },
        seriesIsoladas: [],
        series: [],
        comparacoesKps: [],
        volumeAmostra,
        concentracaoTitulante,
        volumeMaximo: NaN,
        passo,
        formulaTitulante: "-",
      };
    }
  
    const itensOrdenados = [...resultado.itens].sort(
      (a, b) => a.ordemPrecipitacao - b.ordemPrecipitacao
    );
  
    const formulaTitulante = obterFormulaTitulante(itensOrdenados[0]);
  
    const molTitulanteEquivalenciaPorItem = itensOrdenados.map((item) =>
      calcularMolTitulanteEquivalenciaItem({
        item,
        volumeAmostra,
      })
    );
  
    const molTitulanteTotal = molTitulanteEquivalenciaPorItem.reduce(
      (soma, mol) => soma + mol,
      0
    );
  
    const volumesEquivalenciaAcumulados: number[] = [];
    let molAcumulado = 0;
  
    for (const mol of molTitulanteEquivalenciaPorItem) {
      molAcumulado += mol;
      volumesEquivalenciaAcumulados.push(
        (molAcumulado / concentracaoTitulante) * 1000
      );
    }
  
    const volumeMaximo =
      Number.isFinite(volumeMaximoManual) &&
      volumeMaximoManual !== undefined &&
      volumeMaximoManual > 0
        ? volumeMaximoManual
        : Math.max((molTitulanteTotal / concentracaoTitulante) * 1000 * 1.2, 1);
  
    const volumesDaCurva = gerarPontosVolume({
      volumeMaximo,
      passo,
      volumesObrigatorios: volumesEquivalenciaAcumulados,
    });
  
    const pontosMistura = volumesDaCurva.map((volumeAdicionado) =>
      calcularPontoMistura({
        itensOrdenados,
        molTitulanteEquivalenciaPorItem,
        volumeAdicionado,
        volumeAmostra,
        concentracaoTitulante,
      })
    );
  
    const seriesIsoladas = itensOrdenados.map((item) => {
      const molTitulanteEquivalenciaItem =
        calcularMolTitulanteEquivalenciaItem({
          item,
          volumeAmostra,
        });
  
      const volumeEquivalencia =
        (molTitulanteEquivalenciaItem / concentracaoTitulante) * 1000;
  
      const volumesSerie = gerarPontosVolume({
        volumeMaximo,
        passo,
        volumesObrigatorios: [volumeEquivalencia],
      });
  
      const pontos = volumesSerie.map((volumeAdicionado) =>
        calcularPontoSerieIsolada({
          item,
          volumeAdicionado,
          volumeAmostra,
          concentracaoTitulante,
        })
      );
  
      return {
        sal: item.sal,
        formulaPrecipitado: item.sal.formulaExibicao,
        ordemPrecipitacao: item.ordemPrecipitacao,
        volumeInicio: 0,
        volumeEquivalencia,
        pontos,
      };
    });
  
    return {
      serieMistura: {
        nome: "Mistura completa",
        pontos: pontosMistura,
      },
      seriesIsoladas,
      series: seriesIsoladas,
      comparacoesKps: gerarComparacoesKps(itensOrdenados),
      volumeAmostra,
      concentracaoTitulante,
      volumeMaximo,
      passo,
      formulaTitulante,
    };
  }