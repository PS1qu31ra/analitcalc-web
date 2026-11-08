"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarCurvaPermanganometriaFerro = void 0;
const permanganometria_1 = require("./permanganometria");
/* =========================================================
 * CONSTANTES
 * ======================================================= */
const PRECISAO_VOLUME = 9;
/* =========================================================
 * UTILITÁRIOS
 * ======================================================= */
function arredondarVolume(valor) {
    return Number(valor.toFixed(PRECISAO_VOLUME));
}
function numeroPositivo(valor) {
    return (Number.isFinite(valor) &&
        valor > 0);
}
function limitar({ valor, minimo, maximo, }) {
    return Math.min(Math.max(valor, minimo), maximo);
}
/* =========================================================
 * PASSOS AUTOMÁTICOS
 * ======================================================= */
function calcularPassoBaseAutomatico(volumeEquivalenciaMl) {
    /*
     * Aproximadamente 50 divisões
     * até o PE.
     */
    return Math.max(volumeEquivalenciaMl /
        50, 0.02);
}
function calcularPassoDensoAutomatico(volumeEquivalenciaMl) {
    /*
     * Aproximadamente 250 divisões
     * até o PE.
     *
     * Isso aumenta bastante a resolução
     * na região do salto de potencial.
     */
    return Math.max(volumeEquivalenciaMl /
        250, 0.002);
}
/* =========================================================
 * GERAÇÃO DOS VOLUMES
 * ======================================================= */
function gerarVolumesCurva({ volumeEquivalenciaMl, volumeMaximoMl, passoBaseMl, passoProximoPEMl, faixaDensaFracao, }) {
    /*
     * Set evita volumes duplicados.
     */
    const volumes = new Set();
    const adicionarVolume = (volume) => {
        if (!Number.isFinite(volume)) {
            return;
        }
        const volumeLimitado = limitar({
            valor: volume,
            minimo: 0,
            maximo: volumeMaximoMl,
        });
        volumes.add(arredondarVolume(volumeLimitado));
    };
    /* =======================================================
     * MALHA GERAL
     * ===================================================== */
    for (let volume = 0; volume <=
        volumeMaximoMl +
            passoBaseMl /
                2; volume +=
        passoBaseMl) {
        adicionarVolume(volume);
    }
    /* =======================================================
     * REGIÃO DENSA EM TORNO DO PE
     * ===================================================== */
    const inicioFaixaDensa = Math.max(0, volumeEquivalenciaMl *
        (1 -
            faixaDensaFracao));
    const fimFaixaDensa = Math.min(volumeMaximoMl, volumeEquivalenciaMl *
        (1 +
            faixaDensaFracao));
    for (let volume = inicioFaixaDensa; volume <=
        fimFaixaDensa +
            passoProximoPEMl /
                2; volume +=
        passoProximoPEMl) {
        adicionarVolume(volume);
    }
    /* =======================================================
     * PONTOS QUÍMICOS IMPORTANTES
     * ===================================================== */
    const fatoresPE = [
        0,
        0.25,
        0.5,
        0.75,
        0.9,
        0.95,
        0.98,
        0.99,
        1,
        1.01,
        1.02,
        1.05,
        1.1,
        1.25,
        1.5,
    ];
    fatoresPE.forEach((fator) => {
        adicionarVolume(volumeEquivalenciaMl *
            fator);
    });
    /*
     * Garante explicitamente
     * o último volume.
     */
    adicionarVolume(volumeMaximoMl);
    /*
     * Garante explicitamente
     * o ponto de equivalência.
     */
    adicionarVolume(volumeEquivalenciaMl);
    return Array.from(volumes).sort((a, b) => a - b);
}
/* =========================================================
 * CONVERSÃO EM PONTOS QUÍMICOS
 * ======================================================= */
function gerarPontos({ entrada, volumes, volumeEquivalenciaMl, }) {
    return volumes.map((volumeAdicionadoMl) => {
        const ponto = (0, permanganometria_1.calcularPontoPermanganometriaFerro)({
            entrada,
            volumeAdicionadoMl,
        });
        return {
            ...ponto,
            percentualPE: (volumeAdicionadoMl /
                volumeEquivalenciaMl) *
                100,
        };
    });
}
/* =========================================================
 * LIMITES DO POTENCIAL
 * ======================================================= */
