import type {
  EspecieRedox,
  ParRedox,
} from "./tipos";


/* =========================================================
 * ESPÉCIES
 * ======================================================= */

export const H_PLUS:
  EspecieRedox = {
  id: "H+",
  nome: "Íon hidrogênio",
  formula: "H+",
  formulaExibicao: "H⁺",
  carga: 1,
  estado: "aq",
};


export const H2O:
  EspecieRedox = {
  id: "H2O",
  nome: "Água",
  formula: "H2O",
  formulaExibicao: "H₂O",
  carga: 0,
  estado: "l",
};


export const MNO4_MENOS:
  EspecieRedox = {
  id: "MnO4-",
  nome: "Permanganato",
  formula: "MnO4-",
  formulaExibicao: "MnO₄⁻",
  carga: -1,
  estado: "aq",
};


export const MN2_MAIS:
  EspecieRedox = {
  id: "Mn2+",
  nome: "Manganês(II)",
  formula: "Mn2+",
  formulaExibicao: "Mn²⁺",
  carga: 2,
  estado: "aq",
};


export const FE3_MAIS:
  EspecieRedox = {
  id: "Fe3+",
  nome: "Ferro(III)",
  formula: "Fe3+",
  formulaExibicao: "Fe³⁺",
  carga: 3,
  estado: "aq",
};


export const FE2_MAIS:
  EspecieRedox = {
  id: "Fe2+",
  nome: "Ferro(II)",
  formula: "Fe2+",
  formulaExibicao: "Fe²⁺",
  carga: 2,
  estado: "aq",
};


export const H2O2:
  EspecieRedox = {
  id: "H2O2",
  nome: "Peróxido de hidrogênio",
  formula: "H2O2",
  formulaExibicao: "H₂O₂",
  carga: 0,
  estado: "aq",
};


export const O2:
  EspecieRedox = {
  id: "O2",
  nome: "Oxigênio",
  formula: "O2",
  formulaExibicao: "O₂",
  carga: 0,
  estado: "g",
};


/* =========================================================
 * LISTA DE ESPÉCIES
 * ======================================================= */

export const especiesRedox:
  EspecieRedox[] = [
  H_PLUS,
  H2O,
  MNO4_MENOS,
  MN2_MAIS,
  FE3_MAIS,
  FE2_MAIS,
  H2O2,
  O2,
];


/* =========================================================
 * PAR MnO₄⁻ / Mn²⁺
 * ======================================================= */

/**
 * MnO₄⁻ + 8 H⁺ + 5 e⁻
 * ⇌
 * Mn²⁺ + 4 H₂O
 *
 * E° ≈ +1,51 V
 *
 * Q =
 *
 * a(Mn²⁺)
 * -------------------------
 * a(MnO₄⁻) × a(H⁺)^8
 */
export const PAR_PERMANGANATO_MANGANES:
  ParRedox = {
  id:
    "MnO4-/Mn2+",

  nome:
    "Permanganato / manganês(II)",

  oxidante:
    MNO4_MENOS,

  redutor:
    MN2_MAIS,

  numeroEletrons:
    5,

  potencialPadraoReducao:
    1.51,

  semirreacaoReducao:
    "MnO₄⁻ + 8 H⁺ + 5 e⁻ ⇌ Mn²⁺ + 4 H₂O",

  meios: [
    "acido",
  ],

  quocienteReacao: {
    numerador: [
      {
        especieId:
          "Mn2+",

        expoente:
          1,
      },
    ],

    denominador: [
      {
        especieId:
          "MnO4-",

        expoente:
          1,
      },

      {
        especieId:
          "H+",

        expoente:
          8,
      },
    ],
  },

  observacao:
    "Em meio fortemente ácido, o permanganato é reduzido predominantemente a Mn²⁺.",

  referencia:
    "E° adotado a 25 °C: aproximadamente +1,51 V.",
};


/* =========================================================
 * PAR Fe³⁺ / Fe²⁺
 * ======================================================= */

export const PAR_FERRO_III_FERRO_II:
  ParRedox = {
  id:
    "Fe3+/Fe2+",

  nome:
    "Ferro(III) / ferro(II)",

  oxidante:
    FE3_MAIS,

  redutor:
    FE2_MAIS,

  numeroEletrons:
    1,

  potencialPadraoReducao:
    0.771,

  semirreacaoReducao:
    "Fe³⁺ + e⁻ ⇌ Fe²⁺",

  meios: [
    "acido",
  ],

  quocienteReacao: {
    numerador: [
      {
        especieId:
          "Fe2+",

        expoente:
          1,
      },
    ],

    denominador: [
      {
        especieId:
          "Fe3+",

        expoente:
          1,
      },
    ],
  },

  observacao:
    "Par utilizado na titulação clássica de Fe²⁺ com permanganato.",

  referencia:
    "E° adotado a 25 °C: aproximadamente +0,771 V.",
};


/* =========================================================
 * PAR O₂ / H₂O₂
 * ======================================================= */

/**
 * Semirreação escrita no sentido
 * de redução:
 *
 * O₂ + 2 H⁺ + 2 e⁻
 * ⇌
 * H₂O₂
 *
 * E° ≈ +0,695 V
 *
 * Durante a permanganometria,
 * a reação ocorre no sentido
 * contrário:
 *
 * H₂O₂
 * →
 * O₂ + 2 H⁺ + 2 e⁻
 *
 *
 * Q =
 *
 * a(H₂O₂)
 * -------------------
 * a(O₂) × a(H⁺)^2
 */
export const PAR_OXIGENIO_PEROXIDO:
  ParRedox = {
  id:
    "O2/H2O2",

  nome:
    "Oxigênio / peróxido de hidrogênio",

  oxidante:
    O2,

  redutor:
    H2O2,

  numeroEletrons:
    2,

  potencialPadraoReducao:
    0.695,

  semirreacaoReducao:
    "O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂",

  meios: [
    "acido",
  ],

  quocienteReacao: {
    numerador: [
      {
        especieId:
          "H2O2",

        expoente:
          1,
      },
    ],

    denominador: [
      {
        especieId:
          "O2",

        expoente:
          1,
      },

      {
        especieId:
          "H+",

        expoente:
          2,
      },
    ],
  },

  observacao:
    "No modelo de permanganometria do H₂O₂, o potencial do par O₂/H₂O₂ é tratado termodinamicamente e requer uma hipótese para a atividade de O₂.",

  referencia:
    "E° adotado para O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂ a 25 °C: aproximadamente +0,695 V.",
};


/* =========================================================
 * BASE DE PARES
 * ======================================================= */

export const paresRedox:
  ParRedox[] = [
  PAR_PERMANGANATO_MANGANES,
  PAR_FERRO_III_FERRO_II,
  PAR_OXIGENIO_PEROXIDO,
];


/* =========================================================
 * CONSULTAS
 * ======================================================= */

export function buscarParRedoxPorId(
  id: string
): ParRedox | undefined {
  return paresRedox.find(
    (par) =>
      par.id.toLowerCase() ===
      id.toLowerCase()
  );
}


export function buscarEspecieRedoxPorId(
  id: string
): EspecieRedox | undefined {
  return especiesRedox.find(
    (especie) =>
      especie.id.toLowerCase() ===
      id.toLowerCase()
  );
}