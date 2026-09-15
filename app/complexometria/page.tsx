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
import { useAnalitBot } from "../contexts/AnalitBotContext";

import "../precipitacao/styles/precipitacao.css";

type AbaAtiva =
  | "visao"
  | "baseCalculo"
  | "curva"
  | "indicadores"
  | "interferentes"
  | "derivadas"
  | "efeitoConcentracao"
  | "tempoReal";

  export default function ComplexometriaPage() {
    const { atualizarDados } = useAnalitBot();
  
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

  const [
    volumeAtualTempoReal,
    setVolumeAtualTempoReal,
  ] = useState(0);
  
  const [
    volumeManualTempoReal,
    setVolumeManualTempoReal,
  ] = useState("");
  
  const [
    pontosTempoReal,
    setPontosTempoReal,
  ] = useState<PontoCurvaEDTA[]>([]);
  
  const [
    concMetalEfeito,
    setConcMetalEfeito,
  ] = useState("");
  
  const [
    concEDTAEfeito,
    setConcEDTAEfeito,
  ] = useState("");
  
  const [
    resultadoEfeitoConcentracao,
    setResultadoEfeitoConcentracao,
  ] =
    useState<ResultadoAvaliacaoEDTA | null>(
      null
    );
  
  const [
    curvaEfeitoConcentracao,
    setCurvaEfeitoConcentracao,
  ] =
    useState<CurvaEDTA | null>(
      null
    );
  
  const [
    mensagemEfeitoConcentracao,
    setMensagemEfeitoConcentracao,
  ] = useState("");

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

setConcMetalEfeito("");
setConcEDTAEfeito("");

setResultadoEfeitoConcentracao(
  null
);

setCurvaEfeitoConcentracao(
  null
);

setMensagemEfeitoConcentracao(
  ""
);
atualizarDados({
  moduloAtual: "Complexometria com EDTA",
  tipoSistema: "Titulação complexométrica com EDTA",
  resumoCalculo: "Nenhum sistema complexométrico foi avaliado ainda.",
  contextoTexto: "Nenhum sistema complexométrico foi avaliado ainda.",
});
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
      
      atualizarDados({
        moduloAtual: "Complexometria com EDTA",
        tipoSistema: "Titulação complexométrica com EDTA",
        resumoCalculo: `${avaliacao.metalPrincipal.metal} titulado com EDTA em pH ${formatarNumeroBR(
          avaliacao.entradas.pH,
          2
        )}. PE em ${
          curvaGerada.volumePE
            ? `${formatarNumeroBR(curvaGerada.volumePE, 2)} mL`
            : "volume não definido"
        }.`,
        contextoTexto: `
      Módulo: Complexometria com EDTA.
      Metal principal: ${avaliacao.metalPrincipal.metal} — ${avaliacao.metalPrincipal.nome}.
      Complexo formado: ${avaliacao.metalPrincipal.complexo}.
      pH avaliado: ${formatarNumeroBR(avaliacao.entradas.pH, 2)}.
      Volume de equivalência: ${
          curvaGerada.volumePE
            ? `${formatarNumeroBR(curvaGerada.volumePE, 2)} mL`
            : "Não calculado"
        }.
        α(Y⁴⁻): ${formatarCientificoBR(
          avaliacao.metalPrincipal.alpha
        )}.
        α do metal livre: ${formatarCientificoBR(
          avaliacao.metalPrincipal.alfaMetalLivre
        )}.
        Kf condicional: ${formatarCientificoBR(
          avaliacao.metalPrincipal.kfEfetivo
        )}.
        Status da titulação: ${avaliacao.metalPrincipal.status}.
      Mensagem do sistema: ${avaliacao.metalPrincipal.mensagem}
      Resumo químico: ${avaliacao.resumo.texto}
      Interferentes avaliados: ${
          avaliacao.interferentes.length > 0
            ? avaliacao.interferentes
                .map((item) => `${item.metal} — risco ${item.risco}`)
                .join("; ")
            : "Nenhum interferente selecionado"
        }.
      Indicador mais compatível: ${
          ranking[0]
            ? `${ranking[0].indicador} (${ranking[0].score}% de compatibilidade)`
            : "Nenhum indicador compatível encontrado"
        }.
      `,
      });
      
      setResultado(avaliacao);
setCurva(curvaGerada);
setRankingIndicadores(ranking);

setConcMetalEfeito(
  concMetal
);

setConcEDTAEfeito(
  concEDTA
);

setResultadoEfeitoConcentracao(
  null
);

setCurvaEfeitoConcentracao(
  null
);

setMensagemEfeitoConcentracao(
  ""
);

setPontoConsulta(null);
setVolumeConsulta("");

setVolumeAtualTempoReal(0);
setVolumeManualTempoReal("");
setPontosTempoReal([]);

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

  function aplicarEfeitoConcentracao() {
    setMensagemEfeitoConcentracao(
      ""
    );
  
    if (!resultado || !curva) {
      setMensagemEfeitoConcentracao(
        "Avalie primeiro o sistema complexométrico."
      );
  
      return;
    }
  
    const novaConcMetal =
      Number(
        concMetalEfeito
          .replace(",", ".")
          .trim()
      );
  
    const novaConcEDTA =
      Number(
        concEDTAEfeito
          .replace(",", ".")
          .trim()
      );
  
    if (
      !Number.isFinite(
        novaConcMetal
      ) ||
      novaConcMetal <= 0
    ) {
      setMensagemEfeitoConcentracao(
        "Informe uma concentração válida e positiva para o metal."
      );
  
      return;
    }
  
    if (
      !Number.isFinite(
        novaConcEDTA
      ) ||
      novaConcEDTA <= 0
    ) {
      setMensagemEfeitoConcentracao(
        "Informe uma concentração válida e positiva para o EDTA."
      );
  
      return;
    }
  
    try {
      const simulacao =
        avaliarSistemaEDTA({
          ...resultado.entradas,
  
          concMetal:
            novaConcMetal,
  
          concEDTA:
            novaConcEDTA,
        });
  
      const curvaSimulada =
        gerarCurvaEDTA(
          simulacao,
          {
            passo: curva.passo,
          }
        );
  
      setResultadoEfeitoConcentracao(
        simulacao
      );
  
      setCurvaEfeitoConcentracao(
        curvaSimulada
      );
  
      setMensagemEfeitoConcentracao(
        "Novas concentrações aplicadas com sucesso."
      );
    } catch (error) {
      setResultadoEfeitoConcentracao(
        null
      );
  
      setCurvaEfeitoConcentracao(
        null
      );
  
      setMensagemEfeitoConcentracao(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o efeito das novas concentrações."
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

  function formatarFormulaQuimica(valor: string) {
    return valor
      .replace(/4-/g, "⁴⁻")
      .replace(/3-/g, "³⁻")
      .replace(/2-/g, "²⁻")
      .replace(/1-/g, "⁻")
      .replace(/4\+/g, "⁴⁺")
      .replace(/3\+/g, "³⁺")
      .replace(/2\+/g, "²⁺")
      .replace(/1\+/g, "⁺")
      .replace(/([A-Z][a-z]?)\+/g, "$1⁺");
  }

  function formatarTextoQuimico(texto: string) {
    const textoComNumerosBR = texto.replace(/(\d)\.(\d)/g, "$1,$2");
  
    const textoFormatado = formatarFormulaQuimica(textoComNumerosBR);
    const partes = textoFormatado.split(/(Kf'|Kf)/g);
  
    return (
      <>
        {partes.map((parte, index) => {
          if (parte === "Kf") {
            return (
              <span key={index}>
                K<sub>f</sub>
              </span>
            );
          }
  
          if (parte === "Kf'") {
            return (
              <span key={index}>
                K<sub>f</sub>′
              </span>
            );
          }
  
          return <span key={index}>{parte}</span>;
        })}
      </>
    );
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
  (item) => item.risco === "Alto" || item.risco === "Significativo"
);

const interferentesModerados = interferentesAvaliados.filter(
  (item) => item.risco === "Moderado"
);

const interferentesBaixos = interferentesAvaliados.filter(
  (item) => item.risco === "Baixo"
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
  .map((item) => formatarFormulaQuimica(item.metal))
  .join(", ");

const nomesInterferentesModerados = interferentesModerados
  .map((item) => formatarFormulaQuimica(item.metal))
  .join(", ");

const nomesInterferentesBaixos = interferentesBaixos
  .map((item) => formatarFormulaQuimica(item.metal))
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

  const interferentesSemSeparacao =
  interferentesAvaliados.filter(
    (item) =>
      Number.isFinite(item.razaoKf) &&
      item.razaoKf < 1e8
  );

const nomesInterferentesSemSeparacao =
  interferentesSemSeparacao
    .map((item) =>
      formatarFormulaQuimica(
        item.metal
      )
    )
    .join(", ");

const textoConclusaoInterferentes =
  interferentesAvaliados.length === 0
    ? "Nenhum interferente foi selecionado para comparação."
    : interferentesSemSeparacao.length > 0
      ? `Os metais ${nomesInterferentesSemSeparacao} apresentam razão entre os Kf inferior a 10⁸ em relação ao metal analisado. Portanto, não há separação suficiente para uma determinação seletiva apenas pela diferença das constantes de formação. Se esses metais estiverem presentes simultaneamente e nenhum agente mascarante for utilizado, o ponto de equivalência corresponderá à soma dos metais que reagem com o EDTA. A análise também considera os valores de Kcondicional nas condições de pH e complexação auxiliar informadas.`
      : "Todos os interferentes selecionados apresentam razão entre os Kf igual ou superior a 10⁸ em relação ao metal analisado. Nessas condições, a separação pelas constantes de formação é considerada suficiente. Os valores de Kcondicional também são avaliados para representar as condições reais de pH e eventual complexação auxiliar.";
      
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

    function calcularMediana(valores: number[]) {
      const ordenados = valores
        .filter((valor) => Number.isFinite(valor))
        .map((valor) => Math.abs(valor))
        .sort((a, b) => a - b);
    
      if (ordenados.length === 0) return 0;
    
      const meio = Math.floor(ordenados.length / 2);
    
      if (ordenados.length % 2 === 0) {
        return (ordenados[meio - 1] + ordenados[meio]) / 2;
      }
    
      return ordenados[meio];
    }
    
    function variacaoEhSignificativa(
      valores: number[],
      limiarMinimo = 0.02,
      fatorMinimo = 5
    ) {
      const absolutos = valores
        .filter((valor) => Number.isFinite(valor))
        .map((valor) => Math.abs(valor));
    
      if (absolutos.length === 0) return false;
    
      const maximo = Math.max(...absolutos);
      const mediana = calcularMediana(absolutos);
    
      if (maximo < limiarMinimo) return false;
    
      if (mediana === 0) {
        return maximo >= limiarMinimo;
      }
    
      return maximo >= mediana * fatorMinimo;
    }
    
    const primeiraDerivadaSignificativa =
      picoPrimeiraDerivada !== null &&
      variacaoEhSignificativa(
        primeiraDerivada.map((ponto) => ponto.derivada),
        0.02,
        5
      );
    
    const segundaDerivadaSignificativa =
      trocaSegundaDerivada !== null &&
      variacaoEhSignificativa(
        segundaDerivada.map((ponto) => ponto.segundaDerivada),
        0.02,
        5
      );
    
    const volumeDestaquePrimeiraDerivada =
      primeiraDerivadaSignificativa && picoPrimeiraDerivada
        ? picoPrimeiraDerivada.volumeEstimadoPE
        : null;
    
    const volumeDestaqueSegundaDerivada =
      segundaDerivadaSignificativa && trocaSegundaDerivada
        ? trocaSegundaDerivada.volumeEstimado
        : null;
    
    const diferencaPrimeiraDerivada =
      primeiraDerivadaSignificativa && picoPrimeiraDerivada && curva?.volumePE
        ? Math.abs(picoPrimeiraDerivada.volumeEstimadoPE - curva.volumePE)
        : null;
    
    const diferencaSegundaDerivada =
      segundaDerivadaSignificativa && trocaSegundaDerivada && curva?.volumePE
        ? Math.abs(trocaSegundaDerivada.volumeEstimado - curva.volumePE)
        : null;

    const equilibrioNoPE =
  curva?.pontoPE ??
  (resultado?.volumePE
    ? calcularPontoCurvaEDTA(resultado, resultado.volumePE)
    : null);

    const kfAbsoluto =
  resultado?.metalPrincipal.alpha &&
  resultado.metalPrincipal.alpha > 0 &&
  resultado.metalPrincipal.kfCondicional
    ? resultado.metalPrincipal.kfCondicional / resultado.metalPrincipal.alpha
    : null;

const logKfAbsoluto =
  kfAbsoluto && kfAbsoluto > 0 ? Math.log10(kfAbsoluto) : null;

  const betaAuxiliar =
  metalComplexado === "sim"
    ? (betasComplexantes as any[]).find(
        (beta) =>
          beta.idMetal === metalPrincipal &&
          beta.idComplexante === complexanteAuxiliar
      )
    : null;

const concentracaoAuxiliarNumero = concComplexanteAuxiliar
  ? Number(concComplexanteAuxiliar.replace(",", "."))
  : null;

  type BetaUsado = {
    indice: number;
    valor: number;
  };
  
  function extrairBetasUsados(beta: any): BetaUsado[] {
    if (!beta) return [];
  
    const candidatos = [
      beta.beta1,
      beta.beta2,
      beta.beta3,
      beta.beta4,
      beta.beta5,
      beta.beta6,
    ];
  
    const betasPorIndice: BetaUsado[] = candidatos
      .map((valor: unknown, index: number) => ({
        indice: index + 1,
        valor: Number(valor),
      }))
      .filter((item: BetaUsado) => Number.isFinite(item.valor) && item.valor > 0);
  
    if (betasPorIndice.length > 0) {
      return betasPorIndice;
    }
  
    if (Array.isArray(beta.betas)) {
      return beta.betas
        .map((valor: unknown, index: number) => ({
          indice: index + 1,
          valor: Number(valor),
        }))
        .filter(
          (item: BetaUsado) => Number.isFinite(item.valor) && item.valor > 0
        );
    }
  
    const betaUnico =
      beta.beta ??
      beta.betaGlobal ??
      beta.valorBeta ??
      beta.valor ??
      beta.Beta ??
      null;
  
    const valorBetaUnico = Number(betaUnico);
  
    if (Number.isFinite(valorBetaUnico) && valorBetaUnico > 0) {
      return [{ indice: 1, valor: valorBetaUnico }];
    }
  
    return [];
  }

const betasUsados = extrairBetasUsados(betaAuxiliar);

    const betaUsadoTexto =
    betasUsados.length > 0
      ? betasUsados.map((beta: BetaUsado) => ({
          indice: beta.indice,
          texto: `β${beta.indice} = ${formatarCientificoBR(beta.valor)}`,
        }))
      : [];

const nomeComplexanteAuxiliar =
  complexantesAuxiliares.find(
    (item) => item.idComplexante === complexanteAuxiliar
  )?.complexante ?? complexanteAuxiliar;

  const volumePEOriginalEfeito =
  curva?.volumePE ?? null;

const volumePESimuladoEfeito =
  curvaEfeitoConcentracao?.volumePE ??
  null;

const deltaVolumePEEfeito =
  volumePEOriginalEfeito !== null &&
  volumePESimuladoEfeito !== null
    ? volumePESimuladoEfeito -
      volumePEOriginalEfeito
    : null;

const variacaoVolumePEEfeito =
  deltaVolumePEEfeito !== null &&
  volumePEOriginalEfeito !== null &&
  volumePEOriginalEfeito !== 0
    ? (
        deltaVolumePEEfeito /
        volumePEOriginalEfeito
      ) * 100
    : null;

const pMPEOriginalEfeito =
  curva?.pontoPE?.pM ?? null;

const pMPESimuladoEfeito =
  curvaEfeitoConcentracao
    ?.pontoPE?.pM ?? null;

const percentualComplexadoOriginalEfeito =
  curva?.pontoPE
    ?.percentualComplexado ??
  null;

const percentualComplexadoSimuladoEfeito =
  curvaEfeitoConcentracao
    ?.pontoPE
    ?.percentualComplexado ??
  null;

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
    {formatarFormulaQuimica(metal.metal)} — {metal.nome}
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
    pH {item.ph}
  </option>
))}
              </select>
            </label>

            <label>
              Concentração do metal
              <input
                value={concMetal}
                onChange={(event) => setConcMetal(event.target.value)}
                placeholder="Ex: 0,010"
              />
              <small>mol L⁻¹</small>
            </label>

            <label>
              Volume da amostra
              <input
                value={volAmostra}
                onChange={(event) => setVolAmostra(event.target.value)}
                placeholder="Ex: 25,00"
              />
              <small>mL</small>
            </label>

            <label>
              Concentração do EDTA
              <input
                value={concEDTA}
                onChange={(event) => setConcEDTA(event.target.value)}
                placeholder="Ex: 0,010"
              />
              <small>mol L⁻¹</small>
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
    placeholder="Ex: 0,10"
  />
  <small>mol L⁻¹</small>
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
                    <strong>{formatarFormulaQuimica(resultado.metalPrincipal.metal)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>Complexo</span>
                    <strong>{formatarFormulaQuimica(resultado.metalPrincipal.complexo)}</strong>
                  </div>

                  <div className="resultCard">
  <span className="chemLabel">
    α(Y⁴⁻)
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.alpha
    )}
  </strong>
</div>

<div className="resultCard">
  <span className="chemLabel">
    α do metal
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.alfaMetalLivre
    )}
  </strong>
</div>

<div className="resultCard">
  <span>
    K<sub>condicional</sub>
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.kfEfetivo
    )}
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
  <h3>
    Constante de formação condicional
  </h3>

  <p>
    <strong>
      K<sub>condicional</sub>
    </strong>{" "}
    é a constante de formação utilizada nas
    condições reais da titulação.
  </p>

  <p>
    Ela é calculada por:
  </p>

  <p>
    <strong>
      K<sub>condicional</sub> =
      K<sub>f</sub> × α(Y⁴⁻) × α
      <sub>metal</sub>
    </strong>
  </p>

  <p>
    α(Y⁴⁻) representa a fração do EDTA presente
    na forma totalmente ionizada e disponível
    para complexação. α
    <sub>metal</sub> representa a fração do
    metal que permanece livre para reagir com o
    EDTA quando houver agente complexante
    auxiliar.
  </p>

  <p>
    Na ausência de complexante auxiliar,
    α<sub>metal</sub> = 1.
  </p>
