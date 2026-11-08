"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarCientificoPtBr = void 0;
/** Notação científica legível em pt-BR, sem e/E de programação. */
function formatarCientificoPtBr(valor, casas = 3) {
    if (!Number.isFinite(valor))
        return "—";
    if (valor === 0)
        return "0";
    const [mantissa, expoente] = valor.toExponential(casas).split("e");
    const mapa = {
        "-": "⁻", "+": "⁺", "0": "⁰", "1": "¹", "2": "²", "3": "³",
        "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    };
    const potencia = String(Number(expoente)).split("").map(c => mapa[c] ?? c).join("");
    return `${mantissa.replace(".", ",")} × 10${potencia}`;
}
exports.formatarCientificoPtBr = formatarCientificoPtBr;
