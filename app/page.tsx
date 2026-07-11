import { ModuleCard } from "../components/ModuleCard";
import { modules } from "../lib/modules";
import { logos } from "../lib/logos";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container heroContent">
          <div className="heroText">
            <span className="eyebrow">Plataforma educacional</span>

            <div className="heroLogoBox">
              <img
                src={logos.analitcalc}
                alt="Logo AnalitCalc"
                className="heroLogo"
              />
            </div>

            <h1>Química Analítica com cálculo, interpretação e tutoria.</h1>

            <p>
              Sistema web para auxiliar estudantes e professores em cálculos de
              Química Analítica, com módulos interativos, interpretação dos
              resultados e apoio inteligente ao aprendizado.
            </p>

            <div className="heroActions">
              <a href="#modulos" className="primaryButton">
                Acessar módulos
              </a>

              <a href="/complexometria" className="secondaryButton">
                Começar por complexometria
              </a>
            </div>

            <div className="analitoHomeHint">
  <div className="analitoHomeGlow" />

  <div className="analitoHomeIcon">An</div>

  <div className="analitoHomeContent">
    <span>Assistente inteligente</span>

    <strong>Conheça o Analito</strong>

    <p>
      O Analito acompanha seus cálculos em tempo real, interpreta os resultados
      e ajuda a entender conceitos de Química Analítica. Para conversar com ele,
      clique no botão flutuante no canto inferior direito.
    </p>
  </div>

  <div className="analitoHomePointer">
    <span>Botão</span>
    <strong>An</strong>
  </div>
</div>
          </div>

          <div className="heroPanel">
            <span className="panelTag">Objetivo</span>

            <h2>Transformar cálculos complexos em aprendizagem visual.</h2>

            <p>
              O AnalitCalc busca unir rigor químico, automação de cálculos e
              explicações didáticas para facilitar o estudo de Química Analítica
              em sala de aula, laboratório e pesquisa.
            </p>

            <div className="features">
              <div>
                <strong>Cálculos</strong>
                <span>automatizados</span>
              </div>

              <div>
                <strong>Explicações</strong>
                <span>passo a passo</span>
              </div>

              <div>
                <strong>Resultados</strong>
                <span>interpretados</span>
              </div>

              <div>
                <strong>Tutoria</strong>
                <span>inteligente</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="partners">
        <div className="container partnersContent">
          <div>
            <span className="eyebrow white">Vínculo acadêmico</span>

            <h2>Grupo de Química Analítica Aplicada</h2>

            <p>
              Projeto desenvolvido com foco em ensino, pesquisa aplicada e
              inovação educacional em Química Analítica.
            </p>
          </div>

          <div className="partnerLogos">
            <img src={logos.gqaa} alt="Logo do grupo de pesquisa" />
            <img src={logos.ufmg} alt="Logo da UFMG" />
          </div>
        </div>
      </section>

      <section id="modulos" className="section">
        <div className="container">
          <div className="sectionTitle">
            <span className="eyebrow">Menu principal</span>

            <h2>Módulos do AnalitCalc</h2>

            <p>
              Escolha uma área para iniciar os cálculos ou acompanhar os módulos
              em desenvolvimento.
            </p>
          </div>

          <div className="moduleGrid">
            {modules.map((module) => (
              <ModuleCard key={module.href} module={module} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}