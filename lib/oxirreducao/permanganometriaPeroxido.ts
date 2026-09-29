import {
  PAR_OXIGENIO_PEROXIDO,
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

import {
  calcularPotencialFormalPermanganato,
} from "./permanganometria";

import {
  resolverEquilibrioPermanganometriaPeroxido,
} from "./equilibrioPermanganometriaPeroxido";
  
  
  /* =========================================================
   * REAÇÃO GLOBAL
   * ======================================================= */
  
  /**
   * Em meio ácido:
   *
   * 2 MnO₄⁻ +
   * 5 H₂O₂ +
   * 6 H⁺
   *
   * →
   *
   * 2 Mn²⁺ +
   * 5 O₂ +
   * 8 H₂O
   */
  
  export const REACAO_PERMANGANATO_PEROXIDO =
    "2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O";
  
  
  const COEFICIENTE_H2O2 =
    5;
  
  
  const COEFICIENTE_MNO4 =
    2;
  
  
  /* =========================================================
   * ENTRADA
   * ======================================================= */
  
  export type EntradaPermanganometriaPeroxido = {
    concentracaoAnalitoMolL: number;
  
    volumeAnalitoMl: number;
  
    concentracaoTitulanteMolL: number;
  
    concentracaoHPlusMolL: number;
  
    /**
     * Atividade adotada para O₂.
     *
     * Como O₂ é um produto gasoso,
     * sua atividade depende das
     * condições experimentais.
     *
     * No modelo educacional inicial,
     * a(O₂) = 1 representa a
     * condição padrão.
     */
    atividadeOxigenio?: number;
  
    temperaturaC?: number;
  };
  
  
  /* =========================================================
   * RESULTADOS
   * ======================================================= */
  
  export type ResultadoPermanganometriaPeroxido = {
    reacaoGlobal: string;
  
    coeficienteAnalito: number;
  
    coeficienteTitulante: number;
  
    razaoH2O2PorMnO4: number;
  
    molH2O2Inicial: number;
  
    molMnO4Equivalencia: number;
  
    volumeEquivalenciaMl: number;
  
    potencialPadraoPeroxido: number;
  
    potencialPadraoMn: number;
  
    concentracaoHPlusMolL: number;
  
    atividadeOxigenio: number;
  
    temperaturaC: number;
  
    potencialEquivalenciaV: number;
  };
  
  
  export type ResultadoPontoPermanganometriaPeroxido = {
    volumeAdicionadoMl: number;
  
    volumeTotalMl: number;
  
    volumeEquivalenciaMl: number;
  
    regiao:
      RegiaoTitulacaoRedox;
  
    potencialV:
      number | null;
  
    parControlador:
      | "O2/H2O2"
      | "MnO4-/Mn2+"
      | "equivalencia";
  
    molH2O2: number;
  
    molO2: number;
  
    molMnO4: number;
  
    molMn2: number;
  
    concentracaoH2O2MolL: number;
  
    concentracaoMnO4MolL: number;
  
    concentracaoMn2MolL: number;
  
    descricao: string;
  };
  
  
  /* =========================================================
   * VALIDAÇÃO
   * ======================================================= */
  
  function validarEntrada(
    entrada:
      EntradaPermanganometriaPeroxido
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
  
      entrada
        .atividadeOxigenio ??
        1,
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
        "Concentrações, volumes e atividades devem ser positivos e finitos."
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
   * POTENCIAL FORMAL O₂ / H₂O₂
   * ======================================================= */
  
  /**
   * O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂
   *
   * E =
   * E° -
   * (2,303 RT / 2F)
   * log(
   *   a(H₂O₂) /
   *   [a(O₂) a(H⁺)²]
   * )
   *
   * Aqui isolamos as condições
   * de H⁺ e O₂ no potencial formal.
   */
  
  export function calcularPotencialFormalPeroxido({
    concentracaoHPlusMolL,
    atividadeOxigenio = 1,
    temperaturaC = 25,
  }: {
    concentracaoHPlusMolL: number;
    atividadeOxigenio?: number;
    temperaturaC?: number;
  }) {
    if (
      !Number.isFinite(
        concentracaoHPlusMolL
      ) ||
      concentracaoHPlusMolL <= 0 ||
      !Number.isFinite(
        atividadeOxigenio
      ) ||
      atividadeOxigenio <= 0
    ) {
      return NaN;
    }
  
  
    const fatorDoisEletrons =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          2,
      });
  
  
    if (
      !Number.isFinite(
        fatorDoisEletrons
      )
    ) {
      return NaN;
    }
  
  
    return (
      PAR_OXIGENIO_PEROXIDO
        .potencialPadraoReducao +
      fatorDoisEletrons *
        Math.log10(
          atividadeOxigenio
        ) +
      (
        2 *
        fatorDoisEletrons
      ) *
        Math.log10(
          concentracaoHPlusMolL
        )
    );
  }
  
  
  /* =========================================================
   * POTENCIAL NO PE
   * ======================================================= */
  
  /**
   * Para os pares:
   *
   * O₂ / H₂O₂
   * n = 2
   *
   * MnO₄⁻ / Mn²⁺
   * n = 5
   *
   * EPE =
   *
   * 2 E°'peróxido +
   * 5 E°'permanganato
   * ------------------
   *        7
   *
   * São utilizados potenciais formais
   * para incorporar a influência de H⁺.
   */
  
  export function calcularPotencialEquivalenciaPeroxido({
    concentracaoHPlusMolL,
    atividadeOxigenio = 1,
    temperaturaC = 25,
  }: {
    concentracaoHPlusMolL: number;
    atividadeOxigenio?: number;
    temperaturaC?: number;
  }) {
    const potencialFormalPeroxido =
      calcularPotencialFormalPeroxido({
        concentracaoHPlusMolL,
        atividadeOxigenio,
        temperaturaC,
      });
  
  
    const potencialFormalMn =
      calcularPotencialFormalPermanganato({
        concentracaoHPlusMolL,
        temperaturaC,
      });
  
  
    if (
      !Number.isFinite(
        potencialFormalPeroxido
      ) ||
      !Number.isFinite(
        potencialFormalMn
      )
    ) {
      return NaN;
    }
  
  
    return (
      (
        2 *
        potencialFormalPeroxido
      ) +
      (
        5 *
        potencialFormalMn
      )
    ) /
      7;
  }
  
  
  /* =========================================================
   * SISTEMA
   * ======================================================= */
  
  export function calcularSistemaPermanganometriaPeroxido(
    entrada:
      EntradaPermanganometriaPeroxido
  ): ResultadoPermanganometriaPeroxido {
    validarEntrada(
      entrada
    );
  
  
    const temperaturaC =
      entrada.temperaturaC ??
      25;
  
  
    const atividadeOxigenio =
      entrada.atividadeOxigenio ??
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
          COEFICIENTE_H2O2,
  
        coeficienteTitulante:
          COEFICIENTE_MNO4,
      });
  
  
      const equilibrioPE =
      resolverEquilibrioPermanganometriaPeroxido({
        molH2O2Total:
          estequiometria
            .molAnalitoInicial,
    
        molMnTotal:
          estequiometria
            .molTitulanteEquivalencia,
    
        volumeTotalMl:
          entrada.volumeAnalitoMl +
          estequiometria
            .volumeEquivalenciaMl,
    
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
    
        atividadeOxigenio,
    
        temperaturaC,
      });
    
    
    if (
      equilibrioPE.potencialV ===
      null
    ) {
      throw new Error(
        "Não foi possível calcular o potencial de equilíbrio no PE do sistema H₂O₂/MnO₄⁻."
      );
    }
    
    
    const potencialEquivalenciaV =
      equilibrioPE.potencialV;
  
  
    return {
      reacaoGlobal:
        REACAO_PERMANGANATO_PEROXIDO,
  
      coeficienteAnalito:
        COEFICIENTE_H2O2,
  
      coeficienteTitulante:
        COEFICIENTE_MNO4,
  
      razaoH2O2PorMnO4:
        COEFICIENTE_H2O2 /
        COEFICIENTE_MNO4,
  
      molH2O2Inicial:
        estequiometria
          .molAnalitoInicial,
  
      molMnO4Equivalencia:
        estequiometria
          .molTitulanteEquivalencia,
  
      volumeEquivalenciaMl:
        estequiometria
          .volumeEquivalenciaMl,
  
      potencialPadraoPeroxido:
        PAR_OXIGENIO_PEROXIDO
          .potencialPadraoReducao,
  
      potencialPadraoMn:
        PAR_PERMANGANATO_MANGANES
          .potencialPadraoReducao,
  
      concentracaoHPlusMolL:
        entrada
          .concentracaoHPlusMolL,
  
      atividadeOxigenio,
  
      temperaturaC,
  
      potencialEquivalenciaV,
    };
  }
  
  
  /* =========================================================
   * PONTO DA TITULAÇÃO
   * ======================================================= */
  
  export function calcularPontoPermanganometriaPeroxido({
    entrada,
    volumeAdicionadoMl,
  }: {
    entrada:
      EntradaPermanganometriaPeroxido;
  
    volumeAdicionadoMl:
      number;
  }): ResultadoPontoPermanganometriaPeroxido {
    validarEntrada(
      entrada
    );
  
  
    if (
      !Number.isFinite(
        volumeAdicionadoMl
      ) ||
      volumeAdicionadoMl < 0
    ) {
      throw new Error(
        "O volume de titulante adicionado deve ser maior ou igual a zero."
      );
    }
  
  
    const sistema =
      calcularSistemaPermanganometriaPeroxido(
        entrada
      );
  
  
    const temperaturaC =
      entrada.temperaturaC ??
      25;
  
  
    const atividadeOxigenio =
      entrada.atividadeOxigenio ??
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
  
  
    /*
     * No PE usamos exatamente a quantidade
     * estequiométrica já calculada pelo sistema.
     *
     * Isso evita que pequenas diferenças de
     * ponto flutuante como:
     *
     * 50
     * versus
     * 50.00000000000001
     *
     * alterem artificialmente o potencial
     * em uma região extremamente sensível.
     */
  
    const molMnTotalEquilibrio =
      regiao ===
      "pe"
        ? sistema
            .molMnO4Equivalencia
        : molMnO4Adicionado;
  
  
    /* =======================================================
     * EQUILÍBRIO CONTÍNUO
     * =======================================================
     *
     * O potencial é obtido impondo:
     *
     * E(O₂/H₂O₂)
     * =
     * E(MnO₄⁻/Mn²⁺)
     *
     * simultaneamente ao balanço:
     *
     * n(H₂O₂ consumido)
     * =
     * (5/2) n(Mn²⁺)
     *
     * A atividade de O₂ permanece uma condição externa
     * do modelo porque O₂ é uma espécie gasosa.
     */
  
    const equilibrio =
      resolverEquilibrioPermanganometriaPeroxido({
        molH2O2Total:
          sistema
            .molH2O2Inicial,
  
        molMnTotal:
          molMnTotalEquilibrio,
  
        volumeTotalMl,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        atividadeOxigenio,
  
        temperaturaC,
      });
  
  
    let parControlador:
      ResultadoPontoPermanganometriaPeroxido[
        "parControlador"
      ];
  
  
    let descricao:
      string;
  
  
    if (
      regiao ===
      "antes_pe"
    ) {
      parControlador =
        "O2/H2O2";
  
  
      descricao =
        "Antes do ponto de equivalência, o par O₂/H₂O₂ é predominante, mas o potencial é obtido pelo equilíbrio simultâneo com MnO₄⁻/Mn²⁺.";
    } else if (
      regiao ===
      "pe"
    ) {
      parControlador =
        "equivalencia";
  
  
      descricao =
        "No ponto de equivalência, o potencial é obtido pelo equilíbrio simultâneo entre os pares O₂/H₂O₂ e MnO₄⁻/Mn²⁺.";
    } else {
      parControlador =
        "MnO4-/Mn2+";
  
  
      descricao =
        "Após o ponto de equivalência, o par MnO₄⁻/Mn²⁺ é predominante, mas o potencial continua sendo obtido pelo equilíbrio simultâneo dos dois pares.";
    }
  
  
    return {
      volumeAdicionadoMl,
  
      volumeTotalMl,
  
      volumeEquivalenciaMl:
        sistema
          .volumeEquivalenciaMl,
  
      regiao,
  
      potencialV:
        equilibrio
          .potencialV,
  
      parControlador,
  
      molH2O2:
        equilibrio
          .molH2O2,
  
      molO2:
        equilibrio
          .molO2,
  
      molMnO4:
        equilibrio
          .molMnO4,
  
      molMn2:
        equilibrio
          .molMn2,
  
      concentracaoH2O2MolL:
        equilibrio
          .concentracaoH2O2MolL,
  
      concentracaoMnO4MolL:
        equilibrio
          .concentracaoMnO4MolL,
  
      concentracaoMn2MolL:
        equilibrio
          .concentracaoMn2MolL,
  
      descricao,
    };
  }