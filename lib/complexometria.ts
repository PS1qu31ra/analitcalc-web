import {
  metaisEdta,
  alphaEdtaPh,
  faixasPhEdta,
  indicadoresEdta,
  mascarantesEdta,
  betasComplexantes,
} from "./data";

import type {
  MetalEdta,
  BetaComplexante,
  IndicadorEdta,
  MascaranteEdta,
} from "./data";

export type PayloadEDTA = {
  metalPrincipal: string;
  pH: number;

  concMetal?: number;
  volAmostra?: number;
  concEDTA?: number;
  volBureta?: number;

  metalComplexado?: "sim" | "nao";
  complexanteAuxiliar?: string;
  concComplexanteAuxiliar?: number;

  interferentes?: string[];
};

export type StatusKfEDTA = {
  status: "Ruim" | "Parcial" | "Quantitativa";
  sinalizacao: string;
  mensagem: string;
};

export type FatorInterferencia = {
  status: string;
  descricao?: string;
  prioridade?: string;
  pontuacao: number;
};

export type InterferenciaEDTA = {
  id: string;
  metal: string;
  nome: string;
  complexo: string;
  kfPrincipal: number;
  kfInterferente: number;
  kfPrincipalCondicional: number;
  kfInterferenteCondicional: number;
  kfMaior: number;
  kfMenor: number;
  razaoKf: number;
  interferenteTemMaiorKf: boolean;
  metalMaiorKf: string;
  metalMenorKf: string;
  fatorOrdemReacao: FatorInterferencia;
  fatorSeparacao: FatorInterferencia;
  fatorPH: FatorInterferencia;
  risco: "Sem interferência" | "Baixo" | "Moderado" | "Significativo" | "Alto";
  problema: string;
  mascaranteRecomendado: string;
  acaoSistema: string;
};

export type ResultadoEquilibrioEDTA =
  | {
      calculado: false;
      mensagem: string;
    }
  | {
      calculado: true;
      CM: number;
      CY: number;
      MY: number;
      metalLivre: number;
      edtaLivre: number;
      percentualComplexado: number;
      pM: number | null;
    };

export function getDadosIniciaisEDTA() {
  return {
    metais: metaisEdta,
    alpha: alphaEdtaPh,
    indicadores: indicadoresEdta,
    mascarantes: mascarantesEdta,
    betasComplexantes,
    faixasPH: faixasPhEdta,
  };
}