</div>

                <div className="explanationBox">
                  <h3>Interpretação química</h3>
                  <p>{formatarTextoQuimico(resultado.resumo.texto)}</p>
<p>{formatarTextoQuimico(resultado.metalPrincipal.mensagem)}</p>
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
        className={abaAtiva === "interferentes" ? "active" : ""}
        onClick={() => setAbaAtiva("interferentes")}
      >
        Interferentes
      </button>

      <button
        type="button"
        className={abaAtiva === "baseCalculo" ? "active" : ""}
        onClick={() => setAbaAtiva("baseCalculo")}
      >
        Base do cálculo
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
  className={
    abaAtiva === "derivadas"
      ? "active"
      : ""
  }
  onClick={() =>
    setAbaAtiva("derivadas")
  }
>
  Derivadas
</button>

<button
  type="button"
  className={
    abaAtiva === "efeitoConcentracao"
      ? "active"
      : ""
  }
  onClick={() =>
    setAbaAtiva("efeitoConcentracao")
  }
>
  Efeito da concentração
</button>

<button
  type="button"
  className={
    abaAtiva === "tempoReal"
      ? "active"
      : ""
  }
  onClick={() =>
    setAbaAtiva("tempoReal")
  }
>
  Tempo real
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

                <div className="resultCard phBufferCard">
  <span>Tampão sugerido</span>
  <strong>
    {resultado.metalPrincipal.avaliacaoPH.encontrado
      ? resultado.metalPrincipal.avaliacaoPH.tampaoRecomendado
      : "-"}
  </strong>
