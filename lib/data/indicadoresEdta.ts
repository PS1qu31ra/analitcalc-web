export type IndicadorEdta = {
  idIndicador: string;
  indicador: string;
  metaisRecomendados: string[];
  phMin: number;
  phMax: number;
  corLivre: string;
  corComplexado: string;
  aplicacao: string;
  observacao: string;
  pMMin: number;
  pMMax: number;
  metalPreferencial: string;
  prioridade: number;
  referencia: string;
};

export const indicadoresEdta: IndicadorEdta[] = [
  {
    idIndicador: "EBT",
    indicador: "Negro de Eriocromo T",
    metaisRecomendados: ["Ba2+", "Ca2+", "Mg2+", "Zn2+"],
    phMin: 7.5,
    phMax: 10.5,
    corLivre: "Azul",
    corComplexado: "Vermelho-vinho",
    aplicacao: "Titulações de dureza total e complexometria de Ca2+, Mg2+, Zn2+ e Ba2+",
    observacao:
      "Indicador clássico em tampão amônia/amônio. Forma livre azul na faixa usual de trabalho; complexo metal-indicador vermelho-vinho.",
    pMMin: 6.5,
    pMMax: 9,
    metalPreferencial: "Mg2+",
    prioridade: 100,
    referencia: "Tabela de indicadores metalocrômicos; Harris; Skoog; Vogel",
  },
  {
    idIndicador: "CALMAGITA",
    indicador: "Calmagita",
    metaisRecomendados: ["Ba2+", "Ca2+", "Mg2+", "Zn2+"],
    phMin: 9,
    phMax: 11,
    corLivre: "Azul",
    corComplexado: "Vermelho-vinho",
    aplicacao: "Titulações de dureza total e metais alcalino-terrosos",
    observacao:
      "Alternativa ao Negro de Eriocromo T. Na faixa útil, o indicador livre é azul e o complexo metal-indicador é vermelho-vinho.",
    pMMin: 6.5,
    pMMax: 9,
    metalPreferencial: "Mg2+",
    prioridade: 95,
    referencia: "Tabela de indicadores metalocrômicos; Harris; Skoog; Vogel",
  },
  {
    idIndicador: "CALCON",
    indicador: "Calcon",
    metaisRecomendados: ["Ca2+", "Mg2+"],
    phMin: 11,
    phMax: 13,
    corLivre: "Azul",
    corComplexado: "Vermelho",
    aplicacao: "Titulação seletiva de cálcio",
    observacao:
      "Muito utilizado para determinação de cálcio em meio alcalino",
    pMMin: 5.5,
    pMMax: 8,
    metalPreferencial: "Ca2+",
    prioridade: 95,
    referencia: "Vogel; Mendham",
  },
  {
    idIndicador: "PATTON_REEDER",
    indicador: "Patton-Reeder",
    metaisRecomendados: ["Ca2+"],
    phMin: 12,
    phMax: 13,
    corLivre: "Rosa",
    corComplexado: "Azul",
    aplicacao: "Titulação seletiva de cálcio",
    observacao: "Melhor seletividade para Ca2+ na presença de Mg2+",
    pMMin: 6,
    pMMax: 8,
    metalPreferencial: "Ca2+",
    prioridade: 100,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "MUREXIDA",
    indicador: "Murexida",
    metaisRecomendados: ["Ca2+", "Ni2+", "Cu2+"],
    phMin: 6,
    phMax: 13,
    corLivre: "Violeta/Azul dependendo do pH",
    corComplexado: "Vermelho com Ca2+; amarelo com Co2+, Ni2+ e Cu2+",
    aplicacao: "Titulação seletiva de cálcio e aplicações com Ni2+ e Cu2+",
    observacao:
      "Indicador útil em ampla faixa de pH. Para Ca2+, a coloração do complexo é descrita como vermelha; para Ni2+ e Cu2+, pode ocorrer coloração amarela.",
    pMMin: 5.5,
    pMMax: 8,
    metalPreferencial: "Ca2+",
    prioridade: 100,
    referencia: "Tabela de indicadores metalocrômicos; Harris; Vogel; Skoog",
  },
  {
    idIndicador: "CALCEIN",
    indicador: "Calceína",
    metaisRecomendados: ["Ca2+", "Mg2+"],
    phMin: 11,
    phMax: 13,
    corLivre: "Verde fluorescente",
    corComplexado: "Laranja",
    aplicacao: "Complexometria de cálcio e magnésio",
    observacao: "Indicador fluorescente de alta sensibilidade",
    pMMin: 5.5,
    pMMax: 8,
    metalPreferencial: "Ca2+",
    prioridade: 90,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "METALPHTHALEIN",
    indicador: "Metalftaleína",
    metaisRecomendados: ["Mg2+", "Ca2+"],
    phMin: 9,
    phMax: 11,
    corLivre: "Azul",
    corComplexado: "Vermelho",
    aplicacao: "Titulação de magnésio",
    observacao: "Boa alternativa para Mg2+",
    pMMin: 6.5,
    pMMax: 8.5,
    metalPreferencial: "Mg2+",
    prioridade: 90,
    referencia: "Vogel; Mendham",
  },
  {
    idIndicador: "FAST_SULPHON_BLACK",
    indicador: "Fast Sulphon Black F",
    metaisRecomendados: ["Ca2+", "Mg2+"],
    phMin: 8,
    phMax: 11,
    corLivre: "Azul",
    corComplexado: "Vermelho",
    aplicacao: "Titulações de dureza",
    observacao: "Indicador semelhante ao EBT",
    pMMin: 6.5,
    pMMax: 8.5,
    metalPreferencial: "Mg2+",
    prioridade: 85,
    referencia: "Vogel; Mendham",
  },
  {
    idIndicador: "PAN",
    indicador: "PAN",
    metaisRecomendados: ["Cd2+", "Cu2+", "Zn2+"],
    phMin: 2,
    phMax: 11,
    corLivre: "Amarelo",
    corComplexado: "Vermelho",
    aplicacao: "Titulações de metais de transição, especialmente Cd2+, Cu2+ e Zn2+",
    observacao:
      "Indicador azo útil em ampla faixa de pH. A tabela consultada indica aplicação principal para Cd2+, Cu2+ e Zn2+.",
    pMMin: 5,
    pMMax: 8.5,
    metalPreferencial: "Cu2+",
    prioridade: 95,
    referencia: "Tabela de indicadores metalocrômicos; Harris; Skoog; Vogel",
  },
  {
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    metaisRecomendados: ["Zn2+", "Cd2+", "Co2+", "Ni2+", "Cu2+", "Pb2+"],
    phMin: 5,
    phMax: 10,
    corLivre: "Amarelo",
    corComplexado: "Vermelho",
    aplicacao: "Complexometria geral",
    observacao: "Indicador versátil para diversos metais",
    pMMin: 5,
    pMMax: 8.5,
    metalPreferencial: "Zn2+",
    prioridade: 90,
    referencia: "Harris; Skoog; Vogel",
  },
  {
    idIndicador: "TAN",
    indicador: "TAN",
    metaisRecomendados: ["Cu2+", "Ni2+", "Co2+", "Zn2+"],
    phMin: 4,
    phMax: 9,
    corLivre: "Amarelo",
    corComplexado: "Vermelho",
    aplicacao: "Metais de transição",
    observacao: "Alta sensibilidade para complexação com EDTA",
    pMMin: 5,
    pMMax: 8.5,
    metalPreferencial: "Ni2+",
    prioridade: 85,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "PYROCATECHOL_VIOLET",
    indicador: "Pirocatecol Violeta",
    metaisRecomendados: ["Cu2+", "Zn2+", "Al3+", "Bi3+"],
    phMin: 4,
    phMax: 7,
    corLivre: "Amarelo",
    corComplexado: "Azul-violeta",
    aplicacao: "Titulações de metais de transição",
    observacao: "Alta sensibilidade para metais traço",
    pMMin: 4.5,
    pMMax: 7.5,
    metalPreferencial: "Cu2+",
    prioridade: 90,
    referencia: "Harris; Skoog; Vogel",
  },
  {
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    metaisRecomendados: ["Fe3+", "Al3+", "Pb2+", "Zn2+", "Bi3+"],
    phMin: 2,
    phMax: 6,
    corLivre: "Amarelo",
    corComplexado: "Vermelho",
    aplicacao: "Titulações em meio ácido",
    observacao:
      "Muito utilizado para Fe3+, Al3+ e metais em meio ácido",
    pMMin: 3.5,
    pMMax: 6.5,
    metalPreferencial: "Fe3+",
    prioridade: 100,
    referencia: "Harris; Skoog; Vogel",
  },
  {
    idIndicador: "XYLENOL_BLUE",
    indicador: "Azul de Xilenol",
    metaisRecomendados: ["Al3+", "Fe3+", "Zn2+"],
    phMin: 3,
    phMax: 6,
    corLivre: "Amarelo",
    corComplexado: "Azul",
    aplicacao: "Metais em meio ácido",
    observacao: "Alternativa visual para sistemas ácidos",
    pMMin: 3.5,
    pMMax: 6.5,
    metalPreferencial: "Al3+",
    prioridade: 75,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    metaisRecomendados: ["Pb2+", "Cd2+", "Zn2+", "Cu2+", "Ag+"],
    phMin: 5,
    phMax: 10,
    corLivre: "Verde",
    corComplexado: "Vermelho",
    aplicacao: "Metais pesados",
    observacao:
      "Útil para metais pesados e extrações complexométricas",
    pMMin: 4.5,
    pMMax: 8,
    metalPreferencial: "Pb2+",
    prioridade: 80,
    referencia: "Vogel; Skoog",
  },
  {
    idIndicador: "DIMETHYLGLYOXIME",
    indicador: "Dimetilglioxima",
    metaisRecomendados: ["Ni2+"],
    phMin: 8,
    phMax: 10,
    corLivre: "Incolor",
    corComplexado: "Vermelho",
    aplicacao: "Determinação de níquel",
    observacao:
      "Mais seletiva para Ni2+ do que para titulações gerais",
    pMMin: 5,
    pMMax: 8,
    metalPreferencial: "Ni2+",
    prioridade: 85,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "SULFOSALICYLIC",
    indicador: "Ácido Sulfosalicílico",
    metaisRecomendados: ["Fe3+"],
    phMin: 1,
    phMax: 3,
    corLivre: "Incolor",
    corComplexado: "Violeta",
    aplicacao: "Determinação de ferro",
    observacao: "Indicador para Fe3+ em meio fortemente ácido",
    pMMin: 2.5,
    pMMax: 5,
    metalPreferencial: "Fe3+",
    prioridade: 85,
    referencia: "Vogel; Harris",
  },
  {
    idIndicador: "ALIZARIN_COMPLEXONE",
    indicador: "Alizarina Complexona",
    metaisRecomendados: ["Al3+", "Ca2+", "Mg2+"],
    phMin: 4,
    phMax: 9,
    corLivre: "Vermelho",
    corComplexado: "Violeta",
    aplicacao: "Complexometria e fluorometria",
    observacao:
      "Indicador útil em sistemas com alumínio e cálcio",
    pMMin: 4.5,
    pMMax: 8,
    metalPreferencial: "Al3+",
    prioridade: 75,
    referencia: "Harris; Vogel",
  },
  {
    idIndicador: "MORDANT_BLACK_11",
    indicador: "Mordant Black 11",
    metaisRecomendados: ["Ca2+", "Mg2+", "Zn2+"],
    phMin: 8,
    phMax: 11,
    corLivre: "Azul",
    corComplexado: "Vermelho-vinho",
    aplicacao: "Determinação de dureza",
    observacao: "Indicador semelhante ao EBT",
    pMMin: 6.5,
    pMMax: 9,
    metalPreferencial: "Mg2+",
    prioridade: 80,
    referencia: "Vogel; Mendham",
  },
    {
      idIndicador: "ERIOCHROME_BLUE_BLACK_R",
      indicador: "Eriochrome Blue Black R",
      metaisRecomendados: ["Ca2+", "Mg2+", "Zn2+", "Cu2+"],
      phMin: 8,
      phMax: 12,
      corLivre: "Azul",
      corComplexado: "Vermelho-vinho",
      aplicacao: "Complexometria geral de Ca2+, Mg2+, Zn2+ e Cu2+",
      observacao:
        "Alternativa ao EBT em algumas metodologias. A tabela consultada indica faixa útil de pH 8–12.",
      pMMin: 6.5,
      pMMax: 9,
      metalPreferencial: "Mg2+",
      prioridade: 80,
      referencia: "Tabela de indicadores metalocrômicos; Vogel; Mendham",
    },
  {
    idIndicador: "SOLOCHROME_DARK_BLUE",
    indicador: "Solochrome Dark Blue",
    metaisRecomendados: ["Ca2+", "Mg2+"],
    phMin: 8,
    phMax: 11,
    corLivre: "Azul",
    corComplexado: "Vermelho",
    aplicacao: "Titulações de dureza",
    observacao: "Indicador clássico para águas",
    pMMin: 6.5,
    pMMax: 9,
    metalPreferencial: "Mg2+",
    prioridade: 80,
    referencia: "Vogel; Mendham",
  },
  {
    idIndicador: "CHROME_AZUROL_S",
    indicador: "Chrome Azurol S",
    metaisRecomendados: ["Al3+", "Fe3+", "Cu2+"],
    phMin: 3,
    phMax: 7,
    corLivre: "Azul",
    corComplexado: "Vermelho",
    aplicacao: "Metais traço",
    observacao:
      "Alta sensibilidade para análises de metais traço",
    pMMin: 4,
    pMMax: 7,
    metalPreferencial: "Al3+",
    prioridade: 75,
    referencia: "Harris; Skoog",
  },
];

