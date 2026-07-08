"use client";

import { useState } from "react";

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
  Simule e interprete titulações envolvendo ácidos monopróticos, bases
  monobásicas, ácidos polipróticos e bases polibásicas. O módulo será
  estruturado para calcular curvas de pH, regiões tampão, pontos de
  equivalência, espécies predominantes e bases do cálculo.
</p>
          </div>

          <div className="moduleInfoCard">
            <strong>Status</strong>
            <span>
  Ambiente preparado para separar sistemas monopróticos/monobásicos e
  polipróticos/polibásicos dentro do mesmo módulo.
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
  Ácidos que liberam um H⁺ ou bases que neutralizam um H⁺ em uma etapa
  principal de titulação.
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
  Ácidos que liberam mais de um H⁺ ou bases que neutralizam mais de um
  H⁺, podendo apresentar múltiplas regiões de equivalência.
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
  Área reservada para entrada dos dados de titulações envolvendo ácidos
  monopróticos ou bases monobásicas.
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
      Espaço reservado para análise da primeira e segunda derivada da curva de
      titulação ácido-base, auxiliando na localização do ponto de equivalência.
    </p>
  </div>
)}

{abaAtiva === "tempoReal" && (
  <div className="resultsPanel">
    <h2>Tempo real</h2>
    <p>
      Espaço reservado para simular a adição gradual do titulante e acompanhar o
      pH calculado a cada volume adicionado.
    </p>
  </div>
)}
      </div>
    </section>
  );
}

function ModuloPoliprotico({ abaAtiva }: { abaAtiva: AbaAcidoBase }) {
  return (
    <section className="container calculatorSection">
      <div className="curveDashboard">
        {abaAtiva === "visao" && (
          <div className="resultsPanel">
            <span className="eyebrow">Polipróticos / polibásicas</span>
<h2>Visão geral</h2>
<p>
  Área reservada para entrada dos dados de titulações envolvendo ácidos
  polipróticos ou bases polibásicas, com mais de uma etapa de
  neutralização.
</p>

            <div className="resultGrid">
              <div className="resultCard">
                <span>Sistema</span>
                <strong>Ácido poliprótico ou base polibásica</strong>
              </div>

              <div className="resultCard">
                <span>Exemplos</span>
                <strong>H₂CO₃, H₃PO₄, H₂SO₄, CO₃²⁻, PO₄³⁻</strong>
              </div>

              <div className="resultCard">
                <span>Foco</span>
                <strong>Múltiplas regiões de equivalência</strong>
              </div>
            </div>
          </div>
        )}

{abaAtiva === "curva" && (
  <div className="resultsPanel">
    <h2>Curva de titulação</h2>
    <p>
      Espaço reservado para o gráfico pH × volume do titulante em
      sistemas polipróticos.
    </p>
  </div>
)}

{abaAtiva === "indicadores" && (
  <div className="resultsPanel">
    <h2>Indicadores</h2>
    <p>
      Espaço reservado para recomendação de indicadores ácido-base considerando
      os pontos de equivalência e as faixas de viragem.
    </p>
  </div>
)}

{abaAtiva === "baseCalculo" && (
          <div className="resultsPanel">
            <h2>Base do cálculo</h2>
            <p>
              Espaço reservado para mostrar Ka₁, Ka₂, Ka₃, balanço de massa,
              balanço de carga, volumes de equivalência e espécies
              consideradas.
            </p>
          </div>
        )}

{abaAtiva === "derivadas" && (
  <div className="resultsPanel">
    <h2>Derivadas</h2>
    <p>
      Espaço reservado para análise da primeira e segunda derivada da curva de
      titulação ácido-base, auxiliando na localização do ponto de equivalência.
    </p>
  </div>
)}

{abaAtiva === "tempoReal" && (
  <div className="resultsPanel">
    <h2>Tempo real</h2>
    <p>
      Espaço reservado para simular a adição gradual do titulante e acompanhar o
      pH calculado a cada volume adicionado.
    </p>
  </div>
)}
      </div>
    </section>
  );
}