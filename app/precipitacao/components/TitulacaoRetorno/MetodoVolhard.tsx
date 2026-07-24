import {
    formatarCientificoBR,
    formatarNumeroBR,
  } from "@/lib/precipitacao/formatadores";
  
  import type {
    ResultadoTitulacaoRetornoPrecipitacao,
  } from "@/lib/precipitacao/tipos";
  
  type MetodoVolhardProps = {
    resultado: ResultadoTitulacaoRetornoPrecipitacao;
  };
  
  export default function MetodoVolhard({
    resultado,
  }: MetodoVolhardProps) {
    const formulaAnalito =
      resultado.especieAnalito === "cation"
        ? resultado.salPrincipal.cation.formulaExibicao
        : resultado.salPrincipal.anion.formulaExibicao;
  
    return (
      <section className="precipitacaoMethodComparisonSection">
        <header className="precipitacaoMethodComparisonIntro">
          <span className="precipitacaoSectionLabel">
            Método argentométrico de retorno
          </span>
  
          <h5>
            Método de Volhard
          </h5>
  
          <p>
            O método determina indiretamente o analito
            pela adição de uma quantidade conhecida de
            AgNO₃ em excesso. A prata que não reage com
            o analito é posteriormente titulada com
            SCN⁻ em meio ácido.
          </p>
        </header>
  
        <section className="precipitacaoErrorContext">
          <div className="precipitacaoErrorContextHeading">
            <span className="precipitacaoSectionLabel">
              Sistema selecionado
            </span>
  
            <h6>
              Reagentes e condições do método
            </h6>
          </div>
  
          <div className="precipitacaoErrorContextGrid">
            <article>
              <span>Analito</span>
              <strong>
                {formulaAnalito}
              </strong>
            </article>
  
            <article>
              <span>Reagente em excesso</span>
              <strong>AgNO₃</strong>
            </article>
  
            <article>
              <span>Titulante de retorno</span>
              <strong>SCN⁻</strong>
            </article>
  
            <article>
              <span>Indicador</span>
              <strong>Fe³⁺</strong>
            </article>
  
            <article>
              <span>Condição obrigatória</span>
              <strong>Meio ácido</strong>
            </article>
          </div>
        </section>
  
        <div className="precipitacaoResultInterpretation">
          <div className="precipitacaoResultInterpretationHeader">
            <span>
              Primeira etapa
            </span>
  
            <strong>
              Precipitação do analito
            </strong>
          </div>
  
          <p>
            Uma quantidade conhecida e excessiva de Ag⁺
            é adicionada à amostra. O analito{" "}
            <strong>{formulaAnalito}</strong> reage com
            a prata e forma o precipitado{" "}
            <strong>
              {resultado.salPrincipal.formulaExibicao}
            </strong>
            . A relação usada no cálculo é{" "}
            <strong>
              {resultado.relacaoPrincipal}
            </strong>
            .
          </p>
        </div>
  
        <div className="precipitacaoResultInterpretation">
          <div className="precipitacaoResultInterpretationHeader">
            <span>
              Segunda etapa
            </span>
  
            <strong>
              Titulação da prata remanescente
            </strong>
          </div>
  
          <p>
            O Ag⁺ que permanece em excesso é titulado
            com SCN⁻ segundo a reação{" "}
            <strong>
              Ag⁺ + SCN⁻ → AgSCN(s)
            </strong>
            . A relação estequiométrica dessa etapa é{" "}
            <strong>
              {resultado.relacaoRetorno}
            </strong>
            .
          </p>
        </div>
  
        <section className="precipitacaoResultsGrid">
          <article className="precipitacaoResultCard precipitacaoResultCardMain">
            <span>
              Ponto final previsto
            </span>
  
            <strong>
              {formatarNumeroBR(
                resultado.volumeTitulanteRetorno,
                2
              )}
              <small> mL</small>
            </strong>
  
            <p>
              Volume de SCN⁻ necessário para titular
              o Ag⁺ que permaneceu em excesso.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ total adicionado
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteAdicionado,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade total de prata adicionada
              inicialmente à amostra.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ consumido pelo analito
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteConsumidoPeloAnalito,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade utilizada na formação do
              precipitado principal.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ titulado no retorno
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteEmExcesso,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade remanescente determinada
              pela solução de SCN⁻.
            </p>
          </article>
        </section>
  
        <div className="precipitacaoResultScientificNote">
          <strong>
            Por que o meio deve ser ácido?
          </strong>
  
          <p>
            O meio ácido evita reações paralelas
            importantes do Fe³⁺, especialmente a
            formação de espécies hidrolisadas ou
            precipitados de hidróxido. Assim, o
            indicador permanece disponível para
            reagir com o primeiro excesso persistente
            de SCN⁻.
          </p>
        </div>
  
        <div className="precipitacaoResultScientificNote">
          <strong>
            Identificação do ponto final
          </strong>
  
          <p>
            Enquanto existir Ag⁺ em excesso, o SCN⁻
            adicionado forma AgSCN(s). Depois que a
            prata remanescente é consumida, a primeira
            quantidade excedente de SCN⁻ reage com
            Fe³⁺ e produz a coloração característica
            usada para reconhecer o ponto final.
          </p>
        </div>
  
        <section className="precipitacaoErrorFinalDiagnosis">
          <header className="precipitacaoErrorFinalDiagnosisHeader">
            <div>
              <span className="precipitacaoSectionLabel">
                Cuidados experimentais
              </span>
  
              <h6>
                Pontos críticos do método
              </h6>
            </div>
  
            <span className="precipitacaoErrorFinalStatus precipitacaoErrorFinalStatusOk">
              Volhard
            </span>
          </header>
  
          <div className="precipitacaoErrorPossibleCausesGrid">
            <article>
              <span>01</span>
              <p>
                Manter a solução em meio ácido durante
                a titulação do excesso de prata.
              </p>
            </article>
  
            <article>
              <span>02</span>
              <p>
                Adicionar quantidade suficiente e
                conhecida de AgNO₃ para precipitar
                completamente o analito.
              </p>
            </article>
  
            <article>
              <span>03</span>
              <p>
                Agitar adequadamente para favorecer a
                formação e a separação do precipitado.
              </p>
            </article>
  
            <article>
              <span>04</span>
              <p>
                Próximo ao ponto final, adicionar SCN⁻
                gota a gota e observar a persistência
                da coloração.
              </p>
            </article>
  
            <article>
              <span>05</span>
              <p>
                Evitar excesso significativo de SCN⁻,
                pois isso altera o volume experimental
                e afeta o resultado calculado.
              </p>
            </article>
  
            <article>
              <span>06</span>
              <p>
                Considerar possíveis espécies da
                amostra que também consumam Ag⁺,
                SCN⁻ ou interfiram na observação do
                indicador.
              </p>
            </article>
          </div>
        </section>
      </section>
    );
  }