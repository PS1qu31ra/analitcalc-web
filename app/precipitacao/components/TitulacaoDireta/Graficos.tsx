"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calcularPontoCurvaTitulacaoDireta,
  gerarCurvaTitulacaoDireta,
} from "@/lib/precipitacao/calculosCurvaTitulacaoDireta";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/tipos";

import type {
  ConfiguracaoAnalitoDireto,
} from "@/lib/precipitacao/metodosDiretos";

import AnalisesDiretasTabs from "./AnalisesDiretasTabs";

type GraficosProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  analito: ConfiguracaoAnalitoDireto;
};

export default function Graficos({
  resultado,
  analito,
}: GraficosProps) {
  const [volumeConsulta, setVolumeConsulta] =
  useState(resultado.volumePE);

const [volumeDigitado, setVolumeDigitado] =
  useState(
    String(resultado.volumePE).replace(".", ",")
  );

const [erroConsulta, setErroConsulta] =
  useState("");

  const conteudoGraficoRef =
  useRef<SVGGElement | null>(null);

  useEffect(() => {
    setVolumeConsulta(resultado.volumePE);
    setVolumeDigitado(
      String(resultado.volumePE).replace(".", ",")
    );
    setErroConsulta("");
  }, [resultado]);

  const curva = useMemo(
    () =>
      gerarCurvaTitulacaoDireta({
        resultado,
        passo: 0.25,
        especieMonitorada:
          resultado.especieTitulante,
      }),
    [resultado]
  );

  const pontoConsultaCurva = useMemo(
    () =>
      calcularPontoCurvaTitulacaoDireta(
        resultado,
        volumeConsulta,
        resultado.especieTitulante
      ),
    [resultado, volumeConsulta]
  );

  const formulaAnalito =
    resultado.especieAnalito === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  const formulaTitulante =
    resultado.especieTitulante === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  const pontosValidos = curva.pontos.filter(
    (ponto) =>
      Number.isFinite(ponto.volumeAdicionado) &&
      Number.isFinite(ponto.pEspecieMonitorada)
  );

  const valoresP = pontosValidos.map(
    (ponto) => ponto.pEspecieMonitorada
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
  maiorPBruto - menorPBruto;

const margemEscalaP = Math.max(
  amplitudeBruta * 0.08,
  0.25
);

const menorP =
  Math.floor(
    (menorPBruto - margemEscalaP) * 2
  ) / 2;

const maiorP =
  Math.ceil(
    (maiorPBruto + margemEscalaP) * 2
  ) / 2;

const amplitudeP =
  maiorP - menorP || 1;

const numeroDivisoesX = 5;
const numeroDivisoesY = 6;

const marcacoesXInternas = Array.from(
  { length: numeroDivisoesX - 1 },
  (_, indice) =>
    (
      resultado.volumeMaximoBureta /
      numeroDivisoesX
    ) *
    (indice + 1)
);

const marcacoesYInternas = Array.from(
  { length: numeroDivisoesY - 1 },
  (_, indice) =>
    maiorP -
    (
      amplitudeP /
      numeroDivisoesY
    ) *
    (indice + 1)
);

  const larguraGrafico = 900;
  const alturaGrafico = 500;
  const margemEsquerda = 62;
  const margemDireita = 24;
  const margemSuperior = 26;
  const margemInferior = 52;

  const larguraUtil =
    larguraGrafico -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    alturaGrafico -
    margemSuperior -
    margemInferior;

  function converterVolumeEmX(volume: number) {
    return (
      margemEsquerda +
      (
        volume /
        resultado.volumeMaximoBureta
      ) *
        larguraUtil
    );
  }

  function converterPEmY(valorP: number) {
    return (
      margemSuperior +
      (
        (maiorP - valorP) /
        amplitudeP
      ) *
        alturaUtil
    );
  }

  const caminhoCurva = pontosValidos
    .map((ponto, indice) => {
      const x = converterVolumeEmX(
        ponto.volumeAdicionado
      );

      const y = converterPEmY(
        ponto.pEspecieMonitorada
      );

      return `${indice === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const xPE = converterVolumeEmX(
    resultado.volumePE
  );

  const xConsulta = converterVolumeEmX(
    volumeConsulta
  );

  const yConsulta = Number.isFinite(
    pontoConsultaCurva.pEspecieMonitorada
  )
    ? converterPEmY(
        pontoConsultaCurva.pEspecieMonitorada
      )
    : null;

  const interpretacaoRegiao =
    pontoConsultaCurva.regiao === "Antes do PE"
      ? `Antes do ponto de equivalência, ainda há excesso de ${formulaAnalito} na solução. A concentração livre de ${formulaTitulante} é controlada pelo equilíbrio de solubilidade do precipitado.`
      : pontoConsultaCurva.regiao === "No PE"
        ? `No ponto de equivalência, as quantidades de ${formulaAnalito} e ${formulaTitulante} estão na proporção estequiométrica da reação. As concentrações livres vêm do equilíbrio de solubilidade do precipitado.`
        : pontoConsultaCurva.regiao === "Após o PE"
          ? `Após o ponto de equivalência, há excesso de ${formulaTitulante} livre em solução, provocando a mudança mais acentuada observada na curva.`
          : "Não foi possível interpretar este ponto com os dados informados.";

          function consultarPonto(
            event: React.FormEvent<HTMLFormElement>
          ) {
            event.preventDefault();
          
            const volumeNumerico = Number(
              volumeDigitado
                .trim()
                .replace(",", ".")
            );
          
            if (
              !Number.isFinite(volumeNumerico) ||
              volumeNumerico < 0
            ) {
              setErroConsulta(
                "Informe um volume válido, igual ou maior que zero."
              );
              return;
            }
          
            if (
              volumeNumerico >
              resultado.volumeMaximoBureta
            ) {
              setErroConsulta(
                `O volume deve estar entre 0 e ${formatarNumeroBR(
                  resultado.volumeMaximoBureta,
                  2
                )} mL.`
              );
              return;
            }
          
            setVolumeConsulta(volumeNumerico);
            setErroConsulta("");
          }
          
          function irParaPontoEquivalencia() {
            setVolumeConsulta(resultado.volumePE);
          
            setVolumeDigitado(
              formatarNumeroBR(
                resultado.volumePE,
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
          
            svgExportacao.setAttribute(
              "preserveAspectRatio",
              "xMidYMid meet"
            );
          
            const criarTexto = ({
              texto,
              x,
              y,
              classe,
            }: {
              texto: string;
              x: number;
              y: number;
              classe: string;
            }) => {
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
          
              elemento.textContent = texto;
          
              return elemento;
            };
          
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
          
            const separadorCabecalho =
              document.createElementNS(
                namespaceSvg,
                "line"
              );
          
            separadorCabecalho.setAttribute(
              "x1",
              String(areaOcupada.x)
            );
          
            separadorCabecalho.setAttribute(
              "x2",
              String(
                areaOcupada.x +
                areaOcupada.width
              )
            );
          
            separadorCabecalho.setAttribute(
              "y1",
              String(areaOcupada.y - 14)
            );
          
            separadorCabecalho.setAttribute(
              "y2",
              String(areaOcupada.y - 14)
            );
          
            separadorCabecalho.setAttribute(
              "class",
              "precipitacaoChartExportDivider"
            );
          
            const titulo = criarTexto({
              texto:
                "Curva de Titulação por Precipitação",
              x: areaOcupada.x,
              y: areaOcupada.y - 82,
              classe:
                "precipitacaoChartExportTitle",
            });
          
            const identificacao = criarTexto({
              texto:
                `Analito: ${formulaAnalito}  •  Titulante: ${formulaTitulante}`,
              x: areaOcupada.x,
              y: areaOcupada.y - 57,
              classe:
                "precipitacaoChartExportMetadata",
            });
          
            const pontoMarcado = criarTexto({
              texto:
                `Ponto marcado: ${formatarNumeroBR(
                  volumeConsulta,
                  2
                )} mL  •  p${formulaTitulante}: ${formatarNumeroBR(
                  pontoConsultaCurva.pEspecieMonitorada,
                  3
                )}`,
              x: areaOcupada.x,
              y: areaOcupada.y - 36,
              classe:
                "precipitacaoChartExportMetadata",
            });
          
            const regiao = criarTexto({
              texto:
                `Região da curva: ${pontoConsultaCurva.regiao}`,
              x: areaOcupada.x,
              y: areaOcupada.y - 16,
              classe:
                "precipitacaoChartExportMetadata",
            });
          
            const rodape = criarTexto({
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
          
              .precipitacaoChartExportDivider {
                stroke: #e4e4e7;
                stroke-width: 1;
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
          
            svgExportacao.appendChild(fundo);
            svgExportacao.appendChild(estilos);
            svgExportacao.appendChild(titulo);
            svgExportacao.appendChild(
              identificacao
            );
            svgExportacao.appendChild(
              pontoMarcado
            );
            svgExportacao.appendChild(regiao);
            svgExportacao.appendChild(
              separadorCabecalho
            );
            svgExportacao.appendChild(
              conteudoClonado
            );
            svgExportacao.appendChild(rodape);
          
            const svgSerializado =
              new XMLSerializer()
                .serializeToString(
                  svgExportacao
                );
          
            const arquivoSvg = new Blob(
              [svgSerializado],
              {
                type:
                  "image/svg+xml;charset=utf-8",
              }
            );
          
            const urlSvg =
              URL.createObjectURL(arquivoSvg);
          
            const imagem = new Image();
          
            imagem.onload = () => {
              const escalaExportacao = 2;
          
              const canvas =
                document.createElement(
                  "canvas"
                );
          
              canvas.width = Math.ceil(
                viewBoxLargura *
                escalaExportacao
              );
          
              canvas.height = Math.ceil(
                viewBoxAltura *
                escalaExportacao
              );
          
              const contexto =
                canvas.getContext("2d");
          
              if (!contexto) {
                URL.revokeObjectURL(urlSvg);
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
                    `curva-titulacao-${analito.id}.png`;
          
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
              URL.revokeObjectURL(urlSvg);
            };
          
            imagem.src = urlSvg;
          }

          return (
    <section className="precipitacaoCurveSection">
      <header className="precipitacaoResultsHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Curva de titulação
          </span>

          <h3>
            Variação de p{formulaTitulante}
          </h3>

          <p>
            A curva representa a variação de{" "}
            p{formulaTitulante} em função do
            volume de titulante adicionado.
          </p>
        </div>

        <span className="precipitacaoWorkspaceBadge">
          {analito.formula}
        </span>
      </header>

      <div className="precipitacaoCurveLayout">
      <div className="precipitacaoChartCard">
      <svg
  viewBox={`0 0 ${larguraGrafico} ${alturaGrafico}`}
  role="img"
  aria-label={`Curva de titulação de ${formulaAnalito} com ${formulaTitulante}`}
>
    <g ref={conteudoGraficoRef}>
      {marcacoesYInternas.map((valorP) => {
        const y = converterPEmY(valorP);

        return (
          <g key={`marcacao-y-${valorP}`}>
            <line
              x1={margemEsquerda}
              y1={y}
              x2={larguraGrafico - margemDireita}
              y2={y}
              className="precipitacaoChartGridLine"
            />

            <text
              x={margemEsquerda - 10}
              y={y + 4}
              textAnchor="end"
              className="precipitacaoChartTick"
            >
              {formatarNumeroBR(valorP, 1)}
            </text>
          </g>
        );
      })}

      {marcacoesXInternas.map((volume) => {
        const x = converterVolumeEmX(volume);

        return (
          <g key={`marcacao-x-${volume}`}>
            <line
              x1={x}
              y1={margemSuperior}
              x2={x}
              y2={alturaGrafico - margemInferior}
              className="precipitacaoChartGridLine"
            />

            <text
              x={x}
              y={alturaGrafico - margemInferior + 24}
              textAnchor="middle"
              className="precipitacaoChartTick"
            >
              {formatarNumeroBR(volume, 1)}
            </text>
          </g>
        );
      })}

      <line
        x1={margemEsquerda}
        y1={margemSuperior}
        x2={margemEsquerda}
        y2={alturaGrafico - margemInferior}
        className="precipitacaoChartAxis"
      />

      <line
        x1={margemEsquerda}
        y1={alturaGrafico - margemInferior}
        x2={larguraGrafico - margemDireita}
        y2={alturaGrafico - margemInferior}
        className="precipitacaoChartAxis"
      />

      <line
        x1={xPE}
        y1={margemSuperior}
        x2={xPE}
        y2={alturaGrafico - margemInferior}
        className="precipitacaoChartPELine"
      />

      <text
        x={xPE + 8}
        y={margemSuperior + 16}
        className="precipitacaoChartPELabel"
      >
        PE
      </text>

      <path
        d={caminhoCurva}
        className="precipitacaoChartCurve"
      />

      <line
        x1={xConsulta}
        y1={margemSuperior}
        x2={xConsulta}
        y2={alturaGrafico - margemInferior}
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
        x={larguraGrafico - margemDireita - 224}
        y={margemSuperior + 12}
        width="212"
        height="76"
        rx="10"
        className="precipitacaoChartLegendBackground"
      />

      <circle
        cx={larguraGrafico - margemDireita - 206}
        cy={margemSuperior + 33}
        r="5"
        className="precipitacaoChartPoint"
      />

      <text
        x={larguraGrafico - margemDireita - 194}
        y={margemSuperior + 37}
        className="precipitacaoChartLegendTitle"
      >
        Ponto consultado
      </text>

      <text
        x={larguraGrafico - margemDireita - 206}
        y={margemSuperior + 58}
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
        x={larguraGrafico - margemDireita - 206}
        y={margemSuperior + 77}
        className="precipitacaoChartLegendValue"
      >
        p{formulaTitulante}:{" "}
        {formatarNumeroBR(
          pontoConsultaCurva.pEspecieMonitorada,
          3
        )}
      </text>
    </g>
  </>
)}

      <text
        x={larguraGrafico / 2}
        y={alturaGrafico - 12}
        textAnchor="middle"
        className="precipitacaoChartAxisLabel"
      >
        Volume de titulante adicionado (mL)
      </text>

      <text
        x="18"
        y={alturaGrafico / 2}
        textAnchor="middle"
        transform={`rotate(-90 18 ${alturaGrafico / 2})`}
        className="precipitacaoChartAxisLabel"
      >
        p{formulaTitulante}
      </text>

      <text
        x={margemEsquerda}
        y={alturaGrafico - margemInferior + 24}
        textAnchor="middle"
        className="precipitacaoChartTick"
      >
        0
      </text>

      <text
        x={larguraGrafico - margemDireita}
        y={alturaGrafico - margemInferior + 24}
        textAnchor="middle"
        className="precipitacaoChartTick"
      >
        {formatarNumeroBR(
          resultado.volumeMaximoBureta,
          1
        )}
      </text>

      <text
        x={margemEsquerda - 10}
        y={margemSuperior + 4}
        textAnchor="end"
        className="precipitacaoChartTick"
      >
        {formatarNumeroBR(maiorP, 1)}
      </text>

      <text
        x={margemEsquerda - 10}
        y={alturaGrafico - margemInferior + 4}
        textAnchor="end"
        className="precipitacaoChartTick"
      >
        {formatarNumeroBR(menorP, 1)}
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
    Digite o volume de titulante adicionado para
    consultar a composição da solução nesse ponto.
  </p>

  <form
    className="precipitacaoCurveSearchForm"
    onSubmit={consultarPonto}
  >
    <label htmlFor="volumeConsultaCurva">
      Volume adicionado
    </label>

    <div className="precipitacaoCurveInputGroup">
      <input
        id="volumeConsultaCurva"
        type="text"
        inputMode="decimal"
        value={volumeDigitado}
        onChange={(event) => {
          setVolumeDigitado(
            event.target.value
          );

          if (erroConsulta) {
            setErroConsulta("");
          }
        }}
        placeholder="Ex.: 18,50"
        aria-describedby={
          erroConsulta
            ? "erroVolumeConsulta"
            : undefined
        }
      />

      <span>mL</span>
    </div>

    {erroConsulta && (
      <p
        id="erroVolumeConsulta"
        className="precipitacaoCurveSearchError"
      >
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
    onClick={irParaPontoEquivalencia}
  >
    Ir para o ponto de equivalência
  </button>

  <button
  type="button"
  className="precipitacaoCurveDownloadButton"
  onClick={baixarGrafico}
>
  Baixar gráfico
</button>

  <div className="precipitacaoCurveRegion">
    <span>Região da curva</span>

    <strong>
      {pontoConsultaCurva.regiao}
    </strong>
  </div>
</aside>
      </div>

      <div className="precipitacaoCurveDataGrid">
        <article className="precipitacaoResultCard">
          <span>
            p{formulaTitulante}
          </span>

          <strong>
            {formatarNumeroBR(
              pontoConsultaCurva.pEspecieMonitorada,
              3
            )}
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            [{formulaTitulante}] livre
          </span>

          <strong>
            {formatarCientificoBR(
              pontoConsultaCurva.concentracaoTitulanteLivre,
              3
            )}
            <small> mol/L</small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            [{formulaAnalito}] livre
          </span>

          <strong>
            {formatarCientificoBR(
              pontoConsultaCurva.concentracaoAnalitoLivre,
              3
            )}
            <small> mol/L</small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>
            Analito precipitado
          </span>

          <strong>
            {formatarNumeroBR(
              pontoConsultaCurva.percentualPrecipitado,
              2
            )}
            <small> %</small>
          </strong>
        </article>
      </div>

      <div className="precipitacaoResultInterpretation">
  <div className="precipitacaoResultInterpretationHeader">
    <span>
      Interpretação da região
    </span>

    <strong>
      {pontoConsultaCurva.regiao}
    </strong>
  </div>

  <p>{interpretacaoRegiao}</p>
</div>

<AnalisesDiretasTabs
  resultado={resultado}
  analito={analito}
/>
</section>
  );
}