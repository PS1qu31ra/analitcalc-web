"use client";

import {
  useMemo,
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
  ConfiguracaoAnalitoDireto,
} from "@/lib/precipitacao/metodosDiretos";

import type {
  ResultadoTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/tipos";

import DerivadasCurva from "./DerivadasCurva";

import ErroTitulacao from "./ErroTitulacao";

import SimulacaoTempoReal from "./SimulacaoTempoReal";

import ComparacaoMetodos from "./ComparacaoMetodos";

import SimulacaoCondicoes from "./SimulacaoCondicoes";

import AnaliseInterferentes from "./AnaliseInterferentes";

type AbaDireta =
  | "tabela"
  | "derivadas"
  | "erro"
  | "tempo-real"
  | "metodos"
  | "simulacao"
  | "interferentes";

type AnalisesDiretasTabsProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
  analito: ConfiguracaoAnalitoDireto;
};

type ConfiguracaoAba = {
  id: AbaDireta;
  titulo: string;
  descricao: string;
};

const abas: ConfiguracaoAba[] = [
  {
    id: "tabela",
    titulo: "Tabela de pontos",
    descricao:
      "Consulte os valores calculados ao longo da curva.",
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
      "Compare o ponto final com o ponto de equivalência.",
  },
  {
    id: "tempo-real",
    titulo: "Tempo real",
    descricao:
      "Registre dados experimentais durante a titulação.",
  },
  {
    id: "metodos",
    titulo: "Métodos",
    descricao:
      "Compare os métodos de Mohr e Fajans.",
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
      "Avalie precipitados concorrentes e seletividade.",
  },
];

