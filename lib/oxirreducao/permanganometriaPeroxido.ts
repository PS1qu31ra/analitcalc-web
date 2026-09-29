import {
  PAR_OXIGENIO_PEROXIDO,
  PAR_PERMANGANATO_MANGANES,
} from "./dadosRedox";

import {
  calcularFatorNernst,
  calcularPotencialNernst,
} from "./nernst";

import {
  calcularConcentracaoAposMistura,
  calcularMols,
  calcularVolumeEquivalencia,
  determinarRegiaoTitulacao,
  type RegiaoTitulacaoRedox,
} from "./estequiometria";

import {
  calcularPotencialFormalPermanganato,
} from "./permanganometria";
  
  
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
  
  
    const potencialEquivalenciaV =
      calcularPotencialEquivalenciaPeroxido({
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        atividadeOxigenio,
  
        temperaturaC,
      });
  
  
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
  
  
    const molH2O2Inicial =
      sistema
        .molH2O2Inicial;
  
  
    const molMnO4Adicionado =
      calcularMols({
        concentracaoMolL:
          entrada
            .concentracaoTitulanteMolL,
  
        volumeMl:
          volumeAdicionadoMl,
      });
  
  
    /* =======================================================
     * ANTES DO PE
     * ===================================================== */
  
    if (
      regiao ===
      "antes_pe"
    ) {
      /*
       * 2 MnO₄⁻
       * reagem com
       * 5 H₂O₂.
       */
  
      const molH2O2Consumido =
        (
          5 /
          2
        ) *
        molMnO4Adicionado;
  
  
      const molH2O2 =
        Math.max(
          molH2O2Inicial -
            molH2O2Consumido,
          0
        );
  
  
      const molO2 =
        molH2O2Consumido;
  
  
      const molMn2 =
        molMnO4Adicionado;
  
  
      const concentracaoH2O2MolL =
        calcularConcentracaoAposMistura({
          mols:
            molH2O2,
  
          volumeTotalMl,
        });
  
  
      const concentracaoMn2MolL =
        calcularConcentracaoAposMistura({
          mols:
            molMn2,
  
          volumeTotalMl,
        });
  
  
      /*
       * Em V = 0 não houve formação
       * de O₂ pela titulação.
       *
       * Evitamos representar o ponto
       * inicial como um equilíbrio
       * plenamente estabelecido.
       */
  
      if (
        molO2 <= 0 ||
        molH2O2 <= 0
      ) {
        return {
          volumeAdicionadoMl,
  
          volumeTotalMl,
  
          volumeEquivalenciaMl:
            sistema
              .volumeEquivalenciaMl,
  
          regiao,
  
          potencialV:
            null,
  
          parControlador:
            "O2/H2O2",
  
          molH2O2,
  
          molO2,
  
          molMnO4:
            0,
  
          molMn2,
  
          concentracaoH2O2MolL,
  
          concentracaoMnO4MolL:
            0,
  
          concentracaoMn2MolL,
  
          descricao:
            "No início da titulação ainda não há O₂ formado pelo processo para representar diretamente o equilíbrio O₂/H₂O₂.",
        };
      }
  
  
      const resultadoNernst =
        calcularPotencialNernst({
          par:
            PAR_OXIGENIO_PEROXIDO,
  
          temperaturaC,
  
          atividades: {
            "H2O2":
              concentracaoH2O2MolL,
  
            "O2":
              atividadeOxigenio,
  
            "H+":
              entrada
                .concentracaoHPlusMolL,
          },
        });
  
  
      return {
        volumeAdicionadoMl,
  
        volumeTotalMl,
  
        volumeEquivalenciaMl:
          sistema
            .volumeEquivalenciaMl,
  
        regiao,
  
        potencialV:
          resultadoNernst.status ===
          "ok"
            ? resultadoNernst
                .potencial
            : null,
  
        parControlador:
          "O2/H2O2",
  
        molH2O2,
  
        molO2,
  
        molMnO4:
          0,
  
        molMn2,
  
        concentracaoH2O2MolL,
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL,
  
        descricao:
          "Antes do ponto de equivalência, o modelo termodinâmico utiliza o par O₂/H₂O₂.",
      };
    }
  
  
    /* =======================================================
     * PONTO DE EQUIVALÊNCIA
     * ===================================================== */
  
    if (
      regiao ===
      "pe"
    ) {
      const molMn2 =
        sistema
          .molMnO4Equivalencia;
  
  
      const molO2 =
        molH2O2Inicial;
  
  
      const concentracaoMn2MolL =
        calcularConcentracaoAposMistura({
          mols:
            molMn2,
  
          volumeTotalMl,
        });
  
  
      return {
        volumeAdicionadoMl,
  
        volumeTotalMl,
  
        volumeEquivalenciaMl:
          sistema
            .volumeEquivalenciaMl,
  
        regiao,
  
        potencialV:
          sistema
            .potencialEquivalenciaV,
  
        parControlador:
          "equivalencia",
  
        molH2O2:
          0,
  
        molO2,
  
        molMnO4:
          0,
  
        molMn2,
  
        concentracaoH2O2MolL:
          0,
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL,
  
        descricao:
          "No ponto de equivalência, o potencial é estimado pela combinação dos potenciais formais dos pares O₂/H₂O₂ e MnO₄⁻/Mn²⁺.",
      };
    }
  
  
    /* =======================================================
     * APÓS O PE
     * ===================================================== */
  
    const molMnO4Excesso =
      Math.max(
        molMnO4Adicionado -
          sistema
            .molMnO4Equivalencia,
        0
      );
  
  
    const molMn2 =
      sistema
        .molMnO4Equivalencia;
  
  
    const molO2 =
      molH2O2Inicial;
  
  
    const concentracaoMnO4MolL =
      calcularConcentracaoAposMistura({
        mols:
          molMnO4Excesso,
  
        volumeTotalMl,
      });
  
  
    const concentracaoMn2MolL =
      calcularConcentracaoAposMistura({
        mols:
          molMn2,
  
        volumeTotalMl,
      });
  
  
    const resultadoNernst =
      calcularPotencialNernst({
        par:
          PAR_PERMANGANATO_MANGANES,
  
        temperaturaC,
  
        atividades: {
          "MnO4-":
            concentracaoMnO4MolL,
  
          "Mn2+":
            concentracaoMn2MolL,
  
          "H+":
            entrada
              .concentracaoHPlusMolL,
        },
      });
  
  
    return {
      volumeAdicionadoMl,
  
      volumeTotalMl,
  
      volumeEquivalenciaMl:
        sistema
          .volumeEquivalenciaMl,
  
      regiao,
  
      potencialV:
        resultadoNernst.status ===
        "ok"
          ? resultadoNernst
              .potencial
          : null,
  
      parControlador:
        "MnO4-/Mn2+",
  
      molH2O2:
        0,
  
      molO2,
  
      molMnO4:
        molMnO4Excesso,
  
      molMn2,
  
      concentracaoH2O2MolL:
        0,
  
      concentracaoMnO4MolL,
  
      concentracaoMn2MolL,
  
      descricao:
        "Após o ponto de equivalência, o excesso de MnO₄⁻ passa a controlar o potencial da solução.",
    };
  }