import type {
    ResultadoCurvaRedox,
  } from "@/lib/oxirreducao/curvaRedox";
  
  
  type VisaoGeralProps = {
    resultado:
      ResultadoCurvaRedox;
  };
  
  
  function formatarNumero(
    valor: number,
    casas = 3
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        minimumFractionDigits:
          casas,
  
        maximumFractionDigits:
          casas,
      }
    ).format(
      valor
    );
  }
  
  
  export default function VisaoGeral({
    resultado,
  }: VisaoGeralProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Visão geral
          </span>
  
          <h3>
            Caracterização do sistema redox
          </h3>
  
          <p>
            A titulação utiliza permanganato como agente oxidante
            para determinar Fe²⁺ em meio ácido.
          </p>
        </header>
  
  
        <div className="oxirreducaoOverviewGrid">
          <article>
            <span>
              Analito
            </span>
  
            <strong>
              Fe²⁺
            </strong>
  
            <p>
              Espécie redutora presente inicialmente na amostra.
            </p>
          </article>
  
  
          <article>
            <span>
              Titulante
            </span>
  
            <strong>
              KMnO₄
            </strong>
  
            <p>
              Fonte de MnO₄⁻, que atua como agente oxidante.
            </p>
          </article>
  
  
          <article>
            <span>
              Meio
            </span>
  
            <strong>
              Ácido
            </strong>
  
            <p>
              H⁺ participa diretamente da semirreação do
              permanganato.
            </p>
          </article>
  
  
          <article>
            <span>
              Relação molar
            </span>
  
            <strong>
              5 Fe²⁺ : 1 MnO₄⁻
            </strong>
  
            <p>
              Determinada pelo balanço de cinco elétrons.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Reação global
          </span>
  
          <strong>
            MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ ⇌ Mn²⁺ + 5 Fe³⁺ + 4 H₂O
          </strong>
        </div>
  
  
        <div className="oxirreducaoOverviewMetrics">
          <div>
            <span>
              Volume de equivalência
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .volumeEquivalenciaMl,
                2
              )}{" "}
              mL
            </strong>
          </div>
  
  
          <div>
            <span>
              Potencial no PE
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .potencialEquivalenciaV,
                4
              )}{" "}
              V
            </strong>
          </div>
  
  
          <div>
            <span>
              Temperatura
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .entrada
                  .temperaturaC ??
                  25,
                1
              )}{" "}
              °C
            </strong>
          </div>
  
  
          <div>
            <span>
              [H⁺]
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .entrada
                  .concentracaoHPlusMolL,
                3
              )}{" "}
              mol/L
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Por que o potencial muda?
          </strong>
  
          <p>
            Antes do ponto de equivalência, o potencial é
            determinado principalmente pelo equilíbrio Fe³⁺/Fe²⁺.
            Depois do ponto de equivalência, o excesso de
            permanganato faz o sistema MnO₄⁻/Mn²⁺ assumir o
            controle do potencial.
          </p>
        </div>

        <div
  style={{
    marginTop: "24px",
    padding: "24px 28px",
    border: "1px solid #EBCBCB",
    borderRadius: "20px",
    background: "#FFFAFA",
  }}
>
  <h3
    style={{
      color: "#991B1B",
      fontSize: "20px",
      fontWeight: 700,
      marginBottom: "12px",
    }}
  >
    Por que o permanganato é autoindicador?
  </h3>

  <p
    style={{
      color: "#555B66",
      fontSize: "16px",
      lineHeight: 1.6,
      margin: 0,
    }}
  >
    O íon permanganato (MnO₄⁻), na forma oxidada, apresenta coloração violeta intensa, enquanto sua forma reduzida (Mn²⁺) é praticamente incolor em solução diluída. Essa diferença de coloração permite que o KMnO₄ atue como autoindicador: após o consumo do analito, o primeiro excesso de permanganato confere à solução uma coloração rosa-clara persistente, indicando o ponto final da titulação. </p>
</div>
      </section>
    );
  }