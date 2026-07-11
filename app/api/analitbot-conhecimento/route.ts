type LinhaConhecimento = {
  modulo: string;
  topico: string;
  intencao: string;
  palavras_chave: string;
  termos_contexto: string;
  pergunta_base: string;
  resposta_curta: string;
  resposta_completa: string;
  quando_usar: string;
  quando_nao_usar: string;
  prioridade: number;
};

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contarSeparadorForaAspas(linha: string, separador: string) {
  let total = 0;
  let dentroDeAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const caractere = linha[i];
    const proximo = linha[i + 1];

    if (caractere === '"' && proximo === '"') {
      i++;
      continue;
    }

    if (caractere === '"') {
      dentroDeAspas = !dentroDeAspas;
      continue;
    }

    if (caractere === separador && !dentroDeAspas) {
      total++;
    }
  }

  return total;
}

function detectarSeparador(cabecalho: string) {
  const candidatos = [",", ";", "\t"];

  return candidatos
    .map((separador) => ({
      separador,
      total: contarSeparadorForaAspas(cabecalho, separador),
    }))
    .sort((a, b) => b.total - a.total)[0].separador;
}

function separarLinha(linha: string, separador: string) {
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

    if (caractere === separador && !dentroDeAspas) {
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

  const [cabecalho, ...dados] = linhas;
  const separador = detectarSeparador(cabecalho ?? "");

  return dados
    .map((linha) => {
      const colunas = separarLinha(linha, separador);

      return {
        modulo: colunas[0] ?? "",
        topico: colunas[1] ?? "",
        intencao: colunas[2] ?? "",
        palavras_chave: colunas[3] ?? "",
        termos_contexto: colunas[4] ?? "",
        pergunta_base: colunas[5] ?? "",
        resposta_curta: colunas[6] ?? "",
        resposta_completa: colunas[7] ?? "",
        quando_usar: colunas[8] ?? "",
        quando_nao_usar: colunas[9] ?? "",
        prioridade: Number(colunas[10] ?? 0),
      };
    })
    .filter((linha) => linha.resposta_curta || linha.resposta_completa);
}

function separarTermos(texto: string) {
  return texto
    .split(",")
    .map((termo) => normalizarTexto(termo.trim()))
    .filter(Boolean);
}

function detectarIntencao(pergunta: string) {
  const p = normalizarTexto(pergunta);

  if (
    p.includes("o que e") ||
    p.includes("oque e") ||
    p.includes("significa") ||
    p.includes("defina") ||
    p.includes("conceito")
  ) {
    return "conceito";
  }

  if (
    p.includes("bom") ||
    p.includes("ruim") ||
    p.includes("viavel") ||
    p.includes("quantitativo") ||
    p.includes("adequado") ||
    p.includes("serve") ||
    p.includes("confiavel")
  ) {
    return "interpretacao";
  }

  if (
    p.includes("qual indicador") ||
    p.includes("indicador") ||
    p.includes("viragem") ||
    p.includes("cor")
  ) {
    return "indicador";
  }

  if (
    p.includes("interferente") ||
    p.includes("interferencia") ||
    p.includes("atrapalha") ||
    p.includes("mascarante") ||
    p.includes("compet")
  ) {
    return "interferente";
  }

  if (
    p.includes("ponto de equivalencia") ||
    p.includes("equivalencia") ||
    p.includes(" pe ") ||
    p.endsWith(" pe") ||
    p.includes("volume de equivalencia")
  ) {
    return "ponto_equivalencia";
  }

  if (
    p.includes("curva") ||
    p.includes("grafico") ||
    p.includes("regiao") ||
    p.includes("antes do pe") ||
    p.includes("depois do pe")
  ) {
    return "curva";
  }

  if (
    p.includes("calcula") ||
    p.includes("calculo") ||
    p.includes("formula") ||
    p.includes("como chegou") ||
    p.includes("como foi calculado")
  ) {
    return "calculo";
  }

  return "";
}

function calcularPontuacao(
  linha: LinhaConhecimento,
  pergunta: string,
  contexto: string
) {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const contextoNormalizado = normalizarTexto(contexto);
  const intencaoPergunta = detectarIntencao(pergunta);

  const moduloNormalizado = normalizarTexto(linha.modulo);
  const topicoNormalizado = normalizarTexto(linha.topico);
  const intencaoLinha = normalizarTexto(linha.intencao);
  const perguntaBaseNormalizada = normalizarTexto(linha.pergunta_base);
  const quandoUsarNormalizado = normalizarTexto(linha.quando_usar);
  const quandoNaoUsarNormalizado = normalizarTexto(linha.quando_nao_usar);

  const palavrasChave = separarTermos(linha.palavras_chave);
  const termosContexto = separarTermos(linha.termos_contexto);

  let pontuacao = 0;
  let encontrouCorrespondencia = false;

  if (moduloNormalizado && contextoNormalizado.includes(moduloNormalizado)) {
    pontuacao += 8;
  }

  if (intencaoPergunta && intencaoLinha === intencaoPergunta) {
    pontuacao += 20;
    encontrouCorrespondencia = true;
  }

  if (
    intencaoPergunta &&
    intencaoLinha &&
    intencaoLinha.includes(intencaoPergunta)
  ) {
    pontuacao += 12;
    encontrouCorrespondencia = true;
  }

  if (topicoNormalizado && perguntaNormalizada.includes(topicoNormalizado)) {
    pontuacao += 18;
    encontrouCorrespondencia = true;
  }

  if (
    perguntaBaseNormalizada &&
    perguntaBaseNormalizada.includes(perguntaNormalizada)
  ) {
    pontuacao += 12;
    encontrouCorrespondencia = true;
  }

  if (
    perguntaBaseNormalizada &&
    perguntaNormalizada.includes(perguntaBaseNormalizada)
  ) {
    pontuacao += 12;
    encontrouCorrespondencia = true;
  }

  palavrasChave.forEach((palavra) => {
    if (perguntaNormalizada.includes(palavra)) {
      pontuacao += 14;
      encontrouCorrespondencia = true;
    }

    if (contextoNormalizado.includes(palavra)) {
      pontuacao += 2;
    }
  });

  termosContexto.forEach((termo) => {
    if (contextoNormalizado.includes(termo)) {
      pontuacao += 5;
    }

    if (perguntaNormalizada.includes(termo)) {
      pontuacao += 8;
      encontrouCorrespondencia = true;
    }
  });

  separarTermos(quandoUsarNormalizado).forEach((termo) => {
    if (termo && perguntaNormalizada.includes(termo)) {
      pontuacao += 6;
      encontrouCorrespondencia = true;
    }
  });

  separarTermos(quandoNaoUsarNormalizado).forEach((termo) => {
    if (termo && perguntaNormalizada.includes(termo)) {
      pontuacao -= 20;
    }
  });

  if (!encontrouCorrespondencia) {
    return 0;
  }

  pontuacao += linha.prioridade || 0;

  return pontuacao;
}

function montarResposta(linha: LinhaConhecimento, pergunta: string) {
  const intencao = detectarIntencao(pergunta);

  if (intencao === "conceito" && linha.resposta_completa) {
    return linha.resposta_completa;
  }

  if (intencao === "interpretacao" && linha.resposta_completa) {
    return linha.resposta_completa;
  }

  if (linha.resposta_completa) {
    return linha.resposta_completa;
  }

  return linha.resposta_curta;
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
          resposta: "Digite uma pergunta para o Analito.",
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
            "Não consegui acessar a base de conhecimento do Analito.",
        },
        { status: 500 }
      );
    }

    const csv = await respostaSheets.text();
    const linhas = converterCSVParaLinhas(csv);

    const ranking = linhas
      .map((linha) => ({
        linha,
        pontuacao: calcularPontuacao(linha, pergunta, contexto),
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    const melhorLinha = ranking[0];

    if (!melhorLinha || melhorLinha.pontuacao < 18) {
      return Response.json({
        encontrou: false,
        resposta:
          "Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.",
      });
    }

    return Response.json({
      encontrou: true,
      modulo: melhorLinha.linha.modulo,
      topico: melhorLinha.linha.topico,
      intencao: melhorLinha.linha.intencao,
      pontuacao: melhorLinha.pontuacao,
      resposta: montarResposta(melhorLinha.linha, pergunta),
    });
  } catch (erro) {
    return Response.json(
      {
        resposta:
          erro instanceof Error
            ? `Erro ao consultar a base do Analito: ${erro.message}`
            : "Erro inesperado ao consultar a base do Analito.",
      },
      { status: 500 }
    );
  }
}