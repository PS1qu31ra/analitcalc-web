"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  avaliarInterferenciasPrecipitacao,
} from "@/lib/precipitacao/interferencias";

import {
  calcularSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosSeletividade";

import {
  gerarCurvaSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosCurvaSeletividade";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  InterferenciaPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
  SalPrecipitacao,
} from "@/lib/precipitacao/tipos";

type AnaliseInterferentesProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  formulaAnalito: string;
  formulaTitulante: string;
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

function obterEspecieAnalitoDoSal({
  sal,
  ionId,
}: {
  sal: SalPrecipitacao;
  ionId: string;
}) {
  return sal.cation.id === ionId
    ? ("cation" as const)
    : ("anion" as const);
}

function formatarPercentuaisNoTexto(
  texto: string
) {
  return texto.replace(
    /(\d+)\.(\d+)%/g,
    (
      valorCompleto,
      parteInteira: string,
      parteDecimal: string
    ) => {
      const valorNumerico =
        Number(
          `${parteInteira}.${parteDecimal}`
        );

      if (
        !Number.isFinite(
          valorNumerico
        )
      ) {
        return valorCompleto;
      }

      return `${formatarNumeroBR(
        valorNumerico,
        parteDecimal.length
      )}%`;
    }
  );
}

function obterClasseRisco(
  risco: InterferenciaPrecipitacao["risco"]
) {
  if (risco === "alto") {
    return "precipitacaoInterferenceRiskHigh";
  }

  if (risco === "moderado") {
    return "precipitacaoInterferenceRiskModerate";
  }

  return "precipitacaoInterferenceRiskLow";
}

export default function AnaliseInterferentes({
  resultado,
  formulaAnalito,
  formulaTitulante,
}: AnaliseInterferentesProps) {
  const graficoRef =
  useRef<SVGSVGElement>(null);

  const interferenciasPotenciais =
    useMemo(
      () =>
        avaliarInterferenciasPrecipitacao(
          resultado
        ),
      [resultado]
    );

  const [
    interferenteSelecionadoId,
    setInterferenteSelecionadoId,
  ] = useState("");

  const [
    concentracaoInterferenteDigitada,
    setConcentracaoInterferenteDigitada,
  ] = useState(
    formatarNumeroBR(
      resultado.concentracaoAnalito,
      4
    )
  );

  const [
    concentracaoInterferente,
    setConcentracaoInterferente,
  ] = useState(
    resultado.concentracaoAnalito
  );

  const [
    erroEntrada,
    setErroEntrada,
  ] = useState("");

  useEffect(() => {
    const primeiroInterferente =
      interferenciasPotenciais[0];

    setInterferenteSelecionadoId(
      primeiroInterferente
        ?.salInterferente.id ?? ""
    );

    setConcentracaoInterferente(
      resultado.concentracaoAnalito
    );

    setConcentracaoInterferenteDigitada(
      formatarNumeroBR(
        resultado.concentracaoAnalito,
        4
      )
    );

    setErroEntrada("");
  }, [
    interferenciasPotenciais,
    resultado.concentracaoAnalito,
  ]);

  const interferenteSelecionado =
    useMemo(
      () =>
        interferenciasPotenciais.find(
          (item) =>
            item.salInterferente.id ===
            interferenteSelecionadoId
        ) ??
        interferenciasPotenciais[0] ??
        null,
      [
        interferenciasPotenciais,
        interferenteSelecionadoId,
      ]
    );

  const resultadoSeletividade =
    useMemo(() => {
      if (!interferenteSelecionado) {
        return null;
      }

      const especieInterferente =
        obterEspecieAnalitoDoSal({
          sal:
            interferenteSelecionado
              .salInterferente,
          ionId:
            interferenteSelecionado
              .especieConcorrente.id,
        });

      return calcularSeletividadePrecipitacao({
        especieTitulante:
          resultado.especieTitulante,

        itens: [
          {
            sal: resultado.sal,
            especieAnalito:
              resultado.especieAnalito,
            concentracaoAnalito:
              resultado.concentracaoAnalito,
          },
          {
            sal:
              interferenteSelecionado
                .salInterferente,
            especieAnalito:
              especieInterferente,
            concentracaoAnalito:
              concentracaoInterferente,
          },
        ],
      });
    }, [
      concentracaoInterferente,
      interferenteSelecionado,
      resultado.concentracaoAnalito,
      resultado.especieAnalito,
      resultado.especieTitulante,
      resultado.sal,
    ]);

  const curvaSeletividade =
    useMemo(() => {
      if (
        !resultadoSeletividade ||
        resultadoSeletividade.status !==
          "adequado"
      ) {
        return null;
      }

      const volumeMaximo =
        Math.max(
          resultado.volumeMaximoBureta,
          resultado.volumePE * 1.3
        );

      return gerarCurvaSeletividadePrecipitacao({
        resultado:
          resultadoSeletividade,
        volumeAmostra:
          resultado.volumeAmostra,
        concentracaoTitulante:
          resultado.concentracaoTitulante,
        passo: 0.1,
        volumeMaximoManual:
          volumeMaximo,
      });
    }, [
      resultado.concentracaoTitulante,
      resultado.volumeAmostra,
      resultado.volumeMaximoBureta,
      resultado.volumePE,
      resultadoSeletividade,
    ]);

  const itemPrincipal =
    useMemo(() => {
      if (
        !resultadoSeletividade ||
        resultadoSeletividade.status !==
          "adequado"
      ) {
        return null;
      }

      return (
        resultadoSeletividade.itens.find(
          (item) =>
            item.sal.id ===
            resultado.sal.id
        ) ?? null
      );
    }, [
      resultado.sal.id,
      resultadoSeletividade,
    ]);

  const itemInterferente =
    useMemo(() => {
      if (
        !resultadoSeletividade ||
        resultadoSeletividade.status !==
          "adequado" ||
        !interferenteSelecionado
      ) {
        return null;
      }

      return (
        resultadoSeletividade.itens.find(
          (item) =>
            item.sal.id ===
            interferenteSelecionado
              .salInterferente.id
        ) ?? null
      );
    }, [
      interferenteSelecionado,
      resultadoSeletividade,
    ]);

  const comparacaoConfiabilidade =
    curvaSeletividade
      ?.comparacoesKps[0] ?? null;

      const avaliacaoSeparacao =
  comparacaoConfiabilidade
    ?.avaliacao ?? null;

    const interpretacaoQuimicaDetalhada =
    useMemo(() => {
      if (
        !itemPrincipal ||
        !itemInterferente ||
        !interferenteSelecionado
      ) {
        return "";
      }
  
      const interferentePrimeiro =
        itemInterferente
          .ordemPrecipitacao <
        itemPrincipal
          .ordemPrecipitacao;
  
      const mesmaOrdem =
        itemInterferente
          .ordemPrecipitacao ===
        itemPrincipal
          .ordemPrecipitacao;
  
      if (interferentePrimeiro) {
        return (
          `${itemInterferente.sal.formulaExibicao} começa a precipitar ` +
          `antes de ${itemPrincipal.sal.formulaExibicao}. Portanto, ` +
          `${interferenteSelecionado.especieConcorrente.formulaExibicao} ` +
          `começa a consumir ${formulaTitulante} antes da precipitação ` +
          "predominante do analito principal."
        );
      }
  
      if (mesmaOrdem) {
        return (
          `${itemPrincipal.sal.formulaExibicao} e ` +
          `${itemInterferente.sal.formulaExibicao} apresentam condições ` +
          "de início praticamente iguais. Os dois precipitados podem " +
          "começar a se formar simultaneamente."
        );
      }
  
      if (!avaliacaoSeparacao) {
        return (
          "Não foi possível obter a avaliação percentual da separação " +
          "para os dados informados."
        );
      }
  
      if (
        avaliacaoSeparacao.classificacao ===
        "nao_avaliada"
      ) {
        return (
          `${itemPrincipal.sal.formulaExibicao} começa a precipitar antes. ` +
          `${itemInterferente.sal.formulaExibicao} não começou a se formar ` +
          "dentro do intervalo simulado, portanto não foi observada " +
          "precipitação concorrente nessa faixa."
        );
      }
  
      return (
        `${itemPrincipal.sal.formulaExibicao} precipita antes de ` +
        `${itemInterferente.sal.formulaExibicao}. Quando o precipitado ` +
        "interferente começa a se formar, aproximadamente " +
        `${formatarNumeroBR(
          avaliacaoSeparacao
            .percentualPrecipitado ?? 0,
          4
        )}% do sistema principal já precipitou. ` +
        `A classificação obtida foi: ${avaliacaoSeparacao.titulo}.`
      );
    }, [
      avaliacaoSeparacao,
      formulaTitulante,
      interferenteSelecionado,
      itemInterferente,
      itemPrincipal,
    ]);

    const diagnostico =
    useMemo(() => {
      if (
        !itemPrincipal ||
        !itemInterferente ||
        !interferenteSelecionado
      ) {
        return null;
      }
  
      const interferentePrimeiro =
        itemInterferente
          .ordemPrecipitacao <
        itemPrincipal
          .ordemPrecipitacao;
  
      const mesmaOrdem =
        itemInterferente
          .ordemPrecipitacao ===
        itemPrincipal
          .ordemPrecipitacao;
  
      const razaoInicio =
        itemInterferente
          .concentracaoTitulanteInicioPrecipitacao /
        itemPrincipal
          .concentracaoTitulanteInicioPrecipitacao;
  
      if (interferentePrimeiro) {
        return {
          titulo:
            "O interferente precipita antes do analito principal",
  
          impacto:
            `A espécie ${interferenteSelecionado.especieConcorrente.formulaExibicao} ` +
            `começa a consumir ${formulaTitulante} antes da precipitação ` +
            `predominante de ${formulaAnalito}. Isso pode aumentar o volume ` +
            "de titulante utilizado e provocar erro positivo.",
  
          recomendacao:
            "Considere remover ou separar previamente o interferente, alterar as condições experimentais ou utilizar outro procedimento analítico.",
  
          razaoInicio,
  
          riscoIntegrado:
            "alto" as const,
        };
      }
  
      if (mesmaOrdem) {
        return {
          titulo:
            "Os precipitados apresentam início praticamente simultâneo",
  
          impacto:
            `O titulante pode ser consumido simultaneamente por ` +
            `${itemPrincipal.sal.formulaExibicao} e ` +
            `${itemInterferente.sal.formulaExibicao}, comprometendo a seletividade.`,
  
          recomendacao:
            "Considere separação prévia, alteração das condições do meio ou outro método analítico.",
  
          razaoInicio,
  
          riscoIntegrado:
            "alto" as const,
        };
      }
  
      if (!avaliacaoSeparacao) {
        return {
          titulo:
            "A separação não pôde ser classificada",
  
          impacto:
            "Os dados atuais não permitiram calcular o percentual precipitado no início do sistema concorrente.",
  
          recomendacao:
            "Verifique a faixa de volume da simulação, as concentrações e os dados de solubilidade.",
  
          razaoInicio,
  
          riscoIntegrado:
            interferenteSelecionado.risco,
        };
      }
  
      if (
        avaliacaoSeparacao.classificacao ===
        "nao_avaliada"
      ) {
        return {
          titulo:
            "Baixo risco dentro da faixa simulada",
  
          impacto:
            `${itemInterferente.sal.formulaExibicao} não começou a se formar ` +
            "dentro do intervalo avaliado. Não foi observada competição " +
            "por precipitação nessa faixa.",
  
          recomendacao:
            "A classificação é válida para o intervalo simulado e para a concentração informada do interferente.",
  
          razaoInicio,
  
          riscoIntegrado:
            "baixo" as const,
        };
      }
  
      return {
        titulo:
          avaliacaoSeparacao.titulo,
  
        impacto:
          avaliacaoSeparacao.interpretacao,
  
        recomendacao:
          avaliacaoSeparacao.risco ===
          "alto"
            ? "Considere separação prévia, redução da concentração do interferente ou mudança do procedimento analítico."
            : avaliacaoSeparacao.risco ===
                "moderado"
              ? "Avalie se a sobreposição é aceitável para a exatidão pretendida e confirme experimentalmente."
              : "A separação tende a ser adequada nas condições simuladas, mantendo-se o controle experimental.",
  
        razaoInicio,
  
        riscoIntegrado:
          avaliacaoSeparacao.risco ??
          interferenteSelecionado.risco,
      };
    }, [
      avaliacaoSeparacao,
      formulaAnalito,
      formulaTitulante,
      interferenteSelecionado,
      itemInterferente,
      itemPrincipal,
    ]);

  function avaliarConcentracao(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const valor =
      converterNumeroBR(
        concentracaoInterferenteDigitada
      );

    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      setErroEntrada(
        "Informe uma concentração positiva e válida para o interferente."
      );

      return;
    }

    setConcentracaoInterferente(
      valor
    );

    setErroEntrada("");
  }

  function usarMesmaConcentracao() {
    setConcentracaoInterferente(
      resultado.concentracaoAnalito
    );

    setConcentracaoInterferenteDigitada(
      formatarNumeroBR(
        resultado.concentracaoAnalito,
        4
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
        stroke: #a1a1aa;
        stroke-width: 3.2;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0.78;
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
        stroke: #991b1b;
        stroke-width: 1.8;
        stroke-dasharray: 5 5;
      }
      .interferenceGraphStartCompetitor {
        stroke: #b45309;
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
            "analise-interferentes-seletividade.png";

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

  if (
    interferenciasPotenciais.length ===
    0
  ) {
    return (
      <section className="precipitacaoInterferenceSection">
        <div className="precipitacaoInterferenceEmpty">
          <span className="precipitacaoSectionLabel">
            Interferentes
          </span>

          <h5>
            Nenhum precipitado concorrente foi encontrado
          </h5>

          <p>
            A base atual não contém outro sal válido
            que utilize o mesmo titulante do sistema
            principal.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="precipitacaoInterferenceSection">
      <header className="precipitacaoInterferenceIntro">
        <span className="precipitacaoSectionLabel">
          Interferentes e seletividade
        </span>

        <h5>
          Avaliação de precipitados concorrentes
        </h5>

        <p>
          Compare o precipitado principal com outras
          espécies que também podem consumir{" "}
          {formulaTitulante}. A avaliação considera o
          Kps, a estequiometria e as concentrações
          analíticas informadas.
        </p>
      </header>

      <section className="precipitacaoInterferenceAssumption">
        <strong>
          Hipótese inicial da triagem automática
        </strong>

        <p>
          Na lista de risco potencial, o sistema assume
          inicialmente que o interferente possui a mesma
          concentração analítica do analito principal.
          A concentração real pode ser alterada abaixo
          para uma análise detalhada.
        </p>
      </section>

      <section className="precipitacaoInterferenceCandidates">
        <header>
          <div>
            <span className="precipitacaoSectionLabel">
              Triagem automática
            </span>

            <h6>
              Interferentes potenciais encontrados
            </h6>
          </div>

          <span>
            {interferenciasPotenciais.length} espécie(s)
          </span>
        </header>

        <div className="precipitacaoInterferenceCandidateGrid">
        {interferenciasPotenciais.map(
  (interferencia) => {
    const ativo =
      interferencia
        .salInterferente.id ===
      interferenteSelecionado
        ?.salInterferente.id;

        const riscoExibido =
        interferencia.risco;

              return (
                <button
                  key={
                    interferencia
                      .salInterferente.id
                  }
                  type="button"
                  className={[
                    "precipitacaoInterferenceCandidate",
                    ativo
                      ? "precipitacaoInterferenceCandidateActive"
                      : "",
                  ].join(" ")}
                  onClick={() => {
                    setInterferenteSelecionadoId(
                      interferencia
                        .salInterferente.id
                    );

                    setErroEntrada("");
                  }}
                  aria-pressed={ativo}
                >
                  <div>
                    <strong>
                      {
                        interferencia
                          .especieConcorrente
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
      riscoExibido
    ),
  ].join(" ")}
>
  Risco{" "}
  {riscoExibido}
</span>

                  <small>
                    Kps:{" "}
                    {formatarCientificoBR(
                      interferencia
                        .salInterferente.kps,
                      3
                    )}
                  </small>
                </button>
              );
            }
          )}
        </div>
      </section>

      <div className="precipitacaoInterferenceWorkspace">
        <aside className="precipitacaoInterferenceControls">
          <span className="precipitacaoSectionLabel">
            Espécie selecionada
          </span>

          <h6>
            {
              interferenteSelecionado
                ?.especieConcorrente
                .formulaExibicao
            }
          </h6>

          <div className="precipitacaoInterferenceSelectedSalt">
            <span>
              Precipitado concorrente
            </span>

            <strong>
              {
                interferenteSelecionado
                  ?.salInterferente
                  .formulaExibicao
              }
            </strong>

            <small>
              Kps ={" "}
              {interferenteSelecionado
                ? formatarCientificoBR(
                    interferenteSelecionado
                      .salInterferente.kps,
                    3
                  )
                : "-"}
            </small>
          </div>

          <form
            className="precipitacaoInterferenceForm"
            onSubmit={
              avaliarConcentracao
            }
          >
            <label htmlFor="concentracaoInterferente">
              Concentração do interferente
            </label>

            <div className="precipitacaoInterferenceInputGroup">
              <input
                id="concentracaoInterferente"
                type="text"
                inputMode="decimal"
                value={
                  concentracaoInterferenteDigitada
                }
                onChange={(event) => {
                  setConcentracaoInterferenteDigitada(
                    event.target.value
                  );

                  setErroEntrada("");
                }}
              />

              <span>mol L⁻¹</span>
            </div>

            {erroEntrada && (
              <p className="precipitacaoInterferenceError">
                {erroEntrada}
              </p>
            )}

            <button type="submit">
              Avaliar seletividade
            </button>
          </form>

          <button
            type="button"
            className="precipitacaoInterferenceEqualButton"
            onClick={usarMesmaConcentracao}
          >
            Usar a concentração do analito
          </button>
        </aside>

        <section className="precipitacaoInterferenceGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Curvas de precipitação
              </span>

              <h6>
                Analito principal × interferente
              </h6>

              <p>
  O gráfico compara as curvas de
  p{formulaTitulante} do sistema principal,
  do interferente isolado e da mistura
  completa durante a adição do titulante.
</p>
            </div>

            <button
              type="button"
              className="precipitacaoInterferenceDownloadButton"
              onClick={baixarGrafico}
              disabled={!curvaSeletividade}
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

          {curvaSeletividade &&
          interferenteSelecionado ? (
            <GraficoInterferencias
              graficoRef={graficoRef}
              curva={
                curvaSeletividade
              }
              salPrincipalId={
                resultado.sal.id
              }
              salInterferenteId={
                interferenteSelecionado
                  .salInterferente.id
              }
              formulaPrincipal={
                resultado.sal
                  .formulaExibicao
              }
              formulaInterferente={
                interferenteSelecionado
                  .salInterferente
                  .formulaExibicao
              }
            />
          ) : (
            <div className="precipitacaoInterferenceGraphEmpty">
              Não foi possível gerar a curva para os
              dados atuais.
            </div>
          )}

<footer className="precipitacaoInterferenceLegend">
  <span>
    <i className="precipitacaoInterferenceLegendMixture" />
    Mistura completa
  </span>

  <span>
    <i className="precipitacaoInterferenceLegendMain" />
    {resultado.sal.formulaExibicao} isolado
  </span>

  <span>
    <i className="precipitacaoInterferenceLegendCompetitor" />
    {
      interferenteSelecionado
        ?.salInterferente
        .formulaExibicao
    }{" "}
    isolado
  </span>
</footer>
        </section>
      </div>

      {itemPrincipal &&
        itemInterferente &&
        diagnostico && (
          <>
            <section className="precipitacaoInterferenceMetrics">
              <article>
                <span>
                  Início do principal
                </span>

                <strong>
                  {formatarCientificoBR(
                    itemPrincipal
                      .concentracaoTitulanteInicioPrecipitacao,
                    3
                  )}{" "}
                  mol L⁻¹
                </strong>

                <small>
                  Concentração crítica de{" "}
                  {formulaTitulante}
                </small>
              </article>

              <article>
                <span>
                  Início do interferente
                </span>

                <strong>
                  {formatarCientificoBR(
                    itemInterferente
                      .concentracaoTitulanteInicioPrecipitacao,
                    3
                  )}{" "}
                  mol L⁻¹
                </strong>

                <small>
                  Concentração crítica de{" "}
                  {formulaTitulante}
                </small>
              </article>

              <article>
                <span>
                  p{formulaTitulante} principal
                </span>

                <strong>
                  {formatarNumeroBR(
                    itemPrincipal
                      .pTitulanteInicioPrecipitacao,
                    4
                  )}
                </strong>

                <small>
                  Início de{" "}
                  {
                    itemPrincipal.sal
                      .formulaExibicao
                  }
                </small>
              </article>

              <article>
                <span>
                  p{formulaTitulante} interferente
                </span>

                <strong>
                  {formatarNumeroBR(
                    itemInterferente
                      .pTitulanteInicioPrecipitacao,
                    4
                  )}
                </strong>

                <small>
                  Início de{" "}
                  {
                    itemInterferente.sal
                      .formulaExibicao
                  }
                </small>
              </article>

              <article>
                <span>Razão dos inícios</span>

                <strong>
                  {formatarCientificoBR(
                    diagnostico.razaoInicio,
                    3
                  )}
                </strong>

                <small>
                  Interferente ÷ principal
                </small>
              </article>

              <article>
  <span>
    Classificação da separação
  </span>

  <strong>
    {avaliacaoSeparacao
      ? avaliacaoSeparacao.titulo
      : "Indisponível"}
  </strong>

  <small>
    {avaliacaoSeparacao
      ?.percentualPrecipitado ===
    null
      ? "Percentual não localizado"
      : avaliacaoSeparacao
          ?.percentualPrecipitado !==
        undefined
        ? `${formatarNumeroBR(
            avaliacaoSeparacao
              .percentualPrecipitado,
            4
          )}% do principal precipitado`
        : "Avaliação não disponível"}
  </small>
</article>
            </section>

            <div className="precipitacaoInterferenceInterpretationGrid">
              <section className="precipitacaoInterferenceOrder">
                <header>
                  <span className="precipitacaoSectionLabel">
                    Ordem de precipitação
                  </span>

                  <h6>
                    Qual precipitado se forma primeiro?
                  </h6>
                </header>

                <div className="precipitacaoInterferenceOrderList">
                  {resultadoSeletividade?.itens.map(
                    (item) => (
                      <article
                        key={item.sal.id}
                      >
                        <span>
                          {item.ordemPrecipitacao}º
                        </span>

                        <div>
                          <strong>
                            {
                              item.sal
                                .formulaExibicao
                            }
                          </strong>

                          <small>
                            Início em{" "}
                            {formatarCientificoBR(
                              item
                                .concentracaoTitulanteInicioPrecipitacao,
                              3
                            )}{" "}
                            mol L⁻¹
                          </small>
                        </div>
                      </article>
                    )
                  )}
                </div>

                <p>
                  {
                    resultadoSeletividade
                      ?.mensagem
                  }
                </p>
              </section>

              <section className="precipitacaoInterferenceReliability">
  <header>
    <span className="precipitacaoSectionLabel">
      Classificação predominante
    </span>

    <h6>
      Avaliação percentual da separação
    </h6>
  </header>

  <div
    className={[
      "precipitacaoInterferenceReliabilityStatus",
      !avaliacaoSeparacao ||
      avaliacaoSeparacao.risco ===
        null
        ? "precipitacaoInterferenceReliabilityStatusNeutral"
        : avaliacaoSeparacao.risco ===
            "baixo"
          ? "precipitacaoInterferenceReliabilityStatusOk"
          : "precipitacaoInterferenceReliabilityStatusAlert",
    ].join(" ")}
  >
    <strong>
      {avaliacaoSeparacao
        ? avaliacaoSeparacao.titulo
        : "Avaliação indisponível"}
    </strong>
  </div>

  <p>
  {formatarPercentuaisNoTexto(
    comparacaoConfiabilidade
      ?.interpretacao ??
      "A comparação percentual não foi gerada para os dados atuais."
  )}
</p>

  {avaliacaoSeparacao && (
    <div className="precipitacaoInterferenceKpsComparison">
      <span>
        Percentual do principal precipitado
      </span>

      <strong>
        {avaliacaoSeparacao
          .percentualPrecipitado ===
        null
          ? "Não avaliado"
          : `${formatarNumeroBR(
              avaliacaoSeparacao
                .percentualPrecipitado,
              4
            )}%`}
      </strong>

      <small>
        Remanescente em solução:{" "}
        {avaliacaoSeparacao
          .percentualRemanescente ===
        null
          ? "não calculado"
          : `${formatarNumeroBR(
              avaliacaoSeparacao
                .percentualRemanescente,
              6
            )}%`}
      </small>
    </div>
  )}

  {comparacaoConfiabilidade && (
    <div className="precipitacaoInterferenceKpsComparison">
      <span>
        Razão entre Kps — informação auxiliar
      </span>

      <strong>
        {formatarCientificoBR(
          comparacaoConfiabilidade
            .razaoKps,
          3
        )}
      </strong>

      <small>
        Não é o critério predominante da classificação
      </small>
    </div>
  )}
</section>
            </div>

            <section className="precipitacaoClassificationReference">
              <header>
                <div>
                  <span className="precipitacaoSectionLabel">
                    Padrão de classificação
                  </span>

                  <h6>
                    Critério percentual adotado
                  </h6>
                </div>

                <small>
                  Percentual do primeiro analito já
                  precipitado quando o precipitado
                  seguinte começa a se formar.
                </small>
              </header>

              <div className="precipitacaoClassificationReferenceTableWrapper">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Primeiro já precipitado
                      </th>

                      <th>
                        Classificação
                      </th>

                      <th>
                        Risco
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>
                        Menor que 90%
                      </td>

                      <td>
                        Não seletiva
                      </td>

                      <td>
                        <span className="precipitacaoInterferenceRiskBadge precipitacaoInterferenceRiskHigh">
                          Alto
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        90% a menor que 99%
                      </td>

                      <td>
                        Separação insuficiente
                      </td>

                      <td>
                        <span className="precipitacaoInterferenceRiskBadge precipitacaoInterferenceRiskHigh">
                          Alto
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        99% a menor que 99,9%
                      </td>

                      <td>
                        Separação parcial
                      </td>

                      <td>
                        <span className="precipitacaoInterferenceRiskBadge precipitacaoInterferenceRiskModerate">
                          Moderado
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        99,9% a menor que 99,99%
                      </td>

                      <td>
                        Separação quantitativa
                      </td>

                      <td>
                        <span className="precipitacaoInterferenceRiskBadge precipitacaoInterferenceRiskLow">
                          Baixo
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        99,99% ou mais
                      </td>

                      <td>
                        Separação muito favorável
                      </td>

                      <td>
                        <span className="precipitacaoInterferenceRiskBadge precipitacaoInterferenceRiskLow">
                          Baixo
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Quando o interferente precipita antes
                do sistema principal ou quando os dois
                precipitados apresentam início
                praticamente simultâneo, o risco é
                classificado como alto,
                independentemente do percentual.
              </p>
            </section>

            <section className="precipitacaoInterferenceDiagnosis">
              <header>
                <div>
                  <span className="precipitacaoSectionLabel">
                    Diagnóstico integrado
                  </span>

                  <h6>
                    {diagnostico.titulo}
                  </h6>
                </div>

                <span
                  className={[
                    "precipitacaoInterferenceRiskBadge",
                    obterClasseRisco(
                      diagnostico.riscoIntegrado
                    ),
                  ].join(" ")}
                >
                  Risco{" "}
{diagnostico.riscoIntegrado}
                </span>
              </header>

              <div className="precipitacaoInterferenceDiagnosisBlocks">
                <article>
                  <span>
                    Interpretação química
                  </span>

                  <p>
  {formatarPercentuaisNoTexto(
    interpretacaoQuimicaDetalhada
  )}
</p>
                </article>

                <article>
                  <span>
                    Impacto analítico
                  </span>

                  <p>
  {formatarPercentuaisNoTexto(
    diagnostico.impacto
  )}
</p>
                </article>

                <article>
                  <span>
                    Recomendação experimental
                  </span>

                  <p>
                    {
                      diagnostico.recomendacao
                    }
                  </p>
                </article>
              </div>
            </section>
          </>
        )}
    </section>
  );
}

type GraficoInterferenciasProps = {
  graficoRef:
  React.RefObject<SVGSVGElement>

  curva: ReturnType<
    typeof gerarCurvaSeletividadePrecipitacao
  >;

  salPrincipalId: string;
  salInterferenteId: string;
  formulaPrincipal: string;
  formulaInterferente: string;
};

function GraficoInterferencias({
  graficoRef,
  curva,
  salPrincipalId,
  salInterferenteId,
  formulaPrincipal,
  formulaInterferente,
}: GraficoInterferenciasProps) {
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

  const seriePrincipal =
    curva.seriesIsoladas.find(
      (serie) =>
        serie.sal.id ===
        salPrincipalId
    );

  const serieInterferente =
    curva.seriesIsoladas.find(
      (serie) =>
        serie.sal.id ===
        salInterferenteId
    );

  if (
    !seriePrincipal ||
    !serieInterferente
  ) {
    return null;
  }

  const pontosPrincipal =
    seriePrincipal.pontos.filter(
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
    ...pontosPrincipal,
    ...pontosInterferente,
    ...pontosMistura,
  ];

  if (todosPontos.length === 0) {
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
    pontos: typeof pontosPrincipal
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

  const inicioPrincipalValido =
    Number.isFinite(
      seriePrincipal.volumeInicio
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
      aria-label="Curvas de precipitação do analito principal, do interferente e da mistura"
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
            <g key={`x-${volume}`}>
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

      {inicioPrincipalValido && (
        <line
          x1={converterX(
            seriePrincipal.volumeInicio
          )}
          y1={margemSuperior}
          x2={converterX(
            seriePrincipal.volumeInicio
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
            serieInterferente.volumeInicio
          )}
          y1={margemSuperior}
          x2={converterX(
            serieInterferente.volumeInicio
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
          pontosPrincipal
        )}
        className="interferenceGraphMain"
      />

      <path
        d={criarCaminho(
          pontosInterferente
        )}
        className="interferenceGraphCompetitor"
      />

      {inicioPrincipalValido && (
        <text
          x={
            converterX(
              seriePrincipal.volumeInicio
            ) +
            7
          }
          y={margemSuperior + 18}
          className="interferenceGraphMainLabel"
        >
          Início {formulaPrincipal}
        </text>
      )}

      {inicioInterferenteValido && (
        <text
          x={
            converterX(
              serieInterferente.volumeInicio
            ) +
            7
          }
          y={margemSuperior + 38}
          className="interferenceGraphCompetitorLabel"
        >
          Início {formulaInterferente}
        </text>
      )}

      <text
        x={largura / 2}
        y={altura - 15}
        textAnchor="middle"
        className="interferenceGraphLabel"
      >
        Volume de titulante adicionado (mL)
      </text>

      <text
        x="20"
        y={altura / 2}
        textAnchor="middle"
        transform={`rotate(-90 20 ${altura / 2})`}
        className="interferenceGraphLabel"
      >
        p{curva.formulaTitulante}
      </text>
    </svg>
  );
}