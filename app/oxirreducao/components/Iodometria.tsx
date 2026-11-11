"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  E0_I3_I_25C,
  E0_TETRATIONATO_TIOS,
  REACAO_TIOS,
  EQUILIBRIO_TRIIODeto,
  SEMIRREACAO_IODO,
  SEMIRREACAO_TIOS,
  TEXTO_INDICADOR_AMIDO,
  buscarSistemaIodometria,
  calcularDerivadasIodometria,
  calcularPontoIodometria,
  entradaPadraoIodometria,
  gerarCurvaIodometria,
  type EntradaIodometria,
  type PontoIodometria,
  type ResultadoCurvaIodometria,
  type SistemaIodometriaId,
} from "@/lib/oxirreducao/iodometria";

import { formatarCientificoPtBr } from "@/lib/oxirreducao/formatacao";

import IodometriaTabs, {
  type AbaIodometria,
} from "./IodometriaTabs";

import SeletorSistemaIodometria from "./SeletorSistemaIodometria";
import DerivadasIodometria from "./DerivadasIodometria";
import EfeitoConcentracaoIodometria from "./EfeitoConcentracaoIodometria";

import SimulacaoTempoRealIodometriaChart from "./SimulacaoTempoRealIodometriaChart";

import ConsultaCurvaOxirreducao from "./ConsultaCurvaOxirreducao";

function formatarNumero(
  valor: number,
  casas = 3
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    }
  ).format(valor);
}


function formatarCientifico(valor: number) {
  return formatarCientificoPtBr(valor, 3);
}

function converterNumero(
  valor: string
) {
  return Number(
    valor
      .trim()
      .replace(",", ".")
  );
}


function numeroParaCampo(valor: number) {
  if (!Number.isFinite(valor)) return "";
  if (valor === 0) return "0";
  // Valores de entrada decimais, evitando a letra "e" na apresentação.
  const casas = Math.min(18, Math.max(4, 5 - Math.floor(Math.log10(Math.abs(valor)))));
  return valor.toFixed(casas).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
}

function nomeRegiao(
  ponto: PontoIodometria
) {
  if (ponto.regiao === "antes_pe") {
    return "Antes do PE";
  }

  if (ponto.regiao === "pe") {
    return "PE";
  }

  return "Após o PE";
}


function VisaoGeralIodometria({
  resultado,
}: {
  resultado: ResultadoCurvaIodometria;
}) {
  const sistema = resultado.sistema;

  return (
    <section className="oxirreducaoTabPanel">
      <header className="oxirreducaoTabHeader">
        <span className="oxirreducaoSectionLabel">
          Visão geral
        </span>

        <h3>
          Iodometria de {sistema.nome}
        </h3>

        <p>
          Método indireto: o analito oxida I⁻ de KI, e o iodo produzido permanece predominantemente como triiodeto (I₃⁻) quando há excesso de iodeto. O I₃⁻ é titulado com tiossulfato de sódio.
        </p>
      </header>

      <div className="oxirreducaoOverviewGrid">
        <article>
          <span>Analito</span>
          <strong>{sistema.formulaAnalito}</strong>
          <p>{sistema.descricao}</p>
        </article>

        <article>
          <span>Reagente auxiliar</span>
          <strong>KI</strong>
          <p>
            Fornece o I⁻ necessário para a geração quantitativa de I₃⁻.
          </p>
        </article>

        <article>
          <span>Concentração mínima de KI</span>
          <strong>{formatarNumero(resultado.concentracaoKIMinimaMolL, 4)} mol/L</strong>
          <p>
            Limite estequiométrico calculado automaticamente. Na prática, utilizar KI em concentração superior para manter I⁻ em excesso.
          </p>
        </article>

        <article>
          <span>Titulante</span>
          <strong>Na₂S₂O₃</strong>
          <p>
            O tiossulfato reduz I₃⁻ a I⁻ e é oxidado a tetrationato, S₄O₆²⁻.
          </p>
        </article>

        <article>
          <span>Indicador</span>
          <strong>Amido</strong>
          <p>
            A coloração azul associada ao complexo amilose–iodo desaparece quando o iodo é consumido.
          </p>
        </article>
      </div>

      <div className="oxirreducaoOverviewReaction">
        <span>Geração do triiodeto (predominante em KI em excesso)</span>
        <strong>{sistema.reacaoGlobalGeracaoIodo}</strong>
      </div>

      <div className="oxirreducaoOverviewReaction">
        <span>Reação entre triiodeto e titulante</span>
        <strong>{REACAO_TIOS}</strong>
      </div>

      <div className="oxirreducaoOverviewReaction">
        <span>Relação estequiométrica geral</span>
        <strong>{sistema.relacaoGlobal}</strong>
      </div>

      <div className="explanationBox">
        <h3>Indicador amido</h3>
        <p>{TEXTO_INDICADOR_AMIDO}</p>
      </div>

      {sistema.id === "oxigenio-dissolvido" && (
        <div className="explanationBox">
          <h3>Particularidade do método de Winkler</h3>
          <p>
            O O₂ dissolvido não é considerado como oxidante direto de I⁻ no procedimento experimental. Primeiro ele oxida manganês(II) precipitado em meio alcalino; após acidificação, a espécie de manganês oxidada libera iodo em quantidade equivalente ao O₂ originalmente presente.
          </p>
        </div>
      )}
    </section>
  );
}


