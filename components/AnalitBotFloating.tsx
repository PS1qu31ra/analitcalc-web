"use client";

import { useState } from "react";
import { useAnalitBot } from "../app/contexts/AnalitBotContext";

type MensagemAnalitBot = {
  autor: "usuario" | "bot";
  texto: string;
};

function responderPergunta(pergunta: string, contexto: string) {
  const perguntaNormalizada = pergunta.toLowerCase();

  if (
    perguntaNormalizada.includes("sistema") ||
    perguntaNormalizada.includes("calculo") ||
    perguntaNormalizada.includes("cálculo")
  ) {
    return `Com base no contexto atual:
${contexto}

Esse é o sistema que está conectado ao AnalitBot neste momento.`;
  }

  if (
    perguntaNormalizada.includes("pe") ||
    perguntaNormalizada.includes("equivalência") ||
    perguntaNormalizada.includes("equivalencia")
  ) {
    return `O ponto de equivalência é o ponto em que a quantidade de titulante adicionada reage estequiometricamente com o titulado.`;
  }

  if (
    perguntaNormalizada.includes("indicador") ||
    perguntaNormalizada.includes("viragem")
  ) {
    return `A escolha do indicador depende da faixa de viragem em relação ao pH próximo ao ponto de equivalência.`;
  }

  if (
    perguntaNormalizada.includes("curva") ||
    perguntaNormalizada.includes("ph")
  ) {
    return `A curva mostra como o pH varia conforme o volume de titulante é adicionado.`;
  }

  return `Ainda não encontrei essa resposta na minha base de conhecimento. Tente perguntar usando termos como Kf efetivo, indicador, ponto de equivalência, curva, pH ou interferentes.`;
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