</div>
              </div>

              <div className="explanationBox">
              <p>
              {formatarTextoQuimico(resultado.metalPrincipal.avaliacaoPH.mensagem)}
</p>
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

{resultado && abaAtiva === "baseCalculo" && (
  <section className="container calculatorSection">
    <div className="curveDashboard">
      <div className="resultsPanel">
        <span className="eyebrow">Valores utilizados</span>
        <h2>Base do cálculo</h2>
        <p>
          Constantes e parâmetros numéricos usados pelo AnalitCalc na avaliação
          do sistema selecionado.
        </p>
      </div>

      <div className="resultsPanel">
        <h2>Metal principal</h2>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Metal</span>
            <strong>
              {formatarFormulaQuimica(resultado.metalPrincipal.metal)}
            </strong>
          </div>

          <div className="resultCard">
            <span>Complexo</span>
            <strong>
              {formatarFormulaQuimica(resultado.metalPrincipal.complexo)}
            </strong>
          </div>

          <div className="resultCard">
            <span>
              log K<sub>f</sub>
            </span>
            <strong>
              {logKfAbsoluto !== null
                ? formatarNumeroBR(logKfAbsoluto, 2)
                : "-"}
            </strong>
          </div>

          <div className="resultCard">
            <span>
              K<sub>f</sub> absoluto
            </span>
            <strong>
              {kfAbsoluto !== null ? formatarCientifico(kfAbsoluto) : "-"}
            </strong>
          </div>

          <div className="resultCard">
  <span className="chemLabel">
    α(Y⁴⁻)
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.alpha
    )}
  </strong>
