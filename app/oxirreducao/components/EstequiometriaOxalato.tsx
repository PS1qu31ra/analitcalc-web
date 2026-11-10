import type {
    ResultadoPermanganometriaOxalato,
  } from "@/lib/oxirreducao/permanganometriaOxalato";
  
  
  type EstequiometriaOxalatoProps = {
    resultado:
      ResultadoPermanganometriaOxalato;
  };
  
  
  function formatarNumero(
    valor: number,
    casas = 6
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
  
  
  export default function EstequiometriaOxalato({
    resultado,
  }: EstequiometriaOxalatoProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Estequiometria
          </span>
  
          <h3>
            H₂C₂O₄ × MnO₄⁻
          </h3>
  
          <p>
            O balanceamento eletrônico leva à proporção
            de 5 mol de ácido oxálico para 2 mol de permanganato.
          </p>
        </header>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Oxidação
            </span>
  
            <strong>
              H₂C₂O₄ → 2 CO₂ + 2 H⁺ + 2 e⁻
            </strong>
          </article>
  
          <div className="oxirreducaoEquationArrow">
            × 5
          </div>
  
          <article>
            <span>
              Oxidação ajustada
            </span>
  
            <strong>
              5 H₂C₂O₄ → 10 CO₂ + 10 H⁺ + 10 e⁻
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Redução × 2
            </span>
  
            <strong>
              2 MnO₄⁻ + 16 H⁺ + 10 e⁻ →
              2 Mn²⁺ + 8 H₂O
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoGlobalEquation">
          <span>
            Reação global
          </span>
  
          <strong>
            2 MnO₄⁻ + 5 H₂C₂O₄ + 6 H⁺ ⇌
            2 Mn²⁺ + 10 CO₂ + 8 H₂O
          </strong>
        </div>
  
  
        <div className="oxirreducaoStoichiometrySteps">
          <article>
            <span className="oxirreducaoStepNumber">
              1
            </span>
  
            <div>
              <span>
                Quantidade inicial de ácido oxálico
              </span>
  
              <strong>
                n(H₂C₂O₄)
              </strong>
  
              <b>
                {formatarNumero(
                  resultado
                    .molOxalatoInicial,
                  6
                )}{" "}
                mol
              </b>
            </div>
          </article>
  
  
          <article>
            <span className="oxirreducaoStepNumber">
              2
            </span>
  
            <div>
              <span>
                Razão estequiométrica
              </span>
  
              <strong>
                5 : 2
              </strong>
  
              <p>
                n(MnO₄⁻) =
                n(H₂C₂O₄) × 2/5
              </p>
  
              <b>
                {formatarNumero(
                  resultado
                    .molMnO4Equivalencia,
                  6
                )}{" "}
                mol
              </b>
            </div>
          </article>
  
  
          <article>
            <span className="oxirreducaoStepNumber">
              3
            </span>
  
            <div>
              <span>
                Volume de equivalência
              </span>
  
              <strong>
                V = n / C
              </strong>
  
              <b>
                VPE ={" "}
                {formatarNumero(
                  resultado
                    .volumeEquivalenciaMl,
                  2
                )}{" "}
                mL
              </b>
            </div>
          </article>
        </div>
  
  
        <div className="oxirreducaoOverviewMetrics">
          <div>
            <span>
              H⁺ consumido
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
              CO₂ produzido
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
              Mn²⁺ produzido
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
  
  
          <div>
            <span>
              Temperatura
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .temperaturaC,
                1
              )}{" "}
              °C
            </strong>
          </div>
        </div>
      </section>
    );
  }