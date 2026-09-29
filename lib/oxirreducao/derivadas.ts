/* =========================================================
 * TIPOS
 * ======================================================= */

export type PontoBaseDerivadaRedox = {
  volumeAdicionadoMl: number;

  potencialV:
    number | null;
};


type PontoCurvaPreparado = {
  volumeMl: number;

  potencialV: number;
};


export type PontoPrimeiraDerivadaRedox = {
  volumeMl: number;

  primeiraDerivada: number;
};


export type PontoSegundaDerivadaRedox = {
  volumeMl: number;

  segundaDerivada: number;
};


export type ResultadoDerivadasRedox = {
  primeiraDerivada:
    PontoPrimeiraDerivadaRedox[];

  segundaDerivada:
    PontoSegundaDerivadaRedox[];

  volumePEPrimeiraDerivadaMl:
    number;

  valorMaximoPrimeiraDerivada:
    number;

  volumePESegundaDerivadaMl:
    number | null;
};


/* =========================================================
 * PREPARAÇÃO
 * ======================================================= */

function prepararPontos(
  pontos:
    PontoBaseDerivadaRedox[]
): PontoCurvaPreparado[] {
  const mapa =
    new Map<
      number,
      number
    >();


  pontos.forEach(
    (ponto) => {
      if (
        !Number.isFinite(
          ponto.volumeAdicionadoMl
        ) ||
        ponto.potencialV ===
          null ||
        !Number.isFinite(
          ponto.potencialV
        )
      ) {
        return;
      }


      mapa.set(
        ponto.volumeAdicionadoMl,
        ponto.potencialV
      );
    }
  );


  return Array.from(
    mapa.entries()
  )
    .map(
      (
        [
          volumeMl,
          potencialV,
        ]
      ) => ({
        volumeMl,
        potencialV,
      })
    )
    .sort(
      (a, b) =>
        a.volumeMl -
        b.volumeMl
    );
}


/* =========================================================
 * DERIVADAS CENTRADAS
 * ======================================================= */

/**
 * Agora que a curva E × V é contínua,
 * podemos calcular as derivadas
 * diretamente NOS PONTOS ORIGINAIS
 * da curva.
 *
 *
 * Para três pontos:
 *
 * x(i-1), x(i), x(i+1)
 *
 *
 * usamos uma aproximação central
 * válida também para espaçamentos
 * não uniformes.
 *
 *
 * Isso é importante porque a nossa
 * curva possui:
 *
 * - malha normal;
 * - malha densa;
 * - malha ultra-densa perto do PE.
 */
function calcularDerivadasCentradas(
  pontos:
    PontoCurvaPreparado[]
) {
  const primeiraDerivada:
    PontoPrimeiraDerivadaRedox[] =
    [];


  const segundaDerivada:
    PontoSegundaDerivadaRedox[] =
    [];


  for (
    let indice = 1;
    indice <
    pontos.length - 1;
    indice += 1
  ) {
    const anterior =
      pontos[
        indice - 1
      ];


    const atual =
      pontos[
        indice
      ];


    const proximo =
      pontos[
        indice + 1
      ];


    const h1 =
      atual.volumeMl -
      anterior.volumeMl;


    const h2 =
      proximo.volumeMl -
      atual.volumeMl;


    if (
      !Number.isFinite(
        h1
      ) ||
      !Number.isFinite(
        h2
      ) ||
      h1 <=
        0 ||
      h2 <=
        0
    ) {
      continue;
    }


    /*
     * =====================================================
     * PRIMEIRA DERIVADA
     * =====================================================
     *
     * Fórmula central para malha
     * não necessariamente uniforme.
     */

    const coeficienteAnterior =
      -h2 /
      (
        h1 *
        (
          h1 +
          h2
        )
      );


    const coeficienteAtual =
      (
        h2 -
        h1
      ) /
      (
        h1 *
        h2
      );


    const coeficienteProximo =
      h1 /
      (
        h2 *
        (
          h1 +
          h2
        )
      );


    const primeira =
      coeficienteAnterior *
        anterior.potencialV +
      coeficienteAtual *
        atual.potencialV +
      coeficienteProximo *
        proximo.potencialV;


    /*
     * =====================================================
     * SEGUNDA DERIVADA
     * =====================================================
     */

    const segunda =
      2 *
      (
        anterior.potencialV /
          (
            h1 *
            (
              h1 +
              h2
            )
          ) -
        atual.potencialV /
          (
            h1 *
            h2
          ) +
        proximo.potencialV /
          (
            h2 *
            (
              h1 +
              h2
            )
          )
      );


    if (
      Number.isFinite(
        primeira
      )
    ) {
      primeiraDerivada.push({
        volumeMl:
          atual.volumeMl,

        primeiraDerivada:
          primeira,
      });
    }


    if (
      Number.isFinite(
        segunda
      )
    ) {
      segundaDerivada.push({
        volumeMl:
          atual.volumeMl,

        segundaDerivada:
          segunda,
      });
    }
  }


  return {
    primeiraDerivada,
    segundaDerivada,
  };
}


