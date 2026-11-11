const assert = require('node:assert/strict');

const {
  calcularSistemaPermanganometriaFerro,
  calcularPontoPermanganometriaFerro,
  calcularPotencialEquivalenciaPermanganometria,
} = require('../.redox-build/permanganometria.js');
const { resolverEquilibrioPermanganometriaFerro } = require('../.redox-build/equilibrioPermanganometriaFerro.js');
const {
  calcularSistemaPermanganometriaPeroxido,
  calcularPontoPermanganometriaPeroxido,
  calcularPotencialEquivalenciaPeroxido,
} = require('../.redox-build/permanganometriaPeroxido.js');
const {
  calcularSistemaPermanganometriaOxalato,
  calcularPontoPermanganometriaOxalato,
  calcularPotencialEquivalenciaOxalato,
} = require('../.redox-build/permanganometriaOxalato.js');
const {
  resolverEquilibrioPermanganometriaPeroxido,
} = require('../.redox-build/equilibrioPermanganometriaPeroxido.js');
const {
  resolverEquilibrioPermanganometriaOxalato,
} = require('../.redox-build/equilibrioPermanganometriaOxalato.js');
const { calcularDerivadasRedox } = require('../.redox-build/derivadas.js');
const {
  PAR_FERRO_III_FERRO_II,
  PAR_PERMANGANATO_MANGANES,
  PAR_OXIGENIO_PEROXIDO,
} = require('../.redox-build/dadosRedox.js');
const { calcularPotencialNernst } = require('../.redox-build/nernst.js');
const {
  gerarCurvaIodometria,
  entradaPadraoIodometria,
  calcularDerivadasIodometria,
  calcularPontoIodometria,
  buscarSistemaIodometria: buscarSistemaIodometriaCore,
  calcularResumoEstequiometricoIodometria,
  calcularPotencialEquivalenciaIodometria,
  calcularMediaFormalPotenciaisPadraoIodometria,
  localizarRegiaoIodometriaPorBuscaBinaria,
  E0_I3_I_25C,
  E0_TETRATIONATO_TIOS,
} = require('../.redox-build/iodometria.js');
const { buscarSistemaIodometria } = require('../.redox-build/sistemasIodometria.js');

let aprovados = 0;
function teste(nome, fn) {
  try {
    fn();
    aprovados += 1;
    process.stdout.write(`✓ ${nome}\n`);
  } catch (erro) {
    process.stderr.write(`✗ ${nome}\n  ${erro.stack || erro}\n`);
    process.exitCode = 1;
  }
}
function proximoDe(valor, esperado, tolerancia, nome) {
  assert.ok(
    Number.isFinite(valor) && Math.abs(valor - esperado) <= tolerancia,
    `${nome}: esperado ${esperado}, obtido ${valor}, tolerância ${tolerancia}`
  );
}

const condicoes = {
  concentracaoAnalitoMolL: 0.1,
  volumeAnalitoMl: 50,
  concentracaoTitulanteMolL: 0.02,
  concentracaoHPlusMolL: 1,
  temperaturaC: 25,
};
const entradaPeroxido = { ...condicoes };
const entradaOxalato = { ...condicoes, atividadeCO2: 1 };
const sistemaPeroxido = calcularSistemaPermanganometriaPeroxido(entradaPeroxido);
const sistemaOxalato = calcularSistemaPermanganometriaOxalato(entradaOxalato);
const sistemaFerro = calcularSistemaPermanganometriaFerro(condicoes);

teste('Semirreações e potenciais padrão dos sistemas de permanganometria', () => {
  assert.equal(
    PAR_PERMANGANATO_MANGANES.semirreacaoReducao,
    'MnO₄⁻ + 8 H⁺ + 5 e⁻ ⇌ Mn²⁺ + 4 H₂O'
  );
  assert.equal(
    PAR_FERRO_III_FERRO_II.semirreacaoReducao,
    'Fe³⁺ + e⁻ ⇌ Fe²⁺'
  );
  assert.equal(
    PAR_OXIGENIO_PEROXIDO.semirreacaoReducao,
    'O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂'
  );
  proximoDe(PAR_PERMANGANATO_MANGANES.potencialPadraoReducao, 1.510, 1e-15, 'E° MnO₄⁻/Mn²⁺');
  proximoDe(PAR_FERRO_III_FERRO_II.potencialPadraoReducao, 0.771, 1e-15, 'E° Fe³⁺/Fe²⁺');
  proximoDe(PAR_OXIGENIO_PEROXIDO.potencialPadraoReducao, 0.682, 1e-15, 'E° O₂/H₂O₂');
});

