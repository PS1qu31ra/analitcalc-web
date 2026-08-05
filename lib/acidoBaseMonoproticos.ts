import {
    buscarAcidoMonoPorFormula,
    type AcidoMonoAcidoBase,
  } from "./data/acidosMonoAcidoBase";
  
  import {
    buscarBaseMonoPorFormula,
    type BaseMonoAcidoBase,
  } from "./data/basesMonoAcidoBase";
  
  import {
    buscarReacaoAcidoBaseMono,
    type ReacaoAcidoBaseMono,
  } from "./data/reacoesAcidoBaseMono";
  
  const KW_25C = 1e-14;

  const LIMITE_MINIMO_H = 1e-14;
const LIMITE_MAXIMO_H = 1;

function resolverConcentracaoHPorBissecao(
  funcaoResiduo: (
    concentracaoH: number
  ) => number
) {
  let logHMinimo =
    Math.log10(
      LIMITE_MINIMO_H
    );

  let logHMaximo =
    Math.log10(
      LIMITE_MAXIMO_H
    );

  let residuoMinimo =
    funcaoResiduo(
      10 ** logHMinimo
    );

  let residuoMaximo =
    funcaoResiduo(
      10 ** logHMaximo
    );

  if (
    !Number.isFinite(
      residuoMinimo
    ) ||
    !Number.isFinite(
      residuoMaximo
    )
  ) {
    return NaN;
  }

  /*
   * Em condições químicas usuais, a raiz
   * estará entre 10⁻¹⁴ e 1 mol L⁻¹.
   */
  if (
    residuoMinimo === 0
  ) {
    return (
      10 ** logHMinimo
    );
  }

  if (
    residuoMaximo === 0
  ) {
    return (
      10 ** logHMaximo
    );
  }

  /*
   * Proteção caso os limites não envolvam
   * uma mudança de sinal devido a dados
   * extremos ou inconsistentes.
   */
  if (
    residuoMinimo *
      residuoMaximo >
    0
  ) {
    return NaN;
  }

  for (
    let iteracao = 0;
    iteracao < 160;
    iteracao += 1
  ) {
    const logHMeio =
      (
        logHMinimo +
        logHMaximo
      ) /
      2;

    const concentracaoHMeio =
      10 ** logHMeio;

    const residuoMeio =
      funcaoResiduo(
        concentracaoHMeio
      );

    if (
      !Number.isFinite(
        residuoMeio
      )
    ) {
      return NaN;
    }

    if (
      Math.abs(
        residuoMeio
      ) <
      1e-16
    ) {
      return concentracaoHMeio;
    }

    if (
      residuoMinimo *
        residuoMeio <=
      0
    ) {
      logHMaximo =
        logHMeio;

      residuoMaximo =
        residuoMeio;
    } else {
      logHMinimo =
        logHMeio;

      residuoMinimo =
        residuoMeio;
    }
  }

  return (
    10 **
    (
      (
        logHMinimo +
        logHMaximo
      ) /
      2
    )
  );
}

function calcularHAcidoFracoComBaseForte({
  ka,
  molAcidoInicial,
  molBaseAdicionada,
  volumeTotalL,
}: {
  ka: number;
  molAcidoInicial: number;
  molBaseAdicionada: number;
  volumeTotalL: number;
}) {
  if (
    ka <= 0 ||
    molAcidoInicial <= 0 ||
    volumeTotalL <= 0
  ) {
    return NaN;
  }

  const concentracaoTotalAcido =
    molAcidoInicial /
    volumeTotalL;

  /*
   * A base forte adiciona seu cátion
   * espectador ao meio. Para NaOH, essa
   * concentração corresponde a [Na⁺].
   */
  const concentracaoCationForte =
    molBaseAdicionada /
    volumeTotalL;

  return resolverConcentracaoHPorBissecao(
    (h) => {
      const oh =
        KW_25C / h;

      /*
       * Distribuição do sistema HA/A⁻:
       *
       * [A⁻] =
       * Ctotal · Ka / (Ka + [H⁺])
       */
      const concentracaoA =
        (
          concentracaoTotalAcido *
          ka
        ) /
        (
          ka + h
        );

      /*
       * Balanço de carga:
       *
       * [H⁺] + [Na⁺]
       * =
       * [A⁻] + [OH⁻]
       */
      return (
        h +
        concentracaoCationForte -
        concentracaoA -
        oh
      );
    }
  );
}

