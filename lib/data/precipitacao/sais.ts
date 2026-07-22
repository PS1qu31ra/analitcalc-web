import type {
  IonPrecipitacao,
  SalPrecipitacao,
  TipoEstudoPrecipitacao,
} from "../../precipitacao/tipos";

const ion = (
  id: string,
  nome: string,
  formula: string,
  formulaExibicao: string,
  carga: number
): IonPrecipitacao => ({
  id,
  nome,
  formula,
  formulaExibicao,
  carga,
});

const Ag = ion("Ag+", "íon prata", "Ag+", "Ag⁺", 1);
const Cu1 = ion("Cu+", "íon cobre(I)", "Cu+", "Cu⁺", 1);
const Cu2 = ion("Cu2+", "íon cobre(II)", "Cu2+", "Cu²⁺", 2);
const Hg2 = ion(
  "Hg2^2+",
  "íon mercúrio(I)",
  "Hg2^2+",
  "Hg₂²⁺",
  2
);
const Hg = ion(
  "Hg2+",
  "íon mercúrio(II)",
  "Hg2+",
  "Hg²⁺",
  2
);
const Pb = ion(
  "Pb2+",
  "íon chumbo(II)",
  "Pb2+",
  "Pb²⁺",
  2
);
const Ba = ion("Ba2+", "íon bário", "Ba2+", "Ba²⁺", 2);
const Sr = ion(
  "Sr2+",
  "íon estrôncio",
  "Sr2+",
  "Sr²⁺",
  2
);
const Ca = ion("Ca2+", "íon cálcio", "Ca2+", "Ca²⁺", 2);
const Mg = ion(
  "Mg2+",
  "íon magnésio",
  "Mg2+",
  "Mg²⁺",
  2
);
const Zn = ion("Zn2+", "íon zinco", "Zn2+", "Zn²⁺", 2);
const Cd = ion(
  "Cd2+",
  "íon cádmio",
  "Cd2+",
  "Cd²⁺",
  2
);
const Mn = ion(
  "Mn2+",
  "íon manganês(II)",
  "Mn2+",
  "Mn²⁺",
  2
);
const Fe2 = ion(
  "Fe2+",
  "íon ferro(II)",
  "Fe2+",
  "Fe²⁺",
  2
);
const Fe3 = ion(
  "Fe3+",
  "íon ferro(III)",
  "Fe3+",
  "Fe³⁺",
  3
);
const Co = ion(
  "Co2+",
  "íon cobalto(II)",
  "Co2+",
  "Co²⁺",
  2
);
const Ni = ion(
  "Ni2+",
  "íon níquel(II)",
  "Ni2+",
  "Ni²⁺",
  2
);
const Al = ion(
  "Al3+",
  "íon alumínio",
  "Al3+",
  "Al³⁺",
  3
);
const La = ion(
  "La3+",
  "íon lantânio",
  "La3+",
  "La³⁺",
  3
);
const Sn = ion(
  "Sn2+",
  "íon estanho(II)",
  "Sn2+",
  "Sn²⁺",
  2
);

const Cl = ion("Cl-", "íon cloreto", "Cl-", "Cl⁻", -1);
const Br = ion("Br-", "íon brometo", "Br-", "Br⁻", -1);
const I = ion("I-", "íon iodeto", "I-", "I⁻", -1);
const SCN = ion(
  "SCN-",
  "íon tiocianato",
  "SCN-",
  "SCN⁻",
  -1
);
const SO4 = ion(
  "SO4^2-",
  "íon sulfato",
  "SO4^2-",
  "SO₄²⁻",
  -2
);
const CO3 = ion(
  "CO3^2-",
  "íon carbonato",
  "CO3^2-",
  "CO₃²⁻",
  -2
);
const CrO4 = ion(
  "CrO4^2-",
  "íon cromato",
  "CrO4^2-",
  "CrO₄²⁻",
  -2
);
const IO3 = ion(
  "IO3-",
  "íon iodato",
  "IO3-",
  "IO₃⁻",
  -1
);
const F = ion("F-", "íon fluoreto", "F-", "F⁻", -1);
const OH = ion(
  "OH-",
  "íon hidróxido",
  "OH-",
  "OH⁻",
  -1
);
const C2O4 = ion(
  "C2O4^2-",
  "íon oxalato",
  "C2O4^2-",
  "C₂O₄²⁻",
  -2
);
const PO4 = ion(
  "PO4^3-",
  "íon fosfato",
  "PO4^3-",
  "PO₄³⁻",
  -3
);

