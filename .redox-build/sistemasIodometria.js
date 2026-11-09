"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarSistemaIodometria = exports.sistemasIodometria = exports.SISTEMA_IODATO = exports.SISTEMA_HIPOCLORITO = exports.SISTEMA_PEROXIDO_IODOMETRIA = exports.SISTEMA_OXIGENIO_DISSOLVIDO = exports.SISTEMA_COBRE_II = exports.SISTEMA_CLORO_ATIVO = void 0;
/* =========================================================
 * SISTEMAS
 * ======================================================= */
exports.SISTEMA_CLORO_ATIVO = {
    id: "cloro-ativo",
    nome: "Cloro ativo",
    formulaAnalito: "Cl₂",
    nomeCompleto: "Cloro ativo — expresso como Cl₂",
    descricao: "Determinação indireta de cloro ativo pela formação de I₃⁻ a partir de iodeto e posterior titulação com tiossulfato.",
    titulante: "Na₂S₂O₃",
    status: "disponivel",
    observacao: "Primeiro sistema da iodometria. O cloro oxida I⁻ e forma I₃⁻, que é titulado com S₂O₃²⁻.",
};
exports.SISTEMA_COBRE_II = {
    id: "cobre-ii",
    nome: "Cobre(II)",
    formulaAnalito: "Cu²⁺",
    nomeCompleto: "Cobre(II) — Cu²⁺",
    descricao: "Determinação indireta de Cu²⁺ por reação com iodeto e titulação do iodo formado com tiossulfato.",
    titulante: "Na₂S₂O₃",
    status: "em_desenvolvimento",
    observacao: "Sistema será implementado após a validação do cloro ativo.",
};
exports.SISTEMA_OXIGENIO_DISSOLVIDO = {
    id: "oxigenio-dissolvido",
    nome: "Oxigênio dissolvido",
    formulaAnalito: "O₂",
    nomeCompleto: "Oxigênio dissolvido — O₂",
    descricao: "Determinação indireta de oxigênio dissolvido por formação estequiométrica de iodo.",
    titulante: "Na₂S₂O₃",
    status: "em_desenvolvimento",
    observacao: "Sistema será implementado em etapa posterior.",
};
exports.SISTEMA_PEROXIDO_IODOMETRIA = {
    id: "peroxido-hidrogenio",
    nome: "Peróxido de hidrogênio",
    formulaAnalito: "H₂O₂",
    nomeCompleto: "Peróxido de hidrogênio — H₂O₂",
    descricao: "Determinação indireta de H₂O₂ por oxidação do iodeto e titulação do iodo produzido.",
    titulante: "Na₂S₂O₃",
    status: "em_desenvolvimento",
    observacao: "Sistema iodimétrico independente da permanganometria de H₂O₂.",
};
exports.SISTEMA_HIPOCLORITO = {
    id: "hipoclorito",
    nome: "Hipoclorito",
    formulaAnalito: "ClO⁻",
    nomeCompleto: "Hipoclorito — ClO⁻",
    descricao: "Determinação indireta de hipoclorito pela oxidação de iodeto em meio adequado.",
    titulante: "Na₂S₂O₃",
    status: "em_desenvolvimento",
    observacao: "Sistema será implementado em etapa posterior.",
};
exports.SISTEMA_IODATO = {
    id: "iodato",
    nome: "Iodato",
    formulaAnalito: "IO₃⁻",
    nomeCompleto: "Iodato — IO₃⁻",
    descricao: "Determinação indireta de iodato pela liberação estequiométrica de iodo na presença de iodeto.",
    titulante: "Na₂S₂O₃",
    status: "em_desenvolvimento",
    observacao: "Sistema será implementado em etapa posterior.",
};
/* =========================================================
 * BASE
 * ======================================================= */
exports.sistemasIodometria = [
    exports.SISTEMA_CLORO_ATIVO,
    exports.SISTEMA_COBRE_II,
    exports.SISTEMA_OXIGENIO_DISSOLVIDO,
    exports.SISTEMA_PEROXIDO_IODOMETRIA,
    exports.SISTEMA_HIPOCLORITO,
    exports.SISTEMA_IODATO,
];
/* =========================================================
 * CONSULTAS
 * ======================================================= */
function buscarSistemaIodometria(id) {
    const sistema = exports.sistemasIodometria.find((item) => item.id === id);
    if (!sistema) {
        throw new RangeError(`Sistema iodimétrico desconhecido: ${String(id)}.`);
    }
    return sistema;
}
exports.buscarSistemaIodometria = buscarSistemaIodometria;
