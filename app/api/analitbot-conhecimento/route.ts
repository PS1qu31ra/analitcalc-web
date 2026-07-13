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

function limparPontuacao(texto: string) {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removerStopwords(texto: string) {
  const stopwords = new Set([
    "o",
    "a",
    "os",
    "as",
    "um",
    "uma",
    "uns",
    "umas",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "para",
    "pra",
    "por",
    "com",
    "sem",
    "que",
    "e",
    "eh",
    "é",
    "oq",
    "oque",
    "o que",
    "qual",
    "quais",
    "me",
    "explica",
    "explique",
    "fala",
    "sobre",
    "isso",
    "esse",
    "essa",
    "este",
    "esta",
  ]);

  return limparPontuacao(texto)
    .split(" ")
    .filter((palavra) => palavra.length >= 3 && !stopwords.has(palavra))
    .join(" ");
}

function calcularDistanciaLevenshtein(a: string, b: string) {
  const matriz = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
  for (let j = 0; j <= b.length; j++) matriz[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;

      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + custo
      );
    }
  }

  return matriz[a.length][b.length];
}

function termosSaoParecidos(a: string, b: string) {
  const termoA = limparPontuacao(a);
  const termoB = limparPontuacao(b);

  if (!termoA || !termoB) return false;

  if (termoA === termoB) return true;
  if (termoA.includes(termoB) || termoB.includes(termoA)) return true;

  const maior = Math.max(termoA.length, termoB.length);
  const distancia = calcularDistanciaLevenshtein(termoA, termoB);
  const similaridade = 1 - distancia / maior;

  return similaridade >= 0.78;
}

