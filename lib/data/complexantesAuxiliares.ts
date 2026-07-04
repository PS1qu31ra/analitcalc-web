export type ForcaComplexanteAuxiliar =
  | "Baixa"
  | "Média"
  | "Alta"
  | "Muito Alta";

export type ComplexanteAuxiliar = {
  idComplexante: string;
  complexante: string;
  formula: string;
  metaisAlvo: string[];
  funcao: string;
  forcaComplexante: ForcaComplexanteAuxiliar;
  phMin: number;
  phMax: number;
  usoRestrito: boolean;
  observacao: string;
};

export const complexantesAuxiliares: ComplexanteAuxiliar[] = [
  {
    idComplexante: "COMP_NH3",
    complexante: "Amônia",
    formula: "NH3",
    metaisAlvo: ["Cu2+", "Zn2+", "Ni2+", "Ag+"],
    funcao: "Forma complexos amínicos",
    forcaComplexante: "Média",
    phMin: 8,
    phMax: 12,
    usoRestrito: false,
    observacao: "Pode competir com EDTA",
  },
  {
    idComplexante: "COMP_CIT",
    complexante: "Citrato",
    formula: "C6H5O7^3-",
    metaisAlvo: ["Fe3+", "Al3+", "Ca2+", "Mg2+"],
    funcao: "Complexante auxiliar",
    forcaComplexante: "Média",
    phMin: 3,
    phMax: 8,
    usoRestrito: false,
    observacao: "Ajuda a manter metais em solução",
  },
  {
    idComplexante: "COMP_TAR",
    complexante: "Tartarato",
    formula: "C4H4O6^2-",
    metaisAlvo: ["Al3+", "Fe3+", "Sn2+", "Sb3+"],
    funcao: "Evita precipitação/hidrólise",
    forcaComplexante: "Média",
    phMin: 5,
    phMax: 10,
    usoRestrito: false,
    observacao: "Útil em meio neutro a alcalino",
  },
  {
    idComplexante: "COMP_OX",
    complexante: "Oxalato",
    formula: "C2O4^2-",
    metaisAlvo: ["Ca2+", "Fe3+", "Al3+"],
    funcao: "Complexante ou precipitante",
    forcaComplexante: "Alta",
    phMin: 2,
    phMax: 7,
    usoRestrito: false,
    observacao: "Pode precipitar cálcio",
  },
  {
    idComplexante: "COMP_ACET",
    complexante: "Acetato",
    formula: "CH3COO-",
    metaisAlvo: ["Fe3+", "Al3+", "Zn2+"],
    funcao: "Controle leve de complexação",
    forcaComplexante: "Baixa",
    phMin: 3,
    phMax: 6,
    usoRestrito: false,
    observacao: "Associado ao tampão acetato",
  },
  {
    idComplexante: "COMP_EN",
    complexante: "Etilenodiamina",
    formula: "en",
    metaisAlvo: ["Cu2+", "Ni2+", "Zn2+", "Co2+"],
    funcao: "Complexante bidentado",
    forcaComplexante: "Alta",
    phMin: 7,
    phMax: 12,
    usoRestrito: false,
    observacao: "Forma complexos estáveis",
  },
  {
    idComplexante: "COMP_TRIETH",
    complexante: "Tris",
    formula: "(C4H11NO3)",
    metaisAlvo: ["Cu2+", "Zn2+", "Ni2+"],
    funcao: "Controle de metais traço",
    forcaComplexante: "Média",
    phMin: 7,
    phMax: 9,
    usoRestrito: false,
    observacao: "Utilizado em bioquímica e análises ambientais",
  },
  {
    idComplexante: "COMP_GLY",
    complexante: "Glicina",
    formula: "NH2CH2COO-",
    metaisAlvo: ["Cu2+", "Ni2+", "Co2+", "Zn2+"],
    funcao: "Complexante aminoácido",
    forcaComplexante: "Média",
    phMin: 5,
    phMax: 10,
    usoRestrito: false,
    observacao: "Forma complexos moderadamente estáveis",
  },
  {
    idComplexante: "COMP_F",
    complexante: "Fluoreto",
    formula: "F-",
    metaisAlvo: ["Al3+", "Fe3+", "Ti4+", "Zr4+"],
    funcao: "Mascara metais trivalentes e tetravalentes",
    forcaComplexante: "Alta",
    phMin: 2,
    phMax: 8,
    usoRestrito: false,
    observacao: "Muito utilizado para Al3+",
  },
  {
    idComplexante: "COMP_CN",
    complexante: "Cianeto",
    formula: "CN-",
    metaisAlvo: ["Cu2+", "Zn2+", "Cd2+", "Ag+", "Ni2+", "Co2+"],
    funcao: "Mascarante forte",
    forcaComplexante: "Muito Alta",
    phMin: 8,
    phMax: 13,
    usoRestrito: true,
    observacao:
      "Substância de alto risco; no sistema deve aparecer apenas como alerta de uso restrito.",
  },
  {
    idComplexante: "COMP_TEA",
    complexante: "Trietanolamina",
    formula: "N(CH2CH2OH)3",
    metaisAlvo: ["Al3+", "Fe3+", "Mn2+", "Zn2+"],
    funcao: "Mascarante e complexante",
    forcaComplexante: "Média",
    phMin: 7,
    phMax: 11,
    usoRestrito: false,
    observacao: "Muito utilizada em complexometria",
  },
  {
    idComplexante: "COMP_PHOS",
    complexante: "Fosfato",
    formula: "PO4^3-",
    metaisAlvo: ["Ca2+", "Mg2+", "Fe3+", "Al3+"],
    funcao: "Complexação e precipitação",
    forcaComplexante: "Média",
    phMin: 6,
    phMax: 10,
    usoRestrito: false,
    observacao: "Pode gerar precipitados",
  },
  {
    idComplexante: "COMP_SAL",
    complexante: "Salicilato",
    formula: "C7H5O3-",
    metaisAlvo: ["Fe3+", "Al3+", "Cu2+"],
    funcao: "Complexante aromático",
    forcaComplexante: "Média",
    phMin: 3,
    phMax: 8,
    usoRestrito: false,
    observacao: "Útil para ferro e alumínio",
  },
  {
    idComplexante: "COMP_SCN",
    complexante: "Tiocianato",
    formula: "SCN-",
    metaisAlvo: ["Fe3+", "Hg2+", "Co2+"],
    funcao: "Complexante colorimétrico",
    forcaComplexante: "Média",
    phMin: 1,
    phMax: 5,
    usoRestrito: false,
    observacao: "Amplamente utilizado para Fe3+",
  },
  {
    idComplexante: "COMP_EDDA",
    complexante: "EDDA",
    formula: "C10H16N2O4",
    metaisAlvo: ["Ca2+", "Mg2+", "Fe3+", "Zn2+"],
    funcao: "Agente quelante",
    forcaComplexante: "Alta",
    phMin: 4,
    phMax: 10,
    usoRestrito: false,
    observacao: "Semelhante ao EDTA porém menos forte",
  },
  {
    idComplexante: "COMP_NTA",
    complexante: "NTA",
    formula: "C6H9NO6",
    metaisAlvo: ["Ca2+", "Mg2+", "Cu2+", "Zn2+", "Ni2+"],
    funcao: "Agente quelante",
    forcaComplexante: "Alta",
    phMin: 4,
    phMax: 10,
    usoRestrito: false,
    observacao: "Análogo simplificado do EDTA",
  },
  {
    idComplexante: "COMP_DTPA",
    complexante: "DTPA",
    formula: "C14H23N3O10",
    metaisAlvo: ["Fe3+", "Al3+", "Cu2+", "Zn2+", "Pb2+"],
    funcao: "Agente quelante",
    forcaComplexante: "Muito Alta",
    phMin: 2,
    phMax: 11,
    usoRestrito: false,
    observacao: "Mais forte que EDTA para vários metais",
  },
  {
    idComplexante: "COMP_CATECOL",
    complexante: "Catecol",
    formula: "C6H4(OH)2",
    metaisAlvo: ["Fe3+", "Al3+", "Ti4+"],
    funcao: "Complexante aromático",
    forcaComplexante: "Alta",
    phMin: 3,
    phMax: 8,
    usoRestrito: false,
    observacao: "Complexação forte de Fe3+",
  },
  {
    idComplexante: "COMP_ASCORB",
    complexante: "Ácido Ascórbico",
    formula: "C6H8O6",
    metaisAlvo: ["Fe3+", "Cu2+"],
    funcao: "Redutor e complexante",
    forcaComplexante: "Baixa",
    phMin: 2,
    phMax: 6,
    usoRestrito: false,
    observacao: "Pode alterar o estado de oxidação do metal",
  },
  {
    idComplexante: "COMP_LACT",
    complexante: "Lactato",
    formula: "C3H5O3-",
    metaisAlvo: ["Al3+", "Fe3+", "Ca2+"],
    funcao: "Complexante auxiliar",
    forcaComplexante: "Baixa",
    phMin: 4,
    phMax: 8,
    usoRestrito: false,
    observacao: "Utilizado em sistemas biológicos",
  },
];

