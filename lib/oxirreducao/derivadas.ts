/* =========================================================
 * TIPOS
 * ======================================================= */

export type PontoBaseDerivadaRedox = {
  volumeAdicionadoMl: number;

  potencialV:
    number | null;
};


type PontoCurvaPreparado = {
  volumeMl:
    number;

  potencialV:
    number;
};


export type PontoPrimeiraDerivadaRedox = {
  volumeMl:
    number;

  primeiraDerivada:
    number;
};


export type PontoSegundaDerivadaRedox = {
  volumeMl:
    number;

  segundaDerivada:
    number;
};


export type ResultadoDerivadasRedox = {
  primeiraDerivada:
    PontoPrimeiraDerivadaRedox[];

  segundaDerivada:
    PontoSegundaDerivadaRedox[];

  volumePFPrimeiraDerivadaMl:
    number;

  valorMaximoPrimeiraDerivada:
    number;

  volumePFSegundaDerivadaMl:
    number;
};


type PontoInflexaoRefinado = {
  volumeMl:
    number;

  valorMaximoPrimeiraDerivada:
    number;
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
    (
      ponto
    ) => {
      if (
        !Number.isFinite(
          ponto
            .volumeAdicionadoMl
        ) ||
        ponto.potencialV ===
          null ||
        !Number.isFinite(
          ponto
            .potencialV
        )
      ) {
        return;
      }


      mapa.set(
        ponto
          .volumeAdicionadoMl,

        ponto
          .potencialV
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
      (
        a,
        b
      ) =>
        a.volumeMl -
        b.volumeMl
    );
}


/* =========================================================
 * PRIMEIRA DERIVADA
 * ======================================================= */

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

    indice +=
      1
  ) {
    const atual =
      pontos[
        indice
      ];


    const proximo =
      pontos[
        indice +
        1
      ];


    const deltaVolume =
      proximo
        .volumeMl -
      atual
        .volumeMl;


    if (
      !Number.isFinite(
        deltaVolume
      ) ||
      deltaVolume <=
        0
    ) {
      continue;
    }


    const primeiraDerivada =
      (
        proximo
          .potencialV -
        atual
          .potencialV
      ) /
      deltaVolume;


    const volumeMedio =
      (
        atual
          .volumeMl +
        proximo
          .volumeMl
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
    primeiraDerivada.length -
      1;

    indice +=
      1
  ) {
    const atual =
      primeiraDerivada[
        indice
      ];


    const proximo =
      primeiraDerivada[
        indice +
        1
      ];


    const deltaVolume =
      proximo
        .volumeMl -
      atual
        .volumeMl;


    if (
      !Number.isFinite(
        deltaVolume
      ) ||
      deltaVolume <=
        0
    ) {
      continue;
    }


    const segundaDerivada =
      (
        proximo
          .primeiraDerivada -
        atual
          .primeiraDerivada
      ) /
      deltaVolume;


    const volumeMedio =
      (
        atual
          .volumeMl +
        proximo
          .volumeMl
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
 * REFINAMENTO DO PONTO DE INFLEXÃO
 * ======================================================= */

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

    indice +=
      1
  ) {
    if (
      pontos[
        indice
      ]
        .primeiraDerivada >
      pontos[
        indiceMaximo
      ]
        .primeiraDerivada
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


  const central =
    pontos[
      indiceMaximo
    ];


  /*
   * Precisamos de um ponto
   * de cada lado para realizar
   * a interpolação parabólica.
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
        central
          .volumeMl,

      valorMaximoPrimeiraDerivada:
        central
          .primeiraDerivada,
    };
  }


  const anterior =
    pontos[
      indiceMaximo -
        1
    ];


  const posterior =
    pontos[
      indiceMaximo +
        1
    ];


  /*
   * Ajuste parabólico local:
   *
   * y = a u² + b u + c
   *
   * onde:
   *
   * u = V - Vcentral
   *
   * e:
   *
   * c = ycentral
   *
   *
   * O vértice ocorre em:
   *
   * uPF = -b / 2a
   *
   *
   * A derivada da parábola é:
   *
   * dy/du = 2au + b
   *
   * Portanto:
   *
   * máximo da 1ª derivada
   *         ⇕
   * zero da 2ª derivada
   *
   * e ambos representam
   * exatamente o mesmo PF.
   */

  const uAnterior =
    anterior
      .volumeMl -
    central
      .volumeMl;


  const uPosterior =
    posterior
      .volumeMl -
    central
      .volumeMl;


  if (
    uAnterior ===
      0 ||
    uPosterior ===
      0 ||
    uAnterior ===
      uPosterior
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


  const inclinacaoAnterior =
    (
      anterior
        .primeiraDerivada -
      central
        .primeiraDerivada
    ) /
    uAnterior;


  const inclinacaoPosterior =
    (
      posterior
        .primeiraDerivada -
      central
        .primeiraDerivada
    ) /
    uPosterior;


  const a =
    (
      inclinacaoAnterior -
      inclinacaoPosterior
    ) /
    (
      uAnterior -
      uPosterior
    );


  const b =
    inclinacaoAnterior -
    a *
      uAnterior;


  /*
   * Para representar um máximo,
   * a parábola precisa ser côncava
   * para baixo:
   *
   * a < 0
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


  const uVertice =
    -b /
    (
      2 *
      a
    );


  const volumeVertice =
    central
      .volumeMl +
    uVertice;


  /*
   * O refinamento só é aceito
   * se o vértice estiver dentro
   * dos três pontos utilizados.
   */
  if (
    !Number.isFinite(
      volumeVertice
    ) ||
    volumeVertice <
      anterior
        .volumeMl ||
    volumeVertice >
      posterior
        .volumeMl
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


  const valorVertice =
    a *
      uVertice *
      uVertice +
    b *
      uVertice +
    central
      .primeiraDerivada;


  if (
    !Number.isFinite(
      valorVertice
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
      volumeVertice,

    valorMaximoPrimeiraDerivada:
      valorVertice,
  };
}


/* =========================================================
 * INSERÇÃO DO PONTO REFINADO
 * ======================================================= */

function inserirPontoRefinadoPrimeiraDerivada({
  pontos,
  pontoInflexao,
}: {
  pontos:
    PontoPrimeiraDerivadaRedox[];

  pontoInflexao:
    PontoInflexaoRefinado;
}) {
  const tolerancia =
    1e-12;


  const pontosSemDuplicado =
    pontos.filter(
      (
        ponto
      ) =>
        Math.abs(
          ponto
            .volumeMl -
          pontoInflexao
            .volumeMl
        ) >
        tolerancia
    );


  return [
    ...pontosSemDuplicado,

    {
      volumeMl:
        pontoInflexao
          .volumeMl,

      primeiraDerivada:
        pontoInflexao
          .valorMaximoPrimeiraDerivada,
    },
  ].sort(
    (
      a,
      b
    ) =>
      a.volumeMl -
      b.volumeMl
  );
}


function inserirZeroRefinadoSegundaDerivada({
  pontos,
  volumePFMl,
}: {
  pontos:
    PontoSegundaDerivadaRedox[];

  volumePFMl:
    number;
}) {
  const tolerancia =
    1e-12;


  const pontosSemDuplicado =
    pontos.filter(
      (
        ponto
      ) =>
        Math.abs(
          ponto
            .volumeMl -
          volumePFMl
        ) >
        tolerancia
    );


  return [
    ...pontosSemDuplicado,

    {
      volumeMl:
        volumePFMl,

      segundaDerivada:
        0,
    },
  ].sort(
    (
      a,
      b
    ) =>
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
    4
  ) {
    throw new Error(
      "São necessários pelo menos quatro pontos válidos para calcular e refinar as derivadas."
    );
  }


  const primeiraDerivadaBase =
    calcularPrimeiraDerivada(
      pontos
    );


  if (
    primeiraDerivadaBase.length <
    3
  ) {
    throw new Error(
      "Não existem pontos suficientes para refinar a primeira derivada."
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


  const pontoInflexao =
    refinarPontoInflexao(
      primeiraDerivadaBase
    );


  const primeiraDerivada =
    inserirPontoRefinadoPrimeiraDerivada({
      pontos:
        primeiraDerivadaBase,

      pontoInflexao,
    });


  const segundaDerivada =
    inserirZeroRefinadoSegundaDerivada({
      pontos:
        segundaDerivadaBase,

      volumePFMl:
        pontoInflexao
          .volumeMl,
    });


  return {
    primeiraDerivada,

    segundaDerivada,

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