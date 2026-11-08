"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolverEquilibrioPermanganometriaOxalato = void 0;
const dadosRedox_1 = require("./dadosRedox");
const nernst_1 = require("./nernst");
const especiacaoOxalato_1 = require("./especiacaoOxalato");
const OXALATO_POR_MNO4 = 5 /
    2;
function validarPositivo(valor, nome) {
    if (!Number.isFinite(valor) ||
        valor <=
            0) {
        throw new Error(`${nome} deve ser positivo e finito.`);
    }
}
function concentracao(mols, volumeMl) {
    return (mols /
        (volumeMl /
            1000));
}
function potencia10Limitada(expoente) {
    return Math.pow(10, Math.min(Math.max(expoente, -300), 300));
}
function calcularFracoesRazao(logRazao) {
    if (logRazao >=
        0) {
        const inverso = potencia10Limitada(-logRazao);
        const denominador = 1 +
            inverso;
        return {
            fracaoNumerador: 1 /
                denominador,
            fracaoDenominador: inverso /
                denominador,
        };
    }
    const razao = potencia10Limitada(logRazao);
    const denominador = 1 +
        razao;
    return {
        fracaoNumerador: razao /
            denominador,
        fracaoDenominador: 1 /
            denominador,
    };
}
function calcularPotenciaisFormais({ concentracaoHPlusMolL, atividadeCO2, temperaturaC, }) {
    const fatorOxalato = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 2,
    });
    const fatorMn = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 5,
    });
    const fracoes = (0, especiacaoOxalato_1.calcularFracoesEspeciacaoOxalato)(concentracaoHPlusMolL);
    const potencialFormalOxalatoV = dadosRedox_1.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
        .potencialPadraoReducao -
        fatorOxalato *
            Math.log10(fracoes
                .fracaoH2C2O4 /
                (Math.pow(atividadeCO2, 2) *
                    Math.pow(concentracaoHPlusMolL, 2)));
    const potencialFormalPermanganatoV = dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
        8 *
            fatorMn *
            Math.log10(concentracaoHPlusMolL);
    return {
        potencialFormalOxalatoV,
        potencialFormalPermanganatoV,
    };
}
function calcularDistribuicao({ potencialV, molOxalatoTotalInicial, molMnTotal, volumeTotalMl, concentracaoHPlusMolL, atividadeCO2, temperaturaC, }) {
    const fatorOxalato = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 2,
    });
    const fatorMn = (0, nernst_1.calcularFatorNernst)({
        temperaturaC,
        numeroEletrons: 5,
    });
    const fracoes = (0, especiacaoOxalato_1.calcularFracoesEspeciacaoOxalato)(concentracaoHPlusMolL);
    /*
     * 2 CO₂ + 2 H⁺ + 2 e⁻
     * ⇌
     * H₂C₂O₄
     *
     * E =
     * E° -
     * f log(
     *   a(H₂C₂O₄) /
     *   [a(CO₂)² a(H⁺)²]
     * )
     */
    const logConcentracaoH2C2O4 = 2 *
        Math.log10(atividadeCO2) +
        2 *
            Math.log10(concentracaoHPlusMolL) +
        (dadosRedox_1.PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
            .potencialPadraoReducao -
            potencialV) /
            fatorOxalato;
    const concentracaoH2C2O4MolL = potencia10Limitada(logConcentracaoH2C2O4);
    /*
     * [H₂C₂O₄]
     * =
     * α₀ × C_oxalato,total
     */
    const concentracaoOxalatoTotalMolL = concentracaoH2C2O4MolL /
        fracoes
            .fracaoH2C2O4;
    const molOxalatoTotalRemanescente = concentracaoOxalatoTotalMolL *
        (volumeTotalMl /
            1000);
    const molH2C2O4 = molOxalatoTotalRemanescente *
        fracoes
            .fracaoH2C2O4;
    const molHC2O4 = molOxalatoTotalRemanescente *
        fracoes
            .fracaoHC2O4;
    const molC2O4 = molOxalatoTotalRemanescente *
        fracoes
            .fracaoC2O4;
    /*
     * MnO₄⁻ + 8 H⁺ + 5 e⁻
     * ⇌
     * Mn²⁺ + 4 H₂O
     */
    const logRazaoMn = (dadosRedox_1.PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao -
        potencialV) /
        fatorMn +
        8 *
            Math.log10(concentracaoHPlusMolL);
    const fracoesMn = calcularFracoesRazao(logRazaoMn);
    const molMn2 = molMnTotal *
        fracoesMn
            .fracaoNumerador;
    const molMnO4 = molMnTotal *
        fracoesMn
            .fracaoDenominador;
    const molOxalatoConsumido = molOxalatoTotalInicial -
        molOxalatoTotalRemanescente;
    /*
     * Cada mol de oxalato oxidado
     * gera 2 mol de CO₂.
     */
    const molCO2 = Math.max(2 *
        molOxalatoConsumido, 0);
    return {
        molOxalatoTotalRemanescente,
        molH2C2O4,
        molHC2O4,
        molC2O4,
        molCO2,
        molMnO4,
        molMn2,
        concentracaoOxalatoTotalMolL,
        concentracaoH2C2O4MolL,
        concentracaoHC2O4MolL: concentracao(molHC2O4, volumeTotalMl),
        concentracaoC2O4MolL: concentracao(molC2O4, volumeTotalMl),
        concentracaoMnO4MolL: concentracao(molMnO4, volumeTotalMl),
        concentracaoMn2MolL: concentracao(molMn2, volumeTotalMl),
    };
}
function calcularResiduo(entrada) {
    const distribuicao = calcularDistribuicao(entrada);
    /*
     * Balanço rearranjado para evitar subtrair duas quantidades grandes
     * e quase iguais no ponto de equivalência:
     * nOx,0 - (5/2)nMn,total - nOx,remanescente + (5/2)nMnO4 = 0.
     */
    return ((entrada.molOxalatoTotalInicial -
        OXALATO_POR_MNO4 * entrada.molMnTotal) -
        distribuicao.molOxalatoTotalRemanescente +
        OXALATO_POR_MNO4 * distribuicao.molMnO4);
}
function resolverEquilibrioPermanganometriaOxalato(entrada) {
    validarPositivo(entrada
        .molOxalatoTotalInicial, "A quantidade total de oxalato");
    validarPositivo(entrada
        .volumeTotalMl, "O volume total");
    validarPositivo(entrada
        .concentracaoHPlusMolL, "A concentração de H⁺");
    validarPositivo(entrada
        .atividadeCO2, "A atividade de CO₂");
    if (!Number.isFinite(entrada
        .molMnTotal) ||
        entrada
            .molMnTotal <
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
    if (entrada
        .molMnTotal ===
        0) {
        const fracoes = (0, especiacaoOxalato_1.calcularFracoesEspeciacaoOxalato)(entrada
            .concentracaoHPlusMolL);
        const concentracaoOxalatoTotalMolL = concentracao(entrada
            .molOxalatoTotalInicial, entrada
            .volumeTotalMl);
        return {
            potencialV: null,
            molOxalatoTotalRemanescente: entrada
                .molOxalatoTotalInicial,
            molH2C2O4: entrada
                .molOxalatoTotalInicial *
                fracoes
                    .fracaoH2C2O4,
            molHC2O4: entrada
                .molOxalatoTotalInicial *
                fracoes
                    .fracaoHC2O4,
            molC2O4: entrada
                .molOxalatoTotalInicial *
                fracoes
                    .fracaoC2O4,
            molCO2: 0,
            molMnO4: 0,
            molMn2: 0,
            concentracaoOxalatoTotalMolL,
            concentracaoH2C2O4MolL: concentracaoOxalatoTotalMolL *
                fracoes
                    .fracaoH2C2O4,
            concentracaoHC2O4MolL: concentracaoOxalatoTotalMolL *
                fracoes
                    .fracaoHC2O4,
            concentracaoC2O4MolL: concentracaoOxalatoTotalMolL *
                fracoes
                    .fracaoC2O4,
            concentracaoMnO4MolL: 0,
            concentracaoMn2MolL: 0,
            erroBalancoEstequiometricoMol: 0,
        };
    }
    const potenciaisFormais = calcularPotenciaisFormais({
        concentracaoHPlusMolL: entrada
            .concentracaoHPlusMolL,
        atividadeCO2: entrada
            .atividadeCO2,
        temperaturaC,
    });
    let limiteInferior = Math.min(potenciaisFormais.potencialFormalOxalatoV, potenciaisFormais.potencialFormalPermanganatoV) - 2;
    let limiteSuperior = Math.max(potenciaisFormais.potencialFormalOxalatoV, potenciaisFormais.potencialFormalPermanganatoV) + 2;
    let residuoInferior = calcularResiduo({
        ...entrada,
        temperaturaC,
        potencialV: limiteInferior,
    });
    let residuoSuperior = calcularResiduo({
        ...entrada,
        temperaturaC,
        potencialV: limiteSuperior,
    });
    for (let tentativa = 0; tentativa < 20 && (residuoInferior > 0 || residuoSuperior < 0); tentativa += 1) {
        if (residuoInferior > 0) {
            limiteInferior -= 2;
            residuoInferior = calcularResiduo({
                ...entrada,
                temperaturaC,
                potencialV: limiteInferior,
            });
        }
        if (residuoSuperior < 0) {
            limiteSuperior += 2;
            residuoSuperior = calcularResiduo({
                ...entrada,
                temperaturaC,
                potencialV: limiteSuperior,
            });
        }
    }
    if (residuoInferior > 0 || residuoSuperior < 0) {
        throw new Error('Não foi possível localizar o equilíbrio eletroquímico do sistema oxalato/MnO₄⁻.');
    }
    for (let iteracao = 0; iteracao < 200; iteracao += 1) {
        const meio = (limiteInferior + limiteSuperior) / 2;
        const residuoMeio = calcularResiduo({
            ...entrada,
            temperaturaC,
            potencialV: meio,
        });
        if (residuoMeio < 0) {
            limiteInferior = meio;
        }
        else {
            limiteSuperior = meio;
        }
        if (Math.abs(limiteSuperior - limiteInferior) < 1e-12)
            break;
    }
    const potencialV = (limiteInferior + limiteSuperior) / 2;
    const distribuicao = calcularDistribuicao({
        ...entrada,
        temperaturaC,
        potencialV,
    });
    const molOxalatoConsumido = entrada
        .molOxalatoTotalInicial -
        distribuicao
            .molOxalatoTotalRemanescente;
    const erroBalancoEstequiometricoMol = molOxalatoConsumido -
        OXALATO_POR_MNO4 *
            distribuicao
                .molMn2;
    return {
        potencialV,
        ...distribuicao,
        erroBalancoEstequiometricoMol,
    };
}
exports.resolverEquilibrioPermanganometriaOxalato = resolverEquilibrioPermanganometriaOxalato;