export function avaliarSistemaEDTA(payload: PayloadEDTA) {
  const dados = getDadosIniciaisEDTA();

  const metalPrincipal = dados.metais.find(
    (item) => normalizar(item.idMetal) === normalizar(payload.metalPrincipal)
  );

  if (!metalPrincipal) {
    throw new Error("Metal principal não encontrado na base BD_METAIS_EDTA.");
  }

  const pH = numero(payload.pH);

  if (pH === null) {
    throw new Error("Informe um pH válido.");
  }

  const alphaLinha = dados.alpha.find(
    (item) => Math.abs(numero(item.ph)! - pH) < 0.0001
  );

  if (!alphaLinha) {
    throw new Error("pH não encontrado na base BD_ALPHA_EDTA_pH.");
  }

  const alphaY4 = alphaLinha.alphaY4;
  const kf = metalPrincipal.kf;
  const logKf = metalPrincipal.logKf;

  const kfCondicional = kf * alphaY4;
  const logKfCondicional = Math.log10(kfCondicional);

  const dadosMetalComplexado = calcularCorrecaoMetalComplexado(
    payload,
    metalPrincipal,
    kfCondicional
  );

  const kfEfetivo = dadosMetalComplexado.kfEfetivo;
  const logKfEfetivo = Math.log10(kfEfetivo);

  const status = classificarKfCondicional(kfEfetivo);

  const avaliacaoPH = avaliarFaixaPHEdta(
    metalPrincipal,
    pH,
    kfEfetivo
  );

  const interferentes = montarInterferentesEDTA(
    payload.interferentes || [],
    metalPrincipal,
    alphaY4,
    pH
  );

  const indicadorRecomendado = recomendarIndicadorEDTA(
    metalPrincipal,
    pH
  );

  const mascaranteRecomendado = recomendarMascaranteEDTA(
    interferentes,
    pH
  );

  const volumePE = calcularVolumeEquivalenciaEDTA(payload);

  const equilibrio = calcularEquilibrioEDTA(payload, kfEfetivo);

  return {
    entradas: payload,

    metalPrincipal: {
      id: metalPrincipal.idMetal,
      metal: metalPrincipal.metal,
      nome: metalPrincipal.nome,
      carga: metalPrincipal.carga,
      classe: metalPrincipal.classe,
      numeroCoordenacao: metalPrincipal.numeroCoordenacao,
      complexo: metalPrincipal.complexoFormado,
      reacaoGlobal: metalPrincipal.reacaoGlobal,

      logKf,
      kf,
      alpha: alphaY4,

      kfCondicional,
      logKfCondicional,

      metalComplexado: dadosMetalComplexado.metalComplexado,
      complexanteAuxiliar: dadosMetalComplexado.complexanteAuxiliar,
      concComplexanteAuxiliar: dadosMetalComplexado.concComplexanteAuxiliar,
      betas: dadosMetalComplexado.betas,
      alfaMetalLivre: dadosMetalComplexado.alfaMetalLivre,
      denominadorComplexacaoMetal:
        dadosMetalComplexado.denominadorComplexacaoMetal,

      kfEfetivo,
      logKfEfetivo,

      status: status.status,
      sinalizacao: status.sinalizacao,
      mensagem: status.mensagem,

      avaliacaoPH,
      observacao: metalPrincipal.observacao,
    },

    volumePE,
    equilibrio,
    indicadorRecomendado,
    mascaranteRecomendado,
    interferentes,

    resumo: montarResumoEDTA(
      metalPrincipal,
      pH,
      alphaY4,
      kfEfetivo,
      status,
      interferentes
    ),
  };
}

function calcularCorrecaoMetalComplexado(
  payload: PayloadEDTA,
  metalPrincipal: MetalEdta,
  kfCondicional: number
) {
  const metalComplexado = String(payload.metalComplexado || "nao") === "sim";

  if (!metalComplexado) {
    return {
      metalComplexado: false,
      complexanteAuxiliar: null as string | null,
      concComplexanteAuxiliar: null as number | null,
      betas: [] as { ordem: number; beta: number }[],
      denominadorComplexacaoMetal: 1,
      alfaMetalLivre: 1,
      kfEfetivo: kfCondicional,
    };
  }

  const idComplexante = payload.complexanteAuxiliar;
  const concL = numero(payload.concComplexanteAuxiliar);

  if (!idComplexante) {
    throw new Error("Selecione o complexante auxiliar.");
  }

  if (!concL || concL <= 0) {
    throw new Error("Informe a concentração do complexante auxiliar.");
  }

  const linhaBeta = betasComplexantes.find(
    (item) =>
      normalizar(item.idMetal) === normalizar(metalPrincipal.idMetal) &&
      normalizar(item.idComplexante) === normalizar(idComplexante)
  );

  if (!linhaBeta) {
    throw new Error(
      "Não há constantes β cadastradas para esse metal e complexante."
    );
  }

  const betas = montarListaBetas(linhaBeta);

  let denominador = 1;

  betas.forEach((item) => {
    if (item.beta > 0) {
      denominador += item.beta * Math.pow(concL, item.ordem);
    }
  });

  const alfaMetalLivre = 1 / denominador;
  const kfEfetivo = kfCondicional * alfaMetalLivre;

  return {
    metalComplexado: true,
    complexanteAuxiliar: linhaBeta.complexante,
    concComplexanteAuxiliar: concL,
    betas,
    denominadorComplexacaoMetal: denominador,
    alfaMetalLivre,
    kfEfetivo,
  };
}