const usosArgentometriaCompleta:
  TipoEstudoPrecipitacao[] = [
    "equilibrio",
    "titulacaoDireta",
    "titulacaoRetorno",
    "seletividade",
  ];

const usosArgentometriaDireta:
  TipoEstudoPrecipitacao[] = [
    "equilibrio",
    "titulacaoDireta",
    "seletividade",
  ];

const usosGerais:
  TipoEstudoPrecipitacao[] = [
    "equilibrio",
    "seletividade",
  ];

type DadosSal = Omit<
  SalPrecipitacao,
  "pKps"
>;

const criarSal = (
  dados: DadosSal
): SalPrecipitacao => ({
  ...dados,
  usos: [...dados.usos],
  pKps: -Math.log10(dados.kps),
});

export const saisPrecipitacao:
  SalPrecipitacao[] = [
    criarSal({
      id: "CuCl",
      nome: "cloreto de cobre(I)",
      formula: "CuCl",
      formulaExibicao: "CuCl",
      cation: Cu1,
      anion: Cl,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.9e-7,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "AgCl",
      nome: "cloreto de prata",
      formula: "AgCl",
      formulaExibicao: "AgCl",
      cation: Ag,
      anion: Cl,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.8e-10,
      corPrecipitado: "branco",
      usos: usosArgentometriaCompleta,
    }),

    criarSal({
      id: "Hg2Cl2",
      nome: "cloreto de mercúrio(I)",
      formula: "Hg2Cl2",
      formulaExibicao: "Hg₂Cl₂",
      cation: Hg2,
      anion: Cl,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.2e-18,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbCl2",
      nome: "cloreto de chumbo(II)",
      formula: "PbCl2",
      formulaExibicao: "PbCl₂",
      cation: Pb,
      anion: Cl,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.7e-5,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CuBr",
      nome: "brometo de cobre(I)",
      formula: "CuBr",
      formulaExibicao: "CuBr",
      cation: Cu1,
      anion: Br,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 5e-9,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "AgBr",
      nome: "brometo de prata",
      formula: "AgBr",
      formulaExibicao: "AgBr",
      cation: Ag,
      anion: Br,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 5e-13,
      corPrecipitado: "creme",
      usos: usosArgentometriaCompleta,
    }),

    criarSal({
      id: "Hg2Br2",
      nome: "brometo de mercúrio(I)",
      formula: "Hg2Br2",
      formulaExibicao: "Hg₂Br₂",
      cation: Hg2,
      anion: Br,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 5.6e-23,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbBr2",
      nome: "brometo de chumbo(II)",
      formula: "PbBr2",
      formulaExibicao: "PbBr₂",
      cation: Pb,
      anion: Br,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 2.1e-6,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "AgI",
      nome: "iodeto de prata",
      formula: "AgI",
      formulaExibicao: "AgI",
      cation: Ag,
      anion: I,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 8.3e-17,
      corPrecipitado: "amarelo",
      usos: usosArgentometriaCompleta,
    }),

    criarSal({
      id: "Hg2I2",
      nome: "iodeto de mercúrio(I)",
      formula: "Hg2I2",
      formulaExibicao: "Hg₂I₂",
      cation: Hg2,
      anion: I,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 4.7e-29,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbI2",
      nome: "iodeto de chumbo(II)",
      formula: "PbI2",
      formulaExibicao: "PbI₂",
      cation: Pb,
      anion: I,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 7.9e-9,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaSO4",
      nome: "sulfato de cálcio",
      formula: "CaSO4",
      formulaExibicao: "CaSO₄",
      cation: Ca,
      anion: SO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 2.4e-5,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "SrSO4",
      nome: "sulfato de estrôncio",
      formula: "SrSO4",
      formulaExibicao: "SrSO₄",
      cation: Sr,
      anion: SO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 3.2e-7,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaSO4",
      nome: "sulfato de bário",
      formula: "BaSO4",
      formulaExibicao: "BaSO₄",
      cation: Ba,
      anion: SO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.1e-10,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "Ag2SO4",
      nome: "sulfato de prata",
      formula: "Ag2SO4",
      formulaExibicao: "Ag₂SO₄",
      cation: Ag,
      anion: SO4,
      coeficienteCation: 2,
      coeficienteAnion: 1,
      kps: 1.5e-5,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "Hg2SO4",
      nome: "sulfato de mercúrio(I)",
      formula: "Hg2SO4",
      formulaExibicao: "Hg₂SO₄",
      cation: Hg2,
      anion: SO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 7.4e-7,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbSO4",
      nome: "sulfato de chumbo(II)",
      formula: "PbSO4",
      formulaExibicao: "PbSO₄",
      cation: Pb,
      anion: SO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.6e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "MgCO3",
      nome: "carbonato de magnésio",
      formula: "MgCO3",
      formulaExibicao: "MgCO₃",
      cation: Mg,
      anion: CO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 3.5e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaCO3",
      nome: "carbonato de cálcio",
      formula: "CaCO3",
      formulaExibicao: "CaCO₃",
      cation: Ca,
      anion: CO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 4.5e-9,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "SrCO3",
      nome: "carbonato de estrôncio",
      formula: "SrCO3",
      formulaExibicao: "SrCO₃",
      cation: Sr,
      anion: CO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 9.3e-10,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaCO3",
      nome: "carbonato de bário",
      formula: "BaCO3",
      formulaExibicao: "BaCO₃",
      cation: Ba,
      anion: CO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 5e-9,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "Ag2CO3",
      nome: "carbonato de prata",
      formula: "Ag2CO3",
      formulaExibicao: "Ag₂CO₃",
      cation: Ag,
      anion: CO3,
      coeficienteCation: 2,
      coeficienteAnion: 1,
      kps: 8.1e-12,
      corPrecipitado: "amarelo-claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbCO3",
      nome: "carbonato de chumbo(II)",
      formula: "PbCO3",
      formulaExibicao: "PbCO₃",
      cation: Pb,
      anion: CO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 7.4e-14,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaCrO4",
      nome: "cromato de bário",
      formula: "BaCrO4",
      formulaExibicao: "BaCrO₄",
      cation: Ba,
      anion: CrO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 2.1e-10,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "CuCrO4",
      nome: "cromato de cobre(II)",
      formula: "CuCrO4",
      formulaExibicao: "CuCrO₄",
      cation: Cu2,
      anion: CrO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 3.6e-6,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "Ag2CrO4",
      nome: "cromato de prata",
      formula: "Ag2CrO4",
      formulaExibicao: "Ag₂CrO₄",
      cation: Ag,
      anion: CrO4,
      coeficienteCation: 2,
      coeficienteAnion: 1,
      kps: 1.2e-12,
      corPrecipitado: "vermelho-tijolo",
      observacao:
        "Precipitado indicador do método de Mohr; não é tratado como sistema principal de retrotitulação.",
      usos: usosArgentometriaDireta,
    }),

    criarSal({
      id: "Hg2CrO4",
      nome: "cromato de mercúrio(I)",
      formula: "Hg2CrO4",
      formulaExibicao: "Hg₂CrO₄",
      cation: Hg2,
      anion: CrO4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 2e-9,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaIO32",
      nome: "iodato de cálcio",
      formula: "Ca(IO3)2",
      formulaExibicao: "Ca(IO₃)₂",
      cation: Ca,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 7.1e-7,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaIO32",
      nome: "iodato de bário",
      formula: "Ba(IO3)2",
      formulaExibicao: "Ba(IO₃)₂",
      cation: Ba,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.5e-9,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "AgIO3",
      nome: "iodato de prata",
      formula: "AgIO3",
      formulaExibicao: "AgIO₃",
      cation: Ag,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 3.1e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "ZnIO32",
      nome: "iodato de zinco",
      formula: "Zn(IO3)2",
      formulaExibicao: "Zn(IO₃)₂",
      cation: Zn,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 3.9e-6,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CdIO32",
      nome: "iodato de cádmio",
      formula: "Cd(IO3)2",
      formulaExibicao: "Cd(IO₃)₂",
      cation: Cd,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 2.3e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbIO32",
      nome: "iodato de chumbo(II)",
      formula: "Pb(IO3)2",
      formulaExibicao: "Pb(IO₃)₂",
      cation: Pb,
      anion: IO3,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 2.5e-13,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "MgF2",
      nome: "fluoreto de magnésio",
      formula: "MgF2",
      formulaExibicao: "MgF₂",
      cation: Mg,
      anion: F,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 6.6e-9,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaF2",
      nome: "fluoreto de cálcio",
      formula: "CaF2",
      formulaExibicao: "CaF₂",
      cation: Ca,
      anion: F,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 3.9e-11,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "SrF2",
      nome: "fluoreto de estrôncio",
      formula: "SrF2",
      formulaExibicao: "SrF₂",
      cation: Sr,
      anion: F,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 2.9e-9,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaF2",
      nome: "fluoreto de bário",
      formula: "BaF2",
      formulaExibicao: "BaF₂",
      cation: Ba,
      anion: F,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.7e-6,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbF2",
      nome: "fluoreto de chumbo(II)",
      formula: "PbF2",
      formulaExibicao: "PbF₂",
      cation: Pb,
      anion: F,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 3.6e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "MgOH2",
      nome: "hidróxido de magnésio",
      formula: "Mg(OH)2",
      formulaExibicao: "Mg(OH)₂",
      cation: Mg,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 7.1e-12,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaOH2",
      nome: "hidróxido de cálcio",
      formula: "Ca(OH)2",
      formulaExibicao: "Ca(OH)₂",
      cation: Ca,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 6.5e-6,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "LaOH3",
      nome: "hidróxido de lantânio",
      formula: "La(OH)3",
      formulaExibicao: "La(OH)₃",
      cation: La,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 3,
      kps: 2e-21,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "MnOH2",
      nome: "hidróxido de manganês(II)",
      formula: "Mn(OH)2",
      formulaExibicao: "Mn(OH)₂",
      cation: Mn,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.6e-13,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "FeOH2",
      nome: "hidróxido de ferro(II)",
      formula: "Fe(OH)2",
      formulaExibicao: "Fe(OH)₂",
      cation: Fe2,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 8e-16,
      corPrecipitado: "esverdeado",
      usos: usosGerais,
    }),

    criarSal({
      id: "CoOH2",
      nome: "hidróxido de cobalto(II)",
      formula: "Co(OH)2",
      formulaExibicao: "Co(OH)₂",
      cation: Co,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 1.3e-15,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "NiOH2",
      nome: "hidróxido de níquel(II)",
      formula: "Ni(OH)2",
      formulaExibicao: "Ni(OH)₂",
      cation: Ni,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 6e-16,
      corPrecipitado: "verde",
      usos: usosGerais,
    }),

    criarSal({
      id: "CuOH2",
      nome: "hidróxido de cobre(II)",
      formula: "Cu(OH)2",
      formulaExibicao: "Cu(OH)₂",
      cation: Cu2,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 4.8e-20,
      corPrecipitado: "azul",
      usos: usosGerais,
    }),

    criarSal({
      id: "FeOH3",
      nome: "hidróxido de ferro(III)",
      formula: "Fe(OH)3",
      formulaExibicao: "Fe(OH)₃",
      cation: Fe3,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 3,
      kps: 1.6e-39,
      corPrecipitado: "marrom",
      usos: usosGerais,
    }),

    criarSal({
      id: "AlOH3",
      nome: "hidróxido de alumínio",
      formula: "Al(OH)3",
      formulaExibicao: "Al(OH)₃",
      cation: Al,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 3,
      kps: 3e-34,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "HgO",
      nome: "óxido de mercúrio(II)",
      formula: "HgO",
      formulaExibicao: "HgO",
      cation: Hg,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 3.6e-26,
      corPrecipitado: "vermelho",
      observacao:
        "Constante expressa para HgO + H₂O ⇌ Hg²⁺ + 2OH⁻; OH⁻ representa a reação global com água.",
      usos: usosGerais,
    }),

    criarSal({
      id: "SnO",
      nome: "óxido de estanho(II)",
      formula: "SnO",
      formulaExibicao: "SnO",
      cation: Sn,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 6e-27,
      corPrecipitado: "claro",
      observacao:
        "Constante expressa para SnO + H₂O ⇌ Sn²⁺ + 2OH⁻; OH⁻ representa a reação global com água.",
      usos: usosGerais,
    }),

    criarSal({
      id: "PbO",
      nome: "óxido de chumbo(II)",
      formula: "PbO",
      formulaExibicao: "PbO",
      cation: Pb,
      anion: OH,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 8e-16,
      corPrecipitado: "amarelo",
      observacao:
        "Constante expressa para PbO + H₂O ⇌ Pb²⁺ + 2OH⁻; OH⁻ representa a reação global com água.",
      usos: usosGerais,
    }),

    criarSal({
      id: "Ag2O",
      nome: "óxido de prata",
      formula: "Ag2O",
      formulaExibicao: "Ag₂O",
      cation: Ag,
      anion: OH,
      coeficienteCation: 2,
      coeficienteAnion: 2,
      kps: 3.8e-16,
      corPrecipitado: "marrom",
      observacao:
        "Constante expressa para Ag₂O + H₂O ⇌ 2Ag⁺ + 2OH⁻; OH⁻ representa a reação global com água.",
      usos: usosGerais,
    }),

    criarSal({
      id: "Cu2O",
      nome: "óxido de cobre(I)",
      formula: "Cu2O",
      formulaExibicao: "Cu₂O",
      cation: Cu1,
      anion: OH,
      coeficienteCation: 2,
      coeficienteAnion: 2,
      kps: 4e-30,
      corPrecipitado: "vermelho",
      observacao:
        "Constante expressa para Cu₂O + H₂O ⇌ 2Cu⁺ + 2OH⁻; OH⁻ representa a reação global com água.",
      usos: usosGerais,
    }),

    criarSal({
      id: "CaC2O4",
      nome: "oxalato de cálcio",
      formula: "CaC2O4",
      formulaExibicao: "CaC₂O₄",
      cation: Ca,
      anion: C2O4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.3e-8,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "BaC2O4",
      nome: "oxalato de bário",
      formula: "BaC2O4",
      formulaExibicao: "BaC₂O₄",
      cation: Ba,
      anion: C2O4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1e-6,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "SrC2O4",
      nome: "oxalato de estrôncio",
      formula: "SrC2O4",
      formulaExibicao: "SrC₂O₄",
      cation: Sr,
      anion: C2O4,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 4e-7,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "Fe3PO42",
      nome: "fosfato de ferro(II)",
      formula: "Fe3(PO4)2",
      formulaExibicao: "Fe₃(PO₄)₂",
      cation: Fe2,
      anion: PO4,
      coeficienteCation: 3,
      coeficienteAnion: 2,
      kps: 1e-36,
      corPrecipitado: "claro",
      usos: usosGerais,
    }),

    criarSal({
      id: "Zn3PO42",
      nome: "fosfato de zinco",
      formula: "Zn3(PO4)2",
      formulaExibicao: "Zn₃(PO₄)₂",
      cation: Zn,
      anion: PO4,
      coeficienteCation: 3,
      coeficienteAnion: 2,
      kps: 5e-36,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "Ag3PO4",
      nome: "fosfato de prata",
      formula: "Ag3PO4",
      formulaExibicao: "Ag₃PO₄",
      cation: Ag,
      anion: PO4,
      coeficienteCation: 3,
      coeficienteAnion: 1,
      kps: 2.8e-18,
      corPrecipitado: "amarelo",
      usos: usosGerais,
    }),

    criarSal({
      id: "Pb3PO42",
      nome: "fosfato de chumbo(II)",
      formula: "Pb3(PO4)2",
      formulaExibicao: "Pb₃(PO₄)₂",
      cation: Pb,
      anion: PO4,
      coeficienteCation: 3,
      coeficienteAnion: 2,
      kps: 3e-44,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "CuSCN",
      nome: "tiocianato de cobre(I)",
      formula: "CuSCN",
      formulaExibicao: "CuSCN",
      cation: Cu1,
      anion: SCN,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 4e-14,
      corPrecipitado: "branco",
      observacao:
        "Valor condicional tabelado em força iônica μ = 5,0 mol·L⁻¹.",
      usos: usosGerais,
    }),

    criarSal({
      id: "AgSCN",
      nome: "tiocianato de prata",
      formula: "AgSCN",
      formulaExibicao: "AgSCN",
      cation: Ag,
      anion: SCN,
      coeficienteCation: 1,
      coeficienteAnion: 1,
      kps: 1.1e-12,
      corPrecipitado: "branco",
      usos: usosArgentometriaDireta,
    }),

    criarSal({
      id: "Hg2SCN2",
      nome: "tiocianato de mercúrio(I)",
      formula: "Hg2(SCN)2",
      formulaExibicao: "Hg₂(SCN)₂",
      cation: Hg2,
      anion: SCN,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 3e-20,
      corPrecipitado: "branco",
      usos: usosGerais,
    }),

    criarSal({
      id: "HgSCN2",
      nome: "tiocianato de mercúrio(II)",
      formula: "Hg(SCN)2",
      formulaExibicao: "Hg(SCN)₂",
      cation: Hg,
      anion: SCN,
      coeficienteCation: 1,
      coeficienteAnion: 2,
      kps: 2.8e-20,
      corPrecipitado: "branco",
      observacao:
        "Valor condicional tabelado em força iônica μ = 1,0 mol·L⁻¹.",
      usos: usosGerais,
    }),
  ];

