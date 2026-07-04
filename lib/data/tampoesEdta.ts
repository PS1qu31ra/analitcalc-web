export type TampaoEdta = {
  idTampao: string;
  tampao: string;
  composicao: string;
  phAlvo: number;
  phMin: number;
  phMax: number;
  metaisRecomendados: string[];
  funcao: string;
  observacao: string;
};

export const tampoesEdta: TampaoEdta[] = [
  {
    idTampao: "TAMP_ACET",
    tampao: "Acetato",
    composicao: "CH3COOH / CH3COO-",
    phAlvo: 4.5,
    phMin: 3.8,
    phMax: 5.8,
    metaisRecomendados: ["Fe3+", "Zn2+", "Cu2+", "Pb2+"],
    funcao: "Controlar pH ácido moderado",
    observacao: "Útil para metais com Kf alto em pH ácido",
  },
  {
    idTampao: "TAMP_HEX",
    tampao: "Hexamina",
    composicao: "Hexametilenotetramina",
    phAlvo: 5.5,
    phMin: 5,
    phMax: 6.5,
    metaisRecomendados: ["Zn2+", "Pb2+", "Al3+"],
    funcao: "Manter pH levemente ácido",
    observacao: "Comum com Xilenol Orange",
  },
  {
    idTampao: "TAMP_NH3",
    tampao: "Amônia/Amônio",
    composicao: "NH3 / NH4+",
    phAlvo: 10,
    phMin: 9,
    phMax: 11,
    metaisRecomendados: ["Ca2+", "Mg2+", "Zn2+", "Cd2+", "Ni2+", "Co2+"],
    funcao: "Manter pH básico",
    observacao: "Essencial para dureza total da água",
  },
  {
    idTampao: "TAMP_BOR",
    tampao: "Borato",
    composicao: "H3BO3 / B(OH)4-",
    phAlvo: 9.2,
    phMin: 8,
    phMax: 10.5,
    metaisRecomendados: ["Mg2+", "Zn2+"],
    funcao: "Controle alcalino",
    observacao: "Alternativa ao tampão amoniacal",
  },
  {
    idTampao: "TAMP_TRIS",
    tampao: "Tris",
    composicao: "Tris / Tris-H+",
    phAlvo: 8.1,
    phMin: 7,
    phMax: 9,
    metaisRecomendados: ["Cu2+", "Zn2+", "Ni2+"],
    funcao: "Controle neutro-alcalino",
    observacao: "Pode interagir com alguns metais",
  },
  {
    idTampao: "TAMP_HCL",
    tampao: "HCl/KCl",
    composicao: "HCl / KCl",
    phAlvo: 1.5,
    phMin: 1,
    phMax: 2.2,
    metaisRecomendados: ["Fe3+", "Bi3+"],
    funcao: "Meio fortemente ácido",
    observacao: "Útil para metais com forte tendência à hidrólise",
  },
  {
    idTampao: "TAMP_CIT",
    tampao: "Citrato",
    composicao: "C6H5O7³⁻ / HC6H5O7²⁻",
    phAlvo: 4.5,
    phMin: 3.5,
    phMax: 6,
    metaisRecomendados: ["Al3+", "Fe3+", "Pb2+"],
    funcao: "Controle ácido moderado",
    observacao: "Auxilia no mascaramento de metais",
  },
  {
    idTampao: "TAMP_FOS",
    tampao: "Fosfato",
    composicao: "H2PO4⁻ / HPO4²⁻",
    phAlvo: 7.2,
    phMin: 6,
    phMax: 8,
    metaisRecomendados: ["Cu2+", "Zn2+", "Ag+"],
    funcao: "Controle próximo ao neutro",
    observacao: "Pode precipitar alguns metais",
  },
  {
    idTampao: "TAMP_CARB",
    tampao: "Carbonato",
    composicao: "HCO3⁻ / CO3²⁻",
    phAlvo: 10,
    phMin: 9,
    phMax: 11,
    metaisRecomendados: ["Ca2+"],
    funcao: "Controle alcalino forte",
    observacao: "Usado em sistemas alcalino-terrosos",
  },
  {
    idTampao: "TAMP_GLIC",
    tampao: "Glicina",
    composicao: "Glicina / Glicinato",
    phAlvo: 9.5,
    phMin: 8.5,
    phMax: 10.5,
    metaisRecomendados: ["Cu2+", "Ni2+", "Co2+", "Zn2+"],
    funcao: "Tampão complexante suave",
    observacao: "Pode auxiliar na seletividade",
  },
  {
    idTampao: "TAMP_TEA",
    tampao: "Trietanolamina",
    composicao: "C6H15NO3 / H+",
    phAlvo: 10,
    phMin: 8.5,
    phMax: 11.5,
    metaisRecomendados: ["Al3+", "Fe3+", "Zn2+"],
    funcao: "Tampão e mascarante simultâneo",
    observacao: "Muito utilizado em métodos clássicos",
  },
  {
    idTampao: "TAMP_BIS",
    tampao: "Bis-Tris",
    composicao: "Bis-Tris / H+",
    phAlvo: 6.5,
    phMin: 5.8,
    phMax: 7.2,
    metaisRecomendados: ["Cu2+", "Zn2+", "Pb2+"],
    funcao: "Controle levemente ácido",
    observacao: "Boa estabilidade de pH",
  },
  {
    idTampao: "TAMP_MES",
    tampao: "MES / NaMES",
    composicao: "C6H13NO4S",
    phAlvo: 6.1,
    phMin: 5.5,
    phMax: 6.7,
    metaisRecomendados: ["Cu2+", "Zn2+", "Al3+"],
    funcao: "Controle próximo ao neutro",
    observacao: "Utilizado em estudos analíticos modernos",
  },
  {
    idTampao: "TAMP_PIPES",
    tampao: "PIPES / NaPIPES",
    composicao: "C8H18N2O6S2",
    phAlvo: 6.8,
    phMin: 6.1,
    phMax: 7.5,
    metaisRecomendados: ["Cu2+", "Zn2+", "Ni2+"],
    funcao: "Controle neutro",
    observacao: "Alta estabilidade",
  },
  {
    idTampao: "TAMP_HEPES",
    tampao: "HEPES / NaHEPES",
    composicao: "C8H18N2O4S",
    phAlvo: 7.5,
    phMin: 6.8,
    phMax: 8.2,
    metaisRecomendados: ["Cu2+", "Zn2+", "Ag+"],
    funcao: "Controle fisiológico",
    observacao: "Usado em aplicações especiais",
  },
  {
    idTampao: "TAMP_BIC",
    tampao: "Bicarbonato",
    composicao: "H2CO3 / HCO3⁻",
    phAlvo: 8.3,
    phMin: 7.5,
    phMax: 8.8,
    metaisRecomendados: ["Ca2+", "Mg2+"],
    funcao: "Controle alcalino moderado",
    observacao: "Sistemas naturais e ambientais",
  },
];

