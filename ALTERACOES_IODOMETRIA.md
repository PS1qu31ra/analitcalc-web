# Registro da atualização — Iodometria

Base: `analitcalc-web (20).zip`

## Interface
- Nova dedução do potencial global da geração de triiodeto.
- Exibição das semirreações de redução e oxidação, com inversão explícita da semirreação I₃⁻/I⁻.
- Balanceamento de elétrons exibido para cada sistema.
- Nova dedução da reação I₃⁻ × tiossulfato, com E°global = +0,456 V.
- Nota metodológica específica para o método de Winkler.

## Arquivos alterados
- `app/oxirreducao/components/Iodometria.tsx`
- `app/globals.css`
- `scripts/testar-oxirreducao.js`
- `VALIDACAO_IODOMETRIA.md`
- `README.md`

## Validação
- Compilação das rotinas redox: aprovada.
- 53 testes: aprovados.
- Sintaxe TSX: aprovada.
