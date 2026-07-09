import { acidosPoliproticosKa } from "./data/acidoBasePoliproticosKa";
import { basesPolibasicasKb } from "./data/acidoBasePolibasicosKb";
import { reacoesAcidoBasePoliproticas } from "./data/reacoesAcidoBasePoliproticos";

export type TipoSistemaPoliprotico = "acido-com-base-forte" | "base-com-acido-forte";

export type EntradaSistemaPoliprotico = {
  titulante: string;
  titulado: string;
  concTitulante: number;
  concTitulado: number;
  volTitulado: number;
  volBureta: number;
};

export type ConstantePoliprotica = {
  etapa: number;
  constante: number;
  pValor: number;
};

export type ResultadoSistemaPoliprotico = {
  entradas: EntradaSistemaPoliprotico;
  tipoSistema: TipoSistemaPoliprotico;
  titulante: {
    nome: string;
    formula: string;
    tipo: string;
  };
  titulado: {
    id: string;
    nome: string;
    formula: string;
    tipo: string;
    classe: "ácido" | "base";
    especies: string[];
    cargaInicial: number;
  };
  constantes: ConstantePoliprotica[];
  numeroEquivalencias: number;
  volumePE1: number;
  volumesPE: number[];
  reacao: {
    equacaoGlobal: string;
    reacoesEtapas: string[];
    produtoFinal: string;
    observacao: string;
  };
  resumo: string;
};

export type PontoCurvaAcidoBase = {
  volume: number;
  ph: number | null;
  regiao: string;
  explicacao: string;
};

export type CurvaAcidoBasePoliprotica = {
  pontos: PontoCurvaAcidoBase[];
  volumesPE: number[];
  volumeMaximo: number;
  passo: number;
};

function normalizarTexto(valor: string) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function numeroValido(valor: number) {
  return Number.isFinite(valor) && valor > 0;
}

export function formatarNumeroBR(valor: number | null | undefined, casas = 2) {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return "-";
  }

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function avaliarSistemaPoliprotico(
  entrada: EntradaSistemaPoliprotico
): ResultadoSistemaPoliprotico {
  const titulanteNormalizado = normalizarTexto(entrada.titulante);
  const tituladoNormalizado = normalizarTexto(entrada.titulado);

  const titulanteEhAcido =
    titulanteNormalizado.includes("hcl") ||
    titulanteNormalizado.includes("acido");

  const titulanteEhBase =
    titulanteNormalizado.includes("naoh") ||
    titulanteNormalizado.includes("base");

  if (!titulanteEhAcido && !titulanteEhBase) {
    throw new Error("Titulante não reconhecido. Use HCl ou NaOH.");
  }

  if (
    !numeroValido(entrada.concTitulante) ||
    !numeroValido(entrada.concTitulado) ||
    !numeroValido(entrada.volTitulado)
  ) {
    throw new Error("Informe concentração do titulante, concentração do titulado e volume do titulado.");
  }

  if (titulanteEhBase) {
    const acido = acidosPoliproticosKa.find(
      (item) => normalizarTexto(item.nome) === tituladoNormalizado
    );

    if (!acido) {
      throw new Error("Titulado ácido não encontrado na tabela Ka.");
    }

    const volumePE1 =
      (entrada.concTitulado * entrada.volTitulado) / entrada.concTitulante;

    const volumesPE = Array.from(
      { length: acido.numeroProtonsIonizaveis },
      (_, index) => volumePE1 * (index + 1)
    );

    const reacao = reacoesAcidoBasePoliproticas.find(
      (item) =>
        normalizarTexto(item.titulante) === "naoh" &&
        normalizarTexto(item.titulado) === normalizarTexto(acido.nome)
    );

    return {
      entradas: entrada,
      tipoSistema: "acido-com-base-forte",
      titulante: {
        nome: "NaOH",
        formula: "NaOH",
        tipo: "Base forte",
      },
      titulado: {
        id: acido.id,
        nome: acido.nome,
        formula: acido.formula,
        tipo: acido.tipo,
        classe: "ácido",
        especies: acido.especies,
        cargaInicial: acido.cargaInicial,
      },
      constantes: acido.kas.map((ka, index) => ({
        etapa: index + 1,
        constante: ka,
        pValor: acido.pkas[index],
      })),
      numeroEquivalencias: acido.numeroProtonsIonizaveis,
      volumePE1,
      volumesPE,
      reacao: {
        equacaoGlobal: reacao?.equacaoGlobal ?? "-",
        reacoesEtapas: reacao?.reacoesEtapas ?? [],
        produtoFinal: reacao?.produtoFinal ?? acido.especies[acido.especies.length - 1],
        observacao: reacao?.observacao ?? "Neutralização por base forte",
      },
      resumo: `${acido.nome} titulado com NaOH. O sistema apresenta ${acido.numeroProtonsIonizaveis} ponto(s) de equivalência.`,
    };
  }

  const base = basesPolibasicasKb.find(
    (item) => normalizarTexto(item.nome) === tituladoNormalizado
  );

  if (!base) {
    throw new Error("Titulado básico não encontrado na tabela Kb.");
  }

  const volumePE1 =
    (entrada.concTitulado * entrada.volTitulado) / entrada.concTitulante;

  const volumesPE = Array.from(
    { length: base.numeroSitiosBasicos },
    (_, index) => volumePE1 * (index + 1)
  );

  const reacao = reacoesAcidoBasePoliproticas.find(
    (item) =>
      normalizarTexto(item.titulante) === "hcl" &&
      normalizarTexto(item.titulado) === normalizarTexto(base.nome)
  );

  return {
    entradas: entrada,
    tipoSistema: "base-com-acido-forte",
    titulante: {
      nome: "HCl",
      formula: "HCl",
      tipo: "Ácido forte",
    },
    titulado: {
      id: base.id,
      nome: base.nome,
      formula: base.formula,
      tipo: base.tipo,
      classe: "base",
      especies: base.especies,
      cargaInicial: base.cargaInicial,
    },
    constantes: base.kbs.map((kb, index) => ({
      etapa: index + 1,
      constante: kb,
      pValor: base.pkbs[index],
    })),
    numeroEquivalencias: base.numeroSitiosBasicos,
    volumePE1,
    volumesPE,
    reacao: {
      equacaoGlobal: reacao?.equacaoGlobal ?? "-",
      reacoesEtapas: reacao?.reacoesEtapas ?? [],
      produtoFinal: reacao?.produtoFinal ?? base.especies[base.especies.length - 1],
      observacao: reacao?.observacao ?? "Protonação por ácido forte",
    },
    resumo: `${base.nome} titulado com HCl. O sistema apresenta ${base.numeroSitiosBasicos} ponto(s) de equivalência.`,
  };
}

