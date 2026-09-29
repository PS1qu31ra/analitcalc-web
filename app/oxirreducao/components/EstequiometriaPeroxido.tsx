import type {
    ResultadoCurvaRedoxPeroxido,
  } from "@/lib/oxirreducao/curvaRedoxPeroxido";
  
  
  type EstequiometriaPeroxidoProps = {
    resultado:
      ResultadoCurvaRedoxPeroxido;
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
  
  
  export default function EstequiometriaPeroxido({
    resultado,
  }: EstequiometriaPeroxidoProps) {
    const entrada =
      resultado.entrada;
  
  
    const molH2O2 =
      entrada
        .concentracaoAnalitoMolL *
      (
        entrada
          .volumeAnalitoMl /
        1000
      );
  
  
    const molMnO4 =
      entrada
        .concentracaoTitulanteMolL *
      (
        resultado
          .volumeEquivalenciaMl /
        1000
      );
  
  
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Estequiometria
          </span>
  
          <h3>
            Relação H₂O₂ × MnO₄⁻
          </h3>
  
          <p>
            O balanceamento eletrônico determina uma proporção de
            5 mol de H₂O₂ para 2 mol de MnO₄⁻.
          </p>
        </header>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Oxidação
            </span>
  
            <strong>
              H₂O₂ → O₂ + 2 H⁺ + 2 e⁻
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
              5 H₂O₂ → 5 O₂ + 10 H⁺ + 10 e⁻
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Redução × 2
            </span>
  
            <strong>
              2 MnO₄⁻ + 16 H⁺ + 10 e⁻ → 2 Mn²⁺ + 8 H₂O
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoGlobalEquation">
          <span>
            Reação global
          </span>
  
          <strong>
            2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O
          </strong>
        </div>
  
  
        <div className="oxirreducaoStoichiometrySteps">
          <article>
            <span className="oxirreducaoStepNumber">
              1
            </span>
  
            <div>
              <span>
                Quantidade inicial de H₂O₂
              </span>
  
              <strong>
                n = C × V
              </strong>
  
              <p>
                {formatarNumero(
                  entrada
                    .concentracaoAnalitoMolL,
                  4
                )}{" "}
                mol/L ×{" "}
                {formatarNumero(
                  entrada
                    .volumeAnalitoMl /
                    1000,
                  5
                )}{" "}
                L
              </p>
  
              <b>
                n(H₂O₂) ={" "}
                {formatarNumero(
                  molH2O2,
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
                5 H₂O₂ : 2 MnO₄⁻
              </strong>
  
              <p>
                n(MnO₄⁻) = n(H₂O₂) × 2/5
              </p>
  
              <b>
                n(MnO₄⁻) ={" "}
                {formatarNumero(
                  molMnO4,
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
  
              <p>
                {formatarNumero(
                  molMnO4,
                  6
                )}{" "}
                mol ÷{" "}
                {formatarNumero(
                  entrada
                    .concentracaoTitulanteMolL,
                  4
                )}{" "}
                mol/L
              </p>
  
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
      </section>
    );
  }