export type StatusValidacaoEdta = "Ruim" | "Parcial" | "Quantitativa";

export type RegraValidacaoEdta = {
  idRegra: string;
  limiteInferior: number;
  limiteSuperior: number;
  status: StatusValidacaoEdta;
  sinalizacao: string;
  mensagemSistema: string;
};

export const regrasValidacaoEdta: RegraValidacaoEdta[] = [
  {
    idRegra: "REGRA_RUIM",
    limiteInferior: 0,
    limiteSuperior: 1e6,
    status: "Ruim",
    sinalizacao: "🔴",
    mensagemSistema: "Complexação não favorecida no pH informado",
  },
  {
    idRegra: "REGRA_PARCIAL",
    limiteInferior: 1e6,
    limiteSuperior: 1e8,
    status: "Parcial",
    sinalizacao: "🟡",
    mensagemSistema: "Complexação parcial; o pH pode não ser adequado",
  },
  {
    idRegra: "REGRA_QUANT",
    limiteInferior: 1e8,
    limiteSuperior: 1e99,
    status: "Quantitativa",
    sinalizacao: "🟢",
    mensagemSistema: "Complexação favorecida no pH informado",
  },
];

export function validarComplexacaoEdta(kfCondicional: number) {
  const regra = regrasValidacaoEdta.find(
    (item) =>
      kfCondicional >= item.limiteInferior &&
      kfCondicional < item.limiteSuperior
  );

  if (!regra) {
    return {
      idRegra: "REGRA_INDEFINIDA",
      status: "Ruim" as StatusValidacaoEdta,
      sinalizacao: "🔴",
      mensagemSistema:
        "Não foi possível classificar a complexação com o valor informado.",
    };
  }

  return regra;
}