function obterLimitesPotencial(pontos) {
    const potenciais = pontos
        .map((ponto) => ponto.potencialV)
        .filter((potencial) => potencial !== null &&
        Number.isFinite(potencial));
    if (potenciais.length ===
        0) {
        return {
            minimo: null,
            maximo: null,
        };
    }
    return {
        minimo: Math.min(...potenciais),
        maximo: Math.max(...potenciais),
    };
}
/* =========================================================
 * CURVA COMPLETA
 * ======================================================= */
function gerarCurvaPermanganometriaFerro({ entrada, configuracao = {}, }) {
    const sistema = (0, permanganometria_1.calcularSistemaPermanganometriaFerro)(entrada);
    const volumeEquivalenciaMl = sistema.volumeEquivalenciaMl;
    /* =======================================================
     * CONFIGURAÇÕES
     * ===================================================== */
    const volumeMaximoPadrao = volumeEquivalenciaMl *
        1.6;
    const volumeMaximoMl = configuracao
        .volumeMaximoMl ??
        volumeMaximoPadrao;
    if (!numeroPositivo(volumeMaximoMl)) {
        throw new Error("O volume máximo da curva deve ser positivo.");
    }
    if (volumeMaximoMl <
        volumeEquivalenciaMl) {
        throw new Error("O volume máximo da curva deve incluir o ponto de equivalência.");
    }
    const passoBaseMl = configuracao
        .passoBaseMl ??
        calcularPassoBaseAutomatico(volumeEquivalenciaMl);
    if (!numeroPositivo(passoBaseMl)) {
        throw new Error("O passo base da curva deve ser positivo.");
    }
    const passoProximoPEMl = configuracao
        .passoProximoPEMl ??
        calcularPassoDensoAutomatico(volumeEquivalenciaMl);
    if (!numeroPositivo(passoProximoPEMl)) {
        throw new Error("O passo próximo ao PE deve ser positivo.");
    }
    const faixaDensaFracao = configuracao
        .faixaDensaFracao ??
        0.12;
    if (!Number.isFinite(faixaDensaFracao) ||
        faixaDensaFracao <=
            0 ||
        faixaDensaFracao >=
            1) {
        throw new Error("A faixa densa deve estar entre 0 e 1.");
    }
    /* =======================================================
     * VOLUMES
     * ===================================================== */
    const volumes = gerarVolumesCurva({
        volumeEquivalenciaMl,
        volumeMaximoMl,
        passoBaseMl,
        passoProximoPEMl,
        faixaDensaFracao,
    });
    /* =======================================================
     * PONTOS
     * ===================================================== */
    const pontos = gerarPontos({
        entrada,
        volumes,
        volumeEquivalenciaMl,
    });
    /*
     * Pontos utilizáveis diretamente
     * em gráficos E × V.
     *
     * Exclui apenas pontos em que
     * não existe potencial calculável,
     * como V = 0 no modelo atual.
     */
    const pontosValidos = pontos.filter((ponto) => ponto.potencialV !==
        null &&
        Number.isFinite(ponto.potencialV));
    /* =======================================================
     * LOCALIZAÇÃO DO PE
     * ===================================================== */
    const pontoEquivalencia = pontos.find((ponto) => ponto.regiao ===
        "pe");
    if (!pontoEquivalencia) {
        throw new Error("O ponto de equivalência não foi encontrado na curva.");
    }
    /* =======================================================
     * LIMITES
     * ===================================================== */
    const limites = obterLimitesPotencial(pontosValidos);
    return {
        entrada,
        volumeEquivalenciaMl,
        potencialEquivalenciaV: sistema
            .potencialEquivalenciaV,
        volumeMaximoMl,
        passoBaseMl,
        passoProximoPEMl,
        pontos,
        pontosValidos,
        pontoEquivalencia,
        minimoPotencialV: limites.minimo,
        maximoPotencialV: limites.maximo,
    };
}
exports.gerarCurvaPermanganometriaFerro = gerarCurvaPermanganometriaFerro;