function avaliarFaixaPHEdta(
  metalPrincipal: MetalEdta,
  pH: number,
  kfEfetivo: number
) {
  const faixa = faixasPhEdta.find(
    (item) => normalizar(item.idMetal) === normalizar(metalPrincipal.idMetal)
  );

  if (!faixa) {
    return {
      encontrado: false,
      status: "Sem faixa cadastrada",
      mensagem: "Não há faixa de pH cadastrada para este metal.",
      pHInformado: pH,
    };
  }

  const pHMin = faixa.phMin;
  const pHIdeal = faixa.phIdeal;
  const pHMax = faixa.phMax;

  const dentroDaFaixa = pH >= pHMin && pH <= pHMax;
  const noIdeal = pH === pHIdeal;

  let status = "";
  let mensagem = "";

  if (noIdeal) {
    status = "pH ideal";
    mensagem = `O pH informado está no valor ideal cadastrado para ${metalPrincipal.metal}.`;
  } else if (dentroDaFaixa) {
    status = "pH aceitável";
    mensagem = `O pH informado está dentro da faixa recomendada para ${metalPrincipal.metal}.`;
  } else {
    status = "pH fora da faixa";
    mensagem = `O pH informado está fora da faixa recomendada para ${metalPrincipal.metal}. Sugestão: na ausênica de agente complexante auxiliar, usar pH próximo de ${pHIdeal}.`;
  }

  if (kfEfetivo < 1e8) {
    mensagem +=
      " Além disso, o Kf efetivo está abaixo do ideal para titulação quantitativa.";
  }

  return {
    encontrado: true,
    status,
    mensagem,
    pHInformado: pH,
    pHMin,
    pHIdeal,
    pHMax,
    tampaoRecomendado: faixa.tampaoRecomendado,
    observacao: faixa.observacao,
  };
}

function montarListaBetas(linhaBeta: BetaComplexante) {
  return [
    linhaBeta.beta1,
    linhaBeta.beta2,
    linhaBeta.beta3,
    linhaBeta.beta4,
    linhaBeta.beta5,
    linhaBeta.beta6,
  ].map((valor, index) => ({
    ordem: index + 1,
    beta: valor && valor > 0 ? valor : 0,
  }));
}

function montarInterferentesEDTA(
  idsInterferentes: string[],
  metalPrincipal: MetalEdta,
  alphaY4: number,
  pH: number
): InterferenciaEDTA[] {
  const kfPrincipal = metalPrincipal.kf;
  const kfPrincipalCondicional = kfPrincipal * alphaY4;

  return idsInterferentes
    .filter(
      (id) =>
        id && normalizar(id) !== normalizar(metalPrincipal.idMetal)
    )
    .map((id) => {
      const interferente = metaisEdta.find(
        (item) => normalizar(item.idMetal) === normalizar(id)
      );

      if (!interferente) return null;

      return avaliarInterferenciaTresFatores(
        metalPrincipal,
        interferente,
        alphaY4,
        pH,
        kfPrincipal,
        kfPrincipalCondicional
      );
    })
    .filter((item): item is InterferenciaEDTA => item !== null);
}