// 1 — Balanços estequiométricos de referência.
teste('Volume de equivalência Fe²⁺/MnO₄⁻ = 50,00 mL', () => {
  proximoDe(sistemaFerro.volumeEquivalenciaMl, 50, 1e-9, 'Veq Fe²⁺');
});
teste('PE de Fe²⁺ usa a média ponderada dos potenciais (1 e 5 elétrons)', () => {
  const potencialEsperado = calcularPotencialEquivalenciaPermanganometria({
    concentracaoHPlusMolL: 1,
    temperaturaC: 25,
  });
  proximoDe(potencialEsperado, 1.3868333333333334, 1e-12, 'fórmula do PE Fe²⁺');
  proximoDe(sistemaFerro.potencialEquivalenciaV, potencialEsperado, 1e-12, 'EPE Fe²⁺');
});
teste('Consulta da curva retorna o potencial no PE de Fe²⁺', () => {
  const ponto = calcularPontoPermanganometriaFerro({
    entrada: condicoes,
    volumeAdicionadoMl: sistemaFerro.volumeEquivalenciaMl,
  });
  proximoDe(ponto.potencialV, 1.3868333333333334, 1e-12, 'ponto consultado Fe²⁺');
});
teste('Resolvedor de especiação de Fe²⁺ mantém o balanço eletrônico', () => {
  const equilibrio = resolverEquilibrioPermanganometriaFerro({
    molFeTotal: sistemaFerro.molFe2Inicial,
    molMnTotal: sistemaFerro.molMnO4Equivalencia,
    volumeTotalMl: 50 + sistemaFerro.volumeEquivalenciaMl,
    concentracaoHPlusMolL: 1,
    temperaturaC: 25,
  });
  proximoDe(sistemaFerro.potencialEquivalenciaV, equilibrio.potencialV, 1e-12, 'EPE Fe²⁺');
  assert.ok(Math.abs(equilibrio.erroBalancoEletronicoMol) <= 1e-14);
});
teste('Volume de equivalência H₂O₂/MnO₄⁻ = 100,00 mL', () => {
  proximoDe(sistemaPeroxido.volumeEquivalenciaMl, 100, 1e-9, 'Veq H₂O₂');
});
teste('Volume de equivalência oxalato/MnO₄⁻ = 100,00 mL', () => {
  proximoDe(sistemaOxalato.volumeEquivalenciaMl, 100, 1e-9, 'Veq oxalato');
});

// 2 — Potenciais no PE pela média ponderada dos potenciais condicionais.
const volumeTotalPE = 150;
const equilibrioPeroxidoPE = resolverEquilibrioPermanganometriaPeroxido({
  molH2O2Total: 0.005,
  molMnTotal: 0.002,
  volumeTotalMl: volumeTotalPE,
  concentracaoHPlusMolL: 1,
  atividadeOxigenio: 1,
  temperaturaC: 25,
});
const equilibrioOxalatoPE = resolverEquilibrioPermanganometriaOxalato({
  molOxalatoTotalInicial: 0.005,
  molMnTotal: 0.002,
  volumeTotalMl: volumeTotalPE,
  concentracaoHPlusMolL: 1,
  atividadeCO2: 1,
  temperaturaC: 25,
});

