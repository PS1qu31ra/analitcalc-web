"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { saisPrecipitacao } from "../../lib/data/precipitacao/sais";

import {
  calcularEquilibrioPrecipitacao,
  calcularProdutoIonicoPrecipitacao,
  calcularSolubilidadeComAnionComum,
  calcularSolubilidadeComCationComum,
  classificarProdutoIonico,
} from "../../lib/precipitacao/calculosEquilibrio";

import { calcularTitulacaoDiretaPrecipitacao } from "../../lib/precipitacao/calculosTitulacaoDireta";
import { avaliarMetodosPrecipitacao } from "../../lib/precipitacao/metodos";
import { avaliarInterferenciasPrecipitacao } from "../../lib/precipitacao/interferencias";

import {
  calcularPontoCurvaTitulacaoDireta,
  gerarCurvaTitulacaoDireta,
} from "../../lib/precipitacao/calculosCurvaTitulacaoDireta";

import {
  formatarCientificoBR,
  formatarNumeroBR,
} from "../../lib/precipitacao/formatadores";

import type {
  AbaPrecipitacao,
  CurvaTitulacaoDiretaPrecipitacao,
  EspecieAnalitoPrecipitacao,
  PontoCurvaTitulacaoDiretaPrecipitacao,
  TipoEstudoPrecipitacao,
} from "../../lib/precipitacao/tipos";

export default function PrecipitacaoPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaPrecipitacao>("sistema");

  const [tipoEstudo, setTipoEstudo] =
    useState<TipoEstudoPrecipitacao>("equilibrio");

  const [salId, setSalId] = useState("AgCl");

  const [concentracaoCationTeste, setConcentracaoCationTeste] = useState("");
  const [concentracaoAnionTeste, setConcentracaoAnionTeste] = useState("");
  const [concentracaoCationComum, setConcentracaoCationComum] = useState("");
  const [concentracaoAnionComum, setConcentracaoAnionComum] = useState("");

  const [especieAnalito, setEspecieAnalito] =
    useState<EspecieAnalitoPrecipitacao>("anion");

  const [concentracaoAnalito, setConcentracaoAnalito] = useState("");
  const [volumeAmostra, setVolumeAmostra] = useState("");
  const [concentracaoTitulante, setConcentracaoTitulante] = useState("");
  const [volumeMaximoBureta, setVolumeMaximoBureta] = useState("");
  const [volumeConsultaCurva, setVolumeConsultaCurva] = useState("");
  const [volumeMarcadoGrafico, setVolumeMarcadoGrafico] = useState("");

  const saisDisponiveis = saisPrecipitacao.filter((sal) =>
  sal.usos.includes(tipoEstudo)
);

const salSelecionado =
  saisDisponiveis.find((sal) => sal.id === salId) ??
  saisDisponiveis[0] ??
  saisPrecipitacao[0];

  const equilibrio = useMemo(() => {
    return calcularEquilibrioPrecipitacao(salSelecionado);
  }, [salSelecionado]);

  useEffect(() => {
    if (
      Number.isFinite(equilibrio.concentracaoCationEquilibrio) &&
      Number.isFinite(equilibrio.concentracaoAnionEquilibrio)
    ) {
      setConcentracaoCationTeste(
        equilibrio.concentracaoCationEquilibrio.toExponential(6)
      );
  
      setConcentracaoAnionTeste(
        equilibrio.concentracaoAnionEquilibrio.toExponential(6)
      );
    }
  }, [
    salSelecionado.id,
    equilibrio.concentracaoCationEquilibrio,
    equilibrio.concentracaoAnionEquilibrio,
  ]);

  function converterNumero(valor: string) {
    return Number(String(valor).replace(",", "."));
  }

  function ajustarConcentracaoTexto(valorAtual: string, fator: number) {
    const valorNumerico = converterNumero(valorAtual);
  
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      return "1e-5";
    }
  
    const novoValor = valorNumerico * fator;
  
    if (novoValor <= 0 || !Number.isFinite(novoValor)) {
      return "1e-5";
    }
  
    return novoValor.toExponential(6);
  }

  const cationTesteNumerico = converterNumero(concentracaoCationTeste);
  const anionTesteNumerico = converterNumero(concentracaoAnionTeste);

  const produtoIonico = calcularProdutoIonicoPrecipitacao({
    sal: salSelecionado,
    concentracaoCation: cationTesteNumerico,
    concentracaoAnion: anionTesteNumerico,
  });

  const classificacaoPI = classificarProdutoIonico(
    produtoIonico,
    salSelecionado.kps
  );

  const razaoPIKps =
    Number.isFinite(produtoIonico) && salSelecionado.kps > 0
      ? produtoIonico / salSelecionado.kps
      : NaN;

      const logRazaoPIKps =
  Number.isFinite(razaoPIKps) && razaoPIKps > 0
    ? Math.log10(razaoPIKps)
    : NaN;

  const cationComumNumerico = converterNumero(concentracaoCationComum);
  const anionComumNumerico = converterNumero(concentracaoAnionComum);

  const solubilidadeComCationComum = calcularSolubilidadeComCationComum({
    sal: salSelecionado,
    concentracaoCationComum: cationComumNumerico,
  });

  const solubilidadeComAnionComum = calcularSolubilidadeComAnionComum({
    sal: salSelecionado,
    concentracaoAnionComum: anionComumNumerico,
  });

  const resultadoTitulacaoDireta =
  tipoEstudo === "titulacaoDireta"
    ? calcularTitulacaoDiretaPrecipitacao({
        sal: salSelecionado,
        especieAnalito,
        concentracaoAnalito: converterNumero(concentracaoAnalito),
        volumeAmostra: converterNumero(volumeAmostra),
        concentracaoTitulante: converterNumero(concentracaoTitulante),
        volumeMaximoBureta: converterNumero(volumeMaximoBureta),
      })
    : null;

