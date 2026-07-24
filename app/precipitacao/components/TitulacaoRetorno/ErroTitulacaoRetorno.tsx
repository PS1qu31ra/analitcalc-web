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

type ErroTitulacaoRetornoProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

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

export default function ErroTitulacaoRetorno({
  resultado,
}: ErroTitulacaoRetornoProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const volumePontoFinalTeorico =
    resultado.volumeTitulanteRetorno;

  const [
    volumePontoFinalDigitado,
    setVolumePontoFinalDigitado,
  ] = useState(
    formatarNumeroBR(
      volumePontoFinalTeorico,
      2
    )
  );

  const [
    volumePontoFinal,
    setVolumePontoFinal,
  ] = useState(
    volumePontoFinalTeorico
  );

  const [
    toleranciaDigitada,
    setToleranciaDigitada,
  ] = useState("0,10");

  const [
    tolerancia,
    setTolerancia,
  ] = useState(0.1);

  const [
    erroEntrada,
    setErroEntrada,
  ] = useState("");

  const curva =
    useMemo(
      () =>
        gerarCurvaTitulacaoRetorno({
          resultado,
          passo: 0.05,
        }),
      [resultado]
    );

  useEffect(() => {
    setVolumePontoFinal(
      resultado.volumeTitulanteRetorno
    );

    setVolumePontoFinalDigitado(
      formatarNumeroBR(
        resultado.volumeTitulanteRetorno,
        2
      )
    );

    setErroEntrada("");
  }, [resultado]);

  const pontoFinalCurva =
    useMemo(() => {
      if (
        curva.pontos.length === 0 ||
        !Number.isFinite(
          volumePontoFinal
        )
      ) {
        return null;
      }

      return calcularPontoCurvaTitulacaoRetorno(
        resultado,
        volumePontoFinal
      );
    }, [
      curva.pontos.length,
      resultado,
      volumePontoFinal,
    ]);

  const analiseErro =
    useMemo(() => {
      const erroVolume =
        volumePontoFinal -
        volumePontoFinalTeorico;

      const erroVolumeModulo =
        Math.abs(
          erroVolume
        );

      const erroRelativo =
        volumePontoFinalTeorico !== 0
          ? (
              erroVolume /
              volumePontoFinalTeorico
            ) * 100
          : NaN;

      const erroRelativoModulo =
        Math.abs(
          erroRelativo
        );

      const dentroTolerancia =
        Number.isFinite(
          erroRelativoModulo
        ) &&
        erroRelativoModulo <=
          tolerancia;

      const coincidente =
        erroVolumeModulo < 0.005;

      const molSCNObservado =
        resultado
          .concentracaoTitulanteRetorno *
        (
          volumePontoFinal /
          1000
        );

      const molAgRemanescenteCalculado =
        molSCNObservado;

      const molAgConsumidoPeloAnalitoCalculado =
        resultado
          .molPrecipitanteAdicionado -
        molAgRemanescenteCalculado;

      const fatorEstequiometricoAnalito =
        resultado
          .molPrecipitanteConsumidoPeloAnalito >
          0 &&
        resultado.molAnalito > 0
          ? resultado.molAnalito /
            resultado
              .molPrecipitanteConsumidoPeloAnalito
          : NaN;

      const molAnalitoCalculado =
        Number.isFinite(
          fatorEstequiometricoAnalito
        )
          ? molAgConsumidoPeloAnalitoCalculado *
            fatorEstequiometricoAnalito
          : NaN;

      const concentracaoAnalitoCalculada =
        Number.isFinite(
          molAnalitoCalculado
        ) &&
        resultado.volumeAmostra > 0
          ? molAnalitoCalculado /
            (
              resultado.volumeAmostra /
              1000
            )
          : NaN;

      const erroMolAnalito =
        molAnalitoCalculado -
        resultado.molAnalito;

      const erroPercentualAnalito =
        resultado.molAnalito !== 0
          ? (
              erroMolAnalito /
              resultado.molAnalito
            ) * 100
          : NaN;

      const fatorResultado =
        resultado.molAnalito !== 0
          ? molAnalitoCalculado /
            resultado.molAnalito
          : NaN;

      const classificacao =
        coincidente
          ? "Coincidente com o PF teórico"
          : erroVolume < 0
            ? "Ponto final adiantado"
            : "Ponto final ultrapassado";

      /*
       * Na retrotitulação:
       *
       * n(analito) =
       * n(Ag⁺ adicionado) -
       * n(SCN⁻ utilizado no retorno)
       *
       * Portanto, o efeito do erro de volume é
       * inverso ao observado na titulação direta.
       */
      const impactoAnalitico =
        coincidente
          ? "Sem tendência aparente"
          : erroVolume < 0
            ? "Tendência de superestimação"
            : "Tendência de subestimação";

      const interpretacaoQuimica =
        coincidente
          ? "O volume observado coincide com o ponto final teórico dentro da precisão utilizada. A quantidade de SCN⁻ corresponde à quantidade de Ag⁺ que permaneceu em excesso após a precipitação do analito."
          : erroVolume < 0
            ? "O ponto final foi identificado antes do volume teórico. Ainda existe Ag⁺ remanescente que não foi completamente titulado pelo SCN⁻."
            : "O ponto final foi ultrapassado. O Ag⁺ remanescente já foi consumido e existe SCN⁻ livre em excesso na solução.";

      const interpretacaoAnalitica =
        coincidente
          ? "A quantidade de Ag⁺ remanescente calculada coincide com o valor teórico, sem alteração relevante na quantidade calculada de analito."
          : erroVolume < 0
            ? "Como foi registrado menos SCN⁻ do que o necessário, o sistema calcula uma quantidade menor de Ag⁺ remanescente. Consequentemente, atribui uma quantidade maior de Ag⁺ ao analito e tende a superestimar sua concentração."
            : "Como foi registrado mais SCN⁻ do que o necessário, o sistema calcula uma quantidade maior de Ag⁺ remanescente. Consequentemente, atribui uma quantidade menor de Ag⁺ ao analito e tende a subestimar sua concentração.";

      const possiveisMotivos =
        coincidente
          ? [
              "A primeira coloração persistente do complexo de Fe³⁺ com SCN⁻ foi identificada próxima ao ponto final teórico.",
              "A adição de SCN⁻ foi controlada adequadamente nas proximidades do ponto final.",
              "A solução foi agitada e observada por tempo suficiente após as últimas adições.",
            ]
          : erroVolume < 0
            ? [
                "Uma coloração momentânea pode ter sido interpretada como ponto final persistente.",
                "A titulação pode ter sido interrompida antes do consumo completo do Ag⁺ remanescente.",
                "A solução pode não ter sido agitada adequadamente após as últimas adições de SCN⁻.",
                "A cor da amostra ou a presença do precipitado pode ter dificultado a observação.",
                "Pode ter ocorrido leitura incorreta do volume inicial ou final da bureta.",
                "Nesse ponto ainda existe Ag⁺ remanescente não titulado.",
              ]
            : [
                "O SCN⁻ pode ter sido adicionado rapidamente ou em incrementos excessivos próximo ao ponto final.",
                "A primeira coloração persistente pode não ter sido reconhecida imediatamente.",
                "A solução pode não ter sido agitada entre as últimas adições.",
                "A leitura da bureta pode ter sido realizada após adição adicional de titulante.",
                "A iluminação ou a cor da amostra pode ter atrasado a identificação da mudança.",
                "Nesse ponto existe SCN⁻ livre em excesso.",
              ];

      return {
        erroVolume,
        erroVolumeModulo,
        erroRelativo,
        erroRelativoModulo,
        dentroTolerancia,
        classificacao,
        impactoAnalitico,
        interpretacaoQuimica,
        interpretacaoAnalitica,
        possiveisMotivos,
        molSCNObservado,
        molAgRemanescenteCalculado,
        molAgConsumidoPeloAnalitoCalculado,
        molAnalitoCalculado,
        concentracaoAnalitoCalculada,
        erroMolAnalito,
        erroPercentualAnalito,
        fatorResultado,
      };
    }, [
      resultado,
      tolerancia,
      volumePontoFinal,
      volumePontoFinalTeorico,
    ]);

  function analisarPontoFinal(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const volumeNumerico =
      converterNumeroBR(
        volumePontoFinalDigitado
      );

    const toleranciaNumerica =
      converterNumeroBR(
        toleranciaDigitada
      );

    if (
      !Number.isFinite(
        volumeNumerico
      ) ||
      volumeNumerico < 0
    ) {
      setErroEntrada(
        "Informe um volume de ponto final válido."
      );

      return;
    }

    if (
      Number.isFinite(
        curva.volumeMaximo
      ) &&
      volumeNumerico >
        curva.volumeMaximo
    ) {
      setErroEntrada(
        `O volume deve estar entre 0 e ${formatarNumeroBR(
          curva.volumeMaximo,
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

  function usarPontoFinalTeorico() {
    setVolumePontoFinal(
      volumePontoFinalTeorico
    );

    setVolumePontoFinalDigitado(
      formatarNumeroBR(
        volumePontoFinalTeorico,
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

          link.href =
            urlPng;

          link.download =
            "erro-titulacao-retorno-volhard.png";

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
    <section className="precipitacaoErrorExpanded">
      <header className="precipitacaoErrorExpandedIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Avaliação do ponto final
          </span>

          <h5>
            Erro da retrotitulação e impacto analítico
          </h5>

          <p>
            Compare o ponto final observado com o
            ponto final teórico do retorno, consulte
            o estado químico da solução e avalie como
            a diferença altera a determinação do
            analito.
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
            <span>
              Precipitado principal
            </span>

            <strong>
              {
                resultado
                  .salPrincipal
                  .formulaExibicao
              }
            </strong>
          </article>

          <article>
            <span>
              Reagente em excesso
            </span>

            <strong>
              Ag⁺
            </strong>
          </article>

          <article>
            <span>
              Titulante de retorno
            </span>

            <strong>
              SCN⁻
            </strong>
          </article>

          <article>
            <span>
              Precipitado do retorno
            </span>

            <strong>
              AgSCN
            </strong>
          </article>

          <article>
            <span>
              PF teórico
            </span>

            <strong>
              {formatarNumeroBR(
                volumePontoFinalTeorico,
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
            a primeira coloração persistente do
            indicador Fe³⁺ com excesso de SCN⁻.
          </p>

          <form
            onSubmit={
              analisarPontoFinal
            }
            className="precipitacaoErrorForm"
          >
            <label htmlFor="erroVolumePFRetorno">
              Volume do ponto final
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="erroVolumePFRetorno"
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

              <span>
                mL
              </span>
            </div>

            <label htmlFor="erroToleranciaRetorno">
              Tolerância aceita
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="erroToleranciaRetorno"
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

              <span>
                %
              </span>
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
            onClick={
              usarPontoFinalTeorico
            }
          >
            Usar o PF teórico
          </button>

          <div className="precipitacaoErrorControlReference">
            <span>
              Intervalo da curva
            </span>

            <strong>
              0 a{" "}
              {formatarNumeroBR(
                curva.volumeMaximo,
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
                PF observado × PF teórico
              </h6>

              <p>
                A faixa destacada representa a
                diferença entre os dois volumes.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoErrorDownloadButton"
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

          <GraficoComparacaoErroRetorno
            graficoRef={
              graficoRef
            }
            pontos={
              curva.pontos
            }
            volumePFTeorico={
              volumePontoFinalTeorico
            }
            volumePFObservado={
              volumePontoFinal
            }
          />

          <footer>
            <span>
              PF teórico:{" "}
              <strong>
                {formatarNumeroBR(
                  volumePontoFinalTeorico,
                  2
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF observado:{" "}
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
                {analiseErro.erroVolume >
                0
                  ? "+"
                  : ""}

                {formatarNumeroBR(
                  analiseErro.erroVolume,
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
          <span>
            PF teórico
          </span>

          <strong>
            {formatarNumeroBR(
              volumePontoFinalTeorico,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Relação Ag⁺ : SCN⁻
          </small>
        </article>

        <article>
          <span>
            PF observado
          </span>

          <strong>
            {formatarNumeroBR(
              volumePontoFinal,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Definido experimentalmente
          </small>
        </article>

        <article>
          <span>
            Erro de volume
          </span>

          <strong>
            {analiseErro.erroVolume >
            0
              ? "+"
              : ""}

            {formatarNumeroBR(
              analiseErro.erroVolume,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Vobservado − Vteórico
          </small>
        </article>

        <article>
          <span>
            Erro relativo
          </span>

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
            Relativo ao PF teórico
          </small>
        </article>

        <article>
          <span>
            Impacto analítico
          </span>

          <strong>
            {
              analiseErro
                .impactoAnalitico
            }
          </strong>

          <small>
            Tendência sobre o analito
          </small>
        </article>

        <article>
          <span>
            Tolerância
          </span>

          <strong>
            {analiseErro
              .dentroTolerancia
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
              O que existe na solução?
            </h6>
          </header>

          {pontoFinalCurva ? (
            <div className="precipitacaoErrorChemicalValues">
              <article>
                <span>
                  Região da curva
                </span>

                <strong>
                  {
                    pontoFinalCurva
                      .regiao
                  }
                </strong>
              </article>

              <article>
                <span>
                  pAg⁺
                </span>

                <strong>
                  {formatarNumeroBR(
                    pontoFinalCurva
                      .pPrecipitante,
                    4
                  )}
                </strong>
              </article>

              <article>
                <span>
                  [Ag⁺] livre
                </span>

                <strong>
                  {formatarCientificoBR(
                    pontoFinalCurva
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
                    pontoFinalCurva
                      .concentracaoTitulanteRetornoLivre,
                    3
                  )}{" "}
                  mol/L
                </strong>
              </article>

              <article>
                <span>
                  Ag⁺ consumido no retorno
                </span>

                <strong>
                  {formatarNumeroBR(
                    pontoFinalCurva
                      .percentualRetorno,
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
                analiseErro
                  .classificacao
              }
            </strong>

            <p>
              {
                analiseErro
                  .interpretacaoQuimica
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
              Concentração calculada do analito
            </span>

            <strong>
              {formatarCientificoBR(
                analiseErro
                  .concentracaoAnalitoCalculada,
                4
              )}
            </strong>

            <small>
              mol/L
            </small>
          </div>

          <div className="precipitacaoErrorImpactDirection">
            <span>
              Tendência observada
            </span>

            <strong>
              {
                analiseErro
                  .impactoAnalitico
              }
            </strong>
          </div>

          <p>
            {
              analiseErro
                .interpretacaoAnalitica
            }
          </p>

          <div
            className={[
              "precipitacaoErrorToleranceDiagnosis",
              analiseErro
                .dentroTolerancia
                ? "precipitacaoErrorToleranceDiagnosisOk"
                : "precipitacaoErrorToleranceDiagnosisAlert",
            ].join(" ")}
          >
            <span>
              Avaliação da tolerância
            </span>

            <strong>
              {analiseErro
                .dentroTolerancia
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
              {
                analiseErro
                  .classificacao
              }
            </h6>
          </div>

          <span
            className={[
              "precipitacaoErrorFinalStatus",
              analiseErro
                .dentroTolerancia
                ? "precipitacaoErrorFinalStatusOk"
                : "precipitacaoErrorFinalStatusAlert",
            ].join(" ")}
          >
            {analiseErro
              .dentroTolerancia
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
          , enquanto o ponto final teórico é{" "}
          <strong>
            {formatarNumeroBR(
              volumePontoFinalTeorico,
              2
            )}{" "}
            mL
          </strong>
          . A diferença é de{" "}
          <strong>
            {formatarNumeroBR(
              analiseErro
                .erroVolumeModulo,
              3
            )}{" "}
            mL
          </strong>
          , correspondente a{" "}
          <strong>
            {formatarNumeroBR(
              analiseErro
                .erroRelativoModulo,
              3
            )}
            %
          </strong>
          .
        </p>

        <div className="precipitacaoErrorFinalConclusion">
          <span>
            Interpretação
          </span>

          <p>
            {
              analiseErro
                .interpretacaoQuimica
            }{" "}
            {
              analiseErro
                .interpretacaoAnalitica
            }
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
              As causas abaixo são hipóteses
              experimentais. A confirmação depende
              das condições observadas durante a
              titulação.
            </p>
          </div>

          <div className="precipitacaoErrorPossibleCausesGrid">
            {analiseErro
              .possiveisMotivos
              .map(
                (
                  motivo,
                  indice
                ) => (
                  <article
                    key={motivo}
                  >
                    <span>
                      {String(
                        indice + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>
                      {motivo}
                    </p>
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
            Mantenha o meio ácido, adicione SCN⁻
            gota a gota nas proximidades do ponto
            final, agite após cada adição e considere
            como ponto final somente a primeira
            coloração persistente produzida pelo
            excesso de SCN⁻ na presença de Fe³⁺.
          </p>
        </div>
      </section>
    </section>
  );
}

type GraficoComparacaoErroRetornoProps = {
  graficoRef:
    React.RefObject<SVGSVGElement>;
  pontos:
    PontoCurvaTitulacaoRetornoPrecipitacao[];
  volumePFTeorico: number;
  volumePFObservado: number;
};

function GraficoComparacaoErroRetorno({
  graficoRef,
  pontos,
  volumePFTeorico,
  volumePFObservado,
}: GraficoComparacaoErroRetornoProps) {
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
      0.2
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
            ponto.volumeAdicionado
          )} ${converterY(
            ponto.pPrecipitante
          )}`
      )
      .join(" ");

  const pontoPF =
    pontosValidos.reduce(
      (
        maisProximo,
        ponto
      ) =>
        Math.abs(
          ponto.volumeAdicionado -
          volumePFObservado
        ) <
        Math.abs(
          maisProximo.volumeAdicionado -
          volumePFObservado
        )
          ? ponto
          : maisProximo,
      pontosValidos[0]
    );

  const xTeorico =
    converterX(
      volumePFTeorico
    );

  const xObservado =
    converterX(
      volumePFObservado
    );

  const yObservado =
    converterY(
      pontoPF.pPrecipitante
    );

  const xFaixa =
    Math.min(
      xTeorico,
      xObservado
    );

  const larguraFaixa =
    Math.abs(
      xObservado -
      xTeorico
    );

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
      aria-label="Comparação entre o ponto final observado e o ponto final teórico da retrotitulação"
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
        x1={xTeorico}
        y1={margemSuperior}
        x2={xTeorico}
        y2={
          altura -
          margemInferior
        }
        className="erroGraficoPE"
      />

      <line
        x1={xObservado}
        y1={margemSuperior}
        x2={xObservado}
        y2={
          altura -
          margemInferior
        }
        className="erroGraficoPF"
      />

      <circle
        cx={xObservado}
        cy={yObservado}
        r="7"
        className="erroGraficoMarcador"
      />

      <text
        x={
          xTeorico +
          7
        }
        y={
          margemSuperior +
          17
        }
        className="erroGraficoRotulo"
      >
        PF teórico
      </text>

      <text
        x={
          xObservado +
          7
        }
        y={
          margemSuperior +
          36
        }
        className="erroGraficoRotulo"
      >
        PF observado
      </text>

      <text
        x={
          largura /
          2
        }
        y={
          altura -
          14
        }
        textAnchor="middle"
        className="erroGraficoRotulo"
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
        className="erroGraficoRotulo"
      >
        pAg⁺
      </text>
    </svg>
  );
}