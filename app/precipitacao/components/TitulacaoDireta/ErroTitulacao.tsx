"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  gerarCurvaTitulacaoDireta,
} from "@/lib/precipitacao/calculosCurvaTitulacaoDireta";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/tipos";

type ErroTitulacaoProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  formulaAnalito: string;
  formulaTitulante: string;
};

export default function ErroTitulacao({
  resultado,
  formulaAnalito,
  formulaTitulante,
}: ErroTitulacaoProps) {
  const graficoRef =
    useRef<SVGSVGElement | null>(null);

  const [volumePontoFinalDigitado, setVolumePontoFinalDigitado] =
    useState(
      formatarNumeroBR(
        resultado.volumePE,
        2
      )
    );

  const [volumePontoFinal, setVolumePontoFinal] =
    useState(resultado.volumePE);

  const [toleranciaDigitada, setToleranciaDigitada] =
    useState("0,10");

  const [tolerancia, setTolerancia] =
    useState(0.1);

  const [erroEntrada, setErroEntrada] =
    useState("");

  const curva = useMemo(
    () =>
      gerarCurvaTitulacaoDireta({
        resultado,
        passo: 0.05,
        especieMonitorada:
          resultado.especieTitulante,
      }),
    [resultado]
  );

  useEffect(() => {
    setVolumePontoFinal(
      resultado.volumePE
    );

    setVolumePontoFinalDigitado(
      formatarNumeroBR(
        resultado.volumePE,
        2
      )
    );

    setErroEntrada("");
  }, [resultado]);

  const pontoFinalCurva = useMemo(() => {
    if (curva.pontos.length === 0) {
      return null;
    }

    return curva.pontos.reduce(
      (pontoMaisProximo, pontoAtual) =>
        Math.abs(
          pontoAtual.volumeAdicionado -
            volumePontoFinal
        ) <
        Math.abs(
          pontoMaisProximo.volumeAdicionado -
            volumePontoFinal
        )
          ? pontoAtual
          : pontoMaisProximo,
      curva.pontos[0]
    );
  }, [
    curva.pontos,
    volumePontoFinal,
  ]);

  const analiseErro = useMemo(() => {
    const erroAbsoluto =
      volumePontoFinal -
      resultado.volumePE;

    const erroAbsolutoModulo =
      Math.abs(erroAbsoluto);

    const erroRelativo =
      resultado.volumePE !== 0
        ? (
            erroAbsoluto /
            resultado.volumePE
          ) * 100
        : 0;

    const erroRelativoModulo =
      Math.abs(erroRelativo);

    const dentroTolerancia =
      erroRelativoModulo <= tolerancia;

    const classificacao =
      Math.abs(erroAbsoluto) < 0.005
        ? "Coincidente com o PE"
        : erroAbsoluto < 0
          ? "Ponto final adiantado"
          : "Ponto final ultrapassado";

    const impactoAnalitico =
      Math.abs(erroAbsoluto) < 0.005
        ? "Sem tendência aparente"
        : erroAbsoluto < 0
          ? "Tendência de subestimação"
          : "Tendência de superestimação";

    const interpretacaoQuimica =
      Math.abs(erroAbsoluto) < 0.005
        ? `O ponto final coincide com o ponto de equivalência dentro da precisão utilizada. Não há excesso estequiométrico relevante de ${formulaAnalito} ou ${formulaTitulante}.`
        : erroAbsoluto < 0
          ? `O ponto final foi identificado antes do ponto de equivalência. Ainda existe ${formulaAnalito} remanescente e parte do analito ainda não atingiu a condição estequiométrica de precipitação.`
          : `O ponto final foi identificado após o ponto de equivalência. O analito já foi consumido estequiometricamente e existe excesso de ${formulaTitulante} livre na solução.`;

    const interpretacaoAnalitica =
      Math.abs(erroAbsoluto) < 0.005
        ? "O volume utilizado no cálculo analítico coincide com o volume teórico."
        : erroAbsoluto < 0
          ? "Como foi utilizado menos titulante que o necessário, a quantidade calculada de analito tende a ficar abaixo do valor teórico."
          : "Como foi utilizado mais titulante que o necessário, a quantidade calculada de analito tende a ficar acima do valor teórico.";

    const fatorResultado =
      resultado.volumePE !== 0
        ? volumePontoFinal /
          resultado.volumePE
        : 1;

        const possiveisMotivos =
  Math.abs(erroAbsoluto) < 0.005
    ? [
        "A mudança visual do indicador foi identificada muito próxima da condição estequiométrica.",
        "A adição do titulante foi controlada adequadamente nas proximidades do ponto de equivalência.",
        "A agitação e o tempo de observação foram suficientes para reconhecer o ponto final.",
      ]
    : erroAbsoluto < 0
      ? [
          "A mudança de cor pode ter sido interpretada antes de se tornar persistente.",
          "A titulação pode ter sido interrompida cedo por dificuldade de observar a transição do indicador.",
          "A solução pode não ter sido agitada adequadamente após as últimas adições de titulante.",
          "O titulante pode ter sido adicionado em incrementos muito grandes próximo ao ponto final.",
          "A turbidez do precipitado, a iluminação ou a cor da amostra podem ter dificultado a observação.",
          `Nesse ponto ainda há ${formulaAnalito} remanescente, indicando que a precipitação estequiométrica ainda não foi completada.`,
        ]
      : [
          "O titulante pode ter sido adicionado rapidamente ou em incrementos excessivos próximo ao ponto final.",
          "A mudança visual pode ter sido reconhecida somente depois de sua primeira ocorrência persistente.",
          "A solução pode não ter sido agitada entre as últimas adições, causando atraso na percepção da mudança.",
          "Pode ter ocorrido excesso de titulante durante a lavagem das paredes do recipiente ou leitura tardia da bureta.",
          "A turbidez do precipitado, a iluminação ou a cor da amostra podem ter dificultado a identificação imediata do ponto final.",
          `Nesse ponto já existe excesso de ${formulaTitulante}, indicando que o ponto de equivalência foi ultrapassado.`,
        ];

        return {
          erroAbsoluto,
          erroAbsolutoModulo,
          erroRelativo,
          erroRelativoModulo,
          dentroTolerancia,
          classificacao,
          impactoAnalitico,
          interpretacaoQuimica,
          interpretacaoAnalitica,
          fatorResultado,
          possiveisMotivos,
        };
  }, [
    formulaAnalito,
    formulaTitulante,
    resultado.volumePE,
    tolerancia,
    volumePontoFinal,
  ]);

  function converterNumero(
    valor: string
  ) {
    return Number(
      valor
        .trim()
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  function analisarPontoFinal(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const volumeNumerico =
      converterNumero(
        volumePontoFinalDigitado
      );

    const toleranciaNumerica =
      converterNumero(
        toleranciaDigitada
      );

    if (
      !Number.isFinite(volumeNumerico) ||
      volumeNumerico < 0
    ) {
      setErroEntrada(
        "Informe um volume de ponto final válido."
      );

      return;
    }

    if (
      volumeNumerico >
      resultado.volumeMaximoBureta
    ) {
      setErroEntrada(
        `O volume deve estar entre 0 e ${formatarNumeroBR(
          resultado.volumeMaximoBureta,
          2
        )} mL.`
      );

      return;
    }

    if (
      !Number.isFinite(
        toleranciaNumerica
      ) ||
      toleranciaNumerica < 0
    ) {
      setErroEntrada(
        "Informe uma tolerância válida."
      );

      return;
    }

    setVolumePontoFinal(
      volumeNumerico
    );

    setTolerancia(
      toleranciaNumerica
    );

    setErroEntrada("");
  }

  function usarPontoEquivalencia() {
    setVolumePontoFinal(
      resultado.volumePE
    );

    setVolumePontoFinalDigitado(
      formatarNumeroBR(
        resultado.volumePE,
        2
      )
    );

    setErroEntrada("");
  }

  function baixarGrafico() {
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
      "900"
    );

    graficoClonado.setAttribute(
      "height",
      "440"
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
      "900"
    );
    fundo.setAttribute(
      "height",
      "440"
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

      .erroGraficoGrade {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .erroGraficoEixo {
        stroke: #71717a;
        stroke-width: 1.4;
      }

      .erroGraficoCurva {
        fill: none;
        stroke: #991b1b;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .erroGraficoPE {
        stroke: #b45309;
        stroke-width: 2;
        stroke-dasharray: 7 6;
      }

      .erroGraficoPF {
        stroke: #18181b;
        stroke-width: 2;
      }

      .erroGraficoFaixa {
        fill: rgba(180, 83, 9, 0.12);
      }

      .erroGraficoMarcador {
        fill: #991b1b;
        stroke: #ffffff;
        stroke-width: 3;
      }

      .erroGraficoTexto {
        fill: #52525b;
        font-size: 12px;
      }

      .erroGraficoRotulo {
        fill: #18181b;
        font-size: 13px;
        font-weight: 700;
      }
    `;

    graficoClonado.prepend(estilos);
    graficoClonado.prepend(fundo);

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
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = 1800;
      canvas.height = 880;

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
            "comparacao-ponto-final-ponto-equivalencia.png";

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

  return (
    <section className="precipitacaoErrorExpanded">
      <header className="precipitacaoErrorExpandedIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Avaliação do ponto final
          </span>

          <h5>
            Erro de titulação e impacto analítico
          </h5>

          <p>
            Compare o ponto final observado com o
            ponto de equivalência, verifique o
            estado químico da solução nesse volume
            e avalie como a diferença pode afetar
            o resultado analítico.
          </p>
        </div>
      </header>

      <section className="precipitacaoErrorContext">
        <div className="precipitacaoErrorContextHeading">
          <span className="precipitacaoSectionLabel">
            Contexto da análise
          </span>

          <h6>
            Sistema químico avaliado
          </h6>
        </div>

        <div className="precipitacaoErrorContextGrid">
          <article>
            <span>Analito</span>
            <strong>
              {formulaAnalito}
            </strong>
          </article>

          <article>
            <span>Titulante</span>
            <strong>
              {formulaTitulante}
            </strong>
          </article>

          <article>
            <span>Precipitado</span>
            <strong>
              {
                resultado.sal
                  .formulaExibicao
              }
            </strong>
          </article>

          <article>
            <span>Kps</span>
            <strong>
              {formatarCientificoBR(
                resultado.sal.kps,
                3
              )}
            </strong>
          </article>

          <article>
            <span>PE teórico</span>
            <strong>
              {formatarNumeroBR(
                resultado.volumePE,
                2
              )}{" "}
              mL
            </strong>
          </article>
        </div>
      </section>

      <div className="precipitacaoErrorWorkspace">
        <aside className="precipitacaoErrorControls">
          <span className="precipitacaoSectionLabel">
            Determinação experimental
          </span>

          <h6>
            Informe o ponto final observado
          </h6>

          <p>
            Utilize o volume em que foi observada
            a mudança do indicador durante a
            titulação.
          </p>

          <form
            onSubmit={analisarPontoFinal}
            className="precipitacaoErrorForm"
          >
            <label htmlFor="erroVolumePF">
              Volume do ponto final
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="erroVolumePF"
                type="text"
                inputMode="decimal"
                value={
                  volumePontoFinalDigitado
                }
                onChange={(event) => {
                  setVolumePontoFinalDigitado(
                    event.target.value
                  );

                  setErroEntrada("");
                }}
              />

              <span>mL</span>
            </div>

            <label htmlFor="erroTolerancia">
              Tolerância aceita
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="erroTolerancia"
                type="text"
                inputMode="decimal"
                value={
                  toleranciaDigitada
                }
                onChange={(event) => {
                  setToleranciaDigitada(
                    event.target.value
                  );

                  setErroEntrada("");
                }}
              />

              <span>%</span>
            </div>

            {erroEntrada && (
              <p className="precipitacaoErrorInputMessage">
                {erroEntrada}
              </p>
            )}

            <button
              type="submit"
              className="precipitacaoErrorPrimaryButton"
            >
              Analisar ponto final
            </button>
          </form>

          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={usarPontoEquivalencia}
          >
            Usar o PE teórico
          </button>

          <div className="precipitacaoErrorControlReference">
            <span>
              Intervalo da bureta
            </span>

            <strong>
              0 a{" "}
              {formatarNumeroBR(
                resultado.volumeMaximoBureta,
                2
              )}{" "}
              mL
            </strong>
          </div>
        </aside>

        <div className="precipitacaoErrorGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Comparação visual
              </span>

              <h6>
                Ponto final × ponto de equivalência
              </h6>

              <p>
                A faixa destacada representa a
                diferença de volume entre PF e PE.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoErrorDownloadButton"
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

          <GraficoComparacaoErro
            graficoRef={graficoRef}
            pontos={curva.pontos}
            volumePE={resultado.volumePE}
            volumePF={volumePontoFinal}
            formulaTitulante={
              formulaTitulante
            }
          />

          <footer>
            <span>
              PE:{" "}
              <strong>
                {formatarNumeroBR(
                  resultado.volumePE,
                  2
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF:{" "}
              <strong>
                {formatarNumeroBR(
                  volumePontoFinal,
                  2
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              ΔV:{" "}
              <strong>
                {analiseErro.erroAbsoluto >
                0
                  ? "+"
                  : ""}
                {formatarNumeroBR(
                  analiseErro.erroAbsoluto,
                  3
                )}{" "}
                mL
              </strong>
            </span>
          </footer>
        </div>
      </div>

      <section className="precipitacaoErrorMetrics">
        <article>
          <span>PE teórico</span>

          <strong>
            {formatarNumeroBR(
              resultado.volumePE,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Definido pela estequiometria
          </small>
        </article>

        <article>
          <span>PF observado</span>

          <strong>
            {formatarNumeroBR(
              volumePontoFinal,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Definido pela observação
          </small>
        </article>

        <article>
          <span>Erro absoluto</span>

          <strong>
            {analiseErro.erroAbsoluto >
            0
              ? "+"
              : ""}
            {formatarNumeroBR(
              analiseErro.erroAbsoluto,
              3
            )}{" "}
            mL
          </strong>

          <small>VPF − VPE</small>
        </article>

        <article>
          <span>Erro relativo</span>

          <strong>
            {analiseErro.erroRelativo >
            0
              ? "+"
              : ""}
            {formatarNumeroBR(
              analiseErro.erroRelativo,
              3
            )}
            %
          </strong>

          <small>
            Erro relativo ao PE
          </small>
        </article>

        <article>
          <span>Impacto analítico</span>

          <strong>
            {
              analiseErro.impactoAnalitico
            }
          </strong>

          <small>
            Tendência sobre o resultado
          </small>
        </article>

        <article>
          <span>Tolerância</span>

          <strong>
            {analiseErro.dentroTolerancia
              ? "Dentro da faixa"
              : "Fora da faixa"}
          </strong>

          <small>
            Limite de ±
            {formatarNumeroBR(
              tolerancia,
              2
            )}
            %
          </small>
        </article>
      </section>

      <div className="precipitacaoErrorInterpretationGrid">
        <section className="precipitacaoErrorChemicalState">
          <header>
            <span className="precipitacaoSectionLabel">
              Estado químico no PF
            </span>

            <h6>
              O que existe na solução nesse volume?
            </h6>
          </header>

          {pontoFinalCurva ? (
            <div className="precipitacaoErrorChemicalValues">
              <article>
                <span>Região da curva</span>

                <strong>
                  {
                    pontoFinalCurva.regiao
                  }
                </strong>
              </article>

              <article>
                <span>
                  p{formulaTitulante}
                </span>

                <strong>
                  {formatarNumeroBR(
                    pontoFinalCurva
                      .pEspecieMonitorada,
                    4
                  )}
                </strong>
              </article>

              <article>
                <span>
                  [{formulaTitulante}] livre
                </span>

                <strong>
                  {formatarCientificoBR(
                    pontoFinalCurva
                      .concentracaoTitulanteLivre,
                    3
                  )}{" "}
                  mol/L
                </strong>
              </article>

              <article>
                <span>
                  [{formulaAnalito}] livre
                </span>

                <strong>
                  {formatarCientificoBR(
                    pontoFinalCurva
                      .concentracaoAnalitoLivre,
                    3
                  )}{" "}
                  mol/L
                </strong>
              </article>

              <article>
                <span>
                  Analito precipitado
                </span>

                <strong>
                  {formatarNumeroBR(
                    pontoFinalCurva
                      .percentualPrecipitado,
                    2
                  )}
                  %
                </strong>
              </article>
            </div>
          ) : (
            <p>
              Não foi possível consultar o estado
              químico nesse ponto.
            </p>
          )}

          <div className="precipitacaoErrorChemicalExplanation">
            <strong>
              {
                analiseErro.classificacao
              }
            </strong>

            <p>
              {
                analiseErro.interpretacaoQuimica
              }
            </p>
          </div>
        </section>

        <section className="precipitacaoErrorAnalyticalImpact">
          <header>
            <span className="precipitacaoSectionLabel">
              Impacto no resultado
            </span>

            <h6>
              Consequência analítica do erro
            </h6>
          </header>

          <div className="precipitacaoErrorImpactMain">
            <span>
              Fator relativo do resultado
            </span>

            <strong>
              {formatarNumeroBR(
                analiseErro.fatorResultado,
                5
              )}
            </strong>

            <small>
              VPF ÷ VPE
            </small>
          </div>

          <div className="precipitacaoErrorImpactDirection">
            <span>
              Tendência observada
            </span>

            <strong>
              {
                analiseErro.impactoAnalitico
              }
            </strong>
          </div>

          <p>
            {
              analiseErro.interpretacaoAnalitica
            }
          </p>

          <div
            className={[
              "precipitacaoErrorToleranceDiagnosis",
              analiseErro.dentroTolerancia
                ? "precipitacaoErrorToleranceDiagnosisOk"
                : "precipitacaoErrorToleranceDiagnosisAlert",
            ].join(" ")}
          >
            <span>
              Avaliação da tolerância
            </span>

            <strong>
              {analiseErro.dentroTolerancia
                ? "O erro está dentro do limite configurado."
                : "O erro ultrapassa o limite configurado."}
            </strong>
          </div>
        </section>
      </div>

      <section className="precipitacaoErrorFinalDiagnosis">
  <header className="precipitacaoErrorFinalDiagnosisHeader">
    <div>
      <span className="precipitacaoSectionLabel">
        Diagnóstico integrado
      </span>

      <h6>
        {analiseErro.classificacao}
      </h6>
    </div>

    <span
      className={[
        "precipitacaoErrorFinalStatus",
        analiseErro.dentroTolerancia
          ? "precipitacaoErrorFinalStatusOk"
          : "precipitacaoErrorFinalStatusAlert",
      ].join(" ")}
    >
      {analiseErro.dentroTolerancia
        ? "Dentro da tolerância"
        : "Fora da tolerância"}
    </span>
  </header>

  <p className="precipitacaoErrorFinalSummary">
    O ponto final foi observado em{" "}
    <strong>
      {formatarNumeroBR(
        volumePontoFinal,
        2
      )}{" "}
      mL
    </strong>
    , enquanto o ponto de equivalência é{" "}
    <strong>
      {formatarNumeroBR(
        resultado.volumePE,
        2
      )}{" "}
      mL
    </strong>
    . A diferença é de{" "}
    <strong>
      {formatarNumeroBR(
        analiseErro.erroAbsolutoModulo,
        3
      )}{" "}
      mL
    </strong>
    , correspondente a{" "}
    <strong>
      {formatarNumeroBR(
        analiseErro.erroRelativoModulo,
        3
      )}
      %
    </strong>
    .
  </p>

  <div className="precipitacaoErrorFinalConclusion">
    <span>Interpretação</span>

    <p>
      {analiseErro.interpretacaoQuimica}{" "}
      {analiseErro.interpretacaoAnalitica}
    </p>
  </div>

  <div className="precipitacaoErrorPossibleCauses">
    <div className="precipitacaoErrorPossibleCausesHeading">
      <span className="precipitacaoSectionLabel">
        Possíveis motivos
      </span>

      <h6>
        O que pode explicar essa diferença?
      </h6>

      <p>
        As causas abaixo são hipóteses experimentais.
        A confirmação depende das condições realmente
        observadas durante a titulação.
      </p>
    </div>

    <div className="precipitacaoErrorPossibleCausesGrid">
      {analiseErro.possiveisMotivos.map(
        (motivo, indice) => (
          <article key={motivo}>
            <span>
              {String(indice + 1).padStart(
                2,
                "0"
              )}
            </span>

            <p>{motivo}</p>
          </article>
        )
      )}
    </div>
  </div>

  <div className="precipitacaoErrorRecommendation">
    <strong>
      Recomendação para uma nova determinação
    </strong>

    <p>
      Próximo ao ponto final, adicione o titulante
      gota a gota, agite após cada adição, lave as
      paredes do recipiente com água destilada e
      considere a mudança visual somente quando ela
      permanecer após a homogeneização da solução.
    </p>
  </div>
</section>
    </section>
  );
}

type PontoGraficoErro = {
  volumeAdicionado: number;
  pEspecieMonitorada: number;
};

type GraficoComparacaoErroProps = {
  graficoRef: React.RefObject<SVGSVGElement | null>;
  pontos: PontoGraficoErro[];
  volumePE: number;
  volumePF: number;
  formulaTitulante: string;
};

function GraficoComparacaoErro({
  graficoRef,
  pontos,
  volumePE,
  volumePF,
  formulaTitulante,
}: GraficoComparacaoErroProps) {
  const largura = 900;
  const altura = 440;

  const margemEsquerda = 75;
  const margemDireita = 28;
  const margemSuperior = 38;
  const margemInferior = 62;

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
          ponto.pEspecieMonitorada
        )
    );

  if (pontosValidos.length === 0) {
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
          ponto.pEspecieMonitorada
      )
    );

  const pMaximoBruto =
    Math.max(
      ...pontosValidos.map(
        (ponto) =>
          ponto.pEspecieMonitorada
      )
    );

  const margemP =
    Math.max(
      (
        pMaximoBruto -
        pMinimoBruto
      ) * 0.08,
      0.2
    );

  const pMinimo =
    pMinimoBruto - margemP;

  const pMaximo =
    pMaximoBruto + margemP;

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
          volumeMinimo || 1
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
          pMinimo || 1
        )
      ) *
        alturaUtil
    );
  }

  const caminho =
    pontosValidos
      .map(
        (ponto, indice) =>
          `${
            indice === 0
              ? "M"
              : "L"
          } ${converterX(
            ponto.volumeAdicionado
          )} ${converterY(
            ponto.pEspecieMonitorada
          )}`
      )
      .join(" ");

  const pontoPF =
    pontosValidos.reduce(
      (
        pontoMaisProximo,
        pontoAtual
      ) =>
        Math.abs(
          pontoAtual.volumeAdicionado -
            volumePF
        ) <
        Math.abs(
          pontoMaisProximo.volumeAdicionado -
            volumePF
        )
          ? pontoAtual
          : pontoMaisProximo,
      pontosValidos[0]
    );

  const xPE =
    converterX(volumePE);

  const xPF =
    converterX(volumePF);

  const yPF =
    converterY(
      pontoPF.pEspecieMonitorada
    );

  const xFaixa =
    Math.min(xPE, xPF);

  const larguraFaixa =
    Math.abs(xPF - xPE);

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
      aria-label="Comparação entre ponto final e ponto de equivalência"
    >
      {marcacoesY.map(
        (valor) => {
          const y =
            converterY(valor);

          return (
            <g key={`y-${valor}`}>
              <line
                x1={margemEsquerda}
                y1={y}
                x2={
                  largura -
                  margemDireita
                }
                y2={y}
                className="erroGraficoGrade"
              />

              <text
                x={
                  margemEsquerda -
                  12
                }
                y={y + 4}
                textAnchor="end"
                className="erroGraficoTexto"
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
            <g key={`x-${volume}`}>
              <line
                x1={x}
                y1={margemSuperior}
                x2={x}
                y2={
                  altura -
                  margemInferior
                }
                className="erroGraficoGrade"
              />

              <text
                x={x}
                y={
                  altura -
                  margemInferior +
                  25
                }
                textAnchor="middle"
                className="erroGraficoTexto"
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

      <rect
        x={xFaixa}
        y={margemSuperior}
        width={larguraFaixa}
        height={alturaUtil}
        className="erroGraficoFaixa"
      />

      <line
        x1={margemEsquerda}
        y1={margemSuperior}
        x2={margemEsquerda}
        y2={
          altura -
          margemInferior
        }
        className="erroGraficoEixo"
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
        className="erroGraficoEixo"
      />

      <path
        d={caminho}
        className="erroGraficoCurva"
      />

      <line
        x1={xPE}
        y1={margemSuperior}
        x2={xPE}
        y2={
          altura -
          margemInferior
        }
        className="erroGraficoPE"
      />

      <line
        x1={xPF}
        y1={margemSuperior}
        x2={xPF}
        y2={
          altura -
          margemInferior
        }
        className="erroGraficoPF"
      />

      <circle
        cx={xPF}
        cy={yPF}
        r="7"
        className="erroGraficoMarcador"
      />

      <text
        x={xPE + 7}
        y={
          margemSuperior +
          17
        }
        className="erroGraficoRotulo"
      >
        PE
      </text>

      <text
        x={xPF + 7}
        y={
          margemSuperior +
          36
        }
        className="erroGraficoRotulo"
      >
        PF
      </text>

      <text
        x={largura / 2}
        y={altura - 14}
        textAnchor="middle"
        className="erroGraficoRotulo"
      >
        Volume adicionado (mL)
      </text>

      <text
        x="20"
        y={altura / 2}
        textAnchor="middle"
        transform={`rotate(-90 20 ${altura / 2})`}
        className="erroGraficoRotulo"
      >
        p{formulaTitulante}
      </text>
    </svg>
  );
}