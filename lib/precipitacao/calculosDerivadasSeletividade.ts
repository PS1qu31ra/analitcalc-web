import type {
    PontoCurvaSeletividadePrecipitacao,
  } from "./calculosCurvaSeletividade";
  
  export type PontoPrimeiraDerivadaSeletividade = {
    volumeAdicionado: number;
    primeiraDerivada: number;
    moduloPrimeiraDerivada: number;
  };
  
  export type PontoSegundaDerivadaSeletividade = {
    volumeAdicionado: number;
    segundaDerivada: number;
  };
  
  export type EventoDerivadaSeletividade = {
    volumeAdicionado: number;
    primeiraDerivada: number;
    intensidade: number;
    indice: number;
  };
  
  export type ResultadoDerivadasSeletividade = {
    primeiraDerivada:
      PontoPrimeiraDerivadaSeletividade[];
    segundaDerivada:
      PontoSegundaDerivadaSeletividade[];
    eventos:
      EventoDerivadaSeletividade[];
    cruzamentosZero: number[];
    mensagem: string;
  };
  
  type PontoCurvaValido = {
    volumeAdicionado: number;
    pTitulante: number;
  };
  
  /**
 * Calcula a primeira derivada numérica por
 * diferença central em uma malha uniforme:
 *
 * f'(xᵢ) ≈
 * [f(xᵢ₊₁) - f(xᵢ₋₁)] / (2h)
 *
 * A primeira e a última posições não são
 * avaliadas porque não possuem dois vizinhos.
 */

  function calcularPrimeiraDerivadaNoIndice({
    pontos,
    indice,
    passo,
  }: {
    pontos: PontoCurvaValido[];
    indice: number;
    passo: number;
  }) {
    /*
     * A diferença central exige um ponto anterior
     * e um ponto posterior.
     *
     * Nas extremidades, a derivada não é calculada.
     */
    if (
      indice <= 0 ||
      indice >=
        pontos.length - 1 ||
      !Number.isFinite(passo) ||
      passo <= 0
    ) {
      return NaN;
    }
  
    const pontoAnterior =
      pontos[indice - 1];
  
    const pontoSeguinte =
      pontos[indice + 1];
  
    if (
      !pontoAnterior ||
      !pontoSeguinte ||
      !Number.isFinite(
        pontoAnterior.pTitulante
      ) ||
      !Number.isFinite(
        pontoSeguinte.pTitulante
      )
    ) {
      return NaN;
    }
  
    return (
      pontoSeguinte.pTitulante -
      pontoAnterior.pTitulante
    ) /
      (
        2 *
        passo
      );
  }
  
  /**
 * Calcula a segunda derivada numérica por
 * diferença central em uma malha uniforme:
 *
 * f''(xᵢ) ≈
 * [f(xᵢ₊₁) - 2f(xᵢ) + f(xᵢ₋₁)] / h²
 */

  function calcularSegundaDerivadaNoIndice({
    pontos,
    indice,
    passo,
  }: {
    pontos: PontoCurvaValido[];
    indice: number;
    passo: number;
  }) {
    if (
      indice <= 0 ||
      indice >=
        pontos.length - 1 ||
      !Number.isFinite(passo) ||
      passo <= 0
    ) {
      return NaN;
    }
  
    const pontoAnterior =
      pontos[indice - 1];
  
    const pontoAtual =
      pontos[indice];
  
    const pontoSeguinte =
      pontos[indice + 1];
  
    if (
      !pontoAnterior ||
      !pontoAtual ||
      !pontoSeguinte ||
      !Number.isFinite(
        pontoAnterior.pTitulante
      ) ||
      !Number.isFinite(
        pontoAtual.pTitulante
      ) ||
      !Number.isFinite(
        pontoSeguinte.pTitulante
      )
    ) {
      return NaN;
    }
  
    return (
      pontoSeguinte.pTitulante -
      2 *
        pontoAtual.pTitulante +
      pontoAnterior.pTitulante
    ) /
      (
        passo *
        passo
      );
  }
  
  function localizarCruzamentoZero({
    volumeA,
    valorA,
    volumeB,
    valorB,
  }: {
    volumeA: number;
    valorA: number;
    volumeB: number;
    valorB: number;
  }) {
    const diferenca =
      valorB -
      valorA;
  
    if (
      !Number.isFinite(
        diferenca
      ) ||
      diferenca === 0
    ) {
      return (
        volumeA +
        volumeB
      ) / 2;
    }
  
    const fracao =
      -valorA /
      diferenca;
  
    return (
      volumeA +
      fracao *
        (
          volumeB -
          volumeA
        )
    );
  }
  
  function detectarEventos({
    primeiraDerivada,
    passo,
  }: {
    primeiraDerivada:
      PontoPrimeiraDerivadaSeletividade[];
    passo: number;
  }) {
    const eventos:
      EventoDerivadaSeletividade[] =
      [];
  
    if (
      primeiraDerivada.length <
        3 ||
      !Number.isFinite(
        passo
      ) ||
      passo <= 0
    ) {
      return eventos;
    }
  
    const intensidades =
      primeiraDerivada
        .map(
          (ponto) =>
            ponto
              .moduloPrimeiraDerivada
        )
        .filter(
          (valor) =>
            Number.isFinite(valor)
        );
  
    const maiorIntensidade =
      intensidades.length > 0
        ? Math.max(
            ...intensidades
          )
        : NaN;
  
    if (
      !Number.isFinite(
        maiorIntensidade
      ) ||
      maiorIntensidade <= 0
    ) {
      return eventos;
    }
  
    /*
     * Evita classificar pequenas oscilações
     * numéricas como eventos químicos relevantes.
     */
    const intensidadeMinima =
      maiorIntensidade *
      0.08;
  
    /*
     * Extremos muito próximos das bordas não são
     * confiáveis, pois não possuem vizinhança
     * suficiente dos dois lados.
     */
    const primeiroVolume =
      primeiraDerivada[0]
        ?.volumeAdicionado ??
      0;
  
    const ultimoVolume =
      primeiraDerivada[
        primeiraDerivada.length -
          1
      ]?.volumeAdicionado ??
      0;
  
    const margemBorda =
      passo *
      3;
  
    for (
      let indice = 1;
      indice <
      primeiraDerivada.length - 1;
      indice += 1
    ) {
      const anterior =
        primeiraDerivada[
          indice - 1
        ];
  
      const atual =
        primeiraDerivada[
          indice
        ];
  
      const seguinte =
        primeiraDerivada[
          indice + 1
        ];
  
      if (
        !anterior ||
        !atual ||
        !seguinte
      ) {
        continue;
      }
  
      if (
        atual.volumeAdicionado <=
          primeiroVolume +
            margemBorda ||
        atual.volumeAdicionado >=
          ultimoVolume -
            margemBorda
      ) {
        continue;
      }
  
      const intensidadeAtual =
        atual
          .moduloPrimeiraDerivada;
  
      const maximoLocal =
        intensidadeAtual >=
          anterior
            .moduloPrimeiraDerivada &&
        intensidadeAtual >
          seguinte
            .moduloPrimeiraDerivada;
  
      if (
        maximoLocal &&
        intensidadeAtual >=
          intensidadeMinima
      ) {
        eventos.push({
          volumeAdicionado:
            atual.volumeAdicionado,
          primeiraDerivada:
            atual.primeiraDerivada,
          intensidade:
            intensidadeAtual,
          indice,
        });
      }
    }
  
    /*
     * Mantém somente os eventos mais intensos e,
     * ao final, reorganiza-os pela ordem de volume.
     */
    return eventos
      .sort(
        (eventoA, eventoB) =>
          eventoB.intensidade -
          eventoA.intensidade
      )
      .slice(
        0,
        6
      )
      .sort(
        (eventoA, eventoB) =>
          eventoA.volumeAdicionado -
          eventoB.volumeAdicionado
      );
  }
  
  function gerarMensagem({
    quantidadeEventos,
  }: {
    quantidadeEventos: number;
  }) {
    if (
      quantidadeEventos === 0
    ) {
      return (
        "Não foram identificados extremos suficientemente " +
        "definidos na primeira derivada. A curva pode apresentar " +
        "transições suaves, sobreposição intensa ou resolução " +
        "numérica insuficiente no intervalo calculado."
      );
    }
  
    if (
      quantidadeEventos === 1
    ) {
      return (
        "Foi identificado um único evento predominante na primeira " +
        "derivada. Isso pode representar um ponto de equivalência " +
        "principal ou a sobreposição de mais de um processo de " +
        "precipitação."
      );
    }
  
    return (
      `Foram identificados ${quantidadeEventos} eventos relevantes ` +
      "na primeira derivada. Eventos distintos sugerem mudanças de " +
      "inclinação separáveis, mas não comprovam isoladamente uma " +
      "separação quantitativa."
    );
  }
  
  export function calcularDerivadasCurvaSeletividade({
    pontos,
  }: {
    pontos:
      PontoCurvaSeletividadePrecipitacao[];
  }): ResultadoDerivadasSeletividade {
    const pontosValidos =
      pontos
        .filter(
          (ponto) =>
            Number.isFinite(
              ponto.volumeAdicionado
            ) &&
            Number.isFinite(
              ponto.pTitulante
            )
        )
        .map(
          (ponto) => ({
            volumeAdicionado:
              ponto.volumeAdicionado,
            pTitulante:
              ponto.pTitulante,
          })
        )
        .sort(
          (pontoA, pontoB) =>
            pontoA.volumeAdicionado -
            pontoB.volumeAdicionado
        );

        const passo =
  pontosValidos.length >= 2
    ? pontosValidos[1]
        .volumeAdicionado -
      pontosValidos[0]
        .volumeAdicionado
    : NaN;

const toleranciaPasso =
  Number.isFinite(passo)
    ? Math.max(
        Math.abs(passo) *
          1e-8,
        1e-10
      )
    : NaN;

const malhaUniforme =
  Number.isFinite(passo) &&
  passo > 0 &&
  pontosValidos.every(
    (
      ponto,
      indice
    ) => {
      if (indice === 0) {
        return true;
      }

      const pontoAnterior =
        pontosValidos[
          indice - 1
        ];

      if (!pontoAnterior) {
        return false;
      }

      const passoLocal =
        ponto.volumeAdicionado -
        pontoAnterior.volumeAdicionado;

      return (
        Number.isFinite(
          passoLocal
        ) &&
        Math.abs(
          passoLocal -
            passo
        ) <=
          toleranciaPasso
      );
    }
  );

if (!malhaUniforme) {
  return {
    primeiraDerivada: [],
    segundaDerivada: [],
    eventos: [],
    cruzamentosZero: [],
    mensagem:
      "Não foi possível calcular as derivadas porque os pontos da curva não apresentam espaçamento uniforme.",
  };
}
  
    const primeiraDerivada =
      pontosValidos
        .map(
          (
            ponto,
            indice
          ) => {
            const valor =
  calcularPrimeiraDerivadaNoIndice({
    pontos:
      pontosValidos,
    indice,
    passo,
  });
  
            return {
              volumeAdicionado:
                ponto.volumeAdicionado,
              primeiraDerivada:
                valor,
              moduloPrimeiraDerivada:
                Math.abs(valor),
            };
          }
        )
        .filter(
          (ponto) =>
            Number.isFinite(
              ponto.primeiraDerivada
            )
        );
  
    const segundaDerivada =
      pontosValidos
        .map(
          (
            ponto,
            indice
          ) => ({
            volumeAdicionado:
              ponto.volumeAdicionado,
              segundaDerivada:
              calcularSegundaDerivadaNoIndice({
                pontos:
                  pontosValidos,
                indice,
                passo,
              }),
          })
        )
        .filter(
          (ponto) =>
            Number.isFinite(
              ponto.segundaDerivada
            )
        );
  
        const cruzamentosZero:
        number[] = [];
      
      const maiorModuloSegundaDerivada =
        segundaDerivada.reduce(
          (
            maior,
            ponto
          ) =>
            Math.max(
              maior,
              Math.abs(
                ponto.segundaDerivada
              )
            ),
          0
        );
      
      const toleranciaZero =
        maiorModuloSegundaDerivada *
        1e-4;
      
      /*
       * Os limites da curva são calculados uma única vez,
       * em vez de serem refeitos em cada iteração.
       */
      const margemBorda =
        passo *
        3;
      
      const volumeMinimo =
        pontosValidos[0]
          ?.volumeAdicionado ??
        0;
      
      const volumeMaximo =
        pontosValidos[
          pontosValidos.length - 1
        ]?.volumeAdicionado ??
        0;
      
      for (
        let indice = 1;
        indice <
        segundaDerivada.length;
        indice += 1
      ) {
        const anterior =
          segundaDerivada[
            indice - 1
          ];
      
        const atual =
          segundaDerivada[
            indice
          ];
      
        if (
          !anterior ||
          !atual
        ) {
          continue;
        }
      
        /*
         * Ignora pares nos quais ambos os valores são
         * numericamente insignificantes. Isso evita
         * mudanças de sinal provocadas por ruído.
         */
        if (
          Math.abs(
            anterior.segundaDerivada
          ) <= toleranciaZero &&
          Math.abs(
            atual.segundaDerivada
          ) <= toleranciaZero
        ) {
          continue;
        }
      
        /*
         * Cruzamentos próximos das extremidades não
         * são utilizados como eventos confiáveis.
         */
        if (
          anterior.volumeAdicionado <=
            volumeMinimo +
              margemBorda ||
          atual.volumeAdicionado >=
            volumeMaximo -
              margemBorda
        ) {
          continue;
        }
      
        if (
          anterior.segundaDerivada ===
          0
        ) {
          cruzamentosZero.push(
            anterior.volumeAdicionado
          );
      
          continue;
        }
      
        const houveMudancaDeSinal =
          (
            anterior.segundaDerivada <
              0 &&
            atual.segundaDerivada >
              0
          ) ||
          (
            anterior.segundaDerivada >
              0 &&
            atual.segundaDerivada <
              0
          );
      
        if (
          houveMudancaDeSinal
        ) {
          cruzamentosZero.push(
            localizarCruzamentoZero({
              volumeA:
                anterior
                  .volumeAdicionado,
              valorA:
                anterior
                  .segundaDerivada,
              volumeB:
                atual
                  .volumeAdicionado,
              valorB:
                atual
                  .segundaDerivada,
            })
          );
        }
      }
  
      const eventos =
      detectarEventos({
        primeiraDerivada,
        passo,
      });
    
    /*
     * Ordena os cruzamentos encontrados e une aqueles
     * que representam praticamente o mesmo evento.
     */
    const cruzamentosZeroOrdenados =
      [...cruzamentosZero].sort(
        (
          volumeA,
          volumeB
        ) =>
          volumeA -
          volumeB
      );
    
    const distanciaMinimaCruzamentos =
      passo *
      3;
    
    const cruzamentosZeroAgrupados =
      cruzamentosZeroOrdenados.reduce<
        number[]
      >(
        (
          acumulador,
          volume
        ) => {
          const indiceUltimo =
            acumulador.length -
            1;
    
          const ultimoVolume =
            acumulador[
              indiceUltimo
            ];
    
          if (
            ultimoVolume ===
              undefined ||
            Math.abs(
              volume -
                ultimoVolume
            ) >=
              distanciaMinimaCruzamentos
          ) {
            acumulador.push(
              volume
            );
    
            return acumulador;
          }
    
          /*
           * Quando dois cruzamentos estão dentro da
           * distância mínima, representa-os pela média.
           */
          acumulador[
            indiceUltimo
          ] =
            (
              ultimoVolume +
              volume
            ) / 2;
    
          return acumulador;
        },
        []
      );
    
    return {
      primeiraDerivada,
      segundaDerivada,
      eventos,
      cruzamentosZero:
        cruzamentosZeroAgrupados,
      mensagem:
        gerarMensagem({
          quantidadeEventos:
            eventos.length,
        }),
    };
  }