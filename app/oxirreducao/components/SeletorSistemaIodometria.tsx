import {
  sistemasIodometria,
  type SistemaIodometriaId,
} from "@/lib/oxirreducao/iodometria";


type SeletorSistemaIodometriaProps = {
  sistemaAtivo:
    SistemaIodometriaId;

  onChange: (
    sistema:
      SistemaIodometriaId
  ) => void;
};


export default function SeletorSistemaIodometria({
  sistemaAtivo,
  onChange,
}: SeletorSistemaIodometriaProps) {
  return (
    <section className="oxirreducaoAnalitoSelector">
      <header className="oxirreducaoAnalitoSelectorHeader">
        <div>
          <span className="oxirreducaoSectionLabel">
            Sistema analítico
          </span>

          <h3>
            Selecione o analito da iodometria
          </h3>

          <p>
            O analito gera iodo in situ na presença de KI. O I₂ formado é então titulado com Na₂S₂O₃.
          </p>
        </div>
      </header>

      <div className="oxirreducaoAnalitoGrid">
        {sistemasIodometria.map(
          (sistema) => {
            const ativo =
              sistema.id ===
              sistemaAtivo;

            return (
              <button
                key={sistema.id}
                type="button"
                className={[
                  "oxirreducaoAnalitoCard",
                  ativo
                    ? "oxirreducaoAnalitoCardActive"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onChange(
                    sistema.id
                  )
                }
              >
                <span className="oxirreducaoAnalitoFormula">
                  {sistema.formulaAnalito}
                </span>

                <span className="oxirreducaoAnalitoContent">
                  <span className="oxirreducaoAnalitoTitleRow">
                    <strong>
                      {sistema.nome}
                    </strong>

                    <small className="oxirreducaoAnalitoStatusAvailable">
                      Disponível
                    </small>
                  </span>

                  <span className="oxirreducaoAnalitoDescription">
                    {sistema.descricao}
                  </span>

                  <span className="oxirreducaoAnalitoTitulante">
                    Titulante: <strong>{sistema.titulante}</strong>
                  </span>
                </span>

                <span className="oxirreducaoAnalitoAction">
                  {ativo
                    ? "Sistema selecionado"
                    : "Selecionar"}

                  <span>→</span>
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

