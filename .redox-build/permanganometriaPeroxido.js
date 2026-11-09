"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPontoPermanganometriaPeroxido = exports.calcularSistemaPermanganometriaPeroxido = exports.calcularPotencialEquivalenciaPeroxido = exports.calcularPotencialFormalPeroxido = exports.REACAO_PERMANGANATO_PEROXIDO = void 0;
const dadosRedox_1 = require("./dadosRedox");
const nernst_1 = require("./nernst");
const estequiometria_1 = require("./estequiometria");
const permanganometria_1 = require("./permanganometria");
/* =========================================================
 * REAÇÃO GLOBAL
 * ======================================================= */
/**
 * Em meio ácido:
 *
 * 2 MnO₄⁻ +
 * 5 H₂O₂ +
 * 6 H⁺
 *
 * →
 *
 * 2 Mn²⁺ +
 * 5 O₂ +
 * 8 H₂O
 */
exports.REACAO_PERMANGANATO_PEROXIDO = "2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O";
const COEFICIENTE_H2O2 = 5;
const COEFICIENTE_MNO4 = 2;
const H2O2_POR_MNO4 = COEFICIENTE_H2O2 / COEFICIENTE_MNO4;
/* =========================================================
 * VALIDAÇÃO
 * ======================================================= */
function validarEntrada(entrada) {
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
        throw new Error("Concentrações e volumes devem ser positivos e finitos.");
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
 * POTENCIAL FORMAL O₂ / H₂O₂
 * ======================================================= */
/**
 * O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂
 *
 * E' = E° + (2,303 RT / F) log[H⁺]
 *
 * A atividade padrão de O₂ é considerada unitária apenas
 * para o cálculo formal no PE, como no roteiro de validação.
 * Antes do PE, a equação de Nernst utiliza a concentração
 * de O₂ efetivamente formada pela estequiometria.
 */
function calcularPotencialFormalPeroxido({ concentracaoHPlusMolL, temperaturaC = 25, }) {
    if (!Number.isFinite(concentracaoHPlusMolL) ||
        concentracaoHPlusMolL <= 0) {
        return NaN;
    }
    const fatorDoisEletrons = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 2,
    });
    if (!Number.isFinite(fatorDoisEletrons)) {
        return NaN;
    }
    return (dadosRedox_1.PAR_OXIGENIO_PEROXIDO.potencialPadraoReducao +
        2 * fatorDoisEletrons * Math.log10(concentracaoHPlusMolL));
}
exports.calcularPotencialFormalPeroxido = calcularPotencialFormalPeroxido;
/* =========================================================
 * POTENCIAL NO PE
 * ======================================================= */
/**
 * Metodologia dos slides: média ponderada pelos elétrons
 * dos pares O₂/H₂O₂ (2 e⁻) e MnO₄⁻/Mn²⁺ (5 e⁻).
 */
function calcularPotencialEquivalenciaPeroxido({ concentracaoHPlusMolL, temperaturaC = 25, }) {
    const potencialFormalPeroxido = calcularPotencialFormalPeroxido({
        concentracaoHPlusMolL,
        temperaturaC,
    });
    const potencialFormalMn = (0, permanganometria_1.calcularPotencialFormalPermanganato)({
        concentracaoHPlusMolL,
        temperaturaC,
    });
    if (!Number.isFinite(potencialFormalPeroxido) ||
        !Number.isFinite(potencialFormalMn)) {
        return NaN;
    }
    return (2 * potencialFormalPeroxido +
        5 * potencialFormalMn) / 7;
}
exports.calcularPotencialEquivalenciaPeroxido = calcularPotencialEquivalenciaPeroxido;
/* =========================================================
 * SISTEMA
 * ======================================================= */
function calcularSistemaPermanganometriaPeroxido(entrada) {
    validarEntrada(entrada);
    const temperaturaC = entrada.temperaturaC ??
        25;
    const estequiometria = (0, estequiometria_1.calcularVolumeEquivalencia)({
        concentracaoAnalitoMolL: entrada
            .concentracaoAnalitoMolL,
        volumeAnalitoMl: entrada
            .volumeAnalitoMl,
        concentracaoTitulanteMolL: entrada
            .concentracaoTitulanteMolL,
        coeficienteAnalito: COEFICIENTE_H2O2,
        coeficienteTitulante: COEFICIENTE_MNO4,
    });
    const potencialEquivalenciaV = calcularPotencialEquivalenciaPeroxido({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        temperaturaC,
    });
    if (!Number.isFinite(potencialEquivalenciaV)) {
        throw new Error('Não foi possível calcular o potencial teórico no PE do sistema H₂O₂/MnO₄⁻.');
    }
    return {
        reacaoGlobal: exports.REACAO_PERMANGANATO_PEROXIDO,
        coeficienteAnalito: COEFICIENTE_H2O2,
        coeficienteTitulante: COEFICIENTE_MNO4,
        razaoH2O2PorMnO4: COEFICIENTE_H2O2 /
            COEFICIENTE_MNO4,
        molH2O2Inicial: estequiometria
            .molAnalitoInicial,
        molMnO4Equivalencia: estequiometria
            .molTitulanteEquivalencia,
        volumeEquivalenciaMl: estequiometria
            .volumeEquivalenciaMl,
        potencialPadraoPeroxido: dadosRedox_1.PAR_OXIGENIO_PEROXIDO
            .potencialPadraoReducao,
        potencialPadraoMn: dadosRedox_1.PAR_PERMANGANATO_MANGANES
            .potencialPadraoReducao,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
        potencialEquivalenciaV,
    };
}
exports.calcularSistemaPermanganometriaPeroxido = calcularSistemaPermanganometriaPeroxido;
/* =========================================================
 * PONTO DA TITULAÇÃO
 * ======================================================= */