function SemirreacoesIodometria({
  resultado,
}: {
  resultado: ResultadoCurvaIodometria;
}) {
  const sistema = resultado.sistema;
  const semiAnalito = sistema.semirreacoes[0];
  const semiIodo = sistema.semirreacoes[1];

  const inverterSemirreacao = (equacao: string) => {
    const partes = equacao.split("⇌");
    if (partes.length !== 2) return equacao;
    return `${partes[1].trim()} → ${partes[0].trim()}`;
  };

  const mdc = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const resto = x % y;
      x = y;
      y = resto;
    }
    return x || 1;
  };

  const eletronsComuns =
    (semiAnalito.eletrons * semiIodo.eletrons) /
    mdc(semiAnalito.eletrons, semiIodo.eletrons);

  const fatorAnalito = eletronsComuns / semiAnalito.eletrons;
  const fatorIodo = eletronsComuns / semiIodo.eletrons;

  const equacaoOxidacaoIodeto = inverterSemirreacao(
    semiIodo.equacao
  );

  const potencialGlobalGeracao =
    semiAnalito.potencialPadraoV !== null &&
    semiIodo.potencialPadraoV !== null
      ? semiAnalito.potencialPadraoV -
        semiIodo.potencialPadraoV
      : null;

  const metodoWinkler = sistema.id === "oxigenio-dissolvido";

  const equacaoOxidacaoTiossulfato = inverterSemirreacao(
    SEMIRREACAO_TIOS
  );

  const potencialGlobalTitulacao =
    E0_I3_I_25C - E0_TETRATIONATO_TIOS;

  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel">
        <span className="eyebrow">
          Etapa de geração do iodo
        </span>

        <h2>
          Semirreações e potenciais padrão
        </h2>

        <div className="reactionDetailsStack">
          {sistema.semirreacoes.map((item) => (
            <div
              className="reactionWideCard"
              key={`${item.titulo}-${item.equacao}`}
            >
              <span>{item.titulo}</span>

              <strong>{item.equacao}</strong>

              <small>
                {item.eletrons} e⁻
                {item.potencialPadraoV !== null
                  ? ` → E° = ${formatarNumero(
                      item.potencialPadraoV,
                      3
                    )} V`
                  : ""}
              </small>

              {item.observacao && <p>{item.observacao}</p>}
            </div>
          ))}
        </div>
      </div>

      {(sistema.id === "hipoclorito" || sistema.id === "iodato") && (
        <div className="resultsPanel redoxSourceDerivationPanel">
          <span className="eyebrow">
            Dedução a partir do Apêndice 5 — Skoog
          </span>

          {sistema.id === "hipoclorito" ? (
            <>
              <h2>Origem do potencial padrão de HClO/Cl⁻</h2>
              <p className="redoxDerivationIntro">
                O livro apresenta duas semirreações. Multiplicamos a primeira
                por 2 para igualar os elétrons; a segunda é mantida. Depois,
                somamos as equações, cancelamos Cl₂ e simplificamos por 2.
              </p>

              <div className="redoxSourceReactionGrid">
                <article className="redoxSourceReactionCard">
                  <header>
                    <span>Referência 1 · Skoog A-14</span>
                    <span className="redoxOperationBadge">×2</span>
                  </header>
                  <strong>HClO + H⁺ + e⁻ ⇌ ½ Cl₂ + H₂O</strong>
                  <small>E°red = +1,630 V · 1 e⁻</small>
                  <div className="redoxAdjustedReaction">
                    <span>Após multiplicar por 2 · sentido mantido</span>
                    <strong>2 HClO + 2 H⁺ + 2 e⁻ → Cl₂ + 2 H₂O</strong>
                  </div>
                </article>

                <article className="redoxSourceReactionCard">
                  <header>
                    <span>Referência 2 · Skoog A-14</span>
                    <span className="redoxOperationBadge redoxOperationBadge--neutral">×1</span>
                  </header>
                  <strong>Cl₂ + 2 e⁻ ⇌ 2 Cl⁻</strong>
                  <small>E°red = +1,359 V · 2 e⁻</small>
                  <div className="redoxAdjustedReaction">
                    <span>Após ajuste · sentido mantido</span>
                    <strong>Cl₂ + 2 e⁻ → 2 Cl⁻</strong>
                  </div>
                </article>
              </div>

              <div className="redoxAlgebraPanel">
                <span>Somatório das equações ajustadas</span>
                <p>2 HClO + 2 H⁺ + 2 e⁻ + Cl₂ + 2 e⁻</p>
                <p>→ Cl₂ + 2 H₂O + 2 Cl⁻</p>
                <div className="redoxAlgebraRule" />
                <small>Cancelamento do intermediário Cl₂ nos dois lados</small>
                <strong>2 HClO + 2 H⁺ + 4 e⁻ → 2 Cl⁻ + 2 H₂O</strong>
                <span className="redoxOperationBadge redoxOperationBadge--neutral">Dividir todos os coeficientes por 2</span>
                <div className="redoxDerivationResult">
                  <span>Semirreação global simplificada</span>
                  <strong>HClO + H⁺ + 2 e⁻ → Cl⁻ + H₂O</strong>
                </div>
              </div>

              <div className="redoxPotentialResult">
                <span>Cálculo do potencial global pela aditividade de ΔG°</span>
                <strong>
                  E° = [2 × 1,630 + 2 × 1,359] / 4 = +1,4945 V ≈ +1,495 V
                </strong>
              </div>
            </>
          ) : (
            <>
              <h2>Origem do potencial padrão de IO₃⁻/I⁻</h2>
              <p className="redoxDerivationIntro">
                A tabela apresenta a redução do iodato até I₂ e a redução de
                I₂ até I⁻. Multiplicamos a segunda semirreação por ½ para
                obter ½ I₂ e 1 elétron; os intermediários I₂ se cancelam.
              </p>

              <div className="redoxSourceReactionGrid">
                <article className="redoxSourceReactionCard">
                  <header>
                    <span>Referência 1 · Skoog A-13</span>
                    <span className="redoxOperationBadge redoxOperationBadge--neutral">×1</span>
                  </header>
                  <strong>IO₃⁻ + 6 H⁺ + 5 e⁻ ⇌ ½ I₂ + 3 H₂O</strong>
                  <small>E°red = +1,196 V · 5 e⁻</small>
                  <div className="redoxAdjustedReaction">
                    <span>Após ajuste · sentido mantido</span>
                    <strong>IO₃⁻ + 6 H⁺ + 5 e⁻ → ½ I₂ + 3 H₂O</strong>
                  </div>
                </article>

                <article className="redoxSourceReactionCard">
                  <header>
                    <span>Referência 2 · Skoog A-13</span>
                    <span className="redoxOperationBadge">×½</span>
                  </header>
                  <strong>I₂ + 2 e⁻ ⇌ 2 I⁻</strong>
                  <small>E°red = +0,5355 V · 2 e⁻</small>
                  <div className="redoxAdjustedReaction">
                    <span>Após multiplicar por ½ · sentido mantido</span>
                    <strong>½ I₂ + e⁻ → I⁻</strong>
                  </div>
                </article>
              </div>

              <div className="redoxAlgebraPanel">
                <span>Somatório das equações ajustadas</span>
                <p>IO₃⁻ + 6 H⁺ + 5 e⁻ + ½ I₂ + e⁻</p>
                <p>→ ½ I₂ + 3 H₂O + I⁻</p>
                <div className="redoxAlgebraRule" />
                <small>Cancelamento do intermediário ½ I₂ nos dois lados</small>
                <div className="redoxDerivationResult">
                  <span>Semirreação global simplificada</span>
                  <strong>IO₃⁻ + 6 H⁺ + 6 e⁻ → I⁻ + 3 H₂O</strong>
                </div>
              </div>

              <div className="redoxPotentialResult">
                <span>Cálculo do potencial global pela aditividade de ΔG°</span>
                <strong>
                  E° = [5 × 1,196 + 1 × 0,5355] / 6 = +1,0859167 V ≈ +1,086 V
                </strong>
              </div>
            </>
          )}
        </div>
      )}

      <div className="resultsPanel">
        <span className="eyebrow">
          Dedução eletroquímica
        </span>

        <h2>Potencial padrão global — geração de I₃⁻</h2>

        {metodoWinkler ? (
          <div className="redoxDerivationNotice">
            <strong>
              Particularidade do método de Winkler
            </strong>
            <p>
              Não se calcula um potencial global direto entre O₂ e I⁻.
              No procedimento de Winkler, o oxigênio é inicialmente fixado
              por espécies de manganês em meio alcalino; após a acidificação,
              a espécie de manganês oxidada libera o iodo. Portanto, o
              potencial do par O₂/H₂O é apresentado apenas como referência
              termodinâmica, e não como uma semirreação diretamente somada
              à oxidação do iodeto.
            </p>
            <span>Equivalência estequiométrica global em KI em excesso</span>
            <strong>{sistema.reacaoGlobalGeracaoIodo}</strong>
          </div>
        ) : (
          <>
            <p className="redoxDerivationIntro">
              Para obter a reação global, mantém-se a semirreação do analito
              no sentido de redução e inverte-se a semirreação de redução
              do par I₃⁻/I⁻, fazendo o iodeto atuar como redutor. Os
              coeficientes são ajustados para igualar o número de elétrons.
            </p>

            <div className="redoxHalfReactionGrid">
              <div className="redoxHalfReactionCard">
                <span>1. Redução — cátodo</span>
                <strong>
                  {fatorAnalito > 1
                    ? `${fatorAnalito} × (${semiAnalito.equacao})`
                    : semiAnalito.equacao}
                </strong>
                <small>
                  E°red ={" "}
                  {semiAnalito.potencialPadraoV !== null
                    ? `${formatarNumero(
                        semiAnalito.potencialPadraoV,
                        3
                      )} V`
                    : "não informado"}
                </small>
                <small>
                  {fatorAnalito} × {semiAnalito.eletrons} e⁻
                  {" = "}
                  {eletronsComuns} e⁻
                </small>
              </div>

              <div className="redoxHalfReactionCard">
                <header className="redoxReactionCardHeader">
                  <span>2. Oxidação — ânodo</span>
                  <span className="redoxOperationBadge redoxOperationBadge--inverted">⇌ invertida</span>
                </header>
                <strong>
                  {fatorIodo > 1
                    ? `${fatorIodo} × (${equacaoOxidacaoIodeto})`
                    : equacaoOxidacaoIodeto}
                </strong>
                <small>
                  E°ox = −E°red = −
                  {semiIodo.potencialPadraoV !== null
                    ? formatarNumero(
                        semiIodo.potencialPadraoV,
                        3
                      )
                    : "—"}{" "}
                  V
                </small>
                <small>
                  {fatorIodo} × {semiIodo.eletrons} e⁻
                  {" = "}
                  {eletronsComuns} e⁻
                </small>
              </div>
            </div>

            <div className="redoxGlobalReactionCard">
              <span>3. Soma das semirreações — reação global</span>
              <strong>{sistema.reacaoGlobalGeracaoIodo}</strong>

              {potencialGlobalGeracao !== null && (
                <div className="redoxPotentialResult">
                  <span>Potencial padrão da reação global</span>
                  <strong>
                    E°global = E°red(cátodo) − E°red(ânodo)
                    {" = "}
                    {formatarNumero(
                      semiAnalito.potencialPadraoV as number,
                      3
                    )}
                    {" − "}
                    {formatarNumero(
                      semiIodo.potencialPadraoV as number,
                      3
                    )}
                    {" = "}
                    {potencialGlobalGeracao >= 0 ? "+" : ""}
                    {formatarNumero(potencialGlobalGeracao, 3)} V
                  </strong>
                </div>
              )}
            </div>
          </>
        )}

        <p className="redoxDerivationFootnote">
          O potencial padrão global expressa a tendência termodinâmica da
          reação nas condições padrão a 25 °C. Ele não corresponde ao
          potencial medido no ponto de equivalência, que é calculado pelo
          equilíbrio e pelas equações de Nernst.
        </p>
      </div>

      <div className="resultsPanel">
        <span className="eyebrow">
          Etapa titulométrica comum
        </span>

        <h2>I₃⁻ × tiossulfato</h2>

        <div className="reactionDetailsStack">
          <div className="reactionWideCard">
            <span>Par I₃⁻/I⁻ — semirreação de redução</span>
            <strong>{SEMIRREACAO_IODO}</strong>
            <small>
              E°red = {formatarNumero(E0_I3_I_25C, 3)} V a 25 °C.
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Formação da espécie titulada em excesso de KI</span>
            <strong>{EQUILIBRIO_TRIIODeto}</strong>
            <small>
              O AnalitCalc informa a quantidade mínima estequiométrica de KI.
              O excesso operacional utilizado em laboratório não é presumido
              pelo motor, pois depende da quantidade real de solução de KI adicionada.
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Equação de Nernst — par I₃⁻/I⁻</span>
            <strong>
              E = E°(I₃⁻/I⁻) − (0,0592/2) log([I⁻]³/[I₃⁻])
            </strong>
            <small>
              E° = {formatarNumero(E0_I3_I_25C, 3)} V a 25 °C.
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Critério de equilíbrio em cada volume</span>
            <strong>
              E(I₃⁻/I⁻) = E(S₄O₆²⁻/S₂O₃²⁻)
            </strong>
            <small>
              O motor resolve numericamente a extensão da reação até que os
              dois pares apresentem o mesmo potencial.
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Equação de Nernst — par S₄O₆²⁻/S₂O₃²⁻</span>
            <strong>
              E = E°(S₄O₆²⁻/S₂O₃²⁻) − (0,0592/2) log([S₂O₃²⁻]²/[S₄O₆²⁻])
            </strong>
            <small>
              E° = {formatarNumero(E0_TETRATIONATO_TIOS, 3)} V a 25 °C.
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Par tetrationato/tiossulfato — redução</span>
            <strong>{SEMIRREACAO_TIOS}</strong>
            <small>
              E°red = {formatarNumero(E0_TETRATIONATO_TIOS, 3)} V a 25 °C.
            </small>
          </div>
        </div>
      </div>

      <div className="resultsPanel">
        <span className="eyebrow">
          Dedução eletroquímica
        </span>

        <h2>Potencial padrão global — titulação com tiossulfato</h2>

        <p className="redoxDerivationIntro">
          O I₃⁻ é reduzido a I⁻. Para completar a reação, inverte-se a
          semirreação de redução do tetrationato, promovendo a oxidação
          do tiossulfato. As duas semirreações envolvem 2 elétrons.
        </p>

        <div className="redoxHalfReactionGrid">
          <div className="redoxHalfReactionCard">
            <span>1. Redução — cátodo</span>
            <strong>{SEMIRREACAO_IODO}</strong>
            <small>
              E°red = {formatarNumero(E0_I3_I_25C, 3)} V
            </small>
          </div>

          <div className="redoxHalfReactionCard">
            <header className="redoxReactionCardHeader">
              <span>2. Oxidação — ânodo</span>
              <span className="redoxOperationBadge redoxOperationBadge--inverted">⇌ invertida</span>
            </header>
            <strong>{equacaoOxidacaoTiossulfato}</strong>
            <small>
              E°ox = −E°red = −
              {formatarNumero(E0_TETRATIONATO_TIOS, 3)} V
            </small>
          </div>
        </div>

        <div className="redoxGlobalReactionCard">
          <span>3. Soma das semirreações — reação global</span>
          <strong>{REACAO_TIOS}</strong>

          <div className="redoxPotentialResult">
            <span>Potencial padrão da reação global</span>
            <strong>
              E°global = E°red(cátodo) − E°red(ânodo)
              {" = "}
              {formatarNumero(E0_I3_I_25C, 3)}
              {" − "}
              {formatarNumero(E0_TETRATIONATO_TIOS, 3)}
              {" = +"}
              {formatarNumero(potencialGlobalTitulacao, 3)} V
            </strong>
          </div>
        </div>

        <p className="redoxDerivationFootnote">
          O valor é o potencial padrão da reação entre I₃⁻ e tiossulfato,
          a 25 °C. O potencial instantâneo ao longo da titulação continua
          sendo obtido pelas equações de Nernst e pelos balanços de matéria.
        </p>
      </div>
    </section>
  );
}


