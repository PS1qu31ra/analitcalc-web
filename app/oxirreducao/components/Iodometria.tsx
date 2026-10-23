"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  E0_I2_I,
  E0_TETRATIONATO_TIOS,
  REACAO_TIOS,
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

import IodometriaTabs, {
  type AbaIodometria,
} from "./IodometriaTabs";

import SeletorSistemaIodometria from "./SeletorSistemaIodometria";
import GraficoIodometria from "./GraficoIodometria";
import DerivadasIodometria from "./DerivadasIodometria";

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


function formatarCientifico(
  valor: number
) {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  if (valor === 0) {
    return "0";
  }

  return valor
    .toExponential(3)
    .replace(".", ",");
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


function numeroParaCampo(
  valor: number
) {
  if (
    Math.abs(valor) > 0 &&
    Math.abs(valor) < 0.001
  ) {
    return valor
      .toExponential(4)
      .replace(".", ",");
  }

  return String(valor).replace(".", ",");
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
          Método indireto no qual o iodo é gerado in situ pela reação do analito com iodeto proveniente de KI. O iodo formado é titulado com solução padrão de tiossulfato de sódio.
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
            Fornece I⁻ em excesso para gerar quantitativamente as espécies de iodo.
          </p>
        </article>

        <article>
          <span>Titulante</span>
          <strong>Na₂S₂O₃</strong>
          <p>
            O tiossulfato reduz I₂ a I⁻ e é oxidado a tetrationato, S₄O₆²⁻.
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
        <span>Geração de iodo antes da titulação</span>
        <strong>{sistema.reacaoGlobalGeracaoIodo}</strong>
      </div>

      <div className="oxirreducaoOverviewReaction">
        <span>Reação entre iodo e titulante</span>
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
        {sistema.semirreacoes.map(
  (item) => (
    <div
      className="reactionWideCard"
      key={`${item.titulo}-${item.equacao}`}
    >
      <span>
        {item.titulo}
      </span>

      <strong>
        {item.equacao}
      </strong>

      <small>
        {item.eletrons} e⁻
        {item.potencialPadraoV !== null
          ? ` • E° = ${formatarNumero(
              item.potencialPadraoV,
              4
            )} V`
          : ""}
      </small>

      {item.observacao && (
        <p>
          {item.observacao}
        </p>
      )}
    </div>
  )
)}
        </div>
      </div>

      <div className="resultsPanel">
        <span className="eyebrow">
          Etapa titulométrica comum
        </span>

        <h2>I₂ × tiossulfato</h2>

        <div className="reactionDetailsStack">
          <div className="reactionWideCard">
            <span>Par I₂/I⁻</span>
            <strong>{SEMIRREACAO_IODO}</strong>
            <small>
              2 e⁻ • E° = {formatarNumero(E0_I2_I, 4)} V
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Par tetrationato/tiossulfato</span>
            <strong>{SEMIRREACAO_TIOS}</strong>
            <small>
              2 e⁻ • E° = {formatarNumero(E0_TETRATIONATO_TIOS, 3)} V
            </small>
          </div>

          <div className="reactionWideCard">
            <span>Reação global da titulação</span>
            <strong>{REACAO_TIOS}</strong>
            <small>Transferência global: 2 e⁻</small>
          </div>
        </div>
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
          O cálculo separa a formação de I₂ da titulação
          do I₂ com tiossulfato e, em seguida, combina as
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
              Elétrons — geração de I₂
            </span>

            <strong>
              {sistema.eletronsGeracaoIodo} e⁻
            </strong>
          </div>

          <div className="resultCard iodometriaStoichiometryCard">
            <span>
              Elétrons — I₂ × S₂O₃²⁻
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
              Igualdade de mols — geração de I₂
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
              Agentes na etapa de geração de I₂
            </span>

            <strong>
              Oxidante:{" "}
              {sistema.agenteOxidantePrimeiraEtapa}
              {" • "}
              Redutor:{" "}
              {sistema.agenteRedutorPrimeiraEtapa}
            </strong>
          </div>

          <div className="reactionWideCard">
            <span>
              Agentes na titulação do iodo
            </span>

            <strong>
              Oxidante: I₂ • Redutor: S₂O₃²⁻
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
          O motor resolve simultaneamente o equilíbrio entre os pares I₂/I⁻ e S₄O₆²⁻/S₂O₃²⁻. Assim, a transição ao redor do ponto de equivalência é calculada por equilíbrio químico, sem impor uma troca descontínua de equação.
        </p>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Volume PE</span>
            <strong>{formatarNumero(resultado.volumeEquivalenciaMl, 3)} mL</strong>
          </div>

          <div className="resultCard">
            <span>Potencial no PE</span>
            <strong>{formatarNumero(resultado.potencialEquivalenciaV, 4)} V</strong>
          </div>

          <div className="resultCard">
            <span>I₂ gerado</span>
            <strong>{formatarCientifico(resultado.molI2Gerado)} mol</strong>
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
          Antes do PE predomina o sistema I₂/I⁻. Após o PE, o excesso de tiossulfato e o tetrationato formado passam a controlar o potencial. O excesso de iodeto proveniente de KI também participa do termo de Nernst do par I₂/I⁻.
        </p>
      </div>
    </section>
  );
}


