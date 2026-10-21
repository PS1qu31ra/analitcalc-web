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
          O cálculo separa a formação de I₂ da titulação do I₂ com tiossulfato e, em seguida, combina as duas relações para obter a igualdade geral entre analito e titulante.
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
                <strong>{etapa}</strong>
              </div>
            )
          )}

          <div className="reactionWideCard">
            <span>Reação com o titulante</span>
            <strong>{REACAO_TIOS}</strong>
          </div>
        </div>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Elétrons — geração de I₂</span>
            <strong>{sistema.eletronsGeracaoIodo} e⁻</strong>
          </div>

          <div className="resultCard">
            <span>Elétrons — I₂ × S₂O₃²⁻</span>
            <strong>2 e⁻</strong>
          </div>

          <div className="resultCard">
            <span>1ª relação</span>
            <strong>{sistema.relacaoPrimeiraEtapa}</strong>
          </div>

          <div className="resultCard">
            <span>2ª relação</span>
            <strong>{sistema.relacaoSegundaEtapa}</strong>
          </div>

          <div className="resultCard">
            <span>Relação geral</span>
            <strong>{sistema.relacaoGlobal}</strong>
          </div>

          <div className="resultCard">
            <span>Igualdade geral</span>
            <strong>{sistema.igualdadeMolsGlobal}</strong>
          </div>
        </div>

        <div className="reactionDetailsStack">
          <div className="reactionWideCard">
            <span>Igualdade de mols — geração de I₂</span>
            <strong>{sistema.igualdadeMolsPrimeiraEtapa}</strong>
          </div>

          <div className="reactionWideCard">
            <span>Igualdade de mols — titulação</span>
            <strong>{sistema.igualdadeMolsSegundaEtapa}</strong>
          </div>

          <div className="reactionWideCard">
            <span>Agentes na etapa de geração de I₂</span>
            <strong>
              Oxidante: {sistema.agenteOxidantePrimeiraEtapa} • Redutor: {sistema.agenteRedutorPrimeiraEtapa}
            </strong>
          </div>

          <div className="reactionWideCard">
            <span>Agentes na titulação do iodo</span>
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
        <GraficoIodometria resultado={resultado} />
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
          <GraficoIodometria
            resultado={resultadoBase}
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


function ErroExperimentalIodometria({
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

  const volumePE = resultadoBase.volumeEquivalenciaMl;
  const volumePF = derivadas.volumePFPrimeiraDerivadaMl;

  const [volumeTexto, setVolumeTexto] = useState(
    numeroParaCampo(volumePF)
  );

  useEffect(() => {
    setVolumeTexto(
      numeroParaCampo(volumePF)
    );
  }, [volumePF, resultadoBase]);

  const volumeExperimental = converterNumero(volumeTexto);

  const valido =
    Number.isFinite(volumeExperimental) &&
    volumeExperimental >= 0;

  const erroAbsoluto =
    valido
      ? volumeExperimental - volumePE
      : null;

  const erroRelativo =
    erroAbsoluto !== null
      ? (erroAbsoluto / volumePE) * 100
      : null;

  const pontoExperimental =
    valido
      ? calcularPontoIodometria({
          entrada: resultadoBase.entrada,
          volumeAdicionadoMl: volumeExperimental,
        })
      : null;

  const status =
    erroRelativo === null
      ? "Não calculado"
      : Math.abs(erroRelativo) <= 0.10
        ? "Dentro de ±0,10%"
        : Math.abs(erroRelativo) <= 0.50
          ? "Atenção"
          : "Fora da faixa de ±0,50%";

  return (
    <section className="oxirreducaoTabPanel">
      <div className="resultsPanel">
        <span className="eyebrow">
          Comparação com o PE
        </span>
        <h2>Erro experimental</h2>
        <p>
          Informe o volume observado no ponto final e compare-o com o PE estequiométrico. O sinal do erro é preservado.
        </p>

        <div className="oxirreducaoMainGrid">
          <div className="oxirreducaoForm">
            <label>
              Volume experimental do ponto final
              <div className="oxirreducaoInputUnit">
                <input
                  value={volumeTexto}
                  onChange={(event) =>
                    setVolumeTexto(event.target.value)
                  }
                  inputMode="decimal"
                />
                <span>mL</span>
              </div>
            </label>

            <button
              type="button"
              className="secondaryButton"
              onClick={() =>
                setVolumeTexto(numeroParaCampo(volumePF))
              }
            >
              Usar PF teórico
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() =>
                setVolumeTexto(numeroParaCampo(volumePE))
              }
            >
              Usar PE
            </button>
          </div>

          <div className="resultsPanel">
            <div className="resultGrid">
              <div className="resultCard">
                <span>PE</span>
                <strong>{formatarNumero(volumePE, 3)} mL</strong>
              </div>
              <div className="resultCard">
                <span>PF teórico</span>
                <strong>{formatarNumero(volumePF, 3)} mL</strong>
              </div>
              <div className="resultCard">
                <span>V experimental</span>
                <strong>{valido ? `${formatarNumero(volumeExperimental, 3)} mL` : "-"}</strong>
              </div>
              <div className="resultCard">
                <span>Vexp − VPE</span>
                <strong>{erroAbsoluto !== null ? `${formatarNumero(erroAbsoluto, 4)} mL` : "-"}</strong>
              </div>
              <div className="resultCard">
                <span>Erro relativo</span>
                <strong>{erroRelativo !== null ? `${formatarNumero(erroRelativo, 4)}%` : "-"}</strong>
              </div>
              <div className="resultCard">
                <span>Status</span>
                <strong>{status}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pontoExperimental && (
        <div className="resultsPanel">
          <GraficoIodometria
            resultado={resultadoBase}
            pontosAdicionados={[pontoExperimental]}
          />
        </div>
      )}

      <div className="explanationBox">
        <p>
          Erro relativo = ((Vexperimental − VPE) / VPE) × 100. O PF teórico é o ponto de inflexão refinado pelas derivadas e pode apresentar pequeno deslocamento em relação ao PE estequiométrico.
        </p>
      </div>
    </section>
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

