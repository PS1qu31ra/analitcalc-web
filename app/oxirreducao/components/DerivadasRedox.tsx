import {
    calcularDerivadasRedox,
  } from "@/lib/oxirreducao/derivadas";
  
  
  type PontoCurva = {
    volumeAdicionadoMl: number;
  
    potencialV:
      number | null;
  };
  
  
  type DerivadasRedoxProps = {
    volumeEquivalenciaMl:
      number;
  
    pontos:
      PontoCurva[];
  };
  
  
  type PontoGrafico = {
    volumeMl: number;
  
    valor: number;
  };
  
  
  function formatarNumero(
    valor: number,
    casas = 3
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
  
  
  function formatarEixo(
    valor: number
  ) {
    const absoluto =
      Math.abs(
        valor
      );
  
  
    if (
      absoluto !==
        0 &&
      (
        absoluto >=
          1000 ||
        absoluto <
          0.001
      )
    ) {
      return valor.toExponential(
        2
      );
    }
  
  
    if (
      absoluto >=
      10
    ) {
      return formatarNumero(
        valor,
        1
      );
    }
  
  
    if (
      absoluto >=
      1
    ) {
      return formatarNumero(
        valor,
        2
      );
    }
  
  
    return formatarNumero(
      valor,
      3
    );
  }
  
  
  /* =========================================================
   * GRÁFICO
   * ======================================================= */
  
  function GraficoDerivada({
    pontos,
    tituloEixoY,
    volumeEquivalenciaMl,
    centralizarEmZero = false,
    volumeDestaque = null,
    valorDestaque = null,
    rotuloDestaque,
  }: {
    pontos:
      PontoGrafico[];
  
    tituloEixoY:
      string;
  
    volumeEquivalenciaMl:
      number;
  
    centralizarEmZero?:
      boolean;
  
    volumeDestaque?:
      number | null;
  
    valorDestaque?:
      number | null;
  
    rotuloDestaque?:
      string;
  }) {
    const largura =
      1000;
  
    const altura =
      430;
  
  
    const margemEsquerda =
      105;
  
    const margemDireita =
      40;
  
    const margemSuperior =
      42;
  
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
  
  
    /*
     * Para derivadas, o interesse analítico
     * está concentrado próximo ao PE.
     *
     * O cálculo continua utilizando TODOS
     * os pontos da curva.
     *
     * Apenas a visualização é ampliada.
     */
    const meiaJanela =
      Math.max(
        volumeEquivalenciaMl *
          0.12,
        1
      );
  
  
    const inicioJanela =
      Math.max(
        0,
        volumeEquivalenciaMl -
          meiaJanela
      );
  
  
    const fimJanela =
      volumeEquivalenciaMl +
      meiaJanela;
  
  
    const pontosJanela =
      pontos.filter(
        (ponto) =>
          ponto.volumeMl >=
            inicioJanela &&
          ponto.volumeMl <=
            fimJanela
      );
  
  
    const pontosVisiveis =
      pontosJanela.length >=
      3
        ? pontosJanela
        : pontos;
  
  
    if (
      pontosVisiveis.length <
      2
    ) {
      return (
        <div className="oxirreducaoEmptyChart">
          Não existem pontos suficientes para gerar o gráfico.
        </div>
      );
    }
  
  
    const volumes =
      pontosVisiveis.map(
        (ponto) =>
          ponto.volumeMl
      );
  
  
    const valores =
      pontosVisiveis.map(
        (ponto) =>
          ponto.valor
      );
  
  
    const volumeMinimo =
      Math.min(
        ...volumes
      );
  
  
    const volumeMaximo =
      Math.max(
        ...volumes
      );
  
  
    const valorMinimoOriginal =
      Math.min(
        ...valores
      );
  
  
    const valorMaximoOriginal =
      Math.max(
        ...valores
      );
  
  
    let valorMinimo:
      number;
  
  
    let valorMaximo:
      number;
  
  
    if (
      centralizarEmZero
    ) {
      const maximoAbsoluto =
        Math.max(
          Math.abs(
            valorMinimoOriginal
          ),
  
          Math.abs(
            valorMaximoOriginal
          ),
  
          1e-9
        );
  
  
      valorMinimo =
        -maximoAbsoluto *
        1.1;
  
  
      valorMaximo =
        maximoAbsoluto *
        1.1;
    } else {
      const amplitude =
        Math.max(
          valorMaximoOriginal -
            valorMinimoOriginal,
  
          Math.abs(
            valorMaximoOriginal
          ) *
            0.05,
  
          1e-9
        );
  
  
      valorMinimo =
        valorMinimoOriginal >=
        0
          ? 0
          : valorMinimoOriginal -
            amplitude *
              0.08;
  
  
      valorMaximo =
        valorMaximoOriginal +
        amplitude *
          0.1;
    }
  
  
    const x = (
      volume: number
    ) =>
      margemEsquerda +
      (
        (
          volume -
          volumeMinimo
        ) /
        (
          volumeMaximo -
          volumeMinimo
        )
      ) *
        larguraUtil;
  
  
    const y = (
      valor: number
    ) =>
      margemSuperior +
      (
        (
          valorMaximo -
          valor
        ) /
        (
          valorMaximo -
          valorMinimo
        )
      ) *
        alturaUtil;
  
  
    const polyline =
      pontosVisiveis
        .map(
          (ponto) =>
            `${x(
              ponto.volumeMl
            )},${y(
              ponto.valor
            )}`
        )
        .join(
          " "
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
          volumeMinimo +
          (
            (
              volumeMaximo -
              volumeMinimo
            ) /
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
          valorMinimo +
          (
            (
              valorMaximo -
              valorMinimo
            ) /
            5
          ) *
            indice
      );
  
  
    const zeroDentro =
      valorMinimo <=
        0 &&
      valorMaximo >=
        0;
  
  
    const peDentro =
      volumeEquivalenciaMl >=
        volumeMinimo &&
      volumeEquivalenciaMl <=
        volumeMaximo;
  
  
    const destaqueDentro =
      volumeDestaque !==
        null &&
      valorDestaque !==
        null &&
      volumeDestaque >=
        volumeMinimo &&
      volumeDestaque <=
        volumeMaximo &&
      valorDestaque >=
        valorMinimo &&
      valorDestaque <=
        valorMaximo;
  
  
    return (
      <div className="oxirreducaoDerivativeChart">
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label={
            tituloEixoY
          }
        >
          {/* =================================================
              GRADE Y
          ================================================= */}
  
          {marcacoesY.map(
            (
              valor,
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
                      valor
                    )
                  }
                  y2={
                    y(
                      valor
                    )
                  }
                  className="oxirreducaoChartGrid"
                />
  
                <text
                  x={
                    margemEsquerda -
                    15
                  }
                  y={
                    y(
                      valor
                    ) +
                    5
                  }
                  textAnchor="end"
                  className="oxirreducaoChartTick"
                >
                  {
                    formatarEixo(
                      valor
                    )
                  }
                </text>
              </g>
            )
          )}
  
  
          {/* =================================================
              GRADE X
          ================================================= */}
  
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
                    2
                  )}
                </text>
              </g>
            )
          )}
  
  
          {/* =================================================
              EIXOS
          ================================================= */}
  
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
  
  
          {/* =================================================
              LINHA ZERO
          ================================================= */}
  
          {zeroDentro && (
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
                  0
                )
              }
              y2={
                y(
                  0
                )
              }
              className="oxirreducaoDerivativeZero"
            />
          )}
  
  
          {/* =================================================
              PE ESTEQUIOMÉTRICO
          ================================================= */}
  
          {peDentro && (
            <>
              <line
                x1={
                  x(
                    volumeEquivalenciaMl
                  )
                }
                x2={
                  x(
                    volumeEquivalenciaMl
                  )
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
  
              <text
                x={
                  x(
                    volumeEquivalenciaMl
                  ) +
                  9
                }
                y={
                  margemSuperior +
                  18
                }
                className="oxirreducaoChartPELabel"
              >
                PE ={" "}
                {formatarNumero(
                  volumeEquivalenciaMl,
                  2
                )}{" "}
                mL
              </text>
            </>
          )}
  
  
          {/* =================================================
              CURVA
          ================================================= */}
  
          <polyline
            points={
              polyline
            }
            className="oxirreducaoChartCurve"
          />
  
  
          {/* =================================================
              PONTO DETERMINADO PELA DERIVADA
          ================================================= */}
  
  {destaqueDentro && (
  <>
    <circle
      cx={
        x(
          volumeDestaque
        )
      }
      cy={
        y(
          valorDestaque
        )
      }
      r="6"
      className="oxirreducaoChartPEPoint"
    />

    {rotuloDestaque && (
      <text
        x={
          x(
            volumeDestaque
          ) -
          14
        }
        y={
          Math.min(
            y(
              valorDestaque
            ) +
              28,
            altura -
              margemInferior -
              12
          )
        }
        textAnchor="end"
        className="oxirreducaoChartDerivativeLabel"
      >
        {
          rotuloDestaque
        }
      </text>
    )}
  </>
)}
  
  
          {/* =================================================
              TÍTULOS DOS EIXOS
          ================================================= */}
  
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
            Volume de KMnO₄ (mL)
          </text>
  
  
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
            {
              tituloEixoY
            }
          </text>
        </svg>
      </div>
    );
  }
  
  
  /* =========================================================
   * COMPONENTE PRINCIPAL
   * ======================================================= */
  
  export default function DerivadasRedox({
    volumeEquivalenciaMl,
    pontos,
  }: DerivadasRedoxProps) {
    const resultado =
      calcularDerivadasRedox(
        pontos
      );
  
  
    const erroPrimeira =
      resultado
        .volumePEPrimeiraDerivadaMl -
      volumeEquivalenciaMl;
  
  
    const erroSegunda =
      resultado
        .volumePESegundaDerivadaMl !==
        null
        ? resultado
            .volumePESegundaDerivadaMl -
          volumeEquivalenciaMl
        : null;
  
  
    const pontosPrimeira:
      PontoGrafico[] =
      resultado
        .primeiraDerivada
        .map(
          (ponto) => ({
            volumeMl:
              ponto.volumeMl,
  
            valor:
              ponto
                .primeiraDerivada,
          })
        );
  
  
    const pontosSegunda:
      PontoGrafico[] =
      resultado
        .segundaDerivada
        .map(
          (ponto) => ({
            volumeMl:
              ponto.volumeMl,
  
            valor:
              ponto
                .segundaDerivada,
          })
        );
  
  
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Derivadas
          </span>
  
          <h3>
            Determinação matemática do PE
          </h3>
  
          <p>
  As derivadas são calculadas numericamente a partir
  da curva potenciométrica teórica, utilizando
  diferenças centradas e tratamento específico para
  os diferentes espaçamentos de volume próximos ao
  ponto de equivalência.
</p>
        </header>
  
  
        <div className="oxirreducaoDerivativeSummary">
          <article>
            <span>
              PE estequiométrico
            </span>
  
            <strong>
              {formatarNumero(
                volumeEquivalenciaMl,
                3
              )}{" "}
              mL
            </strong>
          </article>
  
  
          <article>
          <span>
  Máximo de dE/dV
</span>
  
            <strong>
              {formatarNumero(
                resultado
                  .volumePEPrimeiraDerivadaMl,
                3
              )}{" "}
              mL
            </strong>
  
            <small>
              Δ ={" "}
              {formatarNumero(
                erroPrimeira,
                3
              )}{" "}
              mL
            </small>
          </article>
  
  
          <article>
          <span>
  d²E/dV² = 0
</span>
  
            <strong>
              {resultado
                .volumePESegundaDerivadaMl !==
              null
                ? `${formatarNumero(
                    resultado
                      .volumePESegundaDerivadaMl,
                    3
                  )} mL`
                : "Não localizado"}
            </strong>
  
            {erroSegunda !==
              null && (
              <small>
                Δ ={" "}
                {formatarNumero(
                  erroSegunda,
                  3
                )}{" "}
                mL
              </small>
            )}
          </article>
  
  
          <article>
          <span>
  Máximo de dE/dV
</span>
  
            <strong>
              {formatarNumero(
                resultado
                  .valorMaximoPrimeiraDerivada,
                4
              )}
            </strong>
  
            <small>
              V·mL⁻¹
            </small>
          </article>
        </div>
  
  
        <div className="oxirreducaoDerivativeSection">
          <header>
            <span>
              1ª derivada
            </span>
  
            <h4>
  dE / dV
</h4>
  
<p>
  O máximo de dE/dV identifica o ponto de maior
  inclinação da curva potenciométrica teórica.
  Como a curva é calculada numericamente em uma
  malha refinada ao redor do PE, a derivada é
  avaliada diretamente nos volumes da curva.
</p>
          </header>
  
  
          <GraficoDerivada
            pontos={
              pontosPrimeira
            }
            tituloEixoY="dE/dV (V·mL⁻¹)"
            volumeEquivalenciaMl={
              volumeEquivalenciaMl
            }
            volumeDestaque={
              resultado
                .volumePEPrimeiraDerivadaMl
            }
            valorDestaque={
              resultado
                .valorMaximoPrimeiraDerivada
            }
            rotuloDestaque="Máximo dE/dV"
          />
        </div>
  
  
        <div className="oxirreducaoDerivativeSection">
          <header>
            <span>
              2ª derivada
            </span>
  
            <h4>
  d²E / dV²
</h4>
  
            <p>
              A segunda derivada apresenta mudança de sinal
              próximo ao ponto de inflexão da curva E × V.
              O cruzamento por zero é estimado por interpolação
              linear entre os pontos adjacentes.
            </p>
          </header>
  
  
          <GraficoDerivada
            pontos={
              pontosSegunda
            }
            tituloEixoY="d²E/dV² (V·mL⁻²)"
            volumeEquivalenciaMl={
              volumeEquivalenciaMl
            }
            centralizarEmZero
            volumeDestaque={
              resultado
                .volumePESegundaDerivadaMl
            }
            valorDestaque={
              resultado
                .volumePESegundaDerivadaMl !==
              null
                ? 0
                : null
            }
            rotuloDestaque="zero"
          />
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Como interpretar
          </strong>
  
          <p>
            A linha vertical tracejada representa o PE obtido
            pela estequiometria. Na primeira derivada, buscamos
            o máximo de ΔE/ΔV. Na segunda derivada, buscamos a
            mudança de sinal e estimamos o cruzamento por zero.
            Os gráficos utilizam uma janela ampliada ao redor do
            PE apenas para visualização; os cálculos utilizam
            todos os pontos válidos da curva E × V.
          </p>
        </div>
      </section>
    );
  }