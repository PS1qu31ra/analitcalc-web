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

### 4. Iodometria e especiação do iodo

- O potencial padrão utilizado no par é agora o de I₂(aq)/I⁻ (`+0,621 V`), e não o valor de I₂(s)/I⁻ (`+0,5355 V`).
- Foi incluído o equilíbrio `I₂(aq) + I⁻ ⇌ I₃⁻`.
- A especiação é resolvida a partir dos balanços analíticos de iodo oxidado e iodeto. O cálculo de Nernst utiliza I₂(aq) e I⁻ livres; I₃⁻ é calculado e exibido separadamente.
- A constante de formação de triiodeto usa `Kf ≈ 698` a 25 °C e correção de temperatura por van’t Hoff com ΔH° e ΔCp° de referência.
- O solucionador da extensão da reação foi reparametrizado pelo reagente residual (iodo após o PE; tiossulfato antes do PE). Isso evita perder algarismos significativos ao subtrair quantidades quase iguais na região de equivalência.
- A interface agora apresenta `[I₂(aq)] livre`, `[I⁻] livre` e `[I₃⁻]`.
- Identificadores de sistema inválidos geram erro explícito em vez de selecionar silenciosamente cloro ativo.

## Testes de regressão

Executar na raiz do projeto:

```bash
npm run test:redox
```

O comando compila o núcleo `lib/oxirreducao` em um diretório temporário e executa `scripts/testar-oxirreducao.js`.

Cobertura desta versão:

- volumes estequiométricos de Fe²⁺, H₂O₂ e oxalato;
- potenciais de equivalência e fechamento dos balanços;
- aproximações assintóticas de H₂O₂ e oxalato;
- segunda derivada sem zero artificial, incluindo curvas sintéticas;
- comportamento da derivada em curva descendente;
- Nernst em condições ordinárias e em atividades extremas;
- balanços I₂/I₃⁻/I⁻ e constante de formação;
- igualdade dos potenciais dos pares iodo e tiossulfato;
- os seis sistemas iodimétricos antes, no e após o PE;
- rejeição de identificadores inválidos.

**Resultado desta entrega: 23 testes aprovados.**

## Limitações que permanecem explícitas

1. A especiação I₂/I₃⁻ usa concentrações como aproximação de atividades. Não há correção geral por coeficientes de atividade ou força iônica.
2. A constante de formação de triiodeto de referência é reportada em escala molal; o motor a trata como aproximação em soluções diluídas expressas em mol/L.
3. Os potenciais padrão da iodometria são referências a 25 °C. O modelo ajusta Kf com a temperatura, mas ainda não inclui a dependência térmica completa dos potenciais padrão.
4. A validação desta entrega é computacional e teórica. Não substitui comparação com dados experimentais, padrões certificados ou validação metrológica em bancada.
5. A instalação das dependências do projeto não foi concluída neste ambiente. Por isso, foi validada a compilação isolada do núcleo TypeScript e a sintaxe dos componentes TSX alterados; o build integral do Next.js deve ser executado no ambiente de desenvolvimento do projeto.

## Referências físico-químicas utilizadas na correção iodimétrica

- Potencial padrão do par I₂(aq)/I⁻: `+0,621 V` — material didático de titulações redox com iodo, University of Richmond.
- Palmer, D. A.; Ramette, R. W.; Mesmer, R. E. *Triiodide ion formation equilibrium and activity coefficients in aqueous solution*. Journal of Solution Chemistry, 13 (1984), 673–683. DOI: `10.1007/BF00650374`. Valores de referência: Kf ≈ 698 ± 10 a 25 °C; ΔH° ≈ −17,0 ± 0,6 kJ mol⁻¹; ΔCp° ≈ −21 ± 8 J mol⁻¹ K⁻¹.
- Vogel’s Textbook of Quantitative Chemical Analysis, discussão da formação de I₃⁻ em soluções de iodo com excesso de iodeto e da forma da reação com tiossulfato.
