"use client";

import { useMemo, useState } from "react";

import {
  avaliarSistemaEDTA,
  formatarCientifico,
  formatarDecimal,
} from "../../lib/complexometria";

import {
  gerarCurvaEDTA,
  calcularPontoCurvaEDTA,
  montarRankingIndicadoresEDTA,
  montarCurvasInterferentesEDTA,
  calcularPrimeiraDerivadaEDTA,
  localizarPicoPrimeiraDerivadaEDTA,
  calcularSegundaDerivadaEDTA,
  localizarTrocaSinalSegundaDerivadaEDTA,
  formatarNumeroBR,
  formatarCientificoBR,
} from "../../lib/curvaEdta";

import type {
  CurvaEDTA,
  PontoCurvaEDTA,
  ResultadoAvaliacaoEDTA,
  RankingIndicadorEDTA,
} from "../../lib/curvaEdta";

import {
  alphaEdtaPh,
  betasComplexantes,
  complexantesAuxiliares,
  metaisEdta,
} from "../../lib/data";

import { CurvaEdtaChart } from "../../components/CurvaEdtaChart";
import { DerivadaEdtaChart } from "../../components/DerivadaEdtaChart";
import { SimulacaoTempoRealEdtaChart } from "../../components/SimulacaoTempoRealEdtaChart";

type AbaAtiva =
  | "visao"
  | "curva"
  | "indicadores"
  | "interferentes"
  | "tempoReal"
  | "derivadas";

export default function ComplexometriaPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("visao");

  const [metalPrincipal, setMetalPrincipal] = useState("");
  const [pH, setPH] = useState("");
  const [concMetal, setConcMetal] = useState("");
  const [volAmostra, setVolAmostra] = useState("");
  const [concEDTA, setConcEDTA] = useState("");
  const [volBureta, setVolBureta] = useState("");

  const [metalComplexado, setMetalComplexado] = useState<"nao" | "sim">("nao");
  const [complexanteAuxiliar, setComplexanteAuxiliar] = useState("");
  const [concComplexanteAuxiliar, setConcComplexanteAuxiliar] = useState("");

  const [interferentes, setInterferentes] = useState<string[]>([]);

  const [resultado, setResultado] = useState<ResultadoAvaliacaoEDTA | null>(
    null
  );

  const [curva, setCurva] = useState<CurvaEDTA | null>(null);
  const [volumeConsulta, setVolumeConsulta] = useState("");
  const [pontoConsulta, setPontoConsulta] = useState<PontoCurvaEDTA | null>(
    null
  );

  const [rankingIndicadores, setRankingIndicadores] = useState<
    RankingIndicadorEDTA[]
  >([]);

  const [erro, setErro] = useState("");

  const [volumeAtualTempoReal, setVolumeAtualTempoReal] = useState(0);
const [volumeManualTempoReal, setVolumeManualTempoReal] = useState("");
const [pontosTempoReal, setPontosTempoReal] = useState<PontoCurvaEDTA[]>([]);

  const complexantesPermitidos = useMemo(() => {
    if (!metalPrincipal) return [];

    const idsPermitidos = betasComplexantes
      .filter((beta) => beta.idMetal === metalPrincipal)
      .map((beta) => beta.idComplexante);

    return complexantesAuxiliares.filter((complexante) =>
      idsPermitidos.includes(complexante.idComplexante)
    );
  }, [metalPrincipal]);

  function alternarInterferente(idMetal: string) {
    setInterferentes((atual) => {
      if (atual.includes(idMetal)) {
        return atual.filter((id) => id !== idMetal);
      }

      return [...atual, idMetal];
    });
  }

  function limpar() {
    setMetalPrincipal("");
    setPH("");
    setConcMetal("");
    setVolAmostra("");
    setConcEDTA("");
    setVolBureta("50");

    setMetalComplexado("nao");
    setComplexanteAuxiliar("");
    setConcComplexanteAuxiliar("");

    setInterferentes([]);

    setResultado(null);
    setCurva(null);
    setPontoConsulta(null);
    setVolumeConsulta("");

    setRankingIndicadores([]);
    setErro("");
    setAbaAtiva("visao");

    setVolumeAtualTempoReal(0);
setVolumeManualTempoReal("");
setPontosTempoReal([]);
  }

  function avaliar(abaDepois?: AbaAtiva) {
    try {
      setErro("");
  
      if (!metalPrincipal || !pH) {
        setErro("Selecione o metal principal e o pH antes de avaliar.");
        return;
      }
  
      const avaliacao = avaliarSistemaEDTA({
        metalPrincipal,
        pH: Number(pH),
        concMetal: Number(concMetal.replace(",", ".")),
        volAmostra: Number(volAmostra.replace(",", ".")),
        concEDTA: Number(concEDTA.replace(",", ".")),
        volBureta: Number(volBureta.replace(",", ".")),
        metalComplexado,
        complexanteAuxiliar,
        concComplexanteAuxiliar: Number(
          concComplexanteAuxiliar.replace(",", ".")
        ),
        interferentes,
      });
  
      const curvaGerada = gerarCurvaEDTA(avaliacao, {
        passo: 0.25,
      });
  
      const ranking = montarRankingIndicadoresEDTA(avaliacao);
  
      setResultado(avaliacao);
      setCurva(curvaGerada);
      setRankingIndicadores(ranking);
      setPontoConsulta(null);
  
      if (abaDepois) {
        setAbaAtiva(abaDepois);
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao avaliar o sistema."
      );
    }
  }

  function consultarPonto() {
    if (!resultado) {
      setErro("Avalie o sistema antes de consultar um ponto da curva.");
      return;
    }

    const volume = Number(volumeConsulta.replace(",", "."));

    if (Number.isNaN(volume)) {
      setErro("Informe um volume válido para consulta.");
      return;
    }

    const ponto = calcularPontoCurvaEDTA(resultado, volume);

    if (!ponto) {
      setErro("Não foi possível calcular este ponto da curva.");
      return;
    }

    setErro("");
    setPontoConsulta(ponto);
  }

  const melhorIndicador =
  rankingIndicadores.find(
    (item) => item.classificacao === "recomendado"
  ) ?? null;

