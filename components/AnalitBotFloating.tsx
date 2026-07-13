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
  
    let analise = "";
  
    if (contexto.includes("complexometria")) {
      analise = `Análise completa do módulo de Complexometria
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  O sistema atual foi avaliado no módulo de complexometria com EDTA. A análise considera o metal principal, o pH informado, o Kf efetivo, o ponto de equivalência, o indicador recomendado e possíveis interferentes.
  
  2. Viabilidade da titulação
  O status calculado indica se a formação do complexo metal–EDTA é suficientemente favorecida nas condições informadas. Quando o sistema aparece como quantitativo, significa que a complexação tende a ser adequada para a titulação. Quando não é quantitativo, pode haver baixa formação de complexo, pH inadequado ou interferências relevantes.
  
  3. Papel do pH
  O pH é essencial porque controla a fração ativa do EDTA na forma Y⁴⁻. Quanto mais adequada for essa fração para o metal analisado, maior tende a ser o Kf efetivo e melhor a definição da titulação.
  
  4. Indicador
  O indicador recomendado deve ser interpretado como aquele que apresentou maior compatibilidade com o metal principal, com o pH avaliado e com a região próxima ao ponto de equivalência. Um bom indicador facilita a visualização do ponto final da titulação.
  
  5. Interferentes
  A presença de interferentes pode prejudicar a titulação caso outras espécies também reajam com o EDTA. Quando não há interferentes relevantes, a determinação tende a ser mais seletiva. Quando há risco alto, pode ser necessário avaliar mascarantes ou ajustar as condições da titulação.
  
  6. Interpretação final
  Com base nos dados calculados, este sistema deve ser interpretado observando principalmente o Kf efetivo, o status da titulação, o pH e o indicador mais compatível.
  
  Dados usados na análise:
  ${dados.contextoTexto}`;
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
  
      if (ehPoliprotico) {
        analise = `Análise completa da titulação ácido-base poliprótica/polibásica
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  Este sistema envolve uma espécie com mais de uma etapa ácido-base relevante. Por isso, a análise deve considerar múltiplos pontos de equivalência, regiões tampão intermediárias e mudanças sucessivas no comportamento do pH.
  
  2. Equivalências
  Em sistemas polipróticos ou polibásicos, pode haver mais de um ponto de equivalência. Cada equivalência representa uma etapa estequiométrica diferente da reação entre titulante e titulado. Por isso, PE1, PE2 e possíveis equivalências seguintes devem ser interpretados separadamente.
  
  3. Curva de titulação
  A curva pode apresentar mais de uma região de maior variação de pH. Essas regiões indicam transições importantes entre espécies químicas predominantes. Entre equivalências, podem aparecer regiões tampão, nas quais o pH varia de forma mais gradual.
  
  4. Regiões tampão
  Quando há pares ácido/base conjugados relevantes, o sistema pode formar regiões tampão. Nessas regiões, o pH tende a resistir a variações bruscas. Para ácidos polipróticos, essas regiões costumam estar relacionadas aos valores de pKa; para bases polibásicas, aos equilíbrios sucessivos de protonação.
  
  5. Indicadores
  A escolha do indicador deve considerar qual ponto de equivalência se deseja detectar. Um indicador adequado para o primeiro PE pode não ser adequado para o segundo. Por isso, a faixa de viragem deve ser comparada com o pH próximo à equivalência de interesse.
  
  6. Interpretação final
  A interpretação desse sistema deve observar o número de equivalências, os volumes de PE, a forma da curva, as regiões tampão e o indicador mais adequado para cada etapa.
  
  Dados usados na análise:
  ${dados.contextoTexto}`;
      } else if (ehMonoprotico) {
        analise = `Análise completa da titulação ácido-base monoprótica/monobásica
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  Este sistema envolve uma titulação ácido-base com uma etapa estequiométrica principal. A análise considera o titulante, o titulado, o volume de equivalência, o comportamento da curva e a escolha do indicador.
  
  2. Ponto de equivalência
  O ponto de equivalência representa o momento em que titulante e titulado reagiram em proporção estequiométrica. Em sistemas monopróticos ou monobásicos, normalmente há um ponto de equivalência principal.
  
  3. pH no ponto de equivalência
  O pH no ponto de equivalência depende da força relativa do ácido e da base envolvidos. Por isso, ele nem sempre será igual a 7. Ácido forte com base forte tende a ter PE próximo de pH 7; sistemas envolvendo ácido fraco ou base fraca podem apresentar PE ácido ou básico.
  
  4. Curva de titulação
  A curva mostra como o pH varia conforme o titulante é adicionado. A região de maior inclinação indica a proximidade do ponto de equivalência. Antes do PE, predomina o titulado em excesso; depois do PE, predomina o titulante em excesso.
  
  5. Indicador
  O indicador adequado é aquele cuja faixa de viragem coincide com a região de maior variação de pH próxima ao ponto de equivalência. Se a faixa do indicador estiver distante dessa região, a viragem pode ocorrer antes ou depois do ponto ideal.
  
  6. Interpretação final
  A titulação deve ser interpretada observando o tipo de sistema ácido-base, o volume de equivalência, o pH próximo ao PE, o formato da curva e a compatibilidade do indicador.
  
  Dados usados na análise:
  ${dados.contextoTexto}`;
      } else {
        analise = `Análise completa do módulo de Titulações Ácido-Base
  
  1. Sistema avaliado
  ${dados.resumoCalculo}
  
  O sistema atual foi avaliado considerando o titulante, o titulado, o tipo de titulação e o ponto de equivalência calculado.
  
  2. Ponto de equivalência
  O ponto de equivalência representa o momento em que titulante e titulado reagiram em proporção estequiométrica. O pH nesse ponto depende da força do ácido e da base envolvidos.
  
  3. Curva de titulação
  A curva mostra como o pH varia conforme o titulante é adicionado. A região de maior variação costuma indicar a proximidade do ponto de equivalência.
  
  4. Indicador
  O indicador mais adequado é aquele cuja faixa de viragem coincide com a região de maior mudança de pH próxima ao ponto de equivalência.
  
  5. Interpretação final
  A análise do sistema deve considerar o tipo de ácido/base, o volume de equivalência, o comportamento da curva e a escolha do indicador.
  
  Dados usados na análise:
  ${dados.contextoTexto}`;
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