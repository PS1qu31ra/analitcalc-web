/**
 * Utilitários para tratamento de entradas numéricas.
 *
 * Aceita números escritos no padrão brasileiro:
 * - 0,1
 * - 1,5
 * - 2,5e-3
 *
 * Também aceita o padrão com ponto:
 * - 0.1
 * - 1.5
 * - 2.5e-3
 */

/**
 * Converte uma string numérica para number.
 *
 * Retorna Number.NaN quando a entrada estiver vazia,
 * for inválida ou produzir um valor não finito.
 */
export function converterNumeroBR(
    valor: string | number
  ): number {
    if (typeof valor === "number") {
      return Number.isFinite(valor)
        ? valor
        : Number.NaN;
    }
  
    const textoNormalizado =
      normalizarTextoNumerico(valor);
  
    if (textoNormalizado === "") {
      return Number.NaN;
    }
  
    const numero =
      Number(textoNormalizado);
  
    return Number.isFinite(numero)
      ? numero
      : Number.NaN;
  }
  
  /**
   * Converte uma entrada para um número estritamente positivo.
   *
   * Retorna null quando:
   * - a entrada não for numérica;
   * - o valor for zero;
   * - o valor for negativo;
   * - o valor não for finito.
   */
  export function converterNumeroPositivoBR(
    valor: string | number
  ): number | null {
    const numero =
      converterNumeroBR(valor);
  
    if (
      !Number.isFinite(numero) ||
      numero <= 0
    ) {
      return null;
    }
  
    return numero;
  }
  
  /**
   * Converte uma entrada para um número maior ou igual a zero.
   *
   * É útil para volumes adicionados, concentrações em excesso
   * e demais grandezas que podem assumir o valor zero.
   */
  export function converterNumeroNaoNegativoBR(
    valor: string | number
  ): number | null {
    const numero =
      converterNumeroBR(valor);
  
    if (
      !Number.isFinite(numero) ||
      numero < 0
    ) {
      return null;
    }
  
    return numero;
  }
  
  /**
   * Converte uma entrada para um número inteiro positivo.
   *
   * Pode ser utilizado para:
   * - quantidade de pontos do gráfico;
   * - número de subdivisões;
   * - quantidade de casas ou amostras.
   */
  export function converterInteiroPositivoBR(
    valor: string | number
  ): number | null {
    const numero =
      converterNumeroBR(valor);
  
    if (
      !Number.isInteger(numero) ||
      numero <= 0
    ) {
      return null;
    }
  
    return numero;
  }
  
  /**
   * Converte uma entrada para um número inteiro não negativo.
   */
  export function converterInteiroNaoNegativoBR(
    valor: string | number
  ): number | null {
    const numero =
      converterNumeroBR(valor);
  
    if (
      !Number.isInteger(numero) ||
      numero < 0
    ) {
      return null;
    }
  
    return numero;
  }
  
  /**
   * Verifica se uma entrada representa um número finito.
   */
  export function entradaNumericaValida(
    valor: string | number
  ): boolean {
    return Number.isFinite(
      converterNumeroBR(valor)
    );
  }
  
  /**
   * Verifica se uma entrada representa um número positivo.
   */
  export function entradaNumericaPositiva(
    valor: string | number
  ): boolean {
    const numero =
      converterNumeroBR(valor);
  
    return (
      Number.isFinite(numero) &&
      numero > 0
    );
  }
  
  /**
   * Verifica se uma entrada representa um número não negativo.
   */
  export function entradaNumericaNaoNegativa(
    valor: string | number
  ): boolean {
    const numero =
      converterNumeroBR(valor);
  
    return (
      Number.isFinite(numero) &&
      numero >= 0
    );
  }
  
  /**
   * Normaliza uma entrada textual para conversão.
   *
   * Exemplos:
   * " 0,025 "  -> "0.025"
   * "1,5e-3"   -> "1.5e-3"
   * "2.5E-4"   -> "2.5E-4"
   */
  export function normalizarTextoNumerico(
    valor: string
  ): string {
    const texto =
      valor
        .trim()
        .replace(/\s+/g, "");
  
    if (texto === "") {
      return "";
    }
  
    /*
     * Quando existem ponto e vírgula:
     *
     * 1.234,56 é interpretado como padrão brasileiro.
     * 1,234.56 é interpretado como padrão internacional.
     */
    if (
      texto.includes(",") &&
      texto.includes(".")
    ) {
      const ultimaVirgula =
        texto.lastIndexOf(",");
  
      const ultimoPonto =
        texto.lastIndexOf(".");
  
      if (
        ultimaVirgula >
        ultimoPonto
      ) {
        return texto
          .replace(/\./g, "")
          .replace(",", ".");
      }
  
      return texto.replace(/,/g, "");
    }
  
    /*
     * Quando existe apenas vírgula,
     * ela é tratada como separador decimal.
     */
    if (texto.includes(",")) {
      return texto.replace(",", ".");
    }
  
    return texto;
  }
  
  /**
   * Limpa caracteres incompatíveis com uma entrada científica.
   *
   * Mantém:
   * - algarismos;
   * - ponto;
   * - vírgula;
   * - sinais positivo e negativo;
   * - notação científica e/E.
   *
   * Esta função deve ser usada com cuidado no onChange.
   * Ela não garante sozinha que o texto final seja um número válido.
   */
  export function sanitizarEntradaNumerica(
    valor: string
  ): string {
    return valor.replace(
      /[^\d,.\-+eE]/g,
      ""
    );
  }
  
  /**
   * Restringe um número a um intervalo.
   */
  export function limitarNumero(
    valor: number,
    minimo: number,
    maximo: number
  ): number {
    if (
      !Number.isFinite(minimo) ||
      !Number.isFinite(maximo)
    ) {
      throw new Error(
        "Os limites precisam ser números finitos."
      );
    }
  
    if (minimo > maximo) {
      throw new Error(
        "O limite mínimo não pode ser maior que o máximo."
      );
    }
  
    if (!Number.isFinite(valor)) {
      return minimo;
    }
  
    return Math.min(
      Math.max(valor, minimo),
      maximo
    );
  }
  
  /**
   * Ajusta o valor de uma entrada textual por um fator.
   *
   * Pode ser usado nos botões:
   * - multiplicar por 10;
   * - dividir por 10;
   * - aumentar ou reduzir concentração.
   */
  export function ajustarValorTexto(
    valorAtual: string,
    fator: number,
    valorPadrao = 1e-5
  ): string {
    const valorNumerico =
      converterNumeroBR(valorAtual);
  
    if (
      !Number.isFinite(fator) ||
      fator <= 0
    ) {
      return formatarNumeroCientifico(
        valorPadrao
      );
    }
  
    const valorInicial =
      Number.isFinite(valorNumerico) &&
      valorNumerico > 0
        ? valorNumerico
        : valorPadrao;
  
    const novoValor =
      valorInicial * fator;
  
    if (
      !Number.isFinite(novoValor) ||
      novoValor <= 0
    ) {
      return formatarNumeroCientifico(
        valorPadrao
      );
    }
  
    return formatarNumeroCientifico(
      novoValor
    );
  }
  
  /**
   * Mantém compatibilidade com o nome usado anteriormente
   * para alteração de concentrações.
   */
  export function ajustarConcentracaoTexto(
    valorAtual: string,
    fator: number,
    valorPadrao = 1e-5
  ): string {
    return ajustarValorTexto(
      valorAtual,
      fator,
      valorPadrao
    );
  }
  
  /**
   * Formata um número em notação científica adequada
   * para ser reutilizada em campos de entrada.
   */
  export function formatarNumeroCientifico(
    valor: number,
    casasSignificativas = 6
  ): string {
    if (!Number.isFinite(valor)) {
      return "";
    }
  
    const casas =
      limitarNumero(
        Math.trunc(casasSignificativas),
        0,
        15
      );
  
    return valor
      .toExponential(casas)
      .replace(/e\+/, "e");
  }
  
  /**
   * Formata um número decimal para apresentação.
   *
   * Esta função é voltada à interface, não aos campos de entrada.
   */
  export function formatarNumeroDecimalBR(
    valor: number,
    casasDecimais = 4
  ): string {
    if (!Number.isFinite(valor)) {
      return "—";
    }
  
    const casas =
      limitarNumero(
        Math.trunc(casasDecimais),
        0,
        15
      );
  
    return valor.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: casas,
      }
    );
  }
  
  /**
   * Formata automaticamente em decimal ou notação científica.
   *
   * Valores muito pequenos ou muito grandes são exibidos
   * em notação científica.
   */
  export function formatarNumeroAutomaticoBR(
    valor: number,
    casasSignificativas = 4
  ): string {
    if (!Number.isFinite(valor)) {
      return "—";
    }
  
    if (valor === 0) {
      return "0";
    }
  
    const modulo =
      Math.abs(valor);
  
    if (
      modulo < 1e-3 ||
      modulo >= 1e5
    ) {
      return valor
        .toExponential(
          limitarNumero(
            Math.trunc(
              casasSignificativas
            ),
            0,
            15
          )
        )
        .replace(".", ",")
        .replace(/e\+/, "e");
    }
  
    return formatarNumeroDecimalBR(
      valor,
      casasSignificativas
    );
  }
  
  /**
   * Compara dois números considerando uma tolerância.
   *
   * Será útil para reconhecer:
   * - proximidade do ponto de equivalência;
   * - coincidência entre volumes;
   * - valores quase iguais devido ao arredondamento.
   */
  export function numerosAproximadamenteIguais(
    valorA: number,
    valorB: number,
    toleranciaAbsoluta = 1e-12,
    toleranciaRelativa = 1e-9
  ): boolean {
    if (
      !Number.isFinite(valorA) ||
      !Number.isFinite(valorB)
    ) {
      return false;
    }
  
    const diferenca =
      Math.abs(valorA - valorB);
  
    if (
      diferenca <=
      toleranciaAbsoluta
    ) {
      return true;
    }
  
    const maiorModulo =
      Math.max(
        Math.abs(valorA),
        Math.abs(valorB)
      );
  
    return (
      diferenca <=
      maiorModulo *
        toleranciaRelativa
    );
  }