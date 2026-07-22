const mapaSobrescrito: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
};

const CASAS_DECIMAIS_PADRAO = 2;
const MINIMO_CASAS_DECIMAIS = 0;
const MAXIMO_CASAS_DECIMAIS = 20;

function normalizarCasasDecimais(
  casas: number
): number {
  if (!Number.isFinite(casas)) {
    return CASAS_DECIMAIS_PADRAO;
  }

  const casasInteiras =
    Math.trunc(casas);

  return Math.min(
    Math.max(
      casasInteiras,
      MINIMO_CASAS_DECIMAIS
    ),
    MAXIMO_CASAS_DECIMAIS
  );
}

/**
 * Evita a exibição de valores como:
 *
 * -0,00
 * -0,000
 *
 * Pequenos valores negativos podem surgir por erros
 * normais de arredondamento em cálculos numéricos.
 */
function removerZeroNegativo(
  valor: number,
  casas: number
): number {
  if (!Number.isFinite(valor)) {
    return valor;
  }

  const limite =
    0.5 * Math.pow(10, -casas);

  return Math.abs(valor) < limite
    ? 0
    : valor;
}

/**
 * Formata um número no padrão brasileiro.
 *
 * Exemplos:
 *
 * formatarNumeroBR(12.3456)
 * → "12,35"
 *
 * formatarNumeroBR(1234.5, 3)
 * → "1.234,500"
 */
export function formatarNumeroBR(
  valor: number,
  casas = CASAS_DECIMAIS_PADRAO
): string {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  const casasNormalizadas =
    normalizarCasasDecimais(casas);

  const valorNormalizado =
    removerZeroNegativo(
      valor,
      casasNormalizadas
    );

  return valorNormalizado.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits:
        casasNormalizadas,

      maximumFractionDigits:
        casasNormalizadas,
    }
  );
}

/**
 * Converte números e sinais para caracteres
 * sobrescritos.
 *
 * Exemplos:
 *
 * 2   → ²
 * -3  → ⁻³
 * +2  → ⁺²
 * 1,5 → ¹,⁵
 *
 * Caracteres que não possuem representação no mapa
 * são mantidos como estão.
 */
export function formatarExpoenteSobrescrito(
  valor: number | string
): string {
  return String(valor)
    .split("")
    .map(
      (caractere) =>
        mapaSobrescrito[caractere] ??
        caractere
    )
    .join("");
}

/**
 * Formata uma base seguida de seu expoente.
 *
 * Exemplos:
 *
 * formatarPotenciaTexto("[Ag⁺]", 1)
 * → "[Ag⁺]"
 *
 * formatarPotenciaTexto("[Cl⁻]", 2)
 * → "[Cl⁻]²"
 */
export function formatarPotenciaTexto(
  base: string,
  expoente: number
): string {
  if (
    !Number.isFinite(expoente)
  ) {
    return base;
  }

  if (expoente === 1) {
    return base;
  }

  return (
    base +
    formatarExpoenteSobrescrito(
      expoente
    )
  );
}

/**
 * Formata um número em notação científica brasileira.
 *
 * Exemplos:
 *
 * formatarCientificoBR(1.8e-10)
 * → "1,80 × 10⁻¹⁰"
 *
 * formatarCientificoBR(0)
 * → "0,00"
 */
export function formatarCientificoBR(
  valor: number,
  casas = CASAS_DECIMAIS_PADRAO
): string {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  const casasNormalizadas =
    normalizarCasasDecimais(casas);

  const valorNormalizado =
    removerZeroNegativo(
      valor,
      casasNormalizadas
    );

  /*
   * Evita a apresentação desnecessária:
   *
   * 0,00 × 10⁰
   */
  if (valorNormalizado === 0) {
    return formatarNumeroBR(
      0,
      casasNormalizadas
    );
  }

  const notacaoCientifica =
    valorNormalizado.toExponential(
      casasNormalizadas
    );

  const [
    coeficienteBruto,
    expoenteBruto,
  ] = notacaoCientifica.split("e");

  const coeficiente =
    coeficienteBruto.replace(
      ".",
      ","
    );

  const expoente =
    Number(expoenteBruto);

  /*
   * Situação defensiva: toExponential normalmente
   * sempre gera coeficiente e expoente válidos.
   */
  if (
    !Number.isFinite(expoente)
  ) {
    return "-";
  }

  return (
    `${coeficiente} × 10` +
    formatarExpoenteSobrescrito(
      expoente
    )
  );
}