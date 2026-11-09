"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entradaPadraoIodometria = exports.calcularDerivadasIodometria = exports.gerarCurvaIodometria = exports.calcularPontoIodometria = exports.localizarRegiaoIodometriaPorBuscaBinaria = exports.calcularPotencialEquivalenciaIodometria = exports.calcularResumoEstequiometricoIodometria = exports.buscarSistemaIodometria = exports.sistemasIodometria = exports.TEXTO_INDICADOR_AMIDO = exports.SEMIRREACAO_TIOS = exports.SEMIRREACAO_IODO = exports.EQUILIBRIO_TRIIODeto = exports.REACAO_TIOS = exports.FATOR_NERNST_25C = exports.ELETRONS_PAR_TETRATIONATO_TIOS = exports.ELETRONS_PAR_I3_I = exports.E0_TETRATIONATO_TIOS = exports.E0_I3_I_25C = void 0;
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
/** Número de elétrons de cada par na etapa titulométrica. */
exports.ELETRONS_PAR_I3_I = 2;
exports.ELETRONS_PAR_TETRATIONATO_TIOS = 2;
/** Constante de Nernst usada nos slides a 25 °C (V por década, para n = 1). */
exports.FATOR_NERNST_25C = 0.0592;
exports.REACAO_TIOS = "I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻";
exports.EQUILIBRIO_TRIIODeto = "I₂ + I⁻ ⇌ I₃⁻";
exports.SEMIRREACAO_IODO = "I₃⁻ + 2 e⁻ ⇌ 3 I⁻";
exports.SEMIRREACAO_TIOS = "S₄O₆²⁻ + 2 e⁻ ⇌ 2 S₂O₃²⁻";
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
                potencialPadraoV: 1.35827,
            },
            {
                titulo: "Oxidação do iodeto",
                equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
                observacao: "O valor exibido é o E° de redução do par I₃⁻/I⁻; a semirreação está escrita no sentido de oxidação para compor a reação global.",
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
                titulo: "Oxidação do iodeto",
                equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
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
                titulo: "Oxidação do iodeto equivalente",
                equacao: "6 I⁻ ⇌ 2 I₃⁻ + 4 e⁻",
                eletrons: 4,
                potencialPadraoV: exports.E0_I3_I_25C,
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
                potencialPadraoV: 1.763,
            },
            {
                titulo: "Oxidação do iodeto",
                equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
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
                potencialPadraoV: 1.482,
                observacao: "O E° = 1,482 V corresponde ao par HClO/Cl⁻. Na iodometria em meio ácido, ClO⁻ é protonado a HClO antes da transferência eletrônica.",
            },
            {
                titulo: "Oxidação do iodeto",
                equacao: "3 I⁻ ⇌ I₃⁻ + 2 e⁻",
                eletrons: 2,
                potencialPadraoV: exports.E0_I3_I_25C,
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
                potencialPadraoV: 1.085,
                observacao: "O potencial é apresentado como referência para o par IO₃⁻/I⁻ em meio ácido.",
            },
            {
                titulo: "Oxidação do iodeto",
                equacao: "9 I⁻ ⇌ 3 I₃⁻ + 6 e⁻",
                eletrons: 6,
                potencialPadraoV: exports.E0_I3_I_25C,
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
        entrada.concentracaoIodetoInicialMolL,
    ];
    if (valores.some((valor) => !Number.isFinite(valor) || valor <= 0)) {
        throw new Error("Concentrações e volume da amostra devem ser positivos e finitos.");
    }
    if (!Number.isFinite(entrada.temperaturaC) || entrada.temperaturaC <= -273.15) {
        throw new Error("Informe uma temperatura fisicamente válida.");
    }
}
/**
 * Resumo estequiométrico da geração de I₃⁻.
 *
 * O KI é informado como concentração inicial. Primeiro verificamos se há
 * iodeto suficiente para a reação global que gera I₃⁻. O excedente é obtido
 * por balanço de matéria; não há resolução de equilíbrio de especiação I₂/I₃⁻ neste modelo.
 */
