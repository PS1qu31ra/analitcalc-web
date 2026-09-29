import {
    PAR_OXIGENIO_PEROXIDO,
    PAR_PERMANGANATO_MANGANES,
  } from "@/lib/oxirreducao/dadosRedox";
  
  
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
  
  
  export default function SemirreacoesPeroxido() {
    const diferencaPotencial =
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao -
      PAR_OXIGENIO_PEROXIDO
        .potencialPadraoReducao;
  
  
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Semirreações + E°
          </span>
  
          <h3>
            Pares MnO₄⁻/Mn²⁺ e O₂/H₂O₂
          </h3>
  
          <p>
            O H₂O₂ sofre oxidação, enquanto o permanganato sofre
            redução.
          </p>
        </header>
  
  
        <div className="oxirreducaoHalfReactionGrid">
          <article className="oxirreducaoHalfReactionCard">
            <span>
              Par do analito
            </span>
  
            <h4>
              O₂ / H₂O₂
            </h4>
  
            <strong>
              O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂
            </strong>
  
            <div>
              E° ={" "}
              {formatarNumero(
                PAR_OXIGENIO_PEROXIDO
                  .potencialPadraoReducao,
                3
              )}{" "}
              V
            </div>
  
            <p>
              Na titulação, essa semirreação ocorre no sentido
              inverso: H₂O₂ é oxidado a O₂ e libera dois elétrons.
            </p>
          </article>
  
  
          <article className="oxirreducaoHalfReactionCard">
            <span>
              Par do titulante
            </span>
  
            <h4>
              MnO₄⁻ / Mn²⁺
            </h4>
  
            <strong>
              {
                PAR_PERMANGANATO_MANGANES
                  .semirreacaoReducao
              }
            </strong>
  
            <div>
              E° ={" "}
              {formatarNumero(
                PAR_PERMANGANATO_MANGANES
                  .potencialPadraoReducao,
                2
              )}{" "}
              V
            </div>
  
            <p>
              O permanganato recebe cinco elétrons e é reduzido a
              Mn²⁺ em meio ácido.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoPotentialComparison">
          <div>
            <span>
              E° MnO₄⁻/Mn²⁺
            </span>
  
            <strong>
              {formatarNumero(
                PAR_PERMANGANATO_MANGANES
                  .potencialPadraoReducao,
                3
              )}{" "}
              V
            </strong>
          </div>
  
  
          <span className="oxirreducaoPotentialOperator">
            −
          </span>
  
  
          <div>
            <span>
              E° O₂/H₂O₂
            </span>
  
            <strong>
              {formatarNumero(
                PAR_OXIGENIO_PEROXIDO
                  .potencialPadraoReducao,
                3
              )}{" "}
              V
            </strong>
          </div>
  
  
          <span className="oxirreducaoPotentialOperator">
            =
          </span>
  
  
          <div className="oxirreducaoPotentialResult">
            <span>
              ΔE°
            </span>
  
            <strong>
              {formatarNumero(
                diferencaPotencial,
                3
              )}{" "}
              V
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Transferência eletrônica
          </strong>
  
          <p>
            Cada H₂O₂ fornece dois elétrons, enquanto cada MnO₄⁻
            recebe cinco. O mínimo múltiplo comum é dez elétrons,
            originando a proporção 5 H₂O₂ para 2 MnO₄⁻.
          </p>
        </div>
      </section>
    );
  }