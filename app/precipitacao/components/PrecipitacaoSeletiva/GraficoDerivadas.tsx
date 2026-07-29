"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  calcularDerivadasCurvaSeletividade,
} from "@/lib/precipitacao/calculosDerivadasSeletividade";

import {
  gerarCurvaSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosCurvaSeletividade";

import {
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoSeletividadePrecipitacao,
} from "@/lib/precipitacao/tipos";

type GraficoDerivadasProps = {
  resultado:
    ResultadoSeletividadePrecipitacao;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximoBureta: number;
};

type PontoGrafico = {
  volumeAdicionado: number;
  valor: number;
};

type GraficoDerivadaProps = {
    titulo: string;
    descricao: string;
    rotuloEixoY: string;
    pontos: PontoGrafico[];
    volumesEventos: number[];
    prefixoEvento: string;
    nomeArquivo: string;
  
    /*
     * Exibe a linha horizontal correspondente
     * ao valor zero do eixo vertical.
     */
    mostrarLinhaZero?: boolean;
  
    /*
     * Quando verdadeiro, os marcadores de evento
     * são posicionados exatamente em y = 0.
     *
     * Essa opção é utilizada na segunda derivada,
     * pois seus eventos representam cruzamentos
     * pelo eixo zero.
     */
    posicionarEventosNoZero?: boolean;
  };

function limitar({
  valor,
  minimo,
  maximo,
}: {
  valor: number;
  minimo: number;
  maximo: number;
}) {
  return Math.min(
    Math.max(
      valor,
      minimo
    ),
    maximo
  );
}

function baixarSvgComoPng({
  svg,
  nomeArquivo,
}: {
  svg: SVGSVGElement;
  nomeArquivo: string;
}) {
  const serializador =
    new XMLSerializer();

  const svgClonado =
    svg.cloneNode(
      true
    ) as SVGSVGElement;

  svgClonado.setAttribute(
    "xmlns",
    "http://www.w3.org/2000/svg"
  );

  const textoSvg =
    serializador.serializeToString(
      svgClonado
    );

  const blob =
    new Blob(
      [textoSvg],
      {
        type:
          "image/svg+xml;charset=utf-8",
      }
    );

  const urlSvg =
    URL.createObjectURL(
      blob
    );

  const imagem =
    new Image();

  imagem.onload = () => {
    const viewBox =
      svg.viewBox.baseVal;

    const largura =
      viewBox.width || 920;

    const altura =
      viewBox.height || 430;

    const escala = 2;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      largura *
      escala;

    canvas.height =
      altura *
      escala;

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

    contexto.scale(
      escala,
      escala
    );

    contexto.fillStyle =
      "#ffffff";

    contexto.fillRect(
      0,
      0,
      largura,
      altura
    );

    contexto.drawImage(
      imagem,
      0,
      0,
      largura,
      altura
    );

    canvas.toBlob(
      (arquivo) => {
        if (!arquivo) {
          URL.revokeObjectURL(
            urlSvg
          );

          return;
        }

        const urlPng =
          URL.createObjectURL(
            arquivo
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          urlPng;

        link.download =
          nomeArquivo;

        link.click();

        URL.revokeObjectURL(
          urlPng
        );

        URL.revokeObjectURL(
          urlSvg
        );
      },
      "image/png"
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

function GraficoDerivada({
    titulo,
    descricao,
    rotuloEixoY,
    pontos,
    volumesEventos,
    prefixoEvento,
    nomeArquivo,
    mostrarLinhaZero = false,
    posicionarEventosNoZero = false,
  }: GraficoDerivadaProps) {
  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );

  const largura = 920;
  const altura = 430;

  const margemEsquerda = 86;
  const margemDireita = 34;
  const margemSuperior = 36;
  const margemInferior = 70;

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
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.valor
        )
    );

  if (
    pontosValidos.length <
    2
  ) {
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
        </header>

        <div className="precipitacaoResultMessage precipitacaoResultMessageWarning">
          <strong>
            Gráfico indisponível
          </strong>

          <p>
            Não há pontos numéricos suficientes
            para representar esta derivada.
          </p>
        </div>
      </article>
    );
  }

  const volumes =
    pontosValidos.map(
      (ponto) =>
        ponto.volumeAdicionado
    );

  const valores =
    pontosValidos.map(
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

  let valorMinimo =
    Math.min(
      ...valores
    );

  let valorMaximo =
    Math.max(
      ...valores
    );

  if (
    mostrarLinhaZero
  ) {
    valorMinimo =
      Math.min(
        valorMinimo,
        0
      );

    valorMaximo =
      Math.max(
        valorMaximo,
        0
      );
  }

  if (
    valorMinimo ===
    valorMaximo
  ) {
    const margem =
      Math.max(
        Math.abs(
          valorMinimo
        ) *
          0.1,
        1
      );

    valorMinimo -=
      margem;

    valorMaximo +=
      margem;
  } else {
    const margem =
      (
        valorMaximo -
        valorMinimo
      ) *
      0.08;

    valorMinimo -=
      margem;

    valorMaximo +=
      margem;
  }

  function escalaX(
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
          volumeMinimo
        )
      ) *
        larguraUtil
    );
  }

  function escalaY(
    valor: number
  ) {
    return (
      margemSuperior +
      (
        1 -
        (
          valor -
          valorMinimo
        ) /
        (
          valorMaximo -
          valorMinimo
        )
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
          } ${escalaX(
            ponto.volumeAdicionado
          )} ${escalaY(
            ponto.valor
          )}`
      )
      .join(" ");

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
          ) *
          indice
        ) /
          5
    );

  const marcacoesY =
    Array.from(
      {
        length: 5,
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
          ) *
          indice
        ) /
          4
    );

  const yZero =
    mostrarLinhaZero &&
    valorMinimo <= 0 &&
    valorMaximo >= 0
      ? escalaY(0)
      : null;

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
          onClick={() => {
            if (
              svgRef.current
            ) {
              baixarSvgComoPng({
                svg:
                  svgRef.current,
                nomeArquivo,
              });
            }
          }}
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
          svgRef
        }
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={
          titulo
        }
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

        {marcacoesY.map(
          (valor) => {
            const y =
              escalaY(
                valor
              );

            return (
              <g
                key={`y-${valor}`}
              >
                <line
                  className="precipitacaoDerivativeGrid"
                  x1={
                    margemEsquerda
                  }
                  x2={
                    largura -
                    margemDireita
                  }
                  y1={y}
                  y2={y}
                />

                <text
                  className="precipitacaoDerivativeTick"
                  x={
                    margemEsquerda -
                    12
                  }
                  y={
                    y + 4
                  }
                  textAnchor="end"
                >
                  {formatarNumeroBR(
                    valor,
                    3
                  )}
                </text>
              </g>
            );
          }
        )}

        {marcacoesX.map(
          (volume) => {
            const x =
              escalaX(
                volume
              );

            return (
              <g
                key={`x-${volume}`}
              >
                <line
                  className="precipitacaoDerivativeGrid"
                  x1={x}
                  x2={x}
                  y1={
                    margemSuperior
                  }
                  y2={
                    altura -
                    margemInferior
                  }
                />

                <text
                  className="precipitacaoDerivativeTick"
                  x={x}
                  y={
                    altura -
                    margemInferior +
                    28
                  }
                  textAnchor="middle"
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
          className="precipitacaoDerivativeAxis"
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
        />

        <line
          className="precipitacaoDerivativeAxis"
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
        />

        {yZero !== null && (
          <line
            className="precipitacaoDerivativeZeroLine"
            x1={
              margemEsquerda
            }
            x2={
              largura -
              margemDireita
            }
            y1={
              yZero
            }
            y2={
              yZero
            }
          />
        )}

        <path
          className="precipitacaoDerivativeCurve"
          d={
            caminho
          }
        />

{volumesEventos.map(
  (
    volumeEvento,
    indice
  ) => {
    if (
      volumeEvento <
        volumeMinimo ||
      volumeEvento >
        volumeMaximo
    ) {
      return null;
    }

    /*
     * O volume de um cruzamento pode ter sido
     * obtido por interpolação e, portanto, não
     * precisa coincidir exatamente com um dos
     * pontos discretos da curva.
     */
    const pontoMaisProximo =
      pontosValidos.reduce(
        (
          melhor,
          ponto
        ) =>
          Math.abs(
            ponto.volumeAdicionado -
              volumeEvento
          ) <
          Math.abs(
            melhor.volumeAdicionado -
              volumeEvento
          )
            ? ponto
            : melhor,
        pontosValidos[0]
      );

    const x =
      escalaX(
        limitar({
          valor:
            volumeEvento,
          minimo:
            volumeMinimo,
          maximo:
            volumeMaximo,
        })
      );

    /*
     * Na primeira derivada, o evento é um extremo
     * local e deve ser desenhado sobre a própria
     * curva.
     *
     * Na segunda derivada, o evento representa um
     * cruzamento por zero e deve ser desenhado
     * exatamente em y = 0.
     */
    const valorVerticalEvento =
      posicionarEventosNoZero
        ? 0
        : pontoMaisProximo.valor;

    const y =
      escalaY(
        valorVerticalEvento
      );

    /*
     * Evita que rótulos próximos da margem direita
     * ultrapassem a área visível do SVG.
     */
    const rotuloProximoDaDireita =
      x >
      largura -
        margemDireita -
        55;

    const deslocamentoRotuloX =
      rotuloProximoDaDireita
        ? -8
        : 8;

    const alinhamentoRotulo =
      rotuloProximoDaDireita
        ? "end"
        : "start";

    return (
      <g
        key={`${prefixoEvento}-${volumeEvento}-${indice}`}
      >
        <line
          className="precipitacaoDerivativePELine"
          x1={x}
          x2={x}
          y1={
            margemSuperior
          }
          y2={
            altura -
            margemInferior
          }
        />

        <circle
          cx={x}
          cy={y}
          r="5"
          fill="#ffffff"
          stroke="#991b1b"
          strokeWidth="3"
        />

        <text
          className="precipitacaoDerivativePELabel"
          x={
            x +
            deslocamentoRotuloX
          }
          y={
            margemSuperior +
            16
          }
          textAnchor={
            alinhamentoRotulo
          }
        >
          {prefixoEvento}
          {indice + 1}
        </text>
      </g>
    );
  }
)}

        <text
          className="precipitacaoDerivativeAxisLabel"
          x={
            margemEsquerda +
            larguraUtil / 2
          }
          y={
            altura - 14
          }
          textAnchor="middle"
        >
          Volume de titulante adicionado (mL)
        </text>

        <text
          className="precipitacaoDerivativeAxisLabel"
          x="20"
          y={
            margemSuperior +
            alturaUtil / 2
          }
          textAnchor="middle"
          transform={`rotate(-90 20 ${
            margemSuperior +
            alturaUtil / 2
          })`}
        >
          {rotuloEixoY}
        </text>
      </svg>
    </article>
  );
}

export default function GraficoDerivadas({
  resultado,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
}: GraficoDerivadasProps) {
  const curva =
    useMemo(
      () =>
      gerarCurvaSeletividadePrecipitacao({
        resultado,
        volumeAmostra,
        concentracaoTitulante,
        passo: 0.05,
        volumeMaximoManual:
          volumeMaximoBureta,
        incluirVolumesObrigatorios:
          false,
      }),
      [
        resultado,
        volumeAmostra,
        concentracaoTitulante,
        volumeMaximoBureta,
      ]
    );

  const derivadas =
    useMemo(
      () =>
        calcularDerivadasCurvaSeletividade({
          pontos:
            curva
              .serieMistura
              .pontos,
        }),
      [
        curva,
      ]
    );

  const eventosEsperados =
    resultado.itens.length;

  const quantidadeEventos =
    derivadas.eventos.length;

  const quantidadeCruzamentos =
    derivadas
      .cruzamentosZero
      .length;

  const maiorInclinacao =
    derivadas
      .primeiraDerivada
      .reduce(
        (
          maior,
          ponto
        ) =>
          ponto
            .moduloPrimeiraDerivada >
          maior
            ? ponto
                .moduloPrimeiraDerivada
            : maior,
        0
      );

  const volumesEventos =
    derivadas.eventos.map(
      (evento) =>
        evento.volumeAdicionado
    );

  const distanciaEntreEventos =
    volumesEventos.length >= 2
      ? Math.min(
          ...volumesEventos
            .slice(1)
            .map(
              (
                volume,
                indice
              ) =>
                Math.abs(
                  volume -
                    volumesEventos[
                      indice
                    ]
                )
            )
        )
      : null;

  let tituloDiagnostico: string;
  let textoDiagnostico: string;

  if (
    quantidadeEventos === 0
  ) {
    tituloDiagnostico =
      "Eventos não resolvidos";

    textoDiagnostico =
      "A derivada não apresentou extremos suficientemente definidos. Isso pode ocorrer quando as transições são suaves, quando há forte sobreposição entre os processos ou quando os eventos estão fora do intervalo calculado.";
  } else if (
    quantidadeEventos <
    eventosEsperados
  ) {
    tituloDiagnostico =
      "Sobreposição provável";

    textoDiagnostico =
      `O sistema possui ${eventosEsperados} espécies avaliadas, mas apenas ${quantidadeEventos} evento(s) predominante(s) foi(ram) identificado(s) na primeira derivada. Dois ou mais processos químicos podem estar sobrepostos na curva.`;
  } else if (
    quantidadeEventos ===
    eventosEsperados
  ) {
    tituloDiagnostico =
      "Eventos numericamente resolvidos";

    textoDiagnostico =
      `Foram identificados ${quantidadeEventos} eventos relevantes, quantidade compatível com o número de espécies avaliadas. Isso indica que as mudanças de inclinação são numericamente distinguíveis, mas não comprova isoladamente uma separação quantitativa.`;
  } else {
    tituloDiagnostico =
      "Eventos adicionais identificados";

    textoDiagnostico =
      "A quantidade de extremos encontrados é maior que o número de espécies avaliadas. Parte desses extremos pode estar associada a transições secundárias ou a oscilações numéricas da curva.";
  }

  const mapaPrimeiraDerivada =
    new Map(
      derivadas
        .primeiraDerivada
        .map(
          (ponto) => [
            ponto
              .volumeAdicionado
              .toFixed(10),
            ponto
              .primeiraDerivada,
          ]
        )
    );

  const mapaSegundaDerivada =
    new Map(
      derivadas
        .segundaDerivada
        .map(
          (ponto) => [
            ponto
              .volumeAdicionado
              .toFixed(10),
            ponto
              .segundaDerivada,
          ]
        )
    );

  const pontosPrimeira =
    derivadas
      .primeiraDerivada
      .map(
        (ponto) => ({
          volumeAdicionado:
            ponto.volumeAdicionado,
          valor:
            ponto.primeiraDerivada,
        })
      );

  const pontosSegunda =
    derivadas
      .segundaDerivada
      .map(
        (ponto) => ({
          volumeAdicionado:
            ponto.volumeAdicionado,
          valor:
            ponto.segundaDerivada,
        })
      );

  return (
    <section className="precipitacaoDerivativeSection">
      <header className="precipitacaoDerivativeIntro">
        <span className="precipitacaoSectionLabel">
          Tratamento numérico
        </span>

        <h5>
          Localização dos eventos de precipitação
        </h5>

        <p>
          As derivadas numéricas evidenciam as
          regiões de maior variação da curva de p
          {curva.formulaTitulante}. Extremos da
          primeira derivada e cruzamentos da segunda
          derivada auxiliam na localização dos
          eventos de precipitação. Em sistemas com
          sobreposição, mais de um processo químico
          pode aparecer como um único evento
          numérico.
        </p>
      </header>

      <div className="precipitacaoDerivativeSummary">
        <article>
          <span>
            Eventos esperados
          </span>

          <strong>
            {eventosEsperados}
          </strong>

          <small>
            Número de espécies avaliadas
          </small>
        </article>

        <article>
          <span>
            Eventos pela 1ª derivada
          </span>

          <strong>
            {quantidadeEventos}
          </strong>

          <small>
            Extremos relevantes de |dp/dV|
          </small>
        </article>

        <article>
          <span>
            Cruzamentos da 2ª derivada
          </span>

          <strong>
            {quantidadeCruzamentos}
          </strong>

          <small>
            Mudanças de sinal de d²p/dV²
          </small>
        </article>

        <article>
          <span>
            Maior inclinação
          </span>

          <strong>
            {formatarNumeroBR(
              maiorInclinacao,
              4
            )}
          </strong>

          <small>
            Unidade de p
            {curva.formulaTitulante}/mL
          </small>
        </article>
      </div>

      <div className="precipitacaoDerivativeComparison">
        <div>
          <span>
            Resolução dos eventos
          </span>

          <strong>
            {tituloDiagnostico}
          </strong>
        </div>

        <div>
          <span>
            Distância mínima
          </span>

          <strong>
            {distanciaEntreEventos ===
            null
              ? "Não disponível"
              : `${formatarNumeroBR(
                  distanciaEntreEventos,
                  3
                )} mL`}
          </strong>
        </div>

        <p>
          {textoDiagnostico}
        </p>
      </div>

      <div className="precipitacaoDerivativeCharts">
  <GraficoDerivada
    titulo="Primeira derivada"
    descricao={`Taxa de variação de p${curva.formulaTitulante} em relação ao volume de titulante adicionado.`}
    rotuloEixoY={`dp${curva.formulaTitulante}/dV`}
    pontos={
      pontosPrimeira
    }
    volumesEventos={
      volumesEventos
    }
    prefixoEvento="E"
    nomeArquivo="primeira-derivada-seletividade.png"
    mostrarLinhaZero
  />

  <GraficoDerivada
    titulo="Segunda derivada"
    descricao={`Taxa de variação de dp${curva.formulaTitulante}/dV em relação ao volume de titulante adicionado.`}
    rotuloEixoY={`d²p${curva.formulaTitulante}/dV²`}
    pontos={
      pontosSegunda
    }
    volumesEventos={
      derivadas
        .cruzamentosZero
    }
    prefixoEvento="Z"
    nomeArquivo="segunda-derivada-seletividade.png"
    mostrarLinhaZero
    posicionarEventosNoZero
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
            Passo:{" "}
            {formatarNumeroBR(
              curva.passo,
              2
            )}{" "}
            mL
          </span>
        </header>

        <div className="precipitacaoDerivativeTableWrapper">
          <table>
            <thead>
              <tr>
                <th>
                  Volume de titulante
                </th>

                <th>
                  p{curva.formulaTitulante}
                </th>

                <th>
  dp{curva.formulaTitulante}/dV
</th>
<th>
  d²p{curva.formulaTitulante}/dV²
</th>
              </tr>
            </thead>

            <tbody>
              {curva
                .serieMistura
                .pontos
                .filter(
                  (ponto) =>
                    Number.isFinite(
                      ponto.pTitulante
                    )
                )
                .map(
                  (ponto) => {
                    const chave =
                      ponto
                        .volumeAdicionado
                        .toFixed(10);

                    const primeiraDerivada =
                      mapaPrimeiraDerivada.get(
                        chave
                      );

                    const segundaDerivada =
                      mapaSegundaDerivada.get(
                        chave
                      );

                    const eventoProximo =
                      volumesEventos.some(
                        (volume) =>
                          Math.abs(
                            volume -
                              ponto.volumeAdicionado
                          ) <=
                          curva.passo /
                            2
                      );

                    return (
                      <tr
                        key={
                          chave
                        }
                        className={
                          eventoProximo
                            ? "precipitacaoDerivativePERow"
                            : undefined
                        }
                      >
                        <td>
                          {formatarNumeroBR(
                            ponto.volumeAdicionado,
                            2
                          )}{" "}
                          mL
                        </td>

                        <td>
                          {formatarNumeroBR(
                            ponto.pTitulante,
                            4
                          )}
                        </td>

                        <td>
                          {primeiraDerivada ===
                          undefined
                            ? "—"
                            : formatarNumeroBR(
                                primeiraDerivada,
                                6
                              )}
                        </td>

                        <td>
                          {segundaDerivada ===
                          undefined
                            ? "—"
                            : formatarNumeroBR(
                                segundaDerivada,
                                6
                              )}
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="precipitacaoResultScientificNote">
        <strong>
          Interpretação científica
        </strong>

        <p>
          A identificação de eventos distintos nas
          derivadas indica que as mudanças de
          inclinação da curva podem ser diferenciadas
          numericamente. Entretanto, isso não garante
          que a primeira espécie esteja
          quantitativamente precipitada antes do
          início da seguinte. A conclusão deve ser
          analisada em conjunto com a classificação
          percentual da separação.
        </p>
      </div>
    </section>
  );
}