export function buscarTampaoEdtaPorId(
  idTampao: string
): TampaoEdta | undefined {
  return tampoesEdta.find(
    (item) => item.idTampao.toUpperCase() === idTampao.toUpperCase()
  );
}

export function listarTampoesPorMetalEdta(metal: string): TampaoEdta[] {
  return tampoesEdta.filter((item) =>
    item.metaisRecomendados.some(
      (metalRecomendado) =>
        metalRecomendado.toUpperCase() === metal.toUpperCase()
    )
  );
}

export function listarTampoesNaFaixaDePhEdta(ph: number): TampaoEdta[] {
  return tampoesEdta.filter((item) => ph >= item.phMin && ph <= item.phMax);
}

export function verificarTampaoNaFaixaDePhEdta(idTampao: string, ph: number) {
  const tampao = buscarTampaoEdtaPorId(idTampao);

  if (!tampao) {
    return {
      encontrado: false,
      dentroDaFaixa: false,
      mensagem: "Tampão não encontrado na base de dados.",
    };
  }

  const dentroDaFaixa = ph >= tampao.phMin && ph <= tampao.phMax;

  return {
    encontrado: true,
    dentroDaFaixa,
    tampao,
    mensagem: dentroDaFaixa
      ? `O pH ${ph} está dentro da faixa registrada para o tampão ${tampao.tampao}.`
      : `O pH ${ph} está fora da faixa registrada para o tampão ${tampao.tampao}. A faixa cadastrada é de ${tampao.phMin} a ${tampao.phMax}, com pH alvo ${tampao.phAlvo}.`,
  };
}

export function sugerirTampoesEdta(metal: string, ph?: number): TampaoEdta[] {
  const tampoesDoMetal = listarTampoesPorMetalEdta(metal);

  if (typeof ph !== "number") {
    return tampoesDoMetal;
  }

  return tampoesDoMetal.filter((tampao) => ph >= tampao.phMin && ph <= tampao.phMax);
}