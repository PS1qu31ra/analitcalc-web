const assert = require('node:assert/strict');

const { calcularSistemaPermanganometriaFerro } = require('../.redox-build/permanganometria.js');
const { resolverEquilibrioPermanganometriaFerro } = require('../.redox-build/equilibrioPermanganometriaFerro.js');
const {
  calcularSistemaPermanganometriaPeroxido,
  calcularPotencialEquivalenciaPeroxido,
} = require('../.redox-build/permanganometriaPeroxido.js');
const {
  calcularSistemaPermanganometriaOxalato,
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
const entradaPeroxido = { ...condicoes, atividadeOxigenio: 1 };
const entradaOxalato = { ...condicoes, atividadeCO2: 1 };
const sistemaPeroxido = calcularSistemaPermanganometriaPeroxido(entradaPeroxido);
const sistemaOxalato = calcularSistemaPermanganometriaOxalato(entradaOxalato);
const sistemaFerro = calcularSistemaPermanganometriaFerro(condicoes);

// 1 — Balanços estequiométricos de referência.
teste('Volume de equivalência Fe²⁺/MnO₄⁻ = 50,00 mL', () => {
  proximoDe(sistemaFerro.volumeEquivalenciaMl, 50, 1e-9, 'Veq Fe²⁺');
});
teste('Potencial de equivalência Fe²⁺ usa o equilíbrio acoplado e fecha o balanço', () => {
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

// 2 — Potenciais no PE calculados pelo equilíbrio acoplado.
const volumeTotalPE = 150;
const concentracaoMnTotal = 0.002 / 0.15;
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

teste('PE do H₂O₂ usa a solução do equilíbrio, não a média simples', () => {
  proximoDe(sistemaPeroxido.potencialEquivalenciaV, equilibrioPeroxidoPE.potencialV, 1e-12, 'EPE H₂O₂');
  assert.ok(Math.abs(sistemaPeroxido.potencialEquivalenciaV - 1.2771428571428571) > 0.01);
});
teste('PE do oxalato usa a solução do equilíbrio, não a média simples', () => {
  proximoDe(sistemaOxalato.potencialEquivalenciaV, equilibrioOxalatoPE.potencialV, 1e-12, 'EPE oxalato');
  assert.ok(Math.abs(sistemaOxalato.potencialEquivalenciaV - 0.9387713826040816) > 0.01);
});
teste('A aproximação analítica corrigida converge ao PE do H₂O₂ neste cenário', () => {
  const aproximado = calcularPotencialEquivalenciaPeroxido({
    concentracaoHPlusMolL: 1,
    concentracaoMnTotalMolL: concentracaoMnTotal,
    atividadeOxigenio: 1,
    temperaturaC: 25,
  });
  proximoDe(aproximado, sistemaPeroxido.potencialEquivalenciaV, 1e-9, 'aproximação H₂O₂');
});
teste('A aproximação analítica corrigida converge ao PE do oxalato neste cenário', () => {
  const aproximado = calcularPotencialEquivalenciaOxalato({
    concentracaoHPlusMolL: 1,
    concentracaoMnTotalMolL: concentracaoMnTotal,
    atividadeCO2: 1,
    temperaturaC: 25,
  });
  proximoDe(aproximado, sistemaOxalato.potencialEquivalenciaV, 1e-9, 'aproximação oxalato');
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
teste('Curva iodimétrica padrão mantém derivada independente e ponto de cruzamento', () => {
  const curva = gerarCurvaIodometria({ entrada: entradaPadraoIodometria('cloro-ativo') });
  const derivadas = calcularDerivadasIodometria(curva.pontosValidos);
  assert.ok(Number.isFinite(derivadas.volumePFPrimeiraDerivadaMl));
  assert.ok(Number.isFinite(derivadas.volumePFSegundaDerivadaMl));
  assert.ok(Math.abs(derivadas.volumePFPrimeiraDerivadaMl - derivadas.volumePFSegundaDerivadaMl) < 0.1);
});

// 4 — Nernst em espaço logarítmico.
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


// 4 — Iodometria: metodologia em três regiões conforme os slides 39–42.
const entradaIodo = entradaPadraoIodometria('cloro-ativo');
const resumoIodo = calcularResumoEstequiometricoIodometria(entradaIodo);

teste('I₃⁻/I⁻ usa E° = +0,536 V, sem recorrer a 0,621 V', () => {
  proximoDe(E0_I3_I_25C, 0.536, 1e-15, 'E° I₃⁻/I⁻');
});

teste('PE iodimétrico usa a média ponderada dos dois pares de 2 elétrons', () => {
  const esperado = (2 * 0.536 + 2 * 0.080) / 4;
  proximoDe(calcularPotencialEquivalenciaIodometria(25), esperado, 1e-15, 'EPE iodometria');
  proximoDe(calcularPotencialEquivalenciaIodometria(25), 0.308, 1e-15, 'EPE = 0,308 V');
});

teste('Busca binária identifica antes, faixa do PE e após o PE', () => {
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(10, 25), 'antes_pe');
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(25, 25), 'pe');
  assert.equal(localizarRegiaoIodometriaPorBuscaBinaria(30, 25), 'apos_pe');
});

teste('Estequiometria do cloro consome 3 I⁻ por Cl₂ para formar I₃⁻', () => {
  proximoDe(resumoIodo.molAnalitoInicial, 0.00025, 1e-15, 'mol Cl₂');
  proximoDe(resumoIodo.molI3Gerado, 0.00025, 1e-15, 'mol I₃⁻ gerado');
  proximoDe(resumoIodo.molIodetoInicial, 0.0025, 1e-15, 'mol I⁻ inicial');
  proximoDe(resumoIodo.molIodetoConsumido, 0.00075, 1e-15, 'mol I⁻ consumido');
  proximoDe(resumoIodo.molIodetoDisponivelAposGeracao, 0.00175, 1e-15, 'mol I⁻ remanescente');
});

teste('Antes do PE aplica Nernst ao par da amostra I₃⁻/I⁻ com concentrações estequiométricas', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 10,
  });
  proximoDe(ponto.concentracaoI3MolL, 0.004285714285714286, 1e-15, '[I₃⁻] em 10 mL');
  proximoDe(ponto.concentracaoIodetoMolL, 0.05857142857142857, 1e-15, '[I⁻] em 10 mL');
  proximoDe(ponto.potencialV, 0.5753373866318335, 1e-12, 'E em 10 mL');
  assert.equal(ponto.regiao, 'antes_pe');
});

