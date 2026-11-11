# Patch — correção matemática das curvas e derivadas da iodometria

Este patch corrige a origem matemática dos gráficos anômalos.

## Arquivos alterados

- `lib/oxirreducao/iodometria.ts`
- `app/oxirreducao/components/Iodometria.tsx`
- `app/oxirreducao/components/DerivadasIodometria.tsx`
- `app/oxirreducao/styles/oxirreducao.css`
- `scripts/testar-oxirreducao.js`
- `VALIDACAO_IODOMETRIA.md`
- `VALIDACAO_DERIVADAS.md`

## Mudança principal

O motor deixa de usar três fórmulas desconectadas (antes/PE/depois) e passa a resolver o equilíbrio simultâneo dos dois pares redox em cada volume. Isso elimina a descontinuidade que produzia as derivadas quase verticais.

A média formal de 0,308 V foi mantida como referência separada, mas não é mais usada como potencial real no PE. Para o exemplo de cloro ativo, o potencial de equilíbrio calculado no PE é aproximadamente 0,4633 V. Os resultados em 10 mL e 30 mL continuam compatíveis com a validação.

A aba de derivadas agora usa o mesmo padrão visual da permanganatometria, com uma curva contínua, vale na primeira derivada e cruzamento de sinal na segunda.

## Aplicação

Extraia o ZIP na raiz do repositório e substitua os arquivos correspondentes. Em seguida:

```bash
npm run test:redox
npm run build
```

O `test:redox` foi executado após as alterações: **50 testes aprovados**. O build Next.js completo deve ser confirmado no ambiente local do projeto.
