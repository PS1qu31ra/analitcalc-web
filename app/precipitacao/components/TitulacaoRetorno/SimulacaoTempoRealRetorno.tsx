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
  PontoCurvaTitulacaoRetornoPrecipitacao,
  ResultadoTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/tipos";

type SimulacaoTempoRealRetornoProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

type PontoAdicionadoRetorno = {
  id: number;
  incremento: number;
  ponto: PontoCurvaTitulacaoRetornoPrecipitacao;
};

const incrementosRapidos = [
  0.05,
  0.1,
  0.5,
  1,
  5,
];

function converterNumeroBR(
  valor: string
) {
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

export default function SimulacaoTempoRealRetorno({
  resultado,
}: SimulacaoTempoRealRetornoProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const proximoIdRef =
    useRef(1);

  const [
    pontosAdicionados,
    setPontosAdicionados,
  ] = useState<
    PontoAdicionadoRetorno[]
  >([]);

  const [
    volumePersonalizado,
    setVolumePersonalizado,
  ] = useState("");

  const [
    erroEntrada,
    setErroEntrada,
  ] = useState("");

  const curvaIdeal =
    useMemo(
      () =>
        gerarCurvaTitulacaoRetorno({
          resultado,
          passo: 0.05,
        }),
      [resultado]
    );

  const volumePontoFinal =
    curvaIdeal
      .volumePontoFinalRetorno;

  const volumeMaximo =
    Number.isFinite(
      curvaIdeal.volumeMaximo
    ) &&
    curvaIdeal.volumeMaximo > 0
      ? curvaIdeal.volumeMaximo
      : Math.max(
          resultado
            .volumeTitulanteRetorno *
            1.6,
          1
        );

  useEffect(() => {
    setPontosAdicionados([]);
    setVolumePersonalizado("");
    setErroEntrada("");
    proximoIdRef.current = 1;
  }, [resultado]);

  const volumeAtual =
    pontosAdicionados.length > 0
      ? pontosAdicionados[
          pontosAdicionados.length - 1
        ].ponto.volumeAdicionado
      : 0;

  const pontoAtual =
    useMemo(
      () =>
        calcularPontoCurvaTitulacaoRetorno(
          resultado,
          volumeAtual
        ),
      [
        resultado,
        volumeAtual,
      ]
    );

  const interpretacaoAtual =
    useMemo(() => {
      if (
        pontoAtual.regiao ===
        "Dados inválidos"
      ) {
        return {
          titulo:
            "Não foi possível interpretar este ponto",
          texto:
            "Os dados disponíveis não permitiram calcular o equilíbrio entre Ag⁺ e SCN⁻.",
        };
      }

      if (
        pontoAtual.regiao ===
        "Antes do retorno"
      ) {
        return {
          titulo:
            "Ag⁺ ainda em excesso",
          texto:
            "Antes do ponto final, ainda existe Ag⁺ remanescente na solução. O SCN⁻ adicionado é consumido predominantemente na formação de AgSCN(s), reduzindo progressivamente a concentração livre de Ag⁺.",
        };
      }

      if (
        pontoAtual.regiao ===
        "No ponto final do retorno"
      ) {
        return {
          titulo:
            "Ponto final do retorno atingido",
          texto:
            "A quantidade adicionada de SCN⁻ corresponde estequiometricamente à quantidade de Ag⁺ que permaneceu em excesso após a precipitação do analito. As concentrações livres são controladas pelo equilíbrio de solubilidade do AgSCN.",
        };
      }

      return {
        titulo:
          "SCN⁻ em excesso",
        texto:
          "Após o ponto final, o Ag⁺ remanescente já foi consumido estequiometricamente. O SCN⁻ adicionado passa a permanecer livre em excesso na solução e pode formar o complexo colorido com Fe³⁺.",
      };
    }, [pontoAtual.regiao]);

  function adicionarIncremento(
    incremento: number
  ) {
    if (
      !Number.isFinite(incremento) ||
      incremento <= 0
    ) {
      setErroEntrada(
        "Informe um incremento maior que zero."
      );

      return;
    }

    const novoVolume =
      volumeAtual + incremento;

    if (
      novoVolume >
      volumeMaximo + 1e-10
    ) {
      setErroEntrada(
        `O volume acumulado não pode ultrapassar ${formatarNumeroBR(
          volumeMaximo,
          2
        )} mL.`
      );

      return;
    }

    const ponto =
      calcularPontoCurvaTitulacaoRetorno(
        resultado,
        novoVolume
      );

    if (
      ponto.regiao ===
        "Dados inválidos" ||
      !Number.isFinite(
        ponto.pPrecipitante
      )
    ) {
      setErroEntrada(
        "Não foi possível calcular esse ponto."
      );

      return;
    }

    setPontosAdicionados(
      (pontosAtuais) => [
        ...pontosAtuais,
        {
          id:
            proximoIdRef.current++,
          incremento,
          ponto,
        },
      ]
    );

    setErroEntrada("");
  }

  function adicionarPersonalizado(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const incremento =
      converterNumeroBR(
        volumePersonalizado
      );

    adicionarIncremento(
      incremento
    );

    if (
      Number.isFinite(incremento) &&
      incremento > 0
    ) {
      setVolumePersonalizado("");
    }
  }

  function irParaPontoFinal() {
    const incremento =
      volumePontoFinal -
      volumeAtual;

    if (
      Math.abs(incremento) <=
      1e-10
    ) {
      setErroEntrada(
        "O ponto final já foi atingido."
      );

      return;
    }

    if (incremento < 0) {
      setErroEntrada(
        "O volume atual já ultrapassou o ponto final."
      );

      return;
    }

    adicionarIncremento(
      incremento
    );
  }

  function desfazerUltimaAdicao() {
    setPontosAdicionados(
      (pontosAtuais) =>
        pontosAtuais.slice(
          0,
          -1
        )
    );

    setErroEntrada("");
  }

  function limparSimulacao() {
    setPontosAdicionados([]);
    setVolumePersonalizado("");
    setErroEntrada("");
    proximoIdRef.current = 1;
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
      "920"
    );

    clone.setAttribute(
      "height",
      "650"
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
      "920"
    );

    fundo.setAttribute(
      "height",
      "650"
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

      .precipitacaoRealtimeGrid {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .precipitacaoRealtimeAxis {
        stroke: #71717a;
        stroke-width: 1.4;
      }

      .precipitacaoRealtimeIdealCurve {
        fill: none;
        stroke: #e4b3b3;
        stroke-width: 2.5;
      }

      .precipitacaoRealtimeExperimentalCurve {
        fill: none;
        stroke: #e11d48;
        stroke-width: 3;
        stroke-dasharray: 8 6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .precipitacaoRealtimePoint {
        fill: #f43f5e;
        stroke: #ffffff;
        stroke-width: 3;
      }

      .precipitacaoRealtimePELine {
        stroke: #18181b;
        stroke-width: 1.8;
        stroke-dasharray: 6 6;
      }

      .precipitacaoRealtimePEPoint {
        fill: #18181b;
        stroke: #ffffff;
        stroke-width: 3;
      }

      .precipitacaoRealtimeTick {
        fill: #71717a;
        font-size: 11px;
      }

      .precipitacaoRealtimeLabel {
        fill: #18181b;
        font-size: 12px;
        font-weight: 700;
      }

      .precipitacaoRealtimeLastLabel {
        fill: #9f1239;
        font-size: 12px;
        font-weight: 900;
      }
    `;

    clone.prepend(
      estilos
    );

    clone.prepend(
      fundo
    );

    const conteudoSvg =
      new XMLSerializer()
        .serializeToString(
          clone
        );

    const blobSvg =
      new Blob(
        [conteudoSvg],
        {
          type:
            "image/svg+xml;charset=utf-8",
        }
      );

    const urlSvg =
      URL.createObjectURL(
        blobSvg
      );

    const imagem =
      new Image();

    imagem.onload = () => {
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = 1840;
      canvas.height = 1300;

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
        (blobPng) => {
          if (!blobPng) {
            URL.revokeObjectURL(
              urlSvg
            );

            return;
          }

          const urlPng =
            URL.createObjectURL(
              blobPng
            );

          const link =
            document.createElement(
              "a"
            );

          link.href =
            urlPng;

          link.download =
            "simulacao-tempo-real-retorno-volhard.png";

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
    <section className="precipitacaoRealtimeSection">
      <header className="precipitacaoRealtimeIntro">
        <span className="precipitacaoSectionLabel">
          Simulação em tempo real
        </span>

        <h5>
          Simulação da retrotitulação de Volhard
        </h5>

        <p>
          Adicione SCN⁻ gradualmente e acompanhe
          a variação de pAg⁺. A linha clara
          representa a curva teórica, enquanto os
          pontos destacados correspondem aos
          volumes adicionados nesta simulação.
        </p>
      </header>

      <div className="precipitacaoRealtimeWorkspace">
        <aside className="precipitacaoRealtimeControls">
          <header>
            <span className="precipitacaoSectionLabel">
              Controles da retrotitulação
            </span>

            <h6>
              Adição de SCN⁻
            </h6>
          </header>

          <div className="precipitacaoRealtimeVolumeCard">
            <span>
              Volume atual
            </span>

            <strong>
              {formatarNumeroBR(
                volumeAtual,
                2
              )}{" "}
              mL
            </strong>

            <small>
              Limite da simulação:{" "}
              {formatarNumeroBR(
                volumeMaximo,
                2
              )}{" "}
              mL
            </small>
          </div>

          <div className="precipitacaoRealtimeQuickButtons">
            {incrementosRapidos.map(
              (incremento) => (
                <button
                  key={
                    incremento
                  }
                  type="button"
                  onClick={() =>
                    adicionarIncremento(
                      incremento
                    )
                  }
                  disabled={
                    volumeAtual +
                      incremento >
                    volumeMaximo
                  }
                >
                  +
                  {formatarNumeroBR(
                    incremento,
                    2
                  )}{" "}
                  mL
                </button>
              )
            )}
          </div>

          <form
            className="precipitacaoRealtimeCustomForm"
            onSubmit={
              adicionarPersonalizado
            }
          >
            <label htmlFor="volumePersonalizadoRetorno">
              Adicionar volume personalizado
            </label>

            <div className="precipitacaoRealtimeInputGroup">
              <input
                id="volumePersonalizadoRetorno"
                type="text"
                inputMode="decimal"
                value={
                  volumePersonalizado
                }
                onChange={(event) => {
                  setVolumePersonalizado(
                    event.target.value
                  );

                  setErroEntrada("");
                }}
                placeholder="Ex.: 2,50"
              />

              <span>
                mL
              </span>
            </div>

            <button type="submit">
              Adicionar
            </button>
          </form>

          {erroEntrada && (
            <p className="precipitacaoRealtimeError">
              {erroEntrada}
            </p>
          )}

          <div className="precipitacaoRealtimeSecondaryActions">
            <button
              type="button"
              onClick={
                irParaPontoFinal
              }
            >
              Ir para o PF
            </button>

            <button
              type="button"
              onClick={
                desfazerUltimaAdicao
              }
              disabled={
                pontosAdicionados.length ===
                0
              }
            >
              Desfazer última adição
            </button>

            <button
              type="button"
              onClick={
                limparSimulacao
              }
              disabled={
                pontosAdicionados.length ===
                0
              }
            >
              Limpar
            </button>
          </div>
        </aside>

        <section className="precipitacaoRealtimeGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Simulação em tempo real
              </span>

              <h6>
                Curva ideal e sequência adicionada
              </h6>

              <p>
                Os pontos e a linha tracejada
                representam a sequência experimental
                simulada de adição de SCN⁻.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoRealtimeDownloadButton"
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

          <GraficoTempoRealRetorno
            graficoRef={
              graficoRef
            }
            curvaIdeal={
              curvaIdeal.pontos
            }
            pontosAdicionados={
              pontosAdicionados
            }
            volumePontoFinal={
              volumePontoFinal
            }
          />

          <footer className="precipitacaoRealtimeLegend">
            <span>
              <i className="precipitacaoRealtimeLegendIdeal" />
              Curva ideal
            </span>

            <span>
              <i className="precipitacaoRealtimeLegendExperimental" />
              Pontos adicionados
            </span>

            <span>
              <i className="precipitacaoRealtimeLegendPE" />
              Ponto final
            </span>
          </footer>
        </section>
      </div>

      <section className="precipitacaoRealtimeCurrentPoint">
        <header>
          <span className="precipitacaoSectionLabel">
            Ponto atual
          </span>

          <h6>
            Estado da retrotitulação em{" "}
            {formatarNumeroBR(
              volumeAtual,
              2
            )}{" "}
            mL
          </h6>
        </header>

        <div className="precipitacaoRealtimeCurrentGrid">
          <article>
            <span>
              Volume de SCN⁻
            </span>

            <strong>
              {formatarNumeroBR(
                volumeAtual,
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>
              pAg⁺
            </span>

            <strong>
              {formatarNumeroBR(
                pontoAtual
                  .pPrecipitante,
                4
              )}
            </strong>
          </article>

          <article>
            <span>
              Região da curva
            </span>

            <strong>
              {volumeAtual === 0
                ? "Início"
                : pontoAtual.regiao}
            </strong>
          </article>

          <article>
            <span>
              Ag⁺ consumido no retorno
            </span>

            <strong>
              {formatarNumeroBR(
                pontoAtual
                  .percentualRetorno,
                2
              )}
              %
            </strong>
          </article>

          <article>
            <span>
              [Ag⁺] livre
            </span>

            <strong>
              {formatarCientificoBR(
                pontoAtual
                  .concentracaoPrecipitanteLivre,
                3
              )}{" "}
              mol/L
            </strong>
          </article>

          <article>
            <span>
              [SCN⁻] livre
            </span>

            <strong>
              {formatarCientificoBR(
                pontoAtual
                  .concentracaoTitulanteRetornoLivre,
                3
              )}{" "}
              mol/L
            </strong>
          </article>
        </div>

        <div className="precipitacaoRealtimeInterpretation">
          <strong>
            {
              interpretacaoAtual.titulo
            }
          </strong>

          <p>
            {
              interpretacaoAtual.texto
            }
          </p>
        </div>
      </section>

      <section className="precipitacaoRealtimeHistory">
        <header>
          <div>
            <span className="precipitacaoSectionLabel">
              Pontos adicionados
            </span>

            <h6>
              Histórico da simulação
            </h6>
          </div>

          <span>
            {pontosAdicionados.length} ponto(s)
          </span>
        </header>

        {pontosAdicionados.length ===
        0 ? (
          <div className="precipitacaoRealtimeEmptyHistory">
            Nenhum ponto adicionado ainda.
          </div>
        ) : (
          <div className="precipitacaoRealtimeTableWrapper">
            <table>
              <thead>
                <tr>
                  <th>
                    Etapa
                  </th>

                  <th>
                    Incremento
                  </th>

                  <th>
                    Volume acumulado
                  </th>

                  <th>
                    Região
                  </th>

                  <th>
                    pAg⁺
                  </th>

                  <th>
                    [Ag⁺] livre
                  </th>

                  <th>
                    [SCN⁻] livre
                  </th>

                  <th>
                    Ag⁺ consumido
                  </th>
                </tr>
              </thead>

              <tbody>
                {pontosAdicionados.map(
                  (
                    item,
                    indice
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                      className={
                        item.ponto
                          .regiao ===
                        "No ponto final do retorno"
                          ? "precipitacaoRealtimePERow"
                          : undefined
                      }
                    >
                      <td>
                        {indice + 1}
                      </td>

                      <td>
                        +
                        {formatarNumeroBR(
                          item.incremento,
                          2
                        )}{" "}
                        mL
                      </td>

                      <td>
                        {formatarNumeroBR(
                          item.ponto
                            .volumeAdicionado,
                          2
                        )}{" "}
                        mL
                      </td>

                      <td>
                        {
                          item.ponto
                            .regiao
                        }
                      </td>

                      <td>
                        {formatarNumeroBR(
                          item.ponto
                            .pPrecipitante,
                          4
                        )}
                      </td>

                      <td>
                        {formatarCientificoBR(
                          item.ponto
                            .concentracaoPrecipitanteLivre,
                          3
                        )}{" "}
                        mol/L
                      </td>

                      <td>
                        {formatarCientificoBR(
                          item.ponto
                            .concentracaoTitulanteRetornoLivre,
                          3
                        )}{" "}
                        mol/L
                      </td>

                      <td>
                        {formatarNumeroBR(
                          item.ponto
                            .percentualRetorno,
                          2
                        )}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

type GraficoTempoRealRetornoProps = {
  graficoRef:
    React.RefObject<SVGSVGElement>;
  curvaIdeal:
    PontoCurvaTitulacaoRetornoPrecipitacao[];
  pontosAdicionados:
    PontoAdicionadoRetorno[];
  volumePontoFinal: number;
};

function GraficoTempoRealRetorno({
  graficoRef,
  curvaIdeal,
  pontosAdicionados,
  volumePontoFinal,
}: GraficoTempoRealRetornoProps) {
  const largura = 920;
  const altura = 650;

  const margemEsquerda = 75;
  const margemDireita = 30;
  const margemSuperior = 35;
  const margemInferior = 65;

  const larguraUtil =
    largura -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    altura -
    margemSuperior -
    margemInferior;

  const pontosValidos =
    curvaIdeal.filter(
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
    return null;
  }

  const volumeMinimo =
    Math.min(
      ...pontosValidos.map(
        (ponto) =>
          ponto.volumeAdicionado
      )
    );

  const volumeMaximo =
    Math.max(
      ...pontosValidos.map(
        (ponto) =>
          ponto.volumeAdicionado
      )
    );

  const pMinimoBruto =
    Math.min(
      ...pontosValidos.map(
        (ponto) =>
          ponto.pPrecipitante
      )
    );

  const pMaximoBruto =
    Math.max(
      ...pontosValidos.map(
        (ponto) =>
          ponto.pPrecipitante
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
    valorP: number
  ) {
    return (
      margemSuperior +
      (
        (
          pMaximo -
          valorP
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

  const caminhoIdeal =
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
            ponto.volumeAdicionado
          )} ${converterY(
            ponto.pPrecipitante
          )}`
      )
      .join(" ");

  const pontosExperimentais =
    pontosAdicionados
      .map(
        (item) =>
          item.ponto
      )
      .filter(
        (ponto) =>
          Number.isFinite(
            ponto.pPrecipitante
          )
      );

  const caminhoExperimental =
    pontosExperimentais
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
            ponto.pPrecipitante
          )}`
      )
      .join(" ");

  const pontoFinal =
    pontosValidos.reduce(
      (
        maisProximo,
        atual
      ) =>
        Math.abs(
          atual.volumeAdicionado -
          volumePontoFinal
        ) <
        Math.abs(
          maisProximo.volumeAdicionado -
          volumePontoFinal
        )
          ? atual
          : maisProximo,
      pontosValidos[0]
    );

  const ultimoPonto =
    pontosExperimentais[
      pontosExperimentais.length - 1
    ];

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
        pMaximo -
        (
          (
            pMaximo -
            pMinimo
          ) /
          4
        ) *
          indice
    );

  return (
    <svg
      ref={graficoRef}
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Simulação em tempo real da curva de retrotitulação de Volhard"
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
                className="precipitacaoRealtimeGrid"
              />

              <text
                x={
                  margemEsquerda -
                  11
                }
                y={y + 4}
                textAnchor="end"
                className="precipitacaoRealtimeTick"
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
                className="precipitacaoRealtimeGrid"
              />

              <text
                x={x}
                y={
                  altura -
                  margemInferior +
                  25
                }
                textAnchor="middle"
                className="precipitacaoRealtimeTick"
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
          altura -
          margemInferior
        }
        className="precipitacaoRealtimeAxis"
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
        className="precipitacaoRealtimeAxis"
      />

      <path
        d={caminhoIdeal}
        className="precipitacaoRealtimeIdealCurve"
      />

      {pontosExperimentais.length >
        1 && (
        <path
          d={
            caminhoExperimental
          }
          className="precipitacaoRealtimeExperimentalCurve"
        />
      )}

      <line
        x1={converterX(
          volumePontoFinal
        )}
        y1={margemSuperior}
        x2={converterX(
          volumePontoFinal
        )}
        y2={
          altura -
          margemInferior
        }
        className="precipitacaoRealtimePELine"
      />

      <circle
        cx={converterX(
          volumePontoFinal
        )}
        cy={converterY(
          pontoFinal
            .pPrecipitante
        )}
        r="7"
        className="precipitacaoRealtimePEPoint"
      />

      <text
        x={
          converterX(
            volumePontoFinal
          ) + 9
        }
        y={
          converterY(
            pontoFinal
              .pPrecipitante
          ) - 10
        }
        className="precipitacaoRealtimeLabel"
      >
        PF
      </text>

      {pontosExperimentais.map(
        (
          ponto,
          indice
        ) => (
          <circle
            key={`${ponto.volumeAdicionado}-${indice}`}
            cx={converterX(
              ponto.volumeAdicionado
            )}
            cy={converterY(
              ponto.pPrecipitante
            )}
            r={
              indice ===
              pontosExperimentais.length -
                1
                ? 7
                : 6
            }
            className="precipitacaoRealtimePoint"
          />
        )
      )}

      {ultimoPonto && (
        <text
          x={
            converterX(
              ultimoPonto
                .volumeAdicionado
            ) + 12
          }
          y={
            converterY(
              ultimoPonto
                .pPrecipitante
            ) - 10
          }
          textAnchor="start"
          className="precipitacaoRealtimeLastLabel"
        >
          {formatarNumeroBR(
            ultimoPonto
              .volumeAdicionado,
            2
          )}{" "}
          mL
        </text>
      )}

      <text
        x={
          largura /
          2
        }
        y={
          altura -
          15
        }
        textAnchor="middle"
        className="precipitacaoRealtimeLabel"
      >
        Volume de SCN⁻ adicionado (mL)
      </text>

      <text
        x="20"
        y={
          altura /
          2
        }
        textAnchor="middle"
        transform={`rotate(-90 20 ${altura / 2})`}
        className="precipitacaoRealtimeLabel"
      >
        pAg⁺
      </text>
    </svg>
  );
}