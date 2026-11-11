"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entradaPadraoIodometria = exports.calcularDerivadasIodometria = exports.gerarCurvaIodometria = exports.calcularPontoIodometria = exports.localizarRegiaoIodometriaPorBuscaBinaria = exports.calcularMediaFormalPotenciaisPadraoIodometria = exports.calcularPotencialEquivalenciaIodometria = exports.calcularResumoEstequiometricoIodometria = exports.buscarSistemaIodometria = exports.sistemasIodometria = exports.TEXTO_INDICADOR_AMIDO = exports.SEMIRREACAO_TIOS = exports.SEMIRREACAO_IODO = exports.EQUILIBRIO_TRIIODeto = exports.REACAO_TIOS = exports.FATOR_NERNST_25C = exports.ELETRONS_PAR_TETRATIONATO_TIOS = exports.ELETRONS_PAR_I3_I = exports.E0_IO3_I_25C = exports.E0_HCLO_CL_25C = exports.E0_H2O2_H2O_25C = exports.E0_CL2_CL_25C = exports.E0_TETRATIONATO_TIOS = exports.E0_I3_I_25C = void 0;
const derivadas_1 = require("./derivadas");
/**
 * Potencial padrão de redução adotado para o par triiodeto/iodeto:
 *
 * I₃⁻ + 2 e⁻ ⇌ 3 I⁻
 *
 * Valor de referência utilizado pela metodologia da orientadora: +0,536 V
 * a 25 °C. O motor trabalha diretamente com I₃⁻; não converte o potencial
 * a partir de I₂(aq), nem resolve o equilíbrio de formação I₂/I₃⁻.
 */
exports.E0_I3_I_25C = 0.536;
/** Potencial padrão de redução do par tetrationato/tiossulfato:
 * S₄O₆²⁻ + 2 e⁻ ⇌ 2 S₂O₃²⁻.
 */
exports.E0_TETRATIONATO_TIOS = 0.080;
/** Potenciais padrão de redução transcritos do Apêndice 5 de Skoog et al. */
exports.E0_CL2_CL_25C = 1.359;
exports.E0_H2O2_H2O_25C = 1.776;
/**
 * Potencial derivado para HClO/Cl⁻ a partir de duas linhas da tabela:
 * HClO + H⁺ + e⁻ ⇌ ½ Cl₂ + H₂O       E° = +1,630 V
 * Cl₂ + 2 e⁻ ⇌ 2 Cl⁻                 E° = +1,359 V
 * Multiplica-se a primeira por 2; somam-se as reações e divide-se o
 * resultado por 2. E° global = [2(1,630) + 2(1,359)] / 4 = +1,4945 V.
 */
exports.E0_HCLO_CL_25C = (1.630 + exports.E0_CL2_CL_25C) / 2;
/**
 * Potencial derivado para IO₃⁻/I⁻ a partir de duas linhas da tabela:
 * IO₃⁻ + 6 H⁺ + 5 e⁻ ⇌ ½ I₂(s) + 3 H₂O   E° = +1,196 V
 * ½ I₂(s) + e⁻ ⇌ I⁻                      E° = +0,5355 V
 * E° global = [5(1,196) + 1(0,5355)] / 6 = +1,0859167 V.
 */
