import {
  calcularFatorNernst,
} from "./nernst";

import {
  calcularMols,
  calcularVolumeEquivalencia,
  determinarRegiaoTitulacao,
  type RegiaoTitulacaoRedox,
} from "./estequiometria";

import {
  PAR_DIOXIDO_CARBONO_ACIDO_OXALICO,
  PAR_PERMANGANATO_MANGANES,
} from "./dadosRedox";

import {
  calcularFracoesEspeciacaoOxalato,
  PKA1_ACIDO_OXALICO,
  PKA2_ACIDO_OXALICO,
} from "./especiacaoOxalato";

import {
  resolverEquilibrioPermanganometriaOxalato,
} from "./equilibrioPermanganometriaOxalato";


export const REACAO_PERMANGANATO_OXALATO =
  "2 MnO₄⁻ + 5 C₂O₄²⁻ + 16 H⁺ → 2 Mn²⁺ + 10 CO₂ + 8 H₂O";


const COEFICIENTE_OXALATO =
  5;


const COEFICIENTE_MNO4 =
  2;


const COEFICIENTE_H_PLUS =
  16;


const COEFICIENTE_CO2 =
  10;


export type EntradaPermanganometriaOxalato = {
  concentracaoAnalitoMolL:
    number;

  volumeAnalitoMl:
    number;

  concentracaoTitulanteMolL:
    number;

  concentracaoHPlusMolL:
    number;

  atividadeCO2?:
    number;

  temperaturaC?:
    number;
};


export type ResultadoPermanganometriaOxalato = {
  reacaoGlobal:
    string;

  coeficienteAnalito:
    number;

  coeficienteTitulante:
    number;

  razaoOxalatoPorMnO4:
    number;

  molOxalatoInicial:
    number;

  molMnO4Equivalencia:
    number;

  volumeEquivalenciaMl:
    number;

  potencialFormalOxalatoV:
    number;

  potencialFormalPermanganatoV:
    number;

  potencialEquivalenciaV:
    number;

  molHPlusEstequiometrico:
    number;

  molHPlusInicialAproximado:
    number;

  excessoHPlusMol:
    number;

  molCO2ProduzidoNoPE:
    number;

  molMn2ProduzidoNoPE:
    number;

  atividadeCO2:
    number;

  pKa1Oxalato:
    number;

  pKa2Oxalato:
    number;

  fracaoH2C2O4:
    number;

  fracaoHC2O4:
    number;

  fracaoC2O4:
    number;

  temperaturaC:
    number;

  autocatalitica:
    boolean;

  catalisadorGerado:
    "Mn2+";

  observacoes:
    string[];
};


export type ResultadoPontoPermanganometriaOxalato = {
  volumeAdicionadoMl:
    number;

  volumeTotalMl:
    number;

  volumeEquivalenciaMl:
    number;

  regiao:
    RegiaoTitulacaoRedox;

  potencialV:
    number | null;

  parControlador:
    | "CO2/H2C2O4"
    | "MnO4-/Mn2+"
    | "equivalencia";

  molOxalatoTotalRemanescente:
    number;

  molH2C2O4:
    number;

  molHC2O4:
    number;

  molC2O4:
    number;

  molCO2:
    number;

  molMnO4:
    number;

  molMn2:
    number;

  concentracaoOxalatoTotalMolL:
    number;

  concentracaoH2C2O4MolL:
    number;

  concentracaoHC2O4MolL:
    number;

  concentracaoC2O4MolL:
    number;

  concentracaoMnO4MolL:
    number;

  concentracaoMn2MolL:
    number;

  descricao:
    string;
};


