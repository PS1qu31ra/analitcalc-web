"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarEspecieRedoxPorId = exports.buscarParRedoxPorId = exports.paresRedox = exports.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO = exports.PAR_OXIGENIO_PEROXIDO = exports.PAR_FERRO_III_FERRO_II = exports.PAR_PERMANGANATO_MANGANES = exports.especiesRedox = exports.CO2 = exports.H2C2O4 = exports.O2 = exports.H2O2 = exports.FE2_MAIS = exports.FE3_MAIS = exports.MN2_MAIS = exports.MNO4_MENOS = exports.H2O = exports.H_PLUS = void 0;
/* =========================================================
 * ESPÉCIES
 * ======================================================= */
exports.H_PLUS = {
    id: "H+",
    nome: "Íon hidrogênio",
    formula: "H+",
    formulaExibicao: "H⁺",
    carga: 1,
    estado: "aq",
};
exports.H2O = {
    id: "H2O",
    nome: "Água",
    formula: "H2O",
    formulaExibicao: "H₂O",
    carga: 0,
    estado: "l",
};
exports.MNO4_MENOS = {
    id: "MnO4-",
    nome: "Permanganato",
    formula: "MnO4-",
    formulaExibicao: "MnO₄⁻",
    carga: -1,
    estado: "aq",
};
exports.MN2_MAIS = {
    id: "Mn2+",
    nome: "Manganês(II)",
    formula: "Mn2+",
    formulaExibicao: "Mn²⁺",
    carga: 2,
    estado: "aq",
};
exports.FE3_MAIS = {
    id: "Fe3+",
    nome: "Ferro(III)",
    formula: "Fe3+",
    formulaExibicao: "Fe³⁺",
    carga: 3,
    estado: "aq",
};
exports.FE2_MAIS = {
    id: "Fe2+",
    nome: "Ferro(II)",
    formula: "Fe2+",
    formulaExibicao: "Fe²⁺",
    carga: 2,
    estado: "aq",
};
exports.H2O2 = {
    id: "H2O2",
    nome: "Peróxido de hidrogênio",
    formula: "H2O2",
    formulaExibicao: "H₂O₂",
    carga: 0,
    estado: "aq",
};
exports.O2 = {
    id: "O2",
    nome: "Oxigênio",
    formula: "O2",
    formulaExibicao: "O₂",
    carga: 0,
    estado: "g",
};
exports.H2C2O4 = {
    id: "H2C2O4",
    nome: "Ácido oxálico",
    formula: "H2C2O4",
    formulaExibicao: "H₂C₂O₄",
    carga: 0,
    estado: "aq",
};
exports.CO2 = {
    id: "CO2",
    nome: "Dióxido de carbono",
    formula: "CO2",
    formulaExibicao: "CO₂",
    carga: 0,
    estado: "g",
};
/* =========================================================
 * LISTA DE ESPÉCIES
 * ======================================================= */
