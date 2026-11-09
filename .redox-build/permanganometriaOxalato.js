"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPontoPermanganometriaOxalato = exports.calcularSistemaPermanganometriaOxalato = exports.calcularPotencialEquivalenciaOxalato = exports.calcularPotencialFormalPermanganatoOxalato = exports.calcularPotencialFormalOxalato = exports.REACAO_PERMANGANATO_OXALATO = void 0;
const nernst_1 = require("./nernst");
const estequiometria_1 = require("./estequiometria");
const dadosRedox_1 = require("./dadosRedox");
const especiacaoOxalato_1 = require("./especiacaoOxalato");
const equilibrioPermanganometriaOxalato_1 = require("./equilibrioPermanganometriaOxalato");
exports.REACAO_PERMANGANATO_OXALATO = "2 MnO₄⁻ + 5 C₂O₄²⁻ + 16 H⁺ → 2 Mn²⁺ + 10 CO₂ + 8 H₂O";
const COEFICIENTE_OXALATO = 5;
const COEFICIENTE_MNO4 = 2;
const COEFICIENTE_H_PLUS = 16;
const COEFICIENTE_CO2 = 10;
function validarEntradaOxalato(entrada) {
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
        valor >
            0);
    if (!valido) {
        throw new Error("Concentrações e volumes do sistema oxalato devem ser positivos e finitos.");
    }
    const atividadeCO2 = entrada.atividadeCO2 ??
        1;
    if (!Number.isFinite(atividadeCO2) ||
        atividadeCO2 <=
            0) {
        throw new Error("A atividade de CO₂ deve ser positiva e finita.");
    }
    const temperaturaC = entrada.temperaturaC ??
        25;
    if (!Number.isFinite(temperaturaC) ||
        temperaturaC <=
            -273.15) {
        throw new Error("A temperatura informada é fisicamente inválida.");
    }
}
function calcularPotencialFormalOxalato({ concentracaoHPlusMolL, atividadeCO2 = 1, temperaturaC = 25, }) {
    const fator = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 2,
    });
    const fracoes = (0, especiacaoOxalato_1.calcularFracoesEspeciacaoOxalato)(concentracaoHPlusMolL);
    return (dadosRedox_1.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
        .potencialPadraoReducao -
        fator *
            Math.log10(fracoes
                .fracaoH2C2O4 /
                (Math.pow(atividadeCO2, 2) *
                    Math.pow(concentracaoHPlusMolL, 2))));
}
exports.calcularPotencialFormalOxalato = calcularPotencialFormalOxalato;
function calcularPotencialFormalPermanganatoOxalato({ concentracaoHPlusMolL, temperaturaC = 25, }) {
    const fator = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 5,
    });
    return (dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
        8 *
            fator *
            Math.log10(concentracaoHPlusMolL));
}
exports.calcularPotencialFormalPermanganatoOxalato = calcularPotencialFormalPermanganatoOxalato;
/**
 * Potencial teórico no PE pela metodologia dos slides:
 * média ponderada dos potenciais condicionais pelo número de elétrons.
 * O par CO₂/H₂C₂O₄ transfere 2 elétrons e o par MnO₄⁻/Mn²⁺ transfere 5.
 * A fração H₂C₂O₄ continua sendo obtida pela especiação ácido-base.
 * Não se acrescenta correção posterior pela concentração total de Mn.
 */
