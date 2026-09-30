import type {
  SistemaPermanganometriaId,
} from "@/lib/oxirreducao/sistemasPermanganometria";


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

  sistemaAtivo:
    SistemaPermanganometriaId;

  onChange: (
    aba: AbaPermanganometria
  ) => void;
};


const abas: {
  id: AbaPermanganometria;
  titulo: string;
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


function abaDisponivel({
  aba,
  sistemaAtivo,
}: {
  aba:
    AbaPermanganometria;

  sistemaAtivo:
    SistemaPermanganometriaId;
}) {
  if (
    aba ===
      "visao-geral" ||
    aba ===
      "estequiometria"
  ) {
    return true;
  }


  if (
    sistemaAtivo ===
    "oxalato"
  ) {
    return false;
  }


  if (
    aba ===
      "semirreacoes" ||
    aba ===
      "curva"
  ) {
    return true;
  }


  /*
 * Fe²⁺ e H₂O₂ já utilizam
 * o motor de equilíbrio contínuo
 * e podem ter o PF determinado
 * pelas derivadas da curva E × V.
 */
if (
  aba ===
    "derivadas"
) {
  return (
    sistemaAtivo ===
      "ferro-ii" ||
    sistemaAtivo ===
      "peroxido-hidrogenio"
  );
}
  
  
if (
  aba ===
    "concentracao"
) {
  return (
    sistemaAtivo ===
      "ferro-ii" ||
    sistemaAtivo ===
      "peroxido-hidrogenio"
  );
}
  
  
if (
  aba ===
    "tempo-real"
) {
  return (
    sistemaAtivo ===
      "ferro-ii" ||
    sistemaAtivo ===
      "peroxido-hidrogenio"
  );
}
  
  
if (
  aba ===
    "erro-experimental"
) {
  return (
    sistemaAtivo ===
      "ferro-ii" ||
    sistemaAtivo ===
      "peroxido-hidrogenio"
  );
}
  
  
  return false;
}


export default function PermanganometriaTabs({
  abaAtiva,
  sistemaAtivo,
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


            const disponivel =
              abaDisponivel({
                aba:
                  aba.id,

                sistemaAtivo,
              });


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
                  !disponivel
                }
                className={[
                  "oxirreducaoInternalTab",

                  ativa
                    ? "oxirreducaoInternalTabActive"
                    : "",

                  !disponivel
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
                    disponivel
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

                {!disponivel && (
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