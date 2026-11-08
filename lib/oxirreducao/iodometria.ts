import { calcularDerivadasRedox } from "./derivadas";

const R = 8.31446261815324;
const F = 96485.33212;

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
  /** Mol de I⁻ consumido na etapa de geração, antes da complexação I₂/I₃⁻. */
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

/** Potencial padrão do par I₂(aq)/I⁻ em escala de concentração, a 25 °C. */
export const E0_I2_AQ_I = 0.621;
/** @deprecated Use E0_I2_AQ_I; 0,5355 V pertence ao par I₂(s)/I⁻. */
export const E0_I2_I = E0_I2_AQ_I;
export const E0_TETRATIONATO_TIOS = 0.080;

/** Constante molal de formação I₂(aq) + I⁻ ⇌ I₃⁻ a 25 °C (tratada como concentração em solução diluída). */
export const K_FORMACAO_I3_25C = 698;
/** E° de I₃⁻ + 2e⁻ ⇌ 3I⁻ na convenção de atividades aproximadas por concentrações.
 * Derivado de E°(I₂(aq)/I⁻) e Kf para que ambas as equações de Nernst sejam coerentes.
 * Resulta em aproximadamente +0,53688 V a 25 °C (valor tabelado ~ +0,536 V).
 */
export const E0_I3_I_25C =
  E0_I2_AQ_I - (R * 298.15) / (2 * F) * Math.log(K_FORMACAO_I3_25C);
const DELTA_H_FORMACAO_I3_J_MOL = -17000;
const DELTA_CP_FORMACAO_I3_J_MOL_K = -21;
const TEMPERATURA_REFERENCIA_K = 298.15;

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
    molI2PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    molIodetoConsumidoPorMolAnalito: 2,
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
    molI2PorMolAnalito: 0.5,
    molTiossulfatoPorMolAnalito: 1,
    molIodetoConsumidoPorMolAnalito: 2,
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
    molI2PorMolAnalito: 2,
    molTiossulfatoPorMolAnalito: 4,
    molIodetoConsumidoPorMolAnalito: 4,
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
    molI2PorMolAnalito: 1,
    molTiossulfatoPorMolAnalito: 2,
    molIodetoConsumidoPorMolAnalito: 2,
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
  
    molI2PorMolAnalito:
      1,
  
    molTiossulfatoPorMolAnalito:
      2,
    molIodetoConsumidoPorMolAnalito: 2,
  
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
    molI2PorMolAnalito: 3,
    molTiossulfatoPorMolAnalito: 6,
    molIodetoConsumidoPorMolAnalito: 5,
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

  /**
   * Concentração inicial analítica de I⁻ na MISTURA REACIONAL antes da geração de iodo.
   * Multiplicada pelo volume inicial da mistura (volumeAmostraMl). NÃO é
   * a concentração do frasco de KI se ele foi adicionado com outro volume.
   * O motor desconta o I⁻ consumido na reação redox e resolve I₂/I₃⁻/I⁻.
   */
  concentracaoIodetoInicialMolL:
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

  /** Iodo oxidado total, expresso em equivalentes de I₂: n(I₂) + n(I₃⁻). */
  molI2:
    number;

  /** Iodeto analítico total antes da complexação: n(I⁻) + n(I₃⁻). */
  molIodeto:
    number;

  /** Quantidade de I₂(aq) livre após o equilíbrio de complexação. */
  molI2Livre:
    number;

  molI3:
    number;

  molIodetoLivre:
    number;

  molTiossulfato:
    number;

  molTetrationato:
    number;

  /** Concentração de I₂(aq) livre, utilizada na equação de Nernst. */
  concentracaoI2MolL:
    number;

  /** Concentração de I⁻ livre, utilizada na equação de Nernst. */
  concentracaoIodetoMolL:
    number;

  concentracaoI3MolL:
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

  // Iodeto remanescente após a reação geradora de iodo, antes de formar I3-.
  molIodetoDisponivelAposGeracao:
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
      .concentracaoIodetoInicialMolL,
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

  const molIodetoInicial = entrada.concentracaoIodetoInicialMolL *
    (entrada.volumeAmostraMl / 1000);
  const molIodetoConsumido = molAnalitoInicial *
    sistema.molIodetoConsumidoPorMolAnalito;
  const molIodetoDisponivelAposGeracao = molIodetoInicial - molIodetoConsumido;
  if (molIodetoDisponivelAposGeracao <= 0 ||
      molIodetoDisponivelAposGeracao <= molIodetoInicial * 1e-13) {
    throw new RangeError(
      `KI insuficiente para gerar quantitativamente o iodo no sistema ${sistema.nome}. ` +
      `A concentração inicial de I⁻ na mistura deve superar ` +
      `${(molIodetoConsumido / (entrada.volumeAmostraMl / 1000)).toLocaleString('pt-BR', { maximumFractionDigits: 10 })} mol/L. ` +
      `É necessário excesso de iodeto para formar I₃⁻.`
    );
  }

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
    molIodetoInicial,
    molIodetoConsumido,
    molIodetoDisponivelAposGeracao,
    molTiossulfatoEquivalencia,
    volumeEquivalenciaMl,
  };
}

