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

export function formatarNumeroBR(valor: number, casas = 2) {
  if (!Number.isFinite(valor)) return "-";

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarExpoenteSobrescrito(valor: number | string) {
  return String(valor)
    .split("")
    .map((caractere) => mapaSobrescrito[caractere] ?? caractere)
    .join("");
}

export function formatarPotenciaTexto(base: string, expoente: number) {
  if (expoente === 1) return base;

  return `${base}${formatarExpoenteSobrescrito(expoente)}`;
}

export function formatarCientificoBR(valor: number, casas = 2) {
  if (!Number.isFinite(valor)) return "-";

  const [coeficiente, expoente] = valor.toExponential(casas).split("e");

  return `${coeficiente.replace(".", ",")} × 10${formatarExpoenteSobrescrito(
    Number(expoente)
  )}`;
}