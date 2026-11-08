"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularFracoesEspeciacaoOxalato = exports.KA2_ACIDO_OXALICO = exports.KA1_ACIDO_OXALICO = exports.PKA2_ACIDO_OXALICO = exports.PKA1_ACIDO_OXALICO = void 0;
exports.PKA1_ACIDO_OXALICO = 1.252;
exports.PKA2_ACIDO_OXALICO = 4.266;
exports.KA1_ACIDO_OXALICO = Math.pow(10, -exports.PKA1_ACIDO_OXALICO);
exports.KA2_ACIDO_OXALICO = Math.pow(10, -exports.PKA2_ACIDO_OXALICO);
function calcularFracoesEspeciacaoOxalato(concentracaoHPlusMolL) {
    if (!Number.isFinite(concentracaoHPlusMolL) ||
        concentracaoHPlusMolL <=
            0) {
        throw new Error("A concentração de H⁺ deve ser positiva e finita.");
    }
    const h = concentracaoHPlusMolL;
    const denominador = h *
        h +
        exports.KA1_ACIDO_OXALICO *
            h +
        exports.KA1_ACIDO_OXALICO *
            exports.KA2_ACIDO_OXALICO;
    return {
        fracaoH2C2O4: (h *
            h) /
            denominador,
        fracaoHC2O4: (exports.KA1_ACIDO_OXALICO *
            h) /
            denominador,
        fracaoC2O4: (exports.KA1_ACIDO_OXALICO *
            exports.KA2_ACIDO_OXALICO) /
            denominador,
    };
}
exports.calcularFracoesEspeciacaoOxalato = calcularFracoesEspeciacaoOxalato;
