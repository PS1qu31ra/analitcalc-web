export type PontoCurvaNumerica = {
    volume: number;
    valor: number;
  };
  
  export type PontoCurvaComDerivadas = {
    volume: number;
    valor: number;
  
    primeiraDerivada: number | null;
    segundaDerivada: number | null;
  };
  
  export type EstimativaPontoEquivalencia = {
    volumePrimeiraDerivada: number | null;
    valorMaximoPrimeiraDerivada: number | null;
  
    volumeSegundaDerivada: number | null;
    valorSegundaDerivada: number | null;
  
    volumeEstimado: number | null;
    metodo:
      | "primeiraDerivada"
      | "segundaDerivada"
      | "mediaDerivadas"
      | "indeterminado";
  };
  
  export type ResultadoDerivadas = {
    pontos: PontoCurvaComDerivadas[];
    pontoEquivalencia: EstimativaPontoEquivalencia;
  };
  
  const EPSILON = 1e-15;
  
  /**
   * Verifica se um valor é numérico e finito.
   */
  function numeroValido(
    valor: number
  ): boolean {
    return Number.isFinite(valor);
  }
  
  /**
   * Ordena os pontos pelo volume e remove pontos inválidos.
   *
   * Quando houver volumes repetidos, mantém o último ponto informado.
   */
  function prepararPontos(
    pontos: PontoCurvaNumerica[]
  ): PontoCurvaNumerica[] {
    const pontosValidos =
      pontos.filter(
        (ponto) =>
          numeroValido(ponto.volume) &&
          numeroValido(ponto.valor)
      );
  
    const pontosPorVolume =
      new Map<number, PontoCurvaNumerica>();
  
    for (const ponto of pontosValidos) {
      pontosPorVolume.set(
        ponto.volume,
        ponto
      );
    }
  
    return Array.from(
      pontosPorVolume.values()
    ).sort(
      (pontoA, pontoB) =>
        pontoA.volume -
        pontoB.volume
    );
  }
  
  /**
   * Calcula a primeira derivada por diferença progressiva.
   *
   * É utilizada no primeiro ponto da curva.
   */
  function primeiraDerivadaProgressiva(
    pontoAtual: PontoCurvaNumerica,
    pontoSeguinte: PontoCurvaNumerica
  ): number | null {
    const deltaVolume =
      pontoSeguinte.volume -
      pontoAtual.volume;
  
    if (
      Math.abs(deltaVolume) <=
      EPSILON
    ) {
      return null;
    }
  
    return (
      (pontoSeguinte.valor -
        pontoAtual.valor) /
      deltaVolume
    );
  }
  
  /**
   * Calcula a primeira derivada por diferença regressiva.
   *
   * É utilizada no último ponto da curva.
   */
  function primeiraDerivadaRegressiva(
    pontoAnterior: PontoCurvaNumerica,
    pontoAtual: PontoCurvaNumerica
  ): number | null {
    const deltaVolume =
      pontoAtual.volume -
      pontoAnterior.volume;
  
    if (
      Math.abs(deltaVolume) <=
      EPSILON
    ) {
      return null;
    }
  
    return (
      (pontoAtual.valor -
        pontoAnterior.valor) /
      deltaVolume
    );
  }
  
  /**
   * Calcula a primeira derivada por diferença central.
   *
   * Funciona inclusive quando o espaçamento entre os volumes
   * não é perfeitamente uniforme.
   */
  function primeiraDerivadaCentral(
    pontoAnterior: PontoCurvaNumerica,
    pontoAtual: PontoCurvaNumerica,
    pontoSeguinte: PontoCurvaNumerica
  ): number | null {
    const hAnterior =
      pontoAtual.volume -
      pontoAnterior.volume;
  
    const hSeguinte =
      pontoSeguinte.volume -
      pontoAtual.volume;
  
    if (
      Math.abs(hAnterior) <=
        EPSILON ||
      Math.abs(hSeguinte) <=
        EPSILON
    ) {
      return null;
    }
  
    const termoAnterior =
      (-hSeguinte /
        (
          hAnterior *
          (hAnterior +
            hSeguinte)
        )) *
      pontoAnterior.valor;
  
    const termoAtual =
      (
        (hSeguinte -
          hAnterior) /
        (
          hAnterior *
          hSeguinte
        )
      ) *
      pontoAtual.valor;
  
    const termoSeguinte =
      (hAnterior /
        (
          hSeguinte *
          (hAnterior +
            hSeguinte)
        )) *
      pontoSeguinte.valor;
  
    return (
      termoAnterior +
      termoAtual +
      termoSeguinte
    );
  }
  
  /**
   * Calcula a segunda derivada por diferenças finitas.
   *
   * A expressão aceita intervalos de volume não uniformes.
   */
  function segundaDerivadaCentral(
    pontoAnterior: PontoCurvaNumerica,
    pontoAtual: PontoCurvaNumerica,
    pontoSeguinte: PontoCurvaNumerica
  ): number | null {
    const hAnterior =
      pontoAtual.volume -
      pontoAnterior.volume;
  
    const hSeguinte =
      pontoSeguinte.volume -
      pontoAtual.volume;
  
    if (
      Math.abs(hAnterior) <=
        EPSILON ||
      Math.abs(hSeguinte) <=
        EPSILON
    ) {
      return null;
    }
  
    const inclinacaoAnterior =
      (
        pontoAtual.valor -
        pontoAnterior.valor
      ) /
      hAnterior;
  
    const inclinacaoSeguinte =
      (
        pontoSeguinte.valor -
        pontoAtual.valor
      ) /
      hSeguinte;
  
    return (
      (2 *
        (
          inclinacaoSeguinte -
          inclinacaoAnterior
        )) /
      (
        hAnterior +
        hSeguinte
      )
    );
  }
  
  /**
   * Calcula a primeira derivada em todos os pontos da curva.
   */
  function calcularPrimeirasDerivadas(
    pontos: PontoCurvaNumerica[]
  ): Array<number | null> {
    if (pontos.length < 2) {
      return pontos.map(() => null);
    }
  
    return pontos.map(
      (ponto, indice) => {
        if (indice === 0) {
          return primeiraDerivadaProgressiva(
            ponto,
            pontos[indice + 1]
          );
        }
  
        if (
          indice ===
          pontos.length - 1
        ) {
          return primeiraDerivadaRegressiva(
            pontos[indice - 1],
            ponto
          );
        }
  
        return primeiraDerivadaCentral(
          pontos[indice - 1],
          ponto,
          pontos[indice + 1]
        );
      }
    );
  }
  
  /**
   * Calcula a segunda derivada nos pontos internos.
   *
   * Os extremos recebem null porque a diferença central exige
   * um ponto anterior e um ponto posterior.
   */
  function calcularSegundasDerivadas(
    pontos: PontoCurvaNumerica[]
  ): Array<number | null> {
    if (pontos.length < 3) {
      return pontos.map(() => null);
    }
  
    return pontos.map(
      (ponto, indice) => {
        if (
          indice === 0 ||
          indice ===
            pontos.length - 1
        ) {
          return null;
        }
  
        return segundaDerivadaCentral(
          pontos[indice - 1],
          ponto,
          pontos[indice + 1]
        );
      }
    );
  }
  
  /**
   * Localiza o maior valor absoluto da primeira derivada.
   *
   * Em curvas de titulação, o ponto de equivalência normalmente
   * está associado à região de maior inclinação.
   */
  function estimarPorPrimeiraDerivada(
    pontos: PontoCurvaComDerivadas[]
  ): {
    volume: number | null;
    valor: number | null;
  } {
    let melhorPonto:
      | PontoCurvaComDerivadas
      | null = null;
  
    for (const ponto of pontos) {
      if (
        ponto.primeiraDerivada ===
        null
      ) {
        continue;
      }
  
      if (
        melhorPonto === null ||
        Math.abs(
          ponto.primeiraDerivada
        ) >
          Math.abs(
            melhorPonto
              .primeiraDerivada ??
              0
          )
      ) {
        melhorPonto = ponto;
      }
    }
  
    return {
      volume:
        melhorPonto?.volume ??
        null,
  
      valor:
        melhorPonto
          ?.primeiraDerivada ??
        null,
    };
  }
  
  /**
   * Faz interpolação linear para encontrar aproximadamente
   * o volume no qual a segunda derivada cruza zero.
   */
  function interpolarCruzamentoZero(
    volumeA: number,
    valorA: number,
    volumeB: number,
    valorB: number
  ): number | null {
    const denominador =
      valorB - valorA;
  
    if (
      Math.abs(denominador) <=
      EPSILON
    ) {
      return (
        volumeA + volumeB
      ) / 2;
    }
  
    const volume =
      volumeA -
      valorA *
        (
          (volumeB -
            volumeA) /
          denominador
        );
  
    return Number.isFinite(volume)
      ? volume
      : null;
  }
  
  /**
   * Localiza as mudanças de sinal da segunda derivada.
   *
   * Quando houver mais de uma mudança de sinal, escolhe aquela
   * mais próxima do máximo absoluto da primeira derivada.
   */
  function estimarPorSegundaDerivada(
    pontos: PontoCurvaComDerivadas[],
    volumeReferencia:
      number | null
  ): {
    volume: number | null;
    valor: number | null;
  } {
    const candidatos: Array<{
      volume: number;
      valor: number;
    }> = [];
  
    for (
      let indice = 1;
      indice < pontos.length;
      indice += 1
    ) {
      const pontoAnterior =
        pontos[indice - 1];
  
      const pontoAtual =
        pontos[indice];
  
      const derivadaAnterior =
        pontoAnterior
          .segundaDerivada;
  
      const derivadaAtual =
        pontoAtual
          .segundaDerivada;
  
      if (
        derivadaAnterior ===
          null ||
        derivadaAtual === null
      ) {
        continue;
      }
  
      if (
        Math.abs(
          derivadaAnterior
        ) <= EPSILON
      ) {
        candidatos.push({
          volume:
            pontoAnterior.volume,
          valor:
            derivadaAnterior,
        });
  
        continue;
      }
  
      if (
        Math.abs(
          derivadaAtual
        ) <= EPSILON
      ) {
        candidatos.push({
          volume:
            pontoAtual.volume,
          valor: derivadaAtual,
        });
  
        continue;
      }
  
      const mudouDeSinal =
        derivadaAnterior *
          derivadaAtual <
        0;
  
      if (!mudouDeSinal) {
        continue;
      }
  
      const volumeInterpolado =
        interpolarCruzamentoZero(
          pontoAnterior.volume,
          derivadaAnterior,
          pontoAtual.volume,
          derivadaAtual
        );
  
      if (
        volumeInterpolado === null
      ) {
        continue;
      }
  
      candidatos.push({
        volume:
          volumeInterpolado,
        valor: 0,
      });
    }
  
    if (
      candidatos.length === 0
    ) {
      return {
        volume: null,
        valor: null,
      };
    }
  
    if (
      volumeReferencia === null
    ) {
      return candidatos[0];
    }
  
    const candidatoMaisProximo =
      candidatos.reduce(
        (
          melhorCandidato,
          candidatoAtual
        ) => {
          const distanciaMelhor =
            Math.abs(
              melhorCandidato.volume -
                volumeReferencia
            );
  
          const distanciaAtual =
            Math.abs(
              candidatoAtual.volume -
                volumeReferencia
            );
  
          return distanciaAtual <
            distanciaMelhor
            ? candidatoAtual
            : melhorCandidato;
        }
      );
  
    return candidatoMaisProximo;
  }
  
  /**
   * Combina as estimativas obtidas pelas duas derivadas.
   */
  function combinarEstimativas(
    primeiraDerivada: {
      volume: number | null;
      valor: number | null;
    },
    segundaDerivada: {
      volume: number | null;
      valor: number | null;
    }
  ): EstimativaPontoEquivalencia {
    const volumePrimeira =
      primeiraDerivada.volume;
  
    const volumeSegunda =
      segundaDerivada.volume;
  
    if (
      volumePrimeira !== null &&
      volumeSegunda !== null
    ) {
      return {
        volumePrimeiraDerivada:
          volumePrimeira,
  
        valorMaximoPrimeiraDerivada:
          primeiraDerivada.valor,
  
        volumeSegundaDerivada:
          volumeSegunda,
  
        valorSegundaDerivada:
          segundaDerivada.valor,
  
        volumeEstimado:
          (
            volumePrimeira +
            volumeSegunda
          ) / 2,
  
        metodo:
          "mediaDerivadas",
      };
    }
  
    if (volumeSegunda !== null) {
      return {
        volumePrimeiraDerivada:
          volumePrimeira,
  
        valorMaximoPrimeiraDerivada:
          primeiraDerivada.valor,
  
        volumeSegundaDerivada:
          volumeSegunda,
  
        valorSegundaDerivada:
          segundaDerivada.valor,
  
        volumeEstimado:
          volumeSegunda,
  
        metodo:
          "segundaDerivada",
      };
    }
  
    if (volumePrimeira !== null) {
      return {
        volumePrimeiraDerivada:
          volumePrimeira,
  
        valorMaximoPrimeiraDerivada:
          primeiraDerivada.valor,
  
        volumeSegundaDerivada:
          volumeSegunda,
  
        valorSegundaDerivada:
          segundaDerivada.valor,
  
        volumeEstimado:
          volumePrimeira,
  
        metodo:
          "primeiraDerivada",
      };
    }
  
    return {
      volumePrimeiraDerivada:
        null,
  
      valorMaximoPrimeiraDerivada:
        null,
  
      volumeSegundaDerivada:
        null,
  
      valorSegundaDerivada:
        null,
  
      volumeEstimado:
        null,
  
      metodo:
        "indeterminado",
    };
  }
  
  /**
   * Calcula a primeira e a segunda derivadas de uma curva.
   *
   * A função:
   * - remove pontos inválidos;
   * - ordena os pontos por volume;
   * - elimina volumes duplicados;
   * - calcula diferenças finitas;
   * - estima o ponto de equivalência.
   */
  export function calcularDerivadasCurva(
    pontosOriginais: PontoCurvaNumerica[]
  ): ResultadoDerivadas {
    const pontos =
      prepararPontos(
        pontosOriginais
      );
  
    const primeirasDerivadas =
      calcularPrimeirasDerivadas(
        pontos
      );
  
    const segundasDerivadas =
      calcularSegundasDerivadas(
        pontos
      );
  
    const pontosComDerivadas:
      PontoCurvaComDerivadas[] =
      pontos.map(
        (ponto, indice) => ({
          volume: ponto.volume,
          valor: ponto.valor,
  
          primeiraDerivada:
            primeirasDerivadas[
              indice
            ],
  
          segundaDerivada:
            segundasDerivadas[
              indice
            ],
        })
      );
  
    const estimativaPrimeira =
      estimarPorPrimeiraDerivada(
        pontosComDerivadas
      );
  
    const estimativaSegunda =
      estimarPorSegundaDerivada(
        pontosComDerivadas,
        estimativaPrimeira.volume
      );
  
    return {
      pontos:
        pontosComDerivadas,
  
      pontoEquivalencia:
        combinarEstimativas(
          estimativaPrimeira,
          estimativaSegunda
        ),
    };
  }
  
  /**
   * Converte os pontos da curva para o formato utilizado
   * diretamente pelo gráfico da primeira derivada.
   */
  export function obterPontosPrimeiraDerivada(
    resultado: ResultadoDerivadas
  ): Array<{
    volume: number;
    primeiraDerivada: number;
  }> {
    return resultado.pontos.flatMap(
      (ponto) => {
        if (
          ponto.primeiraDerivada ===
          null
        ) {
          return [];
        }
  
        return [
          {
            volume: ponto.volume,
            primeiraDerivada:
              ponto.primeiraDerivada,
          },
        ];
      }
    );
  }
  
  /**
   * Converte os pontos da curva para o formato utilizado
   * diretamente pelo gráfico da segunda derivada.
   */
  export function obterPontosSegundaDerivada(
    resultado: ResultadoDerivadas
  ): Array<{
    volume: number;
    segundaDerivada: number;
  }> {
    return resultado.pontos.flatMap(
      (ponto) => {
        if (
          ponto.segundaDerivada ===
          null
        ) {
          return [];
        }
  
        return [
          {
            volume: ponto.volume,
            segundaDerivada:
              ponto.segundaDerivada,
          },
        ];
      }
    );
  }