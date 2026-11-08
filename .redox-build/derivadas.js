"use strict";
/* =========================================================
 * DERIVADAS NUMÉRICAS DA CURVA POTENCIOMÉTRICA REDOX
 * ======================================================= */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularDerivadasRedox = void 0;
function prepararPontos(pontos) {
    const mapa = new Map();
    pontos.forEach((ponto) => {
        if (!Number.isFinite(ponto.volumeAdicionadoMl) ||
            ponto.potencialV === null ||
            !Number.isFinite(ponto.potencialV))
            return;
        mapa.set(ponto.volumeAdicionadoMl, ponto.potencialV);
    });
    return Array.from(mapa.entries())
        .map(([volumeMl, potencialV]) => ({ volumeMl, potencialV }))
        .sort((a, b) => a.volumeMl - b.volumeMl);
}
/** Diferenças finitas progressivas, associadas ao ponto médio do intervalo. */
function calcularPrimeiraDerivada(pontos) {
    const resultado = [];
    for (let indice = 0; indice < pontos.length - 1; indice += 1) {
        const atual = pontos[indice];
        const proximo = pontos[indice + 1];
        const deltaVolume = proximo.volumeMl - atual.volumeMl;
        if (!Number.isFinite(deltaVolume) || deltaVolume <= 0)
            continue;
        const primeiraDerivada = (proximo.potencialV - atual.potencialV) / deltaVolume;
        const volumeMedio = (atual.volumeMl + proximo.volumeMl) / 2;
        if (Number.isFinite(primeiraDerivada) && Number.isFinite(volumeMedio)) {
            resultado.push({ volumeMl: volumeMedio, primeiraDerivada });
        }
    }
    return resultado;
}
/**
 * Segunda derivada calculada DIRETAMENTE da curva E(V), usando a fórmula
 * de três pontos para espaçamentos não uniformes:
 *
 * E''(Vᵢ) ≈ 2/(h₁+h₂) × [(Eᵢ₊₁-Eᵢ)/h₂ - (Eᵢ-Eᵢ₋₁)/h₁]
 *
 * Não depende do máximo da primeira derivada e não insere zeros artificiais.
 */
