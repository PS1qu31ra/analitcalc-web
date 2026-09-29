import {
    PAR_FERRO_III_FERRO_II,
    PAR_PERMANGANATO_MANGANES,
  } from "./dadosRedox";
  
  import {
    calcularFatorNernst,
  } from "./nernst";
  
  
  /* =========================================================
   * TIPOS
   * ======================================================= */
  
  export type EntradaEquilibrioPermanganometriaFerro = {
    /**
     * Quantidade analítica total de ferro.
     *
     * Fe_total = Fe²⁺ + Fe³⁺
     */
    molFeTotal: number;
  
    /**
     * Quantidade analítica total de manganês
     * proveniente do KMnO₄ adicionado.
     *
     * Mn_total = MnO₄⁻ + Mn²⁺
     */
    molMnTotal: number;
  
    volumeTotalMl: number;
  
    /**
     * Aproximação:
     * atividade de H⁺ ≈ concentração.
     *
     * Consideramos o meio ácido em
     * excesso e aproximadamente constante.
     */
    concentracaoHPlusMolL: number;
  
    temperaturaC?: number;
  };
  
  
  export type ResultadoEquilibrioPermanganometriaFerro = {
    potencialV:
      number | null;
  
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
  
    erroBalancoEletronicoMol:
      number;
  };
  
  
  /* =========================================================
   * CONSTANTES
   * ======================================================= */
  
  const COEFICIENTE_FE =
    5;
  
  
  /* =========================================================
   * UTILITÁRIOS
   * ======================================================= */
  
  function validarNumeroPositivo(
    valor: number,
    nome: string
  ) {
    if (
      !Number.isFinite(
        valor
      ) ||
      valor <= 0
    ) {
      throw new Error(
        `${nome} deve ser positivo e finito.`
      );
    }
  }
  
  
  function concentracao({
    mols,
    volumeMl,
  }: {
    mols: number;
    volumeMl: number;
  }) {
    return (
      mols /
      (
        volumeMl /
        1000
      )
    );
  }
  
  
  /**
   * Para uma razão:
   *
   * r = espécie A / espécie B
   *
   * recebemos log10(r) e retornamos
   * as frações relativas sem calcular
   * números excessivamente grandes.
   */
  function calcularFracoesRazao(
    logRazao: number
  ) {
    if (
      logRazao >=
      0
    ) {
      const inverso =
        Math.pow(
          10,
          -Math.min(
            logRazao,
            300
          )
        );
  
  
      const denominador =
        1 +
        inverso;
  
  
      return {
        fracaoNumerador:
          1 /
          denominador,
  
        fracaoDenominador:
          inverso /
          denominador,
      };
    }
  
  
    const razao =
      Math.pow(
        10,
        Math.max(
          logRazao,
          -300
        )
      );
  
  
    const denominador =
      1 +
      razao;
  
  
    return {
      fracaoNumerador:
        razao /
        denominador,
  
      fracaoDenominador:
        1 /
        denominador,
    };
  }
  
  
  /* =========================================================
   * DISTRIBUIÇÃO DAS ESPÉCIES PARA UM POTENCIAL
   * ======================================================= */
  
  function calcularDistribuicao({
    potencialV,
    molFeTotal,
    molMnTotal,
    concentracaoHPlusMolL,
    temperaturaC,
  }: {
    potencialV: number;
  
    molFeTotal: number;
  
    molMnTotal: number;
  
    concentracaoHPlusMolL: number;
  
    temperaturaC: number;
  }) {
    const fatorFe =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          1,
      });
  
  
    const fatorMn =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          5,
      });
  
  
    /*
     * Fe³⁺ + e⁻ ⇌ Fe²⁺
     *
     * E =
     * E° +
     * f log(Fe³⁺/Fe²⁺)
     *
     * portanto:
     *
     * log(Fe³⁺/Fe²⁺)
     * =
     * (E - E°) / f
     */
    const logRazaoFe =
      (
        potencialV -
        PAR_FERRO_III_FERRO_II
          .potencialPadraoReducao
      ) /
      fatorFe;
  
  
    const fracoesFe =
      calcularFracoesRazao(
        logRazaoFe
      );
  
  
    /*
     * MnO₄⁻ + 8H⁺ + 5e⁻
     * ⇌
     * Mn²⁺ + 4H₂O
     *
     * E =
     * E° -
     * f log[
     *   Mn²⁺ /
     *   (MnO₄⁻ H⁺⁸)
     * ]
     *
     * portanto:
     *
     * log(Mn²⁺/MnO₄⁻)
     * =
     * (E° - E)/f +
     * 8 log(H⁺)
     */
    const logRazaoMn =
      (
        (
          PAR_PERMANGANATO_MANGANES
            .potencialPadraoReducao -
          potencialV
        ) /
        fatorMn
      ) +
      (
        8 *
        Math.log10(
          concentracaoHPlusMolL
        )
      );
  
  
    const fracoesMn =
      calcularFracoesRazao(
        logRazaoMn
      );
  
  
    const molFe3 =
      molFeTotal *
      fracoesFe
        .fracaoNumerador;
  
  
    const molFe2 =
      molFeTotal *
      fracoesFe
        .fracaoDenominador;
  
  
    /*
     * Para Mn:
     *
     * numerador da razão = Mn²⁺
     * denominador = MnO₄⁻
     */
    const molMn2 =
      molMnTotal *
      fracoesMn
        .fracaoNumerador;
  
  
    const molMnO4 =
      molMnTotal *
      fracoesMn
        .fracaoDenominador;
  
  
    return {
      molFe2,
      molFe3,
      molMnO4,
      molMn2,
    };
  }
  
  
  /* =========================================================
   * RESÍDUO DO BALANÇO ELETRÔNICO
   * ======================================================= */
  
  /**
   * Pela reação:
   *
   * MnO₄⁻ + 5 Fe²⁺
   * →
   * Mn²⁺ + 5 Fe³⁺
   *
   * cada 1 mol de Mn²⁺ formado
   * corresponde a 5 mol de Fe³⁺.
   *
   * No equilíbrio:
   *
   * n(Fe³⁺) - 5 n(Mn²⁺) = 0
   */
  function calcularResiduo({
    potencialV,
    molFeTotal,
    molMnTotal,
    concentracaoHPlusMolL,
    temperaturaC,
  }: {
    potencialV: number;
  
    molFeTotal: number;
  
    molMnTotal: number;
  
    concentracaoHPlusMolL: number;
  
    temperaturaC: number;
  }) {
    const distribuicao =
      calcularDistribuicao({
        potencialV,
  
        molFeTotal,
  
        molMnTotal,
  
        concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
  
    return (
      distribuicao
        .molFe3 -
      COEFICIENTE_FE *
        distribuicao
          .molMn2
    );
  }
  
  
  /* =========================================================
   * RESOLVEDOR DO EQUILÍBRIO
   * ======================================================= */
  
  export function resolverEquilibrioPermanganometriaFerro(
    entrada:
      EntradaEquilibrioPermanganometriaFerro
  ): ResultadoEquilibrioPermanganometriaFerro {
    validarNumeroPositivo(
      entrada.molFeTotal,
      "A quantidade total de ferro"
    );
  
  
    validarNumeroPositivo(
      entrada.volumeTotalMl,
      "O volume total"
    );
  
  
    validarNumeroPositivo(
      entrada
        .concentracaoHPlusMolL,
      "A concentração de H⁺"
    );
  
  
    if (
      !Number.isFinite(
        entrada.molMnTotal
      ) ||
      entrada.molMnTotal <
        0
    ) {
      throw new Error(
        "A quantidade total de manganês deve ser maior ou igual a zero."
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
  
  
    /*
     * Antes da primeira adição de KMnO₄
     * não temos o segundo par redox
     * presente para definir um potencial
     * de equilíbrio pelo modelo acoplado.
     */
    if (
      entrada.molMnTotal ===
      0
    ) {
      const concentracaoFe2MolL =
        concentracao({
          mols:
            entrada.molFeTotal,
  
          volumeMl:
            entrada.volumeTotalMl,
        });
  
  
      return {
        potencialV:
          null,
  
        molFe2:
          entrada.molFeTotal,
  
        molFe3:
          0,
  
        molMnO4:
          0,
  
        molMn2:
          0,
  
        concentracaoFe2MolL,
  
        concentracaoFe3MolL:
          0,
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL:
          0,
  
        erroBalancoEletronicoMol:
          0,
      };
    }
  
  
    const fatorUmEletron =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          1,
      });
  
  
    /*
     * Potencial formal aproximado
     * MnO₄⁻/Mn²⁺ considerando [H⁺].
     */
    const potencialFormalMn =
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
      (
        (
          8 *
          fatorUmEletron
        ) /
        5
      ) *
        Math.log10(
          entrada
            .concentracaoHPlusMolL
        );
  
  
    /*
     * Criamos uma faixa ampla em torno
     * dos potenciais dos dois pares.
     */
    let limiteInferior =
      Math.min(
        PAR_FERRO_III_FERRO_II
          .potencialPadraoReducao,
  
        potencialFormalMn
      ) -
      2;
  
  
    let limiteSuperior =
      Math.max(
        PAR_FERRO_III_FERRO_II
          .potencialPadraoReducao,
  
        potencialFormalMn
      ) +
      2;
  
  
    let residuoInferior =
      calcularResiduo({
        potencialV:
          limiteInferior,
  
        molFeTotal:
          entrada.molFeTotal,
  
        molMnTotal:
          entrada.molMnTotal,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
  
    let residuoSuperior =
      calcularResiduo({
        potencialV:
          limiteSuperior,
  
        molFeTotal:
          entrada.molFeTotal,
  
        molMnTotal:
          entrada.molMnTotal,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
  
    /*
     * Caso alguma condição extrema
     * coloque a raiz fora da primeira
     * faixa, expandimos os limites.
     */
    for (
      let tentativa = 0;
  
      tentativa <
        20 &&
      (
        residuoInferior >
          0 ||
        residuoSuperior <
          0
      );
  
      tentativa +=
        1
    ) {
      if (
        residuoInferior >
        0
      ) {
        limiteInferior -=
          2;
  
  
        residuoInferior =
          calcularResiduo({
            potencialV:
              limiteInferior,
  
            molFeTotal:
              entrada.molFeTotal,
  
            molMnTotal:
              entrada.molMnTotal,
  
            concentracaoHPlusMolL:
              entrada
                .concentracaoHPlusMolL,
  
            temperaturaC,
          });
      }
  
  
      if (
        residuoSuperior <
        0
      ) {
        limiteSuperior +=
          2;
  
  
        residuoSuperior =
          calcularResiduo({
            potencialV:
              limiteSuperior,
  
            molFeTotal:
              entrada.molFeTotal,
  
            molMnTotal:
              entrada.molMnTotal,
  
            concentracaoHPlusMolL:
              entrada
                .concentracaoHPlusMolL,
  
            temperaturaC,
          });
      }
    }
  
  
    if (
      residuoInferior >
        0 ||
      residuoSuperior <
        0
    ) {
      throw new Error(
        "Não foi possível localizar o equilíbrio eletroquímico do sistema Fe²⁺/MnO₄⁻."
      );
    }
  
  
    /*
     * Bisseção no POTENCIAL.
     *
     * Procuramos:
     *
     * n(Fe³⁺)
     * =
     * 5 n(Mn²⁺)
     */
    for (
      let iteracao = 0;
      iteracao <
        200;
      iteracao +=
        1
    ) {
      const meio =
        (
          limiteInferior +
          limiteSuperior
        ) /
        2;
  
  
      const residuoMeio =
        calcularResiduo({
          potencialV:
            meio,
  
          molFeTotal:
            entrada.molFeTotal,
  
          molMnTotal:
            entrada.molMnTotal,
  
          concentracaoHPlusMolL:
            entrada
              .concentracaoHPlusMolL,
  
          temperaturaC,
        });
  
  
      if (
        residuoMeio <
        0
      ) {
        limiteInferior =
          meio;
      } else {
        limiteSuperior =
          meio;
      }
  
  
      if (
        Math.abs(
          limiteSuperior -
          limiteInferior
        ) <
        1e-12
      ) {
        break;
      }
    }
  
  
    const potencialV =
      (
        limiteInferior +
        limiteSuperior
      ) /
      2;
  
  
    const distribuicao =
      calcularDistribuicao({
        potencialV,
  
        molFeTotal:
          entrada.molFeTotal,
  
        molMnTotal:
          entrada.molMnTotal,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        temperaturaC,
      });
  
  
    const concentracaoFe2MolL =
      concentracao({
        mols:
          distribuicao.molFe2,
  
        volumeMl:
          entrada.volumeTotalMl,
      });
  
  
    const concentracaoFe3MolL =
      concentracao({
        mols:
          distribuicao.molFe3,
  
        volumeMl:
          entrada.volumeTotalMl,
      });
  
  
    const concentracaoMnO4MolL =
      concentracao({
        mols:
          distribuicao.molMnO4,
  
        volumeMl:
          entrada.volumeTotalMl,
      });
  
  
    const concentracaoMn2MolL =
      concentracao({
        mols:
          distribuicao.molMn2,
  
        volumeMl:
          entrada.volumeTotalMl,
      });
  
  
    const erroBalancoEletronicoMol =
      distribuicao
        .molFe3 -
      (
        5 *
        distribuicao
          .molMn2
      );
  
  
    return {
      potencialV,
  
      ...distribuicao,
  
      concentracaoFe2MolL,
  
      concentracaoFe3MolL,
  
      concentracaoMnO4MolL,
  
      concentracaoMn2MolL,
  
      erroBalancoEletronicoMol,
    };
  }