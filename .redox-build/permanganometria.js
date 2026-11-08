"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPontoPermanganometriaFerro = exports.calcularSistemaPermanganometriaFerro = exports.calcularPotencialEquivalenciaPermanganometria = exports.calcularPotencialFormalPermanganato = exports.REACAO_PERMANGANATO_FERRO = void 0;
const dadosRedox_1 = require("./dadosRedox");
const nernst_1 = require("./nernst");
const estequiometria_1 = require("./estequiometria");
const equilibrioPermanganometriaFerro_1 = require("./equilibrioPermanganometriaFerro");
/* =========================================================
 * CONSTANTES DO SISTEMA
 * ======================================================= */
/**
 * Reação global em meio ácido:
 *
 * MnO₄⁻ + 5 Fe²⁺ + 8 H⁺
 * →
 * Mn²⁺ + 5 Fe³⁺ + 4 H₂O
 */
exports.REACAO_PERMANGANATO_FERRO = "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O";
const COEFICIENTE_FE2 = 5;
const COEFICIENTE_MNO4 = 1;
/* =========================================================
 * VALIDAÇÃO
 * ======================================================= */
function validarEntradaPermanganometria(entrada) {
    const valoresPositivos = [
        entrada
            .concentracaoAnalitoMolL,
        entrada
            .volumeAnalitoMl,
        entrada
            .concentracaoTitulanteMolL,
        entrada
            .concentracaoHPlusMolL,
    ];
    const valido = valoresPositivos.every((valor) => Number.isFinite(valor) &&
        valor > 0);
    if (!valido) {
        throw new Error("Concentrações e volumes da permanganometria devem ser positivos e finitos.");
    }
    const temperaturaC = entrada.temperaturaC ??
        25;
    if (!Number.isFinite(temperaturaC) ||
        temperaturaC <=
            -273.15) {
        throw new Error("A temperatura informada é fisicamente inválida.");
    }
}
/* =========================================================
 * POTENCIAL FORMAL DO PERMANGANATO
 * ======================================================= */
/**
 * Para:
 *
 * MnO₄⁻ + 8 H⁺ + 5 e⁻
 * ⇌
 * Mn²⁺ + 4 H₂O
 *
 * podemos incorporar H⁺ ao potencial
 * formal do sistema:
 *
 * E°' =
 * E° +
 * (f / 5) × 8 log[H⁺]
 *
 * onde:
 *
 * f = 2,303 RT/F
 */
function calcularPotencialFormalPermanganato({ concentracaoHPlusMolL, temperaturaC = 25, }) {
    if (!Number.isFinite(concentracaoHPlusMolL) ||
        concentracaoHPlusMolL <= 0) {
        return NaN;
    }
    const fatorUmEletron = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 1,
    });
    if (!Number.isFinite(fatorUmEletron)) {
        return NaN;
    }
    return (dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
        (8 *
            fatorUmEletron /
            5) *
            Math.log10(concentracaoHPlusMolL));
}
exports.calcularPotencialFormalPermanganato = calcularPotencialFormalPermanganato;
/* =========================================================
 * POTENCIAL NO PONTO DE EQUIVALÊNCIA
 * ======================================================= */
/**
 * Para o sistema:
 *
 * MnO₄⁻ / Mn²⁺   n = 5
 * Fe³⁺ / Fe²⁺    n = 1
 *
 * utilizando o potencial formal
 * do permanganato:
 *
 * E_PE ≈
 *
 * 5 E°'Mn + 1 E°Fe
 * ----------------
 *         6
 *
 * A expressão é adequada para o
 * sistema estequiométrico considerado.
 */
function calcularPotencialEquivalenciaPermanganometria({ concentracaoHPlusMolL, temperaturaC = 25, }) {
    const potencialFormalMn = calcularPotencialFormalPermanganato({
        concentracaoHPlusMolL,
        temperaturaC,
    });
    if (!Number.isFinite(potencialFormalMn)) {
        return NaN;
    }
    const potencialFe = dadosRedox_1.PAR_FERRO_III_FERRO_II
        .potencialPadraoReducao;
    return ((5 *
        potencialFormalMn) +
        potencialFe) /
        6;
}
exports.calcularPotencialEquivalenciaPermanganometria = calcularPotencialEquivalenciaPermanganometria;
/* =========================================================
 * SISTEMA GERAL
 * ======================================================= */
