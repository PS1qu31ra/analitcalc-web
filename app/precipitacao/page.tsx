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
import { calcularTitulacaoRetornoPrecipitacao } from "../../lib/precipitacao/calculosTitulacaoRetorno";
import { avaliarMetodosPrecipitacao } from "../../lib/precipitacao/metodos";
import { avaliarInterferenciasPrecipitacao } from "../../lib/precipitacao/interferencias";

import {
  calcularPontoCurvaTitulacaoDireta,
  gerarCurvaTitulacaoDireta,
} from "../../lib/precipitacao/calculosCurvaTitulacaoDireta";

import { gerarCurvaTitulacaoRetorno } from "../../lib/precipitacao/calculosCurvaTitulacaoRetorno";

import {
  gerarCurvaSeletividadePrecipitacao,
} from "../../lib/precipitacao/calculosCurvaSeletividade";

import { calcularSeletividadePrecipitacao } from "../../lib/precipitacao/calculosSeletividade";

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

const saisTitulacaoDiretaPermitidos = new Set<string>([
  "AgCl",
  "AgBr",
  "AgI",
  "AgSCN",
  "Ag2CrO4",
]);

const saisTitulacaoRetornoPermitidos = new Set<string>([
  "AgCl",
  "AgBr",
  "AgI",
  "AgSCN",
]);

type ModoSeletividade = "classico" | "personalizado";

type ItemSeletividadePersonalizada = {
  salId: string;
  concentracao: string;
};

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

  const [
    concentracaoPrecipitanteExcesso,
    setConcentracaoPrecipitanteExcesso,
  ] = useState("");
  
  const [volumePrecipitanteExcesso, setVolumePrecipitanteExcesso] =
    useState("");
  
  const [concentracaoTitulanteRetorno, setConcentracaoTitulanteRetorno] =
    useState("");
  
  const [volumeTitulanteRetorno, setVolumeTitulanteRetorno] = useState("");
  
  const [volumeMaximoBuretaRetorno, setVolumeMaximoBuretaRetorno] =
    useState("");

    const [concentracaoClSeletividade, setConcentracaoClSeletividade] =
  useState("0,0100");

const [concentracaoBrSeletividade, setConcentracaoBrSeletividade] =
  useState("0,0100");

const [concentracaoISeletividade, setConcentracaoISeletividade] =
  useState("0,0100");
  
  const [volumeConsultaCurva, setVolumeConsultaCurva] = useState("");
const [volumeMarcadoGrafico, setVolumeMarcadoGrafico] = useState("");

const [volumeConsultaCurvaRetorno, setVolumeConsultaCurvaRetorno] =
  useState("");

const [volumeMarcadoGraficoRetorno, setVolumeMarcadoGraficoRetorno] =
  useState("");

  const [volumeAmostraSeletividade, setVolumeAmostraSeletividade] =
  useState("25,00");

const [concentracaoTitulanteSeletividade, setConcentracaoTitulanteSeletividade] =
  useState("0,1000");

  const [modoSeletividade, setModoSeletividade] =
  useState<ModoSeletividade>("classico");

const [especieTitulanteSeletividade, setEspecieTitulanteSeletividade] =
  useState<"cation" | "anion">("cation");

const [salReferenciaSeletividadeId, setSalReferenciaSeletividadeId] =
  useState("AgCl");

const [itensSeletividadePersonalizada, setItensSeletividadePersonalizada] =
  useState<ItemSeletividadePersonalizada[]>([
    { salId: "AgCl", concentracao: "0,0100" },
    { salId: "AgBr", concentracao: "0,0100" },
    { salId: "AgI", concentracao: "0,0100" },
  ]);

  const saisDisponiveis = saisPrecipitacao.filter((sal) => {
    if (tipoEstudo === "equilibrio") {
      return sal.usos.includes("equilibrio");
    }
  
    if (tipoEstudo === "titulacaoDireta") {
      return saisTitulacaoDiretaPermitidos.has(sal.id);
    }
  
    if (tipoEstudo === "titulacaoRetorno") {
      return saisTitulacaoRetornoPermitidos.has(sal.id);
    }
  
    if (tipoEstudo === "seletividade") {
      return sal.usos.includes("equilibrio") || sal.usos.includes("seletividade");
    }
  
    return false;
  });

const salSelecionado =
  saisDisponiveis.find((sal) => sal.id === salId) ??
  saisDisponiveis[0] ??
  saisPrecipitacao[0];

  const salReferenciaSeletividade =
  saisPrecipitacao.find((sal) => sal.id === salReferenciaSeletividadeId) ??
  saisPrecipitacao[0];

const saisCompativeisSeletividade = useMemo(() => {
  return saisPrecipitacao.filter((sal) => {
    if (especieTitulanteSeletividade === "cation") {
      return (
        sal.cation.formulaExibicao ===
        salReferenciaSeletividade.cation.formulaExibicao
      );
    }

    return (
      sal.anion.formulaExibicao ===
      salReferenciaSeletividade.anion.formulaExibicao
    );
  });
}, [especieTitulanteSeletividade, salReferenciaSeletividade]);

const especieAnalitoSeletividade =
  especieTitulanteSeletividade === "cation" ? "anion" : "cation";

