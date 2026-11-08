"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPotencialNernst = exports.calcularFatorNernst = exports.calcularQuocienteReacaoRedox = void 0;
/* =========================================================
 * CONSTANTES FÍSICAS
 * ======================================================= */
/**
 * Constante universal dos gases.
 *
 * Unidade:
 * J mol⁻¹ K⁻¹
 */
const R = 8.314462618;
/**
 * Constante de Faraday.
 *
 * Unidade:
 * C mol⁻¹
 */
const F = 96485.33212;
/**
 * Conversão Celsius → Kelvin.
 */
const ZERO_CELSIUS_EM_KELVIN = 273.15;
/* =========================================================
 * VALIDAÇÕES
 * ======================================================= */
function temperaturaValida(temperaturaC) {
    return (Number.isFinite(temperaturaC) &&
        temperaturaC >
            -ZERO_CELSIUS_EM_KELVIN);
}
function numeroEletronsValido(numeroEletrons) {
    return (Number.isFinite(numeroEletrons) &&
        Number.isInteger(numeroEletrons) &&
        numeroEletrons > 0);
}
/* =========================================================
 * QUOCIENTE DE REAÇÃO EM ESPAÇO LOGARÍTMICO
 * ======================================================= */
const LOG10_MAX_NUMBER = Math.log10(Number.MAX_VALUE);
const LOG10_MIN_NUMBER = Math.log10(Number.MIN_VALUE);
function calcularLog10ProdutoAtividades({ termos, atividades, }) {
    let log10Produto = 0;
    for (const termo of termos) {
        const atividade = atividades[termo.especieId];
        if (!Number.isFinite(atividade) || atividade <= 0) {
            return {
                valido: false,
                log10Produto: NaN,
                especieInvalida: termo.especieId,
            };
        }
        if (!Number.isFinite(termo.expoente) || termo.expoente <= 0) {
            return {
                valido: false,
                log10Produto: NaN,
                especieInvalida: termo.especieId,
            };
        }
        log10Produto += termo.expoente * Math.log10(atividade);
        if (!Number.isFinite(log10Produto)) {
            return {
                valido: false,
                log10Produto: NaN,
                especieInvalida: termo.especieId,
            };
        }
    }
    return {
        valido: true,
        log10Produto,
        especieInvalida: null,
    };
}
function converterLog10ParaNumeroFinito(log10Valor) {
    return Math.pow(10, Math.min(LOG10_MAX_NUMBER, Math.max(LOG10_MIN_NUMBER, log10Valor)));
}
function calcularQuocienteReacaoRedox({ par, atividades, }) {
    const numerador = calcularLog10ProdutoAtividades({
        termos: par.quocienteReacao.numerador,
        atividades,
    });
    if (!numerador.valido) {
        return {
            valido: false,
            quociente: NaN,
            log10Quociente: NaN,
            mensagem: `Informe uma atividade positiva e finita para ${numerador.especieInvalida}.`,
        };
    }
    const denominador = calcularLog10ProdutoAtividades({
        termos: par.quocienteReacao.denominador,
        atividades,
    });
    if (!denominador.valido) {
        return {
            valido: false,
            quociente: NaN,
            log10Quociente: NaN,
            mensagem: `Informe uma atividade positiva e finita para ${denominador.especieInvalida}.`,
        };
    }
    const log10Quociente = numerador.log10Produto - denominador.log10Produto;
    if (!Number.isFinite(log10Quociente)) {
        return {
            valido: false,
            quociente: NaN,
            log10Quociente: NaN,
            mensagem: 'Não foi possível calcular o logaritmo do quociente de reação.',
        };
    }
    return {
        valido: true,
        // Q é limitado apenas para exibição; o potencial usa o logaritmo sem truncamento.
        quociente: converterLog10ParaNumeroFinito(log10Quociente),
        log10Quociente,
        mensagem: 'Quociente de reação calculado em espaço logarítmico.',
    };
}
exports.calcularQuocienteReacaoRedox = calcularQuocienteReacaoRedox;
/* =========================================================
 * FATOR DE NERNST
 * ======================================================= */
/**
 * Retorna:
 *
 * 2,303 RT
 * --------
 *    nF
 *
 * para utilização com log10.
 *
 * Em 25 °C:
 *
 * aproximadamente
 * 0,05916 / n
 */