/* =========================================================
 * MÁXIMO DA PRIMEIRA DERIVADA
 * ======================================================= */

function encontrarMaximoPrimeiraDerivada(
  pontos:
    PontoPrimeiraDerivadaRedox[]
) {
  if (
    pontos.length ===
    0
  ) {
    throw new Error(
      "Não existem pontos válidos para a primeira derivada."
    );
  }


  let maximo =
    pontos[0];


  for (
    const ponto of pontos
  ) {
    if (
      ponto.primeiraDerivada >
      maximo.primeiraDerivada
    ) {
      maximo =
        ponto;
    }
  }


  return maximo;
}


/* =========================================================
 * ZERO DA SEGUNDA DERIVADA
 * ======================================================= */

function encontrarZeroSegundaDerivada({
  pontos,
  referenciaMl,
}: {
  pontos:
    PontoSegundaDerivadaRedox[];

  referenciaMl:
    number;
}) {
  const candidatos:
    number[] = [];


  for (
    let indice = 0;
    indice <
    pontos.length - 1;
    indice += 1
  ) {
    const atual =
      pontos[
        indice
      ];


    const proximo =
      pontos[
        indice + 1
      ];


    /*
     * Caso um ponto calculado já seja
     * numericamente zero.
     */

    if (
      Math.abs(
        atual.segundaDerivada
      ) <
      1e-12
    ) {
      candidatos.push(
        atual.volumeMl
      );

      continue;
    }


    const mudouSinal =
      (
        atual.segundaDerivada >
          0 &&
        proximo.segundaDerivada <
          0
      ) ||
      (
        atual.segundaDerivada <
          0 &&
        proximo.segundaDerivada >
          0
      );


    if (
      !mudouSinal
    ) {
      continue;
    }


    const x1 =
      atual.volumeMl;


    const x2 =
      proximo.volumeMl;


    const y1 =
      atual.segundaDerivada;


    const y2 =
      proximo.segundaDerivada;


    const denominador =
      y2 -
      y1;


    if (
      denominador ===
      0
    ) {
      continue;
    }


    /*
     * Interpolação linear do ponto
     * em que:
     *
     * d²E/dV² = 0
     */

    const volumeZero =
      x1 -
      (
        y1 *
        (
          x2 -
          x1
        )
      ) /
      denominador;


    if (
      Number.isFinite(
        volumeZero
      )
    ) {
      candidatos.push(
        volumeZero
      );
    }
  }


  if (
    candidatos.length ===
    0
  ) {
    return null;
  }


  /*
   * Escolhemos o cruzamento mais
   * próximo do máximo de dE/dV.
   */

  return candidatos.reduce(
    (
      melhor,
      atual
    ) => {
      const distanciaMelhor =
        Math.abs(
          melhor -
          referenciaMl
        );


      const distanciaAtual =
        Math.abs(
          atual -
          referenciaMl
        );


      return distanciaAtual <
        distanciaMelhor
        ? atual
        : melhor;
    }
  );
}


/* =========================================================
 * API PRINCIPAL
 * ======================================================= */

export function calcularDerivadasRedox(
  pontosEntrada:
    PontoBaseDerivadaRedox[]
): ResultadoDerivadasRedox {
  const pontos =
    prepararPontos(
      pontosEntrada
    );


  if (
    pontos.length <
    3
  ) {
    throw new Error(
      "São necessários pelo menos três pontos válidos para calcular as derivadas."
    );
  }


  const {
    primeiraDerivada,
    segundaDerivada,
  } =
    calcularDerivadasCentradas(
      pontos
    );


  if (
    primeiraDerivada.length ===
    0
  ) {
    throw new Error(
      "Não foi possível calcular a primeira derivada."
    );
  }


  if (
    segundaDerivada.length ===
    0
  ) {
    throw new Error(
      "Não foi possível calcular a segunda derivada."
    );
  }


  const pontoMaximo =
    encontrarMaximoPrimeiraDerivada(
      primeiraDerivada
    );


  const volumePESegundaDerivadaMl =
    encontrarZeroSegundaDerivada({
      pontos:
        segundaDerivada,

      referenciaMl:
        pontoMaximo
          .volumeMl,
    });


  return {
    primeiraDerivada,

    segundaDerivada,

    volumePEPrimeiraDerivadaMl:
      pontoMaximo
        .volumeMl,

    valorMaximoPrimeiraDerivada:
      pontoMaximo
        .primeiraDerivada,

    volumePESegundaDerivadaMl,
  };
}