export function buscarComplexanteAuxiliarPorId(
  idComplexante: string
): ComplexanteAuxiliar | undefined {
  return complexantesAuxiliares.find(
    (item) =>
      item.idComplexante.toUpperCase() === idComplexante.toUpperCase()
  );
}

export function listarComplexantesAuxiliaresPorMetal(
  metal: string
): ComplexanteAuxiliar[] {
  return complexantesAuxiliares.filter((item) =>
    item.metaisAlvo.some(
      (metalAlvo) => metalAlvo.toUpperCase() === metal.toUpperCase()
    )
  );
}

export function listarComplexantesAuxiliaresPorForca(
  forcaComplexante: ForcaComplexanteAuxiliar
): ComplexanteAuxiliar[] {
  return complexantesAuxiliares.filter(
    (item) => item.forcaComplexante === forcaComplexante
  );
}

export function listarComplexantesAuxiliaresPermitidos(): ComplexanteAuxiliar[] {
  return complexantesAuxiliares.filter((item) => !item.usoRestrito);
}

export function listarComplexantesAuxiliaresRestritos(): ComplexanteAuxiliar[] {
  return complexantesAuxiliares.filter((item) => item.usoRestrito);
}

export function verificarComplexanteAuxiliarNaFaixaDePh(
  idComplexante: string,
  ph: number
) {
  const complexante = buscarComplexanteAuxiliarPorId(idComplexante);

  if (!complexante) {
    return {
      encontrado: false,
      dentroDaFaixa: false,
      mensagem: "Complexante auxiliar não encontrado na base de dados.",
    };
  }

  const dentroDaFaixa = ph >= complexante.phMin && ph <= complexante.phMax;

  return {
    encontrado: true,
    dentroDaFaixa,
    complexante,
    mensagem: dentroDaFaixa
      ? `O pH ${ph} está dentro da faixa registrada para ${complexante.complexante}.`
      : `O pH ${ph} está fora da faixa registrada para ${complexante.complexante}. A faixa cadastrada é de ${complexante.phMin} a ${complexante.phMax}.`,
  };
}