const curvasInterferentes =
  resultado && curva
    ? montarCurvasInterferentesEDTA(
        resultado,
        curva.volumeMaximo,
        curva.passo
      )
    : [];

const interferentesAvaliados = resultado?.interferentes ?? [];

const interferentesCriticos = interferentesAvaliados.filter(
  (item) => item.risco === "Alta" || item.risco === "Significativa"
);

const interferentesModerados = interferentesAvaliados.filter(
  (item) => item.risco === "Moderada"
);

const interferentesBaixos = interferentesAvaliados.filter(
  (item) => item.risco === "Baixa"
);

const interferentesSemInterferencia = interferentesAvaliados.filter(
  (item) => item.risco === "Sem interferência"
);

const riscoGlobalInterferentes =
  interferentesAvaliados.length === 0
    ? "SEM AVALIAÇÃO"
    : interferentesCriticos.length > 0
      ? "ALTO"
      : interferentesModerados.length > 0
        ? "MODERADO"
        : interferentesBaixos.length > 0
          ? "BAIXO"
          : interferentesSemInterferencia.length > 0
            ? "SEM INTERFERÊNCIA"
            : "SEM AVALIAÇÃO";

const precisaMascarante = interferentesCriticos.length > 0;

const nomesInterferentesCriticos = interferentesCriticos
  .map((item) => item.metal)
  .join(", ");

const nomesInterferentesModerados = interferentesModerados
  .map((item) => item.metal)
  .join(", ");

const nomesInterferentesBaixos = interferentesBaixos
  .map((item) => item.metal)
  .join(", ");

const mascaranteRecomendado = resultado?.mascaranteRecomendado ?? null;
const mascaranteAny = mascaranteRecomendado as any;

const nomeMascarante =
  mascaranteAny?.agenteMascarante ??
  mascaranteAny?.mascarante ??
  mascaranteAny?.nome ??
  mascaranteAny?.Agente_Mascarante ??
  mascaranteAny?.Mascarante ??
  mascaranteAny?.Nome ??
  "";

const observacaoMascarante =
  mascaranteAny?.observacao ??
  mascaranteAny?.funcao ??
  mascaranteAny?.Observacao ??
  mascaranteAny?.Funcao ??
  "";

const textoConclusaoInterferentes =
  interferentesAvaliados.length === 0
    ? "Nenhum interferente foi selecionado para comparação."
    : interferentesCriticos.length > 0
      ? `Os metais ${nomesInterferentesCriticos} apresentam separação insuficiente de Kf em relação ao metal analisado. Isso indica possibilidade real de competição pelo EDTA se estiverem presentes em quantidade significativa.`
      : interferentesModerados.length > 0
        ? `Os metais ${nomesInterferentesModerados} apresentam interferência moderada. A separação entre os Kf não é ideal, então a concentração desses interferentes deve ser considerada.`
        : interferentesBaixos.length > 0
          ? `Os metais ${nomesInterferentesBaixos} apresentam baixa tendência de interferência. A separação entre os Kf é razoável, mas ainda não deve ser ignorada completamente.`
          : "Os interferentes selecionados apresentam separação de Kf suficientemente grande em relação ao metal analisado. Assim, a interferência esperada é desprezível nas condições avaliadas.";

const primeiraDerivada = curva
  ? calcularPrimeiraDerivadaEDTA(curva.pontos)
  : [];

const picoPrimeiraDerivada =
  primeiraDerivada.length > 0
    ? localizarPicoPrimeiraDerivadaEDTA(primeiraDerivada)
    : null;

const segundaDerivada =
  primeiraDerivada.length > 0
    ? calcularSegundaDerivadaEDTA(primeiraDerivada)
    : [];

const trocaSegundaDerivada =
  segundaDerivada.length > 0
    ? localizarTrocaSinalSegundaDerivadaEDTA(
        segundaDerivada,
        curva?.volumePE
      )
    : null;

const diferencaPrimeiraDerivada =
  picoPrimeiraDerivada && curva?.volumePE
    ? Math.abs(picoPrimeiraDerivada.volumeEstimadoPE - curva.volumePE)
    : null;

