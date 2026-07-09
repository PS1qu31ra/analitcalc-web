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

            <div className="formGrid">
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
          <div className="resultsPanel">
            <h2>Curva de titulação</h2>

            {!curvaPoli ? (
              <p>Avalie o sistema primeiro na aba Visão geral.</p>
            ) : (
              <>
                <p>
                  Curva gerada com {curvaPoli.pontos.length} pontos, passo de{" "}
                  {formatarNumeroBR(curvaPoli.passo, 2)} mL e volume máximo de{" "}
                  {formatarNumeroBR(curvaPoli.volumeMaximo, 2)} mL.
                </p>

                <div className="acidBaseFormGrid">
                  <label>
                    Consultar volume mL
                    <input
                      value={volumeConsulta}
                      onChange={(event) =>
                        setVolumeConsulta(event.target.value)
                      }
                      placeholder="Ex.: 12,50"
                    />
                  </label>
                </div>

                <button
                  className="secondaryButton"
                  onClick={consultarVolumePoliprotico}
                >
                  Consultar pH
                </button>

                {pontoConsulta && (
                  <>
                    <div className="resultGrid">
                      <div className="resultCard">
                        <span>Volume consultado</span>
                        <strong>
                          {formatarNumeroBR(pontoConsulta.volume, 2)} mL
                        </strong>
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