function calcularSegundaDerivada(pontos) {
    const resultado = [];
    for (let indice = 1; indice < pontos.length - 1; indice += 1) {
        const anterior = pontos[indice - 1];
        const atual = pontos[indice];
        const proximo = pontos[indice + 1];
        const h1 = atual.volumeMl - anterior.volumeMl;
        const h2 = proximo.volumeMl - atual.volumeMl;
        if (!Number.isFinite(h1) || !Number.isFinite(h2) ||
            h1 <= 0 || h2 <= 0)
            continue;
        const inclinacaoAnterior = (atual.potencialV - anterior.potencialV) / h1;
        const inclinacaoPosterior = (proximo.potencialV - atual.potencialV) / h2;
        const segundaDerivada = (2 * (inclinacaoPosterior - inclinacaoAnterior)) / (h1 + h2);
        if (Number.isFinite(segundaDerivada)) {
            resultado.push({ volumeMl: atual.volumeMl, segundaDerivada });
        }
    }
    return resultado;
}
function encontrarIndiceMaximoPrimeiraDerivada(pontos) {
    if (pontos.length === 0) {
        throw new Error('Não existem pontos válidos para localizar o máximo da primeira derivada.');
    }
    let indiceMaximo = 0;
    for (let indice = 1; indice < pontos.length; indice += 1) {
        if (pontos[indice].primeiraDerivada > pontos[indiceMaximo].primeiraDerivada) {
            indiceMaximo = indice;
        }
    }
    return indiceMaximo;
}
function refinarExtremoPrimeiraDerivada(pontos, usarMagnitude = false) {
    const indiceExtremo = usarMagnitude
        ? pontos.reduce((melhor, ponto, indice, lista) => Math.abs(ponto.primeiraDerivada) > Math.abs(lista[melhor].primeiraDerivada)
            ? indice : melhor, 0)
        : encontrarIndiceMaximoPrimeiraDerivada(pontos);
    const central = pontos[indiceExtremo];
    const valorCentral = central.primeiraDerivada;
    if (indiceExtremo === 0 || indiceExtremo === pontos.length - 1) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    const anterior = pontos[indiceExtremo - 1];
    const posterior = pontos[indiceExtremo + 1];
    const uAnterior = anterior.volumeMl - central.volumeMl;
    const uPosterior = posterior.volumeMl - central.volumeMl;
    if (uAnterior === 0 || uPosterior === 0 || uAnterior === uPosterior) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    const inclinacaoAnterior = (anterior.primeiraDerivada - valorCentral) / uAnterior;
    const inclinacaoPosterior = (posterior.primeiraDerivada - valorCentral) / uPosterior;
    const a = (inclinacaoAnterior - inclinacaoPosterior) / (uAnterior - uPosterior);
    const b = inclinacaoAnterior - a * uAnterior;
    // Máximo: parábola côncava para baixo. Mínimo: côncava para cima.
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) < 1e-18) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    const esperaConcavidadeParaBaixo = !usarMagnitude || central.primeiraDerivada >= 0;
    const parabolaNaoRepresentaExtremo = esperaConcavidadeParaBaixo
        ? a >= 0
        : a <= 0;
    if (parabolaNaoRepresentaExtremo) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    const uVertice = -b / (2 * a);
    const volumeVertice = central.volumeMl + uVertice;
    if (!Number.isFinite(volumeVertice) ||
        volumeVertice < anterior.volumeMl ||
        volumeVertice > posterior.volumeMl) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    const valorVertice = a * uVertice * uVertice + b * uVertice + valorCentral;
    if (!Number.isFinite(valorVertice)) {
        return { volumeMl: central.volumeMl, valorMaximoPrimeiraDerivada: valorCentral };
    }
    return { volumeMl: volumeVertice, valorMaximoPrimeiraDerivada: valorVertice };
}
/** Localiza um cruzamento verdadeiro de sinal em E''(V), se existir. */
function localizarCruzamentoSegundaDerivada(pontos, referenciaVolumeMl) {
    const candidatos = [];
    for (let indice = 0; indice < pontos.length - 1; indice += 1) {
        const atual = pontos[indice];
        const proximo = pontos[indice + 1];
        const y1 = atual.segundaDerivada;
        const y2 = proximo.segundaDerivada;
        // Cruzamento estrito de sinal: evita declarar PF em curvas sempre positivas.
        if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
            const volumeZero = atual.volumeMl -
                y1 * (proximo.volumeMl - atual.volumeMl) / (y2 - y1);
            if (Number.isFinite(volumeZero))
                candidatos.push(volumeZero);
        }
    }
    // Um zero amostrado só conta quando os pontos dos dois lados têm sinais opostos.
    for (let indice = 1; indice < pontos.length - 1; indice += 1) {
        if (pontos[indice].segundaDerivada !== 0)
            continue;
        const anterior = pontos[indice - 1].segundaDerivada;
        const posterior = pontos[indice + 1].segundaDerivada;
        if ((anterior < 0 && posterior > 0) || (anterior > 0 && posterior < 0)) {
            candidatos.push(pontos[indice].volumeMl);
        }
    }
    if (candidatos.length === 0) {
        return { pontos, volumeMl: null };
    }
    const volumeMl = candidatos.reduce((maisProximo, candidato) => Math.abs(candidato - referenciaVolumeMl) < Math.abs(maisProximo - referenciaVolumeMl)
        ? candidato : maisProximo);
    const jaExiste = pontos.some((ponto) => Math.abs(ponto.volumeMl - volumeMl) <= 1e-12 &&
        ponto.segundaDerivada === 0);
    const pontosComZero = jaExiste
        ? pontos
        : [...pontos, { volumeMl, segundaDerivada: 0 }]
            .sort((a, b) => a.volumeMl - b.volumeMl);
    return { pontos: pontosComZero, volumeMl };
}
function calcularDerivadasRedox(pontosEntrada, usarMagnitudeDaPrimeiraDerivada = false) {
    const pontos = prepararPontos(pontosEntrada);
    if (pontos.length < 4) {
        throw new Error('São necessários pelo menos quatro pontos válidos para calcular as derivadas.');
    }
    const primeiraDerivadaBase = calcularPrimeiraDerivada(pontos);
    if (primeiraDerivadaBase.length < 3) {
        throw new Error('Não existem pontos suficientes para refinar a primeira derivada.');
    }
    const segundaDerivadaBase = calcularSegundaDerivada(pontos);
    if (segundaDerivadaBase.length < 2) {
        throw new Error('Não existem pontos suficientes para calcular a segunda derivada.');
    }
    const pontoInflexao = refinarExtremoPrimeiraDerivada(primeiraDerivadaBase, usarMagnitudeDaPrimeiraDerivada);
    const primeiraDerivada = [
        ...primeiraDerivadaBase.filter((ponto) => Math.abs(ponto.volumeMl - pontoInflexao.volumeMl) > 1e-12),
        {
            volumeMl: pontoInflexao.volumeMl,
            primeiraDerivada: pontoInflexao.valorMaximoPrimeiraDerivada,
        },
    ].sort((a, b) => a.volumeMl - b.volumeMl);
    const segundaResultado = localizarCruzamentoSegundaDerivada(segundaDerivadaBase, pontoInflexao.volumeMl);
    return {
        primeiraDerivada,
        segundaDerivada: segundaResultado.pontos,
        volumePFPrimeiraDerivadaMl: pontoInflexao.volumeMl,
        valorMaximoPrimeiraDerivada: pontoInflexao.valorMaximoPrimeiraDerivada,
        volumePFSegundaDerivadaMl: segundaResultado.volumeMl,
    };
}
exports.calcularDerivadasRedox = calcularDerivadasRedox;