export function calcularPhPorVolumePoliprotico(
  resultado: ResultadoSistemaPoliprotico,
  volume: number
): PontoCurvaAcidoBase {
  const cTitulado = resultado.entradas.concTitulado;
  const vTituladoMl = resultado.entradas.volTitulado;
  const cTitulante = resultado.entradas.concTitulante;

  const vTotalL = (vTituladoMl + volume) / 1000;
  const nInicial = cTitulado * (vTituladoMl / 1000);
  const nTit = cTitulante * (volume / 1000);

  const nEq = resultado.numeroEquivalencias;

  const constantes = resultado.constantes.map((item) => item.constante);

  if (
    !numeroValido(cTitulado) ||
    !numeroValido(vTituladoMl) ||
    !numeroValido(cTitulante) ||
    !numeroValido(vTotalL) ||
    constantes.length === 0
  ) {
    return {
      volume,
      ph: null,
      regiao: "Não calculado",
      explicacao: "Dados insuficientes para calcular o pH.",
    };
  }

  const toleranciaPE = cTitulante * (0.001 / 1000);

  const peMol = Array.from({ length: nEq }, (_, index) => (index + 1) * nInicial);

  if (resultado.tipoSistema === "acido-com-base-forte") {
    return calcularPhAcidoPorBaseForteExato({
      kas: constantes,
      nInicial,
      nTit,
      vTotalL,
      nEq,
      peMol,
      toleranciaPE,
      volume,
    });
  }

  return calcularPhBasePorAcidoForteExato({
    kbs: constantes,
    nInicial,
    nTit,
    vTotalL,
    nEq,
    peMol,
    toleranciaPE,
    volume,
  });
}

function calcularPhAcidoPorBaseForteExato(params: {
  kas: number[];
  nInicial: number;
  nTit: number;
  vTotalL: number;
  nEq: number;
  peMol: number[];
  toleranciaPE: number;
  volume: number;
}): PontoCurvaAcidoBase {
  const { kas, nInicial, nTit, vTotalL, nEq, peMol, toleranciaPE, volume } =
    params;

  const kw = 1e-14;
  const ct = nInicial / vTotalL;
  const na = nTit / vTotalL;

  function cargaNegativaAcido(h: number) {
    const n = kas.length;

    let denominador = h ** n;

    for (let i = 1; i <= n; i++) {
      let produtoKa = 1;

      for (let j = 0; j < i; j++) {
        produtoKa *= kas[j];
      }

      denominador += produtoKa * h ** (n - i);
    }

    let cargaMedia = 0;

    for (let i = 1; i <= n; i++) {
      let produtoKa = 1;

      for (let j = 0; j < i; j++) {
        produtoKa *= kas[j];
      }

      const numerador = produtoKa * h ** (n - i);
      const alfa = numerador / denominador;

      cargaMedia += i * alfa;
    }

    return ct * cargaMedia;
  }

  function funcao(ph: number) {
    const h = 10 ** -ph;
    const oh = kw / h;

    return h + na - (oh + cargaNegativaAcido(h));
  }

  const ph = resolverBissecaoPH(funcao);

  return {
    volume,
    ph: limitarPh(ph),
    regiao: identificarRegiaoPorMol(nTit, peMol, nEq, toleranciaPE),
    explicacao:
      "pH calculado por balanço de massa e balanço de carga para ácido poliprótico titulado por base forte.",
  };
}