teste('PE do H₂O₂ usa a média ponderada (2 e 5 elétrons), sem correção de concentração', () => {
  proximoDe(sistemaPeroxido.potencialEquivalenciaV, 1.2734285714285714, 1e-12, 'EPE H₂O₂');
});
teste('Consulta da curva retorna o potencial no PE do H₂O₂', () => {
  const ponto = calcularPontoPermanganometriaPeroxido({
    entrada: entradaPeroxido,
    volumeAdicionadoMl: sistemaPeroxido.volumeEquivalenciaMl,
  });
  proximoDe(ponto.potencialV, 1.2734285714285714, 1e-12, 'ponto consultado H₂O₂');
});
const entradaValidacaoPeroxido = {
  concentracaoAnalitoMolL: 0.1,
  volumeAnalitoMl: 10,
  concentracaoTitulanteMolL: 0.02,
  concentracaoHPlusMolL: 1,
  temperaturaC: 25,
};
const sistemaValidacaoPeroxido = calcularSistemaPermanganometriaPeroxido(entradaValidacaoPeroxido);

teste('Exemplo de H₂O₂: PE em 20,00 mL e potencial de 1,2734 V', () => {
  proximoDe(sistemaValidacaoPeroxido.volumeEquivalenciaMl, 20, 1e-12, 'VPE H₂O₂');
  proximoDe(sistemaValidacaoPeroxido.potencialEquivalenciaV, 1.2734285714285714, 1e-12, 'EPE H₂O₂');
});

teste('H₂O₂ antes do PE: 10 mL retorna 0,6820 V e [H₂O₂] = [O₂] = 0,025 M', () => {
  const ponto = calcularPontoPermanganometriaPeroxido({
    entrada: entradaValidacaoPeroxido,
    volumeAdicionadoMl: 10,
  });
  proximoDe(ponto.potencialV, 0.682, 1e-12, 'E antes do PE H₂O₂');
  proximoDe(ponto.concentracaoH2O2MolL, 0.025, 1e-12, '[H₂O₂] exemplo');
  proximoDe(ponto.concentracaoO2MolL, 0.025, 1e-12, '[O₂] exemplo');
});

teste('H₂O₂ após o PE: 30 mL retorna 1,5064 V', () => {
  const ponto = calcularPontoPermanganometriaPeroxido({
    entrada: entradaValidacaoPeroxido,
    volumeAdicionadoMl: 30,
  });
  proximoDe(ponto.potencialV, 1.506438252244216, 1e-10, 'E após o PE H₂O₂');
  proximoDe(ponto.concentracaoMnO4MolL, 0.005, 1e-12, '[MnO₄⁻] exemplo');
  proximoDe(ponto.concentracaoMn2MolL, 0.01, 1e-12, '[Mn²⁺] exemplo');
});
const entradaExemploFerro = {
  concentracaoAnalitoMolL: 0.1,
  volumeAnalitoMl: 25,
  concentracaoTitulanteMolL: 0.02,
  concentracaoHPlusMolL: 1,
  temperaturaC: 25,
};

teste('Fe²⁺: PE em 25,00 mL e potencial de 1,3868 V', () => {
  const sistema = calcularSistemaPermanganometriaFerro(entradaExemploFerro);
  proximoDe(sistema.volumeEquivalenciaMl, 25, 1e-12, 'VPE Fe²⁺');
  proximoDe(sistema.potencialEquivalenciaV, 1.3868333333333334, 1e-12, 'EPE Fe²⁺');
});

teste('Fe²⁺ antes do PE: 10 mL retorna 0,7606 V e as concentrações de Fe²⁺/Fe³⁺ esperadas', () => {
  const ponto = calcularPontoPermanganometriaFerro({ entrada: entradaExemploFerro, volumeAdicionadoMl: 10 });
  proximoDe(ponto.potencialV, 0.7605825556291412, 1e-10, 'E antes do PE Fe²⁺');
  proximoDe(ponto.concentracaoFe2MolL, 0.04285714285714286, 1e-12, '[Fe²⁺]');
  proximoDe(ponto.concentracaoFe3MolL, 0.02857142857142857, 1e-12, '[Fe³⁺]');
});

teste('Fe²⁺ após o PE: 30 mL retorna 1,5017 V e as concentrações de MnO₄⁻/Mn²⁺ esperadas', () => {
  const ponto = calcularPontoPermanganometriaFerro({ entrada: entradaExemploFerro, volumeAdicionadoMl: 30 });
  proximoDe(ponto.potencialV, 1.5017298778186188, 1e-10, 'E após o PE Fe²⁺');
  proximoDe(ponto.concentracaoMnO4MolL, 0.0018181818181818182, 1e-12, '[MnO₄⁻] após Fe²⁺');
  proximoDe(ponto.concentracaoMn2MolL, 0.00909090909090909, 1e-12, '[Mn²⁺] após Fe²⁺');
});