/**
 * Constante de formação do triiodeto corrigida pela equação de van't Hoff.
 * A referência experimental disponível é Kf ≈ 698 (escala molal) a 25 °C,
 * ΔH° ≈ -17,0 kJ mol⁻¹ e ΔCp° ≈ -21 J mol⁻¹ K⁻¹. O modelo usa
 * concentrações como aproximação de atividades e não corrige força
 * iônica/coeficientes de atividade.
 */
function calcularConstanteFormacaoTriiodeto(temperaturaC: number) {
  const temperaturaK = kelvin(temperaturaC);
  const razaoTemperatura = temperaturaK / TEMPERATURA_REFERENCIA_K;
  const logK =
    Math.log(K_FORMACAO_I3_25C) +
    (DELTA_H_FORMACAO_I3_J_MOL / R) *
      (1 / TEMPERATURA_REFERENCIA_K - 1 / temperaturaK) +
    (DELTA_CP_FORMACAO_I3_J_MOL_K / R) *
      (Math.log(razaoTemperatura) +
        TEMPERATURA_REFERENCIA_K / temperaturaK -
        1);

  if (!Number.isFinite(logK) || logK > 700 || logK < -700) {
    throw new RangeError('A temperatura está fora da faixa numérica do equilíbrio I₂/I₃⁻.');
  }
  return Math.exp(logK);
}

/**
 * Resolve I₂(aq) + I⁻ ⇌ I₃⁻ a partir das concentrações analíticas totais.
 * Ct(I₂) = [I₂] + [I₃⁻]; Ct(I⁻) = [I⁻] + [I₃⁻].
 */