function calcularFatorNernst({ temperaturaC = 25, numeroEletrons, }) {
    if (!temperaturaValida(temperaturaC) ||
        !numeroEletronsValido(numeroEletrons)) {
        return NaN;
    }
    const temperaturaK = temperaturaC +
        ZERO_CELSIUS_EM_KELVIN;
    return (Math.LN10 *
        R *
        temperaturaK) /
        (numeroEletrons *
            F);
}
exports.calcularFatorNernst = calcularFatorNernst;
/* =========================================================
 * EQUAÇÃO DE NERNST
 * ======================================================= */
/**
 * Para uma semirreação escrita no
 * sentido de redução:
 *
 * Ox + n e⁻ ⇌ Red
 *
 * E =
 *
 * E° - (2,303 RT / nF) log10(Q)
 */
function calcularPotencialNernst(entrada) {
    const { par, atividades, temperaturaC = 25, } = entrada;
    const temperaturaK = temperaturaC +
        ZERO_CELSIUS_EM_KELVIN;
    if (!temperaturaValida(temperaturaC)) {
        return {
            status: "dados_invalidos",
            par,
            temperaturaC,
            temperaturaK: NaN,
            numeroEletrons: par.numeroEletrons,
            potencialPadrao: par.potencialPadraoReducao,
            quocienteReacao: NaN,
            log10QuocienteReacao: NaN,
            fatorNernst: NaN,
            potencial: NaN,
            mensagem: "Informe uma temperatura fisicamente válida.",
        };
    }
    if (!numeroEletronsValido(par.numeroEletrons)) {
        return {
            status: "dados_invalidos",
            par,
            temperaturaC,
            temperaturaK,
            numeroEletrons: par.numeroEletrons,
            potencialPadrao: par.potencialPadraoReducao,
            quocienteReacao: NaN,
            log10QuocienteReacao: NaN,
            fatorNernst: NaN,
            potencial: NaN,
            mensagem: "O número de elétrons da semirreação deve ser um número inteiro positivo.",
        };
    }
    if (!Number.isFinite(par.potencialPadraoReducao)) {
        return {
            status: "dados_invalidos",
            par,
            temperaturaC,
            temperaturaK,
            numeroEletrons: par.numeroEletrons,
            potencialPadrao: par.potencialPadraoReducao,
            quocienteReacao: NaN,
            log10QuocienteReacao: NaN,
            fatorNernst: NaN,
            potencial: NaN,
            mensagem: "O potencial padrão de redução do par redox é inválido.",
        };
    }
    const resultadoQ = calcularQuocienteReacaoRedox({
        par,
        atividades,
    });
    if (!resultadoQ.valido) {
        return {
            status: "dados_invalidos",
            par,
            temperaturaC,
            temperaturaK,
            numeroEletrons: par.numeroEletrons,
            potencialPadrao: par.potencialPadraoReducao,
            quocienteReacao: NaN,
            log10QuocienteReacao: NaN,
            fatorNernst: NaN,
            potencial: NaN,
            mensagem: resultadoQ.mensagem,
        };
    }
    const fatorNernst = calcularFatorNernst({
        temperaturaC,
        numeroEletrons: par.numeroEletrons,
    });
    const potencial = par.potencialPadraoReducao -
        fatorNernst *
            resultadoQ.log10Quociente;
    if (!Number.isFinite(potencial)) {
        return {
            status: "dados_invalidos",
            par,
            temperaturaC,
            temperaturaK,
            numeroEletrons: par.numeroEletrons,
            potencialPadrao: par.potencialPadraoReducao,
            quocienteReacao: resultadoQ.quociente,
            log10QuocienteReacao: resultadoQ.log10Quociente,
            fatorNernst,
            potencial: NaN,
            mensagem: "Não foi possível calcular um potencial redox finito.",
        };
    }
    return {
        status: "ok",
        par,
        temperaturaC,
        temperaturaK,
        numeroEletrons: par.numeroEletrons,
        potencialPadrao: par.potencialPadraoReducao,
        quocienteReacao: resultadoQ.quociente,
        log10QuocienteReacao: resultadoQ.log10Quociente,
        fatorNernst,
        potencial,
        mensagem: `Potencial calculado pela equação de Nernst para o par ${par.nome}.`,
    };
}
exports.calcularPotencialNernst = calcularPotencialNernst;
