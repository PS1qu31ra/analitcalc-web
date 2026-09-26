export type AbaOxirreducao =
  | "permanganometria"
  | "iodometria";


type ModuleTabsProps = {
  abaAtiva:
    AbaOxirreducao;

  onChange: (
    aba: AbaOxirreducao
  ) => void;
};


const estudos: {
  id: AbaOxirreducao;
  numero: string;
  titulo: string;
  descricao: string;
  orientacao: string;
  disponivel: boolean;
}[] = [
  {
    id:
      "permanganometria",

    numero:
      "01",

    titulo:
      "Permanganometria",

    descricao:
      "Titulações utilizando permanganato como agente oxidante, com acompanhamento estequiométrico e potenciométrico.",

    orientacao:
      "Começaremos pelo sistema clássico Fe²⁺ × MnO₄⁻ em meio ácido.",

    disponivel:
      true,
  },

  {
    id:
      "iodometria",

    numero:
      "02",

    titulo:
      "Iodometria",

    descricao:
      "Determinação indireta de espécies oxidantes por formação de iodo e posterior titulação com tiossulfato.",

    orientacao:
      "Este módulo será liberado após a validação completa da permanganometria.",

    disponivel:
      false,
  },
];


export default function ModuleTabs({
  abaAtiva,
  onChange,
}: ModuleTabsProps) {
  return (
    <section
      className="container oxirreducaoStudySection"
      aria-labelledby="oxirreducao-study-title"
    >
      <header className="oxirreducaoStudyHeader">
        <span className="oxirreducaoSectionLabel">
          Seleção do método
        </span>

        <h2 id="oxirreducao-study-title">
          Qual sistema redox você deseja estudar?
        </h2>

        <p>
          Cada método possui estequiometria, semirreações e
          comportamento potenciométrico específicos.
        </p>
      </header>

      <div
        className="oxirreducaoStudyGrid"
        role="tablist"
        aria-label="Métodos de volumetria de oxirredução"
      >
        {estudos.map(
          (estudo) => {
            const estaAtivo =
              abaAtiva ===
              estudo.id;

            return (
              <button
                key={
                  estudo.id
                }
                type="button"
                role="tab"
                aria-selected={
                  estaAtivo
                }
                disabled={
                  !estudo.disponivel
                }
                className={[
                  "oxirreducaoStudyCard",

                  estaAtivo
                    ? "oxirreducaoStudyCardActive"
                    : "",

                  !estudo.disponivel
                    ? "oxirreducaoStudyCardDisabled"
                    : "",
                ]
                  .filter(
                    Boolean
                  )
                  .join(" ")}
                onClick={() => {
                  if (
                    estudo.disponivel
                  ) {
                    onChange(
                      estudo.id
                    );
                  }
                }}
              >
                <span className="oxirreducaoStudyNumber">
                  {
                    estudo.numero
                  }
                </span>

                <span className="oxirreducaoStudyContent">
                  <span className="oxirreducaoStudyTitleRow">
                    <strong>
                      {
                        estudo.titulo
                      }
                    </strong>

                    {!estudo.disponivel && (
                      <small>
                        Em breve
                      </small>
                    )}
                  </span>

                  <span className="oxirreducaoStudyDescription">
                    {
                      estudo.descricao
                    }
                  </span>

                  <span className="oxirreducaoStudyOrientation">
                    {
                      estudo.orientacao
                    }
                  </span>
                </span>

                <span className="oxirreducaoStudyAction">
                  {estudo.disponivel
                    ? estaAtivo
                      ? "Selecionado"
                      : "Escolher método"
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