import {
  useMemo,
} from "react";

import {
    formatarCientificoBR,
    formatarNumeroBR,
  } from "@/lib/precipitacao/formatadores";

  import {
    gerarCurvaSeletividadePrecipitacao,
  } from "@/lib/precipitacao/calculosCurvaSeletividade";
  
  import type {
    ResultadoItemSeletividadePrecipitacao,
    ResultadoSeletividadePrecipitacao,
  } from "@/lib/precipitacao/tipos";

  import GraficoSeletividade from "./GraficoSeletividade";
  
  type ResultadoSeletividadeProps = {
    resultado: ResultadoSeletividadePrecipitacao;
    volumeAmostra: number;
    concentracaoTitulante: number;
    volumeMaximoBureta: number;
  };
  
  function obterFormulaAnalito(
    item: ResultadoItemSeletividadePrecipitacao
  ) {
    return item.especieAnalito === "cation"
      ? item.sal.cation.formulaExibicao
      : item.sal.anion.formulaExibicao;
  }
  
  function obterFormulaTitulante(
    resultado: ResultadoSeletividadePrecipitacao
  ) {
    const primeiroItem =
      resultado.itens[0];
  
    if (!primeiroItem) {
      return "titulante";
    }
  
    return resultado.especieTitulante === "cation"
      ? primeiroItem.sal.cation.formulaExibicao
      : primeiroItem.sal.anion.formulaExibicao;
  }
  
  function obterDiferencaLogaritmica({
    primeiro,
    segundo,
  }: {
    primeiro:
      ResultadoItemSeletividadePrecipitacao;
    segundo:
      ResultadoItemSeletividadePrecipitacao;
  }) {
    return Math.abs(
      primeiro.pTitulanteInicioPrecipitacao -
        segundo.pTitulanteInicioPrecipitacao
    );
  }
  
  function obterRazaoConcentracoesCriticas({
    primeiro,
    segundo,
  }: {
    primeiro:
      ResultadoItemSeletividadePrecipitacao;
    segundo:
      ResultadoItemSeletividadePrecipitacao;
  }) {
    const menorConcentracao =
      Math.min(
        primeiro
          .concentracaoTitulanteInicioPrecipitacao,
        segundo
          .concentracaoTitulanteInicioPrecipitacao
      );
  
    const maiorConcentracao =
      Math.max(
        primeiro
          .concentracaoTitulanteInicioPrecipitacao,
        segundo
          .concentracaoTitulanteInicioPrecipitacao
      );
  
    if (
      !Number.isFinite(
        menorConcentracao
      ) ||
      menorConcentracao <= 0 ||
      !Number.isFinite(
        maiorConcentracao
      )
    ) {
      return NaN;
    }
  
    return (
      maiorConcentracao /
      menorConcentracao
    );
  }
  
  export default function ResultadoSeletividade({
    resultado,
    volumeAmostra,
    concentracaoTitulante,
    volumeMaximoBureta,
  }: ResultadoSeletividadeProps) {
    const formulaTitulante =
      obterFormulaTitulante(
        resultado
      );

      const curvaSeletividade =
  useMemo(
    () =>
      gerarCurvaSeletividadePrecipitacao({
        resultado,
        volumeAmostra,
        concentracaoTitulante,
        passo: 0.1,
        volumeMaximoManual:
          volumeMaximoBureta,
      }),
    [
      concentracaoTitulante,
      resultado,
      volumeAmostra,
      volumeMaximoBureta,
    ]
  );

const comparacaoPrincipal =
  curvaSeletividade
    .comparacoesKps[0] ?? null;

const avaliacaoPrincipal =
  comparacaoPrincipal
    ?.avaliacao ?? null;
  
    const itensOrdenados = [
      ...resultado.itens,
    ].sort((itemA, itemB) => {
      const diferencaOrdem =
        itemA.ordemPrecipitacao -
        itemB.ordemPrecipitacao;
    
      if (diferencaOrdem !== 0) {
        return diferencaOrdem;
      }
    
      return (
        itemA
          .concentracaoTitulanteInicioPrecipitacao -
        itemB
          .concentracaoTitulanteInicioPrecipitacao
      );
    });
  
    const primeiroItem =
      itensOrdenados[0];
  
    const segundoItem =
      itensOrdenados[1];
  
    const diferencaPrimeiros =
      primeiroItem &&
      segundoItem
        ? obterDiferencaLogaritmica({
            primeiro:
              primeiroItem,
            segundo:
              segundoItem,
          })
        : NaN;
  
    const razaoPrimeiros =
      primeiroItem &&
      segundoItem
        ? obterRazaoConcentracoesCriticas({
            primeiro:
              primeiroItem,
            segundo:
              segundoItem,
          })
        : NaN;
  
    const resultadoAdequado =
      resultado.status ===
      "adequado";
  
    return (
      <section
        className="precipitacaoResultsSection"
        aria-live="polite"
      >
        <header className="precipitacaoResultsHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Resultado calculado
            </span>
  
            <h3>
              Ordem de precipitação
            </h3>
  
            <p>
              A ordem foi determinada pela
              concentração livre de{" "}
              {formulaTitulante} necessária
              para iniciar a formação de cada
              precipitado.
            </p>
          </div>
  
          <span
            className={[
              "precipitacaoStatus",
              resultadoAdequado
                ? "precipitacaoStatusSuccess"
                : "precipitacaoStatusWarning",
            ].join(" ")}
          >
            {resultadoAdequado
              ? "Sistema calculado"
              : "Revisar mistura"}
          </span>
        </header>
  
        {itensOrdenados.length >
        0 ? (
          <>
            <section className="precipitacaoSelectivityOrderSection">
              <header className="precipitacaoSelectivityOrderHeader">
                <div>
                  <span className="precipitacaoSectionLabel">
                    Sequência prevista
                  </span>
  
                  <h4>
                    Formação dos precipitados
                  </h4>
  
                  <p>
                    O primeiro precipitado é
                    aquele que necessita da menor
                    concentração livre de titulante
                    para começar a se formar.
                  </p>
                </div>
              </header>
  
              <div className="precipitacaoSelectivityOrderList">
                {itensOrdenados.map(
                  (item) => {
                    const formulaAnalito =
                      obterFormulaAnalito(
                        item
                      );
  
                    return (
                      <article
                        key={
                          item.sal.id
                        }
                        className={
                          item.ordemPrecipitacao ===
                          1
                            ? "precipitacaoSelectivityOrderCard precipitacaoSelectivityOrderCardFirst"
                            : "precipitacaoSelectivityOrderCard"
                        }
                      >
                        <div className="precipitacaoSelectivityOrderPosition">
                          <span>
                            {
                              item.ordemPrecipitacao
                            }
                          </span>
  
                          <small>
                            º
                          </small>
                        </div>
  
                        <div className="precipitacaoSelectivityOrderContent">
                          <span>
                            Precipitado previsto
                          </span>
  
                          <strong>
                            {
                              item.sal
                                .formulaExibicao
                            }
                          </strong>
  
                          <p>
                            Formado pela reação de{" "}
                            {formulaAnalito} com{" "}
                            {formulaTitulante}.
                          </p>
                        </div>
  
                        <div className="precipitacaoSelectivityOrderValues">
                          <div>
                            <span>
                              Concentração crítica
                            </span>
  
                            <strong>
                              {formatarCientificoBR(
                                item
                                  .concentracaoTitulanteInicioPrecipitacao,
                                3
                              )}{" "}
                              mol/L
                            </strong>
                          </div>
  
                          <div>
                            <span>
                              p{formulaTitulante}
                            </span>
  
                            <strong>
                              {formatarNumeroBR(
                                item
                                  .pTitulanteInicioPrecipitacao,
                                4
                              )}
                            </strong>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
  
            <section className="precipitacaoResultsGrid">
              <article className="precipitacaoResultCard precipitacaoResultCardMain">
                <span>
                  Primeiro precipitado
                </span>
  
                <strong>
                  {primeiroItem
                    ? primeiroItem.sal
                        .formulaExibicao
                    : "—"}
                </strong>
  
                <p>
                  Espécie prevista para iniciar
                  primeiro a precipitação.
                </p>
              </article>
  
              <article className="precipitacaoResultCard">
                <span>
                  Concentração crítica inicial
                </span>
  
                <strong>
                  {primeiroItem
                    ? formatarCientificoBR(
                        primeiroItem
                          .concentracaoTitulanteInicioPrecipitacao,
                        3
                      )
                    : "—"}
  
                  <small>
                    {" "}
                    mol/L
                  </small>
                </strong>
  
                <p>
                  Concentração livre de{" "}
                  {formulaTitulante} necessária
                  para o primeiro início de
                  precipitação.
                </p>
              </article>
  
              <article className="precipitacaoResultCard">
                <span>
                  Diferença entre os dois primeiros
                </span>
  
                <strong>
                  {Number.isFinite(
                    diferencaPrimeiros
                  )
                    ? formatarNumeroBR(
                        diferencaPrimeiros,
                        4
                      )
                    : "—"}
                </strong>
  
                <p>
                  Diferença entre os valores de
                  p{formulaTitulante} críticos
                  dos dois primeiros precipitados.
                </p>
              </article>
  
              <article className="precipitacaoResultCard">
                <span>
                  Razão das concentrações críticas
                </span>
  
                <strong>
                  {Number.isFinite(
                    razaoPrimeiros
                  )
                    ? formatarCientificoBR(
                        razaoPrimeiros,
                        3
                      )
                    : "—"}
                </strong>
  
                <p>
                  Relação entre a maior e a menor
                  concentração crítica dos dois
                  primeiros sistemas.
                </p>
              </article>
            </section>
  
            {primeiroItem &&
              segundoItem && (
                <section className="precipitacaoSelectivityComparison">
                  <header>
                    <span className="precipitacaoSectionLabel">
                      Comparação principal
                    </span>
  
                    <h4>
                      {
                        primeiroItem.sal
                          .formulaExibicao
                      }{" "}
                      ×{" "}
                      {
                        segundoItem.sal
                          .formulaExibicao
                      }
                    </h4>
                  </header>
  
                  <div className="precipitacaoSelectivityComparisonGrid">
                    <article>
                      <span>
                        Forma-se primeiro
                      </span>
  
                      <strong>
                        {
                          primeiroItem.sal
                            .formulaExibicao
                        }
                      </strong>
  
                      <small>
                        Início em{" "}
                        {formatarCientificoBR(
                          primeiroItem
                            .concentracaoTitulanteInicioPrecipitacao,
                          3
                        )}{" "}
                        mol/L
                      </small>
                    </article>
  
                    <article>
                      <span>
                        Forma-se depois
                      </span>
  
                      <strong>
                        {
                          segundoItem.sal
                            .formulaExibicao
                        }
                      </strong>
  
                      <small>
                        Início em{" "}
                        {formatarCientificoBR(
                          segundoItem
                            .concentracaoTitulanteInicioPrecipitacao,
                          3
                        )}{" "}
                        mol/L
                      </small>
                    </article>
  
                    <article>
                      <span>
                        Razão entre os inícios
                      </span>
  
                      <strong>
                        {formatarCientificoBR(
                          razaoPrimeiros,
                          3
                        )}
                      </strong>
  
                      <small>
                        Maior concentração crítica
                        dividida pela menor
                      </small>
                    </article>
                  </div>
  
                  <div className="precipitacaoResultInterpretation">
                    <div className="precipitacaoResultInterpretationHeader">
                      <span>
                        Leitura química
                      </span>
  
                      <strong>
                        Ordem determinada pelo
                        início de precipitação
                      </strong>
                    </div>
  
                    <p>
                      O precipitado{" "}
                      <strong>
                        {
                          primeiroItem.sal
                            .formulaExibicao
                        }
                      </strong>{" "}
                      começa a se formar antes de{" "}
                      <strong>
                        {
                          segundoItem.sal
                            .formulaExibicao
                        }
                      </strong>
                      , pois necessita de uma
                      concentração livre menor de{" "}
                      {formulaTitulante}. Essa ordem
                      indica qual espécie responde
                      primeiro à adição do titulante,
                      mas ainda não garante, sozinha,
                      uma separação quantitativa
                      completa.
                    </p>
                  </div>
                </section>
              )}

{comparacaoPrincipal &&
  avaliacaoPrincipal && (
    <section className="precipitacaoSelectivityClassification">
      <header className="precipitacaoSelectivityClassificationHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Classificação predominante
          </span>

          <h4>
            Avaliação da separação quantitativa
          </h4>

          <p>
            A classificação considera quanto do
            primeiro precipitado já se formou quando
            o segundo começa a precipitar.
          </p>
        </div>

        <span
          className={[
            "precipitacaoInterferenceRiskBadge",
            avaliacaoPrincipal.risco ===
            "alto"
              ? "precipitacaoInterferenceRiskHigh"
              : avaliacaoPrincipal.risco ===
                  "moderado"
                ? "precipitacaoInterferenceRiskModerate"
                : avaliacaoPrincipal.risco ===
                    "baixo"
                  ? "precipitacaoInterferenceRiskLow"
                  : "",
          ].join(" ")}
        >
          {avaliacaoPrincipal.risco === null
  ? "Risco indeterminado"
  : `Risco ${avaliacaoPrincipal.risco}`}
        </span>
      </header>

      <div className="precipitacaoSelectivityClassificationGrid">
        <article>
          <span>
            Primeiro precipitado
          </span>

          <strong>
            {
              comparacaoPrincipal
                .primeiroSal
                .formulaExibicao
            }
          </strong>

          <small>
            Sistema avaliado primeiro
          </small>
        </article>

        <article>
          <span>
            Segundo precipitado
          </span>

          <strong>
            {
              comparacaoPrincipal
                .segundoSal
                .formulaExibicao
            }
          </strong>

          <small>
            Início da competição
          </small>
        </article>

        <article>
          <span>
            Primeiro já precipitado
          </span>

          <strong>
            {avaliacaoPrincipal
              .percentualPrecipitado ===
            null
              ? "Não avaliado"
              : `${formatarNumeroBR(
                  avaliacaoPrincipal
                    .percentualPrecipitado,
                  4
                )}%`}
          </strong>

          <small>
            No início do segundo precipitado
          </small>
        </article>

        <article>
          <span>
            Primeiro remanescente
          </span>

          <strong>
            {avaliacaoPrincipal
              .percentualRemanescente ===
            null
              ? "Não avaliado"
              : `${formatarNumeroBR(
                  avaliacaoPrincipal
                    .percentualRemanescente,
                  6
                )}%`}
          </strong>

          <small>
            Fração ainda dissolvida
          </small>
        </article>

        <article>
  <span>
    Classificação
  </span>

  <strong>
    {avaliacaoPrincipal.titulo}
  </strong>

  <small>
    {avaliacaoPrincipal
      .percentualPrecipitado === null
      ? "Separação não avaliada no intervalo"
      : "Critério percentual predominante"}
  </small>
</article>

        <article>
          <span>
            Volume de início do segundo
          </span>

          <strong>
            {comparacaoPrincipal
              .volumeInicioSegundo ===
            null
              ? "Não localizado"
              : `${formatarNumeroBR(
                  comparacaoPrincipal
                    .volumeInicioSegundo,
                  3
                )} mL`}
          </strong>

          <small>
            Na mistura completa
          </small>
        </article>
      </div>

      <div className="precipitacaoResultInterpretation">
        <div className="precipitacaoResultInterpretationHeader">
          <span>
            Interpretação da separação
          </span>

          <strong>
            {
              avaliacaoPrincipal.titulo
            }
          </strong>
        </div>

        <p>
          {
            avaliacaoPrincipal
              .interpretacao
          }
        </p>
      </div>
    </section>
  )}

<GraficoSeletividade
  resultado={resultado}
  volumeAmostra={volumeAmostra}
  concentracaoTitulante={concentracaoTitulante}
  volumeMaximoBureta={volumeMaximoBureta}
/>
  
            <section className="precipitacaoSelectivityItemsTable">
              <header>
                <div>
                  <span className="precipitacaoSectionLabel">
                    Valores calculados
                  </span>
  
                  <h4>
                    Tabela de início da precipitação
                  </h4>
                </div>
  
                <span>
                  {itensOrdenados.length} sistema(s)
                </span>
              </header>
  
              <div className="precipitacaoInlineTableWrapper">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Ordem
                      </th>
  
                      <th>
                        Analito
                      </th>
  
                      <th>
                        Precipitado
                      </th>
  
                      <th>
                        Concentração inicial
                      </th>
  
                      <th>
                        [{formulaTitulante}] crítica
                      </th>
  
                      <th>
                        p{formulaTitulante}
                      </th>
  
                      <th>
                        Interpretação
                      </th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {itensOrdenados.map(
                      (item) => (
                        <tr
                          key={
                            item.sal.id
                          }
                          className={
                            item.ordemPrecipitacao ===
                            1
                              ? "precipitacaoInlineTablePERow"
                              : undefined
                          }
                        >
                          <td>
                            {
                              item.ordemPrecipitacao
                            }
                            º
                          </td>
  
                          <td>
                            {obterFormulaAnalito(
                              item
                            )}
                          </td>
  
                          <td>
                            {
                              item.sal
                                .formulaExibicao
                            }
                          </td>
  
                          <td>
                            {formatarCientificoBR(
                              item
                                .concentracaoAnalito,
                              3
                            )}{" "}
                            mol/L
                          </td>
  
                          <td>
                            {formatarCientificoBR(
                              item
                                .concentracaoTitulanteInicioPrecipitacao,
                              3
                            )}{" "}
                            mol/L
                          </td>
  
                          <td>
                            {formatarNumeroBR(
                              item
                                .pTitulanteInicioPrecipitacao,
                              4
                            )}
                          </td>
  
                          <td>
                            {
                              item.interpretacao
                            }
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
  
            <div
              className={[
                "precipitacaoResultMessage",
                resultadoAdequado
                  ? "precipitacaoResultMessageSuccess"
                  : "precipitacaoResultMessageWarning",
              ].join(" ")}
            >
              <strong>
                Diagnóstico da mistura
              </strong>
  
              <p>
                {resultado.mensagem}
              </p>
            </div>
  
            <div className="precipitacaoResultScientificNote">
  <strong>
    Critério predominante adotado
  </strong>

  <p>
    A ordem de precipitação é determinada pela
    concentração crítica de{" "}
    {formulaTitulante}. A classificação final da
    separação é determinada pelo percentual do
    primeiro analito já precipitado quando o
    precipitado seguinte começa a se formar.
  </p>
</div>
          </>
        ) : (
          <div className="precipitacaoResultMessage precipitacaoResultMessageWarning">
            <strong>
              Nenhum resultado disponível
            </strong>
  
            <p>
              O cálculo não retornou espécies válidas
              para a análise de seletividade.
            </p>
          </div>
        )}
      </section>
    );
  }