function EstequiometriaIodometria({
  resultado,
}: {
  resultado: ResultadoCurvaIodometria;
}) {
  const sistema = resultado.sistema;

  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel">
        <span className="eyebrow">
          Duas reações encadeadas
        </span>

        <h2>
          Estequiometria completa
        </h2>

        <p>
          O cálculo separa a formação de triiodeto (I₃⁻) da titulação
          do I₃⁻ com tiossulfato e, em seguida, combina as
          duas relações para obter a igualdade geral entre
          analito e titulante.
        </p>

        <div className="reactionDetailsStack">
          {sistema.etapasPreTitulacao.map(
            (etapa, indice) => (
              <div
                className="reactionWideCard"
                key={`${etapa}-${indice}`}
              >
                <span>
                  {sistema.etapasPreTitulacao.length === 1
                    ? "Reação antes da titulação"
                    : `Etapa pré-titulação ${indice + 1}`}
                </span>

                <strong>
                  {etapa}
                </strong>
              </div>
            )
          )}

          <div className="reactionWideCard">
            <span>
              Reação com o titulante
            </span>

            <strong>
              {REACAO_TIOS}
            </strong>
          </div>
        </div>

        <div className="iodometriaStoichiometryGrid">
          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              Elétrons — geração de I₃⁻
            </span>

            <strong>
              {sistema.eletronsGeracaoIodo} e⁻
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              Elétrons — I₃⁻ × S₂O₃²⁻
            </span>

            <strong>
              2 e⁻
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              1ª relação
            </span>

            <strong>
              {sistema.relacaoPrimeiraEtapa}
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              2ª relação
            </span>

            <strong>
              {sistema.relacaoSegundaEtapa}
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              Relação geral
            </span>

            <strong>
              {sistema.relacaoGlobal}
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              Igualdade geral
            </span>

            <strong>
              {sistema.igualdadeMolsGlobal}
            </strong>
          </div>
        </div>

        <div className="reactionDetailsStack">
          <div className="reactionWideCard">
            <span>
              Igualdade de mols — geração de I₃⁻
            </span>

            <strong>
              {sistema.igualdadeMolsPrimeiraEtapa}
            </strong>
          </div>

          <div className="reactionWideCard">
            <span>
              Igualdade de mols — titulação
            </span>

            <strong>
              {sistema.igualdadeMolsSegundaEtapa}
            </strong>
          </div>

          <div className="reactionWideCard">
            <span>
              Agentes na etapa de geração de I₃⁻
            </span>

            <strong>
              Oxidante:{" "}
              {sistema.agenteOxidantePrimeiraEtapa}
              {" → "}
              Redutor:{" "}
              {sistema.agenteRedutorPrimeiraEtapa}
            </strong>
          </div>

          <div className="reactionWideCard">
            <span>
              Agentes na titulação do iodo
            </span>

            <strong>
              Oxidante: I₃⁻ → Redutor: S₂O₃²⁻
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}


function CurvaIodometria({
  resultado,
}: {
  resultado: ResultadoCurvaIodometria;
}) {
  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel">
        <span className="eyebrow">Curva E × V</span>
        <h2>Curva potenciométrica da iodometria</h2>

        <p>
          Em todos os volumes, o potencial é obtido pela resolução simultânea
          das equações de Nernst dos pares I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻,
          respeitando os balanços de matéria da reação. Assim, a curva passa
          continuamente pela região do ponto de equivalência.
        </p>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Volume PE</span>
            <strong>{formatarNumero(resultado.volumeEquivalenciaMl, 3)} mL</strong>
          </div>

          <div className="resultCard">
            <span>Potencial no PE</span>
            <strong>{formatarNumero(resultado.potencialEquivalenciaV, 3)} V</strong>
          </div>

          <div className="resultCard">
            <span>Triiodeto gerado (I₃⁻)</span>
            <strong>{formatarCientifico(resultado.molI3Gerado)} mol</strong>
          </div>

          <div className="resultCard">
            <span>S₂O₃²⁻ no PE</span>
            <strong>{formatarCientifico(resultado.molTiossulfatoEquivalencia)} mol</strong>
          </div>
        </div>
      </div>

      <div className="resultsPanel">
  <ConsultaCurvaOxirreducao
    modo="iodometria"
    resultado={resultado}
  />
</div>

      <div className="explanationBox">
        <p>
          A concentração mínima de KI é calculada automaticamente pela
          estequiometria da geração de I₃⁻. A curva é resolvida pelo equilíbrio
          simultâneo dos pares I₃⁻/I⁻ e S₄O₆²⁻/S₂O₃²⁻, com balanços de matéria
          em cada volume. O excesso operacional de KI não é presumido; a
          quantidade experimental utilizada pode alterar as atividades e o
          potencial medido. Os potenciais padrão são referências a 25 °C.
        </p>
      </div>
    </section>
  );
}


