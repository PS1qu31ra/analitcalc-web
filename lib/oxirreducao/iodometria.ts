import { calcularDerivadasRedox } from "./derivadas";

/* =========================================================
 * IODOMETRIA — DADOS, ESTEQUIOMETRIA E MOTOR POTENCIOMÉTRICO
 * ======================================================= */

export type SistemaIodometriaId =
  | "cloro-ativo"
  | "cobre-ii"
  | "oxigenio-dissolvido"
  | "peroxido-hidrogenio"
  | "hipoclorito"
  | "iodato";

export type SemirreacaoIodometria = {
  titulo: string;
  equacao: string;
  eletrons: number;
  potencialPadraoV: number | null;
  observacao?: string;
};

export type SistemaIodometria = {
  id: SistemaIodometriaId;
  nome: string;
  formulaAnalito: string;
  nomeCompleto: string;
  descricao: string;
  titulante: string;
  indicador: string;
  semirreacoes: SemirreacaoIodometria[];
  etapasPreTitulacao: string[];
  reacaoGlobalGeracaoIodo: string;
  eletronsGeracaoIodo: number;
  molI3PorMolAnalito: number;
  molTiossulfatoPorMolAnalito: number;
  /** Mol de I⁻ consumido por mol de analito na reação global que forma I₃⁻.
   * Inclui o iodeto que é incorporado ao triiodeto, além do iodeto oxidado.
   */
  molIodetoConsumidoPorMolAnalito: number;
  relacaoPrimeiraEtapa: string;
  relacaoSegundaEtapa: string;
  relacaoGlobal: string;
  igualdadeMolsPrimeiraEtapa: string;
  igualdadeMolsSegundaEtapa: string;
  igualdadeMolsGlobal: string;
  agenteOxidantePrimeiraEtapa: string;
  agenteRedutorPrimeiraEtapa: string;
  observacao: string;
  concentracaoAnalitoPadraoMolL: number;
  concentracaoTiossulfatoPadraoMolL: number;
};

/**
 * Potencial padrão de redução adotado para o par triiodeto/iodeto:
 *
 * I₃⁻ + 2 e⁻ ⇌ 3 I⁻
 *
 * Valor de referência utilizado pela metodologia da orientadora: +0,536 V
 * a 25 °C. O motor trabalha diretamente com I₃⁻; não converte o potencial
 * a partir de I₂(aq), nem resolve o equilíbrio de formação I₂/I₃⁻.
 */
export const E0_I3_I_25C = 0.536;

/** Potencial padrão de redução do par tetrationato/tiossulfato:
 * S₄O₆²⁻ + 2 e⁻ ⇌ 2 S₂O₃²⁻.
 */
export const E0_TETRATIONATO_TIOS = 0.080;

/** Número de elétrons de cada par na etapa titulométrica. */
export const ELETRONS_PAR_I3_I = 2;
export const ELETRONS_PAR_TETRATIONATO_TIOS = 2;

/** Constante de Nernst usada nos slides a 25 °C (V por década, para n = 1). */
export const FATOR_NERNST_25C = 0.0592;

export const REACAO_TIOS =
  "I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻";

export const EQUILIBRIO_TRIIODeto =
  "I₂ + I⁻ ⇌ I₃⁻";

export const SEMIRREACAO_IODO =
  "I₃⁻ + 2 e⁻ ⇌ 3 I⁻";

export const SEMIRREACAO_TIOS =
  "S₄O₆²⁻ + 2 e⁻ ⇌ 2 S₂O₃²⁻";

export const TEXTO_INDICADOR_AMIDO =
  "O amido é empregado próximo ao ponto final porque a amilose organiza-se em uma estrutura helicoidal capaz de formar um complexo de inclusão tridimensional com espécies de iodo, especialmente I₃⁻, produzindo coloração azul intensa. À medida que o iodo é consumido pelo tiossulfato, a coloração desaparece.";