const entradaExemploOxalato = {
  concentracaoAnalitoMolL: 0.1,
  volumeAnalitoMl: 10,
  concentracaoTitulanteMolL: 0.02,
  concentracaoHPlusMolL: 1,
  atividadeCO2: 1,
  temperaturaC: 25,
};

teste('H₂C₂O₄: PE em 20,00 mL e potencial de 0,9386 V', () => {
  const sistema = calcularSistemaPermanganometriaOxalato(entradaExemploOxalato);
  proximoDe(sistema.volumeEquivalenciaMl, 20, 1e-12, 'VPE H₂C₂O₄');
  proximoDe(sistema.potencialEquivalenciaV, 0.9385714285714286, 1e-12, 'EPE H₂C₂O₄');
});

teste('H₂C₂O₄ antes do PE: 10 mL retorna aproximadamente −0,443 V', () => {
  const ponto = calcularPontoPermanganometriaOxalato({ entrada: entradaExemploOxalato, volumeAdicionadoMl: 10 });
  proximoDe(ponto.potencialV, -0.44261158637776254, 1e-10, 'E antes do PE H₂C₂O₄');
  proximoDe(ponto.concentracaoH2C2O4MolL, 0.025, 1e-12, '[H₂C₂O₄]');
  proximoDe(ponto.molCO2, 0.001, 1e-12, 'n(CO₂)');
});

teste('H₂C₂O₄ após o PE: 30 mL retorna 1,5064 V', () => {
  const ponto = calcularPontoPermanganometriaOxalato({ entrada: entradaExemploOxalato, volumeAdicionadoMl: 30 });
  proximoDe(ponto.potencialV, 1.506438252244216, 1e-10, 'E após o PE H₂C₂O₄');
  proximoDe(ponto.concentracaoMnO4MolL, 0.005, 1e-12, '[MnO₄⁻] após H₂C₂O₄');
  proximoDe(ponto.concentracaoMn2MolL, 0.01, 1e-12, '[Mn²⁺] após H₂C₂O₄');
});

