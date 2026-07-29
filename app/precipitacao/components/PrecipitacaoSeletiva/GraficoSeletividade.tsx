"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  avaliarPontoSeletividadePrecipitacao,
  gerarCurvaSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosCurvaSeletividade";

import type {
  AvaliacaoPontoSeletividadePrecipitacao,
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

type PontoGraficoSeletividade = {
  volumeAdicionado: number;
  pTitulante: number;
};

export default function GraficoSeletividade({
  resultado,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
}: GraficoSeletividadeProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

    const [
      volumeConsulta,
      setVolumeConsulta,
    ] = useState("");
  
    const [
      avaliacaoPonto,
      setAvaliacaoPonto,
    ] =
      useState<AvaliacaoPontoSeletividadePrecipitacao | null>(
        null
      );
  
    const [
      erroConsulta,
      setErroConsulta,
    ] = useState<string | null>(
      null
    );

  const curva =
    useMemo(
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

  /*
   * Garante que as cores e a legenda sigam a ordem
   * real de precipitação, e não apenas a ordem interna
   * das séries produzidas pelo cálculo da curva.
   */
  const ordemPorSal =
    useMemo(() => {
      return new Map(
        resultado.itens.map(
          (item) => [
            item.sal.id,
            item.ordemPrecipitacao,
          ]
        )
      );
    }, [resultado.itens]);

  const seriesValidas =
    useMemo(() => {
      return curva.seriesIsoladas
        .map(
          (serie) => ({
            ...serie,
            pontos:
              serie.pontos
                .filter(
                  (ponto) =>
                    Number.isFinite(
                      ponto.volumeAdicionado
                    ) &&
                    Number.isFinite(
                      ponto.pTitulante
                    )
                )
                .sort(
                  (
                    pontoA,
                    pontoB
                  ) =>
                    pontoA.volumeAdicionado -
                    pontoB.volumeAdicionado
                ),
          })
        )
        .filter(
          (serie) =>
            serie.pontos.length >
            0
        )
        .sort(
          (
            serieA,
            serieB
          ) => {
            const ordemA =
              ordemPorSal.get(
                serieA.sal.id
              ) ??
              Number.MAX_SAFE_INTEGER;

            const ordemB =
              ordemPorSal.get(
                serieB.sal.id
              ) ??
              Number.MAX_SAFE_INTEGER;

            return ordemA - ordemB;
          }
        );
    }, [
      curva.seriesIsoladas,
      ordemPorSal,
    ]);

  const pontosMistura =
    useMemo(
      () =>
        curva.serieMistura.pontos
          .filter(
            (ponto) =>
              Number.isFinite(
                ponto.volumeAdicionado
              ) &&
              Number.isFinite(
                ponto.pTitulante
              )
          )
          .sort(
            (
              pontoA,
              pontoB
            ) =>
              pontoA.volumeAdicionado -
              pontoB.volumeAdicionado
          ),
      [curva.serieMistura.pontos]
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
        <div>
          <strong>
            Não foi possível gerar o gráfico
          </strong>

          <p>
            A curva de seletividade não retornou
            pontos válidos para os dados atuais.
          </p>
        </div>
      </section>
    );
  }

  const volumeMinimo = 0;

  const maiorVolumeCalculado =
    Math.max(
      ...todosPontos.map(
        (ponto) =>
          ponto.volumeAdicionado
      ),
      1
    );

  const volumeMaximo =
    Number.isFinite(
      curva.volumeMaximo
    ) &&
    curva.volumeMaximo > 0
      ? Math.max(
          curva.volumeMaximo,
          maiorVolumeCalculado
        )
      : maiorVolumeCalculado;

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

  const intervaloP =
    pMaximoBruto -
    pMinimoBruto;

  const margemP =
    Math.max(
      intervaloP * 0.08,
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
    const intervaloVolume =
      volumeMaximo -
      volumeMinimo;

    return (
      margemEsquerda +
      (
        (
          volume -
          volumeMinimo
        ) /
        (
          intervaloVolume ||
          1
        )
      ) *
        larguraUtil
    );
  }

  function converterY(
    pTitulante: number
  ) {
    const intervalo =
      pMaximo -
      pMinimo;

    return (
      margemSuperior +
      (
        (
          pMaximo -
          pTitulante
        ) /
        (
          intervalo ||
          1
        )
      ) *
        alturaUtil
    );
  }

  function criarCaminho(
    pontos:
      PontoGraficoSeletividade[]
  ) {
    if (
      pontos.length === 0
    ) {
      return "";
    }

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

  function obterVolumeInicioSerie(
    salId: string
  ): number | null {
    /*
     * Primeiro tenta localizar o volume na comparação
     * calculada da mistura. Esse é o volume mais
     * representativo para a precipitação seletiva.
     */
    const comparacaoComoSegundo =
      curva.comparacoesKps.find(
        (comparacao) =>
          comparacao.segundoSal.id ===
          salId
      );

    if (
      comparacaoComoSegundo &&
      comparacaoComoSegundo
        .volumeInicioSegundo !==
        null &&
      Number.isFinite(
        comparacaoComoSegundo
          .volumeInicioSegundo
      )
    ) {
      return (
        comparacaoComoSegundo
          .volumeInicioSegundo
      );
    }

    /*
     * Para o primeiro precipitado, ou quando não houver
     * comparação correspondente, utiliza-se o início
     * calculado da série isolada.
     */
    const serie =
      seriesValidas.find(
        (item) =>
          item.sal.id === salId
      );

    if (
      serie &&
      Number.isFinite(
        serie.volumeInicio
      )
    ) {
      return serie.volumeInicio;
    }

    return null;
  }

  const duasPrimeirasSeries =
  seriesValidas.slice(
    0,
    2
  );

const primeiraSerie =
  duasPrimeirasSeries[0] ??
  null;

const segundaSerie =
  duasPrimeirasSeries[1] ??
  null;

const volumeInicioPrimeiro =
  primeiraSerie
    ? obterVolumeInicioSerie(
        primeiraSerie.sal.id
      )
    : null;

const volumeInicioSegundo =
  segundaSerie
    ? obterVolumeInicioSerie(
        segundaSerie.sal.id
      )
    : null;

const intervaloSeletivoValido =
  volumeInicioPrimeiro !== null &&
  volumeInicioSegundo !== null &&
  Number.isFinite(
    volumeInicioPrimeiro
  ) &&
  Number.isFinite(
    volumeInicioSegundo
  ) &&
  volumeInicioPrimeiro >=
    volumeMinimo &&
  volumeInicioSegundo <=
    volumeMaximo &&
  volumeInicioSegundo >
    volumeInicioPrimeiro;

const deltaVolumeSeletivo =
  intervaloSeletivoValido
    ? volumeInicioSegundo -
      volumeInicioPrimeiro
    : null;

const xInicioIntervalo =
  intervaloSeletivoValido
    ? converterX(
        volumeInicioPrimeiro
      )
    : null;

const xFimIntervalo =
  intervaloSeletivoValido
    ? converterX(
        volumeInicioSegundo
      )
    : null;

const larguraIntervalo =
  xInicioIntervalo !== null &&
  xFimIntervalo !== null
    ? xFimIntervalo -
      xInicioIntervalo
    : null;

    const marcadorConsultaValido =
    avaliacaoPonto !== null &&
    avaliacaoPonto
      .dentroIntervaloCalculado &&
    avaliacaoPonto.pTitulante !==
      null &&
    Number.isFinite(
      avaliacaoPonto.pTitulante
    ) &&
    avaliacaoPonto
      .volumeAdicionado >=
      volumeMinimo &&
    avaliacaoPonto
      .volumeAdicionado <=
      volumeMaximo &&
    avaliacaoPonto.pTitulante >=
      pMinimo &&
    avaliacaoPonto.pTitulante <=
      pMaximo;

  const xMarcadorConsulta =
    marcadorConsultaValido &&
    avaliacaoPonto
      ? converterX(
          avaliacaoPonto
            .volumeAdicionado
        )
      : null;

  const yMarcadorConsulta =
    marcadorConsultaValido &&
    avaliacaoPonto &&
    avaliacaoPonto.pTitulante !==
      null
      ? converterY(
          avaliacaoPonto
            .pTitulante
        )
      : null;

  const marcacoesX =
    Array.from(
      {
        length: 6,
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
        length: 6,
      },
      (
        _,
        indice
      ) =>
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

  function obterClasseSerie(
    indice: number
  ) {
    if (
      indice === 0
    ) {
      return "selectivityGraphSeriesPrimary";
    }

    if (
      indice === 1
    ) {
      return "selectivityGraphSeriesSecondary";
    }

    return "selectivityGraphSeriesOther";
  }

  function obterClasseInicio(
    indice: number
  ) {
    if (
      indice === 0
    ) {
      return "selectivityGraphStartPrimary";
    }

    if (
      indice === 1
    ) {
      return "selectivityGraphStartSecondary";
    }

    return "selectivityGraphStartOther";
  }

  function obterClasseRotulo(
    indice: number
  ) {
    if (
      indice === 0
    ) {
      return "selectivityGraphPrimaryLabel";
    }

    if (
      indice === 1
    ) {
      return "selectivityGraphSecondaryLabel";
    }

    return "selectivityGraphOtherLabel";
  }

  function obterClasseLegenda(
    indice: number
  ) {
    if (
      indice === 0
    ) {
      return "precipitacaoSelectivityLegendPrimary";
    }

    if (
      indice === 1
    ) {
      return "precipitacaoSelectivityLegendSecondary";
    }

    return "precipitacaoSelectivityLegendOther";
  }

  function converterTextoParaNumero(
    valor: string
  ) {
    const textoNormalizado =
      valor
        .trim()
        .replace(/\s/g, "")
        .replace(",", ".");

    if (
      textoNormalizado === ""
    ) {
      return NaN;
    }

    return Number(
      textoNormalizado
    );
  }

  function avaliarVolumeConsultado() {
    const volume =
      converterTextoParaNumero(
        volumeConsulta
      );

    if (
      !Number.isFinite(volume) ||
      volume < 0
    ) {
      setAvaliacaoPonto(
        null
      );

      setErroConsulta(
        "Informe um volume válido, maior ou igual a zero."
      );

      return;
    }

    const avaliacao =
      avaliarPontoSeletividadePrecipitacao({
        resultado,
        volumeAdicionado:
          volume,
        volumeAmostra,
        concentracaoTitulante,
        volumeMaximoAvaliado:
          volumeMaximo,
      });

    if (
      avaliacao.status !==
      "adequado"
    ) {
      setAvaliacaoPonto(
        null
      );

      setErroConsulta(
        avaliacao.mensagemErro ??
          "Não foi possível avaliar o ponto informado."
      );

      return;
    }

    setErroConsulta(null);
    setAvaliacaoPonto(
      avaliacao
    );
  }

  function tratarTeclaConsulta(
    evento:
      React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      evento.key === "Enter"
    ) {
      evento.preventDefault();
      avaliarVolumeConsultado();
    }
  }

  function obterRotuloEstado(
    estado:
      | "nao_iniciada"
      | "inicio"
      | "em_precipitacao"
      | "majoritariamente_precipitada"
      | "praticamente_completa"
  ) {
    if (
      estado ===
      "nao_iniciada"
    ) {
      return "Não iniciada";
    }

    if (
      estado === "inicio"
    ) {
      return "Primeiros traços";
    }

    if (
      estado ===
      "em_precipitacao"
    ) {
      return "Em precipitação";
    }

    if (
      estado ===
      "majoritariamente_precipitada"
    ) {
      return "Majoritariamente precipitada";
    }

    return "Praticamente completa";
  }

  function obterClasseEstado(
    estado:
      | "nao_iniciada"
      | "inicio"
      | "em_precipitacao"
      | "majoritariamente_precipitada"
      | "praticamente_completa"
  ) {
    return `precipitacaoPointState precipitacaoPointState--${estado}`;
  }

  function formatarValorCientifico(
    valor: number
  ) {
    if (
      !Number.isFinite(valor)
    ) {
      return "—";
    }

    if (
      valor === 0
    ) {
      return "0";
    }

    if (
      Math.abs(valor) >=
        0.001 &&
      Math.abs(valor) <
        10000
    ) {
      return formatarNumeroBR(
        valor,
        6
      );
    }

    return valor
      .toExponential(4)
      .replace(".", ",");
  }

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

      .selectivityGraphSelectiveRegion {
        fill: #dcfce7;
        opacity: 0.48;
      }

      .selectivityGraphSelectiveBracket {
        stroke: #15803d;
        stroke-width: 1.8;
      }

      .selectivityGraphSelectiveLabel {
        fill: #166534;
        font-size: 12px;
        font-weight: 900;
      }

      .selectivityGraphConsultedLine {
        stroke: #0f172a;
        stroke-width: 2;
        stroke-dasharray: 3 4;
      }

      .selectivityGraphConsultedHalo {
        fill: #ffffff;
        stroke: #0f172a;
        stroke-width: 2;
      }

      .selectivityGraphConsultedMarker {
        fill: #0f172a;
      }

      .selectivityGraphConsultedBox {
        fill: #ffffff;
        stroke: #cbd5e1;
        stroke-width: 1.2;
      }

      .selectivityGraphConsultedText {
        fill: #0f172a;
        font-size: 11px;
        font-weight: 900;
      }

      .selectivityGraphConsultedTextSecondary {
        fill: #475569;
        font-size: 10px;
        font-weight: 700;
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
        stroke-width: 5;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0.82;
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
        [
          svgSerializado,
        ],
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
        canvas.getContext(
          "2d"
        );

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
        (
          arquivoPng
        ) => {
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
            adição de{" "}
            {curva.formulaTitulante}.
          </p>
        </div>

        <button
          type="button"
          className="precipitacaoInterferenceDownloadButton"
          onClick={
            baixarGrafico
          }
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
        ref={
          graficoRef
        }
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={`Curvas calculadas de precipitação seletiva com ${curva.formulaTitulante}`}
      >

{intervaloSeletivoValido &&
          xInicioIntervalo !==
            null &&
          larguraIntervalo !==
            null && (
            <g>
              <rect
                x={
                  xInicioIntervalo
                }
                y={
                  margemSuperior
                }
                width={
                  larguraIntervalo
                }
                height={
                  alturaUtil
                }
                className="selectivityGraphSelectiveRegion"
              />

              <line
                x1={
                  xInicioIntervalo
                }
                y1={
                  margemSuperior +
                  28
                }
                x2={
                  xInicioIntervalo +
                  larguraIntervalo
                }
                y2={
                  margemSuperior +
                  28
                }
                className="selectivityGraphSelectiveBracket"
              />

              <line
                x1={
                  xInicioIntervalo
                }
                y1={
                  margemSuperior +
                  21
                }
                x2={
                  xInicioIntervalo
                }
                y2={
                  margemSuperior +
                  35
                }
                className="selectivityGraphSelectiveBracket"
              />

              <line
                x1={
                  xInicioIntervalo +
                  larguraIntervalo
                }
                y1={
                  margemSuperior +
                  21
                }
                x2={
                  xInicioIntervalo +
                  larguraIntervalo
                }
                y2={
                  margemSuperior +
                  35
                }
                className="selectivityGraphSelectiveBracket"
              />

              <text
                x={
                  xInicioIntervalo +
                  larguraIntervalo /
                    2
                }
                y={
                  margemSuperior +
                  19
                }
                textAnchor="middle"
                className="selectivityGraphSelectiveLabel"
              >
                Região seletiva · ΔV ={" "}
                {formatarNumeroBR(
                  deltaVolumeSeletivo ??
                    0,
                  2
                )}{" "}
                mL
              </text>
            </g>
          )}

        {marcacoesY.map(
          (
            valor,
            indice
          ) => {
            const y =
              converterY(
                valor
              );

            return (
              <g
                key={`y-${indice}`}
              >
                <line
                  x1={
                    margemEsquerda
                  }
                  y1={
                    y
                  }
                  x2={
                    largura -
                    margemDireita
                  }
                  y2={
                    y
                  }
                  className="selectivityGraphGrid"
                />

                <text
                  x={
                    margemEsquerda -
                    12
                  }
                  y={
                    y + 4
                  }
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
          (
            volume,
            indice
          ) => {
            const x =
              converterX(
                volume
              );

            return (
              <g
                key={`x-${indice}`}
              >
                <line
                  x1={
                    x
                  }
                  y1={
                    margemSuperior
                  }
                  x2={
                    x
                  }
                  y2={
                    altura -
                    margemInferior
                  }
                  className="selectivityGraphGrid"
                />

                <text
                  x={
                    x
                  }
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
            const volumeInicio =
              obterVolumeInicioSerie(
                serie.sal.id
              );

            const volumeInicioValido =
              volumeInicio !==
                null &&
              Number.isFinite(
                volumeInicio
              ) &&
              volumeInicio >=
                volumeMinimo &&
              volumeInicio <=
                volumeMaximo;

            if (
              !volumeInicioValido
            ) {
              return null;
            }

            const xInicio =
              converterX(
                volumeInicio
              );

            const larguraRotulo =
              150;

            const xRotulo =
              Math.min(
                xInicio + 7,
                largura -
                  margemDireita -
                  larguraRotulo
              );

            return (
              <g
                key={`inicio-${serie.sal.id}`}
              >
                <line
                  x1={
                    xInicio
                  }
                  y1={
                    margemSuperior
                  }
                  x2={
                    xInicio
                  }
                  y2={
                    altura -
                    margemInferior
                  }
                  vectorEffect="non-scaling-stroke"
                  className={
                    obterClasseInicio(
                      indice
                    )
                  }
                />

                <text
                  x={
                    xRotulo
                  }
                  y={
                    margemSuperior +
                    18 +
                    indice * 20
                  }
                  className={
                    obterClasseRotulo(
                      indice
                    )
                  }
                >
                  Início{" "}
                  {
                    serie.sal
                      .formulaExibicao
                  }
                </text>
              </g>
            );
          }
        )}

        <path
          d={
            criarCaminho(
              pontosMistura
            )
          }
          vectorEffect="non-scaling-stroke"
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
              d={
                criarCaminho(
                  serie.pontos
                )
              }
              vectorEffect="non-scaling-stroke"
              className={
                obterClasseSerie(
                  indice
                )
              }
            />
          )
        )}

{marcadorConsultaValido &&
          avaliacaoPonto &&
          xMarcadorConsulta !==
            null &&
          yMarcadorConsulta !==
            null && (
            <g className="selectivityGraphConsultedPoint">
              <line
                x1={
                  xMarcadorConsulta
                }
                y1={
                  margemSuperior
                }
                x2={
                  xMarcadorConsulta
                }
                y2={
                  altura -
                  margemInferior
                }
                vectorEffect="non-scaling-stroke"
                className="selectivityGraphConsultedLine"
              />

              <circle
                cx={
                  xMarcadorConsulta
                }
                cy={
                  yMarcadorConsulta
                }
                r="8"
                className="selectivityGraphConsultedHalo"
              />

              <circle
                cx={
                  xMarcadorConsulta
                }
                cy={
                  yMarcadorConsulta
                }
                r="4.5"
                className="selectivityGraphConsultedMarker"
              />

<g
                transform={`translate(${
                  largura -
                  margemDireita -
                  156
                } ${
                  margemSuperior +
                  12
                })`}
              >
                <rect
                  width="144"
                  height="48"
                  rx="8"
                  className="selectivityGraphConsultedBox"
                />

                <text
                  x="72"
                  y="19"
                  textAnchor="middle"
                  className="selectivityGraphConsultedText"
                >
                  V ={" "}
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .volumeAdicionado,
                    3
                  )}{" "}
                  mL
                </text>

                <text
                  x="72"
                  y="37"
                  textAnchor="middle"
                  className="selectivityGraphConsultedTextSecondary"
                >
                  p
                  {
                    curva.formulaTitulante
                  }{" "}
                  ={" "}
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .pTitulante ??
                      0,
                    4
                  )}
                </text>
              </g>
            </g>
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

      <footer className="precipitacaoSelectivityGraphLegend">
        <span>
          <i className="precipitacaoSelectivityLegendMixture" />

          <div>
            <strong>
              Mistura completa
            </strong>

            <small>
              Comportamento conjunto das espécies
            </small>
          </div>
        </span>

        {seriesValidas.map(
          (
            serie,
            indice
          ) => {
            const ordem =
              ordemPorSal.get(
                serie.sal.id
              );

            return (
              <span
                key={
                  serie.sal.id
                }
              >
                <i
                  className={
                    obterClasseLegenda(
                      indice
                    )
                  }
                />

                <div>
                  <strong>
                    {
                      serie.sal
                        .formulaExibicao
                    }{" "}
                    isolado
                  </strong>

                  <small>
                    {ordem
                      ? `${ordem}º precipitado previsto`
                      : "Curva do precipitado individual"}
                  </small>
                </div>
              </span>
            );
          }
        )}
      </footer>

      {intervaloSeletivoValido &&
        primeiraSerie &&
        segundaSerie &&
        deltaVolumeSeletivo !==
          null && (
          <div className="precipitacaoSelectivityIntervalSummary">
            <div>
              <span>
                Início do primeiro precipitado
              </span>
              <strong>
                {
                  primeiraSerie.sal
                    .formulaExibicao
                }
              </strong>
              <small>
                {formatarNumeroBR(
                  volumeInicioPrimeiro ??
                    0,
                  3
                )}{" "}
                mL
              </small>
            </div>

            <div>
              <span>
                Intervalo seletivo
              </span>
              <strong>
                ΔV ={" "}
                {formatarNumeroBR(
                  deltaVolumeSeletivo,
                  3
                )}{" "}
                mL
              </strong>
              <small>
                Faixa anterior ao início do
                segundo precipitado
              </small>
            </div>

            <div>
              <span>
                Início do segundo precipitado
              </span>
              <strong>
                {
                  segundaSerie.sal
                    .formulaExibicao
                }
              </strong>
              <small>
                {formatarNumeroBR(
                  volumeInicioSegundo ??
                    0,
                  3
                )}{" "}
                mL
              </small>
            </div>
          </div>
        )}

<section className="precipitacaoPointConsultation">
        <header className="precipitacaoPointConsultationHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Consulta pontual
            </span>

            <h6>
              Avaliar um volume específico
            </h6>

            <p>
              Informe o volume de{" "}
              {curva.formulaTitulante}{" "}
              adicionado para recalcular o
              equilíbrio e interpretar
              exclusivamente esse ponto.
            </p>
          </div>
        </header>

        <div className="precipitacaoPointConsultationForm">
          <label>
            <span>
              Volume adicionado
            </span>

            <div className="precipitacaoPointConsultationInput">
              <input
                type="text"
                inputMode="decimal"
                value={
                  volumeConsulta
                }
                onChange={(
                  evento
                ) => {
                  setVolumeConsulta(
                    evento.target
                      .value
                  );

                  if (
                    erroConsulta
                  ) {
                    setErroConsulta(
                      null
                    );
                  }
                }}
                onKeyDown={
                  tratarTeclaConsulta
                }
                placeholder="Ex.: 12,50"
                aria-label="Volume de titulante adicionado"
              />

              <span>
                mL
              </span>
            </div>
          </label>

          <button
            type="button"
            onClick={
              avaliarVolumeConsultado
            }
            className="precipitacaoPointConsultationButton"
          >
            Avaliar ponto
          </button>
        </div>

        <small className="precipitacaoPointConsultationHint">
          Faixa exibida no gráfico: 0 a{" "}
          {formatarNumeroBR(
            volumeMaximo,
            2
          )}{" "}
          mL. A consulta aceita ponto decimal
          ou vírgula.
        </small>

        {erroConsulta && (
          <div
            className="precipitacaoPointConsultationError"
            role="alert"
          >
            {erroConsulta}
          </div>
        )}

        {avaliacaoPonto && (
          <div className="precipitacaoPointEvaluation">
            <header className="precipitacaoPointEvaluationHeader">
              <div>
                <span>
                  Ponto consultado
                </span>

                <strong>
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .volumeAdicionado,
                    3
                  )}{" "}
                  mL
                </strong>
              </div>

              <div className={`precipitacaoPointRegion precipitacaoPointRegion--${avaliacaoPonto.regiao}`}>
                <span>
                  Região calculada
                </span>

                <strong>
                  {
                    avaliacaoPonto
                      .tituloRegiao
                  }
                </strong>
              </div>
            </header>

            {!avaliacaoPonto
              .dentroIntervaloCalculado &&
              avaliacaoPonto
                .mensagemErro && (
                <div className="precipitacaoPointEvaluationWarning">
                  {
                    avaliacaoPonto
                      .mensagemErro
                  }
                </div>
              )}

            <div className="precipitacaoPointMetrics">
              <article>
                <span>
                  Volume total
                </span>

                <strong>
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .volumeTotal,
                    3
                  )}{" "}
                  mL
                </strong>
              </article>

              <article>
                <span>
                  p
                  {
                    avaliacaoPonto
                      .formulaTitulante
                  }
                </span>

                <strong>
                  {avaliacaoPonto
                    .pTitulante !==
                  null
                    ? formatarNumeroBR(
                        avaliacaoPonto
                          .pTitulante,
                        4
                      )
                    : "Não definido"}
                </strong>
              </article>

              <article>
                <span>
                  [
                  {
                    avaliacaoPonto
                      .formulaTitulante
                  }
                  ] livre
                </span>

                <strong>
                  {formatarValorCientifico(
                    avaliacaoPonto
                      .concentracaoTitulanteLivre
                  )}
                </strong>

                <small>
                  mol·L⁻¹
                </small>
              </article>

              <article>
                <span>
                  Titulante formal
                </span>

                <strong>
                  {formatarValorCientifico(
                    avaliacaoPonto
                      .concentracaoTitulanteFormal
                  )}
                </strong>

                <small>
                  mol·L⁻¹
                </small>
              </article>

              <article>
                <span>
                  Mistura precipitada
                </span>

                <strong>
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .percentualPrecipitadoMistura,
                    4
                  )}
                  %
                </strong>
              </article>

              <article>
                <span>
                  Mistura em solução
                </span>

                <strong>
                  {formatarNumeroBR(
                    avaliacaoPonto
                      .percentualEmSolucaoMistura,
                    4
                  )}
                  %
                </strong>
              </article>
            </div>

            <div className="precipitacaoPointInterpretation">
              <strong>
                Interpretação do ponto
              </strong>

              <p>
                {
                  avaliacaoPonto
                    .interpretacao
                }
              </p>
            </div>

            <div className="precipitacaoPointSpecies">
              <div className="precipitacaoPointSpeciesTitle">
                <div>
                  <strong>
                    Avaliação por espécie
                  </strong>

                  <small>
                    Resultado individual no
                    volume consultado
                  </small>
                </div>

                <span>
                  {
                    avaliacaoPonto
                      .quantidadeEspeciesIniciadas
                  }{" "}
                  de{" "}
                  {
                    avaliacaoPonto
                      .itens.length
                  }{" "}
                  espécies iniciadas
                </span>
              </div>

              <div className="precipitacaoPointSpeciesTableWrapper">
                <table className="precipitacaoPointSpeciesTable">
                  <thead>
                    <tr>
                      <th>
                        Precipitado
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Precipitado
                      </th>

                      <th>
                        Em solução
                      </th>

                      <th>
                        Concentração livre
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {avaliacaoPonto
                      .itens.map(
                        (
                          item
                        ) => (
                          <tr
                            key={
                              item.sal
                                .id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item
                                    .formulaPrecipitado
                                }
                              </strong>

                              <small>
                                {
                                  item
                                    .ordemPrecipitacao
                                }
                                º na ordem
                                prevista
                              </small>
                            </td>

                            <td>
                              <span
                                className={obterClasseEstado(
                                  item.estado
                                )}
                              >
                                {obterRotuloEstado(
                                  item.estado
                                )}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {formatarNumeroBR(
                                  item
                                    .percentualPrecipitado,
                                  4
                                )}
                                %
                              </strong>
                            </td>

                            <td>
                              {formatarNumeroBR(
                                item
                                  .percentualEmSolucao,
                                4
                              )}
                              %
                            </td>

                            <td>
                              <strong>
                                {formatarValorCientifico(
                                  item
                                    .concentracaoAnalitoLivre
                                )}
                              </strong>

                              <small>
                                mol·L⁻¹
                              </small>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>

              <div className="precipitacaoPointSpeciesDetails">
                {avaliacaoPonto
                  .itens.map(
                    (
                      item
                    ) => (
                      <article
                        key={`detalhe-${item.sal.id}`}
                      >
                        <div>
                          <strong>
                            {
                              item
                                .formulaPrecipitado
                            }
                          </strong>

                          <span
                            className={obterClasseEstado(
                              item.estado
                            )}
                          >
                            {obterRotuloEstado(
                              item.estado
                            )}
                          </span>
                        </div>

                        <p>
                          {
                            item
                              .descricaoEstado
                          }
                        </p>

                        <dl>
                          <div>
                            <dt>
                              Quantidade inicial
                            </dt>

                            <dd>
                              {formatarValorCientifico(
                                item
                                  .molAnalitoInicial
                              )}{" "}
                              mol
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Quantidade precipitada
                            </dt>

                            <dd>
                              {formatarValorCientifico(
                                item
                                  .molAnalitoPrecipitado
                              )}{" "}
                              mol
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Quantidade em solução
                            </dt>

                            <dd>
                              {formatarValorCientifico(
                                item
                                  .molAnalitoLivre
                              )}{" "}
                              mol
                            </dd>
                          </div>
                        </dl>
                      </article>
                    )
                  )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="precipitacaoResultScientificNote">
        <strong>
          Leitura do gráfico
        </strong>

        <p>
          As linhas verticais indicam o início
          calculado da formação de cada precipitado
          na mistura. A área destacada representa
          o intervalo entre o início do primeiro e
          do segundo precipitado, identificado como
          região de separação seletiva. O valor de
          ΔV mostra a extensão volumétrica dessa
          região. Uma faixa maior pode facilitar a
          operação experimental, mas a classificação
          quantitativa também depende da fração do
          primeiro analito já precipitada quando o
          segundo sistema começa a precipitar.
        </p>
      </div>
    </section>
  );
}