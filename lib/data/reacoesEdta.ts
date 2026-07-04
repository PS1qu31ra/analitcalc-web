export type ReacaoEdta = {
  idReacao: string;
  idMetal: string;
  metal: string;
  formaEdtaReativa: string;
  reacaoGlobal: string;
  complexoFormado: string;
  cargaComplexo: number;
  proporcao: string;
  descricao: string;
};

export const reacoesEdta: ReacaoEdta[] = [
  {
    idReacao: "R_MG",
    idMetal: "MG",
    metal: "Mg2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Mg²⁺ + Y⁴⁻ ⇌ MgY²⁻",
    complexoFormado: "MgY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo magnésio-EDTA",
  },
  {
    idReacao: "R_CA",
    idMetal: "CA",
    metal: "Ca2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Ca²⁺ + Y⁴⁻ ⇌ CaY²⁻",
    complexoFormado: "CaY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo cálcio-EDTA",
  },
  {
    idReacao: "R_CU",
    idMetal: "CU",
    metal: "Cu2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Cu²⁺ + Y⁴⁻ ⇌ CuY²⁻",
    complexoFormado: "CuY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo cobre(II)-EDTA",
  },
  {
    idReacao: "R_ZN",
    idMetal: "ZN",
    metal: "Zn2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Zn²⁺ + Y⁴⁻ ⇌ ZnY²⁻",
    complexoFormado: "ZnY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo zinco-EDTA",
  },
  {
    idReacao: "R_FE3",
    idMetal: "FE3",
    metal: "Fe3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Fe³⁺ + Y⁴⁻ ⇌ FeY⁻",
    complexoFormado: "FeY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo ferro(III)-EDTA",
  },
  {
    idReacao: "R_AL",
    idMetal: "AL",
    metal: "Al3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Al³⁺ + Y⁴⁻ ⇌ AlY⁻",
    complexoFormado: "AlY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo alumínio-EDTA",
  },
  {
    idReacao: "R_PB",
    idMetal: "PB",
    metal: "Pb2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Pb²⁺ + Y⁴⁻ ⇌ PbY²⁻",
    complexoFormado: "PbY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo chumbo-EDTA",
  },
  {
    idReacao: "R_NI",
    idMetal: "NI",
    metal: "Ni2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Ni²⁺ + Y⁴⁻ ⇌ NiY²⁻",
    complexoFormado: "NiY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo níquel-EDTA",
  },
  {
    idReacao: "R_CO",
    idMetal: "CO",
    metal: "Co2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Co²⁺ + Y⁴⁻ ⇌ CoY²⁻",
    complexoFormado: "CoY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo cobalto-EDTA",
  },
  {
    idReacao: "R_CD",
    idMetal: "CD",
    metal: "Cd2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Cd²⁺ + Y⁴⁻ ⇌ CdY²⁻",
    complexoFormado: "CdY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo cádmio-EDTA",
  },
  {
    idReacao: "R_MN",
    idMetal: "MN",
    metal: "Mn2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Mn²⁺ + Y⁴⁻ ⇌ MnY²⁻",
    complexoFormado: "MnY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo manganês(II)-EDTA",
  },
  {
    idReacao: "R_AG",
    idMetal: "AG",
    metal: "Ag+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Ag⁺ + Y⁴⁻ ⇌ AgY³⁻",
    complexoFormado: "AgY3-",
    cargaComplexo: -3,
    proporcao: "1:1",
    descricao: "Complexo prata-EDTA",
  },
  {
    idReacao: "R_HG",
    idMetal: "HG",
    metal: "Hg2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Hg²⁺ + Y⁴⁻ ⇌ HgY²⁻",
    complexoFormado: "HgY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo mercúrio(II)-EDTA",
  },
  {
    idReacao: "R_BA",
    idMetal: "BA",
    metal: "Ba2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Ba²⁺ + Y⁴⁻ ⇌ BaY²⁻",
    complexoFormado: "BaY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo bário-EDTA",
  },
  {
    idReacao: "R_SR",
    idMetal: "SR",
    metal: "Sr2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Sr²⁺ + Y⁴⁻ ⇌ SrY²⁻",
    complexoFormado: "SrY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo estrôncio-EDTA",
  },
  {
    idReacao: "R_FE2",
    idMetal: "FE2",
    metal: "Fe2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Fe²⁺ + Y⁴⁻ ⇌ FeY²⁻",
    complexoFormado: "FeY2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo ferro(II)-EDTA",
  },
  {
    idReacao: "R_CR3",
    idMetal: "CR3",
    metal: "Cr3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Cr³⁺ + Y⁴⁻ ⇌ CrY⁻",
    complexoFormado: "CrY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo cromo(III)-EDTA",
  },
  {
    idReacao: "R_BI",
    idMetal: "BI3",
    metal: "Bi3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Bi³⁺ + Y⁴⁻ ⇌ BiY⁻",
    complexoFormado: "BiY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo bismuto-EDTA",
  },
  {
    idReacao: "R_TH",
    idMetal: "TH4",
    metal: "Th4+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Th⁴⁺ + Y⁴⁻ ⇌ ThY",
    complexoFormado: "ThY",
    cargaComplexo: 0,
    proporcao: "1:1",
    descricao: "Complexo tório-EDTA",
  },
  {
    idReacao: "R_ZR",
    idMetal: "ZR4",
    metal: "Zr4+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Zr⁴⁺ + Y⁴⁻ ⇌ ZrY",
    complexoFormado: "ZrY",
    cargaComplexo: 0,
    proporcao: "1:1",
    descricao: "Complexo zircônio-EDTA",
  },
  {
    idReacao: "R_LA",
    idMetal: "LA3",
    metal: "La3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "La³⁺ + Y⁴⁻ ⇌ LaY⁻",
    complexoFormado: "LaY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo lantânio-EDTA",
  },
  {
    idReacao: "R_CE",
    idMetal: "CE3",
    metal: "Ce3+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "Ce³⁺ + Y⁴⁻ ⇌ CeY⁻",
    complexoFormado: "CeY-",
    cargaComplexo: -1,
    proporcao: "1:1",
    descricao: "Complexo cério(III)-EDTA",
  },
  {
    idReacao: "R_UO2",
    idMetal: "UO2",
    metal: "UO2 2+",
    formaEdtaReativa: "Y4-",
    reacaoGlobal: "UO₂²⁺ + Y⁴⁻ ⇌ UO₂Y²⁻",
    complexoFormado: "UO2Y2-",
    cargaComplexo: -2,
    proporcao: "1:1",
    descricao: "Complexo uranila-EDTA",
  },
];

export function buscarReacaoEdtaPorIdMetal(
  idMetal: string
): ReacaoEdta | undefined {
  return reacoesEdta.find(
    (item) => item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function buscarReacaoEdtaPorIdReacao(
  idReacao: string
): ReacaoEdta | undefined {
  return reacoesEdta.find(
    (item) => item.idReacao.toUpperCase() === idReacao.toUpperCase()
  );
}

export function listarReacoesEdtaPorProporcao(proporcao: string): ReacaoEdta[] {
  return reacoesEdta.filter((item) => item.proporcao === proporcao);
}