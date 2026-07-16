import { saisPrecipitacao } from "../data/precipitacao/sais";

import type {
  InterferenciaPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
  SalPrecipitacao,
} from "./tipos";

function obterIonTitulante(resultado: ResultadoTitulacaoDiretaPrecipitacao) {
  return resultado.especieTitulante === "cation"
    ? resultado.sal.cation
    : resultado.sal.anion;
}

function salUsaMesmoTitulante(
  sal: SalPrecipitacao,
  resultado: ResultadoTitulacaoDiretaPrecipitacao
) {
  const titulante = obterIonTitulante(resultado);

  return sal.cation.id === titulante.id || sal.anion.id === titulante.id;
}

function obterEspecieConcorrente(
  sal: SalPrecipitacao,
  resultado: ResultadoTitulacaoDiretaPrecipitacao
) {
  const titulante = obterIonTitulante(resultado);

  if (sal.cation.id === titulante.id) {
    return sal.anion;
  }

  return sal.cation;
}

export function avaliarInterferenciasPrecipitacao(
  resultado: ResultadoTitulacaoDiretaPrecipitacao | null
): InterferenciaPrecipitacao[] {
  if (!resultado || resultado.status === "dados_invalidos") {
    return [];
  }

  const salPrincipal = resultado.sal;

  return saisPrecipitacao
    .filter((sal) => sal.id !== salPrincipal.id)
    .filter((sal) => salUsaMesmoTitulante(sal, resultado))
    .map((sal) => {
      const razaoKps = sal.kps / salPrincipal.kps;

      let risco: InterferenciaPrecipitacao["risco"];
      let motivo: string;

      if (sal.kps < salPrincipal.kps) {
        risco = "alto";
        motivo =
          "O precipitado interferente possui Kps menor que o precipitado principal e pode começar a precipitar antes.";
      } else if (sal.kps <= salPrincipal.kps * 100) {
        risco = "moderado";
        motivo =
          "O Kps do interferente é próximo do Kps do precipitado principal, podendo causar sobreposição de precipitação.";
      } else {
        risco = "baixo";
        motivo =
          "O Kps do interferente é maior que o do precipitado principal, então a tendência de precipitar antes é menor.";
      }

      return {
        salInterferente: sal,
        especieConcorrente: obterEspecieConcorrente(sal, resultado),
        risco,
        motivo,
        razaoKps,
      };
    })
    .sort((a, b) => a.salInterferente.kps - b.salInterferente.kps);
}