teste('No PE o motor usa diretamente a média ponderada, sem resolver equilíbrio acoplado', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 25,
  });
  assert.equal(ponto.regiao, 'pe');
  proximoDe(ponto.potencialV, 0.308, 1e-15, 'EPE');
  proximoDe(ponto.concentracaoI3MolL, 0, 1e-15, '[I₃⁻] no PE');
  proximoDe(ponto.concentracaoTiossulfatoMolL, 0, 1e-15, '[S₂O₃²⁻] no PE');
});

teste('Após o PE aplica Nernst ao par do titulante S₄O₆²⁻/S₂O₃²⁻', () => {
  const ponto = calcularPontoIodometria({
    entrada: entradaIodo,
    volumeAdicionadoMl: 30,
  });
  assert.equal(ponto.regiao, 'apos_pe');
  proximoDe(ponto.concentracaoIodetoMolL, 0.045454545454545456, 1e-15, '[I⁻] em 30 mL');
  proximoDe(ponto.concentracaoI3MolL, 0, 1e-15, '[I₃⁻] em 30 mL');
  proximoDe(ponto.concentracaoTiossulfatoMolL, 0.0018181818181818182, 1e-15, '[S₂O₃²⁻] em 30 mL');
  proximoDe(ponto.concentracaoTetrationatoMolL, 0.004545454545454545, 1e-15, '[S₄O₆²⁻] em 30 mL');
  proximoDe(ponto.potencialV, 0.17289375986572197, 1e-12, 'E em 30 mL');
});

teste('Balanços de I₃⁻, I⁻, tiossulfato e tetrationato fecham antes, no e após o PE', () => {
  for (const volume of [0, 10, 25, 30]) {
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
      1e-14,
      `balanço I₃⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molIodeto,
      resumoIodo.molIodetoDisponivelAposGeracao + 3 * molI3Reduzido,
      1e-14,
      `balanço I⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molTetrationato,
      molI3Reduzido,
      1e-14,
      `balanço S₄O₆²⁻ em ${volume} mL`
    );
    proximoDe(
      ponto.molTiossulfato + 2 * ponto.molTetrationato,
      molTiossulfatoAdicionado,
      1e-14,
      `balanço S₂O₃²⁻ em ${volume} mL`
    );
  }
});

teste('KI inicial é usado para verificar excesso e o iodeto residual é calculado por estequiometria', () => {
  const entrada = entradaPadraoIodometria('cloro-ativo');
  const resumo = calcularResumoEstequiometricoIodometria(entrada);
  const antes = calcularPontoIodometria({ entrada, volumeAdicionadoMl: 0 });
  const depois = calcularPontoIodometria({ entrada, volumeAdicionadoMl: 30 });

  proximoDe(antes.molIodeto, 0.00175, 1e-15, 'I⁻ após geração');
  proximoDe(depois.molIodeto, resumo.molIodetoInicial, 1e-15, 'I⁻ regenerado após PE');
  proximoDe(depois.concentracaoIodetoMolL, 0.045454545454545456, 1e-15, 'concentração de I⁻ após PE');
});

teste('KI 0,010 mol/L é insuficiente para gerar I₃⁻ quantitativamente a partir de Cl₂ 0,010 mol/L', () => {
  const entrada = {
    ...entradaPadraoIodometria('cloro-ativo'),
    concentracaoIodetoInicialMolL: 0.01,
  };
  assert.throws(() => gerarCurvaIodometria({ entrada }), /KI insuficiente/);
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
      resumo.molIodetoConsumido,
      fator * resumo.molAnalitoInicial,
      1e-14,
      `consumo de I⁻ em ${sistemaId}`
    );
  }
});

teste('Os seis sistemas iodimétricos geram potenciais finitos antes, no e após o PE', () => {
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
    for (const fracao of [0, 0.5, 1, 1.5, 2]) {
      const ponto = calcularPontoIodometria({
        entrada,
        volumeAdicionadoMl: curva.volumeEquivalenciaMl * fracao,
      });
      assert.ok(
        Number.isFinite(ponto.potencialV),
        `${sistemaId}: potencial inválido em ${fracao} × PE`
      );
    }
    proximoDe(curva.potencialEquivalenciaV, 0.308, 1e-15, `EPE ${sistemaId}`);
  }
});

teste('A derivada da curva iodimétrica continua localizando a região de maior variação', () => {
  const curva = gerarCurvaIodometria({ entrada: entradaIodo });
  const derivadas = calcularDerivadasIodometria(curva.pontosValidos);
  assert.ok(Number.isFinite(derivadas.volumePFPrimeiraDerivadaMl));
  assert.ok(Number.isFinite(derivadas.volumePFSegundaDerivadaMl));
  assert.ok(Math.abs(derivadas.volumePFPrimeiraDerivadaMl - curva.volumeEquivalenciaMl) < 0.2);
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
