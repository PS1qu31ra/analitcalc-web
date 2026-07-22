import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "@/lib/precipitacao/formatadores";

import type {
  ResultadoTitulacaoDiretaPrecipitacao,
} from "@/lib/precipitacao/tipos";

type ResultadosProps = {
  resultado: ResultadoTitulacaoDiretaPrecipitacao;
};

function formatarQuantidadeMol(
  valor: number
) {
  if (!Number.isFinite(valor)) {
    return "—";
  }

  if (valor === 0) {
    return "0";
  }

  const expoente = Math.floor(
    Math.log10(Math.abs(valor))
  );

  const mantissa =
    valor / Math.pow(10, expoente);

  return `${mantissa.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} × 10^${expoente}`;
}

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

  const resultadoAdequado =
    resultado.status === "adequado";

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

          <h3>Resumo da titulação direta</h3>

          <p>
            O cálculo considera a quantidade inicial de{" "}
            {formulaAnalito}, a concentração do titulante{" "}
            {formulaTitulante} e a relação estequiométrica da
            reação de precipitação.
          </p>
        </div>

        <span
          className={
            resultadoAdequado
              ? "precipitacaoStatus precipitacaoStatusSuccess"
              : "precipitacaoStatus precipitacaoStatusWarning"
          }
        >
          {resultadoAdequado
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
            Volume teórico de titulante necessário para consumir
            estequiometricamente o analito.
          </p>
        </article>

        <article className="precipitacaoResultCard">
          <span>Quantidade inicial de analito</span>

          <strong>
          {formatarQuantidadeMol(
  resultado.molAnalito
)}
            <small> mol</small>
          </strong>

          <p>
            Quantidade de matéria de {formulaAnalito} presente
            inicialmente na amostra.
          </p>
        </article>

        <article className="precipitacaoResultCard">
          <span>Titulante necessário no PE</span>

          <strong>
          {formatarQuantidadeMol(
  resultado.molTitulantePE
)}
            <small> mol</small>
          </strong>

          <p>
            Quantidade de {formulaTitulante} necessária para
            alcançar o ponto de equivalência.
          </p>
        </article>

        <article className="precipitacaoResultCard">
          <span>Relação estequiométrica</span>

          <strong>
            {resultado.relacaoEstequiometrica}
          </strong>

          <p>
            Proporção entre analito e titulante utilizada no
            cálculo.
          </p>
        </article>
      </div>

      <div className="precipitacaoResultInterpretation">
        <div className="precipitacaoResultInterpretationHeader">
          <span>Interpretação estequiométrica</span>

          <strong>
            {formulaAnalito} reage com{" "}
            {formulaTitulante}
          </strong>
        </div>

        <p>
          No ponto de equivalência, a quantidade adicionada de{" "}
          {formulaTitulante} corresponde exatamente à quantidade
          necessária para reagir com o {formulaAnalito}, de acordo
          com a relação estequiométrica{" "}
          <strong>
            {resultado.relacaoEstequiometrica}
          </strong>
          .
        </p>
      </div>

      <div
        className={
          resultadoAdequado
            ? "precipitacaoResultMessage precipitacaoResultMessageSuccess"
            : "precipitacaoResultMessage precipitacaoResultMessageWarning"
        }
      >
        <strong>
          {resultadoAdequado
            ? "Titulação experimentalmente viável"
            : "Volume acima da capacidade informada"}
        </strong>

        <p>{resultado.mensagem}</p>
      </div>

      <div className="precipitacaoResultScientificNote">
        <strong>
          O que esse volume representa?
        </strong>

        <p>
          O valor de{" "}
          {formatarNumeroBR(resultado.volumePE, 2)} mL representa
          o ponto de equivalência teórico. Na prática, o ponto
          final é identificado visualmente pelo indicador e pode
          apresentar uma pequena diferença em relação ao valor
          calculado.
        </p>
      </div>
    </section>
  );
}