const formulaTitulanteSeletividade =
  especieTitulanteSeletividade === "cation"
    ? salReferenciaSeletividade.cation.formulaExibicao
    : salReferenciaSeletividade.anion.formulaExibicao;

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

  useEffect(() => {
    setItensSeletividadePersonalizada((itens) =>
      itens.map((item) => {
        const itemValido = saisCompativeisSeletividade.some(
          (sal) => sal.id === item.salId
        );
  
        if (itemValido) return item;
  
        return {
          ...item,
          salId: saisCompativeisSeletividade[0]?.id ?? salReferenciaSeletividade.id,
        };
      })
    );
  }, [saisCompativeisSeletividade, salReferenciaSeletividade.id]);

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

  function atualizarItemSeletividade(
    index: number,
    campo: "salId" | "concentracao",
    valor: string
  ) {
    setItensSeletividadePersonalizada((itens) =>
      itens.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [campo]: valor } : item
      )
    );
  }
  
  function adicionarItemSeletividade() {
    if (itensSeletividadePersonalizada.length >= 3) return;
  
    setItensSeletividadePersonalizada((itens) => [
      ...itens,
      {
        salId: saisCompativeisSeletividade[0]?.id ?? salReferenciaSeletividade.id,
        concentracao: "0,0100",
      },
    ]);
  }
  
  function removerItemSeletividade(index: number) {
    if (itensSeletividadePersonalizada.length <= 1) return;
  
    setItensSeletividadePersonalizada((itens) =>
      itens.filter((_, itemIndex) => itemIndex !== index)
    );
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

    const resultadoTitulacaoRetorno =
  tipoEstudo === "titulacaoRetorno"
    ? calcularTitulacaoRetornoPrecipitacao({
        salPrincipal: salSelecionado,
        especieAnalito,
        volumeAmostra: converterNumero(volumeAmostra),
        concentracaoPrecipitanteExcesso: converterNumero(
          concentracaoPrecipitanteExcesso
        ),
        volumePrecipitanteExcesso: converterNumero(
          volumePrecipitanteExcesso
        ),
        concentracaoTitulanteRetorno: converterNumero(
          concentracaoTitulanteRetorno
        ),
        volumeTitulanteRetorno: converterNumero(volumeTitulanteRetorno),
        volumeMaximoBuretaRetorno: converterNumero(
          volumeMaximoBuretaRetorno
        ),
      })
    : null;

    const salAgCl =
    saisPrecipitacao.find((sal) => sal.id === "AgCl") ?? saisPrecipitacao[0];
  
  const salAgBr =
    saisPrecipitacao.find((sal) => sal.id === "AgBr") ?? saisPrecipitacao[0];
  
  const salAgI =
    saisPrecipitacao.find((sal) => sal.id === "AgI") ?? saisPrecipitacao[0];
  
  const itensSeletividadeCalculados =
    modoSeletividade === "classico"
      ? [
          {
            sal: salAgCl,
            especieAnalito: "anion" as const,
            concentracaoAnalito: converterNumero(concentracaoClSeletividade),
          },
          {
            sal: salAgBr,
            especieAnalito: "anion" as const,
            concentracaoAnalito: converterNumero(concentracaoBrSeletividade),
          },
          {
            sal: salAgI,
            especieAnalito: "anion" as const,
            concentracaoAnalito: converterNumero(concentracaoISeletividade),
          },
        ]
      : itensSeletividadePersonalizada
          .map((item) => {
            const sal = saisCompativeisSeletividade.find(
              (salItem) => salItem.id === item.salId
            );
  
            if (!sal) return null;
  
            return {
              sal,
              especieAnalito: especieAnalitoSeletividade as "anion" | "cation",
              concentracaoAnalito: converterNumero(item.concentracao),
            };
          })
          .filter(
            (
              item
            ): item is {
              sal: (typeof saisPrecipitacao)[number];
              especieAnalito: "anion" | "cation";
              concentracaoAnalito: number;
            } => item !== null
          );
  
  const resultadoSeletividade =
    tipoEstudo === "seletividade" && itensSeletividadeCalculados.length > 0
      ? calcularSeletividadePrecipitacao({
          especieTitulante:
            modoSeletividade === "classico"
              ? "cation"
              : especieTitulanteSeletividade,
          itens: itensSeletividadeCalculados,
        })
      : null;

      const curvaSeletividade =
  resultadoSeletividade &&
  resultadoSeletividade.status !== "dados_invalidos" &&
  resultadoSeletividade.status !== "mistura_insuficiente"
    ? gerarCurvaSeletividadePrecipitacao({
        resultado: resultadoSeletividade,
        volumeAmostra: converterNumero(volumeAmostraSeletividade),
        concentracaoTitulante: converterNumero(
          concentracaoTitulanteSeletividade
        ),
        passo: 0.1,
      })
    : null;

    const volumesEquivalenciaIsoladosSeletividade =
  curvaSeletividade?.seriesIsoladas.map((serie) => serie.volumeEquivalencia) ??
  [];

const curvasIsoladasComMesmoVolumeEquivalencia =
  volumesEquivalenciaIsoladosSeletividade.length > 1 &&
  Math.max(...volumesEquivalenciaIsoladosSeletividade) -
    Math.min(...volumesEquivalenciaIsoladosSeletividade) <
    1e-6;

const curvaTitulacaoDireta =
  resultadoTitulacaoDireta && resultadoTitulacaoDireta.status !== "dados_invalidos"
    ? gerarCurvaTitulacaoDireta({
        resultado: resultadoTitulacaoDireta,
        passo: 0.25,
      })
    : null;

    const curvaTitulacaoRetorno =
  resultadoTitulacaoRetorno &&
  resultadoTitulacaoRetorno.status !== "dados_invalidos" &&
  resultadoTitulacaoRetorno.status !== "excesso_insuficiente"
    ? gerarCurvaTitulacaoRetorno({
        resultado: resultadoTitulacaoRetorno,
        passo: 0.25,
      })
    : null;

    const pontoConsultaCurvaRetorno =
  curvaTitulacaoRetorno &&
  curvaTitulacaoRetorno.pontos.length > 0 &&
  Number.isFinite(converterNumero(volumeConsultaCurvaRetorno)) &&
  converterNumero(volumeConsultaCurvaRetorno) >= 0
    ? curvaTitulacaoRetorno.pontos.reduce((melhor, atual) =>
        Math.abs(
          atual.volumeAdicionado - converterNumero(volumeConsultaCurvaRetorno)
        ) <
        Math.abs(
          melhor.volumeAdicionado - converterNumero(volumeConsultaCurvaRetorno)
        )
          ? atual
          : melhor
      )
    : null;

    const pontoMarcadoGraficoRetorno =
    curvaTitulacaoRetorno &&
    curvaTitulacaoRetorno.pontos.length > 0 &&
    Number.isFinite(converterNumero(volumeMarcadoGraficoRetorno)) &&
    converterNumero(volumeMarcadoGraficoRetorno) >= 0
    ? curvaTitulacaoRetorno.pontos.reduce((melhor, atual) =>
        Math.abs(
          atual.volumeAdicionado - converterNumero(volumeMarcadoGraficoRetorno)
        ) <
        Math.abs(
          melhor.volumeAdicionado - converterNumero(volumeMarcadoGraficoRetorno)
        )
          ? atual
          : melhor
      )
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
                Escolha o tipo de estudo e o sal pouco solúvel. No equilíbrio,
                a base de Kps é mais ampla. Nas opções volumétricas, o sistema
                mostra apenas sais compatíveis com o método selecionado.
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
                  <small>
                    {tipoEstudo === "equilibrio"
                      ? "Base ampla para estudo de Kps e solubilidade."
                      : tipoEstudo === "titulacaoDireta"
                        ? "Restrito a sistemas adequados para titulação direta."
                        : tipoEstudo === "titulacaoRetorno"
                          ? "Restrito a sistemas adequados para excesso e retorno."
                          : "Base usada para comparar precipitação concorrente."}
                  </small>
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
                            event.target.value as EspecieAnalitoPrecipitacao
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

              {tipoEstudo === "titulacaoRetorno" && (
                <>
                  <div className="explanationBox">
                    <h3>Dados da titulação por retorno</h3>
                    <p>
                      Informe a espécie presente na amostra, o excesso de
                      precipitante adicionado e o volume gasto para titular o
                      excesso restante.
                    </p>
                  </div>

                  <div className="acidBaseFormGrid">
                    <label>
                      Espécie presente na amostra
                      <select
                        value={especieAnalito}
                        onChange={(event) =>
                          setEspecieAnalito(
                            event.target.value as EspecieAnalitoPrecipitacao
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
                      Concentração do precipitante em excesso mol·L⁻¹
                      <input
                        value={concentracaoPrecipitanteExcesso}
                        onChange={(event) =>
                          setConcentracaoPrecipitanteExcesso(
                            event.target.value
                          )
                        }
                        placeholder="Ex.: 0,1000"
                      />
                    </label>

                    <label>
                      Volume do precipitante em excesso mL
                      <input
                        value={volumePrecipitanteExcesso}
                        onChange={(event) =>
                          setVolumePrecipitanteExcesso(event.target.value)
                        }
                        placeholder="Ex.: 50,00"
                      />
                    </label>

                    <label>
                      Concentração do titulante de retorno mol·L⁻¹
                      <input
                        value={concentracaoTitulanteRetorno}
                        onChange={(event) =>
                          setConcentracaoTitulanteRetorno(event.target.value)
                        }
                        placeholder="Ex.: 0,1000"
                      />
                    </label>

                    <label>
                      Volume gasto no retorno mL
                      <input
                        value={volumeTitulanteRetorno}
                        onChange={(event) =>
                          setVolumeTitulanteRetorno(event.target.value)
                        }
                        placeholder="Ex.: 20,00"
                      />
                    </label>

                    <label>
                      Volume máximo da bureta de retorno mL
                      <input
                        value={volumeMaximoBuretaRetorno}
                        onChange={(event) =>
                          setVolumeMaximoBuretaRetorno(event.target.value)
                        }
                        placeholder="Ex.: 50,00"
                      />
                    </label>
                  </div>

                  <div className="explanationBox">
                    <h3>Leitura do sistema</h3>
                    <p>
                      Analito escolhido: <strong>{formulaAnalito}</strong>. O
                      precipitante em excesso será a espécie complementar:{" "}
                      <strong>{formulaTitulante}</strong>.
                    </p>
                  </div>
                </>
              )}

{tipoEstudo === "seletividade" && (
  <>
    <div className="explanationBox">
      <h3>Dados da precipitação seletiva</h3>
      <p>
        Você pode usar o modo clássico com haletos e Ag⁺, ou montar uma mistura
        personalizada com precipitados que compartilham a mesma espécie
        titulante.
      </p>
    </div>

    <div className="acidBaseFormGrid">
      <label>
        Modo da mistura
        <select
          value={modoSeletividade}
          onChange={(event) =>
            setModoSeletividade(event.target.value as ModoSeletividade)
          }
        >
          <option value="classico">
            Exemplo clássico: Cl⁻, Br⁻ e I⁻ com Ag⁺
          </option>
          <option value="personalizado">Personalizado</option>
        </select>
      </label>
    </div>

    <div className="acidBaseFormGrid">
  <label>
    Volume da amostra mL
    <input
      value={volumeAmostraSeletividade}
      onChange={(event) =>
        setVolumeAmostraSeletividade(event.target.value)
      }
      placeholder="Ex.: 25,00"
    />
  </label>

  <label>
    Concentração do titulante mol·L⁻¹
    <input
      value={concentracaoTitulanteSeletividade}
      onChange={(event) =>
        setConcentracaoTitulanteSeletividade(event.target.value)
      }
      placeholder="Ex.: 0,1000"
    />
  </label>
</div>

    {modoSeletividade === "classico" && (
      <>
        <div className="acidBaseFormGrid">
          <label>
            [Cl⁻] mol·L⁻¹
            <input
              value={concentracaoClSeletividade}
              onChange={(event) =>
                setConcentracaoClSeletividade(event.target.value)
              }
              placeholder="Ex.: 0,0100"
            />
          </label>

          <label>
            [Br⁻] mol·L⁻¹
            <input
              value={concentracaoBrSeletividade}
              onChange={(event) =>
                setConcentracaoBrSeletividade(event.target.value)
              }
              placeholder="Ex.: 0,0100"
            />
          </label>

          <label>
            [I⁻] mol·L⁻¹
            <input
              value={concentracaoISeletividade}
              onChange={(event) =>
                setConcentracaoISeletividade(event.target.value)
              }
              placeholder="Ex.: 0,0100"
            />
          </label>
        </div>

        <div className="explanationBox">
          <h3>Leitura do sistema</h3>
          <p>
            Titulante considerado: <strong>Ag⁺</strong>. Quanto menor a
            concentração de Ag⁺ necessária para atingir o Kps, mais cedo o
            precipitado começa a se formar.
          </p>
        </div>
      </>
    )}

    {modoSeletividade === "personalizado" && (
      <>
        <div className="acidBaseFormGrid">
          <label>
            Espécie titulante comum
            <select
              value={especieTitulanteSeletividade}
              onChange={(event) =>
                setEspecieTitulanteSeletividade(
                  event.target.value as "cation" | "anion"
                )
              }
            >
              <option value="cation">Cátion comum</option>
              <option value="anion">Ânion comum</option>
            </select>
          </label>

          <label>
            Sal de referência
            <select
              value={salReferenciaSeletividadeId}
              onChange={(event) =>
                setSalReferenciaSeletividadeId(event.target.value)
              }
            >
              {saisPrecipitacao.map((sal) => (
                <option key={sal.id} value={sal.id}>
                  {sal.formulaExibicao} — {sal.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="explanationBox">
          <h3>Leitura do sistema</h3>
          <p>
            A espécie titulante comum considerada é{" "}
            <strong>{formulaTitulanteSeletividade}</strong>. Os precipitados
            comparados abaixo devem compartilhar essa mesma espécie.
          </p>
        </div>

        {itensSeletividadePersonalizada.map((item, index) => {
          const salItem =
            saisCompativeisSeletividade.find((sal) => sal.id === item.salId) ??
            saisCompativeisSeletividade[0];

          const formulaEspecieAnalisada =
            especieAnalitoSeletividade === "anion"
              ? salItem?.anion.formulaExibicao
              : salItem?.cation.formulaExibicao;

          return (
            <div className="acidBaseFormGrid" key={`item-seletividade-${index}`}>
              <label>
                Precipitado {index + 1}
                <select
                  value={item.salId}
                  onChange={(event) =>
                    atualizarItemSeletividade(index, "salId", event.target.value)
                  }
                >
                  {saisCompativeisSeletividade.map((sal) => (
                    <option key={sal.id} value={sal.id}>
                      {sal.formulaExibicao} — {sal.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Espécie analisada
                <input value={formulaEspecieAnalisada ?? "-"} readOnly />
              </label>

              <label>
                Concentração da espécie mol·L⁻¹
                <input
                  value={item.concentracao}
                  onChange={(event) =>
                    atualizarItemSeletividade(
                      index,
                      "concentracao",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: 0,0100"
                />
              </label>

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => removerItemSeletividade(index)}
                  disabled={itensSeletividadePersonalizada.length <= 1}
                >
                  Remover
                </button>
              </div>
            </div>
          );
        })}

        <div className="chartActions" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="secondaryButton"
            onClick={adicionarItemSeletividade}
            disabled={itensSeletividadePersonalizada.length >= 3}
          >
            Adicionar espécie
          </button>
        </div>

        <div className="explanationBox">
          <h3>Interpretação</h3>
          <p>
            Quanto menor a concentração de{" "}
            <strong>{formulaTitulanteSeletividade}</strong> necessária para
            iniciar a precipitação, mais cedo esse precipitado aparece na
            mistura.
          </p>
        </div>
      </>
    )}
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

    <h2>
  {tipoEstudo === "titulacaoDireta"
    ? "Curva da titulação direta"
    : tipoEstudo === "titulacaoRetorno"
      ? "Leitura da titulação por retorno"
      : tipoEstudo === "seletividade"
        ? "Curva conceitual da precipitação seletiva"
        : "Curva e leitura volumétrica"}
</h2>

    {tipoEstudo === "equilibrio" && (
  <div className="chartEmpty">
    A curva volumétrica será exibida quando o tipo de estudo envolver titulação
    direta, titulação por retorno ou precipitação seletiva.
  </div>
)}

{tipoEstudo === "titulacaoRetorno" && !curvaTitulacaoRetorno && (
  <div className="chartEmpty">
    Preencha os dados da titulação por retorno na aba Sistema para gerar a curva
    do retorno.
  </div>
)}

{tipoEstudo === "titulacaoRetorno" && curvaTitulacaoRetorno && (
  <>
    <div className="explanationBox">
      <h3>Curva da titulação por retorno</h3>

      <p>
        Esta curva representa a segunda etapa do método: o titulante de retorno
        é adicionado para consumir o precipitante que sobrou em excesso após a
        reação com o analito.
      </p>
    </div>

    <div className="explanationBox">
      <h3>Conta do retorno</h3>

      <p>
        O excesso de Ag⁺ adicionado é parcialmente consumido pelo analito da
        amostra. O Ag⁺ que sobra é titulado com SCN⁻. Assim:
      </p>

      <p>
        <strong>
          mol do analito = mol de Ag⁺ adicionado − mol de Ag⁺ titulado com SCN⁻
        </strong>
      </p>

      <p>
        Para haletos como Cl⁻, Br⁻ e I⁻, a relação com Ag⁺ é 1:1. Portanto, o
        número de mols do ânion é igual ao número de mols de Ag⁺ consumido na
        precipitação inicial.
      </p>
    </div>

    <GraficoCurvaTitulacaoRetorno
  curva={curvaTitulacaoRetorno}
  pontoMarcado={pontoMarcadoGraficoRetorno}
/>

<div className="curveConsultBox acidBaseConsultBox">
  <div className="acidBaseConsultHeader">
    <span className="eyebrow">Consulta pontual</span>

    <h3>Consultar ponto da curva de retorno</h3>

    <p>
      Informe um volume de SCN⁻ adicionado para calcular o ponto correspondente
      da curva.
    </p>
  </div>

  <div className="acidBaseConsultGrid">
    <label>
      Volume de SCN⁻ adicionado mL
      <input
        value={volumeConsultaCurvaRetorno}
        onChange={(event) =>
          setVolumeConsultaCurvaRetorno(event.target.value)
        }
        placeholder="Ex.: 12,50"
      />
    </label>

    <button
      type="button"
      className="secondaryButton"
      disabled={!pontoConsultaCurvaRetorno}
      onClick={() =>
        setVolumeMarcadoGraficoRetorno(volumeConsultaCurvaRetorno)
      }
    >
      Destacar ponto
    </button>

    <button
      type="button"
      className="secondaryButton"
      disabled={!volumeMarcadoGraficoRetorno}
      onClick={() => setVolumeMarcadoGraficoRetorno("")}
    >
      Limpar marcação
    </button>
  </div>
</div>

{pontoConsultaCurvaRetorno && (
  <>
    <div className="resultGrid curvePointGrid">
      <div className="resultCard">
        <span>Volume consultado</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurvaRetorno.volumeAdicionado, 2)} mL
        </strong>
      </div>

      <div className="resultCard">
        <span>Região</span>
        <strong>{pontoConsultaCurvaRetorno.regiao}</strong>
      </div>

      <div className="resultCard">
        <span>pAg</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurvaRetorno.pPrecipitante, 2)}
        </strong>
      </div>

      <div className="resultCard">
        <span>[Ag⁺] livre</span>
        <strong>
          {formatarCientificoBR(
            pontoConsultaCurvaRetorno.concentracaoPrecipitanteLivre
          )}
        </strong>
      </div>

      <div className="resultCard">
        <span>[SCN⁻] livre</span>
        <strong>
          {formatarCientificoBR(
            pontoConsultaCurvaRetorno.concentracaoTitulanteRetornoLivre
          )}
        </strong>
      </div>

      <div className="resultCard">
        <span>% retorno</span>
        <strong>
          {formatarNumeroBR(pontoConsultaCurvaRetorno.percentualRetorno, 2)}%
        </strong>
      </div>
    </div>

    <div className="explanationBox">
      <h3>Interpretação do ponto</h3>

      <p>
        {pontoConsultaCurvaRetorno.regiao === "Antes do retorno"
          ? "Antes do ponto final, ainda há Ag⁺ em excesso na solução, e o pAg reflete a prata livre remanescente."
          : pontoConsultaCurvaRetorno.regiao === "No ponto final do retorno"
            ? "No ponto final, a quantidade de SCN⁻ adicionada é equivalente ao Ag⁺ em excesso que restou após a etapa de precipitação."
            : pontoConsultaCurvaRetorno.regiao === "Após o retorno"
              ? "Após o ponto final, passa a existir excesso de SCN⁻ em solução, enquanto a concentração de Ag⁺ livre cai acentuadamente."
              : "Não foi possível interpretar este ponto com os dados informados."}
      </p>
    </div>
  </>
)}

    <div className="resultGrid">
      <div className="resultCard">
        <span>Ponto final do retorno</span>
        <strong>
          {formatarNumeroBR(
            curvaTitulacaoRetorno.volumePontoFinalRetorno,
            2
          )}{" "}
          mL
        </strong>
      </div>

      <div className="resultCard">
        <span>Volume máximo da curva</span>
        <strong>
          {formatarNumeroBR(curvaTitulacaoRetorno.volumeMaximo, 2)} mL
        </strong>
      </div>

      <div className="resultCard">
        <span>Passo da curva</span>
        <strong>{formatarNumeroBR(curvaTitulacaoRetorno.passo, 2)} mL</strong>
      </div>

      <div className="resultCard">
        <span>Pontos calculados</span>
        <strong>{curvaTitulacaoRetorno.pontos.length}</strong>
      </div>
    </div>

    <div className="resultsPanel curveTablePanel">
      <h3>Tabela da curva de retorno</h3>

      <div className="curveTableScroll">
        <table className="curve-table">
          <thead>
            <tr>
              <th>Volume retorno</th>
              <th>pAg</th>
<th>[Ag⁺] livre</th>
<th>[SCN⁻] livre</th>
              <th>% retorno</th>
              <th>Região</th>
            </tr>
          </thead>

          <tbody>
            {curvaTitulacaoRetorno.pontos.slice(0, 140).map((ponto) => (
              <tr key={ponto.volumeAdicionado}>
                <td>{formatarNumeroBR(ponto.volumeAdicionado, 2)} mL</td>

                <td>
                  <strong>{formatarNumeroBR(ponto.pPrecipitante, 2)}</strong>
                </td>

                <td>
                  {formatarCientificoBR(ponto.concentracaoPrecipitanteLivre)}
                </td>

                <td>
                  {formatarCientificoBR(
                    ponto.concentracaoTitulanteRetornoLivre
                  )}
                </td>

                <td>{formatarNumeroBR(ponto.percentualRetorno, 2)}%</td>

                <td>{ponto.regiao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <small>
        Esta tabela representa a etapa de retorno, não a precipitação inicial do
        analito.
      </small>
    </div>
  </>
)}

{tipoEstudo === "seletividade" && resultadoSeletividade && (
  <>
    <div className="explanationBox">
      <h3>Curva conceitual da precipitação seletiva</h3>

      <p>
      A curva preta mostra a mistura completa, com todos os íons competindo pelo
mesmo titulante. As curvas tracejadas mostram como cada íon se comportaria
isoladamente. Quando a diferença entre os Kps atende ao critério 10⁸, o gráfico
pode indicar um término seletivo mais confiável. Quando esse critério não é
atendido, o gráfico mostra apenas uma região estimada de transição, sem afirmar
separação quantitativa definitiva.
</p>
    </div>

    {curvaSeletividade && (
  <GraficoPrecipitacaoSeletiva curva={curvaSeletividade} />
)}

{curvaSeletividade && (
  <div className="explanationBox">
    <h3>Leitura das curvas pontilhadas</h3>

    <p>
      As curvas pontilhadas representam titulações hipotéticas dos íons
      isolados. Elas não indicam a sequência real da mistura; servem como
      referência para comparar o comportamento de cada precipitado sozinho.
    </p>

    {curvasIsoladasComMesmoVolumeEquivalencia ? (
      <p>
        Neste caso, as curvas isoladas apresentam o mesmo volume de
        equivalência porque as quantidades equivalentes de analito são iguais
        nas condições informadas. A diferença entre as curvas aparece
        principalmente antes da equivalência, pois cada precipitado possui um
        Kps diferente e, portanto, controla uma concentração livre diferente de{" "}
        {curvaSeletividade.formulaTitulante}.
      </p>
    ) : (
      <p>
        Neste caso, as curvas isoladas não apresentam o mesmo volume de
        equivalência, porque as quantidades equivalentes de analito não são
        iguais nas condições informadas. Espécies em maior concentração, maior
        volume efetivo ou com estequiometria diferente exigem mais titulante
        para atingir a equivalência. Além disso, a altura inicial de cada curva
        também muda conforme o Kps do precipitado.
      </p>
    )}
  </div>
)}

{curvaSeletividade && curvaSeletividade.comparacoesKps.length > 0 && (
  <div className="resultGrid">
    {curvaSeletividade.comparacoesKps.map((comparacao) => (
      <div
        className="resultCard"
        key={`${comparacao.primeiroSal.id}-${comparacao.segundoSal.id}`}
      >
        <span>
          {comparacao.primeiroSal.formulaExibicao} ×{" "}
          {comparacao.segundoSal.formulaExibicao}
        </span>

        <strong>
          {comparacao.atendeCriterioConfiabilidade
            ? "Atende ao critério 10⁸"
            : "Não atende ao critério 10⁸"}
        </strong>

        <small>
          Diferença de Kps: {formatarCientificoBR(comparacao.razaoKps)}
        </small>

        <small>
          log₁₀ da diferença: {formatarNumeroBR(comparacao.logRazaoKps, 2)}
        </small>

        <small>
  {comparacao.atendeCriterioConfiabilidade
    ? "Os Kps são suficientemente diferentes para favorecer uma separação seletiva mais confiável."
    : "Os Kps não são suficientemente diferentes para garantir separação quantitativa limpa; pode haver sobreposição entre as precipitações."}
</small>
      </div>
    ))}
  </div>
)}

    <div className="indicatorRankingList">
      {resultadoSeletividade.itens.map((item) => (
        <div className="indicatorRankingItem" key={`${item.sal.id}-curva`}>
          <div className="indicatorRankNumber">
            {item.ordemPrecipitacao}
          </div>

          <div className="indicatorRankMain">
            <strong>
              {item.sal.formulaExibicao} começa em [Ag⁺] ={" "}
              {formatarCientificoBR(
                item.concentracaoTitulanteInicioPrecipitacao
              )}{" "}
              mol·L⁻¹
            </strong>

            <p className="indicatorJustification">
              pAg = {formatarNumeroBR(item.pTitulanteInicioPrecipitacao, 2)}.
              Esse ponto representa o início previsto da formação de{" "}
              {item.sal.nome}.
            </p>
          </div>

          <div className="indicatorRankScore">
            {item.ordemPrecipitacao === 1 ? "Primeiro" : "Depois"}
          </div>
        </div>
      ))}
    </div>
  </>
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

    {tipoEstudo === "equilibrio" && (
      <div className="chartEmpty">
        A escolha de método volumétrico aparece quando o tipo de estudo for
        titulação direta, titulação por retorno ou precipitação seletiva.
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

    {tipoEstudo === "titulacaoRetorno" && (
      <>
        <p>
          Na titulação por retorno, o método mais representativo é o uso de um
          excesso conhecido de precipitante, seguido da titulação do excesso que
          permaneceu em solução.
        </p>

        <div className="indicatorRankingList">
          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">1</div>

            <div className="indicatorRankMain">
              <strong>Volhard por retorno</strong>

              <p className="indicatorJustification">
                Um excesso conhecido de Ag⁺ é adicionado à amostra para
                precipitar o analito. Depois, o Ag⁺ restante é titulado com
                tiocianato.
              </p>

              <p className="indicatorJustification">
                É adequado para haletos como Cl⁻, Br⁻ e I⁻ quando se deseja
                calcular o analito por diferença entre o excesso adicionado e o
                excesso restante.
              </p>
            </div>

            <div className="indicatorRankScore">OK</div>
          </div>

          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">2</div>

            <div className="indicatorRankMain">
              <strong>Controle por branco</strong>

              <p className="indicatorJustification">
                Pode ser usado como apoio para verificar consumo de titulante,
                perdas ou excesso aparente em sistemas com precipitação pouco
                nítida.
              </p>

              <p className="indicatorJustification">
                Não substitui o cálculo principal, mas melhora a confiabilidade
                da interpretação experimental.
              </p>
            </div>

            <div className="indicatorRankScore">Avaliar</div>
          </div>

          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">3</div>

            <div className="indicatorRankMain">
              <strong>Titulação direta simples</strong>

              <p className="indicatorJustification">
                Não é a melhor leitura quando o sistema foi configurado com
                excesso de precipitante e titulação posterior do excesso.
              </p>
            </div>

            <div className="indicatorRankScore">Evitar</div>
          </div>
        </div>
      </>
    )}

    {tipoEstudo === "seletividade" && resultadoSeletividade && (
      <>
        <p>
          Para precipitação seletiva, o método não é escolhido apenas pelo ponto
          final, mas pela diferença entre as concentrações de Ag⁺ necessárias
          para iniciar cada precipitação.
        </p>

        <div className="indicatorRankingList">
          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">1</div>

            <div className="indicatorRankMain">
              <strong>Precipitação fracionada</strong>

              <p className="indicatorJustification">
                O sistema compara os valores de início de precipitação e ordena
                os precipitados do mais seletivo para o menos seletivo.
              </p>

              <p className="indicatorJustification">
                Para a mistura atual, o primeiro precipitado previsto é{" "}
                <strong>
                  {resultadoSeletividade.itens[0]?.sal.formulaExibicao ?? "-"}
                </strong>
                .
              </p>
            </div>

            <div className="indicatorRankScore">OK</div>
          </div>

          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">2</div>

            <div className="indicatorRankMain">
              <strong>Controle de interferentes</strong>

              <p className="indicatorJustification">
                Íons que precipitam antes podem consumir Ag⁺ e interferir na
                determinação dos demais. Por isso, a ordem de precipitação deve
                ser analisada antes da escolha do procedimento.
              </p>
            </div>

            <div className="indicatorRankScore">Avaliar</div>
          </div>

          <div className="indicatorRankingItem">
            <div className="indicatorRankNumber">3</div>

            <div className="indicatorRankMain">
              <strong>Ponto final único sem separação</strong>

              <p className="indicatorJustification">
                Não é recomendado quando há mistura de haletos, porque mais de
                um íon pode consumir o mesmo titulante em regiões próximas.
              </p>
            </div>

            <div className="indicatorRankScore">Evitar</div>
          </div>
        </div>
      </>
    )}
  </div>
)}

{abaAtiva === "interferencias" && (
  <div className="resultsPanel">
    <span className="eyebrow">Interferências</span>

    <h2>Interferências e seletividade</h2>

    {tipoEstudo === "seletividade" && resultadoSeletividade && (
      <>
        <p>
          Nesta leitura, os íons da mistura competem pelo mesmo titulante, Ag⁺.
          O precipitado que exige menor concentração de Ag⁺ começa a se formar
          primeiro.
        </p>

        <div className="indicatorRankingList">
          {resultadoSeletividade.itens.map((item) => (
            <div className="indicatorRankingItem" key={item.sal.id}>
              <div className="indicatorRankNumber">
                {item.ordemPrecipitacao}
              </div>

              <div className="indicatorRankMain">
                <strong>
                  {item.sal.nome} ({item.sal.formulaExibicao})
                </strong>

                <p className="indicatorJustification">
                  Concentração do analito:{" "}
                  {formatarCientificoBR(item.concentracaoAnalito)} mol·L⁻¹
                </p>

                <p className="indicatorJustification">
                  Início da precipitação em [Ag⁺] ={" "}
                  {formatarCientificoBR(
                    item.concentracaoTitulanteInicioPrecipitacao
                  )}{" "}
                  mol·L⁻¹.
                </p>
              </div>

              <div className="indicatorRankScore">
                pAg {formatarNumeroBR(item.pTitulanteInicioPrecipitacao, 2)}
              </div>
            </div>
          ))}
        </div>

        <div className="explanationBox">
          <h3>Como interpretar a interferência</h3>

          <p>
            Em uma mistura de haletos, o íon que precipita primeiro pode
            interferir na determinação dos demais, pois consome Ag⁺ antes que os
            outros precipitados comecem a se formar. Por isso, I⁻ interfere mais
            fortemente quando Cl⁻ ou Br⁻ também estão presentes.
          </p>
        </div>
      </>
    )}

    {tipoEstudo !== "titulacaoDireta" && tipoEstudo !== "seletividade" && (
      <div className="chartEmpty">
        A avaliação automática de interferentes está disponível para titulação
        direta e precipitação seletiva.
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
equilíbrio de solubilidade, dados volumétricos, método recomendado e possíveis
interferências.
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

{resultadoTitulacaoRetorno && (
  <>
    <div className="explanationBox">
      <h3>Resultado da titulação por retorno</h3>
      <p>{resultadoTitulacaoRetorno.mensagem}</p>
    </div>

    <div className="resultGrid">
      <div className="resultCard">
        <span>Espécie na amostra</span>
        <strong>{formulaAnalito}</strong>
      </div>

      <div className="resultCard">
        <span>Precipitante em excesso</span>
        <strong>{formulaTitulante}</strong>
      </div>

      <div className="resultCard">
        <span>Relação principal</span>
        <strong>{resultadoTitulacaoRetorno.relacaoPrincipal}</strong>
      </div>

      <div className="resultCard">
        <span>Relação de retorno</span>
        <strong>{resultadoTitulacaoRetorno.relacaoRetorno}</strong>
      </div>

      <div className="resultCard">
        <span>Mol precipitante adicionado</span>
        <strong>
          {formatarCientificoBR(
            resultadoTitulacaoRetorno.molPrecipitanteAdicionado
          )}
        </strong>
      </div>

      <div className="resultCard">
        <span>Mol precipitante em excesso</span>
        <strong>
          {formatarCientificoBR(
            resultadoTitulacaoRetorno.molPrecipitanteEmExcesso
          )}
        </strong>
      </div>

      <div className="resultCard">
        <span>Mol consumido pelo analito</span>
        <strong>
          {formatarCientificoBR(
            resultadoTitulacaoRetorno.molPrecipitanteConsumidoPeloAnalito
          )}
        </strong>
      </div>

      <div className="resultCard">
        <span>Mol de analito</span>
        <strong>
          {formatarCientificoBR(resultadoTitulacaoRetorno.molAnalito)}
        </strong>
      </div>

      <div className="resultCard">
        <span>Concentração do analito</span>
        <strong>
          {formatarCientificoBR(
            resultadoTitulacaoRetorno.concentracaoAnalito
          )}{" "}
          mol·L⁻¹
        </strong>
      </div>

      <div className="resultCard">
        <span>Status</span>
        <strong>
          {resultadoTitulacaoRetorno.status === "adequado"
            ? "Adequado"
            : resultadoTitulacaoRetorno.status === "fora_da_bureta"
              ? "Fora da bureta"
              : resultadoTitulacaoRetorno.status === "excesso_insuficiente"
                ? "Excesso insuficiente"
                : "Dados inválidos"}
        </strong>
      </div>
    </div>

    <div className="explanationBox">
      <h3>Como interpretar</h3>
      <p>
        Na titulação por retorno, adiciona-se um excesso conhecido de
        precipitante. Depois, o excesso que não reagiu é titulado. A quantidade
        de analito é calculada pela diferença entre o precipitante adicionado e
        o precipitante restante.
      </p>
    </div>
  </>
)}

{resultadoSeletividade && (
  <>
    <div className="explanationBox">
      <h3>Resultado da precipitação seletiva</h3>
      <p>{resultadoSeletividade.mensagem}</p>
    </div>

    {resultadoSeletividade.itens.length > 0 && (
      <div className="indicatorRankingList">
        {resultadoSeletividade.itens.map((item) => (
          <div className="indicatorRankingItem" key={item.sal.id}>
            <div className="indicatorRankNumber">
              {item.ordemPrecipitacao}
            </div>

            <div className="indicatorRankMain">
              <strong>
                {item.sal.nome} ({item.sal.formulaExibicao})
              </strong>

              <p className="indicatorJustification">
                Concentração do analito:{" "}
                {formatarCientificoBR(item.concentracaoAnalito)} mol·L⁻¹
              </p>

              <p className="indicatorJustification">
                Início da precipitação em [Ag⁺] ={" "}
                {formatarCientificoBR(
                  item.concentracaoTitulanteInicioPrecipitacao
                )}{" "}
                mol·L⁻¹.
              </p>

              <p className="indicatorJustification">{item.interpretacao}</p>
            </div>

            <div className="indicatorRankScore">
              pAg {formatarNumeroBR(item.pTitulanteInicioPrecipitacao, 2)}
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="explanationBox">
      <h3>Como interpretar</h3>
      <p>
        A ordem é definida pela menor concentração de Ag⁺ necessária para iniciar
        a precipitação. O primeiro item da lista é o precipitado que começa a se
        formar antes dos demais.
      </p>
    </div>
  </>
)}

{tipoEstudo === "equilibrio" && (
      <div className="explanationBox">
        <h3>Próxima expansão</h3>

        <p>
          Selecione titulação direta, titulação por retorno ou precipitação
          seletiva para visualizar os cálculos volumétricos específicos.
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

function GraficoPrecipitacaoSeletiva({
  curva,
}: {
  curva: {
    serieMistura: {
      nome: string;
      pontos: {
        volumeAdicionado: number;
        pTitulante: number;
        regiao: string;
      }[];
    };
    seriesIsoladas: {
      sal: {
        id: string;
        nome: string;
        formulaExibicao: string;
      };
      formulaPrecipitado: string;
      ordemPrecipitacao: number;
      volumeEquivalencia: number;
      pontos: {
        volumeAdicionado: number;
        pTitulante: number;
        regiao: string;
      }[];
    }[];
    volumeMaximo: number;
formulaTitulante: string;
comparacoesKps: {
  primeiroSal: {
    id: string;
    formulaExibicao: string;
  };
  segundoSal: {
    id: string;
    formulaExibicao: string;
  };
  atendeCriterioConfiabilidade: boolean;
  razaoKps: number;
  logRazaoKps: number;
}[];
  };
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const largura = 980;
  const altura = 600;

  const margem = {
    top: 36,
    right: 36,
    bottom: 76,
    left: 72,
  };

  const larguraGrafico = largura - margem.left - margem.right;
  const alturaGrafico = altura - margem.top - margem.bottom;

  const pontosMisturaValidos = curva.serieMistura.pontos.filter(
    (ponto) =>
      Number.isFinite(ponto.volumeAdicionado) &&
      Number.isFinite(ponto.pTitulante)
  );

  const seriesIsoladasValidas = curva.seriesIsoladas
    .map((serie) => ({
      ...serie,
      pontosValidos: serie.pontos.filter(
        (ponto) =>
          Number.isFinite(ponto.volumeAdicionado) &&
          Number.isFinite(ponto.pTitulante)
      ),
    }))
    .filter((serie) => serie.pontosValidos.length > 0);

  const pontosIsoladosValidos = seriesIsoladasValidas.flatMap(
    (serie) => serie.pontosValidos
  );

  const pontosValidos = [...pontosMisturaValidos, ...pontosIsoladosValidos];

  if (pontosValidos.length === 0) {
    return (
      <div className="chartEmpty">
        Não há pontos válidos para desenhar a curva seletiva.
      </div>
    );
  }

  const volumeMaximo = curva.volumeMaximo || 1;

  const valoresY = pontosValidos.map((ponto) => ponto.pTitulante);

  const yBrutoMin = Math.min(...valoresY);
  const yBrutoMax = Math.max(...valoresY);
  const amplitudeY = Math.max(yBrutoMax - yBrutoMin, 1);

  const yMin = Math.max(0, yBrutoMin - amplitudeY * 0.08);
  const yMax = yBrutoMax + amplitudeY * 0.12;

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(valor: number) {
    return margem.top + ((yMax - valor) / (yMax - yMin)) * alturaGrafico;
  }

  function criarPath(
    pontos: {
      volumeAdicionado: number;
      pTitulante: number;
    }[]
  ) {
    return pontos
      .map((ponto, index) => {
        const x = xScale(ponto.volumeAdicionado);
        const y = yScale(ponto.pTitulante);

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  function encontrarPontoMaisProximo(
    pontos: {
      volumeAdicionado: number;
      pTitulante: number;
    }[],
    volumeAlvo: number
  ) {
    return pontos.reduce((melhor, atual) =>
      Math.abs(atual.volumeAdicionado - volumeAlvo) <
      Math.abs(melhor.volumeAdicionado - volumeAlvo)
        ? atual
        : melhor
    );
  }

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  const linhasY = Array.from({ length: 6 }, (_, index) => {
    return yMin + ((yMax - yMin) / 5) * index;
  });

  const coresIsoladas = ["#a80000", "#2563eb", "#047857"];

  const saisSemSeparacaoConfiavel = new Set<string>();

curva.comparacoesKps.forEach((comparacao) => {
  if (!comparacao.atendeCriterioConfiabilidade) {
    saisSemSeparacaoConfiavel.add(comparacao.primeiroSal.id);
    saisSemSeparacaoConfiavel.add(comparacao.segundoSal.id);
  }
});

  const marcadoresAcumulados = seriesIsoladasValidas.reduce<
    {
      serie: (typeof seriesIsoladasValidas)[number];
      volumeAcumulado: number;
    }[]
  >((acumulador, serie) => {
    const volumeAnterior =
      acumulador.length > 0
        ? acumulador[acumulador.length - 1].volumeAcumulado
        : 0;

    acumulador.push({
      serie,
      volumeAcumulado: volumeAnterior + serie.volumeEquivalencia,
    });

    return acumulador;
  }, []);

  const segmentosMistura = seriesIsoladasValidas
  .map((serie, index) => {
    const volumeInicio =
      index === 0 ? 0 : marcadoresAcumulados[index - 1].volumeAcumulado;

      const volumeFim =
      index === seriesIsoladasValidas.length - 1
        ? volumeMaximo
        : marcadoresAcumulados[index]?.volumeAcumulado ?? volumeMaximo;

    const pontosDoIntervalo = pontosMisturaValidos.filter(
      (ponto) =>
        ponto.volumeAdicionado >= volumeInicio - 1e-9 &&
        ponto.volumeAdicionado <= volumeFim + 1e-9
    );

    const pontosSemDente = pontosDoIntervalo.filter((ponto) => {
      const distanciaDoFim = Math.abs(ponto.volumeAdicionado - volumeFim);

      return (
        ponto.regiao !== "No ponto de equivalência" &&
        distanciaDoFim > 0.08
      );
    });

    const pontosSegmento =
      pontosSemDente.length >= 2 ? pontosSemDente : pontosDoIntervalo;

    return {
      serie,
      volumeInicio,
      volumeFim,
      pontosSegmento,
    };
  })
  .filter((segmento) => segmento.pontosSegmento.length > 0);

  let pathMisturaConectada = "";

  segmentosMistura.forEach((segmento, index) => {
    const pontos = segmento.pontosSegmento;

    if (pontos.length === 0) return;

    const pathSegmento = criarPath(pontos);

    if (!pathMisturaConectada) {
      pathMisturaConectada = pathSegmento;
    } else {
      const primeiro = pontos[0];

      pathMisturaConectada += ` L ${xScale(primeiro.volumeAdicionado)} ${yScale(
        primeiro.pTitulante
      )}`;

      const pathSemInicio = pathSegmento.replace(/^M\s[^L]+/, "").trim();

      if (pathSemInicio) {
        pathMisturaConectada += ` ${pathSemInicio}`;
      }
    }

    const proximo = segmentosMistura[index + 1];

    if (proximo && proximo.pontosSegmento.length > 0) {
      const ultimoAtual = pontos[pontos.length - 1];
      const primeiroProximo = proximo.pontosSegmento[0];
    
      const xControle =
        (xScale(ultimoAtual.volumeAdicionado) +
          xScale(primeiroProximo.volumeAdicionado)) /
        2;
    
      const yControle =
        (yScale(ultimoAtual.pTitulante) +
          yScale(primeiroProximo.pTitulante)) /
        2;
    
      pathMisturaConectada += ` Q ${xControle} ${yControle} ${xScale(
        primeiroProximo.volumeAdicionado
      )} ${yScale(primeiroProximo.pTitulante)}`;
    }
  });

  function limitar(valor: number, minimo: number, maximo: number) {
    return Math.max(minimo, Math.min(maximo, valor));
  }

  function calcularLayoutCaixaCurva({
    xPonto,
    yPonto,
    deslocarParaBaixo = false,
  }: {
    xPonto: number;
    yPonto: number;
    deslocarParaBaixo?: boolean;
  }) {
    const larguraCaixa = 230;
    const alturaCaixa = 38;
    const offsetHorizontal = 34;
    const offsetVertical = 18;
    const margemInterna = 10;

    const limiteEsquerdo = margem.left + margemInterna;
    const limiteDireito =
      margem.left + larguraGrafico - larguraCaixa - margemInterna;

    const limiteSuperior = margem.top + margemInterna;
    const limiteInferior =
      margem.top + alturaGrafico - alturaCaixa - margemInterna;

    let lado: "direita" | "esquerda" =
      xPonto < margem.left + larguraGrafico * 0.68 ? "direita" : "esquerda";

    if (
      xPonto + offsetHorizontal + larguraCaixa >
      margem.left + larguraGrafico
    ) {
      lado = "esquerda";
    }

    if (xPonto - offsetHorizontal - larguraCaixa < margem.left) {
      lado = "direita";
    }

    let xCaixa =
      lado === "direita"
        ? xPonto + offsetHorizontal
        : xPonto - larguraCaixa - offsetHorizontal;

        let yCaixa = deslocarParaBaixo
        ? yPonto + offsetVertical + 10
        : yPonto - alturaCaixa - offsetVertical;

    if (yPonto < margem.top + 70) {
      yCaixa = yPonto + 18;
    }

    if (yPonto > margem.top + alturaGrafico - 70) {
      yCaixa = yPonto - alturaCaixa - 18;
    }
    
    if (deslocarParaBaixo) {
      yCaixa = yPonto + offsetVertical + 10;
    }

    xCaixa = limitar(xCaixa, limiteEsquerdo, limiteDireito);
    yCaixa = limitar(yCaixa, limiteSuperior, limiteInferior);

    const yCentroCaixa = yCaixa + alturaCaixa / 2;

    const xFimSeta =
      lado === "direita" ? xCaixa - 10 : xCaixa + larguraCaixa + 10;

    const xInicioSeta = lado === "direita" ? xPonto + 8 : xPonto - 8;

    return {
      larguraCaixa,
      alturaCaixa,
      xCaixa,
      yCaixa,
      xInicioSeta,
      yInicioSeta: yPonto,
      xFimSeta,
      yFimSeta: yCentroCaixa,
    };
  }

  return (
    <div className="chartBox acidBaseChartBox">
      <div className="chartHeader">
        <div>
          <strong>
            Curva da mistura e dos íons isolados p{curva.formulaTitulante} ×
            volume
          </strong>

          <span>
            Linha preta: mistura completa com transições conectadas. Linhas
            tracejadas: cada precipitado avaliado isoladamente.
          </span>
        </div>

        <div className="chartActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={() =>
              baixarGraficoPng(
                svgRef.current,
                "curva-mistura-e-ions-isolados"
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
        aria-label="Curva da mistura e dos íons isolados"
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
          <g key={`seletiva-y-${index}`}>
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
          <g key={`seletiva-volume-${volume}`}>
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
              y={margem.top + alturaGrafico + 30}
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

        {seriesIsoladasValidas.map((serie, index) => {
          const cor = coresIsoladas[index % coresIsoladas.length];
          const pathIsolado = criarPath(serie.pontosValidos);

          const pontoEquivalencia = encontrarPontoMaisProximo(
            serie.pontosValidos,
            serie.volumeEquivalencia
          );

          return (
            <g key={`isolada-${serie.sal.id}`}>
              <path
                d={pathIsolado}
                fill="none"
                stroke={cor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.48"
                strokeDasharray="8 6"
              />

              {Number.isFinite(pontoEquivalencia.pTitulante) && (
                <circle
                  cx={xScale(pontoEquivalencia.volumeAdicionado)}
                  cy={yScale(pontoEquivalencia.pTitulante)}
                  r="4"
                  fill={cor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.75"
                />
              )}
            </g>
          );
        })}

        {pathMisturaConectada && (
          <path
            d={pathMisturaConectada}
            fill="none"
            stroke="#111111"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

{marcadoresAcumulados.map((marcador, index) => {
  const segmentoCorrespondente = segmentosMistura.find(
    (segmento) => segmento.serie.sal.id === marcador.serie.sal.id
  );

  if (
    !segmentoCorrespondente ||
    segmentoCorrespondente.pontosSegmento.length === 0
  ) {
    return null;
  }

  const pontoMisturaEquivalente = encontrarPontoMaisProximo(
    segmentoCorrespondente.pontosSegmento,
    marcador.volumeAcumulado
  );

  if (!Number.isFinite(pontoMisturaEquivalente.pTitulante)) {
    return null;
  }

  const semConfiabilidade = saisSemSeparacaoConfiavel.has(
    marcador.serie.sal.id
  );

  const xMarcador = xScale(marcador.volumeAcumulado);
  const xPonto = xScale(pontoMisturaEquivalente.volumeAdicionado);
  const yPonto = yScale(pontoMisturaEquivalente.pTitulante);
  const ehUltimoMarcador = index === marcadoresAcumulados.length - 1;

  const layoutCaixa = calcularLayoutCaixaCurva({
    xPonto,
    yPonto,
    deslocarParaBaixo: ehUltimoMarcador,
  });

  return (
    <g key={`mistura-marcador-${marcador.serie.sal.id}`}>
      <line
        x1={xMarcador}
        x2={xMarcador}
        y1={margem.top}
        y2={margem.top + alturaGrafico}
        stroke="#111111"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        opacity={semConfiabilidade ? "0.28" : "0.42"}
      />

      {semConfiabilidade ? (
        <>
          <circle
            cx={xPonto}
            cy={yPonto}
            r="4"
            fill="#111111"
            opacity="0.5"
          />

<line
  x1={layoutCaixa.xInicioSeta}
  y1={layoutCaixa.yInicioSeta}
  x2={layoutCaixa.xFimSeta}
  y2={layoutCaixa.yFimSeta}
  stroke="#111111"
  strokeWidth="1.5"
  opacity="0.65"
/>

          <rect
            x={layoutCaixa.xCaixa}
            y={layoutCaixa.yCaixa}
            width={layoutCaixa.larguraCaixa}
            height={layoutCaixa.alturaCaixa}
            rx="12"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="1"
            opacity="0.95"
          />

          <text
            x={layoutCaixa.xCaixa + 14}
            y={layoutCaixa.yCaixa + 24}
            fill="#111111"
            fontSize="12"
            fontWeight="900"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            região estimada {marcador.serie.formulaPrecipitado}
          </text>
        </>
      ) : (
        <>
          <circle
            cx={xPonto}
            cy={yPonto}
            r="5"
            fill="#111111"
            stroke="#ffffff"
            strokeWidth="2"
          />

          <rect
            x={Math.min(xPonto + 8, margem.left + larguraGrafico - 150)}
            y={yPonto - 34}
            width="132"
            height="28"
            rx="10"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="1"
            opacity="0.92"
          />

          <text
            x={Math.min(xPonto + 18, margem.left + larguraGrafico - 140)}
            y={yPonto - 15}
            fill="#111111"
            fontSize="12"
            fontWeight="900"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            fim {marcador.serie.formulaPrecipitado}
          </text>
        </>
      )}
    </g>
  );
})}

        <g>
          <rect
            x={largura - margem.right - 218}
            y={margem.top + 14}
            width="200"
            height={48 + seriesIsoladasValidas.length * 30}
            rx="14"
            fill="#ffffff"
            stroke="#d0d5dd"
            strokeWidth="1"
          />

          <line
            x1={largura - margem.right - 198}
            x2={largura - margem.right - 168}
            y1={margem.top + 40}
            y2={margem.top + 40}
            stroke="#111111"
            strokeWidth="4"
          />

          <text
            x={largura - margem.right - 154}
            y={margem.top + 45}
            fill="#344054"
            fontSize="13"
            fontWeight="900"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            Mistura completa
          </text>

          {seriesIsoladasValidas.map((serie, index) => {
            const cor = coresIsoladas[index % coresIsoladas.length];

            return (
              <g key={`legenda-isolada-${serie.sal.id}`}>
                <line
                  x1={largura - margem.right - 198}
                  x2={largura - margem.right - 168}
                  y1={margem.top + 72 + index * 30}
                  y2={margem.top + 72 + index * 30}
                  stroke={cor}
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  opacity="0.65"
                />

                <text
                  x={largura - margem.right - 154}
                  y={margem.top + 77 + index * 30}
                  fill="#344054"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  Isolado {serie.formulaPrecipitado}
                </text>
              </g>
            );
          })}
        </g>

        <text
          x={margem.left + larguraGrafico / 2}
          y={altura - 18}
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
          p{curva.formulaTitulante}
        </text>
      </svg>
    </div>
  );
}
function GraficoCurvaTitulacaoRetorno({
  curva,
  pontoMarcado,
}: {
  curva: {
    pontos: {
      volumeAdicionado: number;
      pPrecipitante: number;
      regiao: string;
      concentracaoPrecipitanteLivre: number;
      concentracaoTitulanteRetornoLivre: number;
      percentualRetorno: number;
    }[];
    volumePontoFinalRetorno: number;
    volumeMaximo: number;
  };
  pontoMarcado?: {
    volumeAdicionado: number;
    pPrecipitante: number;
    regiao: string;
    concentracaoPrecipitanteLivre: number;
    concentracaoTitulanteRetornoLivre: number;
    percentualRetorno: number;
  } | null;
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
      Number.isFinite(ponto.pPrecipitante)
  );

  if (pontosValidos.length === 0) {
    return (
      <div className="chartEmpty">
        Não há pontos válidos para desenhar a curva de retorno.
      </div>
    );
  }

  const volumeMaximo = curva.volumeMaximo || 1;

  const valoresY = pontosValidos.map((ponto) => ponto.pPrecipitante);
  const yBrutoMin = Math.min(...valoresY);
  const yBrutoMax = Math.max(...valoresY);
  const amplitudeY = Math.max(yBrutoMax - yBrutoMin, 1);

  const yMin = Math.max(0, yBrutoMin - amplitudeY * 0.08);
  const yMax = yBrutoMax + amplitudeY * 0.12;

  function xScale(volume: number) {
    return margem.left + (volume / volumeMaximo) * larguraGrafico;
  }

  function yScale(valor: number) {
    return margem.top + ((yMax - valor) / (yMax - yMin)) * alturaGrafico;
  }

  const pathCurva = pontosValidos
    .map((ponto, index) => {
      const x = xScale(ponto.volumeAdicionado);
      const y = yScale(ponto.pPrecipitante);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const linhasVolume = Array.from({ length: 6 }, (_, index) => {
    return (volumeMaximo / 5) * index;
  });

  const linhasY = Array.from({ length: 6 }, (_, index) => {
    return yMin + ((yMax - yMin) / 5) * index;
  });

  const pontoFinal = pontosValidos.reduce((melhor, atual) =>
    Math.abs(atual.volumeAdicionado - curva.volumePontoFinalRetorno) <
    Math.abs(melhor.volumeAdicionado - curva.volumePontoFinalRetorno)
      ? atual
      : melhor
  );

  return (
    <div className="chartBox acidBaseChartBox">
      <div className="chartHeader">
        <div>
          <strong>Curva pAg × volume de SCN⁻</strong>
          <span>
            Curva da titulação do excesso de Ag⁺ com SCN⁻ na etapa de retorno.
          </span>
        </div>

        <div className="chartActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={() =>
              baixarGraficoPng(svgRef.current, "curva-retorno-precipitacao")
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
        aria-label="Curva da titulação por retorno"
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
          <g key={`retorno-linha-y-${index}`}>
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
          <g key={`retorno-linha-volume-${volume}`}>
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
          x1={xScale(curva.volumePontoFinalRetorno)}
          x2={xScale(curva.volumePontoFinalRetorno)}
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

        {Number.isFinite(pontoFinal.pPrecipitante) && (
          <g>
            <circle
              cx={xScale(pontoFinal.volumeAdicionado)}
              cy={yScale(pontoFinal.pPrecipitante)}
              r="5"
              fill="#111111"
              stroke="#ffffff"
              strokeWidth="2"
            />

            <text
              x={xScale(pontoFinal.volumeAdicionado) + 14}
              y={yScale(pontoFinal.pPrecipitante) - 12}
              fill="#111111"
              fontSize="14"
              fontWeight="900"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              PF
            </text>
          </g>
        )}

        {pontoMarcado &&
          Number.isFinite(pontoMarcado.pPrecipitante) &&
          pontoMarcado.volumeAdicionado >= 0 &&
          pontoMarcado.volumeAdicionado <= curva.volumeMaximo && (
            <g>
              <line
                x1={xScale(pontoMarcado.volumeAdicionado)}
                x2={xScale(pontoMarcado.volumeAdicionado)}
                y1={yScale(pontoMarcado.pPrecipitante)}
                y2={margem.top + alturaGrafico}
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              <line
                x1={margem.left}
                x2={xScale(pontoMarcado.volumeAdicionado)}
                y1={yScale(pontoMarcado.pPrecipitante)}
                y2={yScale(pontoMarcado.pPrecipitante)}
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              <circle
                cx={xScale(pontoMarcado.volumeAdicionado)}
                cy={yScale(pontoMarcado.pPrecipitante)}
                r="6"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="3"
              />

              <circle
                cx={xScale(pontoMarcado.volumeAdicionado)}
                cy={yScale(pontoMarcado.pPrecipitante)}
                r="11"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                opacity="0.35"
              />

              <rect
                x={largura - margem.right - 205}
                y={margem.top + alturaGrafico / 2 - 44}
                width="185"
                height="78"
                rx="12"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="1.5"
              />

              <text
                x={largura - margem.right - 190}
                y={margem.top + alturaGrafico / 2 - 22}
                fill="#1d4ed8"
                fontSize="13"
                fontWeight="900"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                Ponto destacado
              </text>

              <text
                x={largura - margem.right - 190}
                y={margem.top + alturaGrafico / 2}
                fill="#344054"
                fontSize="13"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                V = {formatarNumeroBR(pontoMarcado.volumeAdicionado, 2)} mL
              </text>

              <text
                x={largura - margem.right - 190}
                y={margem.top + alturaGrafico / 2 + 18}
                fill="#344054"
                fontSize="13"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                pAg = {formatarNumeroBR(pontoMarcado.pPrecipitante, 2)}
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
          Volume de SCN⁻ adicionado mL
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
          pAg
        </text>
      </svg>
    </div>
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
      r="5"
      fill="#111111"
      stroke="#ffffff"
      strokeWidth="2"
    />

    <text
      x={xScale(pontoPE.volumeAdicionado) + 14}
      y={yScale(pontoPE.pEspecieMonitorada) - 12}
      fill="#111111"
      fontSize="14"
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
  r="6"
  fill="#2563eb"
  stroke="#ffffff"
  strokeWidth="3"
/>

<circle
  cx={xScale(pontoMarcado.volumeAdicionado)}
  cy={yScale(pontoMarcado.pEspecieMonitorada)}
  r="11"
  fill="none"
  stroke="#2563eb"
  strokeWidth="2"
  opacity="0.35"
/>

<rect
  x={largura - margem.right - 205}
  y={margem.top + alturaGrafico / 2 - 44}
  width="185"
  height="78"
  rx="12"
  fill="#ffffff"
  stroke="#2563eb"
  strokeWidth="1.5"
/>

<text
  x={largura - margem.right - 190}
  y={margem.top + alturaGrafico / 2 - 22}
  fill="#1d4ed8"
  fontSize="13"
  fontWeight="900"
  fontFamily="Arial, Helvetica, sans-serif"
>
  Ponto destacado
</text>

<text
  x={largura - margem.right - 190}
  y={margem.top + alturaGrafico / 2}
  fill="#344054"
  fontSize="13"
  fontWeight="700"
  fontFamily="Arial, Helvetica, sans-serif"
>
  V = {formatarNumeroBR(pontoMarcado.volumeAdicionado, 2)} mL
</text>

<text
  x={largura - margem.right - 190}
  y={margem.top + alturaGrafico / 2 + 18}
  fill="#344054"
  fontSize="13"
  fontWeight="700"
  fontFamily="Arial, Helvetica, sans-serif"
>
  p{especieMonitorada} ={" "}
  {formatarNumeroBR(pontoMarcado.pEspecieMonitorada, 2)}
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