export default function AnalisesDiretasTabs({
  resultado,
  analito,
}: AnalisesDiretasTabsProps) {
  const [abaAtiva, setAbaAtiva] =
  useState<AbaDireta>("tabela");

  const [filtroRegiao, setFiltroRegiao] =
    useState("Todas");

  const curva = useMemo(
    () =>
      gerarCurvaTitulacaoDireta({
        resultado,
        passo: 0.25,
        especieMonitorada:
          resultado.especieTitulante,
      }),
    [resultado]
  );

  const pontosFiltrados = useMemo(() => {
    if (filtroRegiao === "Todas") {
      return curva.pontos;
    }

    return curva.pontos.filter(
      (ponto) =>
        ponto.regiao === filtroRegiao
    );
  }, [curva, filtroRegiao]);

  const formulaAnalito =
    resultado.especieAnalito === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  const formulaTitulante =
    resultado.especieTitulante === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  const configuracaoAbaAtiva =
    abas.find(
      (aba) => aba.id === abaAtiva
    ) ?? abas[0];

  return (
    <section className="precipitacaoDirectAnalysisSection">
      <header className="precipitacaoDirectAnalysisHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Análises complementares
          </span>

          <h3>
            Explore a titulação direta
          </h3>

          <p>
            Consulte dados, métodos e ferramentas
            adicionais sem sair da página de
            resultados.
          </p>
        </div>
      </header>

      <nav
        className="precipitacaoDirectTabs"
        aria-label="Análises da titulação direta"
      >
        {abas.map((aba) => {
          const ativa =
            aba.id === abaAtiva;

          return (
            <button
              key={aba.id}
              type="button"
              className={[
                "precipitacaoDirectTabButton",
                ativa
                  ? "precipitacaoDirectTabButtonActive"
                  : "",
              ].join(" ")}
              onClick={() =>
                setAbaAtiva(aba.id)
              }
              aria-selected={ativa}
              role="tab"
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
              {configuracaoAbaAtiva.titulo}
            </h4>

            <p>
              {configuracaoAbaAtiva.descricao}
            </p>
          </div>

          <span className="precipitacaoWorkspaceBadge">
          {analito.formulaExibicao}
          </span>
        </header>

        <div className="precipitacaoDirectTabSummary">
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
            <span>Ponto de equivalência</span>
            <strong>
              {formatarNumeroBR(
                resultado.volumePE,
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>Precipitado</span>
            <strong>
              {resultado.sal.formulaExibicao}
            </strong>
          </article>
        </div>

        {abaAtiva === "tabela" ? (
          <section className="precipitacaoInlineTableSection">
            <div className="precipitacaoInlineTableToolbar">
              <div>
                <span className="precipitacaoSectionLabel">
                  Dados calculados
                </span>

                <h5>
                  Pontos da curva
                </h5>
              </div>

              <label>
                Região da curva

                <select
                  value={filtroRegiao}
                  onChange={(event) =>
                    setFiltroRegiao(
                      event.target.value
                    )
                  }
                >
                  <option value="Todas">
                    Todas
                  </option>

                  <option value="Antes do PE">
                    Antes do PE
                  </option>

                  <option value="No PE">
                    No PE
                  </option>

                  <option value="Após o PE">
                    Após o PE
                  </option>
                </select>
              </label>
            </div>

            <div className="precipitacaoInlineTableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>
                      Volume adicionado
                    </th>

                    <th>
                      Região
                    </th>

                    <th>
                      p{formulaTitulante}
                    </th>

                    <th>
                      [{formulaTitulante}] livre
                    </th>

                    <th>
                      [{formulaAnalito}] livre
                    </th>

                    <th>
                      Analito precipitado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pontosFiltrados.map(
                    (ponto, indice) => (
                      <tr
                        key={`${ponto.volumeAdicionado}-${indice}`}
                        className={
                          ponto.regiao === "No PE"
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
                              "No PE"
                                ? "precipitacaoInlineRegionBadgePE"
                                : "",
                            ].join(" ")}
                          >
                            {ponto.regiao}
                          </span>
                        </td>

                        <td>
                          {formatarNumeroBR(
                            ponto.pEspecieMonitorada,
                            3
                          )}
                        </td>

                        <td>
                          {formatarCientificoBR(
                            ponto.concentracaoTitulanteLivre,
                            3
                          )}{" "}
                          mol/L
                        </td>

                        <td>
                          {formatarCientificoBR(
                            ponto.concentracaoAnalitoLivre,
                            3
                          )}{" "}
                          mol/L
                        </td>

                        <td>
                          {formatarNumeroBR(
                            ponto.percentualPrecipitado,
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
                {pontosFiltrados.length} ponto(s)
                exibido(s)
              </span>

              <span>
                Passo da curva: 0,25 mL
              </span>
              </footer>
          </section>
                ) : abaAtiva === "derivadas" ? (
                  <DerivadasCurva
                    resultado={resultado}
                    formulaTitulante={formulaTitulante}
                  />
                  ) : abaAtiva === "erro" ? (
                    <ErroTitulacao
                      resultado={resultado}
                      formulaAnalito={formulaAnalito}
                      formulaTitulante={formulaTitulante}
                    />
                    ) : abaAtiva === "tempo-real" ? (
                      <SimulacaoTempoReal
                        resultado={resultado}
                        formulaAnalito={formulaAnalito}
                        formulaTitulante={formulaTitulante}
                      />
                      ) : abaAtiva === "metodos" ? (
                        <ComparacaoMetodos
                          analito={analito}
                        />
                        ) : abaAtiva === "simulacao" ? (
                          <SimulacaoCondicoes
                            resultado={resultado}
                            formulaAnalito={formulaAnalito}
                            formulaTitulante={formulaTitulante}
                          />
                        ) : abaAtiva === "interferentes" ? (
                          <AnaliseInterferentes
                            resultado={resultado}
                            formulaAnalito={formulaAnalito}
                            formulaTitulante={formulaTitulante}
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
              {configuracaoAbaAtiva.titulo}
            </h5>

            <p>
              Esta área já está integrada aos dados da
              titulação atual. Os cálculos e controles
              específicos serão adicionados na próxima
              etapa.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}