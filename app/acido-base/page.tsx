"use client";

import { useState } from "react";

import {
  avaliarSistemaPoliprotico,
  calcularPhPorVolumePoliprotico,
  gerarCurvaPoliprotica,
  formatarNumeroBR,
} from "../../lib/acidoBasePoliproticos";

import type {
  ResultadoSistemaPoliprotico,
  CurvaAcidoBasePoliprotica,
  PontoCurvaAcidoBase,
} from "../../lib/acidoBasePoliproticos";

import { acidosPoliproticosKa } from "../../lib/data/acidoBasePoliproticosKa";
import { basesPolibasicasKb } from "../../lib/data/acidoBasePolibasicosKb";
import { indicadoresAcidoBase } from "../../lib/data/indicadoresAcidoBase";

type TipoSistemaAcidoBase = "mono" | "poli";

type AbaAcidoBase =
  | "visao"
  | "baseCalculo"
  | "curva"
  | "indicadores"
  | "derivadas"
  | "tempoReal";

type RankingIndicadorAcidoBase = {
  pe: number;
  volumePE: number;
  phPE: number;
  nome: string;
  phMin: number;
  phMax: number;
  phCentral: number;
  faixa: string;
  categoria: string;
  cobrePE: boolean;
  erro: number;
  score: number;
  justificativa: string;
};

type BlocoRankingIndicadorAcidoBase = {
  pe: number;
  volumePE: number;
  phPE: number;
  ranking: RankingIndicadorAcidoBase[];
};

type PontoDerivadaAcidoBase = {
  volume: number;
  d1: number | null;
  d2: number | null;
};

type ResumoDerivadaPE = {
  pe: number;
  volumeTeorico: number;
  volumePicoD1: number | null;
  valorPicoD1: number | null;
  volumeZeroD2: number | null;
  valorD2: number | null;
  detectavelD1: boolean;
  detectavelD2: boolean;
  detectavelGeral: boolean;
  interpretacao: string;
};

type LinhaTabelaPrimeiraDerivada = {
  indice: number;
  volume: number;
  ph: number | null;
  volumeMedio: number | null;
  deltaPH: number | null;
  deltaV: number | null;
  primeiraDerivada: number | null;
  status: string;
};

type LinhaTabelaSegundaDerivada = {
  indice: number;
  volumeMedioPrimeira: number;
  primeiraDerivada: number;
  volumeMedioSegunda: number | null;
  deltaPrimeiraDerivada: number | null;
  deltaV: number | null;
  segundaDerivada: number | null;
  status: string;
};

export default function AcidoBasePage() {
  const [tipoSistema, setTipoSistema] =
    useState<TipoSistemaAcidoBase>("mono");

  const [abaMono, setAbaMono] = useState<AbaAcidoBase>("visao");
  const [abaPoli, setAbaPoli] = useState<AbaAcidoBase>("visao");

  function alterarTipoSistema(tipo: TipoSistemaAcidoBase) {
    setTipoSistema(tipo);

    if (tipo === "mono") {
      setAbaMono("visao");
    }

    if (tipo === "poli") {
      setAbaPoli("visao");
    }
  }

  return (
    <main className="modulePage">
      <section className="moduleHero">
        <div className="container moduleHeroContent">
          <div>
            <span className="eyebrow">Módulo em desenvolvimento</span>
            <h1>Titulações ácido-base</h1>
            <p>
              Simule e interprete titulações envolvendo ácidos monopróticos,
              bases monobásicas, ácidos polipróticos e bases polibásicas. O
              módulo será estruturado para calcular curvas de pH, regiões
              tampão, pontos de equivalência, espécies predominantes e bases do
              cálculo.
            </p>
          </div>

          <div className="moduleInfoCard">
            <strong>Status</strong>
            <span>
              Ambiente preparado para separar sistemas
              monopróticos/monobásicos e polipróticos/polibásicos dentro do
              mesmo módulo.
            </span>
          </div>
        </div>
      </section>

      <section className="container calculatorSection">
        <div className="resultsPanel acidBaseSelectorPanel">
          <span className="eyebrow">Escolha o sistema</span>
          <h2>Tipo de titulação ácido-base</h2>
          <p>
            Selecione se deseja trabalhar com sistemas monopróticos ou
            polipróticos. Cada opção possui abas e lógica próprias.
          </p>

          <div className="acidBaseModeGrid">
            <button
              type="button"
              className={
                tipoSistema === "mono"
                  ? "acidBaseModeCard active"
                  : "acidBaseModeCard"
              }
              onClick={() => alterarTipoSistema("mono")}
            >
              <strong>Monopróticos / monobásicas</strong>
              <span>
                Ácidos que liberam um H⁺ ou bases que neutralizam um H⁺ em uma
                etapa principal de titulação.
              </span>
            </button>

            <button
              type="button"
              className={
                tipoSistema === "poli"
                  ? "acidBaseModeCard active"
                  : "acidBaseModeCard"
              }
              onClick={() => alterarTipoSistema("poli")}
            >
              <strong>Polipróticos / polibásicas</strong>
              <span>
                Ácidos que liberam mais de um H⁺ ou bases que neutralizam mais
                de um H⁺, podendo apresentar múltiplas regiões de equivalência.
              </span>
            </button>
          </div>
        </div>
      </section>

      {tipoSistema === "mono" && (
        <>
          <section className="container tabsSection">
            <div className="moduleTabs">
              <button
                type="button"
                className={abaMono === "visao" ? "active" : ""}
                onClick={() => setAbaMono("visao")}
              >
                Visão geral
              </button>

              <button
                type="button"
                className={abaMono === "baseCalculo" ? "active" : ""}
                onClick={() => setAbaMono("baseCalculo")}
              >
                Base do cálculo
              </button>

              <button
                type="button"
                className={abaMono === "curva" ? "active" : ""}
                onClick={() => setAbaMono("curva")}
              >
                Curva
              </button>

              <button
                type="button"
                className={abaMono === "indicadores" ? "active" : ""}
                onClick={() => setAbaMono("indicadores")}
              >
                Indicadores
              </button>

              <button
                type="button"
                className={abaMono === "derivadas" ? "active" : ""}
                onClick={() => setAbaMono("derivadas")}
              >
                Derivadas
              </button>

              <button
                type="button"
                className={abaMono === "tempoReal" ? "active" : ""}
                onClick={() => setAbaMono("tempoReal")}
              >
                Tempo real
              </button>
            </div>
          </section>

          <ModuloMonoprotico abaAtiva={abaMono} />
        </>
      )}

      {tipoSistema === "poli" && (
        <>
          <section className="container tabsSection">
            <div className="moduleTabs">
              <button
                type="button"
                className={abaPoli === "visao" ? "active" : ""}
                onClick={() => setAbaPoli("visao")}
              >
                Visão geral
              </button>

              <button
                type="button"
                className={abaPoli === "baseCalculo" ? "active" : ""}
                onClick={() => setAbaPoli("baseCalculo")}
              >
                Base do cálculo
              </button>

              <button
                type="button"
                className={abaPoli === "curva" ? "active" : ""}
                onClick={() => setAbaPoli("curva")}
              >
                Curva
              </button>

              <button
                type="button"
                className={abaPoli === "indicadores" ? "active" : ""}
                onClick={() => setAbaPoli("indicadores")}
              >
                Indicadores
              </button>

              <button
                type="button"
                className={abaPoli === "derivadas" ? "active" : ""}
                onClick={() => setAbaPoli("derivadas")}
              >
                Derivadas
              </button>

              <button
                type="button"
                className={abaPoli === "tempoReal" ? "active" : ""}
                onClick={() => setAbaPoli("tempoReal")}
              >
                Tempo real
              </button>
            </div>
          </section>

          <ModuloPoliprotico abaAtiva={abaPoli} />
        </>
      )}
    </main>
  );
}

