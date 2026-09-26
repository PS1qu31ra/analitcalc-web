import {
    PAR_FERRO_III_FERRO_II,
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
      volumeAdicionadoMl < 0
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
  
    const molFe2Inicial =
      sistema.molFe2Inicial;
  
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
     * ANTES DO PE
     * =======================================================
     */
  
    if (
      regiao ===
      "antes_pe"
    ) {
      /*
       * Cada 1 mol MnO₄⁻
       * oxida 5 mol Fe²⁺.
       */
  
      const molFe2Consumido =
        5 *
        molMnO4Adicionado;
  
      const molFe3 =
        molFe2Consumido;
  
      const molFe2 =
        Math.max(
          molFe2Inicial -
            molFe2Consumido,
          0
        );
  
      const molMn2 =
        molMnO4Adicionado;
  
      const concentracaoFe2MolL =
        calcularConcentracaoAposMistura({
          mols:
            molFe2,
  
          volumeTotalMl,
        });
  
      const concentracaoFe3MolL =
        calcularConcentracaoAposMistura({
          mols:
            molFe3,
  
          volumeTotalMl,
        });
  
      const concentracaoMn2MolL =
        calcularConcentracaoAposMistura({
          mols:
            molMn2,
  
          volumeTotalMl,
        });
  
      /*
       * Em V = 0 ainda não existe
       * Fe³⁺ suficiente para definir
       * o quociente Fe³⁺ / Fe²⁺.
       */
      if (
        molFe3 <= 0 ||
        molFe2 <= 0
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
            "Fe3+/Fe2+",
  
          molFe2,
          molFe3,
  
          molMnO4:
            0,
  
          molMn2,
  
          concentracaoFe2MolL,
          concentracaoFe3MolL,
  
          concentracaoMnO4MolL:
            0,
  
          concentracaoMn2MolL,
  
          descricao:
            "Antes da adição de titulante ainda não há quantidade calculável de Fe³⁺ para aplicar diretamente a equação de Nernst ao par Fe³⁺/Fe²⁺.",
        };
      }
  
      const resultadoNernst =
        calcularPotencialNernst({
          par:
            PAR_FERRO_III_FERRO_II,
  
          temperaturaC,
  
          atividades: {
            "Fe3+":
              concentracaoFe3MolL,
  
            "Fe2+":
              concentracaoFe2MolL,
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
          "Fe3+/Fe2+",
  
        molFe2,
        molFe3,
  
        molMnO4:
          0,
  
        molMn2,
  
        concentracaoFe2MolL,
        concentracaoFe3MolL,
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL,
  
        descricao:
          "Antes do ponto de equivalência, o potencial é controlado predominantemente pelo par Fe³⁺/Fe²⁺.",
      };
    }
  
    /*
     * =======================================================
     * PONTO DE EQUIVALÊNCIA
     * =======================================================
     */
  
    if (
      regiao ===
      "pe"
    ) {
      const molMn2 =
        sistema
          .molMnO4Equivalencia;
  
      const molFe3 =
        molFe2Inicial;
  
      const concentracaoFe3MolL =
        calcularConcentracaoAposMistura({
          mols:
            molFe3,
  
          volumeTotalMl,
        });
  
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
  
        molFe2:
          0,
  
        molFe3,
  
        molMnO4:
          0,
  
        molMn2,
  
        concentracaoFe2MolL:
          0,
  
        concentracaoFe3MolL,
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL,
  
        descricao:
          "No ponto de equivalência, o potencial é estimado pela combinação dos potenciais formais dos pares MnO₄⁻/Mn²⁺ e Fe³⁺/Fe²⁺.",
      };
    }
  
    /*
     * =======================================================
     * APÓS O PE
     * =======================================================
     */
  
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
  
    const molFe3 =
      molFe2Inicial;
  
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
  
    const concentracaoFe3MolL =
      calcularConcentracaoAposMistura({
        mols:
          molFe3,
  
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
  
      molFe2:
        0,
  
      molFe3,
  
      molMnO4:
        molMnO4Excesso,
  
      molMn2,
  
      concentracaoFe2MolL:
        0,
  
      concentracaoFe3MolL,
  
      concentracaoMnO4MolL,
  
      concentracaoMn2MolL,
  
      descricao:
        "Após o ponto de equivalência, o excesso de permanganato faz com que o potencial seja controlado predominantemente pelo par MnO₄⁻/Mn²⁺.",
    };
  }