import { acidosPoliproticosKa } from "./acidoBasePoliproticosKa";
import { basesPolibasicasKb } from "./acidoBasePolibasicosKb";

export type SentidoReacaoAcidoBase = "protonacao" | "desprotonacao";

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
  equacaoGlobal: string;
  reacoesEtapas: string[];
  produtoFinal: string;
  observacao: string;
};

function montarIdReacao(titulante: string, tituladoId: string) {
  return `${titulante.toLowerCase()}-${tituladoId}`;
}

function gerarReacoesDesprotonacao(especies: string[]) {
  const reacoes: string[] = [];

  for (let i = 0; i < especies.length - 1; i++) {
    reacoes.push(`${especies[i]} + OH⁻ → ${especies[i + 1]} + H₂O`);
  }

  return reacoes;
}

function gerarReacoesProtonacao(especies: string[]) {
  const reacoes: string[] = [];

  for (let i = 0; i < especies.length - 1; i++) {
    reacoes.push(`${especies[i]} + H⁺ → ${especies[i + 1]}`);
  }

  return reacoes;
}

function gerarEquacaoGlobalDesprotonacao(
  especieInicial: string,
  especieFinal: string,
  numeroEquivalencias: number
) {
  if (numeroEquivalencias === 1) {
    return `${especieInicial} + OH⁻ → ${especieFinal} + H₂O`;
  }

  return `${especieInicial} + ${numeroEquivalencias}OH⁻ → ${especieFinal} + ${numeroEquivalencias}H₂O`;
}

function gerarEquacaoGlobalProtonacao(
  especieInicial: string,
  especieFinal: string,
  numeroEquivalencias: number
) {
  if (numeroEquivalencias === 1) {
    return `${especieInicial} + H⁺ → ${especieFinal}`;
  }

  return `${especieInicial} + ${numeroEquivalencias}H⁺ → ${especieFinal}`;
}

export function gerarReacoesAcidosComNaOH(): ReacaoAcidoBasePoliprotica[] {
  return acidosPoliproticosKa.map((acido) => {
    const especieInicial = acido.especies[0];
    const especieFinal = acido.especies[acido.especies.length - 1];

    return {
      id: montarIdReacao("naoh", acido.id),
      titulante: "NaOH",
      titulado: acido.nome,
      formulaTitulante: "NaOH",
      formulaTitulado: acido.formula,
      tipoTitulante: "Base forte",
      tipoTitulado: acido.tipo,
      sentido: "desprotonacao",
      numeroEquivalencias: acido.numeroProtonsIonizaveis,
      equacaoGlobal: gerarEquacaoGlobalDesprotonacao(
        especieInicial,
        especieFinal,
        acido.numeroProtonsIonizaveis
      ),
      reacoesEtapas: gerarReacoesDesprotonacao(acido.especies),
      produtoFinal: especieFinal,
      observacao: "Neutralização completa",
    };
  });
}

export function gerarReacoesBasesComHCl(): ReacaoAcidoBasePoliprotica[] {
  return basesPolibasicasKb.map((base) => {
    const especieInicial = base.especies[0];
    const especieFinal = base.especies[base.especies.length - 1];

    return {
      id: montarIdReacao("hcl", base.id),
      titulante: "HCl",
      titulado: base.nome,
      formulaTitulante: "HCl",
      formulaTitulado: base.formula,
      tipoTitulante: "Ácido forte",
      tipoTitulado: base.tipo,
      sentido: "protonacao",
      numeroEquivalencias: base.numeroSitiosBasicos,
      equacaoGlobal: gerarEquacaoGlobalProtonacao(
        especieInicial,
        especieFinal,
        base.numeroSitiosBasicos
      ),
      reacoesEtapas: gerarReacoesProtonacao(base.especies),
      produtoFinal: especieFinal,
      observacao: "Protonação completa",
    };
  });
}

export const reacoesAcidoBasePoliproticas: ReacaoAcidoBasePoliprotica[] = [
  ...gerarReacoesBasesComHCl(),
  ...gerarReacoesAcidosComNaOH(),
];

export function buscarReacaoAcidoBasePoliprotica(
  titulante: string,
  titulado: string
) {
  return reacoesAcidoBasePoliproticas.find(
    (reacao) =>
      reacao.titulante.toLowerCase() === titulante.toLowerCase() &&
      reacao.titulado.toLowerCase() === titulado.toLowerCase()
  );
}