function calcularEspeciacaoIodo({
  molI2Total,
  molIodetoTotal,
  volumeTotalL,
  temperaturaC,
}: {
  molI2Total: number;
  molIodetoTotal: number;
  volumeTotalL: number;
  temperaturaC: number;
}) {
  const concentracaoI2Total = Math.max(molI2Total, 0) / volumeTotalL;
  const concentracaoIodetoTotal = Math.max(molIodetoTotal, 0) / volumeTotalL;
  const constanteFormacao = calcularConstanteFormacaoTriiodeto(temperaturaC);

  if (concentracaoI2Total === 0 || concentracaoIodetoTotal === 0) {
    return {
      concentracaoI2LivreMolL: concentracaoI2Total,
      concentracaoI3MolL: 0,
      concentracaoIodetoLivreMolL: concentracaoIodetoTotal,
      molI2Livre: Math.max(molI2Total, 0),
      molI3: 0,
      molIodetoLivre: Math.max(molIodetoTotal, 0),
    };
  }

  // Raiz menor da quadrática calculada na forma estável para evitar cancelamento.
  const termoA =
    (1 / constanteFormacao) +
    concentracaoI2Total +
    concentracaoIodetoTotal;
  const produto = concentracaoI2Total * concentracaoIodetoTotal;
  const discriminante = Math.max(termoA * termoA - 4 * produto, 0);
  const concentracaoI3MolL =
    (2 * produto) / (termoA + Math.sqrt(discriminante));
  const concentracaoI2LivreMolL = Math.max(
    concentracaoI2Total - concentracaoI3MolL,
    0
  );
  const concentracaoIodetoLivreMolL = Math.max(
    concentracaoIodetoTotal - concentracaoI3MolL,
    0
  );

  return {
    concentracaoI2LivreMolL,
    concentracaoI3MolL,
    concentracaoIodetoLivreMolL,
    molI2Livre: concentracaoI2LivreMolL * volumeTotalL,
    molI3: concentracaoI3MolL * volumeTotalL,
    molIodetoLivre: concentracaoIodetoLivreMolL * volumeTotalL,
  };
}

/** Potencial padrão efetivo I₃⁻/I⁻ a T, calculado com o mesmo Kf(T) do motor.
 * Não inclui a dependência térmica intrínseca do E°(I₂(aq)/I⁻).
 */
function calcularE0Triiodeto(temperaturaC: number) {
  const termo = R * kelvin(temperaturaC) / (2 * F);
  return E0_I2_AQ_I - termo * Math.log(calcularConstanteFormacaoTriiodeto(temperaturaC));
}

function logQuocienteReacao({
  molI2Remanescente,
  molIodetoTotal,
  molTiossulfatoRemanescente,
  molTetrationato,
  volumeTotalL,
  temperaturaC,
}: {
  molI2Remanescente: number;
  molIodetoTotal: number;
  molTiossulfatoRemanescente: number;
  molTetrationato: number;
  volumeTotalL: number;
  temperaturaC: number;
}) {
  const piso = 1e-300;
  const especiacao = calcularEspeciacaoIodo({
    molI2Total: Math.max(molI2Remanescente, 0),
    molIodetoTotal: Math.max(molIodetoTotal, 0),
    volumeTotalL,
    temperaturaC,
  });

  const cI2Livre = Math.max(especiacao.concentracaoI2LivreMolL, piso);
  const cIodetoLivre = Math.max(especiacao.concentracaoIodetoLivreMolL, piso);
  const cTiossulfato = Math.max(molTiossulfatoRemanescente / volumeTotalL, piso);
  const cTetrationato = Math.max(molTetrationato / volumeTotalL, piso);

  return (
    2 * Math.log(cIodetoLivre) +
    Math.log(cTetrationato) -
    Math.log(cI2Livre) -
    2 * Math.log(cTiossulfato)
  );
}

type ResultadoExtensaoIodometria = {
  extentMol: number;
  molI2Remanescente: number;
  molTiossulfatoRemanescente: number;
};

