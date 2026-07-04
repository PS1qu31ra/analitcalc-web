export type FaixaPhBeta = number | "Sem restrição";

export type BetaComplexante = {
  idBeta: string;
  idMetal: string;
  metal: string;
  ox: number;
  idComplexante: string;
  complexante: string;
  formulaComplexante: string;
  beta1: number | null;
  beta2: number | null;
  beta3: number | null;
  beta4: number | null;
  beta5: number | null;
  beta6: number | null;
  phMin: FaixaPhBeta;
  phMax: FaixaPhBeta;
  observacao: string;
  referencia: string;
};

export const betasComplexantes: BetaComplexante[] = [
  {
    idBeta: "BETA_AG_NH3",
    idMetal: "AG",
    metal: "Ag+",
    ox: 1,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 2.04e3,
    beta2: 1.66e7,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Silver-Ammonia System",
  },
  {
    idBeta: "BETA_CO_NH3",
    idMetal: "CO",
    metal: "Co2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 9.77e1,
    beta2: 3.16e3,
    beta3: 2.69e4,
    beta4: 1.17e5,
    beta5: 1.35e5,
    beta6: 2.45e4,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Cobalt-Ammonia System",
  },
  {
    idBeta: "BETA_NI_NH3",
    idMetal: "NI",
    metal: "Ni2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 5.25e2,
    beta2: 7.76e4,
    beta3: 3.55e6,
    beta4: 4.68e7,
    beta5: 2.19e8,
    beta6: 2.04e8,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Nickel-Ammonia System",
  },
  {
    idBeta: "BETA_CU_NH3",
    idMetal: "CU",
    metal: "Cu2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 1.1e4,
    beta2: 2.95e7,
    beta3: 1.86e10,
    beta4: 5.62e11,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Copper-Ammonia System",
  },
  {
    idBeta: "BETA_ZN_NH3",
    idMetal: "ZN",
    metal: "Zn2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 1.62e2,
    beta2: 3.16e4,
    beta3: 7.24e6,
    beta4: 7.76e8,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Zinc-Ammonia System",
  },
  {
    idBeta: "BETA_CD_NH3",
    idMetal: "CD",
    metal: "Cd2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 3.55e2,
    beta2: 3.63e4,
    beta3: 7.94e5,
    beta4: 5.5e6,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 11,
    observacao: "Convertido de logβn para βn",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Cadmium-Ammonia System",
  },
  {
    idBeta: "BETA_CU_EN",
    idMetal: "CU",
    metal: "Cu2+",
    ox: 2,
    idComplexante: "COMP_EN",
    complexante: "Etilenodiamina",
    formulaComplexante: "en",
    beta1: 1.0e10,
    beta2: 1.0e19,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 7,
    phMax: 12,
    observacao: "Complexos extremamente estáveis",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.2 - Copper-Ethylenediamine System",
  },
  {
    idBeta: "BETA_NI_EN",
    idMetal: "NI",
    metal: "Ni2+",
    ox: 2,
    idComplexante: "COMP_EN",
    complexante: "Etilenodiamina",
    formulaComplexante: "en",
    beta1: 7.9e7,
    beta2: 1.26e14,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 7,
    phMax: 12,
    observacao: "Complexação forte de níquel",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.2 - Nickel-Ethylenediamine System",
  },
  {
    idBeta: "BETA_ZN_EN",
    idMetal: "ZN",
    metal: "Zn2+",
    ox: 2,
    idComplexante: "COMP_EN",
    complexante: "Etilenodiamina",
    formulaComplexante: "en",
    beta1: 1.58e6,
    beta2: 3.98e11,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 7,
    phMax: 12,
    observacao: "Complexação estável",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.2 - Zinc-Ethylenediamine System",
  },
  {
    idBeta: "BETA_CO_EN",
    idMetal: "CO",
    metal: "Co2+",
    ox: 2,
    idComplexante: "COMP_EN",
    complexante: "Etilenodiamina",
    formulaComplexante: "en",
    beta1: 1.0e6,
    beta2: 2.5e11,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 7,
    phMax: 12,
    observacao: "Complexação estável",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.2 - Cobalt-Ethylenediamine System",
  },
  {
    idBeta: "BETA_FE3_CIT",
    idMetal: "FE3",
    metal: "Fe3+",
    ox: 3,
    idComplexante: "COMP_CIT",
    complexante: "Citrato",
    formulaComplexante: "C6H5O7^3-",
    beta1: 1.0e11,
    beta2: null,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 3,
    phMax: 8,
    observacao: "Complexação forte do Fe3+ por citrato",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Ferric-Citrate System",
  },
  {
    idBeta: "BETA_AL_CIT",
    idMetal: "AL",
    metal: "Al3+",
    ox: 3,
    idComplexante: "COMP_CIT",
    complexante: "Citrato",
    formulaComplexante: "C6H5O7^3-",
    beta1: 2.5e8,
    beta2: null,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 3,
    phMax: 8,
    observacao: "Complexação moderada de alumínio",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Aluminium-Citrate System",
  },
  {
    idBeta: "BETA_PB_CIT",
    idMetal: "PB",
    metal: "Pb2+",
    ox: 2,
    idComplexante: "COMP_CIT",
    complexante: "Citrato",
    formulaComplexante: "C6H5O7^3-",
    beta1: 5.0e5,
    beta2: null,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 3,
    phMax: 8,
    observacao: "Complexação auxiliar",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Lead-Citrate System",
  },
  {
    idBeta: "BETA_FE3_F",
    idMetal: "FE3",
    metal: "Fe3+",
    ox: 3,
    idComplexante: "COMP_F",
    complexante: "Fluoreto",
    formulaComplexante: "F-",
    beta1: 6.3e5,
    beta2: 3.98e11,
    beta3: 2.51e16,
    beta4: 1.58e20,
    beta5: 3.98e22,
    beta6: 1.0e24,
    phMin: "Sem restrição",
    phMax: "Sem restrição",
    observacao: "Complexação extremamente forte de Fe3+ com fluoreto",
    referencia: "Martell & Smith, Critical Stability Constants Vol.3",
  },
  {
    idBeta: "BETA_AL_F",
    idMetal: "AL",
    metal: "Al3+",
    ox: 3,
    idComplexante: "COMP_F",
    complexante: "Fluoreto",
    formulaComplexante: "F-",
    beta1: 1.3e7,
    beta2: 1.6e12,
    beta3: 2.5e16,
    beta4: 3.2e19,
    beta5: 1.0e21,
    beta6: null,
    phMin: 3,
    phMax: 8,
    observacao: "Complexação muito forte de alumínio com fluoreto",
    referencia: "Martell & Smith, Critical Stability Constants Vol.3",
  },
  {
    idBeta: "BETA_ZN_CN",
    idMetal: "ZN",
    metal: "Zn2+",
    ox: 2,
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formulaComplexante: "CN-",
    beta1: 1.0e5,
    beta2: 1.0e10,
    beta3: 1.0e15,
    beta4: 1.0e18,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 14,
    observacao: "Complexação extremamente forte",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Zinc-Cyanide System",
  },
  {
    idBeta: "BETA_CD_CN",
    idMetal: "CD",
    metal: "Cd2+",
    ox: 2,
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formulaComplexante: "CN-",
    beta1: 1.0e6,
    beta2: 1.0e11,
    beta3: 1.0e16,
    beta4: 1.0e19,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 14,
    observacao: "Complexação extremamente forte",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Cadmium-Cyanide System",
  },
  {
    idBeta: "BETA_CU_CN",
    idMetal: "CU",
    metal: "Cu2+",
    ox: 2,
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formulaComplexante: "CN-",
    beta1: 1.0e9,
    beta2: 1.0e16,
    beta3: 1.0e23,
    beta4: 1.0e28,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 14,
    observacao: "Complexação extremamente forte",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Copper-Cyanide System",
  },
  {
    idBeta: "BETA_NI_CN",
    idMetal: "NI",
    metal: "Ni2+",
    ox: 2,
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formulaComplexante: "CN-",
    beta1: 1.0e8,
    beta2: 1.0e14,
    beta3: 1.0e20,
    beta4: 1.0e25,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 14,
    observacao: "Complexação extremamente forte",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Nickel-Cyanide System",
  },
  {
    idBeta: "BETA_CO_CN",
    idMetal: "CO",
    metal: "Co2+",
    ox: 2,
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formulaComplexante: "CN-",
    beta1: 1.0e7,
    beta2: 1.0e13,
    beta3: 1.0e19,
    beta4: 1.0e24,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 14,
    observacao: "Complexação extremamente forte",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.5 - Cobalt-Cyanide System",
  },
  {
    idBeta: "BETA_FE3_OX",
    idMetal: "FE3",
    metal: "Fe3+",
    ox: 3,
    idComplexante: "COMP_OX",
    complexante: "Oxalato",
    formulaComplexante: "C2O4^2-",
    beta1: 1.3e9,
    beta2: 2.0e16,
    beta3: 3.2e20,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 2,
    phMax: 7,
    observacao: "Complexação forte por oxalato",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Ferric-Oxalate System",
  },
  {
    idBeta: "BETA_AL_OX",
    idMetal: "AL",
    metal: "Al3+",
    ox: 3,
    idComplexante: "COMP_OX",
    complexante: "Oxalato",
    formulaComplexante: "C2O4^2-",
    beta1: 2.5e6,
    beta2: 1.2e11,
    beta3: 1.0e15,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 2,
    phMax: 7,
    observacao: "Complexação significativa",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Aluminium-Oxalate System",
  },
  {
    idBeta: "BETA_FE3_TAR",
    idMetal: "FE3",
    metal: "Fe3+",
    ox: 3,
    idComplexante: "COMP_TAR",
    complexante: "Tartarato",
    formulaComplexante: "C4H4O6^2-",
    beta1: 3.0e7,
    beta2: 5.0e12,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 5,
    phMax: 10,
    observacao: "Utilizado para evitar hidrólise",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Ferric-Tartrate System",
  },
  {
    idBeta: "BETA_AL_TAR",
    idMetal: "AL",
    metal: "Al3+",
    ox: 3,
    idComplexante: "COMP_TAR",
    complexante: "Tartarato",
    formulaComplexante: "C4H4O6^2-",
    beta1: 5.0e5,
    beta2: 2.0e9,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 5,
    phMax: 10,
    observacao: "Auxilia na solubilização de Al3+",
    referencia:
      "Martell & Smith, Critical Stability Constants Vol.3 - Aluminium-Tartrate System",
  },
  {
    idBeta: "BETA_PB_NH3",
    idMetal: "PB",
    metal: "Pb2+",
    ox: 2,
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formulaComplexante: "NH3",
    beta1: 1.58e2,
    beta2: 6.31e3,
    beta3: 8.91e4,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 8,
    phMax: 11,
    observacao: "Complexação moderada de chumbo com amônia",
    referencia: "Martell & Smith, Critical Stability Constants Vol.5",
  },
  {
    idBeta: "BETA_BI_TEA",
    idMetal: "BI3",
    metal: "Bi3+",
    ox: 3,
    idComplexante: "COMP_TEA",
    complexante: "Trietanolamina",
    formulaComplexante: "TEA",
    beta1: 2.5e4,
    beta2: 1.0e8,
    beta3: null,
    beta4: null,
    beta5: null,
    beta6: null,
    phMin: 7,
    phMax: 11,
    observacao:
      "Complexação de bismuto com trietanolamina usada em mascaramento seletivo",
    referencia: "Martell & Smith; Sillen & Martell",
  },
];

