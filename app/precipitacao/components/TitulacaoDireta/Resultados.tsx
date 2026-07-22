import type { ResultadoTitulacaoDiretaPrecipitacao } from "@/lib/precipitacao/tipos";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

type ResultadosProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
};

export default function Resultados({
  resultado,
}: ResultadosProps) {
  const formulaAnalito =
    resultado.especieAnalito === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  const formulaTitulante =
    resultado.especieTitulante === "cation"
      ? resultado.sal.cation.formulaExibicao
      : resultado.sal.anion.formulaExibicao;

  return (
    <section className="precipitacaoResultsSection">
      <header className="precipitacaoResultsHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Resultado calculado
          </span>

          <h3>Resumo da titulação direta</h3>

          <p>
            Valores obtidos a partir da quantidade inicial de {formulaAnalito} e
            da relação estequiométrica com {formulaTitulante}.
          </p>
        </div>

        <span
          className={
            resultado.status === "adequado"
              ? "precipitacaoStatus precipitacaoStatusSuccess"
              : "precipitacaoStatus precipitacaoStatusWarning"
          }
        >
          {resultado.status === "adequado"
            ? "Condição adequada"
            : "Revisar condição experimental"}
        </span>
      </header>

      <div className="precipitacaoResultsGrid">
        <article className="precipitacaoResultCard precipitacaoResultCardMain">
          <span>Volume no ponto de equivalência</span>

          <strong>
            {formatarNumeroBR(resultado.volumePE, 2)}
            <small> mL</small>
          </strong>

          <p>
            Volume estequiométrico de titulante necessário para reagir com o
            analito.
          </p>
        </article>

        <article className="precipitacaoResultCard">
          <span>Quantidade de analito</span>

          <strong>
            {formatarCientificoBR(resultado.molAnalito, 3)}
            <small> mol</small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>Quantidade de titulante no PE</span>

          <strong>
            {formatarCientificoBR(resultado.molTitulantePE, 3)}
            <small> mol</small>
          </strong>
        </article>

        <article className="precipitacaoResultCard">
          <span>Relação estequiométrica</span>

          <strong>{resultado.relacaoEstequiometrica}</strong>
        </article>
      </div>

      <div
        className={
          resultado.status === "adequado"
            ? "precipitacaoResultMessage precipitacaoResultMessageSuccess"
            : "precipitacaoResultMessage precipitacaoResultMessageWarning"
        }
      >
        <strong>
          {resultado.status === "adequado"
            ? "Titulação experimentalmente viável"
            : "Volume acima da capacidade informada"}
        </strong>

        <p>{resultado.mensagem}</p>
      </div>
    </section>
  );
}