function calcularPhBasePorAcidoForteExato(params: {
  kbs: number[];
  nInicial: number;
  nTit: number;
  vTotalL: number;
  nEq: number;
  peMol: number[];
  toleranciaPE: number;
  volume: number;
}): PontoCurvaAcidoBase {
  const { kbs, nInicial, nTit, vTotalL, nEq, peMol, toleranciaPE, volume } =
    params;

  const kw = 1e-14;
  const ct = nInicial / vTotalL;
  const cl = nTit / vTotalL;

  const kasConjugados = kbs.map((kb) => kw / kb).reverse();

  function cargaPositivaBase(h: number) {
    const n = kasConjugados.length;

    let denominador = h ** n;

    for (let i = 1; i <= n; i++) {
      let produtoKa = 1;

      for (let j = 0; j < i; j++) {
        produtoKa *= kasConjugados[j];
      }

      denominador += produtoKa * h ** (n - i);
    }

    let cargaMediaNegativa = 0;

    for (let i = 1; i <= n; i++) {
      let produtoKa = 1;

      for (let j = 0; j < i; j++) {
        produtoKa *= kasConjugados[j];
      }

      const numerador = produtoKa * h ** (n - i);
      const alfa = numerador / denominador;

      cargaMediaNegativa += i * alfa;
    }

    const cargaPositivaMedia = n - cargaMediaNegativa;

    return ct * cargaPositivaMedia;
  }

  function funcao(ph: number) {
    const h = 10 ** -ph;
    const oh = kw / h;

    return h + cargaPositivaBase(h) - (oh + cl);
  }

  const ph = resolverBissecaoPH(funcao);

  return {
    volume,
    ph: limitarPh(ph),
    regiao: identificarRegiaoPorMol(nTit, peMol, nEq, toleranciaPE),
    explicacao:
      "pH calculado por balanço de massa e balanço de carga para base polibásica titulada por ácido forte.",
  };
}

function resolverBissecaoPH(funcao: (ph: number) => number) {
  let baixo = 0;
  let alto = 14;

  let fBaixo = funcao(baixo);
  const fAlto = funcao(alto);

  if (!Number.isFinite(fBaixo) || !Number.isFinite(fAlto)) {
    return null;
  }

  if (fBaixo * fAlto > 0) {
    return null;
  }

  for (let i = 0; i < 100; i++) {
    const meio = (baixo + alto) / 2;
    const fMeio = funcao(meio);

    if (!Number.isFinite(fMeio)) {
      return null;
    }

    if (Math.abs(fMeio) < 1e-14) {
      return meio;
    }

    if (fBaixo * fMeio < 0) {
      alto = meio;
    } else {
      baixo = meio;
      fBaixo = fMeio;
    }
  }

  return (baixo + alto) / 2;
}

function identificarRegiaoPorMol(
  nTit: number,
  peMol: number[],
  nEq: number,
  toleranciaPE: number
) {
  if (nTit < peMol[0] - toleranciaPE) {
    return "Antes do PE1";
  }

  if (Math.abs(nTit - peMol[0]) <= toleranciaPE) {
    return "PE1";
  }

  for (let i = 2; i <= nEq; i++) {
    const peAnterior = peMol[i - 2];
    const peAtual = peMol[i - 1];

    if (nTit > peAnterior + toleranciaPE && nTit < peAtual - toleranciaPE) {
      return `Entre PE${i - 1} e PE${i}`;
    }

    if (Math.abs(nTit - peAtual) <= toleranciaPE) {
      return `PE${i}`;
    }
  }

  return `Após PE${nEq}`;
}

function limitarPh(ph: number | null) {
  if (ph === null || ph === undefined || !Number.isFinite(ph)) {
    return null;
  }

  return Math.min(14, Math.max(0, ph));
}

export function gerarCurvaPoliprotica(
  resultado: ResultadoSistemaPoliprotico,
  opcoes?: {
    passo?: number;
    volumeMaximo?: number;
  }
): CurvaAcidoBasePoliprotica {
  const passo = opcoes?.passo ?? 0.25;

  const ultimoPE = resultado.volumesPE[resultado.volumesPE.length - 1] ?? 0;

  const volumeMaximo =
    opcoes?.volumeMaximo ??
    Math.max(resultado.entradas.volBureta || 50, ultimoPE + 10);

  const pontos: PontoCurvaAcidoBase[] = [];

  for (let volume = 0; volume <= volumeMaximo + 0.000001; volume += passo) {
    const volumeAtual = Number(volume.toFixed(2));
    const ponto = calcularPhPorVolumePoliprotico(resultado, volumeAtual);

    if (
      ponto.ph !== null &&
      Number.isFinite(ponto.ph) &&
      ponto.ph >= 0 &&
      ponto.ph <= 14
    ) {
      pontos.push({
        ...ponto,
        ph: Number(ponto.ph.toFixed(4)),
      });
    }
  }

  return {
    pontos,
    volumesPE: resultado.volumesPE,
    volumeMaximo,
    passo,
  };
}