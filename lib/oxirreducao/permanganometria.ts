import {
  PAR_FERRO_III_FERRO_II,
  PAR_PERMANGANATO_MANGANES,
} from "./dadosRedox";

import {
  calcularFatorNernst,
} from "./nernst";

import {
  calcularMols,
  calcularVolumeEquivalencia,
  determinarRegiaoTitulacao,
  type RegiaoTitulacaoRedox,
} from "./estequiometria";

  
  
  /* =========================================================
   * CONSTANTES DO SISTEMA
   * ======================================================= */
  
  /**
   * Reação global em meio ácido:
   *
   * MnO₄⁻ + 5 Fe²⁺ + 8 H⁺
   * →
   * Mn²⁺ + 5 Fe³⁺ + 4 H₂O
   */
  
  export const REACAO_PERMANGANATO_FERRO =
    "MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ ⇌ Mn²⁺ + 5 Fe³⁺ + 4 H₂O";
  
  
  const COEFICIENTE_FE2 =
    5;
  
  
  const COEFICIENTE_MNO4 =
    1;
  
  
  /* =========================================================
   * ENTRADA
   * ======================================================= */
  
  export type EntradaPermanganometriaFerro = {
    /**
     * Fe²⁺.
     */
    concentracaoAnalitoMolL: number;
  
    /**
     * Volume inicial da solução
     * contendo Fe²⁺.
     */
    volumeAnalitoMl: number;
  
    /**
     * KMnO₄.
     */
    concentracaoTitulanteMolL: number;
  
    /**
     * Atividade aproximada de H⁺.
     *
     * Nesta primeira implementação,
     * utilizamos concentração como
     * aproximação da atividade.
     *
     * Exemplo:
     * 1 mol/L.
     */
    concentracaoHPlusMolL: number;
  
    /**
     * Temperatura.
     *
     * Padrão:
     * 25 °C.
     */
    temperaturaC?: number;
  };
  
  
  /* =========================================================
   * RESULTADO GERAL
   * ======================================================= */
  
  export type ResultadoPermanganometriaFerro = {
    reacaoGlobal: string;
  
    coeficienteAnalito: number;
    coeficienteTitulante: number;
  
    razaoFe2PorMnO4: number;
  
    molFe2Inicial: number;
  
    molMnO4Equivalencia: number;
  
    volumeEquivalenciaMl: number;
  
    potencialPadraoFe: number;
  
    potencialPadraoMn: number;
  
    concentracaoHPlusMolL: number;
  
    temperaturaC: number;
  
    potencialEquivalenciaV: number;
  };
  
  
  /* =========================================================
   * RESULTADO DE UM PONTO
   * ======================================================= */
  
  export type ResultadoPontoPermanganometria = {
    volumeAdicionadoMl: number;
  
    volumeTotalMl: number;
  
    volumeEquivalenciaMl: number;
  
    regiao:
      RegiaoTitulacaoRedox;
  
    potencialV:
      number | null;
  
    parControlador:
      "Fe3+/Fe2+" |
      "MnO4-/Mn2+" |
      "equivalencia";
  
    molFe2:
      number;
  
    molFe3:
      number;
  
    molMnO4:
      number;
  
    molMn2:
      number;
  
    concentracaoFe2MolL:
      number;
  
    concentracaoFe3MolL:
      number;
  
    concentracaoMnO4MolL:
      number;
  
    concentracaoMn2MolL:
      number;
  
    descricao:
      string;
  };
  
  
  /* =========================================================
   * VERIFICAÇÃO DOS DADOS DE ENTRADA
   * ======================================================= */
  
  function validarEntradaPermanganometria(
    entrada:
      EntradaPermanganometriaFerro
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
          valor > 0
      );
  
    if (!valido) {
      throw new Error(
        "Concentrações e volumes da permanganometria devem ser positivos e finitos."
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
  
  
  /* =========================================================
   * POTENCIAL FORMAL DO PERMANGANATO
   * ======================================================= */
  
  /**
   * Para:
   *
   * MnO₄⁻ + 8 H⁺ + 5 e⁻
   * ⇌
   * Mn²⁺ + 4 H₂O
   *
   * podemos incorporar H⁺ ao potencial
   * formal do sistema:
   *
   * E°' =
   * E° +
   * (f / 5) × 8 log[H⁺]
   *
   * onde:
   *
   * f = 2,303 RT/F
   */
  export function calcularPotencialFormalPermanganato({
    concentracaoHPlusMolL,
    temperaturaC = 25,
  }: {
    concentracaoHPlusMolL: number;
    temperaturaC?: number;
  }) {
    if (
      !Number.isFinite(
        concentracaoHPlusMolL
      ) ||
      concentracaoHPlusMolL <= 0
    ) {
      return NaN;
    }
  
    const fatorUmEletron =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          1,
      });
  
    if (
      !Number.isFinite(
        fatorUmEletron
      )
    ) {
      return NaN;
    }
  
    return (
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
      (
        8 *
        fatorUmEletron /
        5
      ) *
        Math.log10(
          concentracaoHPlusMolL
        )
    );
  }
  
  
  /* =========================================================
   * POTENCIAL NO PONTO DE EQUIVALÊNCIA
   * ======================================================= */
  
  /**
   * Para o sistema:
   *
   * MnO₄⁻ / Mn²⁺   n = 5
   * Fe³⁺ / Fe²⁺    n = 1
   *
   * utilizando o potencial formal
   * do permanganato:
   *
   * E_PE ≈
   *
   * 5 E°'Mn + 1 E°Fe
   * ----------------
   *         6
   *
   * A expressão é adequada para o
   * sistema estequiométrico considerado.
   */
  export function calcularPotencialEquivalenciaPermanganometria({
    concentracaoHPlusMolL,
    temperaturaC = 25,
  }: {
    concentracaoHPlusMolL: number;
    temperaturaC?: number;
  }) {
    const potencialFormalMn =
      calcularPotencialFormalPermanganato({
        concentracaoHPlusMolL,
        temperaturaC,
      });
  
    if (
      !Number.isFinite(
        potencialFormalMn
      )
    ) {
      return NaN;
    }
  
    const potencialFe =
      PAR_FERRO_III_FERRO_II
        .potencialPadraoReducao;
  
    return (
      (
        5 *
        potencialFormalMn
      ) +
      potencialFe
    ) /
      6;
  }
  
  
  /* =========================================================
   * SISTEMA GERAL
   * ======================================================= */
  
  export function calcularSistemaPermanganometriaFerro(
    entrada:
      EntradaPermanganometriaFerro
  ): ResultadoPermanganometriaFerro {
    validarEntradaPermanganometria(
      entrada
    );
  
    const temperaturaC =
      entrada.temperaturaC ??
      25;
  
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
          COEFICIENTE_FE2,
  
        coeficienteTitulante:
          COEFICIENTE_MNO4,
      });
  
    // No PE, o potencial é obtido pela média ponderada dos potenciais
    // dos pares redox, considerando seus respectivos números de elétrons.
    const potencialEquivalenciaV =
      calcularPotencialEquivalenciaPermanganometria({
        concentracaoHPlusMolL: entrada.concentracaoHPlusMolL,
        temperaturaC,
      });

    if (!Number.isFinite(potencialEquivalenciaV)) {
      throw new Error(
        'Não foi possível calcular o potencial teórico no PE do sistema Fe²⁺/MnO₄⁻.'
      );
    }

    return {
      reacaoGlobal:
        REACAO_PERMANGANATO_FERRO,
  
      coeficienteAnalito:
        COEFICIENTE_FE2,
  
      coeficienteTitulante:
        COEFICIENTE_MNO4,
  
      razaoFe2PorMnO4:
        5,
  
      molFe2Inicial:
        estequiometria
          .molAnalitoInicial,
  
      molMnO4Equivalencia:
        estequiometria
          .molTitulanteEquivalencia,
  
      volumeEquivalenciaMl:
        estequiometria
          .volumeEquivalenciaMl,
  
      potencialPadraoFe:
        PAR_FERRO_III_FERRO_II
          .potencialPadraoReducao,
  
      potencialPadraoMn:
        PAR_PERMANGANATO_MANGANES
          .potencialPadraoReducao,
  
      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,
  
      temperaturaC,
  
      potencialEquivalenciaV,
    };
  }
  
  
  /* =========================================================
   * AVALIAÇÃO DE UM PONTO DA TITULAÇÃO
   * ======================================================= */
  
  export function calcularPontoPermanganometriaFerro({
  entrada,
  volumeAdicionadoMl,
}: {
  entrada: EntradaPermanganometriaFerro;
  volumeAdicionadoMl: number;
}): ResultadoPontoPermanganometria {
  validarEntradaPermanganometria(entrada);

  if (!Number.isFinite(volumeAdicionadoMl) || volumeAdicionadoMl < 0) {
    throw new Error("O volume de titulante adicionado deve ser maior ou igual a zero.");
  }

  const sistema = calcularSistemaPermanganometriaFerro(entrada);
  const temperaturaC = entrada.temperaturaC ?? 25;
  const volumeTotalMl = entrada.volumeAnalitoMl + volumeAdicionadoMl;
  const volumeTotalL = volumeTotalMl / 1000;
  const regiao = determinarRegiaoTitulacao({
    volumeAdicionadoMl,
    volumeEquivalenciaMl: sistema.volumeEquivalenciaMl,
    toleranciaMl: 1e-9,
  });

  const molMnO4Adicionado = calcularMols({
    concentracaoMolL: entrada.concentracaoTitulanteMolL,
    volumeMl: volumeAdicionadoMl,
  });

  const molFe2Inicial = sistema.molFe2Inicial;
  const molMnO4Equivalencia = sistema.molMnO4Equivalencia;

  let molFe2 = 0;
  let molFe3 = 0;
  let molMnO4 = 0;
  let molMn2 = 0;
  let potencialV: number | null = null;

  if (regiao === "antes_pe") {
    molFe3 = 5 * molMnO4Adicionado;
    molFe2 = Math.max(0, molFe2Inicial - molFe3);
    molMn2 = molMnO4Adicionado;

    if (molFe2 > 0 && molFe3 > 0) {
      const concentracaoFe2 = molFe2 / volumeTotalL;
      const concentracaoFe3 = molFe3 / volumeTotalL;
      const fator = calcularFatorNernst({ temperaturaC, numeroEletrons: 1 });
      potencialV =
        PAR_FERRO_III_FERRO_II.potencialPadraoReducao -
        fator * Math.log10(concentracaoFe2 / concentracaoFe3);
    }
  } else if (regiao === "pe") {
    molFe3 = molFe2Inicial;
    molMn2 = molMnO4Equivalencia;
    potencialV = sistema.potencialEquivalenciaV;
  } else {
    molFe3 = molFe2Inicial;
    molMn2 = molMnO4Equivalencia;
    molMnO4 = Math.max(0, molMnO4Adicionado - molMnO4Equivalencia);

    if (molMnO4 > 0 && molMn2 > 0) {
      const concentracaoMnO4 = molMnO4 / volumeTotalL;
      const concentracaoMn2 = molMn2 / volumeTotalL;
      const quociente =
        concentracaoMn2 /
        (concentracaoMnO4 * entrada.concentracaoHPlusMolL ** 8);
      const fator = calcularFatorNernst({ temperaturaC, numeroEletrons: 5 });
      potencialV =
        PAR_PERMANGANATO_MANGANES.potencialPadraoReducao -
        fator * Math.log10(quociente);
    }
  }

  const concentracaoFe2MolL = molFe2 / volumeTotalL;
  const concentracaoFe3MolL = molFe3 / volumeTotalL;
  const concentracaoMnO4MolL = molMnO4 / volumeTotalL;
  const concentracaoMn2MolL = molMn2 / volumeTotalL;

  const parControlador =
    regiao === "antes_pe"
      ? "Fe3+/Fe2+"
      : regiao === "pe"
        ? "equivalencia"
        : "MnO4-/Mn2+";

  const descricao =
    regiao === "antes_pe"
      ? "Antes do ponto de equivalência, Fe²⁺ permanece em excesso e o potencial é calculado pelo par Fe³⁺/Fe²⁺."
      : regiao === "pe"
        ? "No ponto de equivalência, o potencial corresponde à média ponderada dos potenciais dos pares Fe³⁺/Fe²⁺ e MnO₄⁻/Mn²⁺."
        : "Após o ponto de equivalência, MnO₄⁻ permanece em excesso e o potencial é calculado pelo par MnO₄⁻/Mn²⁺.";

  return {
    volumeAdicionadoMl,
    volumeTotalMl,
    volumeEquivalenciaMl: sistema.volumeEquivalenciaMl,
    regiao,
    potencialV,
    parControlador,
    molFe2,
    molFe3,
    molMnO4,
    molMn2,
    concentracaoFe2MolL,
    concentracaoFe3MolL,
    concentracaoMnO4MolL,
    concentracaoMn2MolL,
    descricao,
  };
}