function calcularSistemaPermanganometriaFerro(entrada) {
    validarEntradaPermanganometria(entrada);
    const temperaturaC = entrada.temperaturaC ??
        25;
    const estequiometria = (0, estequiometria_1.calcularVolumeEquivalencia)({
        concentracaoAnalitoMolL: entrada
            .concentracaoAnalitoMolL,
        volumeAnalitoMl: entrada
            .volumeAnalitoMl,
        concentracaoTitulanteMolL: entrada
            .concentracaoTitulanteMolL,
        coeficienteAnalito: COEFICIENTE_FE2,
        coeficienteTitulante: COEFICIENTE_MNO4,
    });
    const volumeTotalNoPEMl = entrada.volumeAnalitoMl + estequiometria.volumeEquivalenciaMl;
    const equilibrioNoPE = (0, equilibrioPermanganometriaFerro_1.resolverEquilibrioPermanganometriaFerro)({
        molFeTotal: estequiometria.molAnalitoInicial,
        molMnTotal: estequiometria.molTitulanteEquivalencia,
        volumeTotalMl: volumeTotalNoPEMl,
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        temperaturaC,
    });
    const potencialEquivalenciaV = equilibrioNoPE.potencialV;
    if (potencialEquivalenciaV === null ||
        !Number.isFinite(potencialEquivalenciaV)) {
        throw new Error('Não foi possível resolver o potencial de equilíbrio no PE do sistema Fe²⁺/MnO₄⁻.');
    }
    return {
        reacaoGlobal: exports.REACAO_PERMANGANATO_FERRO,
        coeficienteAnalito: COEFICIENTE_FE2,
        coeficienteTitulante: COEFICIENTE_MNO4,
        razaoFe2PorMnO4: 5,
        molFe2Inicial: estequiometria
            .molAnalitoInicial,
        molMnO4Equivalencia: estequiometria
            .molTitulanteEquivalencia,
        volumeEquivalenciaMl: estequiometria
            .volumeEquivalenciaMl,
        potencialPadraoFe: dadosRedox_1.PAR_FERRO_III_FERRO_II
            .potencialPadraoReducao,
        potencialPadraoMn: dadosRedox_1.PAR_PERMANGANATO_MANGANES
            .potencialPadraoReducao,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
        potencialEquivalenciaV,
    };
}
exports.calcularSistemaPermanganometriaFerro = calcularSistemaPermanganometriaFerro;
/* =========================================================
 * AVALIAÇÃO DE UM PONTO DA TITULAÇÃO
 * ======================================================= */
function calcularPontoPermanganometriaFerro({ entrada, volumeAdicionadoMl, }) {
    validarEntradaPermanganometria(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) ||
        volumeAdicionadoMl <
            0) {
        throw new Error("O volume de titulante adicionado deve ser maior ou igual a zero.");
    }
    const sistema = calcularSistemaPermanganometriaFerro(entrada);
    const temperaturaC = entrada.temperaturaC ??
        25;
    const volumeTotalMl = entrada.volumeAnalitoMl +
        volumeAdicionadoMl;
    const regiao = (0, estequiometria_1.determinarRegiaoTitulacao)({
        volumeAdicionadoMl,
        volumeEquivalenciaMl: sistema
            .volumeEquivalenciaMl,
        toleranciaMl: 1e-9,
    });
    const molMnO4Adicionado = (0, estequiometria_1.calcularMols)({
        concentracaoMolL: entrada
            .concentracaoTitulanteMolL,
        volumeMl: volumeAdicionadoMl,
    });
    /*
     * =======================================================
     * NOVO MODELO
     * =======================================================
     *
     * Não zeramos mais artificialmente
     * Fe²⁺, Fe³⁺, MnO₄⁻ ou Mn²⁺.
     *
     * O potencial é encontrado impondo
     * simultaneamente:
     *
     * E(Fe³⁺/Fe²⁺)
     * =
     * E(MnO₄⁻/Mn²⁺)
     *
     * e o balanço:
     *
     * n(Fe³⁺)
     * =
     * 5 n(Mn²⁺)
     */
    const equilibrio = (0, equilibrioPermanganometriaFerro_1.resolverEquilibrioPermanganometriaFerro)({
        molFeTotal: sistema
            .molFe2Inicial,
        molMnTotal: molMnO4Adicionado,
        volumeTotalMl,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
    });
    let parControlador;
    let descricao;
    if (regiao ===
        "antes_pe") {
        parControlador =
            "Fe3+/Fe2+";
        descricao =
            "Antes do ponto de equivalência, o par Fe³⁺/Fe²⁺ é predominante, mas o potencial é obtido pelo equilíbrio simultâneo com MnO₄⁻/Mn²⁺.";
    }
    else if (regiao ===
        "pe") {
        parControlador =
            "equivalencia";
        descricao =
            "No ponto de equivalência, o potencial é obtido pela solução simultânea das equações de Nernst e do balanço de elétrons dos pares Fe³⁺/Fe²⁺ e MnO₄⁻/Mn²⁺.";
    }
    else {
        parControlador =
            "MnO4-/Mn2+";
        descricao =
            "Após o ponto de equivalência, o par MnO₄⁻/Mn²⁺ é predominante, mas o potencial continua sendo obtido pelo equilíbrio simultâneo dos dois pares.";
    }
    return {
        volumeAdicionadoMl,
        volumeTotalMl,
        volumeEquivalenciaMl: sistema
            .volumeEquivalenciaMl,
        regiao,
        potencialV: regiao ===
            "pe"
            ? sistema
                .potencialEquivalenciaV
            : equilibrio
                .potencialV,
        parControlador,
        molFe2: equilibrio
            .molFe2,
        molFe3: equilibrio
            .molFe3,
        molMnO4: equilibrio
            .molMnO4,
        molMn2: equilibrio
            .molMn2,
        concentracaoFe2MolL: equilibrio
            .concentracaoFe2MolL,
        concentracaoFe3MolL: equilibrio
            .concentracaoFe3MolL,
        concentracaoMnO4MolL: equilibrio
            .concentracaoMnO4MolL,
        concentracaoMn2MolL: equilibrio
            .concentracaoMn2MolL,
        descricao,
    };
}
exports.calcularPontoPermanganometriaFerro = calcularPontoPermanganometriaFerro;
