"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";

import {
  avaliarInterferenciasRetornoPrecipitacao,
  type EtapaInterferenciaRetorno,
  type InterferenciaRetornoPrecipitacao,
} from "@/lib/precipitacao/interferenciasRetorno";

import {
    calcularCurvaInterferenciaRetorno,
    type CurvaInterferenciaRetornoCalculada,
  } from "@/lib/precipitacao/calculosCurvaInterferenciasRetorno";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoRetornoPrecipitacao,
  RiscoInterferenciaPrecipitacao,
} from "@/lib/precipitacao/tipos";

type AnaliseInterferentesRetornoProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

type FiltroEtapa =
  | "todas"
  | EtapaInterferenciaRetorno;

function obterClasseRisco(
  risco: RiscoInterferenciaPrecipitacao
) {
  if (risco === "alto") {
    return "precipitacaoInterferenceRiskHigh";
  }

  if (risco === "moderado") {
    return "precipitacaoInterferenceRiskModerate";
  }

  return "precipitacaoInterferenceRiskLow";
}

function obterTituloEtapa(
  etapa: EtapaInterferenciaRetorno
) {
  return etapa ===
    "precipitacao-principal"
    ? "Precipitação principal"
    : "Titulação de retorno";
}

function obterDescricaoEtapa(
  etapa: EtapaInterferenciaRetorno
) {
  return etapa ===
    "precipitacao-principal"
    ? "A espécie pode consumir Ag⁺ antes da determinação da prata remanescente."
    : "A espécie pode consumir SCN⁻ durante a titulação do excesso de prata.";
}

function obterTituloRisco(
  risco: RiscoInterferenciaPrecipitacao
) {
  if (risco === "alto") {
    return "Interferência potencialmente crítica";
  }

  if (risco === "moderado") {
    return "Interferência potencialmente relevante";
  }

  return "Interferência potencialmente baixa";
}

