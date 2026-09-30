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
 * PF — PONTO DE INFLEXÃO REFINADO
 * ======================================================= */

/**
 * A 1ª e a 2ª derivadas não representam
 * dois pontos finais diferentes.
 *
 * Ambas localizam o MESMO ponto de inflexão:
 *
 * máximo de dE/dV
 *
 * e
 *
 * d²E/dV² = 0
 *
 *
 * Como os dados são discretos, refinamos
 * localmente o máximo da primeira derivada
 * utilizando uma parábola construída com:
 *
 * ponto anterior
 * ponto de máximo discreto
 * ponto posterior
 *
 *
 * Para:
 *
 * y = a u² + b u + c
 *
 * o máximo ocorre em:
 *
 * uPF = -b / 2a
 *
 *
 * A derivada dessa parábola é:
 *
 * dy/du = 2au + b
 *
 * portanto seu zero ocorre exatamente
 * no mesmo volume.
 */

type PontoInflexaoRefinado = {
  volumeMl: number;

  valorMaximoPrimeiraDerivada:
    number;
};


function encontrarIndiceMaximoPrimeiraDerivada(
  pontos:
    PontoPrimeiraDerivadaRedox[]
) {
  if (
    pontos.length ===
    0
  ) {
    throw new Error(
      "Não existem pontos válidos para localizar o máximo da primeira derivada."
    );
  }


  let indiceMaximo =
    0;


  for (
    let indice = 1;
    indice <
    pontos.length;
    indice += 1
  ) {
    if (
      pontos[
        indice
      ].primeiraDerivada >
      pontos[
        indiceMaximo
      ].primeiraDerivada
    ) {
      indiceMaximo =
        indice;
    }
  }


  return indiceMaximo;
}


function refinarPontoInflexao(
  pontos:
    PontoPrimeiraDerivadaRedox[]
): PontoInflexaoRefinado {
  const indiceMaximo =
    encontrarIndiceMaximoPrimeiraDerivada(
      pontos
    );


  const pontoMaximo =
    pontos[
      indiceMaximo
    ];


  /*
   * Se o máximo estiver em uma extremidade,
   * não há três pontos disponíveis para
   * interpolação parabólica.
   */
  if (
    indiceMaximo ===
      0 ||
    indiceMaximo ===
      pontos.length -
        1
  ) {
    return {
      volumeMl:
        pontoMaximo
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        pontoMaximo
          .primeiraDerivada,
    };
  }


  const anterior =
    pontos[
      indiceMaximo -
      1
    ];


  const central =
    pontoMaximo;


  const posterior =
    pontos[
      indiceMaximo +
      1
    ];


  /*
   * Trabalhamos com coordenada local:
   *
   * u = V - Vcentral
   *
   * Isso melhora a estabilidade numérica,
   * evitando operar diretamente com V²
   * para volumes como 25 ou 50 mL.
   */

  const u1 =
    anterior.volumeMl -
    central.volumeMl;


  const u3 =
    posterior.volumeMl -
    central.volumeMl;


  const deltaY1 =
    anterior.primeiraDerivada -
    central.primeiraDerivada;


  const deltaY3 =
    posterior.primeiraDerivada -
    central.primeiraDerivada;


  const denominador =
    (
      u1 *
      u1 *
      u3
    ) -
    (
      u3 *
      u3 *
      u1
    );


  if (
    !Number.isFinite(
      denominador
    ) ||
    Math.abs(
      denominador
    ) <
      1e-18
  ) {
    return {
      volumeMl:
        central
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        central
          .primeiraDerivada,
    };
  }


  /*
   * y =
   * a u² +
   * b u +
   * c
   *
   * Como u = 0 no ponto central:
   *
   * c = ycentral
   */

  const a =
    (
      deltaY1 *
      u3 -
      deltaY3 *
      u1
    ) /
    denominador;


  const b =
    (
      (
        u1 *
        u1 *
        deltaY3
      ) -
      (
        u3 *
        u3 *
        deltaY1
      )
    ) /
    denominador;


  /*
   * Para existir um máximo local,
   * a parábola deve ser côncava
   * para baixo.
   */

  if (
    !Number.isFinite(
      a
    ) ||
    !Number.isFinite(
      b
    ) ||
    a >=
      0 ||
    Math.abs(
      a
    ) <
      1e-18
  ) {
    return {
      volumeMl:
        central
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        central
          .primeiraDerivada,
    };
  }


  const deslocamentoPF =
    -b /
    (
      2 *
      a
    );


  const volumePF =
    central.volumeMl +
    deslocamentoPF;


  /*
   * O vértice precisa permanecer
   * dentro do intervalo formado
   * pelos três pontos utilizados.
   */

  if (
    !Number.isFinite(
      volumePF
    ) ||
    volumePF <
      anterior.volumeMl ||
    volumePF >
      posterior.volumeMl
  ) {
    return {
      volumeMl:
        central
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        central
          .primeiraDerivada,
    };
  }


  const valorMaximo =
    (
      a *
      deslocamentoPF *
      deslocamentoPF
    ) +
    (
      b *
      deslocamentoPF
    ) +
    central
      .primeiraDerivada;


  if (
    !Number.isFinite(
      valorMaximo
    )
  ) {
    return {
      volumeMl:
        central
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        central
          .primeiraDerivada,
    };
  }


  return {
    volumeMl:
      volumePF,

    valorMaximoPrimeiraDerivada:
      valorMaximo,
  };
}


