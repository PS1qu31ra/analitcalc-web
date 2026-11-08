"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolverEquilibrioPermanganometriaFerro = void 0;
const dadosRedox_1 = require("./dadosRedox");
const nernst_1 = require("./nernst");
/* =========================================================
 * CONSTANTES
 * ======================================================= */
const COEFICIENTE_FE = 5;
/* =========================================================
 * UTILITÁRIOS
 * ======================================================= */
function validarNumeroPositivo(valor, nome) {
    if (!Number.isFinite(valor) ||
        valor <= 0) {
        throw new Error(`${nome} deve ser positivo e finito.`);
    }
}
function concentracao({ mols, volumeMl, }) {
    return (mols /
        (volumeMl /
            1000));
}
/**
 * Para uma razão:
 *
 * r = espécie A / espécie B
 *
 * recebemos log10(r) e retornamos
 * as frações relativas sem calcular
 * números excessivamente grandes.
 */
function calcularFracoesRazao(logRazao) {
    if (logRazao >=
        0) {
        const inverso = Math.pow(10, -Math.min(logRazao, 300));
        const denominador = 1 +
            inverso;
        return {
            fracaoNumerador: 1 /
                denominador,
            fracaoDenominador: inverso /
                denominador,
        };
    }
    const razao = Math.pow(10, Math.max(logRazao, -300));
    const denominador = 1 +
        razao;
    return {
        fracaoNumerador: razao /
            denominador,
        fracaoDenominador: 1 /
            denominador,
    };
}
/* =========================================================
 * DISTRIBUIÇÃO DAS ESPÉCIES PARA UM POTENCIAL
 * ======================================================= */
function calcularDistribuicao({ potencialV, molFeTotal, molMnTotal, concentracaoHPlusMolL, temperaturaC, }) {
    const fatorFe = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 1,
    });
    const fatorMn = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 5,
    });
    /*
     * Fe³⁺ + e⁻ ⇌ Fe²⁺
     *
     * E =
     * E° +
     * f log(Fe³⁺/Fe²⁺)
     *
     * portanto:
     *
     * log(Fe³⁺/Fe²⁺)
     * =
     * (E - E°) / f
     */
    const logRazaoFe = (potencialV -
        dadosRedox_1.PAR_FERRO_III_FERRO_II
            .potencialPadraoReducao) /
        fatorFe;
    const fracoesFe = calcularFracoesRazao(logRazaoFe);
    /*
     * MnO₄⁻ + 8H⁺ + 5e⁻
     * ⇌
     * Mn²⁺ + 4H₂O
     *
     * E =
     * E° -
     * f log[
     *   Mn²⁺ /
     *   (MnO₄⁻ H⁺⁸)
     * ]
     *
     * portanto:
     *
     * log(Mn²⁺/MnO₄⁻)
     * =
     * (E° - E)/f +
     * 8 log(H⁺)
     */
    const logRazaoMn = ((dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao -
        potencialV) /
        fatorMn) +
        (8 *
            Math.log10(concentracaoHPlusMolL));
    const fracoesMn = calcularFracoesRazao(logRazaoMn);
    const molFe3 = molFeTotal *
        fracoesFe
            .fracaoNumerador;
    const molFe2 = molFeTotal *
        fracoesFe
            .fracaoDenominador;
    /*
     * Para Mn:
     *
     * numerador da razão = Mn²⁺
     * denominador = MnO₄⁻
     */
    const molMn2 = molMnTotal *
        fracoesMn
            .fracaoNumerador;
    const molMnO4 = molMnTotal *
        fracoesMn
            .fracaoDenominador;
    return {
        molFe2,
        molFe3,
        molMnO4,
        molMn2,
    };
}
/* =========================================================
 * RESÍDUO DO BALANÇO ELETRÔNICO
 * ======================================================= */
/**
 * Pela reação:
 *
 * MnO₄⁻ + 5 Fe²⁺
 * →
 * Mn²⁺ + 5 Fe³⁺
 *
 * cada 1 mol de Mn²⁺ formado
 * corresponde a 5 mol de Fe³⁺.
 *
 * No equilíbrio:
 *
 * n(Fe³⁺) - 5 n(Mn²⁺) = 0
 */
function calcularResiduo({ potencialV, molFeTotal, molMnTotal, concentracaoHPlusMolL, temperaturaC, }) {
    const distribuicao = calcularDistribuicao({
        potencialV,
        molFeTotal,
        molMnTotal,
        concentracaoHPlusMolL,
        temperaturaC,
    });
    /*
     * Balanço rearranjado para evitar cancelamento de números grandes
     * e quase iguais no ponto de equivalência:
     * nFe,0 - 5 nMn,total - nFe²⁺ + 5 nMnO₄⁻ = 0.
     */
    return ((molFeTotal -
        COEFICIENTE_FE * molMnTotal) -
        distribuicao.molFe2 +
        COEFICIENTE_FE * distribuicao.molMnO4);
}
/* =========================================================
 * RESOLVEDOR DO EQUILÍBRIO
 * ======================================================= */
