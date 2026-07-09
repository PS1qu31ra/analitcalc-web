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

type TipoSistemaAcidoBase = "mono" | "poli";

type AbaAcidoBase =
  | "visao"
  | "baseCalculo"
  | "curva"
  | "indicadores"
  | "derivadas"
  | "tempoReal";

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

  function baixarGraficoCurvaPoliprotica() {
    const svgOriginal = document.querySelector(
      ".acidBaseCurveSvg"
    ) as SVGSVGElement | null;
  
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
      link.download = "curva-titulacao-acido-base.png";
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
    onClick={baixarGraficoCurvaPoliprotica}
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
          <div className="resultsPanel">
            <h2>Indicadores</h2>
            <p>
              Próxima etapa: usar os pH dos pontos de equivalência para ranquear
              indicadores ácido-base.
            </p>
          </div>
        )}

        {abaAtiva === "derivadas" && (
          <div className="resultsPanel">
            <h2>Derivadas</h2>
            <p>
              Próxima etapa: calcular primeira e segunda derivada da curva para
              localizar os pontos de equivalência.
            </p>
          </div>
        )}

        {abaAtiva === "tempoReal" && (
          <div className="resultsPanel">
            <h2>Tempo real</h2>
            <p>
              Próxima etapa: simular a adição gradual do titulante e acompanhar
              o pH calculado a cada volume adicionado.
            </p>
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
      className="acidBaseCurveSvg"
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
            fontSize="15"
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
            fontSize="15"
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
        fontSize="14"
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