export type AbaIodometria =
  | "visao-geral"
  | "semirreacoes"
  | "estequiometria"
  | "curva"
  | "derivadas"
  | "concentracao"
  | "tempo-real"
  | "erro-experimental";


type IodometriaTabsProps = {
  abaAtiva:
    AbaIodometria;

  onChange: (
    aba:
      AbaIodometria
  ) => void;
};


const abas: {
  id:
    AbaIodometria;

  titulo:
    string;
}[] = [
  {
    id:
      "visao-geral",

    titulo:
      "Visão geral",
  },
  {
    id:
      "semirreacoes",

    titulo:
      "Semirreações + E°",
  },
  {
    id:
      "estequiometria",

    titulo:
      "Estequiometria",
  },
  {
    id:
      "curva",

    titulo:
      "Curva E × V",
  },
  {
    id:
      "derivadas",

    titulo:
      "Derivadas",
  },
  {
    id:
      "concentracao",

    titulo:
      "Efeito da concentração",
  },
  {
    id:
      "tempo-real",

    titulo:
      "Tempo real",
  },
  {
    id:
      "erro-experimental",

    titulo:
      "Erro experimental",
  },
];


export default function IodometriaTabs({
  abaAtiva,
  onChange,
}: IodometriaTabsProps) {
  return (
    <nav
      className="oxirreducaoInternalTabs"
      aria-label="Seções da iodometria"
    >
      <div
        className="oxirreducaoInternalTabsTrack"
        role="tablist"
      >
        {abas.map(
          (aba) => {
            const ativa =
              aba.id ===
              abaAtiva;

            return (
              <button
                key={aba.id}
                type="button"
                role="tab"
                aria-selected={
                  ativa
                }
                className={[
                  "oxirreducaoInternalTab",

                  ativa
                    ? "oxirreducaoInternalTabActive"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onChange(
                    aba.id
                  )
                }
              >
                <span>
                  {aba.titulo}
                </span>
              </button>
            );
          }
        )}
      </div>
    </nav>
  );
}