function validarEntradaOxalato(
  entrada:
    EntradaPermanganometriaOxalato
) {
  const valoresPositivos = [
    entrada
      .concentracaoAnalitoMolL,

    entrada
      .volumeAnalitoMl,

    entrada
      .concentracaoTitulanteMolL,

    entrada
      .concentracaoHPlusMolL,
  ];


  const valido =
    valoresPositivos.every(
      (valor) =>
        Number.isFinite(
          valor
        ) &&
        valor >
          0
    );


  if (
    !valido
  ) {
    throw new Error(
      "Concentrações e volumes do sistema oxalato devem ser positivos e finitos."
    );
  }


  const atividadeCO2 =
    entrada.atividadeCO2 ??
    1;


  if (
    !Number.isFinite(
      atividadeCO2
    ) ||
    atividadeCO2 <=
      0
  ) {
    throw new Error(
      "A atividade de CO₂ deve ser positiva e finita."
    );
  }


  const temperaturaC =
    entrada.temperaturaC ??
    25;


  if (
    !Number.isFinite(
      temperaturaC
    ) ||
    temperaturaC <=
      -273.15
  ) {
    throw new Error(
      "A temperatura informada é fisicamente inválida."
    );
  }
}


export function calcularPotencialFormalOxalato({
  concentracaoHPlusMolL,
  atividadeCO2 = 1,
  temperaturaC = 25,
}: {
  concentracaoHPlusMolL:
    number;

  atividadeCO2?:
    number;

  temperaturaC?:
    number;
}) {
  const fator =
    calcularFatorNernst({
      temperaturaC,

      numeroEletrons:
        2,
    });


  const fracoes =
    calcularFracoesEspeciacaoOxalato(
      concentracaoHPlusMolL
    );


  return (
    PAR_DIOXIDO_CARBONO_ACIDO_OXALICO
      .potencialPadraoReducao -
    fator *
      Math.log10(
        fracoes
          .fracaoH2C2O4 /
        (
          Math.pow(
            atividadeCO2,
            2
          ) *
          Math.pow(
            concentracaoHPlusMolL,
            2
          )
        )
      )
  );
}


export function calcularPotencialFormalPermanganatoOxalato({
  concentracaoHPlusMolL,
  temperaturaC = 25,
}: {
  concentracaoHPlusMolL:
    number;

  temperaturaC?:
    number;
}) {
  const fator =
    calcularFatorNernst({
      temperaturaC,

      numeroEletrons:
        5,
    });


  return (
    PAR_PERMANGANATO_MANGANES
      .potencialPadraoReducao +
    8 *
      fator *
      Math.log10(
        concentracaoHPlusMolL
      )
  );
}


export function calcularPotencialEquivalenciaOxalato({
  concentracaoHPlusMolL,
  atividadeCO2 = 1,
  temperaturaC = 25,
}: {
  concentracaoHPlusMolL:
    number;

  atividadeCO2?:
    number;

  temperaturaC?:
    number;
}) {
  const potencialFormalOxalatoV =
    calcularPotencialFormalOxalato({
      concentracaoHPlusMolL,

      atividadeCO2,

      temperaturaC,
    });


  const potencialFormalPermanganatoV =
    calcularPotencialFormalPermanganatoOxalato({
      concentracaoHPlusMolL,

      temperaturaC,
    });


  return (
    (
      2 *
        potencialFormalOxalatoV +
      5 *
        potencialFormalPermanganatoV
    ) /
    7
  );
}