teste('PE do oxalato usa a média ponderada (2 e 5 elétrons), sem correção de concentração', () => {
  proximoDe(sistemaOxalato.potencialEquivalenciaV, 0.9385714285714286, 1e-7, 'EPE ácido oxálico');
});
teste('Consulta da curva retorna o potencial no PE do ácido oxálico', () => {
  const ponto = calcularPontoPermanganometriaOxalato({
    entrada: entradaOxalato,
    volumeAdicionadoMl: sistemaOxalato.volumeEquivalenciaMl,
  });
  proximoDe(ponto.potencialV, 0.9385714285714286, 1e-7, 'ponto consultado ácido oxálico');
});
teste('A função de PE do H₂O₂ usa a média ponderada dos potenciais', () => {
  const aproximado = calcularPotencialEquivalenciaPeroxido({
    concentracaoHPlusMolL: 1,
    temperaturaC: 25,
  });
  proximoDe(aproximado, 1.2734285714285714, 1e-12, 'fórmula do PE H₂O₂');
});
teste('A função de PE do ácido oxálico usa a média ponderada dos potenciais', () => {
  const aproximado = calcularPotencialEquivalenciaOxalato({
    concentracaoHPlusMolL: 1,
    atividadeCO2: 1,
    temperaturaC: 25,
  });
  proximoDe(aproximado, 0.9385714285714286, 1e-7, 'fórmula do PE ácido oxálico');
});
teste('PE de H₂O₂ não recebe correção dependente da concentração analítica', () => {
  const outroCenario = calcularSistemaPermanganometriaPeroxido({
    ...entradaPeroxido,
    concentracaoAnalitoMolL: 0.2,
    volumeAnalitoMl: 25,
  });
  proximoDe(outroCenario.potencialEquivalenciaV, sistemaPeroxido.potencialEquivalenciaV, 1e-12, 'independência do PE H₂O₂');
});
teste('PE do oxalato não recebe correção dependente da concentração analítica', () => {
  const outroCenario = calcularSistemaPermanganometriaOxalato({
    ...entradaOxalato,
    concentracaoAnalitoMolL: 0.2,
    volumeAnalitoMl: 25,
  });
  proximoDe(outroCenario.potencialEquivalenciaV, sistemaOxalato.potencialEquivalenciaV, 1e-12, 'independência do PE oxalato');
});
teste('Regiões antes e após o PE mantêm os potenciais de Nernst dos pares predominantes', () => {
  const entradaVisual = { ...condicoes, volumeAnalitoMl: 25 };
  const ferroAntes = calcularPontoPermanganometriaFerro({ entrada: entradaVisual, volumeAdicionadoMl: 10 });
  const ferroDepois = calcularPontoPermanganometriaFerro({ entrada: entradaVisual, volumeAdicionadoMl: 30 });
  const peroxidoAntes = calcularPontoPermanganometriaPeroxido({ entrada: entradaVisual, volumeAdicionadoMl: 25 });
  const peroxidoDepois = calcularPontoPermanganometriaPeroxido({ entrada: entradaVisual, volumeAdicionadoMl: 75 });
  const oxalatoAntes = calcularPontoPermanganometriaOxalato({ entrada: { ...entradaVisual, atividadeCO2: 1 }, volumeAdicionadoMl: 25 });
  const oxalatoDepois = calcularPontoPermanganometriaOxalato({ entrada: { ...entradaVisual, atividadeCO2: 1 }, volumeAdicionadoMl: 75 });

  proximoDe(ferroAntes.potencialV, 0.7605825556291412, 1e-10, 'Fe²⁺ antes do PE');
  proximoDe(ferroDepois.potencialV, 1.5017298778186188, 1e-10, 'Fe²⁺ após o PE');
  proximoDe(peroxidoAntes.potencialV, 0.682, 1e-12, 'H₂O₂ antes do PE pela concentração estequiométrica de O₂');
  proximoDe(peroxidoAntes.concentracaoO2MolL, 0.025, 1e-12, '[O₂] antes do PE');
  proximoDe(peroxidoDepois.potencialV, 1.506438252244216, 1e-10, 'H₂O₂ após o PE');
  proximoDe(oxalatoAntes.potencialV, -0.44261158637776254, 1e-10, 'ácido oxálico antes do PE');
  proximoDe(oxalatoDepois.potencialV, 1.5064382522440471, 1e-10, 'ácido oxálico após o PE');
});
teste('Balanço de massa do H₂O₂ no PE fecha dentro da tolerância', () => {
  assert.ok(Math.abs(equilibrioPeroxidoPE.erroBalancoEstequiometricoMol) <= 1e-14);
});
teste('Balanço de massa do oxalato no PE fecha dentro da tolerância', () => {
  assert.ok(Math.abs(equilibrioOxalatoPE.erroBalancoEstequiometricoMol) <= 1e-14);
});

// 3 — Segunda derivada independente.
const quadratica = Array.from({ length: 11 }, (_, indice) => {
  const volume = indice - 5;
  return { volumeAdicionadoMl: volume, potencialV: volume ** 2 };
});
const cubica = Array.from({ length: 11 }, (_, indice) => {
  const volume = indice - 5;
  return { volumeAdicionadoMl: volume, potencialV: volume ** 3 };
});

