# Iodometria — modelo de equilíbrio e validação numérica

## Dados de referência: cloro ativo

| Parâmetro | Valor |
|---|---:|
| [Cl₂] | 0,010 mol/L |
| Volume da amostra | 25,00 mL |
| [Na₂S₂O₃] | 0,020 mol/L |
| Temperatura | 25 °C |
| E°(I₃⁻/I⁻) | +0,536 V |
| E°(S₄O₆²⁻/S₂O₃²⁻) | +0,080 V |

Reações:

- Geração do iodo: `Cl₂ + 3 I⁻ → 2 Cl⁻ + I₃⁻`
- Titulação: `I₃⁻ + 2 S₂O₃²⁻ ⇌ 3 I⁻ + S₄O₆²⁻`

## KI mínimo

`n(Cl₂) = 0,010 × 0,025 = 2,50 × 10⁻⁴ mol`

`n(KI) mínimo = 3 × n(Cl₂) = 7,50 × 10⁻⁴ mol = 0,75 mmol`

`[KI] mínima na mistura = 0,75 mmol / 25,00 mL = 0,030 mol/L`

Esse é o limite estequiométrico. O procedimento experimental deve usar KI em excesso. Como a validação não informa o volume da solução-estoque adicionado, o AnalitCalc apresenta o mínimo estequiométrico, mas não presume o excesso operacional. O excesso real pode alterar as atividades e a curva experimental.

## Por que o motor foi alterado

A versão anterior aplicava uma equação de Nernst isolada antes do PE, outra após o PE e inseria `0,308 V` no PE pela média aritmética ponderada dos potenciais padrão. Isso cria assíntotas nos dois ramos: o potencial tende a valores divergentes quando o reagente limitante se aproxima de zero. A derivada numérica, portanto, gera picos artificiais.

A média `0,308 V` continua disponível no código apenas como referência formal dos potenciais padrão. Ela não é usada como potencial real de equilíbrio, pois os quocientes de Nernst contêm potências estequiométricas diferentes (`[I⁻]³/[I₃⁻]` e `[S₂O₃²⁻]²/[S₄O₆²⁻]`).

A nova implementação resolve simultaneamente:

`E(I₃⁻/I⁻) = E(S₄O₆²⁻/S₂O₃²⁻)`

A extensão da reação é encontrada por bisseção em escala logarítmica, preservando os balanços de massa e evitando subtrações numéricas instáveis perto do PE. O modelo usa o KI mínimo estequiométrico; o excesso experimental não informado não é inventado.

## Resultados de referência do motor

| Volume de Na₂S₂O₃ | Potencial calculado |
|---:|---:|
| 10,00 mL | 0,6494528 V |
| 25,00 mL (PE) | 0,4633316 V |
| 30,00 mL | 0,1728938 V |

Em 10,00 mL, os valores de `[I₃⁻]` e `[I⁻]` permanecem compatíveis com a validação acadêmica (0,004286 e 0,008571 mol/L, respectivamente). Em 30,00 mL, `[S₂O₃²⁻]` e `[S₄O₆²⁻]` também reproduzem os valores da validação.

**Alteração metodológica explícita:** o potencial no PE passa de 0,308 V (média formal usada no documento) para aproximadamente 0,4633 V, resultado da resolução simultânea das duas equações de Nernst com os balanços da reação. Essa mudança é necessária para produzir uma curva contínua e derivadas sem singularidades artificiais.

## Volume zero

Em 0,00 mL ainda não há tiossulfato/tetrationato para definir o equilíbrio entre os dois pares. Por isso, o motor não inventa um potencial nesse ponto; a curva começa no primeiro volume positivo.

## Outros sistemas iodimétricos

O mesmo resolvedor é aplicado aos seis sistemas cadastrados. A quantidade inicial de I₃⁻ e o volume de equivalência continuam determinados pela estequiometria específica de cada analito.
