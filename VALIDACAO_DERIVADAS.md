# Iodometria — validação das derivadas

## Causa da falha anterior

A implementação anterior trocava abruptamente de uma equação de Nernst para outra no PE e fixava o potencial exatamente no ponto por uma média formal. Os ramos apresentavam comportamento assintótico quando as concentrações do reagente limitante se aproximavam de zero. Calcular diferenças finitas sobre essa descontinuidade gerava picos quase verticais em `dE/dV` e `d²E/dV²`.

## Correção aplicada

1. A curva E × V agora é contínua: em cada volume, o motor resolve simultaneamente os potenciais dos pares I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻.
2. A extensão de reação é resolvida por bisseção em escala logarítmica.
3. Os balanços de I₃⁻, I⁻, S₂O₃²⁻ e S₄O₆²⁻ são preservados antes, no e após o PE.
4. As derivadas são calculadas sobre a curva completa, sem separar os ramos e sem remover uma faixa ao redor do PE.
5. A primeira derivada procura o vale negativo, pois o potencial cai com a adição de tiossulfato.
6. A segunda derivada é calculada independentemente; o PF é localizado no cruzamento real por zero.

## Resolução da curva

A malha padrão foi alinhada à permanganatometria:

- passo base: `max(VPE / 50, 0,02 mL)`;
- passo próximo ao PE: `max(VPE / 250, 0,002 mL)`;
- faixa densa: `12%` do volume de equivalência.

Os volumes são deduplicados com precisão de 6 casas decimais para evitar intervalos microscópicos quando o PE calculado difere alguns bilionésimos de mL de um ponto da malha.

## Exemplo padrão — cloro ativo

- PE estequiométrico: `25,000 mL`;
- potencial de equilíbrio no PE: aproximadamente `0,4633 V`;
- PF pela primeira derivada na malha padrão: aproximadamente `25,036 mL`;
- PF pela segunda derivada: aproximadamente `25,036 mL`.

A primeira derivada deve aparecer como um vale negativo contínuo. A segunda deve apresentar regiões negativa e positiva, com cruzamento próximo ao PE. Não deve existir faixa artificialmente removida nem pico causado pela troca de equação.
