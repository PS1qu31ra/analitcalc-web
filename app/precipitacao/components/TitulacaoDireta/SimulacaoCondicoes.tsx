"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calcularTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/calculosTitulacaoDireta";

import {
  gerarCurvaTitulacaoDireta,
} from "@/lib/precipitacao/calculosCurvaTitulacaoDireta";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  PontoCurvaTitulacaoDiretaPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/tipos";

type SimulacaoCondicoesProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  formulaAnalito: string;
  formulaTitulante: string;
};

type CamposSimulacao = {
  concentracaoAnalito: string;
  volumeAmostra: string;
  concentracaoTitulante: string;
  volumeMaximoBureta: string;
  passoCurva: string;
};

function converterNumeroBR(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return NaN;
  }

  const normalizado =
    texto.includes(",")
      ? texto
          .replace(/\./g, "")
          .replace(",", ".")
      : texto;

  return Number(normalizado);
}

export default function SimulacaoCondicoes({
  resultado,
  formulaAnalito,
  formulaTitulante,
}: SimulacaoCondicoesProps) {
  const graficoRef =
    useRef<SVGSVGElement | null>(null);

  const criarCamposOriginais =
    (): CamposSimulacao => ({
      concentracaoAnalito:
        formatarNumeroBR(
          resultado.concentracaoAnalito,
          4
        ),
      volumeAmostra:
        formatarNumeroBR(
          resultado.volumeAmostra,
          2
        ),
      concentracaoTitulante:
        formatarNumeroBR(
          resultado.concentracaoTitulante,
          4
        ),
      volumeMaximoBureta:
        formatarNumeroBR(
          resultado.volumeMaximoBureta,
          2
        ),
      passoCurva: "0,10",
    });

  const [
    campos,
    setCampos,
  ] =
    useState<CamposSimulacao>(
      criarCamposOriginais
    );

  const [
    parametrosAplicados,
    setParametrosAplicados,
  ] = useState({
    concentracaoAnalito:
      resultado.concentracaoAnalito,
    volumeAmostra:
      resultado.volumeAmostra,
    concentracaoTitulante:
      resultado.concentracaoTitulante,
    volumeMaximoBureta:
      resultado.volumeMaximoBureta,
    passoCurva: 0.1,
  });

  const [
    erroEntrada,
    setErroEntrada,
  ] = useState("");

  useEffect(() => {
    setCampos(
      criarCamposOriginais()
    );

    setParametrosAplicados({
      concentracaoAnalito:
        resultado.concentracaoAnalito,
      volumeAmostra:
        resultado.volumeAmostra,
      concentracaoTitulante:
        resultado.concentracaoTitulante,
      volumeMaximoBureta:
        resultado.volumeMaximoBureta,
      passoCurva: 0.1,
    });

    setErroEntrada("");
  }, [resultado]);

  const resultadoSimulado =
    useMemo(
      () =>
        calcularTitulacaoDiretaPrecipitacao({
          sal: resultado.sal,
          especieAnalito:
            resultado.especieAnalito,
          concentracaoAnalito:
            parametrosAplicados
              .concentracaoAnalito,
          volumeAmostra:
            parametrosAplicados
              .volumeAmostra,
          concentracaoTitulante:
            parametrosAplicados
              .concentracaoTitulante,
          volumeMaximoBureta:
            parametrosAplicados
              .volumeMaximoBureta,
        }),
      [
        parametrosAplicados,
        resultado.especieAnalito,
        resultado.sal,
      ]
    );

  const curvaOriginal =
    useMemo(
      () =>
        gerarCurvaTitulacaoDireta({
          resultado,
          passo:
            parametrosAplicados
              .passoCurva,
          especieMonitorada:
            resultado.especieTitulante,
        }),
      [
        parametrosAplicados.passoCurva,
        resultado,
      ]
    );

  const curvaSimulada =
    useMemo(
      () =>
        gerarCurvaTitulacaoDireta({
          resultado:
            resultadoSimulado,
          passo:
            parametrosAplicados
              .passoCurva,
          especieMonitorada:
            resultadoSimulado
              .especieTitulante,
        }),
      [
        parametrosAplicados.passoCurva,
        resultadoSimulado,
      ]
    );

  const comparacao =
    useMemo(() => {
      const diferencaPE =
        resultadoSimulado.volumePE -
        resultado.volumePE;

      const variacaoPercentual =
        resultado.volumePE > 0
          ? (
              diferencaPE /
              resultado.volumePE
            ) * 100
          : NaN;

      const percentualBureta =
        resultadoSimulado
          .volumeMaximoBureta > 0
          ? (
              resultadoSimulado
                .volumePE /
              resultadoSimulado
                .volumeMaximoBureta
            ) * 100
          : NaN;

      let situacaoBureta:
        | "adequada"
        | "limite"
        | "fora";

      if (
        resultadoSimulado.status ===
        "fora_da_bureta"
      ) {
        situacaoBureta = "fora";
      } else if (
        percentualBureta >= 90
      ) {
        situacaoBureta = "limite";
      } else {
        situacaoBureta =
          "adequada";
      }

      const alteracoes: string[] =
        [];

      if (
        Math.abs(
          parametrosAplicados
            .concentracaoAnalito -
            resultado
              .concentracaoAnalito
        ) >
        1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .concentracaoAnalito >
          resultado
            .concentracaoAnalito;

        alteracoes.push(
          aumentou
            ? `A concentração do analito aumentou. Há mais ${formulaAnalito} por unidade de volume, elevando a quantidade de titulante necessária.`
            : `A concentração do analito diminuiu. Há menos ${formulaAnalito} na amostra, reduzindo a quantidade de titulante necessária.`
        );
      }

      if (
        Math.abs(
          parametrosAplicados
            .volumeAmostra -
            resultado.volumeAmostra
        ) >
        1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .volumeAmostra >
          resultado.volumeAmostra;

        alteracoes.push(
          aumentou
            ? "O volume da amostra aumentou. Mantendo a concentração, a quantidade total de analito também aumentou."
            : "O volume da amostra diminuiu. Mantendo a concentração, a quantidade total de analito também diminuiu."
        );
      }

      if (
        Math.abs(
          parametrosAplicados
            .concentracaoTitulante -
            resultado
              .concentracaoTitulante
        ) >
        1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .concentracaoTitulante >
          resultado
            .concentracaoTitulante;

        alteracoes.push(
          aumentou
            ? `A solução de ${formulaTitulante} ficou mais concentrada. Cada mililitro fornece mais titulante e o PE ocorre em menor volume.`
            : `A solução de ${formulaTitulante} ficou mais diluída. É necessário adicionar maior volume para atingir o PE.`
        );
      }

      if (
        alteracoes.length === 0
      ) {
        alteracoes.push(
          "Os parâmetros químicos aplicados coincidem com o cenário original. Por isso, não há deslocamento relevante do ponto de equivalência."
        );
      }

      return {
        diferencaPE,
        variacaoPercentual,
        percentualBureta,
        situacaoBureta,
        alteracoes,
      };
    }, [
      formulaAnalito,
      formulaTitulante,
      parametrosAplicados,
      resultado,
      resultadoSimulado,
    ]);

  function atualizarCampo(
    campo: keyof CamposSimulacao,
    valor: string
  ) {
    setCampos(
      (estadoAtual) => ({
        ...estadoAtual,
        [campo]: valor,
      })
    );

    setErroEntrada("");
  }

  function aplicarSimulacao(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const novosParametros = {
      concentracaoAnalito:
        converterNumeroBR(
          campos.concentracaoAnalito
        ),
      volumeAmostra:
        converterNumeroBR(
          campos.volumeAmostra
        ),
      concentracaoTitulante:
        converterNumeroBR(
          campos.concentracaoTitulante
        ),
      volumeMaximoBureta:
        converterNumeroBR(
          campos.volumeMaximoBureta
        ),
      passoCurva:
        converterNumeroBR(
          campos.passoCurva
        ),
    };

    const valoresValidos =
      Object.values(
        novosParametros
      ).every(
        (valor) =>
          Number.isFinite(valor) &&
          valor > 0
      );

    if (!valoresValidos) {
      setErroEntrada(
        "Informe valores positivos e válidos em todos os campos."
      );

      return;
    }

    if (
      novosParametros
        .passoCurva >
      novosParametros
        .volumeMaximoBureta
    ) {
      setErroEntrada(
        "O passo da curva não pode ser maior que a capacidade da bureta."
      );

      return;
    }

    setParametrosAplicados(
      novosParametros
    );

    setErroEntrada("");
  }

  function restaurarOriginal() {
    const camposOriginais =
      criarCamposOriginais();

    setCampos(
      camposOriginais
    );

    setParametrosAplicados({
      concentracaoAnalito:
        resultado.concentracaoAnalito,
      volumeAmostra:
        resultado.volumeAmostra,
      concentracaoTitulante:
        resultado.concentracaoTitulante,
      volumeMaximoBureta:
        resultado.volumeMaximoBureta,
      passoCurva: 0.1,
    });

    setErroEntrada("");
  }

  function aplicarCenario(
    tipo:
      | "analito-dobro"
      | "analito-metade"
      | "titulante-dobro"
      | "titulante-metade"
      | "amostra-dobro"
  ) {
    const novosParametros = {
      concentracaoAnalito:
        resultado.concentracaoAnalito,
      volumeAmostra:
        resultado.volumeAmostra,
      concentracaoTitulante:
        resultado.concentracaoTitulante,
      volumeMaximoBureta:
        resultado.volumeMaximoBureta,
      passoCurva: 0.1,
    };

    if (
      tipo ===
      "analito-dobro"
    ) {
      novosParametros.concentracaoAnalito *=
        2;
    }

    if (
      tipo ===
      "analito-metade"
    ) {
      novosParametros.concentracaoAnalito *=
        0.5;
    }

    if (
      tipo ===
      "titulante-dobro"
    ) {
      novosParametros.concentracaoTitulante *=
        2;
    }

    if (
      tipo ===
      "titulante-metade"
    ) {
      novosParametros.concentracaoTitulante *=
        0.5;
    }

    if (
      tipo ===
      "amostra-dobro"
    ) {
      novosParametros.volumeAmostra *=
        2;
    }

    setParametrosAplicados(
      novosParametros
    );

    setCampos({
      concentracaoAnalito:
        formatarNumeroBR(
          novosParametros
            .concentracaoAnalito,
          4
        ),
      volumeAmostra:
        formatarNumeroBR(
          novosParametros
            .volumeAmostra,
          2
        ),
      concentracaoTitulante:
        formatarNumeroBR(
          novosParametros
            .concentracaoTitulante,
          4
        ),
      volumeMaximoBureta:
        formatarNumeroBR(
          novosParametros
            .volumeMaximoBureta,
          2
        ),
      passoCurva:
        formatarNumeroBR(
          novosParametros
            .passoCurva,
          2
        ),
    });

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
      "560"
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
      "560"
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

      .simulacaoCondicoesGrid {
        stroke: #e4e4e7;
        stroke-width: 1;
      }

      .simulacaoCondicoesAxis {
        stroke: #71717a;
        stroke-width: 1.4;
      }

      .simulacaoCondicoesOriginalCurve {
        fill: none;
        stroke: #a1a1aa;
        stroke-width: 2.4;
      }

      .simulacaoCondicoesSimulatedCurve {
        fill: none;
        stroke: #b91c1c;
        stroke-width: 3;
      }

      .simulacaoCondicoesOriginalPE {
        stroke: #71717a;
        stroke-width: 1.8;
        stroke-dasharray: 7 6;
      }

      .simulacaoCondicoesSimulatedPE {
        stroke: #991b1b;
        stroke-width: 2.2;
      }

      .simulacaoCondicoesPEArea {
        fill: rgba(153, 27, 27, 0.08);
      }

      .simulacaoCondicoesTick {
        fill: #71717a;
        font-size: 11px;
      }

      .simulacaoCondicoesLabel {
        fill: #18181b;
        font-size: 12px;
        font-weight: 700;
      }

      .simulacaoCondicoesOriginalLabel {
        fill: #52525b;
        font-size: 12px;
        font-weight: 800;
      }

      .simulacaoCondicoesSimulatedLabel {
        fill: #991b1b;
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

    const blobSvg =
      new Blob(
        [svgSerializado],
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

      canvas.width = 1880;
      canvas.height = 1120;

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
            "comparacao-condicoes-titulacao.png";

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
    <section className="precipitacaoSimulationSection">
      <header className="precipitacaoSimulationIntro">
        <span className="precipitacaoSectionLabel">
          Comparação de cenários
        </span>

        <h5>
          Simulação das condições experimentais
        </h5>

        <p>
          Altere as condições da titulação e compare
          o novo cenário com os dados originais. O
          sistema recalcula a quantidade de analito,
          o ponto de equivalência e toda a curva de
          precipitação.
        </p>
      </header>

      <section className="precipitacaoSimulationOriginal">
        <header>
          <span className="precipitacaoSectionLabel">
            Condição original
          </span>

          <h6>
            Dados usados como referência
          </h6>
        </header>

        <div className="precipitacaoSimulationOriginalGrid">
          <article>
            <span>
              Concentração do analito
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.concentracaoAnalito,
                4
              )}{" "}
              mol/L
            </strong>
          </article>

          <article>
            <span>
              Volume da amostra
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.volumeAmostra,
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>
              Concentração do titulante
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.concentracaoTitulante,
                4
              )}{" "}
              mol/L
            </strong>
          </article>

          <article>
            <span>
              Capacidade da bureta
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.volumeMaximoBureta,
                2
              )}{" "}
              mL
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
            <span>PE original</span>

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

      <section className="precipitacaoSimulationPresets">
        <header>
          <span className="precipitacaoSectionLabel">
            Cenários rápidos
          </span>

          <h6>
            Aplique uma alteração didática
          </h6>
        </header>

        <div className="precipitacaoSimulationPresetButtons">
          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "analito-dobro"
              )
            }
          >
            Analito 2× mais concentrado
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "analito-metade"
              )
            }
          >
            Analito 50% mais diluído
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "titulante-dobro"
              )
            }
          >
            Titulante 2× mais concentrado
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "titulante-metade"
              )
            }
          >
            Titulante 50% mais diluído
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "amostra-dobro"
              )
            }
          >
            Amostra com volume 2× maior
          </button>
        </div>
      </section>

      <div className="precipitacaoSimulationWorkspace">
        <aside className="precipitacaoSimulationControls">
          <span className="precipitacaoSectionLabel">
            Parâmetros simulados
          </span>

          <h6>
            Configure o novo cenário
          </h6>

          <form
            onSubmit={aplicarSimulacao}
            className="precipitacaoSimulationForm"
          >
            <label>
              Concentração do analito

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.concentracaoAnalito
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "concentracaoAnalito",
                      event.target.value
                    )
                  }
                />

                <span>mol/L</span>
              </div>
            </label>

            <label>
              Volume da amostra

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.volumeAmostra
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "volumeAmostra",
                      event.target.value
                    )
                  }
                />

                <span>mL</span>
              </div>
            </label>

            <label>
              Concentração do titulante

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.concentracaoTitulante
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "concentracaoTitulante",
                      event.target.value
                    )
                  }
                />

                <span>mol/L</span>
              </div>
            </label>

            <label>
              Capacidade da bureta

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.volumeMaximoBureta
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "volumeMaximoBureta",
                      event.target.value
                    )
                  }
                />

                <span>mL</span>
              </div>
            </label>

            <label>
              Passo da curva

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.passoCurva
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "passoCurva",
                      event.target.value
                    )
                  }
                />

                <span>mL</span>
              </div>
            </label>

            {erroEntrada && (
              <p className="precipitacaoSimulationError">
                {erroEntrada}
              </p>
            )}

            <button
              type="submit"
              className="precipitacaoSimulationApplyButton"
            >
              Aplicar simulação
            </button>
          </form>

          <button
            type="button"
            className="precipitacaoSimulationResetButton"
            onClick={restaurarOriginal}
          >
            Restaurar valores originais
          </button>
        </aside>

        <section className="precipitacaoSimulationGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Comparação gráfica
              </span>

              <h6>
                Curva original × curva simulada
              </h6>

              <p>
                As linhas verticais indicam os
                respectivos pontos de equivalência.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoSimulationDownloadButton"
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

          <GraficoComparacaoCondicoes
            graficoRef={graficoRef}
            pontosOriginais={
              curvaOriginal.pontos
            }
            pontosSimulados={
              curvaSimulada.pontos
            }
            volumePEOriginal={
              resultado.volumePE
            }
            volumePESimulado={
              resultadoSimulado.volumePE
            }
            formulaTitulante={
              formulaTitulante
            }
          />

          <footer className="precipitacaoSimulationLegend">
            <span>
              <i className="precipitacaoSimulationLegendOriginal" />
              Curva original
            </span>

            <span>
              <i className="precipitacaoSimulationLegendSimulated" />
              Curva simulada
            </span>

            <span>
              <i className="precipitacaoSimulationLegendOriginalPE" />
              PE original
            </span>

            <span>
              <i className="precipitacaoSimulationLegendSimulatedPE" />
              PE simulado
            </span>
          </footer>
        </section>
      </div>

      <section className="precipitacaoSimulationMetrics">
        <article>
          <span>PE original</span>

          <strong>
            {formatarNumeroBR(
              resultado.volumePE,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Cenário de referência
          </small>
        </article>

        <article>
          <span>PE simulado</span>

          <strong>
            {formatarNumeroBR(
              resultadoSimulado.volumePE,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Novo cenário calculado
          </small>
        </article>

        <article>
          <span>Diferença</span>

          <strong>
            {comparacao.diferencaPE > 0
              ? "+"
              : ""}
            {formatarNumeroBR(
              comparacao.diferencaPE,
              2
            )}{" "}
            mL
          </strong>

          <small>
            PE simulado − PE original
          </small>
        </article>

        <article>
          <span>Variação</span>

          <strong>
            {comparacao.variacaoPercentual >
            0
              ? "+"
              : ""}
            {formatarNumeroBR(
              comparacao.variacaoPercentual,
              2
            )}
            %
          </strong>

          <small>
            Em relação ao cenário original
          </small>
        </article>

        <article>
          <span>Uso da bureta</span>

          <strong>
            {formatarNumeroBR(
              comparacao.percentualBureta,
              1
            )}
            %
          </strong>

          <small>
            Percentual necessário até o PE
          </small>
        </article>

        <article>
          <span>Viabilidade</span>

          <strong>
            {comparacao.situacaoBureta ===
            "adequada"
              ? "Adequada"
              : comparacao.situacaoBureta ===
                  "limite"
                ? "Próxima do limite"
                : "Fora da bureta"}
          </strong>

          <small>
            Avaliação do volume necessário
          </small>
        </article>
      </section>

      <div className="precipitacaoSimulationInterpretationGrid">
        <section className="precipitacaoSimulationChanges">
          <header>
            <span className="precipitacaoSectionLabel">
              O que mudou?
            </span>

            <h6>
              Interpretação das alterações
            </h6>
          </header>

          <div className="precipitacaoSimulationChangesList">
            {comparacao.alteracoes.map(
              (alteracao, indice) => (
                <article
                  key={alteracao}
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
                    {alteracao}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        <section className="precipitacaoSimulationViability">
          <header>
            <span className="precipitacaoSectionLabel">
              Viabilidade experimental
            </span>

            <h6>
              Capacidade da bureta
            </h6>
          </header>

          <div
            className={[
              "precipitacaoSimulationViabilityStatus",
              `precipitacaoSimulationViabilityStatus-${comparacao.situacaoBureta}`,
            ].join(" ")}
          >
            <strong>
              {comparacao.situacaoBureta ===
              "adequada"
                ? "O ponto de equivalência está dentro de uma faixa operacional adequada."
                : comparacao.situacaoBureta ===
                    "limite"
                  ? "O ponto de equivalência está muito próximo da capacidade total da bureta."
                  : "O ponto de equivalência ultrapassa a capacidade configurada da bureta."}
            </strong>
          </div>

          <div className="precipitacaoSimulationBuretteScale">
            <div
              className="precipitacaoSimulationBuretteFill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    comparacao.percentualBureta
                  )
                )}%`,
              }}
            />

            <span
              style={{
                left: `${Math.min(
                  100,
                  Math.max(
                    0,
                    comparacao.percentualBureta
                  )
                )}%`,
              }}
            >
              PE
            </span>
          </div>

          <div className="precipitacaoSimulationBuretteLabels">
            <span>0 mL</span>

            <span>
              {formatarNumeroBR(
                resultadoSimulado
                  .volumeMaximoBureta,
                2
              )}{" "}
              mL
            </span>
          </div>

          <p>
            {resultadoSimulado.mensagem}
          </p>
        </section>
      </div>

      <section className="precipitacaoSimulationDiagnosis">
        <span className="precipitacaoSectionLabel">
          Diagnóstico final
        </span>

        <h6>
          {Math.abs(
            comparacao.diferencaPE
          ) < 1e-8
            ? "O ponto de equivalência permaneceu inalterado"
            : comparacao.diferencaPE > 0
              ? "O ponto de equivalência foi deslocado para a direita"
              : "O ponto de equivalência foi deslocado para a esquerda"}
        </h6>

        <p>
          O cenário simulado exige{" "}
          <strong>
            {formatarNumeroBR(
              resultadoSimulado.volumePE,
              2
            )}{" "}
            mL
          </strong>{" "}
          de titulante para atingir a equivalência.
          Isso representa uma alteração de{" "}
          <strong>
            {formatarNumeroBR(
              Math.abs(
                comparacao.variacaoPercentual
              ),
              2
            )}
            %
          </strong>{" "}
          em relação à condição original.
        </p>
      </section>
    </section>
  );
}

type GraficoComparacaoCondicoesProps = {
  graficoRef:
    React.RefObject<SVGSVGElement | null>;
  pontosOriginais:
    PontoCurvaTitulacaoDiretaPrecipitacao[];
  pontosSimulados:
    PontoCurvaTitulacaoDiretaPrecipitacao[];
  volumePEOriginal: number;
  volumePESimulado: number;
  formulaTitulante: string;
};

function GraficoComparacaoCondicoes({
  graficoRef,
  pontosOriginais,
  pontosSimulados,
  volumePEOriginal,
  volumePESimulado,
  formulaTitulante,
}: GraficoComparacaoCondicoesProps) {
  const largura = 940;
  const altura = 560;

  const margemEsquerda = 76;
  const margemDireita = 30;
  const margemSuperior = 38;
  const margemInferior = 67;

  const pontosOriginaisValidos =
    pontosOriginais.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.pEspecieMonitorada
        )
    );

  const pontosSimuladosValidos =
    pontosSimulados.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.pEspecieMonitorada
        )
    );

  const todosPontos = [
    ...pontosOriginaisValidos,
    ...pontosSimuladosValidos,
  ];

  if (
    todosPontos.length === 0
  ) {
    return null;
  }

  const volumeMinimo = 0;

  const volumeMaximo =
    Math.max(
      ...todosPontos.map(
        (ponto) =>
          ponto.volumeAdicionado
      ),
      volumePEOriginal,
      volumePESimulado
    );

  const pMinimoBruto =
    Math.min(
      ...todosPontos.map(
        (ponto) =>
          ponto.pEspecieMonitorada
      )
    );

  const pMaximoBruto =
    Math.max(
      ...todosPontos.map(
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
    pMinimoBruto -
    margemP;

  const pMaximo =
    pMaximoBruto +
    margemP;

  const larguraUtil =
    largura -
    margemEsquerda -
    margemDireita;

  const alturaUtil =
    altura -
    margemSuperior -
    margemInferior;

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
    valor: number
  ) {
    return (
      margemSuperior +
      (
        (
          pMaximo -
          valor
        ) /
        (
          pMaximo -
          pMinimo || 1
        )
      ) *
        alturaUtil
    );
  }

  function criarCaminho(
    pontos:
      PontoCurvaTitulacaoDiretaPrecipitacao[]
  ) {
    return pontos
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
  }

  const xPEOriginal =
    converterX(
      volumePEOriginal
    );

  const xPESimulado =
    converterX(
      volumePESimulado
    );

  const xFaixa =
    Math.min(
      xPEOriginal,
      xPESimulado
    );

  const larguraFaixa =
    Math.abs(
      xPESimulado -
      xPEOriginal
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
      aria-label="Comparação entre curva original e curva simulada"
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
                className="simulacaoCondicoesGrid"
              />

              <text
                x={
                  margemEsquerda -
                  11
                }
                y={y + 4}
                textAnchor="end"
                className="simulacaoCondicoesTick"
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
                className="simulacaoCondicoesGrid"
              />

              <text
                x={x}
                y={
                  altura -
                  margemInferior +
                  25
                }
                textAnchor="middle"
                className="simulacaoCondicoesTick"
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
        className="simulacaoCondicoesPEArea"
      />

      <line
        x1={margemEsquerda}
        y1={margemSuperior}
        x2={margemEsquerda}
        y2={
          altura -
          margemInferior
        }
        className="simulacaoCondicoesAxis"
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
        className="simulacaoCondicoesAxis"
      />

      <path
        d={criarCaminho(
          pontosOriginaisValidos
        )}
        className="simulacaoCondicoesOriginalCurve"
      />

      <path
        d={criarCaminho(
          pontosSimuladosValidos
        )}
        className="simulacaoCondicoesSimulatedCurve"
      />

      <line
        x1={xPEOriginal}
        y1={margemSuperior}
        x2={xPEOriginal}
        y2={
          altura -
          margemInferior
        }
        className="simulacaoCondicoesOriginalPE"
      />

      <line
        x1={xPESimulado}
        y1={margemSuperior}
        x2={xPESimulado}
        y2={
          altura -
          margemInferior
        }
        className="simulacaoCondicoesSimulatedPE"
      />

      <text
        x={xPEOriginal + 7}
        y={margemSuperior + 17}
        className="simulacaoCondicoesOriginalLabel"
      >
        PE original
      </text>

      <text
        x={xPESimulado + 7}
        y={margemSuperior + 36}
        className="simulacaoCondicoesSimulatedLabel"
      >
        PE simulado
      </text>

      <text
        x={largura / 2}
        y={altura - 15}
        textAnchor="middle"
        className="simulacaoCondicoesLabel"
      >
        Volume de titulante adicionado (mL)
      </text>

      <text
        x="20"
        y={altura / 2}
        textAnchor="middle"
        transform={`rotate(-90 20 ${altura / 2})`}
        className="simulacaoCondicoesLabel"
      >
        p{formulaTitulante}
      </text>
    </svg>
  );
}