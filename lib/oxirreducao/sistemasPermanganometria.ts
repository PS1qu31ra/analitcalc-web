export type SistemaPermanganometriaId =
  | "ferro-ii"
  | "peroxido-hidrogenio"
  | "oxalato";


export type StatusSistemaPermanganometria =
  | "disponivel"
  | "em_desenvolvimento";


export type SistemaPermanganometria = {
  id:
    SistemaPermanganometriaId;

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
    StatusSistemaPermanganometria;

  observacao:
    string;
};


/* =========================================================
 * SISTEMAS
 * ======================================================= */

export const SISTEMA_FERRO_II:
  SistemaPermanganometria = {
  id:
    "ferro-ii",

  nome:
    "Ferro(II)",

  formulaAnalito:
    "Fe²⁺",

  nomeCompleto:
    "Ferro(II) — Fe²⁺",

  descricao:
    "Determinação de Fe²⁺ por oxidação a Fe³⁺ utilizando permanganato em meio ácido.",

  titulante:
    "KMnO₄",

  status:
    "disponivel",

  observacao:
    "Sistema inicial validado no motor de permanganometria.",
};


export const SISTEMA_PEROXIDO_HIDROGENIO:
  SistemaPermanganometria = {
  id:
    "peroxido-hidrogenio",

  nome:
    "Peróxido de hidrogênio",

  formulaAnalito:
    "H₂O₂",

  nomeCompleto:
    "Peróxido de hidrogênio — H₂O₂",

  descricao:
    "Determinação de peróxido de hidrogênio por oxidação com permanganato em meio ácido.",

  titulante:
    "KMnO₄",

  status:
    "em_desenvolvimento",

  observacao:
    "O motor específico será implementado na próxima etapa.",
};


export const SISTEMA_OXALATO:
  SistemaPermanganometria = {
  id:
    "oxalato",

  nome:
    "Oxalato",

  formulaAnalito:
    "C₂O₄²⁻",

  nomeCompleto:
    "Oxalato — C₂O₄²⁻",

  descricao:
    "Determinação de oxalato por oxidação com permanganato em meio ácido.",

  titulante:
    "KMnO₄",

  status:
    "em_desenvolvimento",

  observacao:
    "O sistema requer tratamento próprio das condições experimentais e será implementado separadamente.",
};


/* =========================================================
 * BASE
 * ======================================================= */

export const sistemasPermanganometria:
  SistemaPermanganometria[] = [
  SISTEMA_FERRO_II,
  SISTEMA_PEROXIDO_HIDROGENIO,
  SISTEMA_OXALATO,
];


/* =========================================================
 * CONSULTAS
 * ======================================================= */

export function buscarSistemaPermanganometria(
  id:
    SistemaPermanganometriaId
) {
  return (
    sistemasPermanganometria.find(
      (sistema) =>
        sistema.id === id
    ) ??
    SISTEMA_FERRO_II
  );
}