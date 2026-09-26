import type {
    ResultadoCurvaRedox,
  } from "@/lib/oxirreducao/curvaRedox";
  
  import GraficoCurvaRedox from "./GraficoCurvaRedox";
  
  
  type CurvaPotenciometricaProps = {
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
  
  
  export default function CurvaPotenciometrica({
    resultado,
  }: CurvaPotenciometricaProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoCurveHeader">
          <div>
            <span className="oxirreducaoSectionLabel">
              Curva potenciométrica
            </span>
  
            <h3>
              Potencial E × volume de KMnO₄
            </h3>
  
            <p>
              A resolução da curva aumenta próximo ao ponto de
              equivalência para representar melhor o salto de
              potencial.
            </p>
          </div>
  
          <div className="oxirreducaoPEBadge">
            <span>
              PE
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
        </header>
  
  
        <GraficoCurvaRedox
          resultado={
            resultado
          }
        />
  
  
        <div className="oxirreducaoRegionGrid">
          <article>
            <span>
              Antes do PE
            </span>
  
            <strong>
              Fe³⁺ / Fe²⁺
            </strong>
  
            <p>
              O potencial é determinado pela razão entre ferro
              oxidado e ferro ainda não titulado.
            </p>
          </article>
  
  
          <article className="oxirreducaoRegionPE">
            <span>
              No PE
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .potencialEquivalenciaV,
                3
              )}{" "}
              V
            </strong>
  
            <p>
              Região de transição entre os dois sistemas redox.
            </p>
          </article>
  
  
          <article>
            <span>
              Após o PE
            </span>
  
            <strong>
              MnO₄⁻ / Mn²⁺
            </strong>
  
            <p>
              O excesso de permanganato passa a controlar o
              potencial da solução.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoCurveInfo">
          <div>
            <span>
              Pontos calculados
            </span>
  
            <strong>
              {
                resultado
                  .pontosValidos
                  .length
              }
            </strong>
          </div>
  
          <div>
            <span>
              Passo geral
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .passoBaseMl,
                3
              )}{" "}
              mL
            </strong>
          </div>
  
          <div>
            <span>
              Passo próximo ao PE
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .passoProximoPEMl,
                3
              )}{" "}
              mL
            </strong>
          </div>
        </div>
      </section>
    );
  }