function avaliarInterferenciaTresFatores(
  metalPrincipal: MetalEdta,
  interferente: MetalEdta,
  alphaY4: number,
  pH: number,
  kfPrincipal: number,
  kfPrincipalCondicional: number
): InterferenciaEDTA {
  const kfInterferente = interferente.kf;
  const kfInterferenteCondicional = kfInterferente * alphaY4;

  const kfMaior = Math.max(kfPrincipal, kfInterferente);
  const kfMenor = Math.min(kfPrincipal, kfInterferente);
  const razaoKf = kfMaior / kfMenor;

  const interferenteTemMaiorKf = kfInterferente > kfPrincipal;

  const metalMaiorKf = interferenteTemMaiorKf
    ? interferente.metal
    : metalPrincipal.metal;

  const metalMenorKf = interferenteTemMaiorKf
    ? metalPrincipal.metal
    : interferente.metal;

  const fatorOrdemReacao = avaliarOrdemReacaoPorKf(
    kfPrincipal,
    kfInterferente
  );

  const fatorSeparacao = avaliarSeparacaoPorRazaoKf(razaoKf);
  const fatorPH = avaliarFatorPH(kfPrincipalCondicional);

  const risco = classificarRiscoTresFatores(
    fatorOrdemReacao,
    fatorSeparacao,
    fatorPH
  );

  return {
    id: interferente.idMetal,
    metal: interferente.metal,
    nome: interferente.nome,
    complexo: interferente.complexoFormado,

    kfPrincipal,
    kfInterferente,
    kfPrincipalCondicional,
    kfInterferenteCondicional,

    kfMaior,
    kfMenor,
    razaoKf,

    interferenteTemMaiorKf,
    metalMaiorKf,
    metalMenorKf,

    fatorOrdemReacao,
    fatorSeparacao,
    fatorPH,
    risco,

    problema: montarMensagemTresFatores(
      metalPrincipal,
      interferente,
      fatorOrdemReacao,
      fatorSeparacao,
      fatorPH,
      razaoKf
    ),

    mascaranteRecomendado:
  risco === "Alto" || risco === "Significativo"
    ? "Pode ser necessário usar mascarante."
    : "Mascarante geralmente não necessário.",

    acaoSistema: montarAcaoTresFatores(risco, fatorPH),
  };
}

function avaliarOrdemReacaoPorKf(
  kfPrincipal: number,
  kfInterferente: number
): FatorInterferencia {
  if (kfInterferente > kfPrincipal) {
    return {
      status: "Interferente favorecido",
      prioridade: "Interferente tende a reagir primeiro com EDTA.",
      pontuacao: 2,
    };
  }

  return {
    status: "Metal analisado favorecido",
    prioridade: "Metal analisado tende a reagir preferencialmente com EDTA.",
    pontuacao: 0,
  };
}

function avaliarSeparacaoPorRazaoKf(razaoKf: number): FatorInterferencia {
  if (razaoKf > 1e8) {
    return {
      status: "Sem interferência",
      descricao: "A diferença entre os Kf é maior que 10^8.",
      pontuacao: 0,
    };
  }

  if (razaoKf >= 1e7) {
    return {
      status: "BaixBaixo",
      descricao: "A diferença entre os Kf está próxima de 10^7.",
      pontuacao: 1,
    };
  }

  if (razaoKf >= 1e6) {
    return {
      status: "ModeradModerado",
      descricao: "A diferença entre os Kf está próxima de 10^6.",
      pontuacao: 2,
    };
  }

  if (razaoKf >= 1e5) {
    return {
      status: "SignificativSignificativo",
      descricao: "A diferença entre os Kf está próxima de 10^5.",
      pontuacao: 3,
    };
  }

  return {
    status: "AltAlto",
    descricao:
      "A separação entre os Kf é menor que 10^5 ou o interferente possui Kf maior.",
    pontuacao: 4,
  };
}

function avaliarFatorPH(kfPrincipalCondicional: number): FatorInterferencia {
  if (kfPrincipalCondicional >= 1e8) {
    return {
      status: "pH adequado",
      descricao:
        "O pH informado mantém Kf’ suficientemente alto para o metal analisado.",
      pontuacao: 0,
    };
  }

  if (kfPrincipalCondicional >= 1e6) {
    return {
      status: "pH parcialmente adequado",
      descricao:
        "O pH informado gera Kf’ intermediário; pode ser interessante ajustar o pH.",
      pontuacao: 1,
    };
  }

  return {
    status: "pH inadequado",
    descricao:
      "O pH informado deixa Kf’ baixo; recomenda-se ajustar o pH para favorecer Y4-.",
    pontuacao: 2,
  };
}

