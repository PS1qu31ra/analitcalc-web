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

import {
  formatarCientificoBR,
} from "@/lib/precipitacao/formatadores";

import EquacaoQuimica from "../TitulacaoDireta/EquacaoQuimica";

type ItemMisturaSeletiva = {
  id: string;
  sal: SalPrecipitacao;
  especieAnalito: EspeciePrecipitacao;
  concentracaoAnalito: string;
};

type EntradaDadosProps = {
  itens: ItemMisturaSeletiva[];

  volumeAmostra: string;
  concentracaoTitulante: string;
  volumeMaximoBureta: string;

  erro: string;

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

export default function EntradaDados({
  itens,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
  erro,
  onAdicionarItem,
  onRemoverItem,
  onSalChange,
  onConcentracaoChange,
  onVolumeAmostraChange,
  onConcentracaoTitulanteChange,
  onVolumeMaximoBuretaChange,
  onSubmit,
}: EntradaDadosProps) {
  /*
   * A mistura seletiva foi restringida a
   * precipitados de prata utilizados em
   * titulação argentométrica direta.
   *
   * O óxido de prata é excluído explicitamente.
   */
  const saisCompativeis =
    saisPrecipitacao.filter(
      (sal) =>
        sal.usos.includes(
          "seletividade"
        ) &&
        sal.cation.formulaExibicao ===
          "Ag⁺" &&
        sal.formulaExibicao !==
          "Ag₂O"
    );

  return (
    <form
      className="precipitacaoDirectForm"
      onSubmit={onSubmit}
      noValidate
    >
      {/* ETAPA 1 */}

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 1
          </span>

          <div>
            <h3>
              Sistema argentométrico direto
            </h3>

            <p>
              A mistura será titulada diretamente
              com solução padrão de nitrato de prata.
              O íon Ag⁺ atua como reagente
              precipitante comum das espécies
              selecionadas.
            </p>
          </div>
        </header>

        <div className="precipitacaoSelectiveSystemBanner">
          <div className="precipitacaoSelectiveSystemBannerIcon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>

          <div>
            <span>
              Titulante comum definido
            </span>

            <strong>
              Ag⁺
            </strong>

            <p>
              Todas as espécies da mistura devem
              formar precipitados de prata por
              titulação direta com solução padrão
              de AgNO₃.
            </p>
          </div>

          <span className="precipitacaoSelectiveSystemStatus">
            Titulação direta
          </span>
        </div>
      </section>

      {/* ETAPA 2 */}

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
              Adicione pelo menos duas espécies que
              formem precipitados de prata durante
              a titulação direta com AgNO₃.
            </p>
          </div>
        </header>

        <div className="precipitacaoSelectiveItems">
          {itens.map(
            (
              item,
              indice
            ) => {
              /*
               * Como o titulante é sempre Ag⁺,
               * o analito corresponde ao ânion
               * presente no sal de prata.
               */
              const formulaAnalito =
                item.sal.anion.formulaExibicao;

              const formulaTitulante =
                item.sal.cation.formulaExibicao;

              const equacaoPrecipitacao =
                `${formulaTitulante} + ${formulaAnalito} ⇌ ${item.sal.formulaExibicao}(s)`;

              /*
               * Todos os sais da lista já são
               * precipitados de prata compatíveis.
               */
              const saisPermitidos =
                saisCompativeis;

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
                          event.target.value
                        )
                      }
                    >
                      {saisPermitidos.map(
                        (sal) => {
                          const usadoEmOutroItem =
                            itens.some(
                              (
                                outroItem
                              ) =>
                                outroItem.id !==
                                  item.id &&
                                outroItem.sal.id ===
                                  sal.id
                            );

                          return (
                            <option
                              key={
                                sal.id
                              }
                              value={
                                sal.id
                              }
                              disabled={
                                usadoEmOutroItem
                              }
                            >
                              {
                                sal.formulaExibicao
                              }
                              {" — "}
                              {
                                sal.nome
                              }
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
                      <EquacaoQuimica
                        equacao={
                          equacaoPrecipitacao
                        }
                      />
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
                            event.target.value
                          )
                        }
                        placeholder="Ex.: 0,0100"
                      />

                      <span>
                        mol L⁻¹
                      </span>
                    </div>

                    <small>
                      Concentração inicial da espécie
                      na mistura.
                    </small>
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
                        {formatarCientificoBR(
                          item.sal.kps,
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

      {/* ETAPA 3 */}

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
              Informe os dados da amostra e da
              solução padrão de AgNO₃ utilizados
              para calcular os volumes de início
              da precipitação.
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

              <span>
                mL
              </span>
            </div>

            <small>
              Volume total da mistura analisada.
            </small>
          </label>

          <label className="precipitacaoField">
            <span>
              Concentração do AgNO₃
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
                mol L⁻¹
              </span>
            </div>

            <small>
              Concentração da solução padrão
              fornecedora de Ag⁺.
            </small>
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

              <span>
                mL
              </span>
            </div>

            <small>
              Volume máximo de solução de AgNO₃
              disponível para a titulação.
            </small>
          </label>
        </div>
      </section>

      {/* AVISO CIENTÍFICO */}

      <div className="precipitacaoScientificNotice">
        <strong>
          O que será comparado?
        </strong>

        <p>
          O sistema calculará a concentração livre
          de Ag⁺ necessária para iniciar a
          precipitação de cada espécie da mistura.
          Quanto menor essa concentração crítica,
          mais cedo o precipitado de prata tende a
          se formar durante a titulação direta.
        </p>
      </div>

      {/* ERRO */}

      {erro && (
        <div
          className="precipitacaoFormError"
          role="alert"
        >
          <strong>
            Revise os dados informados
          </strong>

          <span>
            {erro}
          </span>
        </div>
      )}

      {/* AÇÃO FINAL */}

      <div className="precipitacaoFormActions">
        <div>
          <strong>
            Calcular precipitação seletiva
          </strong>

          <span>
            {itens.length} espécie(s) na
            mistura
            {" · "}
            Titulante direto: Ag⁺
            {" · "}
            Solução padrão: AgNO₃
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