export function calcularSistemaPermanganometriaOxalato(
  entrada:
    EntradaPermanganometriaOxalato
): ResultadoPermanganometriaOxalato {
  validarEntradaOxalato(
    entrada
  );


  const temperaturaC =
    entrada.temperaturaC ??
    25;


  const atividadeCO2 =
    entrada.atividadeCO2 ??
    1;


  const estequiometria =
    calcularVolumeEquivalencia({
      concentracaoAnalitoMolL:
        entrada
          .concentracaoAnalitoMolL,

      volumeAnalitoMl:
        entrada
          .volumeAnalitoMl,

      concentracaoTitulanteMolL:
        entrada
          .concentracaoTitulanteMolL,

      coeficienteAnalito:
        COEFICIENTE_OXALATO,

      coeficienteTitulante:
        COEFICIENTE_MNO4,
    });


  const molOxalatoInicial =
    estequiometria
      .molAnalitoInicial;


  const molMnO4Equivalencia =
    estequiometria
      .molTitulanteEquivalencia;


  const molHPlusEstequiometrico =
    molOxalatoInicial *
    (
      COEFICIENTE_H_PLUS /
      COEFICIENTE_OXALATO
    );


  const molHPlusInicialAproximado =
    calcularMols({
      concentracaoMolL:
        entrada
          .concentracaoHPlusMolL,

      volumeMl:
        entrada
          .volumeAnalitoMl,
    });


  const excessoHPlusMol =
    molHPlusInicialAproximado -
    molHPlusEstequiometrico;


  const molCO2ProduzidoNoPE =
    molOxalatoInicial *
    (
      COEFICIENTE_CO2 /
      COEFICIENTE_OXALATO
    );


  const molMn2ProduzidoNoPE =
    molMnO4Equivalencia;


  const fracoes =
    calcularFracoesEspeciacaoOxalato(
      entrada
        .concentracaoHPlusMolL
    );


  const potencialFormalOxalatoV =
    calcularPotencialFormalOxalato({
      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,

      atividadeCO2,

      temperaturaC,
    });


  const potencialFormalPermanganatoV =
    calcularPotencialFormalPermanganatoOxalato({
      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,

      temperaturaC,
    });


  const potencialEquivalenciaV =
    calcularPotencialEquivalenciaOxalato({
      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,

      atividadeCO2,

      temperaturaC,
    });


  const observacoes:
    string[] = [
      "A reação permanganato–oxalato apresenta comportamento autocatalítico devido à formação de Mn²⁺.",

      "A autocatalise e o aquecimento são tratados como efeitos cinéticos e não alteram artificialmente o potencial de equilíbrio.",

      "A concentração informada representa oxalato analítico total; a fração H₂C₂O₄ é calculada pela especiação ácido-base antes da aplicação de Nernst.",

      "A atividade de CO₂ é tratada como condição externa; quando não informada, utiliza-se a = 1 como estado padrão.",

      "Os valores de pKa usados na especiação são mantidos como constantes de referência a 25 °C.",
    ];


  if (
    excessoHPlusMol <
    0
  ) {
    observacoes.push(
      "Pelas condições informadas, a quantidade inicial aproximada de H⁺ é inferior à quantidade estequiométrica formal calculada para a reação escrita com C₂O₄²⁻."
    );
  }


  return {
    reacaoGlobal:
      REACAO_PERMANGANATO_OXALATO,

    coeficienteAnalito:
      COEFICIENTE_OXALATO,

    coeficienteTitulante:
      COEFICIENTE_MNO4,

    razaoOxalatoPorMnO4:
      COEFICIENTE_OXALATO /
      COEFICIENTE_MNO4,

    molOxalatoInicial,

    molMnO4Equivalencia,

    volumeEquivalenciaMl:
      estequiometria
        .volumeEquivalenciaMl,

    potencialFormalOxalatoV,

    potencialFormalPermanganatoV,

    potencialEquivalenciaV,

    molHPlusEstequiometrico,

    molHPlusInicialAproximado,

    excessoHPlusMol,

    molCO2ProduzidoNoPE,

    molMn2ProduzidoNoPE,

    atividadeCO2,

    pKa1Oxalato:
      PKA1_ACIDO_OXALICO,

    pKa2Oxalato:
      PKA2_ACIDO_OXALICO,

    fracaoH2C2O4:
      fracoes
        .fracaoH2C2O4,

    fracaoHC2O4:
      fracoes
        .fracaoHC2O4,

    fracaoC2O4:
      fracoes
        .fracaoC2O4,

    temperaturaC,

    autocatalitica:
      true,

    catalisadorGerado:
      "Mn2+",

    observacoes,
  };
}