function calcularPotencialEquivalenciaOxalato({ concentracaoHPlusMolL, atividadeCO2 = 1, temperaturaC = 25, }) {
    const potencialFormalOxalatoV = calcularPotencialFormalOxalato({
        concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    const potencialFormalPermanganatoV = calcularPotencialFormalPermanganatoOxalato({
        concentracaoHPlusMolL,
        temperaturaC,
    });
    if (!Number.isFinite(potencialFormalOxalatoV) ||
        !Number.isFinite(potencialFormalPermanganatoV))
        return NaN;
    return (2 * potencialFormalOxalatoV + 5 * potencialFormalPermanganatoV) / 7;
}
exports.calcularPotencialEquivalenciaOxalato = calcularPotencialEquivalenciaOxalato;
function calcularSistemaPermanganometriaOxalato(entrada) {
    validarEntradaOxalato(entrada);
    const temperaturaC = entrada.temperaturaC ??
        25;
    const atividadeCO2 = entrada.atividadeCO2 ??
        1;
    const estequiometria = (0, estequiometria_1.calcularVolumeEquivalencia)({
        concentracaoAnalitoMolL: entrada
            .concentracaoAnalitoMolL,
        volumeAnalitoMl: entrada
            .volumeAnalitoMl,
        concentracaoTitulanteMolL: entrada
            .concentracaoTitulanteMolL,
        coeficienteAnalito: COEFICIENTE_OXALATO,
        coeficienteTitulante: COEFICIENTE_MNO4,
    });
    const molOxalatoInicial = estequiometria
        .molAnalitoInicial;
    const molMnO4Equivalencia = estequiometria
        .molTitulanteEquivalencia;
    const molHPlusEstequiometrico = molOxalatoInicial *
        (COEFICIENTE_H_PLUS /
            COEFICIENTE_OXALATO);
    const molHPlusInicialAproximado = (0, estequiometria_1.calcularMols)({
        concentracaoMolL: entrada
            .concentracaoHPlusMolL,
        volumeMl: entrada
            .volumeAnalitoMl,
    });
    const excessoHPlusMol = molHPlusInicialAproximado -
        molHPlusEstequiometrico;
    const molCO2ProduzidoNoPE = molOxalatoInicial *
        (COEFICIENTE_CO2 /
            COEFICIENTE_OXALATO);
    const molMn2ProduzidoNoPE = molMnO4Equivalencia;
    const fracoes = (0, especiacaoOxalato_1.calcularFracoesEspeciacaoOxalato)(entrada
        .concentracaoHPlusMolL);
    const potencialFormalOxalatoV = calcularPotencialFormalOxalato({
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    const potencialFormalPermanganatoV = calcularPotencialFormalPermanganatoOxalato({
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
    });
    const potencialEquivalenciaV = calcularPotencialEquivalenciaOxalato({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    if (!Number.isFinite(potencialEquivalenciaV)) {
        throw new Error('Não foi possível calcular o potencial teórico no PE do sistema oxalato/MnO₄⁻.');
    }
    const observacoes = [
        "A reação permanganato–oxalato apresenta comportamento autocatalítico devido à formação de Mn²⁺.",
        "A autocatalise e o aquecimento são tratados como efeitos cinéticos e não alteram o potencial teórico no PE calculado pela média ponderada dos potenciais condicionais.",
        "A concentração informada representa oxalato analítico total; a fração H₂C₂O₄ é calculada pela especiação ácido-base antes da aplicação de Nernst.",
        "A atividade de CO₂ é tratada como condição externa; quando não informada, utiliza-se a = 1 como estado padrão para calcular o potencial condicional do par CO₂/H₂C₂O₄.",
        "Os valores de pKa usados na especiação são mantidos como constantes de referência a 25 °C.",
    ];
    if (excessoHPlusMol <
        0) {
        observacoes.push("Pelas condições informadas, a quantidade inicial aproximada de H⁺ é inferior à quantidade estequiométrica formal calculada para a reação escrita com C₂O₄²⁻.");
    }
    return {
        reacaoGlobal: exports.REACAO_PERMANGANATO_OXALATO,
        coeficienteAnalito: COEFICIENTE_OXALATO,
        coeficienteTitulante: COEFICIENTE_MNO4,
        razaoOxalatoPorMnO4: COEFICIENTE_OXALATO /
            COEFICIENTE_MNO4,
        molOxalatoInicial,
        molMnO4Equivalencia,
        volumeEquivalenciaMl: estequiometria
            .volumeEquivalenciaMl,
        potencialFormalOxalatoV,
        potencialFormalPermanganatoV,
        potencialEquivalenciaV,
        molHPlusEstequiometrico,
        molHPlusInicialAproximado,
        excessoHPlusMol,
        molCO2ProduzidoNoPE,
        molMn2ProduzidoNoPE,
        atividadeCO2,
        pKa1Oxalato: especiacaoOxalato_1.PKA1_ACIDO_OXALICO,
        pKa2Oxalato: especiacaoOxalato_1.PKA2_ACIDO_OXALICO,
        fracaoH2C2O4: fracoes
            .fracaoH2C2O4,
        fracaoHC2O4: fracoes
            .fracaoHC2O4,
        fracaoC2O4: fracoes
            .fracaoC2O4,
        temperaturaC,
        autocatalitica: true,
        catalisadorGerado: "Mn2+",
        observacoes,
    };
}
exports.calcularSistemaPermanganometriaOxalato = calcularSistemaPermanganometriaOxalato;
function calcularPontoPermanganometriaOxalato({ entrada, volumeAdicionadoMl, }) {
    validarEntradaOxalato(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) ||
        volumeAdicionadoMl <
            0) {
        throw new Error("O volume de titulante adicionado deve ser maior ou igual a zero.");
    }
    const sistema = calcularSistemaPermanganometriaOxalato(entrada);
    const temperaturaC = entrada.temperaturaC ??
        25;
    const atividadeCO2 = entrada.atividadeCO2 ??
        1;
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
    const molMnTotalEquilibrio = regiao ===
        "pe"
        ? sistema
            .molMnO4Equivalencia
        : molMnO4Adicionado;
    const equilibrio = (0, equilibrioPermanganometriaOxalato_1.resolverEquilibrioPermanganometriaOxalato)({
        molOxalatoTotalInicial: sistema
            .molOxalatoInicial,
        molMnTotal: molMnTotalEquilibrio,
        volumeTotalMl,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    let parControlador;
    let descricao;
    if (regiao ===
        "antes_pe") {
        parControlador =
            "CO2/H2C2O4";
        descricao =
            "Antes do ponto de equivalência, o oxalato total permanece em excesso. O potencial é calculado pelo equilíbrio simultâneo, utilizando a fração H₂C₂O₄ determinada pela especiação ácido-base.";
    }
    else if (regiao ===
        "pe") {
        parControlador =
            "equivalencia";
        descricao =
            "No ponto de equivalência, o potencial é calculado pela média ponderada dos potenciais condicionais dos pares CO₂/H₂C₂O₄ (2 elétrons) e MnO₄⁻/Mn²⁺ (5 elétrons), conforme a metodologia dos slides.";
    }
    else {
        parControlador =
            "MnO4-/Mn2+";
        descricao =
            "Após o ponto de equivalência, MnO₄⁻ permanece em excesso e o par MnO₄⁻/Mn²⁺ passa a predominar no potencial, mantendo-se o equilíbrio simultâneo.";
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
        molOxalatoTotalRemanescente: equilibrio
            .molOxalatoTotalRemanescente,
        molH2C2O4: equilibrio
            .molH2C2O4,
        molHC2O4: equilibrio
            .molHC2O4,
        molC2O4: equilibrio
            .molC2O4,
        molCO2: equilibrio
            .molCO2,
        molMnO4: equilibrio
            .molMnO4,
        molMn2: equilibrio
            .molMn2,
        concentracaoOxalatoTotalMolL: equilibrio
            .concentracaoOxalatoTotalMolL,
        concentracaoH2C2O4MolL: equilibrio
            .concentracaoH2C2O4MolL,
        concentracaoHC2O4MolL: equilibrio
            .concentracaoHC2O4MolL,
        concentracaoC2O4MolL: equilibrio
            .concentracaoC2O4MolL,
        concentracaoMnO4MolL: equilibrio
            .concentracaoMnO4MolL,
        concentracaoMn2MolL: equilibrio
            .concentracaoMn2MolL,
        descricao,
    };
}
exports.calcularPontoPermanganometriaOxalato = calcularPontoPermanganometriaOxalato;
