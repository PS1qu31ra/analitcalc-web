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
  E0_I2_AQ_I,
  E0_I3_I_25C,
  E0_TETRATIONATO_TIOS,
  K_FORMACAO_I3_25C,
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


const pontoIodoInicial = calcularPontoIodometria({
  entrada: entradaPadraoIodometria('cloro-ativo'),
  volumeAdicionadoMl: 0,
});

teste('A especiação I₂/I₃⁻/I⁻ fecha os balanços analíticos', () => {
  proximoDe(
    pontoIodoInicial.molI2,
    pontoIodoInicial.molI2Livre + pontoIodoInicial.molI3,
    1e-14,
    'balanço de iodo oxidado'
  );
  proximoDe(
    pontoIodoInicial.molIodeto,
    pontoIodoInicial.molIodetoLivre + pontoIodoInicial.molI3,
    1e-14,
    'balanço de iodeto'
  );
});
teste('A constante de formação do triiodeto reproduz Kf = 698 a 25 °C', () => {
  const kfCalculado =
    pontoIodoInicial.concentracaoI3MolL /
    (pontoIodoInicial.concentracaoI2MolL * pontoIodoInicial.concentracaoIodetoMolL);
  proximoDe(kfCalculado, K_FORMACAO_I3_25C, 1e-8, 'Kf I₃⁻');
});
teste('Kf do triiodeto diminui com o aumento de temperatura no modelo exotérmico', () => {
  const entrada = { ...entradaPadraoIodometria('cloro-ativo'), temperaturaC: 35 };
  const ponto = calcularPontoIodometria({ entrada, volumeAdicionadoMl: 0 });
  const kf35 = ponto.concentracaoI3MolL /
    (ponto.concentracaoI2MolL * ponto.concentracaoIodetoMolL);
  const temperaturaK = 308.15;
  const referenciaK = 298.15;
  const deltaH = -17000;
  const deltaCp = -21;
  const R = 8.31446261815324;
  const logKEsperado = Math.log(K_FORMACAO_I3_25C) +
    (deltaH / R) * (1 / referenciaK - 1 / temperaturaK) +
    (deltaCp / R) * (Math.log(temperaturaK / referenciaK) + referenciaK / temperaturaK - 1);
  proximoDe(kf35, Math.exp(logKEsperado), 1e-8, 'Kf I₃⁻ a 35 °C');
  assert.ok(kf35 < K_FORMACAO_I3_25C);
  assert.ok(kf35 > 0);
});
teste('O equilíbrio de potenciais da iodometria fecha antes e depois do PE', () => {
  const entrada = entradaPadraoIodometria('cloro-ativo');
  for (const volume of [5, 12.5, 26, 40]) {
    const ponto = calcularPontoIodometria({ entrada, volumeAdicionadoMl: volume });
    const termo = (8.31446261815324 * (entrada.temperaturaC + 273.15)) / (2 * 96485.33212);
    const potencialIodo = E0_I2_AQ_I + termo * Math.log(
      ponto.concentracaoI2MolL / (ponto.concentracaoIodetoMolL ** 2)
    );
    const potencialTios = E0_TETRATIONATO_TIOS + termo * Math.log(
      ponto.concentracaoTetrationatoMolL / (ponto.concentracaoTiossulfatoMolL ** 2)
    );
    assert.ok(Math.abs(potencialIodo - potencialTios) < 1e-9, `dE fora da tolerância em ${volume} mL`);
    proximoDe(ponto.potencialV, (potencialIodo + potencialTios) / 2, 1e-12, `E em ${volume} mL`);
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
      assert.ok(Number.isFinite(ponto.potencialV), `${sistemaId}: potencial inválido em ${fracao} × PE`);
    }
  }
});
teste('A busca do motor iodimétrico rejeita identificador desconhecido', () => {
  assert.throws(() => buscarSistemaIodometriaCore('sistema-inexistente'), /desconhecido/);
});

// 5 — Não mascarar sistema iodimétrico inválido.
teste('Identificador iodimétrico desconhecido gera erro explícito', () => {
  assert.throws(() => buscarSistemaIodometria('sistema-inexistente'), /desconhecido/);
});

