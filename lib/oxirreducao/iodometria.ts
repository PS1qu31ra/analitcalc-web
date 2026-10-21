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
  molI2PorMolAnalito: number;
  molTiossulfatoPorMolAnalito: number;
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

export const E0_I2_I = 0.5355;
export const E0_TETRATIONATO_TIOS = 0.080;

export const REACAO_TIOS =
  "I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻";

export const SEMIRREACAO_IODO =
  "I₂ + 2 e⁻ ⇌ 2 I⁻";

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
      "O cloro oxida I⁻ a I₂; o iodo liberado é titulado com tiossulfato.",
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
        equacao: "2 I⁻ ⇌ I₂ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I2_I,
        observacao:
          "O valor exibido é o E° de redução do par I₂/I⁻; a semirreação está escrita no sentido de oxidação para compor a reação global.",
      },
    ],
    etapasPreTitulacao: [
      "Cl₂ + 2 I⁻ → 2 Cl⁻ + I₂",
    ],
    reacaoGlobalGeracaoIodo:
      "Cl₂ + 2 I⁻ → 2 Cl⁻ + I₂",
    eletronsGeracaoIodo: 2,
    molI2PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    relacaoPrimeiraEtapa: "1 Cl₂ : 1 I₂",
    relacaoSegundaEtapa: "1 I₂ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 Cl₂ : 1 I₂ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₂) = n(Cl₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₂)",
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
      "Cu²⁺ reage com iodeto, formando CuI(s) e liberando I₂ para titulação com tiossulfato.",
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
        equacao: "2 I⁻ ⇌ I₂ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I2_I,
      },
    ],
    etapasPreTitulacao: [
      "2 Cu²⁺ + 4 I⁻ → 2 CuI(s) + I₂",
    ],
    reacaoGlobalGeracaoIodo:
      "2 Cu²⁺ + 4 I⁻ → 2 CuI(s) + I₂",
    eletronsGeracaoIodo: 2,
    molI2PorMolAnalito: 0.5,
    molTiossulfatoPorMolAnalito: 1,
    relacaoPrimeiraEtapa: "2 Cu²⁺ : 1 I₂",
    relacaoSegundaEtapa: "1 I₂ : 2 S₂O₃²⁻",
    relacaoGlobal: "2 Cu²⁺ : 1 I₂ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₂) = ½ n(Cu²⁺)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₂)",
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
        equacao: "4 I⁻ ⇌ 2 I₂ + 4 e⁻",
        eletrons: 4,
        potencialPadraoV: E0_I2_I,
      },
    ],
    etapasPreTitulacao: [
      "Mn²⁺ + 2 OH⁻ → Mn(OH)₂(s)",
      "2 Mn(OH)₂ + ½ O₂ + H₂O → 2 Mn(OH)₃(s)",
      "2 Mn(OH)₃ + 6 H⁺ + 3 I⁻ → 2 Mn²⁺ + I₃⁻ + 6 H₂O",
      "I₃⁻ ⇌ I₂ + I⁻",
      "Equivalente global: O₂ + 4 I⁻ + 4 H⁺ → 2 I₂ + 2 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "O₂ + 4 I⁻ + 4 H⁺ → 2 I₂ + 2 H₂O (equivalente global do Winkler)",
    eletronsGeracaoIodo: 4,
    molI2PorMolAnalito: 2,
    molTiossulfatoPorMolAnalito: 4,
    relacaoPrimeiraEtapa: "1 O₂ : 2 I₂",
    relacaoSegundaEtapa: "1 I₂ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 O₂ : 2 I₂ : 4 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₂) = 2 n(O₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₂)",
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
      "H₂O₂ oxida iodeto em meio ácido, liberando I₂ que é titulado com tiossulfato.",
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
        equacao: "2 I⁻ ⇌ I₂ + 2 e⁻",
        eletrons: 2,
        potencialPadraoV: E0_I2_I,
      },
    ],
    etapasPreTitulacao: [
      "H₂O₂ + 2 I⁻ + 2 H⁺ → I₂ + 2 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "H₂O₂ + 2 I⁻ + 2 H⁺ → I₂ + 2 H₂O",
    eletronsGeracaoIodo: 2,
    molI2PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    relacaoPrimeiraEtapa: "1 H₂O₂ : 1 I₂",
    relacaoSegundaEtapa: "1 I₂ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 H₂O₂ : 1 I₂ : 2 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa: "n(I₂) = n(H₂O₂)",
    igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₂)",
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
      "Em meio ácido, o hipoclorito é protonado a HClO, que oxida iodeto a I₂; o iodo formado é quantificado com tiossulfato.",
  
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
          "2 I⁻ ⇌ I₂ + 2 e⁻",
  
        eletrons:
          2,
  
        potencialPadraoV:
          E0_I2_I,
      },
    ],
  
    etapasPreTitulacao: [
      "ClO⁻ + 2 I⁻ + 2 H⁺ → Cl⁻ + I₂ + H₂O",
    ],
  
    reacaoGlobalGeracaoIodo:
      "ClO⁻ + 2 I⁻ + 2 H⁺ → Cl⁻ + I₂ + H₂O",
  
    eletronsGeracaoIodo:
      2,
  
    molI2PorMolAnalito:
      1,
  
    molTiossulfatoPorMolAnalito:
      2,
  
    relacaoPrimeiraEtapa:
      "1 ClO⁻ : 1 I₂",
  
    relacaoSegundaEtapa:
      "1 I₂ : 2 S₂O₃²⁻",
  
    relacaoGlobal:
      "1 ClO⁻ : 1 I₂ : 2 S₂O₃²⁻",
  
    igualdadeMolsPrimeiraEtapa:
      "n(I₂) = n(ClO⁻)",
  
    igualdadeMolsSegundaEtapa:
      "n(S₂O₃²⁻) = 2 n(I₂)",
  
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
      "IO₃⁻ reage com iodeto em meio ácido formando três mols de I₂ por mol de iodato.",
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
        equacao: "6 I⁻ ⇌ 3 I₂ + 6 e⁻",
        eletrons: 6,
        potencialPadraoV: E0_I2_I,
      },
    ],
    etapasPreTitulacao: [
      "IO₃⁻ + 5 I⁻ + 6 H⁺ → 3 I₂ + 3 H₂O",
    ],
    reacaoGlobalGeracaoIodo:
      "IO₃⁻ + 5 I⁻ + 6 H⁺ → 3 I₂ + 3 H₂O",
    eletronsGeracaoIodo: 6,
    molI2PorMolAnalito: 3,
    molTiossulfatoPorMolAnalito: 6,
    relacaoPrimeiraEtapa: "1 IO₃⁻ : 3 I₂",
    relacaoSegundaEtapa: "1 I₂ : 2 S₂O₃²⁻",
    relacaoGlobal: "1 IO₃⁻ : 3 I₂ : 6 S₂O₃²⁻",
    igualdadeMolsPrimeiraEtapa:
      "n(I₂) = 3 n(IO₃⁻)",
    igualdadeMolsSegundaEtapa:
      "n(S₂O₃²⁻) = 2 n(I₂)",
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
  id: SistemaIodometriaId
): SistemaIodometria {
  return (
    sistemasIodometria.find(
      (sistema) =>
        sistema.id === id
    ) ??
    sistemasIodometria[0]
  );
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

  concentracaoIodetoLivreMolL:
    number;

  temperaturaC:
    number;
};

