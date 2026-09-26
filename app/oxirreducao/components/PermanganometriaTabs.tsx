export type AbaPermanganometria =
  | "visao-geral"
  | "semirreacoes"
  | "estequiometria"
  | "curva"
  | "derivadas"
  | "concentracao"
  | "tempo-real"
  | "erro-experimental";


type PermanganometriaTabsProps = {
  abaAtiva:
    AbaPermanganometria;

  onChange: (
    aba: AbaPermanganometria
  ) => void;
};


const abas: {
  id: AbaPermanganometria;
  titulo: string;
  disponivel: boolean;
}[] = [
  {
    id:
      "visao-geral",

    titulo:
      "Visão geral",

    disponivel:
      true,
  },

  {
    id:
      "semirreacoes",

    titulo:
      "Semirreações + E°",

    disponivel:
      true,
  },

  {
    id:
      "estequiometria",

    titulo:
      "Estequiometria",

    disponivel:
      true,
  },

  {
    id:
      "curva",

    titulo:
      "Curva E × V",

    disponivel:
      true,
  },

  {
    id:
      "derivadas",

    titulo:
      "Derivadas",

    disponivel:
      false,
  },

  {
    id:
      "concentracao",

    titulo:
      "Efeito da concentração",

    disponivel:
      false,
  },

  {
    id:
      "tempo-real",

    titulo:
      "Tempo real",

    disponivel:
      false,
  },

  {
    id:
      "erro-experimental",

    titulo:
      "Erro experimental",

    disponivel:
      false,
  },
];


export default function PermanganometriaTabs({
  abaAtiva,
  onChange,
}: PermanganometriaTabsProps) {
  return (
    <nav
      className="oxirreducaoInternalTabs"
      aria-label="Seções da permanganometria"
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
                key={
                  aba.id
                }
                type="button"
                role="tab"
                aria-selected={
                  ativa
                }
                disabled={
                  !aba.disponivel
                }
                className={[
                  "oxirreducaoInternalTab",

                  ativa
                    ? "oxirreducaoInternalTabActive"
                    : "",

                  !aba.disponivel
                    ? "oxirreducaoInternalTabDisabled"
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
                    aba.disponivel
                  ) {
                    onChange(
                      aba.id
                    );
                  }
                }}
              >
                <span>
                  {
                    aba.titulo
                  }
                </span>

                {!aba.disponivel && (
                  <small>
                    Em breve
                  </small>
                )}
              </button>
            );
          }
        )}
      </div>
    </nav>
  );
}