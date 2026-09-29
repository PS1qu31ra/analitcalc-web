"use client";

import type {
  ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import type {
  ResultadoPontoPermanganometria,
} from "@/lib/oxirreducao/permanganometria";


type SimulacaoTempoRealRedoxChartProps = {
  curva:
    ResultadoCurvaRedox;

  pontosAdicionados:
    ResultadoPontoPermanganometria[];
};


function formatarNumero(
  valor: number,
  casas = 2
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits:
        casas,

      maximumFractionDigits:
        casas,
    }
  ).format(
    valor
  );
}


function gerarTicks(
  min: number,
  max: number,
  quantidade: number
) {
  if (
    max ===
    min
  ) {
    return [
      min,
    ];
  }


  const intervalo =
    (
      max -
      min
    ) /
    quantidade;


  return Array.from(
    {
      length:
        quantidade +
        1,
    },
    (
      _,
      index
    ) =>
      Number(
        (
          min +
          intervalo *
            index
        ).toFixed(
          4
        )
      )
  );
}


export default function SimulacaoTempoRealRedoxChart({
  curva,
  pontosAdicionados,
}: SimulacaoTempoRealRedoxChartProps) {
  const pontosCurva =
    curva
      .pontosValidos
      .filter(
        (
          ponto
        ) =>
          ponto.potencialV !==
          null
      );


  if (
    !pontosCurva.length
  ) {
    return (
      <div className="liveChartEmpty">
        Calcule o sistema antes de iniciar a titulação em
        tempo real.
      </div>
    );
  }


  const largura =
    900;

  const altura =
    620;


  const margem = {
    top:
      40,

    right:
      40,

    bottom:
      82,

    left:
      78,
  };


  const volumesPontos =
    pontosAdicionados.map(
      (
        ponto
      ) =>
        ponto
          .volumeAdicionadoMl
    );


  const xMin =
    0;


  const xMax =
    Math.max(
      curva
        .volumeMaximoMl,

      ...volumesPontos,

      1
    );


  const potenciaisCurva =
    pontosCurva
      .map(
        (
          ponto
        ) =>
          ponto.potencialV
      )
      .filter(
        (
          valor
        ): valor is number =>
          valor !==
          null
      );


  const potenciaisAdicionados =
    pontosAdicionados
      .map(
        (
          ponto
        ) =>
          ponto.potencialV
      )
      .filter(
        (
          valor
        ): valor is number =>
          valor !==
          null
      );


  const todosPotenciais = [
    ...potenciaisCurva,
    ...potenciaisAdicionados,
  ];


  const potencialMinimoBruto =
    Math.min(
      ...todosPotenciais
    );


  const potencialMaximoBruto =
    Math.max(
      ...todosPotenciais
    );


  const amplitude =
    Math.max(
      potencialMaximoBruto -
        potencialMinimoBruto,
      0.1
    );


  const yMin =
    potencialMinimoBruto -
    amplitude *
      0.08;


  const yMax =
    potencialMaximoBruto +
    amplitude *
      0.08;


  const plotWidth =
    largura -
    margem.left -
    margem.right;


  const plotHeight =
    altura -
    margem.top -
    margem.bottom;


  function xScale(
    volume: number
  ) {
    if (
      xMax ===
      xMin
    ) {
      return margem.left;
    }


    return (
      margem.left +
      (
        (
          volume -
          xMin
        ) /
        (
          xMax -
          xMin
        )
      ) *
        plotWidth
    );
  }


  function yScale(
    potencial: number
  ) {
    if (
      yMax ===
      yMin
    ) {
      return margem.top;
    }


    return (
      margem.top +
      (
        (
          yMax -
          potencial
        ) /
        (
          yMax -
          yMin
        )
      ) *
        plotHeight
    );
  }


  const linhaCurva =
    pontosCurva
      .map(
        (
          ponto
        ) =>
          `${xScale(
            ponto
              .volumeAdicionadoMl
          )},${yScale(
            ponto
              .potencialV as number
          )}`
      )
      .join(
        " "
      );


  const pontosValidosAdicionados =
    pontosAdicionados.filter(
      (
        ponto
      ) =>
        ponto.potencialV !==
        null
    );


  const linhaPontos =
    pontosValidosAdicionados
      .map(
        (
          ponto
        ) =>
          `${xScale(
            ponto
              .volumeAdicionadoMl
          )},${yScale(
            ponto
              .potencialV as number
          )}`
      )
      .join(
        " "
      );


  const ticksX =
    gerarTicks(
      xMin,
      xMax,
      5
    );


  const ticksY =
    gerarTicks(
      yMin,
      yMax,
      6
    );


  return (
    <div className="liveChartBox">
      <div className="chartHeader">
        <div>
          <strong>
            Simulação em tempo real
          </strong>

          <span>
            A linha representa a curva ideal e os pontos
            mostram os volumes de KMnO₄ adicionados pelo
            usuário.
          </span>
        </div>
      </div>


      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="liveCurveSvg"
        role="img"
        aria-label="Simulação em tempo real da titulação permanganométrica"
      >
        <rect
          width={
            largura
          }
          height={
            altura
          }
          fill="#ffffff"
        />


        <rect
          x={
            margem.left
          }
          y={
            margem.top
          }
          width={
            plotWidth
          }
          height={
            plotHeight
          }
          rx="18"
          fill="#ffffff"
          stroke="#e5e7eb"
        />


        {ticksY.map(
          (
            tick
          ) => {
            const y =
              yScale(
                tick
              );


            return (
              <g
                key={`y-${tick}`}
              >
                <line
                  x1={
                    margem.left
                  }
                  x2={
                    largura -
                    margem.right
                  }
                  y1={
                    y
                  }
                  y2={
                    y
                  }
                  stroke="#eeeeee"
                />

                <text
                  x={
                    margem.left -
                    12
                  }
                  y={
                    y +
                    5
                  }
                  fill="#667085"
                  fontSize="15"
                  fontWeight="700"
                  textAnchor="end"
                >
                  {formatarNumero(
                    tick,
                    2
                  )}
                </text>
              </g>
            );
          }
        )}


        {ticksX.map(
          (
            tick
          ) => {
            const x =
              xScale(
                tick
              );


            return (
              <g
                key={`x-${tick}`}
              >
                <line
                  x1={
                    x
                  }
                  x2={
                    x
                  }
                  y1={
                    margem.top
                  }
                  y2={
                    altura -
                    margem.bottom
                  }
                  stroke="#eeeeee"
                />

                <text
                  x={
                    x
                  }
                  y={
                    altura -
                    46
                  }
                  fill="#667085"
                  fontSize="15"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {formatarNumero(
                    tick,
                    1
                  )}
                </text>
              </g>
            );
          }
        )}


        <polyline
          points={
            linhaCurva
          }
          fill="none"
          stroke="#2563eb"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />


        {pontosValidosAdicionados.length >
          1 && (
          <polyline
            points={
              linhaPontos
            }
            fill="none"
            stroke="#f43f5e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}


        {pontosValidosAdicionados.map(
          (
            ponto,
            index
          ) => {
            if (
              ponto.potencialV ===
              null
            ) {
              return null;
            }


            const ehUltimoPonto =
              index ===
              pontosValidosAdicionados.length -
                1;


            return (
              <g
                key={`${ponto.volumeAdicionadoMl}-${index}`}
              >
                <circle
                  cx={
                    xScale(
                      ponto
                        .volumeAdicionadoMl
                    )
                  }
                  cy={
                    yScale(
                      ponto
                        .potencialV
                    )
                  }
                  r="10"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="4"
                />


                {ehUltimoPonto && (
                  <text
                    x={
                      xScale(
                        ponto
                          .volumeAdicionadoMl
                      )
                    }
                    y={
                      yScale(
                        ponto
                          .potencialV
                      ) -
                      16
                    }
                    fill="#9f1239"
                    fontSize="13"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {formatarNumero(
                      ponto
                        .volumeAdicionadoMl,
                      2
                    )}
                  </text>
                )}
              </g>
            );
          }
        )}


        <text
          x={
            largura /
            2
          }
          y={
            altura -
            16
          }
          fill="#344054"
          fontSize="17"
          fontWeight="900"
          textAnchor="middle"
        >
          Volume de KMnO₄ adicionado (mL)
        </text>


        <text
          x="24"
          y={
            altura /
            2
          }
          fill="#344054"
          fontSize="17"
          fontWeight="900"
          textAnchor="middle"
          transform={`rotate(-90 24 ${
            altura /
            2
          })`}
        >
          Potencial E (V)
        </text>
      </svg>


      <div className="chartLegend">
        <span>
          <i className="legendLine idealCurve" />

          Curva ideal
        </span>

        <span>
          <i className="legendLine livePoints" />

          Pontos adicionados
        </span>
      </div>
    </div>
  );
}