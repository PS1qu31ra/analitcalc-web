"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calcularTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/calculosTitulacaoRetorno";

import {
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

type SimulacaoCondicoesRetornoProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

type CamposSimulacaoRetorno = {
  concentracaoAnalito: string;
  volumeAmostra: string;
  concentracaoAgNO3: string;
  volumeAgNO3: string;
  concentracaoSCN: string;
  volumeMaximoBureta: string;
  passoCurva: string;
};

type ParametrosSimulacaoRetorno = {
  concentracaoAnalito: number;
  volumeAmostra: number;
  concentracaoAgNO3: number;
  volumeAgNO3: number;
  concentracaoSCN: number;
  volumeMaximoBureta: number;
  passoCurva: number;
};

type CenarioRapido =
  | "analito-dobro"
  | "analito-metade"
  | "agno3-dobro"
  | "agno3-metade"
  | "scn-dobro"
  | "scn-metade";

function converterNumeroBR(
  valor: string
) {
  const texto =
    valor.trim();

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

function obterFormulaAnalito(
  resultado: ResultadoTitulacaoRetornoPrecipitacao
) {
  return resultado.especieAnalito === "cation"
    ? resultado.salPrincipal.cation.formulaExibicao
    : resultado.salPrincipal.anion.formulaExibicao;
}

export default function SimulacaoCondicoesRetorno({
  resultado,
}: SimulacaoCondicoesRetornoProps) {
  const graficoRef =
    useRef<SVGSVGElement>(null);

  const formulaAnalito =
    obterFormulaAnalito(
      resultado
    );

  function criarParametrosOriginais():
    ParametrosSimulacaoRetorno {
    return {
      concentracaoAnalito:
        resultado.concentracaoAnalito,
      volumeAmostra:
        resultado.volumeAmostra,
      concentracaoAgNO3:
        resultado.concentracaoPrecipitanteExcesso,
      volumeAgNO3:
        resultado.volumePrecipitanteExcesso,
      concentracaoSCN:
        resultado.concentracaoTitulanteRetorno,
      volumeMaximoBureta:
        Math.max(
          resultado.volumeTitulanteRetorno,
          50
        ),
      passoCurva: 0.1,
    };
  }

  function transformarParametrosEmCampos(
    parametros:
      ParametrosSimulacaoRetorno
  ): CamposSimulacaoRetorno {
    return {
      concentracaoAnalito:
        formatarNumeroBR(
          parametros.concentracaoAnalito,
          4
        ),
      volumeAmostra:
        formatarNumeroBR(
          parametros.volumeAmostra,
          2
        ),
      concentracaoAgNO3:
        formatarNumeroBR(
          parametros.concentracaoAgNO3,
          4
        ),
      volumeAgNO3:
        formatarNumeroBR(
          parametros.volumeAgNO3,
          2
        ),
      concentracaoSCN:
        formatarNumeroBR(
          parametros.concentracaoSCN,
          4
        ),
      volumeMaximoBureta:
        formatarNumeroBR(
          parametros.volumeMaximoBureta,
          2
        ),
      passoCurva:
        formatarNumeroBR(
          parametros.passoCurva,
          2
        ),
    };
  }

  const parametrosOriginais =
    useMemo(
      () =>
        criarParametrosOriginais(),
      [resultado]
    );

  const [
    campos,
    setCampos,
  ] =
    useState<CamposSimulacaoRetorno>(
      transformarParametrosEmCampos(
        parametrosOriginais
      )
    );

  const [
    parametrosAplicados,
    setParametrosAplicados,
  ] =
    useState<ParametrosSimulacaoRetorno>(
      parametrosOriginais
    );

  const [
    erroEntrada,
    setErroEntrada,
  ] = useState("");

  useEffect(() => {
    const novosParametros =
      criarParametrosOriginais();

    setParametrosAplicados(
      novosParametros
    );

    setCampos(
      transformarParametrosEmCampos(
        novosParametros
      )
    );

    setErroEntrada("");
  }, [resultado]);

  const resultadoSimulado =
    useMemo(
      () =>
        calcularTitulacaoRetornoPrecipitacao({
          salPrincipal:
            resultado.salPrincipal,
          especieAnalito:
            resultado.especieAnalito,
          concentracaoAnalito:
            parametrosAplicados
              .concentracaoAnalito,
          volumeAmostra:
            parametrosAplicados
              .volumeAmostra,
          concentracaoPrecipitanteExcesso:
            parametrosAplicados
              .concentracaoAgNO3,
          volumePrecipitanteExcesso:
            parametrosAplicados
              .volumeAgNO3,
          concentracaoTitulanteRetorno:
            parametrosAplicados
              .concentracaoSCN,
          volumeMaximoBuretaRetorno:
            parametrosAplicados
              .volumeMaximoBureta,
        }),
      [
        parametrosAplicados,
        resultado.especieAnalito,
        resultado.salPrincipal,
      ]
    );

  const curvaOriginal =
    useMemo(
      () =>
        gerarCurvaTitulacaoRetorno({
          resultado,
          passo:
            parametrosAplicados
              .passoCurva,
        }),
      [
        parametrosAplicados.passoCurva,
        resultado,
      ]
    );

  const curvaSimulada =
    useMemo(
      () =>
        gerarCurvaTitulacaoRetorno({
          resultado:
            resultadoSimulado,
          passo:
            parametrosAplicados
              .passoCurva,
        }),
      [
        parametrosAplicados.passoCurva,
        resultadoSimulado,
      ]
    );

  const comparacao =
    useMemo(() => {
      const volumeOriginal =
        resultado.volumeTitulanteRetorno;

      const volumeSimulado =
        resultadoSimulado
          .volumeTitulanteRetorno;

      const resultadosComparaveis =
        Number.isFinite(
          volumeOriginal
        ) &&
        Number.isFinite(
          volumeSimulado
        );

      const diferencaPF =
        resultadosComparaveis
          ? volumeSimulado -
            volumeOriginal
          : NaN;

      const variacaoPercentual =
        resultadosComparaveis &&
        volumeOriginal !== 0
          ? (
              diferencaPF /
              volumeOriginal
            ) * 100
          : NaN;

      const percentualBureta =
        Number.isFinite(
          volumeSimulado
        ) &&
        parametrosAplicados
          .volumeMaximoBureta > 0
          ? (
              volumeSimulado /
              parametrosAplicados
                .volumeMaximoBureta
            ) * 100
          : NaN;

      let situacaoBureta:
        | "adequada"
        | "limite"
        | "fora"
        | "invalida";

      if (
        resultadoSimulado.status ===
          "dados_invalidos" ||
        resultadoSimulado.status ===
          "excesso_insuficiente"
      ) {
        situacaoBureta =
          "invalida";
      } else if (
        resultadoSimulado.status ===
        "fora_da_bureta"
      ) {
        situacaoBureta =
          "fora";
      } else if (
        percentualBureta >= 90
      ) {
        situacaoBureta =
          "limite";
      } else {
        situacaoBureta =
          "adequada";
      }

      const alteracoes:
        string[] = [];

      if (
        Math.abs(
          parametrosAplicados
            .concentracaoAnalito -
            resultado.concentracaoAnalito
        ) > 1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .concentracaoAnalito >
          resultado.concentracaoAnalito;

        alteracoes.push(
          aumentou
            ? `A concentração de ${formulaAnalito} aumentou. Uma quantidade maior de Ag⁺ é consumida na precipitação principal, restando menos prata para a titulação com SCN⁻.`
            : `A concentração de ${formulaAnalito} diminuiu. Menos Ag⁺ é consumido pelo analito, restando mais prata para a titulação de retorno.`
        );
      }

      if (
        Math.abs(
          parametrosAplicados
            .volumeAmostra -
            resultado.volumeAmostra
        ) > 1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .volumeAmostra >
          resultado.volumeAmostra;

        alteracoes.push(
          aumentou
            ? "O volume da amostra aumentou. Mantendo a concentração, a quantidade total de analito aumentou e mais Ag⁺ foi consumido."
            : "O volume da amostra diminuiu. Mantendo a concentração, a quantidade total de analito diminuiu e mais Ag⁺ permaneceu disponível para o retorno."
        );
      }

      if (
        Math.abs(
          parametrosAplicados
            .concentracaoAgNO3 -
            resultado
              .concentracaoPrecipitanteExcesso
        ) > 1e-12 ||
        Math.abs(
          parametrosAplicados
            .volumeAgNO3 -
            resultado
              .volumePrecipitanteExcesso
        ) > 1e-12
      ) {
        const molAgOriginal =
          resultado
            .molPrecipitanteAdicionado;

        const molAgSimulado =
          resultadoSimulado
            .molPrecipitanteAdicionado;

        alteracoes.push(
          molAgSimulado >
          molAgOriginal
            ? "A quantidade total de AgNO₃ adicionada aumentou. Isso tende a produzir maior excesso de Ag⁺ e maior volume de SCN⁻ no retorno."
            : "A quantidade total de AgNO₃ adicionada diminuiu. O excesso de Ag⁺ foi reduzido e pode se tornar insuficiente para precipitar completamente o analito."
        );
      }

      if (
        Math.abs(
          parametrosAplicados
            .concentracaoSCN -
            resultado
              .concentracaoTitulanteRetorno
        ) > 1e-12
      ) {
        const aumentou =
          parametrosAplicados
            .concentracaoSCN >
          resultado
            .concentracaoTitulanteRetorno;

        alteracoes.push(
          aumentou
            ? "A solução de SCN⁻ ficou mais concentrada. Cada mililitro consome mais Ag⁺ e o ponto final ocorre em menor volume."
            : "A solução de SCN⁻ ficou mais diluída. É necessário adicionar maior volume para titular a mesma quantidade de Ag⁺ remanescente."
        );
      }

      if (
        alteracoes.length === 0
      ) {
        alteracoes.push(
          "Os parâmetros químicos aplicados coincidem com o cenário original. Por isso, o ponto final e a curva permanecem praticamente inalterados."
        );
      }

      return {
        diferencaPF,
        variacaoPercentual,
        percentualBureta,
        situacaoBureta,
        alteracoes,
      };
    }, [
      formulaAnalito,
      parametrosAplicados,
      resultado,
      resultadoSimulado,
    ]);

  function atualizarCampo(
    campo:
      keyof CamposSimulacaoRetorno,
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
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const novosParametros:
      ParametrosSimulacaoRetorno = {
      concentracaoAnalito:
        converterNumeroBR(
          campos.concentracaoAnalito
        ),
      volumeAmostra:
        converterNumeroBR(
          campos.volumeAmostra
        ),
      concentracaoAgNO3:
        converterNumeroBR(
          campos.concentracaoAgNO3
        ),
      volumeAgNO3:
        converterNumeroBR(
          campos.volumeAgNO3
        ),
      concentracaoSCN:
        converterNumeroBR(
          campos.concentracaoSCN
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
      novosParametros.passoCurva >
      novosParametros.volumeMaximoBureta
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
    const novosParametros =
      criarParametrosOriginais();

    setParametrosAplicados(
      novosParametros
    );

    setCampos(
      transformarParametrosEmCampos(
        novosParametros
      )
    );

    setErroEntrada("");
  }

  function aplicarCenario(
    tipo: CenarioRapido
  ) {
    const novosParametros = {
      ...criarParametrosOriginais(),
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
      "agno3-dobro"
    ) {
      novosParametros.volumeAgNO3 *=
        2;
    }

    if (
      tipo ===
      "agno3-metade"
    ) {
      novosParametros.volumeAgNO3 *=
        0.5;
    }

    if (
      tipo ===
      "scn-dobro"
    ) {
      novosParametros.concentracaoSCN *=
        2;
    }

    if (
      tipo ===
      "scn-metade"
    ) {
      novosParametros.concentracaoSCN *=
        0.5;
    }

    setParametrosAplicados(
      novosParametros
    );

    setCampos(
      transformarParametrosEmCampos(
        novosParametros
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

          link.href =
            urlPng;

          link.download =
            "comparacao-condicoes-retrotitulacao-volhard.png";

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

  const curvaSimuladaDisponivel =
    curvaSimulada.pontos.length >
    0;

  return (
    <section className="precipitacaoSimulationSection">
      <header className="precipitacaoSimulationIntro">
        <span className="precipitacaoSectionLabel">
          Comparação de cenários
        </span>

        <h5>
          Simulação das condições da retrotitulação
        </h5>

        <p>
          Altere os dados da amostra, a quantidade
          de AgNO₃ adicionada e a concentração de
          SCN⁻. O sistema recalcula o excesso de
          prata, o ponto final e a curva de Volhard.
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
              Concentração do AgNO₃
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.concentracaoPrecipitanteExcesso,
                4
              )}{" "}
              mol/L
            </strong>
          </article>

          <article>
            <span>
              Volume de AgNO₃
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.volumePrecipitanteExcesso,
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>
              Concentração de SCN⁻
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.concentracaoTitulanteRetorno,
                4
              )}{" "}
              mol/L
            </strong>
          </article>

          <article>
            <span>
              PF original
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.volumeTitulanteRetorno,
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
                "agno3-dobro"
              )
            }
          >
            Volume de AgNO₃ 2× maior
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "agno3-metade"
              )
            }
          >
            Volume de AgNO₃ pela metade
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "scn-dobro"
              )
            }
          >
            SCN⁻ 2× mais concentrado
          </button>

          <button
            type="button"
            onClick={() =>
              aplicarCenario(
                "scn-metade"
              )
            }
          >
            SCN⁻ 50% mais diluído
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
            onSubmit={
              aplicarSimulacao
            }
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

                <span>
                  mol/L
                </span>
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

                <span>
                  mL
                </span>
              </div>
            </label>

            <label>
              Concentração do AgNO₃

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.concentracaoAgNO3
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "concentracaoAgNO3",
                      event.target.value
                    )
                  }
                />

                <span>
                  mol/L
                </span>
              </div>
            </label>

            <label>
              Volume de AgNO₃

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.volumeAgNO3
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "volumeAgNO3",
                      event.target.value
                    )
                  }
                />

                <span>
                  mL
                </span>
              </div>
            </label>

            <label>
              Concentração de SCN⁻

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    campos.concentracaoSCN
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "concentracaoSCN",
                      event.target.value
                    )
                  }
                />

                <span>
                  mol/L
                </span>
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

                <span>
                  mL
                </span>
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

                <span>
                  mL
                </span>
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
            onClick={
              restaurarOriginal
            }
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
                pontos finais teóricos dos dois
                cenários.
              </p>
            </div>

            <button
              type="button"
              className="precipitacaoSimulationDownloadButton"
              onClick={
                baixarGrafico
              }
              disabled={
                !curvaSimuladaDisponivel
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

          {curvaSimuladaDisponivel ? (
  <GraficoComparacaoCondicoesRetorno
    graficoRef={graficoRef}
    pontosOriginais={curvaOriginal.pontos}
    pontosSimulados={curvaSimulada.pontos}
    volumePFOriginal={
      resultado.volumeTitulanteRetorno
    }
    volumePFSimulado={
      resultadoSimulado.volumeTitulanteRetorno
    }
  />
) : (
  <div className="precipitacaoSimulationInvalidScenario">
    <span className="precipitacaoSectionLabel">
      Cenário não calculável
    </span>

    <h6>
      AgNO₃ insuficiente para precipitar todo o analito
    </h6>

    <p>
      Neste cenário, a quantidade de Ag⁺ adicionada é
      menor que a quantidade necessária para reagir com
      todo o analito. Como não permanece Ag⁺ em excesso,
      não existe uma etapa válida de retrotitulação com
      SCN⁻.
    </p>

    <div className="precipitacaoSimulationInvalidValues">
      <article>
        <span>Ag⁺ adicionado</span>
        <strong>
          {Number.isFinite(
            resultadoSimulado.molPrecipitanteAdicionado
          )
            ? `${formatarCientificoBR(
                resultadoSimulado.molPrecipitanteAdicionado,
                3
              )} mol`
            : "—"}
        </strong>
      </article>

      <article>
        <span>Ag⁺ necessário para o analito</span>
        <strong>
          {Number.isFinite(
            resultadoSimulado
              .molPrecipitanteConsumidoPeloAnalito
          )
            ? `${formatarCientificoBR(
                resultadoSimulado
                  .molPrecipitanteConsumidoPeloAnalito,
                3
              )} mol`
            : "—"}
        </strong>
      </article>
    </div>

    <strong className="precipitacaoSimulationInvalidRecommendation">
      Aumente a concentração ou o volume de AgNO₃ para
      restabelecer um excesso mensurável de Ag⁺.
    </strong>
  </div>
)}

{curvaSimuladaDisponivel && (
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
      PF original
    </span>

    <span>
      <i className="precipitacaoSimulationLegendSimulatedPE" />
      PF simulado
    </span>
  </footer>
)}
        </section>
      </div>

      <section className="precipitacaoSimulationMetrics">
        <article>
          <span>
            PF original
          </span>

          <strong>
            {formatarNumeroBR(
              resultado.volumeTitulanteRetorno,
              2
            )}{" "}
            mL
          </strong>

          <small>
            Cenário de referência
          </small>
        </article>

        <article>
          <span>
            PF simulado
          </span>

          <strong>
            {Number.isFinite(
              resultadoSimulado
                .volumeTitulanteRetorno
            )
              ? `${formatarNumeroBR(
                  resultadoSimulado
                    .volumeTitulanteRetorno,
                  2
                )} mL`
              : "—"}
          </strong>

          <small>
            Novo cenário calculado
          </small>
        </article>

        <article>
          <span>
            Ag⁺ remanescente
          </span>

          <strong>
            {Number.isFinite(
              resultadoSimulado
                .molPrecipitanteEmExcesso
            )
              ? formatarCientificoBR(
                  resultadoSimulado
                    .molPrecipitanteEmExcesso,
                  3
                )
              : "—"}
            <small>
              {" "}
              mol
            </small>
          </strong>

          <small>
            Excesso titulado com SCN⁻
          </small>
        </article>

        <article>
          <span>
            Variação do PF
          </span>

          <strong>
            {Number.isFinite(
              comparacao
                .variacaoPercentual
            )
              ? `${
                  comparacao
                    .variacaoPercentual >
                  0
                    ? "+"
                    : ""
                }${formatarNumeroBR(
                  comparacao
                    .variacaoPercentual,
                  2
                )}%`
              : "—"}
          </strong>

          <small>
            Em relação ao original
          </small>
        </article>

        <article>
          <span>
            Uso da bureta
          </span>

          <strong>
            {Number.isFinite(
              comparacao
                .percentualBureta
            )
              ? `${formatarNumeroBR(
                  comparacao
                    .percentualBureta,
                  1
                )}%`
              : "—"}
          </strong>

          <small>
            Percentual necessário
          </small>
        </article>

        <article>
          <span>
            Viabilidade
          </span>

          <strong>
            {comparacao.situacaoBureta ===
            "adequada"
              ? "Adequada"
              : comparacao.situacaoBureta ===
                  "limite"
                ? "Próxima do limite"
                : comparacao.situacaoBureta ===
                    "fora"
                  ? "Fora da bureta"
                  : "Condição inválida"}
          </strong>

          <small>
            Avaliação experimental
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
              (
                alteracao,
                indice
              ) => (
                <article
                  key={
                    alteracao
                  }
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
              Diagnóstico do cenário
            </h6>
          </header>

          <div
            className={[
              "precipitacaoSimulationViabilityStatus",
              comparacao.situacaoBureta ===
              "invalida"
                ? "precipitacaoSimulationViabilityStatus-fora"
                : `precipitacaoSimulationViabilityStatus-${comparacao.situacaoBureta}`,
            ].join(" ")}
          >
            <strong>
              {resultadoSimulado.mensagem}
            </strong>
          </div>

          {Number.isFinite(
            comparacao
              .percentualBureta
          ) && (
            <>
              <div className="precipitacaoSimulationBuretteScale">
                <div
                  className="precipitacaoSimulationBuretteFill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        comparacao
                          .percentualBureta
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
                        comparacao
                          .percentualBureta
                      )
                    )}%`,
                  }}
                >
                  PF
                </span>
              </div>

              <div className="precipitacaoSimulationBuretteLabels">
                <span>
                  0 mL
                </span>

                <span>
                  {formatarNumeroBR(
                    parametrosAplicados
                      .volumeMaximoBureta,
                    2
                  )}{" "}
                  mL
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="precipitacaoSimulationDiagnosis">
        <span className="precipitacaoSectionLabel">
          Diagnóstico final
        </span>

        <h6>
          {resultadoSimulado.status ===
          "excesso_insuficiente"
            ? "A quantidade de AgNO₃ é insuficiente"
            : resultadoSimulado.status ===
                "dados_invalidos"
              ? "O cenário simulado é inválido"
              : !Number.isFinite(
                    comparacao.diferencaPF
                  )
                ? "Não foi possível comparar os pontos finais"
                : Math.abs(
                      comparacao.diferencaPF
                    ) < 1e-8
                  ? "O ponto final permaneceu inalterado"
                  : comparacao.diferencaPF >
                      0
                    ? "O ponto final foi deslocado para a direita"
                    : "O ponto final foi deslocado para a esquerda"}
        </h6>

        <p>
          {resultadoSimulado.mensagem}
        </p>
      </section>
    </section>
  );
}

type GraficoComparacaoCondicoesRetornoProps = {
  graficoRef:
    React.RefObject<SVGSVGElement>;
  pontosOriginais:
    PontoCurvaTitulacaoRetornoPrecipitacao[];
  pontosSimulados:
    PontoCurvaTitulacaoRetornoPrecipitacao[];
  volumePFOriginal: number;
  volumePFSimulado: number;
};

function GraficoComparacaoCondicoesRetorno({
  graficoRef,
  pontosOriginais,
  pontosSimulados,
  volumePFOriginal,
  volumePFSimulado,
}: GraficoComparacaoCondicoesRetornoProps) {
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
          ponto.pPrecipitante
        )
    );

  const pontosSimuladosValidos =
    pontosSimulados.filter(
      (ponto) =>
        Number.isFinite(
          ponto.volumeAdicionado
        ) &&
        Number.isFinite(
          ponto.pPrecipitante
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
      volumePFOriginal,
      volumePFSimulado
    );

  const pMinimoBruto =
    Math.min(
      ...todosPontos.map(
        (ponto) =>
          ponto.pPrecipitante
      )
    );

  const pMaximoBruto =
    Math.max(
      ...todosPontos.map(
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
          pMaximo -
          valor
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
      PontoCurvaTitulacaoRetornoPrecipitacao[]
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
            ponto.pPrecipitante
          )}`
      )
      .join(" ");
  }

  const xPFOriginal =
    converterX(
      volumePFOriginal
    );

  const xPFSimulado =
    converterX(
      volumePFSimulado
    );

  const xFaixa =
    Math.min(
      xPFOriginal,
      xPFSimulado
    );

  const larguraFaixa =
    Math.abs(
      xPFSimulado -
      xPFOriginal
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
      aria-label="Comparação entre a curva original e a curva simulada da retrotitulação"
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
        x1={xPFOriginal}
        y1={margemSuperior}
        x2={xPFOriginal}
        y2={
          altura -
          margemInferior
        }
        className="simulacaoCondicoesOriginalPE"
      />

      <line
        x1={xPFSimulado}
        y1={margemSuperior}
        x2={xPFSimulado}
        y2={
          altura -
          margemInferior
        }
        className="simulacaoCondicoesSimulatedPE"
      />

      <text
        x={
          xPFOriginal +
          7
        }
        y={
          margemSuperior +
          17
        }
        className="simulacaoCondicoesOriginalLabel"
      >
        PF original
      </text>

      <text
        x={
          xPFSimulado +
          7
        }
        y={
          margemSuperior +
          36
        }
        className="simulacaoCondicoesSimulatedLabel"
      >
        PF simulado
      </text>

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
        className="simulacaoCondicoesLabel"
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
        className="simulacaoCondicoesLabel"
      >
        pAg⁺
      </text>
    </svg>
  );
}