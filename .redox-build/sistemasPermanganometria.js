"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarSistemaPermanganometria = exports.sistemasPermanganometria = exports.SISTEMA_OXALATO = exports.SISTEMA_PEROXIDO_HIDROGENIO = exports.SISTEMA_FERRO_II = void 0;
/* =========================================================
 * SISTEMAS
 * ======================================================= */
exports.SISTEMA_FERRO_II = {
    id: "ferro-ii",
    nome: "Ferro(II)",
    formulaAnalito: "Fe²⁺",
    nomeCompleto: "Ferro(II) — Fe²⁺",
    descricao: "Determinação de Fe²⁺ por oxidação a Fe³⁺ utilizando permanganato em meio ácido.",
    titulante: "KMnO₄",
    status: "disponivel",
    observacao: "Titulação de Fe²⁺ com permanganato em meio ácido.",
};
exports.SISTEMA_PEROXIDO_HIDROGENIO = {
    id: "peroxido-hidrogenio",
    nome: "Peróxido de hidrogênio",
    formulaAnalito: "H₂O₂",
    nomeCompleto: "Peróxido de hidrogênio — H₂O₂",
    descricao: "Determinação de peróxido de hidrogênio por oxidação com permanganato em meio ácido.",
    titulante: "KMnO₄",
    status: "disponivel",
    observacao: "Sistema com motor específico de estequiometria, potencial redox e curva potenciométrica.",
};
exports.SISTEMA_OXALATO = {
    id: "oxalato",
    nome: "Ácido oxálico",
    formulaAnalito: "H₂C₂O₄",
    nomeCompleto: "Ácido oxálico — H₂C₂O₄",
    descricao: "Determinação de ácido oxálico por oxidação com permanganato em meio ácido.",
    titulante: "KMnO₄",
    status: "disponivel",
    observacao: "Sistema completo com estequiometria, potencial redox, curva potenciométrica, derivadas, efeito da concentração, simulação em tempo real e avaliação do erro experimental.",
};
/* =========================================================
 * BASE
 * ======================================================= */
exports.sistemasPermanganometria = [
    exports.SISTEMA_FERRO_II,
    exports.SISTEMA_PEROXIDO_HIDROGENIO,
    exports.SISTEMA_OXALATO,
];
/* =========================================================
 * CONSULTAS
 * ======================================================= */
function buscarSistemaPermanganometria(id) {
    return (exports.sistemasPermanganometria.find((sistema) => sistema.id === id) ??
        exports.SISTEMA_FERRO_II);
}
exports.buscarSistemaPermanganometria = buscarSistemaPermanganometria;
