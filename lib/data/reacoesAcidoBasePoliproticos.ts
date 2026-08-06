import { acidosPoliproticosKa } from "./acidoBasePoliproticosKa";
import { basesPolibasicasKb } from "./acidoBasePolibasicosKb";

export type SentidoReacaoAcidoBase =
  | "protonacao"
  | "desprotonacao";

export type ReacaoAcidoBasePoliprotica = {
  id: string;
  titulante: string;
  titulado: string;
  formulaTitulante: string;
  formulaTitulado: string;
  tipoTitulante: string;
  tipoTitulado: string;
  sentido: SentidoReacaoAcidoBase;
  numeroEquivalencias: number;

  /**
   * Representação global do equilíbrio de neutralização.
   * Utiliza seta dupla para manter explícito o caráter de equilíbrio
   * das espécies ácido-base envolvidas.
   */
  equacaoGlobal: string;

  /**
   * Equilíbrios sucessivos de dissociação ou protonação.
   * Utilizam seta dupla.
   */
  reacoesEtapas: string[];

  produtoFinal: string;
  observacao: string;
};

function montarIdReacao(titulante: string, tituladoId: string) {
  return `${titulante.toLowerCase()}-${tituladoId}`;
}

/**
 * Gera os equilíbrios sucessivos de dissociação de um ácido
 * poliprótico:
 *
 * HnA ⇌ H⁺ + H(n-1)A⁻
 * H(n-1)A⁻ ⇌ H⁺ + H(n-2)A²⁻
 */
function gerarEquilibriosAcido(especies: string[]) {
  const reacoes: string[] = [];

  for (let i = 0; i < especies.length - 1; i++) {
    reacoes.push(
      `${especies[i]} ⇌ H⁺ + ${especies[i + 1]}`
    );
  }

  return reacoes;
}

/**
 * Gera os equilíbrios sucessivos de protonação de uma base
 * polibásica.
 *
 * O vetor de espécies deve estar organizado da forma menos
 * protonada para a mais protonada:
 *
 * B + H⁺ ⇌ BH⁺
 * BH⁺ + H⁺ ⇌ BH₂²⁺
 */
function gerarEquilibriosBase(especies: string[]) {
  const reacoes: string[] = [];

  for (let i = 0; i < especies.length - 1; i++) {
    reacoes.push(
      `${especies[i]} + H⁺ ⇌ ${especies[i + 1]}`
    );
  }

  return reacoes;
}

/**
 * Gera a representação global do equilíbrio de desprotonação
 * de um ácido poliprótico por OH⁻.
 */
function gerarEquacaoGlobalDesprotonacao(
  especieInicial: string,
  especieFinal: string,
  numeroEquivalencias: number
) {
  if (numeroEquivalencias === 1) {
    return `${especieInicial} + OH⁻ ⇌ ${especieFinal} + H₂O`;
  }

  return `${especieInicial} + ${numeroEquivalencias}OH⁻ ⇌ ${especieFinal} + ${numeroEquivalencias}H₂O`;
}

/**
 * Gera a representação global do equilíbrio de protonação
 * de uma base polibásica por H⁺.
 */
function gerarEquacaoGlobalProtonacao(
  especieInicial: string,
  especieFinal: string,
  numeroEquivalencias: number
) {
  if (numeroEquivalencias === 1) {
    return `${especieInicial} + H⁺ ⇌ ${especieFinal}`;
  }

  return `${especieInicial} + ${numeroEquivalencias}H⁺ ⇌ ${especieFinal}`;
}

export function gerarReacoesAcidosComNaOH():
  ReacaoAcidoBasePoliprotica[] {
  return acidosPoliproticosKa.map((acido) => {
    const especieInicial = acido.especies[0];

    const especieFinal =
      acido.especies[acido.especies.length - 1];

    return {
      id: montarIdReacao("naoh", acido.id),

      titulante: "NaOH",
      titulado: acido.nome,

      formulaTitulante: "NaOH",
      formulaTitulado: acido.formula,

      tipoTitulante: "Base forte",
      tipoTitulado: acido.tipo,

      sentido: "desprotonacao",

      numeroEquivalencias:
        acido.numeroProtonsIonizaveis,

      equacaoGlobal:
        gerarEquacaoGlobalDesprotonacao(
          especieInicial,
          especieFinal,
          acido.numeroProtonsIonizaveis
        ),

      reacoesEtapas:
        gerarEquilibriosAcido(acido.especies),

      produtoFinal: especieFinal,

      observacao:
        "A equação global representa o equilíbrio global de neutralização do ácido pelo titulante. As etapas apresentam os equilíbrios sucessivos de dissociação ácida.",
    };
  });
}

export function gerarReacoesBasesComHCl():
  ReacaoAcidoBasePoliprotica[] {
  return basesPolibasicasKb.map((base) => {
    const especieInicial = base.especies[0];

    const especieFinal =
      base.especies[base.especies.length - 1];

    return {
      id: montarIdReacao("hcl", base.id),

      titulante: "HCl",
      titulado: base.nome,

      formulaTitulante: "HCl",
      formulaTitulado: base.formula,

      tipoTitulante: "Ácido forte",
      tipoTitulado: base.tipo,

      sentido: "protonacao",

      numeroEquivalencias:
        base.numeroSitiosBasicos,

      equacaoGlobal:
        gerarEquacaoGlobalProtonacao(
          especieInicial,
          especieFinal,
          base.numeroSitiosBasicos
        ),

      reacoesEtapas:
        gerarEquilibriosBase(base.especies),

      produtoFinal: especieFinal,

      observacao:
        "A equação global representa o equilíbrio global de protonação da base pelo titulante. As etapas apresentam os equilíbrios sucessivos entre as formas protonadas da base.",
    };
  });
}

export const reacoesAcidoBasePoliproticas:
  ReacaoAcidoBasePoliprotica[] = [
    ...gerarReacoesBasesComHCl(),
    ...gerarReacoesAcidosComNaOH(),
  ];

export function buscarReacaoAcidoBasePoliprotica(
  titulante: string,
  titulado: string
) {
  return reacoesAcidoBasePoliproticas.find(
    (reacao) =>
      reacao.titulante.toLowerCase() ===
        titulante.toLowerCase() &&
      reacao.titulado.toLowerCase() ===
        titulado.toLowerCase()
  );
}