"use client";

import type {
  FormEvent,
} from "react";

import {
  saisPrecipitacao,
} from "@/lib/data/precipitacao/sais";

import type {
  EspeciePrecipitacao,
  SalPrecipitacao,
} from "@/lib/precipitacao/tipos";

type ItemMisturaSeletiva = {
  id: string;
  sal: SalPrecipitacao;
  especieAnalito: EspeciePrecipitacao;
  concentracaoAnalito: string;
};

type EntradaDadosProps = {
  especieTitulante: EspeciePrecipitacao;
  itens: ItemMisturaSeletiva[];
  volumeAmostra: string;
  concentracaoTitulante: string;
  volumeMaximoBureta: string;
  erro: string;

  onEspecieTitulanteChange: (
    especie: EspeciePrecipitacao
  ) => void;

  onAdicionarItem: () => void;

  onRemoverItem: (
    id: string
  ) => void;

  onSalChange: (
    id: string,
    salId: string
  ) => void;

  onConcentracaoChange: (
    id: string,
    valor: string
  ) => void;

  onVolumeAmostraChange: (
    valor: string
  ) => void;

  onConcentracaoTitulanteChange: (
    valor: string
  ) => void;

  onVolumeMaximoBuretaChange: (
    valor: string
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

function obterIonTitulante({
    sal,
    especieTitulante,
  }: {
    sal: SalPrecipitacao;
    especieTitulante: EspeciePrecipitacao;
  }) {
    return especieTitulante === "cation"
      ? sal.cation
      : sal.anion;
  }
  
function obterFormulaAnalito({
  sal,
  especieTitulante,
}: {
  sal: SalPrecipitacao;
  especieTitulante: EspeciePrecipitacao;
}) {
  return especieTitulante === "cation"
    ? sal.anion.formulaExibicao
    : sal.cation.formulaExibicao;
}

function obterFormulaTitulante({
  sal,
  especieTitulante,
}: {
  sal: SalPrecipitacao;
  especieTitulante: EspeciePrecipitacao;
}) {
  return especieTitulante === "cation"
    ? sal.cation.formulaExibicao
    : sal.anion.formulaExibicao;
}

export default function EntradaDados({
  especieTitulante,
  itens,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
  erro,
  onEspecieTitulanteChange,
  onAdicionarItem,
  onRemoverItem,
  onSalChange,
  onConcentracaoChange,
  onVolumeAmostraChange,
  onConcentracaoTitulanteChange,
  onVolumeMaximoBuretaChange,
  onSubmit,
}: EntradaDadosProps) {
  const saisCompativeis =
    saisPrecipitacao.filter(
      (sal) =>
        sal.usos.includes(
          "seletividade"
        )
    );

    const primeiroItem =
  itens[0];

const ionTitulanteReferencia =
  primeiroItem
    ? obterIonTitulante({
        sal:
          primeiroItem.sal,
        especieTitulante,
      })
    : null;

  return (
    <form
      className="precipitacaoDirectForm"
      onSubmit={onSubmit}
      noValidate
    >
      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 1
          </span>

          <div>
            <h3>
              Escolha o tipo de titulante
            </h3>

            <p>
              Informe se o reagente precipitante
              comum corresponde ao cátion ou ao
              ânion dos sais avaliados.
            </p>
          </div>
        </header>

        <div className="precipitacaoSpeciesGrid">
          <button
            type="button"
            aria-pressed={
              especieTitulante ===
              "cation"
            }
            className={[
              "precipitacaoSpeciesButton",
              especieTitulante ===
              "cation"
                ? "precipitacaoSpeciesButtonActive"
                : "",
            ].join(" ")}
            onClick={() =>
              onEspecieTitulanteChange(
                "cation"
              )
            }
          >
            <strong>Cátion</strong>

            <span>
              Titulante catiônico comum
            </span>

            <small>
              Exemplo: Ag⁺
            </small>
          </button>

          <button
            type="button"
            aria-pressed={
              especieTitulante ===
              "anion"
            }
            className={[
              "precipitacaoSpeciesButton",
              especieTitulante ===
              "anion"
                ? "precipitacaoSpeciesButtonActive"
                : "",
            ].join(" ")}
            onClick={() =>
              onEspecieTitulanteChange(
                "anion"
              )
            }
          >
            <strong>Ânion</strong>

            <span>
              Titulante aniônico comum
            </span>

            <small>
              Exemplo: SCN⁻
            </small>
          </button>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 2
          </span>

          <div>
            <h3>
              Espécies presentes na mistura
            </h3>

            <p>
              Adicione pelo menos duas espécies
              que possam formar precipitados com
              o mesmo titulante.
            </p>
          </div>
        </header>

        {ionTitulanteReferencia && (
  <div className="precipitacaoSelectiveSystemBanner">
    <div className="precipitacaoSelectiveSystemBannerIcon">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    </div>

    <div>
      <span>
        Titulante comum definido
      </span>

      <strong>
        {
          ionTitulanteReferencia
            .formulaExibicao
        }
      </strong>

      <p>
        Todos os precipitados abaixo utilizam{" "}
        <b>
          {
            ionTitulanteReferencia
              .formulaExibicao
          }
        </b>{" "}
        como reagente precipitante comum.
      </p>
    </div>

    <span className="precipitacaoSelectiveSystemStatus">
      Sistema compatível
    </span>
  </div>
)}

        <div className="precipitacaoSelectiveItems">
          {itens.map(
            (
              item,
              indice
            ) => {

              const formulaAnalito =
                obterFormulaAnalito({
                  sal: item.sal,
                  especieTitulante,
                });

              const formulaTitulante =
                obterFormulaTitulante({
                  sal: item.sal,
                  especieTitulante,
                });

                const equacaoPrecipitacao =
  especieTitulante === "cation"
    ? `${formulaTitulante} + ${formulaAnalito} → ${item.sal.formulaExibicao}(s)`
    : `${formulaAnalito} + ${formulaTitulante} → ${item.sal.formulaExibicao}(s)`;

    const saisPermitidos =
    saisCompativeis.filter(
      (sal) => {
        const primeiroDaMistura =
          indice === 0;
  
        const ionTitulante =
          obterIonTitulante({
            sal,
            especieTitulante,
          });
  
        /*
         * O primeiro card pode definir um novo
         * sistema. Os demais mostram somente sais
         * compatíveis com o titulante comum atual.
         */
        return (
          primeiroDaMistura ||
          !ionTitulanteReferencia ||
          ionTitulante.id ===
            ionTitulanteReferencia.id
        );
      }
    );

              return (
                <article
                  key={item.id}
                  className="precipitacaoSelectiveItemCard"
                >
                  <header className="precipitacaoSelectiveItemHeader">
  <div className="precipitacaoSelectiveItemIdentification">
    <span className="precipitacaoSelectiveItemNumber">
      {String(
        indice + 1
      ).padStart(
        2,
        "0"
      )}
    </span>

    <div>
      <span>
        Espécie da mistura
      </span>

      <strong>
        {formulaAnalito}
      </strong>

      <small>
        Forma{" "}
        {
          item.sal
            .formulaExibicao
        }
      </small>
    </div>
  </div>

                    {itens.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemoverItem(
                            item.id
                          )
                        }
                      >
                        Remover
                      </button>
                    )}
                  </header>

                  <label className="precipitacaoField">
                    <span>
                      Precipitado formado
                    </span>

                    <select
                      value={
                        item.sal.id
                      }
                      onChange={(event) =>
                        onSalChange(
                          item.id,
                          event.target
                            .value
                        )
                      }
                    >
                      {saisPermitidos.map(
  (sal) => {
    const usadoEmOutroItem =
      itens.some(
        (outroItem) =>
          outroItem.id !==
            item.id &&
          outroItem.sal.id ===
            sal.id
      );

    return (
      <option
        key={sal.id}
        value={sal.id}
        disabled={
          usadoEmOutroItem
        }
      >
        {sal.formulaExibicao}
        {" — "}
        {sal.nome}
        {usadoEmOutroItem
          ? " — já selecionado"
          : ""}
      </option>
    );
  }
)}
                    </select>
                  </label>

                  <div className="precipitacaoSelectiveReaction">
  <span>
    Reação de precipitação
  </span>

  <strong>
    {equacaoPrecipitacao}
  </strong>
</div>

                  <label className="precipitacaoField">
                    <span>
                      Concentração de{" "}
                      {formulaAnalito}
                    </span>

                    <div className="precipitacaoInputWithUnit">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          item.concentracaoAnalito
                        }
                        onChange={(
                          event
                        ) =>
                          onConcentracaoChange(
                            item.id,
                            event.target
                              .value
                          )
                        }
                        placeholder="Ex.: 0,0100"
                      />

                      <span>
                        mol·L⁻¹
                      </span>
                    </div>
                  </label>

                  <div className="precipitacaoSystemSummary precipitacaoSelectiveItemSummary">
  <div>
    <span>
      Analito
    </span>

    <strong>
      {formulaAnalito}
    </strong>
  </div>

  <div>
    <span>
      Titulante comum
    </span>

    <strong>
      {formulaTitulante}
    </strong>
  </div>

  <div>
    <span>
      Precipitado
    </span>

    <strong>
      {
        item.sal
          .formulaExibicao
      }
    </strong>
  </div>

  <div>
    <span>
      Kps adotado
    </span>

    <strong>
      {item.sal.kps.toExponential(
        2
      )}
    </strong>
  </div>
</div>
                </article>
              );
            }
          )}
        </div>

        <button
          type="button"
          className="precipitacaoSelectiveAddButton"
          onClick={onAdicionarItem}
        >
          Adicionar outra espécie
        </button>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 3
          </span>

          <div>
            <h3>
              Condições experimentais
            </h3>

            <p>
              Informe os dados usados para
              calcular os volumes de início e
              construir a curva seletiva.
            </p>
          </div>
        </header>

        <div className="precipitacaoFieldsGrid">
          <label className="precipitacaoField">
            <span>
              Volume da amostra
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  volumeAmostra
                }
                onChange={(event) =>
                  onVolumeAmostraChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 25,00"
              />

              <span>mL</span>
            </div>
          </label>

          <label className="precipitacaoField">
            <span>
              Concentração do titulante
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoTitulante
                }
                onChange={(event) =>
                  onConcentracaoTitulanteChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0100"
              />

              <span>
                mol·L⁻¹
              </span>
            </div>
          </label>

          <label className="precipitacaoField">
            <span>
              Capacidade da bureta
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  volumeMaximoBureta
                }
                onChange={(event) =>
                  onVolumeMaximoBuretaChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 50,00"
              />

              <span>mL</span>
            </div>
          </label>
        </div>
      </section>

      <div className="precipitacaoScientificNotice">
        <strong>
          O que será comparado?
        </strong>

        <p>
          O sistema calculará a concentração
          livre de titulante necessária para o
          início da precipitação de cada espécie.
          Quanto menor essa concentração crítica,
          mais cedo o precipitado tende a se
          formar.
        </p>
      </div>

      {erro && (
        <div
          className="precipitacaoFormError"
          role="alert"
        >
          <strong>
            Revise os dados informados
          </strong>

          <span>{erro}</span>
        </div>
      )}

      <div className="precipitacaoFormActions">
        <div>
          <strong>
            Calcular precipitação seletiva
          </strong>

          <span>
            {itens.length} espécie(s) na
            mistura · Titulante{" "}
            {especieTitulante ===
            "cation"
              ? "catiônico"
              : "aniônico"}
          </span>
        </div>

        <button
          type="submit"
          className="precipitacaoCalculateButton"
        >
          Calcular seletividade
        </button>
      </div>
    </form>
  );
}