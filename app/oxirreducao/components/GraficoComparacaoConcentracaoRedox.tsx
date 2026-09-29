import type {
    ResultadoCurvaRedox,
  } from "@/lib/oxirreducao/curvaRedox";
  
  
  type GraficoComparacaoConcentracaoRedoxProps = {
    original:
      ResultadoCurvaRedox;
  
    simulado:
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
  
  
  export default function GraficoComparacaoConcentracaoRedox({
    original,
    simulado,
  }: GraficoComparacaoConcentracaoRedoxProps) {
    const largura =
      1000;
  
    const altura =
      500;
  
  
    const margemEsquerda =
      82;
  
    const margemDireita =
      45;
  
    const margemSuperior =
      55;
  
    const margemInferior =
      78;
  
  
    const larguraUtil =
      largura -
      margemEsquerda -
      margemDireita;
  
  
    const alturaUtil =
      altura -
      margemSuperior -
      margemInferior;
  
  
    const pontosOriginal =
      original
        .pontosValidos
        .filter(
          (ponto) =>
            ponto.potencialV !==
              null &&
            Number.isFinite(
              ponto.potencialV
            )
        );
  
  
    const pontosSimulado =
      simulado
        .pontosValidos
        .filter(
          (ponto) =>
            ponto.potencialV !==
              null &&
            Number.isFinite(
              ponto.potencialV
            )
        );
  
  
    const todosPontos = [
      ...pontosOriginal,
      ...pontosSimulado,
    ];
  
  
    if (
      todosPontos.length ===
      0
    ) {
      return (
        <div className="oxirreducaoEmptyChart">
          Não existem pontos válidos para comparar as curvas.
        </div>
      );
    }
  
  
    const potenciais =
      todosPontos
        .map(
          (ponto) =>
            ponto.potencialV
        )
        .filter(
          (
            valor
          ): valor is number =>
            valor !== null &&
            Number.isFinite(
              valor
            )
        );
  
  
    const volumeMaximo =
      Math.max(
        original
          .volumeMaximoMl,
  
        simulado
          .volumeMaximoMl
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
        volumeMaximo
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
  
  
    const gerarPolyline = (
      pontos:
        typeof pontosOriginal
    ) =>
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
        .join(
          " "
        );
  
  
    const polylineOriginal =
      gerarPolyline(
        pontosOriginal
      );
  
  
    const polylineSimulado =
      gerarPolyline(
        pontosSimulado
      );
  
  
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
            volumeMaximo /
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
  
  
    const peOriginal =
      original
        .volumeEquivalenciaMl;
  
  
    const peSimulado =
      simulado
        .volumeEquivalenciaMl;
  
  
    const mesmoPE =
      Math.abs(
        peOriginal -
        peSimulado
      ) <
      1e-6;
  
  
    return (
      <div className="oxirreducaoComparisonChartWrapper">
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label="Comparação entre a curva potenciométrica original e a simulada"
        >
          {/* GRADE Y */}
  
          {marcacoesY.map(
            (
              potencial,
              indice
            ) => (
              <g
                key={`y-${indice}`}
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
  
  
          {/* GRADE X */}
  
          {marcacoesX.map(
            (
              volume,
              indice
            ) => (
              <g
                key={`x-${indice}`}
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
                    30
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
  
  
          {/* EIXOS */}
  
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
  
  
          {/* CURVA ORIGINAL */}
  
          <polyline
            points={
              polylineOriginal
            }
            className="oxirreducaoComparisonCurveOriginal"
          />
  
  
          {/* CURVA SIMULADA */}
  
          <polyline
            points={
              polylineSimulado
            }
            className="oxirreducaoComparisonCurveSimulated"
          />
  
  
                   {/* PE */}

                   {mesmoPE ? (
            <line
              x1={
                x(
                  peOriginal
                )
              }
              x2={
                x(
                  peOriginal
                )
              }
              y1={
                margemSuperior
              }
              y2={
                altura -
                margemInferior
              }
              className="oxirreducaoComparisonPEShared"
            />
          ) : (
            <>
              <line
                x1={
                  x(
                    peOriginal
                  )
                }
                x2={
                  x(
                    peOriginal
                  )
                }
                y1={
                  margemSuperior
                }
                y2={
                  altura -
                    margemInferior
                }
                className="oxirreducaoComparisonPEOriginal"
              />

              <line
                x1={
                  x(
                    peSimulado
                  )
                }
                x2={
                  x(
                    peSimulado
                  )
                }
                y1={
                  margemSuperior
                }
                y2={
                  altura -
                    margemInferior
                }
                className="oxirreducaoComparisonPESimulated"
              />
            </>
          )}
  
  
          {/* EIXO X */}
  
          <text
            x={
              margemEsquerda +
              larguraUtil /
                2
            }
            y={
              altura -
              17
            }
            textAnchor="middle"
            className="oxirreducaoChartAxisLabel"
          >
            Volume de KMnO₄ adicionado (mL)
          </text>
  
  
          {/* EIXO Y */}
  
          <text
            x="23"
            y={
              margemSuperior +
              alturaUtil /
                2
            }
            textAnchor="middle"
            transform={`rotate(-90 23 ${
              margemSuperior +
              alturaUtil /
                2
            })`}
            className="oxirreducaoChartAxisLabel"
          >
            Potencial E (V)
          </text>
        </svg>
  
  
        <div className="oxirreducaoComparisonLegend">
        <div className="oxirreducaoComparisonLegendCard">
          <span className="oxirreducaoComparisonLegendMain">
            <i className="oxirreducaoLegendOriginal" />

            <strong>
              Condição original
            </strong>
          </span>

          <small>
            PE ={" "}
            {formatarNumero(
              peOriginal,
              2
            )}{" "}
            mL
          </small>
        </div>

        <div className="oxirreducaoComparisonLegendCard">
          <span className="oxirreducaoComparisonLegendMain">
            <i className="oxirreducaoLegendSimulated" />

            <strong>
              Condição simulada
            </strong>
          </span>

          <small>
            PE ={" "}
            {formatarNumero(
              peSimulado,
              2
            )}{" "}
            mL
          </small>
        </div>
      </div>
      </div>
    );
  }