import type {
    ResultadoCurvaRedoxOxalato,
  } from "@/lib/oxirreducao/curvaRedoxOxalato";
  
  import ConsultaCurvaOxirreducao from "./ConsultaCurvaOxirreducao";
  
  
  type CurvaPotenciometricaOxalatoProps = {
    resultado:
      ResultadoCurvaRedoxOxalato;
  };
  
  
  function formatarNumero(
    valor:
      number,
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
  
  
  function formatarPercentual(
    valor:
      number
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        minimumFractionDigits:
          3,
  
        maximumFractionDigits:
          3,
      }
    ).format(
      valor *
        100
    );
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
  
            <h3>
              Oxalato × KMnO₄
            </h3>
  
            <p>
              O potencial é calculado pelo equilíbrio simultâneo
              entre CO₂/H₂C₂O₄ e MnO₄⁻/Mn²⁺. A concentração
              informada para o analito é tratada como oxalato
              total e convertida em H₂C₂O₄, HC₂O₄⁻ e C₂O₄²⁻
              pela especiação ácido-base antes da aplicação de
              Nernst.
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
  modo="oxalato"
  resultado={resultado}
/>
  
  
        <div className="oxirreducaoRegionGrid">
          <article>
            <span>
              Antes do PE
            </span>
  
            <strong>
              CO₂ / H₂C₂O₄
            </strong>
  
            <p>
              Oxalato total permanece em excesso. O potencial
              considera especificamente a fração protonada
              H₂C₂O₄ disponível no equilíbrio redox.
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
              Potencial ponderado pelos 2 elétrons do par
              CO₂/H₂C₂O₄ e pelos 5 elétrons do par
              MnO₄⁻/Mn²⁺.
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
              MnO₄⁻ permanece em excesso e passa a predominar
              no potencial do sistema.
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
  
  
          <div>
            <span>
              a(CO₂)
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .atividadeCO2,
                3
              )}
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoOverviewMetrics">
          <div>
            <span>
              H₂C₂O₄
            </span>
  
            <strong>
              {formatarPercentual(
                resultado
                  .fracaoH2C2O4
              )}
              %
            </strong>
          </div>
  
  
          <div>
            <span>
              HC₂O₄⁻
            </span>
  
            <strong>
              {formatarPercentual(
                resultado
                  .fracaoHC2O4
              )}
              %
            </strong>
          </div>
  
  
          <div>
            <span>
              C₂O₄²⁻
            </span>
  
            <strong>
              {formatarPercentual(
                resultado
                  .fracaoC2O4
              )}
              %
            </strong>
          </div>
  
  
          <div>
            <span>
              pKa₁ / pKa₂
            </span>
  
            <strong>
              {formatarNumero(
                resultado
                  .pKa1Oxalato,
                3
              )}
              {" / "}
              {formatarNumero(
                resultado
                  .pKa2Oxalato,
                3
              )}
            </strong>
          </div>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Importante: equilíbrio não é velocidade
          </strong>
  
          <p>
            A curva E × V representa o estado termodinâmico de
            equilíbrio. A autocatalise por Mn²⁺ e o aquecimento
            característicos da permanganometria do oxalato
            alteram principalmente a velocidade de aproximação
            ao equilíbrio e não são usados para deslocar
            artificialmente o potencial calculado.
          </p>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Hipóteses deste modelo
          </strong>
  
          <p>
            Atividades das espécies aquosas são aproximadas por
            concentrações, [H⁺] é tratada como constante e em
            excesso, a(CO₂) usa 1 por padrão e os pKa do ácido
            oxálico são valores de referência a 25 °C.
          </p>
        </div>
      </section>
    );
  }