/* =========================================================
 * INSERÇÃO DOS PONTOS REFINADOS NOS GRÁFICOS
 * ======================================================= */

function inserirPontoRefinadoPrimeiraDerivada({
  pontos,
  volumeMl,
  valor,
}: {
  pontos:
    PontoPrimeiraDerivadaRedox[];

  volumeMl:
    number;

  valor:
    number;
}) {
  const tolerancia =
    1e-9;


  const semPontoDuplicado =
    pontos.filter(
      (ponto) =>
        Math.abs(
          ponto.volumeMl -
          volumeMl
        ) >
        tolerancia
    );


  return [
    ...semPontoDuplicado,

    {
      volumeMl,

      primeiraDerivada:
        valor,
    },
  ].sort(
    (a, b) =>
      a.volumeMl -
      b.volumeMl
  );
}


function inserirZeroRefinadoSegundaDerivada({
  pontos,
  volumeMl,
}: {
  pontos:
    PontoSegundaDerivadaRedox[];

  volumeMl:
    number;
}) {
  const tolerancia =
    1e-9;


  const semPontoDuplicado =
    pontos.filter(
      (ponto) =>
        Math.abs(
          ponto.volumeMl -
          volumeMl
        ) >
        tolerancia
    );


  return [
    ...semPontoDuplicado,

    {
      volumeMl,

      segundaDerivada:
        0,
    },
  ].sort(
    (a, b) =>
      a.volumeMl -
      b.volumeMl
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


  /*
   * Primeiro calculamos as derivadas
   * discretas originais.
   */

  const primeiraDerivadaBase =
    calcularPrimeiraDerivada(
      pontos
    );


  if (
    primeiraDerivadaBase.length <
    3
  ) {
    throw new Error(
      "Não existem pontos suficientes para refinar o ponto de inflexão."
    );
  }


  const segundaDerivadaBase =
    calcularSegundaDerivada(
      primeiraDerivadaBase
    );


  if (
    segundaDerivadaBase.length ===
    0
  ) {
    throw new Error(
      "Não existem pontos suficientes para calcular a segunda derivada."
    );
  }


  /*
   * O PF é determinado UMA ÚNICA VEZ.
   *
   * A parábola local ajustada à primeira
   * derivada fornece simultaneamente:
   *
   * máximo da primeira derivada
   *
   * e
   *
   * zero da segunda derivada.
   */

  const pontoInflexao =
    refinarPontoInflexao(
      primeiraDerivadaBase
    );


  /*
   * Inserimos o ponto matematicamente
   * refinado nas séries exibidas.
   *
   * Assim o gráfico da 1ª derivada
   * mostra o máximo refinado e o gráfico
   * da 2ª derivada cruza zero exatamente
   * no mesmo volume.
   */

  const primeiraDerivada =
    inserirPontoRefinadoPrimeiraDerivada({
      pontos:
        primeiraDerivadaBase,

      volumeMl:
        pontoInflexao
          .volumeMl,

      valor:
        pontoInflexao
          .valorMaximoPrimeiraDerivada,
    });


  const segundaDerivada =
    inserirZeroRefinadoSegundaDerivada({
      pontos:
        segundaDerivadaBase,

      volumeMl:
        pontoInflexao
          .volumeMl,
    });


  return {
    primeiraDerivada,

    segundaDerivada,

    /*
     * Ambos representam o MESMO PF.
     */

    volumePFPrimeiraDerivadaMl:
      pontoInflexao
        .volumeMl,

    valorMaximoPrimeiraDerivada:
      pontoInflexao
        .valorMaximoPrimeiraDerivada,

    volumePFSegundaDerivadaMl:
      pontoInflexao
        .volumeMl,
  };
}