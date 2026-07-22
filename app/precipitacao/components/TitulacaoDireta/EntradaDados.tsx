"use client";

import type { FormEvent } from "react";

import {
  analitosArgentometricosDiretos,
  type AnalitoArgentometricoDireto,
  type ConfiguracaoAnalitoDireto,
  type MetodoArgentometricoDireto,
} from "@/lib/precipitacao/metodosDiretos";

type EntradaDadosProps = {
  analito: ConfiguracaoAnalitoDireto;
  metodoId: MetodoArgentometricoDireto;
  concentracaoAnalito: string;
  volumeAmostra: string;
  concentracaoTitulante: string;
  volumeMaximoBureta: string;
  kps: number;
  corPrecipitado: string;
  erro: string;
  onAnalitoChange: (
    analito: AnalitoArgentometricoDireto
  ) => void;
  onMetodoChange: (
    metodo: MetodoArgentometricoDireto
  ) => void;
  onConcentracaoAnalitoChange: (valor: string) => void;
  onVolumeAmostraChange: (valor: string) => void;
  onConcentracaoTitulanteChange: (valor: string) => void;
  onVolumeMaximoBuretaChange: (valor: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function EntradaDados({
  analito,
  metodoId,
  concentracaoAnalito,
  volumeAmostra,
  concentracaoTitulante,
  volumeMaximoBureta,
  kps,
  corPrecipitado,
  erro,
  onAnalitoChange,
  onMetodoChange,
  onConcentracaoAnalitoChange,
  onVolumeAmostraChange,
  onConcentracaoTitulanteChange,
  onVolumeMaximoBuretaChange,
  onSubmit,
}: EntradaDadosProps) {
  const metodoSelecionado =
    analito.metodos.find(
      (metodo) => metodo.id === metodoId
    ) ?? analito.metodos[0];

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
            <h3>Escolha o analito</h3>

            <p>
              Selecione o haleto que será determinado
              diretamente por titulação com nitrato de prata.
            </p>
          </div>
        </header>

        <div className="precipitacaoSpeciesGrid">
          {analitosArgentometricosDiretos.map((opcao) => {
            const selecionado = analito.id === opcao.id;

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
                  onAnalitoChange(opcao.id);
                }}
              >
                <strong>{opcao.formulaExibicao}</strong>

                <span>{opcao.nome}</span>

                <small>{opcao.precipitado}(s)</small>
              </button>
            );
          })}
        </div>

        <div className="precipitacaoSystemSummary">
          <div>
            <span>Reação analítica</span>
            <strong>{analito.equacao}</strong>
          </div>

          <div>
            <span>Precipitado</span>

            <strong>
              {analito.precipitado} — {corPrecipitado}
            </strong>
          </div>

          <div>
            <span>Kps adotado</span>
            <strong>{kps.toExponential(2)}</strong>
          </div>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 2
          </span>

          <div>
            <h3>Escolha o método direto</h3>

            <p>
              Apenas métodos e indicadores compatíveis com o
              analito selecionado são disponibilizados.
            </p>
          </div>
        </header>

        <div className="precipitacaoMethodGrid">
          {analito.metodos.map((metodo) => {
            const selecionado =
              metodoSelecionado.id === metodo.id;

            return (
              <button
                key={metodo.id}
                type="button"
                aria-pressed={selecionado}
                className={
                  selecionado
                    ? "precipitacaoMethodCard precipitacaoMethodCardActive"
                    : "precipitacaoMethodCard"
                }
                onClick={() => {
                  onMetodoChange(metodo.id);
                }}
              >
                <span>Método direto</span>

                <strong>{metodo.nome}</strong>

                <p>{metodo.principio}</p>

                <div>
                  <small>Indicador recomendado</small>
                  <b>{metodo.indicador}</b>
                </div>
              </button>
            );
          })}
        </div>

        <div className="precipitacaoCompatibilityBox">
          <strong>Compatibilidade química confirmada</strong>

          <p>
            Para {analito.formulaExibicao}, o sistema selecionou{" "}
            {metodoSelecionado.nome} com{" "}
            {metodoSelecionado.indicador}.{" "}
            {metodoSelecionado.observacao}
          </p>
        </div>
      </section>

      <section className="precipitacaoFormBlock">
        <header className="precipitacaoFormBlockHeader">
          <span className="precipitacaoFormStep">
            Etapa 3
          </span>

          <div>
            <h3>Dados experimentais</h3>

            <p>
              Informe os dados da amostra e da solução padrão de
              AgNO₃.
            </p>
          </div>
        </header>

        <div className="precipitacaoFieldsGrid">
          <label className="precipitacaoField">
            <span>Concentração do analito</span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={concentracaoAnalito}
                onChange={(event) =>
                  onConcentracaoAnalitoChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0100"
              />

              <span>mol·L⁻¹</span>
            </div>

            <small>
              Concentração inicial de{" "}
              {analito.formulaExibicao} na amostra.
            </small>
          </label>

          <label className="precipitacaoField">
            <span>Volume da amostra</span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={volumeAmostra}
                onChange={(event) =>
                  onVolumeAmostraChange(event.target.value)
                }
                placeholder="Ex.: 25,00"
              />

              <span>mL</span>
            </div>
          </label>

          <label className="precipitacaoField">
            <span>Concentração do AgNO₃</span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={concentracaoTitulante}
                onChange={(event) =>
                  onConcentracaoTitulanteChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: 0,0100"
              />

              <span>mol·L⁻¹</span>
            </div>

            <small>
              Solução titulante fornecedora de Ag⁺.
            </small>
          </label>

          <label className="precipitacaoField">
            <span>Capacidade da bureta</span>

            <div className="precipitacaoInputWithUnit">
              <input
                type="text"
                inputMode="decimal"
                value={volumeMaximoBureta}
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
        <strong>Ponto de equivalência × ponto final</strong>

        <p>
          O volume calculado corresponde ao ponto de
          equivalência estequiométrico. O indicador é utilizado
          para reconhecer experimentalmente o ponto final, que
          pode não coincidir exatamente com o valor teórico.
        </p>
      </div>

      {erro && (
        <div
          className="precipitacaoFormError"
          role="alert"
        >
          <strong>Revise os dados informados</strong>
          <span>{erro}</span>
        </div>
      )}

      <div className="precipitacaoFormActions">
        <div>
          <strong>Calcular titulação direta</strong>

          <span>
            Analito: {analito.formulaExibicao} · Método:{" "}
            {metodoSelecionado.nome} · Indicador:{" "}
            {metodoSelecionado.indicador}
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