export function buscarIndicadorEdtaPorId(
  idIndicador: string
): IndicadorEdta | undefined {
  return indicadoresEdta.find(
    (item) =>
      item.idIndicador.toUpperCase() === idIndicador.toUpperCase()
  );
}

export function listarIndicadoresPorMetalEdta(
  metal: string
): IndicadorEdta[] {
  return indicadoresEdta
    .filter((item) =>
      item.metaisRecomendados.some(
        (metalRecomendado) =>
          metalRecomendado.toUpperCase() === metal.toUpperCase()
      )
    )
    .sort((a, b) => b.prioridade - a.prioridade);
}

export function listarIndicadoresNaFaixaDePhEdta(
  ph: number
): IndicadorEdta[] {
  return indicadoresEdta
    .filter((item) => ph >= item.phMin && ph <= item.phMax)
    .sort((a, b) => b.prioridade - a.prioridade);
}

export function listarIndicadoresNaFaixaDePmEdta(
  pM: number
): IndicadorEdta[] {
  return indicadoresEdta
    .filter((item) => pM >= item.pMMin && pM <= item.pMMax)
    .sort((a, b) => b.prioridade - a.prioridade);
}

export function sugerirIndicadoresEdta(params: {
  metal?: string;
  ph?: number;
  pM?: number;
}): IndicadorEdta[] {
  const { metal, ph, pM } = params;

  return indicadoresEdta
    .filter((item) => {
      const metalOk =
        !metal ||
        item.metaisRecomendados.some(
          (metalRecomendado) =>
            metalRecomendado.toUpperCase() === metal.toUpperCase()
        );

      const phOk =
        typeof ph !== "number" || (ph >= item.phMin && ph <= item.phMax);

      const pmOk =
        typeof pM !== "number" || (pM >= item.pMMin && pM <= item.pMMax);

      return metalOk && phOk && pmOk;
    })
    .sort((a, b) => b.prioridade - a.prioridade);
}

export function verificarIndicadorEdta(params: {
  idIndicador: string;
  ph?: number;
  pM?: number;
}) {
  const { idIndicador, ph, pM } = params;
  const indicador = buscarIndicadorEdtaPorId(idIndicador);

  if (!indicador) {
    return {
      encontrado: false,
      adequado: false,
      mensagem: "Indicador não encontrado na base de dados.",
    };
  }

  const phOk =
    typeof ph !== "number" || (ph >= indicador.phMin && ph <= indicador.phMax);

  const pmOk =
    typeof pM !== "number" || (pM >= indicador.pMMin && pM <= indicador.pMMax);

  const adequado = phOk && pmOk;

  return {
    encontrado: true,
    adequado,
    indicador,
    mensagem: adequado
      ? `${indicador.indicador} é compatível com as condições informadas.`
      : `${indicador.indicador} pode não ser adequado para as condições informadas. Faixa de pH: ${indicador.phMin} a ${indicador.phMax}; faixa de pM: ${indicador.pMMin} a ${indicador.pMMax}.`,
  };
}