exports.E0_IO3_I_25C = (5 * 1.196 + 0.5355) / 6;
/** Número de elétrons de cada par na etapa titulométrica. */
exports.ELETRONS_PAR_I3_I = 2;
exports.ELETRONS_PAR_TETRATIONATO_TIOS = 2;
/** Constante de Nernst usada nos slides a 25 °C (V por década, para n = 1). */
exports.FATOR_NERNST_25C = 0.0592;
exports.REACAO_TIOS = "I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻";
exports.EQUILIBRIO_TRIIODeto = "I₂ + I⁻ ⇌ I₃⁻";
exports.SEMIRREACAO_IODO = "I₃⁻ + 2 e⁻ ⇌ 3 I⁻";
exports.SEMIRREACAO_TIOS = "S₄O₆²⁻ + 2 e⁻ ⇌ 2 S₂O₃²⁻";
const OBSERVACAO_PAR_I3_I_REDUCAO = "O potencial padrão é apresentado no sentido de redução, conforme a tabela de referência. Na reação global de geração do iodo, o iodeto atua como redutor e é oxidado.";
exports.TEXTO_INDICADOR_AMIDO = "O amido é empregado próximo ao ponto final porque a amilose organiza-se em uma estrutura helicoidal capaz de formar um complexo de inclusão tridimensional com espécies de iodo, especialmente I₃⁻, produzindo coloração azul intensa. À medida que o iodo é consumido pelo tiossulfato, a coloração desaparece.";
exports.sistemasIodometria = [
    {
        id: "cloro-ativo",
        nome: "Cloro ativo",
        formulaAnalito: "Cl₂",
        nomeCompleto: "Cloro ativo — expresso como Cl₂",
        descricao: "O cloro oxida iodeto; em KI em excesso, o iodo gerado aparece predominantemente como I₃⁻ e é titulado com tiossulfato.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Redução do analito",
                equacao: "Cl₂ + 2 e⁻ ⇌ 2 Cl⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_CL2_CL_25C,
            },
            {
                titulo: "Redução do triiodeto",
                equacao: "I₃⁻ + 2 e⁻ ⇌ 3 I⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: "O potencial padrão é apresentado no sentido de redução, conforme a tabela de referência. Na reação global de geração do iodo, o iodeto atua como redutor e é oxidado.",
            },
        ],
        etapasPreTitulacao: [
            "Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻",
        ],
        reacaoGlobalGeracaoIodo: "Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻",
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
        observacao: "O cloro ativo é expresso como Cl₂. O iodeto deve estar em excesso para garantir geração quantitativa de iodo.",
        concentracaoAnalitoPadraoMolL: 0.01,
        concentracaoTiossulfatoPadraoMolL: 0.02,
    },
    {
        id: "cobre-ii",
        nome: "Cobre(II)",
        formulaAnalito: "Cu²⁺",
        nomeCompleto: "Cobre(II) — Cu²⁺",
        descricao: "Cu²⁺ reage com iodeto e forma CuI(s); o iodo oxidado permanece predominantemente como I₃⁻ em excesso de KI.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Redução de Cu²⁺ com precipitação",
                equacao: "Cu²⁺ + I⁻ + e⁻ ⇌ CuI(s)",
                eletrons: 1,
                potencialPadraoV: 0.86,
                observacao: "O potencial considera a formação de CuI(s), que desloca a reação para a formação de Cu(I).",
            },
            {
                titulo: "Redução do triiodeto",
                equacao: "I₃⁻ + 2 e⁻ ⇌ 3 I⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: OBSERVACAO_PAR_I3_I_REDUCAO,
            },
        ],
        etapasPreTitulacao: [
            "2 Cu²⁺ + 5 I⁻ → 2 CuI(s) + I₃⁻",
        ],
        reacaoGlobalGeracaoIodo: "2 Cu²⁺ + 5 I⁻ → 2 CuI(s) + I₃⁻",
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
        observacao: "A formação do precipitado CuI remove Cu(I) do meio e favorece a reação quantitativa com iodeto.",
        concentracaoAnalitoPadraoMolL: 0.02,
        concentracaoTiossulfatoPadraoMolL: 0.02,
    },
    {
        id: "oxigenio-dissolvido",
        nome: "Oxigênio dissolvido",
        formulaAnalito: "O₂",
        nomeCompleto: "Oxigênio dissolvido — O₂ (Winkler)",
        descricao: "O método de Winkler fixa o O₂ por espécies de manganês; após acidificação, iodo equivalente ao O₂ original é liberado e titulado.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Referência termodinâmica do O₂",
                equacao: "O₂ + 4 H⁺ + 4 e⁻ ⇌ 2 H₂O",
                eletrons: 4,
                potencialPadraoV: 1.229,
                observacao: "É uma referência termodinâmica. No método de Winkler, o O₂ não é titulado diretamente com iodeto: ele é inicialmente fixado por manganês.",
            },
            {
                titulo: "Redução do triiodeto equivalente",
                equacao: "2 I₃⁻ + 4 e⁻ ⇌ 6 I⁻",
                eletrons: 4,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: OBSERVACAO_PAR_I3_I_REDUCAO,
            },
        ],
        etapasPreTitulacao: [
            "Mn²⁺ + 2 OH⁻ → Mn(OH)₂(s)",
            "2 Mn(OH)₂ + ½ O₂ + H₂O → 2 Mn(OH)₃(s)",
            "2 Mn(OH)₃ + 6 H⁺ + 3 I⁻ → 2 Mn²⁺ + I₃⁻ + 6 H₂O",
            "I₃⁻ ⇌ I₂ + I⁻",
            "Equivalente global em KI em excesso: O₂ + 6 I⁻ + 4 H⁺ → 2 I₃⁻ + 2 H₂O",
        ],
        reacaoGlobalGeracaoIodo: "O₂ + 6 I⁻ + 4 H⁺ → 2 I₃⁻ + 2 H₂O (equivalente global do Winkler em KI em excesso)",
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
        agenteOxidantePrimeiraEtapa: "O₂ (via manganês oxidado no método de Winkler)",
        agenteRedutorPrimeiraEtapa: "I⁻ na etapa de liberação do iodo",
        observacao: "O motor preserva a estequiometria global do Winkler. A concentração padrão de O₂ corresponde a aproximadamente 8 mg L⁻¹.",
        concentracaoAnalitoPadraoMolL: 0.00025,
        concentracaoTiossulfatoPadraoMolL: 0.001,
    },
    {
        id: "peroxido-hidrogenio",
        nome: "Peróxido de hidrogênio",
        formulaAnalito: "H₂O₂",
        nomeCompleto: "Peróxido de hidrogênio — H₂O₂",
        descricao: "H₂O₂ oxida iodeto em meio ácido, gerando iodo que aparece predominantemente como I₃⁻ em KI em excesso.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Redução do peróxido",
                equacao: "H₂O₂ + 2 H⁺ + 2 e⁻ ⇌ 2 H₂O",
                eletrons: 2,
                potencialPadraoV: exports.E0_H2O2_H2O_25C,
            },
            {
                titulo: "Redução do triiodeto",
                equacao: "I₃⁻ + 2 e⁻ ⇌ 3 I⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: OBSERVACAO_PAR_I3_I_REDUCAO,
            },
        ],
        etapasPreTitulacao: [
            "H₂O₂ + 3 I⁻ + 2 H⁺ → I₃⁻ + 2 H₂O",
        ],
        reacaoGlobalGeracaoIodo: "H₂O₂ + 3 I⁻ + 2 H⁺ → I₃⁻ + 2 H₂O",
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
        observacao: "A reação de liberação de iodo é realizada em meio ácido e com iodeto em excesso.",
        concentracaoAnalitoPadraoMolL: 0.01,
        concentracaoTiossulfatoPadraoMolL: 0.02,
    },
    {
        id: "hipoclorito",
        nome: "Hipoclorito",
        formulaAnalito: "ClO⁻",
        nomeCompleto: "Hipoclorito — ClO⁻",
        descricao: "Em meio ácido, o hipoclorito é protonado a HClO, que oxida iodeto; o iodo aparece predominantemente como I₃⁻ quando há KI em excesso.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Redução da espécie de cloro(I)",
                equacao: "HClO + H⁺ + 2 e⁻ ⇌ Cl⁻ + H₂O",
                eletrons: 2,
                potencialPadraoV: exports.E0_HCLO_CL_25C,
                observacao: "Potencial derivado das semirreações do Skoog: HClO + H⁺ + e⁻ ⇌ ½ Cl₂ + H₂O (+1,630 V; 1 e⁻) e Cl₂ + 2 e⁻ ⇌ 2 Cl⁻ (+1,359 V; 2 e⁻). Multiplica-se a primeira por 2, somam-se as equações e divide-se a global por 2. Pela aditividade de ΔG°, E° = +1,4945 V (exibido como +1,495 V). ClO⁻ é protonado a HClO em meio ácido.",
            },
            {
                titulo: "Redução do triiodeto",
                equacao: "I₃⁻ + 2 e⁻ ⇌ 3 I⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: OBSERVACAO_PAR_I3_I_REDUCAO,
            },
        ],
        etapasPreTitulacao: [
            "ClO⁻ + 3 I⁻ + 2 H⁺ → Cl⁻ + I₃⁻ + H₂O",
        ],
        reacaoGlobalGeracaoIodo: "ClO⁻ + 3 I⁻ + 2 H⁺ → Cl⁻ + I₃⁻ + H₂O",
        eletronsGeracaoIodo: 2,
        molI3PorMolAnalito: 1,
        molTiossulfatoPorMolAnalito: 2,
        molIodetoConsumidoPorMolAnalito: 3,
        relacaoPrimeiraEtapa: "1 ClO⁻ : 1 I₃⁻",
        relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
        relacaoGlobal: "1 ClO⁻ : 1 I₃⁻ : 2 S₂O₃²⁻",
        igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = n(ClO⁻)",
        igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
        igualdadeMolsGlobal: "n(S₂O₃²⁻) = 2 n(ClO⁻)",
        agenteOxidantePrimeiraEtapa: "HClO (proveniente da protonação de ClO⁻)",
        agenteRedutorPrimeiraEtapa: "I⁻",
        observacao: "A acidificação converte ClO⁻ em HClO e favorece a liberação quantitativa de iodo a partir de iodeto.",
        concentracaoAnalitoPadraoMolL: 0.01,
        concentracaoTiossulfatoPadraoMolL: 0.02,
    },
    {
        id: "iodato",
        nome: "Iodato",
        formulaAnalito: "IO₃⁻",
        nomeCompleto: "Iodato — IO₃⁻",
        descricao: "IO₃⁻ reage com iodeto em meio ácido, gerando três equivalentes de iodo (predominantemente I₃⁻ em KI em excesso) por mol de iodato.",
        titulante: "Na₂S₂O₃",
        indicador: "Amido",
        semirreacoes: [
            {
                titulo: "Redução do iodato a iodeto",
                equacao: "IO₃⁻ + 6 H⁺ + 6 e⁻ ⇌ I⁻ + 3 H₂O",
                eletrons: 6,
                potencialPadraoV: exports.E0_IO3_I_25C,
                observacao: "Potencial derivado das semirreações do Skoog: IO₃⁻ + 6 H⁺ + 5 e⁻ ⇌ ½ I₂(s) + 3 H₂O (+1,196 V; 5 e⁻) e I₂(s) + 2 e⁻ ⇌ 2 I⁻ (+0,5355 V; 2 e⁻). Multiplica-se a segunda por ½ para obter ½ I₂(s) + e⁻ ⇌ I⁻. Pela aditividade de ΔG°, E° = +1,0859167 V (exibido como +1,086 V).",
            },
            {
                titulo: "Redução do triiodeto equivalente",
                equacao: "3 I₃⁻ + 6 e⁻ ⇌ 9 I⁻",
                eletrons: 6,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: OBSERVACAO_PAR_I3_I_REDUCAO,
            },
        ],
        etapasPreTitulacao: [
            "IO₃⁻ + 8 I⁻ + 6 H⁺ → 3 I₃⁻ + 3 H₂O",
        ],
        reacaoGlobalGeracaoIodo: "IO₃⁻ + 8 I⁻ + 6 H⁺ → 3 I₃⁻ + 3 H₂O",
        eletronsGeracaoIodo: 6,
        molI3PorMolAnalito: 3,
        molTiossulfatoPorMolAnalito: 6,
        molIodetoConsumidoPorMolAnalito: 8,
        relacaoPrimeiraEtapa: "1 IO₃⁻ : 3 I₃⁻",
        relacaoSegundaEtapa: "1 I₃⁻ : 2 S₂O₃²⁻",
        relacaoGlobal: "1 IO₃⁻ : 3 I₃⁻ : 6 S₂O₃²⁻",
        igualdadeMolsPrimeiraEtapa: "n(I₃⁻) = 3 n(IO₃⁻)",
        igualdadeMolsSegundaEtapa: "n(S₂O₃²⁻) = 2 n(I₃⁻)",
        igualdadeMolsGlobal: "n(S₂O₃²⁻) = 6 n(IO₃⁻)",
        agenteOxidantePrimeiraEtapa: "IO₃⁻",
        agenteRedutorPrimeiraEtapa: "I⁻",
        observacao: "A reação requer meio ácido e excesso de iodeto; um mol de iodato libera três mols de iodo.",
        concentracaoAnalitoPadraoMolL: 0.003333333333,
        concentracaoTiossulfatoPadraoMolL: 0.02,
    },
];
function buscarSistemaIodometria(id) {
    const sistema = exports.sistemasIodometria.find((item) => item.id === id);
    if (!sistema) {
        throw new RangeError(`Sistema iodimétrico desconhecido: ${String(id)}.`);
    }
    return sistema;
}
exports.buscarSistemaIodometria = buscarSistemaIodometria;
function kelvin(temperaturaC) {
    return temperaturaC + 273.15;
}
function validarEntrada(entrada) {
    const valores = [
        entrada.concentracaoAnalitoMolL,
        entrada.volumeAmostraMl,
        entrada.concentracaoTiossulfatoMolL,
    ];
    if (valores.some((valor) => !Number.isFinite(valor) || valor <= 0)) {
        throw new Error("Concentrações e volume da amostra devem ser positivos e finitos.");
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
function calcularResumoEstequiometricoIodometria(entrada) {
    validarEntrada(entrada);
    const sistema = buscarSistemaIodometria(entrada.sistemaId);
    const volumeAmostraL = entrada.volumeAmostraMl / 1000;
    const molAnalitoInicial = entrada.concentracaoAnalitoMolL * volumeAmostraL;
    const molI3Gerado = molAnalitoInicial * sistema.molI3PorMolAnalito;
    // Consumo global de I⁻ inclui o iodeto oxidado e o incorporado ao I₃⁻.
    // Ex.: Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻.
    const molKIMinimo = molAnalitoInicial * sistema.molIodetoConsumidoPorMolAnalito;
    const concentracaoKIMinimaMolL = molKIMinimo / volumeAmostraL;
    const molTiossulfatoEquivalencia = molAnalitoInicial * sistema.molTiossulfatoPorMolAnalito;
    const volumeEquivalenciaMl = (molTiossulfatoEquivalencia /
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
exports.calcularResumoEstequiometricoIodometria = calcularResumoEstequiometricoIodometria;
/**
 * Fator de Nernst para n = 2, na forma decimal usada nos slides.
 * Em 25 °C retorna exatamente 0,0592 / 2 = 0,0296 V por década.
 * Para outra temperatura, ajusta-se proporcionalmente à temperatura absoluta.
 * Os potenciais padrão permanecem como referências tabeladas a 25 °C.
 */
function calcularFatorNernstDoisEletrons(temperaturaC) {
    return ((exports.FATOR_NERNST_25C / 2) *
        (kelvin(temperaturaC) / 298.15));
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
function calcularPotencialEquivalenciaIodometria(entrada) {
    const resumo = calcularResumoEstequiometricoIodometria(entrada);
    return calcularPontoIodometria({
        entrada,
        volumeAdicionadoMl: resumo.volumeEquivalenciaMl,
    }).potencialV;
}
exports.calcularPotencialEquivalenciaIodometria = calcularPotencialEquivalenciaIodometria;
/**
 * A média ponderada usada na versão anterior da validação é mantida apenas
 * como referência matemática dos potenciais padrão. Ela não é usada como
 * potencial do PE porque não satisfaz, em geral, as duas equações de Nernst
 * com os coeficientes estequiométricos reais dos pares I₃⁻/I⁻ e
 * S₄O₆²⁻/S₂O₃²⁻.
 */
function calcularMediaFormalPotenciaisPadraoIodometria() {
    const a = exports.ELETRONS_PAR_I3_I;
    const b = exports.ELETRONS_PAR_TETRATIONATO_TIOS;
    return (a * exports.E0_I3_I_25C +
        b * exports.E0_TETRATIONATO_TIOS) / (a + b);
}
exports.calcularMediaFormalPotenciaisPadraoIodometria = calcularMediaFormalPotenciaisPadraoIodometria;
/**
 * Localiza a região da titulação por busca binária em limites ordenados:
 * antes do PE, faixa de equivalência e após o PE.
 *
 * A busca escolhe qual modelo químico será aplicado; ela não substitui
 * os balanços estequiométricos nem as equações de Nernst de cada região.
 */
function localizarRegiaoIodometriaPorBuscaBinaria(volumeAdicionadoMl, volumeEquivalenciaMl) {
    if (!Number.isFinite(volumeAdicionadoMl) ||
        volumeAdicionadoMl < 0 ||
        !Number.isFinite(volumeEquivalenciaMl) ||
        volumeEquivalenciaMl <= 0) {
        throw new Error("Volumes inválidos para localizar a região da iodometria.");
    }
    const toleranciaPE = Math.max(volumeEquivalenciaMl * 1e-10, 1e-10);
    const epsilonLimite = Number.EPSILON * Math.max(volumeEquivalenciaMl, 1);
    const limitesSuperiores = [
        volumeEquivalenciaMl - toleranciaPE - epsilonLimite,
        volumeEquivalenciaMl + toleranciaPE,
        Number.POSITIVE_INFINITY,
    ];
    const regioes = [
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
        }
        else {
            esquerda = meio + 1;
        }
    }
    return regioes[esquerda];
}
exports.localizarRegiaoIodometriaPorBuscaBinaria = localizarRegiaoIodometriaPorBuscaBinaria;
/** Soma dois valores positivos representados em log₁₀, sem overflow. */
function log10Soma(logA, logB) {
    if (logA === Number.NEGATIVE_INFINITY)
        return logB;
    if (logB === Number.NEGATIVE_INFINITY)
        return logA;
    const maior = Math.max(logA, logB);
    return maior + Math.log10(Math.pow(10, logA - maior) +
        Math.pow(10, logB - maior));
}
/** Calcula log₁₀(1 − 10ˣ) com estabilidade quando x está próximo de zero. */
function log10UmMenosDezElevado(x) {
    const diferenca = -Math.expm1(x * Math.LN10);
    if (!(diferenca > 0))
        return Number.NEGATIVE_INFINITY;
    return Math.log10(diferenca);
}
function converterLogMolsParaNumero(logMols) {
    if (logMols === Number.NEGATIVE_INFINITY || logMols < -323)
        return 0;
    if (logMols > 308)
        return Number.POSITIVE_INFINITY;
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
function resolverEquilibrioIodometria({ entrada, volumeAdicionadoMl, molI3Inicial, volumeEquivalenciaMl, }) {
    if (volumeAdicionadoMl <= 0) {
        throw new RangeError("Em 0,00 mL ainda não há tiossulfato/tetrationato para definir o equilíbrio entre os dois pares redox.");
    }
    const volumeTotalL = (entrada.volumeAmostraMl + volumeAdicionadoMl) / 1000;
    const volumeTiossulfatoL = volumeAdicionadoMl / 1000;
    const molTiossulfatoAdicionado = entrada.concentracaoTiossulfatoMolL * volumeTiossulfatoL;
    const extensaoMaxima = Math.min(molI3Inicial, molTiossulfatoAdicionado / 2);
    if (!(extensaoMaxima > 0)) {
        throw new RangeError("Não há quantidade positiva de titulante para resolver o equilíbrio iodimétrico.");
    }
    const logExtensaoMaxima = Math.log10(extensaoMaxima);
    const logVolumeTotal = Math.log10(volumeTotalL);
    const estaAntesOuNoPE = volumeAdicionadoMl <= volumeEquivalenciaMl;
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
    const logCoeficienteTiossulfato = Math.log10(coeficienteTiossulfato);
    const fatorNernst = calcularFatorNernstDoisEletrons(entrada.temperaturaC);
    const avaliarFracaoRemanescente = (logFracao) => {
        const logUmMenosFracao = log10UmMenosDezElevado(logFracao);
        // Balanços em mol, calculados em espaço logarítmico.
        const logMolI3 = log10Soma(logBaseI3, logCoeficienteI3 + logFracao);
        const logMolIodeto = Math.log10(3) +
            logExtensaoMaxima +
            logUmMenosFracao;
        const logMolTiossulfato = log10Soma(logBaseTiossulfato, logCoeficienteTiossulfato + logFracao);
        const logMolTetrationato = logExtensaoMaxima +
            logUmMenosFracao;
        // Concentrações = quantidade de matéria / volume total.
        const logI3 = logMolI3 - logVolumeTotal;
        const logIodeto = logMolIodeto - logVolumeTotal;
        const logTiossulfato = logMolTiossulfato - logVolumeTotal;
        const logTetrationato = logMolTetrationato - logVolumeTotal;
        // Q(I₃⁻/I⁻) = [I⁻]³/[I₃⁻].
        const logQIodo = 3 * logIodeto - logI3;
        // Q(S₄O₆²⁻/S₂O₃²⁻) = [S₂O₃²⁻]²/[S₄O₆²⁻].
        const logQTiossulfato = 2 * logTiossulfato - logTetrationato;
        const potencialParI3IodetoV = exports.E0_I3_I_25C - fatorNernst * logQIodo;
        const potencialParTetrationatoTiossulfatoV = exports.E0_TETRATIONATO_TIOS -
            fatorNernst * logQTiossulfato;
        return {
            residuo: potencialParI3IodetoV -
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
    const residuoInferior = avaliarFracaoRemanescente(limiteInferior).residuo;
    const residuoSuperior = avaliarFracaoRemanescente(limiteSuperior).residuo;
    if (!Number.isFinite(residuoInferior) ||
        !Number.isFinite(residuoSuperior) ||
        residuoInferior > 0 ||
        residuoSuperior < 0) {
        throw new Error("Não foi possível delimitar o equilíbrio eletroquímico da iodometria.");
    }
    for (let iteracao = 0; iteracao < 80; iteracao += 1) {
        const meio = (limiteInferior + limiteSuperior) / 2;
        const residuoMeio = avaliarFracaoRemanescente(meio).residuo;
        if (residuoMeio > 0) {
            limiteSuperior = meio;
        }
        else {
            limiteInferior = meio;
        }
    }
    const logFracaoEquilibrio = (limiteInferior + limiteSuperior) / 2;
    const equilibrio = avaliarFracaoRemanescente(logFracaoEquilibrio);
    const potencialV = (equilibrio.potencialParI3IodetoV +
        equilibrio.potencialParTetrationatoTiossulfatoV) / 2;
    const molI3 = converterLogMolsParaNumero(equilibrio.logMolI3);
    const molIodeto = converterLogMolsParaNumero(equilibrio.logMolIodeto);
    const molTiossulfato = converterLogMolsParaNumero(equilibrio.logMolTiossulfato);
    const molTetrationato = converterLogMolsParaNumero(equilibrio.logMolTetrationato);
    const concentracaoI3MolL = converterLogMolsParaNumero(equilibrio.logI3);
    const concentracaoIodetoMolL = converterLogMolsParaNumero(equilibrio.logIodeto);
    const concentracaoTiossulfatoMolL = converterLogMolsParaNumero(equilibrio.logTiossulfato);
    const concentracaoTetrationatoMolL = converterLogMolsParaNumero(equilibrio.logTetrationato);
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
        throw new Error("O resolvedor de equilíbrio produziu um resultado não finito.");
    }
    return {
        potencialV,
        potencialParI3IodetoV: equilibrio.potencialParI3IodetoV,
        potencialParTetrationatoTiossulfatoV: equilibrio.potencialParTetrationatoTiossulfatoV,
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
function calcularPontoIodometria({ entrada, volumeAdicionadoMl, }) {
    validarEntrada(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) || volumeAdicionadoMl < 0) {
        throw new Error("O volume adicionado deve ser maior ou igual a zero.");
    }
    const resumo = calcularResumoEstequiometricoIodometria(entrada);
    const equilibrio = resolverEquilibrioIodometria({
        entrada,
        volumeAdicionadoMl,
        molI3Inicial: resumo.molI3Gerado,
        volumeEquivalenciaMl: resumo.volumeEquivalenciaMl,
    });
    const regiao = localizarRegiaoIodometriaPorBuscaBinaria(volumeAdicionadoMl, resumo.volumeEquivalenciaMl);
    return {
        volumeAdicionadoMl,
        potencialV: equilibrio.potencialV,
        regiao,
        molI3: equilibrio.molI3,
        molIodeto: equilibrio.molIodeto,
        molIodetoLivre: equilibrio.molIodeto,
        molTiossulfato: equilibrio.molTiossulfato,
        molTetrationato: equilibrio.molTetrationato,
        concentracaoIodetoMolL: equilibrio.concentracaoIodetoMolL,
        concentracaoI3MolL: equilibrio.concentracaoI3MolL,
        concentracaoTiossulfatoMolL: equilibrio.concentracaoTiossulfatoMolL,
        concentracaoTetrationatoMolL: equilibrio.concentracaoTetrationatoMolL,
    };
}
exports.calcularPontoIodometria = calcularPontoIodometria;
function adicionarVolumeUnico(conjunto, volume, volumeMaximoMl) {
    if (Number.isFinite(volume) &&
        volume > 0 &&
        volume <=
            volumeMaximoMl) {
        conjunto.add(Number(volume.toFixed(6)));
    }
}
function gerarCurvaIodometria({ entrada, configuracao = {}, }) {
    const resumo = calcularResumoEstequiometricoIodometria(entrada);
    const volumePE = resumo
        .volumeEquivalenciaMl;
    const volumeMaximoMl = configuracao
        .volumeMaximoMl ??
        Math.max(volumePE *
            1.6, volumePE +
            10, 10);
    const passoBaseMl = configuracao
        .passoBaseMl ??
        Math.max(volumePE /
            50, 0.02);
    const passoProximoPEMl = configuracao
        .passoProximoPEMl ??
        Math.max(volumePE /
            250, 0.002);
    const faixaDensaFracao = configuracao
        .faixaDensaFracao ??
        0.12;
    const faixaDensa = Math.max(volumePE *
        faixaDensaFracao, passoBaseMl *
        2);
    const volumes = new Set();
    for (let volume = 0; volume <=
        volumeMaximoMl +
            passoBaseMl /
                2; volume +=
        passoBaseMl) {
        adicionarVolumeUnico(volumes, volume, volumeMaximoMl);
    }
    const inicioDenso = Math.max(0, volumePE -
        faixaDensa);
    const fimDenso = Math.min(volumeMaximoMl, volumePE +
        faixaDensa);
    for (let volume = inicioDenso; volume <=
        fimDenso +
            passoProximoPEMl /
                2; volume +=
        passoProximoPEMl) {
        adicionarVolumeUnico(volumes, volume, volumeMaximoMl);
    }
    adicionarVolumeUnico(volumes, volumePE, volumeMaximoMl);
    const pontos = Array.from(volumes)
        .sort((a, b) => a -
        b)
        .map((volumeAdicionadoMl) => calcularPontoIodometria({
        entrada,
        volumeAdicionadoMl,
    }));
    const pontoPE = calcularPontoIodometria({
        entrada,
        volumeAdicionadoMl: volumePE,
    });
    return {
        entrada,
        sistema: resumo
            .sistema,
        molAnalitoInicial: resumo
            .molAnalitoInicial,
        molI3Gerado: resumo
            .molI3Gerado,
        molKIMinimo: resumo
            .molKIMinimo,
        concentracaoKIMinimaMolL: resumo
            .concentracaoKIMinimaMolL,
        molTiossulfatoEquivalencia: resumo
            .molTiossulfatoEquivalencia,
        volumeEquivalenciaMl: volumePE,
        potencialEquivalenciaV: pontoPE
            .potencialV,
        volumeMaximoMl,
        pontos,
        pontosValidos: pontos.filter((ponto) => Number.isFinite(ponto
            .potencialV)),
    };
}
exports.gerarCurvaIodometria = gerarCurvaIodometria;
/**
 * As derivadas são calculadas sobre a curva contínua de equilíbrio.
 * Como o potencial diminui durante a titulação, o ponto final pela primeira
 * derivada é localizado pelo vale (maior magnitude negativa) de dE/dV.
 * A segunda derivada é calculada independentemente e seu PF só é informado
 * quando há cruzamento real por zero.
 */
function calcularDerivadasIodometria(pontosEntrada) {
    const resultado = (0, derivadas_1.calcularDerivadasRedox)(pontosEntrada.map((ponto) => ({
        volumeAdicionadoMl: ponto.volumeAdicionadoMl,
        potencialV: ponto.potencialV,
    })), true);
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
exports.calcularDerivadasIodometria = calcularDerivadasIodometria;
function entradaPadraoIodometria(sistemaId) {
    const sistema = buscarSistemaIodometria(sistemaId);
    return {
        sistemaId,
        concentracaoAnalitoMolL: sistema
            .concentracaoAnalitoPadraoMolL,
        volumeAmostraMl: 25,
        concentracaoTiossulfatoMolL: sistema
            .concentracaoTiossulfatoPadraoMolL,
        temperaturaC: 25,
    };
}
exports.entradaPadraoIodometria = entradaPadraoIodometria;
