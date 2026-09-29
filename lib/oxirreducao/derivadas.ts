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
  /*
   * Volume médio do intervalo
   * utilizado em ΔE/ΔV.
   */
  volumeMl: number;

  primeiraDerivada: number;
};


export type PontoSegundaDerivadaRedox = {
  /*
   * Volume médio entre dois pontos
   * consecutivos da 1ª derivada.
   */
  volumeMl: number;

  segundaDerivada: number;
};


export type ResultadoDerivadasRedox = {
  primeiraDerivada:
    PontoPrimeiraDerivadaRedox[];

  segundaDerivada:
    PontoSegundaDerivadaRedox[];

  /*
   * PF teórico determinado pelo
   * máximo da primeira derivada.
   */
  volumePFPrimeiraDerivadaMl:
    number;

  valorMaximoPrimeiraDerivada:
    number;

  /*
   * PF teórico determinado pelo
   * zero da segunda derivada.
   */
  volumePFSegundaDerivadaMl:
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
 * PRIMEIRA DERIVADA
 * ======================================================= */

/*
 * ΔE / ΔV =
 *
 * E(i+1) - E(i)
 * ----------------
 * V(i+1) - V(i)
 *
 *
 * A derivada é atribuída ao
 * VOLUME MÉDIO:
 *
 * Vm =
 *
 * V(i+1) + V(i)
 * ----------------
 *        2
 */

function calcularPrimeiraDerivada(
  pontos:
    PontoCurvaPreparado[]
): PontoPrimeiraDerivadaRedox[] {
  const resultado:
    PontoPrimeiraDerivadaRedox[] =
    [];


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


    const deltaVolume =
      proximo.volumeMl -
      atual.volumeMl;


    if (
      !Number.isFinite(
        deltaVolume
      ) ||
      deltaVolume <=
        0
    ) {
      continue;
    }


    const deltaPotencial =
      proximo.potencialV -
      atual.potencialV;


    const primeiraDerivada =
      deltaPotencial /
      deltaVolume;


    const volumeMedio =
      (
        atual.volumeMl +
        proximo.volumeMl
      ) /
      2;


    if (
      !Number.isFinite(
        primeiraDerivada
      ) ||
      !Number.isFinite(
        volumeMedio
      )
    ) {
      continue;
    }


    resultado.push({
      volumeMl:
        volumeMedio,

      primeiraDerivada,
    });
  }


  return resultado;
}


/* =========================================================
 * SEGUNDA DERIVADA
 * ======================================================= */

function calcularSegundaDerivada(
  primeiraDerivada:
    PontoPrimeiraDerivadaRedox[]
): PontoSegundaDerivadaRedox[] {
  const resultado:
    PontoSegundaDerivadaRedox[] =
    [];


  for (
    let indice = 0;
    indice <
    primeiraDerivada.length - 1;
    indice += 1
  ) {
    const atual =
      primeiraDerivada[
        indice
      ];


    const proximo =
      primeiraDerivada[
        indice + 1
      ];


    const deltaVolume =
      proximo.volumeMl -
      atual.volumeMl;


    if (
      !Number.isFinite(
        deltaVolume
      ) ||
      deltaVolume <=
        0
    ) {
      continue;
    }


    const deltaPrimeiraDerivada =
      proximo
        .primeiraDerivada -
      atual
        .primeiraDerivada;


    const segundaDerivada =
      deltaPrimeiraDerivada /
      deltaVolume;


    const volumeMedio =
      (
        atual.volumeMl +
        proximo.volumeMl
      ) /
      2;


    if (
      !Number.isFinite(
        segundaDerivada
      ) ||
      !Number.isFinite(
        volumeMedio
      )
    ) {
      continue;
    }


    resultado.push({
      volumeMl:
        volumeMedio,

      segundaDerivada,
    });
  }


  return resultado;
}


/* =========================================================
 * PF — PRIMEIRA DERIVADA
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
 * PF — SEGUNDA DERIVADA
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


    if (
      atual.segundaDerivada ===
      0
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
     * Interpolação linear para
     * localizar d²E/dV² = 0.
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
   * Pode haver outros cruzamentos.
   * Escolhemos aquele mais próximo
   * do máximo da 1ª derivada.
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


  const primeiraDerivada =
    calcularPrimeiraDerivada(
      pontos
    );


  if (
    primeiraDerivada.length <
    2
  ) {
    throw new Error(
      "Não existem pontos suficientes para calcular a primeira derivada."
    );
  }


  const segundaDerivada =
    calcularSegundaDerivada(
      primeiraDerivada
    );


  if (
    segundaDerivada.length ===
    0
  ) {
    throw new Error(
      "Não existem pontos suficientes para calcular a segunda derivada."
    );
  }


  const pontoMaximo =
    encontrarMaximoPrimeiraDerivada(
      primeiraDerivada
    );


  const volumePFSegundaDerivadaMl =
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

    volumePFPrimeiraDerivadaMl:
      pontoMaximo
        .volumeMl,

    valorMaximoPrimeiraDerivada:
      pontoMaximo
        .primeiraDerivada,

    volumePFSegundaDerivadaMl,
  };
}