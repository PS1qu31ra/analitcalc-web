import {
  avaliarSistemaEDTA,
  normalizar,
  numero,
} from "./complexometria";

import {
  constantesIndicadores,
  indicadoresEdta,
} from "./data";

export type ResultadoAvaliacaoEDTA = ReturnType<typeof avaliarSistemaEDTA>;

export type RegiaoCurvaEDTA = "Antes do PE" | "PE" | "Após PE" | "-";

export type PontoCurvaEDTA = {
  calculado: true;
  volume: number;
  volumeTotalL: number;
  CM: number;
  CY: number;
  kfEfetivo: number;
  concLDiluida: number | null;
  alfaMetalLivre: number;
  denominadorComplexacaoMetal: number;
  MY: number;
  metalLivre: number;
  metalCondicional: number;
  edtaLivre: number;
  percentualComplexado: number;
  pM: number | null;
  regiao: RegiaoCurvaEDTA;
};

export type CurvaEDTA = {
  pontos: PontoCurvaEDTA[];
  volumePE: number | null;
  pontoPE: PontoCurvaEDTA | null;
  volumeMaximo: number;
  passo: number;
};

export type PontoPrimeiraDerivadaEDTA = {
  volume: number;
  volumeInicial: number;
  volumeFinal: number;
  volumeEstimadoPE: number;
  derivada: number;
  pMInicial: number;
  pMFinal: number;
  deltaV: number;
  deltaPM: number;
};

export type PontoSegundaDerivadaEDTA = {
  volume: number;
  volumeInicial: number;
  volumeFinal: number;
  derivadaAnterior: number;
  derivadaAtual: number;
  segundaDerivada: number;
  deltaV: number;
  deltaDerivada: number;
};

export type TrocaSinalSegundaDerivadaEDTA = {
  volumeEstimado: number;
  volumeInterpolado: number;
  sinalAntes: "+" | "-";
  sinalDepois: "+" | "-";
  anterior: PontoSegundaDerivadaEDTA;
  atual: PontoSegundaDerivadaEDTA;
  ajustadoParaPE: boolean;
};

export type RankingIndicadorEDTA = {
  id: string;
  indicador: string;

  metaisRecomendados: string;
  metalPreferencial: string;

  pHMin: number;
  pHMax: number;

  corLivre: string;
  corComplexado: string;

  aplicacao: string;
  observacao: string;
  referencia: string;

  atendeMetal: boolean;
  atendePH: boolean;
  atendeMetalPreferencial: boolean;

  score: number;
  classificacao: "recomendado" | "parcial" | "nao_recomendado";
  justificativa: string;
};

export function gerarCurvaEDTA(
  resultado: ResultadoAvaliacaoEDTA,
  options?: {
    passo?: number;
    volumeMaximo?: number;
  }
): CurvaEDTA {
  const passo = options?.passo || 0.25;

  const cMetal = numero(resultado.entradas.concMetal);
  const cEDTA = numero(resultado.entradas.concEDTA);
  const vAmostra = numero(resultado.entradas.volAmostra);
  const vBureta = numero(resultado.entradas.volBureta) || 50;

  if (!cMetal || !cEDTA || !vAmostra) {
    return {
      pontos: [],
      volumePE: null,
      pontoPE: null,
      volumeMaximo: vBureta,
      passo,
    };
  }

  const volumePE = resultado.volumePE ?? (cMetal * vAmostra) / cEDTA;

  const volumeMaximo =
    options?.volumeMaximo ?? Math.max(vBureta, volumePE + 10);

  const pontos: PontoCurvaEDTA[] = [];

  for (let v = 0; v <= volumeMaximo + 0.000001; v += passo) {
    const ponto = calcularPontoCurvaEDTA(resultado, v);

    if (ponto && ponto.pM !== null && Number.isFinite(ponto.pM)) {
      pontos.push(ponto);
    }
  }

  const pontoPE = calcularPontoCurvaEDTA(resultado, volumePE);

  return {
    pontos,
    volumePE,
    pontoPE,
    volumeMaximo,
    passo,
  };
}

