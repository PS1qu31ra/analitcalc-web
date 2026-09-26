import {
    sistemasPermanganometria,
    type SistemaPermanganometriaId,
  } from "@/lib/oxirreducao/sistemasPermanganometria";
  
  
  type SeletorSistemaPermanganometriaProps = {
    sistemaAtivo:
      SistemaPermanganometriaId;
  
    onChange: (
      sistema:
        SistemaPermanganometriaId
    ) => void;
  };
  
  
  export default function SeletorSistemaPermanganometria({
    sistemaAtivo,
    onChange,
  }: SeletorSistemaPermanganometriaProps) {
    return (
      <section className="oxirreducaoAnalitoSelector">
        <header className="oxirreducaoAnalitoSelectorHeader">
          <div>
            <span className="oxirreducaoSectionLabel">
              Sistema analítico
            </span>
  
            <h3>
              Selecione o analito
            </h3>
  
            <p>
              O titulante é KMnO₄. A reação, a
              estequiometria e o comportamento
              potenciométrico dependem do analito
              selecionado.
            </p>
          </div>
        </header>
  
  
        <div className="oxirreducaoAnalitoGrid">
          {sistemasPermanganometria.map(
            (sistema) => {
              const ativo =
                sistema.id ===
                sistemaAtivo;
  
              const disponivel =
                sistema.status ===
                "disponivel";
  
  
              return (
                <button
                  key={
                    sistema.id
                  }
                  type="button"
                  disabled={
                    !disponivel
                  }
                  className={[
                    "oxirreducaoAnalitoCard",
  
                    ativo
                      ? "oxirreducaoAnalitoCardActive"
                      : "",
  
                    !disponivel
                      ? "oxirreducaoAnalitoCardDisabled"
                      : "",
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )}
                  onClick={() => {
                    if (
                      disponivel
                    ) {
                      onChange(
                        sistema.id
                      );
                    }
                  }}
                >
                  <span className="oxirreducaoAnalitoFormula">
                    {
                      sistema.formulaAnalito
                    }
                  </span>
  
  
                  <span className="oxirreducaoAnalitoContent">
                    <span className="oxirreducaoAnalitoTitleRow">
                      <strong>
                        {
                          sistema.nome
                        }
                      </strong>
  
                      <small
                        className={
                          disponivel
                            ? "oxirreducaoAnalitoStatusAvailable"
                            : "oxirreducaoAnalitoStatusSoon"
                        }
                      >
                        {disponivel
                          ? "Disponível"
                          : "Em breve"}
                      </small>
                    </span>
  
  
                    <span className="oxirreducaoAnalitoDescription">
                      {
                        sistema.descricao
                      }
                    </span>
  
  
                    <span className="oxirreducaoAnalitoTitulante">
                      Titulante:{" "}
                      <strong>
                        {
                          sistema.titulante
                        }
                      </strong>
                    </span>
                  </span>
  
  
                  <span className="oxirreducaoAnalitoAction">
                    {ativo
                      ? "Sistema selecionado"
                      : disponivel
                        ? "Selecionar"
                        : "Em desenvolvimento"}
  
                    <span>
                      →
                    </span>
                  </span>
                </button>
              );
            }
          )}
        </div>
      </section>
    );
  }