function classificarRiscoTresFatores(
  fatorOrdem: FatorInterferencia,
  fatorSeparacao: FatorInterferencia,
  fatorPH: FatorInterferencia
): InterferenciaEDTA["risco"] {
  const score =
    fatorOrdem.pontuacao +
    fatorSeparacao.pontuacao +
    fatorPH.pontuacao;

    if (score >= 6) return "Alto";
    if (score >= 4) return "Significativo";
    if (score >= 2) return "Moderado";
    if (score >= 1) return "Baixo";

  return "Sem interferência";
}

function montarMensagemTresFatores(
  metalPrincipal: MetalEdta,
  interferente: MetalEdta,
  fatorOrdem: FatorInterferencia,
  fatorSeparacao: FatorInterferencia,
  fatorPH: FatorInterferencia,
  razaoKf: number
) {
  const kfPrincipal = metalPrincipal.kf;
  const kfInterferente = interferente.kf;

  const metalMaiorKf =
    kfInterferente > kfPrincipal
      ? interferente.metal
      : metalPrincipal.metal;

  const metalMenorKf =
    kfInterferente > kfPrincipal
      ? metalPrincipal.metal
      : interferente.metal;

  return `${interferente.metal}: ${fatorOrdem.prioridade}
A separação entre os Kf é de ${formatarCientifico(razaoKf)} vezes.
Isso significa que ${metalMaiorKf} possui Kf maior que ${metalMenorKf}.
${fatorPH.descricao}`;
}

function montarAcaoTresFatores(
  risco: InterferenciaEDTA["risco"],
  fatorPH: FatorInterferencia
) {
  let texto = "";

  if (risco === "Alto") {
    texto =
      "Risco alto: avaliar mascaramento, separação prévia ou mudança de condição experimental.";
  } else if (risco === "Significativo") {
    texto =
      "Risco significativo: o interferente pode afetar a titulação.";
  } else if (risco === "Moderado") {
    texto =
      "Risco moderado: avaliar a concentração real do interferente.";
  } else if (risco === "Baixo") {
    texto =
      "Risco baixo: geralmente aceitável, mas deve ser observado.";
  }

  if (fatorPH.pontuacao > 0) {
    texto +=
      " Ajustar o pH pode melhorar a confiabilidade da titulação.";
  }

  return texto;
}

export function classificarKfCondicional(kf: number): StatusKfEDTA {
  if (kf < 1e6) {
    return {
      status: "Ruim",
      sinalizacao: "🔴",
      mensagem: "Complexação não favorecida nas condições informadas.",
    };
  }

  if (kf >= 1e6 && kf < 1e8) {
    return {
      status: "Parcial",
      sinalizacao: "🟡",
      mensagem:
        "Complexação parcial; a condição pode exigir cuidado experimental.",
    };
  }

  return {
    status: "Quantitativa",
    sinalizacao: "🟢",
    mensagem: "Complexação favorecida nas condições informadas.",
  };
}

export function calcularVolumeEquivalenciaEDTA(payload: PayloadEDTA) {
  const cMetal = numero(payload.concMetal);
  const vAmostra = numero(payload.volAmostra);
  const cEDTA = numero(payload.concEDTA);

  if (!cMetal || !vAmostra || !cEDTA) return null;

  return (cMetal * vAmostra) / cEDTA;
}

function montarResumoEDTA(
  metal: MetalEdta,
  pH: number,
  alpha: number,
  kf: number,
  status: StatusKfEDTA,
  interferentes: InterferenciaEDTA[]
) {
  const totalInterferentes = interferentes.length;

  const interferenciasAltas = interferentes.filter(
    (item) => item.risco === "Alto" || item.risco === "Significativo"
  ).length;

  return {
    texto: `No pH ${pH}, α(Y4-) = ${alpha}. Para ${metal.metal}, a constante efetiva calculada foi ${formatarCientifico(
      kf
    )}, classificada como ${status.status}. Foram avaliados ${totalInterferentes} interferente(s), com ${interferenciasAltas} interferência(s) relevante(s).`,
  };
}