// 6 — Correções solicitadas na validação: iodeto inicial, I₃⁻ e apresentação.
teste('Iodeto inicial é descontado pelo consumo de Cl₂ antes da especiação', () => {
  const e = entradaPadraoIodometria('cloro-ativo');
  const resumo = require('../.redox-build/iodometria.js').calcularResumoEstequiometricoIodometria(e);
  proximoDe(e.concentracaoIodetoInicialMolL, 0.1, 1e-15, 'I- inicial');
  proximoDe(resumo.molIodetoInicial, 0.0025, 1e-15, 'mol I- inicial');
  proximoDe(resumo.molIodetoConsumido, 0.0005, 1e-15, 'mol I- consumido');
  proximoDe(resumo.molIodetoDisponivelAposGeracao, 0.002, 1e-15, 'mol I- após etapa redox');
});
teste('Iodeto de 0,010 M é insuficiente para Cl₂ 0,010 M na mesma mistura', () => {
  const e = {...entradaPadraoIodometria('cloro-ativo'), concentracaoIodetoInicialMolL: 0.01};
  assert.throws(() => gerarCurvaIodometria({entrada:e}), /KI insuficiente/);
});
teste('Consumo de iodeto inclui CuI(s) na iodometria de Cu²⁺', () => {
  const e = entradaPadraoIodometria('cobre-ii');
  const r = require('../.redox-build/iodometria.js').calcularResumoEstequiometricoIodometria(e);
  proximoDe(r.molIodetoConsumido, 2 * r.molAnalitoInicial, 1e-15, 'consumo Cu²⁺');
  const p = calcularPontoIodometria({entrada:e,volumeAdicionadoMl:0});
  proximoDe(p.molIodeto, r.molIodetoDisponivelAposGeracao, 1e-14, 'I- disponível Cu²⁺');
});
teste('Consumo de iodeto do iodato usa 5 I⁻ por IO₃⁻, não 6', () => {
  const e = entradaPadraoIodometria('iodato');
  const r = require('../.redox-build/iodometria.js').calcularResumoEstequiometricoIodometria(e);
  proximoDe(r.molIodetoConsumido, 5 * r.molAnalitoInicial, 1e-14, 'iodeto consumido IO₃⁻');
});
teste('Potenciais I₂(aq)/I⁻ e I₃⁻/I⁻ são equivalentes com Kf consistente', () => {
  const e = entradaPadraoIodometria('cloro-ativo');
  const p = calcularPontoIodometria({entrada:e, volumeAdicionadoMl: 5});
  const term = (8.31446261815324 * 298.15) / (2 * 96485.33212);
  const eI2 = E0_I2_AQ_I + term * Math.log(p.concentracaoI2MolL / p.concentracaoIodetoMolL ** 2);
  const eI3 = E0_I3_I_25C + term * Math.log(p.concentracaoI3MolL / p.concentracaoIodetoMolL ** 3);
  proximoDe(eI2, eI3, 1e-12, 'equivalência dos dois pares');
  assert.ok(E0_I3_I_25C > 0.535 && E0_I3_I_25C < 0.538);
});
teste('O triiodeto predomina sobre I₂ livre na condição padrão de KI em excesso', () => {
  const p = calcularPontoIodometria({entrada:entradaPadraoIodometria('cloro-ativo'),volumeAdicionadoMl:0});
  assert.ok(p.concentracaoI3MolL > p.concentracaoI2MolL * 10);
});
teste('Equilíbrio iodeto/triiodeto preserva balanço antes, no e após o PE', () => {
  const e = entradaPadraoIodometria('cloro-ativo');
  for (const v of [0,10,25,30]) {
    const p = calcularPontoIodometria({entrada:e,volumeAdicionadoMl:v});
    proximoDe(p.molIodeto, p.molIodetoLivre + p.molI3, 1e-14, `I- total ${v}`);
    proximoDe(p.molI2, p.molI2Livre + p.molI3, 1e-14, `I2 total ${v}`);
  }
});
teste('Notação científica apresentada sem e de programação', () => {
  const {formatarCientificoPtBr} = require('../.redox-build/formatacao.js');
  assert.equal(formatarCientificoPtBr(1.234e-8, 3), '1,234 × 10⁻⁸');
  assert.equal(formatarCientificoPtBr(1.2e6, 2), '1,20 × 10⁶');
});

process.stdout.write(`\n${aprovados} testes aprovados.\n`);
if (process.exitCode) process.stderr.write('Há falhas nos testes de regressão.\n');