teste('Curva E = V² não recebe ponto final artificial pela segunda derivada', () => {
  const resultado = calcularDerivadasRedox(quadratica);
  assert.equal(resultado.volumePFSegundaDerivadaMl, null);
  assert.ok(resultado.segundaDerivada.every((ponto) => ponto.segundaDerivada > 0));
});
teste('Máximo algébrico da primeira derivada também funciona quando a curva é descendente', () => {
  const pontos = [-3, -2, -1, 0.5, 2, 3].map((volume) => ({
    volumeAdicionadoMl: volume,
    potencialV: -(volume ** 3),
  }));
  const resultado = calcularDerivadasRedox(pontos);
  assert.ok(Math.abs(resultado.volumePFPrimeiraDerivadaMl) < 0.6);
});
teste('Curva E = V³ localiza o cruzamento real de E″ em V = 0', () => {
  const resultado = calcularDerivadasRedox(cubica);
  proximoDe(resultado.volumePFSegundaDerivadaMl, 0, 1e-12, 'cruzamento E″');
});
teste('Nernst mantém resultado convencional para atividades ordinárias', () => {
  const resultado = calcularPotencialNernst({
    par: PAR_FERRO_III_FERRO_II,
    atividades: { 'Fe3+': 0.01, 'Fe2+': 0.09 },
    temperaturaC: 25,
  });
  assert.equal(resultado.status, 'ok');
  proximoDe(resultado.potencial, 0.7145476336990986, 1e-12, 'potencial Nernst');
});
teste('Nernst não falha por overflow/underflow intermediário de Q', () => {
  const resultado = calcularPotencialNernst({
    par: PAR_FERRO_III_FERRO_II,
    atividades: { 'Fe3+': 1e200, 'Fe2+': 1e-200 },
    temperaturaC: 25,
  });
  assert.equal(resultado.status, 'ok');
  assert.ok(Number.isFinite(resultado.potencial));
  proximoDe(resultado.log10QuocienteReacao, -400, 1e-12, 'log10 Q');
});


// 4 — Iodometria: equilíbrio redox acoplado e curva contínua.
const entradaIodo = entradaPadraoIodometria('cloro-ativo');
const resumoIodo = calcularResumoEstequiometricoIodometria(entradaIodo);

teste('I₃⁻/I⁻ usa E° = +0,536 V, sem recorrer a 0,621 V', () => {
  proximoDe(E0_I3_I_25C, 0.536, 1e-15, 'E° I₃⁻/I⁻');
});

teste('A média formal dos E° é identificada separadamente do potencial real no PE', () => {
  proximoDe(
    calcularMediaFormalPotenciaisPadraoIodometria(),
    0.308,
    1e-15,
    'média formal dos potenciais padrão'
  );
  proximoDe(
    calcularPotencialEquivalenciaIodometria(entradaIodo),
    0.4633316269829023,
    1e-10,
    'potencial de equilíbrio no PE'
  );
});

teste('Busca binária identifica antes, PE e após o PE', () => {
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(10, 25), 'antes_pe');
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(25, 25), 'pe');
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(30, 25), 'apos_pe');
});

teste('Estequiometria do cloro calcula automaticamente o KI mínimo: 3 I⁻ por Cl₂', () => {
  proximoDe(resumoIodo.molAnalitoInicial, 0.00025, 1e-15, 'mol Cl₂');
  proximoDe(resumoIodo.molI3Gerado, 0.00025, 1e-15, 'mol I₃⁻ gerado');
  proximoDe(resumoIodo.molKIMinimo, 0.00075, 1e-15, 'mol KI mínimo');
  proximoDe(resumoIodo.concentracaoKIMinimaMolL, 0.03, 1e-15, '[KI] mínima');
});

teste('Antes do PE reproduz a validação em 10 mL e fecha o equilíbrio dos dois pares', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 10,
  });
  proximoDe(ponto.concentracaoI3MolL, 0.004285714285714286, 1e-9, '[I₃⁻] em 10 mL');
  proximoDe(ponto.concentracaoIodetoMolL, 0.008571428571428572, 1e-9, '[I⁻] em 10 mL');
  proximoDe(ponto.potencialV, 0.6494527620744784, 1e-9, 'E em 10 mL');
  assert.equal(ponto.regiao, 'antes_pe');
  assert.ok(ponto.concentracaoTiossulfatoMolL > 0);
  assert.ok(ponto.concentracaoTetrationatoMolL > 0);
});

teste('No PE os dois pares redox permanecem em equilíbrio com concentrações residuais finitas', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 25,
  });
  assert.equal(ponto.regiao, 'pe');
  proximoDe(ponto.potencialV, 0.4633316269829023, 1e-10, 'EPE');
  assert.ok(ponto.concentracaoI3MolL > 0);
  assert.ok(ponto.concentracaoIodetoMolL > 0);
  assert.ok(ponto.concentracaoTiossulfatoMolL > 0);
  assert.ok(ponto.concentracaoTetrationatoMolL > 0);
});

