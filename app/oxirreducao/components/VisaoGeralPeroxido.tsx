import type {
    ResultadoCurvaRedoxPeroxido,
  } from "@/lib/oxirreducao/curvaRedoxPeroxido";
  
  
  type VisaoGeralPeroxidoProps = {
    resultado:
      ResultadoCurvaRedoxPeroxido;
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
  
  
  export default function VisaoGeralPeroxido({
    resultado,
  }: VisaoGeralPeroxidoProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Visão geral
          </span>
  
          <h3>
            Permanganometria do H₂O₂
          </h3>
  
          <p>
            O peróxido de hidrogênio atua como redutor e é
            oxidado a O₂ pelo permanganato em meio ácido.
          </p>
        </header>
  
  
        <div className="oxirreducaoOverviewGrid">
          <article>
            <span>
              Analito
            </span>
  
            <strong>
              H₂O₂
            </strong>
  
            <p>
              O peróxido de hidrogênio é oxidado durante a
              titulação.
            </p>
          </article>
  
  
          <article>
            <span>
              Produto
            </span>
  
            <strong>
              O₂
            </strong>
  
            <p>
              O oxigênio é formado pela oxidação do H₂O₂.
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
              MnO₄⁻ atua como agente oxidante.
            </p>
          </article>
  
  
          <article>
            <span>
              Relação molar
            </span>
  
            <strong>
              5 H₂O₂ : 2 MnO₄⁻
            </strong>
  
            <p>
              Relação obtida pelo balanço de dez elétrons.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Reação global
          </span>
  
          <strong>
            2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O
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
  
  
          <div>
            <span>
              a(O₂)
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .entrada
                  .atividadeOxigenio ??
                  1,
                3
              )}
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Hipótese do modelo
          </strong>
  
          <p>
            Como O₂ é uma espécie gasosa, sua atividade depende
            das condições experimentais. O modelo inicial utiliza
            a(O₂) = 1 como condição de referência, permitindo
            estudar termodinamicamente o par O₂/H₂O₂.
          </p>
        </div>
      </section>
    );
  }