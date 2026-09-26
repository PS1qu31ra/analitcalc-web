import type {
    AtividadesRedox,
    EntradaCalculoNernst,
    ParRedox,
    ResultadoCalculoNernst,
    TermoQuocienteRedox,
  } from "./tipos";
  
  
  /* =========================================================
   * CONSTANTES FÍSICAS
   * ======================================================= */
  
  /**
   * Constante universal dos gases.
   *
   * Unidade:
   * J mol⁻¹ K⁻¹
   */
  const R =
    8.314462618;
  
  
  /**
   * Constante de Faraday.
   *
   * Unidade:
   * C mol⁻¹
   */
  const F =
    96485.33212;
  
  
  /**
   * Conversão Celsius → Kelvin.
   */
  const ZERO_CELSIUS_EM_KELVIN =
    273.15;
  
  
  /* =========================================================
   * VALIDAÇÕES
   * ======================================================= */
  
  function temperaturaValida(
    temperaturaC: number
  ) {
    return (
      Number.isFinite(
        temperaturaC
      ) &&
      temperaturaC >
        -ZERO_CELSIUS_EM_KELVIN
    );
  }
  
  
  function numeroEletronsValido(
    numeroEletrons: number
  ) {
    return (
      Number.isFinite(
        numeroEletrons
      ) &&
      Number.isInteger(
        numeroEletrons
      ) &&
      numeroEletrons > 0
    );
  }
  
  
  function atividadeValida(
    atividade: number
  ) {
    return (
      Number.isFinite(
        atividade
      ) &&
      atividade > 0
    );
  }
  
  
  /* =========================================================
   * PRODUTO DAS ATIVIDADES
   * ======================================================= */
  
  function calcularProdutoAtividades({
    termos,
    atividades,
  }: {
    termos:
      TermoQuocienteRedox[];
  
    atividades:
      AtividadesRedox;
  }) {
    let produto =
      1;
  
    for (
      const termo of termos
    ) {
      const atividade =
        atividades[
          termo.especieId
        ];
  
      if (
        !atividadeValida(
          atividade
        )
      ) {
        return {
          valido:
            false as const,
  
          produto:
            NaN,
  
          especieInvalida:
            termo.especieId,
        };
      }
  
      if (
        !Number.isFinite(
          termo.expoente
        ) ||
        termo.expoente <= 0
      ) {
        return {
          valido:
            false as const,
  
          produto:
            NaN,
  
          especieInvalida:
            termo.especieId,
        };
      }
  
      produto *=
        Math.pow(
          atividade,
          termo.expoente
        );
    }
  
    return {
      valido:
        true as const,
  
      produto,
  
      especieInvalida:
        null,
    };
  }
  
  
  /* =========================================================
   * QUOCIENTE DE REAÇÃO
   * ======================================================= */
  
  export function calcularQuocienteReacaoRedox({
    par,
    atividades,
  }: {
    par:
      ParRedox;
  
    atividades:
      AtividadesRedox;
  }) {
    const numerador =
      calcularProdutoAtividades({
        termos:
          par
            .quocienteReacao
            .numerador,
  
        atividades,
      });
  
    if (
      !numerador.valido
    ) {
      return {
        valido:
          false as const,
  
        quociente:
          NaN,
  
        mensagem:
          `Informe uma atividade positiva e finita para ${numerador.especieInvalida}.`,
      };
    }
  
    const denominador =
      calcularProdutoAtividades({
        termos:
          par
            .quocienteReacao
            .denominador,
  
        atividades,
      });
  
    if (
      !denominador.valido
    ) {
      return {
        valido:
          false as const,
  
        quociente:
          NaN,
  
        mensagem:
          `Informe uma atividade positiva e finita para ${denominador.especieInvalida}.`,
      };
    }
  
    if (
      denominador.produto <= 0 ||
      !Number.isFinite(
        denominador.produto
      )
    ) {
      return {
        valido:
          false as const,
  
        quociente:
          NaN,
  
        mensagem:
          "O denominador do quociente de reação deve ser positivo e finito.",
      };
    }
  
    const quociente =
      numerador.produto /
      denominador.produto;
  
    if (
      !Number.isFinite(
        quociente
      ) ||
      quociente <= 0
    ) {
      return {
        valido:
          false as const,
  
        quociente:
          NaN,
  
        mensagem:
          "Não foi possível calcular um quociente de reação positivo e finito.",
      };
    }
  
    return {
      valido:
        true as const,
  
      quociente,
  
      mensagem:
        "Quociente de reação calculado com sucesso.",
    };
  }
  
  
  /* =========================================================
   * FATOR DE NERNST
   * ======================================================= */
  
  /**
   * Retorna:
   *
   * 2,303 RT
   * --------
   *    nF
   *
   * para utilização com log10.
   *
   * Em 25 °C:
   *
   * aproximadamente
   * 0,05916 / n
   */
  export function calcularFatorNernst({
    temperaturaC = 25,
    numeroEletrons,
  }: {
    temperaturaC?: number;
    numeroEletrons: number;
  }) {
    if (
      !temperaturaValida(
        temperaturaC
      ) ||
      !numeroEletronsValido(
        numeroEletrons
      )
    ) {
      return NaN;
    }
  
    const temperaturaK =
      temperaturaC +
      ZERO_CELSIUS_EM_KELVIN;
  
    return (
      2.303 *
      R *
      temperaturaK
    ) /
      (
        numeroEletrons *
        F
      );
  }
  
  
  /* =========================================================
   * EQUAÇÃO DE NERNST
   * ======================================================= */
  
  /**
   * Para uma semirreação escrita no
   * sentido de redução:
   *
   * Ox + n e⁻ ⇌ Red
   *
   * E =
   *
   * E° - (2,303 RT / nF) log10(Q)
   */
  export function calcularPotencialNernst(
    entrada:
      EntradaCalculoNernst
  ): ResultadoCalculoNernst {
    const {
      par,
      atividades,
      temperaturaC = 25,
    } = entrada;
  
    const temperaturaK =
      temperaturaC +
      ZERO_CELSIUS_EM_KELVIN;
  
    if (
      !temperaturaValida(
        temperaturaC
      )
    ) {
      return {
        status:
          "dados_invalidos",
  
        par,
  
        temperaturaC,
        temperaturaK:
          NaN,
  
        numeroEletrons:
          par.numeroEletrons,
  
        potencialPadrao:
          par.potencialPadraoReducao,
  
        quocienteReacao:
          NaN,
  
        fatorNernst:
          NaN,
  
        potencial:
          NaN,
  
        mensagem:
          "Informe uma temperatura fisicamente válida.",
      };
    }
  
    if (
      !numeroEletronsValido(
        par.numeroEletrons
      )
    ) {
      return {
        status:
          "dados_invalidos",
  
        par,
  
        temperaturaC,
        temperaturaK,
  
        numeroEletrons:
          par.numeroEletrons,
  
        potencialPadrao:
          par.potencialPadraoReducao,
  
        quocienteReacao:
          NaN,
  
        fatorNernst:
          NaN,
  
        potencial:
          NaN,
  
        mensagem:
          "O número de elétrons da semirreação deve ser um número inteiro positivo.",
      };
    }
  
    if (
      !Number.isFinite(
        par.potencialPadraoReducao
      )
    ) {
      return {
        status:
          "dados_invalidos",
  
        par,
  
        temperaturaC,
        temperaturaK,
  
        numeroEletrons:
          par.numeroEletrons,
  
        potencialPadrao:
          par.potencialPadraoReducao,
  
        quocienteReacao:
          NaN,
  
        fatorNernst:
          NaN,
  
        potencial:
          NaN,
  
        mensagem:
          "O potencial padrão de redução do par redox é inválido.",
      };
    }
  
    const resultadoQ =
      calcularQuocienteReacaoRedox({
        par,
        atividades,
      });
  
    if (
      !resultadoQ.valido
    ) {
      return {
        status:
          "dados_invalidos",
  
        par,
  
        temperaturaC,
        temperaturaK,
  
        numeroEletrons:
          par.numeroEletrons,
  
        potencialPadrao:
          par.potencialPadraoReducao,
  
        quocienteReacao:
          NaN,
  
        fatorNernst:
          NaN,
  
        potencial:
          NaN,
  
        mensagem:
          resultadoQ.mensagem,
      };
    }
  
    const fatorNernst =
      calcularFatorNernst({
        temperaturaC,
  
        numeroEletrons:
          par.numeroEletrons,
      });
  
    const potencial =
      par.potencialPadraoReducao -
      fatorNernst *
        Math.log10(
          resultadoQ.quociente
        );
  
    if (
      !Number.isFinite(
        potencial
      )
    ) {
      return {
        status:
          "dados_invalidos",
  
        par,
  
        temperaturaC,
        temperaturaK,
  
        numeroEletrons:
          par.numeroEletrons,
  
        potencialPadrao:
          par.potencialPadraoReducao,
  
        quocienteReacao:
          resultadoQ.quociente,
  
        fatorNernst,
  
        potencial:
          NaN,
  
        mensagem:
          "Não foi possível calcular um potencial redox finito.",
      };
    }
  
    return {
      status:
        "ok",
  
      par,
  
      temperaturaC,
      temperaturaK,
  
      numeroEletrons:
        par.numeroEletrons,
  
      potencialPadrao:
        par.potencialPadraoReducao,
  
      quocienteReacao:
        resultadoQ.quociente,
  
      fatorNernst,
  
      potencial,
  
      mensagem:
        `Potencial calculado pela equação de Nernst para o par ${par.nome}.`,
    };
  }