function perguntaCombinaComTermo(pergunta: string, termo: string) {
  const perguntaLimpa = removerStopwords(pergunta);
  const termoLimpo = removerStopwords(termo);

  if (!perguntaLimpa || !termoLimpo) return false;

  if (perguntaLimpa === termoLimpo) return true;

  if (perguntaLimpa.includes(termoLimpo) || termoLimpo.includes(perguntaLimpa)) {
    return true;
  }

  const palavrasPergunta = perguntaLimpa.split(" ");
  const palavrasTermo = termoLimpo.split(" ");

  let palavrasCombinadas = 0;

  for (const palavraTermo of palavrasTermo) {
    const combinou = palavrasPergunta.some((palavraPergunta) =>
      termosSaoParecidos(palavraPergunta, palavraTermo)
    );

    if (combinou) {
      palavrasCombinadas++;
    }
  }

  if (palavrasTermo.length === 1) {
    return palavrasCombinadas === 1;
  }

  const proporcao = palavrasCombinadas / palavrasTermo.length;

  return proporcao >= 0.67;
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
    p.includes("qual devo") ||
    p.includes("qual usar") ||
    p.includes("qual e o melhor") ||
    p.includes("qual é o melhor") ||
    p.includes("melhor indicador") ||
    p.includes("indicador devo usar") ||
    p.includes("devo usar")
  ) {
    return "decisao";
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

function detectarAssunto(pergunta: string) {
  const p = normalizarTexto(pergunta);

  if (
    perguntaCombinaComTermo(pergunta, "titulação") ||
    perguntaCombinaComTermo(pergunta, "titulacao") ||
    perguntaCombinaComTermo(pergunta, "análise volumétrica") ||
    perguntaCombinaComTermo(pergunta, "analise volumetrica")
  ) {
    return "titulacao";
  }

  if (
    perguntaCombinaComTermo(pergunta, "titulante") ||
    p.includes("solucao titulante") ||
    p.includes("reagente padrao")
  ) {
    return "titulante";
  }

  if (
    perguntaCombinaComTermo(pergunta, "titulado") ||
    p.includes("solucao titulada") ||
    p.includes("amostra titulada")
  ) {
    return "titulado";
  }

  if (
    perguntaCombinaComTermo(pergunta, "analito") ||
    p.includes("especie analisada") ||
    p.includes("substancia analisada")
  ) {
    return "analito";
  }

  if (
    p.includes("ponto final") ||
    p.includes("final da titulacao") ||
    p.includes("fim da titulacao")
  ) {
    return "ponto_final";
  }

  if (
    p.includes("ponto de equivalencia") ||
    p.includes("equivalencia") ||
    p.includes("volume de equivalencia") ||
    p.includes(" pe ") ||
    p.endsWith(" pe")
  ) {
    return "ponto_equivalencia";
  }

  if (
    perguntaCombinaComTermo(pergunta, "indicador") ||
    p.includes("viragem") ||
    p.includes("mudanca de cor") ||
    p.includes("cor")
  ) {
    return "indicador";
  }

  if (
    perguntaCombinaComTermo(pergunta, "curva") ||
    p.includes("grafico") ||
    p.includes("regiao") ||
    p.includes("antes do pe") ||
    p.includes("depois do pe")
  ) {
    return "curva";
  }

  if (
    p.includes("ph") ||
    p.includes("pka") ||
    p.includes("pkb") ||
    p.includes("tampao") ||
    p.includes("tampon")
  ) {
    return "ph";
  }

  if (
    p.includes("kf") ||
    p.includes("constante de formacao") ||
    p.includes("constante efetiva") ||
    p.includes("constante condicional")
  ) {
    return "kf";
  }

  if (
    p.includes("edta") ||
    p.includes("complexante") ||
    p.includes("quelante") ||
    p.includes("ligante")
  ) {
    return "edta";
  }

  if (
    p.includes("metal principal") ||
    p.includes("metal analisado") ||
    p.includes("ion metalico") ||
    p.includes("cation")
  ) {
    return "metal_principal";
  }

  if (
    p.includes("complexo") ||
    p.includes("metal edta") ||
    p.includes("metal-edta") ||
    p.includes("my")
  ) {
    return "complexo";
  }

  if (
    p.includes("interferente") ||
    p.includes("interferencia") ||
    p.includes("atrapalha") ||
    p.includes("competicao") ||
    p.includes("competir")
  ) {
    return "interferente";
  }

  if (
    p.includes("mascarante") ||
    p.includes("mascaramento") ||
    p.includes("mascarar")
  ) {
    return "mascarante";
  }

  if (
    p.includes("concentracao") ||
    p.includes("molaridade") ||
    p.includes("mol/l") ||
    p.includes("mol por litro")
  ) {
    return "concentracao";
  }

  if (
    p.includes("estequiometria") ||
    p.includes("proporcao") ||
    p.includes("relacao molar")
  ) {
    return "estequiometria";
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

  const moduloLinha = normalizarTexto(linha.modulo);
  const topicoLinha = normalizarTexto(linha.topico);
  const intencaoLinha = normalizarTexto(linha.intencao);
  const perguntaBaseLinha = normalizarTexto(linha.pergunta_base);
  const palavrasChaveLinha = normalizarTexto(linha.palavras_chave);
  const termosContextoLinha = normalizarTexto(linha.termos_contexto);
  const quandoUsarLinha = normalizarTexto(linha.quando_usar);
  const quandoNaoUsarLinha = normalizarTexto(linha.quando_nao_usar);

  const intencaoPergunta = normalizarTexto(detectarIntencao(pergunta));
  const assuntoPergunta = normalizarTexto(detectarAssunto(pergunta));
  
  let pontuacao = 0;
  let evidenciaPergunta = 0;

  const contextoEhComplexometria =
    contextoNormalizado.includes("complexometria") ||
    contextoNormalizado.includes("edta");

  const contextoEhAcidoBase =
    contextoNormalizado.includes("acido-base") ||
    contextoNormalizado.includes("acido base") ||
    contextoNormalizado.includes("titulacoes acido-base") ||
    contextoNormalizado.includes("titulacao acido-base");

  const linhaEhGeral =
    moduloLinha === "geral" ||
    moduloLinha === "analitcalc" ||
    moduloLinha === "todos";

  const linhaEhDoModuloAtual =
    (contextoEhComplexometria && moduloLinha.includes("complexometria")) ||
    (contextoEhAcidoBase &&
      (moduloLinha.includes("acido-base") ||
        moduloLinha.includes("acido base") ||
        moduloLinha.includes("acidobase")));

  const linhaEhDeOutroModulo =
    !linhaEhGeral &&
    ((contextoEhComplexometria &&
      (moduloLinha.includes("acido-base") ||
        moduloLinha.includes("acido base") ||
        moduloLinha.includes("acidobase"))) ||
      (contextoEhAcidoBase && moduloLinha.includes("complexometria")));

  if (linhaEhDoModuloAtual) {
    pontuacao += 25;
  }

  if (linhaEhGeral) {
    pontuacao += 12;
  }

  const topicosGeraisFortes = [
    "titulacao",
    "titulante",
    "titulado",
    "analito",
    "estequiometria",
    "concentracao molar",
  ];
  
  const topicoGeralForte =
    linhaEhGeral && topicosGeraisFortes.includes(removerStopwords(linha.topico));
  
  if (
    topicoGeralForte &&
    termosSaoParecidos(
      removerStopwords(pergunta),
      removerStopwords(linha.topico)
    )
  ) {
    pontuacao += 35;
    evidenciaPergunta += 20;
  }

  if (linhaEhDeOutroModulo) {
    pontuacao -= 35;
  }

  if (intencaoLinha && intencaoLinha === intencaoPergunta) {
    pontuacao += 18;
  }

  const assuntoLinha =
  normalizarTexto(linha.topico) +
  " " +
  normalizarTexto(linha.palavras_chave) +
  " " +
  normalizarTexto(linha.pergunta_base);

const assuntoPerguntaTexto = assuntoPergunta.replace(/_/g, " ");

if (
  assuntoPergunta &&
  (assuntoLinha.includes(assuntoPergunta) ||
    assuntoLinha.includes(assuntoPerguntaTexto))
) {
  pontuacao += 22;
  evidenciaPergunta += 12;
}

const linhaPareceRegiao =
  topicoLinha.includes("regiao") ||
  palavrasChaveLinha.includes("antes do pe") ||
  palavrasChaveLinha.includes("depois do pe");

if (assuntoPergunta === "titulacao" && linhaPareceRegiao) {
  pontuacao -= 30;
}

const linhaPareceCurva =
  topicoLinha.includes("curva") || palavrasChaveLinha.includes("grafico");

if (assuntoPergunta === "titulacao" && linhaPareceCurva) {
  pontuacao -= 20;
}

const linhaPareceMetal =
  topicoLinha.includes("metal principal") ||
  palavrasChaveLinha.includes("metal principal");

if (assuntoPergunta !== "metal_principal" && linhaPareceMetal) {
  pontuacao -= 18;
}

  if (topicoLinha && perguntaCombinaComTermo(pergunta, linha.topico)) {
    pontuacao += 12;
    evidenciaPergunta += 12;
  }

  if (perguntaBaseLinha && perguntaCombinaComTermo(pergunta, linha.pergunta_base)) {
    pontuacao += 15;
    evidenciaPergunta += 15;
  }

  const palavrasChave = palavrasChaveLinha
    .split(",")
    .map((termo) => termo.trim())
    .filter(Boolean);

    for (const palavra of palavrasChave) {
      if (palavra.length >= 3 && perguntaCombinaComTermo(pergunta, palavra)) {
        pontuacao += 7;
        evidenciaPergunta += 7;
      }
    }

  const termosContexto = termosContextoLinha
    .split(",")
    .map((termo) => termo.trim())
    .filter(Boolean);

  for (const termo of termosContexto) {
    if (termo.length >= 3 && contextoNormalizado.includes(termo)) {
      pontuacao += 3;
    }
  }

  const termosQuandoUsar = quandoUsarLinha
    .split(",")
    .map((termo) => termo.trim())
    .filter(Boolean);

    for (const termo of termosQuandoUsar) {
      if (termo.length >= 3 && perguntaCombinaComTermo(pergunta, termo)) {
        pontuacao += 3;
        evidenciaPergunta += 3;
      }
    }

  const termosQuandoNaoUsar = quandoNaoUsarLinha
    .split(",")
    .map((termo) => termo.trim())
    .filter(Boolean);

    for (const termo of termosQuandoNaoUsar) {
      if (
        termo.length >= 3 &&
        (perguntaNormalizada.includes(termo) ||
          contextoNormalizado.includes(termo))
      ) {
        pontuacao -= 20;
      }
    }

  pontuacao += linha.prioridade || 0;

  if (evidenciaPergunta < 6) {
    return -999;
  }

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

function extrairValorDoContexto(contexto: string, rotulo: string) {
  const regex = new RegExp(`${rotulo}:\\s*([^\\n]+)`, "i");
  const resultado = contexto.match(regex);

  return resultado?.[1]?.trim().replace(/\.$/, "") ?? "";
}

function extrairDadosDaPlataforma(contexto: string) {
  return {
    modulo: extrairValorDoContexto(contexto, "Módulo"),
    metalPrincipal: extrairValorDoContexto(contexto, "Metal principal"),
    complexoFormado: extrairValorDoContexto(contexto, "Complexo formado"),
    pH: extrairValorDoContexto(contexto, "pH avaliado"),
    volumeEquivalencia: extrairValorDoContexto(contexto, "Volume de equivalência"),
    alfaEDTA: extrairValorDoContexto(contexto, "α\\(Y⁴⁻\\)"),
    kfCondicional: extrairValorDoContexto(contexto, "Kf condicional"),
    kfEfetivo: extrairValorDoContexto(contexto, "Kf efetivo"),
    status: extrairValorDoContexto(contexto, "Status da titulação"),
    indicador: extrairValorDoContexto(contexto, "Indicador mais compatível"),
    interferentes: extrairValorDoContexto(contexto, "Interferentes avaliados"),
  };
}

function montarComplementoComDados(
  linha: LinhaConhecimento,
  contexto: string,
  pergunta: string
) {
  const dados = extrairDadosDaPlataforma(contexto);
  const intencao = detectarIntencao(pergunta);
  const topico = normalizarTexto(linha.topico);

  const perguntaNormalizada = normalizarTexto(pergunta);

const perguntaSobreIndicador =
  perguntaNormalizada.includes("indicador") ||
  perguntaNormalizada.includes("viragem") ||
  perguntaNormalizada.includes("cor");

if (
  topico.includes("indicador") ||
  intencao === "indicador" ||
  (intencao === "decisao" && perguntaSobreIndicador)
) {
    if (dados.indicador) {
      return `

Para este sistema, o indicador mais recomendado é ${dados.indicador}.${
        dados.metalPrincipal || dados.pH
          ? ` Essa escolha considera${
              dados.metalPrincipal ? ` o metal principal ${dados.metalPrincipal}` : ""
            }${dados.metalPrincipal && dados.pH ? "," : ""}${
              dados.pH ? ` o pH ${dados.pH}` : ""
            } e a compatibilidade calculada para a titulação.`
          : ""
      }`;
    }
  }

  if (topico.includes("kf efetivo") || pergunta.toLowerCase().includes("quantitativo")) {
    if (dados.kfEfetivo || dados.status) {
      return `

No sistema atual, o Kf efetivo calculado foi ${
        dados.kfEfetivo || "não informado"
      } e o status da titulação foi ${
        dados.status || "não informado"
      }.`;
    }
  }

  if (topico.includes("ph") || pergunta.toLowerCase().includes("ph")) {
    if (dados.pH || dados.alfaEDTA || dados.kfEfetivo) {
      return `

No sistema atual, o pH avaliado foi ${
        dados.pH || "não informado"
      }. A fração ativa do EDTA, α(Y⁴⁻), foi ${
        dados.alfaEDTA || "não informada"
      }, e o Kf efetivo foi ${dados.kfEfetivo || "não informado"}.`;
    }
  }

  if (topico.includes("interferente")) {
    if (dados.interferentes) {
      return `

No sistema atual, os interferentes avaliados foram: ${dados.interferentes}.`;
    }
  }

  if (
    topico.includes("ponto de equival") ||
    topico.includes("volume de equival") ||
    pergunta.toLowerCase().includes("pe")
  ) {
    if (dados.volumeEquivalencia) {
      return `

No sistema atual, o volume de equivalência calculado foi ${dados.volumeEquivalencia}.`;
    }
  }

  if (topico.includes("metal principal")) {
    if (dados.metalPrincipal || dados.complexoFormado) {
      return `

No sistema atual, o metal principal é ${
        dados.metalPrincipal || "não informado"
      }${
        dados.complexoFormado
          ? ` e o complexo formado é ${dados.complexoFormado}`
          : ""
      }.`;
    }
  }

  return "";
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

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);
    
    let respostaSheets: Response;
    
    try {
      respostaSheets = await fetch(csvUrl, {
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

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

    const respostaBase = montarResposta(melhorLinha.linha, pergunta);

    const complementoDados = montarComplementoComDados(
      melhorLinha.linha,
      contexto,
      pergunta
    );
    
    const intencaoResposta = detectarIntencao(pergunta);
    
    const devePriorizarDados =
      intencaoResposta === "indicador" ||
      intencaoResposta === "interpretacao" ||
      intencaoResposta === "interferente" ||
      intencaoResposta === "ponto_equivalencia" ||
      intencaoResposta === "decisao";
    
    const respostaFinal =
      devePriorizarDados && complementoDados
        ? `${complementoDados.trim()}\n\n${respostaBase}`
        : `${respostaBase}${complementoDados}`;
    
    return Response.json({
      encontrou: true,
      modulo: melhorLinha.linha.modulo,
      topico: melhorLinha.linha.topico,
      intencao: melhorLinha.linha.intencao,
      resposta: respostaFinal,
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