export function buscarBetaComplexantePorId(
  idBeta: string
): BetaComplexante | undefined {
  return betasComplexantes.find(
    (item) => item.idBeta.toUpperCase() === idBeta.toUpperCase()
  );
}

export function buscarBetaComplexante(
  idMetal: string,
  idComplexante: string
): BetaComplexante | undefined {
  return betasComplexantes.find(
    (item) =>
      item.idMetal.toUpperCase() === idMetal.toUpperCase() &&
      item.idComplexante.toUpperCase() === idComplexante.toUpperCase()
  );
}

export function listarBetasPorMetal(idMetal: string): BetaComplexante[] {
  return betasComplexantes.filter(
    (item) => item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function listarBetasPorComplexante(
  idComplexante: string
): BetaComplexante[] {
  return betasComplexantes.filter(
    (item) => item.idComplexante.toUpperCase() === idComplexante.toUpperCase()
  );
}

export function obterBetasComoArray(beta: BetaComplexante): number[] {
  return [
    beta.beta1,
    beta.beta2,
    beta.beta3,
    beta.beta4,
    beta.beta5,
    beta.beta6,
  ].filter((valor): valor is number => valor !== null);
}

export function calcularDenominadorBeta(
  beta: BetaComplexante,
  concentracaoLiganteLivre: number
): number {
  const betas = obterBetasComoArray(beta);

  return (
    1 +
    betas.reduce((soma, betaN, index) => {
      const n = index + 1;
      return soma + betaN * Math.pow(concentracaoLiganteLivre, n);
    }, 0)
  );
}

export type BetaComplexanteComRestricaoPh = BetaComplexante & {
  phMin: number;
  phMax: number;
};

export function betaPossuiRestricaoDePh(
  beta: BetaComplexante
): beta is BetaComplexanteComRestricaoPh {
  return typeof beta.phMin === "number" && typeof beta.phMax === "number";
}

export function verificarBetaNaFaixaDePh(
  idMetal: string,
  idComplexante: string,
  ph: number
) {
  const beta = buscarBetaComplexante(idMetal, idComplexante);

  if (!beta) {
    return {
      encontrado: false,
      dentroDaFaixa: false,
      mensagem:
        "Não há constante β cadastrada para esse metal e complexante auxiliar.",
    };
  }

  if (!betaPossuiRestricaoDePh(beta)) {
    return {
      encontrado: true,
      dentroDaFaixa: true,
      beta,
      mensagem: `A constante β cadastrada para ${beta.metal} com ${beta.complexante} está marcada como sem restrição de pH.`,
    };
  }

  const dentroDaFaixa = ph >= beta.phMin && ph <= beta.phMax;

  return {
    encontrado: true,
    dentroDaFaixa,
    beta,
    mensagem: dentroDaFaixa
      ? `O pH ${ph} está dentro da faixa registrada para ${beta.metal} com ${beta.complexante}.`
      : `O pH ${ph} está fora da faixa registrada para ${beta.metal} com ${beta.complexante}. A faixa cadastrada é de ${beta.phMin} a ${beta.phMax}.`,
  };
}