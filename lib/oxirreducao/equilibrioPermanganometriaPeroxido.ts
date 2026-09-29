import {
    PAR_OXIGENIO_PEROXIDO,
    PAR_PERMANGANATO_MANGANES,
  } from "./dadosRedox";
  
  import {
    calcularFatorNernst,
  } from "./nernst";
  
  
  /* =========================================================
   * TIPOS
   * ======================================================= */
  
  export type EntradaEquilibrioPermanganometriaPeroxido = {
    /**
     * Quantidade analítica total de H₂O₂
     * inicialmente presente na amostra.
     */
    molH2O2Total: number;
  
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
     */
    concentracaoHPlusMolL: number;
  
    /**
     * Atividade adotada para O₂(g).
     *
     * O O₂ é tratado como espécie gasosa.
     * Sua atividade é uma condição externa
     * do modelo termodinâmico.
     */
    atividadeOxigenio: number;
  
    temperaturaC?: number;
  };
  
  
  export type ResultadoEquilibrioPermanganometriaPeroxido = {
    potencialV:
      number | null;
  
    molH2O2:
      number;
  
    molO2:
      number;
  
    molMnO4:
      number;
  
    molMn2:
      number;
  
    concentracaoH2O2MolL:
      number;
  
    concentracaoMnO4MolL:
      number;
  
    concentracaoMn2MolL:
      number;
  
    erroBalancoEstequiometricoMol:
      number;
  };
  
  
  /* =========================================================
   * ESTEQUIOMETRIA
   * ======================================================= */
  
  /**
   * 2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺
   * →
   * 2 Mn²⁺ + 5 O₂ + 8 H₂O
   *
   * Cada 1 mol de MnO₄⁻ reduzido
   * consome 2,5 mol de H₂O₂.
   */
  const H2O2_POR_MNO4 =
    5 /
    2;
  
  
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
  
  
  function potencia10Limitada(
    expoente: number
  ) {
    return Math.pow(
      10,
      Math.min(
        Math.max(
          expoente,
          -300
        ),
        300
      )
    );
  }
  
  
  function calcularFracoesRazao(
    logRazao: number
  ) {
    if (
      logRazao >=
      0
    ) {
      const inverso =
        potencia10Limitada(
          -logRazao
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
      potencia10Limitada(
        logRazao
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
    molH2O2Total,
    molMnTotal,
    volumeTotalMl,
    concentracaoHPlusMolL,
    atividadeOxigenio,
    temperaturaC,
  }: {
    potencialV: number;
  
    molH2O2Total: number;
  
    molMnTotal: number;
  
    volumeTotalMl: number;
  
    concentracaoHPlusMolL: number;
  
    atividadeOxigenio: number;
  
    temperaturaC: number;
  }) {
    const fatorPeroxido =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          2,
      });
  
  
    const fatorMn =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          5,
      });
  
  
    /*
     * O₂ + 2H⁺ + 2e⁻ ⇌ H₂O₂
     *
     * E =
     * E° -
     * f log[
     *   a(H₂O₂) /
     *   (a(O₂) a(H⁺)²)
     * ]
     *
     * então:
     *
     * log a(H₂O₂)
     * =
     * log a(O₂)
     * + 2 log a(H⁺)
     * + (E° - E)/f
     */
  
    const logConcentracaoH2O2 =
      Math.log10(
        atividadeOxigenio
      ) +
      2 *
        Math.log10(
          concentracaoHPlusMolL
        ) +
      (
        PAR_OXIGENIO_PEROXIDO
          .potencialPadraoReducao -
        potencialV
      ) /
        fatorPeroxido;
  
  
    const concentracaoH2O2Calculada =
      potencia10Limitada(
        logConcentracaoH2O2
      );
  
  
    const molH2O2 =
      concentracaoH2O2Calculada *
      (
        volumeTotalMl /
        1000
      );
  
  
    /*
     * MnO₄⁻ + 8H⁺ + 5e⁻
     * ⇌
     * Mn²⁺ + 4H₂O
     *
     * log(Mn²⁺/MnO₄⁻)
     * =
     * (E° - E)/f
     * + 8 log(H⁺)
     */
  
    const logRazaoMn =
      (
        PAR_PERMANGANATO_MANGANES
          .potencialPadraoReducao -
        potencialV
      ) /
        fatorMn +
      8 *
        Math.log10(
          concentracaoHPlusMolL
        );
  
  
    const fracoesMn =
      calcularFracoesRazao(
        logRazaoMn
      );
  
  
    const molMn2 =
      molMnTotal *
      fracoesMn
        .fracaoNumerador;
  
  
    const molMnO4 =
      molMnTotal *
      fracoesMn
        .fracaoDenominador;
  
  
    const molH2O2Consumido =
      molH2O2Total -
      molH2O2;
  
  
    /*
     * Cada mol de H₂O₂ oxidado
     * gera um mol de O₂.
     *
     * O número de mols é mostrado
     * como informação estequiométrica.
     * A atividade de O₂ usada em Nernst
     * permanece uma condição externa.
     */
    const molO2 =
      Math.max(
        molH2O2Consumido,
        0
      );
  
  
    return {
      molH2O2,
      molO2,
      molMnO4,
      molMn2,
    };
  }
  
  
  /* =========================================================
   * RESÍDUO DO BALANÇO
   * ======================================================= */
  
  function calcularResiduo({
    potencialV,
    molH2O2Total,
    molMnTotal,
    volumeTotalMl,
    concentracaoHPlusMolL,
    atividadeOxigenio,
    temperaturaC,
  }: {
    potencialV: number;
  
    molH2O2Total: number;
  
    molMnTotal: number;
  
    volumeTotalMl: number;
  
    concentracaoHPlusMolL: number;
  
    atividadeOxigenio: number;
  
    temperaturaC: number;
  }) {
    const distribuicao =
      calcularDistribuicao({
        potencialV,
  
        molH2O2Total,
  
        molMnTotal,
  
        volumeTotalMl,
  
        concentracaoHPlusMolL,
  
        atividadeOxigenio,
  
        temperaturaC,
      });
  
  
    /*
     * Balanço original:
     *
     * H₂O₂ consumido
     * =
     * (5/2) Mn²⁺ formado
     *
     * ou:
     *
     * n(H₂O₂,total) - n(H₂O₂)
     * =
     * (5/2)
     * [
     *   n(Mn,total) - n(MnO₄⁻)
     * ]
     *
     *
     * Rearranjando:
     *
     * n(H₂O₂,total)
     * - (5/2)n(Mn,total)
     * - n(H₂O₂)
     * + (5/2)n(MnO₄⁻)
     * =
     * 0
     *
     *
     * Esta forma é numericamente mais estável
     * próximo ao PE porque evita subtrair
     * quantidades praticamente iguais para
     * calcular H₂O₂ consumido e Mn²⁺ formado.
     */
  
    return (
      (
        molH2O2Total -
        H2O2_POR_MNO4 *
          molMnTotal
      ) -
      distribuicao
        .molH2O2 +
      H2O2_POR_MNO4 *
        distribuicao
          .molMnO4
    );
  }
  
  
  /* =========================================================
   * RESOLVEDOR
   * ======================================================= */
  
  export function resolverEquilibrioPermanganometriaPeroxido(
    entrada:
      EntradaEquilibrioPermanganometriaPeroxido
  ): ResultadoEquilibrioPermanganometriaPeroxido {
    validarNumeroPositivo(
      entrada.molH2O2Total,
      "A quantidade total de H₂O₂"
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
  
  
    validarNumeroPositivo(
      entrada
        .atividadeOxigenio,
      "A atividade de O₂"
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
     * não existe o segundo par redox
     * disponível para o modelo acoplado.
     */
    if (
      entrada.molMnTotal ===
      0
    ) {
      return {
        potencialV:
          null,
  
        molH2O2:
          entrada.molH2O2Total,
  
        molO2:
          0,
  
        molMnO4:
          0,
  
        molMn2:
          0,
  
        concentracaoH2O2MolL:
          concentracao({
            mols:
              entrada.molH2O2Total,
  
            volumeMl:
              entrada.volumeTotalMl,
          }),
  
        concentracaoMnO4MolL:
          0,
  
        concentracaoMn2MolL:
          0,
  
        erroBalancoEstequiometricoMol:
          0,
      };
    }
  
  
    const fatorPeroxido =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          2,
      });
  
  
    const fatorMn =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          5,
      });
  
  
    const potencialFormalPeroxido =
      PAR_OXIGENIO_PEROXIDO
        .potencialPadraoReducao +
      fatorPeroxido *
        Math.log10(
          entrada
            .atividadeOxigenio
        ) +
      2 *
        fatorPeroxido *
        Math.log10(
          entrada
            .concentracaoHPlusMolL
        );
  
  
    const potencialFormalMn =
      PAR_PERMANGANATO_MANGANES
        .potencialPadraoReducao +
      8 *
        fatorMn *
        Math.log10(
          entrada
            .concentracaoHPlusMolL
        );
  
  
    let limiteInferior =
      Math.min(
        potencialFormalPeroxido,
        potencialFormalMn
      ) -
      2;
  
  
    let limiteSuperior =
      Math.max(
        potencialFormalPeroxido,
        potencialFormalMn
      ) +
      2;
  
  
    let residuoInferior =
      calcularResiduo({
        potencialV:
          limiteInferior,
  
        molH2O2Total:
          entrada.molH2O2Total,
  
        molMnTotal:
          entrada.molMnTotal,
  
        volumeTotalMl:
          entrada.volumeTotalMl,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        atividadeOxigenio:
          entrada
            .atividadeOxigenio,
  
        temperaturaC,
      });
  
  
    let residuoSuperior =
      calcularResiduo({
        potencialV:
          limiteSuperior,
  
        molH2O2Total:
          entrada.molH2O2Total,
  
        molMnTotal:
          entrada.molMnTotal,
  
        volumeTotalMl:
          entrada.volumeTotalMl,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        atividadeOxigenio:
          entrada
            .atividadeOxigenio,
  
        temperaturaC,
      });
  
  
    /*
     * Em condições extremas,
     * expandimos a faixa.
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
  
            molH2O2Total:
              entrada.molH2O2Total,
  
            molMnTotal:
              entrada.molMnTotal,
  
            volumeTotalMl:
              entrada.volumeTotalMl,
  
            concentracaoHPlusMolL:
              entrada
                .concentracaoHPlusMolL,
  
            atividadeOxigenio:
              entrada
                .atividadeOxigenio,
  
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
  
            molH2O2Total:
              entrada.molH2O2Total,
  
            molMnTotal:
              entrada.molMnTotal,
  
            volumeTotalMl:
              entrada.volumeTotalMl,
  
            concentracaoHPlusMolL:
              entrada
                .concentracaoHPlusMolL,
  
            atividadeOxigenio:
              entrada
                .atividadeOxigenio,
  
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
        "Não foi possível localizar o equilíbrio eletroquímico do sistema H₂O₂/MnO₄⁻."
      );
    }
  
  
    /*
     * Bisseção no potencial.
     *
     * Procuramos simultaneamente:
     *
     * E(O₂/H₂O₂)
     * =
     * E(MnO₄⁻/Mn²⁺)
     *
     * e:
     *
     * n(H₂O₂ consumido)
     * =
     * (5/2) n(Mn²⁺)
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
  
          molH2O2Total:
            entrada.molH2O2Total,
  
          molMnTotal:
            entrada.molMnTotal,
  
          volumeTotalMl:
            entrada.volumeTotalMl,
  
          concentracaoHPlusMolL:
            entrada
              .concentracaoHPlusMolL,
  
          atividadeOxigenio:
            entrada
              .atividadeOxigenio,
  
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
  
        molH2O2Total:
          entrada.molH2O2Total,
  
        molMnTotal:
          entrada.molMnTotal,
  
        volumeTotalMl:
          entrada.volumeTotalMl,
  
        concentracaoHPlusMolL:
          entrada
            .concentracaoHPlusMolL,
  
        atividadeOxigenio:
          entrada
            .atividadeOxigenio,
  
        temperaturaC,
      });
  
  
    const concentracaoH2O2MolL =
      concentracao({
        mols:
          distribuicao.molH2O2,
  
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
  
  
    const molH2O2Consumido =
      entrada.molH2O2Total -
      distribuicao
        .molH2O2;
  
  
    const erroBalancoEstequiometricoMol =
      molH2O2Consumido -
      H2O2_POR_MNO4 *
        distribuicao
          .molMn2;
  
  
    return {
      potencialV,
  
      ...distribuicao,
  
      concentracaoH2O2MolL,
  
      concentracaoMnO4MolL,
  
      concentracaoMn2MolL,
  
      erroBalancoEstequiometricoMol,
    };
  }