function validarSalPrecipitacao(
  sal: SalPrecipitacao
): void {
  if (!sal.id.trim()) {
    throw new Error(
      "Foi encontrado um sal sem identificador."
    );
  }

  if (
    !Number.isFinite(sal.kps) ||
    sal.kps <= 0
  ) {
    throw new Error(
      `Kps inválido para ${sal.id}.`
    );
  }

  if (
    !Number.isInteger(
      sal.coeficienteCation
    ) ||
    sal.coeficienteCation <= 0 ||
    !Number.isInteger(
      sal.coeficienteAnion
    ) ||
    sal.coeficienteAnion <= 0
  ) {
    throw new Error(
      `Coeficientes estequiométricos inválidos para ${sal.id}.`
    );
  }

  if (
    !Number.isInteger(
      sal.cation.carga
    ) ||
    sal.cation.carga <= 0
  ) {
    throw new Error(
      `Carga do cátion inválida em ${sal.id}.`
    );
  }

  if (
    !Number.isInteger(
      sal.anion.carga
    ) ||
    sal.anion.carga >= 0
  ) {
    throw new Error(
      `Carga do ânion inválida em ${sal.id}.`
    );
  }

  const cargaTotal =
    sal.coeficienteCation *
      sal.cation.carga +
    sal.coeficienteAnion *
      sal.anion.carga;

  if (cargaTotal !== 0) {
    throw new Error(
      `A estequiometria de ${sal.id} não é eletricamente neutra. ` +
        `Carga resultante: ${cargaTotal}.`
    );
  }

  const pKpsCalculado =
    -Math.log10(sal.kps);

  if (
    !Number.isFinite(sal.pKps) ||
    Math.abs(
      pKpsCalculado -
        sal.pKps
    ) > 1e-12
  ) {
    throw new Error(
      `pKps inconsistente para ${sal.id}.`
    );
  }

  if (sal.usos.length === 0) {
    throw new Error(
      `Nenhum uso foi definido para ${sal.id}.`
    );
  }

  if (
    new Set(sal.usos).size !==
    sal.usos.length
  ) {
    throw new Error(
      `Há usos duplicados em ${sal.id}.`
    );
  }
}

function validarBaseSaisPrecipitacao(
  sais: SalPrecipitacao[]
): void {
  const ids =
    new Set<string>();

  for (const sal of sais) {
    if (ids.has(sal.id)) {
      throw new Error(
        `ID de sal duplicado: ${sal.id}.`
      );
    }

    ids.add(sal.id);
    validarSalPrecipitacao(sal);
  }
}

validarBaseSaisPrecipitacao(
  saisPrecipitacao
);