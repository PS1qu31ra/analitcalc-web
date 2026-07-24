"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  gerarCurvaTitulacaoRetorno,
} from "@/lib/precipitacao/calculosCurvaTitulacaoRetorno";

import {
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/tipos";

type DerivadasCurvaRetornoProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

type PontoDerivadaRetorno = {
  volume: number;
  valorP: number;
  primeiraDerivada: number;
  segundaDerivada: number;
};

export default function DerivadasCurvaRetorno({
  resultado,
}: DerivadasCurvaRetornoProps) {
  const dadosDerivadas =
    useMemo(() => {
      const curva =
        gerarCurvaTitulacaoRetorno({
          resultado,
          passo: 0.25,
        });

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

      if (
        pontosValidos.length === 0
      ) {
        return {
          pontos:
            [] as PontoDerivadaRetorno[],
          volumePFPrimeiraDerivada:
            NaN,
          volumePFSegundaDerivada:
            NaN,
          maiorPrimeiraDerivada:
            NaN,
          volumePontoFinalTeorico:
            curva.volumePontoFinalRetorno,
        };
      }

      const pontosComPrimeiraDerivada =
        pontosValidos.map(
          (
            ponto,
            indice
          ) => {
            const pontoAnterior =
              pontosValidos[
                Math.max(
                  indice - 1,
                  0
                )
              ];

            const pontoPosterior =
              pontosValidos[
                Math.min(
                  indice + 1,
                  pontosValidos.length -
                    1
                )
              ];

            const diferencaVolume =
              pontoPosterior
                .volumeAdicionado -
              pontoAnterior
                .volumeAdicionado;

            const primeiraDerivada =
              diferencaVolume !== 0
                ? (
                    pontoPosterior
                      .pPrecipitante -
                    pontoAnterior
                      .pPrecipitante
                  ) /
                  diferencaVolume
                : 0;

            return {
              volume:
                ponto
                  .volumeAdicionado,
              valorP:
                ponto
                  .pPrecipitante,
              primeiraDerivada,
            };
          }
        );

      const pontosDerivados:
        PontoDerivadaRetorno[] =
        pontosComPrimeiraDerivada.map(
          (
            ponto,
            indice
          ) => {
            const pontoAnterior =
              pontosComPrimeiraDerivada[
                Math.max(
                  indice - 1,
                  0
                )
              ];

            const pontoPosterior =
              pontosComPrimeiraDerivada[
                Math.min(
                  indice + 1,
                  pontosComPrimeiraDerivada
                    .length - 1
                )
              ];

            const diferencaVolume =
              pontoPosterior.volume -
              pontoAnterior.volume;

            const segundaDerivada =
              diferencaVolume !== 0
                ? (
                    pontoPosterior
                      .primeiraDerivada -
                    pontoAnterior
                      .primeiraDerivada
                  ) /
                  diferencaVolume
                : 0;

            return {
              ...ponto,
              segundaDerivada,
            };
          }
        );

      const pontoMaiorVariacao =
        pontosDerivados.reduce(
          (
            maior,
            ponto
          ) =>
            Math.abs(
              ponto
                .primeiraDerivada
            ) >
            Math.abs(
              maior
                .primeiraDerivada
            )
              ? ponto
              : maior,
          pontosDerivados[0]
        );

      const cruzamentosSegundaDerivada:
        number[] = [];

      for (
        let indice = 1;
        indice <
        pontosDerivados.length;
        indice += 1
      ) {
        const anterior =
          pontosDerivados[
            indice - 1
          ];

        const atual =
          pontosDerivados[
            indice
          ];

        const mudouSinal =
          (
            anterior
              .segundaDerivada <=
              0 &&
            atual
              .segundaDerivada >=
              0
          ) ||
          (
            anterior
              .segundaDerivada >=
              0 &&
            atual
              .segundaDerivada <=
              0
          );

        if (!mudouSinal) {
          continue;
        }

        const diferencaDerivada =
          atual
            .segundaDerivada -
          anterior
            .segundaDerivada;

        if (
          diferencaDerivada === 0
        ) {
          cruzamentosSegundaDerivada.push(
            atual.volume
          );

          continue;
        }

        const fracao =
          -anterior
            .segundaDerivada /
          diferencaDerivada;

        const volumeCruzamento =
          anterior.volume +
          fracao *
            (
              atual.volume -
              anterior.volume
            );

        if (
          Number.isFinite(
            volumeCruzamento
          )
        ) {
          cruzamentosSegundaDerivada.push(
            volumeCruzamento
          );
        }
      }

      const volumePFSegundaDerivada =
        cruzamentosSegundaDerivada
          .length > 0
          ? cruzamentosSegundaDerivada.reduce(
              (
                maisProximo,
                volume
              ) =>
                Math.abs(
                  volume -
                    pontoMaiorVariacao
                      .volume
                ) <
                Math.abs(
                  maisProximo -
                    pontoMaiorVariacao
                      .volume
                )
                  ? volume
                  : maisProximo,
              cruzamentosSegundaDerivada[0]
            )
          : pontoMaiorVariacao.volume;

      return {
        pontos:
          pontosDerivados,

        volumePFPrimeiraDerivada:
          pontoMaiorVariacao
            .volume,

        volumePFSegundaDerivada,

        maiorPrimeiraDerivada:
          pontoMaiorVariacao
            .primeiraDerivada,

        volumePontoFinalTeorico:
          curva
            .volumePontoFinalRetorno,
      };
    }, [resultado]);

  const erroPrimeiraDerivada =
    dadosDerivadas
      .volumePFPrimeiraDerivada -
    dadosDerivadas
      .volumePontoFinalTeorico;

  const erroSegundaDerivada =
    dadosDerivadas
      .volumePFSegundaDerivada -
    dadosDerivadas
      .volumePontoFinalTeorico;

  if (
    dadosDerivadas
      .pontos.length === 0
  ) {
    return (
      <section className="precipitacaoDirectTabDevelopment">
        <span className="precipitacaoSectionLabel">
          Tratamento numérico
        </span>

        <h5>
          Não foi possível calcular as derivadas
        </h5>

        <p>
          A curva de retorno não possui pontos
          válidos suficientes para calcular a
          primeira e a segunda derivadas.
        </p>
      </section>
    );
  }

  return (
    <section className="precipitacaoDerivativeSection">
      <header className="precipitacaoDerivativeIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Tratamento numérico
          </span>

          <h5>
            Localização do ponto final
          </h5>

          <p>
            As derivadas numéricas evidenciam a
            região de maior variação da curva de
            pAg⁺. A primeira derivada apresenta um
            extremo próximo ao ponto final,
            enquanto a segunda derivada tende a
            cruzar o zero nessa mesma região.
          </p>
        </div>
      </header>

      <div className="precipitacaoDerivativeSummary">
        <article>
          <span>
            PF estequiométrico
          </span>

          <strong>
            {formatarNumeroBR(
              dadosDerivadas
                .volumePontoFinalTeorico,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Calculado pela relação Ag⁺ : SCN⁻
          </small>
        </article>

        <article>
          <span>
            PF pela 1ª derivada
          </span>

          <strong>
            {formatarNumeroBR(
              dadosDerivadas
                .volumePFPrimeiraDerivada,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Maior valor absoluto de ΔpAg⁺/ΔV
          </small>
        </article>

        <article>
          <span>
            PF pela 2ª derivada
          </span>

          <strong>
            {formatarNumeroBR(
              dadosDerivadas
                .volumePFSegundaDerivada,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Cruzamento de Δ²pAg⁺/ΔV² com zero
          </small>
        </article>

        <article>
          <span>
            Maior inclinação
          </span>

          <strong>
            {formatarNumeroBR(
              dadosDerivadas
                .maiorPrimeiraDerivada,
              3
            )}
          </strong>

          <small>
            Unidade de pAg⁺/mL
          </small>
        </article>
      </div>

      <div className="precipitacaoDerivativeComparison">
        <div>
          <span>
            Diferença da 1ª derivada
          </span>

          <strong>
            {erroPrimeiraDerivada >=
            0
              ? "+"
              : ""}

            {formatarNumeroBR(
              erroPrimeiraDerivada,
              2
            )}{" "}
            mL
          </strong>
        </div>

        <div>
          <span>
            Diferença da 2ª derivada
          </span>

          <strong>
            {erroSegundaDerivada >=
            0
              ? "+"
              : ""}

            {formatarNumeroBR(
              erroSegundaDerivada,
              2
            )}{" "}
            mL
          </strong>
        </div>

        <p>
          Diferenças pequenas são esperadas porque
          as derivadas são calculadas a partir de
          pontos discretos da curva com passo de
          0,25 mL.
        </p>
      </div>

      <div className="precipitacaoDerivativeCharts">
        <GraficoDerivadaRetorno
          titulo="Primeira derivada"
          descricao="Variação de pAg⁺ por volume de SCN⁻ adicionado."
          pontos={dadosDerivadas.pontos.map(
            (ponto) => ({
              volume:
                ponto.volume,
              valor:
                ponto
                  .primeiraDerivada,
            })
          )}
          volumePontoFinal={
            dadosDerivadas
              .volumePontoFinalTeorico
          }
          rotuloEixoY="ΔpAg⁺/ΔV"
          nomeArquivo="primeira-derivada-retorno"
        />

        <GraficoDerivadaRetorno
          titulo="Segunda derivada"
          descricao="Variação da primeira derivada de pAg⁺."
          pontos={dadosDerivadas.pontos.map(
            (ponto) => ({
              volume:
                ponto.volume,
              valor:
                ponto
                  .segundaDerivada,
            })
          )}
          volumePontoFinal={
            dadosDerivadas
              .volumePontoFinalTeorico
          }
          rotuloEixoY="Δ²pAg⁺/ΔV²"
          mostrarLinhaZero
          nomeArquivo="segunda-derivada-retorno"
        />
      </div>

      <section className="precipitacaoDerivativeTableSection">
        <header>
          <div>
            <span className="precipitacaoSectionLabel">
              Valores calculados
            </span>

            <h5>
              Tabela das derivadas
            </h5>
          </div>

          <span>
            Passo: 0,25 mL
          </span>
        </header>

        <div className="precipitacaoDerivativeTableWrapper">
          <table>
            <thead>
              <tr>
                <th>
                  Volume de SCN⁻
                </th>

                <th>
                  pAg⁺
                </th>

                <th>
                  ΔpAg⁺/ΔV
                </th>

                <th>
                  Δ²pAg⁺/ΔV²
                </th>
              </tr>
            </thead>

            <tbody>
              {dadosDerivadas.pontos.map(
                (
                  ponto,
                  indice
                ) => (
                  <tr
                    key={`${ponto.volume}-${indice}`}
                    className={
                      Math.abs(
                        ponto.volume -
                          dadosDerivadas
                            .volumePontoFinalTeorico
                      ) <= 0.125
                        ? "precipitacaoDerivativePERow"
                        : undefined
                    }
                  >
                    <td>
                      {formatarNumeroBR(
                        ponto.volume,
                        2
                      )}{" "}
                      mL
                    </td>

                    <td>
                      {formatarNumeroBR(
                        ponto.valorP,
                        4
                      )}
                    </td>

                    <td>
                      {formatarNumeroBR(
                        ponto
                          .primeiraDerivada,
                        5
                      )}
                    </td>

                    <td>
                      {formatarNumeroBR(
                        ponto
                          .segundaDerivada,
                        5
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

type GraficoDerivadaRetornoProps = {
  titulo: string;
  descricao: string;
  pontos: Array<{
    volume: number;
    valor: number;
  }>;
  volumePontoFinal: number;
  rotuloEixoY: string;
  mostrarLinhaZero?: boolean;
  nomeArquivo: string;
};

function GraficoDerivadaRetorno({
  titulo,
  descricao,
  pontos,
  volumePontoFinal,
  rotuloEixoY,
  mostrarLinhaZero = false,
  nomeArquivo,
}: GraficoDerivadaRetornoProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const largura = 720;
  const altura = 360;

  const margemEsquerda = 72;
  const margemDireita = 22;
  const margemSuperior = 30;
  const margemInferior = 52;

  const larguraUtil =
    largura -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    altura -
    margemSuperior -
    margemInferior;

  const pontosValidos =
    pontos.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volume
        ) &&
        Number.isFinite(
          ponto.valor
        )
    );

  const volumes =
    pontosValidos.map(
      (ponto) =>
        ponto.volume
    );

  const valores =
    pontosValidos.map(
      (ponto) =>
        ponto.valor
    );

  const volumeMinimo =
    Math.min(...volumes);

  const volumeMaximo =
    Math.max(...volumes);

  const valorMinimoBruto =
    Math.min(...valores);

  const valorMaximoBruto =
    Math.max(...valores);

  const amplitudeBruta =
    valorMaximoBruto -
      valorMinimoBruto ||
    1;

  const margemY =
    amplitudeBruta * 0.1;

  const valorMinimo =
    valorMinimoBruto -
    margemY;

  const valorMaximo =
    valorMaximoBruto +
    margemY;

  const amplitudeY =
    valorMaximo -
      valorMinimo ||
    1;

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
    valor: number
  ) {
    return (
      margemSuperior +
      (
        (
          valorMaximo -
          valor
        ) /
        amplitudeY
      ) *
        alturaUtil
    );
  }

  const caminho =
    pontosValidos
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
            ponto.volume
          )} ${converterY(
            ponto.valor
          )}`
      )
      .join(" ");

  const xPontoFinal =
    converterX(
      volumePontoFinal
    );

  const yZero =
    converterY(0);

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
      { length: 5 },
      (_, indice) =>
        valorMaximo -
        (
          amplitudeY /
          4
        ) *
          indice
    );

  function baixarGraficoDerivada() {
    const grafico =
      graficoRef.current;

    if (!grafico) {
      return;
    }

    const namespaceSvg =
      "http://www.w3.org/2000/svg";

    const graficoClonado =
      grafico.cloneNode(
        true
      ) as SVGSVGElement;

    graficoClonado.setAttribute(
      "xmlns",
      namespaceSvg
    );

    graficoClonado.setAttribute(
      "width",
      String(largura)
    );

    graficoClonado.setAttribute(
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
      .precipitacaoDerivativeGrid {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .precipitacaoDerivativeAxis {
        stroke: #71717a;
        stroke-width: 1.4;
      }

      .precipitacaoDerivativeCurve {
        fill: none;
        stroke: #991b1b;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .precipitacaoDerivativePELine {
        stroke: #b45309;
        stroke-width: 1.8;
        stroke-dasharray: 6 6;
      }

      .precipitacaoDerivativePELabel {
        fill: #92400e;
        font-size: 12px;
        font-weight: 900;
        font-family: Arial, sans-serif;
      }

      .precipitacaoDerivativeZeroLine {
        stroke: #3f3f46;
        stroke-width: 1.4;
        stroke-dasharray: 4 5;
      }

      .precipitacaoDerivativeTick {
        fill: #71717a;
        font-size: 11px;
        font-family: Arial, sans-serif;
      }

      .precipitacaoDerivativeAxisLabel {
        fill: #3f3f46;
        font-size: 12px;
        font-weight: 700;
        font-family: Arial, sans-serif;
      }
    `;

    graficoClonado.prepend(
      estilos
    );

    graficoClonado.prepend(
      fundo
    );

    const svgSerializado =
      new XMLSerializer()
        .serializeToString(
          graficoClonado
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
      const escalaExportacao =
        2;

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        largura *
        escalaExportacao;

      canvas.height =
        altura *
        escalaExportacao;

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
            `${nomeArquivo}.png`;

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
    <article className="precipitacaoDerivativeChartCard">
      <header className="precipitacaoDerivativeChartHeader">
        <div>
          <h6>
            {titulo}
          </h6>

          <p>
            {descricao}
          </p>
        </div>

        <button
          type="button"
          className="precipitacaoDerivativeDownloadButton"
          onClick={
            baixarGraficoDerivada
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
        ref={graficoRef}
        viewBox={`0 0 ${largura} ${altura}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={titulo}
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
                  className="precipitacaoDerivativeGrid"
                />

                <text
                  x={
                    margemEsquerda -
                    10
                  }
                  y={y + 4}
                  textAnchor="end"
                  className="precipitacaoDerivativeTick"
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
                  className="precipitacaoDerivativeGrid"
                />

                <text
                  x={x}
                  y={
                    altura -
                    margemInferior +
                    23
                  }
                  textAnchor="middle"
                  className="precipitacaoDerivativeTick"
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

        {mostrarLinhaZero &&
          valorMinimo <= 0 &&
          valorMaximo >= 0 && (
            <line
              x1={
                margemEsquerda
              }
              y1={yZero}
              x2={
                largura -
                margemDireita
              }
              y2={yZero}
              className="precipitacaoDerivativeZeroLine"
            />
          )}

        <line
          x1={margemEsquerda}
          y1={margemSuperior}
          x2={margemEsquerda}
          y2={
            altura -
            margemInferior
          }
          className="precipitacaoDerivativeAxis"
        />

        <line
          x1={margemEsquerda}
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
          className="precipitacaoDerivativeAxis"
        />

        <line
          x1={xPontoFinal}
          y1={
            margemSuperior
          }
          x2={xPontoFinal}
          y2={
            altura -
            margemInferior
          }
          className="precipitacaoDerivativePELine"
        />

        <text
          x={
            xPontoFinal +
            7
          }
          y={
            margemSuperior +
            15
          }
          className="precipitacaoDerivativePELabel"
        >
          PF
        </text>

        <path
          d={caminho}
          className="precipitacaoDerivativeCurve"
        />

        <text
          x={
            largura /
            2
          }
          y={
            altura -
            10
          }
          textAnchor="middle"
          className="precipitacaoDerivativeAxisLabel"
        >
          Volume de SCN⁻ adicionado (mL)
        </text>

        <text
          x="18"
          y={
            altura /
            2
          }
          textAnchor="middle"
          transform={`rotate(-90 18 ${altura / 2})`}
          className="precipitacaoDerivativeAxisLabel"
        >
          {rotuloEixoY}
        </text>
      </svg>
    </article>
  );
}