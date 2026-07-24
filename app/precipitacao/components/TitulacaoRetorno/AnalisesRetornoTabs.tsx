"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  gerarCurvaTitulacaoRetorno,
} from "@/lib/precipitacao/calculosCurvaTitulacaoRetorno";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/tipos";

import DerivadasCurvaRetorno from "./DerivadasCurvaRetorno";

import ErroTitulacaoRetorno from "./ErroTitulacaoRetorno";

import SimulacaoTempoRealRetorno from "./SimulacaoTempoRealRetorno";

import MetodoVolhard from "./MetodoVolhard";

import SimulacaoCondicoesRetorno from "./SimulacaoCondicoesRetorno";

import AnaliseInterferentesRetorno from "./AnaliseInterferentesRetorno";

type AbaRetorno =
  | "tabela"
  | "derivadas"
  | "erro"
  | "tempo-real"
  | "metodos"
  | "simulacao"
  | "interferentes";

type AnalisesRetornoTabsProps = {
  resultado: ResultadoTitulacaoRetornoPrecipitacao;
};

type ConfiguracaoAbaRetorno = {
    id: AbaRetorno;
    titulo: string;
    descricao: string;
  };

const abas: ConfiguracaoAbaRetorno[] = [
  {
    id: "tabela",
    titulo: "Tabela de pontos",
    descricao:
      "Consulte os valores calculados ao longo da curva de retorno.",
  },
  {
    id: "derivadas",
    titulo: "Derivadas",
    descricao:
      "Analise a primeira e a segunda derivadas da curva.",
  },
  {
    id: "erro",
    titulo: "Erro de titulação",
    descricao:
      "Compare o ponto final experimental com o valor teórico.",
  },
  {
    id: "tempo-real",
    titulo: "Tempo real",
    descricao:
      "Registre dados experimentais durante a retrotitulação.",
  },
  {
    id: "metodos",
    titulo: "Métodos",
    descricao:
      "Consulte o princípio, as condições e os cuidados do método de Volhard.",
  },
  {
    id: "simulacao",
    titulo: "Simulação",
    descricao:
      "Avalie a influência das condições experimentais.",
  },
  {
    id: "interferentes",
    titulo: "Interferentes",
    descricao:
      "Avalie espécies que podem consumir Ag⁺ ou SCN⁻.",
  },
];

