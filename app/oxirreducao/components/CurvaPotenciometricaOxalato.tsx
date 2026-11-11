import type {
  ResultadoCurvaRedoxOxalato,
} from "@/lib/oxirreducao/curvaRedoxOxalato";
import ConsultaCurvaOxirreducao from "./ConsultaCurvaOxirreducao";

type CurvaPotenciometricaOxalatoProps = {
  resultado: ResultadoCurvaRedoxOxalato;
};

function formatarNumero(valor: number, casas = 3) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

export default function CurvaPotenciometricaOxalato({
  resultado,
}: CurvaPotenciometricaOxalatoProps) {
  return (
    <section className="oxirreducaoTabPanel">
      <header className="oxirreducaoCurveHeader">
        <div>
          <span className="oxirreducaoSectionLabel">
            Curva potenciométrica
          </span>
          <h3>H₂C₂O₄ × KMnO₄</h3>
          <p>
            Antes do PE, aplica-se Nernst ao par CO₂/H₂C₂O₄.
            No PE, utiliza-se a média ponderada dos potenciais
            dos pares redox. Após o PE, aplica-se Nernst ao par
            MnO₄⁻/Mn²⁺. Para o par CO₂/H₂C₂O₄, considera-se
            pressão de CO₂ de aproximadamente 1 atm.
          </p>
        </div>
        <div className="oxirreducaoPEBadge">
          <span>PE</span>
          <strong>{formatarNumero(resultado.volumeEquivalenciaMl, 2)} mL</strong>
        </div>
      </header>

      <ConsultaCurvaOxirreducao modo="oxalato" resultado={resultado} />

      <div className="oxirreducaoRegionGrid">
        <article>
          <span>Antes do PE</span>
          <strong>CO₂ / H₂C₂O₄</strong>
          <p>
            O H₂C₂O₄ permanece em excesso e o potencial é
            calculado pela equação de Nernst desse par.
          </p>
        </article>

        <article className="oxirreducaoRegionPE">
          <span>No PE</span>
          <strong>{formatarNumero(resultado.potencialEquivalenciaV, 4)} V</strong>
          <p>
            Potencial calculado pela média ponderada dos pares
            CO₂/H₂C₂O₄ e MnO₄⁻/Mn²⁺.
          </p>
        </article>

        <article>
          <span>Após o PE</span>
          <strong>MnO₄⁻ / Mn²⁺</strong>
          <p>
            O permanganato permanece em excesso e determina
            o potencial da solução.
          </p>
        </article>
      </div>

      <div className="oxirreducaoEducationalNote">
        <strong>Comportamento autocatalítico</strong>
        <p>
          A reação entre permanganato e ácido oxálico é autocatalítica:
          o Mn²⁺ formado durante a reação favorece sua progressão.
        </p>
      </div>
    </section>
  );
}
