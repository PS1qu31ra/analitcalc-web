import {
    calcularDerivadasRedox,
  } from "@/lib/oxirreducao/derivadas";
  
  
  type PontoCurva = {
    volumeAdicionadoMl: number;
  
    potencialV:
      number | null;
  };
  
  
  type DerivadasRedoxProps = {
    sistema:
      | "ferro-ii"
      | "peroxido-hidrogenio";
  
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
    sistema,
    volumeEquivalenciaMl,
    pontos,
  }: DerivadasRedoxProps) {
    const resultado =
      calcularDerivadasRedox(
        pontos
      );
  
  
    const ehPeroxido =
      sistema ===
      "peroxido-hidrogenio";
  
  
    const nomeSistema =
      ehPeroxido
        ? "H₂O₂/MnO₄⁻"
        : "Fe²⁺/MnO₄⁻";
  
  
    const proporcaoEstequiometrica =
      ehPeroxido
        ? "5 H₂O₂ : 2 MnO₄⁻"
        : "5 Fe²⁺ : 1 MnO₄⁻";
  
  
      const erroAbsolutoPrimeira =
      resultado
        .volumePFPrimeiraDerivadaMl -
      volumeEquivalenciaMl;
    
    
    const erroRelativoPrimeira =
      (
        erroAbsolutoPrimeira /
        volumeEquivalenciaMl
      ) *
      100;
    
    
    const erroAbsolutoSegunda =
      resultado
        .volumePFSegundaDerivadaMl !==
        null
        ? resultado
            .volumePFSegundaDerivadaMl -
          volumeEquivalenciaMl
        : null;
    
    
    const erroRelativoSegunda =
      erroAbsolutoSegunda !==
      null
        ? (
            erroAbsolutoSegunda /
            volumeEquivalenciaMl
          ) *
          100
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
    PE teórico × PF teórico
  </h3>

  <p>
  O PE corresponde ao ponto de equivalência
  determinado pela estequiometria da reação. O PF
  teórico é determinado matematicamente pela região
  de inflexão da curva potenciométrica. No sistema{" "}
  <strong>
    {nomeSistema}
  </strong>
  , a assimetria da titulação faz com que PE e PF
  não precisem coincidir.
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

  <small>
    {
      proporcaoEstequiometrica
    }
  </small>
</article>


  <article>
    <span>
      PF teórico — 1ª derivada
    </span>

    <strong>
      {formatarNumero(
        resultado
          .volumePFPrimeiraDerivadaMl,
        3
      )}{" "}
      mL
    </strong>

    <small>
      VPF − VPE ={" "}
      {formatarNumero(
        erroAbsolutoPrimeira,
        3
      )}{" "}
      mL
    </small>
  </article>


  <article>
    <span>
      Erro relativo — 1ª derivada
    </span>

    <strong>
      {formatarNumero(
        erroRelativoPrimeira,
        4
      )}
      %
    </strong>

    <small>
      ((VPF − VPE) / VPE) × 100
    </small>
  </article>


  <article>
    <span>
      PF teórico — 2ª derivada
    </span>

    <strong>
      {resultado
        .volumePFSegundaDerivadaMl !==
      null
        ? `${formatarNumero(
            resultado
              .volumePFSegundaDerivadaMl,
            3
          )} mL`
        : "Não localizado"}
    </strong>

    {erroAbsolutoSegunda !==
      null && (
      <small>
        VPF − VPE ={" "}
        {formatarNumero(
          erroAbsolutoSegunda,
          3
        )}{" "}
        mL
      </small>
    )}
  </article>


  <article>
    <span>
      Erro relativo — 2ª derivada
    </span>

    <strong>
      {erroRelativoSegunda !==
      null
        ? `${formatarNumero(
            erroRelativoSegunda,
            4
          )}%`
        : "—"}
    </strong>

    <small>
      ((VPF − VPE) / VPE) × 100
    </small>
  </article>


  <article>
    <span>
      Máximo de ΔE/ΔV
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
      ΔE / ΔV
    </h4>

    <p>
  A primeira derivada é calculada entre pontos
  consecutivos da curva E × V e associada ao
  volume médio de cada intervalo. Ao redor do
  maior valor discreto, três pontos são usados
  em uma interpolação parabólica para determinar
  com maior precisão o máximo de ΔE/ΔV e,
  consequentemente, o PF teórico.
</p>
  </header>


  <GraficoDerivada
    pontos={
      pontosPrimeira
    }
    tituloEixoY="ΔE/ΔV (V·mL⁻¹)"
    volumeEquivalenciaMl={
      volumeEquivalenciaMl
    }
    volumeDestaque={
      resultado
        .volumePFPrimeiraDerivadaMl
    }
    valorDestaque={
      resultado
        .valorMaximoPrimeiraDerivada
    }
    rotuloDestaque="PF — 1ª derivada"
  />
</div>
  
  
<div className="oxirreducaoDerivativeSection">
  <header>
    <span>
      2ª derivada
    </span>

    <h4>
      Δ²E / ΔV²
    </h4>

    <p>
  A segunda derivada é a derivada da curva local
  ajustada para ΔE/ΔV. Por isso, seu cruzamento por
  zero ocorre exatamente no mesmo volume em que a
  primeira derivada atinge o máximo. Os dois métodos
  representam o mesmo ponto de inflexão e, portanto,
  o mesmo PF teórico.
</p>
  </header>


  <GraficoDerivada
    pontos={
      pontosSegunda
    }
    tituloEixoY="Δ²E/ΔV² (V·mL⁻²)"
    volumeEquivalenciaMl={
      volumeEquivalenciaMl
    }
    centralizarEmZero
    volumeDestaque={
      resultado
        .volumePFSegundaDerivadaMl
    }
    valorDestaque={
      resultado
        .volumePFSegundaDerivadaMl !==
      null
        ? 0
        : null
    }
    rotuloDestaque="PF — 2ª derivada"
  />
</div>
  
  
<div className="oxirreducaoEducationalNote">
  <strong>
    Como interpretar
  </strong>

  <p>
    A linha vertical tracejada representa o PE
    estequiométrico. O máximo da primeira derivada e o
    zero da segunda derivada representam o mesmo ponto
    de inflexão e, portanto, devem fornecer o mesmo PF.
    PE e PF, por outro lado, podem apresentar volumes
    diferentes em curvas redox assimétricas. O erro
    relativo é calculado por ((VPF − VPE) / VPE) × 100.
  </p>
</div>
      </section>
    );
  }