import {
    PAR_FERRO_III_FERRO_II,
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
  
  
  export default function Semirreacoes() {
    const diferencaPotencial =
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao -
      PAR_FERRO_III_FERRO_II
        .potencialPadraoReducao;
  
  
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Semirreações + E°
          </span>
  
          <h3>
            Pares redox envolvidos
          </h3>
  
          <p>
            Os potenciais padrão são escritos para as semirreações
            no sentido de redução.
          </p>
        </header>
  
  
        <div className="oxirreducaoHalfReactionGrid">
          <article className="oxirreducaoHalfReactionCard">
            <span>
              Par do analito
            </span>
  
            <h4>
              Fe³⁺ / Fe²⁺
            </h4>
  
            <strong>
              {
                PAR_FERRO_III_FERRO_II
                  .semirreacaoReducao
              }
            </strong>
  
            <div>
              E° ={" "}
              {formatarNumero(
                PAR_FERRO_III_FERRO_II
                  .potencialPadraoReducao,
                3
              )}{" "}
              V
            </div>
  
            <p>
              Durante a titulação, Fe²⁺ é oxidado a Fe³⁺.
              Antes do PE, a relação entre essas duas espécies
              determina o potencial da solução.
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
              O permanganato recebe cinco elétrons e é reduzido
              a Mn²⁺ em meio ácido.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoPotentialComparison">
          <div>
            <span>
              E° do oxidante
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
              E° do par Fe³⁺/Fe²⁺
            </span>
  
            <strong>
              {formatarNumero(
                PAR_FERRO_III_FERRO_II
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
            Interpretação
          </strong>
  
          <p>
            Como o potencial padrão de redução do permanganato é
            maior que o do par Fe³⁺/Fe²⁺, MnO₄⁻ apresenta maior
            tendência a sofrer redução enquanto Fe²⁺ é oxidado.
            Isso favorece a reação global no sentido utilizado na
            titulação.
          </p>
        </div>
      </section>
    );
  }