export type AbaOxirreducao =
  | "permanganometria"
  | "iodometria";


type ModuleTabsProps = {
  abaAtiva:
    AbaOxirreducao;

  onChange: (
    aba:
      AbaOxirreducao
  ) => void;
};


const estudos: {
  id: AbaOxirreducao;
  numero: string;
  titulo: string;
  descricao: string;
  orientacao: string;
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
      "Sistemas disponíveis: Fe²⁺, H₂O₂ e oxalato.",
  },
  {
    id:
      "iodometria",

    numero:
      "02",

    titulo:
      "Iodometria",

    descricao:
      "Determinação indireta de espécies oxidantes por geração de iodo in situ e posterior titulação com tiossulfato de sódio.",

    orientacao:
      "Sistemas disponíveis: Cl₂, Cu²⁺, O₂ dissolvido, H₂O₂, ClO⁻ e IO₃⁻.",
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
          Cada método possui estequiometria, semirreações e comportamento potenciométrico específicos.
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
                key={estudo.id}
                type="button"
                role="tab"
                aria-selected={estaAtivo}
                className={[
                  "oxirreducaoStudyCard",
                  estaAtivo
                    ? "oxirreducaoStudyCardActive"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onChange(estudo.id)
                }
              >
                <span className="oxirreducaoStudyNumber">
                  {estudo.numero}
                </span>

                <span className="oxirreducaoStudyContent">
                  <span className="oxirreducaoStudyTitleRow">
                    <strong>{estudo.titulo}</strong>
                  </span>

                  <span className="oxirreducaoStudyDescription">
                    {estudo.descricao}
                  </span>

                  <span className="oxirreducaoStudyOrientation">
                    {estudo.orientacao}
                  </span>
                </span>

                <span className="oxirreducaoStudyAction">
                  {estaAtivo
                    ? "Selecionado"
                    : "Escolher método"}
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

