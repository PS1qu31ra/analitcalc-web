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

import {
  resolverEquilibrioPermanganometriaFerro,
} from "./equilibrioPermanganometriaFerro";
  
  
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
    "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O";
  
  
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
   * VALIDAÇÃO
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
  
    const potencialEquivalenciaV =
      calcularPotencialEquivalenciaPermanganometria({
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
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
    entrada:
      EntradaPermanganometriaFerro;
  
    volumeAdicionadoMl:
      number;
  }): ResultadoPontoPermanganometria {
    validarEntradaPermanganometria(
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
      calcularSistemaPermanganometriaFerro(
        entrada
      );
  
  
    const temperaturaC =
      entrada.temperaturaC ??
      25;
  
  
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
     * =======================================================
     * NOVO MODELO
     * =======================================================
     *
     * Não zeramos mais artificialmente
     * Fe²⁺, Fe³⁺, MnO₄⁻ ou Mn²⁺.
     *
     * O potencial é encontrado impondo
     * simultaneamente:
     *
     * E(Fe³⁺/Fe²⁺)
     * =
     * E(MnO₄⁻/Mn²⁺)
     *
     * e o balanço:
     *
     * n(Fe³⁺)
     * =
     * 5 n(Mn²⁺)
     */
  
    const equilibrio =
      resolverEquilibrioPermanganometriaFerro({
        molFeTotal:
          sistema
            .molFe2Inicial,
  
        molMnTotal:
          molMnO4Adicionado,
  
        volumeTotalMl,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
  
    let parControlador:
      ResultadoPontoPermanganometria[
        "parControlador"
      ];
  
  
    let descricao:
      string;
  
  
    if (
      regiao ===
      "antes_pe"
    ) {
      parControlador =
        "Fe3+/Fe2+";
  
  
      descricao =
        "Antes do ponto de equivalência, o par Fe³⁺/Fe²⁺ é predominante, mas o potencial é obtido pelo equilíbrio simultâneo com MnO₄⁻/Mn²⁺.";
      } else if (
        regiao ===
        "pe"
      ) {
        parControlador =
          "equivalencia";
      
      
        descricao =
          "No ponto de equivalência, o potencial é determinado pela média ponderada dos potenciais dos pares Fe³⁺/Fe²⁺ e MnO₄⁻/Mn²⁺, considerando os respectivos números de elétrons das semirreações.";
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
  regiao ===
  "pe"
    ? sistema
        .potencialEquivalenciaV
    : equilibrio
        .potencialV,
  
      parControlador,
  
      molFe2:
        equilibrio
          .molFe2,
  
      molFe3:
        equilibrio
          .molFe3,
  
      molMnO4:
        equilibrio
          .molMnO4,
  
      molMn2:
        equilibrio
          .molMn2,
  
      concentracaoFe2MolL:
        equilibrio
          .concentracaoFe2MolL,
  
      concentracaoFe3MolL:
        equilibrio
          .concentracaoFe3MolL,
  
      concentracaoMnO4MolL:
        equilibrio
          .concentracaoMnO4MolL,
  
      concentracaoMn2MolL:
        equilibrio
          .concentracaoMn2MolL,
  
      descricao,
    };
  }