"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
    FormEvent,
    RefObject,
  } from "react";

import {
  calcularPhPorVolumeMonoprotico,
  formatarNumeroBR,
} from "@/lib/acidoBaseMonoproticos";

import type {
  CurvaAcidoBaseMonoprotica,
  ResultadoSistemaMonoprotico,
} from "@/lib/acidoBaseMonoproticos";

type ErroExperimentalMonoProps = {
  resultado:
    | ResultadoSistemaMonoprotico
    | null;

  curva:
    | CurvaAcidoBaseMonoprotica
    | null;
};

export default function ErroExperimentalMono({
  resultado,
  curva,
}: ErroExperimentalMonoProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const [
    volumeExperimentalDigitado,
    setVolumeExperimentalDigitado,
  ] = useState("");

  const [
    volumeExperimental,
    setVolumeExperimental,
  ] = useState(0);

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

  useEffect(() => {
    if (!resultado) {
      setVolumeExperimentalDigitado("");
      setVolumeExperimental(0);
      setErroEntrada("");

      return;
    }

    setVolumeExperimental(
      resultado.volumePE
    );

    setVolumeExperimentalDigitado(
      formatarNumeroBR(
        resultado.volumePE,
        2
      )
    );

    setToleranciaDigitada("0,10");
    setTolerancia(0.1);
    setErroEntrada("");
  }, [resultado]);

  if (!resultado || !curva) {
    return (
      <section className="precipitacaoErrorExpanded">
        <header className="precipitacaoErrorExpandedIntro">
          <div>
            <span className="precipitacaoSectionLabel">
              Erro experimental
            </span>

            <h5>
              Volume experimental × ponto de equivalência
            </h5>

            <p>
              Avalie primeiro o sistema na aba
              Visão geral para realizar a análise
              do erro experimental.
            </p>
          </div>
        </header>
      </section>
    );
  }

  const limiteVolume =
    Math.max(
      curva.volumeMaximo,
      resultado.volumePE
    );

  const erroAbsoluto =
    volumeExperimental -
    resultado.volumePE;

  const erroAbsolutoModulo =
    Math.abs(
      erroAbsoluto
    );

  const erroRelativo =
    resultado.volumePE !== 0
      ? (
          erroAbsoluto /
          resultado.volumePE
        ) * 100
      : 0;

  const erroRelativoModulo =
    Math.abs(
      erroRelativo
    );

  const dentroTolerancia =
    erroRelativoModulo <=
    tolerancia;

  const coincidente =
    erroAbsolutoModulo < 0.005;

  const classificacao =
    coincidente
      ? "Coincidente com o PE"
      : erroAbsoluto < 0
        ? "Volume experimental abaixo do PE"
        : "Volume experimental acima do PE";

  const impactoAnalitico =
    coincidente
      ? "Sem tendência aparente"
      : erroAbsoluto < 0
        ? "Tendência de subestimação"
        : "Tendência de superestimação";

  const fatorResultado =
    resultado.volumePE !== 0
      ? volumeExperimental /
        resultado.volumePE
      : 1;

  const pontoExperimental =
    calcularPhPorVolumeMonoprotico(
      resultado,
      volumeExperimental
    );

  const interpretacaoQuimica =
    coincidente
      ? "O volume experimental coincide com o ponto de equivalência dentro da precisão utilizada. A condição observada está muito próxima da equivalência estequiométrica."
      : erroAbsoluto < 0
        ? `O volume experimental está antes do ponto de equivalência. Nesse ponto, ${resultado.titulado.nome} ainda permanece em excesso e a equivalência estequiométrica ainda não foi atingida.`
        : `O volume experimental está após o ponto de equivalência. Nesse ponto, ${resultado.titulante.nome} já está presente em excesso porque o ponto de equivalência foi ultrapassado.`;

  const interpretacaoAnalitica =
    coincidente
      ? "O volume utilizado experimentalmente coincide com o volume teórico, portanto não há tendência relevante de desvio causada pelo volume observado."
      : erroAbsoluto < 0
        ? "Como o volume experimental é menor que o volume estequiométrico necessário, uma determinação quantitativa baseada diretamente nesse volume tende a fornecer resultado abaixo do valor teórico."
        : "Como o volume experimental é maior que o volume estequiométrico necessário, uma determinação quantitativa baseada diretamente nesse volume tende a fornecer resultado acima do valor teórico.";

  function converterNumero(
    valor: string
  ) {
    return Number(
      String(valor)
        .trim()
        .replace(",", ".")
    );
  }

  function formatarComSinal(
    valor: number,
    casas: number
  ) {
    return `${
      valor > 0 ? "+" : ""
    }${formatarNumeroBR(
      valor,
      casas
    )}`;
  }

  function analisarErroExperimental(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const volumeNumerico =
      converterNumero(
        volumeExperimentalDigitado
      );

    const toleranciaNumerica =
      converterNumero(
        toleranciaDigitada
      );

    if (
      !Number.isFinite(
        volumeNumerico
      ) ||
      volumeNumerico < 0
    ) {
      setErroEntrada(
        "Informe um volume experimental válido."
      );

      return;
    }

    if (
      volumeNumerico >
      limiteVolume
    ) {
      setErroEntrada(
        `O volume experimental deve estar entre 0 e ${formatarNumeroBR(
          limiteVolume,
          2
        )} mL para esta curva.`
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

    setVolumeExperimental(
      volumeNumerico
    );

    setTolerancia(
      toleranciaNumerica
    );

    setErroEntrada("");
  }

  function usarPontoEquivalencia() {
    const volumePE =
      resultado?.volumePE;
  
    if (volumePE === undefined) {
      return;
    }
  
    setVolumeExperimental(
      volumePE
    );
  
    setVolumeExperimentalDigitado(
      formatarNumeroBR(
        volumePE,
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
        fill: #71717a;
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
            "erro-experimental-acido-base.png";

          link.click();

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

    imagem.src =
      urlSvg;
  }

  return (
    <section className="precipitacaoErrorExpanded">
      <header className="precipitacaoErrorExpandedIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Erro experimental
          </span>

          <h5>
            Volume experimental × ponto de equivalência
          </h5>

          <p>
            Compare o volume observado
            experimentalmente com o ponto de
            equivalência teórico, determine o erro
            absoluto e relativo e avalie o possível
            impacto sobre o resultado analítico.
          </p>
        </div>
      </header>

      <section className="precipitacaoErrorContext">
        <div className="precipitacaoErrorContextHeading">
          <span className="precipitacaoSectionLabel">
            Contexto da análise
          </span>

          <h6>
            Sistema ácido-base avaliado
          </h6>
        </div>

        <div className="precipitacaoErrorContextGrid">
          <article>
            <span>Titulado</span>

            <strong>
              {resultado.titulado.nome}
            </strong>
          </article>

          <article>
            <span>Titulante</span>

            <strong>
              {resultado.titulante.nome}
            </strong>
          </article>

          <article>
            <span>Tipo de titulação</span>

            <strong>
              {resultado.tipoSistema ===
              "acido-forte-com-base-forte"
                ? "Ácido forte × base forte"
                : resultado.tipoSistema ===
                    "acido-fraco-com-base-forte"
                  ? "Ácido fraco × base forte"
                  : resultado.tipoSistema ===
                      "base-forte-com-acido-forte"
                    ? "Base forte × ácido forte"
                    : "Base fraca × ácido forte"}
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

          <article>
            <span>pH no PE</span>

            <strong>
              {(() => {
                const pontoPE =
                  calcularPhPorVolumeMonoprotico(
                    resultado,
                    resultado.volumePE
                  );

                return pontoPE.ph === null
                  ? "—"
                  : formatarNumeroBR(
                      pontoPE.ph,
                      2
                    );
              })()}
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
            Informe o volume observado
          </h6>

          <p>
            Utilize o volume experimental em que
            você considerou a titulação encerrada.
          </p>

          <form
            onSubmit={
              analisarErroExperimental
            }
            className="precipitacaoErrorForm"
          >
            <label htmlFor="volumeExperimentalMono">
              Volume experimental
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="volumeExperimentalMono"
                type="text"
                inputMode="decimal"
                value={
                  volumeExperimentalDigitado
                }
                onChange={(event) => {
                  setVolumeExperimentalDigitado(
                    event.target.value
                  );

                  setErroEntrada("");
                }}
              />

              <span>mL</span>
            </div>

            <label htmlFor="toleranciaExperimentalMono">
              Tolerância aceita
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="toleranciaExperimentalMono"
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
              Analisar erro experimental
            </button>
          </form>

          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={
              usarPontoEquivalencia
            }
          >
            Usar o PE teórico
          </button>

          <div className="precipitacaoErrorControlReference">
            <span>
              Faixa analisada
            </span>

            <strong>
              0 a{" "}
              {formatarNumeroBR(
                limiteVolume,
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
                Volume experimental × PE teórico
              </h6>

              <p>
                A faixa destacada representa a
                diferença entre o volume
                experimental e o ponto de
                equivalência.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoErrorDownloadButton"
              onClick={
                baixarGrafico
              }
            >
              Baixar PNG
            </button>
          </header>

          <GraficoErroExperimentalMono
            graficoRef={
              graficoRef
            }
            curva={
              curva
            }
            resultado={
              resultado
            }
            volumeExperimental={
              volumeExperimental
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
              Experimental:{" "}
              <strong>
                {formatarNumeroBR(
                  volumeExperimental,
                  2
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              ΔV:{" "}
              <strong>
                {formatarComSinal(
                  erroAbsoluto,
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
          <span>Volume experimental</span>

          <strong>
            {formatarNumeroBR(
              volumeExperimental,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Valor observado
          </small>
        </article>

        <article>
          <span>Erro absoluto</span>

          <strong>
            {formatarComSinal(
              erroAbsoluto,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Vexp − VPE
          </small>
        </article>

        <article>
          <span>Erro relativo</span>

          <strong>
            {formatarComSinal(
              erroRelativo,
              3
            )}
            %
          </strong>

          <small>
            ΔV ÷ VPE × 100
          </small>
        </article>

        <article>
          <span>Impacto analítico</span>

          <strong>
            {impactoAnalitico}
          </strong>

          <small>
            Tendência do resultado
          </small>
        </article>

        <article>
          <span>Tolerância</span>

          <strong>
            {dentroTolerancia
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
              Estado do sistema
            </span>

            <h6>
              Condição no volume experimental
            </h6>
          </header>

          <div className="precipitacaoErrorChemicalValues">
            <article>
              <span>
                Região da curva
              </span>

              <strong>
                {
                  pontoExperimental.regiao
                }
              </strong>
            </article>

            <article>
              <span>
                pH calculado
              </span>

              <strong>
                {pontoExperimental.ph === null
                  ? "—"
                  : formatarNumeroBR(
                      pontoExperimental.ph,
                      3
                    )}
              </strong>
            </article>

            <article>
              <span>
                Volume experimental
              </span>

              <strong>
                {formatarNumeroBR(
                  volumeExperimental,
                  2
                )}{" "}
                mL
              </strong>
            </article>

            <article>
              <span>
                Posição relativa
              </span>

              <strong>
                {classificacao}
              </strong>
            </article>
          </div>

          <div className="precipitacaoErrorChemicalExplanation">
            <strong>
              {classificacao}
            </strong>

            <p>
              {interpretacaoQuimica}
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
                fatorResultado,
                5
              )}
            </strong>

            <small>
              Vexperimental ÷ VPE
            </small>
          </div>

          <div className="precipitacaoErrorImpactDirection">
            <span>
              Tendência
            </span>

            <strong>
              {impactoAnalitico}
            </strong>
          </div>

          <div
            className={
              dentroTolerancia
                ? "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisOk"
                : "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisAlert"
            }
          >
            <span>
              Avaliação da tolerância
            </span>

            <strong>
              {dentroTolerancia
                ? "Erro experimental aceitável para a tolerância informada."
                : "Erro experimental acima da tolerância informada."}
            </strong>
          </div>

          <p>
            {interpretacaoAnalitica}
          </p>
        </section>
      </div>

      <section className="precipitacaoErrorFinalDiagnosis">
        <span className="precipitacaoSectionLabel">
          Diagnóstico final
        </span>

        <h6>
          Interpretação do erro experimental
        </h6>

        <p>
          O volume experimental foi{" "}
          <strong>
            {formatarNumeroBR(
              erroAbsolutoModulo,
              3
            )}{" "}
            mL
          </strong>{" "}
          {coincidente
            ? "praticamente coincidente com"
            : erroAbsoluto < 0
              ? "menor que"
              : "maior que"}{" "}
          o ponto de equivalência teórico,
          correspondendo a um erro relativo
          absoluto de{" "}
          <strong>
            {formatarNumeroBR(
              erroRelativoModulo,
              3
            )}
            %
          </strong>
          . O resultado está{" "}
          <strong>
            {dentroTolerancia
              ? "dentro"
              : "fora"}
          </strong>{" "}
          da tolerância de ±
          {formatarNumeroBR(
            tolerancia,
            2
          )}
          % definida para a análise.
        </p>
      </section>
    </section>
  );
}

function GraficoErroExperimentalMono({
  graficoRef,
  curva,
  resultado,
  volumeExperimental,
}: {
    graficoRef:
    RefObject<SVGSVGElement>;

  curva:
    CurvaAcidoBaseMonoprotica;

  resultado:
    ResultadoSistemaMonoprotico;

  volumeExperimental:
    number;
}) {
  const largura = 900;
  const altura = 440;

  const margem = {
    top: 42,
    right: 40,
    bottom: 62,
    left: 68,
  };

  const larguraGrafico =
    largura -
    margem.left -
    margem.right;

  const alturaGrafico =
    altura -
    margem.top -
    margem.bottom;

  const volumeMaximo =
    Math.max(
      curva.volumeMaximo,
      resultado.volumePE,
      volumeExperimental,
      1
    );

  const x = (
    volume: number
  ) =>
    margem.left +
    (volume / volumeMaximo) *
      larguraGrafico;

  const y = (
    ph: number
  ) =>
    margem.top +
    ((14 - ph) / 14) *
      alturaGrafico;

  const pontosValidos =
    curva.pontos.filter(
      (ponto) =>
        ponto.ph !== null &&
        Number.isFinite(
          ponto.ph
        )
    );

  const pathCurva =
    pontosValidos
      .map(
        (ponto, index) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${x(
            ponto.volume
          )} ${y(
            ponto.ph ?? 0
          )}`
      )
      .join(" ");

  const pontoExperimental =
    calcularPhPorVolumeMonoprotico(
      resultado,
      volumeExperimental
    );

  const xPE =
    x(
      resultado.volumePE
    );

  const xExperimental =
    x(
      volumeExperimental
    );

  const faixaX =
    Math.min(
      xPE,
      xExperimental
    );

  const faixaLargura =
    Math.abs(
      xExperimental -
      xPE
    );

  const linhasPH = [
    0,
    2,
    4,
    6,
    8,
    10,
    12,
    14,
  ];

  const linhasVolume =
    Array.from(
      { length: 6 },
      (_, index) =>
        (
          volumeMaximo /
          5
        ) * index
    );

  return (
    <svg
      ref={
        graficoRef
      }
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Comparação entre o volume experimental e o ponto de equivalência"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={
          largura
        }
        height={
          altura
        }
        fill="#ffffff"
      />

      {linhasPH.map(
        (ph) => (
          <g
            key={`erro-mono-ph-${ph}`}
          >
            <line
              className="erroGraficoGrade"
              x1={
                margem.left
              }
              x2={
                margem.left +
                larguraGrafico
              }
              y1={
                y(ph)
              }
              y2={
                y(ph)
              }
            />

            <text
              className="erroGraficoTexto"
              x={
                margem.left -
                12
              }
              y={
                y(ph) + 4
              }
              textAnchor="end"
            >
              {ph}
            </text>
          </g>
        )
      )}

      {linhasVolume.map(
        (
          volume,
          index
        ) => (
          <g
            key={`erro-mono-v-${index}`}
          >
            <line
              className="erroGraficoGrade"
              x1={
                x(volume)
              }
              x2={
                x(volume)
              }
              y1={
                margem.top
              }
              y2={
                margem.top +
                alturaGrafico
              }
            />

            <text
              className="erroGraficoTexto"
              x={
                x(volume)
              }
              y={
                margem.top +
                alturaGrafico +
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
        )
      )}

      <rect
        className="erroGraficoFaixa"
        x={
          faixaX
        }
        y={
          margem.top
        }
        width={
          faixaLargura
        }
        height={
          alturaGrafico
        }
      />

      <line
        className="erroGraficoEixo"
        x1={
          margem.left
        }
        x2={
          margem.left
        }
        y1={
          margem.top
        }
        y2={
          margem.top +
          alturaGrafico
        }
      />

      <line
        className="erroGraficoEixo"
        x1={
          margem.left
        }
        x2={
          margem.left +
          larguraGrafico
        }
        y1={
          margem.top +
          alturaGrafico
        }
        y2={
          margem.top +
          alturaGrafico
        }
      />

      <path
        className="erroGraficoCurva"
        d={
          pathCurva
        }
      />

      <line
        className="erroGraficoPE"
        x1={
          xPE
        }
        x2={
          xPE
        }
        y1={
          margem.top
        }
        y2={
          margem.top +
          alturaGrafico
        }
      />

      <line
        className="erroGraficoPF"
        x1={
          xExperimental
        }
        x2={
          xExperimental
        }
        y1={
          margem.top
        }
        y2={
          margem.top +
          alturaGrafico
        }
      />

      <text
        className="erroGraficoRotulo"
        x={
          xPE + 6
        }
        y={
          margem.top +
          17
        }
      >
        PE
      </text>

      <text
        className="erroGraficoRotulo"
        x={
          xExperimental +
          6
        }
        y={
          margem.top +
          36
        }
      >
        Experimental
      </text>

      {pontoExperimental.ph !==
        null && (
        <circle
          className="erroGraficoMarcador"
          cx={
            xExperimental
          }
          cy={
            y(
              pontoExperimental.ph
            )
          }
          r="7"
        />
      )}

      <text
        className="erroGraficoRotulo"
        x={
          margem.left +
          larguraGrafico /
            2
        }
        y={
          altura - 12
        }
        textAnchor="middle"
      >
        Volume de titulante (mL)
      </text>

      <text
        className="erroGraficoRotulo"
        x="20"
        y={
          margem.top +
          alturaGrafico /
            2
        }
        textAnchor="middle"
        transform={`rotate(-90 20 ${
          margem.top +
          alturaGrafico /
            2
        })`}
      >
        pH
      </text>
    </svg>
  );
}