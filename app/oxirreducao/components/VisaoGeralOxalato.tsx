import type {
    ResultadoPermanganometriaOxalato,
  } from "@/lib/oxirreducao/permanganometriaOxalato";
  
  
  type VisaoGeralOxalatoProps = {
    resultado:
      ResultadoPermanganometriaOxalato;
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
  
  
  export default function VisaoGeralOxalato({
    resultado,
  }: VisaoGeralOxalatoProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Visão geral
          </span>
  
          <h3>
            Permanganometria do oxalato
          </h3>
  
          <p>
            O oxalato é oxidado a CO₂ enquanto o permanganato
            é reduzido a Mn²⁺ em meio ácido.
          </p>
        </header>
  
  
        <div className="oxirreducaoOverviewGrid">
          <article>
            <span>
              Analito
            </span>
  
            <strong>
              C₂O₄²⁻
            </strong>
  
            <p>
              Espécie redutora consumida durante a titulação.
            </p>
          </article>
  
  
          <article>
            <span>
              Produto
            </span>
  
            <strong>
              CO₂
            </strong>
  
            <p>
              Produto da oxidação do oxalato.
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
              5 : 2
            </strong>
  
            <p>
              5 C₂O₄²⁻ para 2 MnO₄⁻.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Reação global
          </span>
  
          <strong>
            2 MnO₄⁻ + 5 C₂O₄²⁻ + 16 H⁺ →
            2 Mn²⁺ + 10 CO₂ + 8 H₂O
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
              H⁺ estequiométrico
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .molHPlusEstequiometrico,
                6
              )}{" "}
              mol
            </strong>
          </div>
  
  
          <div>
            <span>
              CO₂ no PE
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .molCO2ProduzidoNoPE,
                6
              )}{" "}
              mol
            </strong>
          </div>
  
  
          <div>
            <span>
              Mn²⁺ no PE
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .molMn2ProduzidoNoPE,
                6
              )}{" "}
              mol
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Sistema autocatalítico
          </strong>
  
          <p>
            A reação entre permanganato e oxalato apresenta
            comportamento autocatalítico. O Mn²⁺ produzido
            durante a reação favorece sua progressão, de modo
            que as condições experimentais e a temperatura têm
            importância especial neste sistema.
          </p>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Modelo potenciométrico
          </strong>
  
          <p>
            A estequiometria já está implementada, mas a curva
            E × V e o tratamento completo dos potenciais ainda
            estão em desenvolvimento para evitar aplicar ao
            oxalato um modelo simplificado inadequado.
          </p>
        </div>
      </section>
    );
  }