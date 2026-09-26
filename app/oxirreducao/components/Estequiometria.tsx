import type {
    ResultadoCurvaRedox,
  } from "@/lib/oxirreducao/curvaRedox";
  
  
  type EstequiometriaProps = {
    resultado:
      ResultadoCurvaRedox;
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
  
  
  export default function Estequiometria({
    resultado,
  }: EstequiometriaProps) {
    const {
      entrada,
    } = resultado;
  
  
    const molFe2Inicial =
      entrada
        .concentracaoAnalitoMolL *
      (
        entrada
          .volumeAnalitoMl /
        1000
      );
  
  
    const molMnO4Equivalencia =
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
            Relação entre Fe²⁺ e MnO₄⁻
          </h3>
  
          <p>
            O volume de equivalência é obtido a partir do balanço
            eletrônico da reação global.
          </p>
        </header>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Oxidação
            </span>
  
            <strong>
              Fe²⁺ → Fe³⁺ + e⁻
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
              5 Fe²⁺ → 5 Fe³⁺ + 5 e⁻
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoEquationFlow">
          <article>
            <span>
              Redução
            </span>
  
            <strong>
              MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O
            </strong>
          </article>
        </div>
  
  
        <div className="oxirreducaoGlobalEquation">
          <span>
            Somando as semirreações
          </span>
  
          <strong>
            MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O
          </strong>
        </div>
  
  
        <div className="oxirreducaoStoichiometrySteps">
          <article>
            <span className="oxirreducaoStepNumber">
              1
            </span>
  
            <div>
              <span>
                Quantidade inicial de Fe²⁺
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
                n(Fe²⁺) ={" "}
                {formatarNumero(
                  molFe2Inicial,
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
                Aplicação da razão estequiométrica
              </span>
  
              <strong>
                5 mol Fe²⁺ : 1 mol MnO₄⁻
              </strong>
  
              <p>
                n(MnO₄⁻) = n(Fe²⁺) / 5
              </p>
  
              <b>
                n(MnO₄⁻) ={" "}
                {formatarNumero(
                  molMnO4Equivalencia,
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
                  molMnO4Equivalencia,
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