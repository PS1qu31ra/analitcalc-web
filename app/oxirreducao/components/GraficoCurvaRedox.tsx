import type {
    ResultadoCurvaRedox,
  } from "@/lib/oxirreducao/curvaRedox";
  
  
  type GraficoCurvaRedoxProps = {
    resultado:
      ResultadoCurvaRedox;
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
  
  
  export default function GraficoCurvaRedox({
    resultado,
  }: GraficoCurvaRedoxProps) {
    const largura =
      1000;
  
    const altura =
      470;
  
    const margemEsquerda =
      78;
  
    const margemDireita =
      35;
  
    const margemSuperior =
      35;
  
    const margemInferior =
      72;
  
    const larguraUtil =
      largura -
      margemEsquerda -
      margemDireita;
  
    const alturaUtil =
      altura -
      margemSuperior -
      margemInferior;
  
  
    const pontos =
      resultado.pontosValidos.filter(
        (ponto) =>
          ponto.potencialV !==
            null &&
          Number.isFinite(
            ponto.potencialV
          )
      );
  
  
    if (
      pontos.length ===
      0
    ) {
      return (
        <div className="oxirreducaoEmptyChart">
          Não foi possível gerar pontos válidos para a curva.
        </div>
      );
    }
  
  
    const potenciais =
      pontos.map(
        (ponto) =>
          ponto.potencialV as number
      );
  
  
    const minimoOriginal =
      Math.min(
        ...potenciais
      );
  
    const maximoOriginal =
      Math.max(
        ...potenciais
      );
  
  
    const amplitude =
      Math.max(
        maximoOriginal -
          minimoOriginal,
        0.1
      );
  
  
    const minimoPotencial =
      minimoOriginal -
      amplitude *
        0.08;
  
    const maximoPotencial =
      maximoOriginal +
      amplitude *
        0.08;
  
  
    const x = (
      volume: number
    ) =>
      margemEsquerda +
      (
        volume /
        resultado
          .volumeMaximoMl
      ) *
        larguraUtil;
  
  
    const y = (
      potencial: number
    ) =>
      margemSuperior +
      (
        (
          maximoPotencial -
          potencial
        ) /
        (
          maximoPotencial -
          minimoPotencial
        )
      ) *
        alturaUtil;
  
  
    const polyline =
      pontos
        .map(
          (ponto) =>
            `${x(
              ponto
                .volumeAdicionadoMl
            )},${y(
              ponto
                .potencialV as number
            )}`
        )
        .join(" ");
  
  
    const marcacoesX =
      Array.from(
        {
          length:
            6,
        },
        (
          _,
          indice
        ) =>
          (
            resultado
              .volumeMaximoMl /
            5
          ) *
          indice
      );
  
  
    const marcacoesY =
      Array.from(
        {
          length:
            6,
        },
        (
          _,
          indice
        ) =>
          minimoPotencial +
          (
            (
              maximoPotencial -
              minimoPotencial
            ) /
            5
          ) *
            indice
      );
  
  
    const xPE =
      x(
        resultado
          .volumeEquivalenciaMl
      );
  
  
    const yPE =
      y(
        resultado
          .potencialEquivalenciaV
      );
  
  
    return (
      <div className="oxirreducaoChartWrapper">
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label="Curva de potencial em função do volume de permanganato adicionado"
        >
          {marcacoesY.map(
            (
              potencial
            ) => (
              <g
                key={`y-${potencial}`}
              >
                <line
                  x1={
                    margemEsquerda
                  }
                  x2={
                    largura -
                    margemDireita
                  }
                  y1={
                    y(
                      potencial
                    )
                  }
                  y2={
                    y(
                      potencial
                    )
                  }
                  className="oxirreducaoChartGrid"
                />
  
                <text
                  x={
                    margemEsquerda -
                    14
                  }
                  y={
                    y(
                      potencial
                    ) +
                    5
                  }
                  textAnchor="end"
                  className="oxirreducaoChartTick"
                >
                  {formatarNumero(
                    potencial,
                    2
                  )}
                </text>
              </g>
            )
          )}
  
  
          {marcacoesX.map(
            (
              volume
            ) => (
              <g
                key={`x-${volume}`}
              >
                <line
                  x1={
                    x(
                      volume
                    )
                  }
                  x2={
                    x(
                      volume
                    )
                  }
                  y1={
                    margemSuperior
                  }
                  y2={
                    altura -
                    margemInferior
                  }
                  className="oxirreducaoChartGrid"
                />
  
                <text
                  x={
                    x(
                      volume
                    )
                  }
                  y={
                    altura -
                    margemInferior +
                    28
                  }
                  textAnchor="middle"
                  className="oxirreducaoChartTick"
                >
                  {formatarNumero(
                    volume,
                    1
                  )}
                </text>
              </g>
            )
          )}
  
  
          <line
            x1={
              margemEsquerda
            }
            x2={
              margemEsquerda
            }
            y1={
              margemSuperior
            }
            y2={
              altura -
              margemInferior
            }
            className="oxirreducaoChartAxis"
          />
  
          <line
            x1={
              margemEsquerda
            }
            x2={
              largura -
              margemDireita
            }
            y1={
              altura -
              margemInferior
            }
            y2={
              altura -
              margemInferior
            }
            className="oxirreducaoChartAxis"
          />
  
  
          <polyline
            points={
              polyline
            }
            className="oxirreducaoChartCurve"
          />
  
  
          <line
            x1={
              xPE
            }
            x2={
              xPE
            }
            y1={
              margemSuperior
            }
            y2={
              altura -
              margemInferior
            }
            className="oxirreducaoChartPELine"
          />
  
  
          <circle
            cx={
              xPE
            }
            cy={
              yPE
            }
            r="7"
            className="oxirreducaoChartPEPoint"
          />
  
  
          <text
            x={
              xPE +
              12
            }
            y={
              margemSuperior +
              22
            }
            className="oxirreducaoChartPELabel"
          >
            PE ={" "}
            {formatarNumero(
              resultado
                .volumeEquivalenciaMl,
              2
            )}{" "}
            mL
          </text>
  
  
          <text
            x="22"
            y={
              margemSuperior +
              alturaUtil /
                2
            }
            textAnchor="middle"
            transform={`rotate(-90 22 ${
              margemSuperior +
              alturaUtil /
                2
            })`}
            className="oxirreducaoChartAxisLabel"
          >
            Potencial E (V)
          </text>
  
  
          <text
            x={
              margemEsquerda +
              larguraUtil /
                2
            }
            y={
              altura -
              16
            }
            textAnchor="middle"
            className="oxirreducaoChartAxisLabel"
          >
            Volume de KMnO₄ adicionado (mL)
          </text>
        </svg>
      </div>
    );
  }