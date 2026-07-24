"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calcularPontoCurvaTitulacaoRetorno,
  gerarCurvaTitulacaoRetorno,
} from "@/lib/precipitacao/calculosCurvaTitulacaoRetorno";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/tipos";

import AnalisesRetornoTabs from "./AnalisesRetornoTabs";

type GraficosProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

function converterNumeroBR(valor: string) {
  const texto = valor.trim();

  if (!texto) {
    return NaN;
  }

  return Number(
    texto.includes(",")
      ? texto
          .replace(/\./g, "")
          .replace(",", ".")
      : texto
  );
}

export default function Graficos({
  resultado,
}: GraficosProps) {
  const curva = useMemo(
    () =>
      gerarCurvaTitulacaoRetorno({
        resultado,
        passo: 0.25,
      }),
    [resultado]
  );

  const volumePontoFinal =
    curva.volumePontoFinalRetorno;

  const [volumeConsulta, setVolumeConsulta] =
    useState(volumePontoFinal);

  const [volumeDigitado, setVolumeDigitado] =
    useState(
      Number.isFinite(volumePontoFinal)
        ? formatarNumeroBR(
            volumePontoFinal,
            2
          )
        : ""
    );

  const [erroConsulta, setErroConsulta] =
    useState("");

  /*
   * Não utilize:
   *
   * useRef<SVGGElement | null>(null)
   *
   * porque a versão atual dos tipos React do projeto
   * pode gerar incompatibilidade no atributo ref.
   */
  const conteudoGraficoRef =
    useRef<SVGGElement>(null);

  useEffect(() => {
    setVolumeConsulta(
      volumePontoFinal
    );

    setVolumeDigitado(
      Number.isFinite(volumePontoFinal)
        ? formatarNumeroBR(
            volumePontoFinal,
            2
          )
        : ""
    );

    setErroConsulta("");
  }, [volumePontoFinal]);

  const pontoConsulta = useMemo(
    () =>
      calcularPontoCurvaTitulacaoRetorno(
        resultado,
        volumeConsulta
      ),
    [resultado, volumeConsulta]
  );

  const pontosValidos =
    curva.pontos.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.pPrecipitante
        )
    );

  const valoresP =
    pontosValidos.map(
      (ponto) =>
        ponto.pPrecipitante
    );

  const menorPBruto =
    valoresP.length > 0
      ? Math.min(...valoresP)
      : 0;

  const maiorPBruto =
    valoresP.length > 0
      ? Math.max(...valoresP)
      : 14;

  const amplitudeBruta =
    maiorPBruto -
    menorPBruto;

  const margemEscalaP =
    Math.max(
      amplitudeBruta * 0.08,
      0.25
    );

  const menorP =
    Math.floor(
      (
        menorPBruto -
        margemEscalaP
      ) * 2
    ) / 2;

  const maiorP =
    Math.ceil(
      (
        maiorPBruto +
        margemEscalaP
      ) * 2
    ) / 2;

  const amplitudeP =
    maiorP - menorP || 1;

  const volumeMaximo =
    Number.isFinite(
      curva.volumeMaximo
    ) &&
    curva.volumeMaximo > 0
      ? curva.volumeMaximo
      : Math.max(
          resultado.volumeTitulanteRetorno *
            1.6,
          1
        );

  const larguraGrafico = 900;
  const alturaGrafico = 500;

  const margemEsquerda = 62;
  const margemDireita = 24;
  const margemSuperior = 112;
  const margemInferior = 52;

  const larguraUtil =
    larguraGrafico -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    alturaGrafico -
    margemSuperior -
    margemInferior;

  function converterVolumeEmX(
    volume: number
  ) {
    return (
      margemEsquerda +
      (
        volume /
        volumeMaximo
      ) *
        larguraUtil
    );
  }

  function converterPEmY(
    valorP: number
  ) {
    return (
      margemSuperior +
      (
        (
          maiorP -
          valorP
        ) /
        amplitudeP
      ) *
        alturaUtil
    );
  }

  const caminhoCurva =
    pontosValidos
      .map(
        (
          ponto,
          indice
        ) => {
          const x =
            converterVolumeEmX(
              ponto.volumeAdicionado
            );

          const y =
            converterPEmY(
              ponto.pPrecipitante
            );

          return `${
            indice === 0
              ? "M"
              : "L"
          } ${x} ${y}`;
        }
      )
      .join(" ");

  const numeroDivisoesX = 5;
  const numeroDivisoesY = 6;

  const marcacoesXInternas =
    Array.from(
      {
        length:
          numeroDivisoesX - 1,
      },
      (_, indice) =>
        (
          volumeMaximo /
          numeroDivisoesX
        ) *
        (indice + 1)
    );

  const marcacoesYInternas =
    Array.from(
      {
        length:
          numeroDivisoesY - 1,
      },
      (_, indice) =>
        maiorP -
        (
          amplitudeP /
          numeroDivisoesY
        ) *
          (indice + 1)
    );

  const xPontoFinal =
    converterVolumeEmX(
      volumePontoFinal
    );

  const xConsulta =
    converterVolumeEmX(
      volumeConsulta
    );

  const yConsulta =
    Number.isFinite(
      pontoConsulta.pPrecipitante
    )
      ? converterPEmY(
          pontoConsulta.pPrecipitante
        )
      : null;

  const interpretacaoRegiao =
    pontoConsulta.regiao ===
    "Antes do retorno"
      ? "Antes do ponto final, ainda existe Ag⁺ em excesso na solução. O SCN⁻ adicionado é predominantemente consumido na formação de AgSCN(s), e a concentração livre de Ag⁺ diminui progressivamente."
      : pontoConsulta.regiao ===
          "No ponto final do retorno"
        ? "No ponto final da retrotitulação, a quantidade adicionada de SCN⁻ corresponde estequiometricamente à quantidade de Ag⁺ que permaneceu em excesso após a precipitação do analito."
        : pontoConsulta.regiao ===
            "Após o retorno"
          ? "Após o ponto final, o Ag⁺ em excesso já foi consumido. O SCN⁻ adicionado passa a permanecer em excesso na solução."
          : "Não foi possível interpretar este ponto com os dados informados.";

  function consultarPonto(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const volumeNumerico =
      converterNumeroBR(
        volumeDigitado
      );

    if (
      !Number.isFinite(
        volumeNumerico
      ) ||
      volumeNumerico < 0
    ) {
      setErroConsulta(
        "Informe um volume válido, igual ou maior que zero."
      );

      return;
    }

    if (
      volumeNumerico >
      volumeMaximo
    ) {
      setErroConsulta(
        `O volume deve estar entre 0 e ${formatarNumeroBR(
          volumeMaximo,
          2
        )} mL.`
      );

      return;
    }

    setVolumeConsulta(
      volumeNumerico
    );

    setErroConsulta("");
  }

  function irParaPontoFinal() {
    setVolumeConsulta(
      volumePontoFinal
    );

    setVolumeDigitado(
      formatarNumeroBR(
        volumePontoFinal,
        2
      )
    );

    setErroConsulta("");
  }

  function baixarGrafico() {
    const conteudoGrafico =
      conteudoGraficoRef.current;

    if (!conteudoGrafico) {
      return;
    }

    const areaOcupada =
      conteudoGrafico.getBBox();

    if (
      areaOcupada.width <= 0 ||
      areaOcupada.height <= 0
    ) {
      return;
    }

    const namespaceSvg =
      "http://www.w3.org/2000/svg";

    const margemExportacao = 18;
    const alturaCabecalho = 104;
    const alturaRodape = 34;

    const viewBoxX =
      areaOcupada.x -
      margemExportacao;

    const viewBoxY =
      areaOcupada.y -
      alturaCabecalho -
      margemExportacao;

    const viewBoxLargura =
      areaOcupada.width +
      margemExportacao * 2;

    const viewBoxAltura =
      areaOcupada.height +
      alturaCabecalho +
      alturaRodape +
      margemExportacao * 2;

    const svgExportacao =
      document.createElementNS(
        namespaceSvg,
        "svg"
      );

    svgExportacao.setAttribute(
      "xmlns",
      namespaceSvg
    );

    svgExportacao.setAttribute(
      "viewBox",
      `${viewBoxX} ${viewBoxY} ${viewBoxLargura} ${viewBoxAltura}`
    );

    svgExportacao.setAttribute(
      "width",
      String(viewBoxLargura)
    );

    svgExportacao.setAttribute(
      "height",
      String(viewBoxAltura)
    );

    const fundo =
      document.createElementNS(
        namespaceSvg,
        "rect"
      );

    fundo.setAttribute(
      "x",
      String(viewBoxX)
    );

    fundo.setAttribute(
      "y",
      String(viewBoxY)
    );

    fundo.setAttribute(
      "width",
      String(viewBoxLargura)
    );

    fundo.setAttribute(
      "height",
      String(viewBoxAltura)
    );

    fundo.setAttribute(
      "fill",
      "#ffffff"
    );

    function criarTexto({
      texto,
      x,
      y,
      classe,
    }: {
      texto: string;
      x: number;
      y: number;
      classe: string;
    }) {
      const elemento =
        document.createElementNS(
          namespaceSvg,
          "text"
        );

      elemento.setAttribute(
        "x",
        String(x)
      );

      elemento.setAttribute(
        "y",
        String(y)
      );

      elemento.setAttribute(
        "class",
        classe
      );

      elemento.textContent =
        texto;

      return elemento;
    }

    const titulo =
      criarTexto({
        texto:
          "Curva da Titulação por Retorno — Volhard",
        x: areaOcupada.x,
        y: areaOcupada.y - 82,
        classe:
          "precipitacaoChartExportTitle",
      });

    const identificacao =
      criarTexto({
        texto:
          "Excesso: Ag⁺  •  Titulante de retorno: SCN⁻",
        x: areaOcupada.x,
        y: areaOcupada.y - 57,
        classe:
          "precipitacaoChartExportMetadata",
      });

    const pontoMarcado =
      criarTexto({
        texto:
          `Ponto marcado: ${formatarNumeroBR(
            volumeConsulta,
            2
          )} mL  •  pAg⁺: ${formatarNumeroBR(
            pontoConsulta.pPrecipitante,
            3
          )}`,
        x: areaOcupada.x,
        y: areaOcupada.y - 36,
        classe:
          "precipitacaoChartExportMetadata",
      });

    const regiao =
      criarTexto({
        texto:
          `Região da curva: ${pontoConsulta.regiao}`,
        x: areaOcupada.x,
        y: areaOcupada.y - 16,
        classe:
          "precipitacaoChartExportMetadata",
      });

    const rodape =
      criarTexto({
        texto:
          "Gerado pelo AnalitCalc",
        x:
          areaOcupada.x +
          areaOcupada.width,
        y:
          areaOcupada.y +
          areaOcupada.height +
          28,
        classe:
          "precipitacaoChartExportFooter",
      });

    rodape.setAttribute(
      "text-anchor",
      "end"
    );

    const estilos =
      document.createElementNS(
        namespaceSvg,
        "style"
      );

    estilos.textContent = `
      .precipitacaoChartGridLine {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .precipitacaoChartAxis {
        stroke: #71717a;
        stroke-width: 1.5;
      }

      .precipitacaoChartCurve {
        fill: none;
        stroke: #991b1b;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .precipitacaoChartPELine {
        stroke: #b45309;
        stroke-width: 2;
        stroke-dasharray: 7 7;
      }

      .precipitacaoChartPELabel {
        fill: #92400e;
        font-size: 13px;
        font-weight: 900;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartConsultLine {
        stroke: #3f3f46;
        stroke-width: 1.5;
        stroke-dasharray: 4 5;
      }

      .precipitacaoChartPoint {
        fill: #ffffff;
        stroke: #18181b;
        stroke-width: 3;
      }

      .precipitacaoChartAxisLabel {
        fill: #3f3f46;
        font-size: 13px;
        font-weight: 700;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartTick {
        fill: #71717a;
        font-size: 12px;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartLegendBackground {
        fill: #ffffff;
        stroke: #d4d4d8;
        stroke-width: 1.5;
      }

      .precipitacaoChartLegendTitle {
        fill: #18181b;
        font-size: 13px;
        font-weight: 800;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartLegendValue {
        fill: #52525b;
        font-size: 12px;
        font-weight: 600;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartExportTitle {
        fill: #18181b;
        font-size: 22px;
        font-weight: 900;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartExportMetadata {
        fill: #52525b;
        font-size: 13px;
        font-weight: 600;
        font-family: Arial, sans-serif;
      }

      .precipitacaoChartExportFooter {
        fill: #71717a;
        font-size: 11px;
        font-weight: 600;
        font-family: Arial, sans-serif;
      }
    `;

    const conteudoClonado =
      conteudoGrafico.cloneNode(
        true
      ) as SVGGElement;

    svgExportacao.appendChild(
      fundo
    );

    svgExportacao.appendChild(
      estilos
    );

    svgExportacao.appendChild(
      titulo
    );

    svgExportacao.appendChild(
      identificacao
    );

    svgExportacao.appendChild(
      pontoMarcado
    );

    svgExportacao.appendChild(
      regiao
    );

    svgExportacao.appendChild(
      conteudoClonado
    );

    svgExportacao.appendChild(
      rodape
    );

    const svgSerializado =
      new XMLSerializer()
        .serializeToString(
          svgExportacao
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
        Math.ceil(
          viewBoxLargura *
          escala
        );

      canvas.height =
        Math.ceil(
          viewBoxAltura *
          escala
        );

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

          link.href = urlPng;

          link.download =
            "curva-titulacao-retorno-volhard.png";

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

    imagem.src = urlSvg;
  }

  if (
    curva.pontos.length === 0 ||
    !Number.isFinite(
      volumePontoFinal
    )
  ) {
    return null;
  }

  return (
    <section className="precipitacaoCurveSection">
      <header className="precipitacaoResultsHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Curva da retrotitulação
          </span>

          <h3>
            Variação de pAg⁺
          </h3>

          <p>
            A curva representa a variação da
            concentração livre de Ag⁺ durante a
            adição de SCN⁻ no método de Volhard.
          </p>
        </div>

        <span className="precipitacaoWorkspaceBadge">
          Volhard
        </span>
      </header>

      <div className="precipitacaoCurveLayout">
        <div className="precipitacaoChartCard">
          <svg
            viewBox={`0 0 ${larguraGrafico} ${alturaGrafico}`}
            role="img"
            aria-label="Curva da titulação por retorno de prata com tiocianato"
          >
            <g ref={conteudoGraficoRef}>
              {marcacoesYInternas.map(
                (valorP) => {
                  const y =
                    converterPEmY(
                      valorP
                    );

                  return (
                    <g
                      key={`marcacao-y-${valorP}`}
                    >
                      <line
                        x1={
                          margemEsquerda
                        }
                        y1={y}
                        x2={
                          larguraGrafico -
                          margemDireita
                        }
                        y2={y}
                        className="precipitacaoChartGridLine"
                      />

                      <text
                        x={
                          margemEsquerda -
                          10
                        }
                        y={y + 4}
                        textAnchor="end"
                        className="precipitacaoChartTick"
                      >
                        {formatarNumeroBR(
                          valorP,
                          1
                        )}
                      </text>
                    </g>
                  );
                }
              )}

              {marcacoesXInternas.map(
                (volume) => {
                  const x =
                    converterVolumeEmX(
                      volume
                    );

                  return (
                    <g
                      key={`marcacao-x-${volume}`}
                    >
                      <line
                        x1={x}
                        y1={
                          margemSuperior
                        }
                        x2={x}
                        y2={
                          alturaGrafico -
                          margemInferior
                        }
                        className="precipitacaoChartGridLine"
                      />

                      <text
                        x={x}
                        y={
                          alturaGrafico -
                          margemInferior +
                          24
                        }
                        textAnchor="middle"
                        className="precipitacaoChartTick"
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
                x1={margemEsquerda}
                y1={margemSuperior}
                x2={margemEsquerda}
                y2={
                  alturaGrafico -
                  margemInferior
                }
                className="precipitacaoChartAxis"
              />

              <line
                x1={margemEsquerda}
                y1={
                  alturaGrafico -
                  margemInferior
                }
                x2={
                  larguraGrafico -
                  margemDireita
                }
                y2={
                  alturaGrafico -
                  margemInferior
                }
                className="precipitacaoChartAxis"
              />

              <line
                x1={xPontoFinal}
                y1={margemSuperior}
                x2={xPontoFinal}
                y2={
                  alturaGrafico -
                  margemInferior
                }
                className="precipitacaoChartPELine"
              />

              <text
                x={
                  xPontoFinal + 8
                }
                y={
                  margemSuperior +
                  16
                }
                className="precipitacaoChartPELabel"
              >
                PF
              </text>

              <path
                d={caminhoCurva}
                className="precipitacaoChartCurve"
              />

              <line
                x1={xConsulta}
                y1={margemSuperior}
                x2={xConsulta}
                y2={
                  alturaGrafico -
                  margemInferior
                }
                className="precipitacaoChartConsultLine"
              />

              {yConsulta !== null && (
                <>
                  <circle
                    cx={xConsulta}
                    cy={yConsulta}
                    r="6"
                    className="precipitacaoChartPoint"
                  />

                  <g className="precipitacaoChartLegend">
                    <rect
                      x={
                        larguraGrafico -
                        margemDireita -
                        224
                      }
                      y={18}
                      width="212"
                      height="76"
                      rx="10"
                      className="precipitacaoChartLegendBackground"
                    />

                    <text
                      x={
                        larguraGrafico -
                        margemDireita -
                        206
                      }
                      y={43}
                      className="precipitacaoChartLegendTitle"
                    >
                      Ponto consultado
                    </text>

                    <text
                      x={
                        larguraGrafico -
                        margemDireita -
                        206
                      }
                      y={64}
                      className="precipitacaoChartLegendValue"
                    >
                      Volume:{" "}
                      {formatarNumeroBR(
                        volumeConsulta,
                        2
                      )}{" "}
                      mL
                    </text>

                    <text
                      x={
                        larguraGrafico -
                        margemDireita -
                        206
                      }
                      y={83}
                      className="precipitacaoChartLegendValue"
                    >
                      pAg⁺:{" "}
                      {formatarNumeroBR(
                        pontoConsulta.pPrecipitante,
                        3
                      )}
                    </text>
                  </g>
                </>
              )}

              <text
                x={
                  larguraGrafico /
                  2
                }
                y={
                  alturaGrafico -
                  12
                }
                textAnchor="middle"
                className="precipitacaoChartAxisLabel"
              >
                Volume de SCN⁻ adicionado (mL)
              </text>

              <text
                x="18"
                y={
                  alturaGrafico /
                  2
                }
                textAnchor="middle"
                transform={`rotate(-90 18 ${alturaGrafico / 2})`}
                className="precipitacaoChartAxisLabel"
              >
                pAg⁺
              </text>

              <text
                x={margemEsquerda}
                y={
                  alturaGrafico -
                  margemInferior +
                  24
                }
                textAnchor="middle"
                className="precipitacaoChartTick"
              >
                0
              </text>

              <text
                x={
                  larguraGrafico -
                  margemDireita
                }
                y={
                  alturaGrafico -
                  margemInferior +
                  24
                }
                textAnchor="middle"
                className="precipitacaoChartTick"
              >
                {formatarNumeroBR(
                  volumeMaximo,
                  1
                )}
              </text>

              <text
                x={
                  margemEsquerda -
                  10
                }
                y={
                  margemSuperior +
                  4
                }
                textAnchor="end"
                className="precipitacaoChartTick"
              >
                {formatarNumeroBR(
                  maiorP,
                  1
                )}
              </text>

              <text
                x={
                  margemEsquerda -
                  10
                }
                y={
                  alturaGrafico -
                  margemInferior +
                  4
                }
                textAnchor="end"
                className="precipitacaoChartTick"
              >
                {formatarNumeroBR(
                  menorP,
                  1
                )}
              </text>
            </g>
          </svg>
        </div>

        <aside className="precipitacaoCurveControlCard">
          <span className="precipitacaoSectionLabel">
            Consultar ponto
          </span>

          <strong>
            {formatarNumeroBR(
              volumeConsulta,
              2
            )}{" "}
            mL
          </strong>

          <p className="precipitacaoCurveControlDescription">
            Digite o volume de SCN⁻ adicionado
            para consultar o equilíbrio químico
            desse ponto.
          </p>

          <form
            className="precipitacaoCurveSearchForm"
            onSubmit={consultarPonto}
          >
            <label htmlFor="volumeConsultaRetorno">
              Volume de SCN⁻
            </label>

            <div className="precipitacaoCurveInputGroup">
              <input
                id="volumeConsultaRetorno"
                type="text"
                inputMode="decimal"
                value={volumeDigitado}
                onChange={(
                  event
                ) => {
                  setVolumeDigitado(
                    event.target.value
                  );

                  if (erroConsulta) {
                    setErroConsulta(
                      ""
                    );
                  }
                }}
                placeholder="Ex.: 12,50"
              />

              <span>mL</span>
            </div>

            {erroConsulta && (
              <p className="precipitacaoCurveSearchError">
                {erroConsulta}
              </p>
            )}

            <button
              type="submit"
              className="precipitacaoCurveSearchButton"
            >
              Consultar ponto
            </button>
          </form>

          <button
            type="button"
            className="precipitacaoCurvePEButton"
            onClick={
              irParaPontoFinal
            }
          >
            Ir para o ponto final
          </button>

          <button
            type="button"
            className="precipitacaoCurveDownloadButton"
            onClick={baixarGrafico}
          >
            Baixar gráfico
          </button>

          <div className="precipitacaoCurveRegion">
            <span>
              Região da curva
            </span>

            <strong>
              {
                pontoConsulta.regiao
              }
            </strong>
          </div>
        </aside>
      </div>

      <div className="precipitacaoCurveDataGrid">
        <article className="precipitacaoResultCard">
          <span>pAg⁺</span>

          <strong>
            {formatarNumeroBR(
              pontoConsulta.pPrecipitante,
              3
            )}
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            [Ag⁺] livre
          </span>

          <strong>
            {formatarCientificoBR(
              pontoConsulta
                .concentracaoPrecipitanteLivre,
              3
            )}

            <small>
              {" "}
              mol/L
            </small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            [SCN⁻] livre
          </span>

          <strong>
            {formatarCientificoBR(
              pontoConsulta
                .concentracaoTitulanteRetornoLivre,
              3
            )}

            <small>
              {" "}
              mol/L
            </small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            Ag⁺ do excesso consumido
          </span>

          <strong>
            {formatarNumeroBR(
              pontoConsulta.percentualRetorno,
              2
            )}

            <small>
              {" "}
              %
            </small>
          </strong>
        </article>
      </div>

      <div className="precipitacaoResultInterpretation">
        <div className="precipitacaoResultInterpretationHeader">
          <span>
            Interpretação da região
          </span>

          <strong>
            {pontoConsulta.regiao}
          </strong>
        </div>

        <p>
          {interpretacaoRegiao}
        </p>
      </div>

      <div className="precipitacaoResultScientificNote">
        <strong>
          Leitura química da curva
        </strong>

        <p>
          O método de Volhard é realizado em meio
          ácido. O SCN⁻ reage em proporção 1:1 com
          o Ag⁺ que permaneceu em excesso após a
          precipitação do analito, formando
          AgSCN(s). A mudança acentuada de pAg⁺
          ocorre nas proximidades do ponto final
          da retrotitulação.
        </p>
      </div>

      <AnalisesRetornoTabs
        resultado={resultado}
      />
    </section>
  );
}