export type SistemaIodometriaId =
  | "cloro-ativo"
  | "cobre-ii"
  | "oxigenio-dissolvido"
  | "peroxido-hidrogenio"
  | "hipoclorito"
  | "iodato";


export type StatusSistemaIodometria =
  | "disponivel"
  | "em_desenvolvimento";


export type SistemaIodometria = {
  id:
    SistemaIodometriaId;

  nome:
    string;

  formulaAnalito:
    string;

  nomeCompleto:
    string;

  descricao:
    string;

  titulante:
    string;

  status:
    StatusSistemaIodometria;

  observacao:
    string;
};


/* =========================================================
 * SISTEMAS
 * ======================================================= */

export const SISTEMA_CLORO_ATIVO:
  SistemaIodometria = {
  id:
    "cloro-ativo",

  nome:
    "Cloro ativo",

  formulaAnalito:
    "Cl₂",

  nomeCompleto:
    "Cloro ativo — expresso como Cl₂",

  descricao:
    "Determinação indireta de cloro ativo pela liberação de I₂ a partir de iodeto e posterior titulação com tiossulfato.",

  titulante:
    "Na₂S₂O₃",

  status:
    "disponivel",

  observacao:
    "Primeiro sistema da iodometria. O cloro oxida I⁻ a I₂ e o iodo formado é titulado com S₂O₃²⁻.",
};


export const SISTEMA_COBRE_II:
  SistemaIodometria = {
  id:
    "cobre-ii",

  nome:
    "Cobre(II)",

  formulaAnalito:
    "Cu²⁺",

  nomeCompleto:
    "Cobre(II) — Cu²⁺",

  descricao:
    "Determinação indireta de Cu²⁺ por reação com iodeto e titulação do iodo formado com tiossulfato.",

  titulante:
    "Na₂S₂O₃",

  status:
    "em_desenvolvimento",

  observacao:
    "Sistema será implementado após a validação do cloro ativo.",
};


export const SISTEMA_OXIGENIO_DISSOLVIDO:
  SistemaIodometria = {
  id:
    "oxigenio-dissolvido",

  nome:
    "Oxigênio dissolvido",

  formulaAnalito:
    "O₂",

  nomeCompleto:
    "Oxigênio dissolvido — O₂",

  descricao:
    "Determinação indireta de oxigênio dissolvido por formação estequiométrica de iodo.",

  titulante:
    "Na₂S₂O₃",

  status:
    "em_desenvolvimento",

  observacao:
    "Sistema será implementado em etapa posterior.",
};


export const SISTEMA_PEROXIDO_IODOMETRIA:
  SistemaIodometria = {
  id:
    "peroxido-hidrogenio",

  nome:
    "Peróxido de hidrogênio",

  formulaAnalito:
    "H₂O₂",

  nomeCompleto:
    "Peróxido de hidrogênio — H₂O₂",

  descricao:
    "Determinação indireta de H₂O₂ por oxidação do iodeto e titulação do iodo produzido.",

  titulante:
    "Na₂S₂O₃",

  status:
    "em_desenvolvimento",

  observacao:
    "Sistema iodimétrico independente da permanganometria de H₂O₂.",
};


export const SISTEMA_HIPOCLORITO:
  SistemaIodometria = {
  id:
    "hipoclorito",

  nome:
    "Hipoclorito",

  formulaAnalito:
    "ClO⁻",

  nomeCompleto:
    "Hipoclorito — ClO⁻",

  descricao:
    "Determinação indireta de hipoclorito pela oxidação de iodeto em meio adequado.",

  titulante:
    "Na₂S₂O₃",

  status:
    "em_desenvolvimento",

  observacao:
    "Sistema será implementado em etapa posterior.",
};


export const SISTEMA_IODATO:
  SistemaIodometria = {
  id:
    "iodato",

  nome:
    "Iodato",

  formulaAnalito:
    "IO₃⁻",

  nomeCompleto:
    "Iodato — IO₃⁻",

  descricao:
    "Determinação indireta de iodato pela liberação estequiométrica de iodo na presença de iodeto.",

  titulante:
    "Na₂S₂O₃",

  status:
    "em_desenvolvimento",

  observacao:
    "Sistema será implementado em etapa posterior.",
};


/* =========================================================
 * BASE
 * ======================================================= */

export const sistemasIodometria:
  SistemaIodometria[] = [
  SISTEMA_CLORO_ATIVO,
  SISTEMA_COBRE_II,
  SISTEMA_OXIGENIO_DISSOLVIDO,
  SISTEMA_PEROXIDO_IODOMETRIA,
  SISTEMA_HIPOCLORITO,
  SISTEMA_IODATO,
];


/* =========================================================
 * CONSULTAS
 * ======================================================= */

export function buscarSistemaIodometria(
  id:
    SistemaIodometriaId
) {
  return (
    sistemasIodometria.find(
      (sistema) =>
        sistema.id === id
    ) ??
    SISTEMA_CLORO_ATIVO
  );
}