export default function AnaliseInterferentesRetorno({
  resultado,
}: AnaliseInterferentesRetornoProps) {
    const graficoRef =
  useRef<SVGSVGElement>(null);
  const interferencias =
    useMemo(
      () =>
        avaliarInterferenciasRetornoPrecipitacao(
          resultado
        ),
      [resultado]
    );

  const [
    filtroEtapa,
    setFiltroEtapa,
  ] =
    useState<FiltroEtapa>(
      "todas"
    );

  const [
    interferenciaSelecionadaId,
    setInterferenciaSelecionadaId,
  ] =
    useState("");

  const formulaAnalito =
    resultado.especieAnalito ===
    "cation"
      ? resultado.salPrincipal
          .cation.formulaExibicao
      : resultado.salPrincipal
          .anion.formulaExibicao;

  const interferenciasFiltradas =
    useMemo(() => {
      if (
        filtroEtapa === "todas"
      ) {
        return interferencias;
      }

      return interferencias.filter(
        (interferencia) =>
          interferencia.etapa ===
          filtroEtapa
      );
    }, [
      filtroEtapa,
      interferencias,
    ]);

  useEffect(() => {
    const selecionadaAindaExiste =
      interferenciasFiltradas.some(
        (interferencia) =>
          interferencia.id ===
          interferenciaSelecionadaId
      );

    if (
      selecionadaAindaExiste
    ) {
      return;
    }

    setInterferenciaSelecionadaId(
      interferenciasFiltradas[0]
        ?.id ?? ""
    );
  }, [
    interferenciaSelecionadaId,
    interferenciasFiltradas,
  ]);

  const interferenciaSelecionada =
    useMemo(
      () =>
        interferenciasFiltradas.find(
          (interferencia) =>
            interferencia.id ===
            interferenciaSelecionadaId
        ) ??
        interferenciasFiltradas[0] ??
        null,
      [
        interferenciaSelecionadaId,
        interferenciasFiltradas,
      ]
    );

    const curvaInterferencia =
  useMemo(() => {
    if (
      !interferenciaSelecionada
    ) {
      return null;
    }

    return calcularCurvaInterferenciaRetorno({
      resultado,
      interferencia:
        interferenciaSelecionada,
    });
  }, [
    interferenciaSelecionada,
    resultado,
  ]);

  const resumoRiscos =
    useMemo(() => {
      return interferencias.reduce(
        (
          acumulador,
          interferencia
        ) => {
          acumulador[
            interferencia.risco
          ] += 1;

          return acumulador;
        },
        {
          alto: 0,
          moderado: 0,
          baixo: 0,
        } satisfies Record<
          RiscoInterferenciaPrecipitacao,
          number
        >
      );
    }, [interferencias]);

  const riscoGeral:
    RiscoInterferenciaPrecipitacao =
    resumoRiscos.alto > 0
      ? "alto"
      : resumoRiscos.moderado > 0
        ? "moderado"
        : "baixo";

  if (
    interferencias.length === 0
  ) {
    return (
      <section className="precipitacaoInterferenceSection">
        <div className="precipitacaoInterferenceEmpty">
          <span className="precipitacaoSectionLabel">
            Interferentes do retorno
          </span>

          <h5>
            Nenhum interferente foi identificado
          </h5>

          <p>
            A base atual não contém espécies
            concorrentes compatíveis com as etapas
            avaliadas do método de Volhard para este
            sistema.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="precipitacaoInterferenceSection">
      <header className="precipitacaoInterferenceIntro">
        <span className="precipitacaoSectionLabel">
          Interferentes do método de Volhard
        </span>

        <h5>
          Avaliação das etapas de precipitação e retorno
        </h5>

        <p>
          A análise considera espécies que podem
          consumir Ag⁺ durante a precipitação do
          analito ou consumir SCN⁻ durante a
          titulação da prata remanescente.
        </p>
      </header>

      <section className="precipitacaoInterferenceAssumption">
        <strong>
          Hipótese utilizada na triagem
        </strong>

        <p>
          Como a concentração real dos possíveis
          interferentes não foi informada, o sistema
          utiliza inicialmente a mesma concentração
          analítica de {formulaAnalito}. Portanto,
          esta classificação representa uma
          avaliação potencial e não uma confirmação
          experimental.
        </p>
      </section>

      <section className="precipitacaoInterferenceMetrics">
        <article>
          <span>
            Interferentes encontrados
          </span>

          <strong>
            {interferencias.length}
          </strong>

          <small>
            Nas duas etapas do método
          </small>
        </article>

        <article>
          <span>
            Risco alto
          </span>

          <strong>
            {resumoRiscos.alto}
          </strong>

          <small>
            Competição prioritária
          </small>
        </article>

        <article>
          <span>
            Risco moderado
          </span>

          <strong>
            {resumoRiscos.moderado}
          </strong>

          <small>
            Possível sobreposição
          </small>
        </article>

        <article>
          <span>
            Risco baixo
          </span>

          <strong>
            {resumoRiscos.baixo}
          </strong>

          <small>
            Menor tendência competitiva
          </small>
        </article>

        <article>
          <span>
            Precipitado principal
          </span>

          <strong>
            {
              resultado.salPrincipal
                .formulaExibicao
            }
          </strong>

          <small>
            Formado com Ag⁺
          </small>
        </article>

        <article>
          <span>
            Diagnóstico geral
          </span>

          <strong>
            Risco {riscoGeral}
          </strong>

          <small>
            Maior risco identificado
          </small>
        </article>
      </section>

      <section className="precipitacaoInterferenceCandidates">
        <header>
          <div>
            <span className="precipitacaoSectionLabel">
              Triagem automática
            </span>

            <h6>
              Espécies potencialmente interferentes
            </h6>
          </div>

          <label className="precipitacaoInterferenceStageFilter">
            Etapa avaliada

            <select
              value={filtroEtapa}
              onChange={(event) =>
                setFiltroEtapa(
                  event.target
                    .value as FiltroEtapa
                )
              }
            >
              <option value="todas">
                Todas
              </option>

              <option value="precipitacao-principal">
                Precipitação principal
              </option>

              <option value="titulacao-retorno">
                Titulação de retorno
              </option>
            </select>
          </label>
        </header>

        {interferenciasFiltradas.length >
        0 ? (
          <div className="precipitacaoInterferenceCandidateGrid">
            {interferenciasFiltradas.map(
              (interferencia) => {
                const ativa =
                  interferencia.id ===
                  interferenciaSelecionada
                    ?.id;

                return (
                  <button
                    key={
                      interferencia.id
                    }
                    type="button"
                    aria-pressed={
                      ativa
                    }
                    className={[
                      "precipitacaoInterferenceCandidate",
                      ativa
                        ? "precipitacaoInterferenceCandidateActive"
                        : "",
                    ].join(" ")}
                    onClick={() =>
                      setInterferenciaSelecionadaId(
                        interferencia.id
                      )
                    }
                  >
                    <div>
                      <strong>
                        {
                          interferencia
                            .especieInterferente
                            .formulaExibicao
                        }
                      </strong>

                      <span>
                        Forma{" "}
                        {
                          interferencia
                            .salInterferente
                            .formulaExibicao
                        }
                      </span>
                    </div>

                    <span
                      className={[
                        "precipitacaoInterferenceRiskBadge",
                        obterClasseRisco(
                          interferencia.risco
                        ),
                      ].join(" ")}
                    >
                      Risco{" "}
                      {
                        interferencia.risco
                      }
                    </span>

                    <small>
                      Consome{" "}
                      {
                        interferencia
                          .especieConsumida
                      }
                    </small>
                  </button>
                );
              }
            )}
          </div>
        ) : (
          <div className="precipitacaoInterferenceEmpty">
            Nenhuma espécie foi encontrada para a
            etapa selecionada.
          </div>
        )}
      </section>

      {interferenciaSelecionada && (
        <>
          <div className="precipitacaoInterferenceWorkspace">
            <aside className="precipitacaoInterferenceControls">
              <span className="precipitacaoSectionLabel">
                Espécie selecionada
              </span>

              <h6>
                {
                  interferenciaSelecionada
                    .especieInterferente
                    .formulaExibicao
                }
              </h6>

              <div className="precipitacaoInterferenceSelectedSalt">
                <span>
                  Precipitado concorrente
                </span>

                <strong>
                  {
                    interferenciaSelecionada
                      .salInterferente
                      .formulaExibicao
                  }
                </strong>

                <small>
                  Kps ={" "}
                  {formatarCientificoBR(
                    interferenciaSelecionada
                      .salInterferente
                      .kps,
                    3
                  )}
                </small>
              </div>

              <div className="precipitacaoInterferenceSelectedSalt">
                <span>
                  Etapa afetada
                </span>

                <strong>
                  {obterTituloEtapa(
                    interferenciaSelecionada
                      .etapa
                  )}
                </strong>

                <small>
                  {obterDescricaoEtapa(
                    interferenciaSelecionada
                      .etapa
                  )}
                </small>
              </div>

              <div className="precipitacaoInterferenceSelectedSalt">
                <span>
                  Reagente consumido
                </span>

                <strong>
                  {
                    interferenciaSelecionada
                      .especieConsumida
                  }
                </strong>

                <small>
                  Competição química prevista
                </small>
              </div>
            </aside>

            <section className="precipitacaoInterferenceGraphCard">
  <header>
    <div>
    <span className="precipitacaoSectionLabel">
  Curvas de precipitação concorrente
</span>

      <h6>
        Sistema de referência × interferente
      </h6>

      <p>
  O gráfico compara o sistema de referência, o
  precipitado interferente isolado e a mistura
  calculada durante a adição de{" "}
  {curvaInterferencia?.formulaTitulante ?? "reagente"}.
</p>
    </div>

    <button
      type="button"
      className="precipitacaoInterferenceDownloadButton"
      onClick={() => {
        const grafico = graficoRef.current;

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
          "940"
        );

        clone.setAttribute(
          "height",
          "580"
        );

        const fundo =
          document.createElementNS(
            namespaceSvg,
            "rect"
          );

        fundo.setAttribute("x", "0");
        fundo.setAttribute("y", "0");
        fundo.setAttribute(
          "width",
          "940"
        );
        fundo.setAttribute(
          "height",
          "580"
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

          .interferenceGraphGrid {
            stroke: #e4e4e7;
            stroke-width: 1;
          }

          .interferenceGraphAxis {
            stroke: #71717a;
            stroke-width: 1.4;
          }

          .interferenceGraphMixture {
            fill: none;
            stroke: #c4c4c9;
            stroke-width: 3.4;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .interferenceGraphMain {
            fill: none;
            stroke: #2563eb;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .interferenceGraphCompetitor {
            fill: none;
            stroke: #dc2626;
            stroke-width: 3;
            stroke-dasharray: 8 6;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .interferenceGraphStartMain {
            stroke: #2563eb;
            stroke-width: 1.8;
            stroke-dasharray: 5 5;
          }

          .interferenceGraphStartCompetitor {
            stroke: #dc2626;
            stroke-width: 1.8;
            stroke-dasharray: 5 5;
          }

          .interferenceGraphTick {
            fill: #71717a;
            font-size: 11px;
          }

          .interferenceGraphLabel {
            fill: #18181b;
            font-size: 12px;
            font-weight: 700;
          }

          .interferenceGraphMainLabel {
            fill: #1d4ed8;
            font-size: 12px;
            font-weight: 900;
          }

          .interferenceGraphCompetitorLabel {
            fill: #b91c1c;
            font-size: 12px;
            font-weight: 900;
          }
        `;

        clone.prepend(estilos);
        clone.prepend(fundo);

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
          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width = 1880;
          canvas.height = 1160;

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

              link.href = urlPng;

              link.download =
                "interferentes-retorno-volhard.png";

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

  {curvaInterferencia?.curva ? (
  <GraficoInterferenciasRetorno
    graficoRef={graficoRef}
    dados={curvaInterferencia}
  />
) : (
  <div className="precipitacaoInterferenceGraphEmpty">
    <strong>
      Não foi possível gerar a curva
    </strong>

    <p>
      {curvaInterferencia?.mensagem ??
        "Os dados disponíveis não permitiram calcular esta comparação."}
    </p>
  </div>
)}

{curvaInterferencia?.curva && (
  <footer className="precipitacaoInterferenceLegend">
    <span>
      <i className="precipitacaoInterferenceLegendMixture" />
      Mistura completa
    </span>

    <span>
      <i className="precipitacaoInterferenceLegendMain" />
      {curvaInterferencia.formulaReferencia} isolado
    </span>

    <span>
      <i className="precipitacaoInterferenceLegendCompetitor" />
      {curvaInterferencia.formulaInterferente} isolado
    </span>
  </footer>
)}

{curvaInterferencia?.curva &&
  Number.isFinite(
    curvaInterferencia
      .concentracaoInterferenteAdotada
  ) && (
    <div className="precipitacaoResultScientificNote">
      <strong>
        Interpretação do gráfico
      </strong>

      <p>
        {curvaInterferencia.mensagem}
        {" "}A concentração adotada para o
        interferente foi{" "}
        <strong>
          {formatarNumeroBR(
            curvaInterferencia
              .concentracaoInterferenteAdotada,
            4
          )}{" "}
          mol/L
        </strong>
        .
      </p>
    </div>
  )}
</section>
          </div>

          <section className="precipitacaoInterferenceDiagnosis">
            <header>
              <div>
                <span className="precipitacaoSectionLabel">
                  Diagnóstico integrado
                </span>

                <h6>
                  {obterTituloRisco(
                    interferenciaSelecionada
                      .risco
                  )}
                </h6>
              </div>

              <span
                className={[
                  "precipitacaoInterferenceRiskBadge",
                  obterClasseRisco(
                    interferenciaSelecionada
                      .risco
                  ),
                ].join(" ")}
              >
                Risco{" "}
                {
                  interferenciaSelecionada
                    .risco
                }
              </span>
            </header>

            <div className="precipitacaoInterferenceDiagnosisBlocks">
              <article>
                <span>
                  Interpretação química
                </span>

                <p>
                  {
                    interferenciaSelecionada
                      .motivo
                  }
                </p>
              </article>

              <article>
                <span>
                  Impacto analítico
                </span>

                <p>
                  {
                    interferenciaSelecionada
                      .impactoAnalitico
                  }
                </p>
              </article>

              <article>
                <span>
                  Recomendação experimental
                </span>

                <p>
                  {
                    interferenciaSelecionada
                      .recomendacao
                  }
                </p>
              </article>
            </div>
          </section>
        </>
      )}

      <section className="precipitacaoErrorFinalDiagnosis">
        <header className="precipitacaoErrorFinalDiagnosisHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Interferências não calculadas
            </span>

            <h6>
              Indicador Fe³⁺ e condições do meio
            </h6>
          </div>

          <span className="precipitacaoErrorFinalStatus precipitacaoErrorFinalStatusAlert">
            Avaliação qualitativa
          </span>
        </header>

        <p className="precipitacaoErrorFinalSummary">
          A base atual permite calcular competições
          associadas à formação de precipitados,
          mas não possui constantes suficientes para
          quantificar todas as reações envolvendo o
          indicador Fe³⁺, complexação, hidrólise,
          reações de oxirredução ou efeitos da força
          iônica.
        </p>

        <div className="precipitacaoErrorPossibleCausesGrid">
          <article>
            <span>01</span>

            <p>
              O meio deve permanecer ácido para
              reduzir a hidrólise de Fe³⁺ e evitar a
              formação de espécies que prejudiquem a
              indicação visual.
            </p>
          </article>

          <article>
            <span>02</span>

            <p>
              Espécies que formem complexos intensos
              com Fe³⁺ ou SCN⁻ podem reduzir a
              nitidez da mudança observada no ponto
              final.
            </p>
          </article>

          <article>
            <span>03</span>

            <p>
              Amostras coloridas, turvas ou contendo
              precipitados muito finos podem
              dificultar a percepção da coloração
              persistente.
            </p>
          </article>

          <article>
            <span>04</span>

            <p>
              Espécies oxidantes ou redutoras podem
              alterar o estado químico do indicador
              e precisam ser avaliadas de acordo com
              a composição real da amostra.
            </p>
          </article>
        </div>
      </section>
    </section>
  );
}

type GraficoInterferenciasRetornoProps = {
    graficoRef:
      React.RefObject<SVGSVGElement>;
  
    dados:
      CurvaInterferenciaRetornoCalculada;
  };
  
  function GraficoInterferenciasRetorno({
    graficoRef,
    dados,
  }: GraficoInterferenciasRetornoProps) {
    const curva =
      dados.curva;
  
    if (!curva) {
      return null;
    }
  
    const largura = 940;
    const altura = 580;
  
    const margemEsquerda = 78;
    const margemDireita = 32;
    const margemSuperior = 42;
    const margemInferior = 70;
  
    const larguraUtil =
      largura -
      margemEsquerda -
      margemDireita;
  
    const alturaUtil =
      altura -
      margemSuperior -
      margemInferior;
  
    const serieReferencia =
      curva.seriesIsoladas.find(
        (serie) =>
          serie.sal.id ===
          dados.salReferenciaId
      );
  
    const serieInterferente =
      curva.seriesIsoladas.find(
        (serie) =>
          serie.sal.id ===
          dados.salInterferenteId
      );
  
    if (
      !serieReferencia ||
      !serieInterferente
    ) {
      return null;
    }
  
    const pontosReferencia =
      serieReferencia.pontos.filter(
        (ponto) =>
          Number.isFinite(
            ponto.volumeAdicionado
          ) &&
          Number.isFinite(
            ponto.pTitulante
          )
      );
  
    const pontosInterferente =
      serieInterferente.pontos.filter(
        (ponto) =>
          Number.isFinite(
            ponto.volumeAdicionado
          ) &&
          Number.isFinite(
            ponto.pTitulante
          )
      );
  
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
  
    const todosPontos = [
      ...pontosReferencia,
      ...pontosInterferente,
      ...pontosMistura,
    ];
  
    if (
      todosPontos.length === 0
    ) {
      return null;
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
      pontos:
        typeof pontosReferencia
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
  
    const inicioReferenciaValido =
      Number.isFinite(
        serieReferencia.volumeInicio
      );
  
    const inicioInterferenteValido =
      Number.isFinite(
        serieInterferente.volumeInicio
      );
  
    return (
      <svg
        ref={graficoRef}
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={`Curvas de precipitação de ${dados.formulaReferencia}, ${dados.formulaInterferente} e da mistura`}
      >
        {marcacoesY.map(
          (valor) => {
            const y =
              converterY(valor);
  
            return (
              <g
                key={`y-${valor}`}
              >
                <line
                  x1={margemEsquerda}
                  y1={y}
                  x2={
                    largura -
                    margemDireita
                  }
                  y2={y}
                  className="interferenceGraphGrid"
                />
  
                <text
                  x={
                    margemEsquerda -
                    12
                  }
                  y={y + 4}
                  textAnchor="end"
                  className="interferenceGraphTick"
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
              converterX(volume);
  
            return (
              <g
                key={`x-${volume}`}
              >
                <line
                  x1={x}
                  y1={margemSuperior}
                  x2={x}
                  y2={
                    altura -
                    margemInferior
                  }
                  className="interferenceGraphGrid"
                />
  
                <text
                  x={x}
                  y={
                    altura -
                    margemInferior +
                    25
                  }
                  textAnchor="middle"
                  className="interferenceGraphTick"
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
          className="interferenceGraphAxis"
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
          className="interferenceGraphAxis"
        />
  
        {inicioReferenciaValido && (
          <line
            x1={converterX(
              serieReferencia
                .volumeInicio
            )}
            y1={margemSuperior}
            x2={converterX(
              serieReferencia
                .volumeInicio
            )}
            y2={
              altura -
              margemInferior
            }
            className="interferenceGraphStartMain"
          />
        )}
  
        {inicioInterferenteValido && (
          <line
            x1={converterX(
              serieInterferente
                .volumeInicio
            )}
            y1={margemSuperior}
            x2={converterX(
              serieInterferente
                .volumeInicio
            )}
            y2={
              altura -
              margemInferior
            }
            className="interferenceGraphStartCompetitor"
          />
        )}
  
        <path
          d={criarCaminho(
            pontosMistura
          )}
          className="interferenceGraphMixture"
        />
  
        <path
          d={criarCaminho(
            pontosReferencia
          )}
          className="interferenceGraphMain"
        />
  
        <path
          d={criarCaminho(
            pontosInterferente
          )}
          className="interferenceGraphCompetitor"
        />
  
        {inicioReferenciaValido && (
          <text
            x={
              converterX(
                serieReferencia
                  .volumeInicio
              ) +
              7
            }
            y={
              margemSuperior +
              18
            }
            className="interferenceGraphMainLabel"
          >
            Início{" "}
            {
              dados
                .formulaReferencia
            }
          </text>
        )}
  
        {inicioInterferenteValido && (
          <text
            x={
              converterX(
                serieInterferente
                  .volumeInicio
              ) +
              7
            }
            y={
              margemSuperior +
              38
            }
            className="interferenceGraphCompetitorLabel"
          >
            Início{" "}
            {
              dados
                .formulaInterferente
            }
          </text>
        )}
  
        <text
          x={largura / 2}
          y={altura - 15}
          textAnchor="middle"
          className="interferenceGraphLabel"
        >
          Volume de{" "}
          {dados.formulaTitulante}{" "}
          adicionado (mL)
        </text>
  
        <text
          x="20"
          y={altura / 2}
          textAnchor="middle"
          transform={`rotate(-90 20 ${altura / 2})`}
          className="interferenceGraphLabel"
        >
          p{dados.formulaTitulante}
        </text>
      </svg>
    );
  }