const curvaTitulacaoDireta =
  resultadoTitulacaoDireta && resultadoTitulacaoDireta.status !== "dados_invalidos"
    ? gerarCurvaTitulacaoDireta({
        resultado: resultadoTitulacaoDireta,
        passo: 0.25,
      })
    : null;

    const metodosPrecipitacao = avaliarMetodosPrecipitacao(
      resultadoTitulacaoDireta
    );

    const interferenciasPrecipitacao = avaliarInterferenciasPrecipitacao(
      resultadoTitulacaoDireta
    );

    const pontoConsultaCurva =
  resultadoTitulacaoDireta &&
  resultadoTitulacaoDireta.status !== "dados_invalidos" &&
  Number.isFinite(converterNumero(volumeConsultaCurva)) &&
  converterNumero(volumeConsultaCurva) >= 0
    ? calcularPontoCurvaTitulacaoDireta(
        resultadoTitulacaoDireta,
        converterNumero(volumeConsultaCurva)
      )
    : null;

    const pontoMarcadoGrafico =
  resultadoTitulacaoDireta &&
  resultadoTitulacaoDireta.status !== "dados_invalidos" &&
  Number.isFinite(converterNumero(volumeMarcadoGrafico)) &&
  converterNumero(volumeMarcadoGrafico) >= 0
    ? calcularPontoCurvaTitulacaoDireta(
        resultadoTitulacaoDireta,
        converterNumero(volumeMarcadoGrafico)
      )
    : null;

  const nomeTipoEstudo =
    tipoEstudo === "equilibrio"
      ? "Equilíbrio de solubilidade"
      : tipoEstudo === "titulacaoDireta"
        ? "Titulação direta por precipitação"
        : tipoEstudo === "titulacaoRetorno"
          ? "Titulação por retorno"
          : "Precipitação seletiva / mistura";

  const formulaAnalito =
    especieAnalito === "anion"
      ? salSelecionado.anion.formulaExibicao
      : salSelecionado.cation.formulaExibicao;

  const formulaTitulante =
    especieAnalito === "anion"
      ? salSelecionado.cation.formulaExibicao
      : salSelecionado.anion.formulaExibicao;

  return (
    <main className="modulePage">
      <section className="moduleHero">
        <div className="container moduleHeroContent">
          <div>
            <span className="eyebrow">Módulo em reconstrução</span>

            <h1>Equilíbrio e volumetria de precipitação</h1>

            <p>
              Módulo geral para estudar Kps, solubilidade, produto iônico,
              efeito do íon comum, titulação direta, titulação por retorno e
              precipitação seletiva.
            </p>
          </div>

          <div className="moduleInfoCard">
            <strong>Nova estrutura</strong>
            <span>Base geral, sem limitar tudo à argentometria direta.</span>
          </div>
        </div>
      </section>

      <section className="container tabsSection">
        <div className="moduleTabs">
          <button
            type="button"
            className={abaAtiva === "sistema" ? "active" : ""}
            onClick={() => setAbaAtiva("sistema")}
          >
            Sistema
          </button>

          <button
            type="button"
            className={abaAtiva === "equilibrio" ? "active" : ""}
            onClick={() => setAbaAtiva("equilibrio")}
          >
            Equilíbrio
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
            className={abaAtiva === "metodo" ? "active" : ""}
            onClick={() => setAbaAtiva("metodo")}
          >
            Método
          </button>

          <button
            type="button"
            className={abaAtiva === "interferencias" ? "active" : ""}
            onClick={() => setAbaAtiva("interferencias")}
          >
            Interferências
          </button>

          <button
            type="button"
            className={abaAtiva === "resultados" ? "active" : ""}
            onClick={() => setAbaAtiva("resultados")}
          >
            Resultados
          </button>
        </div>
      </section>

      <section className="container calculatorSection">
        <div className="curveDashboard">
          {abaAtiva === "sistema" && (
            <div className="resultsPanel">
              <span className="eyebrow">Entrada geral</span>

              <h2>Sistema de precipitação</h2>

              <p>
                Escolha o tipo de estudo e o sal pouco solúvel. A mesma base de
                Kps será usada para equilíbrio, titulação direta, retorno e
                seletividade.
              </p>

              <div className="acidBaseFormGrid">
                <label>
                  Tipo de estudo
                  <select
                    value={tipoEstudo}
                    onChange={(event) =>
                      setTipoEstudo(
                        event.target.value as TipoEstudoPrecipitacao
                      )
                    }
                  >
                    <option value="equilibrio">
                      Equilíbrio de solubilidade
                    </option>
                    <option value="titulacaoDireta">
                      Titulação direta por precipitação
                    </option>
                    <option value="titulacaoRetorno">
                      Titulação por retorno
                    </option>
                    <option value="seletividade">
                      Precipitação seletiva / mistura
                    </option>
                  </select>
                </label>

                <label>
                  Sal pouco solúvel / precipitado
                  <select
  value={salSelecionado.id}
  onChange={(event) => setSalId(event.target.value)}
>
  {saisDisponiveis.map((sal) => (
    <option key={sal.id} value={sal.id}>
      {sal.formulaExibicao} — {sal.nome}
    </option>
  ))}
</select>
                </label>
                <div className="resultCard">
  <span>Sais disponíveis para este estudo</span>
  <strong>{saisDisponiveis.length}</strong>
</div>
              </div>

              <div className="resultGrid">
                <div className="resultCard">
                  <span>Precipitado</span>
                  <strong>{salSelecionado.formulaExibicao}</strong>
                </div>

                <div className="resultCard">
                  <span>Nome</span>
                  <strong>{salSelecionado.nome}</strong>
                </div>

                <div className="resultCard">
                  <span>Cátion</span>
                  <strong>{salSelecionado.cation.formulaExibicao}</strong>
                </div>

                <div className="resultCard">
                  <span>Ânion</span>
                  <strong>{salSelecionado.anion.formulaExibicao}</strong>
                </div>

                <div className="resultCard">
                  <span>Estequiometria</span>
                  <strong>
                    {salSelecionado.coeficienteCation}:
                    {salSelecionado.coeficienteAnion}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>Kps</span>
                  <strong>{formatarCientificoBR(salSelecionado.kps)}</strong>
                </div>

                <div className="resultCard">
                  <span>pKps</span>
                  <strong>{formatarNumeroBR(salSelecionado.pKps, 2)}</strong>
                </div>

                <div className="resultCard">
                  <span>Cor</span>
                  <strong>{salSelecionado.corPrecipitado}</strong>
                </div>
              </div>

              {tipoEstudo === "titulacaoDireta" && (
                <>
                  <div className="explanationBox">
                    <h3>Dados da titulação direta</h3>

                    <p>
                      Informe qual espécie está na amostra. O titulante será a
                      espécie complementar necessária para formar o precipitado.
                    </p>
                  </div>

                  <div className="acidBaseFormGrid">
                    <label>
                      Espécie presente na amostra
                      <select
                        value={especieAnalito}
                        onChange={(event) =>
                          setEspecieAnalito(
                            event.target
                              .value as EspecieAnalitoPrecipitacao
                          )
                        }
                      >
                        <option value="anion">
                          Ânion — {salSelecionado.anion.formulaExibicao}
                        </option>

                        <option value="cation">
                          Cátion — {salSelecionado.cation.formulaExibicao}
                        </option>
                      </select>
                    </label>

                    <label>
                      Concentração do analito mol·L⁻¹
                      <input
                        value={concentracaoAnalito}
                        onChange={(event) =>
                          setConcentracaoAnalito(event.target.value)
                        }
                        placeholder="Ex.: 0,1000"
                      />
                    </label>

                    <label>
                      Volume da amostra mL
                      <input
                        value={volumeAmostra}
                        onChange={(event) =>
                          setVolumeAmostra(event.target.value)
                        }
                        placeholder="Ex.: 25,00"
                      />
                    </label>

                    <label>
                      Concentração do titulante mol·L⁻¹
                      <input
                        value={concentracaoTitulante}
                        onChange={(event) =>
                          setConcentracaoTitulante(event.target.value)
                        }
                        placeholder="Ex.: 0,1000"
                      />
                    </label>

                    <label>
                      Volume máximo da bureta mL
                      <input
                        value={volumeMaximoBureta}
                        onChange={(event) =>
                          setVolumeMaximoBureta(event.target.value)
                        }
                        placeholder="Ex.: 50,00"
                      />
                    </label>
                  </div>

                  <div className="explanationBox">
                    <h3>Leitura do sistema</h3>

                    <p>
                      Analito escolhido: <strong>{formulaAnalito}</strong>.
                      Titulante complementar:{" "}
                      <strong>{formulaTitulante}</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {abaAtiva === "equilibrio" && (
            <div className="resultsPanel curveMainPanel">
              <span className="eyebrow">Equilíbrio</span>

              <h2>Equilíbrio de solubilidade</h2>

              <p>
                Esta aba calcula a solubilidade molar considerando a
                estequiometria real do sal, compara PI × Kps e avalia o efeito
                do íon comum.
              </p>

              <div className="reactionDetailsStack">
                <div className="reactionWideCard">
                  <span>Dissolução</span>
                  <strong>
                    {salSelecionado.formulaExibicao}(s) ⇌{" "}
                    {salSelecionado.coeficienteCation > 1
                      ? salSelecionado.coeficienteCation
                      : ""}
                    {salSelecionado.cation.formulaExibicao}(aq) +{" "}
                    {salSelecionado.coeficienteAnion > 1
                      ? salSelecionado.coeficienteAnion
                      : ""}
                    {salSelecionado.anion.formulaExibicao}(aq)
                  </strong>
                </div>

                <div className="reactionWideCard">
                  <span>Expressão do Kps</span>
                  <strong>{equilibrio.expressaoKps}</strong>
                </div>

                <div className="reactionWideCard">
                  <span>Expressão em função de S</span>
                  <strong>{equilibrio.expressaoSolubilidade}</strong>
                </div>
              </div>

              <div className="resultGrid">
                <div className="resultCard">
                  <span>Solubilidade molar S</span>
                  <strong>
                    {formatarCientificoBR(equilibrio.solubilidadeMolar)}{" "}
                    mol·L⁻¹
                  </strong>
                </div>

                <div className="resultCard">
                  <span>
                    [{salSelecionado.cation.formulaExibicao}] no equilíbrio
                  </span>
                  <strong>
                    {formatarCientificoBR(
                      equilibrio.concentracaoCationEquilibrio
                    )}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>
                    [{salSelecionado.anion.formulaExibicao}] no equilíbrio
                  </span>
                  <strong>
                    {formatarCientificoBR(
                      equilibrio.concentracaoAnionEquilibrio
                    )}
                  </strong>
                </div>

                <div className="resultCard">
                  <span>p{salSelecionado.cation.formulaExibicao}</span>
                  <strong>{formatarNumeroBR(equilibrio.pCation, 2)}</strong>
                </div>

                <div className="resultCard">
                  <span>p{salSelecionado.anion.formulaExibicao}</span>
                  <strong>{formatarNumeroBR(equilibrio.pAnion, 2)}</strong>
                </div>

                <div className="resultCard">
                  <span>Kps</span>
                  <strong>{formatarCientificoBR(salSelecionado.kps)}</strong>
                </div>
              </div>

              <div className="explanationBox">
                <h3>Interpretação da solubilidade</h3>
                <p>{equilibrio.mensagem}</p>
              </div>

              <div className="resultsPanel">
                <span className="eyebrow">Produto iônico</span>

                <h2>Comparação PI × Kps</h2>

                <p>
                  O produto iônico usa as concentrações informadas para prever
                  se a solução está insaturada, saturada ou com tendência à
                  precipitação.
                </p>

                <div className="acidBaseFormGrid">
                <label>
                [{salSelecionado.cation.formulaExibicao}] mol·L⁻¹

  <div className="stepInputRow">
    <button
      type="button"
      className="secondaryButton stepInputButton"
      onClick={() =>
        setConcentracaoCationTeste((valorAtual) =>
          ajustarConcentracaoTexto(valorAtual, 0.1)
        )
      }
    >
      −
    </button>

    <input
      value={concentracaoCationTeste}
      onChange={(event) =>
        setConcentracaoCationTeste(event.target.value)
      }
      placeholder="Ex.: 1e-5"
    />

    <button
      type="button"
      className="secondaryButton stepInputButton"
      onClick={() =>
        setConcentracaoCationTeste((valorAtual) =>
          ajustarConcentracaoTexto(valorAtual, 10)
        )
      }
    >
      +
    </button>
  </div>
</label>

<label>
[{salSelecionado.anion.formulaExibicao}] mol·L⁻¹

  <div className="stepInputRow">
    <button
      type="button"
      className="secondaryButton stepInputButton"
      onClick={() =>
        setConcentracaoAnionTeste((valorAtual) =>
          ajustarConcentracaoTexto(valorAtual, 0.1)
        )
      }
    >
      −
    </button>

    <input
      value={concentracaoAnionTeste}
      onChange={(event) =>
        setConcentracaoAnionTeste(event.target.value)
      }
      placeholder="Ex.: 1e-5"
    />

    <button
      type="button"
      className="secondaryButton stepInputButton"
      onClick={() =>
        setConcentracaoAnionTeste((valorAtual) =>
          ajustarConcentracaoTexto(valorAtual, 10)
        )
      }
    >
      +
    </button>
  </div>
</label>
                </div>

                <div className="resultGrid">
                  <div className="resultCard">
                    <span>PI calculado</span>
                    <strong>
                      {Number.isFinite(produtoIonico)
                        ? formatarCientificoBR(produtoIonico)
                        : "-"}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Kps de referência</span>
                    <strong>{formatarCientificoBR(salSelecionado.kps)}</strong>
                  </div>

                  <div className="resultCard">
                    <span>PI/Kps</span>
                    <strong>
                      {Number.isFinite(razaoPIKps)
                        ? `${formatarNumeroBR(razaoPIKps, 2)}×`
                        : "-"}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Situação</span>
                    <strong>{classificacaoPI.status}</strong>
                  </div>
                </div>

                <div className="explanationBox">
                  <h3>Interpretação PI × Kps</h3>
                  <p>{classificacaoPI.interpretacao}</p>
                </div>

                <IndicadorGraficoPIKps
  razao={razaoPIKps}
  logRazao={logRazaoPIKps}
/>
              </div>

              <div className="resultsPanel">
                <span className="eyebrow">Íon comum</span>

                <h2>Efeito do íon comum</h2>

                <p>
                  A presença de um íon comum desloca o equilíbrio para o sólido
                  e reduz a solubilidade molar do precipitado.
                </p>

                <div className="acidBaseFormGrid">
                  <label>
                    [{salSelecionado.cation.formulaExibicao}] comum mol·L⁻¹
                    <input
                      value={concentracaoCationComum}
                      onChange={(event) =>
                        setConcentracaoCationComum(event.target.value)
                      }
                      placeholder="Ex.: 0,0100"
                    />
                  </label>

                  <label>
                    [{salSelecionado.anion.formulaExibicao}] comum mol·L⁻¹
                    <input
                      value={concentracaoAnionComum}
                      onChange={(event) =>
                        setConcentracaoAnionComum(event.target.value)
                      }
                      placeholder="Ex.: 0,0100"
                    />
                  </label>
                </div>

                <div className="resultGrid">
                  <div className="resultCard">
                    <span>S com cátion comum</span>
                    <strong>
                      {Number.isFinite(solubilidadeComCationComum)
                        ? `${formatarCientificoBR(
                            solubilidadeComCationComum
                          )} mol·L⁻¹`
                        : "-"}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>S com ânion comum</span>
                    <strong>
                      {Number.isFinite(solubilidadeComAnionComum)
                        ? `${formatarCientificoBR(
                            solubilidadeComAnionComum
                          )} mol·L⁻¹`
                        : "-"}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Redução com cátion comum</span>
                    <strong>
                      {Number.isFinite(solubilidadeComCationComum) &&
                      solubilidadeComCationComum > 0
                        ? `${formatarNumeroBR(
                            equilibrio.solubilidadeMolar /
                              solubilidadeComCationComum,
                            2
                          )}×`
                        : "-"}
                    </strong>
                  </div>

                  <div className="resultCard">
                    <span>Redução com ânion comum</span>
                    <strong>
                      {Number.isFinite(solubilidadeComAnionComum) &&
                      solubilidadeComAnionComum > 0
                        ? `${formatarNumeroBR(
                            equilibrio.solubilidadeMolar /
                              solubilidadeComAnionComum,
                            2
                          )}×`
                        : "-"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

{abaAtiva === "curva" && (
  <div className="resultsPanel curveMainPanel">
    <span className="eyebrow">Curva</span>

    <h2>Curva da titulação direta</h2>

    {tipoEstudo !== "titulacaoDireta" && (
      <div className="chartEmpty">
        A curva será exibida quando o tipo de estudo for titulação direta por
        precipitação.
      </div>
    )}

    {tipoEstudo === "titulacaoDireta" && !curvaTitulacaoDireta && (
      <div className="chartEmpty">
        Preencha os dados da titulação direta na aba Sistema para gerar a curva.
      </div>
    )}

    {tipoEstudo === "titulacaoDireta" && curvaTitulacaoDireta && (
      <>
        <p>
          A tabela mostra pontos calculados da titulação direta. A espécie
          monitorada é o titulante livre, que controla a variação da curva após
          o ponto de equivalência.
        </p>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Volume de equivalência</span>
            <strong>
              {formatarNumeroBR(curvaTitulacaoDireta.volumePE, 2)} mL
            </strong>
          </div>

          <div className="resultCard">
            <span>Volume máximo</span>
            <strong>
              {formatarNumeroBR(curvaTitulacaoDireta.volumeMaximo, 2)} mL
            </strong>
          </div>

          <div className="resultCard">
            <span>Passo da curva</span>
            <strong>{formatarNumeroBR(curvaTitulacaoDireta.passo, 2)} mL</strong>
          </div>

          <div className="resultCard">
            <span>Pontos calculados</span>
            <strong>{curvaTitulacaoDireta.pontos.length}</strong>
          </div>
        </div>

        <GraficoCurvaTitulacaoDireta
  curva={curvaTitulacaoDireta}
  especieMonitorada={formulaTitulante}
  pontoMarcado={pontoMarcadoGrafico}
/>

<div className="curveConsultBox acidBaseConsultBox">
  <div className="acidBaseConsultHeader">
    <span className="eyebrow">Consulta pontual</span>

    <h3>Consultar ponto da curva</h3>

    <p>
      Informe um volume adicionado para calcular a região da titulação,
      concentração das espécies livres e percentual precipitado.
    </p>
  </div>

  <div className="acidBaseConsultGrid">
  <label>
    Volume adicionado mL
    <input
      value={volumeConsultaCurva}
      onChange={(event) => setVolumeConsultaCurva(event.target.value)}
      placeholder="Ex.: 12,50"
    />
  </label>

  <button
  type="button"
  className="secondaryButton"
  disabled={!pontoConsultaCurva}
  onClick={() => setVolumeMarcadoGrafico(volumeConsultaCurva)}
>
  Destacar ponto
</button>

<button
  type="button"
  className="secondaryButton"
  disabled={!volumeMarcadoGrafico}
  onClick={() => setVolumeMarcadoGrafico("")}
>
  Limpar marcação
</button>
</div>
</div>

{pontoConsultaCurva && (
  <>
    <div className="resultGrid curvePointGrid">
      <div className="resultCard">
        <span>Volume consultado</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurva.volumeAdicionado, 2)} mL
        </strong>
      </div>

      <div className="resultCard">
        <span>Região</span>
        <strong>{pontoConsultaCurva.regiao}</strong>
      </div>

      <div className="resultCard">
        <span>p{formulaTitulante}</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurva.pEspecieMonitorada, 2)}
        </strong>
      </div>

      <div className="resultCard">
        <span>[analito livre]</span>
        <strong>
          {formatarCientificoBR(pontoConsultaCurva.concentracaoAnalitoLivre)}
        </strong>
      </div>

      <div className="resultCard">
        <span>[titulante livre]</span>
        <strong>
          {formatarCientificoBR(pontoConsultaCurva.concentracaoTitulanteLivre)}
        </strong>
      </div>

      <div className="resultCard">
        <span>% precipitado</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurva.percentualPrecipitado, 2)}%
        </strong>
      </div>
    </div>

    <div className="explanationBox">
      <h3>Interpretação do ponto</h3>

      <p>
        {pontoConsultaCurva.regiao === "Antes do PE"
          ? "Antes do ponto de equivalência, ainda há excesso de analito na solução. A espécie titulante livre é controlada pelo Kps."
          : pontoConsultaCurva.regiao === "No PE"
            ? "No ponto de equivalência, as concentrações livres das espécies vêm do equilíbrio de solubilidade do precipitado."
            : pontoConsultaCurva.regiao === "Após o PE"
              ? "Após o ponto de equivalência, há excesso de titulante livre em solução."
              : "Não foi possível interpretar este ponto com os dados informados."}
      </p>
    </div>
  </>
)}

<div className="resultsPanel curveTablePanel">
          <h3>Tabela da curva</h3>

          <div className="curveTableScroll">
            <table className="curve-table">
              <thead>
                <tr>
                  <th>Volume adicionado</th>
                  <th>p titulante</th>
                  <th>[analito livre]</th>
                  <th>[titulante livre]</th>
                  <th>% precipitado</th>
                  <th>Região</th>
                </tr>
              </thead>

              <tbody>
              {curvaTitulacaoDireta.pontos
  .slice(0, 140)
  .map((ponto: PontoCurvaTitulacaoDiretaPrecipitacao) => (
                  <tr key={ponto.volumeAdicionado}>
                    <td>
                      {formatarNumeroBR(ponto.volumeAdicionado, 2)} mL
                    </td>

                    <td>
                      <strong>
                        {formatarNumeroBR(ponto.pEspecieMonitorada, 2)}
                      </strong>
                    </td>

                    <td>
                      {formatarCientificoBR(ponto.concentracaoAnalitoLivre)}
                    </td>

                    <td>
                      {formatarCientificoBR(ponto.concentracaoTitulanteLivre)}
                    </td>

                    <td>
                      {formatarNumeroBR(ponto.percentualPrecipitado, 2)}%
                    </td>

                    <td>{ponto.regiao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <small>
            Exibindo até 140 pontos para manter a tela leve no navegador.
          </small>
        </div>
      </>
    )}
  </div>
)}

{abaAtiva === "metodo" && (
  <div className="resultsPanel">
    <span className="eyebrow">Método</span>

    <h2>Método de detecção do ponto final</h2>

    {tipoEstudo !== "titulacaoDireta" && (
      <div className="chartEmpty">
        A recomendação de método será detalhada primeiro para titulação direta.
        Depois entraremos com retorno, seletividade e outros casos.
      </div>
    )}

    {tipoEstudo === "titulacaoDireta" && (
      <>
        <p>
          A recomendação abaixo compara métodos clássicos de volumetria de
          precipitação conforme o precipitado selecionado e o tipo de sistema.
        </p>

        <div className="indicatorRankingList">
          {metodosPrecipitacao.map((metodo, index) => (
            <div className="indicatorRankingItem" key={metodo.id}>
              <div className="indicatorRankNumber">{index + 1}</div>

              <div className="indicatorRankMain">
                <strong>{metodo.nome}</strong>

                <p className="indicatorJustification">
                  {metodo.principio}
                </p>

                <p className="indicatorJustification">
                  {metodo.justificativa}
                </p>
              </div>

              <div className="indicatorRankScore">
                {metodo.status === "recomendado"
                  ? "OK"
                  : metodo.status === "possivel"
                    ? "Avaliar"
                    : "Evitar"}
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)}

{abaAtiva === "interferencias" && (
  <div className="resultsPanel">
    <span className="eyebrow">Interferências</span>

    <h2>Interferências e seletividade</h2>

    {tipoEstudo !== "titulacaoDireta" && (
      <div className="chartEmpty">
        A avaliação automática de interferentes será detalhada primeiro para
        titulação direta. Depois entraremos com seletividade e misturas.
      </div>
    )}

    {tipoEstudo === "titulacaoDireta" && (
      <>
        <p>
          Esta avaliação compara precipitados que compartilham a espécie
          titulante do sistema. Quanto menor o Kps do interferente, maior a
          chance de ele precipitar antes ou junto do analito principal.
        </p>

        {interferenciasPrecipitacao.length === 0 && (
          <div className="chartEmpty">
            Nenhum interferente da base atual compartilha diretamente a espécie
            titulante deste sistema.
          </div>
        )}

        {interferenciasPrecipitacao.length > 0 && (
          <div className="resultGrid">
            {interferenciasPrecipitacao.map((interferencia) => (
              <div
                className="resultCard"
                key={interferencia.salInterferente.id}
              >
                <span>
                  {interferencia.especieConcorrente.formulaExibicao} →{" "}
                  {interferencia.salInterferente.formulaExibicao}
                </span>

                <strong>
                  {interferencia.risco === "alto"
                    ? "Risco alto"
                    : interferencia.risco === "moderado"
                      ? "Risco moderado"
                      : "Risco baixo"}
                </strong>

                <small>
                  Kps ={" "}
                  {formatarCientificoBR(interferencia.salInterferente.kps)}
                </small>

                <small>
                  Kps interferente / Kps principal ={" "}
                  {formatarNumeroBR(interferencia.razaoKps, 2)}×
                </small>
              </div>
            ))}
          </div>
        )}

        {interferenciasPrecipitacao.length > 0 && (
          <div className="explanationBox">
            <h3>Como interpretar</h3>

            <p>
              Se um interferente forma precipitado com a mesma espécie titulante
              e possui Kps menor ou próximo ao do precipitado principal, ele pode
              consumir titulante e deslocar o ponto final. Isso é especialmente
              importante em misturas de haletos com Ag⁺, como I⁻, Br⁻ e Cl⁻.
            </p>
          </div>
        )}

        {interferenciasPrecipitacao.length > 0 && (
          <div className="indicatorRankingList">
            {interferenciasPrecipitacao.map((interferencia, index) => (
              <div
                className="indicatorRankingItem"
                key={`${interferencia.salInterferente.id}-detalhe`}
              >
                <div className="indicatorRankNumber">{index + 1}</div>

                <div className="indicatorRankMain">
                  <strong>
                    {interferencia.salInterferente.nome} (
                    {interferencia.salInterferente.formulaExibicao})
                  </strong>

                  <p className="indicatorJustification">
                    Espécie concorrente:{" "}
                    {interferencia.especieConcorrente.formulaExibicao}
                  </p>

                  <p className="indicatorJustification">
                    {interferencia.motivo}
                  </p>
                </div>

                <div className="indicatorRankScore">
                  {interferencia.risco === "alto"
                    ? "Alto"
                    : interferencia.risco === "moderado"
                      ? "Médio"
                      : "Baixo"}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)}

{abaAtiva === "resultados" && (
  <div className="resultsPanel">
    <span className="eyebrow">Resumo</span>

    <h2>Resumo interpretativo do sistema</h2>

    <p>
      Esta aba reúne os principais resultados do sistema selecionado, incluindo
      equilíbrio de solubilidade, dados de titulação direta, método recomendado e
      possíveis interferências.
    </p>

    <div className="resultGrid">
      <div className="resultCard">
        <span>Tipo de estudo</span>
        <strong>{nomeTipoEstudo}</strong>
      </div>

      <div className="resultCard">
        <span>Precipitado</span>
        <strong>{salSelecionado.formulaExibicao}</strong>
      </div>

      <div className="resultCard">
        <span>Cátion</span>
        <strong>{salSelecionado.cation.formulaExibicao}</strong>
      </div>

      <div className="resultCard">
        <span>Ânion</span>
        <strong>{salSelecionado.anion.formulaExibicao}</strong>
      </div>

      <div className="resultCard">
        <span>Estequiometria</span>
        <strong>
          {salSelecionado.coeficienteCation}:{salSelecionado.coeficienteAnion}
        </strong>
      </div>

      <div className="resultCard">
        <span>Kps</span>
        <strong>{formatarCientificoBR(salSelecionado.kps)}</strong>
      </div>

      <div className="resultCard">
        <span>pKps</span>
        <strong>{formatarNumeroBR(salSelecionado.pKps, 2)}</strong>
      </div>

      <div className="resultCard">
        <span>Solubilidade molar</span>
        <strong>
          {formatarCientificoBR(equilibrio.solubilidadeMolar)} mol·L⁻¹
        </strong>
      </div>
    </div>

    <div className="explanationBox">
      <h3>Leitura do equilíbrio</h3>

      <p>{equilibrio.mensagem}</p>

      <p>
        A dissolução considerada é{" "}
        <strong>
          {salSelecionado.formulaExibicao}(s) ⇌{" "}
          {salSelecionado.coeficienteCation > 1
            ? salSelecionado.coeficienteCation
            : ""}
          {salSelecionado.cation.formulaExibicao}(aq) +{" "}
          {salSelecionado.coeficienteAnion > 1
            ? salSelecionado.coeficienteAnion
            : ""}
          {salSelecionado.anion.formulaExibicao}(aq)
        </strong>
        .
      </p>
    </div>

    {resultadoTitulacaoDireta && (
      <>
        <div className="explanationBox">
          <h3>Resultado da titulação direta</h3>
          <p>{resultadoTitulacaoDireta.mensagem}</p>
        </div>

        <div className="resultGrid">
          <div className="resultCard">
            <span>Espécie na amostra</span>
            <strong>{formulaAnalito}</strong>
          </div>

          <div className="resultCard">
            <span>Espécie titulante</span>
            <strong>{formulaTitulante}</strong>
          </div>

          <div className="resultCard">
            <span>Relação estequiométrica</span>
            <strong>{resultadoTitulacaoDireta.relacaoEstequiometrica}</strong>
          </div>

          <div className="resultCard">
            <span>Mol de analito</span>
            <strong>
              {formatarCientificoBR(resultadoTitulacaoDireta.molAnalito)}
            </strong>
          </div>

          <div className="resultCard">
            <span>Mol de titulante no PE</span>
            <strong>
              {formatarCientificoBR(resultadoTitulacaoDireta.molTitulantePE)}
            </strong>
          </div>

          <div className="resultCard">
            <span>Volume de equivalência</span>
            <strong>
              {formatarNumeroBR(resultadoTitulacaoDireta.volumePE, 2)} mL
            </strong>
          </div>

          <div className="resultCard">
            <span>Status da bureta</span>
            <strong>
              {resultadoTitulacaoDireta.status === "adequado"
                ? "Adequado"
                : resultadoTitulacaoDireta.status === "fora_da_bureta"
                  ? "Fora da bureta"
                  : "Dados inválidos"}
            </strong>
          </div>

          <div className="resultCard">
            <span>Pontos da curva</span>
            <strong>
              {curvaTitulacaoDireta ? curvaTitulacaoDireta.pontos.length : "-"}
            </strong>
          </div>
        </div>

        <div className="explanationBox">
          <h3>Leitura da curva</h3>

          <p>
            Antes do ponto de equivalência, predomina excesso da espécie presente
            na amostra. Após o ponto de equivalência, predomina excesso da
            espécie titulante. No ponto de equivalência, as concentrações livres
            são controladas pelo equilíbrio de solubilidade do precipitado.
          </p>
        </div>

        <div className="resultsPanel">
          <span className="eyebrow">Método mais indicado</span>

          <h2>Recomendação resumida</h2>

          {metodosPrecipitacao.length > 0 ? (
            <div className="indicatorRankingList">
              <div className="indicatorRankingItem">
                <div className="indicatorRankNumber">1</div>

                <div className="indicatorRankMain">
                  <strong>{metodosPrecipitacao[0].nome}</strong>

                  <p className="indicatorJustification">
                    {metodosPrecipitacao[0].justificativa}
                  </p>
                </div>

                <div className="indicatorRankScore">
                  {metodosPrecipitacao[0].status === "recomendado"
                    ? "OK"
                    : metodosPrecipitacao[0].status === "possivel"
                      ? "Avaliar"
                      : "Evitar"}
                </div>
              </div>
            </div>
          ) : (
            <div className="chartEmpty">
              Ainda não há método recomendado para os dados informados.
            </div>
          )}
        </div>

        <div className="resultsPanel">
          <span className="eyebrow">Interferências</span>

          <h2>Resumo de interferentes</h2>

          {interferenciasPrecipitacao.length > 0 ? (
            <div className="resultGrid">
              <div className="resultCard">
                <span>Total de interferentes avaliados</span>
                <strong>{interferenciasPrecipitacao.length}</strong>
              </div>

              <div className="resultCard">
                <span>Maior risco encontrado</span>
                <strong>
                  {interferenciasPrecipitacao.some(
                    (interferencia) => interferencia.risco === "alto"
                  )
                    ? "Alto"
                    : interferenciasPrecipitacao.some(
                          (interferencia) =>
                            interferencia.risco === "moderado"
                        )
                      ? "Moderado"
                      : "Baixo"}
                </strong>
              </div>

              <div className="resultCard">
                <span>Interferente mais crítico</span>
                <strong>
                  {
                    interferenciasPrecipitacao[0].especieConcorrente
                      .formulaExibicao
                  }
                </strong>
              </div>

              <div className="resultCard">
                <span>Precipitado interferente</span>
                <strong>
                  {interferenciasPrecipitacao[0].salInterferente.formulaExibicao}
                </strong>
              </div>
            </div>
          ) : (
            <div className="chartEmpty">
              Nenhum interferente direto foi encontrado na base atual para este
              sistema.
            </div>
          )}
        </div>
      </>
    )}

    {tipoEstudo !== "titulacaoDireta" && (
      <div className="explanationBox">
        <h3>Próxima expansão</h3>

        <p>
          Para este tipo de estudo, os cálculos específicos ainda serão
          implementados. A base de equilíbrio já está pronta para receber
          titulação por retorno e precipitação seletiva.
        </p>
      </div>
    )}
  </div>
)}
        </div>
      </section>
    </main>
  );
}

function GraficoCurvaTitulacaoDireta({
  curva,
  especieMonitorada,
  pontoMarcado,
}: {
  curva: CurvaTitulacaoDiretaPrecipitacao;
  especieMonitorada: string;
  pontoMarcado?: PontoCurvaTitulacaoDiretaPrecipitacao | null;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
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

  const pontosValidos = curva.pontos.filter(
    (ponto) =>
      Number.isFinite(ponto.volumeAdicionado) &&
      Number.isFinite(ponto.pEspecieMonitorada)
  );

  if (pontosValidos.length === 0) {
    return (
      <div className="chartEmpty">
        Não há pontos válidos para desenhar a curva.
      </div>
    );
  }

  const volumeMaximo = curva.volumeMaximo || 1;

  const valoresY = pontosValidos.map((ponto) => ponto.pEspecieMonitorada);

  const yBrutoMin = Math.min(...valoresY);
  const yBrutoMax = Math.max(...valoresY);

  const amplitudeY = Math.max(yBrutoMax - yBrutoMin, 1);

  const yMin = Math.max(0, yBrutoMin - amplitudeY * 0.08);
  const yMax = yBrutoMax + amplitudeY * 0.08;

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(valor: number) {
    return margem.top + ((yMax - valor) / (yMax - yMin)) * alturaGrafico;
  }

  const pathCurva = pontosValidos
    .map((ponto, index) => {
      const x = xScale(ponto.volumeAdicionado);
      const y = yScale(ponto.pEspecieMonitorada);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  const linhasY = Array.from({ length: 6 }, (_, index) => {
    return yMin + ((yMax - yMin) / 5) * index;
  });

  const pontoPE = pontosValidos.reduce((melhor, atual) =>
    Math.abs(atual.volumeAdicionado - curva.volumePE) <
    Math.abs(melhor.volumeAdicionado - curva.volumePE)
      ? atual
      : melhor
  );

  return (
    <div className="chartBox acidBaseChartBox">
      <div className="chartHeader">
  <div>
    <strong>Curva p{especieMonitorada} × volume</strong>
    <span>
      Titulação direta por precipitação com ponto de equivalência marcado
    </span>
  </div>

  <div className="chartActions">
    <button
      type="button"
      className="secondaryButton"
      onClick={() =>
        baixarGraficoPng(
          svgRef.current,
          `curva-precipitacao-${especieMonitorada}`
        )
      }
    >
      Baixar PNG
    </button>
  </div>
</div>

<svg
  ref={svgRef}
  className="acidBaseCurveSvg precipitationCurveSvg"
  viewBox={`0 0 ${largura} ${altura}`}
  role="img"
  aria-label="Curva de titulação direta por precipitação"
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
              {formatarNumeroBR(valor, 1)}
            </text>
          </g>
        ))}

        {linhasVolume.map((volume) => (
          <g key={`linha-volume-${volume}`}>
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

        <line
          x1={xScale(curva.volumePE)}
          x2={xScale(curva.volumePE)}
          y1={margem.top}
          y2={margem.top + alturaGrafico}
          stroke="#111111"
          strokeWidth="2"
          strokeDasharray="8 6"
        />

        <path
          d={pathCurva}
          fill="none"
          stroke="#a80000"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {Number.isFinite(pontoPE.pEspecieMonitorada) && (
          <g>
            <circle
              cx={xScale(pontoPE.volumeAdicionado)}
              cy={yScale(pontoPE.pEspecieMonitorada)}
              r="9"
              fill="#111111"
              stroke="#ffffff"
              strokeWidth="4"
            />

            <text
              x={xScale(pontoPE.volumeAdicionado) + 18}
              y={yScale(pontoPE.pEspecieMonitorada) - 18}
              fill="#111111"
              fontSize="16"
              fontWeight="900"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              PE
            </text>
          </g>
        )}

{pontoMarcado &&
  Number.isFinite(pontoMarcado.pEspecieMonitorada) &&
  pontoMarcado.volumeAdicionado >= 0 &&
  pontoMarcado.volumeAdicionado <= curva.volumeMaximo && (
    <g>
      <line
        x1={xScale(pontoMarcado.volumeAdicionado)}
        x2={xScale(pontoMarcado.volumeAdicionado)}
        y1={yScale(pontoMarcado.pEspecieMonitorada)}
        y2={margem.top + alturaGrafico}
        stroke="#2563eb"
        strokeWidth="2"
        strokeDasharray="5 5"
      />

      <line
        x1={margem.left}
        x2={xScale(pontoMarcado.volumeAdicionado)}
        y1={yScale(pontoMarcado.pEspecieMonitorada)}
        y2={yScale(pontoMarcado.pEspecieMonitorada)}
        stroke="#2563eb"
        strokeWidth="2"
        strokeDasharray="5 5"
      />

      <circle
        cx={xScale(pontoMarcado.volumeAdicionado)}
        cy={yScale(pontoMarcado.pEspecieMonitorada)}
        r="8"
        fill="#2563eb"
        stroke="#ffffff"
        strokeWidth="4"
      />

      <circle
        cx={xScale(pontoMarcado.volumeAdicionado)}
        cy={yScale(pontoMarcado.pEspecieMonitorada)}
        r="14"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        opacity="0.45"
      />

      <rect
        x={largura - margem.right - 190}
        y={margem.top + 12}
        width="170"
        height="74"
        rx="12"
        fill="#ffffff"
        stroke="#2563eb"
        strokeWidth="1.5"
      />

      <text
        x={largura - margem.right - 175}
        y={margem.top + 34}
        fill="#1d4ed8"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Ponto destacado
      </text>

      <text
        x={largura - margem.right - 175}
        y={margem.top + 56}
        fill="#344054"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        V = {formatarNumeroBR(pontoMarcado.volumeAdicionado, 2)} mL
      </text>

      <text
        x={largura - margem.right - 175}
        y={margem.top + 74}
        fill="#344054"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        p{especieMonitorada} = {formatarNumeroBR(pontoMarcado.pEspecieMonitorada, 2)}
      </text>
    </g>
  )}

        <text
          x={margem.left + larguraGrafico / 2}
          y={altura - 14}
          fill="#344054"
          fontSize="17"
          fontWeight="800"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          Volume adicionado mL
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
          p{especieMonitorada}
        </text>
      </svg>
    </div>
  );
}

function baixarGraficoPng(svg: SVGSVGElement | null, nomeArquivo: string) {
  if (!svg) return;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const svgBlob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(svgBlob);

  const image = new Image();

  image.onload = () => {
    const viewBox = svg.viewBox.baseVal;

    const canvas = document.createElement("canvas");
    canvas.width = viewBox.width || 1200;
    canvas.height = viewBox.height || 700;

    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(url);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${nomeArquivo}.png`;
    link.click();

    URL.revokeObjectURL(url);
  };

  image.src = url;
}

function IndicadorGraficoPIKps({
  razao,
  logRazao,
}: {
  razao: number;
  logRazao: number;
}) {
  if (!Number.isFinite(razao) || razao <= 0 || !Number.isFinite(logRazao)) {
    return (
      <div className="resultsPanel">
        <span className="eyebrow">Visualização gráfica</span>
        <h2>Efeito de PI em relação ao Kps</h2>
        <div className="chartEmpty">
          Informe concentrações válidas para visualizar graficamente a relação PI/Kps.
        </div>
      </div>
    );
  }

  // janela visual de -6 a +6 ordens de grandeza
  const limiteMin = -6;
  const limiteMax = 6;
  
  const valorLimitado = Math.max(limiteMin, Math.min(limiteMax, logRazao));
  
  const posicaoPercentual =
    ((valorLimitado - limiteMin) / (limiteMax - limiteMin)) * 100;
  
  const inicioFaixaEquilibrio = 49;
  const fimFaixaEquilibrio = 51;

const classeEstado =
  logRazao < -0.01
    ? "insaturada"
    : logRazao > 0.01
      ? "precipitacao"
      : "equilibrio";

const leituraVisual =
  logRazao < -0.01
    ? "Solução insaturada"
    : logRazao > 0.01
      ? "Precipitação provável"
      : "Próximo do equilíbrio";

return (
    <div className="resultsPanel">
      <span className="eyebrow">Visualização gráfica</span>
      <h2>Efeito de PI em relação ao Kps</h2>
      <p>
        O marcador mostra a posição de <strong>PI/Kps</strong> em escala logarítmica.
        O centro representa <strong>PI = Kps</strong>.
      </p>

      <div className="piKpsGraphicBox">
      <div className="piKpsTrack">
  <div className="piKpsTrackBackground" />

  <div
    className="piKpsEquilibriumBand"
    style={{
      left: `${inicioFaixaEquilibrio}%`,
      width: `${fimFaixaEquilibrio - inicioFaixaEquilibrio}%`,
    }}
  />

  <div className="piKpsZoneLabel piKpsZoneLabelLeft">
    <strong>Insaturada</strong>
    <small>PI &lt; Kps</small>
  </div>

  <div className="piKpsZoneLabel piKpsZoneLabelCenter">
    <strong>Saturada</strong>
    <small>PI ≈ Kps</small>
  </div>

  <div className="piKpsZoneLabel piKpsZoneLabelRight">
    <strong>Precipitação</strong>
    <small>PI &gt; Kps</small>
  </div>

  <div
  className="piKpsMarker"
  style={{ left: `${posicaoPercentual}%` }}
>
  <div className={`piKpsMarkerBadge ${classeEstado}`}>
    {leituraVisual}
  </div>
  <div className={`piKpsMarkerTriangle ${classeEstado}`} />
</div>
  </div>

  <div className="piKpsAxisLabels">
          <span>10⁻⁶</span>
          <span>10⁻³</span>
          <span>1</span>
          <span>10³</span>
          <span>10⁶</span>
        </div>

        <div className="resultGrid piKpsResumoGrid">
  <div className={`resultCard estado-${classeEstado}`}>
    <span>PI/Kps</span>
    <strong>{formatarNumeroBR(razao, 2)}×</strong>
  </div>

  <div className={`resultCard estado-${classeEstado}`}>
    <span>log₁₀(PI/Kps)</span>
    <strong>{formatarNumeroBR(logRazao, 2)}</strong>
  </div>

  <div className={`resultCard estado-${classeEstado}`}>
    <span>Leitura visual</span>
    <strong>{leituraVisual}</strong>
  </div>
</div>
      </div>
    </div>
  );
}