export function calcularPontoCurvaEDTA(
  resultado: ResultadoAvaliacaoEDTA,
  volumeEDTAmL: number,
  kfAlternativo?: number
): PontoCurvaEDTA | null {
  const cMetalInicial = numero(resultado.entradas.concMetal);
  const cEDTA = numero(resultado.entradas.concEDTA);
  const vAmostra = numero(resultado.entradas.volAmostra);

  if (!cMetalInicial || !cEDTA || !vAmostra) return null;

  const molMetal = cMetalInicial * (vAmostra / 1000);
  const molEDTA = cEDTA * (volumeEDTAmL / 1000);

  const volumeTotalL = (vAmostra + volumeEDTAmL) / 1000;

  if (!volumeTotalL) return null;

  const CM = molMetal / volumeTotalL;
  const CY = molEDTA / volumeTotalL;

  const dadosKfPonto = calcularKfEfetivoNoPontoCurvaEDTA(resultado);

  const kfEfetivo = kfAlternativo || dadosKfPonto.kfEfetivo;

  if (!kfEfetivo) return null;

  const equilibrio = resolverEquilibrioEDTA(
    CM,
    CY,
    kfEfetivo,
    dadosKfPonto.alfaMetalLivre
  );

  if (!equilibrio.calculado) return null;

  const regiao = identificarRegiaoCurvaEDTA(
    volumeEDTAmL,
    resultado.volumePE
  );

  return {
    calculado: true,
    volume: Number(volumeEDTAmL.toFixed(3)),
    volumeTotalL,
    CM,
    CY,
    kfEfetivo,
    concLDiluida: dadosKfPonto.concLDiluida,
    alfaMetalLivre: dadosKfPonto.alfaMetalLivre,
    denominadorComplexacaoMetal: dadosKfPonto.denominador,
    MY: equilibrio.MY,
    metalLivre: equilibrio.metalLivre,
    metalCondicional: equilibrio.metalCondicional,
    edtaLivre: equilibrio.edtaLivre,
    percentualComplexado: equilibrio.percentualComplexado,
    pM: equilibrio.pM,
    regiao,
  };
}

function calcularKfEfetivoNoPontoCurvaEDTA(
  resultado: ResultadoAvaliacaoEDTA
) {
  const m = resultado.metalPrincipal;

  return {
    kfEfetivo: m.kfEfetivo || m.kfCondicional,
    concLDiluida: m.concComplexanteAuxiliar || null,
    alfaMetalLivre: m.alfaMetalLivre || 1,
    denominador: m.denominadorComplexacaoMetal || 1,
  };
}

export function resolverEquilibrioEDTA(
  CM: number,
  CY: number,
  kfEfetivo: number,
  alfaMetalLivre = 1
) {
  if (!CM || CY < 0 || !kfEfetivo || kfEfetivo <= 0) {
    return {
      calculado: false as const,
    };
  }

  const limiteSuperior = Math.min(CM, CY);

  if (limiteSuperior <= 0) {
    const metalCondicional = CM;
    const metalLivre = alfaMetalLivre * metalCondicional;

    return {
      calculado: true as const,
      MY: 0,
      metalLivre,
      metalCondicional,
      edtaLivre: CY,
      percentualComplexado: 0,
      pM: metalLivre > 0 ? -Math.log10(metalLivre) : null,
    };
  }

  function f(my: number) {
    return kfEfetivo * (CM - my) * (CY - my) - my;
  }

  let baixo = 0;
  let alto = limiteSuperior * (1 - 1e-12);
  let fBaixo = f(baixo);

  for (let i = 0; i < 200; i++) {
    const meio = (baixo + alto) / 2;
    const fMeio = f(meio);

    if (Math.abs(fMeio) < 1e-18) {
      baixo = meio;
      alto = meio;
      break;
    }

    if (fBaixo * fMeio < 0) {
      alto = meio;
    } else {
      baixo = meio;
      fBaixo = fMeio;
    }
  }

  const MY = (baixo + alto) / 2;

  const metalCondicional = Math.max(CM - MY, 1e-30);
  const metalLivre = alfaMetalLivre * metalCondicional;
  const edtaLivre = Math.max(CY - MY, 0);

  const percentualComplexado = CM > 0 ? (MY / CM) * 100 : 0;
  const pM = metalLivre > 0 ? -Math.log10(metalLivre) : null;

  return {
    calculado: true as const,
    MY,
    metalLivre,
    metalCondicional,
    edtaLivre,
    percentualComplexado,
    pM,
  };
}

export function identificarRegiaoCurvaEDTA(
  volume: number,
  volumePE: number | null
): RegiaoCurvaEDTA {
  if (!volumePE) return "-";

  const tolerancia = 0.0001;

  if (volume < volumePE - tolerancia) return "Antes do PE";

  if (Math.abs(volume - volumePE) <= tolerancia) return "PE";

  return "Após PE";
}