function resolverExtensaoEquilibrio({
  molI2Inicial,
  molIodetoInicial,
  molTiossulfatoAdicionado,
  volumeTotalL,
  temperaturaC,
}: {
  molI2Inicial: number;
  molIodetoInicial: number;
  molTiossulfatoAdicionado: number;
  volumeTotalL: number;
  temperaturaC: number;
}): ResultadoExtensaoIodometria {
  if (molTiossulfatoAdicionado <= 0) {
    return {
      extentMol: 0,
      molI2Remanescente: molI2Inicial,
      molTiossulfatoRemanescente: molTiossulfatoAdicionado,
    };
  }

  if (molI2Inicial <= 0) {
    return {
      extentMol: 0,
      molI2Remanescente: 0,
      molTiossulfatoRemanescente: molTiossulfatoAdicionado,
    };
  }

  const temperaturaK = kelvin(temperaturaC);
  const logK =
    (2 * F * (E0_I2_AQ_I - E0_TETRATIONATO_TIOS)) /
    (R * temperaturaK);

  // Antes do PE, o tiossulfato é o reagente limitante e seu resíduo é
  // a variável de busca. Depois do PE, o iodo é limitante e buscamos
  // diretamente o pequeno resíduo de I₂, evitando cancelamento em nI₂ - ξ.
  const excessoTiossulfato =
    molTiossulfatoAdicionado - 2 * molI2Inicial;
  const aposPE = excessoTiossulfato >= 0;

  let limiteInferior = 0;
  let limiteSuperior = aposPE
    ? molI2Inicial
    : molTiossulfatoAdicionado;

  const avaliar = (residuo: number) => {
    let extentMol: number;
    let molI2Remanescente: number;
    let molTiossulfatoRemanescente: number;
    let molIodetoTotal: number;

    if (aposPE) {
      molI2Remanescente = residuo;
      extentMol = molI2Inicial - residuo;
      molTiossulfatoRemanescente = excessoTiossulfato + 2 * residuo;
      molIodetoTotal = molIodetoInicial + 2 * extentMol;
    } else {
      molTiossulfatoRemanescente = residuo;
      extentMol = (molTiossulfatoAdicionado - residuo) / 2;
      molI2Remanescente =
        (molI2Inicial - molTiossulfatoAdicionado / 2) + residuo / 2;
      molIodetoTotal = molIodetoInicial + molTiossulfatoAdicionado - residuo;
    }

    const logQ = logQuocienteReacao({
      molI2Remanescente,
      molIodetoTotal,
      molTiossulfatoRemanescente,
      molTetrationato: extentMol,
      volumeTotalL,
      temperaturaC,
    });

    return {
      funcao: logQ - logK,
      extentMol,
      molI2Remanescente,
      molTiossulfatoRemanescente,
    };
  };

  let resultadoInferior = avaliar(limiteInferior);
  let resultadoSuperior = avaliar(limiteSuperior);

  // O limite de reagente totalmente consumido é matemático; aplica-se
  // uma pequena fração positiva apenas para avaliar a função logarítmica.
  if (!Number.isFinite(resultadoInferior.funcao)) {
    limiteInferior = Math.max(
      limiteSuperior * Number.EPSILON * 4,
      Number.MIN_VALUE
    );
    resultadoInferior = avaliar(limiteInferior);
  }
  if (!Number.isFinite(resultadoSuperior.funcao)) {
    limiteSuperior = Math.max(
      limiteSuperior - Math.max(limiteSuperior * Number.EPSILON * 4, Number.MIN_VALUE),
      limiteInferior
    );
    resultadoSuperior = avaliar(limiteSuperior);
  }

  if (resultadoInferior.funcao < 0 || resultadoSuperior.funcao > 0) {
    throw new Error('Não foi possível delimitar o equilíbrio da titulação iodimétrica.');
  }

  for (let iteracao = 0; iteracao < 220; iteracao += 1) {
    const meio = (limiteInferior + limiteSuperior) / 2;
    const resultadoMeio = avaliar(meio);

    if (resultadoMeio.funcao > 0) {
      limiteInferior = meio;
    } else {
      limiteSuperior = meio;
    }

    if (
      limiteSuperior - limiteInferior <=
      Math.max(limiteSuperior * 1e-14, Number.MIN_VALUE * 4)
    ) break;
  }

  const resultadoFinal = avaliar((limiteInferior + limiteSuperior) / 2);
  return {
    extentMol: resultadoFinal.extentMol,
    molI2Remanescente: resultadoFinal.molI2Remanescente,
    molTiossulfatoRemanescente: resultadoFinal.molTiossulfatoRemanescente,
  };
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

  // O I⁻ conhecido experimentalmente é o inicial na mistura. A etapa de
  // geração já consumiu a quantidade imposta pela estequiometria de cada analito.
  const molIodetoInicial = resumo.molIodetoDisponivelAposGeracao;

  const molTiossulfatoAdicionado =
    entrada
      .concentracaoTiossulfatoMolL *
    volumeAdicionadoL;

  const equilibrioExtensao =
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

  const extentMol = equilibrioExtensao.extentMol;
  const molI2Total = equilibrioExtensao.molI2Remanescente;
  const molIodetoTotal = molIodetoInicial + 2 * extentMol;
  const molTiossulfato = equilibrioExtensao.molTiossulfatoRemanescente;
  const molTetrationato = extentMol;

  const especiacaoIodo = calcularEspeciacaoIodo({
    molI2Total,
    molIodetoTotal,
    volumeTotalL,
    temperaturaC: entrada.temperaturaC,
  });

  const concentracaoTiossulfatoMolL =
    molTiossulfato / volumeTotalL;
  const concentracaoTetrationatoMolL =
    molTetrationato / volumeTotalL;

  const T = kelvin(entrada.temperaturaC);
  const termo = (R * T) / (2 * F);
  const piso = 1e-300;

  // Referência principal: I₃⁻ + 2 e⁻ ⇌ 3 I⁻.
  // E°(I₃⁻/I⁻) é derivado de E°(I₂(aq)/I⁻) e Kf(T), evitando divergência
  // de modelo. A forma I₂(aq)/I⁻ continua disponível como alternativa numérica.
  const cIodeto = Math.max(especiacaoIodo.concentracaoIodetoLivreMolL, piso);
  const potencialIodo = especiacaoIodo.concentracaoI3MolL > piso
    ? calcularE0Triiodeto(entrada.temperaturaC) + termo * (
        Math.log(especiacaoIodo.concentracaoI3MolL) - 3 * Math.log(cIodeto)
      )
    : E0_I2_AQ_I + termo * (
        Math.log(Math.max(especiacaoIodo.concentracaoI2LivreMolL, piso)) -
        2 * Math.log(cIodeto)
      );

  let potencialV = potencialIodo;
  if (
    molTiossulfatoAdicionado > 0 &&
    concentracaoTetrationatoMolL > 0 &&
    concentracaoTiossulfatoMolL > 0
  ) {
    const potencialTios =
      E0_TETRATIONATO_TIOS +
      termo *
        Math.log(
          Math.max(concentracaoTetrationatoMolL, piso) /
            Math.pow(Math.max(concentracaoTiossulfatoMolL, piso), 2)
        );

    if (Number.isFinite(potencialTios)) {
      potencialV = (potencialIodo + potencialTios) / 2;
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
    molI2: molI2Total,
    molIodeto: molIodetoTotal,
    molI2Livre: especiacaoIodo.molI2Livre,
    molI3: especiacaoIodo.molI3,
    molIodetoLivre: especiacaoIodo.molIodetoLivre,
    molTiossulfato,
    molTetrationato,
    concentracaoI2MolL: especiacaoIodo.concentracaoI2LivreMolL,
    concentracaoIodetoMolL: especiacaoIodo.concentracaoIodetoLivreMolL,
    concentracaoI3MolL: especiacaoIodo.concentracaoI3MolL,
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

    molIodetoDisponivelAposGeracao:
      resumo
        .molIodetoDisponivelAposGeracao,

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
    number | null;
};

export function calcularDerivadasIodometria(
  pontosEntrada: PontoIodometria[]
): ResultadoDerivadasIodometria {
  // O potencial cai durante a titulação iodimétrica; por isso localizamos
  // o extremo de maior magnitude de dE/dV (o vale), não o maior valor algébrico.
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
    volumePFPrimeiraDerivadaMl: resultado.volumePFPrimeiraDerivadaMl,
    valorExtremoPrimeiraDerivada: resultado.valorMaximoPrimeiraDerivada,
    volumePFSegundaDerivadaMl: resultado.volumePFSegundaDerivadaMl,
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

    concentracaoIodetoInicialMolL:
      0.1,

    temperaturaC:
      25,
  };
}