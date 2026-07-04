export type ConfigEdta = {
  parametro: string;
  valor: string | number;
  descricao: string;
};

export const configEdta: ConfigEdta[] = [
  {
    parametro: "LIMITE_KF_QUANTITATIVO",
    valor: 1e8,
    descricao:
      "Valor mínimo de Kf' para considerar complexação quantitativa",
  },
  {
    parametro: "LIMITE_KF_PARCIAL",
    valor: 1e6,
    descricao:
      "Valor mínimo de Kf' para considerar complexação parcial",
  },
  {
    parametro: "ESTEQUIOMETRIA_PADRAO",
    valor: "1:1",
    descricao:
      "EDTA geralmente reage com metais na proporção 1 para 1",
  },
  {
    parametro: "FORMA_EDTA_REATIVA",
    valor: "Y4-",
    descricao:
      "Forma do EDTA considerada diretamente complexante",
  },
  {
    parametro: "FORMULA_KF_CONDICIONAL",
    valor: "Kf' = Kf * alpha_Y4",
    descricao:
      "Constante efetiva considerando o pH",
  },
  {
    parametro: "FORMULA_PE",
    valor: "V_PE = (C_metal * V_amostra) / C_EDTA",
    descricao:
      "Volume de equivalência para titulação 1:1",
  },
  {
    parametro: "FORMULA_PM",
    valor: "pM = -log[M_livre]",
    descricao:
      "Grandeza principal da curva complexométrica",
  },
];

export const configEdtaValores = {
  limiteKfQuantitativo: 1e8,
  limiteKfParcial: 1e6,
  estequiometriaPadrao: "1:1",
  formaEdtaReativa: "Y4-",
  formulaKfCondicional: "Kf' = Kf * alpha_Y4",
  formulaPe: "V_PE = (C_metal * V_amostra) / C_EDTA",
  formulaPm: "pM = -log[M_livre]",
};

export function buscarConfigEdta(parametro: string): ConfigEdta | undefined {
  return configEdta.find(
    (item) => item.parametro.toUpperCase() === parametro.toUpperCase()
  );
}