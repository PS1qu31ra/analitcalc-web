export const PKA1_ACIDO_OXALICO =
  1.252;


export const PKA2_ACIDO_OXALICO =
  4.266;


export const KA1_ACIDO_OXALICO =
  Math.pow(
    10,
    -PKA1_ACIDO_OXALICO
  );


export const KA2_ACIDO_OXALICO =
  Math.pow(
    10,
    -PKA2_ACIDO_OXALICO
  );


export type FracoesEspeciacaoOxalato = {
  fracaoH2C2O4:
    number;

  fracaoHC2O4:
    number;

  fracaoC2O4:
    number;
};


export function calcularFracoesEspeciacaoOxalato(
  concentracaoHPlusMolL:
    number
): FracoesEspeciacaoOxalato {
  if (
    !Number.isFinite(
      concentracaoHPlusMolL
    ) ||
    concentracaoHPlusMolL <=
      0
  ) {
    throw new Error(
      "A concentração de H⁺ deve ser positiva e finita."
    );
  }


  const h =
    concentracaoHPlusMolL;


  const denominador =
    h *
      h +
    KA1_ACIDO_OXALICO *
      h +
    KA1_ACIDO_OXALICO *
      KA2_ACIDO_OXALICO;


  return {
    fracaoH2C2O4:
      (
        h *
        h
      ) /
      denominador,

    fracaoHC2O4:
      (
        KA1_ACIDO_OXALICO *
        h
      ) /
      denominador,

    fracaoC2O4:
      (
        KA1_ACIDO_OXALICO *
        KA2_ACIDO_OXALICO
      ) /
      denominador,
  };
}