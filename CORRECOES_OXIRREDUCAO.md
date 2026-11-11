# AnalitCalc — correções do módulo de oxirredução

## Escopo desta entrega

Esta versão aplica correções no núcleo matemático da permanganometria, iodometria, equação de Nernst e identificação dos pontos finais pelas derivadas.

## Correções implementadas

### 1. Derivadas da curva potenciométrica

- A primeira derivada continua sendo calculada por diferenças finitas progressivas, associada ao ponto médio de cada intervalo.
- A segunda derivada agora é calculada diretamente dos potenciais originais, pela fórmula de três pontos para espaçamentos não uniformes:

  `E''(Vᵢ) ≈ 2/(h₁+h₂) × [(Eᵢ₊₁-Eᵢ)/h₂ - (Eᵢ-Eᵢ₋₁)/h₁]`

- O ponto final pela segunda derivada só é informado quando há cruzamento real de sinal. Não há mais inserção de zero baseada no resultado da primeira derivada.
- Se não existir cruzamento, `volumePFSegundaDerivadaMl` retorna `null` e a interface mostra “Não localizado”.
- A iodometria utiliza o mesmo motor, procurando o extremo de maior magnitude da primeira derivada porque seu potencial normalmente decresce durante a titulação.

### 2. Potenciais de equivalência da permanganometria

- O potencial teórico no PE dos três sistemas segue a metodologia dos slides da orientadora: média ponderada dos potenciais condicionais pelo número de elétrons de cada par.
- Fe²⁺/MnO₄⁻: `EPE = (E'Fe + 5 × E'Mn) / 6`, com 1 elétron para Fe³⁺/Fe²⁺ e 5 para MnO₄⁻/Mn²⁺.
- H₂O₂/MnO₄⁻: `EPE = (2 × E'O₂/H₂O₂ + 5 × E'Mn) / 7`.
- Oxalato/MnO₄⁻: `EPE = (2 × E'CO₂/H₂C₂O₄ + 5 × E'Mn) / 7`.
- Os potenciais condicionais preservam as condições químicas: acidez, atividade de O₂ e especiação ácido-base do oxalato.
- Foi removida a correção adicional dependente da concentração total de manganês que elevava o PE de H₂O₂ e oxalato em aproximadamente `0,012486 V`.
- Valores de referência a 25 °C, com os parâmetros padrão da plataforma: Fe²⁺ `1,3868 V`; H₂O₂ `1,2734 V`; oxalato `0,9388 V`.

- Para reproduzir a validação acadêmica da permanganometria, a base utiliza exatamente: MnO₄⁻/Mn²⁺ `+1,510 V`; Fe³⁺/Fe²⁺ `+0,771 V`; O₂/H₂O₂ `+0,682 V`.
- As semirreações de redução exibidas são: `MnO₄⁻ + 8 H⁺ + 5 e⁻ ⇌ Mn²⁺ + 4 H₂O`; `Fe³⁺ + e⁻ ⇌ Fe²⁺`; `O₂ + 2 H⁺ + 2 e⁻ ⇌ H₂O₂`.
- O valor `+0,682 V` para O₂/H₂O₂ substitui o valor anterior `+0,695 V`. Com [H⁺] = 1,0 mol L⁻¹ e atividade de O₂ igual a 1, o potencial de equivalência validado para H₂O₂ é `1,2734 V`.
- As regiões antes e após o PE permanecem calculadas pelo par redox predominante e sua equação de Nernst. Os resolvedores acoplados continuam disponíveis para calcular as espécies residuais apresentadas nas consultas, mas não substituem a expressão ponderada no potencial teórico do PE.
- Os balanços de Fe, H₂O₂ e oxalato continuam cobertos pelos testes de regressão.

### 3. Equação de Nernst

- O quociente de reação é calculado diretamente por `log10(Q)`, somando os logaritmos das atividades e evitando overflow/underflow intermediário.
- O potencial usa o logaritmo sem truncamento.
- `log10QuocienteReacao` foi adicionado ao resultado. `quocienteReacao` é limitado à faixa representável por `Number` apenas para manter um valor finito de exibição.
- O fator de Nernst utiliza `Math.LN10` em vez da aproximação decimal `2.303`.

### 4. Iodometria — alinhamento com a validação (páginas 29–31)

O motor iodométrico foi ajustado para reproduzir os balanços e os potenciais apresentados na validação acadêmica para cloro ativo.

**Dados de referência:**

- `C(Cl₂) = 0,010 mol/L`;
- `V(amostra) = 25,00 mL`;
- `C(Na₂S₂O₃) = 0,020 mol/L`;
- `E°(I₃⁻/I⁻) = +0,536 V`;
- `E°(S₄O₆²⁻/S₂O₃²⁻) = +0,080 V`;
- temperatura de `25 °C`.