function calcularHBaseFracaComAcidoForte({
  kb,
  molBaseInicial,
  molAcidoAdicionado,
  volumeTotalL,
}: {
  kb: number;
  molBaseInicial: number;
  molAcidoAdicionado: number;
  volumeTotalL: number;
}) {
  if (
    kb <= 0 ||
    molBaseInicial <= 0 ||
    volumeTotalL <= 0
  ) {
    return NaN;
  }

  const kaConjugado =
    KW_25C / kb;

  const concentracaoTotalBase =
    molBaseInicial /
    volumeTotalL;

  /*
   * O ácido forte adiciona seu ânion
   * espectador ao meio. Para HCl, essa
   * concentração corresponde a [Cl⁻].
   */
  const concentracaoAnionForte =
    molAcidoAdicionado /
    volumeTotalL;

  return resolverConcentracaoHPorBissecao(
    (h) => {
      const oh =
        KW_25C / h;

      /*
       * Distribuição do sistema BH⁺/B:
       *
       * [BH⁺] =
       * Ctotal · [H⁺] /
       * (Ka + [H⁺])
       */
      const concentracaoBH =
        (
          concentracaoTotalBase *
          h
        ) /
        (
          kaConjugado + h
        );

      /*
       * Balanço de carga:
       *
       * [H⁺] + [BH⁺]
       * =
       * [Cl⁻] + [OH⁻]
       */
      return (
        h +
        concentracaoBH -
        concentracaoAnionForte -
        oh
      );
    }
  );
}
  
  export type TipoSistemaMonoprotico =
    | "acido-forte-com-base-forte"
    | "acido-fraco-com-base-forte"
    | "base-forte-com-acido-forte"
    | "base-fraca-com-acido-forte";
  
  export type EntradaSistemaMonoprotico = {
    titulante: string;
    titulado: string;
    concTitulante: number;
    concTitulado: number;
    volTitulado: number;
    volBureta: number;
  };
  
  export type EspecieMonoprotica = {
    nome: string;
    formula: string;
    classe: "ácido" | "base";
    forca: "forte" | "fraco" | "superforte" | "muito-fraco";
    pValor: number;
    constante: number;
  };
  
  export type ResultadoSistemaMonoprotico = {
    entradas: EntradaSistemaMonoprotico;
    titulante: EspecieMonoprotica;
    titulado: EspecieMonoprotica;
    tipoSistema: TipoSistemaMonoprotico;
    reacao: ReacaoAcidoBaseMono | null;
    volumePE: number;
    concentracaoNoPE: number;
    resumo: string;
  };
  
  export type PontoCurvaAcidoBaseMono = {
    volume: number;
    ph: number | null;
    regiao: string;
    explicacao: string;
  };
  
  export type CurvaAcidoBaseMonoprotica = {
    pontos: PontoCurvaAcidoBaseMono[];
    passo: number;
    volumeMaximo: number;
  };
  
  export function formatarNumeroBR(valor: number | null | undefined, casas = 2) {
    if (valor === null || valor === undefined || !Number.isFinite(valor)) {
      return "-";
    }
  
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    });
  }
  
  function calcularConcentracaoHAcidoFraco(ka: number, concentracao: number) {
    const h =
      (-ka + Math.sqrt(ka * ka + 4 * ka * concentracao)) / 2;
  
    return Math.max(h, 1e-14);
  }
  
  function calcularConcentracaoOHBaseFraca(kb: number, concentracao: number) {
    const oh =
      (-kb + Math.sqrt(kb * kb + 4 * kb * concentracao)) / 2;
  
    return Math.max(oh, 1e-14);
  }
  
  function phPorConcentracaoH(h: number) {
    const valor = Math.max(h, 1e-14);
    return -Math.log10(valor);
  }
  
  function phPorConcentracaoOH(oh: number) {
    const valor = Math.max(oh, 1e-14);
    const poh = -Math.log10(valor);
  
    return 14 - poh;
  }
  
  function criarEspecieAcida(acido: AcidoMonoAcidoBase): EspecieMonoprotica {
    return {
      nome: acido.nome,
      formula: acido.formula,
      classe: "ácido",
      forca: acido.tipo,
      pValor: acido.pKa25C,
      constante: acido.ka25C,
    };
  }
  
  function criarEspecieBasica(base: BaseMonoAcidoBase): EspecieMonoprotica {
    return {
      nome: base.nome,
      formula: base.formula,
      classe: "base",
      forca: base.tipo === "fraca" ? "fraco" : "forte",
      pValor: base.pKb25C,
      constante: base.kb25C,
    };
  }
  
  function identificarTipoSistema(
    titulante: EspecieMonoprotica,
    titulado: EspecieMonoprotica
  ): TipoSistemaMonoprotico {
    if (titulado.classe === "ácido" && titulante.classe === "base") {
      if (titulado.forca === "forte" || titulado.forca === "superforte") {
        return "acido-forte-com-base-forte";
      }
  
      return "acido-fraco-com-base-forte";
    }
  
    if (titulado.classe === "base" && titulante.classe === "ácido") {
      if (titulado.forca === "forte") {
        return "base-forte-com-acido-forte";
      }
  
      return "base-fraca-com-acido-forte";
    }
  
    throw new Error(
      "Sistema inválido. Use ácido titulado com base titulante ou base titulada com ácido titulante."
    );
  }
  
  function montarEspeciePorFormula(formula: string) {
    const acido = buscarAcidoMonoPorFormula(formula);
  
    if (acido) {
      return criarEspecieAcida(acido);
    }
  
    const base = buscarBaseMonoPorFormula(formula);
  
    if (base) {
      return criarEspecieBasica(base);
    }
  
    return null;
  }
  
  export function avaliarSistemaMonoprotico(
    entradas: EntradaSistemaMonoprotico
  ): ResultadoSistemaMonoprotico {
    const titulante = montarEspeciePorFormula(entradas.titulante);
    const titulado = montarEspeciePorFormula(entradas.titulado);
  
    if (!titulante || !titulado) {
      throw new Error(
        "Não foi possível localizar o titulante ou o titulado na base de dados monoprótica."
      );
    }
  
    const tipoSistema = identificarTipoSistema(titulante, titulado);
  
    const molTitulado = entradas.concTitulado * (entradas.volTitulado / 1000);
    const volumePE = (molTitulado / entradas.concTitulante) * 1000;
  
    const volumeTotalPE = entradas.volTitulado + volumePE;
    const concentracaoNoPE = molTitulado / (volumeTotalPE / 1000);
  
    const reacao =
  buscarReacaoAcidoBaseMono(entradas.titulante, entradas.titulado) ?? null;
  
    const resumo =
      tipoSistema === "acido-forte-com-base-forte"
        ? "Titulação de ácido forte com base forte. O pH antes do PE é controlado pelo excesso de H⁺; no PE é próximo de 7; após o PE é controlado pelo excesso de OH⁻."
        : tipoSistema === "acido-fraco-com-base-forte"
          ? "Titulação de ácido fraco com base forte. Antes do PE há região tampão HA/A⁻; no PE predomina a base conjugada A⁻; após o PE o pH é controlado pelo excesso de OH⁻."
          : tipoSistema === "base-forte-com-acido-forte"
            ? "Titulação de base forte com ácido forte. O pH antes do PE é controlado pelo excesso de OH⁻; no PE é próximo de 7; após o PE é controlado pelo excesso de H⁺."
            : "Titulação de base fraca com ácido forte. Antes do PE há região tampão B/BH⁺; no PE predomina o ácido conjugado BH⁺; após o PE o pH é controlado pelo excesso de H⁺.";
  
    return {
      entradas,
      titulante,
      titulado,
      tipoSistema,
      reacao,
      volumePE,
      concentracaoNoPE,
      resumo,
    };
  }
  
  export function calcularPhPorVolumeMonoprotico(
    resultado: ResultadoSistemaMonoprotico,
    volumeAdicionado: number
  ): PontoCurvaAcidoBaseMono {
    const {
      concTitulante,
      concTitulado,
      volTitulado,
    } = resultado.entradas;
  
    const volumeTotal = volTitulado + volumeAdicionado;
  
    if (volumeTotal <= 0) {
      return {
        volume: volumeAdicionado,
        ph: null,
        regiao: "Volume inválido",
        explicacao: "O volume total da solução precisa ser maior que zero.",
      };
    }
  
    const volumeTotalL = volumeTotal / 1000;
    const molTituladoInicial = concTitulado * (volTitulado / 1000);
    const molTitulanteAdicionado = concTitulante * (volumeAdicionado / 1000);
  
    const tolerancia = Math.max(molTituladoInicial * 1e-8, 1e-12);
  
    const antesPE = molTitulanteAdicionado < molTituladoInicial - tolerancia;
    const noPE =
      Math.abs(molTitulanteAdicionado - molTituladoInicial) <= tolerancia;
    const aposPE = molTitulanteAdicionado > molTituladoInicial + tolerancia;
  
    if (resultado.tipoSistema === "acido-forte-com-base-forte") {
      if (antesPE) {
        const excessoH = molTituladoInicial - molTitulanteAdicionado;
        const h = excessoH / volumeTotalL;
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoH(h),
          regiao: "Antes do PE",
          explicacao:
            "Antes do ponto de equivalência, há ácido forte em excesso. O pH é calculado diretamente pela concentração de H⁺ restante.",
        };
      }
  
      if (noPE) {
        return {
          volume: volumeAdicionado,
          ph: 7,
          regiao: "Ponto de equivalência",
          explicacao:
            "No ponto de equivalência de ácido forte com base forte, forma-se sal neutro e água. O pH é aproximadamente 7 a 25 °C.",
        };
      }
  
      if (aposPE) {
        const excessoOH = molTitulanteAdicionado - molTituladoInicial;
        const oh = excessoOH / volumeTotalL;
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoOH(oh),
          regiao: "Após o PE",
          explicacao:
            "Após o ponto de equivalência, há base forte em excesso. O pH é calculado pelo OH⁻ excedente.",
        };
      }
    }
  
    if (resultado.tipoSistema === "base-forte-com-acido-forte") {
      if (antesPE) {
        const excessoOH = molTituladoInicial - molTitulanteAdicionado;
        const oh = excessoOH / volumeTotalL;
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoOH(oh),
          regiao: "Antes do PE",
          explicacao:
            "Antes do ponto de equivalência, há base forte em excesso. O pH é calculado diretamente pela concentração de OH⁻ restante.",
        };
      }
  
      if (noPE) {
        return {
          volume: volumeAdicionado,
          ph: 7,
          regiao: "Ponto de equivalência",
          explicacao:
            "No ponto de equivalência de base forte com ácido forte, forma-se sal neutro e água. O pH é aproximadamente 7 a 25 °C.",
        };
      }
  
      if (aposPE) {
        const excessoH = molTitulanteAdicionado - molTituladoInicial;
        const h = excessoH / volumeTotalL;
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoH(h),
          regiao: "Após o PE",
          explicacao:
            "Após o ponto de equivalência, há ácido forte em excesso. O pH é calculado pelo H⁺ excedente.",
        };
      }
    }
  
    if (
      resultado.tipoSistema ===
      "acido-fraco-com-base-forte"
    ) {
      const ka =
        resultado.titulado
          .constante;
    
      const h =
        calcularHAcidoFracoComBaseForte({
          ka,
          molAcidoInicial:
            molTituladoInicial,
          molBaseAdicionada:
            molTitulanteAdicionado,
          volumeTotalL,
        });
    
      if (
        !Number.isFinite(h) ||
        h <= 0
      ) {
        return {
          volume:
            volumeAdicionado,
          ph: null,
          regiao:
            "Não calculado",
          explicacao:
            "Não foi possível resolver o equilíbrio do sistema ácido fraco/base forte para este volume.",
        };
      }
    
      const ph =
        phPorConcentracaoH(
          h
        );
    
      if (
        volumeAdicionado === 0
      ) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao: "Início",
          explicacao:
            "No início, há apenas ácido fraco em solução. O pH foi obtido pela resolução simultânea do equilíbrio ácido, do balanço de massa e do balanço de carga.",
        };
      }
    
      if (antesPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Região tampão",
          explicacao:
            "Antes do ponto de equivalência, coexistem o ácido fraco HA e sua base conjugada A⁻. O pH foi calculado por balanço de massa, balanço de carga e equilíbrio químico.",
        };
      }
    
      if (noPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Ponto de equivalência",
          explicacao:
            "No ponto de equivalência, o ácido fraco foi convertido predominantemente em sua base conjugada A⁻. O pH básico resulta da hidrólise, calculada pelo equilíbrio completo do sistema.",
        };
      }
    
      if (aposPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Após o PE",
          explicacao:
            "Após o ponto de equivalência, há base forte em excesso. O pH foi calculado pelo balanço de carga completo, considerando também o sistema conjugado HA/A⁻.",
        };
      }
    }
  
    if (
      resultado.tipoSistema ===
      "base-fraca-com-acido-forte"
    ) {
      const kb =
        resultado.titulado
          .constante;
    
      const h =
        calcularHBaseFracaComAcidoForte({
          kb,
          molBaseInicial:
            molTituladoInicial,
          molAcidoAdicionado:
            molTitulanteAdicionado,
          volumeTotalL,
        });
    
      if (
        !Number.isFinite(h) ||
        h <= 0
      ) {
        return {
          volume:
            volumeAdicionado,
          ph: null,
          regiao:
            "Não calculado",
          explicacao:
            "Não foi possível resolver o equilíbrio do sistema base fraca/ácido forte para este volume.",
        };
      }
    
      const ph =
        phPorConcentracaoH(
          h
        );
    
      if (
        volumeAdicionado === 0
      ) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao: "Início",
          explicacao:
            "No início, há apenas base fraca em solução. O pH foi obtido pela resolução simultânea do equilíbrio básico, do balanço de massa e do balanço de carga.",
        };
      }
    
      if (antesPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Região tampão",
          explicacao:
            "Antes do ponto de equivalência, coexistem a base fraca B e seu ácido conjugado BH⁺. O pH foi calculado por balanço de massa, balanço de carga e equilíbrio químico.",
        };
      }
    
      if (noPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Ponto de equivalência",
          explicacao:
            "No ponto de equivalência, a base fraca foi convertida predominantemente em seu ácido conjugado BH⁺. O pH ácido resulta da hidrólise, calculada pelo equilíbrio completo do sistema.",
        };
      }
    
      if (aposPE) {
        return {
          volume:
            volumeAdicionado,
          ph,
          regiao:
            "Após o PE",
          explicacao:
            "Após o ponto de equivalência, há ácido forte em excesso. O pH foi calculado pelo balanço de carga completo, considerando também o sistema conjugado B/BH⁺.",
        };
      }
    }
  
    return {
      volume: volumeAdicionado,
      ph: null,
      regiao: "Não calculado",
      explicacao: "Não foi possível calcular o pH para este ponto.",
    };
  }
  
  export function gerarCurvaMonoprotica(
    resultado:
      ResultadoSistemaMonoprotico
  ): CurvaAcidoBaseMonoprotica {
    const volumeMaximo =
      Math.max(
        resultado.entradas
          .volBureta,
        resultado.volumePE * 2
      );
  
    const passo =
      Math.max(
        volumeMaximo / 400,
        0.05
      );
  
    const quantidadePassos =
      Math.ceil(
        volumeMaximo /
        passo
      );
  
    const pontos:
      PontoCurvaAcidoBaseMono[] =
      [];
  
    for (
      let indice = 0;
      indice <=
        quantidadePassos;
      indice += 1
    ) {
      const volume =
        Math.min(
          indice * passo,
          volumeMaximo
        );
  
      pontos.push(
        calcularPhPorVolumeMonoprotico(
          resultado,
          volume
        )
      );
    }
  
    /*
     * Insere o PE exato, porque ele pode não
     * coincidir com a malha regular da curva.
     */
    const jaTemPE =
      pontos.some(
        (ponto) =>
          Math.abs(
            ponto.volume -
              resultado.volumePE
          ) <
          1e-9
      );
  
    if (!jaTemPE) {
      pontos.push(
        calcularPhPorVolumeMonoprotico(
          resultado,
          resultado.volumePE
        )
      );
    }
  
    /*
     * Remove eventuais volumes repetidos
     * produzidos pelo limite final e pelo PE.
     */
    const pontosOrdenados =
      pontos.sort(
        (pontoA, pontoB) =>
          pontoA.volume -
          pontoB.volume
      );
  
    const pontosUnicos =
      pontosOrdenados.filter(
        (
          ponto,
          indice,
          array
        ) => {
          if (indice === 0) {
            return true;
          }
  
          return (
            Math.abs(
              ponto.volume -
                array[indice - 1]
                  .volume
            ) >
            1e-9
          );
        }
      );
  
    return {
      pontos:
        pontosUnicos,
      passo,
      volumeMaximo,
    };
  }