function EfeitoConcentracaoIodometria({
  resultadoBase,
}: {
  resultadoBase: ResultadoCurvaIodometria;
}) {
  const [
    concentracaoAnalito,
    setConcentracaoAnalito,
  ] = useState(
    numeroParaCampo(
      resultadoBase.entrada.concentracaoAnalitoMolL
    )
  );

  const [
    concentracaoTios,
    setConcentracaoTios,
  ] = useState(
    numeroParaCampo(
      resultadoBase.entrada.concentracaoTiossulfatoMolL
    )
  );

  const [
    simulacao,
    setSimulacao,
  ] = useState<ResultadoCurvaIodometria | null>(
    null
  );

  const [erro, setErro] = useState("");

  useEffect(() => {
    setConcentracaoAnalito(
      numeroParaCampo(
        resultadoBase.entrada.concentracaoAnalitoMolL
      )
    );
    setConcentracaoTios(
      numeroParaCampo(
        resultadoBase.entrada.concentracaoTiossulfatoMolL
      )
    );
    setSimulacao(null);
    setErro("");
  }, [resultadoBase]);

  function simular() {
    const ca = converterNumero(concentracaoAnalito);
    const ct = converterNumero(concentracaoTios);

    if (
      !Number.isFinite(ca) ||
      !Number.isFinite(ct) ||
      ca <= 0 ||
      ct <= 0
    ) {
      setErro("Informe concentrações positivas e válidas.");
      return;
    }

    const entrada: EntradaIodometria = {
      ...resultadoBase.entrada,
      concentracaoAnalitoMolL: ca,
      concentracaoTiossulfatoMolL: ct,
    };

    try {
      setSimulacao(
        gerarCurvaIodometria({ entrada })
      );
      setErro("");
    } catch (error) {
      setSimulacao(null);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a simulação."
      );
    }
  }

  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel">
        <span className="eyebrow">
          Sensibilidade estequiométrica
        </span>
        <h2>Efeito da concentração</h2>
        <p>
          Altere a concentração do analito e do Na₂S₂O₃. O volume da amostra, o iodeto livre efetivo e a temperatura permanecem iguais à condição principal.
        </p>

        <div className="oxirreducaoMainGrid">
          <div className="oxirreducaoForm">
            <label>
              Concentração do analito
              <div className="oxirreducaoInputUnit">
                <input
                  value={concentracaoAnalito}
                  onChange={(event) =>
                    setConcentracaoAnalito(event.target.value)
                  }
                  inputMode="decimal"
                />
                <span>mol/L</span>
              </div>
            </label>

            <label>
              Concentração de Na₂S₂O₃
              <div className="oxirreducaoInputUnit">
                <input
                  value={concentracaoTios}
                  onChange={(event) =>
                    setConcentracaoTios(event.target.value)
                  }
                  inputMode="decimal"
                />
                <span>mol/L</span>
              </div>
            </label>

            {erro && (
              <div className="oxirreducaoError">
                {erro}
              </div>
            )}

            <button
              type="button"
              className="primaryButton"
              onClick={simular}
            >
              Aplicar novas concentrações
            </button>
          </div>

          <div className="resultsPanel">
            <div className="resultGrid">
              <div className="resultCard">
                <span>PE original</span>
                <strong>{formatarNumero(resultadoBase.volumeEquivalenciaMl, 3)} mL</strong>
              </div>

              <div className="resultCard">
                <span>PE simulado</span>
                <strong>
                  {simulacao
                    ? `${formatarNumero(simulacao.volumeEquivalenciaMl, 3)} mL`
                    : "-"}
                </strong>
              </div>

              <div className="resultCard">
                <span>ΔPE</span>
                <strong>
                  {simulacao
                    ? `${formatarNumero(simulacao.volumeEquivalenciaMl - resultadoBase.volumeEquivalenciaMl, 3)} mL`
                    : "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {simulacao && (
        <div className="resultsPanel">
          <GraficoIodometria
            resultado={resultadoBase}
            curvaComparacao={simulacao}
          />
          <div className="explanationBox">
            <p>
              Linha contínua: condição original. Linha tracejada: condição simulada. Pela relação estequiométrica, o PE cresce com a concentração do analito e diminui com o aumento da concentração de tiossulfato.
            </p>
          </div>
        </div>
      )}
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
          Acompanhe o consumo de I₂, a formação de I⁻ e S₄O₆²⁻ e o aparecimento do excesso de S₂O₃²⁻ após o PE.
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
            <strong>{pontoAtual ? `${formatarNumero(pontoAtual.potencialV, 4)} V` : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[I₂]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoI2MolL) : "-"}</strong>
          </div>
          <div className="resultCard">
            <span>[I⁻]</span>
            <strong>{pontoAtual ? formatarCientifico(pontoAtual.concentracaoIodetoMolL) : "-"}</strong>
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
                  <th>[I₂]</th>
                  <th>[I⁻]</th>
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
                    <td>{formatarNumero(ponto.potencialV, 4)}</td>
                    <td>{formatarCientifico(ponto.concentracaoI2MolL)}</td>
                    <td>{formatarCientifico(ponto.concentracaoIodetoMolL)}</td>
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
      volumeNumerico < 0
    ) {
      setErroEntrada(
        "Informe um PF experimental válido."
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
            pelas derivadas da curva iodimétrica.
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
            Sistema iodimétrico avaliado
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
            iodimétrica foi considerada encerrada
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
        Não foi possível gerar a curva iodimétrica.
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

  const entradaInicial =
    entradaPadraoIodometria(
      "cloro-ativo"
    );

  const [concentracaoAnalito, setConcentracaoAnalito] =
    useState(
      numeroParaCampo(
        entradaInicial.concentracaoAnalitoMolL
      )
    );

  const [volumeAmostra, setVolumeAmostra] =
    useState(
      numeroParaCampo(
        entradaInicial.volumeAmostraMl
      )
    );

  const [concentracaoTios, setConcentracaoTios] =
    useState(
      numeroParaCampo(
        entradaInicial.concentracaoTiossulfatoMolL
      )
    );

  const [concentracaoIodeto, setConcentracaoIodeto] =
    useState(
      numeroParaCampo(
        entradaInicial.concentracaoIodetoLivreMolL
      )
    );

  const [temperatura, setTemperatura] =
    useState(
      numeroParaCampo(
        entradaInicial.temperaturaC
      )
    );

  const [resultado, setResultado] =
    useState<ResultadoCurvaIodometria>(() =>
      gerarCurvaIodometria({
        entrada: entradaInicial,
      })
    );

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const sistema =
    buscarSistemaIodometria(
      sistemaAtivo
    );

  function aplicarEntradaNosCampos(
    entrada: EntradaIodometria
  ) {
    setConcentracaoAnalito(
      numeroParaCampo(
        entrada.concentracaoAnalitoMolL
      )
    );
    setVolumeAmostra(
      numeroParaCampo(
        entrada.volumeAmostraMl
      )
    );
    setConcentracaoTios(
      numeroParaCampo(
        entrada.concentracaoTiossulfatoMolL
      )
    );
    setConcentracaoIodeto(
      numeroParaCampo(
        entrada.concentracaoIodetoLivreMolL
      )
    );
    setTemperatura(
      numeroParaCampo(
        entrada.temperaturaC
      )
    );
  }

  function alterarSistema(
    id: SistemaIodometriaId
  ) {
    const entrada =
      entradaPadraoIodometria(id);

    setSistemaAtivo(id);
    setAbaAtiva("visao-geral");
    aplicarEntradaNosCampos(entrada);
    setResultado(
      gerarCurvaIodometria({ entrada })
    );
    setMensagem("");
    setErro("");
  }

  function calcular(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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
      concentracaoIodetoLivreMolL:
        converterNumero(
          concentracaoIodeto
        ),
      temperaturaC:
        converterNumero(
          temperatura
        ),
    };

    try {
      const novoResultado =
        gerarCurvaIodometria({
          entrada,
        });

      setResultado(novoResultado);
      setErro("");
      setMensagem(
        "Sistema iodimétrico recalculado com sucesso."
      );
    } catch (error) {
      setMensagem("");
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o sistema iodimétrico."
      );
    }
  }

  const resultadoDenso = useMemo(
    () => {
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
      calcularDerivadasIodometria(
        resultadoDenso.pontosValidos
      ),
    [resultadoDenso]
  );

  const oxigenioMgL =
    sistemaAtivo === "oxigenio-dissolvido"
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
                  onChange={(event) =>
                    setConcentracaoAnalito(event.target.value)
                  }
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
                  onChange={(event) =>
                    setVolumeAmostra(event.target.value)
                  }
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
                  onChange={(event) =>
                    setConcentracaoTios(event.target.value)
                  }
                />
                <span>mol/L</span>
              </div>
            </label>

            <label>
              I⁻ livre efetivo após gerar I₂
              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={concentracaoIodeto}
                  onChange={(event) =>
                    setConcentracaoIodeto(event.target.value)
                  }
                />
                <span>mol/L</span>
              </div>
            </label>

            <label>
              Temperatura
              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={temperatura}
                  onChange={(event) =>
                    setTemperatura(event.target.value)
                  }
                />
                <span>°C</span>
              </div>
            </label>

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
              Avaliar sistema
            </button>
          </form>

          <div className="resultsPanel">
            <span className="eyebrow">Resumo calculado</span>
            <h2>Condição atual</h2>

            <div className="resultGrid">
              <div className="resultCard">
                <span>Mol de analito</span>
                <strong>{formatarCientifico(resultado.molAnalitoInicial)}</strong>
                <small>mol</small>
              </div>

              <div className="resultCard">
                <span>I₂ gerado</span>
                <strong>{formatarCientifico(resultado.molI2Gerado)}</strong>
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
                <strong>{formatarNumero(resultado.potencialEquivalenciaV, 4)} V</strong>
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

            <div className="explanationBox">
              <p>{sistema.observacao}</p>
            </div>
          </div>
        </div>
      </section>

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
  );
}