function resolverEquilibrioPermanganometriaFerro(entrada) {
    validarNumeroPositivo(entrada.molFeTotal, "A quantidade total de ferro");
    validarNumeroPositivo(entrada.volumeTotalMl, "O volume total");
    validarNumeroPositivo(entrada
        .concentracaoHPlusMolL, "A concentração de H⁺");
    if (!Number.isFinite(entrada.molMnTotal) ||
        entrada.molMnTotal <
            0) {
        throw new Error("A quantidade total de manganês deve ser maior ou igual a zero.");
    }
    const temperaturaC = entrada.temperaturaC ??
        25;
    if (!Number.isFinite(temperaturaC) ||
        temperaturaC <=
            -273.15) {
        throw new Error("A temperatura informada é fisicamente inválida.");
    }
    /*
     * Antes da primeira adição de KMnO₄
     * não temos o segundo par redox
     * presente para definir um potencial
     * de equilíbrio pelo modelo acoplado.
     */
    if (entrada.molMnTotal ===
        0) {
        const concentracaoFe2MolL = concentracao({
            mols: entrada.molFeTotal,
            volumeMl: entrada.volumeTotalMl,
        });
        return {
            potencialV: null,
            molFe2: entrada.molFeTotal,
            molFe3: 0,
            molMnO4: 0,
            molMn2: 0,
            concentracaoFe2MolL,
            concentracaoFe3MolL: 0,
            concentracaoMnO4MolL: 0,
            concentracaoMn2MolL: 0,
            erroBalancoEletronicoMol: 0,
        };
    }
    const fatorUmEletron = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 1,
    });
    /*
     * Potencial formal aproximado
     * MnO₄⁻/Mn²⁺ considerando [H⁺].
     */
    const potencialFormalMn = dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
        ((8 *
            fatorUmEletron) /
            5) *
            Math.log10(entrada
                .concentracaoHPlusMolL);
    /*
     * Criamos uma faixa ampla em torno
     * dos potenciais dos dois pares.
     */
    let limiteInferior = Math.min(dadosRedox_1.PAR_FERRO_III_FERRO_II
        .potencialPadraoReducao, potencialFormalMn) -
        2;
    let limiteSuperior = Math.max(dadosRedox_1.PAR_FERRO_III_FERRO_II
        .potencialPadraoReducao, potencialFormalMn) +
        2;
    let residuoInferior = calcularResiduo({
        potencialV: limiteInferior,
        molFeTotal: entrada.molFeTotal,
        molMnTotal: entrada.molMnTotal,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
    });
    let residuoSuperior = calcularResiduo({
        potencialV: limiteSuperior,
        molFeTotal: entrada.molFeTotal,
        molMnTotal: entrada.molMnTotal,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
    });
    /*
     * Caso alguma condição extrema
     * coloque a raiz fora da primeira
     * faixa, expandimos os limites.
     */
    for (let tentativa = 0; tentativa <
        20 &&
        (residuoInferior >
            0 ||
            residuoSuperior <
                0); tentativa +=
        1) {
        if (residuoInferior >
            0) {
            limiteInferior -=
                2;
            residuoInferior =
                calcularResiduo({
                    potencialV: limiteInferior,
                    molFeTotal: entrada.molFeTotal,
                    molMnTotal: entrada.molMnTotal,
                    concentracaoHPlusMolL: entrada
                        .concentracaoHPlusMolL,
                    temperaturaC,
                });
        }
        if (residuoSuperior <
            0) {
            limiteSuperior +=
                2;
            residuoSuperior =
                calcularResiduo({
                    potencialV: limiteSuperior,
                    molFeTotal: entrada.molFeTotal,
                    molMnTotal: entrada.molMnTotal,
                    concentracaoHPlusMolL: entrada
                        .concentracaoHPlusMolL,
                    temperaturaC,
                });
        }
    }
    if (residuoInferior >
        0 ||
        residuoSuperior <
            0) {
        throw new Error("Não foi possível localizar o equilíbrio eletroquímico do sistema Fe²⁺/MnO₄⁻.");
    }
    /*
     * Bisseção no POTENCIAL.
     *
     * Procuramos:
     *
     * n(Fe³⁺)
     * =
     * 5 n(Mn²⁺)
     */
    for (let iteracao = 0; iteracao <
        200; iteracao +=
        1) {
        const meio = (limiteInferior +
            limiteSuperior) /
            2;
        const residuoMeio = calcularResiduo({
            potencialV: meio,
            molFeTotal: entrada.molFeTotal,
            molMnTotal: entrada.molMnTotal,
            concentracaoHPlusMolL: entrada
                .concentracaoHPlusMolL,
            temperaturaC,
        });
        if (residuoMeio <
            0) {
            limiteInferior =
                meio;
        }
        else {
            limiteSuperior =
                meio;
        }
        if (Math.abs(limiteSuperior -
            limiteInferior) <
            1e-12) {
            break;
        }
    }
    const potencialV = (limiteInferior +
        limiteSuperior) /
        2;
    const distribuicao = calcularDistribuicao({
        potencialV,
        molFeTotal: entrada.molFeTotal,
        molMnTotal: entrada.molMnTotal,
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        temperaturaC,
    });
    const concentracaoFe2MolL = concentracao({
        mols: distribuicao.molFe2,
        volumeMl: entrada.volumeTotalMl,
    });
    const concentracaoFe3MolL = concentracao({
        mols: distribuicao.molFe3,
        volumeMl: entrada.volumeTotalMl,
    });
    const concentracaoMnO4MolL = concentracao({
        mols: distribuicao.molMnO4,
        volumeMl: entrada.volumeTotalMl,
    });
    const concentracaoMn2MolL = concentracao({
        mols: distribuicao.molMn2,
        volumeMl: entrada.volumeTotalMl,
    });
    const erroBalancoEletronicoMol = distribuicao
        .molFe3 -
        (5 *
            distribuicao
                .molMn2);
    return {
        potencialV,
        ...distribuicao,
        concentracaoFe2MolL,
        concentracaoFe3MolL,
        concentracaoMnO4MolL,
        concentracaoMn2MolL,
        erroBalancoEletronicoMol,
    };
}
exports.resolverEquilibrioPermanganometriaFerro = resolverEquilibrioPermanganometriaFerro;
