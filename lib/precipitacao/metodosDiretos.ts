export type AnalitoArgentometricoDireto =
  | "Cl-"
  | "Br-"
  | "I-";

export type MetodoArgentometricoDireto =
  | "mohr"
  | "fajans";

export type ConfiguracaoMetodoDireto = {
  id: MetodoArgentometricoDireto;
  nome: string;
  indicador: string;
  principio: string;
  observacao: string;
};

export type ConfiguracaoAnalitoDireto = {
  id: AnalitoArgentometricoDireto;
  nome: string;
  formulaExibicao: string;
  salId: "AgCl" | "AgBr" | "AgI";
  precipitado: string;
  titulante: string;
  equacao: string;
  metodos: ConfiguracaoMetodoDireto[];
};

export const analitosArgentometricosDiretos:
  ConfiguracaoAnalitoDireto[] = [
    {
      id: "Cl-",
      nome: "Cloreto",
      formulaExibicao: "Cl⁻",
      salId: "AgCl",
      precipitado: "AgCl",
      titulante: "AgNO₃",
      equacao: "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)",
      metodos: [
        {
          id: "mohr",
          nome: "Método de Mohr",
          indicador: "Cromato",
          principio:
            "O ponto final é indicado pela formação de cromato de prata após a precipitação do cloreto.",
          observacao:
            "Aplicável à determinação direta de cloreto, com controle adequado das condições do meio.",
        },
        {
          id: "fajans",
          nome: "Método de Fajans",
          indicador: "Fluoresceína",
          principio:
            "O ponto final é detectado pela adsorção do indicador na superfície do precipitado.",
          observacao:
            "Para cloreto, utilizar fluoresceína como indicador de adsorção.",
        },
      ],
    },
    {
      id: "Br-",
      nome: "Brometo",
      formulaExibicao: "Br⁻",
      salId: "AgBr",
      precipitado: "AgBr",
      titulante: "AgNO₃",
      equacao: "Ag⁺(aq) + Br⁻(aq) → AgBr(s)",
      metodos: [
        {
          id: "mohr",
          nome: "Método de Mohr",
          indicador: "Cromato",
          principio:
            "O ponto final é indicado pelo aparecimento do precipitado indicador de cromato de prata.",
          observacao:
            "A aplicação ao brometo deve respeitar as condições experimentais adequadas do método.",
        },
        {
          id: "fajans",
          nome: "Método de Fajans",
          indicador: "Eosina",
          principio:
            "O ponto final é detectado pela adsorção da eosina na superfície do precipitado.",
          observacao:
            "Para brometo, utilizar eosina como indicador de adsorção.",
        },
      ],
    },
    {
      id: "I-",
      nome: "Iodeto",
      formulaExibicao: "I⁻",
      salId: "AgI",
      precipitado: "AgI",
      titulante: "AgNO₃",
      equacao: "Ag⁺(aq) + I⁻(aq) → AgI(s)",
      metodos: [
        {
          id: "fajans",
          nome: "Método de Fajans",
          indicador: "Eosina",
          principio:
            "O ponto final é detectado pela adsorção da eosina na superfície do iodeto de prata.",
          observacao:
            "Para iodeto, a opção direta disponível nesta configuração é Fajans com eosina.",
        },
      ],
    },
  ];

export function obterAnalitoDireto(
  id: AnalitoArgentometricoDireto
) {
  return (
    analitosArgentometricosDiretos.find(
      (analito) => analito.id === id
    ) ?? analitosArgentometricosDiretos[0]
  );
}