export function montarCurvasInterferentesEDTA(
  resultado: ResultadoAvaliacaoEDTA,
  volumeMaximo: number,
  passo: number
) {
  const interferentes = resultado.interferentes || [];

  return interferentes.map((interferente) => {
    const pontos: PontoCurvaEDTA[] = [];
    const kfInterferenteEfetivo = interferente.kfInterferenteCondicional;

    for (let v = 0; v <= volumeMaximo + 0.000001; v += passo) {
      const ponto = calcularPontoCurvaEDTA(
        resultado,
        v,
        kfInterferenteEfetivo
      );

      if (ponto && ponto.pM !== null && Number.isFinite(ponto.pM)) {
        pontos.push(ponto);
      }
    }

    return {
      metal: interferente.metal,
      pontos,
    };
  });
}

export function calcularPrimeiraDerivadaEDTA(
  pontos: PontoCurvaEDTA[]
): PontoPrimeiraDerivadaEDTA[] {
  const derivada: PontoPrimeiraDerivadaEDTA[] = [];

  for (let i = 1; i < pontos.length; i++) {
    const v1 = pontos[i - 1].volume;
    const v2 = pontos[i].volume;
    const pM1 = pontos[i - 1].pM;
    const pM2 = pontos[i].pM;

    if (pM1 === null || pM2 === null) continue;

    const deltaV = v2 - v1;

    if (!deltaV) continue;

    derivada.push({
      volume: (v1 + v2) / 2,
      volumeInicial: v1,
      volumeFinal: v2,
      volumeEstimadoPE: v2,
      derivada: (pM2 - pM1) / deltaV,
      pMInicial: pM1,
      pMFinal: pM2,
      deltaV,
      deltaPM: pM2 - pM1,
    });
  }

  return derivada.filter((p) => Number.isFinite(p.derivada));
}

export function localizarPicoPrimeiraDerivadaEDTA(
  pontosPrimeiraDerivada: PontoPrimeiraDerivadaEDTA[]
): PontoPrimeiraDerivadaEDTA | null {
  if (!pontosPrimeiraDerivada.length) return null;

  return pontosPrimeiraDerivada.reduce((maior, atual) => {
    return atual.derivada > maior.derivada ? atual : maior;
  }, pontosPrimeiraDerivada[0]);
}

export function calcularSegundaDerivadaEDTA(
  pontosPrimeira: PontoPrimeiraDerivadaEDTA[]
): PontoSegundaDerivadaEDTA[] {
  const segunda: PontoSegundaDerivadaEDTA[] = [];

  for (let i = 1; i < pontosPrimeira.length; i++) {
    const anterior = pontosPrimeira[i - 1];
    const atual = pontosPrimeira[i];

    const deltaV = atual.volume - anterior.volume;

    if (!deltaV) continue;

    segunda.push({
      volume: (anterior.volume + atual.volume) / 2,
      volumeInicial: anterior.volume,
      volumeFinal: atual.volume,
      derivadaAnterior: anterior.derivada,
      derivadaAtual: atual.derivada,
      segundaDerivada: (atual.derivada - anterior.derivada) / deltaV,
      deltaV,
      deltaDerivada: atual.derivada - anterior.derivada,
    });
  }

  return segunda.filter((p) => Number.isFinite(p.segundaDerivada));
}

export function localizarTrocaSinalSegundaDerivadaEDTA(
  pontos: PontoSegundaDerivadaEDTA[],
  volumePE?: number | null
): TrocaSinalSegundaDerivadaEDTA | null {
  if (!pontos || pontos.length < 2) return null;

  for (let i = 1; i < pontos.length; i++) {
    const anterior = pontos[i - 1];
    const atual = pontos[i];

    const y1 = anterior.segundaDerivada;
    const y2 = atual.segundaDerivada;

    const houveTroca = (y1 > 0 && y2 < 0) || (y1 < 0 && y2 > 0);

    if (!houveTroca) continue;

    const volumeInterpolado =
      anterior.volume +
      ((0 - y1) * (atual.volume - anterior.volume)) / (y2 - y1);

    const peDentroDaTroca =
      !!volumePE &&
      volumePE >= Math.min(anterior.volume, atual.volume) &&
      volumePE <= Math.max(anterior.volume, atual.volume);

    return {
      volumeEstimado: peDentroDaTroca ? volumePE : volumeInterpolado,
      volumeInterpolado,
      sinalAntes: y1 > 0 ? "+" : "-",
      sinalDepois: y2 > 0 ? "+" : "-",
      anterior,
      atual,
      ajustadoParaPE: peDentroDaTroca,
    };
  }

  return null;
}

