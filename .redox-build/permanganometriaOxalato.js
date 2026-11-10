"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPontoPermanganometriaOxalato = exports.calcularSistemaPermanganometriaOxalato = exports.calcularPotencialEquivalenciaOxalato = exports.calcularPotencialFormalOxalato = exports.REACAO_PERMANGANATO_OXALATO = void 0;
const nernst_1 = require("./nernst");
const estequiometria_1 = require("./estequiometria");
const dadosRedox_1 = require("./dadosRedox");
const permanganometria_1 = require("./permanganometria");
exports.REACAO_PERMANGANATO_OXALATO = "2 MnO₄⁻ + 5 H₂C₂O₄ + 6 H⁺ ⇌ 2 Mn²⁺ + 10 CO₂ + 8 H₂O";
const COEFICIENTE_OXALATO = 5;
const COEFICIENTE_MNO4 = 2;
const COEFICIENTE_H_PLUS = 6;
const COEFICIENTE_CO2 = 10;
function validarEntradaOxalato(entrada) {
    const valoresPositivos = [
        entrada.concentracaoAnalitoMolL,
        entrada.volumeAnalitoMl,
        entrada.concentracaoTitulanteMolL,
        entrada.concentracaoHPlusMolL,
    ];
    if (!valoresPositivos.every((valor) => Number.isFinite(valor) && valor > 0)) {
        throw new Error("Concentrações e volumes do sistema com ácido oxálico devem ser positivos e finitos.");
    }
    const atividadeCO2 = entrada.atividadeCO2 ?? 1;
    if (!Number.isFinite(atividadeCO2) || atividadeCO2 <= 0) {
        throw new Error("A atividade de CO₂ deve ser positiva e finita.");
    }
    const temperaturaC = entrada.temperaturaC ?? 25;
    if (!Number.isFinite(temperaturaC) || temperaturaC <= -273.15) {
        throw new Error("A temperatura informada é fisicamente inválida.");
    }
}
/** Potencial formal do par CO₂/H₂C₂O₄ para a pressão de CO₂ informada. */
function calcularPotencialFormalOxalato({ concentracaoHPlusMolL, atividadeCO2 = 1, temperaturaC = 25, }) {
    if (!Number.isFinite(concentracaoHPlusMolL) || concentracaoHPlusMolL <= 0 ||
        !Number.isFinite(atividadeCO2) || atividadeCO2 <= 0)
        return NaN;
    const fator = (0, nernst_1.calcularFatorNernst)({ temperaturaC, numeroEletrons: 2 });
    const quocienteFormal = 1 / (atividadeCO2 ** 2 * concentracaoHPlusMolL ** 2);
    return dadosRedox_1.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO.potencialPadraoReducao -
        fator * Math.log10(quocienteFormal);
}
exports.calcularPotencialFormalOxalato = calcularPotencialFormalOxalato;
function calcularPotencialEquivalenciaOxalato({ concentracaoHPlusMolL, atividadeCO2 = 1, temperaturaC = 25, }) {
    const potencialFormalOxalatoV = calcularPotencialFormalOxalato({
        concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    const potencialFormalPermanganatoV = (0, permanganometria_1.calcularPotencialFormalPermanganato)({
        concentracaoHPlusMolL,
        temperaturaC,
    });
    if (!Number.isFinite(potencialFormalOxalatoV) || !Number.isFinite(potencialFormalPermanganatoV)) {
        return NaN;
    }
    return (2 * potencialFormalOxalatoV + 5 * potencialFormalPermanganatoV) / 7;
}
exports.calcularPotencialEquivalenciaOxalato = calcularPotencialEquivalenciaOxalato;
function calcularSistemaPermanganometriaOxalato(entrada) {
    validarEntradaOxalato(entrada);
    const temperaturaC = entrada.temperaturaC ?? 25;
    const atividadeCO2 = entrada.atividadeCO2 ?? 1;
    const estequiometria = (0, estequiometria_1.calcularVolumeEquivalencia)({
        concentracaoAnalitoMolL: entrada.concentracaoAnalitoMolL,
        volumeAnalitoMl: entrada.volumeAnalitoMl,
        concentracaoTitulanteMolL: entrada.concentracaoTitulanteMolL,
        coeficienteAnalito: COEFICIENTE_OXALATO,
        coeficienteTitulante: COEFICIENTE_MNO4,
    });
    const molOxalatoInicial = estequiometria.molAnalitoInicial;
    const molMnO4Equivalencia = estequiometria.molTitulanteEquivalencia;
    const molHPlusEstequiometrico = molOxalatoInicial * (COEFICIENTE_H_PLUS / COEFICIENTE_OXALATO);
    const molHPlusInicialAproximado = (0, estequiometria_1.calcularMols)({
        concentracaoMolL: entrada.concentracaoHPlusMolL,
        volumeMl: entrada.volumeAnalitoMl,
    });
    const excessoHPlusMol = molHPlusInicialAproximado - molHPlusEstequiometrico;
    const molCO2ProduzidoNoPE = molOxalatoInicial * (COEFICIENTE_CO2 / COEFICIENTE_OXALATO);
    const molMn2ProduzidoNoPE = molMnO4Equivalencia;
    const potencialFormalOxalatoV = calcularPotencialFormalOxalato({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    const potencialFormalPermanganatoV = (0, permanganometria_1.calcularPotencialFormalPermanganato)({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        temperaturaC,
    });
    const potencialEquivalenciaV = calcularPotencialEquivalenciaOxalato({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        atividadeCO2,
        temperaturaC,
    });
    if (!Number.isFinite(potencialEquivalenciaV)) {
        throw new Error("Não foi possível calcular o potencial teórico no PE do sistema H₂C₂O₄/MnO₄⁻.");
    }
    return {
        reacaoGlobal: exports.REACAO_PERMANGANATO_OXALATO,
        coeficienteAnalito: COEFICIENTE_OXALATO,
        coeficienteTitulante: COEFICIENTE_MNO4,
        razaoOxalatoPorMnO4: COEFICIENTE_OXALATO / COEFICIENTE_MNO4,
        molOxalatoInicial,
        molMnO4Equivalencia,
        volumeEquivalenciaMl: estequiometria.volumeEquivalenciaMl,
        potencialFormalOxalatoV,
        potencialFormalPermanganatoV,
        potencialEquivalenciaV,
        molHPlusEstequiometrico,
        molHPlusInicialAproximado,
        excessoHPlusMol,
        molCO2ProduzidoNoPE,
        molMn2ProduzidoNoPE,
        atividadeCO2,
        temperaturaC,
        autocatalitica: true,
        catalisadorGerado: "Mn2+",
        observacoes: [
            "A reação entre permanganato e ácido oxálico apresenta comportamento autocatalítico devido à formação de Mn²⁺.",
            "O CO₂ é considerado na fase gasosa, com pressão aproximada de 1 atm.",
        ],
    };
}
exports.calcularSistemaPermanganometriaOxalato = calcularSistemaPermanganometriaOxalato;
function calcularPontoPermanganometriaOxalato({ entrada, volumeAdicionadoMl, }) {
    validarEntradaOxalato(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) || volumeAdicionadoMl < 0) {
        throw new Error("O volume de titulante adicionado deve ser maior ou igual a zero.");
    }
    const sistema = calcularSistemaPermanganometriaOxalato(entrada);
    const temperaturaC = entrada.temperaturaC ?? 25;
    const atividadeCO2 = entrada.atividadeCO2 ?? 1;
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
    let molH2C2O4 = 0;
    let molCO2 = 0;
    let molMnO4 = 0;
    let molMn2 = 0;
    let potencialV = null;
    if (regiao === "antes_pe") {
        molH2C2O4 = Math.max(0, sistema.molOxalatoInicial - (5 / 2) * molMnO4Adicionado);
        molCO2 = 5 * molMnO4Adicionado;
        molMn2 = molMnO4Adicionado;
        if (molH2C2O4 > 0 && molCO2 > 0) {
            const concentracaoH2C2O4 = molH2C2O4 / volumeTotalL;
            const quociente = concentracaoH2C2O4 /
                (atividadeCO2 ** 2 * entrada.concentracaoHPlusMolL ** 2);
            const fator = (0, nernst_1.calcularFatorNernst)({ temperaturaC, numeroEletrons: 2 });
            potencialV = dadosRedox_1.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO.potencialPadraoReducao -
                fator * Math.log10(quociente);
        }
    }
    else if (regiao === "pe") {
        molCO2 = sistema.molCO2ProduzidoNoPE;
        molMn2 = sistema.molMn2ProduzidoNoPE;
        potencialV = sistema.potencialEquivalenciaV;
    }
    else {
        molCO2 = sistema.molCO2ProduzidoNoPE;
        molMn2 = sistema.molMn2ProduzidoNoPE;
        molMnO4 = Math.max(0, molMnO4Adicionado - sistema.molMnO4Equivalencia);
        if (molMnO4 > 0 && molMn2 > 0) {
            const concentracaoMnO4 = molMnO4 / volumeTotalL;
            const concentracaoMn2 = molMn2 / volumeTotalL;
            const quociente = concentracaoMn2 /
                (concentracaoMnO4 * entrada.concentracaoHPlusMolL ** 8);
            const fator = (0, nernst_1.calcularFatorNernst)({ temperaturaC, numeroEletrons: 5 });
            potencialV = dadosRedox_1.PAR_PERMANGANATO_MANGANES.potencialPadraoReducao -
                fator * Math.log10(quociente);
        }
    }
    const concentracaoH2C2O4MolL = molH2C2O4 / volumeTotalL;
    const concentracaoMnO4MolL = molMnO4 / volumeTotalL;
    const concentracaoMn2MolL = molMn2 / volumeTotalL;
    const parControlador = regiao === "antes_pe"
        ? "CO2/H2C2O4"
        : regiao === "pe"
            ? "equivalencia"
            : "MnO4-/Mn2+";
    const descricao = regiao === "antes_pe"
        ? "Antes do ponto de equivalência, H₂C₂O₄ permanece em excesso e o potencial é calculado pelo par CO₂/H₂C₂O₄."
        : regiao === "pe"
            ? "No ponto de equivalência, o potencial corresponde à média ponderada dos potenciais dos pares CO₂/H₂C₂O₄ e MnO₄⁻/Mn²⁺."
            : "Após o ponto de equivalência, MnO₄⁻ permanece em excesso e o potencial é calculado pelo par MnO₄⁻/Mn²⁺.";
    return {
        volumeAdicionadoMl,
        volumeTotalMl,
        volumeEquivalenciaMl: sistema.volumeEquivalenciaMl,
        regiao,
        potencialV,
        parControlador,
        molOxalatoTotalRemanescente: molH2C2O4,
        molH2C2O4,
        molHC2O4: 0,
        molC2O4: 0,
        molCO2,
        molMnO4,
        molMn2,
        concentracaoOxalatoTotalMolL: concentracaoH2C2O4MolL,
        concentracaoH2C2O4MolL,
        concentracaoHC2O4MolL: 0,
        concentracaoC2O4MolL: 0,
        concentracaoMnO4MolL,
        concentracaoMn2MolL,
        descricao,
    };
}
exports.calcularPontoPermanganometriaOxalato = calcularPontoPermanganometriaOxalato;
