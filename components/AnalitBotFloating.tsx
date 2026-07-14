"use client";

import { useState } from "react";
import { useAnalitBot } from "../app/contexts/AnalitBotContext";

type MensagemAnalitBot = {
  autor: "usuario" | "bot";
  texto: string;
};

function responderPergunta(pergunta: string, contexto: string) {
  const contextoNormalizado = contexto.toLowerCase();

  if (contextoNormalizado.includes("complexometria")) {
    return `Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.

Tente perguntar de forma mais direta, por exemplo:
• Qual a importância de informar o pH no começo?
• Por que o melhor indicador foi esse?
• Qual indicador devo usar?
• O que é Kf efetivo?
• Esse sistema é quantitativo?
• Esse interferente atrapalha?`;
  }

  if (contextoNormalizado.includes("ácido-base") || contextoNormalizado.includes("acido-base")) {
    return `Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.

Tente perguntar de forma mais direta, por exemplo:
• O que é ponto de equivalência?
• Como escolher o indicador?
• O que representa a curva de titulação?
• Por que o pH muda durante a titulação?`;
  }

  return `Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.

Tente perguntar usando termos como Kf efetivo, indicador, ponto de equivalência, curva, pH ou interferentes.`;
}

export default function AnalitBotFloating() {
  const { dados } = useAnalitBot();

  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [mensagens, setMensagens] = useState<MensagemAnalitBot[]>([
    {
      autor: "bot",
      texto:
        "Olá! Eu sou o Analito, seu assistente inteligente de Química Analítica.\n\nEu acompanho o módulo que você está usando, observo os resultados calculados e posso explicar conceitos, interpretar valores e ajudar você a entender melhor cada etapa do cálculo.\n\nVocê pode me perguntar, por exemplo:\n• O que significa Kf efetivo?\n• Esse sistema é quantitativo?\n• Qual indicador é mais adequado?\n• O que acontece no ponto de equivalência?",
    },
  ]);

  function analisarModuloAtual() {
    const contextoOriginal = dados.contextoTexto;
    const contexto = dados.contextoTexto.toLowerCase();
    const moduloAtual = dados.moduloAtual.toLowerCase();
  
    if (
      !dados.contextoTexto ||
      dados.contextoTexto.includes("Nenhum sistema") ||
      dados.resumoCalculo.includes("Nenhum cálculo")
    ) {
      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        {
          autor: "bot",
          texto:
            "Ainda não há um cálculo ativo para analisar. Primeiro realize uma avaliação em algum módulo do AnalitCalc e depois clique em “Analisar módulo”.",
        },
      ]);
  
      return;
    }
  
    function normalizarLocal(texto: string) {
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
  
    function extrairCampoContexto(rotulo: string) {
      const rotulosConhecidos = [
        "Módulo",
        "Tipo de sistema",
        "Metal principal",
        "Complexo formado",
        "pH avaliado",
        "Volume de equivalência",
        "α(Y⁴⁻)",
        "Kf condicional",
        "Kf efetivo",
        "Status da titulação",
        "Mensagem do sistema",
        "Resumo químico",
        "Interferentes avaliados",
        "Indicador mais compatível",
        "Titulante",
        "Titulado",
        "Tipo de titulação",
        "Número de equivalências",
        "Volumes de equivalência",
        "Resumo calculado",
        "Equação global",
        "Produto final",
      ];
  
      const contextoNormalizado = normalizarLocal(contextoOriginal);
      const rotuloNormalizado = normalizarLocal(rotulo);
  
      const inicio = contextoNormalizado.indexOf(`${rotuloNormalizado}:`);
  
      if (inicio === -1) return "";
  
      const inicioValor = inicio + `${rotuloNormalizado}:`.length;
  
      let fim = contextoOriginal.length;
  
      for (const proximoRotulo of rotulosConhecidos) {
        if (normalizarLocal(proximoRotulo) === rotuloNormalizado) continue;
  
        const marcador = `${normalizarLocal(proximoRotulo)}:`;
        const indice = contextoNormalizado.indexOf(marcador, inicioValor);
  
        if (indice !== -1 && indice < fim) {
          fim = indice;
        }
      }
  
      return contextoOriginal
        .slice(inicioValor, fim)
        .trim()
        .replace(/[.;]$/, "");
    }
  
    function converterExpoenteSobrescrito(texto: string) {
      return texto
        .replace(/⁰/g, "0")
        .replace(/¹/g, "1")
        .replace(/²/g, "2")
        .replace(/³/g, "3")
        .replace(/⁴/g, "4")
        .replace(/⁵/g, "5")
        .replace(/⁶/g, "6")
        .replace(/⁷/g, "7")
        .replace(/⁸/g, "8")
        .replace(/⁹/g, "9")
        .replace(/⁻/g, "-")
        .replace(/⁺/g, "+");
    }
  
    function converterNumeroCientifico(valor: string) {
      const limpo = converterExpoenteSobrescrito(valor)
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace("×10^", "e")
        .replace("x10^", "e")
        .replace("·10^", "e")
        .replace("×10", "e")
        .replace("x10", "e")
        .replace("E", "e");
  
      const numero = Number(limpo);
  
      return Number.isFinite(numero) ? numero : null;
    }
  
    let analise = "";
  
    if (contexto.includes("complexometria") || contexto.includes("edta")) {
      const metal = extrairCampoContexto("Metal principal");
      const ph = extrairCampoContexto("pH avaliado");
      const volumeEquivalencia = extrairCampoContexto("Volume de equivalência");
      const alfaEdta = extrairCampoContexto("α(Y⁴⁻)");
      const kfCondicional = extrairCampoContexto("Kf condicional");
      const kfEfetivoTexto = extrairCampoContexto("Kf efetivo");
      const status = extrairCampoContexto("Status da titulação");
      const mensagem = extrairCampoContexto("Mensagem do sistema");
      const resumoQuimico = extrairCampoContexto("Resumo químico");
      const indicador = extrairCampoContexto("Indicador mais compatível");
      const interferentes = extrairCampoContexto("Interferentes avaliados");
  
      const kfEfetivo = converterNumeroCientifico(kfEfetivoTexto);
      const statusNormalizado = normalizarLocal(status);
  
      let classificacao = "";
      let interpretacao = "";
  
      if (
        statusNormalizado.includes("ruim") ||
        statusNormalizado.includes("nao quantit") ||
        statusNormalizado.includes("não quantit") ||
        statusNormalizado.includes("inviavel") ||
        statusNormalizado.includes("inviável")
      ) {
        classificacao = "Titulação ruim ou não quantitativa";
        interpretacao =
          "O sistema não deve ser tratado como quantitativo nas condições avaliadas. Isso indica que a formação do complexo metal–EDTA não está suficientemente favorecida para uma determinação confiável.";
      } else if (
        statusNormalizado.includes("parcial") ||
        statusNormalizado.includes("intermedi")
      ) {
        classificacao = "Titulação parcialmente quantitativa";
        interpretacao =
          "O sistema apresenta formação do complexo, mas a condição calculada ainda exige cautela. A titulação pode ser limitada por Kf efetivo intermediário, pH pouco favorável ou competição por equilíbrios paralelos.";
      } else if (
        statusNormalizado.includes("quantit") &&
        !statusNormalizado.includes("nao") &&
        !statusNormalizado.includes("não")
      ) {
        classificacao = "Titulação quantitativa";
        interpretacao =
          "O sistema tende a ser adequado para titulação quantitativa, pois o status calculado indica que a formação do complexo metal–EDTA é suficientemente favorecida.";
      } else if (kfEfetivo !== null) {
        if (kfEfetivo >= 1e8) {
          classificacao = "Titulação quantitativa";
          interpretacao =
            "O Kf efetivo está alto, indicando formação bem favorecida do complexo metal–EDTA. Nessas condições, o sistema tende a ser adequado para titulação quantitativa.";
        } else if (kfEfetivo >= 1e6) {
          classificacao = "Titulação parcialmente quantitativa";
          interpretacao =
            "O Kf efetivo está em faixa intermediária. A formação do complexo ocorre, mas pode não ser completa o suficiente para uma titulação plenamente quantitativa.";
        } else {
          classificacao = "Titulação ruim ou não quantitativa";
          interpretacao =
            "O Kf efetivo está baixo para uma titulação complexométrica quantitativa. A formação do complexo metal–EDTA não está suficientemente favorecida nas condições avaliadas.";
        }
      } else {
        classificacao = "Classificação não determinada";
        interpretacao =
          "Não foi possível determinar a classificação apenas pelo texto disponível. Para avaliar a viabilidade, observe principalmente o Kf efetivo, o status da titulação, o pH e possíveis interferentes.";
      }
  
      analise = `Análise do módulo — Complexometria com EDTA
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  ${metal ? `Metal principal: ${metal}.` : "Metal principal não informado."}
  ${ph ? `pH avaliado: ${ph}.` : "pH avaliado não informado."}
  ${volumeEquivalencia ? `Volume de equivalência: ${volumeEquivalencia}.` : ""}
  ${alfaEdta ? `α(Y⁴⁻): ${alfaEdta}.` : ""}
  ${kfCondicional ? `Kf condicional: ${kfCondicional}.` : ""}
  ${kfEfetivoTexto ? `Kf efetivo: ${kfEfetivoTexto}.` : "Kf efetivo não informado."}
  
  2. Classificação da titulação
  ${classificacao}.
  
  3. Interpretação química
  ${interpretacao}
  
  ${
    mensagem
      ? `4. Mensagem do sistema
  ${mensagem}
  
  `
      : ""
  }${
        resumoQuimico
          ? `5. Resumo químico
  ${resumoQuimico}
  
  `
          : ""
      }${
        indicador
          ? `6. Indicador
  O indicador mais compatível foi ${indicador}. Ele deve ser interpretado junto com o metal principal, o pH avaliado e a região próxima ao ponto de equivalência.
  
  `
          : ""
      }${
        interferentes
          ? `7. Interferentes
  Interferentes avaliados: ${interferentes}.
  
  `
          : ""
      }Conclusão
  Este sistema deve ser interpretado como: ${classificacao}.`;
    } else if (
      contexto.includes("ácido-base") ||
      contexto.includes("acido-base") ||
      moduloAtual.includes("ácido-base") ||
      moduloAtual.includes("acido-base")
    ) {
      const ehPoliprotico =
        contexto.includes("poliprótico") ||
        contexto.includes("poliprotico") ||
        contexto.includes("polibásico") ||
        contexto.includes("polibasico") ||
        contexto.includes("número de equivalências") ||
        contexto.includes("numero de equivalencias") ||
        contexto.includes("pe1") ||
        contexto.includes("pe2");
  
      const ehMonoprotico =
        contexto.includes("monoprótico") ||
        contexto.includes("monoprotico") ||
        contexto.includes("monobásico") ||
        contexto.includes("monobasico");
  
      const titulante = extrairCampoContexto("Titulante");
      const titulado = extrairCampoContexto("Titulado");
      const tipoTitulacao = extrairCampoContexto("Tipo de titulação");
      const volume = extrairCampoContexto("Volume de equivalência");
      const numeroEquivalencias = extrairCampoContexto("Número de equivalências");
      const volumesEquivalencia = extrairCampoContexto("Volumes de equivalência");
      const resumo = extrairCampoContexto("Resumo calculado");
      const equacao = extrairCampoContexto("Equação global");
  
      if (ehPoliprotico) {
        analise = `Análise completa da titulação ácido-base poliprótica/polibásica
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  ${titulante ? `Titulante: ${titulante}.` : ""}
  ${titulado ? `Titulado: ${titulado}.` : ""}
  ${tipoTitulacao ? `Tipo de titulação: ${tipoTitulacao}.` : ""}
  ${numeroEquivalencias ? `Número de equivalências: ${numeroEquivalencias}.` : ""}
  ${volumesEquivalencia ? `Volumes de equivalência: ${volumesEquivalencia}.` : ""}
  
  2. Interpretação
  Este sistema envolve múltiplas etapas ácido-base relevantes. Cada ponto de equivalência representa uma etapa estequiométrica diferente da reação entre titulante e titulado.
  
  3. Curva de titulação
  A curva pode apresentar mais de uma região de maior variação de pH. Entre equivalências, podem aparecer regiões tampão, nas quais o pH varia de forma mais gradual.
  
  ${resumo ? `4. Resumo calculado\n${resumo}\n\n` : ""}${
          equacao ? `5. Equação global\n${equacao}\n\n` : ""
        }Conclusão
  A interpretação deve observar o número de equivalências, os volumes de PE, a forma da curva e o indicador adequado para cada etapa.`;
      } else if (ehMonoprotico) {
        analise = `Análise completa da titulação ácido-base monoprótica/monobásica
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  ${titulante ? `Titulante: ${titulante}.` : ""}
  ${titulado ? `Titulado: ${titulado}.` : ""}
  ${tipoTitulacao ? `Tipo de titulação: ${tipoTitulacao}.` : ""}
  ${volume ? `Volume de equivalência: ${volume}.` : ""}
  
  2. Ponto de equivalência
  Em sistemas monopróticos ou monobásicos, normalmente há um ponto de equivalência principal. Ele representa o momento em que titulante e titulado reagiram em proporção estequiométrica.
  
  3. Curva de titulação
  A curva mostra como o pH varia conforme o titulante é adicionado. A região de maior inclinação indica a proximidade do ponto de equivalência.
  
  ${resumo ? `4. Resumo calculado\n${resumo}\n\n` : ""}${
          equacao ? `5. Equação global\n${equacao}\n\n` : ""
        }Conclusão
  A titulação deve ser interpretada observando o tipo de sistema ácido-base, o volume de equivalência, o pH próximo ao PE, o formato da curva e a compatibilidade do indicador.`;
      } else {
        analise = `Análise completa do módulo de Titulações Ácido-Base
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  ${titulante ? `Titulante: ${titulante}.` : ""}
  ${titulado ? `Titulado: ${titulado}.` : ""}
  ${tipoTitulacao ? `Tipo de titulação: ${tipoTitulacao}.` : ""}
  
  2. Interpretação
  O sistema atual foi avaliado considerando o titulante, o titulado, o tipo de titulação e o ponto de equivalência calculado.
  
  ${resumo ? `3. Resumo calculado\n${resumo}\n\n` : ""}Conclusão
  A análise deve considerar o tipo de ácido/base, o volume de equivalência, o comportamento da curva e a escolha do indicador.`;
      }
    } else {
      analise = `Análise do módulo atual
  
  ${dados.resumoCalculo}
  
  O Analito identificou os dados calculados no módulo atual e pode ajudar a interpretar o resultado. Para uma análise mais específica, use um módulo com cálculo realizado e pergunte sobre Kf efetivo, indicador, ponto de equivalência, curva, pH ou interferentes.
  
  Dados usados na análise:
  ${dados.contextoTexto}`;
    }
  
    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      {
        autor: "bot",
        texto: analise,
      },
    ]);
  }
  
  async function enviarPergunta() {
    const textoFinal = pergunta.trim();

    if (!textoFinal || carregando) return;

    const contextoCompleto = `
Módulo atual: ${dados.moduloAtual}
Tipo de sistema: ${dados.tipoSistema}
Resumo: ${dados.resumoCalculo}

Contexto:
${dados.contextoTexto}
`;

    setPergunta("");
    setCarregando(true);

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      {
        autor: "usuario",
        texto: textoFinal,
      },
    ]);

    try {
      const respostaApi = await fetch("/api/analitbot-conhecimento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pergunta: textoFinal,
          contexto: contextoCompleto,
        }),
      });

      const dadosApi = await respostaApi.json();

      const respostaSheets =
        typeof dadosApi?.resposta === "string" ? dadosApi.resposta : "";

      const encontrouNoSheets = Boolean(dadosApi?.encontrou);

      const respostaFinal = encontrouNoSheets
        ? respostaSheets
        : responderPergunta(textoFinal, contextoCompleto);

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        {
          autor: "bot",
          texto: respostaFinal,
        },
      ]);
    } catch (erro) {
      const respostaFallback = responderPergunta(textoFinal, contextoCompleto);

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        {
          autor: "bot",
          texto: respostaFallback,
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        className="analitBotFloatingButton"
        onClick={() => setAberto(true)}
        aria-label="Abrir AnalitBot"
      >
        An
      </button>
    );
  }

  return (
    <div className="analitBotWindow">
      <div className="analitBotHeader">
        <div className="analitBotHeaderInfo">
        <div className="analitBotAvatar">An</div>

        <div className="analitBotHeaderText">
  <strong>Analito</strong>
  <span>Assistente inteligente do AnalitCalc</span>
</div>
        </div>

        <button
          type="button"
          className="analitBotClose"
          onClick={() => setAberto(false)}
          aria-label="Minimizar AnalitBot"
        >
          —
        </button>
      </div>

      <div className="analitBotContextBox">
        <strong>{dados.moduloAtual}</strong>
        <span>{dados.tipoSistema}</span>
      </div>

      <div className="analitBotMessages">
        {mensagens.map((mensagem, index) => (
          <div
            key={`analitbot-${index}`}
            className={`analitBotMessage ${mensagem.autor}`}
          >
            {mensagem.texto}
          </div>
        ))}

        {carregando && (
          <div className="analitBotMessage bot">
            Consultando a base do Analito...
          </div>
        )}
      </div>

      <div className="analitBotActions">
  <button type="button" onClick={analisarModuloAtual}>
    Analisar módulo
  </button>
</div>

      <div className="analitBotFooter">
        <textarea
          className="analitBotInput"
          value={pergunta}
          onChange={(event) => setPergunta(event.target.value)}
          placeholder="Pergunte sobre o cálculo..."
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              enviarPergunta();
            }
          }}
        />

        <button
          type="button"
          className="analitBotSend"
          onClick={enviarPergunta}
          disabled={carregando}
        >
          {carregando ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}