export function calcularPontoPermanganometriaOxalato({
  entrada,
  volumeAdicionadoMl,
}: {
  entrada:
    EntradaPermanganometriaOxalato;

  volumeAdicionadoMl:
    number;
}): ResultadoPontoPermanganometriaOxalato {
  validarEntradaOxalato(
    entrada
  );


  if (
    !Number.isFinite(
      volumeAdicionadoMl
    ) ||
    volumeAdicionadoMl <
      0
  ) {
    throw new Error(
      "O volume de titulante adicionado deve ser maior ou igual a zero."
    );
  }


  const sistema =
    calcularSistemaPermanganometriaOxalato(
      entrada
    );


  const temperaturaC =
    entrada.temperaturaC ??
    25;


  const atividadeCO2 =
    entrada.atividadeCO2 ??
    1;


  const volumeTotalMl =
    entrada.volumeAnalitoMl +
    volumeAdicionadoMl;


  const regiao =
    determinarRegiaoTitulacao({
      volumeAdicionadoMl,

      volumeEquivalenciaMl:
        sistema
          .volumeEquivalenciaMl,

      toleranciaMl:
        1e-9,
    });


  const molMnO4Adicionado =
    calcularMols({
      concentracaoMolL:
        entrada
          .concentracaoTitulanteMolL,

      volumeMl:
        volumeAdicionadoMl,
    });


  const molMnTotalEquilibrio =
    regiao ===
    "pe"
      ? sistema
          .molMnO4Equivalencia
      : molMnO4Adicionado;


  const equilibrio =
    resolverEquilibrioPermanganometriaOxalato({
      molOxalatoTotalInicial:
        sistema
          .molOxalatoInicial,

      molMnTotal:
        molMnTotalEquilibrio,

      volumeTotalMl,

      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,

      atividadeCO2,

      temperaturaC,
    });


  let parControlador:
    ResultadoPontoPermanganometriaOxalato[
      "parControlador"
    ];


  let descricao:
    string;


  if (
    regiao ===
    "antes_pe"
  ) {
    parControlador =
      "CO2/H2C2O4";


    descricao =
      "Antes do ponto de equivalência, o oxalato total permanece em excesso. O potencial é calculado pelo equilíbrio simultâneo, utilizando a fração H₂C₂O₄ determinada pela especiação ácido-base.";
  } else if (
    regiao ===
    "pe"
  ) {
    parControlador =
      "equivalencia";


    descricao =
      "No ponto de equivalência, o potencial é determinado pela média ponderada dos potenciais formais dos pares CO₂/H₂C₂O₄ e MnO₄⁻/Mn²⁺, com pesos 2 e 5.";
  } else {
    parControlador =
      "MnO4-/Mn2+";


    descricao =
      "Após o ponto de equivalência, MnO₄⁻ permanece em excesso e o par MnO₄⁻/Mn²⁺ passa a predominar no potencial, mantendo-se o equilíbrio simultâneo.";
  }


  return {
    volumeAdicionadoMl,

    volumeTotalMl,

    volumeEquivalenciaMl:
      sistema
        .volumeEquivalenciaMl,

    regiao,

    potencialV:
      regiao ===
      "pe"
        ? sistema
            .potencialEquivalenciaV
        : equilibrio
            .potencialV,

    parControlador,

    molOxalatoTotalRemanescente:
      equilibrio
        .molOxalatoTotalRemanescente,

    molH2C2O4:
      equilibrio
        .molH2C2O4,

    molHC2O4:
      equilibrio
        .molHC2O4,

    molC2O4:
      equilibrio
        .molC2O4,

    molCO2:
      equilibrio
        .molCO2,

    molMnO4:
      equilibrio
        .molMnO4,

    molMn2:
      equilibrio
        .molMn2,

    concentracaoOxalatoTotalMolL:
      equilibrio
        .concentracaoOxalatoTotalMolL,

    concentracaoH2C2O4MolL:
      equilibrio
        .concentracaoH2C2O4MolL,

    concentracaoHC2O4MolL:
      equilibrio
        .concentracaoHC2O4MolL,

    concentracaoC2O4MolL:
      equilibrio
        .concentracaoC2O4MolL,

    concentracaoMnO4MolL:
      equilibrio
        .concentracaoMnO4MolL,

    concentracaoMn2MolL:
      equilibrio
        .concentracaoMn2MolL,

    descricao,
  };
}