function TempoRealIodometria({
  resultadoBase,
  resultadoDenso,
}: {
  resultadoBase: ResultadoCurvaIodometria;
  resultadoDenso: ResultadoCurvaIodometria;
}) {
  const derivadas = useMemo(
    () =>
      calcularDerivadasIodometria(
        resultadoDenso.pontosValidos
      ),
    [resultadoDenso]
  );

  const volumePF =
    derivadas.volumePFPrimeiraDerivadaMl;

  const volumePE =
    resultadoBase.volumeEquivalenciaMl;

  const [volumeAtual, setVolumeAtual] = useState(0);
  const [volumeManual, setVolumeManual] = useState("");
  const [pontos, setPontos] = useState<PontoIodometria[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setVolumeAtual(0);
    setVolumeManual("");
    setPontos([]);
    setErro("");
  }, [resultadoBase]);

  const pontoAtual =
    pontos.length > 0
      ? pontos[pontos.length - 1]
      : null;

  function irPara(volume: number) {
    const ponto = calcularPontoIodometria({
      entrada: resultadoBase.entrada,
      volumeAdicionadoMl: volume,
    });

    setVolumeAtual(volume);
    setPontos((atuais) => [
      ...atuais,
      ponto,
    ]);
    setErro("");
  }

  function adicionar(incremento: number) {
    if (
      !Number.isFinite(incremento) ||
      incremento <= 0
    ) {
      setErro("Informe um volume válido.");
      return;
    }

    irPara(volumeAtual + incremento);
  }

  function adicionarManual() {
    const incremento = converterNumero(volumeManual);

    if (
      !Number.isFinite(incremento) ||
      incremento <= 0
    ) {
      setErro("Informe um volume manual positivo e válido.");
      return;
    }

    adicionar(incremento);
    setVolumeManual("");
  }

  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel liveIntroPanel">
        <span className="eyebrow">Simulação em tempo real</span>
        <h2>Adição gradual de Na₂S₂O₃</h2>
        <p>
          Acompanhe o consumo de I₃⁻, a formação de I⁻ e S₄O₆²⁻ e o aparecimento do excesso de S₂O₃²⁻ após o PE.
        </p>
      </div>

      <div className="liveSimulationGrid">
        <div className="resultsPanel liveControlsPanel">
          <h2>Controles</h2>

          <div className="liveVolumeBox">
            <span>Volume atual</span>
            <strong>{formatarNumero(volumeAtual, 2)} mL</strong>
          </div>

          <div className="liveButtonGrid">
            {[0.05, 0.1, 0.5, 1, 5].map(
              (incremento) => (
                <button
                  key={incremento}
                  type="button"
                  onClick={() => adicionar(incremento)}
                >
                  +{formatarNumero(incremento, 2)} mL
                </button>
              )
            )}
          </div>

          <div className="liveManualBox">
            <label>
              Adicionar volume personalizado (mL)
              <input
                value={volumeManual}
                onChange={(event) =>
                  setVolumeManual(event.target.value)
                }
                inputMode="decimal"
                placeholder="Ex.: 2,50"
              />
            </label>

            {erro && (
              <div className="oxirreducaoError">
                {erro}
              </div>
            )}

            <button
              type="button"
              className="primaryButton"
              onClick={adicionarManual}
            >
              Adicionar
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => irPara(volumePF)}
            >
              Ir para PF
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => irPara(volumePE)}
            >
              Ir para PE
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => {
                setVolumeAtual(0);
                setVolumeManual("");
                setPontos([]);
                setErro("");
              }}
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="resultsPanel liveChartPanel">
  <SimulacaoTempoRealIodometriaChart
    curva={resultadoBase}
    pontosAdicionados={pontos}
  />