export type RegiaoIodometria =
  | "antes_pe"
  | "pe"
  | "apos_pe";

export type PontoIodometria = {
  volumeAdicionadoMl:
    number;

  potencialV:
    number;

  regiao:
    RegiaoIodometria;

  molI2:
    number;

  molIodeto:
    number;

  molTiossulfato:
    number;

  molTetrationato:
    number;

  concentracaoI2MolL:
    number;

  concentracaoIodetoMolL:
    number;

  concentracaoTiossulfatoMolL:
    number;

  concentracaoTetrationatoMolL:
    number;
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

  molI2Gerado:
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

const R =
  8.31446261815324;

const F =
  96485.33212;

function kelvin(
  temperaturaC:
    number
) {
  return (
    temperaturaC +
    273.15
  );
}

function validarEntrada(
  entrada:
    EntradaIodometria
) {
  const valores = [
    entrada
      .concentracaoAnalitoMolL,

    entrada
      .volumeAmostraMl,

    entrada
      .concentracaoTiossulfatoMolL,

    entrada
      .concentracaoIodetoLivreMolL,
  ];

  if (
    valores.some(
      (
        valor
      ) =>
        !Number.isFinite(
          valor
        ) ||
        valor <= 0
    )
  ) {
    throw new Error(
      "Concentrações e volume da amostra devem ser positivos e finitos."
    );
  }

  if (
    !Number.isFinite(
      entrada.temperaturaC
    ) ||
    entrada.temperaturaC <=
      -273.15
  ) {
    throw new Error(
      "Informe uma temperatura fisicamente válida."
    );
  }
}

export function calcularResumoEstequiometricoIodometria(
  entrada:
    EntradaIodometria
) {
  validarEntrada(
    entrada
  );

  const sistema =
    buscarSistemaIodometria(
      entrada.sistemaId
    );

  const molAnalitoInicial =
    entrada
      .concentracaoAnalitoMolL *
    (
      entrada
        .volumeAmostraMl /
      1000
    );

  const molI2Gerado =
    molAnalitoInicial *
    sistema
      .molI2PorMolAnalito;

  const molTiossulfatoEquivalencia =
    molAnalitoInicial *
    sistema
      .molTiossulfatoPorMolAnalito;

  const volumeEquivalenciaMl =
    (
      molTiossulfatoEquivalencia /
      entrada
        .concentracaoTiossulfatoMolL
    ) *
    1000;

  return {
    sistema,
    molAnalitoInicial,
    molI2Gerado,
    molTiossulfatoEquivalencia,
    volumeEquivalenciaMl,
  };
}

function logQuocienteReacao({
  extentMol,
  molI2Inicial,
  molIodetoInicial,
  molTiossulfatoAdicionado,
  volumeTotalL,
}: {
  extentMol:
    number;

  molI2Inicial:
    number;

  molIodetoInicial:
    number;

  molTiossulfatoAdicionado:
    number;

  volumeTotalL:
    number;
}) {
  const piso =
    1e-300;

  const molI2 =
    Math.max(
      molI2Inicial -
        extentMol,
      piso
    );

  const molIodeto =
    Math.max(
      molIodetoInicial +
        2 *
          extentMol,
      piso
    );

  const molTiossulfato =
    Math.max(
      molTiossulfatoAdicionado -
        2 *
          extentMol,
      piso
    );

  const molTetrationato =
    Math.max(
      extentMol,
      piso
    );

  const cI2 =
    molI2 /
    volumeTotalL;

  const cIodeto =
    molIodeto /
    volumeTotalL;

  const cTios =
    molTiossulfato /
    volumeTotalL;

  const cTetrationato =
    molTetrationato /
    volumeTotalL;

  return (
    2 *
      Math.log(
        cIodeto
      ) +
    Math.log(
      cTetrationato
    ) -
    Math.log(
      cI2
    ) -
    2 *
      Math.log(
        cTios
      )
  );
}

function resolverExtensaoEquilibrio({
  molI2Inicial,
  molIodetoInicial,
  molTiossulfatoAdicionado,
  volumeTotalL,
  temperaturaC,
}: {
  molI2Inicial:
    number;

  molIodetoInicial:
    number;

  molTiossulfatoAdicionado:
    number;

  volumeTotalL:
    number;

  temperaturaC:
    number;
}) {
  if (
    molTiossulfatoAdicionado <=
    0
  ) {
    return 0;
  }

  const maximo =
    Math.min(
      molI2Inicial,
      molTiossulfatoAdicionado /
        2
    );

  if (
    maximo <= 0
  ) {
    return 0;
  }

  const T =
    kelvin(
      temperaturaC
    );

  const logK =
    (
      2 *
      F *
      (
        E0_I2_I -
        E0_TETRATIONATO_TIOS
      )
    ) /
    (
      R *
      T
    );

  const epsilon =
    Math.max(
      maximo *
        1e-14,
      1e-18
    );

  let inferior =
    0;

  let superior =
    Math.max(
      maximo -
        epsilon,
      maximo *
        0.999999999999
    );

  if (
    superior <=
    0
  ) {
    return maximo;
  }

  const funcao = (
    extentMol:
      number
  ) =>
    logQuocienteReacao({
      extentMol,
      molI2Inicial,
      molIodetoInicial,
      molTiossulfatoAdicionado,
      volumeTotalL,
    }) -
    logK;

  let fInferior =
    funcao(
      inferior
    );

  let fSuperior =
    funcao(
      superior
    );

  if (
    !Number.isFinite(
      fInferior
    )
  ) {
    fInferior =
      -Infinity;
  }

  if (
    !Number.isFinite(
      fSuperior
    )
  ) {
    fSuperior =
      Infinity;
  }

  if (
    fSuperior <
    0
  ) {
    return superior;
  }

  for (
    let iteracao = 0;
    iteracao < 120;
    iteracao += 1
  ) {
    const meio =
      (
        inferior +
        superior
      ) /
      2;

    const fMeio =
      funcao(
        meio
      );

    if (
      fMeio >
      0
    ) {
      superior =
        meio;
    } else {
      inferior =
        meio;
    }
  }

  return (
    inferior +
    superior
  ) /
    2;
}

export function calcularPontoIodometria({
  entrada,
  volumeAdicionadoMl,
}: {
  entrada:
    EntradaIodometria;

  volumeAdicionadoMl:
    number;
}): PontoIodometria {
  validarEntrada(
    entrada
  );

  if (
    !Number.isFinite(
      volumeAdicionadoMl
    ) ||
    volumeAdicionadoMl <
      0
  ) {
    throw new Error(
      "O volume adicionado deve ser maior ou igual a zero."
    );
  }

  const resumo =
    calcularResumoEstequiometricoIodometria(
      entrada
    );

  const volumeAmostraL =
    entrada
      .volumeAmostraMl /
    1000;

  const volumeAdicionadoL =
    volumeAdicionadoMl /
    1000;

  const volumeTotalL =
    volumeAmostraL +
    volumeAdicionadoL;

  const molIodetoInicial =
    entrada
      .concentracaoIodetoLivreMolL *
    volumeAmostraL;

  const molTiossulfatoAdicionado =
    entrada
      .concentracaoTiossulfatoMolL *
    volumeAdicionadoL;

  const extentMol =
    resolverExtensaoEquilibrio({
      molI2Inicial:
        resumo
          .molI2Gerado,

      molIodetoInicial,

      molTiossulfatoAdicionado,

      volumeTotalL,

      temperaturaC:
        entrada
          .temperaturaC,
    });

  const molI2 =
    Math.max(
      resumo
        .molI2Gerado -
        extentMol,
      0
    );

  const molIodeto =
    molIodetoInicial +
    2 *
      extentMol;

  const molTiossulfato =
    Math.max(
      molTiossulfatoAdicionado -
        2 *
          extentMol,
      0
    );

  const molTetrationato =
    extentMol;

  const concentracaoI2MolL =
    molI2 /
    volumeTotalL;

  const concentracaoIodetoMolL =
    molIodeto /
    volumeTotalL;

  const concentracaoTiossulfatoMolL =
    molTiossulfato /
    volumeTotalL;

  const concentracaoTetrationatoMolL =
    molTetrationato /
    volumeTotalL;

  const T =
    kelvin(
      entrada
        .temperaturaC
    );

  const termo =
    R *
    T /
    (
      2 *
      F
    );

  const piso =
    1e-300;

  const potencialIodo =
    E0_I2_I +
    termo *
      Math.log(
        Math.max(
          concentracaoI2MolL,
          piso
        ) /
          Math.pow(
            Math.max(
              concentracaoIodetoMolL,
              piso
            ),
            2
          )
      );

  let potencialV =
    potencialIodo;

  if (
    molTiossulfatoAdicionado >
      0 &&
    concentracaoTetrationatoMolL >
      0
  ) {
    const potencialTios =
      E0_TETRATIONATO_TIOS +
      termo *
        Math.log(
          Math.max(
            concentracaoTetrationatoMolL,
            piso
          ) /
            Math.pow(
              Math.max(
                concentracaoTiossulfatoMolL,
                piso
              ),
              2
            )
        );

    if (
      Number.isFinite(
        potencialTios
      )
    ) {
      potencialV =
        (
          potencialIodo +
          potencialTios
        ) /
        2;
    }
  }

  const toleranciaPE =
    Math.max(
      resumo
        .volumeEquivalenciaMl *
        1e-9,
      1e-9
    );

  const diferencaPE =
    volumeAdicionadoMl -
    resumo
      .volumeEquivalenciaMl;

  const regiao:
    RegiaoIodometria =
    Math.abs(
      diferencaPE
    ) <=
    toleranciaPE
      ? "pe"
      : diferencaPE <
          0
        ? "antes_pe"
        : "apos_pe";

  return {
    volumeAdicionadoMl,
    potencialV,
    regiao,
    molI2,
    molIodeto,
    molTiossulfato,
    molTetrationato,
    concentracaoI2MolL,
    concentracaoIodetoMolL,
    concentracaoTiossulfatoMolL,
    concentracaoTetrationatoMolL,
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
    volume >= 0 &&
    volume <=
      volumeMaximoMl
  ) {
    conjunto.add(
      Number(
        volume.toFixed(
          9
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
        80,
      0.1
    );

  const passoProximoPEMl =
    configuracao
      .passoProximoPEMl ??
    Math.max(
      volumePE /
        500,
      0.01
    );

  const faixaDensaFracao =
    configuracao
      .faixaDensaFracao ??
    0.08;

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

    molI2Gerado:
      resumo
        .molI2Gerado,

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

export type PontoPrimeiraDerivadaIodometria = {
  volumeMl:
    number;

  primeiraDerivada:
    number;
};

export type PontoSegundaDerivadaIodometria = {
  volumeMl:
    number;

  segundaDerivada:
    number;
};

export type ResultadoDerivadasIodometria = {
  primeiraDerivada:
    PontoPrimeiraDerivadaIodometria[];

  segundaDerivada:
    PontoSegundaDerivadaIodometria[];

  volumePFPrimeiraDerivadaMl:
    number;

  valorExtremoPrimeiraDerivada:
    number;

  volumePFSegundaDerivadaMl:
    number;
};

export function calcularDerivadasIodometria(
  pontosEntrada:
    PontoIodometria[]
): ResultadoDerivadasIodometria {
  const pontos =
    pontosEntrada
      .filter(
        (
          ponto
        ) =>
          Number.isFinite(
            ponto
              .volumeAdicionadoMl
          ) &&
          Number.isFinite(
            ponto
              .potencialV
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          a
            .volumeAdicionadoMl -
          b
            .volumeAdicionadoMl
      );

  if (
    pontos.length <
    4
  ) {
    throw new Error(
      "São necessários pelo menos quatro pontos para calcular as derivadas da iodometria."
    );
  }

  const primeira:
    PontoPrimeiraDerivadaIodometria[] =
    [];

  for (
    let i = 0;
    i <
    pontos.length -
      1;
    i += 1
  ) {
    const a =
      pontos[i];

    const b =
      pontos[
        i + 1
      ];

    const dv =
      b
        .volumeAdicionadoMl -
      a
        .volumeAdicionadoMl;

    if (
      dv <= 0
    ) {
      continue;
    }

    primeira.push({
      volumeMl:
        (
          a
            .volumeAdicionadoMl +
          b
            .volumeAdicionadoMl
        ) /
        2,

      primeiraDerivada:
        (
          b
            .potencialV -
          a
            .potencialV
        ) /
        dv,
    });
  }

  if (
    primeira.length <
    3
  ) {
    throw new Error(
      "Não existem pontos suficientes para refinar a primeira derivada."
    );
  }

  const segundaBase:
    PontoSegundaDerivadaIodometria[] =
    [];

  for (
    let i = 0;
    i <
    primeira.length -
      1;
    i += 1
  ) {
    const a =
      primeira[i];

    const b =
      primeira[
        i + 1
      ];

    const dv =
      b
        .volumeMl -
      a
        .volumeMl;

    if (
      dv <= 0
    ) {
      continue;
    }

    segundaBase.push({
      volumeMl:
        (
          a
            .volumeMl +
          b
            .volumeMl
        ) /
        2,

      segundaDerivada:
        (
          b
            .primeiraDerivada -
          a
            .primeiraDerivada
        ) /
        dv,
    });
  }

  let indiceExtremo =
    0;

  for (
    let i = 1;
    i <
    primeira.length;
    i += 1
  ) {
    if (
      Math.abs(
        primeira[i]
          .primeiraDerivada
      ) >
      Math.abs(
        primeira[
          indiceExtremo
        ]
          .primeiraDerivada
      )
    ) {
      indiceExtremo =
        i;
    }
  }

  const central =
    primeira[
      indiceExtremo
    ];

  let volumePF =
    central
      .volumeMl;

  let valorExtremo =
    central
      .primeiraDerivada;

  if (
    indiceExtremo >
      0 &&
    indiceExtremo <
      primeira.length -
        1
  ) {
    const anterior =
      primeira[
        indiceExtremo -
          1
      ];

    const posterior =
      primeira[
        indiceExtremo +
          1
      ];

    const u1 =
      anterior
        .volumeMl -
      central
        .volumeMl;

    const u3 =
      posterior
        .volumeMl -
      central
        .volumeMl;

    const s1 =
      (
        anterior
          .primeiraDerivada -
        central
          .primeiraDerivada
      ) /
      u1;

    const s3 =
      (
        posterior
          .primeiraDerivada -
        central
          .primeiraDerivada
      ) /
      u3;

    const a =
      (
        s1 -
        s3
      ) /
      (
        u1 -
        u3
      );

    const b =
      s1 -
      a *
        u1;

    if (
      Number.isFinite(
        a
      ) &&
      Number.isFinite(
        b
      ) &&
      Math.abs(
        a
      ) >
        1e-18
    ) {
      const uVertice =
        -b /
        (
          2 *
          a
        );

      const candidato =
        central
          .volumeMl +
        uVertice;

      if (
        Number.isFinite(
          candidato
        ) &&
        candidato >=
          anterior
            .volumeMl &&
        candidato <=
          posterior
            .volumeMl
      ) {
        volumePF =
          candidato;

        valorExtremo =
          a *
            uVertice *
            uVertice +
          b *
            uVertice +
          central
            .primeiraDerivada;
      }
    }
  }

  const tolerancia =
    1e-12;

  const primeiraDerivada =
    [
      ...primeira.filter(
        (
          ponto
        ) =>
          Math.abs(
            ponto
              .volumeMl -
            volumePF
          ) >
          tolerancia
      ),

      {
        volumeMl:
          volumePF,

        primeiraDerivada:
          valorExtremo,
      },
    ].sort(
      (
        a,
        b
      ) =>
        a
          .volumeMl -
        b
          .volumeMl
    );

  const segundaDerivada =
    [
      ...segundaBase.filter(
        (
          ponto
        ) =>
          Math.abs(
            ponto
              .volumeMl -
            volumePF
          ) >
          tolerancia
      ),

      {
        volumeMl:
          volumePF,

        segundaDerivada:
          0,
      },
    ].sort(
      (
        a,
        b
      ) =>
        a
          .volumeMl -
        b
          .volumeMl
    );

  return {
    primeiraDerivada,
    segundaDerivada,

    volumePFPrimeiraDerivadaMl:
      volumePF,

    valorExtremoPrimeiraDerivada:
      valorExtremo,

    volumePFSegundaDerivadaMl:
      volumePF,
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

    concentracaoIodetoLivreMolL:
      0.1,

    temperaturaC:
      25,
  };
}