export const sistemasIodometria: SistemaIodometria[] = [
  {
    id: "cloro-ativo",
    nome: "Cloro ativo",
    formulaAnalito: "Cl₂",
    nomeCompleto: "Cloro ativo — expresso como Cl₂",
    descricao:
      "O cloro oxida iodeto; em KI em excesso, o iodo gerado aparece predominantemente como I₃⁻ e é titulado com tiossulfato.",
    titulante: "Na₂S₂O₃",
    indicador: "Amido",
    semirreacoes: [
      {
        titulo: "Redução do analito",
        equacao: "Cl₂ + 2 e⁻ ⇌ 2 Cl⁻",
        eletrons: 2,
        potencialPadraoV: 1.35827,
      },
      {
        titulo: "Oxidação do iodeto",
        equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I3_I_25C,
        observacao:
          "O valor exibido é o E° de redução do par I₃⁻/I⁻; a semirreação está escrita no sentido de oxidação para compor a reação global.",
      },
    ],
    etapasPreTitulacao: [
      "Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻",
    ],
    reacaoGlobalGeracaoIodo:
      "Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻",
    eletronsGeracaoIodo: 2,
    molI3PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    molIodetoConsumidoPorMolAnalito: 3,
    relacaoPrimeiraEtapa: "1 Cl₂ : 1 I₃⁻",
    relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 Cl₂ : 1 I₃⁻ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = n(Cl₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
    igualdadeMolsGlobal: "n(S₂O₃²⁻) = 2 n(Cl₂)",
    agenteOxidantePrimeiraEtapa: "Cl₂",
    agenteRedutorPrimeiraEtapa: "I⁻",
    observacao:
      "O cloro ativo é expresso como Cl₂. O iodeto deve estar em excesso para garantir geração quantitativa de iodo.",
    concentracaoAnalitoPadraoMolL: 0.01,
    concentracaoTiossulfatoPadraoMolL: 0.02,
  },
  {
    id: "cobre-ii",
    nome: "Cobre(II)",
    formulaAnalito: "Cu²⁺",
    nomeCompleto: "Cobre(II) — Cu²⁺",
    descricao:
      "Cu²⁺ reage com iodeto e forma CuI(s); o iodo oxidado permanece predominantemente como I₃⁻ em excesso de KI.",
    titulante: "Na₂S₂O₃",
    indicador: "Amido",
    semirreacoes: [
      {
        titulo: "Redução de Cu²⁺ com precipitação",
        equacao: "Cu²⁺ + I⁻ + e⁻ ⇌ CuI(s)",
        eletrons: 1,
        potencialPadraoV: 0.86,
        observacao:
          "O potencial considera a formação de CuI(s), que desloca a reação para a formação de Cu(I).",
      },
      {
        titulo: "Oxidação do iodeto",
        equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I3_I_25C,
      },
    ],
    etapasPreTitulacao: [
      "2 Cu²⁺ + 5 I⁻ → 2 CuI(s) + I₃⁻",
    ],
    reacaoGlobalGeracaoIodo:
      "2 Cu²⁺ + 5 I⁻ → 2 CuI(s) + I₃⁻",
    eletronsGeracaoIodo: 2,
    molI3PorMolAnalito: 0.5,
    molTiossulfatoPorMolAnalito: 1,
    molIodetoConsumidoPorMolAnalito: 2.5,
    relacaoPrimeiraEtapa: "2 Cu²⁺ : 1 I₃⁻",
    relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
    relacaoGlobal: "2 Cu²⁺ : 1 I₃⁻ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = ½ n(Cu²⁺)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
    igualdadeMolsGlobal: "n(S₂O₃²⁻) = n(Cu²⁺)",
    agenteOxidantePrimeiraEtapa: "Cu²⁺",
    agenteRedutorPrimeiraEtapa: "I⁻",
    observacao:
      "A formação do precipitado CuI remove Cu(I) do meio e favorece a reação quantitativa com iodeto.",
    concentracaoAnalitoPadraoMolL: 0.02,
    concentracaoTiossulfatoPadraoMolL: 0.02,
  },
  {
    id: "oxigenio-dissolvido",
    nome: "Oxigênio dissolvido",
    formulaAnalito: "O₂",
    nomeCompleto: "Oxigênio dissolvido — O₂ (Winkler)",
    descricao:
      "O método de Winkler fixa o O₂ por espécies de manganês; após acidificação, iodo equivalente ao O₂ original é liberado e titulado.",
    titulante: "Na₂S₂O₃",
    indicador: "Amido",
    semirreacoes: [
      {
        titulo: "Referência termodinâmica do O₂",
        equacao: "O₂ + 4 H⁺ + 4 e⁻ ⇌ 2 H₂O",
        eletrons: 4,
        potencialPadraoV: 1.229,
        observacao:
          "É uma referência termodinâmica. No método de Winkler, o O₂ não é titulado diretamente com iodeto: ele é inicialmente fixado por manganês.",
      },
      {
        titulo: "Oxidação do iodeto equivalente",
        equacao: "6 I⁻ ⇌ 2 I₃⁻ + 4 e⁻",
        eletrons: 4,
        potencialPadraoV: E0_I3_I_25C,
      },
    ],
    etapasPreTitulacao: [
      "Mn²⁺ + 2 OH⁻ → Mn(OH)₂(s)",
      "2 Mn(OH)₂ + ½ O₂ + H₂O → 2 Mn(OH)₃(s)",
      "2 Mn(OH)₃ + 6 H⁺ + 3 I⁻ → 2 Mn²⁺ + I₃⁻ + 6 H₂O",
      "I₃⁻ ⇌ I₂ + I⁻",
      "Equivalente global em KI em excesso: O₂ + 6 I⁻ + 4 H⁺ → 2 I₃⁻ + 2 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "O₂ + 6 I⁻ + 4 H⁺ → 2 I₃⁻ + 2 H₂O (equivalente global do Winkler em KI em excesso)",
    eletronsGeracaoIodo: 4,
    molI3PorMolAnalito: 2,
    molTiossulfatoPorMolAnalito: 4,
    molIodetoConsumidoPorMolAnalito: 6,
    relacaoPrimeiraEtapa: "1 O₂ : 2 I₃⁻",
    relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 O₂ : 2 I₃⁻ : 4 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = 2 n(O₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
    igualdadeMolsGlobal: "n(S₂O₃²⁻) = 4 n(O₂)",
    agenteOxidantePrimeiraEtapa:
      "O₂ (via manganês oxidado no método de Winkler)",
    agenteRedutorPrimeiraEtapa:
      "I⁻ na etapa de liberação do iodo",
    observacao:
      "O motor preserva a estequiometria global do Winkler. A concentração padrão de O₂ corresponde a aproximadamente 8 mg L⁻¹.",
    concentracaoAnalitoPadraoMolL: 0.00025,
    concentracaoTiossulfatoPadraoMolL: 0.001,
  },
  {
    id: "peroxido-hidrogenio",
    nome: "Peróxido de hidrogênio",
    formulaAnalito: "H₂O₂",
    nomeCompleto: "Peróxido de hidrogênio — H₂O₂",
    descricao:
      "H₂O₂ oxida iodeto em meio ácido, gerando iodo que aparece predominantemente como I₃⁻ em KI em excesso.",
    titulante: "Na₂S₂O₃",
    indicador: "Amido",
    semirreacoes: [
      {
        titulo: "Redução do peróxido",
        equacao: "H₂O₂ + 2 H⁺ + 2 e⁻ ⇌ 2 H₂O",
        eletrons: 2,
        potencialPadraoV: 1.763,
      },
      {
        titulo: "Oxidação do iodeto",
        equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I3_I_25C,
      },
    ],
    etapasPreTitulacao: [
      "H₂O₂ + 3 I⁻ + 2 H⁺ → I₃⁻ + 2 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "H₂O₂ + 3 I⁻ + 2 H⁺ → I₃⁻ + 2 H₂O",
    eletronsGeracaoIodo: 2,
    molI3PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    molIodetoConsumidoPorMolAnalito: 3,
    relacaoPrimeiraEtapa: "1 H₂O₂ : 1 I₃⁻",
    relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 H₂O₂ : 1 I₃⁻ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = n(H₂O₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
    igualdadeMolsGlobal: "n(S₂O₃²⁻) = 2 n(H₂O₂)",
    agenteOxidantePrimeiraEtapa: "H₂O₂",
    agenteRedutorPrimeiraEtapa: "I⁻",
    observacao:
      "A reação de liberação de iodo é realizada em meio ácido e com iodeto em excesso.",
    concentracaoAnalitoPadraoMolL: 0.01,
    concentracaoTiossulfatoPadraoMolL: 0.02,
  },
  {
    id: "hipoclorito",
  
    nome:
      "Hipoclorito",
  
    formulaAnalito:
      "ClO⁻",
  
    nomeCompleto:
      "Hipoclorito — ClO⁻",
  
    descricao:
      "Em meio ácido, o hipoclorito é protonado a HClO, que oxida iodeto; o iodo aparece predominantemente como I₃⁻ quando há KI em excesso.",
  
    titulante:
      "Na₂S₂O₃",
  
    indicador:
      "Amido",
  
    semirreacoes: [
      {
        titulo:
          "Redução da espécie de cloro(I)",
  
        equacao:
          "HClO + H⁺ + 2 e⁻ ⇌ Cl⁻ + H₂O",
  
        eletrons:
          2,
  
        potencialPadraoV:
          1.482,
  
        observacao:
          "O E° = 1,482 V corresponde ao par HClO/Cl⁻. Na iodometria em meio ácido, ClO⁻ é protonado a HClO antes da transferência eletrônica.",
      },
  
      {
        titulo:
          "Oxidação do iodeto",
  
        equacao:
          "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
  
        eletrons:
          2,
  
        potencialPadraoV:
          E0_I3_I_25C,
      },
    ],
  
    etapasPreTitulacao: [
      "ClO⁻ + 3 I⁻ + 2 H⁺ → Cl⁻ + I₃⁻ + H₂O",
    ],
  
    reacaoGlobalGeracaoIodo:
      "ClO⁻ + 3 I⁻ + 2 H⁺ → Cl⁻ + I₃⁻ + H₂O",
  
    eletronsGeracaoIodo:
      2,
  
    molI3PorMolAnalito:
      1,
  
    molTiossulfatoPorMolAnalito:
      2,
    molIodetoConsumidoPorMolAnalito: 3,
  
    relacaoPrimeiraEtapa:
      "1 ClO⁻ : 1 I₃⁻",
  
    relacaoSegundaEtapa:
      "1 I₃⁻ : 2 S₂O₃²⁻",
  
    relacaoGlobal:
      "1 ClO⁻ : 1 I₃⁻ : 2 S₂O₃²⁻",
  
    igualdadeMolsPrimeiraEtapa:
      "n(I₃⁻) = n(ClO⁻)",
  
    igualdadeMolsSegundaEtapa:
      "n(S₂O₃²⁻) = 2 n(I₃⁻)",
  
    igualdadeMolsGlobal:
      "n(S₂O₃²⁻) = 2 n(ClO⁻)",
  
    agenteOxidantePrimeiraEtapa:
      "HClO (proveniente da protonação de ClO⁻)",
  
    agenteRedutorPrimeiraEtapa:
      "I⁻",
  
    observacao:
      "A acidificação converte ClO⁻ em HClO e favorece a liberação quantitativa de iodo a partir de iodeto.",
  
    concentracaoAnalitoPadraoMolL:
      0.01,
  
    concentracaoTiossulfatoPadraoMolL:
      0.02,
  },
  {
    id: "iodato",
    nome: "Iodato",
    formulaAnalito: "IO₃⁻",
    nomeCompleto: "Iodato — IO₃⁻",
    descricao:
      "IO₃⁻ reage com iodeto em meio ácido, gerando três equivalentes de iodo (predominantemente I₃⁻ em KI em excesso) por mol de iodato.",
    titulante: "Na₂S₂O₃",
    indicador: "Amido",
    semirreacoes: [
      {
        titulo: "Redução do iodato a iodeto",
        equacao:
          "IO₃⁻ + 6 H⁺ + 6 e⁻ ⇌ I⁻ + 3 H₂O",
        eletrons: 6,
        potencialPadraoV: 1.085,
        observacao:
          "O potencial é apresentado como referência para o par IO₃⁻/I⁻ em meio ácido.",
      },
      {
        titulo: "Oxidação do iodeto",
        equacao: "9 I⁻ ⇌ 3 I₃⁻ + 6 e⁻",
        eletrons: 6,
        potencialPadraoV: E0_I3_I_25C,
      },
    ],
    etapasPreTitulacao: [
      "IO₃⁻ + 8 I⁻ + 6 H⁺ → 3 I₃⁻ + 3 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "IO₃⁻ + 8 I⁻ + 6 H⁺ → 3 I₃⁻ + 3 H₂O",
    eletronsGeracaoIodo: 6,
    molI3PorMolAnalito: 3,
    molTiossulfatoPorMolAnalito: 6,
    molIodetoConsumidoPorMolAnalito: 8,
    relacaoPrimeiraEtapa: "1 IO₃⁻ : 3 I₃⁻",
    relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 IO₃⁻ : 3 I₃⁻ : 6 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa:
      "n(I₃⁻) = 3 n(IO₃⁻)",
    igualdadeMolsSegundaEtapa:
      "n(S₂O₃²⁻) = 2 n(I₃⁻)",
    igualdadeMolsGlobal:
      "n(S₂O₃²⁻) = 6 n(IO₃⁻)",
    agenteOxidantePrimeiraEtapa: "IO₃⁻",
    agenteRedutorPrimeiraEtapa: "I⁻",
    observacao:
      "A reação requer meio ácido e excesso de iodeto; um mol de iodato libera três mols de iodo.",
    concentracaoAnalitoPadraoMolL:
      0.003333333333,
    concentracaoTiossulfatoPadraoMolL:
      0.02,
  },
];

export function buscarSistemaIodometria(
  id: SistemaIodometriaId | string
): SistemaIodometria {
  const sistema = sistemasIodometria.find((item) => item.id === id);
  if (!sistema) {
    throw new RangeError(`Sistema iodimétrico desconhecido: ${String(id)}.`);
  }
  return sistema;
}

export type EntradaIodometria = {
  sistemaId:
    SistemaIodometriaId;

  concentracaoAnalitoMolL:
    number;

  volumeAmostraMl:
    number;

  concentracaoTiossulfatoMolL:
    number;

  temperaturaC:
    number;
};

export type RegiaoIodometria =
  | "antes_pe"
  | "pe"
  | "apos_pe";

export type PontoIodometria = {
  volumeAdicionadoMl: number;
  potencialV: number;
  regiao: RegiaoIodometria;

  /** Quantidade de I₃⁻ remanescente no equilíbrio redox. */
  molI3: number;

  /** Iodeto formado pela redução parcial de I₃⁻. */
  molIodeto: number;
  molIodetoLivre: number;

  /** Tiossulfato remanescente no equilíbrio redox. */
  molTiossulfato: number;

  /** Tetrationato formado no equilíbrio redox. */
  molTetrationato: number;

  concentracaoIodetoMolL: number;
  concentracaoI3MolL: number;
  concentracaoTiossulfatoMolL: number;
  concentracaoTetrationatoMolL: number;
};

export type ConfiguracaoCurvaIodometria = {
  volumeMaximoMl?: number;
  passoBaseMl?: number;
  passoProximoPEMl?: number;
  faixaDensaFracao?: number;
};

export type ResultadoCurvaIodometria = {
  entrada:
    EntradaIodometria;

  sistema:
    SistemaIodometria;

  molAnalitoInicial:
    number;

  molI3Gerado:
    number;

  /** Quantidade mínima estequiométrica de KI (1 mol KI fornece 1 mol I⁻). */
  molKIMinimo:
    number;

  /** Concentração mínima estequiométrica de KI na mistura inicial. */
  concentracaoKIMinimaMolL:
    number;

  molTiossulfatoEquivalencia:
    number;

  volumeEquivalenciaMl:
    number;

  potencialEquivalenciaV:
    number;

  volumeMaximoMl:
    number;

  pontos:
    PontoIodometria[];

  pontosValidos:
    PontoIodometria[];
};

function kelvin(temperaturaC: number) {
  return temperaturaC + 273.15;
}

function validarEntrada(entrada: EntradaIodometria) {
  const valores = [
    entrada.concentracaoAnalitoMolL,
    entrada.volumeAmostraMl,
    entrada.concentracaoTiossulfatoMolL,
  ];

  if (valores.some((valor) => !Number.isFinite(valor) || valor <= 0)) {
    throw new Error(
      "Concentrações e volume da amostra devem ser positivos e finitos."
    );
  }

  if (!Number.isFinite(entrada.temperaturaC) || entrada.temperaturaC <= -273.15) {
    throw new Error("Informe uma temperatura fisicamente válida.");
  }
}

/**
 * Resumo estequiométrico da geração de I₃⁻ e da necessidade de KI.
 *
 * Como cada mol de KI fornece um mol de I⁻, a quantidade mínima de KI é
 * calculada pelo consumo estequiométrico de iodeto do sistema selecionado.
 * A concentração apresentada corresponde à mistura inicial, considerando
 * o volume informado em volumeAmostraMl. Na prática, deve-se trabalhar com
 * KI em excesso; a concentração da solução-estoque depende do volume de KI
 * adicionado e não pode ser determinada sem esse dado adicional.
 */
export function calcularResumoEstequiometricoIodometria(
  entrada: EntradaIodometria
) {
  validarEntrada(entrada);

  const sistema = buscarSistemaIodometria(entrada.sistemaId);
  const volumeAmostraL = entrada.volumeAmostraMl / 1000;

  const molAnalitoInicial =
    entrada.concentracaoAnalitoMolL * volumeAmostraL;

  const molI3Gerado =
    molAnalitoInicial * sistema.molI3PorMolAnalito;

  // Consumo global de I⁻ inclui o iodeto oxidado e o incorporado ao I₃⁻.
  // Ex.: Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻.
  const molKIMinimo =
    molAnalitoInicial * sistema.molIodetoConsumidoPorMolAnalito;

  const concentracaoKIMinimaMolL =
    molKIMinimo / volumeAmostraL;

  const molTiossulfatoEquivalencia =
    molAnalitoInicial * sistema.molTiossulfatoPorMolAnalito;

  const volumeEquivalenciaMl =
    (molTiossulfatoEquivalencia /
      entrada.concentracaoTiossulfatoMolL) *
    1000;

  return {
    sistema,
    molAnalitoInicial,
    molI3Gerado,
    molKIMinimo,
    concentracaoKIMinimaMolL,
    molTiossulfatoEquivalencia,
    volumeEquivalenciaMl,
  };
}

/**
 * Fator de Nernst para n = 2, na forma decimal usada nos slides.
 * Em 25 °C retorna exatamente 0,0592 / 2 = 0,0296 V por década.
 * Para outra temperatura, ajusta-se proporcionalmente à temperatura absoluta.
 * Os potenciais padrão permanecem como referências tabeladas a 25 °C.
 */
function calcularFatorNernstDoisEletrons(temperaturaC: number) {
  return (
    (FATOR_NERNST_25C / 2) *
    (kelvin(temperaturaC) / 298.15)
  );
}

/**
 * Potencial no PE pelo desenvolvimento dos slides 40–41:
 *
 * E_PE = (a E°A + b E°B) / (a + b)
 *
 * Para I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻, a = b = 2.
 */
/**
 * Calcula o potencial real de equilíbrio no ponto estequiométrico.
 *
 * Diferentemente da média aritmética dos potenciais padrão, o potencial no
 * PE é obtido resolvendo simultaneamente as equações de Nernst dos pares
 * I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻, respeitando os balanços de matéria da reação:
 *
 * I₃⁻ + 2 S₂O₃²⁻ ⇌ 3 I⁻ + S₄O₆²⁻
 *
 * O resultado depende das concentrações analíticas e do volume da mistura.
 */
export function calcularPotencialEquivalenciaIodometria(
  entrada: EntradaIodometria
) {
  const resumo = calcularResumoEstequiometricoIodometria(entrada);
  return calcularPontoIodometria({
    entrada,
    volumeAdicionadoMl: resumo.volumeEquivalenciaMl,
  }).potencialV;
}

/**
 * A média ponderada usada na versão anterior da validação é mantida apenas
 * como referência matemática dos potenciais padrão. Ela não é usada como
 * potencial do PE porque não satisfaz, em geral, as duas equações de Nernst
 * com os coeficientes estequiométricos reais dos pares I₃⁻/I⁻ e
 * S₄O₆²⁻/S₂O₃²⁻.
 */
export function calcularMediaFormalPotenciaisPadraoIodometria() {
  const a = ELETRONS_PAR_I3_I;
  const b = ELETRONS_PAR_TETRATIONATO_TIOS;
  return (
    a * E0_I3_I_25C +
    b * E0_TETRATIONATO_TIOS
  ) / (a + b);
}

/**
 * Localiza a região da titulação por busca binária em limites ordenados:
 * antes do PE, faixa de equivalência e após o PE.
 *
 * A busca escolhe qual modelo químico será aplicado; ela não substitui
 * os balanços estequiométricos nem as equações de Nernst de cada região.
 */
export function localizarRegiaoIodometriaPorBuscaBinaria(
  volumeAdicionadoMl: number,
  volumeEquivalenciaMl: number
): RegiaoIodometria {
  if (
    !Number.isFinite(volumeAdicionadoMl) ||
    volumeAdicionadoMl < 0 ||
    !Number.isFinite(volumeEquivalenciaMl) ||
    volumeEquivalenciaMl <= 0
  ) {
    throw new Error("Volumes inválidos para localizar a região da iodometria.");
  }

  const toleranciaPE =
    Math.max(volumeEquivalenciaMl * 1e-10, 1e-10);
  const epsilonLimite =
    Number.EPSILON * Math.max(volumeEquivalenciaMl, 1);

  const limitesSuperiores = [
    volumeEquivalenciaMl - toleranciaPE - epsilonLimite,
    volumeEquivalenciaMl + toleranciaPE,
    Number.POSITIVE_INFINITY,
  ];
  const regioes: RegiaoIodometria[] = [
    "antes_pe",
    "pe",
    "apos_pe",
  ];

  let esquerda = 0;
  let direita = limitesSuperiores.length - 1;

  while (esquerda < direita) {
    const meio = Math.floor((esquerda + direita) / 2);

    if (volumeAdicionadoMl <= limitesSuperiores[meio]) {
      direita = meio;
    } else {
      esquerda = meio + 1;
    }
  }

  return regioes[esquerda];
}

/**
 * Resolve o potencial de um ponto da curva pela igualdade dos potenciais
 * dos dois pares redox. Os balanços estequiométricos determinam as quantidades
 * de I₃⁻, I⁻, S₂O₃²⁻ e S₄O₆²⁻ em cada volume adicionado.
 *
 * A curva não troca abruptamente de equação no PE: o equilíbrio dos dois
 * pares é resolvido em toda a faixa, inclusive na equivalência.
 */
type EspeciesEquilibrioIodometria = {
  potencialV: number;
  potencialParI3IodetoV: number;
  potencialParTetrationatoTiossulfatoV: number;
  molI3: number;
  molIodeto: number;
  molTiossulfato: number;
  molTetrationato: number;
  concentracaoI3MolL: number;
  concentracaoIodetoMolL: number;
  concentracaoTiossulfatoMolL: number;
  concentracaoTetrationatoMolL: number;
};

/** Soma dois valores positivos representados em log₁₀, sem overflow. */
function log10Soma(logA: number, logB: number) {
  if (logA === Number.NEGATIVE_INFINITY) return logB;
  if (logB === Number.NEGATIVE_INFINITY) return logA;
  const maior = Math.max(logA, logB);
  return maior + Math.log10(
    Math.pow(10, logA - maior) +
    Math.pow(10, logB - maior)
  );
}

/** Calcula log₁₀(1 − 10ˣ) com estabilidade quando x está próximo de zero. */
function log10UmMenosDezElevado(x: number) {
  const diferenca = -Math.expm1(x * Math.LN10);
  if (!(diferenca > 0)) return Number.NEGATIVE_INFINITY;
  return Math.log10(diferenca);
}

function converterLogMolsParaNumero(logMols: number) {
  if (logMols === Number.NEGATIVE_INFINITY || logMols < -323) return 0;
  if (logMols > 308) return Number.POSITIVE_INFINITY;
  return Math.pow(10, logMols);
}

/**
 * Resolve o equilíbrio dos dois pares redox para um volume de titulante.
 *
 * Em vez de aplicar uma equação de Nernst isolada antes do PE e outra depois,
 * o motor calcula a extensão de reação que torna iguais os potenciais dos
 * pares I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻. Os quatro componentes são obtidos pelos
 * balanços de matéria:
 *
 * I₃⁻ + 2 S₂O₃²⁻ ⇌ 3 I⁻ + S₄O₆²⁻
 *
 * A busca é feita em logaritmo da fração de reagentes remanescentes para
 * manter precisão mesmo quando a reação é praticamente quantitativa.
 *
 * O modelo usa o requisito estequiométrico mínimo de KI calculado pelo
 * sistema. O excesso operacional de KI usado em laboratório não é inferido,
 * pois sua quantidade depende do volume/concentração da solução-estoque.
 */
function resolverEquilibrioIodometria({
  entrada,
  volumeAdicionadoMl,
  molI3Inicial,
  volumeEquivalenciaMl,
}: {
  entrada: EntradaIodometria;
  volumeAdicionadoMl: number;
  molI3Inicial: number;
  volumeEquivalenciaMl: number;
}): EspeciesEquilibrioIodometria {
  if (volumeAdicionadoMl <= 0) {
    throw new RangeError(
      "Em 0,00 mL ainda não há tiossulfato/tetrationato para definir o equilíbrio entre os dois pares redox."
    );
  }

  const volumeTotalL =
    (entrada.volumeAmostraMl + volumeAdicionadoMl) / 1000;
  const volumeTiossulfatoL = volumeAdicionadoMl / 1000;
  const molTiossulfatoAdicionado =
    entrada.concentracaoTiossulfatoMolL * volumeTiossulfatoL;

  const extensaoMaxima = Math.min(
    molI3Inicial,
    molTiossulfatoAdicionado / 2
  );

  if (!(extensaoMaxima > 0)) {
    throw new RangeError(
      "Não há quantidade positiva de titulante para resolver o equilíbrio iodimétrico."
    );
  }

  const logExtensaoMaxima = Math.log10(extensaoMaxima);
  const logVolumeTotal = Math.log10(volumeTotalL);
  const estaAntesOuNoPE =
    volumeAdicionadoMl <= volumeEquivalenciaMl;

  // Antes/no PE, o tiossulfato é o reagente limitante.
  // Após o PE, o triiodeto é o reagente limitante.
  const baseI3 = estaAntesOuNoPE
    ? molI3Inicial - extensaoMaxima
    : 0;
  const coeficienteI3 = estaAntesOuNoPE
    ? extensaoMaxima
    : molI3Inicial;

  const excessoTiossulfato = estaAntesOuNoPE
    ? 0
    : molTiossulfatoAdicionado - 2 * molI3Inicial;
  const coeficienteTiossulfato = estaAntesOuNoPE
    ? molTiossulfatoAdicionado
    : 2 * molI3Inicial;

  const logBaseI3 = baseI3 > 0
    ? Math.log10(baseI3)
    : Number.NEGATIVE_INFINITY;
  const logCoeficienteI3 = Math.log10(coeficienteI3);
  const logBaseTiossulfato = excessoTiossulfato > 0
    ? Math.log10(excessoTiossulfato)
    : Number.NEGATIVE_INFINITY;
  const logCoeficienteTiossulfato =
    Math.log10(coeficienteTiossulfato);

  const fatorNernst =
    calcularFatorNernstDoisEletrons(entrada.temperaturaC);

  const avaliarFracaoRemanescente = (logFracao: number) => {
    const logUmMenosFracao =
      log10UmMenosDezElevado(logFracao);

    // Balanços em mol, calculados em espaço logarítmico.
    const logMolI3 = log10Soma(
      logBaseI3,
      logCoeficienteI3 + logFracao
    );

    const logMolIodeto =
      Math.log10(3) +
      logExtensaoMaxima +
      logUmMenosFracao;

    const logMolTiossulfato = log10Soma(
      logBaseTiossulfato,
      logCoeficienteTiossulfato + logFracao
    );

    const logMolTetrationato =
      logExtensaoMaxima +
      logUmMenosFracao;

    // Concentrações = quantidade de matéria / volume total.
    const logI3 = logMolI3 - logVolumeTotal;
    const logIodeto = logMolIodeto - logVolumeTotal;
    const logTiossulfato =
      logMolTiossulfato - logVolumeTotal;
    const logTetrationato =
      logMolTetrationato - logVolumeTotal;

    // Q(I₃⁻/I⁻) = [I⁻]³/[I₃⁻].
    const logQIodo =
      3 * logIodeto - logI3;

    // Q(S₄O₆²⁻/S₂O₃²⁻) = [S₂O₃²⁻]²/[S₄O₆²⁻].
    const logQTiossulfato =
      2 * logTiossulfato - logTetrationato;

    const potencialParI3IodetoV =
      E0_I3_I_25C - fatorNernst * logQIodo;

    const potencialParTetrationatoTiossulfatoV =
      E0_TETRATIONATO_TIOS -
      fatorNernst * logQTiossulfato;

    return {
      residuo:
        potencialParI3IodetoV -
        potencialParTetrationatoTiossulfatoV,
      potencialParI3IodetoV,
      potencialParTetrationatoTiossulfatoV,
      logMolI3,
      logMolIodeto,
      logMolTiossulfato,
      logMolTetrationato,
      logI3,
      logIodeto,
      logTiossulfato,
      logTetrationato,
    };
  };

  // A raiz fica entre uma extensão praticamente nula e a extensão máxima.
  let limiteInferior = -300;
  let limiteSuperior = -1e-12;
  const residuoInferior =
    avaliarFracaoRemanescente(limiteInferior).residuo;
  const residuoSuperior =
    avaliarFracaoRemanescente(limiteSuperior).residuo;

  if (
    !Number.isFinite(residuoInferior) ||
    !Number.isFinite(residuoSuperior) ||
    residuoInferior > 0 ||
    residuoSuperior < 0
  ) {
    throw new Error(
      "Não foi possível delimitar o equilíbrio eletroquímico da iodometria."
    );
  }

  for (let iteracao = 0; iteracao < 80; iteracao += 1) {
    const meio =
      (limiteInferior + limiteSuperior) / 2;
    const residuoMeio =
      avaliarFracaoRemanescente(meio).residuo;

    if (residuoMeio > 0) {
      limiteSuperior = meio;
    } else {
      limiteInferior = meio;
    }
  }

  const logFracaoEquilibrio =
    (limiteInferior + limiteSuperior) / 2;
  const equilibrio =
    avaliarFracaoRemanescente(logFracaoEquilibrio);

  const potencialV =
    (
      equilibrio.potencialParI3IodetoV +
      equilibrio.potencialParTetrationatoTiossulfatoV
    ) / 2;

  const molI3 =
    converterLogMolsParaNumero(equilibrio.logMolI3);
  const molIodeto =
    converterLogMolsParaNumero(equilibrio.logMolIodeto);
  const molTiossulfato =
    converterLogMolsParaNumero(equilibrio.logMolTiossulfato);
  const molTetrationato =
    converterLogMolsParaNumero(equilibrio.logMolTetrationato);

  const concentracaoI3MolL =
    converterLogMolsParaNumero(
      equilibrio.logI3
    );
  const concentracaoIodetoMolL =
    converterLogMolsParaNumero(
      equilibrio.logIodeto
    );
  const concentracaoTiossulfatoMolL =
    converterLogMolsParaNumero(
      equilibrio.logTiossulfato
    );
  const concentracaoTetrationatoMolL =
    converterLogMolsParaNumero(
      equilibrio.logTetrationato
    );

  const valores = [
    potencialV,
    molI3,
    molIodeto,
    molTiossulfato,
    molTetrationato,
    concentracaoI3MolL,
    concentracaoIodetoMolL,
    concentracaoTiossulfatoMolL,
    concentracaoTetrationatoMolL,
  ];

  if (valores.some((valor) => !Number.isFinite(valor))) {
    throw new Error(
      "O resolvedor de equilíbrio produziu um resultado não finito."
    );
  }

  return {
    potencialV,
    potencialParI3IodetoV:
      equilibrio.potencialParI3IodetoV,
    potencialParTetrationatoTiossulfatoV:
      equilibrio.potencialParTetrationatoTiossulfatoV,
    molI3,
    molIodeto,
    molTiossulfato,
    molTetrationato,
    concentracaoI3MolL,
    concentracaoIodetoMolL,
    concentracaoTiossulfatoMolL,
    concentracaoTetrationatoMolL,
  };
}

/**
 * Calcula um ponto da curva pela resolução simultânea dos dois pares redox.
 * Em cada volume, a extensão da reação é encontrada por busca binária até
 * que os potenciais de Nernst dos pares I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻ coincidam.
 */
export function calcularPontoIodometria({
  entrada,
  volumeAdicionadoMl,
}: {
  entrada: EntradaIodometria;
  volumeAdicionadoMl: number;
}): PontoIodometria {
  validarEntrada(entrada);

  if (!Number.isFinite(volumeAdicionadoMl) || volumeAdicionadoMl < 0) {
    throw new Error("O volume adicionado deve ser maior ou igual a zero.");
  }

  const resumo =
    calcularResumoEstequiometricoIodometria(entrada);

  const equilibrio =
    resolverEquilibrioIodometria({
      entrada,
      volumeAdicionadoMl,
      molI3Inicial: resumo.molI3Gerado,
      volumeEquivalenciaMl: resumo.volumeEquivalenciaMl,
    });

  const regiao =
    localizarRegiaoIodometriaPorBuscaBinaria(
      volumeAdicionadoMl,
      resumo.volumeEquivalenciaMl
    );

  return {
    volumeAdicionadoMl,
    potencialV: equilibrio.potencialV,
    regiao,
    molI3: equilibrio.molI3,
    molIodeto: equilibrio.molIodeto,
    molIodetoLivre: equilibrio.molIodeto,
    molTiossulfato: equilibrio.molTiossulfato,
    molTetrationato: equilibrio.molTetrationato,
    concentracaoIodetoMolL:
      equilibrio.concentracaoIodetoMolL,
    concentracaoI3MolL:
      equilibrio.concentracaoI3MolL,
    concentracaoTiossulfatoMolL:
      equilibrio.concentracaoTiossulfatoMolL,
    concentracaoTetrationatoMolL:
      equilibrio.concentracaoTetrationatoMolL,
  };
}

function adicionarVolumeUnico(
  conjunto:
    Set<number>,
  volume:
    number,
  volumeMaximoMl:
    number
) {
  if (
    Number.isFinite(
      volume
    ) &&
    volume > 0 &&
    volume <=
      volumeMaximoMl
  ) {
    conjunto.add(
      Number(
        volume.toFixed(
          6
        )
      )
    );
  }
}

export function gerarCurvaIodometria({
  entrada,
  configuracao = {},
}: {
  entrada:
    EntradaIodometria;

  configuracao?:
    ConfiguracaoCurvaIodometria;
}): ResultadoCurvaIodometria {
  const resumo =
    calcularResumoEstequiometricoIodometria(
      entrada
    );

  const volumePE =
    resumo
      .volumeEquivalenciaMl;

  const volumeMaximoMl =
    configuracao
      .volumeMaximoMl ??
    Math.max(
      volumePE *
        1.6,
      volumePE +
        10,
      10
    );

  const passoBaseMl =
    configuracao
      .passoBaseMl ??
    Math.max(
      volumePE /
        50,
      0.02
    );

  const passoProximoPEMl =
    configuracao
      .passoProximoPEMl ??
    Math.max(
      volumePE /
        250,
      0.002
    );

  const faixaDensaFracao =
    configuracao
      .faixaDensaFracao ??
    0.12;

  const faixaDensa =
    Math.max(
      volumePE *
        faixaDensaFracao,
      passoBaseMl *
        2
    );

  const volumes =
    new Set<number>();

  for (
    let volume = 0;
    volume <=
    volumeMaximoMl +
      passoBaseMl /
        2;
    volume +=
      passoBaseMl
  ) {
    adicionarVolumeUnico(
      volumes,
      volume,
      volumeMaximoMl
    );
  }

  const inicioDenso =
    Math.max(
      0,
      volumePE -
        faixaDensa
    );

  const fimDenso =
    Math.min(
      volumeMaximoMl,
      volumePE +
        faixaDensa
    );

  for (
    let volume =
      inicioDenso;
    volume <=
    fimDenso +
      passoProximoPEMl /
        2;
    volume +=
      passoProximoPEMl
  ) {
    adicionarVolumeUnico(
      volumes,
      volume,
      volumeMaximoMl
    );
  }

  adicionarVolumeUnico(
    volumes,
    volumePE,
    volumeMaximoMl
  );

  const pontos =
    Array.from(
      volumes
    )
      .sort(
        (
          a,
          b
        ) =>
          a -
          b
      )
      .map(
        (
          volumeAdicionadoMl
        ) =>
          calcularPontoIodometria({
            entrada,
            volumeAdicionadoMl,
          })
      );

  const pontoPE =
    calcularPontoIodometria({
      entrada,
      volumeAdicionadoMl:
        volumePE,
    });

  return {
    entrada,
    sistema:
      resumo
        .sistema,

    molAnalitoInicial:
      resumo
        .molAnalitoInicial,

    molI3Gerado:
      resumo
        .molI3Gerado,

    molKIMinimo:
      resumo
        .molKIMinimo,

    concentracaoKIMinimaMolL:
      resumo
        .concentracaoKIMinimaMolL,

    molTiossulfatoEquivalencia:
      resumo
        .molTiossulfatoEquivalencia,

    volumeEquivalenciaMl:
      volumePE,

    potencialEquivalenciaV:
      pontoPE
        .potencialV,

    volumeMaximoMl,

    pontos,

    pontosValidos:
      pontos.filter(
        (
          ponto
        ) =>
          Number.isFinite(
            ponto
              .potencialV
          )
      ),
  };
}

export type SegmentoDerivadaIodometria = "antes_pe" | "apos_pe";

export type PontoPrimeiraDerivadaIodometria = {
  volumeMl: number;
  primeiraDerivada: number;
};

export type PontoSegundaDerivadaIodometria = {
  volumeMl: number;
  segundaDerivada: number;
};

export type ResultadoDerivadasIodometria = {
  primeiraDerivada: PontoPrimeiraDerivadaIodometria[];
  segundaDerivada: PontoSegundaDerivadaIodometria[];
  volumePFPrimeiraDerivadaMl: number;
  valorExtremoPrimeiraDerivada: number;
  volumePFSegundaDerivadaMl: number | null;
};

/**
 * As derivadas são calculadas sobre a curva contínua de equilíbrio.
 * Como o potencial diminui durante a titulação, o ponto final pela primeira
 * derivada é localizado pelo vale (maior magnitude negativa) de dE/dV.
 * A segunda derivada é calculada independentemente e seu PF só é informado
 * quando há cruzamento real por zero.
 */
export function calcularDerivadasIodometria(
  pontosEntrada: PontoIodometria[]
): ResultadoDerivadasIodometria {
  const resultado = calcularDerivadasRedox(
    pontosEntrada.map((ponto) => ({
      volumeAdicionadoMl: ponto.volumeAdicionadoMl,
      potencialV: ponto.potencialV,
    })),
    true
  );

  return {
    primeiraDerivada: resultado.primeiraDerivada.map((ponto) => ({
      volumeMl: ponto.volumeMl,
      primeiraDerivada: ponto.primeiraDerivada,
    })),
    segundaDerivada: resultado.segundaDerivada.map((ponto) => ({
      volumeMl: ponto.volumeMl,
      segundaDerivada: ponto.segundaDerivada,
    })),
    volumePFPrimeiraDerivadaMl:
      resultado.volumePFPrimeiraDerivadaMl,
    valorExtremoPrimeiraDerivada:
      resultado.valorMaximoPrimeiraDerivada,
    volumePFSegundaDerivadaMl:
      resultado.volumePFSegundaDerivadaMl,
  };
}

export function entradaPadraoIodometria(
  sistemaId:
    SistemaIodometriaId
): EntradaIodometria {
  const sistema =
    buscarSistemaIodometria(
      sistemaId
    );

  return {
    sistemaId,

    concentracaoAnalitoMolL:
      sistema
        .concentracaoAnalitoPadraoMolL,

    volumeAmostraMl:
      25,

    concentracaoTiossulfatoMolL:
      sistema
        .concentracaoTiossulfatoPadraoMolL,

    temperaturaC:
      25,
  };
}