exports.especiesRedox = [
    exports.H_PLUS,
    exports.H2O,
    exports.MNO4_MENOS,
    exports.MN2_MAIS,
    exports.FE3_MAIS,
    exports.FE2_MAIS,
    exports.H2O2,
    exports.O2,
    exports.H2C2O4,
    exports.CO2,
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
exports.PAR_PERMANGANATO_MANGANES = {
    id: "MnO4-/Mn2+",
    nome: "Permanganato / manganês(II)",
    oxidante: exports.MNO4_MENOS,
    redutor: exports.MN2_MAIS,
    numeroEletrons: 5,
    potencialPadraoReducao: 1.51,
    semirreacaoReducao: "MnO₄⁻ + 8 H⁺ + 5 e⁻ ⇌ Mn²⁺ + 4 H₂O",
    meios: [
        "acido",
    ],
    quocienteReacao: {
        numerador: [
            {
                especieId: "Mn2+",
                expoente: 1,
            },
        ],
        denominador: [
            {
                especieId: "MnO4-",
                expoente: 1,
            },
            {
                especieId: "H+",
                expoente: 8,
            },
        ],
    },
    observacao: "Em meio fortemente ácido, o permanganato é reduzido predominantemente a Mn²⁺.",
    referencia: "E° adotado a 25 °C: aproximadamente +1,51 V.",
};
/* =========================================================
 * PAR Fe³⁺ / Fe²⁺
 * ======================================================= */
exports.PAR_FERRO_III_FERRO_II = {
    id: "Fe3+/Fe2+",
    nome: "Ferro(III) / ferro(II)",
    oxidante: exports.FE3_MAIS,
    redutor: exports.FE2_MAIS,
    numeroEletrons: 1,
    potencialPadraoReducao: 0.771,
    semirreacaoReducao: "Fe³⁺ + e⁻ ⇌ Fe²⁺",
    meios: [
        "acido",
    ],
    quocienteReacao: {
        numerador: [
            {
                especieId: "Fe2+",
                expoente: 1,
            },
        ],
        denominador: [
            {
                especieId: "Fe3+",
                expoente: 1,
            },
        ],
    },
    observacao: "Par utilizado na titulação clássica de Fe²⁺ com permanganato.",
    referencia: "E° adotado a 25 °C: aproximadamente +0,771 V.",
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
exports.PAR_OXIGENIO_PEROXIDO = {
    id: "O2/H2O2",
    nome: "Oxigênio / peróxido de hidrogênio",
    oxidante: exports.O2,
    redutor: exports.H2O2,
    numeroEletrons: 2,
    potencialPadraoReducao: 0.695,
    semirreacaoReducao: "O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂",
    meios: [
        "acido",
    ],
    quocienteReacao: {
        numerador: [
            {
                especieId: "H2O2",
                expoente: 1,
            },
        ],
        denominador: [
            {
                especieId: "O2",
                expoente: 1,
            },
            {
                especieId: "H+",
                expoente: 2,
            },
        ],
    },
    observacao: "No modelo de permanganometria do H₂O₂, o potencial do par O₂/H₂O₂ é tratado termodinamicamente e requer uma hipótese para a atividade de O₂.",
    referencia: "E° adotado para O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂ a 25 °C: aproximadamente +0,695 V.",
};
/* =========================================================
 * PAR CO₂ / H₂C₂O₄
 * ======================================================= */
/**
 * Semirreação escrita no sentido
 * de redução:
 *
 * 2 CO₂ + 2 H⁺ + 2 e⁻
 * ⇌
 * H₂C₂O₄
 *
 * E° ≈ -0,49 V
 *
 * Durante a permanganometria,
 * a reação ocorre no sentido
 * contrário:
 *
 * H₂C₂O₄
 * →
 * 2 CO₂ + 2 H⁺ + 2 e⁻
 *
 *
 * Q =
 *
 * a(H₂C₂O₄)
 * -------------------------
 * a(CO₂)^2 × a(H⁺)^2
 */
exports.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO = {
    id: "CO2/H2C2O4",
    nome: "Dióxido de carbono / ácido oxálico",
    oxidante: exports.CO2,
    redutor: exports.H2C2O4,
    numeroEletrons: 2,
    potencialPadraoReducao: -0.49,
    semirreacaoReducao: "2 CO₂ + 2 H⁺ + 2 e⁻ ⇌ H₂C₂O₄",
    meios: [
        "acido",
    ],
    quocienteReacao: {
        numerador: [
            {
                especieId: "H2C2O4",
                expoente: 1,
            },
        ],
        denominador: [
            {
                especieId: "CO2",
                expoente: 2,
            },
            {
                especieId: "H+",
                expoente: 2,
            },
        ],
    },
    observacao: "O potencial do sistema oxalato é tratado pelo par CO₂/H₂C₂O₄. A concentração analítica total de oxalato deve ser convertida na fração protonada H₂C₂O₄ antes da aplicação da equação de Nernst.",
    referencia: "E° adotado para 2 CO₂ + 2 H⁺ + 2 e⁻ ⇌ H₂C₂O₄ a 25 °C: aproximadamente -0,49 V.",
};
/* =========================================================
 * BASE DE PARES
 * ======================================================= */
exports.paresRedox = [
    exports.PAR_PERMANGANATO_MANGANES,
    exports.PAR_FERRO_III_FERRO_II,
    exports.PAR_OXIGENIO_PEROXIDO,
    exports.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO,
];
/* =========================================================
 * CONSULTAS
 * ======================================================= */
function buscarParRedoxPorId(id) {
    return exports.paresRedox.find((par) => par.id.toLowerCase() ===
        id.toLowerCase());
}
exports.buscarParRedoxPorId = buscarParRedoxPorId;
function buscarEspecieRedoxPorId(id) {
    return exports.especiesRedox.find((especie) => especie.id.toLowerCase() ===
        id.toLowerCase());
}
exports.buscarEspecieRedoxPorId = buscarEspecieRedoxPorId;
