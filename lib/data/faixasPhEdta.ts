export type TampaoRecomendadoEdta = "Amônia/Amônio" | "Acetato" | "Ácido";

export type FaixaPhEdta = {
  idMetal: string;
  metal: string;
  phMin: number;
  phIdeal: number;
  phMax: number;
  tampaoRecomendado: TampaoRecomendadoEdta;
  observacao: string;
};

export const faixasPhEdta: FaixaPhEdta[] = [
  {
    idMetal: "AG",
    metal: "Ag+",
    phMin: 7,
    phIdeal: 9,
    phMax: 10,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Titulação favorecida em meio levemente básico",
  },
  {
    idMetal: "MG",
    metal: "Mg2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Normalmente titulado em pH 10",
  },
  {
    idMetal: "CA",
    metal: "Ca2+",
    phMin: 10,
    phIdeal: 10,
    phMax: 12,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Condição clássica para dureza cálcica",
  },
  {
    idMetal: "CU",
    metal: "Cu2+",
    phMin: 4,
    phIdeal: 5,
    phMax: 6,
    tampaoRecomendado: "Acetato",
    observacao: "Complexação favorecida em meio levemente ácido",
  },
  {
    idMetal: "ZN",
    metal: "Zn2+",
    phMin: 8,
    phIdeal: 10,
    phMax: 10,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Titulação comum em pH próximo de 10",
  },
  {
    idMetal: "CD",
    metal: "Cd2+",
    phMin: 8,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Titulação favorecida em meio básico",
  },
  {
    idMetal: "NI",
    metal: "Ni2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Titulação favorecida em meio amoniacal",
  },
  {
    idMetal: "CO",
    metal: "Co2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Titulação favorecida em meio amoniacal",
  },
  {
    idMetal: "PB",
    metal: "Pb2+",
    phMin: 5,
    phIdeal: 6,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Titulação favorecida em pH moderado",
  },
  {
    idMetal: "AL",
    metal: "Al3+",
    phMin: 4,
    phIdeal: 5,
    phMax: 6,
    tampaoRecomendado: "Acetato",
    observacao: "Pode sofrer hidrólise em pH mais alto",
  },
  {
    idMetal: "FE3",
    metal: "Fe3+",
    phMin: 1,
    phIdeal: 2,
    phMax: 3,
    tampaoRecomendado: "Ácido",
    observacao: "Complexação forte em pH ácido; hidrolisa em pH alto",
  },
  {
    idMetal: "FE2",
    metal: "Fe2+",
    phMin: 4,
    phIdeal: 5,
    phMax: 6,
    tampaoRecomendado: "Acetato",
    observacao: "Mais estável que Fe3+ em pH moderado",
  },
  {
    idMetal: "MN",
    metal: "Mn2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Complexação favorecida em meio básico",
  },
  {
    idMetal: "HG",
    metal: "Hg2+",
    phMin: 3,
    phIdeal: 5,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Complexação eficiente em meio ácido a neutro",
  },
  {
    idMetal: "BA",
    metal: "Ba2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Comportamento semelhante ao cálcio",
  },
  {
    idMetal: "SR",
    metal: "Sr2+",
    phMin: 9,
    phIdeal: 10,
    phMax: 11,
    tampaoRecomendado: "Amônia/Amônio",
    observacao: "Comportamento semelhante ao cálcio",
  },
  {
    idMetal: "CR3",
    metal: "Cr3+",
    phMin: 2,
    phIdeal: 3,
    phMax: 4,
    tampaoRecomendado: "Ácido",
    observacao: "Forma complexos lentamente; hidrólise em pH elevado",
  },
  {
    idMetal: "BI3",
    metal: "Bi3+",
    phMin: 1,
    phIdeal: 2,
    phMax: 4,
    tampaoRecomendado: "Ácido",
    observacao: "Complexação favorecida em meio ácido",
  },
  {
    idMetal: "TH4",
    metal: "Th4+",
    phMin: 1,
    phIdeal: 2,
    phMax: 4,
    tampaoRecomendado: "Ácido",
    observacao: "Complexação muito forte em meio ácido",
  },
  {
    idMetal: "ZR4",
    metal: "Zr4+",
    phMin: 1,
    phIdeal: 2,
    phMax: 4,
    tampaoRecomendado: "Ácido",
    observacao: "Forte tendência à hidrólise",
  },
  {
    idMetal: "LA3",
    metal: "La3+",
    phMin: 4,
    phIdeal: 5,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Terra rara com boa estabilidade em meio moderadamente ácido",
  },
  {
    idMetal: "CE3",
    metal: "Ce3+",
    phMin: 4,
    phIdeal: 5,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Terra rara com comportamento semelhante ao lantânio",
  },
  {
    idMetal: "UO2",
    metal: "UO2 2+",
    phMin: 2,
    phIdeal: 3,
    phMax: 5,
    tampaoRecomendado: "Ácido",
    observacao: "Complexação favorecida em meio ácido",
  },
  {
    idMetal: "TI4",
    metal: "Ti4+",
    phMin: 1,
    phIdeal: 2,
    phMax: 3,
    tampaoRecomendado: "Ácido",
    observacao: "Hidrólise intensa acima de pH 3",
  },
  {
    idMetal: "SN2",
    metal: "Sn2+",
    phMin: 3,
    phIdeal: 5,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Pode oxidar facilmente durante a titulação",
  },
  {
    idMetal: "SB3",
    metal: "Sb3+",
    phMin: 2,
    phIdeal: 4,
    phMax: 6,
    tampaoRecomendado: "Acetato",
    observacao: "Requer controle de hidrólise",
  },
  {
    idMetal: "PD2",
    metal: "Pd2+",
    phMin: 3,
    phIdeal: 5,
    phMax: 7,
    tampaoRecomendado: "Acetato",
    observacao: "Forma complexos muito estáveis com ligantes nitrogenados",
  },
  {
    idMetal: "AU3",
    metal: "Au3+",
    phMin: 1,
    phIdeal: 2,
    phMax: 4,
    tampaoRecomendado: "Ácido",
    observacao: "Complexação favorecida em meio fortemente ácido",
  },
];

export function buscarFaixaPhEdtaPorIdMetal(
  idMetal: string
): FaixaPhEdta | undefined {
  return faixasPhEdta.find(
    (item) => item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function verificarPhNaFaixaEdta(idMetal: string, ph: number) {
  const faixa = buscarFaixaPhEdtaPorIdMetal(idMetal);

  if (!faixa) {
    return {
      encontrado: false,
      dentroDaFaixa: false,
      mensagem: "Metal não encontrado na base de faixas de pH para EDTA.",
    };
  }

  const dentroDaFaixa = ph >= faixa.phMin && ph <= faixa.phMax;

  return {
    encontrado: true,
    dentroDaFaixa,
    faixa,
    mensagem: dentroDaFaixa
      ? `O pH ${ph} está dentro da faixa recomendada para ${faixa.metal}.`
      : `O pH ${ph} está fora da faixa recomendada para ${faixa.metal}. A faixa sugerida é de ${faixa.phMin} a ${faixa.phMax}, com pH ideal ${faixa.phIdeal}.`,
  };
}