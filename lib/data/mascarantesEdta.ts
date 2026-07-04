export type RiscoUsoMascaranteEdta = "Baixo" | "Médio" | "Alto";

export type MascaranteEdta = {
  idMascarante: string;
  agenteMascarante: string;
  formula: string;
  metaisMascarados: string[];
  funcao: string;
  phMin: number;
  phMax: number;
  riscoUso: RiscoUsoMascaranteEdta;
  usoRestrito: boolean;
  observacao: string;
};

export const mascarantesEdta: MascaranteEdta[] = [
  {
    idMascarante: "MASK_F",
    agenteMascarante: "Fluoreto",
    formula: "F-",
    metaisMascarados: ["Fe3+", "Al3+"],
    funcao: "Forma complexos auxiliares e reduz interferência",
    phMin: 1,
    phMax: 7,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Muito usado para Fe3+ e Al3+",
  },
  {
    idMascarante: "MASK_CN",
    agenteMascarante: "Cianeto",
    formula: "CN-",
    metaisMascarados: ["Zn2+", "Cd2+", "Ni2+", "Co2+", "Cu2+", "Ag+"],
    funcao: "Forma complexos muito estáveis",
    phMin: 8,
    phMax: 14,
    riscoUso: "Alto",
    usoRestrito: true,
    observacao:
      "Substância altamente tóxica; deve aparecer no sistema apenas como alerta de risco e uso restrito.",
  },
  {
    idMascarante: "MASK_I",
    agenteMascarante: "Iodeto",
    formula: "I-",
    metaisMascarados: ["Cu2+", "Ag+"],
    funcao: "Forma complexos iodados",
    phMin: 1,
    phMax: 7,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Útil para cobre e prata",
  },
  {
    idMascarante: "MASK_TIO",
    agenteMascarante: "Tiossulfato",
    formula: "S2O3^2-",
    metaisMascarados: ["Cu2+", "Ag+"],
    funcao: "Reduz interferência de metais específicos",
    phMin: 5,
    phMax: 11,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Pode complexar metais moles",
  },
  {
    idMascarante: "MASK_CIT",
    agenteMascarante: "Citrato",
    formula: "C6H5O7^3-",
    metaisMascarados: ["Fe3+", "Al3+", "Pb2+", "Ca2+"],
    funcao: "Complexante auxiliar e mascarante",
    phMin: 3,
    phMax: 8,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Ajuda a controlar hidrólise",
  },
  {
    idMascarante: "MASK_TEA",
    agenteMascarante: "Trietanolamina",
    formula: "C6H15NO3",
    metaisMascarados: ["Al3+", "Fe3+", "Zn2+"],
    funcao: "Reduz interferências por complexação",
    phMin: 8,
    phMax: 12,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Usada em titulações alcalinas",
  },
  {
    idMascarante: "MASK_TAR",
    agenteMascarante: "Tartarato",
    formula: "C4H4O6^2-",
    metaisMascarados: ["Al3+", "Fe3+"],
    funcao: "Evita precipitação e mascaramento parcial",
    phMin: 5,
    phMax: 10,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Muito usado em análises de alumínio",
  },
  {
    idMascarante: "MASK_OX",
    agenteMascarante: "Oxalato",
    formula: "C2O4^2-",
    metaisMascarados: ["Fe3+", "Al3+", "Ca2+"],
    funcao: "Complexação e mascaramento",
    phMin: 2,
    phMax: 7,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Pode precipitar cálcio",
  },
  {
    idMascarante: "MASK_PHOS",
    agenteMascarante: "Fosfato",
    formula: "PO4^3-",
    metaisMascarados: ["Fe3+", "Al3+", "Ca2+", "Mg2+"],
    funcao: "Mascaramento por precipitação controlada",
    phMin: 6,
    phMax: 10,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Usado em algumas separações analíticas",
  },
  {
    idMascarante: "MASK_GLY",
    agenteMascarante: "Glicina",
    formula: "NH2CH2COO-",
    metaisMascarados: ["Cu2+", "Ni2+", "Co2+", "Zn2+"],
    funcao: "Complexação auxiliar",
    phMin: 5,
    phMax: 10,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Aminoácido frequentemente utilizado em complexometria",
  },
  {
    idMascarante: "MASK_EN",
    agenteMascarante: "Etilenodiamina",
    formula: "en",
    metaisMascarados: ["Cu2+", "Ni2+", "Zn2+", "Co2+"],
    funcao: "Mascaramento por formação de complexos estáveis",
    phMin: 7,
    phMax: 12,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Compete fortemente com EDTA",
  },
  {
    idMascarante: "MASK_NTA",
    agenteMascarante: "NTA",
    formula: "C6H9NO6",
    metaisMascarados: ["Ca2+", "Mg2+", "Cu2+", "Zn2+", "Ni2+"],
    funcao: "Quelante auxiliar",
    phMin: 4,
    phMax: 10,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Semelhante ao EDTA porém menos forte",
  },
  {
    idMascarante: "MASK_DTPA",
    agenteMascarante: "DTPA",
    formula: "C14H23N3O10",
    metaisMascarados: ["Fe3+", "Al3+", "Cu2+", "Zn2+", "Pb2+"],
    funcao: "Quelante de alta estabilidade",
    phMin: 2,
    phMax: 11,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Mais forte que EDTA para diversos metais",
  },
  {
    idMascarante: "MASK_SCN",
    agenteMascarante: "Tiocianato",
    formula: "SCN-",
    metaisMascarados: ["Fe3+", "Co2+"],
    funcao: "Mascaramento e complexação colorimétrica",
    phMin: 1,
    phMax: 5,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Muito utilizado para Fe3+",
  },
  {
    idMascarante: "MASK_ASCORB",
    agenteMascarante: "Ácido Ascórbico",
    formula: "C6H8O6",
    metaisMascarados: ["Fe3+", "Cu2+"],
    funcao: "Redução química e mascaramento indireto",
    phMin: 2,
    phMax: 6,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Pode reduzir Fe3+ para Fe2+",
  },
  {
    idMascarante: "MASK_SAL",
    agenteMascarante: "Salicilato",
    formula: "C7H5O3-",
    metaisMascarados: ["Fe3+", "Al3+", "Cu2+"],
    funcao: "Complexação aromática",
    phMin: 3,
    phMax: 8,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Ajuda a estabilizar alguns metais",
  },
  {
    idMascarante: "MASK_THIOUREA",
    agenteMascarante: "Tioureia",
    formula: "CS(NH2)2",
    metaisMascarados: ["Ag+", "Cu2+"],
    funcao: "Mascaramento de metais moles",
    phMin: 1,
    phMax: 7,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao: "Usada para metais com afinidade por enxofre",
  },
  {
    idMascarante: "MASK_DIMETHYLGLYOXIME",
    agenteMascarante: "Dimetilglioxima",
    formula: "C4H8N2O2",
    metaisMascarados: ["Ni2+"],
    funcao: "Mascaramento altamente seletivo",
    phMin: 8,
    phMax: 10,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Excelente seletividade para níquel",
  },
  {
    idMascarante: "MASK_BORATE",
    agenteMascarante: "Borato",
    formula: "B(OH)4-",
    metaisMascarados: ["Al3+", "Fe3+"],
    funcao: "Reduz hidrólise e interferências",
    phMin: 7,
    phMax: 10,
    riscoUso: "Baixo",
    usoRestrito: false,
    observacao: "Utilizado em meios alcalinos",
  },
  {
    idMascarante: "MASK_NAOH",
    agenteMascarante: "Hidróxido de Sódio",
    formula: "NaOH",
    metaisMascarados: ["Mg2+", "Fe3+", "Mn2+", "Ni2+"],
    funcao: "Promove precipitação seletiva por formação de hidróxidos",
    phMin: 10,
    phMax: 14,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao:
      "Atua elevando o pH e favorecendo a precipitação de alguns metais como hidróxidos, reduzindo sua disponibilidade para reagir com o EDTA",
  },
  {
    idMascarante: "MASK_KOH",
    agenteMascarante: "Hidróxido de Potássio",
    formula: "KOH",
    metaisMascarados: ["Mg2+", "Fe3+", "Mn2+", "Ni2+"],
    funcao: "Promove precipitação seletiva por formação de hidróxidos",
    phMin: 10,
    phMax: 14,
    riscoUso: "Médio",
    usoRestrito: false,
    observacao:
      "Atua de forma semelhante ao NaOH, aumentando o pH e reduzindo a interferência de metais susceptíveis à precipitação",
  },
];