export default function AnalisesRetornoTabs({
  resultado,
}: AnalisesRetornoTabsProps) {
  const [
    abaAtiva,
    setAbaAtiva,
  ] =
  useState<AbaRetorno>(
    "tabela"
  );

  const [
    filtroRegiao,
    setFiltroRegiao,
  ] = useState("Todas");

  const curva = useMemo(
    () =>
      gerarCurvaTitulacaoRetorno({
        resultado,
        passo: 0.25,
      }),
    [resultado]
  );

  const pontosFiltrados =
    useMemo(() => {
      if (
        filtroRegiao ===
        "Todas"
      ) {
        return curva.pontos;
      }

      return curva.pontos.filter(
        (ponto) =>
          ponto.regiao ===
          filtroRegiao
      );
    }, [
      curva.pontos,
      filtroRegiao,
    ]);

  const configuracaoAbaAtiva =
    abas.find(
      (aba) =>
        aba.id === abaAtiva
    ) ?? abas[0];

  return (
    <section className="precipitacaoDirectAnalysisSection">
      <header className="precipitacaoDirectAnalysisHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Análises complementares
          </span>

          <h3>
            Explore a titulação por retorno
          </h3>

          <p>
            Consulte os dados da curva e
            ferramentas adicionais do método
            de Volhard sem sair da página.
          </p>
        </div>
      </header>

      <nav
        className="precipitacaoDirectTabs"
        aria-label="Análises da titulação por retorno"
      >
        {abas.map((aba) => {
          const ativa =
            aba.id === abaAtiva;

          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              className={[
                "precipitacaoDirectTabButton",
                ativa
                  ? "precipitacaoDirectTabButtonActive"
                  : "",
              ].join(" ")}
              onClick={() =>
                setAbaAtiva(
                  aba.id
                )
              }
            >
              {aba.titulo}
            </button>
          );
        })}
      </nav>

      <div className="precipitacaoDirectTabPanel">
        <header className="precipitacaoDirectTabPanelHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Ferramenta selecionada
            </span>

            <h4>
              {
                configuracaoAbaAtiva.titulo
              }
            </h4>

            <p>
              {
                configuracaoAbaAtiva.descricao
              }
            </p>
          </div>

          <span className="precipitacaoWorkspaceBadge">
            Volhard
          </span>
        </header>

        <div className="precipitacaoDirectTabSummary">
          <article>
            <span>
              Precipitante em excesso
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
              Ponto final
            </span>

            <strong>
              {formatarNumeroBR(
                resultado
                  .volumeTitulanteRetorno,
                2
              )}{" "}
              mL
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
        </div>

        {abaAtiva ===
        "tabela" ? (
          <section className="precipitacaoInlineTableSection">
            <div className="precipitacaoInlineTableToolbar">
              <div>
                <span className="precipitacaoSectionLabel">
                  Dados calculados
                </span>

                <h5>
                  Pontos da curva de retorno
                </h5>
              </div>

              <label>
                Região da curva

                <select
                  value={
                    filtroRegiao
                  }
                  onChange={(
                    event
                  ) =>
                    setFiltroRegiao(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="Todas">
                    Todas
                  </option>

                  <option value="Antes do retorno">
                    Antes do retorno
                  </option>

                  <option value="No ponto final do retorno">
                    No ponto final
                  </option>

                  <option value="Após o retorno">
                    Após o retorno
                  </option>
                </select>
              </label>
            </div>

            <div className="precipitacaoInlineTableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>
                      Volume de SCN⁻
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
                  {pontosFiltrados.map(
                    (
                      ponto,
                      indice
                    ) => (
                      <tr
                        key={`${ponto.volumeAdicionado}-${indice}`}
                        className={
                          ponto.regiao ===
                          "No ponto final do retorno"
                            ? "precipitacaoInlineTablePERow"
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
                          <span
                            className={[
                              "precipitacaoInlineRegionBadge",
                              ponto.regiao ===
                              "No ponto final do retorno"
                                ? "precipitacaoInlineRegionBadgePE"
                                : "",
                            ].join(
                              " "
                            )}
                          >
                            {
                              ponto.regiao
                            }
                          </span>
                        </td>

                        <td>
                          {formatarNumeroBR(
                            ponto.pPrecipitante,
                            3
                          )}
                        </td>

                        <td>
                          {formatarCientificoBR(
                            ponto
                              .concentracaoPrecipitanteLivre,
                            3
                          )}{" "}
                          mol/L
                        </td>

                        <td>
                          {formatarCientificoBR(
                            ponto
                              .concentracaoTitulanteRetornoLivre,
                            3
                          )}{" "}
                          mol/L
                        </td>

                        <td>
                          {formatarNumeroBR(
                            ponto.percentualRetorno,
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

            <footer className="precipitacaoInlineTableFooter">
              <span>
                {
                  pontosFiltrados.length
                }{" "}
                ponto(s) exibido(s)
              </span>

              <span>
                Passo da curva:
                0,25 mL
              </span>
            </footer>
          </section>
                ) : abaAtiva === "derivadas" ? (
                    <DerivadasCurvaRetorno
                      resultado={resultado}
                    />
                    ) : abaAtiva === "erro" ? (
                        <ErroTitulacaoRetorno
                          resultado={resultado}
                        />
                        ) : abaAtiva === "tempo-real" ? (
                            <SimulacaoTempoRealRetorno
                              resultado={resultado}
                            />
                            ) : abaAtiva === "metodos" ? (
                                <MetodoVolhard
                                  resultado={resultado}
                                />
                                ) : abaAtiva === "simulacao" ? (
                                    <SimulacaoCondicoesRetorno
                                      resultado={resultado}
                                    />
                                  ) : abaAtiva === "interferentes" ? (
                                    <AnaliseInterferentesRetorno
                                      resultado={resultado}
                                    />
                                  ) : (
                <section className="precipitacaoDirectTabDevelopment">
            <div className="precipitacaoDirectTabDevelopmentIcon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="m7 15 4-5 3 2 4-6" />
              </svg>
            </div>

            <span className="precipitacaoSectionLabel">
              Próxima implementação
            </span>

            <h5>
              {
                configuracaoAbaAtiva.titulo
              }
            </h5>

            <p>
              Esta ferramenta será
              integrada aos dados da
              retrotitulação de Volhard
              nas próximas etapas.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}