const diferencaSegundaDerivada =
  trocaSegundaDerivada && curva?.volumePE
    ? Math.abs(trocaSegundaDerivada.volumeEstimado - curva.volumePE)
    : null;

    const equilibrioNoPE =
  curva?.pontoPE ??
  (resultado?.volumePE
    ? calcularPontoCurvaEDTA(resultado, resultado.volumePE)
    : null);

    function adicionarVolumeTempoReal(incremento: number) {
      if (!resultado) {
        setErro("Avalie o sistema antes de iniciar a simulação em tempo real.");
        return;
      }
    
      const novoVolume = volumeAtualTempoReal + incremento;
      const ponto = calcularPontoCurvaEDTA(resultado, novoVolume);
    
      if (!ponto) {
        setErro("Não foi possível calcular este ponto da titulação.");
        return;
      }
    
      setErro("");
      setVolumeAtualTempoReal(novoVolume);
      setPontosTempoReal((atuais) => [...atuais, ponto]);
    }
    
    function adicionarVolumeManualTempoReal() {
      const incremento = Number(volumeManualTempoReal.replace(",", "."));
    
      if (Number.isNaN(incremento) || incremento <= 0) {
        setErro("Informe um volume manual válido para adicionar.");
        return;
      }
    
      adicionarVolumeTempoReal(incremento);
      setVolumeManualTempoReal("");
    }
    
    function irParaPETempoReal() {
      if (!resultado?.volumePE) {
        setErro("Não foi possível identificar o ponto de equivalência.");
        return;
      }
    
      const ponto = calcularPontoCurvaEDTA(resultado, resultado.volumePE);
    
      if (!ponto) {
        setErro("Não foi possível calcular o ponto de equivalência.");
        return;
      }
    
      setErro("");
      setVolumeAtualTempoReal(resultado.volumePE);
      setPontosTempoReal((atuais) => [...atuais, ponto]);
    }
    
    function limparTempoReal() {
      setVolumeAtualTempoReal(0);
      setVolumeManualTempoReal("");
      setPontosTempoReal([]);
    }

  return (
    <main className="modulePage">
      <section className="moduleHero">
        <div className="container moduleHeroContent">
          <div>
            <span className="eyebrow">Módulo disponível</span>
            <h1>Complexometria com EDTA</h1>
            <p>
              Avalie a viabilidade da titulação, o efeito do pH, a presença de
              interferentes, a formação de complexos auxiliares, a curva pM ×
              volume de EDTA e a recomendação qualitativa de indicadores.
            </p>
          </div>

          <div className="moduleInfoCard">
            <strong>Status</strong>
            <span>
              Bases migradas do Sheets e cálculo executado diretamente no
              AnalitCalc Web.
            </span>
          </div>
        </div>
      </section>

      <section className="container calculatorSection">
        {erro && (
          <div className="explanationBox" style={{ borderColor: "#a80000" }}>
            <h3>Atenção</h3>
            <p>{erro}</p>
          </div>
        )}

<div className="calculatorStack">
  <form className="calcForm inputWideForm">
            <h2>Dados de entrada</h2>

            <div className="inputFieldsGrid">

            <label>
              Metal principal
              <select
                value={metalPrincipal}
                onChange={(event) => {
                  setMetalPrincipal(event.target.value);
                  setComplexanteAuxiliar("");
                }}
              >
                <option value="">Selecione o metal...</option>
                {metaisEdta.map((metal) => (
                  <option key={metal.idMetal} value={metal.idMetal}>
                    {metal.metal} — {metal.nome}
                  </option>
                ))}
              </select>
            </label>

            <label>
              pH
              <select value={pH} onChange={(event) => setPH(event.target.value)}>
                <option value="">Selecione o pH...</option>
                {alphaEdtaPh.map((item) => (
                  <option key={item.ph} value={item.ph}>
                    pH {item.ph} — {item.statusEdta}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Concentração do metal
              <input
                value={concMetal}
                onChange={(event) => setConcMetal(event.target.value)}
                placeholder="Ex: 0,01"
              />
              <small>mol/L</small>
            </label>

            <label>
              Volume da amostra
              <input
                value={volAmostra}
                onChange={(event) => setVolAmostra(event.target.value)}
                placeholder="Ex: 50,00"
              />
              <small>mL</small>
            </label>

            <label>
              Concentração do EDTA
              <input
                value={concEDTA}
                onChange={(event) => setConcEDTA(event.target.value)}
                placeholder="Ex: 0,01"
              />
              <small>mol/L</small>
            </label>

            <label>
              Volume máximo da bureta
              <input
                value={volBureta}
                onChange={(event) => setVolBureta(event.target.value)}
                placeholder="Ex: 50,00"
              />
              <small>mL</small>
            </label>

            <label>
              Metal previamente complexado?
              <select
                value={metalComplexado}
                onChange={(event) =>
                  setMetalComplexado(event.target.value as "nao" | "sim")
                }
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </label>

            {metalComplexado === "sim" && (
              <>
                <label>
                  Complexante auxiliar
                  <select
                    value={complexanteAuxiliar}
                    onChange={(event) =>
                      setComplexanteAuxiliar(event.target.value)
                    }
                  >
                    <option value="">Selecione o complexante...</option>
                    {complexantesPermitidos.map((complexante) => (
                      <option
                        key={complexante.idComplexante}
                        value={complexante.idComplexante}
                      >
                        {complexante.complexante}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Concentração do complexante auxiliar
                  <input
                    value={concComplexanteAuxiliar}
                    onChange={(event) =>
                      setConcComplexanteAuxiliar(event.target.value)
                    }
                    placeholder="Ex: 0,1"
                  />
                  <small>mol/L</small>
                </label>
              </>
            )}
          </div>

          <div className="inputActions">

  <button
    type="button"
    className="primaryButton"
    onClick={() => avaliar("visao")}
  >
    Avaliar sistema
  </button>

  <button type="button" className="secondaryButton" onClick={limpar}>
    Limpar
  </button>
</div>
          </form>

          <div className="resultsPanel">
            <h2>Resultados principais</h2>

            {!resultado ? (
              <div className="explanationBox">
                <h3>Sistema aguardando avaliação</h3>
                <p>
                  Selecione o metal, o pH e os dados da titulação para gerar a
                  análise.
                </p>
              </div>
            ) : (
              <>
                <div className="resultGrid">
                  <div className="resultCard">
                    <span>Metal</span>
                    <strong>{resultado.metalPrincipal.metal}</strong>
                  </div>

                  <div className="resultCard">
                    <span>Complexo</span>
                    <strong>{resultado.metalPrincipal.complexo}</strong>
                  </div>

                  <div className="resultCard">
                    <span>α(Y4-)</span>
                    <strong>
                      {formatarCientifico(resultado.metalPrincipal.alpha)}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Kf condicional</span>
                    <strong>
                      {formatarCientifico(
                        resultado.metalPrincipal.kfCondicional
                      )}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Kf efetivo</span>
                    <strong>
                      {formatarCientifico(resultado.metalPrincipal.kfEfetivo)}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Status</span>
                    <strong>
                      {resultado.metalPrincipal.sinalizacao}{" "}
                      {resultado.metalPrincipal.status}
                    </strong>
                  </div>
                </div>

                <div className="explanationBox">
                  <h3>Interpretação química</h3>
                  <p>{resultado.resumo.texto}</p>
                  <p>{resultado.metalPrincipal.mensagem}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {resultado && (
        <section className="container tabsSection">
          <div className="moduleTabs">
            <button
              type="button"
              className={abaAtiva === "visao" ? "active" : ""}
              onClick={() => setAbaAtiva("visao")}
            >
              Visão geral
            </button>

            <button
              type="button"
              className={abaAtiva === "curva" ? "active" : ""}
              onClick={() => setAbaAtiva("curva")}
            >
              Curva
            </button>

            <button
              type="button"
              className={abaAtiva === "indicadores" ? "active" : ""}
              onClick={() => setAbaAtiva("indicadores")}
            >
              Indicadores
            </button>

            <button
              type="button"
              className={abaAtiva === "interferentes" ? "active" : ""}
              onClick={() => setAbaAtiva("interferentes")}
            >
              Interferentes
            </button>

            <button
  type="button"
  className={abaAtiva === "tempoReal" ? "active" : ""}
  onClick={() => setAbaAtiva("tempoReal")}
>
  Tempo real
</button>

            <button
              type="button"
              className={abaAtiva === "derivadas" ? "active" : ""}
              onClick={() => setAbaAtiva("derivadas")}
            >
              Derivadas
            </button>
          </div>
        </section>
      )}

      {resultado && abaAtiva === "visao" && (
        <section className="container calculatorSection">
          <div className="calculatorGrid">
            <div className="resultsPanel">
              <h2>Avaliação do pH</h2>

              <div className="resultGrid">
                <div className="resultCard">
                  <span>Status</span>
                  <strong>{resultado.metalPrincipal.avaliacaoPH.status}</strong>
                </div>

                <div className="resultCard">
                  <span>Faixa recomendada</span>
                  <strong>
                    {resultado.metalPrincipal.avaliacaoPH.encontrado
                      ? `${resultado.metalPrincipal.avaliacaoPH.pHMin} – ${resultado.metalPrincipal.avaliacaoPH.pHMax}`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>pH ideal</span>
                  <strong>
                    {resultado.metalPrincipal.avaliacaoPH.encontrado
                      ? resultado.metalPrincipal.avaliacaoPH.pHIdeal
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Tampão sugerido</span>
                  <strong>
                    {resultado.metalPrincipal.avaliacaoPH.encontrado
                      ? resultado.metalPrincipal.avaliacaoPH.tampaoRecomendado
                      : "-"}
                  </strong>
                </div>
              </div>

              <div className="explanationBox">
                <p>{resultado.metalPrincipal.avaliacaoPH.mensagem}</p>
              </div>
            </div>

            <div className="resultsPanel">
  <h2>Equilíbrio no ponto de equivalência</h2>

  {equilibrioNoPE ? (
    <div className="resultGrid">
      <div className="resultCard">
        <span>[MY]</span>
        <strong>{formatarCientificoBR(equilibrioNoPE.MY)}</strong>
      </div>

      <div className="resultCard">
        <span>[M] livre</span>
        <strong>{formatarCientificoBR(equilibrioNoPE.metalLivre)}</strong>
      </div>

      <div className="resultCard">
        <span>[EDTA] livre</span>
        <strong>{formatarCientificoBR(equilibrioNoPE.edtaLivre)}</strong>
      </div>

      <div className="resultCard">
        <span>% complexado</span>
        <strong>
          {formatarNumeroBR(equilibrioNoPE.percentualComplexado, 2)}%
        </strong>
      </div>

      <div className="resultCard">
        <span>pM no PE</span>
        <strong>
          {equilibrioNoPE.pM !== null
            ? formatarDecimal(equilibrioNoPE.pM, 2)
            : "-"}
        </strong>
      </div>

      <div className="resultCard">
        <span>Volume PE</span>
        <strong>
          {resultado.volumePE
            ? `${formatarNumeroBR(resultado.volumePE, 2)} mL`
            : "-"}
        </strong>
      </div>
    </div>
  ) : (
    <div className="explanationBox">
      <p>Não foi possível calcular o equilíbrio no ponto de equivalência.</p>
    </div>
  )}
</div>
          </div>
        </section>
      )}

      {resultado && curva && abaAtiva === "curva" && (
        <section className="container calculatorSection">
          <div className="curveDashboard">
            <div className="resultsPanel curveMainPanel">
              <h2>Curva pM × Volume de EDTA</h2>

              <CurvaEdtaChart
  curva={curva}
  pontoConsulta={pontoConsulta}
  metalPrincipalLabel={resultado.metalPrincipal.metal}
/>

              <div className="resultGrid curveSummaryGrid">
                <div className="resultCard">
                  <span>Volume de equivalência</span>
                  <strong>
                    {curva.volumePE
                      ? `${formatarNumeroBR(curva.volumePE, 2)} mL`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>pM no PE</span>
                  <strong>
                    {curva.pontoPE?.pM !== null &&
                    curva.pontoPE?.pM !== undefined
                      ? formatarNumeroBR(curva.pontoPE.pM, 4)
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Pontos calculados</span>
                  <strong>{curva.pontos.length}</strong>
                </div>

                <div className="resultCard">
  <span>Passo</span>
  <strong>{formatarNumeroBR(curva.passo, 2)} mL</strong>
</div>
              </div>

              <div className="explanationBox curveConsultBox">
                <h3>Consultar ponto da curva</h3>

                <div className="curveConsultGrid">
                  <label>
                    Volume de EDTA adicionado
                    <input
                      value={volumeConsulta}
                      onChange={(event) =>
                        setVolumeConsulta(event.target.value)
                      }
                      placeholder="Ex: 20,00"
                    />
                  </label>

                  <button
                    type="button"
                    className="primaryButton"
                    onClick={consultarPonto}
                  >
                    Consultar ponto
                  </button>
                </div>
              </div>

              {pontoConsulta && (
                <div className="resultGrid curvePointGrid">
                  <div className="resultCard">
                    <span>Volume</span>
                    <strong>
                      {formatarNumeroBR(pontoConsulta.volume, 2)} mL
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>pM</span>
                    <strong>{formatarNumeroBR(pontoConsulta.pM, 2)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>[M] livre</span>
                    <strong>
                      {formatarCientificoBR(pontoConsulta.metalLivre)}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>[MY]</span>
                    <strong>{formatarCientificoBR(pontoConsulta.MY)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>% complexado</span>
                    <strong>
                      {formatarNumeroBR(
                        pontoConsulta.percentualComplexado,
                        4
                      )}
                      %
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Região</span>
                    <strong>{pontoConsulta.regiao}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="resultsPanel curveTablePanel">
              <h2>Tabela da curva</h2>

              <div className="curveTableScroll">
                <table className="curve-table">
                  <thead>
                    <tr>
                      <th>V EDTA</th>
                      <th>pM</th>
                      <th>% complexado</th>
                      <th>Região</th>
                    </tr>
                  </thead>

                  <tbody>
                    {curva.pontos.slice(0, 120).map((ponto) => (
                      <tr key={ponto.volume}>
                        <td>{formatarNumeroBR(ponto.volume, 2)} mL</td>
                        <td>
                          <strong>{formatarNumeroBR(ponto.pM, 4)}</strong>
                        </td>
                        <td>
                          {formatarNumeroBR(ponto.percentualComplexado, 4)}%
                        </td>
                        <td>{ponto.regiao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <small>
                Exibindo até 120 pontos para manter a tela leve no navegador.
              </small>
            </div>
          </div>
        </section>
      )}

      {resultado && abaAtiva === "indicadores" && (
        <section className="container calculatorSection">
          <div className="indicatorDashboard">
            <div className="resultsPanel indicatorHeroPanel">
              <div className="indicatorHeroContent">
                <div>
                  <span className="eyebrow">
                    {melhorIndicador
                      ? "Indicador recomendado"
                      : "Sem indicador plenamente compatível"}
                  </span>

                  <h2>
                    {melhorIndicador
                      ? melhorIndicador.indicador
                      : "Avaliação qualitativa dos indicadores"}
                  </h2>

                  <p>
  A recomendação considera compatibilidade com o metal, faixa útil de pH,
  metal preferencial e prioridade geral da base.
</p>
                </div>

                {melhorIndicador && (
                  <div className="indicatorScoreCircle">
                    <strong>{melhorIndicador.score}%</strong>
                    <span>compatibilidade</span>
                  </div>
                )}
              </div>
            </div>

            <div className="resultsPanel">
              <span className="eyebrow">Critérios usados</span>
              <h2>Como o AnalitCalc recomenda o indicador</h2>

              <div className="resultGrid">
                <div className="resultCard">
                  <span>Metal analisado</span>
                  <strong>{resultado.metalPrincipal.metal}</strong>
                </div>

                <div className="resultCard">
                  <span>pH informado</span>
                  <strong>{formatarDecimal(resultado.entradas.pH, 2)}</strong>
                </div>

                <div className="resultCard">
                  <span>Critério principal</span>
                  <strong>Metal + pH</strong>
                </div>
              </div>
            </div>

            <div className="resultsPanel">
              <h2>Ranking de indicadores</h2>

              {rankingIndicadores.length === 0 ? (
                <div className="explanationBox">
                  <p>
                    Nenhum indicador encontrado na base para as condições
                    avaliadas.
                  </p>
                </div>
              ) : (
                <div className="indicatorRankingList">
                  {rankingIndicadores.slice(0, 10).map((indicador, index) => (
                    <div
                      key={indicador.id}
                      className={`indicatorRankingItem ${indicador.classificacao}`}
                    >
                      <div className="indicatorRankNumber">#{index + 1}</div>

                      <div className="indicatorRankMain">
  <strong>{indicador.indicador}</strong>

  <div className="indicatorMetaGrid">
    <div className="indicatorMetaItem">
      <span>Metais recomendados</span>
      <strong>{indicador.metaisRecomendados}</strong>
    </div>

    <div className="indicatorMetaItem">
      <span>Metal preferencial</span>
      <strong>{indicador.metalPreferencial}</strong>
    </div>

    <div className="indicatorMetaItem">
      <span>pH útil</span>
      <strong>
        {formatarNumeroBR(indicador.pHMin, 1)} –{" "}
        {formatarNumeroBR(indicador.pHMax, 1)}
      </strong>
    </div>

    <div className="indicatorMetaItem">
      <span>Cores</span>
      <strong>
        {indicador.corLivre} → {indicador.corComplexado}
      </strong>
    </div>
  </div>

  <p className="indicatorJustification">
    {indicador.justificativa}
  </p>

  <div className="indicatorInfoGrid">
    {indicador.aplicacao && (
      <div>
        <span>Aplicação</span>
        <p>{indicador.aplicacao}</p>
      </div>
    )}

    {indicador.observacao && (
      <div>
        <span>Observação</span>
        <p>{indicador.observacao}</p>
      </div>
    )}

    {indicador.referencia && (
      <div>
        <span>Referência</span>
        <p>{indicador.referencia}</p>
      </div>
    )}
  </div>
</div>

                      <div className="indicatorRankScore">
                        <strong>{indicador.score}%</strong>
                        <span>
                          {indicador.classificacao === "recomendado"
                            ? "recomendado"
                            : indicador.classificacao === "parcial"
                              ? "parcial"
                              : "não recomendado"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

{resultado && curva && abaAtiva === "interferentes" && (
  <section className="container calculatorSection">
    <div className="interferenceDashboard">
    <div className="resultsPanel interferenceSelectorPanel">
  <h2>Selecionar interferentes</h2>
  <div className="interferenceCheckboxList">
          {metaisEdta
            .filter((metal) => metal.idMetal !== metalPrincipal)
            .map((metal) => (
              <label key={metal.idMetal} className="interferenceCheckbox">
                <input
                  type="checkbox"
                  checked={interferentes.includes(metal.idMetal)}
                  onChange={() => alternarInterferente(metal.idMetal)}
                />

                <span>
                  <strong>{metal.metal}</strong> — {metal.nome}
                </span>
              </label>
            ))}
        </div>

        <button
  type="button"
  className="primaryButton"
  onClick={() => avaliar("interferentes")}
>
  Atualizar análise
</button>
      </div>

      <div className="interferenceHeader">
        AVALIAÇÃO DOS INTERFERENTES
      </div>

      <div className="resultsPanel interferenceHero">
        <div className="interferenceIcon">⚠</div>

        <div>
          <h2>
          {resultado.interferentes.length === 0
  ? "Nenhum interferente selecionado"
  : interferentesCriticos.length > 0
    ? "Interferência relevante identificada"
    : interferentesModerados.length > 0
      ? "Interferência moderada identificada"
      : "Interferência baixa nas condições avaliadas"}
          </h2>

          <p>
  O sistema compara os Kf cadastrados dos metais presentes. A avaliação
  considera a força relativa de complexação com EDTA, a separação entre os Kf e
  o efeito do pH sobre o Kf condicional do metal analisado.
</p>
        </div>
      </div>

      <div className="interferenceSummaryGrid">
  <div className="resultsPanel interferenceSummaryCard">
    <h3>Risco global</h3>

    <strong
      className={
        riscoGlobalInterferentes === "ALTO"
          ? "riskBadge high"
          : riscoGlobalInterferentes === "MODERADO"
            ? "riskBadge medium"
            : "riskBadge low"
      }
    >
      {riscoGlobalInterferentes}
    </strong>

    <p>{resultado.interferentes.length} interferente(s) avaliado(s).</p>
  </div>

  <div className="resultsPanel interferenceSummaryCard">
    <h3>Podem interferir</h3>

    <strong className="bigNumber">{interferentesCriticos.length}</strong>

    <p>
      {interferentesCriticos.length > 0
        ? nomesInterferentesCriticos
        : "Nenhum metal com interferência forte."}
    </p>
  </div>

  <div className="resultsPanel interferenceSummaryCard">
    <h3>Mascarante</h3>

    <div className={precisaMascarante ? "maskBox warn" : "maskBox ok"}>
      {precisaMascarante ? (
        nomeMascarante ? (
          <>
            <strong>{nomeMascarante}</strong>
            {observacaoMascarante && <small>{observacaoMascarante}</small>}
          </>
        ) : (
          <>
            <strong>Avaliar mascaramento</strong>
            <small>
              Nenhum mascarante compatível foi encontrado na base para esta
              condição.
            </small>
          </>
        )
      ) : (
        <>
          <strong>Não indicado</strong>
          <small>Não há indicação forte de mascarante nesta condição.</small>
        </>
      )}
    </div>
  </div>
</div>

      <div className="resultsPanel curveMainPanel">
        <h2>Curvas comparativas</h2>

        <CurvaEdtaChart
  curva={curva}
  curvasInterferentes={curvasInterferentes}
  metalPrincipalLabel={resultado.metalPrincipal.metal}
  titulo="Curva principal e interferentes"
  descricao="Comparação entre o metal principal e os metais interferentes selecionados"
/>

        <div className="explanationBox">
          <h3>Como interpretar o gráfico</h3>

          <p>
            A curva vermelha representa o metal principal selecionado. As curvas
            tracejadas representam os interferentes. Quanto mais próxima ou mais
            favorecida estiver a curva do interferente, maior a possibilidade de
            competição pelo EDTA.
          </p>
        </div>
      </div>

      <div className="resultsPanel interferenceComparisonPanel">
        <h2>Resultado da comparação dos Kf</h2>

        {resultado.interferentes.length === 0 ? (
          <div className="explanationBox">
            <p>
              Nenhum interferente selecionado. Marque um ou mais metais para
              avaliar a competição pelo EDTA.
            </p>
          </div>
        ) : (
          <div className="interferenceCardsList">
            {resultado.interferentes.map((item) => {
  const classeRisco =
    item.risco === "Alta" || item.risco === "Significativa"
      ? "high"
      : item.risco === "Moderada"
        ? "medium"
        : "low";

  const textoStatus =
    item.risco === "Sem interferência"
      ? "Não interfere"
      : item.risco === "Baixa"
        ? "Interferência baixa"
        : item.risco === "Moderada"
          ? "Observar"
          : "Pode interferir";

  return (
    <div
      key={item.id}
      className={`interferenceResultCard ${classeRisco}`}
    >
      <div>
        <h3>
          {item.metal} — {item.nome}
        </h3>

        <p>{item.problema || item.acaoSistema || ""}</p>
      </div>

      <div className="interferenceMiniCard">
        <span>Razão Kf</span>
        <strong>
          {item.razaoKf ? formatarCientificoBR(item.razaoKf) : "-"}
        </strong>
      </div>

      <div className="interferenceMiniCard">
        <span>Risco</span>
        <strong>{item.risco}</strong>
      </div>

      <div className="interferenceDecision">{textoStatus}</div>
    </div>
  );
})}
          </div>
        )}
      </div>

      <div className="resultsPanel">
  <h2>Conclusão didática</h2>
  <p>{textoConclusaoInterferentes}</p>
</div>
    </div>
  </section>
)}

{resultado && curva && abaAtiva === "tempoReal" && (
  <section className="container calculatorSection">
    <div className="liveSimulationDashboard">
      <div className="resultsPanel liveIntroPanel">
        <span className="eyebrow">Simulação em tempo real</span>

        <h2>Simulação em tempo real da titulação com EDTA</h2>

        <p>
          Esta aba simula a adição gradual de EDTA sobre a curva ideal já
          calculada. A linha representa a curva completa e os pontos mostram os
          volumes adicionados pelo usuário.
        </p>
      </div>

      <div className="liveSimulationGrid">
        <div className="resultsPanel liveControlsPanel">
          <h2>Controles da titulação</h2>

          <div className="liveVolumeBox">
            <span>Volume atual</span>
            <strong>{formatarNumeroBR(volumeAtualTempoReal, 2)} mL</strong>
          </div>

          <div className="liveButtonGrid">
  <button
    type="button"
    onClick={() => adicionarVolumeTempoReal(0.05)}
  >
    +0,05 mL
  </button>

  <button
    type="button"
    onClick={() => adicionarVolumeTempoReal(0.1)}
  >
    +0,10 mL
  </button>

  <button
    type="button"
    onClick={() => adicionarVolumeTempoReal(0.5)}
  >
    +0,50 mL
  </button>

  <button
    type="button"
    onClick={() => adicionarVolumeTempoReal(1)}
  >
    +1,00 mL
  </button>

  <button
    type="button"
    onClick={() => adicionarVolumeTempoReal(5)}
  >
    +5,00 mL
  </button>
</div>

          <div className="liveManualBox">
            <label>
              Adicionar volume personalizado (mL)
              <input
                value={volumeManualTempoReal}
                onChange={(event) =>
                  setVolumeManualTempoReal(event.target.value)
                }
                placeholder="Ex.: 5,00"
              />
            </label>

            <button
              type="button"
              className="primaryButton"
              onClick={adicionarVolumeManualTempoReal}
            >
              Adicionar
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={irParaPETempoReal}
            >
              Ir para PE
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={limparTempoReal}
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="resultsPanel liveChartPanel">
          <SimulacaoTempoRealEdtaChart
            curva={curva}
            pontosAdicionados={pontosTempoReal}
          />
        </div>
      </div>

      <div className="resultsPanel">
        <h2>Ponto atual</h2>

        {pontosTempoReal.length === 0 ? (
          <div className="resultGrid">
            <div className="resultCard">
              <span>Volume EDTA</span>
              <strong>-</strong>
            </div>

            <div className="resultCard">
              <span>pM</span>
              <strong>-</strong>
            </div>

            <div className="resultCard">
              <span>[M] livre</span>
              <strong>-</strong>
            </div>

            <div className="resultCard">
              <span>[MY]</span>
              <strong>-</strong>
            </div>

            <div className="resultCard">
              <span>% complexado</span>
              <strong>-</strong>
            </div>

            <div className="resultCard">
              <span>Região</span>
              <strong>-</strong>
            </div>
          </div>
        ) : (
          <div className="resultGrid">
            {(() => {
              const pontoAtual = pontosTempoReal[pontosTempoReal.length - 1];

              return (
                <>
                  <div className="resultCard">
                    <span>Volume EDTA</span>
                    <strong>
                      {formatarNumeroBR(pontoAtual.volume, 2)} mL
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>pM</span>
                    <strong>{formatarNumeroBR(pontoAtual.pM, 2)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>[M] livre</span>
                    <strong>
                      {formatarCientificoBR(pontoAtual.metalLivre)}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>[MY]</span>
                    <strong>{formatarCientificoBR(pontoAtual.MY)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>% complexado</span>
                    <strong>
                      {formatarNumeroBR(
                        pontoAtual.percentualComplexado,
                        2
                      )}
                      %
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Região</span>
                    <strong>{pontoAtual.regiao}</strong>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <div className="resultsPanel">
        <h2>Pontos adicionados</h2>

        {pontosTempoReal.length === 0 ? (
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
                  <th>pM</th>
                  <th>[M] livre</th>
                  <th>[MY]</th>
                  <th>% complexado</th>
                  <th>Região</th>
                </tr>
              </thead>

              <tbody>
                {pontosTempoReal.map((ponto, index) => (
                  <tr key={`${ponto.volume}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{formatarNumeroBR(ponto.volume, 2)} mL</td>
                    <td>
                      <strong>{formatarNumeroBR(ponto.pM, 4)}</strong>
                    </td>
                    <td>{formatarCientificoBR(ponto.metalLivre)}</td>
                    <td>{formatarCientificoBR(ponto.MY)}</td>
                    <td>
                      {formatarNumeroBR(ponto.percentualComplexado, 4)}%
                    </td>
                    <td>{ponto.regiao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </section>
)}

      {resultado && curva && abaAtiva === "derivadas" && (
        <section className="container calculatorSection">
          <div className="curveDashboard">
            <div className="resultsPanel">
              <h2>Derivadas da curva</h2>

              <div className="resultGrid">
                <div className="resultCard">
                  <span>PE estequiométrico</span>
                  <strong>
                    {curva.volumePE
                      ? `${formatarNumeroBR(curva.volumePE, 2)} mL`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Pico da 1ª derivada</span>
                  <strong>
                    {picoPrimeiraDerivada
                      ? `${formatarNumeroBR(
                          picoPrimeiraDerivada.volumeEstimadoPE,
                          2
                        )} mL`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Diferença 1ª derivada</span>
                  <strong>
                    {diferencaPrimeiraDerivada !== null
                      ? `${formatarNumeroBR(diferencaPrimeiraDerivada, 2)} mL`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Troca de sinal 2ª derivada</span>
                  <strong>
                    {trocaSegundaDerivada
                      ? `${formatarNumeroBR(
                          trocaSegundaDerivada.volumeEstimado,
                          2
                        )} mL`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Sinal da 2ª derivada</span>
                  <strong>
                    {trocaSegundaDerivada
                      ? `${trocaSegundaDerivada.sinalAntes} → ${trocaSegundaDerivada.sinalDepois}`
                      : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Diferença 2ª derivada</span>
                  <strong>
                    {diferencaSegundaDerivada !== null
                      ? `${formatarNumeroBR(diferencaSegundaDerivada, 2)} mL`
                      : "-"}
                  </strong>
                </div>
              </div>

              <div className="derivativeChartsGrid">
                <DerivadaEdtaChart
                  tipo="primeira"
                  titulo="1ª derivada da curva"
                  descricao="Variação de pM em relação ao volume de EDTA adicionado"
                  pontos={primeiraDerivada}
                  volumePE={curva.volumePE}
                  volumeDestaque={
                    picoPrimeiraDerivada?.volumeEstimadoPE ?? null
                  }
                />

                <DerivadaEdtaChart
                  tipo="segunda"
                  titulo="2ª derivada da curva"
                  descricao="Mudança da inclinação da curva pM × volume"
                  pontos={segundaDerivada}
                  volumePE={curva.volumePE}
                  volumeDestaque={trocaSegundaDerivada?.volumeEstimado ?? null}
                />
              </div>

              <div className="explanationBox">
                <h3>Interpretação</h3>
                <p>
                  A primeira derivada identifica o ponto de maior variação da
                  curva pM × volume de EDTA. Em uma titulação bem definida, esse
                  pico deve ocorrer próximo ao ponto de equivalência.
                </p>

                <p>
                  A segunda derivada avalia a mudança de concavidade da curva. A
                  troca de sinal também deve ocorrer na região do ponto de
                  equivalência.
                </p>
              </div>
            </div>

            <div className="resultsPanel">
              <h2>Tabela da 1ª derivada</h2>

              <div className="curveTableScroll">
                <table className="curve-table">
                  <thead>
                    <tr>
                      <th>Volume médio</th>
                      <th>V inicial</th>
                      <th>V final</th>
                      <th>ΔpM/ΔV</th>
                    </tr>
                  </thead>

                  <tbody>
                    {primeiraDerivada.slice(0, 120).map((ponto) => (
                      <tr key={`${ponto.volumeInicial}-${ponto.volumeFinal}`}>
                        <td>{formatarNumeroBR(ponto.volume, 2)} mL</td>
<td>{formatarNumeroBR(ponto.volumeInicial, 2)} mL</td>
<td>{formatarNumeroBR(ponto.volumeFinal, 2)} mL</td>
                        <td>
                          <strong>{formatarNumeroBR(ponto.derivada, 6)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <small>
                Exibindo até 120 pontos para manter a tela leve no navegador.
              </small>
            </div>

            <div className="resultsPanel">
              <h2>Tabela da 2ª derivada</h2>

              <div className="curveTableScroll">
                <table className="curve-table">
                  <thead>
                    <tr>
                      <th>Volume médio</th>
                      <th>Derivada anterior</th>
                      <th>Derivada atual</th>
                      <th>Δ²pM/ΔV²</th>
                    </tr>
                  </thead>

                  <tbody>
                    {segundaDerivada.slice(0, 120).map((ponto) => (
                      <tr key={`${ponto.volumeInicial}-${ponto.volumeFinal}`}>
                        <td>{formatarNumeroBR(ponto.volume, 2)} mL</td>
                        <td>
                          {formatarNumeroBR(ponto.derivadaAnterior, 6)}
                        </td>
                        <td>{formatarNumeroBR(ponto.derivadaAtual, 6)}</td>
                        <td>
                          <strong>
                            {formatarNumeroBR(ponto.segundaDerivada, 6)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <small>
                Exibindo até 120 pontos para manter a tela leve no navegador.
              </small>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}