</div>

<div className="resultCard">
  <span className="chemLabel">
    α do metal
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.alfaMetalLivre
    )}
  </strong>
</div>

<div className="resultCard">
  <span>
    K<sub>condicional</sub>
  </span>

  <strong>
    {formatarCientifico(
      resultado.metalPrincipal.kfEfetivo
    )}
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
      </div>

      <div className="resultsPanel">
        <h2>Complexante auxiliar</h2>

        {metalComplexado === "sim" ? (
  <div className="resultGrid">
    <div className="resultCard">
      <span>
        Complexante
      </span>

      <strong>
        {formatarFormulaQuimica(
          nomeComplexanteAuxiliar || "-"
        )}
      </strong>
    </div>

    <div className="resultCard betaValuesCard">
      <span className="chemLabel">
        β usados
      </span>

      {betaUsadoTexto.length > 0 ? (
        <div className="betaValuesList">
          {betaUsadoTexto.map(
            (beta) => (
              <strong key={beta.indice}>
                {beta.texto}
              </strong>
            )
          )}
        </div>
      ) : (
        <strong>-</strong>
      )}
    </div>

    <div className="resultCard">
      <span>
        Concentração
      </span>

      <strong className="complexometriaValorCompacto">
        {concentracaoAuxiliarNumero !== null
          ? `${formatarCientificoBR(
              concentracaoAuxiliarNumero
            )} mol L⁻¹`
          : "-"}
      </strong>
    </div>

    <div className="resultCard">
      <span className="chemLabel">
        α do metal
      </span>

      <strong>
        {formatarCientifico(
          resultado.metalPrincipal
            .alfaMetalLivre
        )}
      </strong>
    </div>

    <div className="resultCard">
      <span>
        K<sub>condicional</sub>
      </span>

      <strong>
        {formatarCientifico(
          resultado.metalPrincipal
            .kfEfetivo
        )}
      </strong>
    </div>
  </div>
) : (
  <div className="resultGrid">
    <div className="resultCard">
      <span>
        Complexante
      </span>

      <strong>
        Não utilizado
      </strong>
    </div>

    <div className="resultCard">
      <span>
        β usados
      </span>

      <strong>
        -
      </strong>
    </div>

    <div className="resultCard">
      <span className="chemLabel">
        α do metal
      </span>

      <strong>
        {formatarCientifico(
          resultado.metalPrincipal
            .alfaMetalLivre
        )}
      </strong>
    </div>

    <div className="resultCard">
      <span>
        K<sub>condicional</sub>
      </span>

      <strong>
        {formatarCientifico(
          resultado.metalPrincipal
            .kfEfetivo
        )}
      </strong>
    </div>
  </div>
)}
      </div>

      <div className="resultsPanel">
        <h2>Interferentes e razões de K<sub>f</sub></h2>

        {resultado.interferentes.length === 0 ? (
          <div className="resultGrid">
            <div className="resultCard">
              <span>Interferentes avaliados</span>
              <strong>Nenhum</strong>
            </div>
          </div>
        ) : (
          <div className="curveTableScroll">
            <table className="curve-table">
              <thead>
                <tr>
                  <th>Metal</th>
                  <th>
                    K<sub>f</sub> interferente
                  </th>
                  <th>
                    Razão K<sub>f</sub>
                  </th>
                  <th>Risco</th>
                </tr>
              </thead>

              <tbody>
                {resultado.interferentes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {formatarFormulaQuimica(item.metal)} — {item.nome}
                    </td>

                    <td>
                      {(item as any).kfInterferente
                        ? formatarCientificoBR((item as any).kfInterferente)
                        : (item as any).kf
                          ? formatarCientificoBR((item as any).kf)
                          : "-"}
                    </td>

                    <td>
                      {item.razaoKf ? formatarCientificoBR(item.razaoKf) : "-"}
                    </td>

                    <td>{item.risco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {curva && (
        <div className="resultsPanel">
          <h2>Parâmetros da curva</h2>

          <div className="resultGrid">
            <div className="resultCard">
              <span>Volume de equivalência</span>
              <strong>
                {curva.volumePE
                  ? `${formatarNumeroBR(curva.volumePE, 2)} mL`
                  : "-"}
              </strong>
            </div>

            <div className="resultCard">
              <span>Volume máximo</span>
              <strong>{formatarNumeroBR(curva.volumeMaximo, 2)} mL</strong>
            </div>

            <div className="resultCard">
              <span>Passo</span>
              <strong>{formatarNumeroBR(curva.passo, 2)} mL</strong>
            </div>
          </div>
        </div>
      )}
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
                      ? formatarNumeroBR(curva.pontoPE.pM, 2)
                      : "-"}
                  </strong>
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
                    <strong>{formatarNumeroBR(pontoConsulta.pM, 4)}</strong>
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
                          <strong>{formatarNumeroBR(ponto.pM, 2)}</strong>
                        </td>
                        <td>
                          {formatarNumeroBR(ponto.percentualComplexado, 2)}%
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
                  <strong>{formatarFormulaQuimica(resultado.metalPrincipal.metal)}</strong>
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
      <strong>{formatarFormulaQuimica(indicador.metaisRecomendados)}</strong>
    </div>

    <div className="indicatorMetaItem">
      <span>Metal preferencial</span>
      <strong>{formatarFormulaQuimica(indicador.metalPreferencial)}</strong>
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
  {formatarFormulaQuimica(indicador.corLivre)} →{" "}
  {formatarFormulaQuimica(indicador.corComplexado)}
</strong>
    </div>
  </div>

  <p className="indicatorJustification">
  {formatarFormulaQuimica(indicador.justificativa)}
</p>

  <div className="indicatorInfoGrid">
  {indicador.aplicacao && (
  <div>
    <span>Aplicação</span>
    <p>{formatarFormulaQuimica(indicador.aplicacao)}</p>
  </div>
)}

{indicador.observacao && (
  <div>
    <span>Observação</span>
    <p>{formatarFormulaQuimica(indicador.observacao)}</p>
  </div>
)}

    {indicador.referencia && (
  <div>
    <span>Referência</span>
    <p>{formatarFormulaQuimica(indicador.referencia)}</p>
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
  <strong>{formatarFormulaQuimica(metal.metal)}</strong> — {metal.nome}
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
  O sistema compara os K<sub>f</sub> dos
  metais e também considera as respectivas
  K<sub>condicional</sub> nas condições
  informadas. Quando a razão entre os K
  <sub>f</sub> é inferior a 10⁸, não há
  separação suficiente entre os metais e o
  ponto de equivalência será dado pela soma
  dos metais caso um agente mascarante não
  seja utilizado.
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
      <h2>
  Resultado da comparação dos K<sub>f</sub>
</h2>

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
        item.risco === "Alto" || item.risco === "Significativo"
          ? "high"
          : item.risco === "Moderado"
            ? "medium"
            : "low";

      return (
        <div
          key={item.id}
          className={`interferenceResultCard ${classeRisco}`}
        >
          <div>
            <h3>
              {formatarFormulaQuimica(item.metal)} — {item.nome}
            </h3>

            <p>
              {formatarTextoQuimico(item.problema || item.acaoSistema || "")}
            </p>
          </div>

          <div className="interferenceMiniCard">
  <span>
    Razão K<sub>f</sub>
  </span>

  <strong>
    {item.razaoKf
      ? formatarCientificoBR(
          item.razaoKf
        )
      : "-"}
  </strong>

  <small>
    Razão K
    <sub>condicional</sub>:{" "}
    {item.razaoKfCondicional
      ? formatarCientificoBR(
          item.razaoKfCondicional
        )
      : "-"}
  </small>
</div>

          <div className="interferenceMiniCard">
            <span>Risco</span>
            <strong>{item.risco}</strong>
          </div>
        </div>
      );
    })}
  </div>
)}
</div>

