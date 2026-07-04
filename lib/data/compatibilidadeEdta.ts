export type RiscoInterferenciaEdta = "Baixo" | "Médio" | "Alto";

export type RegraCompatibilidadeEdta = {
  idRegra: string;
  metalPrincipal: string;
  interferente: string;
  problema: string;
  risco: RiscoInterferenciaEdta;
  mascaranteRecomendado: string | null;
  complexanteAuxiliar: string | null;
  tampaoRecomendado: string;
  acaoSistema: string;
};

export const regrasCompatibilidadeEdta: RegraCompatibilidadeEdta[] = [
  {
    idRegra: "REGRA_CA_MG",
    metalPrincipal: "Ca2+",
    interferente: "Mg2+",
    problema: "Mg2+ também reage com EDTA",
    risco: "Médio",
    mascaranteRecomendado: null,
    complexanteAuxiliar: null,
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência moderada",
  },
  {
    idRegra: "REGRA_MG_CA",
    metalPrincipal: "Mg2+",
    interferente: "Ca2+",
    problema: "Ca2+ compete por EDTA",
    risco: "Médio",
    mascaranteRecomendado: null,
    complexanteAuxiliar: null,
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência moderada",
  },
  {
    idRegra: "REGRA_CA_FE3",
    metalPrincipal: "Ca2+",
    interferente: "Fe3+",
    problema: "Fe3+ consome EDTA fortemente",
    risco: "Alto",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_MG_FE3",
    metalPrincipal: "Mg2+",
    interferente: "Fe3+",
    problema: "Fe3+ consome EDTA fortemente",
    risco: "Alto",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_ZN_CU",
    metalPrincipal: "Zn2+",
    interferente: "Cu2+",
    problema: "Cu2+ compete fortemente pelo EDTA",
    risco: "Alto",
    mascaranteRecomendado: "Tiossulfato",
    complexanteAuxiliar: null,
    tampaoRecomendado: "Acetato",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_CU_ZN",
    metalPrincipal: "Cu2+",
    interferente: "Zn2+",
    problema: "Zn2+ também forma complexo estável",
    risco: "Médio",
    mascaranteRecomendado: null,
    complexanteAuxiliar: null,
    tampaoRecomendado: "Acetato",
    acaoSistema: "Avisar competição moderada",
  },
  {
    idRegra: "REGRA_CU_FE3",
    metalPrincipal: "Cu2+",
    interferente: "Fe3+",
    problema: "Fe3+ compete fortemente pelo EDTA",
    risco: "Alto",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "Acetato",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_FE3_AL",
    metalPrincipal: "Fe3+",
    interferente: "Al3+",
    problema: "Al3+ pode complexar e hidrolisar",
    risco: "Médio",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "HCl/KCl",
    acaoSistema: "Avisar interferência moderada",
  },
  {
    idRegra: "REGRA_ZN_FE3",
    metalPrincipal: "Zn2+",
    interferente: "Fe3+",
    problema: "Fe3+ apresenta Kf muito superior",
    risco: "Alto",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "Acetato",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_CA_AL3",
    metalPrincipal: "Ca2+",
    interferente: "Al3+",
    problema: "Al3+ forma complexos estáveis e pode hidrolisar",
    risco: "Alto",
    mascaranteRecomendado: "Fluoreto",
    complexanteAuxiliar: "Citrato",
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_CA_CU",
    metalPrincipal: "Ca2+",
    interferente: "Cu2+",
    problema: "Cu2+ possui alta afinidade pelo EDTA",
    risco: "Alto",
    mascaranteRecomendado: "Tiossulfato",
    complexanteAuxiliar: null,
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência alta",
  },
  {
    idRegra: "REGRA_CA_ZN",
    metalPrincipal: "Ca2+",
    interferente: "Zn2+",
    problema: "Zn2+ compete pelo EDTA",
    risco: "Médio",
    mascaranteRecomendado: null,
    complexanteAuxiliar: null,
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência moderada",
  },
  {
    idRegra: "REGRA_CA_PB",
    metalPrincipal: "Ca2+",
    interferente: "Pb2+",
    problema: "Pb2+ forma complexo estável com EDTA",
    risco: "Alto",
    mascaranteRecomendado: "Citrato",
    complexanteAuxiliar: null,
    tampaoRecomendado: "NH3/NH4+",
    acaoSistema: "Avisar interferência alta",
  },
];

export function buscarCompatibilidadeEdta(
  metalPrincipal: string,
  interferente: string
): RegraCompatibilidadeEdta | undefined {
  return regrasCompatibilidadeEdta.find(
    (item) =>
      item.metalPrincipal.toUpperCase() === metalPrincipal.toUpperCase() &&
      item.interferente.toUpperCase() === interferente.toUpperCase()
  );
}

export function listarInterferentesPorMetalEdta(
  metalPrincipal: string
): RegraCompatibilidadeEdta[] {
  return regrasCompatibilidadeEdta.filter(
    (item) =>
      item.metalPrincipal.toUpperCase() === metalPrincipal.toUpperCase()
  );
}

export function listarRegrasPorRiscoEdta(
  risco: RiscoInterferenciaEdta
): RegraCompatibilidadeEdta[] {
  return regrasCompatibilidadeEdta.filter((item) => item.risco === risco);
}