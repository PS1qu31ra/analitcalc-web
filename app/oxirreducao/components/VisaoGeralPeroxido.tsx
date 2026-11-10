import type {
    ResultadoCurvaRedoxPeroxido,
  } from "@/lib/oxirreducao/curvaRedoxPeroxido";

  import {
    PAR_OXIGENIO_PEROXIDO,
  } from "@/lib/oxirreducao/dadosRedox";
  
  
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
            2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ ⇌ 2 Mn²⁺ + 5 O₂ + 8 H₂O
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
              E° O₂/H₂O₂
            </span>
  
            <strong>
            {formatarNumero(
  PAR_OXIGENIO_PEROXIDO.potencialPadraoReducao,
  3
)} V
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Critério de cálculo
          </strong>
  
          <p>
            A quantidade de O₂ não é informada como dado independente:
            ela é calculada pela estequiometria, pois cada mol de H₂O₂
            consumido forma um mol de O₂. A concentração de O₂ é obtida
            dividindo essa quantidade pelo volume total da solução.
          </p>
        </div>
      </section>
    );
  }