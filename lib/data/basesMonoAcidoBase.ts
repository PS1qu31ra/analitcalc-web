export type BaseMonoAcidoBase = {
    id: string;
    nome: string;
    formula: string;
    tipo: "forte" | "fraca";
    pKb25C: number;
    kb25C: number;
    ativo: boolean;
    observacao: string;
  };
  
  function kbPorPkb(pKb: number) {
    return Math.pow(10, -pKb);
  }
  
  export const basesMonoAcidoBase: BaseMonoAcidoBase[] = [
    {
      id: "nh3",
      nome: "Amônia",
      formula: "NH3",
      tipo: "fraca",
      pKb25C: 4.75,
      kb25C: kbPorPkb(4.75),
      ativo: true,
      observacao: "Base molecular fraca.",
    },
    {
      id: "ch3nh2",
      nome: "Metilamina",
      formula: "CH3NH2",
      tipo: "fraca",
      pKb25C: 3.34,
      kb25C: kbPorPkb(3.34),
      ativo: true,
      observacao: "Amina primária; base molecular fraca.",
    },
    {
      id: "c2h5nh2",
      nome: "Etilamina",
      formula: "C2H5NH2",
      tipo: "fraca",
      pKb25C: 3.35,
      kb25C: kbPorPkb(3.35),
      ativo: true,
      observacao: "Amina primária; base molecular fraca.",
    },
    {
      id: "c3h7nh2",
      nome: "Propilamina",
      formula: "C3H7NH2",
      tipo: "fraca",
      pKb25C: 3.46,
      kb25C: kbPorPkb(3.46),
      ativo: true,
      observacao: "Amina primária; base molecular fraca.",
    },
    {
      id: "c4h5nh2",
      nome: "n-Butilamina",
      formula: "C4H5NH2",
      tipo: "fraca",
      pKb25C: 3.4,
      kb25C: kbPorPkb(3.4),
      ativo: true,
      observacao:
        "Amina primária; base molecular fraca. Conferir fórmula se necessário.",
    },
    {
      id: "ch3-2chch2nh2",
      nome: "sec-Butilamina",
      formula: "(CH3)2CHCH2NH2",
      tipo: "fraca",
      pKb25C: 3.44,
      kb25C: kbPorPkb(3.44),
      ativo: true,
      observacao: "Amina; base molecular fraca.",
    },
    {
      id: "ch3-3cnh2",
      nome: "tert-Butilamina",
      formula: "(CH3)3CNH2",
      tipo: "fraca",
      pKb25C: 3.32,
      kb25C: kbPorPkb(3.32),
      ativo: true,
      observacao: "Amina; base molecular fraca.",
    },
    {
      id: "ch3-2nh",
      nome: "Dimetilamina",
      formula: "(CH3)2NH",
      tipo: "fraca",
      pKb25C: 3.27,
      kb25C: kbPorPkb(3.27),
      ativo: true,
      observacao: "Amina secundária; base molecular fraca.",
    },
    {
      id: "ch3-3n",
      nome: "Trimetilamina",
      formula: "(CH3)3N",
      tipo: "fraca",
      pKb25C: 4.2,
      kb25C: kbPorPkb(4.2),
      ativo: true,
      observacao: "Amina terciária; base molecular fraca.",
    },
    {
      id: "c6h5nh2",
      nome: "Anilina",
      formula: "C6H5NH2",
      tipo: "fraca",
      pKb25C: 9.13,
      kb25C: kbPorPkb(9.13),
      ativo: true,
      observacao: "Amina aromática; base fraca.",
    },
    {
      id: "c5h5n",
      nome: "Piridina",
      formula: "C5H5N",
      tipo: "fraca",
      pKb25C: 8.77,
      kb25C: kbPorPkb(8.77),
      ativo: true,
      observacao: "Base heterocíclica fraca.",
    },
    {
      id: "n2h4",
      nome: "Hidrazina",
      formula: "N2H4",
      tipo: "fraca",
      pKb25C: 5.9,
      kb25C: kbPorPkb(5.9),
      ativo: true,
      observacao: "Base molecular fraca.",
    },
    {
      id: "nh2oh",
      nome: "Hidroxilamina",
      formula: "NH2OH",
      tipo: "fraca",
      pKb25C: 8.06,
      kb25C: kbPorPkb(8.06),
      ativo: true,
      observacao: "Base molecular fraca.",
    },
  
    {
      id: "koh",
      nome: "Hidróxido de potássio",
      formula: "KOH",
      tipo: "forte",
      pKb25C: 0,
      kb25C: Infinity,
      ativo: true,
      observacao:
        "Base forte; no cálculo será tratada como dissociação completa.",
    },
    {
      id: "naoh",
      nome: "Hidróxido de sódio",
      formula: "NaOH",
      tipo: "forte",
      pKb25C: 0,
      kb25C: Infinity,
      ativo: true,
      observacao:
        "Base forte; no cálculo será tratada como dissociação completa.",
    },
  ];
  
  export function buscarBaseMonoPorFormula(formula: string) {
    return basesMonoAcidoBase.find(
      (base) => base.formula.toLowerCase() === formula.toLowerCase()
    );
  }
  
  export function listarBasesMonoFracas() {
    return basesMonoAcidoBase.filter((base) => base.tipo === "fraca");
  }
  
  export function listarBasesMonoFortes() {
    return basesMonoAcidoBase.filter((base) => base.tipo === "forte");
  }