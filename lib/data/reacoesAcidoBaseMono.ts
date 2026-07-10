export type ReacaoAcidoBaseMono = {
    id: number;
    titulanteExibicao: string;
    tituladoExibicao: string;
    formulaTitulante: string;
    formulaTitulado: string;
    chaveReacao: string;
    equacaoExibicao: string;
    ativo: boolean;
    obs: string;
  };
  
  type TabelaAcidoForte = {
    nome: string;
    formula: string;
    anion: string;
    obs: string;
  };
  
  type TabelaBaseMono = {
    nome: string;
    formula: string;
    conjugado: string;
    obs: string;
  };
  
  type TabelaBaseForte = {
    nome: string;
    formula: string;
    cation: string;
  };
  
  type TabelaAcidoMono = {
    nome: string;
    formula: string;
    sal: {
      K: string;
      Na: string;
    };
    obs: string;
  };
  
  function chaveReacao(formulaTitulante: string, formulaTitulado: string) {
    return `${formulaTitulante}|${formulaTitulado}`.toLowerCase();
  }

  export function formatarFormulaQuimicaMono(texto: string) {
    const subscritos: Record<string, string> = {
      "0": "₀",
      "1": "₁",
      "2": "₂",
      "3": "₃",
      "4": "₄",
      "5": "₅",
      "6": "₆",
      "7": "₇",
      "8": "₈",
      "9": "₉",
    };
  
    return texto.replace(/\d/g, (numero) => subscritos[numero] ?? numero);
  }
  
  const acidosFortesComoTitulantes: TabelaAcidoForte[] = [
    { nome: "Perclórico", formula: "HClO4", anion: "ClO4", obs: "Ácido forte" },
    { nome: "Hidroiodídrico", formula: "HI", anion: "I", obs: "Ácido forte" },
    { nome: "Hidrobromídrico", formula: "HBr", anion: "Br", obs: "Ácido forte" },
    { nome: "Clorídrico", formula: "HCl", anion: "Cl", obs: "Ácido forte" },
    { nome: "Nítrico", formula: "HNO3", anion: "NO3", obs: "Ácido forte" },
    { nome: "Clórico", formula: "HClO3", anion: "ClO3", obs: "Ácido forte" },
    {
      nome: "Trifluorometanossulfônico (trifílico)",
      formula: "CF3SO3H",
      anion: "CF3SO3",
      obs: "Ácido superforte",
    },
    {
      nome: "Metanossulfônico",
      formula: "CH3SO3H",
      anion: "CH3SO3",
      obs: "Ácido forte",
    },
    {
      nome: "p-Toluenossulfônico (p-TsOH)",
      formula: "CH3C6H4SO3H",
      anion: "CH3C6H4SO3",
      obs: "Ácido forte orgânico",
    },
  ];
  
  const basesMonoComoTituladas: TabelaBaseMono[] = [
    { nome: "Amônia", formula: "NH3", conjugado: "NH4", obs: "base fraca" },
    { nome: "Metilamina", formula: "CH3NH2", conjugado: "CH3NH3", obs: "amina" },
    { nome: "Etilamina", formula: "C2H5NH2", conjugado: "C2H5NH3", obs: "amina" },
    { nome: "Propilamina", formula: "C3H7NH2", conjugado: "C3H7NH3", obs: "amina" },
    { nome: "n-Butilamina", formula: "C4H5NH2", conjugado: "C4H5NH3", obs: "amina" },
    {
      nome: "sec-Butilamina",
      formula: "(CH3)2CHCH2NH2",
      conjugado: "(CH3)2CHCH2NH3",
      obs: "amina",
    },
    {
      nome: "tert-Butilamina",
      formula: "(CH3)3CNH2",
      conjugado: "(CH3)3CNH3",
      obs: "amina",
    },
    {
      nome: "Dimetilamina",
      formula: "(CH3)2NH",
      conjugado: "(CH3)2NH2",
      obs: "amina",
    },
    {
      nome: "Trimetilamina",
      formula: "(CH3)3N",
      conjugado: "(CH3)3NH",
      obs: "amina terciária",
    },
    {
      nome: "Anilina",
      formula: "C6H5NH2",
      conjugado: "C6H5NH3",
      obs: "amina aromática",
    },
    {
      nome: "Piridina",
      formula: "C5H5N",
      conjugado: "C5H5NH",
      obs: "base heterocíclica",
    },
    { nome: "Hidrazina", formula: "N2H4", conjugado: "N2H5", obs: "base fraca" },
    {
      nome: "Hidroxilamina",
      formula: "NH2OH",
      conjugado: "NH3OH",
      obs: "base fraca",
    },
    {
      nome: "Hidróxido de potássio",
      formula: "KOH",
      conjugado: "K",
      obs: "base forte",
    },
    {
      nome: "Hidróxido de sódio",
      formula: "NaOH",
      conjugado: "Na",
      obs: "base forte",
    },
  ];
  
  const basesFortesComoTitulantes: TabelaBaseForte[] = [
    { nome: "Hidróxido de potássio", formula: "KOH", cation: "K" },
    { nome: "Hidróxido de sódio", formula: "NaOH", cation: "Na" },
  ];
  
  const acidosMonoComoTitulados: TabelaAcidoMono[] = [
    { nome: "Ácido fluorídrico", formula: "HF", sal: { K: "KF", Na: "NaF" }, obs: "Ácido fraco" },
    { nome: "Ácido nitroso", formula: "HNO2", sal: { K: "KNO2", Na: "NaNO2" }, obs: "Ácido fraco" },
    { nome: "Ácido hipocloroso", formula: "HClO", sal: { K: "KClO", Na: "NaClO" }, obs: "Ácido fraco" },
    { nome: "Ácido cloroso", formula: "HClO2", sal: { K: "KClO2", Na: "NaClO2" }, obs: "Ácido fraco" },
    { nome: "Ácido hipobromoso", formula: "HBrO", sal: { K: "KBrO", Na: "NaBrO" }, obs: "Ácido fraco" },
    { nome: "Ácido hipoiodoso", formula: "HIO", sal: { K: "KIO", Na: "NaIO" }, obs: "Ácido fraco" },
    { nome: "Ácido cianídrico", formula: "HCN", sal: { K: "KCN", Na: "NaCN" }, obs: "Ácido fraco" },
    { nome: "Ácido tiociânico", formula: "HSCN", sal: { K: "KSCN", Na: "NaSCN" }, obs: "Ácido fraco" },
    { nome: "Ácido azotídrico (hidrazóico)", formula: "HN3", sal: { K: "KN3", Na: "NaN3" }, obs: "Ácido fraco" },
    { nome: "Ácido fórmico", formula: "HCO2H", sal: { K: "KHCO2", Na: "NaHCO2" }, obs: "Ácido fraco" },
    { nome: "Ácido acético", formula: "CH3COOH", sal: { K: "KCH3COO", Na: "NaCH3COO" }, obs: "Ácido fraco" },
    { nome: "Ácido propanoico", formula: "C2H5COOH", sal: { K: "KC2H5COO", Na: "NaC2H5COO" }, obs: "Ácido fraco" },
    { nome: "Ácido butanoico", formula: "C3H7COOH", sal: { K: "KC3H7COO", Na: "NaC3H7COO" }, obs: "Ácido fraco" },
    { nome: "Ácido benzoico", formula: "C6H5COOH", sal: { K: "KC6H5COO", Na: "NaC6H5COO" }, obs: "Ácido fraco" },
    { nome: "Ácido monocloroacético", formula: "CH2ClCOOH", sal: { K: "KCH2ClCOO", Na: "NaCH2ClCOO" }, obs: "Ácido fraco" },
    { nome: "Ácido dicloroacético", formula: "CHCl2COOH", sal: { K: "KCHCl2COO", Na: "NaCHCl2COO" }, obs: "Ácido fraco" },
    { nome: "Ácido tricloroacético", formula: "CCl3COOH", sal: { K: "KCCl3COO", Na: "NaCCl3COO" }, obs: "Ácido forte" },
    { nome: "Ácido láctico", formula: "C3H6O3", sal: { K: "KC3H5O3", Na: "NaC3H5O3" }, obs: "Ácido fraco" },
    { nome: "Fenol", formula: "C6H5OH", sal: { K: "KC6H5O", Na: "NaC6H5O" }, obs: "Ácido muito fraco" },
    { nome: "p-Nitrofenol", formula: "O2NC6H4OH", sal: { K: "KO2NC6H4O", Na: "NaO2NC6H4O" }, obs: "Ácido fraco" },
    { nome: "2,4-Dinitrofenol", formula: "(O2N)2C6H3OH", sal: { K: "K(O2N)2C6H3O", Na: "Na(O2N)2C6H3O" }, obs: "Ácido fraco" },
    { nome: "Perclórico", formula: "HClO4", sal: { K: "KClO4", Na: "NaClO4" }, obs: "Ácido forte" },
    { nome: "Hidroiodídrico", formula: "HI", sal: { K: "KI", Na: "NaI" }, obs: "Ácido forte" },
    { nome: "Hidrobromídrico", formula: "HBr", sal: { K: "KBr", Na: "NaBr" }, obs: "Ácido forte" },
    { nome: "Clorídrico", formula: "HCl", sal: { K: "KCl", Na: "NaCl" }, obs: "Ácido forte" },
    { nome: "Nítrico", formula: "HNO3", sal: { K: "KNO3", Na: "NaNO3" }, obs: "Ácido forte" },
    { nome: "Clórico", formula: "HClO3", sal: { K: "KClO3", Na: "NaClO3" }, obs: "Ácido forte" },
    {
      nome: "Trifluorometanossulfônico (trifílico)",
      formula: "CF3SO3H",
      sal: { K: "KCF3SO3", Na: "NaCF3SO3" },
      obs: "Ácido superforte",
    },
    {
      nome: "Metanossulfônico",
      formula: "CH3SO3H",
      sal: { K: "KCH3SO3", Na: "NaCH3SO3" },
      obs: "Ácido forte",
    },
    {
      nome: "p-Toluenossulfônico (p-TsOH)",
      formula: "CH3C6H4SO3H",
      sal: { K: "KCH3C6H4SO3", Na: "NaCH3C6H4SO3" },
      obs: "Ácido forte orgânico",
    },
  ];
  
  function montarReacaoAcidoComBase(
    id: number,
    acido: TabelaAcidoForte,
    base: TabelaBaseMono
  ): ReacaoAcidoBaseMono {
    const produto =
      base.formula === "KOH" || base.formula === "NaOH"
        ? `${base.conjugado}${acido.anion} + H2O`
        : `${base.conjugado}${acido.anion}`;
  
    return {
      id,
      titulanteExibicao: acido.nome,
      tituladoExibicao: base.nome,
      formulaTitulante: acido.formula,
      formulaTitulado: base.formula,
      chaveReacao: chaveReacao(acido.formula, base.formula),
      equacaoExibicao: formatarFormulaQuimicaMono(
        `${acido.formula} + ${base.formula} → ${produto}`
      ),
      ativo: true,
      obs: `${acido.obs} + ${base.obs}`,
    };
  }
  
  function montarReacaoBaseComAcido(
    id: number,
    base: TabelaBaseForte,
    acido: TabelaAcidoMono
  ): ReacaoAcidoBaseMono {
    const produto = base.cation === "K" ? acido.sal.K : acido.sal.Na;
  
    return {
      id,
      titulanteExibicao: base.nome,
      tituladoExibicao: acido.nome,
      formulaTitulante: base.formula,
      formulaTitulado: acido.formula,
      chaveReacao: chaveReacao(base.formula, acido.formula),
      equacaoExibicao: formatarFormulaQuimicaMono(
        `${base.formula} + ${acido.formula} → ${produto} + H2O`
      ),
      ativo: true,
      obs: `Base forte + ${acido.obs.toLowerCase()}`,
    };
  }
  
  export const reacoesAcidoBaseMono: ReacaoAcidoBaseMono[] = [
    ...acidosFortesComoTitulantes.flatMap((acido, acidoIndex) =>
      basesMonoComoTituladas.map((base, baseIndex) =>
        montarReacaoAcidoComBase(
          acidoIndex * basesMonoComoTituladas.length + baseIndex + 1,
          acido,
          base
        )
      )
    ),
  
    ...basesFortesComoTitulantes.flatMap((base, baseIndex) =>
      acidosMonoComoTitulados.map((acido, acidoIndex) =>
        montarReacaoBaseComAcido(
          acidosFortesComoTitulantes.length * basesMonoComoTituladas.length +
            baseIndex * acidosMonoComoTitulados.length +
            acidoIndex +
            1,
          base,
          acido
        )
      )
    ),
  ];
  
  export function buscarReacaoAcidoBaseMono(
    formulaTitulante: string,
    formulaTitulado: string
  ) {
    const chave = chaveReacao(formulaTitulante, formulaTitulado);
  
    return reacoesAcidoBaseMono.find((reacao) => reacao.chaveReacao === chave);
  }
  
  export function listarTitulantesMono() {
    const mapa = new Map<
      string,
      { nome: string; formula: string; formulaExibicao: string }
    >();
  
    reacoesAcidoBaseMono.forEach((reacao) => {
      mapa.set(reacao.formulaTitulante, {
        nome: reacao.titulanteExibicao,
        formula: reacao.formulaTitulante,
        formulaExibicao: formatarFormulaQuimicaMono(reacao.formulaTitulante),
      });
    });
  
    return Array.from(mapa.values());
  }
  
  export function listarTituladosPorTitulanteMono(formulaTitulante: string) {
    return reacoesAcidoBaseMono
      .filter((reacao) => reacao.formulaTitulante === formulaTitulante)
      .map((reacao) => ({
        nome: reacao.tituladoExibicao,
        formula: reacao.formulaTitulado,
        formulaExibicao: formatarFormulaQuimicaMono(reacao.formulaTitulado),
        chaveReacao: reacao.chaveReacao,
        obs: reacao.obs,
      }));
  }