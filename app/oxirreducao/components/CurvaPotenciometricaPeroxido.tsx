import type {
    ResultadoCurvaRedoxPeroxido,
  } from "@/lib/oxirreducao/curvaRedoxPeroxido";
  
  import GraficoCurvaRedox from "./GraficoCurvaRedox";
  
  
  type CurvaPotenciometricaPeroxidoProps = {
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
  
  
  export default function CurvaPotenciometricaPeroxido({
    resultado,
  }: CurvaPotenciometricaPeroxidoProps) {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoCurveHeader">
          <div>
            <span className="oxirreducaoSectionLabel">
              Curva potenciométrica
            </span>
  
            <h3>
              H₂O₂ × KMnO₄
            </h3>
  
            <p>
  O potencial é calculado pelo equilíbrio simultâneo entre
  os pares O₂/H₂O₂ e MnO₄⁻/Mn²⁺ em todos os volumes da
  titulação. Antes e depois do PE muda apenas o par
  predominante no controle do potencial.
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
              O₂ / H₂O₂
            </strong>
  
            <p>
              O H₂O₂ permanece em excesso e o modelo utiliza seu
              par redox com O₂.
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
              Região de transição entre o sistema do analito e o
              sistema do titulante.
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
              MnO₄⁻ permanece em excesso e passa a controlar o
              potencial.
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