function recomendarIndicadorEDTA(
  metal: MetalEdta,
  pH: number
): IndicadorEdta | null {
  const candidatos = indicadoresEdta
    .filter((ind) => {
      const metalOk = ind.metaisRecomendados.some(
        (m) => normalizar(m) === normalizar(metal.metal)
      );

      const phOk = pH >= ind.phMin && pH <= ind.phMax;

      return metalOk && phOk;
    })
    .sort((a, b) => b.prioridade - a.prioridade);

  return candidatos[0] || null;
}

function recomendarMascaranteEDTA(
  interferentes: InterferenciaEDTA[],
  pH: number
): MascaranteEdta | null {
  if (!interferentes || interferentes.length === 0) return null;

  const interferentesRelevantes = interferentes.filter(
    (item) => item.risco === "Alto" || item.risco === "Significativo"
  );

  if (!interferentesRelevantes.length) return null;

  for (const mascarante of mascarantesEdta) {
    if (mascarante.usoRestrito) {
      continue;
    }

    const cobrePH = pH >= mascarante.phMin && pH <= mascarante.phMax;

    if (!cobrePH) continue;

    const cobreAlgumInterferente = interferentesRelevantes.some(
      (interferente) =>
        mascarante.metaisMascarados.some(
          (metalMascarado) =>
            normalizar(metalMascarado) === normalizar(interferente.metal)
        )
    );

    if (cobreAlgumInterferente) return mascarante;
  }

  return null;
}

export function calcularEquilibrioEDTA(
  payload: PayloadEDTA,
  kfEfetivo: number
): ResultadoEquilibrioEDTA {
  const cMetal = numero(payload.concMetal);
  const cEDTA = numero(payload.concEDTA);

  if (
    cMetal === null ||
    cEDTA === null ||
    cMetal <= 0 ||
    cEDTA <= 0 ||
    !Number.isFinite(kfEfetivo) ||
    kfEfetivo <= 0
  ) {
    return {
      calculado: false,
      mensagem: "Dados insuficientes para calcular o equilíbrio.",
    };
  }

  const CM = cMetal;
  const CY = cEDTA;

  const limiteSuperior = Math.min(CM, CY);

  function f(my: number) {
    return kfEfetivo * (CM - my) * (CY - my) - my;
  }

  let baixo = 0;
  let alto = limiteSuperior * (1 - 1e-12);

  let fBaixo = f(baixo);
  let fAlto = f(alto);

  if (fBaixo * fAlto > 0) {
    return {
      calculado: false,
      mensagem: "Não foi possível encontrar raiz para [MY].",
    };
  }

  for (let i = 0; i < 200; i++) {
    const meio = (baixo + alto) / 2;
    const fMeio = f(meio);

    if (Math.abs(fMeio) < 1e-18) {
      baixo = meio;
      alto = meio;
      break;
    }

    if (fBaixo * fMeio < 0) {
      alto = meio;
      fAlto = fMeio;
    } else {
      baixo = meio;
      fBaixo = fMeio;
    }
  }

  const my = (baixo + alto) / 2;
  const metalLivre = CM - my;
  const edtaLivre = CY - my;
  const percentualComplexado = (my / CM) * 100;
  const pM = metalLivre > 0 ? -Math.log10(metalLivre) : null;

  return {
    calculado: true,
    CM,
    CY,
    MY: my,
    metalLivre,
    edtaLivre,
    percentualComplexado,
    pM,
  };
}

export function numero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;

  const convertido = Number(
    String(valor)
      .replace(",", ".")
      .replace(/\s/g, "")
  );

  return Number.isFinite(convertido) ? convertido : null;
}

export function normalizar(texto: unknown): string {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatarCientifico(valor: unknown): string {
  const convertido = Number(valor);

  if (!Number.isFinite(convertido) || Number.isNaN(convertido)) return "-";
  if (convertido === 0) return "0";

  return convertido.toExponential(2).replace(".", ",");
}

export function formatarDecimal(valor: unknown, casas = 4): string {
  const convertido = Number(valor);

  if (!Number.isFinite(convertido) || Number.isNaN(convertido)) return "-";

  return convertido.toFixed(casas).replace(".", ",");
}