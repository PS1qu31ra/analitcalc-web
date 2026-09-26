/* =========================================================
 * TIPOS
 * ======================================================= */

export type RegiaoTitulacaoRedox =
  | "antes_pe"
  | "pe"
  | "apos_pe";


export type EntradaVolumeEquivalencia = {
  concentracaoAnalitoMolL: number;
  volumeAnalitoMl: number;

  concentracaoTitulanteMolL: number;

  /**
   * Coeficientes da reação global.
   *
   * Exemplo:
   *
   * MnO₄⁻ + 5 Fe²⁺
   *
   * coeficienteAnalito = 5
   * coeficienteTitulante = 1
   */
  coeficienteAnalito: number;
  coeficienteTitulante: number;
};


export type ResultadoVolumeEquivalencia = {
  molAnalitoInicial: number;

  molTitulanteEquivalencia: number;

  volumeEquivalenciaMl: number;

  razaoAnalitoPorTitulante: number;
};


/* =========================================================
 * VALIDAÇÕES
 * ======================================================= */

function numeroPositivo(
  valor: number
) {
  return (
    Number.isFinite(
      valor
    ) &&
    valor > 0
  );
}


/* =========================================================
 * MOL
 * ======================================================= */

/**
 * n = C × V
 *
 * Volume informado em mL.
 * Resultado em mol.
 */
export function calcularMols({
  concentracaoMolL,
  volumeMl,
}: {
  concentracaoMolL: number;
  volumeMl: number;
}) {
  if (
    !numeroPositivo(
      concentracaoMolL
    ) ||
    !Number.isFinite(
      volumeMl
    ) ||
    volumeMl < 0
  ) {
    return NaN;
  }

  return (
    concentracaoMolL *
    (
      volumeMl /
      1000
    )
  );
}


/* =========================================================
 * VOLUME
 * ======================================================= */

/**
 * V = n / C
 *
 * Retorna volume em mL.
 */
export function calcularVolumeMl({
  mols,
  concentracaoMolL,
}: {
  mols: number;
  concentracaoMolL: number;
}) {
  if (
    !Number.isFinite(
      mols
    ) ||
    mols < 0 ||
    !numeroPositivo(
      concentracaoMolL
    )
  ) {
    return NaN;
  }

  return (
    mols /
    concentracaoMolL
  ) *
    1000;
}


/* =========================================================
 * CONCENTRAÇÃO APÓS MISTURA
 * ======================================================= */

/**
 * C = n / Vtotal
 *
 * O volume total deve ser informado
 * em mL.
 */
export function calcularConcentracaoAposMistura({
  mols,
  volumeTotalMl,
}: {
  mols: number;
  volumeTotalMl: number;
}) {
  if (
    !Number.isFinite(
      mols
    ) ||
    mols < 0 ||
    !numeroPositivo(
      volumeTotalMl
    )
  ) {
    return NaN;
  }

  return (
    mols /
    (
      volumeTotalMl /
      1000
    )
  );
}


/* =========================================================
 * VOLUME DE EQUIVALÊNCIA
 * ======================================================= */

export function calcularVolumeEquivalencia(
  entrada:
    EntradaVolumeEquivalencia
): ResultadoVolumeEquivalencia {
  const {
    concentracaoAnalitoMolL,
    volumeAnalitoMl,
    concentracaoTitulanteMolL,
    coeficienteAnalito,
    coeficienteTitulante,
  } = entrada;

  if (
    !numeroPositivo(
      concentracaoAnalitoMolL
    ) ||
    !numeroPositivo(
      volumeAnalitoMl
    ) ||
    !numeroPositivo(
      concentracaoTitulanteMolL
    ) ||
    !numeroPositivo(
      coeficienteAnalito
    ) ||
    !numeroPositivo(
      coeficienteTitulante
    )
  ) {
    throw new Error(
      "Os dados estequiométricos devem ser positivos e finitos."
    );
  }

  const molAnalitoInicial =
    calcularMols({
      concentracaoMolL:
        concentracaoAnalitoMolL,

      volumeMl:
        volumeAnalitoMl,
    });

  /*
   * Pela reação:
   *
   * coefAnalito mol analito
   * -----------------------
   * coefTitulante mol titulante
   */

  const molTitulanteEquivalencia =
    molAnalitoInicial *
    (
      coeficienteTitulante /
      coeficienteAnalito
    );

  const volumeEquivalenciaMl =
    calcularVolumeMl({
      mols:
        molTitulanteEquivalencia,

      concentracaoMolL:
        concentracaoTitulanteMolL,
    });

  return {
    molAnalitoInicial,

    molTitulanteEquivalencia,

    volumeEquivalenciaMl,

    razaoAnalitoPorTitulante:
      coeficienteAnalito /
      coeficienteTitulante,
  };
}


/* =========================================================
 * REGIÃO DA TITULAÇÃO
 * ======================================================= */

export function determinarRegiaoTitulacao({
  volumeAdicionadoMl,
  volumeEquivalenciaMl,
  toleranciaMl = 1e-9,
}: {
  volumeAdicionadoMl: number;
  volumeEquivalenciaMl: number;
  toleranciaMl?: number;
}): RegiaoTitulacaoRedox {
  if (
    !Number.isFinite(
      volumeAdicionadoMl
    ) ||
    volumeAdicionadoMl < 0
  ) {
    throw new Error(
      "O volume adicionado deve ser maior ou igual a zero."
    );
  }

  if (
    !numeroPositivo(
      volumeEquivalenciaMl
    )
  ) {
    throw new Error(
      "O volume de equivalência deve ser positivo."
    );
  }

  if (
    !Number.isFinite(
      toleranciaMl
    ) ||
    toleranciaMl < 0
  ) {
    throw new Error(
      "A tolerância deve ser maior ou igual a zero."
    );
  }

  const diferenca =
    volumeAdicionadoMl -
    volumeEquivalenciaMl;

  if (
    Math.abs(
      diferenca
    ) <=
    toleranciaMl
  ) {
    return "pe";
  }

  if (
    diferenca < 0
  ) {
    return "antes_pe";
  }

  return "apos_pe";
}