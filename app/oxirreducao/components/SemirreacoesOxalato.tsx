import {
    PAR_DIOXIDO_CARBONO_ACIDO_OXALICO,
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
  
  
  export default function SemirreacoesOxalato() {
    const diferencaPotencial =
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao -
      PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
        .potencialPadraoReducao;
  
  
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Semirreações + E°
          </span>
  
          <h3>
            Pares MnO₄⁻/Mn²⁺ e CO₂/H₂C₂O₄
          </h3>
  
          <p>
            Na permanganometria do ácido oxálico, o sistema redutor
            é tratado termodinamicamente pelo par
            CO₂/H₂C₂O₄ em meio ácido, enquanto o permanganato
            é reduzido a Mn²⁺.
          </p>
        </header>
  
  
        <div className="oxirreducaoHalfReactionGrid">
          <article className="oxirreducaoHalfReactionCard">
            <span>
              Par do analito
            </span>
  
            <h4>
              CO₂ / H₂C₂O₄
            </h4>
  
            <strong>
              {
                PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
                  .semirreacaoReducao
              }
            </strong>
  
            <div>
              E° ={" "}
              {formatarNumero(
                PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
                  .potencialPadraoReducao,
                3
              )}{" "}
              V
            </div>
  
            <p>
              Durante a titulação, essa semirreação ocorre
              no sentido inverso: o ácido oxálico é oxidado
              a CO₂, liberando dois elétrons.
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
                3
              )}{" "}
              V
            </div>
  
            <p>
              O permanganato recebe cinco elétrons e é
              reduzido a Mn²⁺ em meio ácido.
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
              E° CO₂/H₂C₂O₄
            </span>
  
            <strong>
              {formatarNumero(
                PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
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
            Cada mol de H₂C₂O₄ fornece dois elétrons
            ao ser oxidada a CO₂. Cada MnO₄⁻ recebe cinco
            elétrons. O mínimo múltiplo comum é dez
            elétrons, originando a proporção de
            5 mol de ácido oxálico para 2 mol de permanganato.
          </p>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Espécie considerada
          </strong>
  
          <p>
            O analito é representado como ácido oxálico
            (H₂C₂O₄), que é oxidado a CO₂ durante a titulação.
          </p>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Termodinâmica × cinética
          </strong>
  
          <p>
            O potencial redox descreve o equilíbrio
            termodinâmico. A conhecida autocatalise por
            Mn²⁺ e o efeito do aquecimento alteram
            principalmente a velocidade com que o sistema
            alcança esse equilíbrio e serão tratados
            separadamente do cálculo de E.
          </p>
        </div>
      </section>
    );
  }