**Correção do potencial antes do PE:**

- O iodeto utilizado na equação de Nernst é calculado a partir da reação `I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻`.
- O cálculo não soma o excesso de KI ao termo de `[I⁻]` da equação pré-PE, pois a validação das páginas 30–31 calcula `[I⁻]` exclusivamente a partir do iodeto formado pela reação com tiossulfato.
- Para `V(Na₂S₂O₃) = 10,00 mL`, o motor retorna `[I₃⁻] = 0,0042857 mol/L`, `[I⁻] = 0,0085714 mol/L` e `E = 0,64945 V`, que corresponde a `0,649 V` com três casas decimais na validação.
- Em `25,00 mL`, o PE permanece em `0,308 V`, pela média ponderada dos dois pares de dois elétrons.
- Em `30,00 mL`, o potencial permanece em aproximadamente `0,1729 V`, calculado pelo par `S₄O₆²⁻/S₂O₃²⁻`.

**Cálculo automático da necessidade de KI:**

- O campo de concentração inicial de KI foi removido da entrada.
- A quantidade mínima estequiométrica é calculada por `n(KI)min = n(analito) × coeficiente estequiométrico de I⁻`.
- A concentração mínima é `C(KI)min = n(KI)min / V(amostra)`. Para cloro ativo com `C(Cl₂) = 0,010 mol/L`, o limite estequiométrico é `0,030 mol/L` e a quantidade mínima em 25,00 mL é `0,00075 mol` (`0,75 mmol`).
- O valor é um limite estequiométrico, não uma concentração com excesso. Na prática, deve-se usar KI acima desse limite.
- O resultado representa a concentração na mistura inicial, tomando `V(amostra)` como volume de referência. A concentração da solução-estoque de KI não pode ser calculada sem informar também o volume de solução de KI adicionado.

**Ponto inicial da curva:**

- Em `0,00 mL`, o modelo de validação ainda não apresenta I⁻ produzido pela reação com tiossulfato; portanto, a expressão pré-PE de Nernst não fornece potencial finito.
- A curva gerada começa no primeiro volume positivo. Uma consulta manual em `0,00 mL` retorna uma mensagem de concentração insuficiente para aplicar Nernst, em vez de criar um potencial artificial.

- O potencial padrão `+0,536 V` para `I₃⁻/I⁻` é mantido; `+0,621 V` não é utilizado.
- O potencial no PE continua sendo `EPE = (2 × 0,536 + 2 × 0,080) / 4 = 0,308 V`.
- Após o PE, a equação de Nernst do par do titulante continua sendo aplicada a `[S₂O₃²⁻]` e `[S₄O₆²⁻]`.
- A curva e as derivadas mantêm a identificação do ponto final por dados calculados, sem inserção artificial de cruzamentos.

## Testes de regressão

Executar na raiz do projeto:

```bash
npm run test:redox
```

O comando compila o núcleo TypeScript e executa `scripts/testar-oxirreducao.js`.

A suíte cobre:

- regressão dos cálculos de permanganometria;
- Nernst e estabilidade em espaço logarítmico;
- E° = +0,536 V para I₃⁻/I⁻;
- PE iodimétrico de 0,308 V pela média ponderada;
- cálculo pré-PE pelo par da amostra;
- cálculo no PE pela média ponderada;
- cálculo pós-PE pelo par do titulante;
- balanços de matéria de I₃⁻, I⁻, S₂O₃²⁻ e S₄O₆²⁻;
- cálculo automático da quantidade e concentração mínima de KI nos seis sistemas;
- busca binária para classificar a região de cada volume consultado;
- localização das derivadas e rejeição de identificadores inválidos;
- notação científica sem o caractere `e` de programação.

**Resultado desta entrega: 49 testes aprovados.**

## Limitações que permanecem explícitas

1. As concentrações são usadas como aproximações de atividades. Não há correção geral por coeficientes de atividade ou força iônica.
2. Os potenciais padrão `+0,536 V` para I₃⁻/I⁻ e `+0,080 V` para S₄O₆²⁻/S₂O₃²⁻ são referências a 25 °C. O fator de Nernst acompanha a temperatura informada, mas não há correção térmica completa dos potenciais padrão.
3. O potencial no PE segue a dedução didática dos slides 40–41. A aplicação da média ponderada pressupõe as relações estequiométricas e o cancelamento dos termos logarítmicos demonstrados pela orientadora.
4. A validação desta entrega é computacional e teórica. Não substitui comparação com dados experimentais, padrões certificados ou validação metrológica em bancada.
5. A instalação das dependências do projeto não foi concluída neste ambiente. A compilação isolada do núcleo TypeScript e os testes de regressão foram executados; o build integral do Next.js deve ser executado no ambiente de desenvolvimento do projeto.