function calcularResumoEstequiometricoIodometria(entrada) {
    validarEntrada(entrada);
    const sistema = buscarSistemaIodometria(entrada.sistemaId);
    const volumeAmostraL = entrada.volumeAmostraMl / 1000;
    const molAnalitoInicial = entrada.concentracaoAnalitoMolL * volumeAmostraL;
    const molI3Gerado = molAnalitoInicial * sistema.molI3PorMolAnalito;
    const molIodetoInicial = entrada.concentracaoIodetoInicialMolL * volumeAmostraL;
    // Consumo global inclui o iodeto oxidado e o iodeto que complexa o iodo
    // molecular para formar I₃⁻. Ex.: Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻.
    const molIodetoConsumido = molAnalitoInicial * sistema.molIodetoConsumidoPorMolAnalito;
    const molIodetoDisponivelAposGeracao = molIodetoInicial - molIodetoConsumido;
    if (molIodetoDisponivelAposGeracao <= 0 ||
        molIodetoDisponivelAposGeracao <= molIodetoInicial * 1e-13) {
        const concentracaoMinima = sistema.molIodetoConsumidoPorMolAnalito *
            entrada.concentracaoAnalitoMolL;
        throw new RangeError(`KI insuficiente para gerar I₃⁻ quantitativamente no sistema ${sistema.nome}. ` +
            `A concentração inicial de I⁻ deve ser maior que ${concentracaoMinima.toLocaleString("pt-BR", { maximumFractionDigits: 10 })} mol/L, para que reste iodeto em excesso.`);
    }
    const molTiossulfatoEquivalencia = molAnalitoInicial * sistema.molTiossulfatoPorMolAnalito;
    const volumeEquivalenciaMl = (molTiossulfatoEquivalencia /
        entrada.concentracaoTiossulfatoMolL) *
        1000;
    return {
        sistema,
        molAnalitoInicial,
        molI3Gerado,
        molIodetoInicial,
        molIodetoConsumido,
        molIodetoDisponivelAposGeracao,
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
function calcularPotencialEquivalenciaIodometria(temperaturaC = 25) {
    if (!Number.isFinite(temperaturaC) || temperaturaC <= -273.15) {
        throw new Error("Informe uma temperatura fisicamente válida.");
    }
    const a = exports.ELETRONS_PAR_I3_I;
    const b = exports.ELETRONS_PAR_TETRATIONATO_TIOS;
    return (a * exports.E0_I3_I_25C +
        b * exports.E0_TETRATIONATO_TIOS) / (a + b);
}
exports.calcularPotencialEquivalenciaIodometria = calcularPotencialEquivalenciaIodometria;
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
/**
 * Calcula um ponto da curva pela metodologia de três regiões dos slides:
 *
 * Antes do PE: Nernst do par da amostra I₃⁻/I⁻.
 * No PE: média ponderada dos potenciais padrão.
 * Após o PE: Nernst do par do titulante S₄O₆²⁻/S₂O₃²⁻.
 *
 * Todas as concentrações são obtidas por balanços estequiométricos e
 * divididas pelo volume total. O KI inicial só fornece o balanço de I⁻
 * remanescente e verifica se existe excesso para a geração de I₃⁻.
 */
function calcularPontoIodometria({ entrada, volumeAdicionadoMl, }) {
    validarEntrada(entrada);
    if (!Number.isFinite(volumeAdicionadoMl) || volumeAdicionadoMl < 0) {
        throw new Error("O volume adicionado deve ser maior ou igual a zero.");
    }
    const resumo = calcularResumoEstequiometricoIodometria(entrada);
    const volumeTotalL = (entrada.volumeAmostraMl + volumeAdicionadoMl) / 1000;
    const molTiossulfatoAdicionado = entrada.concentracaoTiossulfatoMolL *
        (volumeAdicionadoMl / 1000);
    // I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻
    const molI3Reduzido = Math.min(resumo.molI3Gerado, molTiossulfatoAdicionado / 2);
    const molI3Remanescente = Math.max(resumo.molI3Gerado - molI3Reduzido, 0);
    // Cada mol de I₃⁻ reduzido devolve três mols de I⁻ à solução.
    const molIodeto = resumo.molIodetoDisponivelAposGeracao +
        3 * molI3Reduzido;
    const molTetrationato = molI3Reduzido;
    const regiao = localizarRegiaoIodometriaPorBuscaBinaria(volumeAdicionadoMl, resumo.volumeEquivalenciaMl);
    const molTiossulfato = regiao === "apos_pe"
        ? Math.max(molTiossulfatoAdicionado -
            resumo.molTiossulfatoEquivalencia, 0)
        : 0;
    const concentracaoI3MolL = molI3Remanescente / volumeTotalL;
    const concentracaoIodetoMolL = molIodeto / volumeTotalL;
    const concentracaoTiossulfatoMolL = molTiossulfato / volumeTotalL;
    const concentracaoTetrationatoMolL = molTetrationato / volumeTotalL;
    const fatorNernst = calcularFatorNernstDoisEletrons(entrada.temperaturaC);
    let potencialV;
    if (regiao === "pe") {
        potencialV =
            calcularPotencialEquivalenciaIodometria(entrada.temperaturaC);
    }
    else if (regiao === "antes_pe") {
        // I₃⁻ + 2e⁻ ⇌ 3I⁻
        // E = E° - (0,0592/2) log([I⁻]³ / [I₃⁻])
        if (concentracaoI3MolL <= 0 || concentracaoIodetoMolL <= 0) {
            throw new RangeError("Não há concentrações positivas de I₃⁻ e I⁻ para aplicar Nernst antes do PE.");
        }
        const log10Q = 3 * Math.log10(concentracaoIodetoMolL) -
            Math.log10(concentracaoI3MolL);
        potencialV =
            exports.E0_I3_I_25C - fatorNernst * log10Q;
    }
    else {
        // S₄O₆²⁻ + 2e⁻ ⇌ 2S₂O₃²⁻
        // E = E° - (0,0592/2) log([S₂O₃²⁻]² / [S₄O₆²⁻])
        if (concentracaoTiossulfatoMolL <= 0 ||
            concentracaoTetrationatoMolL <= 0) {
            throw new RangeError("Não há concentrações positivas de tiossulfato e tetrationato para aplicar Nernst após o PE.");
        }
        const log10Q = 2 * Math.log10(concentracaoTiossulfatoMolL) -
            Math.log10(concentracaoTetrationatoMolL);
        potencialV =
            exports.E0_TETRATIONATO_TIOS - fatorNernst * log10Q;
    }
    if (!Number.isFinite(potencialV)) {
        throw new RangeError("Não foi possível calcular um potencial finito para este ponto da titulação.");
    }
    return {
        volumeAdicionadoMl,
        potencialV,
        regiao,
        molI3: molI3Remanescente,
        molIodeto,
        molIodetoLivre: molIodeto,
        molTiossulfato,
        molTetrationato,
        concentracaoIodetoMolL,
        concentracaoI3MolL,
        concentracaoTiossulfatoMolL,
        concentracaoTetrationatoMolL,
    };
}
exports.calcularPontoIodometria = calcularPontoIodometria;
function adicionarVolumeUnico(conjunto, volume, volumeMaximoMl) {
    if (Number.isFinite(volume) &&
        volume >= 0 &&
        volume <=
            volumeMaximoMl) {
        conjunto.add(Number(volume.toFixed(9)));
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
            80, 0.1);
    const passoProximoPEMl = configuracao
        .passoProximoPEMl ??
        Math.max(volumePE /
            500, 0.01);
    const faixaDensaFracao = configuracao
        .faixaDensaFracao ??
        0.08;
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
        molIodetoDisponivelAposGeracao: resumo
            .molIodetoDisponivelAposGeracao,
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
function calcularDerivadasIodometria(pontosEntrada) {
    // O potencial cai durante a titulação iodimétrica; por isso localizamos
    // o extremo de maior magnitude de dE/dV (o vale), não o maior valor algébrico.
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
        concentracaoIodetoInicialMolL: 0.1,
        temperaturaC: 25,
    };
}
exports.entradaPadraoIodometria = entradaPadraoIodometria;
