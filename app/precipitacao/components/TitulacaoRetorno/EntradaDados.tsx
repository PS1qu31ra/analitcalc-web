"use client";

import type {
  FormEvent,
} from "react";

import {
  analitosArgentometricosDiretos,
  type AnalitoArgentometricoDireto,
  type ConfiguracaoAnalitoDireto,
} from "@/lib/precipitacao/metodosDiretos";

type EntradaDadosProps = {
  analito: ConfiguracaoAnalitoDireto;

  concentracaoAnalito: string;
  volumeAmostra: string;

  concentracaoAgNO3: string;
  volumeAgNO3: string;

  concentracaoSCN: string;
  volumeMaximoBureta: string;

  erro: string;

  onAnalitoChange: (
    analito: AnalitoArgentometricoDireto
  ) => void;

  onConcentracaoAnalitoChange: (
    valor: string
  ) => void;

  onVolumeAmostraChange: (
    valor: string
  ) => void;

  onConcentracaoAgNO3Change: (
    valor: string
  ) => void;

  onVolumeAgNO3Change: (
    valor: string
  ) => void;

  onConcentracaoSCNChange: (
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
  analito,

  concentracaoAnalito,
  volumeAmostra,

  concentracaoAgNO3,
  volumeAgNO3,

  concentracaoSCN,
  volumeMaximoBureta,

  erro,

  onAnalitoChange,
  onConcentracaoAnalitoChange,
  onVolumeAmostraChange,
  onConcentracaoAgNO3Change,
  onVolumeAgNO3Change,
  onConcentracaoSCNChange,
  onVolumeMaximoBuretaChange,
  onSubmit,
}: EntradaDadosProps) {
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
              Escolha o analito
            </h3>

            <p>
              Selecione o haleto presente na amostra.
              O analito será precipitado pela adição
              de uma quantidade conhecida e excessiva
              de nitrato de prata.
            </p>
          </div>
        </header>

        <div className="precipitacaoSpeciesGrid">
          {analitosArgentometricosDiretos.map(
            (opcao) => {
              const selecionado =
                analito.id === opcao.id;

              return (
                <button
                  key={opcao.id}
                  type="button"
                  aria-pressed={selecionado}
                  className={
                    selecionado
                      ? "precipitacaoSpeciesButton precipitacaoSpeciesButtonActive"
                      : "precipitacaoSpeciesButton"
                  }
                  onClick={() => {
                    onAnalitoChange(
                      opcao.id
                    );
                  }}
                >
                  <strong>
                    {opcao.formulaExibicao}
                  </strong>

                  <span>
                    {opcao.nome}
                  </span>

                  <small>
                    Forma{" "}
                    {opcao.precipitado}
                    (s)
                  </small>
                </button>
              );
            }
          )}
        </div>

        <div className="precipitacaoSystemSummary">
          <div>
            <span>
              Reação principal
            </span>

            <strong>
              {analito.equacao}
            </strong>
          </div>

          <div>
            <span>
              Precipitado principal
            </span>

            <strong>
              {analito.precipitado}
            </strong>
          </div>

          <div>
            <span>
              Analito
            </span>

            <strong>
              {analito.formulaExibicao}
            </strong>
          </div>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 2
          </span>

          <div>
            <h3>
              Método de Volhard
            </h3>

            <p>
              O sistema utiliza nitrato de prata em
              excesso e determina a prata remanescente
              por titulação com tiocianato.
            </p>
          </div>
        </header>

        <div className="precipitacaoMethodGrid">
          <article className="precipitacaoMethodCard precipitacaoMethodCardActive">
            <span>
              Método por retorno
            </span>

            <strong>
              Volhard
            </strong>

            <p>
              Uma quantidade conhecida e excessiva de
              AgNO₃ é adicionada à amostra. Após a
              precipitação do analito, o Ag⁺ que
              permaneceu em solução é titulado com
              SCN⁻.
            </p>

            <div>
              <small>
                Reação da retrotitulação
              </small>

              <b>
                Ag⁺ + SCN⁻ → AgSCN(s)
              </b>
            </div>
          </article>

          <article className="precipitacaoMethodCard precipitacaoMethodCardActive">
            <span>
              Condição experimental
            </span>

            <strong>
              Meio ácido
            </strong>

            <p>
              O método de Volhard deve ser realizado
              em meio ácido. Essa condição reduz
              reações paralelas da prata e permite o
              funcionamento adequado do indicador de
              ferro(III).
            </p>

            <div>
              <small>
                Indicador recomendado
              </small>

              <b>
                Fe³⁺
              </b>
            </div>
          </article>
        </div>

        <div className="precipitacaoCompatibilityBox">
          <strong>
            Sistema químico fixado
          </strong>

          <p>
            Reagente adicionado em excesso:
            {" "}
            <strong>AgNO₃</strong>.
            {" "}
            Titulante de retorno:
            {" "}
            <strong>SCN⁻</strong>.
            {" "}
            Método:
            {" "}
            <strong>Volhard em meio ácido</strong>.
          </p>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 3
          </span>

          <div>
            <h3>
              Dados da amostra
            </h3>

            <p>
              Informe a concentração inicial do
              analito e o volume utilizado na análise.
            </p>
          </div>
        </header>

        <div className="precipitacaoFieldsGrid">
          <label className="precipitacaoField">
            <span>
              Concentração do analito
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoAnalito
                }
                onChange={(event) =>
                  onConcentracaoAnalitoChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0100"
              />

              <span>
                mol·L⁻¹
              </span>
            </div>

            <small>
              Concentração inicial de{" "}
              {analito.formulaExibicao}
              {" "}
              na amostra.
            </small>
          </label>

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
              Volume da solução contendo o
              analito.
            </small>
          </label>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 4
          </span>

          <div>
            <h3>
              Nitrato de prata em excesso
            </h3>

            <p>
              Informe a concentração e o volume total
              da solução de AgNO₃ adicionada à
              amostra.
            </p>
          </div>
        </header>

        <div className="precipitacaoFieldsGrid">
          <label className="precipitacaoField">
            <span>
              Concentração do AgNO₃
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoAgNO3
                }
                onChange={(event) =>
                  onConcentracaoAgNO3Change(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0200"
              />

              <span>
                mol·L⁻¹
              </span>
            </div>

            <small>
              Concentração da solução que fornece
              Ag⁺ para precipitar o analito.
            </small>
          </label>

          <label className="precipitacaoField">
            <span>
              Volume de AgNO₃ adicionado
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  volumeAgNO3
                }
                onChange={(event) =>
                  onVolumeAgNO3Change(
                    event.target.value
                  )
                }
                placeholder="Ex.: 20,00"
              />

              <span>
                mL
              </span>
            </div>

            <small>
              Este valor representa todo o volume de
              AgNO₃ adicionado, e não somente a parte
              que permanece em excesso.
            </small>
          </label>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 5
          </span>

          <div>
            <h3>
              Titulação do excesso
            </h3>

            <p>
              Informe os dados da solução de
              tiocianato utilizada para titular o Ag⁺
              que permaneceu após a precipitação do
              analito.
            </p>
          </div>
        </header>

        <div className="precipitacaoFieldsGrid">
          <label className="precipitacaoField">
            <span>
              Concentração do SCN⁻
            </span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoSCN
                }
                onChange={(event) =>
                  onConcentracaoSCNChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0100"
              />

              <span>
                mol·L⁻¹
              </span>
            </div>

            <small>
              Solução titulante utilizada na etapa de
              retorno.
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
              Capacidade máxima da bureta utilizada
              para adicionar SCN⁻.
            </small>
          </label>
        </div>
      </section>

      <div className="precipitacaoScientificNotice">
        <strong>
          Atenção ao significado do excesso
        </strong>

        <p>
          O volume de AgNO₃ informado corresponde à
          quantidade total adicionada. O sistema
          calcula quanto Ag⁺ reage com o analito e
          quanto permanece em excesso para ser
          posteriormente titulado com SCN⁻.
        </p>
      </div>

      <div className="precipitacaoScientificNotice">
        <strong>
          Condição obrigatória do método
        </strong>

        <p>
          A retrotitulação de Volhard deve ser
          conduzida em meio ácido. O módulo considera
          o sistema Ag⁺/SCN⁻ e o precipitado
          AgSCN como reação da etapa de retorno.
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

          <span>
            {erro}
          </span>
        </div>
      )}

      <div className="precipitacaoFormActions">
        <div>
          <strong>
            Calcular titulação por retorno
          </strong>

          <span>
            Analito:{" "}
            {analito.formulaExibicao}
            {" · "}
            Excesso: AgNO₃
            {" · "}
            Retorno: SCN⁻
            {" · "}
            Método: Volhard
          </span>
        </div>

        <button
          type="submit"
          className="precipitacaoCalculateButton"
        >
          Calcular titulação
        </button>
      </div>
    </form>
  );
}