export function montarRankingIndicadoresEDTA(
  resultado: ResultadoAvaliacaoEDTA
): RankingIndicadorEDTA[] {
  const metal = resultado.metalPrincipal.metal;
  const pH = numero(resultado.entradas.pH);

  if (pH === null) return [];

  return indicadoresEdta
    .map((ind) => {
      const atendeMetal = ind.metaisRecomendados.some(
        (metalRecomendado) =>
          normalizar(metalRecomendado) === normalizar(metal)
      );

      const atendePH = pH >= ind.phMin && pH <= ind.phMax;

      const atendeMetalPreferencial =
        normalizar(ind.metalPreferencial || "") === normalizar(metal);

      let score = 0;

      if (atendeMetal) score += 45;
      if (atendePH) score += 35;
      if (atendeMetalPreferencial) score += 10;

      score += Math.min(10, Math.round((ind.prioridade || 0) / 10));

      if (!atendeMetal) score -= 30;
      if (!atendePH) score -= 25;

      const scoreFinal = Math.max(0, Math.min(100, Math.round(score)));

      let classificacao: RankingIndicadorEDTA["classificacao"];

      if (atendeMetal && atendePH) {
        classificacao = "recomendado";
      } else if (atendeMetal || atendePH) {
        classificacao = "parcial";
      } else {
        classificacao = "nao_recomendado";
      }

      let justificativa = "";

      if (atendeMetal && atendePH && atendeMetalPreferencial) {
        justificativa = `Indicador muito compatível: atende ao metal ${metal}, está na faixa de pH informada e tem esse metal como preferencial.`;
      } else if (atendeMetal && atendePH) {
        justificativa = `Indicador compatível: atende ao metal ${metal} e está dentro da faixa útil de pH informada.`;
      } else if (atendeMetal && !atendePH) {
        justificativa = `Atende ao metal ${metal}, mas o pH informado está fora da faixa usual do indicador.`;
      } else if (!atendeMetal && atendePH) {
        justificativa = `Está na faixa de pH informada, mas não é indicado como recomendação principal para ${metal}.`;
      } else {
        justificativa = `Não atende simultaneamente ao metal ${metal} e à faixa de pH informada.`;
      }

      return {
        id: ind.idIndicador,
        indicador: ind.indicador,

        metaisRecomendados: ind.metaisRecomendados.join(", "),
        metalPreferencial: ind.metalPreferencial || "-",

        pHMin: ind.phMin,
        pHMax: ind.phMax,

        corLivre: ind.corLivre || "-",
        corComplexado: ind.corComplexado || "-",

        aplicacao: ind.aplicacao || "",
        observacao: ind.observacao || "",
        referencia: ind.referencia || "",

        atendeMetal,
        atendePH,
        atendeMetalPreferencial,

        score: scoreFinal,
        classificacao,
        justificativa,
      };
    })
    .filter((item) => item.indicador)
    .sort((a, b) => {
      const ordem = {
        recomendado: 3,
        parcial: 2,
        nao_recomendado: 1,
      };

      if (ordem[b.classificacao] !== ordem[a.classificacao]) {
        return ordem[b.classificacao] - ordem[a.classificacao];
      }

      if (b.atendeMetalPreferencial !== a.atendeMetalPreferencial) {
        return (
          Number(b.atendeMetalPreferencial) -
          Number(a.atendeMetalPreferencial)
        );
      }

      return b.score - a.score;
    });
}

export function analisarIndicadorNaCurvaEDTA(
  resultado: ResultadoAvaliacaoEDTA,
  indicador: RankingIndicadorEDTA
) {
  if (!resultado.volumePE) {
    return {
      calculado: false,
      mensagem: "Volume de equivalência não calculado.",
    };
  }

  const pontoPE = calcularPontoCurvaEDTA(resultado, resultado.volumePE);

  if (!pontoPE || pontoPE.pM === null) {
    return {
      calculado: false,
      mensagem: "Não foi possível calcular o pM no ponto de equivalência.",
    };
  }

  const adequado = indicador.classificacao === "recomendado";

  return {
    calculado: true,
    indicador,
    pontoPE,
    adequado,
    mensagem: adequado
      ? `${indicador.indicador} é recomendado qualitativamente para as condições avaliadas, considerando compatibilidade com o metal e faixa útil de pH.`
      : `${indicador.indicador} não é plenamente recomendado para as condições avaliadas. A recomendação atual considera metal, faixa de pH e prioridade geral da base.`,
  };
}

export function formatarNumeroBR(valor: unknown, casas = 2): string {
  if (valor === null || valor === undefined || valor === "") {
    return "";
  }

  const convertido = Number(valor);

  if (!Number.isFinite(convertido) || Number.isNaN(convertido)) {
    return "";
  }

  return convertido.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarCientificoBR(valor: unknown): string {
  const convertido = Number(valor);

  if (!Number.isFinite(convertido) || Number.isNaN(convertido)) return "-";
  if (convertido === 0) return "0";

  return convertido.toExponential(2).replace(".", ",");
}