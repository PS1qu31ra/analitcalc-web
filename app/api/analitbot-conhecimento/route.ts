type LinhaConhecimento = {
    modulo: string;
    topico: string;
    palavras_chave: string;
    pergunta_base: string;
    resposta_base: string;
    prioridade: number;
  };
  
  function normalizarTexto(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  
  function separarCSVLinha(linha: string) {
    const resultado: string[] = [];
    let valorAtual = "";
    let dentroDeAspas = false;
  
    for (let i = 0; i < linha.length; i++) {
      const caractere = linha[i];
      const proximo = linha[i + 1];
  
      if (caractere === '"' && proximo === '"') {
        valorAtual += '"';
        i++;
        continue;
      }
  
      if (caractere === '"') {
        dentroDeAspas = !dentroDeAspas;
        continue;
      }
  
      if (caractere === "," && !dentroDeAspas) {
        resultado.push(valorAtual.trim());
        valorAtual = "";
        continue;
      }
  
      valorAtual += caractere;
    }
  
    resultado.push(valorAtual.trim());
  
    return resultado;
  }
  
  function converterCSVParaLinhas(csv: string): LinhaConhecimento[] {
    const linhas = csv
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter(Boolean);
  
    const [, ...dados] = linhas;
  
    return dados
      .map((linha) => {
        const colunas = separarCSVLinha(linha);
  
        return {
          modulo: colunas[0] ?? "",
          topico: colunas[1] ?? "",
          palavras_chave: colunas[2] ?? "",
          pergunta_base: colunas[3] ?? "",
          resposta_base: colunas[4] ?? "",
          prioridade: Number(colunas[5] ?? 0),
        };
      })
      .filter((linha) => linha.resposta_base);
  }
  
  function calcularPontuacao(
    linha: LinhaConhecimento,
    pergunta: string,
    contexto: string
  ) {
    const perguntaNormalizada = normalizarTexto(pergunta);
    const contextoNormalizado = normalizarTexto(contexto);
  
    const moduloNormalizado = normalizarTexto(linha.modulo);
    const topicoNormalizado = normalizarTexto(linha.topico);
  
    const palavras = linha.palavras_chave
      .split(",")
      .map((palavra) => normalizarTexto(palavra.trim()))
      .filter(Boolean);
  
    let pontuacao = 0;
    let encontrouCorrespondencia = false;
  
    if (moduloNormalizado && contextoNormalizado.includes(moduloNormalizado)) {
      pontuacao += 8;
    }
  
    if (topicoNormalizado && perguntaNormalizada.includes(topicoNormalizado)) {
      pontuacao += 12;
      encontrouCorrespondencia = true;
    }
  
    palavras.forEach((palavra) => {
      if (perguntaNormalizada.includes(palavra)) {
        pontuacao += 15;
        encontrouCorrespondencia = true;
      }
  
      if (contextoNormalizado.includes(palavra)) {
        pontuacao += 2;
      }
    });
  
    if (!encontrouCorrespondencia) {
      return 0;
    }
  
    pontuacao += linha.prioridade || 0;
  
    return pontuacao;
  }
  
  export async function POST(request: Request) {
    try {
      const csvUrl = process.env.ANALITBOT_SHEETS_CSV_URL;
  
      if (!csvUrl) {
        return Response.json(
          {
            resposta:
              "A base do Google Sheets ainda não foi configurada no .env.",
          },
          { status: 500 }
        );
      }
  
      const body = await request.json();
  
      const pergunta = String(body.pergunta ?? "").trim();
      const contexto = String(body.contexto ?? "").trim();
  
      if (!pergunta) {
        return Response.json(
          {
            resposta: "Digite uma pergunta para o AnalitBot.",
          },
          { status: 400 }
        );
      }
  
      const respostaSheets = await fetch(csvUrl, {
        cache: "no-store",
      });
  
      if (!respostaSheets.ok) {
        return Response.json(
          {
            resposta:
              "Não consegui acessar a base de conhecimento do Google Sheets.",
          },
          { status: 500 }
        );
      }
  
      const csv = await respostaSheets.text();
const linhas = converterCSVParaLinhas(csv);

console.log("CSV PRIMEIROS 500 CARACTERES:");
console.log(csv.slice(0, 500));

console.log("LINHAS CONVERTIDAS:");
console.log(linhas.slice(0, 5));
  
      const melhorLinha = linhas
        .map((linha) => ({
          linha,
          pontuacao: calcularPontuacao(linha, pergunta, contexto),
        }))
        .sort((a, b) => b.pontuacao - a.pontuacao)[0];
  
        if (!melhorLinha || melhorLinha.pontuacao < 15) {
        return Response.json({
          encontrou: false,
          resposta:
            "Não encontrei uma resposta específica na base do Sheets para essa pergunta.",
        });
      }
  
      return Response.json({
        encontrou: true,
        modulo: melhorLinha.linha.modulo,
        topico: melhorLinha.linha.topico,
        resposta: melhorLinha.linha.resposta_base,
      });
    } catch (erro) {
      return Response.json(
        {
          resposta:
            erro instanceof Error
              ? `Erro ao consultar a base do AnalitBot: ${erro.message}`
              : "Erro inesperado ao consultar a base do AnalitBot.",
        },
        { status: 500 }
      );
    }
  }