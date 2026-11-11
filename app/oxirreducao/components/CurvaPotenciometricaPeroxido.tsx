import type {
    ResultadoCurvaRedoxPeroxido,
  } from "@/lib/oxirreducao/curvaRedoxPeroxido";
  
  import ConsultaCurvaOxirreducao from "./ConsultaCurvaOxirreducao";
  
  
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
  Antes do PE, aplica-se Nernst ao par O₂/H₂O₂. No PE,
  utiliza-se a média ponderada dos potenciais dos pares
  redox. Após o PE, aplica-se Nernst ao par MnO₄⁻/Mn²⁺.
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
  
  
        <ConsultaCurvaOxirreducao
  modo="peroxido"
  resultado={resultado}
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
  
  
      </section>
    );
  }