</div>
      </div>

      <div className="resultsPanel">
        <h2>Ponto atual</h2>
        <div className="resultGrid">
          <div className="resultCard">
            <span>Volume Na₂S₂O₃</span>
            <strong>{pontoAtual ? `${formatarNumero(pontoAtual.volumeAdicionadoMl, 3)} mL` : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>Potencial E</span>
            <strong>{pontoAtual ? `${formatarNumero(pontoAtual.potencialV, 3)} V` : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[I⁻]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoIodetoMolL) : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[I₃⁻]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoI3MolL) : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[S₂O₃²⁻]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoTiossulfatoMolL) : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[S₄O₆²⁻]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoTetrationatoMolL) : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>Região</span>
            <strong>{pontoAtual ? nomeRegiao(pontoAtual) : "-"}</strong>
          </div>
        </div>
      </div>

      <div className="resultsPanel">
        <h2>Pontos adicionados</h2>
        {pontos.length === 0 ? (
          <div className="explanationBox">
            <p>Nenhum ponto adicionado ainda.</p>
          </div>
        ) : (
          <div className="curveTableScroll">
            <table className="curve-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Volume</th>
                  <th>E (V)</th>
                  <th>[I⁻]</th>
                  <th>[I₃⁻]</th>
                  <th>[S₂O₃²⁻]</th>
                  <th>[S₄O₆²⁻]</th>
                  <th>Região</th>
                </tr>
              </thead>
              <tbody>
                {pontos.map((ponto, index) => (
                  <tr key={`${ponto.volumeAdicionadoMl}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{formatarNumero(ponto.volumeAdicionadoMl, 3)} mL</td>
                    <td>{formatarNumero(ponto.potencialV, 3)}</td>
                    <td>{formatarCientifico(ponto.concentracaoIodetoMolL)}</td>
                    <td>{formatarCientifico(ponto.concentracaoI3MolL)}</td>
                    <td>{formatarCientifico(ponto.concentracaoTiossulfatoMolL)}</td>
                    <td>{formatarCientifico(ponto.concentracaoTetrationatoMolL)}</td>
                    <td>{nomeRegiao(ponto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}


function formatarComSinalIodometria(
  valor: number,
  casas = 3
) {
  return `${
    valor > 0
      ? "+"
      : ""
  }${formatarNumero(
    valor,
    casas
  )}`;
}


/* =========================================================
 * ERRO EXPERIMENTAL — IODOMETRIA
 * ======================================================= */

function ErroExperimentalIodometria({
  resultadoBase,
  resultadoDenso,
}: {
  resultadoBase:
    ResultadoCurvaIodometria;

  resultadoDenso:
    ResultadoCurvaIodometria;
}) {
  const derivadas =
    useMemo(
      () =>
        calcularDerivadasIodometria(
          resultadoDenso
            .pontosValidos
        ),
      [
        resultadoDenso,
      ]
    );


  const sistema =
    resultadoBase
      .sistema;


  const volumePE =
    resultadoBase
      .volumeEquivalenciaMl;


  const volumePFTeorico =
    derivadas
      .volumePFPrimeiraDerivadaMl;


  /*
   * =======================================================
   * ERRO TEÓRICO
   * =======================================================
   */

  const erroTeoricoAbsoluto =
    volumePFTeorico -
    volumePE;


  const erroTeoricoRelativo =
    volumePE !== 0
      ? (
          erroTeoricoAbsoluto /
          volumePE
        ) *
        100
      : 0;


  /*
   * =======================================================
   * ESTADOS DA INTERFACE
   * =======================================================
   */

  const [
    volumeExperimentalDigitado,
    setVolumeExperimentalDigitado,
  ] =
    useState(
      formatarNumero(
        volumePFTeorico,
        3
      )
    );


  const [
    volumeExperimental,
    setVolumeExperimental,
  ] =
    useState(
      volumePFTeorico
    );


  const [
    toleranciaDigitada,
    setToleranciaDigitada,
  ] =
    useState(
      "0,10"
    );


  const [
    tolerancia,
    setTolerancia,
  ] =
    useState(
      0.1
    );


  const [
    erroEntrada,
    setErroEntrada,
  ] =
    useState(
      ""
    );


  useEffect(
    () => {
      setVolumeExperimental(
        volumePFTeorico
      );


      setVolumeExperimentalDigitado(
        formatarNumero(
          volumePFTeorico,
          3
        )
      );


      setToleranciaDigitada(
        "0,10"
      );


      setTolerancia(
        0.1
      );


      setErroEntrada(
        ""
      );
    },
    [
      volumePFTeorico,
      resultadoBase,
    ]
  );


  const limiteVolume =
    Math.max(
      resultadoBase
        .volumeMaximoMl,

      volumePE,

      volumePFTeorico
    );


  /*
   * =======================================================
   * ERRO EXPERIMENTAL TOTAL EM RELAÇÃO AO PE
   *
   * ((VPF experimental - VPE) / VPE) × 100
   * =======================================================
   */

  const erroExperimentalAbsoluto =
    volumeExperimental -
    volumePE;


  const erroExperimentalRelativo =
    volumePE !== 0
      ? (
          erroExperimentalAbsoluto /
          volumePE
        ) *
        100
      : 0;


  const erroExperimentalRelativoModulo =
    Math.abs(
      erroExperimentalRelativo
    );


  /*
   * =======================================================
   * DESVIO OPERACIONAL EM RELAÇÃO AO PF TEÓRICO
   * =======================================================
   */

  const desvioPFAbsoluto =
    volumeExperimental -
    volumePFTeorico;


  const desvioPFRelativo =
    volumePFTeorico !== 0
      ? (
          desvioPFAbsoluto /
          volumePFTeorico
        ) *
        100
      : 0;


  const dentroTolerancia =
    erroExperimentalRelativoModulo <=
    tolerancia;


  const coincideComPE =
    Math.abs(
      erroExperimentalAbsoluto
    ) <
    0.0005;


  const coincideComPF =
    Math.abs(
      desvioPFAbsoluto
    ) <
    0.0005;


  /*
   * =======================================================
   * ESTADO QUÍMICO NO PF EXPERIMENTAL
   * =======================================================
   */

  const pontoExperimental =
    calcularPontoIodometria({
      entrada:
        resultadoBase
          .entrada,

      volumeAdicionadoMl:
        volumeExperimental,
    });


  const classificacaoPE =
    coincideComPE
      ? "Coincidente com o PE"
      : erroExperimentalAbsoluto <
          0
        ? "Antes do PE"
        : "Após o PE";


  const classificacaoPF =
    coincideComPF
      ? "Coincidente com o PF teórico"
      : desvioPFAbsoluto <
          0
        ? "Antes do PF teórico"
        : "Após o PF teórico";


  const impactoAnalitico =
    coincideComPE
      ? "Sem tendência de erro volumétrico"
      : erroExperimentalAbsoluto <
          0
        ? "Tendência de subestimação"
        : "Tendência de superestimação";


  const fatorResultado =
    volumePE !== 0
      ? volumeExperimental /
        volumePE
      : 1;


  function analisarErroExperimental(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const volumeNumerico =
      converterNumero(
        volumeExperimentalDigitado
      );


    const toleranciaNumerica =
      converterNumero(
        toleranciaDigitada
      );


    if (
      !Number.isFinite(
        volumeNumerico
      ) ||
      volumeNumerico <= 0
    ) {
      setErroEntrada(
        "Informe um PF experimental maior que 0 mL para aplicar a equação de Nernst."
      );

      return;
    }


    if (
      volumeNumerico >
      limiteVolume
    ) {
      setErroEntrada(
        `O PF experimental deve estar entre 0 e ${formatarNumero(
          limiteVolume,
          2
        )} mL para esta curva.`
      );

      return;
    }


    if (
      !Number.isFinite(
        toleranciaNumerica
      ) ||
      toleranciaNumerica < 0
    ) {
      setErroEntrada(
        "Informe uma tolerância válida."
      );

      return;
    }


    setVolumeExperimental(
      volumeNumerico
    );


    setTolerancia(
      toleranciaNumerica
    );


    setErroEntrada(
      ""
    );
  }


  function usarPFTeorico() {
    setVolumeExperimental(
      volumePFTeorico
    );


    setVolumeExperimentalDigitado(
      formatarNumero(
        volumePFTeorico,
        3
      )
    );


    setErroEntrada(
      ""
    );
  }


  function usarPE() {
    setVolumeExperimental(
      volumePE
    );


    setVolumeExperimentalDigitado(
      formatarNumero(
        volumePE,
        3
      )
    );


    setErroEntrada(
      ""
    );
  }


  return (
    <section className="precipitacaoErrorExpanded">
      {/* ===================================================
       * CABEÇALHO
       * ================================================= */}

      <header className="precipitacaoErrorExpandedIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Erro experimental
          </span>

          <h5>
            PE × PF teórico × PF experimental
          </h5>

          <p>
            Compare o ponto final observado
            experimentalmente com o ponto de equivalência
            estequiométrico e com o PF teórico determinado
            pelas derivadas da curva iodométrica.
          </p>
        </div>
      </header>


      {/* ===================================================
       * CONTEXTO
       * ================================================= */}

      <section className="precipitacaoErrorContext">
        <div className="precipitacaoErrorContextHeading">
          <span className="precipitacaoSectionLabel">
            Contexto da análise
          </span>

          <h6>
            Sistema iodométrico avaliado
          </h6>
        </div>


        <div className="precipitacaoErrorContextGrid">
          <article>
            <span>
              Analito
            </span>

            <strong>
              {sistema.formulaAnalito}
            </strong>
          </article>


          <article>
            <span>
              Titulante
            </span>

            <strong>
              Na₂S₂O₃
            </strong>
          </article>


          <article>
            <span>
              PE teórico
            </span>

            <strong>
              {formatarNumero(
                volumePE,
                3
              )}{" "}
              mL
            </strong>
          </article>


          <article>
            <span>
              PF teórico
            </span>

            <strong>
              {formatarNumero(
                volumePFTeorico,
                3
              )}{" "}
              mL
            </strong>
          </article>


          <article>
            <span>
              Erro relativo teórico
            </span>

            <strong>
              {formatarComSinalIodometria(
                erroTeoricoRelativo,
                4
              )}
              %
            </strong>
          </article>
        </div>
      </section>


      {/* ===================================================
       * CONTROLES + GRÁFICO
       * ================================================= */}

      <div className="precipitacaoErrorWorkspace">
        <aside className="precipitacaoErrorControls">
          <span className="precipitacaoSectionLabel">
            Determinação experimental
          </span>

          <h6>
            Informe o PF observado
          </h6>

          <p>
            Digite o volume em que a titulação
            iodométrica foi considerada encerrada
            experimentalmente.
          </p>


          <form
            onSubmit={
              analisarErroExperimental
            }
            className="precipitacaoErrorForm"
          >
            <label htmlFor="volumeExperimentalIodometria">
              PF experimental
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="volumeExperimentalIodometria"
                type="text"
                inputMode="decimal"
                value={
                  volumeExperimentalDigitado
                }
                onChange={(
                  event
                ) => {
                  setVolumeExperimentalDigitado(
                    event.target.value
                  );

                  setErroEntrada(
                    ""
                  );
                }}
              />

              <span>
                mL
              </span>
            </div>


            <label htmlFor="toleranciaExperimentalIodometria">
              Tolerância aceita
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="toleranciaExperimentalIodometria"
                type="text"
                inputMode="decimal"
                value={
                  toleranciaDigitada
                }
                onChange={(
                  event
                ) => {
                  setToleranciaDigitada(
                    event.target.value
                  );

                  setErroEntrada(
                    ""
                  );
                }}
              />

              <span>
                %
              </span>
            </div>


            {erroEntrada && (
              <p className="precipitacaoErrorInputMessage">
                {erroEntrada}
              </p>
            )}


            <button
              type="submit"
              className="precipitacaoErrorPrimaryButton"
            >
              Analisar erro experimental
            </button>
          </form>


          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={
              usarPFTeorico
            }
          >
            Usar o PF teórico
          </button>


          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={
              usarPE
            }
          >
            Usar o PE teórico
          </button>


          <div className="precipitacaoErrorControlReference">
            <span>
              Faixa analisada
            </span>

            <strong>
              0 a{" "}
              {formatarNumero(
                limiteVolume,
                2
              )}{" "}
              mL
            </strong>
          </div>
        </aside>


        <div className="precipitacaoErrorGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Comparação visual
              </span>

              <h6>
                PE × PF teórico × PF experimental
              </h6>

              <p>
                A curva mostra simultaneamente o ponto de
                equivalência, o ponto final matemático e o
                volume observado experimentalmente.
              </p>
            </div>
          </header>


          <GraficoErroExperimentalIodometria
            curva={
              resultadoBase
            }
            volumePE={
              volumePE
            }
            volumePFTeorico={
              volumePFTeorico
            }
            volumeExperimental={
              volumeExperimental
            }
          />


          <footer>
            <span>
              PE:{" "}
              <strong>
                {formatarNumero(
                  volumePE,
                  3
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF teórico:{" "}
              <strong>
                {formatarNumero(
                  volumePFTeorico,
                  3
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF experimental:{" "}
              <strong>
                {formatarNumero(
                  volumeExperimental,
                  3
                )}{" "}
                mL
              </strong>
            </span>
          </footer>
        </div>
      </div>


      {/* ===================================================
       * MÉTRICAS
       * ================================================= */}

      <section className="precipitacaoErrorMetrics">
        <article>
          <span>
            PE teórico
          </span>

          <strong>
            {formatarNumero(
              volumePE,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Estequiometria
          </small>
        </article>


        <article>
          <span>
            PF teórico
          </span>

          <strong>
            {formatarNumero(
              volumePFTeorico,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Máximo de |ΔE/ΔV|
          </small>
        </article>


        <article>
          <span>
            PF experimental
          </span>

          <strong>
            {formatarNumero(
              volumeExperimental,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Valor observado
          </small>
        </article>


        <article>
          <span>
            Erro absoluto
          </span>

          <strong>
            {formatarComSinalIodometria(
              erroExperimentalAbsoluto,
              3
            )}{" "}
            mL
          </strong>

          <small>
            VPF(exp) − VPE
          </small>
        </article>


        <article>
          <span>
            Erro relativo
          </span>

          <strong>
            {formatarComSinalIodometria(
              erroExperimentalRelativo,
              4
            )}
            %
          </strong>

          <small>
            ((VPF − VPE) / VPE) × 100
          </small>
        </article>


        <article>
          <span>
            Tolerância
          </span>

          <strong>
            {dentroTolerancia
              ? "Dentro da faixa"
              : "Fora da faixa"}
          </strong>

          <small>
            Limite de ±
            {formatarNumero(
              tolerancia,
              2
            )}
            %
          </small>
        </article>
      </section>


      {/* ===================================================
       * INTERPRETAÇÃO
       * ================================================= */}

      <div className="precipitacaoErrorInterpretationGrid">
        <section className="precipitacaoErrorChemicalState">
          <header>
            <span className="precipitacaoSectionLabel">
              Estado do sistema
            </span>

            <h6>
              Condição no PF experimental
            </h6>
          </header>


          <div className="precipitacaoErrorChemicalValues">
            <article>
              <span>
                Região
              </span>

              <strong>
                {pontoExperimental.regiao ===
                "antes_pe"
                  ? "Antes do PE"
                  : pontoExperimental.regiao ===
                      "pe"
                    ? "PE"
                    : "Após o PE"}
              </strong>
            </article>


            <article>
              <span>
                Potencial
              </span>

              <strong>
                {formatarNumero(
                  pontoExperimental
                    .potencialV,
                  4
                )}{" "}
                V
              </strong>
            </article>


            <article>
              <span>
                Posição vs. PE
              </span>

              <strong>
                {classificacaoPE}
              </strong>
            </article>


            <article>
              <span>
                Posição vs. PF
              </span>

              <strong>
                {classificacaoPF}
              </strong>
            </article>
          </div>


          <div className="precipitacaoErrorChemicalExplanation">
            <strong>
              Desvio em relação ao PF teórico
            </strong>

            <p>
              O PF experimental está{" "}
              <strong>
                {formatarComSinalIodometria(
                  desvioPFAbsoluto,
                  3
                )}{" "}
                mL
              </strong>{" "}
              em relação ao PF matemático, correspondendo
              a{" "}
              <strong>
                {formatarComSinalIodometria(
                  desvioPFRelativo,
                  4
                )}
                %
              </strong>
              .
            </p>
          </div>
        </section>


        <section className="precipitacaoErrorAnalyticalImpact">
          <header>
            <span className="precipitacaoSectionLabel">
              Impacto analítico
            </span>

            <h6>
              Consequência do volume observado
            </h6>
          </header>


          <div className="precipitacaoErrorImpactMain">
            <span>
              Fator relativo do resultado
            </span>

            <strong>
              {formatarNumero(
                fatorResultado,
                5
              )}
            </strong>

            <small>
              VPF experimental ÷ VPE
            </small>
          </div>


          <div className="precipitacaoErrorImpactDirection">
            <span>
              Tendência
            </span>

            <strong>
              {impactoAnalitico}
            </strong>
          </div>


          <div
            className={
              dentroTolerancia
                ? "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisOk"
                : "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisAlert"
            }
          >
            <span>
              Avaliação da tolerância
            </span>

            <strong>
              {dentroTolerancia
                ? "Erro experimental aceitável para a tolerância informada."
                : "Erro experimental acima da tolerância informada."}
            </strong>
          </div>


          <p>
            O erro total compara o PF experimental com o
            PE estequiométrico. O desvio operacional
            compara o PF experimental diretamente com o
            PF teórico determinado pela curva.
          </p>
        </section>
      </div>


      {/* ===================================================
       * DIAGNÓSTICO FINAL
       * ================================================= */}

      <section className="precipitacaoErrorFinalDiagnosis">
        <span className="precipitacaoSectionLabel">
          Diagnóstico final
        </span>

        <h6>
          Interpretação do erro experimental
        </h6>

        <p>
          O PE teórico é{" "}
          <strong>
            {formatarNumero(
              volumePE,
              3
            )}{" "}
            mL
          </strong>
          , enquanto o PF teórico calculado pelas
          derivadas é{" "}
          <strong>
            {formatarNumero(
              volumePFTeorico,
              3
            )}{" "}
            mL
          </strong>
          . O PF experimental informado foi{" "}
          <strong>
            {formatarNumero(
              volumeExperimental,
              3
            )}{" "}
            mL
          </strong>
          , produzindo erro relativo de{" "}
          <strong>
            {formatarComSinalIodometria(
              erroExperimentalRelativo,
              4
            )}
            %
          </strong>
          . Em relação ao PF teórico, o desvio
          operacional foi de{" "}
          <strong>
            {formatarComSinalIodometria(
              desvioPFAbsoluto,
              3
            )}{" "}
            mL
          </strong>
          .
        </p>
      </section>
    </section>
  );
}


/* =========================================================
 * GRÁFICO — ERRO EXPERIMENTAL IODOMETRIA
 * ======================================================= */

function GraficoErroExperimentalIodometria({
  curva,
  volumePE,
  volumePFTeorico,
  volumeExperimental,
}: {
  curva:
    ResultadoCurvaIodometria;

  volumePE:
    number;

  volumePFTeorico:
    number;

  volumeExperimental:
    number;
}) {
  const largura =
    900;

  const altura =
    440;


  const margem = {
    top:
      60,

    right:
      35,

    bottom:
      70,

    left:
      70,
  };


  const pontos =
    curva
      .pontosValidos
      .filter(
        (
          ponto
        ) =>
          Number.isFinite(
            ponto.potencialV
          )
      );


  if (
    pontos.length === 0
  ) {
    return (
      <div className="oxirreducaoEmptyChart">
        Não foi possível gerar a curva iodométrica.
      </div>
    );
  }


  const pontoExperimental =
    calcularPontoIodometria({
      entrada:
        curva.entrada,

      volumeAdicionadoMl:
        volumeExperimental,
    });


  const xMax =
    Math.max(
      curva.volumeMaximoMl,
      volumeExperimental,
      volumePE,
      volumePFTeorico,
      1
    );


  const potenciais =
    pontos.map(
      (
        ponto
      ) =>
        ponto.potencialV
    );


  if (
    Number.isFinite(
      pontoExperimental.potencialV
    )
  ) {
    potenciais.push(
      pontoExperimental.potencialV
    );
  }


  const yMinBruto =
    Math.min(
      ...potenciais
    );


  const yMaxBruto =
    Math.max(
      ...potenciais
    );


  const amplitude =
    Math.max(
      yMaxBruto -
        yMinBruto,
      0.1
    );


  const yMin =
    yMinBruto -
    amplitude *
      0.08;


  const yMax =
    yMaxBruto +
    amplitude *
      0.08;


  const plotWidth =
    largura -
    margem.left -
    margem.right;


  const plotHeight =
    altura -
    margem.top -
    margem.bottom;


  const x = (
    volume:
      number
  ) =>
    margem.left +
    (
      volume /
      xMax
    ) *
      plotWidth;


  const y = (
    potencial:
      number
  ) =>
    margem.top +
    (
      (
        yMax -
        potencial
      ) /
      (
        yMax -
        yMin
      )
    ) *
      plotHeight;


  const polyline =
    pontos
      .map(
        (
          ponto
        ) =>
          `${x(
            ponto.volumeAdicionadoMl
          )},${y(
            ponto.potencialV
          )}`
      )
      .join(
        " "
      );


  const ticksX =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        index
      ) =>
        (
          xMax /
          5
        ) *
        index
    );


  const ticksY =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        index
      ) =>
        yMin +
        (
          (
            yMax -
            yMin
          ) /
          5
        ) *
          index
    );


  /*
   * =======================================================
   * FAIXA VISUAL DO ERRO
   *
   * Mesmo princípio utilizado na permanganometria:
   * região compreendida entre o PF experimental e o PE.
   * =======================================================
   */

  const inicioFaixa =
    Math.min(
      volumePE,
      volumeExperimental
    );


  const fimFaixa =
    Math.max(
      volumePE,
      volumeExperimental
    );


  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Comparação entre PE, PF teórico e PF experimental na iodometria"
    >
      {/* ===================================================
       * GRADE HORIZONTAL
       * ================================================= */}

      {ticksY.map(
        (
          tick,
          index
        ) => (
          <g
            key={`y-${index}`}
          >
            <line
              x1={
                margem.left
              }
              x2={
                largura -
                margem.right
              }
              y1={
                y(
                  tick
                )
              }
              y2={
                y(
                  tick
                )
              }
              className="erroGraficoGrade"
            />

            <text
              x={
                margem.left -
                12
              }
              y={
                y(
                  tick
                ) +
                4
              }
              textAnchor="end"
              className="erroGraficoTexto"
            >
              {formatarNumero(
                tick,
                2
              )}
            </text>
          </g>
        )
      )}


      {/* ===================================================
       * GRADE VERTICAL
       * ================================================= */}

      {ticksX.map(
        (
          tick,
          index
        ) => (
          <g
            key={`x-${index}`}
          >
            <line
              x1={
                x(
                  tick
                )
              }
              x2={
                x(
                  tick
                )
              }
              y1={
                margem.top
              }
              y2={
                altura -
                margem.bottom
              }
              className="erroGraficoGrade"
            />

            <text
              x={
                x(
                  tick
                )
              }
              y={
                altura -
                margem.bottom +
                25
              }
              textAnchor="middle"
              className="erroGraficoTexto"
            >
              {formatarNumero(
                tick,
                1
              )}
            </text>
          </g>
        )
      )}


      {/* ===================================================
       * ÁREA DO ERRO EXPERIMENTAL
       * ================================================= */}

      <rect
        x={
          x(
            inicioFaixa
          )
        }
        y={
          margem.top
        }
        width={
          Math.max(
            x(
              fimFaixa
            ) -
              x(
                inicioFaixa
              ),
            1
          )
        }
        height={
          plotHeight
        }
        className="erroGraficoFaixa"
      />


      {/* ===================================================
       * CURVA TEÓRICA
       * ================================================= */}

      <polyline
        points={
          polyline
        }
        className="erroGraficoCurva"
      />


      {/* ===================================================
       * PE
       * ================================================= */}

      <line
        x1={
          x(
            volumePE
          )
        }
        x2={
          x(
            volumePE
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        className="erroGraficoPE"
      />


      {/* ===================================================
       * PF TEÓRICO
       * ================================================= */}

      <line
        x1={
          x(
            volumePFTeorico
          )
        }
        x2={
          x(
            volumePFTeorico
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        className="erroGraficoPF"
      />


      {/* ===================================================
       * PF EXPERIMENTAL
       * ================================================= */}

      <line
        x1={
          x(
            volumeExperimental
          )
        }
        x2={
          x(
            volumeExperimental
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        stroke="#991b1b"
        strokeWidth="2"
        strokeDasharray="3 4"
      />


      {/* ===================================================
       * RÓTULOS
       * ================================================= */}

      <text
        x={
          x(
            volumePE
          ) +
          6
        }
        y="24"
        className="erroGraficoRotulo"
      >
        PE
      </text>


      <text
        x={
          x(
            volumePFTeorico
          ) +
          6
        }
        y="40"
        className="erroGraficoRotulo"
      >
        PF teórico
      </text>


      <text
        x={
          x(
            volumeExperimental
          ) +
          6
        }
        y="56"
        fill="#991b1b"
        fontSize="13"
        fontWeight="750"
      >
        PF experimental
      </text>


      {/* ===================================================
       * MARCADOR DO PF EXPERIMENTAL
       * ================================================= */}

      <circle
        cx={
          x(
            volumeExperimental
          )
        }
        cy={
          y(
            pontoExperimental.potencialV
          )
        }
        r="6"
        className="erroGraficoMarcador"
      />


      {/* ===================================================
       * EIXOS
       * ================================================= */}

      <text
        x={
          margem.left +
          plotWidth /
            2
        }
        y={
          altura -
            16
        }
        textAnchor="middle"
        className="erroGraficoRotulo"
      >
        Volume de Na₂S₂O₃ adicionado (mL)
      </text>


      <text
        x="20"
        y={
          margem.top +
          plotHeight /
            2
        }
        textAnchor="middle"
        transform={`rotate(-90 20 ${
          margem.top +
          plotHeight /
            2
        })`}
        className="erroGraficoRotulo"
      >
        Potencial E (V)
      </text>
    </svg>
  );
}

const TEMPERATURA_FIXA_IODOMETRIA_C = 25;

export default function Iodometria() {
  const [
    sistemaAtivo,
    setSistemaAtivo,
  ] = useState<SistemaIodometriaId>(
    "cloro-ativo"
  );

  const [abaAtiva, setAbaAtiva] =
    useState<AbaIodometria>(
      "visao-geral"
    );

  const [concentracaoAnalito, setConcentracaoAnalito] = useState("");

  const [volumeAmostra, setVolumeAmostra] = useState("");

  const [concentracaoTios, setConcentracaoTios] = useState("");

  const [resultado, setResultado] =
    useState<ResultadoCurvaIodometria | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [jaCalculou, setJaCalculou] = useState(false);
  const [dadosAlterados, setDadosAlterados] = useState(false);

  const sistema =
    buscarSistemaIodometria(
      sistemaAtivo
    );

  const entradaReferencia = entradaPadraoIodometria(sistemaAtivo);

  function limparCampos() {
    setConcentracaoAnalito("");
    setVolumeAmostra("");
    setConcentracaoTios("");
  }

  function alterarSistema(
    id: SistemaIodometriaId
  ) {
    setSistemaAtivo(id);
    setAbaAtiva("visao-geral");
    limparCampos();
    setResultado(null);
    setMensagem("");
    setErro("");
    setJaCalculou(false);
    setDadosAlterados(false);
  }

  function calcular(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const camposObrigatorios = [
      concentracaoAnalito,
      volumeAmostra,
      concentracaoTios,
    ];

    const entradaCompleta = camposObrigatorios.every((valor) => {
      const numero = converterNumero(valor);
      return valor.trim() !== "" && Number.isFinite(numero) && numero > 0;
    });

    if (!entradaCompleta) {
      setMensagem("");
      setErro("Preencha todos os campos com valores numéricos positivos antes de calcular o sistema.");
      return;
    }

    const entrada: EntradaIodometria = {
      sistemaId: sistemaAtivo,
      concentracaoAnalitoMolL:
        converterNumero(
          concentracaoAnalito
        ),
      volumeAmostraMl:
        converterNumero(
          volumeAmostra
        ),
      concentracaoTiossulfatoMolL:
        converterNumero(
          concentracaoTios
        ),
      temperaturaC: TEMPERATURA_FIXA_IODOMETRIA_C,
    };

    try {
      const novoResultado =
        gerarCurvaIodometria({
          entrada,
        });

      setResultado(novoResultado);
      setErro("");
      setMensagem(
        "Sistema iodométrico calculado com sucesso."
      );
      setJaCalculou(true);
      setDadosAlterados(false);
    } catch (error) {
      setMensagem("");
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o sistema iodométrico."
      );
    }
  }

  const resultadoDenso = useMemo(
    () => {
      if (!resultado) {
        return null;
      }

      const volumePE =
        resultado.volumeEquivalenciaMl;

      return gerarCurvaIodometria({
        entrada: resultado.entrada,
        configuracao: {
          volumeMaximoMl:
            resultado.volumeMaximoMl,
          passoBaseMl: Math.max(
            volumePE / 100,
            0.02
          ),
          passoProximoPEMl: Math.max(
            volumePE / 10000,
            0.0005
          ),
          faixaDensaFracao: 0.025,
        },
      });
    },
    [resultado]
  );

  const derivadas = useMemo(
    () =>
      resultado
        ? calcularDerivadasIodometria(
            resultado.pontosValidos
          )
        : null,
    [resultado]
  );

  const oxigenioMgL =
    sistemaAtivo === "oxigenio-dissolvido" && resultado
      ? resultado.entrada.concentracaoAnalitoMolL *
        32 *
        1000
      : null;

  return (
    <>
      <section className="container calculatorSection">
        <SeletorSistemaIodometria
          sistemaAtivo={sistemaAtivo}
          onChange={alterarSistema}
        />

        <div className="oxirreducaoSelectedSystem">
          <div>
            <span>Sistema selecionado</span>
            <strong>{sistema.nomeCompleto}</strong>
          </div>

          <div>
            <span>Titulante</span>
            <strong>Na₂S₂O₃</strong>
          </div>

          <div>
            <span>Indicador</span>
            <strong>Amido</strong>
          </div>
        </div>

        <div className="oxirreducaoMainGrid">
          <form
            className="oxirreducaoForm"
            onSubmit={calcular}
            noValidate
          >
            <div className="oxirreducaoFormHeader">
              <span>Sistema experimental</span>
              <h3>Dados da iodometria</h3>
            </div>

            <label>
              Concentração de {sistema.formulaAnalito}
              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={concentracaoAnalito}
                  placeholder={`Ex.: ${numeroParaCampo(entradaReferencia.concentracaoAnalitoMolL)}`}
                  required
                  onChange={(event) => {
                    setConcentracaoAnalito(event.target.value);
                    setDadosAlterados(true);
                    setJaCalculou(false);
                    setResultado(null);
                    setMensagem("");
                    setErro("");
                  }}
                />
                <span>mol/L</span>
              </div>
            </label>

            <label>
              Volume da amostra
              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={volumeAmostra}
                  placeholder={`Ex.: ${numeroParaCampo(entradaReferencia.volumeAmostraMl)}`}
                  required
                  onChange={(event) => {
                    setVolumeAmostra(event.target.value);
                    setDadosAlterados(true);
                    setJaCalculou(false);
                    setResultado(null);
                    setMensagem("");
                    setErro("");
                  }}
                />
                <span>mL</span>
              </div>
            </label>

            <label>
              Concentração de Na₂S₂O₃
              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={concentracaoTios}
                  placeholder={`Ex.: ${numeroParaCampo(entradaReferencia.concentracaoTiossulfatoMolL)}`}
                  required
                  onChange={(event) => {
                    setConcentracaoTios(event.target.value);
                    setDadosAlterados(true);
                    setJaCalculou(false);
                    setResultado(null);
                    setMensagem("");
                    setErro("");
                  }}
                />
                <span>mol/L</span>
              </div>
            </label>

            <div className="explanationBox">
              <p>
                A concentração mínima de KI não precisa ser informada. A plataforma calcula automaticamente o limite estequiométrico a partir da concentração do analito e apresenta o resultado na Visão geral. Na prática, deve-se utilizar KI em excesso.
              </p>
            </div>

            <div
              className="oxirreducaoFixedConditions"
              aria-label="Condições fixas da iodometria"
            >
              <div
                className="oxirreducaoFixedCondition"
                style={{ gridColumn: "1 / -1" }}
              >
                <span>Temperatura</span>
                <strong>{TEMPERATURA_FIXA_IODOMETRIA_C} °C</strong>
              </div>
              <p className="oxirreducaoFixedConditionsNote">
                Condição padronizada para todos os sistemas de iodometria.
              </p>
            </div>

            {erro && (
              <div className="oxirreducaoError">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="statusMessage success">
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              className="primaryButton"
            >
              Calcular sistema redox
            </button>
          </form>

          {jaCalculou && resultado && derivadas ? (
          <div className="resultsPanel">
            <span className="eyebrow">
              Resumo calculado
            </span>
            <h2>
              Condição calculada
            </h2>

            <div className="resultGrid">
              <div className="resultCard">
                <span>Mol de analito</span>
                <strong>{formatarCientifico(resultado.molAnalitoInicial)}</strong>
                <small>mol</small>
              </div>

              <div className="resultCard">
                <span>Triiodeto gerado (I₃⁻)</span>
                <strong>{formatarCientifico(resultado.molI3Gerado)}</strong>
                <small>mol</small>
              </div>

              <div className="resultCard">
                <span>Na₂S₂O₃ no PE</span>
                <strong>{formatarCientifico(resultado.molTiossulfatoEquivalencia)}</strong>
                <small>mol</small>
              </div>

              <div className="resultCard">
                <span>Volume PE</span>
                <strong>{formatarNumero(resultado.volumeEquivalenciaMl, 3)} mL</strong>
              </div>

              <div className="resultCard">
                <span>Potencial no PE</span>
                <strong>{formatarNumero(resultado.potencialEquivalenciaV, 3)} V</strong>
              </div>

              <div className="resultCard">
                <span>PF refinado</span>
                <strong>{formatarNumero(derivadas.volumePFPrimeiraDerivadaMl, 3)} mL</strong>
              </div>

              {oxigenioMgL !== null && (
                <div className="resultCard">
                  <span>O₂ equivalente</span>
                  <strong>{formatarNumero(oxigenioMgL, 2)} mg/L</strong>
                </div>
              )}
            </div>

            
<section className="iodometriaKiSection">
  <header className="iodometriaKiHeader">
    <div>
      <span className="iodometriaKiEyebrow">
        REAGENTE AUXILIAR
      </span>

      <h3>Necessidade de iodeto de potássio (KI)</h3>

      <p>
        Limites estequiométricos calculados automaticamente
        para garantir a geração de triiodeto.
      </p>
    </div>

    <span className="iodometriaKiBadge">
      Cálculo automático
    </span>
  </header>

  <div className="iodometriaKiGrid">
    <article className="resultCard iodometriaKiCard">
      <span>Concentração mínima de KI</span>

      <strong>
        {formatarNumero(resultado.concentracaoKIMinimaMolL, 4)} mol/L
      </strong>

      <small>
        Limite estequiométrico na mistura inicial
      </small>
    </article>

    <article className="resultCard iodometriaKiCard">
      <span>Quantidade mínima de KI</span>

      <strong>
        {formatarCientifico(resultado.molKIMinimo)} mol
      </strong>

      <small>
        {formatarNumero(resultado.molKIMinimo * 1000, 3)} mmol
      </small>
    </article>
  </div>
</section>

            <div className="explanationBox">
              <p>
                {sistema.observacao} Como 1 mol de KI fornece 1 mol de I⁻, o valor exibido é o mínimo estequiométrico para a mistura inicial. Para garantir excesso de iodeto, utilize concentração superior. A concentração da solução-estoque de KI depende do volume efetivamente adicionado.
              </p>
            </div>
          </div>
          ) : (
            <div className="resultsPanel">
              <span className="eyebrow">
                Aguardando cálculo
              </span>
              <h2>Resultados da iodometria</h2>
              <p className="oxirreducaoReferenceHint">
                {dadosAlterados
                  ? "Os dados foram alterados. Clique em “Calcular sistema redox” para visualizar os resultados atualizados."
                  : "Preencha os dados da titulação e clique em “Calcular sistema redox” para visualizar os resultados."}
              </p>
            </div>
          )}
        </div>
      </section>

      {jaCalculou && resultado && resultadoDenso && derivadas && (
      <>
      <section className="container tabsSection">
        <IodometriaTabs
          abaAtiva={abaAtiva}
          onChange={setAbaAtiva}
        />
      </section>

      <section className="container calculatorSection">
        {abaAtiva === "visao-geral" && (
          <VisaoGeralIodometria
            resultado={resultado}
          />
        )}

        {abaAtiva === "semirreacoes" && (
          <SemirreacoesIodometria
            resultado={resultado}
          />
        )}

        {abaAtiva === "estequiometria" && (
          <EstequiometriaIodometria
            resultado={resultado}
          />
        )}

        {abaAtiva === "curva" && (
          <CurvaIodometria
            resultado={resultado}
          />
        )}

        {abaAtiva === "derivadas" && (
          <DerivadasIodometria
            derivadas={derivadas}
            volumeEquivalenciaMl={
              resultado.volumeEquivalenciaMl
            }
          />
        )}

        {abaAtiva === "concentracao" && (
          <EfeitoConcentracaoIodometria
            resultadoBase={resultado}
          />
        )}

        {abaAtiva === "tempo-real" && (
          <TempoRealIodometria
            resultadoBase={resultado}
            resultadoDenso={resultadoDenso}
          />
        )}

        {abaAtiva === "erro-experimental" && (
          <ErroExperimentalIodometria
            resultadoBase={resultado}
            resultadoDenso={resultadoDenso}
          />
        )}
      </section>
      </>
      )}
    </>
  );
}

