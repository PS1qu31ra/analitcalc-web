"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  gerarCurvaIodometria,
  type EntradaIodometria,
  type ResultadoCurvaIodometria,
} from "@/lib/oxirreducao/iodometria";
import GraficoComparacaoConcentracaoIodometria from "./GraficoComparacaoConcentracaoIodometria";

function converterNumero(valor: string) {
  return Number(valor.trim().replace(",", "."));
}

function formatarNumero(valor: number, casas = 4) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

function valorParaInput(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
    useGrouping: false,
  }).format(valor);
}

function formatarConcentracao(valor: number) {
  if (Math.abs(valor) > 0 && Math.abs(valor) < 0.001) {
    return new Intl.NumberFormat("pt-BR", {
      minimumSignificantDigits: 3,
      maximumSignificantDigits: 4,
    }).format(valor);
  }
  return formatarNumero(valor, 4);
}

type Props = {
  resultadoBase: ResultadoCurvaIodometria;
};

export default function EfeitoConcentracaoIodometria({ resultadoBase }: Props) {
  const entradaBase = resultadoBase.entrada;
  const rotuloAnalito = resultadoBase.sistema.formulaAnalito;
  const titulante = "Na₂S₂O₃";
  const fatorEstequiometrico = resultadoBase.sistema.molTiossulfatoPorMolAnalito;

  const [concentracaoAnalito, setConcentracaoAnalito] = useState(
    valorParaInput(entradaBase.concentracaoAnalitoMolL)
  );
  const [concentracaoTios, setConcentracaoTios] = useState(
    valorParaInput(entradaBase.concentracaoTiossulfatoMolL)
  );
  const [entradaSimulada, setEntradaSimulada] = useState<EntradaIodometria>(entradaBase);
  const [resultadoSimulado, setResultadoSimulado] =
    useState<ResultadoCurvaIodometria>(resultadoBase);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setConcentracaoAnalito(valorParaInput(resultadoBase.entrada.concentracaoAnalitoMolL));
    setConcentracaoTios(valorParaInput(resultadoBase.entrada.concentracaoTiossulfatoMolL));
    setEntradaSimulada(resultadoBase.entrada);
    setResultadoSimulado(resultadoBase);
    setErro("");
  }, [resultadoBase]);

  function aplicarFatorAnalito(fator: number) {
    const atual = converterNumero(concentracaoAnalito);
    const referencia = Number.isFinite(atual) && atual > 0
      ? atual
      : entradaBase.concentracaoAnalitoMolL;
    setConcentracaoAnalito(valorParaInput(referencia * fator));
    setErro("");
  }

  function aplicarFatorTios(fator: number) {
    const atual = converterNumero(concentracaoTios);
    const referencia = Number.isFinite(atual) && atual > 0
      ? atual
      : entradaBase.concentracaoTiossulfatoMolL;
    setConcentracaoTios(valorParaInput(referencia * fator));
    setErro("");
  }

  function aplicarSimulacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const novaConcentracaoAnalito = converterNumero(concentracaoAnalito);
      const novaConcentracaoTios = converterNumero(concentracaoTios);

      if (!Number.isFinite(novaConcentracaoAnalito) || novaConcentracaoAnalito <= 0) {
        throw new Error(`A concentração de ${rotuloAnalito} deve ser positiva.`);
      }
      if (!Number.isFinite(novaConcentracaoTios) || novaConcentracaoTios <= 0) {
        throw new Error("A concentração de Na₂S₂O₃ deve ser positiva.");
      }

      const novaEntrada: EntradaIodometria = {
        ...entradaBase,
        concentracaoAnalitoMolL: novaConcentracaoAnalito,
        concentracaoTiossulfatoMolL: novaConcentracaoTios,
      };
      const volumePEPrevisto =
        (novaConcentracaoAnalito * (entradaBase.volumeAmostraMl / 1000) * fatorEstequiometrico /
          novaConcentracaoTios) * 1000;
      const volumeMaximoMl = Math.max(
        resultadoBase.volumeMaximoMl,
        volumePEPrevisto * 1.6,
        volumePEPrevisto + 10
      );
      const novaCurva = gerarCurvaIodometria({
        entrada: novaEntrada,
        configuracao: { volumeMaximoMl },
      });

      setEntradaSimulada(novaEntrada);
      setResultadoSimulado(novaCurva);
      setErro("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar a simulação."
      );
      }
  }

  function restaurarValoresOriginais() {
    setConcentracaoAnalito(valorParaInput(entradaBase.concentracaoAnalitoMolL));
    setConcentracaoTios(valorParaInput(entradaBase.concentracaoTiossulfatoMolL));
    setEntradaSimulada(entradaBase);
    setResultadoSimulado(resultadoBase);
    setErro("");
  }

  const deltaAnalito =
    entradaSimulada.concentracaoAnalitoMolL - entradaBase.concentracaoAnalitoMolL;
  const deltaTios =
    entradaSimulada.concentracaoTiossulfatoMolL - entradaBase.concentracaoTiossulfatoMolL;
  const deltaVPE =
    resultadoSimulado.volumeEquivalenciaMl - resultadoBase.volumeEquivalenciaMl;
  const deltaEPE =
    resultadoSimulado.potencialEquivalenciaV - resultadoBase.potencialEquivalenciaV;
  const razaoOriginal =
    (fatorEstequiometrico * entradaBase.concentracaoAnalitoMolL) /
    entradaBase.concentracaoTiossulfatoMolL;
  const razaoSimulada =
    (fatorEstequiometrico * entradaSimulada.concentracaoAnalitoMolL) /
    entradaSimulada.concentracaoTiossulfatoMolL;
  const fatorVolume =
    resultadoBase.volumeEquivalenciaMl > 0
      ? resultadoSimulado.volumeEquivalenciaMl / resultadoBase.volumeEquivalenciaMl
      : 0;

  return (
    <section className="oxirreducaoTabPanel">
      <header className="oxirreducaoTabHeader">
        <span className="oxirreducaoSectionLabel">Efeito da concentração</span>
        <h3>Curva original × condição simulada</h3>
        <p>
          Altere as concentrações de {rotuloAnalito} e de {titulante}. O volume da amostra e a temperatura permanecem constantes. A necessidade mínima de KI é recalculada automaticamente em cada simulação, sem solicitar sua concentração como dado de entrada.
        </p>
      </header>

      <div className="oxirreducaoConcentracaoWorkspace">
        <form className="oxirreducaoConcentracaoEditor" onSubmit={aplicarSimulacao}>
          <header>
            <span>Nova condição</span>
            <h4>Concentrações da simulação</h4>
            <p>Digite os valores que deseja comparar com a condição original.</p>
          </header>

          <label>
            Concentração de {rotuloAnalito}
            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={concentracaoAnalito}
                onChange={(event) => setConcentracaoAnalito(event.target.value)}
              />
              <span>mol/L</span>
            </div>
            <small>Original: {formatarConcentracao(entradaBase.concentracaoAnalitoMolL)} mol/L</small>
          </label>

          <label>
            Concentração de {titulante}
            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={concentracaoTios}
                onChange={(event) => setConcentracaoTios(event.target.value)}
              />
              <span>mol/L</span>
            </div>
            <small>Original: {formatarConcentracao(entradaBase.concentracaoTiossulfatoMolL)} mol/L</small>
          </label>

          {erro && <div className="oxirreducaoError" role="alert">{erro}</div>}

          <button type="submit" className="oxirreducaoCalculateButton">
            Aplicar simulação
          </button>
          <button type="button" className="oxirreducaoConcentracaoRestore" onClick={restaurarValoresOriginais}>
            Restaurar valores originais
          </button>
        </form>

        <div className="oxirreducaoConcentracaoComparison">
          <article>
            <span>{rotuloAnalito} original</span>
            <strong>{formatarConcentracao(entradaBase.concentracaoAnalitoMolL)} mol/L</strong>
          </article>
          <article>
            <span>{rotuloAnalito} simulado</span>
            <strong>{formatarConcentracao(entradaSimulada.concentracaoAnalitoMolL)} mol/L</strong>
            <small>Δ = {formatarConcentracao(deltaAnalito)} mol/L</small>
          </article>
          <article>
            <span>{titulante} original</span>
            <strong>{formatarConcentracao(entradaBase.concentracaoTiossulfatoMolL)} mol/L</strong>
          </article>
          <article>
            <span>{titulante} simulado</span>
            <strong>{formatarConcentracao(entradaSimulada.concentracaoTiossulfatoMolL)} mol/L</strong>
            <small>Δ = {formatarConcentracao(deltaTios)} mol/L</small>
          </article>
          <article>
            <span>KI mínimo original</span>
            <strong>{formatarConcentracao(resultadoBase.concentracaoKIMinimaMolL)} mol/L</strong>
          </article>
          <article>
            <span>KI mínimo simulado</span>
            <strong>{formatarConcentracao(resultadoSimulado.concentracaoKIMinimaMolL)} mol/L</strong>
            <small>Recalculado pela estequiometria</small>
          </article>

          <div className="oxirreducaoConcentracaoQuickActions">
            <section>
              <header>
                <div>
                  <span>Analito</span>
                  <strong>{rotuloAnalito}</strong>
                </div>
                <small>Ajuste rápido</small>
              </header>
              <div className="oxirreducaoConcentracaoQuickButtons">
                <button type="button" onClick={() => aplicarFatorAnalito(2)}>×2</button>
                <button type="button" onClick={() => aplicarFatorAnalito(5)}>×5</button>
                <button type="button" onClick={() => aplicarFatorAnalito(0.5)}>÷2</button>
                <button type="button" onClick={() => aplicarFatorAnalito(0.2)}>÷5</button>
              </div>
              <p>Valor atual no campo: <strong>{concentracaoAnalito} mol/L</strong></p>
            </section>

            <section>
              <header>
                <div>
                  <span>Titulante</span>
                  <strong>{titulante}</strong>
                </div>
                <small>Ajuste rápido</small>
              </header>
              <div className="oxirreducaoConcentracaoQuickButtons">
                <button type="button" onClick={() => aplicarFatorTios(2)}>×2</button>
                <button type="button" onClick={() => aplicarFatorTios(5)}>×5</button>
                <button type="button" onClick={() => aplicarFatorTios(0.5)}>÷2</button>
                <button type="button" onClick={() => aplicarFatorTios(0.2)}>÷5</button>
              </div>
              <p>Valor atual no campo: <strong>{concentracaoTios} mol/L</strong></p>
            </section>
          </div>
        </div>
      </div>

      <div className="oxirreducaoConcentracaoResumo">
        <article>
          <span>VPE original</span>
          <strong>{formatarNumero(resultadoBase.volumeEquivalenciaMl, 3)} mL</strong>
        </article>
        <article>
          <span>VPE simulado</span>
          <strong>{formatarNumero(resultadoSimulado.volumeEquivalenciaMl, 3)} mL</strong>
          <small>ΔV = {formatarNumero(deltaVPE, 3)} mL</small>
        </article>
        <article>
          <span>EPE original</span>
          <strong>{formatarNumero(resultadoBase.potencialEquivalenciaV, 4)} V</strong>
        </article>
        <article>
          <span>EPE simulado</span>
          <strong>{formatarNumero(resultadoSimulado.potencialEquivalenciaV, 4)} V</strong>
          <small>ΔE = {formatarNumero(deltaEPE, 4)} V</small>
        </article>
      </div>

      <div className="oxirreducaoDerivativeSection">
          <header>
            <span>Comparação</span>
            <h4>Curva original × simulada</h4>
            <p>
              A linha contínua representa a condição original e a linha tracejada representa a nova condição. As linhas verticais indicam os respectivos pontos de equivalência.
            </p>
          </header>
          <div className="oxirreducaoComparacaoLegend">
            <article className="oxirreducaoComparacaoLegendItem oxirreducaoComparacaoLegendItemOriginal">
              <div className="oxirreducaoComparacaoLegendHead">
                <span className="oxirreducaoComparacaoLegendDot oxirreducaoComparacaoLegendDotOriginal" />
                <div>
                  <strong>Condição original</strong>
                  <small>PE = {formatarNumero(resultadoBase.volumeEquivalenciaMl, 3)} mL</small>
                </div>
              </div>
            </article>
            <article className="oxirreducaoComparacaoLegendItem oxirreducaoComparacaoLegendItemSimulada">
              <div className="oxirreducaoComparacaoLegendHead">
                <span className="oxirreducaoComparacaoLegendDot oxirreducaoComparacaoLegendDotSimulada" />
                <div>
                  <strong>Condição simulada</strong>
                  <small>PE = {formatarNumero(resultadoSimulado.volumeEquivalenciaMl, 3)} mL</small>
                </div>
              </div>
            </article>
          </div>
          <GraficoComparacaoConcentracaoIodometria
            original={resultadoBase}
            simulado={resultadoSimulado}
          />
      </div>

      <div className="oxirreducaoConcentracaoInterpretacao">
        <header className="oxirreducaoConcentracaoInterpretacaoHeader">
          <span>Relação matemática</span>
          <h4>Relação entre as concentrações</h4>
          <p>
            Mantendo o volume da amostra constante, o volume de tiossulfato no ponto de equivalência depende da concentração do analito, da concentração do titulante e da proporção estequiométrica do sistema.
          </p>
        </header>

        <div className="oxirreducaoConcentracaoRelationLayout">
          <div className="oxirreducaoConcentracaoFormulaPanel">
            <span>Relação fundamental</span>
            <strong>VPE ∝ {fatorEstequiometrico} ×</strong>
            <div className="oxirreducaoConcentracaoFraction">
              <span>[{rotuloAnalito}]</span>
              <i />
              <span>[S₂O₃²⁻]</span>
            </div>
            <p>
              Para este sistema, {fatorEstequiometrico} mol de tiossulfato reagem por mol de analito. Aumentar a concentração do analito tende a elevar o volume de titulante; aumentar a concentração do tiossulfato tende a reduzi-lo.
            </p>
          </div>

          <div className="oxirreducaoConcentracaoMetrics">
            <article>
              <span>Razão original</span>
              <strong>{formatarNumero(razaoOriginal, 4)}</strong>
              <small>{fatorEstequiometrico} × [{rotuloAnalito}] / [S₂O₃²⁻]</small>
            </article>
            <div className="oxirreducaoConcentracaoRelationArrow">→</div>
            <article>
              <span>Razão simulada</span>
              <strong>{formatarNumero(razaoSimulada, 4)}</strong>
              <small>{fatorEstequiometrico} × [{rotuloAnalito}] / [S₂O₃²⁻]</small>
            </article>
            <article className="oxirreducaoConcentracaoMetricHighlight">
              <span>Deslocamento relativo do PE</span>
              <strong>{formatarNumero(fatorVolume, 4)}×</strong>
              <small>VPE simulado / VPE original</small>
            </article>
          </div>
        </div>

        <div className="oxirreducaoConcentracaoInterpretacaoFooter">
          <div>
            <strong>↑ [{rotuloAnalito}]</strong>
            <span>tende a aumentar o VPE</span>
          </div>
          <div>
            <strong>↑ [S₂O₃²⁻]</strong>
            <span>tende a diminuir o VPE</span>
          </div>
          <div>
            <strong>mesma proporção</strong>
            <span>pode manter o VPE constante</span>
          </div>
        </div>
      </div>

      <div className="oxirreducaoEducationalNote">
        <strong>O que permanece constante?</strong>
        <p>
          A simulação altera somente as concentrações de {rotuloAnalito} e Na₂S₂O₃. O volume da amostra e a temperatura permanecem iguais aos da calculadora principal. A quantidade e a concentração mínima estequiométrica de KI são recalculadas automaticamente para cada nova concentração do analito; o valor calculado é um limite mínimo, não uma concentração de estoque recomendada.
        </p>
      </div>
    </section>
  );
}
