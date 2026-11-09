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

- Fe²⁺, H₂O₂ e oxalato agora obtêm o potencial no PE pelo resolvedor acoplado das equações de Nernst e dos balanços estequiométricos.
- Os sistemas H₂O₂ e oxalato não usam mais a média ponderada simplificada como resultado principal.
- O sistema Fe²⁺ também usa o resolvedor no PE; a expressão ponderada permanece apenas como referência analítica.
- Os balanços de Fe e oxalato foram rearranjados para evitar subtração de quantidades grandes e quase iguais perto do PE.
- As funções fechadas de H₂O₂ e oxalato foram mantidas como aproximações assintóticas explícitas, com a concentração total de manganês como entrada. O resultado principal, entretanto, vem do equilíbrio completo.

### 3. Equação de Nernst

- O quociente de reação é calculado diretamente por `log10(Q)`, somando os logaritmos das atividades e evitando overflow/underflow intermediário.
- O potencial usa o logaritmo sem truncamento.
- `log10QuocienteReacao` foi adicionado ao resultado. `quocienteReacao` é limitado à faixa representável por `Number` apenas para manter um valor finito de exibição.
- O fator de Nernst utiliza `Math.LN10` em vez da aproximação decimal `2.303`.

### 4. Iodometria — metodologia dos slides 39–42

O motor iodimétrico foi reorganizado para seguir o procedimento apresentado nos slides da orientadora, com cálculo separado em três regiões:

- **Antes do PE:** o potencial é calculado pela equação de Nernst do par da amostra `I₃⁻/I⁻`:
  `E = E°(I₃⁻/I⁻) − (0,0592/2) log([I⁻]³/[I₃⁻])`.
- **No PE:** aplica-se a média ponderada dos potenciais padrão, conforme os slides 40–41. Como os dois pares titulométricos envolvem dois elétrons:
  `EPE = (2 × 0,536 + 2 × 0,080) / 4 = 0,308 V`.
- **Após o PE:** o potencial é calculado pela equação de Nernst do par do titulante `S₄O₆²⁻/S₂O₃²⁻`:
  `E = E°(S₄O₆²⁻/S₂O₃²⁻) − (0,0592/2) log([S₂O₃²⁻]²/[S₄O₆²⁻])`.

Outras alterações:

- O potencial padrão do par `I₃⁻/I⁻` é fixado em `+0,536 V`, conforme a referência adotada pela orientadora. O valor `+0,621 V` não é utilizado.
- O potencial padrão do par `S₄O₆²⁻/S₂O₃²⁻` permanece em `+0,080 V`.
- O motor não resolve mais o equilíbrio de especiação `I₂(aq) + I⁻ ⇌ I₃⁻` nem calcula `I₂` livre. Em excesso de KI, o iodo gerado é representado diretamente como `I₃⁻`.
- As concentrações de `I₃⁻`, `I⁻`, `S₂O₃²⁻` e `S₄O₆²⁻` são calculadas por estequiometria e diluição em cada volume.
- A concentração inicial de iodeto fornecida pelo KI é usada para verificar se existe iodeto suficiente para gerar `I₃⁻` e para fechar o balanço estequiométrico do iodeto remanescente. Ela não é tratada como concentração livre calculada por equilíbrio de especiação.
- A reação de titulação considerada é `I₃⁻ + 2 S₂O₃²⁻ → 3 I⁻ + S₄O₆²⁻`.
- O consumo de iodeto na geração do triiodeto inclui também o iodeto incorporado ao `I₃⁻`: 3 mol por mol de Cl₂, 2,5 por Cu²⁺, 6 por O₂ no equivalente global do método de Winkler, 3 por H₂O₂, 3 por ClO⁻ e 8 por IO₃⁻.
- O potencial no PE é calculado diretamente pela expressão ponderada dos slides; não é obtido por média de potenciais numéricos do equilíbrio acoplado.
- A busca binária proposta foi preservada para localizar, entre os limites ordenados da curva, se o volume consultado pertence à região anterior, à faixa do PE ou à região posterior. Depois da classificação, o motor aplica o balanço e a equação de Nernst correspondentes.
- A interface mostra as três equações por região, os potenciais padrão adotados e as concentrações estequiométricas de triiodeto, iodeto, tiossulfato e tetrationato.

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
- suficiência do KI e consumo de iodeto nos seis sistemas;
- busca binária para classificar a região de cada volume consultado;
- localização das derivadas e rejeição de identificadores inválidos;
- notação científica sem o caractere `e` de programação.

**Resultado desta entrega: 32 testes aprovados.**

## Limitações que permanecem explícitas

1. As concentrações são usadas como aproximações de atividades. Não há correção geral por coeficientes de atividade ou força iônica.
2. Os potenciais padrão `+0,536 V` para I₃⁻/I⁻ e `+0,080 V` para S₄O₆²⁻/S₂O₃²⁻ são referências a 25 °C. O fator de Nernst acompanha a temperatura informada, mas não há correção térmica completa dos potenciais padrão.
3. O potencial no PE segue a dedução didática dos slides 40–41. A aplicação da média ponderada pressupõe as relações estequiométricas e o cancelamento dos termos logarítmicos demonstrados pela orientadora.
4. A validação desta entrega é computacional e teórica. Não substitui comparação com dados experimentais, padrões certificados ou validação metrológica em bancada.
5. A instalação das dependências do projeto não foi concluída neste ambiente. A compilação isolada do núcleo TypeScript e os testes de regressão foram executados; o build integral do Next.js deve ser executado no ambiente de desenvolvimento do projeto.

