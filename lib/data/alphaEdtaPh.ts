export type StatusAlphaEdta =
  | "Muito baixo"
  | "Baixo"
  | "Moderado"
  | "Bom"
  | "Muito bom"
  | "Excelente";

export type AlphaEdtaPh = {
  ph: number;
  h3o: number;
  alphaY4: number;
  statusEdta: StatusAlphaEdta;
  interpretacao: string;
};

export const alphaEdtaPh: AlphaEdtaPh[] = [
  {
    ph: 1,
    h3o: 1.0e-1,
    alphaY4: 7.52e-18,
    statusEdta: "Muito baixo",
    interpretacao: "EDTA quase totalmente protonado",
  },
  {
    ph: 2,
    h3o: 1.0e-2,
    alphaY4: 3.71e-14,
    statusEdta: "Muito baixo",
    interpretacao: "Forma Y4- praticamente inexistente",
  },
  {
    ph: 3,
    h3o: 1.0e-3,
    alphaY4: 2.51e-11,
    statusEdta: "Muito baixo",
    interpretacao: "Complexação depende de Kf muito alto",
  },
  {
    ph: 4,
    h3o: 1.0e-4,
    alphaY4: 3.61e-9,
    statusEdta: "Baixo",
    interpretacao: "Útil apenas para metais com Kf muito elevado",
  },
  {
    ph: 5,
    h3o: 1.0e-5,
    alphaY4: 3.54e-7,
    statusEdta: "Baixo",
    interpretacao: "Complexação limitada para metais fracos",
  },
  {
    ph: 6,
    h3o: 1.0e-6,
    alphaY4: 2.25e-5,
    statusEdta: "Moderado",
    interpretacao: "Alguns metais já complexam bem",
  },
  {
    ph: 7,
    h3o: 1.0e-7,
    alphaY4: 4.8e-4,
    statusEdta: "Moderado",
    interpretacao: "Complexação depende fortemente do metal",
  },
  {
    ph: 8,
    h3o: 1.0e-8,
    alphaY4: 5.39e-3,
    statusEdta: "Bom",
    interpretacao: "Aumenta a fração de Y4-",
  },
  {
    ph: 9,
    h3o: 1.0e-9,
    alphaY4: 5.21e-2,
    statusEdta: "Bom",
    interpretacao: "EDTA mais disponível para complexação",
  },
  {
    ph: 10,
    h3o: 1.0e-10,
    alphaY4: 0.35,
    statusEdta: "Muito bom",
    interpretacao: "Condição comum para Ca2+ e Mg2+",
  },
  {
    ph: 11,
    h3o: 1.0e-11,
    alphaY4: 0.85,
    statusEdta: "Excelente",
    interpretacao: "Alta disponibilidade de Y4-",
  },
  {
    ph: 12,
    h3o: 1.0e-12,
    alphaY4: 0.98,
    statusEdta: "Excelente",
    interpretacao: "EDTA praticamente como Y4-",
  },
  {
    ph: 13,
    h3o: 1.0e-13,
    alphaY4: 1,
    statusEdta: "Excelente",
    interpretacao: "Y4- predominante",
  },
  {
    ph: 14,
    h3o: 1.0e-14,
    alphaY4: 1,
    statusEdta: "Excelente",
    interpretacao: "Y4- predominante",
  },
];

export function buscarAlphaEdtaPorPh(ph: number): AlphaEdtaPh | undefined {
  return alphaEdtaPh.find((item) => item.ph === ph);
}

export function buscarAlphaEdtaMaisProximo(ph: number): AlphaEdtaPh {
  return alphaEdtaPh.reduce((maisProximo, item) => {
    const diferencaAtual = Math.abs(item.ph - ph);
    const diferencaMaisProximo = Math.abs(maisProximo.ph - ph);

    return diferencaAtual < diferencaMaisProximo ? item : maisProximo;
  });
}

export function obterAlphaY4PorPh(ph: number): number {
  const registroExato = buscarAlphaEdtaPorPh(ph);

  if (registroExato) {
    return registroExato.alphaY4;
  }

  return buscarAlphaEdtaMaisProximo(ph).alphaY4;
}

export function interpretarDisponibilidadeEdta(ph: number) {
  const registro = buscarAlphaEdtaPorPh(ph) ?? buscarAlphaEdtaMaisProximo(ph);

  return {
    phConsultado: ph,
    phUsadoNaBase: registro.ph,
    alphaY4: registro.alphaY4,
    statusEdta: registro.statusEdta,
    interpretacao: registro.interpretacao,
    mensagem:
      ph === registro.ph
        ? `No pH ${ph}, o αY4- é ${registro.alphaY4}. Status: ${registro.statusEdta}.`
        : `O pH ${ph} não está cadastrado diretamente. Foi usado o pH mais próximo da base: ${registro.ph}. αY4- = ${registro.alphaY4}. Status: ${registro.statusEdta}.`,
  };
}