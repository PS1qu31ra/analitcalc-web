export function normalizarTexto(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  
  export function limparPontuacao(texto: string) {
    return normalizarTexto(texto)
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  export function removerStopwords(texto: string) {
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
      "oq",
      "oque",
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
      "seria",
    ]);
  
    return limparPontuacao(texto)
      .split(" ")
      .filter((palavra) => palavra.length >= 3 && !stopwords.has(palavra))
      .join(" ");
  }
  
  export function calcularDistanciaLevenshtein(a: string, b: string) {
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
  
  export function termosSaoParecidos(a: string, b: string) {
    const termoA = limparPontuacao(a);
    const termoB = limparPontuacao(b);
  
    if (!termoA || !termoB) return false;
    if (termoA === termoB) return true;
    if (termoA.includes(termoB) || termoB.includes(termoA)) return true;
  
    if (termoA.length < 4 || termoB.length < 4) return false;
  
    const maior = Math.max(termoA.length, termoB.length);
    const distancia = calcularDistanciaLevenshtein(termoA, termoB);
    const similaridade = 1 - distancia / maior;
  
    return similaridade >= 0.78;
  }
  
  export function perguntaCombinaComTermo(pergunta: string, termo: string) {
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
  
    return palavrasCombinadas / palavrasTermo.length >= 0.67;
  }