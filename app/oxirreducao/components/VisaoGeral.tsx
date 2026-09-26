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
            MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O
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
                3
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
      </section>
    );
  }