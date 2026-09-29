import {
    calcularMols,
    calcularVolumeEquivalencia,
  } from "./estequiometria";
  
  
  /* =========================================================
   * REAÇÃO GLOBAL
   * ======================================================= */
  
  /**
   * Em meio ácido:
   *
   * 2 MnO₄⁻ +
   * 5 C₂O₄²⁻ +
   * 16 H⁺
   *
   * →
   *
   * 2 Mn²⁺ +
   * 10 CO₂ +
   * 8 H₂O
   */
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
  
  
  /* =========================================================
   * ENTRADA
   * ======================================================= */
  
  export type EntradaPermanganometriaOxalato = {
    /**
     * Concentração do oxalato.
     */
    concentracaoAnalitoMolL: number;
  
    /**
     * Volume inicial da amostra.
     */
    volumeAnalitoMl: number;
  
    /**
     * Concentração do KMnO₄.
     */
    concentracaoTitulanteMolL: number;
  
    /**
     * Concentração inicial aproximada
     * de H⁺ no meio.
     */
    concentracaoHPlusMolL: number;
  
    /**
     * Temperatura experimental.
     *
     * Neste estágio ela é armazenada
     * como condição experimental,
     * mas ainda não entra em um
     * modelo cinético.
     */
    temperaturaC?: number;
  };
  
  
  /* =========================================================
   * RESULTADO
   * ======================================================= */
  
  export type ResultadoPermanganometriaOxalato = {
    reacaoGlobal: string;
  
    coeficienteAnalito: number;
  
    coeficienteTitulante: number;
  
    razaoOxalatoPorMnO4: number;
  
    molOxalatoInicial: number;
  
    molMnO4Equivalencia: number;
  
    volumeEquivalenciaMl: number;
  
    molHPlusEstequiometrico: number;
  
    molHPlusInicialAproximado: number;
  
    excessoHPlusMol: number;
  
    molCO2ProduzidoNoPE: number;
  
    molMn2ProduzidoNoPE: number;
  
    temperaturaC: number;
  
    autocatalitica: boolean;
  
    catalisadorGerado: "Mn2+";
  
    observacoes: string[];
  };
  
  
  /* =========================================================
   * VALIDAÇÃO
   * ======================================================= */
  
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
          valor > 0
      );
  
  
    if (!valido) {
      throw new Error(
        "Concentrações e volumes do sistema oxalato devem ser positivos e finitos."
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
   * SISTEMA OXALATO
   * ======================================================= */
  
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
  
  
    /*
     * Pela reação:
     *
     * 5 C₂O₄²⁻
     * consomem
     * 16 H⁺
     */
    const molHPlusEstequiometrico =
      molOxalatoInicial *
      (
        COEFICIENTE_H_PLUS /
        COEFICIENTE_OXALATO
      );
  
  
    /*
     * Estimativa da quantidade inicial
     * de H⁺ usando o volume inicial
     * da solução.
     */
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
  
  
    /*
     * Pela reação:
     *
     * 5 C₂O₄²⁻
     * →
     * 10 CO₂
     */
    const molCO2ProduzidoNoPE =
      molOxalatoInicial *
      (
        COEFICIENTE_CO2 /
        COEFICIENTE_OXALATO
      );
  
  
    /*
     * Cada mol de MnO₄⁻ reduzido
     * produz um mol de Mn²⁺.
     */
    const molMn2ProduzidoNoPE =
      molMnO4Equivalencia;
  
  
    const observacoes: string[] = [
      "A reação permanganato–oxalato apresenta comportamento autocatalítico devido à formação de Mn²⁺.",
      "A velocidade da reação depende das condições experimentais e não deve ser representada apenas pela estequiometria.",
      "A titulação é normalmente conduzida sob condições que favoreçam a velocidade da reação, incluindo aquecimento.",
    ];
  
  
    if (
      excessoHPlusMol <
      0
    ) {
      observacoes.push(
        "Pelas condições informadas, a quantidade inicial aproximada de H⁺ é inferior à quantidade estequiométrica calculada para a reação global."
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
  
      molHPlusEstequiometrico,
  
      molHPlusInicialAproximado,
  
      excessoHPlusMol,
  
      molCO2ProduzidoNoPE,
  
      molMn2ProduzidoNoPE,
  
      temperaturaC,
  
      autocatalitica:
        true,
  
      catalisadorGerado:
        "Mn2+",
  
      observacoes,
    };
  }