teste('Após o PE reproduz a validação em 30 mL', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 30,
  });
  assert.equal(ponto.regiao, 'apos_pe');
  proximoDe(ponto.concentracaoIodetoMolL, 0.013636363636363637, 1e-10, '[I⁻] formado em 30 mL');
  proximoDe(ponto.concentracaoTiossulfatoMolL, 0.0018181818181818182, 1e-10, '[S₂O₃²⁻] em 30 mL');
  proximoDe(ponto.concentracaoTetrationatoMolL, 0.004545454545454545, 1e-10, '[S₄O₆²⁻] em 30 mL');
  proximoDe(ponto.potencialV, 0.17289375986572197, 1e-10, 'E em 30 mL');
  assert.ok(ponto.concentracaoI3MolL > 0);
});

teste('Balanços de I₃⁻, I⁻, tiossulfato e tetrationato fecham antes, no e após o PE', () => {
  for (const volume of [10, 25, 30]) {
    const ponto = calcularPontoIodometria({
      entrada: entradaIodo,
      volumeAdicionadoMl: volume,
    });
    const molTiossulfatoAdicionado =
      entradaIodo.concentracaoTiossulfatoMolL * volume / 1000;
    const molI3Reduzido = resumoIodo.molI3Gerado - ponto.molI3;

    proximoDe(
      ponto.molI3 + molI3Reduzido,
      resumoIodo.molI3Gerado,
      1e-12,
      `balanço I₃⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molIodeto,
      3 * molI3Reduzido,
      1e-12,
      `balanço I⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molTetrationato,
      molI3Reduzido,
      1e-12,
      `balanço S₄O₆²⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molTiossulfato + 2 * ponto.molTetrationato,
      molTiossulfatoAdicionado,
      1e-12,
      `balanço S₂O₃²⁻ em ${volume} mL`
    );
  }
});

teste('A quantidade e a concentração mínima de KI são calculadas sem campo de entrada', () => {
  const entrada = entradaPadraoIodometria('cloro-ativo');
  const resumo = calcularResumoEstequiometricoIodometria(entrada);

  assert.equal(Object.hasOwn(entrada, 'concentracaoIodetoInicialMolL'), false);
  proximoDe(resumo.molKIMinimo, 0.00075, 1e-15, 'quantidade mínima de KI');
  proximoDe(resumo.concentracaoKIMinimaMolL, 0.03, 1e-15, 'concentração mínima de KI');
});

teste('Em 0 mL o potencial não é inventado; a curva começa no primeiro volume positivo', () => {
  const entrada = entradaPadraoIodometria('cloro-ativo');
  assert.throws(
    () => calcularPontoIodometria({ entrada, volumeAdicionadoMl: 0 }),
    /0,00 mL/
  );

  const curva = gerarCurvaIodometria({ entrada });
  assert.ok(curva.pontos[0].volumeAdicionadoMl > 0);
  assert.ok(curva.pontosValidos.every((ponto) => Number.isFinite(ponto.potencialV)));
});

teste('Consumo de iodeto inclui a formação de I₃⁻ nos seis sistemas', () => {
  const casos = [
    ['cloro-ativo', 3],
    ['cobre-ii', 2.5],
    ['oxigenio-dissolvido', 6],
    ['peroxido-hidrogenio', 3],
    ['hipoclorito', 3],
    ['iodato', 8],
  ];
  for (const [sistemaId, fator] of casos) {
    const entrada = entradaPadraoIodometria(sistemaId);
    const resumo = calcularResumoEstequiometricoIodometria(entrada);
    proximoDe(
      resumo.molKIMinimo,
      fator * resumo.molAnalitoInicial,
      1e-14,
      `consumo de I⁻ em ${sistemaId}`
    );
  }
});

teste('Os seis sistemas iodimétricos geram curvas contínuas e potenciais finitos', () => {
  const sistemas = [
    'cloro-ativo',
    'cobre-ii',
    'oxigenio-dissolvido',
    'peroxido-hidrogenio',
    'hipoclorito',
    'iodato',
  ];
  for (const sistemaId of sistemas) {
    const entrada = entradaPadraoIodometria(sistemaId);
    const curva = gerarCurvaIodometria({ entrada });
    for (const fracao of [0.1, 0.5, 1, 1.5, 2]) {
      const ponto = calcularPontoIodometria({
        entrada,
        volumeAdicionadoMl: curva.volumeEquivalenciaMl * fracao,
      });
      assert.ok(
        Number.isFinite(ponto.potencialV),
        `${sistemaId}: potencial inválido em ${fracao} × PE`
      );
    }
    proximoDe(
      curva.potencialEquivalenciaV,
      calcularPotencialEquivalenciaIodometria(entrada),
      1e-10,
      `EPE ${sistemaId}`
    );
  }
});

teste('A curva permanece contínua e monotônica na vizinhança do PE', () => {
  const antes = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 24.99,
  });
  const pe = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 25,
  });
  const depois = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 25.01,
  });
  assert.ok(antes.potencialV > pe.potencialV);
  assert.ok(pe.potencialV > depois.potencialV);
  assert.ok(antes.potencialV - pe.potencialV < 0.1);
  assert.ok(pe.potencialV - depois.potencialV < 0.2);
});

teste('As derivadas da curva iodimétrica são finitas e localizam o PF próximo ao PE', () => {
  const curva = gerarCurvaIodometria({ entrada: entradaIodo });
  const derivadas = calcularDerivadasIodometria(curva.pontosValidos);
  assert.ok(Number.isFinite(derivadas.volumePFPrimeiraDerivadaMl));
  assert.ok(Number.isFinite(derivadas.volumePFSegundaDerivadaMl));
  assert.ok(Math.abs(derivadas.volumePFPrimeiraDerivadaMl - curva.volumeEquivalenciaMl) < 0.1);
  assert.ok(Math.abs(derivadas.volumePFSegundaDerivadaMl - curva.volumeEquivalenciaMl) < 0.1);
  assert.ok(derivadas.primeiraDerivada.every((ponto) => Number.isFinite(ponto.primeiraDerivada)));
  assert.ok(derivadas.segundaDerivada.every((ponto) => Number.isFinite(ponto.segundaDerivada)));
  assert.ok(Math.max(...derivadas.primeiraDerivada.map((ponto) => Math.abs(ponto.primeiraDerivada))) < 3);
  assert.ok(Math.max(...derivadas.segundaDerivada.map((ponto) => Math.abs(ponto.segundaDerivada))) < 20);
});

teste('A curva iodimétrica deduplica o volume do PE quando coincide numericamente com um ponto da malha', () => {
  const entrada = entradaPadraoIodometria('iodato');
  const curva = gerarCurvaIodometria({ entrada });
  const volumes = curva.pontos.map((ponto) => ponto.volumeAdicionadoMl);
  const diferencas = volumes.slice(1).map((volume, indice) => volume - volumes[indice]);
  assert.ok(diferencas.every((delta) => delta > 1e-6));
});

teste('A busca do motor iodimétrico rejeita identificador desconhecido', () => {
  assert.throws(
    () => buscarSistemaIodometriaCore('sistema-inexistente'),
    /desconhecido/
  );
});

// 5 — Não mascarar sistema iodimétrico inválido.
teste('Identificador iodimétrico desconhecido gera erro explícito', () => {
  assert.throws(
    () => buscarSistemaIodometria('sistema-inexistente'),
    /desconhecido/
  );
});

// 6 — Formatação científica da interface.
teste('Notação científica apresentada sem e de programação', () => {
  const {formatarCientificoPtBr} = require('../.redox-build/formatacao.js');
  assert.equal(formatarCientificoPtBr(1.234e-8, 3), '1,234 × 10⁻⁸');
  assert.equal(formatarCientificoPtBr(1.2e6, 2), '1,20 × 10⁶');
});

process.stdout.write(`\n${aprovados} testes aprovados.\n`);
if (process.exitCode) process.stderr.write('Há falhas nos testes de regressão.\n');