function ModuloMonoprotico({ abaAtiva }: { abaAtiva: AbaAcidoBase }) {
  return (
    <section className="container calculatorSection">
      <div className="curveDashboard">
        {abaAtiva === "visao" && (
          <div className="resultsPanel">
            <span className="eyebrow">Monopróticos / monobásicas</span>
            <h2>Visão geral</h2>
            <p>
              Área reservada para entrada dos dados de titulações envolvendo
              ácidos monopróticos ou bases monobásicas.
            </p>

            <div className="resultGrid">
              <div className="resultCard">
                <span>Sistema</span>
                <strong>Ácido monoprótico ou base monobásica</strong>
              </div>

              <div className="resultCard">
                <span>Exemplos</span>
                <strong>HCl, CH₃COOH, NaOH, NH₃</strong>
              </div>

              <div className="resultCard">
                <span>Foco</span>
                <strong>Uma neutralização principal</strong>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "curva" && (
          <div className="resultsPanel">
            <h2>Curva de titulação</h2>
            <p>
              Espaço reservado para o gráfico pH × volume do titulante em
              sistemas monopróticos.
            </p>
          </div>
        )}

        {abaAtiva === "indicadores" && (
          <div className="resultsPanel">
            <h2>Indicadores</h2>
            <p>
              Espaço reservado para recomendação de indicadores ácido-base com
              base na faixa de viragem e no pH do ponto de equivalência.
            </p>
          </div>
        )}

        {abaAtiva === "baseCalculo" && (
          <div className="resultsPanel">
            <h2>Base do cálculo</h2>
            <p>
              Espaço reservado para mostrar Ka, Kb, Kw, concentração inicial,
              volume de equivalência e constantes utilizadas.
            </p>
          </div>
        )}

        {abaAtiva === "derivadas" && (
          <div className="resultsPanel">
            <h2>Derivadas</h2>
            <p>
              Espaço reservado para análise da primeira e segunda derivada da
              curva de titulação ácido-base, auxiliando na localização do ponto
              de equivalência.
            </p>
          </div>
        )}

        {abaAtiva === "tempoReal" && (
          <div className="resultsPanel">
            <h2>Tempo real</h2>
            <p>
              Espaço reservado para simular a adição gradual do titulante e
              acompanhar o pH calculado a cada volume adicionado.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ModuloPoliprotico({ abaAtiva }: { abaAtiva: AbaAcidoBase }) {
  const [titulante, setTitulante] = useState("");
  const [titulado, setTitulado] = useState("");
  const [concTitulante, setConcTitulante] = useState("");
  const [concTitulado, setConcTitulado] = useState("");
  const [volTitulado, setVolTitulado] = useState("");
  const [volBureta, setVolBureta] = useState("");

  const [mensagemPoli, setMensagemPoli] = useState("");

  const [resultadoPoli, setResultadoPoli] =
    useState<ResultadoSistemaPoliprotico | null>(null);

  const [curvaPoli, setCurvaPoli] =
    useState<CurvaAcidoBasePoliprotica | null>(null);

  const [volumeConsulta, setVolumeConsulta] = useState("");

  const [pontoConsulta, setPontoConsulta] =
    useState<PontoCurvaAcidoBase | null>(null);

    const [volumeAtualTempoReal, setVolumeAtualTempoReal] = useState(0);
const [volumeManualTempoReal, setVolumeManualTempoReal] = useState("");
const [pontosTempoReal, setPontosTempoReal] = useState<PontoCurvaAcidoBase[]>([]);

    const [peIndicadorAtivo, setPeIndicadorAtivo] = useState(1);
const [indicadorSelecionado, setIndicadorSelecionado] =
  useState<RankingIndicadorAcidoBase | null>(null);

  const tituladosDisponiveis =
    titulante === "HCl"
      ? basesPolibasicasKb
      : titulante === "NaOH"
        ? acidosPoliproticosKa
        : [];

  function converterNumero(valor: string) {
    return Number(String(valor).replace(",", "."));
  }

  function limparResultadoParcial() {
    setResultadoPoli(null);
    setCurvaPoli(null);
    setPontoConsulta(null);
    setMensagemPoli("");
    setPeIndicadorAtivo(1);
    setIndicadorSelecionado(null);
    setVolumeAtualTempoReal(0);
setVolumeManualTempoReal("");
setPontosTempoReal([]);
  }

  function avaliarPoliprotico() {
    setMensagemPoli("");

    if (!titulante || !titulado) {
      setMensagemPoli("Selecione o titulante e o titulado antes de avaliar.");
      return;
    }

    const ctitulante = converterNumero(concTitulante);
    const ctitulado = converterNumero(concTitulado);
    const vtitulado = converterNumero(volTitulado);
    const vbureta = converterNumero(volBureta);

    if (
      !Number.isFinite(ctitulante) ||
      !Number.isFinite(ctitulado) ||
      !Number.isFinite(vtitulado) ||
      !Number.isFinite(vbureta) ||
      ctitulante <= 0 ||
      ctitulado <= 0 ||
      vtitulado <= 0 ||
      vbureta <= 0
    ) {
      setMensagemPoli(
        "Preencha concentração do titulante, concentração do titulado, volume do titulado e volume da bureta com valores positivos."
      );

      return;
    }

    try {
      const avaliacao = avaliarSistemaPoliprotico({
        titulante,
        titulado,
        concTitulante: ctitulante,
        concTitulado: ctitulado,
        volTitulado: vtitulado,
        volBureta: vbureta,
      });

      const curvaGerada = gerarCurvaPoliprotica(avaliacao);

      setResultadoPoli(avaliacao);
setCurvaPoli(curvaGerada);
setPontoConsulta(null);
setVolumeConsulta("");
setPeIndicadorAtivo(1);
setIndicadorSelecionado(null);
setVolumeAtualTempoReal(0);
setVolumeManualTempoReal("");
setPontosTempoReal([]);
setMensagemPoli("Sistema avaliado com sucesso.");
    } catch (erro) {
      setResultadoPoli(null);
      setCurvaPoli(null);
      setPontoConsulta(null);
      setMensagemPoli(
        erro instanceof Error
          ? erro.message
          : "Não foi possível avaliar o sistema."
      );
    }
  }

  function consultarVolumePoliprotico() {
    if (!resultadoPoli) return;

    const volume = converterNumero(volumeConsulta);

    if (!Number.isFinite(volume)) return;

    const ponto = calcularPhPorVolumePoliprotico(resultadoPoli, volume);

    setPontoConsulta(ponto);
  }

  function adicionarVolumeTempoReal(incremento: number) {
    if (!resultadoPoli || !curvaPoli) return;
  
    const volumeMaximo = curvaPoli.volumeMaximo;
    const novoVolume = Math.min(volumeAtualTempoReal + incremento, volumeMaximo);
  
    const ponto = calcularPhPorVolumePoliprotico(resultadoPoli, novoVolume);
  
    setVolumeAtualTempoReal(novoVolume);
    setPontosTempoReal((pontos) => [...pontos, ponto]);
  }
  
  function adicionarVolumeManualTempoReal() {
    if (!resultadoPoli || !curvaPoli) return;
  
    const incremento = converterNumero(volumeManualTempoReal);
  
    if (!Number.isFinite(incremento) || incremento <= 0) {
      return;
    }
  
    adicionarVolumeTempoReal(incremento);
    setVolumeManualTempoReal("");
  }
  
  function irParaProximoPETempoReal() {
    if (!resultadoPoli) return;
  
    const proximoPE = resultadoPoli.volumesPE.find(
      (volume) => volume > volumeAtualTempoReal + 0.0001
    );
  
    const volumeDestino =
      proximoPE ?? resultadoPoli.volumesPE[resultadoPoli.volumesPE.length - 1];
  
    const ponto = calcularPhPorVolumePoliprotico(resultadoPoli, volumeDestino);
  
    setVolumeAtualTempoReal(volumeDestino);
    setPontosTempoReal((pontos) => [...pontos, ponto]);
  }
  
  function limparTempoRealPoliprotico() {
    setVolumeAtualTempoReal(0);
    setVolumeManualTempoReal("");
    setPontosTempoReal([]);
  }

  function avaliarDetectabilidadePE(volumePE: number) {
    if (!resultadoPoli) {
      return null;
    }
  
    const intervalo = Math.max(resultadoPoli.volumePE1 * 0.02, 0.5);
  
    const volumeAntes = Math.max(0, volumePE - intervalo);
    const volumeDepois = volumePE + intervalo;
  
    const pontoAntes = calcularPhPorVolumePoliprotico(resultadoPoli, volumeAntes);
    const pontoDepois = calcularPhPorVolumePoliprotico(resultadoPoli, volumeDepois);
  
    if (
      pontoAntes.ph === null ||
      pontoDepois.ph === null ||
      !Number.isFinite(pontoAntes.ph) ||
      !Number.isFinite(pontoDepois.ph)
    ) {
      return {
        nivel: "Não calculado",
        classe: "neutral",
        deltaPH: null,
        texto:
          "Não foi possível calcular a variação de pH ao redor deste ponto de equivalência.",
      };
    }
  
    const deltaPH = Math.abs(pontoDepois.ph - pontoAntes.ph);
  
    if (deltaPH >= 3) {
      return {
        nivel: "Alta detectabilidade",
        classe: "high",
        deltaPH,
        texto:
          "Este PE apresenta variação brusca de pH ao redor do ponto de equivalência, sendo bem visível na curva.",
      };
    }
  
    if (deltaPH >= 1) {
      return {
        nivel: "Detectabilidade moderada",
        classe: "medium",
        deltaPH,
        texto:
          "Este PE apresenta uma variação perceptível de pH, mas pode não formar um salto tão acentuado na curva.",
      };
    }
  
    if (deltaPH >= 0.3) {
      return {
        nivel: "Baixa detectabilidade",
        classe: "low",
        deltaPH,
        texto:
          "Este PE existe pelo cálculo estequiométrico, mas a mudança de pH ao redor dele é pequena e pode ser difícil de observar visualmente.",
      };
    }
  
    return {
      nivel: "Muito baixa / pouco detectável",
      classe: "veryLow",
      deltaPH,
      texto:
        "Este PE é calculado estequiometricamente, porém praticamente não aparece como salto claro na curva. A identificação deve ser feita por cálculo ou derivadas.",
    };
  }

  function baixarGraficoPorSeletor(seletor: string, nomeArquivo: string) {
    const svgOriginal = document.querySelector(seletor) as SVGSVGElement | null;
  
    if (!svgOriginal) {
      return;
    }
  
    const svgClone = svgOriginal.cloneNode(true) as SVGSVGElement;
  
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("width", "1960");
    svgClone.setAttribute("height", "1120");
  
    const svgTexto = new XMLSerializer().serializeToString(svgClone);
  
    const svgBlob = new Blob([svgTexto], {
      type: "image/svg+xml;charset=utf-8",
    });
  
    const url = URL.createObjectURL(svgBlob);
    const imagem = new Image();
  
    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1960;
      canvas.height = 1120;
  
      const contexto = canvas.getContext("2d");
  
      if (!contexto) {
        URL.revokeObjectURL(url);
        return;
      }
  
      contexto.fillStyle = "#ffffff";
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  
      const pngUrl = canvas.toDataURL("image/png");
  
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = nomeArquivo;
      link.click();
  
      URL.revokeObjectURL(url);
    };
  
    imagem.src = url;
  }

  function montarAvisoVolumeBureta() {
    if (!resultadoPoli) return null;
  
    const ultimoPE =
      resultadoPoli.volumesPE[resultadoPoli.volumesPE.length - 1];
  
    const volumeBureta = resultadoPoli.entradas.volBureta;
  
    if (!Number.isFinite(ultimoPE) || !Number.isFinite(volumeBureta)) {
      return null;
    }
  
    if (ultimoPE <= volumeBureta) {
      return {
        tipo: "ok",
        titulo: "Volume da bureta suficiente",
        texto: `O último ponto de equivalência ocorre em ${formatarNumeroBR(
          ultimoPE,
          2
        )} mL, dentro do volume máximo informado para a bureta.`,
      };
    }
  
    const volumeExtra = ultimoPE - volumeBureta;
    const recargas = Math.ceil(ultimoPE / volumeBureta) - 1;
  
    return {
      tipo: "warn",
      titulo: "Volume da bureta insuficiente para a titulação completa",
      texto: `O último ponto de equivalência ocorre em ${formatarNumeroBR(
        ultimoPE,
        2
      )} mL, mas a bureta informada comporta apenas ${formatarNumeroBR(
        volumeBureta,
        2
      )} mL. Será necessário completar/recarregar a bureta pelo menos ${recargas} vez(es), pois faltam ${formatarNumeroBR(
        volumeExtra,
        2
      )} mL para atingir o último PE.`,
    };
  }

  const avisoVolumeBureta = montarAvisoVolumeBureta();

  const rankingsIndicadoresPoli =
  resultadoPoli && curvaPoli
    ? montarRankingIndicadoresPoli(resultadoPoli)
    : [];

const blocoIndicadorAtivo =
  rankingsIndicadoresPoli.find((item) => item.pe === peIndicadorAtivo) ??
  rankingsIndicadoresPoli[0] ??
  null;

const indicadorAtivo =
  indicadorSelecionado &&
  blocoIndicadorAtivo &&
  indicadorSelecionado.pe === blocoIndicadorAtivo.pe
    ? indicadorSelecionado
    : blocoIndicadorAtivo?.ranking[0] ?? null;

    const derivadasPoli =
  curvaPoli && resultadoPoli
    ? calcularDerivadasCurvaPoliprotica(curvaPoli)
    : [];

const resumoDerivadasPoli =
  resultadoPoli && derivadasPoli.length > 0
    ? montarResumoDerivadasPoli(resultadoPoli, derivadasPoli)
    : [];

const tabelaPrimeiraDerivada =
  resultadoPoli && curvaPoli
    ? montarTabelaPrimeiraDerivadaPoli(resultadoPoli, curvaPoli)
    : [];

const tabelaSegundaDerivada =
  resultadoPoli && tabelaPrimeiraDerivada.length > 0
    ? montarTabelaSegundaDerivadaPoli(resultadoPoli, tabelaPrimeiraDerivada)
    : [];

    const pontoAtualTempoReal =
  resultadoPoli && curvaPoli
    ? calcularPhPorVolumePoliprotico(resultadoPoli, volumeAtualTempoReal)
    : null;

  return (
    <section className="container calculatorSection">
      <div className="curveDashboard">
        {abaAtiva === "visao" && (
          <div className="resultsPanel">
            <span className="eyebrow">Polipróticos / polibásicas</span>

            <h2>Sistema poliprótico / polibásico</h2>

            <p>
              Esta aba avalia titulações envolvendo ácidos polipróticos
              titulados com base forte ou bases polibásicas tituladas com ácido
              forte. O cálculo usa balanço de massa, balanço de carga e
              localização do ponto na titulação.
            </p>

            <div className="acidBaseFormGrid">
              <label>
                Titulante
                <select
                  value={titulante}
                  onChange={(event) => {
                    setTitulante(event.target.value);
                    setTitulado("");
                    limparResultadoParcial();
                  }}
                >
                  <option value="">Selecione o titulante...</option>
                  <option value="NaOH">NaOH — base forte</option>
                  <option value="HCl">HCl — ácido forte</option>
                </select>
              </label>

              <label>
                Titulado
                <select
                  value={titulado}
                  onChange={(event) => {
                    setTitulado(event.target.value);
                    limparResultadoParcial();
                  }}
                  disabled={!titulante}
                >
                  <option value="">
                    {titulante
                      ? "Selecione o titulado..."
                      : "Selecione primeiro o titulante..."}
                  </option>

                  {tituladosDisponiveis.map((item) => (
                    <option key={item.id} value={item.nome}>
                      {item.nome} — {item.formula}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Concentração do titulante mol/L
                <input
                  value={concTitulante}
                  onChange={(event) => {
                    setConcTitulante(event.target.value);
                    limparResultadoParcial();
                  }}
                  placeholder="Ex.: 0,1000"
                />
              </label>

              <label>
                Concentração do titulado mol/L
                <input
                  value={concTitulado}
                  onChange={(event) => {
                    setConcTitulado(event.target.value);
                    limparResultadoParcial();
                  }}
                  placeholder="Ex.: 0,1000"
                />
              </label>

              <label>
                Volume do titulado mL
                <input
                  value={volTitulado}
                  onChange={(event) => {
                    setVolTitulado(event.target.value);
                    limparResultadoParcial();
                  }}
                  placeholder="Ex.: 25,00"
                />
              </label>

              <label>
                Volume máximo da bureta mL
                <input
                  value={volBureta}
                  onChange={(event) => {
                    setVolBureta(event.target.value);
                    limparResultadoParcial();
                  }}
                  placeholder="Ex.: 50,00"
                />
              </label>
            </div>

            <div className="recommendationGrid">
              <div className="recommendationCard">
                <span>Recomendação</span>
                <strong>Para ácidos polipróticos</strong>
                <p>
                  Use NaOH como titulante e selecione espécies como ácido
                  fosfórico, ácido carbônico, ácido cítrico ou ácido oxálico.
                </p>
              </div>

              <div className="recommendationCard">
                <span>Recomendação</span>
                <strong>Para bases polibásicas</strong>
                <p>
                  Use HCl como titulante e selecione espécies como carbonato,
                  fosfato, citrato, oxalato ou sulfeto.
                </p>
              </div>

              <div className="recommendationCard">
                <span>Dica de entrada</span>
                <strong>Use valores positivos</strong>
                <p>
                  As concentrações devem estar em mol/L e os volumes em mL. Você
                  pode usar vírgula ou ponto decimal.
                </p>
              </div>
            </div>

            <button className="primaryButton" onClick={avaliarPoliprotico}>
              Avaliar sistema
            </button>

            {mensagemPoli && (
              <div
                className={
                  resultadoPoli ? "statusMessage success" : "statusMessage warning"
                }
              >
                {mensagemPoli}
              </div>
            )}

{resultadoPoli && (
  <>
    <div className="resultGrid">
      <div className="resultCard">
        <span>Titulante</span>
        <strong>{resultadoPoli.titulante.nome}</strong>
      </div>

      <div className="resultCard">
        <span>Titulado</span>
        <strong>{resultadoPoli.titulado.nome}</strong>
      </div>

      <div className="resultCard">
        <span>Tipo de titulação</span>
        <strong>
          {resultadoPoli.tipoSistema === "acido-com-base-forte"
            ? "Ácido poliprótico × base forte"
            : "Base polibásica × ácido forte"}
        </strong>
      </div>

      <div className="resultCard">
        <span>Nº de equivalências</span>
        <strong>{resultadoPoli.numeroEquivalencias}</strong>
      </div>

      <div className="resultCard">
        <span>Produto final</span>
        <strong>{resultadoPoli.reacao.produtoFinal}</strong>
      </div>

      <div className="resultCard">
        <span>Volume do 1º PE</span>
        <strong>{formatarNumeroBR(resultadoPoli.volumePE1, 2)} mL</strong>
      </div>
    </div>

    {avisoVolumeBureta && (
      <div
        className={
          avisoVolumeBureta.tipo === "ok"
            ? "buretteWarningCard ok"
            : "buretteWarningCard warn"
        }
      >
        <strong>{avisoVolumeBureta.titulo}</strong>
        <p>{avisoVolumeBureta.texto}</p>
      </div>
    )}

    <div className="reactionDetailsStack">
      <div className="reactionWideCard">
        <span>Equação global</span>
        <strong>{resultadoPoli.reacao.equacaoGlobal || "-"}</strong>
      </div>

      <div className="reactionWideCard">
        <span>Etapas da reação</span>

        <div className="reactionStepsList">
          {resultadoPoli.reacao.reacoesEtapas.length > 0 ? (
            resultadoPoli.reacao.reacoesEtapas.map((etapa, index) => (
              <div key={index} className="reactionStepItem">
                <b>Etapa {index + 1}:</b> {etapa}
              </div>
            ))
          ) : (
            <div className="reactionStepItem">
              Nenhuma etapa cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
          </div>
        )}

        {abaAtiva === "baseCalculo" && (
          <div className="resultsPanel">
            <h2>Base do cálculo</h2>

            {!resultadoPoli ? (
              <p>Avalie o sistema primeiro na aba Visão geral.</p>
            ) : (
              <>
                <p>{resultadoPoli.resumo}</p>

                <div className="resultGrid">
                  {resultadoPoli.constantes.map((item) => (
                    <div className="resultCard" key={item.etapa}>
                      <span>
                        {resultadoPoli.titulado.classe === "ácido"
                          ? `Ka${item.etapa}`
                          : `Kb${item.etapa}`}
                      </span>

                      <strong>{item.constante.toExponential(2)}</strong>

                      <small>
                        {resultadoPoli.titulado.classe === "ácido"
                          ? `pKa${item.etapa}`
                          : `pKb${item.etapa}`}{" "}
                        = {formatarNumeroBR(item.pValor, 2)}
                      </small>
                    </div>
                  ))}

                  {resultadoPoli.volumesPE.map((volume, index) => (
                    <div className="resultCard" key={`pe-${index + 1}`}>
                      <span>Volume PE{index + 1}</span>
                      <strong>{formatarNumeroBR(volume, 2)} mL</strong>
                    </div>
                  ))}
                </div>

                <div className="explanationBox">
                  <h3>Equação global</h3>
                  <p>{resultadoPoli.reacao.equacaoGlobal}</p>
                </div>

                <div className="explanationBox">
                  <h3>Etapas da reação</h3>
                  {resultadoPoli.reacao.reacoesEtapas.map((etapa, index) => (
                    <p key={index}>
                      <strong>Etapa {index + 1}:</strong> {etapa}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

{abaAtiva === "curva" && (
  <div className="resultsPanel curveMainPanel">
    <h2>Curva de titulação</h2>

    {!curvaPoli || !resultadoPoli ? (
      <p>Avalie o sistema primeiro na aba Visão geral.</p>
    ) : (
      <>
        <p>
          Curva gerada com {curvaPoli.pontos.length} pontos, passo de{" "}
          {formatarNumeroBR(curvaPoli.passo, 2)} mL e volume máximo de{" "}
          {formatarNumeroBR(curvaPoli.volumeMaximo, 2)} mL.
        </p>

        <div className="resultGrid curveSummaryGrid">
  <div className="resultCard">
    <span>Titulado</span>
    <strong>{resultadoPoli.titulado.nome}</strong>
  </div>

  <div className="resultCard">
    <span>Titulante</span>
    <strong>{resultadoPoli.titulante.nome}</strong>
  </div>

  <div className="resultCard">
    <span>Nº de equivalências</span>
    <strong>{resultadoPoli.numeroEquivalencias}</strong>
  </div>

  <div className="resultCard">
    <span>Volume máximo</span>
    <strong>{formatarNumeroBR(curvaPoli.volumeMaximo, 2)} mL</strong>
  </div>
</div>

<div className="equivalenceVolumePanel">
  <span className="eyebrow">Pontos de equivalência</span>
  <h3>Volumes e pH calculados dos PEs</h3>

  <div className="equivalenceVolumeGrid">
  {resultadoPoli.volumesPE.map((volume, index) => {
    const pontoPE = calcularPhPorVolumePoliprotico(resultadoPoli, volume);
    const detectabilidade = avaliarDetectabilidadePE(volume);

    return (
      <div className="equivalenceVolumeCard" key={`curva-pe-${index + 1}`}>
        <span>PE{index + 1}</span>

        <div className="equivalenceVolumeValues">
          <div>
            <small>Volume</small>
            <strong>{formatarNumeroBR(volume, 2)} mL</strong>
          </div>

          <div>
            <small>pH</small>
            <strong>{formatarNumeroBR(pontoPE.ph, 2)}</strong>
          </div>
        </div>

        {detectabilidade && (
          <div className={`detectabilityBox ${detectabilidade.classe}`}>
            <strong>{detectabilidade.nivel}</strong>

            <small>
              ΔpH ao redor do PE:{" "}
              {detectabilidade.deltaPH === null
                ? "-"
                : formatarNumeroBR(detectabilidade.deltaPH, 2)}
            </small>

            <p>{detectabilidade.texto}</p>
          </div>
        )}
      </div>
    );
  })}
</div>
</div>

        <div className="chartBox acidBaseChartBox">
        <div className="chartHeader">
  <div>
    <strong>Curva pH × volume</strong>
    <span>
      A curva é calculada por balanço de massa, balanço de carga e
      resolução numérica por bisseção.
    </span>
  </div>

  <button
    type="button"
    className="downloadChartButton"
    onClick={() =>
      baixarGraficoPorSeletor(
        ".mainAcidBaseCurveSvg",
        "curva-titulacao-acido-base.png"
      )
    }
  >
    Baixar gráfico PNG
  </button>
</div>

          <GraficoCurvaPoliprotica
            curva={curvaPoli}
            resultado={resultadoPoli}
            pontoConsulta={pontoConsulta}
          />

          <div className="chartLegend">
            <span>
              <i className="legendLine curve"></i>
              Curva de titulação
            </span>

            <span>
              <i className="legendLine pe"></i>
              Pontos de equivalência
            </span>

            <span>
              <i className="legendLine consult"></i>
              Volume consultado
            </span>
          </div>
        </div>

        <div className="curveConsultBox acidBaseConsultBox">
  <div className="acidBaseConsultHeader">
    <span className="eyebrow">Consulta pontual</span>
    <h3>Consultar ponto na curva</h3>
    <p>
      Informe um volume de titulante adicionado para calcular o pH, localizar a
      região da titulação e destacar o ponto diretamente no gráfico.
    </p>
  </div>

  <div className="acidBaseConsultGrid">
    <label>
      Volume adicionado de titulante mL
      <input
        value={volumeConsulta}
        onChange={(event) => setVolumeConsulta(event.target.value)}
        placeholder="Ex.: 12,50"
      />
    </label>

    <button
      className="primaryButton"
      onClick={consultarVolumePoliprotico}
    >
      Consultar pH
    </button>
  </div>
</div>

        {pontoConsulta && (
          <>
            <div className="resultGrid curvePointGrid">
              <div className="resultCard">
                <span>Volume consultado</span>
                <strong>{formatarNumeroBR(pontoConsulta.volume, 2)} mL</strong>
              </div>

              <div className="resultCard">
                <span>pH calculado</span>
                <strong>{formatarNumeroBR(pontoConsulta.ph, 2)}</strong>
              </div>

              <div className="resultCard">
                <span>Região</span>
                <strong>{pontoConsulta.regiao}</strong>
              </div>
            </div>

            <div className="explanationBox">
              <h3>Interpretação do ponto consultado</h3>
              <p>{pontoConsulta.explicacao}</p>
            </div>
          </>
        )}
      </>
    )}
  </div>
)}

{abaAtiva === "indicadores" && (
  <div className="resultsPanel indicatorHeroPanel">
    <div className="indicatorHeroContent">
      <div>
        <span className="eyebrow">Indicadores ácido-base</span>
        <h2>Ranking de indicadores por ponto de equivalência</h2>
        <p>
          O sistema calcula o pH em cada ponto de equivalência, compara esse
          valor com as faixas de viragem cadastradas e ranqueia os indicadores
          mais compatíveis para cada PE.
        </p>
      </div>

      <div className="indicatorScoreCircle">
        <strong>
          {indicadorAtivo ? `${indicadorAtivo.score}%` : "-"}
        </strong>
        <span>compatibilidade</span>
      </div>
    </div>

    {!resultadoPoli || !curvaPoli ? (
      <div className="chartEmpty">
        Avalie o sistema primeiro na aba Visão geral.
      </div>
    ) : (
      <div className="indicatorPoliDashboard">
        <div className="indicatorPeTabs">
          {rankingsIndicadoresPoli.map((bloco) => (
            <button
              key={bloco.pe}
              type="button"
              className={
                bloco.pe === blocoIndicadorAtivo?.pe
                  ? "indicatorPeButton active"
                  : "indicatorPeButton"
              }
              onClick={() => {
                setPeIndicadorAtivo(bloco.pe);
                setIndicadorSelecionado(null);
              }}
            >
              PE{bloco.pe}
              <span>
                pH {formatarNumeroBR(bloco.phPE, 2)} |{" "}
                {formatarNumeroBR(bloco.volumePE, 2)} mL
              </span>
            </button>
          ))}
        </div>

        {blocoIndicadorAtivo && indicadorAtivo && (
          <>
            <div className="indicatorSelectedGrid">
              <div className="resultCard">
                <span>PE analisado</span>
                <strong>PE{blocoIndicadorAtivo.pe}</strong>
                <small>
                  Volume = {formatarNumeroBR(blocoIndicadorAtivo.volumePE, 2)} mL
                </small>
              </div>

              <div className="resultCard">
                <span>pH do PE</span>
                <strong>{formatarNumeroBR(blocoIndicadorAtivo.phPE, 2)}</strong>
              </div>

              <div className="resultCard">
                <span>Indicador selecionado</span>
                <strong>{indicadorAtivo.nome}</strong>
                <small>{indicadorAtivo.categoria}</small>
              </div>

              <div className="resultCard">
                <span>Faixa de viragem</span>
                <strong>
                  {formatarNumeroBR(indicadorAtivo.phMin, 2)} a{" "}
                  {formatarNumeroBR(indicadorAtivo.phMax, 2)}
                </strong>
              </div>
            </div>

            <div className="chartBox indicatorChartBox">
            <div className="chartHeader">
  <div>
    <strong>Faixa do indicador sobre a curva</strong>
    <span>
      A região destacada mostra a faixa de viragem do indicador
      selecionado em relação à curva de titulação.
    </span>
  </div>

  <button
    type="button"
    className="downloadChartButton"
    onClick={() =>
      baixarGraficoPorSeletor(
        ".indicatorCurveSvg",
        "grafico-indicador-acido-base.png"
      )
    }
  >
    Baixar gráfico PNG
  </button>
</div>

              <GraficoIndicadorPoliprotico
                curva={curvaPoli}
                resultado={resultadoPoli}
                indicador={indicadorAtivo}
              />

              <div className="chartLegend">
                <span>
                  <i className="legendLine curve"></i>
                  Curva de titulação
                </span>
                <span>
                  <i className="legendLine indicatorRange"></i>
                  Faixa do indicador
                </span>
                <span>
                  <i className="legendLine pe"></i>
                  Pontos de equivalência
                </span>
              </div>
            </div>

            <div className="resultsPanel">
              <h2>Ranking de indicadores</h2>

              <div className="indicatorRankingList">
                {blocoIndicadorAtivo.ranking.map((item, index) => (
                  <button
                    key={`${item.pe}-${item.nome}`}
                    type="button"
                    className={
                      indicadorAtivo.nome === item.nome
                        ? "indicatorRankingItem active"
                        : "indicatorRankingItem"
                    }
                    onClick={() => setIndicadorSelecionado(item)}
                  >
                    <div className="indicatorRankNumber">{index + 1}</div>

                    <div className="indicatorRankMain">
                      <strong>{item.nome}</strong>

                      <div className="indicatorMetaGrid">
                        <div className="indicatorMetaItem">
                          <span>Faixa</span>
                          <strong>
                            {formatarNumeroBR(item.phMin, 2)} a{" "}
                            {formatarNumeroBR(item.phMax, 2)}
                          </strong>
                        </div>

                        <div className="indicatorMetaItem">
                          <span>pH central</span>
                          <strong>{formatarNumeroBR(item.phCentral, 2)}</strong>
                        </div>

                        <div className="indicatorMetaItem">
                          <span>Erro</span>
                          <strong>{formatarNumeroBR(item.erro, 2)}</strong>
                        </div>

                        <div className="indicatorMetaItem">
                          <span>Status</span>
                          <strong>
                            {item.cobrePE ? "Cobre o PE" : "Próximo ao PE"}
                          </strong>
                        </div>
                      </div>

                      <p className="indicatorJustification">
                        {item.justificativa}
                      </p>
                    </div>

                    <div className="indicatorRankScore">
                      {item.score}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )}
  </div>
)}

{abaAtiva === "derivadas" && (
  <div className="resultsPanel curveMainPanel">
    <h2>Derivadas da curva</h2>
    {!resultadoPoli || !curvaPoli ? (
      <p>Avalie o sistema primeiro na aba Visão geral.</p>
    ) : (
      <>
        <p>
          A 1ª derivada mostra a variação do pH por volume adicionado
          (dpH/dV), enquanto a 2ª derivada ajuda a localizar o ponto em que
          ocorre mudança de concavidade da curva, geralmente próximo ao ponto
          de equivalência.
        </p>

        <div className="resultGrid curveSummaryGrid">
          <div className="resultCard">
            <span>Pontos da curva</span>
            <strong>{curvaPoli.pontos.length}</strong>
          </div>
          <div className="resultCard">
            <span>Pontos com derivadas</span>
            <strong>{derivadasPoli.length}</strong>
          </div>
          <div className="resultCard">
            <span>Nº de equivalências</span>
            <strong>{resultadoPoli.numeroEquivalencias}</strong>
          </div>
          <div className="resultCard">
            <span>Passo da curva</span>
            <strong>{formatarNumeroBR(curvaPoli.passo, 2)} mL</strong>
          </div>
        </div>

        <div className="equivalenceVolumePanel">
  <span className="eyebrow">Leitura analítica</span>
  <h3>Resumo das derivadas por ponto de equivalência</h3>

  <div className="equivalenceVolumeGrid">
    {resumoDerivadasPoli.map((item) => (
      <div className="equivalenceVolumeCard" key={`derivada-${item.pe}`}>
        <span>PE{item.pe}</span>

        <div className="equivalenceVolumeValues">
          <div>
            <small>Volume teórico</small>
            <strong>{formatarNumeroBR(item.volumeTeorico, 2)} mL</strong>
          </div>

          <div>
            <small>Pico/vale da 1ª derivada</small>
            <strong>
              {item.volumePicoD1 === null
                ? "Não detectável"
                : `${formatarNumeroBR(item.volumePicoD1, 2)} mL`}
            </strong>
          </div>

          <div>
            <small>Zero da 2ª derivada</small>
            <strong>
              {item.volumeZeroD2 === null
                ? "Não detectável"
                : `${formatarNumeroBR(item.volumeZeroD2, 2)} mL`}
            </strong>
          </div>
        </div>

        <div
          className={
            item.detectavelGeral
              ? "detectabilityBox high"
              : "detectabilityBox veryLow"
          }
        >
          <strong>
            {item.detectavelGeral
              ? "Detectável por derivada"
              : "Não detectável por derivada"}
          </strong>

          <p>{item.interpretacao}</p>
        </div>
      </div>
    ))}
  </div>
</div>

        <div className="chartBox acidBaseChartBox">
  <div className="chartHeader">
    <div>
      <strong>1ª derivada da curva (dpH/dV)</strong>
      <span>
        Picos ou vales de maior magnitude tendem a aparecer próximos aos pontos
        de equivalência.
      </span>
    </div>

    <button
      type="button"
      className="downloadChartButton"
      onClick={() =>
        baixarGraficoPorSeletor(
          ".derivativeD1Svg",
          "primeira-derivada-acido-base.png"
        )
      }
    >
      Baixar gráfico PNG
    </button>
  </div>

  <GraficoDerivadaPoliprotico
  derivadas={derivadasPoli}
  resultado={resultadoPoli}
  resumo={resumoDerivadasPoli}
  tipo="d1"
/>
</div>

<div className="chartBox acidBaseChartBox">
  <div className="chartHeader">
    <div>
      <strong>2ª derivada da curva (d²pH/dV²)</strong>
      <span>
        O cruzamento com zero costuma ocorrer próximo ao ponto de equivalência.
      </span>
    </div>

    <button
      type="button"
      className="downloadChartButton"
      onClick={() =>
        baixarGraficoPorSeletor(
          ".derivativeD2Svg",
          "segunda-derivada-acido-base.png"
        )
      }
    >
      Baixar gráfico PNG
    </button>
  </div>

  <GraficoDerivadaPoliprotico
  derivadas={derivadasPoli}
  resultado={resultadoPoli}
  resumo={resumoDerivadasPoli}
  tipo="d2"
/>
</div>

<div className="resultsPanel derivativeTablePanel">
  <span className="eyebrow">Tabela numérica</span>
  <h2>Tabela completa usada no cálculo</h2>
  <p>
    Esta tabela mostra os volumes, pH, variações de pH, variações de volume e
    a primeira derivada calculada ponto a ponto.
  </p>

  <div className="derivativeTableWrapper">
    <table className="derivativeTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Vol(mL)</th>
          <th>pH</th>
          <th>V médio</th>
          <th>ΔpH</th>
          <th>ΔV</th>
          <th>ΔpH/ΔV</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {tabelaPrimeiraDerivada.map((linha) => (
          <tr key={`tabela-d1-${linha.indice}`}>
            <td>{linha.indice}</td>
            <td>{formatarNumeroBR(linha.volume, 2)}</td>
            <td>
              {linha.ph === null ? "-" : formatarNumeroBR(linha.ph, 8)}
            </td>
            <td>
              {linha.volumeMedio === null
                ? "-"
                : formatarNumeroBR(linha.volumeMedio, 3)}
            </td>
            <td>
              {linha.deltaPH === null
                ? "-"
                : formatarNumeroBR(linha.deltaPH, 8)}
            </td>
            <td>
              {linha.deltaV === null
                ? "-"
                : formatarNumeroBR(linha.deltaV, 3)}
            </td>
            <td>
              {linha.primeiraDerivada === null
                ? "-"
                : formatarNumeroBR(linha.primeiraDerivada, 8)}
            </td>
            <td>{linha.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

<div className="resultsPanel derivativeTablePanel">
  <span className="eyebrow">Segunda derivada</span>
  <h2>Tabela completa da segunda derivada</h2>
  <p>
    Esta tabela usa os valores da primeira derivada para calcular a segunda
    derivada da curva.
  </p>

  <div className="derivativeTableWrapper">
    <table className="derivativeTable">
      <thead>
        <tr>
          <th>#</th>
          <th>V médio 1ª</th>
          <th>1ª derivada</th>
          <th>V 2ª derivada</th>
          <th>Δ(1ª derivada)</th>
          <th>ΔV</th>
          <th>2ª derivada</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {tabelaSegundaDerivada.map((linha) => (
          <tr key={`tabela-d2-${linha.indice}`}>
            <td>{linha.indice}</td>
            <td>{formatarNumeroBR(linha.volumeMedioPrimeira, 3)}</td>
            <td>{formatarNumeroBR(linha.primeiraDerivada, 8)}</td>
            <td>
              {linha.volumeMedioSegunda === null
                ? "-"
                : formatarNumeroBR(linha.volumeMedioSegunda, 3)}
            </td>
            <td>
              {linha.deltaPrimeiraDerivada === null
                ? "-"
                : formatarNumeroBR(linha.deltaPrimeiraDerivada, 8)}
            </td>
            <td>
              {linha.deltaV === null
                ? "-"
                : formatarNumeroBR(linha.deltaV, 3)}
            </td>
            <td>
              {linha.segundaDerivada === null
                ? "-"
                : formatarNumeroBR(linha.segundaDerivada, 8)}
            </td>
            <td>{linha.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </>
    )}
  </div>
)}

{abaAtiva === "tempoReal" && (
  <div className="resultsPanel curveMainPanel">
    <span className="eyebrow">Simulação em tempo real</span>
    <h2>Simulação em tempo real da titulação ácido-base</h2>

    {!resultadoPoli || !curvaPoli ? (
      <p>Avalie o sistema primeiro na aba Visão geral.</p>
    ) : (
      <>
        <p>
        Esta aba simula a adição gradual do titulante. A curva ideal aparece como
referência em segundo plano, enquanto os pontos destacados representam apenas
os volumes realmente adicionados pelo usuário.
        </p>

        <div className="realTimeSimulationGrid">
          <div className="resultsPanel">
            <h2>Controles da titulação</h2>

            <div className="currentVolumeBox">
              <span>Volume atual</span>
              <strong>{formatarNumeroBR(volumeAtualTempoReal, 2)} mL</strong>
            </div>

            <div className="volumeButtonGrid">
              <button
                type="button"
                className="primaryButton"
                onClick={() => adicionarVolumeTempoReal(0.05)}
              >
                +0,05 mL
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={() => adicionarVolumeTempoReal(0.1)}
              >
                +0,10 mL
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={() => adicionarVolumeTempoReal(0.5)}
              >
                +0,50 mL
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={() => adicionarVolumeTempoReal(1)}
              >
                +1,00 mL
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={() => adicionarVolumeTempoReal(5)}
              >
                +5,00 mL
              </button>
            </div>

            <div className="manualVolumeBox">
              <label>
                Adicionar volume personalizado mL
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
                onClick={irParaProximoPETempoReal}
              >
                Ir para próximo PE
              </button>

              <button
                type="button"
                className="secondaryButton"
                onClick={limparTempoRealPoliprotico}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="resultsPanel">
            <h2>Simulação em tempo real</h2>
            <p>
            A curva suave representa a tendência ideal, enquanto os pontos e a linha
tracejada mostram a sequência experimental simulada.
            </p>

            <GraficoTempoRealPoliprotico
  curva={curvaPoli}
  resultado={resultadoPoli}
  pontosAdicionados={pontosTempoReal}
/>

<div className="chartLegend realTimeChartLegend">
  <span>
    <i className="legendLine idealAcidBaseCurve"></i>
    Curva ideal
  </span>

  <span>
    <i className="legendLine liveAcidBasePoints"></i>
    Pontos adicionados
  </span>

  <span>
    <i className="legendLine pe"></i>
    Pontos de equivalência
  </span>
</div>
          </div>
        </div>

        <div className="resultsPanel">
          <h2>Ponto atual</h2>

          <div className="resultGrid">
            <div className="resultCard">
              <span>Volume adicionado</span>
              <strong>
                {formatarNumeroBR(volumeAtualTempoReal, 2)} mL
              </strong>
            </div>

            <div className="resultCard">
              <span>pH</span>
              <strong>
              {pontoAtualTempoReal?.ph === null ||
pontoAtualTempoReal?.ph === undefined
  ? "-"
  : formatarNumeroBR(pontoAtualTempoReal.ph, 2)}
              </strong>
            </div>

            <div className="resultCard">
              <span>Região</span>
              <strong>{pontoAtualTempoReal?.regiao ?? "-"}</strong>
            </div>

            <div className="resultCard">
              <span>Explicação</span>
              <strong>
                {pontoAtualTempoReal?.explicacao
                  ? "Disponível"
                  : "-"}
              </strong>
            </div>
          </div>

          {pontoAtualTempoReal?.explicacao && (
            <div className="explanationBox">
              <h3>Interpretação</h3>
              <p>{pontoAtualTempoReal.explicacao}</p>
            </div>
          )}
        </div>

        <div className="resultsPanel">
          <h2>Pontos adicionados</h2>

          {pontosTempoReal.length === 0 ? (
            <div className="chartEmpty">Nenhum ponto adicionado ainda.</div>
          ) : (
            <div className="derivativeTableWrapper">
              <table className="derivativeTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Volume mL</th>
                    <th>pH</th>
                    <th>Região</th>
                  </tr>
                </thead>

                <tbody>
                  {pontosTempoReal.map((ponto, index) => (
                    <tr key={`tempo-real-${index}`}>
                      <td>{index + 1}</td>
                      <td>{formatarNumeroBR(ponto.volume, 2)}</td>
                      <td>
                        {ponto.ph === null
                          ? "-"
                          : formatarNumeroBR(ponto.ph, 2)}
                      </td>
                      <td>{ponto.regiao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}
      </div>
    </section>
  );
}

function GraficoCurvaPoliprotica({
  curva,
  resultado,
  pontoConsulta,
}: {
  curva: CurvaAcidoBasePoliprotica;
  resultado: ResultadoSistemaPoliprotico;
  pontoConsulta: PontoCurvaAcidoBase | null;
}) {
  const largura = 980;
  const altura = 560;

  const margem = {
    top: 36,
    right: 36,
    bottom: 64,
    left: 72,
  };

  const larguraGrafico = largura - margem.left - margem.right;
  const alturaGrafico = altura - margem.top - margem.bottom;

  const volumeMaximo = curva.volumeMaximo || 1;
  const phMin = 0;
  const phMax = 14;

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(ph: number) {
    return margem.top + ((phMax - ph) / (phMax - phMin)) * alturaGrafico;
  }

  const pontosValidos = curva.pontos.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  const pathCurva = pontosValidos
    .map((ponto, index) => {
      const x = xScale(ponto.volume);
      const y = yScale(ponto.ph ?? 0);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const pontosPE = resultado.volumesPE
    .map((volume, index) => {
      const pontoPE = curva.pontos.reduce((maisProximo, atual) => {
        const distAtual = Math.abs(atual.volume - volume);
        const distMelhor = Math.abs(maisProximo.volume - volume);

        return distAtual < distMelhor ? atual : maisProximo;
      }, curva.pontos[0]);

      return {
        volume,
        ph: pontoPE?.ph,
        label: `PE${index + 1}`,
      };
    })
    .filter((ponto) => ponto.ph !== null && ponto.ph !== undefined);

  const linhasPH = [0, 2, 4, 6, 8, 10, 12, 14];

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  return (
    <svg
    className="acidBaseCurveSvg mainAcidBaseCurveSvg"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Curva de titulação ácido-base"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={largura}
        height={altura}
        fill="#ffffff"
      />

      <rect
        x={margem.left}
        y={margem.top}
        width={larguraGrafico}
        height={alturaGrafico}
        fill="#fffafa"
        stroke="#f1d4d4"
        strokeWidth="1"
      />

      {linhasPH.map((ph) => (
        <g key={`ph-${ph}`}>
          <line
            x1={margem.left}
            x2={margem.left + larguraGrafico}
            y1={yScale(ph)}
            y2={yScale(ph)}
            stroke="#eeeeee"
            strokeWidth="1"
          />

          <text
            x={margem.left - 12}
            y={yScale(ph) + 5}
            fill="#667085"
            fontSize="13"
            fontWeight="700"
            textAnchor="end"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {ph}
          </text>
        </g>
      ))}

      {linhasVolume.map((volume) => (
        <g key={`volume-${volume}`}>
          <line
            x1={xScale(volume)}
            x2={xScale(volume)}
            y1={margem.top}
            y2={margem.top + alturaGrafico}
            stroke="#eeeeee"
            strokeWidth="1"
          />

          <text
            x={xScale(volume)}
            y={margem.top + alturaGrafico + 28}
            fill="#667085"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {formatarNumeroBR(volume, 0)}
          </text>
        </g>
      ))}

<path
  d={pathCurva}
  fill="none"
  stroke="#a80000"
  strokeWidth="4"
  strokeLinecap="round"
  strokeLinejoin="round"
/>

{pontosPE.map((ponto) => {
  const cx = xScale(ponto.volume);
  const cy = yScale(ponto.ph ?? 0);

  const larguraBox = 58;
const alturaBox = 28;

  const pontoAntes = pontosValidos.reduce((maisProximo, atual) => {
    const distAtual = Math.abs(atual.volume - (ponto.volume - 1));
    const distMelhor = Math.abs(maisProximo.volume - (ponto.volume - 1));
    return distAtual < distMelhor ? atual : maisProximo;
  }, pontosValidos[0]);

  const pontoDepois = pontosValidos.reduce((maisProximo, atual) => {
    const distAtual = Math.abs(atual.volume - (ponto.volume + 1));
    const distMelhor = Math.abs(maisProximo.volume - (ponto.volume + 1));
    return distAtual < distMelhor ? atual : maisProximo;
  }, pontosValidos[0]);

  const phAntes = pontoAntes?.ph ?? ponto.ph ?? 0;
  const phDepois = pontoDepois?.ph ?? ponto.ph ?? 0;

  const curvaSobe = phDepois > phAntes;
  const curvaDesce = phDepois < phAntes;

  let boxX = cx + 52;
let boxY = curvaSobe ? cy - 52 : cy + 32;

if (curvaDesce) {
  boxY = cy - 52;
}

if (cy < margem.top + 70) {
  boxY = cy + 32;
}

if (cy > margem.top + alturaGrafico - 70) {
  boxY = cy - 52;
}

if (boxX + larguraBox > largura - margem.right - 8) {
  boxX = cx - larguraBox - 52;
}

if (boxX < margem.left + 8) {
  boxX = cx + 52;
}

  if (boxY < margem.top + 8) {
    boxY = margem.top + 8;
  }

  if (boxY + alturaBox > margem.top + alturaGrafico - 8) {
    boxY = margem.top + alturaGrafico - alturaBox - 8;
  }

  const textX = boxX + larguraBox / 2;
  const textY = boxY + 19;

  const anchorX = boxX > cx ? boxX : boxX + larguraBox;
  const anchorY = boxY + alturaBox / 2;

  return (
    <g key={ponto.label}>
      <line
        x1={cx}
        x2={cx}
        y1={margem.top}
        y2={margem.top + alturaGrafico}
        stroke="#111111"
        strokeWidth="2"
        strokeDasharray="8 6"
      />

      <line
        x1={cx}
        y1={cy}
        x2={anchorX}
        y2={anchorY}
        stroke="#111111"
        strokeWidth="1.5"
      />

      <rect
        x={boxX}
        y={boxY}
        width={larguraBox}
        height={alturaBox}
        rx="9"
ry="9"
        fill="#ffffff"
        stroke="#111111"
        strokeWidth="1.6"
      />

      <circle
        cx={cx}
        cy={cy}
        r="8.5"
        fill="#111111"
        stroke="#ffffff"
        strokeWidth="3.5"
      />

      <text
        x={textX}
        y={textY}
        fill="#111111"
        fontSize="17"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {ponto.label}
      </text>
    </g>
  );
})}

{pontoConsulta && pontoConsulta.ph !== null && (() => {
  const cx = xScale(pontoConsulta.volume);
  const cy = yScale(pontoConsulta.ph);

  const larguraBox = 88;
  const alturaBox = 28;

  function limitarCaixa(x: number, y: number) {
    let novoX = x;
    let novoY = y;

    if (novoX < margem.left + 8) {
      novoX = margem.left + 8;
    }

    if (novoX + larguraBox > largura - margem.right - 8) {
      novoX = largura - margem.right - larguraBox - 8;
    }

    if (novoY < margem.top + 8) {
      novoY = margem.top + 8;
    }

    if (novoY + alturaBox > margem.top + alturaGrafico - 8) {
      novoY = margem.top + alturaGrafico - alturaBox - 8;
    }

    return { x: novoX, y: novoY };
  }

  function distanciaPontoCaixa(
    px: number,
    py: number,
    caixa: { x: number; y: number }
  ) {
    const dx = Math.max(
      caixa.x - px,
      0,
      px - (caixa.x + larguraBox)
    );

    const dy = Math.max(
      caixa.y - py,
      0,
      py - (caixa.y + alturaBox)
    );

    return Math.sqrt(dx * dx + dy * dy);
  }

  const candidatos = [
    limitarCaixa(cx + 58, cy - 76), // direita acima
    limitarCaixa(cx + 58, cy + 44), // direita abaixo
    limitarCaixa(cx - larguraBox - 58, cy - 76), // esquerda acima
    limitarCaixa(cx - larguraBox - 58, cy + 44), // esquerda abaixo
  ];

  const pontosCurvaEmPixel = pontosValidos.map((ponto) => ({
    x: xScale(ponto.volume),
    y: yScale(ponto.ph ?? 0),
  }));

  const melhorCaixa = candidatos.reduce((melhor, atual) => {
    const menorDistanciaAtual = Math.min(
      ...pontosCurvaEmPixel.map((ponto) =>
        distanciaPontoCaixa(ponto.x, ponto.y, atual)
      )
    );

    const menorDistanciaMelhor = Math.min(
      ...pontosCurvaEmPixel.map((ponto) =>
        distanciaPontoCaixa(ponto.x, ponto.y, melhor)
      )
    );

    return menorDistanciaAtual > menorDistanciaMelhor ? atual : melhor;
  }, candidatos[0]);

  const boxX = melhorCaixa.x;
  const boxY = melhorCaixa.y;

  const textX = boxX + larguraBox / 2;
  const textY = boxY + 19;

  const anchorX = boxX > cx ? boxX : boxX + larguraBox;
  const anchorY = boxY + alturaBox / 2;

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={anchorX}
        y2={anchorY}
        stroke="#a80000"
        strokeWidth="1.5"
      />

      <rect
        x={boxX}
        y={boxY}
        width={larguraBox}
        height={alturaBox}
        rx="9"
        ry="9"
        fill="#fff5f5"
        stroke="#a80000"
        strokeWidth="1.5"
      />

      <circle
        cx={cx}
        cy={cy}
        r="9"
        fill="#a80000"
        stroke="#ffffff"
        strokeWidth="4"
      />

      <text
        x={textX}
        y={textY}
        fill="#a80000"
        fontSize="12"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {formatarNumeroBR(pontoConsulta.volume, 2)} mL
      </text>
    </g>
  );
})()}

      <text
        x={margem.left + larguraGrafico / 2}
        y={altura - 14}
        fill="#344054"
        fontSize="17"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Volume de titulante adicionado mL
      </text>

      <text
        x={18}
        y={margem.top + alturaGrafico / 2}
        fill="#344054"
        fontSize="17"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        transform={`rotate(-90 18 ${margem.top + alturaGrafico / 2})`}
      >
        pH
      </text>
    </svg>
  );
}

function calcularDerivadasCurvaPoliprotica(
  curva: CurvaAcidoBasePoliprotica
): PontoDerivadaAcidoBase[] {
  const pontosValidos = curva.pontos.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  const derivadasBase: PontoDerivadaAcidoBase[] = pontosValidos.map(
    (ponto, index, array) => {
      if (index === 0 || index === array.length - 1) {
        return {
          volume: ponto.volume,
          d1: null,
          d2: null,
        };
      }

      const anterior = array[index - 1];
      const proximo = array[index + 1];

      const deltaV = proximo.volume - anterior.volume;
      if (!Number.isFinite(deltaV) || deltaV === 0) {
        return {
          volume: ponto.volume,
          d1: null,
          d2: null,
        };
      }

      const d1 = ((proximo.ph ?? 0) - (anterior.ph ?? 0)) / deltaV;

      return {
        volume: ponto.volume,
        d1,
        d2: null,
      };
    }
  );

  const derivadasComSegunda = derivadasBase.map((ponto, index, array) => {
    if (
      index === 0 ||
      index === array.length - 1 ||
      array[index - 1].d1 === null ||
      array[index + 1].d1 === null
    ) {
      return {
        ...ponto,
        d2: null,
      };
    }

    const anterior = array[index - 1];
    const proximo = array[index + 1];

    const deltaV = proximo.volume - anterior.volume;
    if (!Number.isFinite(deltaV) || deltaV === 0) {
      return {
        ...ponto,
        d2: null,
      };
    }

    const d2 = ((proximo.d1 ?? 0) - (anterior.d1 ?? 0)) / deltaV;

    return {
      ...ponto,
      d2,
    };
  });

  return derivadasComSegunda;
}

function montarResumoDerivadasPoli(
  resultado: ResultadoSistemaPoliprotico,
  derivadas: PontoDerivadaAcidoBase[]
): ResumoDerivadaPE[] {
  if (!derivadas.length) return [];

  const passoEstimado =
    derivadas.length > 1
      ? Math.abs(derivadas[1].volume - derivadas[0].volume)
      : 0.5;

  const volumeMinimoAnalise = Math.max(resultado.volumePE1 * 0.12, 1);

  const derivadasUteis = derivadas.filter(
    (item) => item.volume >= volumeMinimoAnalise
  );

  const valoresD1Globais = derivadasUteis
    .map((item) => Math.abs(item.d1 ?? 0))
    .filter((valor) => Number.isFinite(valor));

  const maiorD1Global =
    valoresD1Globais.length > 0 ? Math.max(...valoresD1Globais) : 0;

  return resultado.volumesPE.map((volumePE, index) => {
    const janela = Math.max(resultado.volumePE1 * 0.05, passoEstimado * 6, 1);

    const candidatos = derivadasUteis.filter(
      (item) => Math.abs(item.volume - volumePE) <= janela
    );

    const candidatosD1 = candidatos.filter(
      (item) => item.d1 !== null && Number.isFinite(item.d1)
    );

    const candidatosD2 = candidatos.filter(
      (item) => item.d2 !== null && Number.isFinite(item.d2)
    );

    const melhorD1 =
      candidatosD1.length > 0
        ? candidatosD1.reduce((melhor, atual) =>
            Math.abs(atual.d1 ?? 0) > Math.abs(melhor.d1 ?? 0)
              ? atual
              : melhor
          )
        : null;

    const maiorD1Local =
      candidatosD1.length > 0
        ? Math.max(...candidatosD1.map((item) => Math.abs(item.d1 ?? 0)))
        : 0;

    const temPicoD1 =
      maiorD1Local >= 0.35 &&
      maiorD1Global > 0 &&
      maiorD1Local >= maiorD1Global * 0.18;

    const temTrocaSinalD2 = candidatosD2.some((item, i, array) => {
      if (i === 0) return false;

      const anterior = array[i - 1].d2;
      const atual = item.d2;

      if (anterior === null || atual === null) return false;

      return anterior * atual < 0;
    });

    const melhorD2 =
      candidatosD2.length > 0 && temTrocaSinalD2
        ? candidatosD2.reduce((melhor, atual) =>
            Math.abs(atual.d2 ?? 0) < Math.abs(melhor.d2 ?? 0)
              ? atual
              : melhor
          )
        : null;

    const detectavelD1 = temPicoD1;
    const detectavelD2 = temPicoD1 && temTrocaSinalD2;
    const detectavelGeral = detectavelD1 && detectavelD2;

    const interpretacao = detectavelGeral
      ? "Este ponto apresenta pico/vale relevante na 1ª derivada e inflexão compatível na 2ª derivada, podendo ser localizado graficamente."
      : "Este ponto não apresenta pico/vale claro na 1ª derivada associado a uma inflexão confiável na 2ª derivada. Portanto, ele existe pelo cálculo estequiométrico, mas não deve ser considerado detectável pela análise derivativa.";

    return {
      pe: index + 1,
      volumeTeorico: volumePE,
      volumePicoD1: detectavelD1 ? melhorD1?.volume ?? null : null,
      valorPicoD1: detectavelD1 ? melhorD1?.d1 ?? null : null,
      volumeZeroD2: detectavelD2 ? melhorD2?.volume ?? null : null,
      valorD2: detectavelD2 ? melhorD2?.d2 ?? null : null,
      detectavelD1,
      detectavelD2,
      detectavelGeral,
      interpretacao,
    };
  });
}

function identificarStatusVolume(
  resultado: ResultadoSistemaPoliprotico,
  volume: number
) {
  const tolerancia = Math.max(resultado.volumePE1 * 0.01, 0.2);

  for (let index = 0; index < resultado.volumesPE.length; index++) {
    const volumePE = resultado.volumesPE[index];

    if (Math.abs(volume - volumePE) <= tolerancia) {
      return `Próximo ao PE${index + 1}`;
    }

    if (volume < volumePE) {
      return `Antes do PE${index + 1}`;
    }
  }

  return `Após o PE${resultado.volumesPE.length}`;
}

function montarTabelaPrimeiraDerivadaPoli(
  resultado: ResultadoSistemaPoliprotico,
  curva: CurvaAcidoBasePoliprotica
): LinhaTabelaPrimeiraDerivada[] {
  const pontosValidos = curva.pontos.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  return pontosValidos.map((ponto, index, array) => {
    if (index === 0) {
      return {
        indice: index + 1,
        volume: ponto.volume,
        ph: ponto.ph,
        volumeMedio: null,
        deltaPH: null,
        deltaV: null,
        primeiraDerivada: null,
        status: identificarStatusVolume(resultado, ponto.volume),
      };
    }

    const anterior = array[index - 1];

    const deltaPH = (ponto.ph ?? 0) - (anterior.ph ?? 0);
    const deltaV = ponto.volume - anterior.volume;
    const volumeMedio = (ponto.volume + anterior.volume) / 2;

    const primeiraDerivada =
      Number.isFinite(deltaV) && deltaV !== 0 ? deltaPH / deltaV : null;

    return {
      indice: index + 1,
      volume: ponto.volume,
      ph: ponto.ph,
      volumeMedio,
      deltaPH,
      deltaV,
      primeiraDerivada,
      status: identificarStatusVolume(resultado, ponto.volume),
    };
  });
}

function montarTabelaSegundaDerivadaPoli(
  resultado: ResultadoSistemaPoliprotico,
  tabelaPrimeira: LinhaTabelaPrimeiraDerivada[]
): LinhaTabelaSegundaDerivada[] {
  const linhasComPrimeira = tabelaPrimeira.filter(
    (linha) =>
      linha.volumeMedio !== null &&
      linha.primeiraDerivada !== null &&
      Number.isFinite(linha.primeiraDerivada)
  );

  return linhasComPrimeira.map((linha, index, array) => {
    if (index === 0) {
      return {
        indice: index + 1,
        volumeMedioPrimeira: linha.volumeMedio ?? 0,
        primeiraDerivada: linha.primeiraDerivada ?? 0,
        volumeMedioSegunda: null,
        deltaPrimeiraDerivada: null,
        deltaV: null,
        segundaDerivada: null,
        status: identificarStatusVolume(resultado, linha.volumeMedio ?? 0),
      };
    }

    const anterior = array[index - 1];

    const volumeAtual = linha.volumeMedio ?? 0;
    const volumeAnterior = anterior.volumeMedio ?? 0;

    const deltaPrimeiraDerivada =
      (linha.primeiraDerivada ?? 0) - (anterior.primeiraDerivada ?? 0);

    const deltaV = volumeAtual - volumeAnterior;
    const volumeMedioSegunda = (volumeAtual + volumeAnterior) / 2;

    const segundaDerivada =
      Number.isFinite(deltaV) && deltaV !== 0
        ? deltaPrimeiraDerivada / deltaV
        : null;

    return {
      indice: index + 1,
      volumeMedioPrimeira: volumeAtual,
      primeiraDerivada: linha.primeiraDerivada ?? 0,
      volumeMedioSegunda,
      deltaPrimeiraDerivada,
      deltaV,
      segundaDerivada,
      status: identificarStatusVolume(resultado, volumeAtual),
    };
  });
}

function montarRankingIndicadoresPoli(
  resultado: ResultadoSistemaPoliprotico
): BlocoRankingIndicadorAcidoBase[] {
  return resultado.volumesPE.map((volumePE, index) => {
    const pe = index + 1;
    const pontoPE = calcularPhPorVolumePoliprotico(resultado, volumePE);
    const phPE = pontoPE.ph;

    if (phPE === null) {
      return {
        pe,
        volumePE,
        phPE: 0,
        ranking: [],
      };
    }

    const ranking = indicadoresAcidoBase
      .map((indicador) => {
        const phMin = Number(indicador.phMinimo);
        const phMax = Number(indicador.phMaximo);
        const phCentral = Number(indicador.phCentral);

        if (
          !Number.isFinite(phMin) ||
          !Number.isFinite(phMax) ||
          !Number.isFinite(phCentral)
        ) {
          return null;
        }

        const cobrePE = phPE >= phMin && phPE <= phMax;
        const erro = Math.abs(phPE - phCentral);
        const score = calcularScoreIndicadorPoli(erro, cobrePE);

        return {
          pe,
          volumePE,
          phPE,
          nome: indicador.nome,
          phMin,
          phMax,
          phCentral,
          faixa: indicador.faixa,
          categoria: indicador.categoria,
          cobrePE,
          erro,
          score,
          justificativa: montarJustificativaIndicador({
            nome: indicador.nome,
            phPE,
            phMin,
            phMax,
            phCentral,
            cobrePE,
            erro,
          }),
        };
      })
      .filter((item): item is RankingIndicadorAcidoBase => item !== null)
      .sort((a, b) => {
        if (a.cobrePE !== b.cobrePE) {
          return a.cobrePE ? -1 : 1;
        }

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.erro - b.erro;
      })
      .slice(0, 6);

    return {
      pe,
      volumePE,
      phPE,
      ranking,
    };
  });
}

function calcularScoreIndicadorPoli(erro: number, cobrePE: boolean) {
  let score = Math.max(0, 100 - erro * 25);

  if (cobrePE) {
    score += 15;
  }

  return Math.min(100, Math.round(score));
}

function montarJustificativaIndicador(params: {
  nome: string;
  phPE: number;
  phMin: number;
  phMax: number;
  phCentral: number;
  cobrePE: boolean;
  erro: number;
}) {
  const { nome, phPE, phMin, phMax, phCentral, cobrePE, erro } = params;

  if (cobrePE) {
    return `${nome} é recomendado porque sua faixa de viragem (${formatarNumeroBR(
      phMin,
      2
    )} a ${formatarNumeroBR(
      phMax,
      2
    )}) cobre o pH do ponto de equivalência (${formatarNumeroBR(
      phPE,
      2
    )}).`;
  }

  return `${nome} não cobre exatamente o pH do PE (${formatarNumeroBR(
    phPE,
    2
  )}), mas ficou entre os mais próximos porque seu pH central (${formatarNumeroBR(
    phCentral,
    2
  )}) está a ${formatarNumeroBR(erro, 2)} unidade(s) de pH do ponto analisado.`;
}

function GraficoIndicadorPoliprotico({
  curva,
  resultado,
  indicador,
}: {
  curva: CurvaAcidoBasePoliprotica;
  resultado: ResultadoSistemaPoliprotico;
  indicador: RankingIndicadorAcidoBase;
}) {
  const largura = 980;
  const altura = 560;

  const margem = {
    top: 52,
    right: 36,
    bottom: 64,
    left: 72,
  };

  const larguraGrafico = largura - margem.left - margem.right;
  const alturaGrafico = altura - margem.top - margem.bottom;

  const volumeMaximo = curva.volumeMaximo || 1;
  const phMinGrafico = 0;
  const phMaxGrafico = 14;

  function limitarPH(valor: number) {
    return Math.min(phMaxGrafico, Math.max(phMinGrafico, valor));
  }

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(ph: number) {
    return (
      margem.top +
      ((phMaxGrafico - ph) / (phMaxGrafico - phMinGrafico)) * alturaGrafico
    );
  }

  function limitarBox(
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number
  ) {
    let novoX = x;
    let novoY = y;

    if (novoX < margem.left + 8) {
      novoX = margem.left + 8;
    }

    if (novoX + boxWidth > largura - margem.right - 8) {
      novoX = largura - margem.right - boxWidth - 8;
    }

    if (novoY < margem.top + 8) {
      novoY = margem.top + 8;
    }

    if (novoY + boxHeight > margem.top + alturaGrafico - 8) {
      novoY = margem.top + alturaGrafico - boxHeight - 8;
    }

    return { x: novoX, y: novoY };
  }

  function obterPosicaoLabelPE(
    cx: number,
    cy: number,
    preferirDireita = true
  ) {
    const boxWidth = 82;
const boxHeight = 38;

const candidatoDireita = limitarBox(cx + 34, cy - 64, boxWidth, boxHeight);
const candidatoEsquerda = limitarBox(
  cx - boxWidth - 34,
  cy - 64,
  boxWidth,
  boxHeight
);

    const box = preferirDireita ? candidatoDireita : candidatoEsquerda;

    const anchorX = box.x > cx ? box.x : box.x + boxWidth;
    const anchorY = box.y + boxHeight / 2;

    return {
      boxX: box.x,
      boxY: box.y,
      boxWidth,
      boxHeight,
      anchorX,
      anchorY,
    };
  }

  const pontosValidos = curva.pontos.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  const pathCurva = pontosValidos
    .map((ponto, index) => {
      const x = xScale(ponto.volume);
      const y = yScale(ponto.ph ?? 0);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const pontosPE = resultado.volumesPE
    .map((volume, index) => {
      const pontoPE = calcularPhPorVolumePoliprotico(resultado, volume);
      return {
        volume,
        ph: pontoPE.ph,
        label: `PE${index + 1}`,
        pe: index + 1,
      };
    })
    .filter((ponto) => ponto.ph !== null && ponto.ph !== undefined);

  const linhasPH = [0, 2, 4, 6, 8, 10, 12, 14];
  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  const phFaixaMin = limitarPH(indicador.phMin);
  const phFaixaMax = limitarPH(indicador.phMax);

  const faixaYTop = yScale(phFaixaMax);
  const faixaYBottom = yScale(phFaixaMin);
  const alturaFaixa = Math.max(2, faixaYBottom - faixaYTop);

  const yPhPE = yScale(limitarPH(indicador.phPE));
  const xVolumePE = xScale(indicador.volumePE);

  const peAtivoMaisADireita = xVolumePE < margem.left + larguraGrafico * 0.72;
  const labelAtivo = obterPosicaoLabelPE(
    xVolumePE,
    yPhPE,
    peAtivoMaisADireita
  );

  const faixaLabelX = margem.left + 16;
  const faixaLabelY = margem.top - 38;
  const faixaLabelWidth = 250;
  const faixaLabelHeight = 32;

  return (
    <svg
      className="acidBaseCurveSvg indicatorCurveSvg"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Faixa de indicador na curva ácido-base"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={largura} height={altura} fill="#ffffff" />

      <rect
        x={margem.left}
        y={margem.top}
        width={larguraGrafico}
        height={alturaGrafico}
        fill="#fffafa"
        stroke="#f1d4d4"
        strokeWidth="1"
      />

      {linhasPH.map((ph) => (
        <g key={`ph-ind-${ph}`}>
          <line
            x1={margem.left}
            x2={margem.left + larguraGrafico}
            y1={yScale(ph)}
            y2={yScale(ph)}
            stroke="#eeeeee"
            strokeWidth="1"
          />
          <text
            x={margem.left - 12}
            y={yScale(ph) + 5}
            fill="#667085"
            fontSize="13"
            fontWeight="700"
            textAnchor="end"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {ph}
          </text>
        </g>
      ))}

      {linhasVolume.map((volume) => (
        <g key={`volume-ind-${volume}`}>
          <line
            x1={xScale(volume)}
            x2={xScale(volume)}
            y1={margem.top}
            y2={margem.top + alturaGrafico}
            stroke="#eeeeee"
            strokeWidth="1"
          />
          <text
            x={xScale(volume)}
            y={margem.top + alturaGrafico + 28}
            fill="#667085"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {formatarNumeroBR(volume, 0)}
          </text>
        </g>
      ))}

      <rect
        x={margem.left}
        y={faixaYTop}
        width={larguraGrafico}
        height={alturaFaixa}
        fill="#fca5a5"
opacity="0.12"
      />

      <line
        x1={margem.left}
        x2={margem.left + larguraGrafico}
        y1={faixaYTop}
        y2={faixaYTop}
        stroke="#a80000"
        strokeWidth="1.3"
        strokeDasharray="8 6"
        opacity="0.85"
      />

      <line
        x1={margem.left}
        x2={margem.left + larguraGrafico}
        y1={faixaYBottom}
        y2={faixaYBottom}
        stroke="#a80000"
        strokeWidth="1.3"
        strokeDasharray="8 6"
        opacity="0.85"
      />

      <rect
        x={faixaLabelX}
        y={faixaLabelY}
        width={faixaLabelWidth}
        height={faixaLabelHeight}
        rx="10"
        ry="10"
        fill="#ffffff"
        stroke="#f3d1d1"
        strokeWidth="1"
        opacity="0.96"
      />

      <text
        x={faixaLabelX + 12}
        y={faixaLabelY + 19}
        fill="#7a0000"
        fontSize="12"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {indicador.nome}: pH {formatarNumeroBR(indicador.phMin, 2)} a{" "}
        {formatarNumeroBR(indicador.phMax, 2)}
      </text>

      <path
        d={pathCurva}
        fill="none"
        stroke="#a80000"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {pontosPE.map((ponto) => {
        const cx = xScale(ponto.volume);
        const cy = yScale(ponto.ph ?? 0);
        const ehPEAtivo = ponto.pe === indicador.pe;

        return (
          <g key={`ind-${ponto.label}`}>
            <line
              x1={cx}
              x2={cx}
              y1={margem.top}
              y2={margem.top + alturaGrafico}
              stroke="#111111"
              strokeWidth={ehPEAtivo ? "2.2" : "1.8"}
              strokeDasharray="8 6"
              opacity={ehPEAtivo ? 1 : 0.9}
            />

            <circle
              cx={cx}
              cy={cy}
              r={ehPEAtivo ? "10" : "6"}
              fill={ehPEAtivo ? "#a80000" : "#111111"}
              stroke="#ffffff"
              strokeWidth="4"
            />

            {!ehPEAtivo && (
              <text
                x={cx + 14}
                y={cy - 14}
                fill="#111111"
                fontSize="16"
                fontWeight="900"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {ponto.label}
              </text>
            )}
          </g>
        );
      })}

      <line
        x1={xVolumePE}
        y1={yPhPE}
        x2={labelAtivo.anchorX}
        y2={labelAtivo.anchorY}
        stroke="#a80000"
        strokeWidth="1.3"
      />

      <rect
        x={labelAtivo.boxX}
        y={labelAtivo.boxY}
        width={labelAtivo.boxWidth}
        height={labelAtivo.boxHeight}
        rx="12"
        ry="12"
        fill="#ffffff"
        stroke="#a80000"
        strokeWidth="1.3"
      />

      <text
        x={labelAtivo.boxX + labelAtivo.boxWidth / 2}
        y={labelAtivo.boxY + 18}
        fill="#a80000"
        fontSize="13"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        PE{indicador.pe}
      </text>

      <text
        x={labelAtivo.boxX + labelAtivo.boxWidth / 2}
        y={labelAtivo.boxY + 35}
        fill="#a80000"
        fontSize="12"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        pH {formatarNumeroBR(indicador.phPE, 2)}
      </text>

      <text
        x={margem.left + larguraGrafico / 2}
        y={altura - 14}
        fill="#344054"
        fontSize="17"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Volume de titulante adicionado mL
      </text>

      <text
        x={18}
        y={margem.top + alturaGrafico / 2}
        fill="#344054"
        fontSize="17"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        transform={`rotate(-90 18 ${margem.top + alturaGrafico / 2})`}
      >
        pH
      </text>
    </svg>
  );
}

function GraficoDerivadaPoliprotico({
  derivadas,
  resultado,
  resumo,
  tipo,
}: {
  derivadas: PontoDerivadaAcidoBase[];
  resultado: ResultadoSistemaPoliprotico;
  resumo: ResumoDerivadaPE[];
  tipo: "d1" | "d2";
}) {
  const largura = 980;
  const altura = 420;
  const margem = {
    top: 28,
    right: 36,
    bottom: 64,
    left: 84,
  };

  const larguraGrafico = largura - margem.left - margem.right;
  const alturaGrafico = altura - margem.top - margem.bottom;

  const volumeMaximo =
    derivadas.length > 0 ? derivadas[derivadas.length - 1].volume : 1;

  const pontosValidos = derivadas
    .map((item) => ({
      volume: item.volume,
      valor: tipo === "d1" ? item.d1 : item.d2,
    }))
    .filter((item) => item.valor !== null && Number.isFinite(item.valor));

  if (!pontosValidos.length) {
    return (
      <div className="chartEmpty">
        Não há dados suficientes para calcular esta derivada.
      </div>
    );
  }

  const valores = pontosValidos.map((item) => item.valor as number);
  const valorMin = Math.min(...valores);
  const valorMax = Math.max(...valores);
  const amplitude = Math.max(valorMax - valorMin, 0.0001);
  const padding = amplitude * 0.12;

  const yMin = valorMin - padding;
  const yMax = valorMax + padding;

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(valor: number) {
    return margem.top + ((yMax - valor) / (yMax - yMin)) * alturaGrafico;
  }

  const pathDerivada = pontosValidos
    .map((ponto, index) => {
      const x = xScale(ponto.volume);
      const y = yScale(ponto.valor as number);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  const linhasY = Array.from({ length: 6 }, (_, index) => {
    return yMin + ((yMax - yMin) / 5) * index;
  });

  const zeroDentroDoGrafico = yMin <= 0 && yMax >= 0;

  const pontosDetectaveis = resumo
  .map((item) => {
    const volumeMarcado =
      tipo === "d1" ? item.volumePicoD1 : item.volumeZeroD2;

    if (volumeMarcado === null) return null;

    const pontoMaisProximo = pontosValidos.reduce((melhor, atual) => {
      return Math.abs(atual.volume - volumeMarcado) <
        Math.abs(melhor.volume - volumeMarcado)
        ? atual
        : melhor;
    }, pontosValidos[0]);

    return {
      pe: item.pe,
      volumeTeorico: item.volumeTeorico,
      volumeMarcado,
      ponto: pontoMaisProximo,
    };
  })
  .filter(
    (
      item
    ): item is {
      pe: number;
      volumeTeorico: number;
      volumeMarcado: number;
      ponto: {
        volume: number;
        valor: number | null;
      };
    } => item !== null
  );

  return (
    <svg
    className={
      tipo === "d1"
        ? "acidBaseCurveSvg derivativeD1Svg"
        : "acidBaseCurveSvg derivativeD2Svg"
    }
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={
        tipo === "d1"
          ? "Gráfico da primeira derivada"
          : "Gráfico da segunda derivada"
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={largura} height={altura} fill="#ffffff" />

      <rect
        x={margem.left}
        y={margem.top}
        width={larguraGrafico}
        height={alturaGrafico}
        fill="#fffafa"
        stroke="#f1d4d4"
        strokeWidth="1"
      />

      {linhasY.map((valor, index) => (
        <g key={`linha-y-${index}`}>
          <line
            x1={margem.left}
            x2={margem.left + larguraGrafico}
            y1={yScale(valor)}
            y2={yScale(valor)}
            stroke="#eeeeee"
            strokeWidth="1"
          />
          <text
            x={margem.left - 12}
            y={yScale(valor) + 5}
            fill="#667085"
            fontSize="13"
            fontWeight="700"
            textAnchor="end"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {formatarNumeroBR(valor, 2)}
          </text>
        </g>
      ))}

      {linhasVolume.map((volume) => (
        <g key={`linha-x-${volume}`}>
          <line
            x1={xScale(volume)}
            x2={xScale(volume)}
            y1={margem.top}
            y2={margem.top + alturaGrafico}
            stroke="#eeeeee"
            strokeWidth="1"
          />
          <text
            x={xScale(volume)}
            y={margem.top + alturaGrafico + 28}
            fill="#667085"
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {formatarNumeroBR(volume, 0)}
          </text>
        </g>
      ))}

      {zeroDentroDoGrafico && (
        <line
          x1={margem.left}
          x2={margem.left + larguraGrafico}
          y1={yScale(0)}
          y2={yScale(0)}
          stroke="#344054"
          strokeWidth="1.5"
          strokeDasharray="6 5"
        />
      )}

{pontosDetectaveis.map((item) => (
  <line
    key={`pe-derivada-${tipo}-${item.pe}`}
    x1={xScale(item.volumeTeorico)}
    x2={xScale(item.volumeTeorico)}
    y1={margem.top}
    y2={margem.top + alturaGrafico}
    stroke="#111111"
    strokeWidth="1.8"
    strokeDasharray="8 6"
  />
))}

      <path
        d={pathDerivada}
        fill="none"
        stroke={tipo === "d1" ? "#a80000" : "#7a1f1f"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

{pontosDetectaveis.map((item) => {
  const melhor = item.ponto;

  if (melhor.valor === null) return null;

  const cx = xScale(melhor.volume);
  const cy = yScale(melhor.valor);

  const boxWidth = 52;
  const boxHeight = 26;

  let boxX = cx + 12;
  let boxY = cy - 38;

  if (boxX + boxWidth > largura - margem.right - 8) {
    boxX = cx - boxWidth - 12;
  }

  if (boxY < margem.top + 8) {
    boxY = cy + 14;
  }

  if (boxY + boxHeight > margem.top + alturaGrafico - 8) {
    boxY = cy - 38;
  }

  const anchorX = boxX > cx ? boxX : boxX + boxWidth;
  const anchorY = boxY + boxHeight / 2;

  return (
    <g key={`marcador-derivada-${tipo}-${item.pe}`}>
      <line
        x1={cx}
        y1={cy}
        x2={anchorX}
        y2={anchorY}
        stroke="#111111"
        strokeWidth="1.3"
      />

      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx="8"
        ry="8"
        fill="#ffffff"
        stroke="#111111"
        strokeWidth="1.3"
      />

      <circle
        cx={cx}
        cy={cy}
        r="6.5"
        fill="#a80000"
        stroke="#ffffff"
        strokeWidth="3"
      />

      <text
        x={boxX + boxWidth / 2}
        y={boxY + 18}
        fill="#111111"
        fontSize="13"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        PE{item.pe}
      </text>
    </g>
  );
})}

      <text
        x={margem.left + larguraGrafico / 2}
        y={altura - 14}
        fill="#344054"
        fontSize="16"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Volume de titulante adicionado mL
      </text>

      <text
        x={22}
        y={margem.top + alturaGrafico / 2}
        fill="#344054"
        fontSize="16"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        transform={`rotate(-90 22 ${margem.top + alturaGrafico / 2})`}
      >
        {tipo === "d1" ? "dpH/dV" : "d²pH/dV²"}
      </text>
    </svg>
  );
}

function GraficoTempoRealPoliprotico({
  curva,
  resultado,
  pontosAdicionados,
}: {
  curva: CurvaAcidoBasePoliprotica;
  resultado: ResultadoSistemaPoliprotico;
  pontosAdicionados: PontoCurvaAcidoBase[];
}) {
  const largura = 1500;
const altura = 820;

const margem = {
  top: 36,
  right: 36,
  bottom: 90,
  left: 72,
};

  const larguraGrafico = largura - margem.left - margem.right;
  const alturaGrafico = altura - margem.top - margem.bottom;

  const volumeMaximoTotal = curva.volumeMaximo || 1;

  const phMin = 0;
  const phMax = 14;

  const pontosValidos = curva.pontos.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  const pontosAdicionadosValidos = pontosAdicionados.filter(
    (ponto) => ponto.ph !== null && Number.isFinite(ponto.ph)
  );

  const ultimoVolume =
    pontosAdicionadosValidos.length > 0
      ? pontosAdicionadosValidos[pontosAdicionadosValidos.length - 1].volume
      : 0;

  const larguraJanela = Math.min(
    volumeMaximoTotal,
    Math.max(resultado.volumePE1 * 1.4, 20)
  );

  const margemSeguimento = larguraJanela * 0.22;

  let xMinVisivel = 0;
  let xMaxVisivel = larguraJanela;

  if (ultimoVolume > xMaxVisivel - margemSeguimento) {
    xMaxVisivel = Math.min(volumeMaximoTotal, ultimoVolume + margemSeguimento);
    xMinVisivel = Math.max(0, xMaxVisivel - larguraJanela);
  }

  const amplitudeX = Math.max(xMaxVisivel - xMinVisivel, 1);

  function xScale(volume: number) {
    return (
      margem.left +
      ((volume - xMinVisivel) / amplitudeX) * larguraGrafico
    );
  }

  function yScale(ph: number) {
    return margem.top + ((phMax - ph) / (phMax - phMin)) * alturaGrafico;
  }

  const pontosValidosVisiveis = pontosValidos.filter(
    (ponto) => ponto.volume >= xMinVisivel && ponto.volume <= xMaxVisivel
  );

  const pontosAdicionadosVisiveis = pontosAdicionadosValidos.filter(
    (ponto) => ponto.volume >= xMinVisivel && ponto.volume <= xMaxVisivel
  );

  const pathCurva = pontosValidosVisiveis
    .map((ponto, index) => {
      const x = xScale(ponto.volume);
      const y = yScale(ponto.ph ?? 0);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const pathPontosAdicionados = pontosAdicionadosVisiveis
    .map((ponto, index) => {
      const x = xScale(ponto.volume);
      const y = yScale(ponto.ph ?? 0);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const saltosGrandes = pontosAdicionadosVisiveis
    .map((ponto, index, array) => {
      if (index === 0) return null;

      const anterior = array[index - 1];
      const deltaV = ponto.volume - anterior.volume;

      const limiteSalto = Math.max(resultado.volumePE1 * 0.08, 2);

      if (deltaV <= limiteSalto) return null;

      return {
        volumeInicio: anterior.volume,
        volumeFim: ponto.volume,
        phInicio: anterior.ph,
        phFim: ponto.ph,
        deltaV,
      };
    })
    .filter(
      (
        item
      ): item is {
        volumeInicio: number;
        volumeFim: number;
        phInicio: number | null;
        phFim: number | null;
        deltaV: number;
      } => item !== null
    );

  const linhasPH = [0, 2, 4, 6, 8, 10, 12, 14];

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return xMinVisivel + (amplitudeX / 5) * index;
  });

  const volumesPEVisiveis = resultado.volumesPE
    .map((volume, index) => ({
      volume,
      pe: index + 1,
    }))
    .filter(
      (item) => item.volume >= xMinVisivel && item.volume <= xMaxVisivel
    );

  return (
    <svg
      className="acidBaseCurveSvg realTimeAcidBaseCurveSvg"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Simulação em tempo real da titulação ácido-base"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={largura} height={altura} fill="#ffffff" />

      <rect
        x={margem.left}
        y={margem.top}
        width={larguraGrafico}
        height={alturaGrafico}
        fill="#fffafa"
        stroke="#f1d4d4"
        strokeWidth="1"
      />

      {linhasPH.map((ph) => (
        <g key={`tempo-real-ph-${ph}`}>
          <line
            x1={margem.left}
            x2={margem.left + larguraGrafico}
            y1={yScale(ph)}
            y2={yScale(ph)}
            stroke="#eeeeee"
            strokeWidth="1"
          />

<text
  x={margem.left - 12}
  y={yScale(ph) + 7}
  fill="#667085"
  fontSize="22"
  fontWeight="900"
  textAnchor="end"
  fontFamily="Arial, Helvetica, sans-serif"
>
  {ph}
</text>
        </g>
      ))}

      {linhasVolume.map((volume) => (
        <g key={`tempo-real-volume-${volume}`}>
          <line
            x1={xScale(volume)}
            x2={xScale(volume)}
            y1={margem.top}
            y2={margem.top + alturaGrafico}
            stroke="#eeeeee"
            strokeWidth="1"
          />

<text
  x={xScale(volume)}
  y={margem.top + alturaGrafico + 42}
  fill="#667085"
  fontSize="22"
  fontWeight="900"
  textAnchor="middle"
  fontFamily="Arial, Helvetica, sans-serif"
>
  {formatarNumeroBR(volume, 0)}
</text>
        </g>
      ))}

      {volumesPEVisiveis.map((item) => (
        <line
          key={`tempo-real-pe-${item.pe}`}
          x1={xScale(item.volume)}
          x2={xScale(item.volume)}
          y1={margem.top}
          y2={margem.top + alturaGrafico}
          stroke="#111111"
          strokeWidth="1.8"
          strokeDasharray="8 6"
        />
      ))}

      {pathCurva && (
        <path
          d={pathCurva}
          fill="none"
          stroke="#a80000"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
        />
      )}

      {volumesPEVisiveis.map((item) => {
        const pontoPE = calcularPhPorVolumePoliprotico(resultado, item.volume);

        if (pontoPE.ph === null) return null;

        const cx = xScale(item.volume);
        const cy = yScale(pontoPE.ph);

        return (
          <g key={`tempo-real-marcador-pe-${item.pe}`}>
            <circle
              cx={cx}
              cy={cy}
              r="11"
              fill="#111111"
              stroke="#ffffff"
              strokeWidth="3"
            />

<text
  x={cx + 18}
  y={cy - 18}
  fill="#111111"
  fontSize="26"
  fontWeight="900"
  fontFamily="Arial, Helvetica, sans-serif"
>
  PE{item.pe}
</text>
          </g>
        );
      })}

      {pathPontosAdicionados && (
        <path
          d={pathPontosAdicionados}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 8"
        />
      )}

      {saltosGrandes.map((salto, index) => {
        if (salto.phInicio === null || salto.phFim === null) return null;

        const x1 = xScale(salto.volumeInicio);
        const x2 = xScale(salto.volumeFim);
        const y1 = yScale(salto.phInicio);
        const y2 = yScale(salto.phFim);

        return (
          <g key={`salto-volume-${index}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#f43f5e"
              strokeWidth="5"
              strokeDasharray="4 10"
              opacity="0.55"
            />
          </g>
        );
      })}

      {pontosAdicionadosVisiveis.map((ponto, index) => {
        const ehUltimoPontoGeral =
          pontosAdicionadosValidos.length > 0 &&
          ponto.volume ===
            pontosAdicionadosValidos[pontosAdicionadosValidos.length - 1].volume;

        const cx = xScale(ponto.volume);
        const cy = yScale(ponto.ph ?? 0);

        return (
          <g key={`tempo-real-ponto-${index}`}>
            <circle
              cx={cx}
              cy={cy}
              r={ehUltimoPontoGeral ? "15" : "11"}
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="4"
            />

            {ehUltimoPontoGeral && (
              <text
              x={cx}
              y={cy - 24}
              fill="#9f1239"
              fontSize="26"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              {formatarNumeroBR(ponto.volume, 2)}
            </text>
            )}
          </g>
        );
      })}

<text
  x={margem.left + larguraGrafico / 2}
  y={altura - 24}
  fill="#344054"
  fontSize="26"
  fontWeight="900"
  textAnchor="middle"
  fontFamily="Arial, Helvetica, sans-serif"
>
  Volume de titulante adicionado mL
</text>

<text
  x={24}
  y={margem.top + alturaGrafico / 2}
  fill="#344054"
  fontSize="26"
  fontWeight="900"
  textAnchor="middle"
  fontFamily="Arial, Helvetica, sans-serif"
  transform={`rotate(-90 24 ${margem.top + alturaGrafico / 2})`}
>
  pH
</text>
    </svg>
  );
}