export function buscarMascaranteEdtaPorId(
  idMascarante: string
): MascaranteEdta | undefined {
  return mascarantesEdta.find(
    (item) =>
      item.idMascarante.toUpperCase() === idMascarante.toUpperCase()
  );
}

export function listarMascarantesPorMetalEdta(
  metal: string
): MascaranteEdta[] {
  return mascarantesEdta.filter((item) =>
    item.metaisMascarados.some(
      (metalMascarado) =>
        metalMascarado.toUpperCase() === metal.toUpperCase()
    )
  );
}

export function listarMascarantesPorRiscoEdta(
  riscoUso: RiscoUsoMascaranteEdta
): MascaranteEdta[] {
  return mascarantesEdta.filter((item) => item.riscoUso === riscoUso);
}

export function listarMascarantesPermitidosEdta(): MascaranteEdta[] {
  return mascarantesEdta.filter((item) => !item.usoRestrito);
}

export function listarMascarantesRestritosEdta(): MascaranteEdta[] {
  return mascarantesEdta.filter((item) => item.usoRestrito);
}

export function verificarMascaranteNaFaixaDePhEdta(
  idMascarante: string,
  ph: number
) {
  const mascarante = buscarMascaranteEdtaPorId(idMascarante);

  if (!mascarante) {
    return {
      encontrado: false,
      dentroDaFaixa: false,
      mensagem: "Mascarante não encontrado na base de dados.",
    };
  }

  const dentroDaFaixa = ph >= mascarante.phMin && ph <= mascarante.phMax;

  return {
    encontrado: true,
    dentroDaFaixa,
    mascarante,
    mensagem: dentroDaFaixa
      ? `O pH ${ph} está dentro da faixa registrada para ${mascarante.agenteMascarante}.`
      : `O pH ${ph} está fora da faixa registrada para ${mascarante.agenteMascarante}. A faixa cadastrada é de ${mascarante.phMin} a ${mascarante.phMax}.`,
  };
}