function calcularPontoPermanganometriaPeroxido({ entrada, volumeAdicionadoMl, }) {
    validarEntrada(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) ||
        volumeAdicionadoMl < 0) {
        throw new Error("O volume de titulante adicionado deve ser maior ou igual a zero.");
    }
    const sistema = calcularSistemaPermanganometriaPeroxido(entrada);
    const temperaturaC = entrada.temperaturaC ?? 25;
    const volumeTotalMl = entrada.volumeAnalitoMl + volumeAdicionadoMl;
    const volumeTotalL = volumeTotalMl / 1000;
    const regiao = (0, estequiometria_1.determinarRegiaoTitulacao)({
        volumeAdicionadoMl,
        volumeEquivalenciaMl: sistema.volumeEquivalenciaMl,
        toleranciaMl: 1e-9,
    });
    const molMnO4Adicionado = (0, estequiometria_1.calcularMols)({
        concentracaoMolL: entrada.concentracaoTitulanteMolL,
        volumeMl: volumeAdicionadoMl,
    });
    const molH2O2Inicial = sistema.molH2O2Inicial;
    const molMnO4Equivalencia = sistema.molMnO4Equivalencia;
    let molH2O2 = 0;
    let molO2 = 0;
    let molMnO4 = 0;
    let molMn2 = 0;
    let potencialV = null;
    const fatorPeroxido = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 2,
    });
    const fatorMn = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 5,
    });
    if (regiao === "antes_pe") {
        // Antes do PE: todo MnO₄⁻ adicionado reage.
        // 1 MnO₄⁻ consome 2,5 H₂O₂ e forma 2,5 O₂ e 1 Mn²⁺.
        molH2O2 = Math.max(0, molH2O2Inicial - H2O2_POR_MNO4 * molMnO4Adicionado);
        molO2 = H2O2_POR_MNO4 * molMnO4Adicionado;
        molMn2 = molMnO4Adicionado;
        molMnO4 = 0;
        // No volume zero ainda não há O₂ formado; o potencial
        // do par O₂/H₂O₂ não pode ser calculado por Nernst.
        if (molO2 > 0 && molH2O2 > 0) {
            const concentracaoH2O2 = molH2O2 / volumeTotalL;
            const concentracaoO2 = molO2 / volumeTotalL;
            const quociente = concentracaoH2O2 /
                (concentracaoO2 * entrada.concentracaoHPlusMolL ** 2);
            potencialV =
                dadosRedox_1.PAR_OXIGENIO_PEROXIDO.potencialPadraoReducao -
                    fatorPeroxido * Math.log10(quociente);
        }
    }
    else if (regiao === "pe") {
        // No PE: usar diretamente a média ponderada dos slides.
        molH2O2 = 0;
        molO2 = molH2O2Inicial;
        molMnO4 = 0;
        molMn2 = molMnO4Equivalencia;
        potencialV = sistema.potencialEquivalenciaV;
    }
    else {
        // Após o PE: todo H₂O₂ foi consumido; o KMnO₄ fica em excesso.
        molH2O2 = 0;
        molO2 = molH2O2Inicial;
        molMn2 = molMnO4Equivalencia;
        molMnO4 = Math.max(0, molMnO4Adicionado - molMnO4Equivalencia);
        if (molMnO4 > 0 && molMn2 > 0) {
            const concentracaoMnO4 = molMnO4 / volumeTotalL;
            const concentracaoMn2 = molMn2 / volumeTotalL;
            const quociente = concentracaoMn2 /
                (concentracaoMnO4 * entrada.concentracaoHPlusMolL ** 8);
            potencialV =
                dadosRedox_1.PAR_PERMANGANATO_MANGANES.potencialPadraoReducao -
                    fatorMn * Math.log10(quociente);
        }
    }
    const concentracaoH2O2MolL = molH2O2 / volumeTotalL;
    const concentracaoO2MolL = molO2 / volumeTotalL;
    const concentracaoMnO4MolL = molMnO4 / volumeTotalL;
    const concentracaoMn2MolL = molMn2 / volumeTotalL;
    const parControlador = regiao === "antes_pe"
        ? "O2/H2O2"
        : regiao === "pe"
            ? "equivalencia"
            : "MnO4-/Mn2+";
    const descricao = regiao === "antes_pe"
        ? "Antes do PE, o potencial é calculado pela equação de Nernst do par O₂/H₂O₂, usando as concentrações de H₂O₂ restante e O₂ formado pelo balanço estequiométrico."
        : regiao === "pe"
            ? "No PE, o potencial é a média ponderada dos potenciais padrão dos pares O₂/H₂O₂ (2 elétrons) e MnO₄⁻/Mn²⁺ (5 elétrons), conforme a validação."
            : "Após o PE, o potencial é calculado pela equação de Nernst do par MnO₄⁻/Mn²⁺, usando as concentrações estequiométricas do titulante em excesso e do Mn²⁺ formado.";
    return {
        volumeAdicionadoMl,
        volumeTotalMl,
        volumeEquivalenciaMl: sistema.volumeEquivalenciaMl,
        regiao,
        potencialV,
        parControlador,
        molH2O2,
        molO2,
        concentracaoO2MolL,
        molMnO4,
        molMn2,
        concentracaoH2O2MolL,
        concentracaoMnO4MolL,
        concentracaoMn2MolL,
        descricao,
    };
}
exports.calcularPontoPermanganometriaPeroxido = calcularPontoPermanganometriaPeroxido;
