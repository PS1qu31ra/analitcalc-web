import { baseConhecimento } from "./baseConhecimento";
import type {
  IntencaoAnalito,
  ItemConhecimento,
  ResultadoAnalito,
} from "./tipos";
import {
  normalizarTexto,
  perguntaCombinaComTermo,
  removerStopwords,
  termosSaoParecidos,
} from "./normalizacao";

function detectarIntencao(pergunta: string): IntencaoAnalito | "" {
  const p = normalizarTexto(pergunta);

  if (
    p.includes("o que e") ||
    p.includes("oque e") ||
    p.includes("significa") ||
    p.includes("defina") ||
    p.includes("definicao") ||
    p.includes("conceito") ||
    p.includes("seria")
  ) {
    return "conceito";
  }

  if (
    p.includes("por que") ||
    p.includes("porque") ||
    p.includes("pq") ||
    p.includes("para que") ||
    p.includes("pra que") ||
    p.includes("funcao") ||
    p.includes("função")
  ) {
    return "interpretacao";
  }

  if (
    p.includes("qual devo") ||
    p.includes("qual usar") ||
    p.includes("qual e o melhor") ||
    p.includes("melhor") ||
    p.includes("recomendado") ||
    p.includes("devo usar")
  ) {
    return "decisao";
  }

  if (
    p.includes("comparar") ||
    p.includes("comparacao") ||
    p.includes("maior") ||
    p.includes("menor") ||
    p.includes("diferença") ||
    p.includes("diferenca")
  ) {
    return "comparacao";
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

  if (
    p.includes("erro") ||
    p.includes("errado") ||
    p.includes("nao aceita") ||
    p.includes("invalido") ||
    p.includes("inválido")
  ) {
    return "erro";
  }

  return "";
}

function detectarAssunto(pergunta: string) {
  const p = normalizarTexto(pergunta);

  const pSemPontuacao = p
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const palavras = pSemPontuacao.split(" ");

if (
  palavras.includes("pm") ||
  pSemPontuacao.includes("menos log do metal livre") ||
  pSemPontuacao.includes("escala de metal livre")
) {
  return "pm";
}

  if (
    p.includes("ponto final") &&
    (p.includes("ponto de equivalencia") ||
      p.includes("equivalencia") ||
      p.includes(" pe "))
  ) {
    return "ponto_final_equivalencia";
  }
  
  if (
    p.includes("ponto final") ||
    p.includes("fim da titulacao") ||
    p.includes("momento de parar") ||
    p.includes("sinal experimental")
  ) {
    return "ponto_final";
  }
  
  if (
    p.includes("ponto de equivalencia") ||
    p.includes("volume de equivalencia") ||
    p.includes(" pe ") ||
    p.endsWith(" pe")
  ) {
    return "ponto_equivalencia";
  }
  
  if (
    p.includes("curva de titulacao") ||
    p.includes("grafico da titulacao") ||
    p.includes("grafico de titulacao")
  ) {
    return "curva";
  }
  
  if (
    p.includes("concentracao molar") ||
    p.includes("molaridade") ||
    p.includes("mol por litro") ||
    p.includes("mol/l")
  ) {
    return "concentracao_molar";
  }
  
  if (
    (p.includes("estequiometria") ||
      p.includes("relacao molar") ||
      p.includes("proporcao")) &&
    (p.includes("edta") ||
      p.includes("metal edta") ||
      p.includes("complexometria") ||
      p.includes("complexometrica") ||
      p.includes("complexometrico"))
  ) {
    return "estequiometria_metal_edta";
  }

  if (
    p.includes("estequiometria") ||
    p.includes("relacao molar") ||
    p.includes("proporcao entre reagentes")
  ) {
    return "estequiometria";
  }
  
  if (
    p.includes("volume de equivalencia") ||
    p.includes("volume do pe") ||
    p.includes("volume pe")
  ) {
    return "volume_equivalencia";
  }
  
  if (
    p.includes("erro de titulacao") ||
    p.includes("erro experimental") ||
    p.includes("resultado errado")
  ) {
    return "erro_titulacao";
  }
  
  if (
    p.includes("unidades") ||
    p.includes("mol por litro") ||
    p.includes("ml") ||
    p.includes("litro") ||
    p.includes("mililitro")
  ) {
    return "unidades";
  }
  
  if (
    p.includes("arredondamento") ||
    p.includes("casas decimais") ||
    p.includes("valor aproximado")
  ) {
    return "arredondamento";
  }

  if (
    p.includes("complexante auxiliar") ||
    p.includes("ligante auxiliar") ||
    p.includes("agente auxiliar") ||
    p.includes("complexante secundario") ||
    p.includes("complexante de apoio") ||
    p.includes("amonia") ||
    p.includes("nh3")
  ) {
    return "ligante_auxiliar";
  }

  if (p.includes("kf efetivo") || p.includes("constante efetiva")) {
    return "kf_efetivo";
  }

  if (p.includes("kf condicional")) {
    return "kf_condicional";
  }

  if (
    p.includes("indicador") ||
    p.includes("viragem") ||
    p.includes("mudanca de cor") ||
    p.includes("cor")
  ) {
    return "indicador";
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

  if (p.includes("mascarante") || p.includes("mascaramento")) {
    return "mascarante";
  }

  if (
    p.includes("edta") ||
    p.includes("agente quelante edta") ||
    p.includes("titulante edta") ||
    p.includes("ligante edta")
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
    perguntaCombinaComTermo(pergunta, "titulação") ||
    perguntaCombinaComTermo(pergunta, "titulacao") ||
    perguntaCombinaComTermo(pergunta, "análise volumétrica") ||
    perguntaCombinaComTermo(pergunta, "analise volumetrica")
  ) {
    return "titulacao";
  }

  if (perguntaCombinaComTermo(pergunta, "titulante")) {
    return "titulante";
  }

  if (perguntaCombinaComTermo(pergunta, "titulado")) {
    return "titulado";
  }

  if (perguntaCombinaComTermo(pergunta, "analito")) {
    return "analito";
  }

  return "";
}

function calcularPontuacao(
  item: ItemConhecimento,
  pergunta: string,
  contexto: string
) {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const contextoNormalizado = normalizarTexto(contexto);

  const moduloItem = normalizarTexto(item.modulo);
  const assuntoPergunta = detectarAssunto(pergunta);
  const intencaoPergunta = detectarIntencao(pergunta);

  let pontuacao = 0;
  let evidencia = 0;

  const contextoComplexometria =
    contextoNormalizado.includes("complexometria") ||
    contextoNormalizado.includes("edta");

  const contextoAcidoBase =
    contextoNormalizado.includes("acido-base") ||
    contextoNormalizado.includes("acido base");

  const itemGeral = moduloItem === "geral";

  const itemDoModuloAtual =
    (contextoComplexometria && moduloItem === "complexometria") ||
    (contextoAcidoBase && moduloItem === "acido-base");

  const itemDeOutroModulo =
    !itemGeral &&
    ((contextoComplexometria && moduloItem === "acido-base") ||
      (contextoAcidoBase && moduloItem === "complexometria"));

  if (itemDoModuloAtual) pontuacao += 25;
  if (itemGeral) pontuacao += 10;
  if (itemDeOutroModulo) pontuacao -= 40;

  if (assuntoPergunta && assuntoPergunta === item.assunto) {
    pontuacao += 45;
    evidencia += 30;
  }

  if (intencaoPergunta && intencaoPergunta === item.intencao) {
    pontuacao += 18;
  }

  for (const exemplo of item.perguntasExemplo) {
    if (perguntaCombinaComTermo(pergunta, exemplo)) {
      pontuacao += 18;
      evidencia += 18;
    }
  }

  for (const palavra of item.palavrasChave) {
    if (perguntaCombinaComTermo(pergunta, palavra)) {
      pontuacao += 10;
      evidencia += 10;
    }
  }

  for (const termo of item.termosContexto ?? []) {
    if (contextoNormalizado.includes(normalizarTexto(termo))) {
      pontuacao += 3;
    }
  }

  for (const termo of item.termosEvitar ?? []) {
    if (perguntaNormalizada.includes(normalizarTexto(termo))) {
      pontuacao -= 35;
    }
  }

  if (
    assuntoPergunta &&
    item.assunto &&
    assuntoPergunta !== item.assunto &&
    termosSaoParecidos(removerStopwords(pergunta), removerStopwords(item.topico))
  ) {
    pontuacao -= 20;
  }

  pontuacao += item.prioridade;

  if (evidencia < 8) {
    return -999;
  }

  return pontuacao;
}

function montarResposta(item: ItemConhecimento, pergunta: string) {
  const intencao = detectarIntencao(pergunta);

  if (
    intencao === "conceito" ||
    intencao === "interpretacao" ||
    intencao === "decisao"
  ) {
    return item.respostaCompleta;
  }

  return item.respostaCompleta || item.respostaCurta;
}

function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extrairValorDoContexto(contexto: string, rotulo: string) {
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
  ];

  const proximosRotulos = rotulosConhecidos
    .filter((item) => item !== rotulo)
    .map(escaparRegex)
    .join("|");

  const regex = new RegExp(
    `${escaparRegex(rotulo)}:\\s*([\\s\\S]*?)(?=\\s*[.;]?\\s*(?:${proximosRotulos}):|$)`,
    "i"
  );

  const resultado = contexto.match(regex);

  return resultado?.[1]?.trim().replace(/[.;]$/, "") ?? "";
}

function extrairDadosDaPlataforma(contexto: string) {
  return {
    metalPrincipal: extrairValorDoContexto(contexto, "Metal principal"),
    pH: extrairValorDoContexto(contexto, "pH avaliado"),
    indicador: extrairValorDoContexto(contexto, "Indicador mais compatível"),
    kfEfetivo: extrairValorDoContexto(contexto, "Kf efetivo"),
    status: extrairValorDoContexto(contexto, "Status da titulação"),
    volumeEquivalencia: extrairValorDoContexto(
      contexto,
      "Volume de equivalência"
    ),
  };
}

function montarComplementoComDados(item: ItemConhecimento, contexto: string) {
  const dados = extrairDadosDaPlataforma(contexto);

  if (item.assunto === "indicador" && dados.indicador) {
    return `

Para este sistema, o indicador mais recomendado é ${dados.indicador}.${
      dados.metalPrincipal || dados.pH
        ? ` Essa escolha considera${
            dados.metalPrincipal ? ` o metal principal ${dados.metalPrincipal}` : ""
          }${dados.metalPrincipal && dados.pH ? "," : ""}${
            dados.pH ? ` o pH ${dados.pH}` : ""
          }.`
        : ""
    }`;
  }

  if (item.assunto === "kf_efetivo" && (dados.kfEfetivo || dados.status)) {
    return `

No sistema atual, o Kf efetivo calculado foi ${
      dados.kfEfetivo || "não informado"
    } e o status da titulação foi ${dados.status || "não informado"}.`;
  }

  if (item.assunto === "ponto_equivalencia" && dados.volumeEquivalencia) {
    return `

No sistema atual, o volume de equivalência calculado foi ${dados.volumeEquivalencia}.`;
  }

  return "";
}

export function responderAnalito(
  pergunta: string,
  contexto: string
): ResultadoAnalito {
  const ranking = baseConhecimento
    .map((item) => ({
      item,
      pontuacao: calcularPontuacao(item, pergunta, contexto),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);

  const melhor = ranking[0];

  if (!melhor || melhor.pontuacao < 18) {
    return {
      encontrou: false,
      resposta:
        "Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.",
    };
  }

  const respostaBase = montarResposta(melhor.item, pergunta);
  const complemento = montarComplementoComDados(melhor.item, contexto);

  return {
    encontrou: true,
    id: melhor.item.id,
    modulo: melhor.item.modulo,
    topico: melhor.item.topico,
    assunto: melhor.item.assunto,
    intencao: melhor.item.intencao,
    pontuacao: melhor.pontuacao,
    resposta: `${respostaBase}${complemento}`,
  };
}