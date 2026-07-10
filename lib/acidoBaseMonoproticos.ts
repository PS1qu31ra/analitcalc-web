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
  
    if (resultado.tipoSistema === "acido-fraco-com-base-forte") {
      const ka = resultado.titulado.constante;
      const pka = resultado.titulado.pValor;
  
      if (volumeAdicionado === 0) {
        const h = calcularConcentracaoHAcidoFraco(ka, concTitulado);
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoH(h),
          regiao: "Início",
          explicacao:
            "No início, há apenas ácido fraco em solução. O pH é calculado pelo equilíbrio de dissociação ácida.",
        };
      }
  
      if (antesPE) {
        const molHA = molTituladoInicial - molTitulanteAdicionado;
        const molA = molTitulanteAdicionado;
  
        if (molA <= 0 || molHA <= 0) {
          const concentracaoHA = molHA / volumeTotalL;
          const h = calcularConcentracaoHAcidoFraco(ka, concentracaoHA);
  
          return {
            volume: volumeAdicionado,
            ph: phPorConcentracaoH(h),
            regiao: "Antes do PE",
            explicacao:
              "Ainda predomina ácido fraco não neutralizado. O pH é calculado pelo equilíbrio ácido.",
          };
        }
  
        const ph = pka + Math.log10(molA / molHA);
  
        return {
          volume: volumeAdicionado,
          ph,
          regiao: "Região tampão",
          explicacao:
            "Antes do PE, coexistem ácido fraco HA e sua base conjugada A⁻. O pH é calculado pela equação de Henderson-Hasselbalch.",
        };
      }
  
      if (noPE) {
        const concentracaoA = molTituladoInicial / volumeTotalL;
        const kb = KW_25C / ka;
        const oh = calcularConcentracaoOHBaseFraca(kb, concentracaoA);
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoOH(oh),
          regiao: "Ponto de equivalência",
          explicacao:
            "No PE, todo ácido fraco foi convertido em base conjugada A⁻. O pH fica básico devido à hidrólise dessa base conjugada.",
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
            "Após o PE, a base forte adicionada está em excesso. O pH é dominado pela concentração de OH⁻ excedente.",
        };
      }
    }
  
    if (resultado.tipoSistema === "base-fraca-com-acido-forte") {
      const kb = resultado.titulado.constante;
      const pkb = resultado.titulado.pValor;
  
      if (volumeAdicionado === 0) {
        const oh = calcularConcentracaoOHBaseFraca(kb, concTitulado);
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoOH(oh),
          regiao: "Início",
          explicacao:
            "No início, há apenas base fraca em solução. O pH é calculado pelo equilíbrio de basicidade.",
        };
      }
  
      if (antesPE) {
        const molB = molTituladoInicial - molTitulanteAdicionado;
        const molBH = molTitulanteAdicionado;
  
        if (molB <= 0 || molBH <= 0) {
          const concentracaoB = molB / volumeTotalL;
          const oh = calcularConcentracaoOHBaseFraca(kb, concentracaoB);
  
          return {
            volume: volumeAdicionado,
            ph: phPorConcentracaoOH(oh),
            regiao: "Antes do PE",
            explicacao:
              "Ainda predomina base fraca não neutralizada. O pH é calculado pelo equilíbrio básico.",
          };
        }
  
        const poh = pkb + Math.log10(molBH / molB);
        const ph = 14 - poh;
  
        return {
          volume: volumeAdicionado,
          ph,
          regiao: "Região tampão",
          explicacao:
            "Antes do PE, coexistem base fraca B e seu ácido conjugado BH⁺. O pH é calculado pela forma básica da equação de Henderson-Hasselbalch.",
        };
      }
  
      if (noPE) {
        const concentracaoBH = molTituladoInicial / volumeTotalL;
        const ka = KW_25C / kb;
        const h = calcularConcentracaoHAcidoFraco(ka, concentracaoBH);
  
        return {
          volume: volumeAdicionado,
          ph: phPorConcentracaoH(h),
          regiao: "Ponto de equivalência",
          explicacao:
            "No PE, toda base fraca foi convertida em ácido conjugado BH⁺. O pH fica ácido devido à hidrólise desse ácido conjugado.",
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
            "Após o PE, o ácido forte adicionado está em excesso. O pH é dominado pela concentração de H⁺ excedente.",
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
    resultado: ResultadoSistemaMonoprotico
  ): CurvaAcidoBaseMonoprotica {
    const volumeMaximo = Math.max(
      resultado.entradas.volBureta,
      resultado.volumePE * 2
    );
  
    const passo = Math.max(volumeMaximo / 400, 0.05);
  
    const pontos: PontoCurvaAcidoBaseMono[] = [];
  
    for (let volume = 0; volume <= volumeMaximo; volume += passo) {
      pontos.push(calcularPhPorVolumeMonoprotico(resultado, volume));
    }
  
    const jaTemPE = pontos.some(
      (ponto) => Math.abs(ponto.volume - resultado.volumePE) <= passo / 2
    );
  
    if (!jaTemPE) {
      pontos.push(calcularPhPorVolumeMonoprotico(resultado, resultado.volumePE));
    }
  
    pontos.sort((a, b) => a.volume - b.volume);
  
    return {
      pontos,
      passo,
      volumeMaximo,
    };
  }