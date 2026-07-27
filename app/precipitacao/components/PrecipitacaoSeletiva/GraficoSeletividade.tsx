"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  gerarCurvaSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosCurvaSeletividade";

import {
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoSeletividadePrecipitacao,
} from "@/lib/precipitacao/tipos";

type GraficoSeletividadeProps = {
  resultado:
    ResultadoSeletividadePrecipitacao;

  volumeAmostra: number;

  concentracaoTitulante: number;

  volumeMaximoBureta: number;
};

export default function GraficoSeletividade({
  resultado,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
}: GraficoSeletividadeProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const curva = useMemo(
    () =>
      gerarCurvaSeletividadePrecipitacao({
        resultado,

        volumeAmostra,

        concentracaoTitulante,

        passo: 0.1,

        volumeMaximoManual:
          volumeMaximoBureta,
      }),
    [
      concentracaoTitulante,
      resultado,
      volumeAmostra,
      volumeMaximoBureta,
    ]
  );

  const largura = 940;
  const altura = 580;

  const margemEsquerda = 78;
  const margemDireita = 32;
  const margemSuperior = 48;
  const margemInferior = 72;

  const larguraUtil =
    largura -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    altura -
    margemSuperior -
    margemInferior;

  const seriesIsoladas =
    curva.seriesIsoladas;

  const pontosMistura =
    curva.serieMistura.pontos.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.pTitulante
        )
    );

  const seriesValidas =
    seriesIsoladas.map(
      (serie) => ({
        ...serie,

        pontos:
          serie.pontos.filter(
            (ponto) =>
              Number.isFinite(
                ponto.volumeAdicionado
              ) &&
              Number.isFinite(
                ponto.pTitulante
              )
          ),
      })
    );

  const todosPontos = [
    ...pontosMistura,

    ...seriesValidas.flatMap(
      (serie) =>
        serie.pontos
    ),
  ];

  if (
    todosPontos.length === 0
  ) {
    return (
      <section className="precipitacaoInterferenceGraphEmpty">
        <strong>
          Não foi possível gerar o gráfico
        </strong>

        <p>
          A curva de seletividade não retornou
          pontos válidos para os dados atuais.
        </p>
      </section>
    );
  }

  const volumeMinimo = 0;

  const volumeMaximo =
    Number.isFinite(
      curva.volumeMaximo
    ) &&
    curva.volumeMaximo > 0
      ? curva.volumeMaximo
      : Math.max(
          ...todosPontos.map(
            (ponto) =>
              ponto.volumeAdicionado
          ),
          1
        );

  const pMinimoBruto =
    Math.min(
      ...todosPontos.map(
        (ponto) =>
          ponto.pTitulante
      )
    );

  const pMaximoBruto =
    Math.max(
      ...todosPontos.map(
        (ponto) =>
          ponto.pTitulante
      )
    );

  const margemP =
    Math.max(
      (
        pMaximoBruto -
        pMinimoBruto
      ) * 0.08,
      0.25
    );

  const pMinimo =
    pMinimoBruto -
    margemP;

  const pMaximo =
    pMaximoBruto +
    margemP;

  function converterX(
    volume: number
  ) {
    return (
      margemEsquerda +
      (
        (
          volume -
          volumeMinimo
        ) /
        (
          volumeMaximo -
          volumeMinimo ||
          1
        )
      ) *
        larguraUtil
    );
  }

  function converterY(
    pTitulante: number
  ) {
    return (
      margemSuperior +
      (
        (
          pMaximo -
          pTitulante
        ) /
        (
          pMaximo -
          pMinimo ||
          1
        )
      ) *
        alturaUtil
    );
  }

  function criarCaminho(
    pontos: Array<{
      volumeAdicionado: number;
      pTitulante: number;
    }>
  ) {
    return pontos
      .map(
        (
          ponto,
          indice
        ) =>
          `${
            indice === 0
              ? "M"
              : "L"
          } ${converterX(
            ponto.volumeAdicionado
          )} ${converterY(
            ponto.pTitulante
          )}`
      )
      .join(" ");
  }

  const marcacoesX =
    Array.from(
      { length: 6 },
      (_, indice) =>
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
      { length: 6 },
      (_, indice) =>
        pMaximo -
        (
          (
            pMaximo -
            pMinimo
          ) /
          5
        ) *
          indice
    );

  function baixarGrafico() {
    const grafico =
      graficoRef.current;

    if (!grafico) {
      return;
    }

    const namespaceSvg =
      "http://www.w3.org/2000/svg";

    const clone =
      grafico.cloneNode(
        true
      ) as SVGSVGElement;

    clone.setAttribute(
      "xmlns",
      namespaceSvg
    );

    clone.setAttribute(
      "width",
      String(largura)
    );

    clone.setAttribute(
      "height",
      String(altura)
    );

    const fundo =
      document.createElementNS(
        namespaceSvg,
        "rect"
      );

    fundo.setAttribute(
      "x",
      "0"
    );

    fundo.setAttribute(
      "y",
      "0"
    );

    fundo.setAttribute(
      "width",
      String(largura)
    );

    fundo.setAttribute(
      "height",
      String(altura)
    );

    fundo.setAttribute(
      "fill",
      "#ffffff"
    );

    const estilos =
      document.createElementNS(
        namespaceSvg,
        "style"
      );

    estilos.textContent = `
      text {
        font-family: Arial, sans-serif;
      }

      .selectivityGraphGrid {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .selectivityGraphAxis {
        stroke: #71717a;
        stroke-width: 1.4;
      }

      .selectivityGraphMixture {
        fill: none;
        stroke: #a1a1aa;
        stroke-width: 3.4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .selectivityGraphSeriesPrimary {
        fill: none;
        stroke: #2563eb;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .selectivityGraphSeriesSecondary {
        fill: none;
        stroke: #dc2626;
        stroke-width: 3;
        stroke-dasharray: 8 6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .selectivityGraphSeriesOther {
        fill: none;
        stroke: #7c3aed;
        stroke-width: 2.5;
        stroke-dasharray: 4 5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .selectivityGraphStartPrimary {
        stroke: #2563eb;
        stroke-width: 1.8;
        stroke-dasharray: 5 5;
      }

      .selectivityGraphStartSecondary {
        stroke: #dc2626;
        stroke-width: 1.8;
        stroke-dasharray: 5 5;
      }

      .selectivityGraphStartOther {
        stroke: #7c3aed;
        stroke-width: 1.6;
        stroke-dasharray: 4 5;
      }

      .selectivityGraphTick {
        fill: #71717a;
        font-size: 11px;
      }

      .selectivityGraphLabel {
        fill: #18181b;
        font-size: 12px;
        font-weight: 700;
      }

      .selectivityGraphPrimaryLabel {
        fill: #1d4ed8;
        font-size: 12px;
        font-weight: 900;
      }

      .selectivityGraphSecondaryLabel {
        fill: #b91c1c;
        font-size: 12px;
        font-weight: 900;
      }

      .selectivityGraphOtherLabel {
        fill: #6d28d9;
        font-size: 12px;
        font-weight: 800;
      }
    `;

    clone.prepend(
      estilos
    );

    clone.prepend(
      fundo
    );

    const svgSerializado =
      new XMLSerializer()
        .serializeToString(
          clone
        );

    const arquivoSvg =
      new Blob(
        [svgSerializado],
        {
          type:
            "image/svg+xml;charset=utf-8",
        }
      );

    const urlSvg =
      URL.createObjectURL(
        arquivoSvg
      );

    const imagem =
      new Image();

    imagem.onload = () => {
      const escala = 2;

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        largura * escala;

      canvas.height =
        altura * escala;

      const contexto =
        canvas.getContext("2d");

      if (!contexto) {
        URL.revokeObjectURL(
          urlSvg
        );

        return;
      }

      contexto.fillStyle =
        "#ffffff";

      contexto.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      contexto.drawImage(
        imagem,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (arquivoPng) => {
          if (!arquivoPng) {
            URL.revokeObjectURL(
              urlSvg
            );

            return;
          }

          const urlPng =
            URL.createObjectURL(
              arquivoPng
            );

          const link =
            document.createElement(
              "a"
            );

          link.href =
            urlPng;

          link.download =
            "curva-precipitacao-seletiva.png";

          document.body.appendChild(
            link
          );

          link.click();
          link.remove();

          URL.revokeObjectURL(
            urlPng
          );

          URL.revokeObjectURL(
            urlSvg
          );
        },
        "image/png",
        1
      );
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(
        urlSvg
      );
    };

    imagem.src =
      urlSvg;
  }

  return (
    <section className="precipitacaoInterferenceGraphCard">
      <header>
        <div>
          <span className="precipitacaoSectionLabel">
            Curvas de precipitação seletiva
          </span>

          <h6>
            Sistemas isolados × mistura
          </h6>

          <p>
            O gráfico compara as curvas calculadas
            para cada precipitado isolado com o
            comportamento da mistura durante a
            adição de {curva.formulaTitulante}.
          </p>
        </div>

        <button
          type="button"
          className="precipitacaoInterferenceDownloadButton"
          onClick={baixarGrafico}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>

          Baixar PNG
        </button>
      </header>

      <svg
        ref={graficoRef}
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Curvas calculadas de precipitação seletiva"
      >
        {marcacoesY.map(
          (valor) => {
            const y =
              converterY(
                valor
              );

            return (
              <g
                key={`y-${valor}`}
              >
                <line
                  x1={
                    margemEsquerda
                  }
                  y1={y}
                  x2={
                    largura -
                    margemDireita
                  }
                  y2={y}
                  className="selectivityGraphGrid"
                />

                <text
                  x={
                    margemEsquerda -
                    12
                  }
                  y={y + 4}
                  textAnchor="end"
                  className="selectivityGraphTick"
                >
                  {formatarNumeroBR(
                    valor,
                    2
                  )}
                </text>
              </g>
            );
          }
        )}

        {marcacoesX.map(
          (volume) => {
            const x =
              converterX(
                volume
              );

            return (
              <g
                key={`x-${volume}`}
              >
                <line
                  x1={x}
                  y1={
                    margemSuperior
                  }
                  x2={x}
                  y2={
                    altura -
                    margemInferior
                  }
                  className="selectivityGraphGrid"
                />

                <text
                  x={x}
                  y={
                    altura -
                    margemInferior +
                    25
                  }
                  textAnchor="middle"
                  className="selectivityGraphTick"
                >
                  {formatarNumeroBR(
                    volume,
                    1
                  )}
                </text>
              </g>
            );
          }
        )}

        <line
          x1={
            margemEsquerda
          }
          y1={
            margemSuperior
          }
          x2={
            margemEsquerda
          }
          y2={
            altura -
            margemInferior
          }
          className="selectivityGraphAxis"
        />

        <line
          x1={
            margemEsquerda
          }
          y1={
            altura -
            margemInferior
          }
          x2={
            largura -
            margemDireita
          }
          y2={
            altura -
            margemInferior
          }
          className="selectivityGraphAxis"
        />

        {seriesValidas.map(
          (
            serie,
            indice
          ) => {
            const volumeInicioValido =
              Number.isFinite(
                serie.volumeInicio
              );

            const classeLinhaInicio =
              indice === 0
                ? "selectivityGraphStartPrimary"
                : indice === 1
                  ? "selectivityGraphStartSecondary"
                  : "selectivityGraphStartOther";

            const classeRotulo =
              indice === 0
                ? "selectivityGraphPrimaryLabel"
                : indice === 1
                  ? "selectivityGraphSecondaryLabel"
                  : "selectivityGraphOtherLabel";

            return (
              <g
                key={`inicio-${serie.sal.id}`}
              >
                {volumeInicioValido && (
                  <>
                    <line
                      x1={converterX(
                        serie.volumeInicio
                      )}
                      y1={
                        margemSuperior
                      }
                      x2={converterX(
                        serie.volumeInicio
                      )}
                      y2={
                        altura -
                        margemInferior
                      }
                      className={
                        classeLinhaInicio
                      }
                    />

                    <text
                      x={
                        converterX(
                          serie.volumeInicio
                        ) + 7
                      }
                      y={
                        margemSuperior +
                        18 +
                        indice * 20
                      }
                      className={
                        classeRotulo
                      }
                    >
                      Início{" "}
                      {
                        serie.sal
                          .formulaExibicao
                      }
                    </text>
                  </>
                )}
              </g>
            );
          }
        )}

        <path
          d={criarCaminho(
            pontosMistura
          )}
          className="selectivityGraphMixture"
        />

        {seriesValidas.map(
          (
            serie,
            indice
          ) => (
            <path
              key={
                serie.sal.id
              }
              d={criarCaminho(
                serie.pontos
              )}
              className={
                indice === 0
                  ? "selectivityGraphSeriesPrimary"
                  : indice === 1
                    ? "selectivityGraphSeriesSecondary"
                    : "selectivityGraphSeriesOther"
              }
            />
          )
        )}

        <text
          x={
            largura / 2
          }
          y={
            altura - 15
          }
          textAnchor="middle"
          className="selectivityGraphLabel"
        >
          Volume de{" "}
          {curva.formulaTitulante}{" "}
          adicionado (mL)
        </text>

        <text
          x="20"
          y={
            altura / 2
          }
          textAnchor="middle"
          transform={`rotate(-90 20 ${altura / 2})`}
          className="selectivityGraphLabel"
        >
          p{curva.formulaTitulante}
        </text>
      </svg>

      <footer className="precipitacaoInterferenceLegend">
        <span>
          <i className="precipitacaoInterferenceLegendMixture" />
          Mistura completa
        </span>

        {seriesValidas.map(
          (
            serie,
            indice
          ) => (
            <span
              key={
                serie.sal.id
              }
            >
              <i
                className={
                  indice === 0
                    ? "precipitacaoInterferenceLegendMain"
                    : "precipitacaoInterferenceLegendCompetitor"
                }
              />

              {
                serie.sal
                  .formulaExibicao
              }{" "}
              isolado
            </span>
          )
        )}
      </footer>

      <div className="precipitacaoResultScientificNote">
        <strong>
          Leitura do gráfico
        </strong>

        <p>
          As linhas verticais indicam o início
          calculado da formação de cada precipitado.
          Quanto maior a distância entre esses
          inícios, maior tende a ser a possibilidade
          de precipitação seletiva. Entretanto, a
          confirmação de separação quantitativa
          depende também da fração precipitada antes
          do início do sistema seguinte.
        </p>
      </div>
    </section>
  );
}