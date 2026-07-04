export type ConstanteIndicador = {
  idRegra: string;
  idIndicador: string;
  indicador: string;
  idMetal: string;
  metal: string;
  logKMIn: number;
  referencia: string;
  observacao: string;
  origem?: "literatura" | "estimado";
};

export const constantesIndicadores: ConstanteIndicador[] = [
  {
    idRegra: "IND_EBT_MG",
    idIndicador: "EBT",
    indicador: "Negro de Eriocromo T",
    idMetal: "MG",
    metal: "Mg2+",
    logKMIn: 7,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Mg-indicador usado na viragem do EBT",
  },
  {
    idRegra: "IND_EBT_CA",
    idIndicador: "EBT",
    indicador: "Negro de Eriocromo T",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 5.4,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Ca-indicador menos estável que Mg-indicador",
  },
  {
    idRegra: "IND_CALMAGITA_MG",
    idIndicador: "CALMAGITA",
    indicador: "Calmagita",
    idMetal: "MG",
    metal: "Mg2+",
    logKMIn: 7,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Mg-Calmagita usado em titulações de dureza",
  },
  {
    idRegra: "IND_CALMAGITA_CA",
    idIndicador: "CALMAGITA",
    indicador: "Calmagita",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 5.5,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Ca-Calmagita menos estável que Mg-Calmagita",
  },
  {
    idRegra: "IND_MUREXIDA_CA",
    idIndicador: "MUREXIDA",
    indicador: "Murexida",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 7.2,
    referencia: "Harris; Vogel",
    observacao: "Indicador clássico para cálcio em pH alcalino",
  },
  {
    idRegra: "IND_PATTON_CA",
    idIndicador: "PATTON_REEDER",
    indicador: "Patton-Reeder",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 7,
    referencia: "Vogel; Harris",
    observacao: "Indicador seletivo para cálcio em pH elevado",
  },
  {
    idRegra: "IND_CALCON_CA",
    idIndicador: "CALCON",
    indicador: "Calcon",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 7,
    referencia: "Vogel; Mendham",
    observacao: "Indicador usado para cálcio em meio alcalino",
  },
  {
    idRegra: "IND_XO_FE3",
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    idMetal: "FE3",
    metal: "Fe3+",
    logKMIn: 6,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Indicador usado em meio ácido para Fe3+",
  },
  {
    idRegra: "IND_XO_AL",
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    idMetal: "AL",
    metal: "Al3+",
    logKMIn: 5.5,
    referencia: "Harris; Vogel",
    observacao: "Complexo Al-XO em meio ácido",
  },
  {
    idRegra: "IND_XO_ZN",
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 5.8,
    referencia: "Harris; Skoog",
    observacao: "Complexo Zn-XO em meio ácido",
  },
  {
    idRegra: "IND_PAN_CU",
    idIndicador: "PAN",
    indicador: "PAN",
    idMetal: "CU",
    metal: "Cu2+",
    logKMIn: 8,
    referencia: "Harris; Vogel",
    observacao: "Complexo colorido Cu-PAN",
  },
  {
    idRegra: "IND_PAN_ZN",
    idIndicador: "PAN",
    indicador: "PAN",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 7.5,
    referencia: "Harris; Vogel",
    observacao: "Complexo Zn-PAN",
  },
  {
    idRegra: "IND_PAN_NI",
    idIndicador: "PAN",
    indicador: "PAN",
    idMetal: "NI",
    metal: "Ni2+",
    logKMIn: 7.6,
    referencia: "Harris; Vogel",
    observacao: "Complexo Ni-PAN",
  },
  {
    idRegra: "IND_PAR_ZN",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 7.5,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Zn-PAR",
  },
  {
    idRegra: "IND_PAR_CD",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "CD",
    metal: "Cd2+",
    logKMIn: 7.2,
    referencia: "Harris; Vogel",
    observacao: "Complexo Cd-PAR",
  },
  {
    idRegra: "IND_PAR_NI",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "NI",
    metal: "Ni2+",
    logKMIn: 7.4,
    referencia: "Harris; Vogel",
    observacao: "Complexo Ni-PAR",
  },
  {
    idRegra: "IND_TAN_NI",
    idIndicador: "TAN",
    indicador: "TAN",
    idMetal: "NI",
    metal: "Ni2+",
    logKMIn: 7.6,
    referencia: "Vogel; Harris",
    observacao: "Complexo Ni-TAN",
  },
  {
    idRegra: "IND_PV_CU",
    idIndicador: "PYROCATECHOL_VIOLET",
    indicador: "Pirocatecol Violeta",
    idMetal: "CU",
    metal: "Cu2+",
    logKMIn: 6.5,
    referencia: "Harris; Skoog; Vogel",
    observacao: "Complexo Cu-pirocatecol violeta",
  },
  {
    idRegra: "IND_PV_AL",
    idIndicador: "PYROCATECHOL_VIOLET",
    indicador: "Pirocatecol Violeta",
    idMetal: "AL",
    metal: "Al3+",
    logKMIn: 6,
    referencia: "Harris; Vogel",
    observacao: "Complexo Al-pirocatecol violeta",
  },
  {
    idRegra: "IND_DITHIZONE_PB",
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    idMetal: "PB",
    metal: "Pb2+",
    logKMIn: 6.5,
    referencia: "Vogel; Skoog",
    observacao: "Complexo Pb-ditizona",
  },
  {
    idRegra: "IND_DMG_NI",
    idIndicador: "DIMETHYLGLYOXIME",
    indicador: "Dimetilglioxima",
    idMetal: "NI",
    metal: "Ni2+",
    logKMIn: 7,
    referencia: "Vogel; Harris",
    observacao: "Complexo Ni-dimetilglioxima",
  },
  {
    idRegra: "IND_SULFO_FE3",
    idIndicador: "SULFOSALICYLIC",
    indicador: "Ácido Sulfosalicílico",
    idMetal: "FE3",
    metal: "Fe3+",
    logKMIn: 4.5,
    referencia: "Vogel; Harris",
    observacao: "Complexo Fe3+-sulfosalicilato",
  },
  {
    idRegra: "IND_THORIN_TH",
    idIndicador: "THORIN",
    indicador: "Thorin",
    idMetal: "TH4",
    metal: "Th4+",
    logKMIn: 4.5,
    referencia: "Vogel; Skoog",
    observacao: "Complexo Th-Thorin",
  },
  {
    idRegra: "IND_ARSENAZO_TH",
    idIndicador: "ARSENAZO_III",
    indicador: "Arsenazo III",
    idMetal: "TH4",
    metal: "Th4+",
    logKMIn: 4.5,
    referencia: "Vogel; Skoog",
    observacao: "Complexo Th-Arsenazo III",
  },
  {
    idRegra: "IND_ARSENAZO_UO2",
    idIndicador: "ARSENAZO_III",
    indicador: "Arsenazo III",
    idMetal: "UO2",
    metal: "UO2 2+",
    logKMIn: 4.3,
    referencia: "Vogel; Skoog",
    observacao: "Complexo uranila-Arsenazo III",
  },
  {
    idRegra: "IND_EBT_ZN_EST",
    idIndicador: "EBT",
    indicador: "Negro de Eriocromo T",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 7.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 6,5–9,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_CALMAGITA_ZN_EST",
    idIndicador: "CALMAGITA",
    indicador: "Calmagita",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 7.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 6,5–9,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PAN_CD_EST",
    idIndicador: "PAN",
    indicador: "PAN",
    idMetal: "CD",
    metal: "Cd2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PAN_CO_EST",
    idIndicador: "PAN",
    indicador: "PAN",
    idMetal: "CO",
    metal: "Co2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PAR_CO_EST",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "CO",
    metal: "Co2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PAR_CU_EST",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "CU",
    metal: "Cu2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PAR_PB_EST",
    idIndicador: "PAR",
    indicador: "4-(2-Piridilazo)-resorcinol",
    idMetal: "PB",
    metal: "Pb2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_TAN_CU_EST",
    idIndicador: "TAN",
    indicador: "TAN",
    idMetal: "CU",
    metal: "Cu2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_TAN_CO_EST",
    idIndicador: "TAN",
    indicador: "TAN",
    idMetal: "CO",
    metal: "Co2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_TAN_ZN_EST",
    idIndicador: "TAN",
    indicador: "TAN",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 6.75,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 5,0–8,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PV_ZN_EST",
    idIndicador: "PYROCATECHOL_VIOLET",
    indicador: "Pirocatecol Violeta",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 6,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–7,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_PV_BI3_EST",
    idIndicador: "PYROCATECHOL_VIOLET",
    indicador: "Pirocatecol Violeta",
    idMetal: "BI3",
    metal: "Bi3+",
    logKMIn: 6,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–7,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_XO_PB_EST",
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    idMetal: "PB",
    metal: "Pb2+",
    logKMIn: 5,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 3,5–6,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_XO_BI3_EST",
    idIndicador: "XO",
    indicador: "Laranja de Xilenol",
    idMetal: "BI3",
    metal: "Bi3+",
    logKMIn: 5,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 3,5–6,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_XYLENOL_BLUE_ZN_EST",
    idIndicador: "XYLENOL_BLUE",
    indicador: "Azul de Xilenol",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 5,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 3,5–6,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_XYLENOL_BLUE_AL_EST",
    idIndicador: "XYLENOL_BLUE",
    indicador: "Azul de Xilenol",
    idMetal: "AL",
    metal: "Al3+",
    logKMIn: 5,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 3,5–6,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_XYLENOL_BLUE_FE3_EST",
    idIndicador: "XYLENOL_BLUE",
    indicador: "Azul de Xilenol",
    idMetal: "FE3",
    metal: "Fe3+",
    logKMIn: 5,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 3,5–6,5. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_DITHIZONE_CD_EST",
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    idMetal: "CD",
    metal: "Cd2+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_DITHIZONE_ZN_EST",
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    idMetal: "ZN",
    metal: "Zn2+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_DITHIZONE_CU_EST",
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    idMetal: "CU",
    metal: "Cu2+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_DITHIZONE_AG_EST",
    idIndicador: "DITHIZONE",
    indicador: "Ditizona",
    idMetal: "AG",
    metal: "Ag+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_ALIZARIN_AL_EST",
    idIndicador: "ALIZARIN_COMPLEXONE",
    indicador: "Alizarina Complexona",
    idMetal: "AL",
    metal: "Al3+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_ALIZARIN_CA_EST",
    idIndicador: "ALIZARIN_COMPLEXONE",
    indicador: "Alizarina Complexona",
    idMetal: "CA",
    metal: "Ca2+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
  {
    idRegra: "IND_ALIZARIN_MG_EST",
    idIndicador: "ALIZARIN_COMPLEXONE",
    indicador: "Alizarina Complexona",
    idMetal: "MG",
    metal: "Mg2+",
    logKMIn: 6.25,
    referencia: "Estimado a partir da faixa pM cadastrada no AnalitCalc",
    observacao:
      "Valor estimado internamente: média da faixa pM 4,5–8,0. Substituir por valor de literatura quando disponível.",
    origem: "estimado",
  },
];

export function buscarConstanteIndicadorPorId(
  idRegra: string
): ConstanteIndicador | undefined {
  return constantesIndicadores.find(
    (item) => item.idRegra.toUpperCase() === idRegra.toUpperCase()
  );
}

export function buscarConstanteIndicador(
  idIndicador: string,
  idMetal: string
): ConstanteIndicador | undefined {
  return constantesIndicadores.find(
    (item) =>
      item.idIndicador.toUpperCase() === idIndicador.toUpperCase() &&
      item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function listarConstantesPorIndicador(
  idIndicador: string
): ConstanteIndicador[] {
  return constantesIndicadores.filter(
    (item) => item.idIndicador.toUpperCase() === idIndicador.toUpperCase()
  );
}

export function listarConstantesPorMetal(
  idMetal: string
): ConstanteIndicador[] {
  return constantesIndicadores.filter(
    (item) => item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function calcularKMIn(logKMIn: number): number {
  return Math.pow(10, logKMIn);
}

export function obterConstanteIndicadorComK(
  idIndicador: string,
  idMetal: string
) {
  const constante = buscarConstanteIndicador(idIndicador, idMetal);

  if (!constante) {
    return {
      encontrado: false,
      mensagem:
        "Não há constante cadastrada para esse par indicador-metal.",
    };
  }

  return {
    encontrado: true,
    constante,
    kMIn: calcularKMIn(constante.logKMIn),
    mensagem: `Constante encontrada para ${constante.indicador} com ${constante.metal}: logK = ${constante.logKMIn}.`,
  };
}