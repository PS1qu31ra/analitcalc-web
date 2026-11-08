"use strict";
/* =========================================================
 * TIPOS
 * ======================================================= */
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinarRegiaoTitulacao = exports.calcularVolumeEquivalencia = exports.calcularConcentracaoAposMistura = exports.calcularVolumeMl = exports.calcularMols = void 0;
/* =========================================================
 * VALIDAÇÕES
 * ======================================================= */
function numeroPositivo(valor) {
    return (Number.isFinite(valor) &&
        valor > 0);
}
/* =========================================================
 * MOL
 * ======================================================= */
/**
 * n = C × V
 *
 * Volume informado em mL.
 * Resultado em mol.
 */
function calcularMols({ concentracaoMolL, volumeMl, }) {
    if (!numeroPositivo(concentracaoMolL) ||
        !Number.isFinite(volumeMl) ||
        volumeMl < 0) {
        return NaN;
    }
    return (concentracaoMolL *
        (volumeMl /
            1000));
}
exports.calcularMols = calcularMols;
/* =========================================================
 * VOLUME
 * ======================================================= */
/**
 * V = n / C
 *
 * Retorna volume em mL.
 */
function calcularVolumeMl({ mols, concentracaoMolL, }) {
    if (!Number.isFinite(mols) ||
        mols < 0 ||
        !numeroPositivo(concentracaoMolL)) {
        return NaN;
    }
    return (mols /
        concentracaoMolL) *
        1000;
}
exports.calcularVolumeMl = calcularVolumeMl;
/* =========================================================
 * CONCENTRAÇÃO APÓS MISTURA
 * ======================================================= */
/**
 * C = n / Vtotal
 *
 * O volume total deve ser informado
 * em mL.
 */
function calcularConcentracaoAposMistura({ mols, volumeTotalMl, }) {
    if (!Number.isFinite(mols) ||
        mols < 0 ||
        !numeroPositivo(volumeTotalMl)) {
        return NaN;
    }
    return (mols /
        (volumeTotalMl /
            1000));
}
exports.calcularConcentracaoAposMistura = calcularConcentracaoAposMistura;
/* =========================================================
 * VOLUME DE EQUIVALÊNCIA
 * ======================================================= */
function calcularVolumeEquivalencia(entrada) {
    const { concentracaoAnalitoMolL, volumeAnalitoMl, concentracaoTitulanteMolL, coeficienteAnalito, coeficienteTitulante, } = entrada;
    if (!numeroPositivo(concentracaoAnalitoMolL) ||
        !numeroPositivo(volumeAnalitoMl) ||
        !numeroPositivo(concentracaoTitulanteMolL) ||
        !numeroPositivo(coeficienteAnalito) ||
        !numeroPositivo(coeficienteTitulante)) {
        throw new Error("Os dados estequiométricos devem ser positivos e finitos.");
    }
    const molAnalitoInicial = calcularMols({
        concentracaoMolL: concentracaoAnalitoMolL,
        volumeMl: volumeAnalitoMl,
    });
    /*
     * Pela reação:
     *
     * coefAnalito mol analito
     * -----------------------
     * coefTitulante mol titulante
     */
    const molTitulanteEquivalencia = molAnalitoInicial *
        (coeficienteTitulante /
            coeficienteAnalito);
    const volumeEquivalenciaMl = calcularVolumeMl({
        mols: molTitulanteEquivalencia,
        concentracaoMolL: concentracaoTitulanteMolL,
    });
    return {
        molAnalitoInicial,
        molTitulanteEquivalencia,
        volumeEquivalenciaMl,
        razaoAnalitoPorTitulante: coeficienteAnalito /
            coeficienteTitulante,
    };
}
exports.calcularVolumeEquivalencia = calcularVolumeEquivalencia;
/* =========================================================
 * REGIÃO DA TITULAÇÃO
 * ======================================================= */
function determinarRegiaoTitulacao({ volumeAdicionadoMl, volumeEquivalenciaMl, toleranciaMl = 1e-9, }) {
    if (!Number.isFinite(volumeAdicionadoMl) ||
        volumeAdicionadoMl < 0) {
        throw new Error("O volume adicionado deve ser maior ou igual a zero.");
    }
    if (!numeroPositivo(volumeEquivalenciaMl)) {
        throw new Error("O volume de equivalência deve ser positivo.");
    }
    if (!Number.isFinite(toleranciaMl) ||
        toleranciaMl < 0) {
        throw new Error("A tolerância deve ser maior ou igual a zero.");
    }
    const diferenca = volumeAdicionadoMl -
        volumeEquivalenciaMl;
    if (Math.abs(diferenca) <=
        toleranciaMl) {
        return "pe";
    }
    if (diferenca < 0) {
        return "antes_pe";
    }
    return "apos_pe";
}
exports.determinarRegiaoTitulacao = determinarRegiaoTitulacao;