<div className="resultsPanel">
  <h2>Conclusão didática</h2>
  <p>{formatarTextoQuimico(textoConclusaoInterferentes)}</p>
</div>
    </div>
  </section>
)}

{resultado &&
  curva &&
  abaAtiva === "efeitoConcentracao" && (
    <section className="precipitacaoSimulationSection">
      <header className="precipitacaoSimulationIntro">
        <span className="precipitacaoSectionLabel">
          Comparação de cenários
        </span>

        <h5>
          Efeito da concentração
        </h5>

        <p>
          Altere as concentrações do metal e do EDTA e
          compare o novo cenário com as condições
          originais. O sistema recalcula o ponto de
          equivalência e o perfil da curva
          complexométrica.
        </p>
      </header>

      <section className="precipitacaoSimulationOriginal">
        <header>
          <span className="precipitacaoSectionLabel">
            Condição original
          </span>

          <h6>
            Dados usados como referência
          </h6>
        </header>

        <div className="precipitacaoSimulationOriginalGrid">
          <article>
            <span>
              Concentração do metal
            </span>

            <strong>
              {formatarNumeroBR(
                Number(
                  resultado.entradas.concMetal ?? 0
                ),
                4
              )}{" "}
              mol L⁻¹
            </strong>
          </article>

          <article>
            <span>
              Volume da amostra
            </span>

            <strong>
              {formatarNumeroBR(
                Number(
                  resultado.entradas.volAmostra ?? 0
                ),
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>
              Concentração do EDTA
            </span>

            <strong>
              {formatarNumeroBR(
                Number(
                  resultado.entradas.concEDTA ?? 0
                ),
                4
              )}{" "}
              mol L⁻¹
            </strong>
          </article>

          <article>
            <span>
              Capacidade da bureta
            </span>

            <strong>
              {formatarNumeroBR(
                Number(
                  resultado.entradas.volBureta ?? 0
                ),
                2
              )}{" "}
              mL
            </strong>
          </article>

          <article>
            <span>
              pH
            </span>

            <strong>
              {formatarNumeroBR(
                resultado.entradas.pH,
                2
              )}
            </strong>
          </article>

          <article>
            <span>
              PE original
            </span>

            <strong>
              {curva.volumePE !== null &&
              curva.volumePE !== undefined
                ? `${formatarNumeroBR(
                    curva.volumePE,
                    2
                  )} mL`
                : "-"}
            </strong>
          </article>
        </div>
      </section>

      <section className="precipitacaoSimulationPresets">
        <header>
          <span className="precipitacaoSectionLabel">
            Cenários rápidos
          </span>

          <h6>
            Observe o efeito da concentração
          </h6>
        </header>

        <div className="precipitacaoSimulationPresetButtons">
          <button
            type="button"
            onClick={() => {
              setConcMetalEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concMetal ?? 0
                  ) * 2,
                  4
                )
              );

              setConcEDTAEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concEDTA ?? 0
                  ),
                  4
                )
              );
            }}
          >
            Metal 2× mais concentrado
          </button>

          <button
            type="button"
            onClick={() => {
              setConcMetalEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concMetal ?? 0
                  ) * 0.5,
                  4
                )
              );

              setConcEDTAEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concEDTA ?? 0
                  ),
                  4
                )
              );
            }}
          >
            Metal 50% mais diluído
          </button>

          <button
            type="button"
            onClick={() => {
              setConcMetalEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concMetal ?? 0
                  ),
                  4
                )
              );

              setConcEDTAEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concEDTA ?? 0
                  ) * 2,
                  4
                )
              );
            }}
          >
            EDTA 2× mais concentrado
          </button>

          <button
            type="button"
            onClick={() => {
              setConcMetalEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concMetal ?? 0
                  ),
                  4
                )
              );

              setConcEDTAEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concEDTA ?? 0
                  ) * 0.5,
                  4
                )
              );
            }}
          >
            EDTA 50% mais diluído
          </button>
        </div>
      </section>

      <div className="precipitacaoSimulationWorkspace">
        <aside className="precipitacaoSimulationControls">
          <span className="precipitacaoSectionLabel">
            Parâmetros simulados
          </span>

          <h6>
            Configure o novo cenário
          </h6>

          <div className="precipitacaoSimulationForm">
            <label>
              Concentração do metal

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={concMetalEfeito}
                  onChange={(event) =>
                    setConcMetalEfeito(
                      event.target.value
                    )
                  }
                  placeholder={formatarNumeroBR(
                    Number(
                      resultado.entradas.concMetal ?? 0
                    ),
                    4
                  )}
                />

                <span>
                  mol L⁻¹
                </span>
              </div>
            </label>

            <label>
              Concentração do EDTA

              <div className="precipitacaoSimulationInputGroup">
                <input
                  type="text"
                  inputMode="decimal"
                  value={concEDTAEfeito}
                  onChange={(event) =>
                    setConcEDTAEfeito(
                      event.target.value
                    )
                  }
                  placeholder={formatarNumeroBR(
                    Number(
                      resultado.entradas.concEDTA ?? 0
                    ),
                    4
                  )}
                />

                <span>
                  mol L⁻¹
                </span>
              </div>
            </label>

            {mensagemEfeitoConcentracao && (
              <p className="precipitacaoSimulationError">
                {mensagemEfeitoConcentracao}
              </p>
            )}

            <button
              type="button"
              className="precipitacaoSimulationApplyButton"
              onClick={
                aplicarEfeitoConcentracao
              }
            >
              Aplicar simulação
            </button>
          </div>

          <button
            type="button"
            className="precipitacaoSimulationResetButton"
            onClick={() => {
              setConcMetalEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concMetal ?? 0
                  ),
                  4
                )
              );

              setConcEDTAEfeito(
                formatarNumeroBR(
                  Number(
                    resultado.entradas.concEDTA ?? 0
                  ),
                  4
                )
              );

              setResultadoEfeitoConcentracao(
                null
              );

              setCurvaEfeitoConcentracao(
                null
              );

              setMensagemEfeitoConcentracao(
                ""
              );
            }}
          >
            Restaurar valores originais
          </button>
        </aside>

        <section className="precipitacaoSimulationGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Comparação experimental
              </span>

              <h6>
                Condição original × condição simulada
              </h6>
            </div>
          </header>

          {resultadoEfeitoConcentracao &&
            curvaEfeitoConcentracao && (
              <div className="efeitoConcentracaoChartWrapper">
                <CurvaEdtaChart
                  curva={curva}
                  curvasInterferentes={[
                    {
                      metal:
                        "Condição simulada",
                      pontos:
                        curvaEfeitoConcentracao.pontos,
                    },
                  ]}
                  metalPrincipalLabel="Condição original"
                  titulo="Curva original × simulada"
                  descricao="Comparação do perfil pM × volume de EDTA"
                />
              </div>
            )}

          {!resultadoEfeitoConcentracao ||
          !curvaEfeitoConcentracao ? (
            <div className="precipitacaoSimulationDiagnosis">
              <span className="precipitacaoSectionLabel">
                Aguardando simulação
              </span>

              <h6>
                Configure uma nova concentração
              </h6>

              <p>
                Altere uma ou ambas as concentrações e
                aplique a simulação para comparar o novo
                ponto de equivalência com a condição
                original.
              </p>
            </div>
          ) : (
            <>
              <div className="efeitoConcentracaoResumo">
                <div className="efeitoConcentracaoResumoGrid">
                  <article className="efeitoConcentracaoResumoCard">
                    <span>
                      PE original
                    </span>

                    <strong>
                      {volumePEOriginalEfeito !== null
                        ? `${formatarNumeroBR(
                            volumePEOriginalEfeito,
                            2
                          )} mL`
                        : "-"}
                    </strong>
                  </article>

                  <article className="efeitoConcentracaoResumoCard">
                    <span>
                      PE simulado
                    </span>

                    <strong>
                      {volumePESimuladoEfeito !== null
                        ? `${formatarNumeroBR(
                            volumePESimuladoEfeito,
                            2
                          )} mL`
                        : "-"}
                    </strong>
                  </article>

                  <article className="efeitoConcentracaoResumoCard">
                    <span>
                      ΔPE
                    </span>

                    <strong>
                      {deltaVolumePEEfeito !== null
                        ? `${formatarNumeroBR(
                            deltaVolumePEEfeito,
                            2
                          )} mL`
                        : "-"}
                    </strong>
                  </article>

                  <article className="efeitoConcentracaoResumoCard">
                    <span>
                      Variação do PE
                    </span>

                    <strong>
                      {variacaoVolumePEEfeito !== null
                        ? `${formatarNumeroBR(
                            variacaoVolumePEEfeito,
                            2
                          )}%`
                        : "-"}
                    </strong>
                  </article>
                </div>
              </div>

              <div className="efeitoConcentracaoAlteracoes">
                <div className="efeitoConcentracaoAlteracoesHeader">
                  <span>
                    Alterações aplicadas
                  </span>

                  <h5>
                    Comparação das concentrações
                  </h5>

                  <p>
                    Valores utilizados na condição original
                    e na condição simulada.
                  </p>
                </div>

                <div className="efeitoConcentracaoAlteracoesGrid">
                  <article className="efeitoConcentracaoAlteracaoCard">
                    <div className="efeitoConcentracaoAlteracaoTitulo">
                      Metal
                    </div>

                    <div className="efeitoConcentracaoComparacao">
                      <div className="efeitoConcentracaoValor">
                        <small>
                          Original
                        </small>

                        <strong>
                          {formatarNumeroBR(
                            Number(
                              resultado.entradas
                                .concMetal ?? 0
                            ),
                            4
                          )}
                        </strong>

                        <span>
                          mol L⁻¹
                        </span>
                      </div>

                      <div className="efeitoConcentracaoSeta">
                        →
                      </div>

                      <div className="efeitoConcentracaoValor">
                        <small>
                          Simulado
                        </small>

                        <strong>
                          {formatarNumeroBR(
                            Number(
                              resultadoEfeitoConcentracao
                                .entradas.concMetal ?? 0
                            ),
                            4
                          )}
                        </strong>

                        <span>
                          mol L⁻¹
                        </span>
                      </div>
                    </div>
                  </article>

                  <article className="efeitoConcentracaoAlteracaoCard">
                    <div className="efeitoConcentracaoAlteracaoTitulo">
                      EDTA
                    </div>

                    <div className="efeitoConcentracaoComparacao">
                      <div className="efeitoConcentracaoValor">
                        <small>
                          Original
                        </small>

                        <strong>
                          {formatarNumeroBR(
                            Number(
                              resultado.entradas
                                .concEDTA ?? 0
                            ),
                            4
                          )}
                        </strong>

                        <span>
                          mol L⁻¹
                        </span>
                      </div>

                      <div className="efeitoConcentracaoSeta">
                        →
                      </div>

                      <div className="efeitoConcentracaoValor">
                        <small>
                          Simulado
                        </small>

                        <strong>
                          {formatarNumeroBR(
                            Number(
                              resultadoEfeitoConcentracao
                                .entradas.concEDTA ?? 0
                            ),
                            4
                          )}
                        </strong>

                        <span>
                          mol L⁻¹
                        </span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {resultadoEfeitoConcentracao &&
        curvaEfeitoConcentracao && (
          <section className="precipitacaoSimulationDiagnosis">
            <span className="precipitacaoSectionLabel">
              Interpretação
            </span>

            <h6>
              Efeito observado
            </h6>

            <p>
              O ponto de equivalência passou de{" "}
              <strong>
                {volumePEOriginalEfeito !== null
                  ? `${formatarNumeroBR(
                      volumePEOriginalEfeito,
                      2
                    )} mL`
                  : "-"}
              </strong>{" "}
              para{" "}
              <strong>
                {volumePESimuladoEfeito !== null
                  ? `${formatarNumeroBR(
                      volumePESimuladoEfeito,
                      2
                    )} mL`
                  : "-"}
              </strong>
              .
            </p>

            <p>
              O pM no ponto de equivalência passou de{" "}
              <strong>
                {pMPEOriginalEfeito !== null
                  ? formatarNumeroBR(
                      pMPEOriginalEfeito,
                      3
                    )
                  : "-"}
              </strong>{" "}
              para{" "}
              <strong>
                {pMPESimuladoEfeito !== null
                  ? formatarNumeroBR(
                      pMPESimuladoEfeito,
                      3
                    )
                  : "-"}
              </strong>
              .
            </p>

            <p>
              O percentual complexado no PE passou de{" "}
              <strong>
                {percentualComplexadoOriginalEfeito !==
                null
                  ? `${formatarNumeroBR(
                      percentualComplexadoOriginalEfeito,
                      2
                    )}%`
                  : "-"}
              </strong>{" "}
              para{" "}
              <strong>
                {percentualComplexadoSimuladoEfeito !==
                null
                  ? `${formatarNumeroBR(
                      percentualComplexadoSimuladoEfeito,
                      2
                    )}%`
                  : "-"}
              </strong>
              .
            </p>

            <p>
              Como o pH e a condição do complexante
              auxiliar permanecem fixos, a{" "}
              <strong>
                K
                <sub>
                  condicional
                </sub>
              </strong>{" "}
              permanece definida pelas mesmas condições
              químicas. A alteração das concentrações
              modifica principalmente a quantidade de
              matéria presente e o volume de EDTA
              necessário para atingir a equivalência.
            </p>
          </section>
        )}
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
                      <strong>{formatarNumeroBR(ponto.pM, 2)}</strong>
                    </td>
                    <td>{formatarCientificoBR(ponto.metalLivre)}</td>
                    <td>{formatarCientificoBR(ponto.MY)}</td>
                    <td>
                      {formatarNumeroBR(ponto.percentualComplexado, 2)}%
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
                  {volumeDestaquePrimeiraDerivada !== null
  ? `${formatarNumeroBR(volumeDestaquePrimeiraDerivada, 2)} mL`
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
                  {volumeDestaqueSegundaDerivada !== null
  ? `${formatarNumeroBR(volumeDestaqueSegundaDerivada, 2)} mL`
  : "-"}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Sinal da 2ª derivada</span>
                  <strong>
                  {segundaDerivadaSignificativa && trocaSegundaDerivada
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
  volumeDestaque={volumeDestaquePrimeiraDerivada}
/>

<DerivadaEdtaChart
  tipo="segunda"
  titulo="2ª derivada da curva"
  descricao="Mudança da inclinação da curva pM × volume"
  pontos={segundaDerivada}
  volumePE={curva.volumePE}
  volumeDestaque={volumeDestaqueSegundaDerivada}
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