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

  // Perguntas contextuais ácido-base
  if (
    p.includes("quantas equivalencias") ||
    p.includes("quantas equivalencia") ||
    p.includes("quantos pontos de equivalencia") ||
    p.includes("numero de equivalencias") ||
    p.includes("numero de equivalencia") ||
    p.includes("tem quantas equivalencias") ||
    p.includes("tem quantas equivalencia") ||
    p.includes("qtd equivalencias") ||
    p.includes("quantidade de equivalencias")
  ) {
    return "numero_equivalencias_contexto";
  }

  if (
    (p.includes("qual") || p.includes("quem") || p.includes("me diga")) &&
    p.includes("titulante")
  ) {
    return "titulante_contexto";
  }

  if (
    (p.includes("qual") || p.includes("quem") || p.includes("me diga")) &&
    p.includes("titulado")
  ) {
    return "titulado_contexto";
  }

  if (
    (p.includes("qual") || p.includes("me diga") || p.includes("valor")) &&
    (p.includes("volume de equivalencia") ||
      p.includes("volume do pe") ||
      p.includes("volume pe"))
  ) {
    return "volume_equivalencia_contexto";
  }

  if (
    p.includes("tipo de sistema") ||
    p.includes("monoprotico ou poliprotico") ||
    p.includes("sistema e de qual tipo") ||
    p.includes("sistema é de qual tipo")
  ) {
    return "tipo_sistema_contexto";
  }

  if (
    p.includes("quais sao os volumes de equivalencia") ||
    p.includes("quais são os volumes de equivalência") ||
    p.includes("quais sao os pes") ||
    p.includes("quais são os pes") ||
    p.includes("me diga os volumes de equivalencia") ||
    p.includes("volumes de equivalencia")
  ) {
    return "volumes_equivalencia_contexto";
  }

  if (
    p.includes("analise o modulo") ||
    p.includes("analisar modulo") ||
    p.includes("analise esse sistema") ||
    p.includes("analisar sistema") ||
    p.includes("faca uma analise do modulo") ||
    p.includes("fazer analise do modulo")
  ) {
    return "analise_modulo_acido_base";
  }

  // Decisões de complexometria antes de conceitos genéricos
  if (
    p.includes("como melhorar esse sistema") ||
    p.includes("melhorar a titulacao") ||
    p.includes("deixar a titulacao mais confiavel") ||
    p.includes("o que posso ajustar") ||
    p.includes("melhorar o resultado")
  ) {
    return "melhorar_sistema";
  }

  if (
    p.includes("devo mudar o ph") ||
    p.includes("mudar o ph") ||
    p.includes("ajustar o ph") ||
    p.includes("alterar o ph") ||
    p.includes("melhor ph")
  ) {
    return "mudar_ph";
  }

  if (
    p.includes("devo usar outro indicador") ||
    p.includes("usar outro indicador") ||
    p.includes("trocar indicador") ||
    p.includes("trocar o indicador") ||
    p.includes("indicador ruim") ||
    p.includes("indicador nao e bom")
  ) {
    return "trocar_indicador";
  }

  if (
    p.includes("o que fazer se o kf efetivo estiver baixo") ||
    p.includes("corrigir kf efetivo baixo") ||
    p.includes("aumentar kf efetivo") ||
    p.includes("melhorar kf efetivo") ||
    p.includes("kf efetivo baixo o que fazer") ||
    p.includes("resolver kf efetivo baixo")
  ) {
    return "kf_baixo_o_que_fazer";
  }

  if (
    p.includes("como reduzir interferencia") ||
    p.includes("reduzir interferencia") ||
    p.includes("diminuir interferente") ||
    p.includes("efeito do interferente") ||
    p.includes("interferente alto") ||
    p.includes("risco alto de interferencia")
  ) {
    return "reduzir_interferencia";
  }

  if (
    p.includes("quando usar mascarante") ||
    p.includes("devo usar mascarante") ||
    p.includes("mascarante e necessario") ||
    p.includes("usar agente mascarante") ||
    p.includes("precisa de mascarante") ||
    p.includes("necessario mascarar")
  ) {
    return "quando_usar_mascarante";
  }

  // Dados contextuais de complexometria
  if (
    (p.includes("qual") || p.includes("me diga") || p.includes("valor")) &&
    p.includes("kf efetivo")
  ) {
    return "kf_efetivo_contexto";
  }

  if (
    (p.includes("qual") || p.includes("me diga") || p.includes("valor")) &&
    (p.includes("ph avaliado") ||
      p.includes("ph do sistema") ||
      p.includes("ph eu usei"))
  ) {
    return "ph_contexto";
  }

  if (
    (p.includes("qual") || p.includes("me diga")) &&
    (p.includes("metal estou titulando") ||
      p.includes("metal principal") ||
      p.includes("metal escolhido") ||
      p.includes("metal selecionado"))
  ) {
    return "metal_contexto";
  }

  if (
    (p.includes("qual") || p.includes("me diga")) &&
    (p.includes("indicador foi recomendado") ||
      p.includes("indicador recomendado") ||
      p.includes("indicador escolhido") ||
      p.includes("indicador selecionado") ||
      p.includes("indicador o sistema escolheu"))
  ) {
    return "indicador_contexto";
  }

  if (
    (p.includes("qual") ||
      p.includes("quais") ||
      p.includes("me diga") ||
      p.includes("tem")) &&
    (p.includes("interferente foi avaliado") ||
      p.includes("interferentes foram avaliados") ||
      p.includes("interferentes avaliados") ||
      p.includes("tem interferente") ||
      p.includes("interferente neste sistema"))
  ) {
    return "interferente_contexto";
  }

  if (
    (p.includes("qual") ||
      p.includes("como") ||
      p.includes("classificacao") ||
      p.includes("classificou")) &&
    (p.includes("status da titulacao") ||
      p.includes("como ficou a titulacao") ||
      p.includes("sistema classificou") ||
      p.includes("classificacao da titulacao"))
  ) {
    return "status_contexto";
  }

  // Interpretações de complexometria
  if (
    p.includes("sistema quantitativo") ||
    p.includes("titulacao quantitativa") ||
    p.includes("resultado quantitativo") ||
    p.includes("bom para titular") ||
    p.includes("da para titular")
  ) {
    return "sistema_quantitativo";
  }

  if (
    p.includes("kf efetivo baixo") ||
    p.includes("kf efetivo ficou baixo") ||
    p.includes("constante efetiva baixa") ||
    p.includes("sistema nao quantitativo") ||
    p.includes("complexo pouco favorecido")
  ) {
    return "kf_efetivo_baixo";
  }

  if (
    p.includes("ph adequado") ||
    p.includes("ph esta adequado") ||
    p.includes("ph bom") ||
    p.includes("por que o ph importa") ||
    p.includes("importancia do ph")
  ) {
    return "ph_adequado";
  }

  if (
    p.includes("indicador confiavel") ||
    p.includes("indicador recomendado") ||
    p.includes("esse indicador e bom") ||
    p.includes("posso confiar no indicador") ||
    p.includes("indicador sugerido")
  ) {
    return "indicador_confiavel";
  }

  if (
    p.includes("interferente atrapalha") ||
    p.includes("interferente interfere") ||
    p.includes("risco de interferencia") ||
    p.includes("por que aparece risco") ||
    p.includes("competicao com edta")
  ) {
    return "interferente_atrapalha";
  }

  if (
    p.includes("titulacao parcial") ||
    p.includes("parcialmente quantitativo") ||
    p.includes("resultado parcial")
  ) {
    return "titulacao_parcial";
  }

  if (
    p.includes("titulacao ruim") ||
    p.includes("sistema ruim") ||
    p.includes("nao serve para titular") ||
    p.includes("titulacao inviavel") ||
    p.includes("complexacao insuficiente")
  ) {
    return "titulacao_ruim";
  }
  
  if (
    p.includes("curva complexometrica") ||
    p.includes("curva com edta") ||
    p.includes("curva de pm") ||
    p.includes("grafico pm") ||
    p.includes("interpretar curva complexometrica")
  ) {
    return "curva_complexometrica";
  }

  // Conceitos ácido-base
  if (
    p.includes("titulacao acido-base") ||
    p.includes("titulacao acido base") ||
    p.includes("titulacao de neutralizacao") ||
    p.includes("neutralizacao acido-base") ||
    p.includes("neutralizacao acido base")
  ) {
    return "titulacao_acido_base";
  }

  if (
    p.includes("o que e ph") ||
    p.includes("oque e ph") ||
    p.includes("significa ph") ||
    p.includes("potencial hidrogenionico") ||
    p.includes("concentracao de h")
  ) {
    return "ph";
  }

  if (
    palavras.includes("pka") ||
    p.includes("menos log de ka") ||
    p.includes("relacao entre pka e ka")
  ) {
    return "pka";
  }

  if (
    palavras.includes("ka") ||
    p.includes("constante de acidez") ||
    p.includes("constante acida") ||
    p.includes("dissociacao acida")
  ) {
    return "ka";
  }

  if (
    p.includes("acido forte") ||
    p.includes("ioniza completamente") ||
    p.includes("dissociacao completa")
  ) {
    return "acido_forte";
  }

  if (
    p.includes("acido fraco") ||
    p.includes("ioniza parcialmente") ||
    p.includes("dissociacao parcial") ||
    p.includes("ka pequeno")
  ) {
    return "acido_fraco";
  }

  if (
    p.includes("base forte") ||
    p.includes("hidroxido forte") ||
    p.includes("libera oh") ||
    p.includes("base totalmente dissociada")
  ) {
    return "base_forte";
  }

  if (
    p.includes("base fraca") ||
    p.includes("kb") ||
    p.includes("equilibrio da base") ||
    p.includes("amonia base fraca")
  ) {
    return "base_fraca";
  }

  if (
    p.includes("ponto de equivalencia acido-base") ||
    p.includes("ponto de equivalencia acido base") ||
    p.includes("pe acido-base") ||
    p.includes("pe acido base") ||
    p.includes("equivalencia acido-base") ||
    p.includes("neutralizacao estequiometrica")
  ) {
    return "ponto_equivalencia_acido_base";
  }

  if (
    p.includes("indicador acido-base") ||
    p.includes("indicador acido base") ||
    p.includes("indicador de ph") ||
    p.includes("faixa de viragem") ||
    p.includes("viragem acido-base")
  ) {
    return "indicador_acido_base";
  }

  if (
    p.includes("curva de ph") ||
    p.includes("curva acido-base") ||
    p.includes("curva acido base") ||
    p.includes("grafico de ph") ||
    p.includes("curva de titulacao acido-base")
  ) {
    return "curva_ph";
  }

  if (
    p.includes("monoprotico") ||
    p.includes("acido monoprotico") ||
    p.includes("uma equivalencia") ||
    p.includes("um proton")
  ) {
    return "monoprotico";
  }

  if (
    p.includes("poliprotico") ||
    p.includes("acido poliprotico") ||
    p.includes("mais de uma equivalencia") ||
    p.includes("multiplas equivalencias") ||
    p.includes("varios protons")
  ) {
    return "poliprotico";
  }
  // Interpretações ácido-base
if (
  p.includes("ph no ponto de equivalencia") ||
  p.includes("ph no pe") ||
  p.includes("pe nao ficou em ph 7") ||
  p.includes("pe não ficou em ph 7") ||
  p.includes("ponto de equivalencia nao e 7") ||
  p.includes("ponto de equivalencia não é 7") ||
  p.includes("ph da equivalencia") ||
  p.includes("sempre e 7") ||
  p.includes("sempre é 7")
) {
  return "ph_pe_interpretacao";
}

if (
  p.includes("regiao tampao") ||
  p.includes("região tampão") ||
  p.includes("zona tampao") ||
  p.includes("zona tampão") ||
  p.includes("tamponamento") ||
  p.includes("curva com tampao") ||
  p.includes("curva com tampão")
) {
  return "regiao_tampao";
}

if (
  p.includes("acido fraco com base forte") ||
  p.includes("ácido fraco com base forte") ||
  p.includes("acido fraco titulado com base forte") ||
  p.includes("pe basico") ||
  p.includes("pe básico") ||
  p.includes("ponto de equivalencia acima de 7") ||
  p.includes("ponto de equivalência acima de 7") ||
  p.includes("equivalencia basica") ||
  p.includes("equivalência básica")
) {
  return "acido_fraco_base_forte";
}

if (
  p.includes("base fraca com acido forte") ||
  p.includes("base fraca com ácido forte") ||
  p.includes("base fraca titulada com acido forte") ||
  p.includes("base fraca titulada com ácido forte") ||
  p.includes("pe acido") ||
  p.includes("pe ácido") ||
  p.includes("ponto de equivalencia abaixo de 7") ||
  p.includes("ponto de equivalência abaixo de 7") ||
  p.includes("equivalencia acida") ||
  p.includes("equivalência ácida")
) {
  return "base_fraca_acido_forte";
}

if (
  p.includes("como escolher indicador acido-base") ||
  p.includes("como escolher indicador ácido-base") ||
  p.includes("qual indicador acido-base devo usar") ||
  p.includes("qual indicador ácido-base devo usar") ||
  p.includes("indicador deve virar") ||
  p.includes("faixa de viragem do indicador") ||
  p.includes("indicador adequado") ||
  p.includes("indicador correto") ||
  p.includes("escolha do indicador")
) {
  return "indicador_escolha_acido_base";
}

if (
  p.includes("mais de um ponto de equivalencia") ||
  p.includes("mais de um ponto de equivalência") ||
  p.includes("por que tem pe1 e pe2") ||
  p.includes("pe1 e pe2") ||
  p.includes("multiplas equivalencias") ||
  p.includes("múltiplas equivalências") ||
  p.includes("varios pontos de equivalencia") ||
  p.includes("vários pontos de equivalência") ||
  p.includes("mais de uma equivalencia") ||
  p.includes("mais de uma equivalência")
) {
  return "multiplas_equivalencias";
}

  // Conceitos gerais
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

  // Conceitos essenciais de complexometria
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

function criarVariantesRotulo(rotulo: string) {
  const semAcento = normalizarTexto(rotulo)
    .replace(/\s+/g, " ")
    .trim();

  return Array.from(new Set([rotulo, semAcento]));
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

  const variantesRotuloAtual = criarVariantesRotulo(rotulo);

  const rotuloAtualNormalizado = new Set(
    variantesRotuloAtual.map((item) => normalizarTexto(item))
  );

  const alvo = variantesRotuloAtual.map(escaparRegex).join("|");

  const proximosRotulos = rotulosConhecidos
    .flatMap(criarVariantesRotulo)
    .filter((item) => !rotuloAtualNormalizado.has(normalizarTexto(item)))
    .map(escaparRegex)
    .join("|");

  const regex = new RegExp(
    `(?:${alvo}):\\s*([\\s\\S]*?)(?=\\s*[.;]?\\s*(?:${proximosRotulos}):|$)`,
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

  if (item.assunto === "titulante_contexto") {
    const titulante = extrairValorDoContexto(contexto, "Titulante");
    const titulado = extrairValorDoContexto(contexto, "Titulado");
    const tipo = extrairValorDoContexto(contexto, "Tipo de titulação");

    if (titulante) {
      return `\n\nNeste sistema, o titulante é ${titulante}.${titulado ? ` Ele está reagindo com o titulado ${titulado}.` : ""}${tipo ? ` Tipo de titulação: ${tipo}.` : ""}`;
    }
  }

  if (item.assunto === "titulado_contexto") {
    const titulado = extrairValorDoContexto(contexto, "Titulado");
    const titulante = extrairValorDoContexto(contexto, "Titulante");
    const tipo = extrairValorDoContexto(contexto, "Tipo de titulação");

    if (titulado) {
      return `\n\nNeste sistema, o titulado é ${titulado}.${titulante ? ` Ele está sendo titulado com ${titulante}.` : ""}${tipo ? ` Tipo de titulação: ${tipo}.` : ""}`;
    }
  }

  if (item.assunto === "volume_equivalencia_contexto") {
    const volume = extrairValorDoContexto(contexto, "Volume de equivalência");
    const volumes = extrairValorDoContexto(contexto, "Volumes de equivalência");
    const titulante = extrairValorDoContexto(contexto, "Titulante");

    if (volume) {
      return `\n\nNeste sistema, o volume de equivalência é ${volume}.${titulante ? ` Esse volume se refere ao titulante ${titulante}.` : ""}`;
    }

    if (volumes) {
      return `\n\nNeste sistema, os volumes de equivalência são: ${volumes}.`;
    }
  }

  if (item.assunto === "numero_equivalencias_contexto") {
    const numero = extrairValorDoContexto(contexto, "Número de equivalências");
    const volumes = extrairValorDoContexto(contexto, "Volumes de equivalência");
    const tipoSistema = extrairValorDoContexto(contexto, "Tipo de sistema");

    if (numero) {
      return `\n\nNeste sistema, o número de equivalências é ${numero}.${tipoSistema ? ` Tipo de sistema: ${tipoSistema}.` : ""}${volumes ? ` Volumes de equivalência: ${volumes}.` : ""}`;
    }
  }

  if (item.assunto === "tipo_sistema_contexto") {
    const tipoSistema = extrairValorDoContexto(contexto, "Tipo de sistema");
    const numero = extrairValorDoContexto(contexto, "Número de equivalências");
    const volumes = extrairValorDoContexto(contexto, "Volumes de equivalência");

    if (tipoSistema) {
      return `\n\nNeste cálculo, o tipo de sistema é ${tipoSistema}.${numero ? ` Número de equivalências: ${numero}.` : ""}${volumes ? ` Volumes de equivalência: ${volumes}.` : ""}`;
    }
  }

  if (item.assunto === "volumes_equivalencia_contexto") {
    const volumes = extrairValorDoContexto(contexto, "Volumes de equivalência");
    const numero = extrairValorDoContexto(contexto, "Número de equivalências");
    const tipoSistema = extrairValorDoContexto(contexto, "Tipo de sistema");

    if (volumes) {
      return `\n\nNeste sistema, os volumes de equivalência são: ${volumes}.${numero ? ` Número de equivalências: ${numero}.` : ""}${tipoSistema ? ` Tipo de sistema: ${tipoSistema}.` : ""}`;
    }
  }
  if (item.assunto === "kf_efetivo_contexto") {
    const kfEfetivo = extrairValorDoContexto(contexto, "Kf efetivo");
    const metal = extrairValorDoContexto(contexto, "Metal principal");
    const ph = extrairValorDoContexto(contexto, "pH avaliado");
    const status = extrairValorDoContexto(contexto, "Status da titulação");

    if (kfEfetivo) {
      return `\n\nPara este sistema, o Kf efetivo calculado é ${kfEfetivo}.${metal ? ` O metal principal é ${metal}.` : ""}${ph ? ` O pH avaliado foi ${ph}.` : ""}${status ? ` O status da titulação foi ${status}.` : ""}`;
    }
  }

  if (item.assunto === "ph_contexto") {
    const ph = extrairValorDoContexto(contexto, "pH avaliado");
    const alfaEdta = extrairValorDoContexto(contexto, "α(Y⁴⁻)");
    const kfCondicional = extrairValorDoContexto(contexto, "Kf condicional");
    const kfEfetivo = extrairValorDoContexto(contexto, "Kf efetivo");

    if (ph) {
      return `\n\nPara este sistema, o pH avaliado foi ${ph}.${alfaEdta ? ` Nesse pH, α(Y⁴⁻) = ${alfaEdta}.` : ""}${kfCondicional ? ` O Kf condicional é ${kfCondicional}.` : ""}${kfEfetivo ? ` O Kf efetivo é ${kfEfetivo}.` : ""}`;
    }
  }

  if (item.assunto === "metal_contexto") {
    const metal = extrairValorDoContexto(contexto, "Metal principal");
    const complexo = extrairValorDoContexto(contexto, "Complexo formado");
    const indicador = extrairValorDoContexto(contexto, "Indicador mais compatível");

    if (metal) {
      return `\n\nNeste sistema, o metal principal titulado é ${metal}.${complexo ? ` O complexo formado é ${complexo}.` : ""}${indicador ? ` O indicador mais compatível indicado foi ${indicador}.` : ""}`;
    }
  }

  if (item.assunto === "indicador_contexto") {
    const indicador = extrairValorDoContexto(contexto, "Indicador mais compatível");
    const metal = extrairValorDoContexto(contexto, "Metal principal");
    const ph = extrairValorDoContexto(contexto, "pH avaliado");

    if (indicador) {
      return `\n\nPara este sistema, o indicador recomendado foi ${indicador}.${metal ? ` Essa escolha considera o metal principal ${metal}.` : ""}${ph ? ` O pH avaliado foi ${ph}.` : ""}`;
    }
  }

  if (item.assunto === "interferente_contexto") {
    const interferentes = extrairValorDoContexto(contexto, "Interferentes avaliados");
    const metal = extrairValorDoContexto(contexto, "Metal principal");

    if (interferentes) {
      return `\n\nNeste sistema, os interferentes avaliados foram: ${interferentes}.${metal ? ` A avaliação considera o metal principal ${metal}.` : ""}`;
    }
  }

  if (item.assunto === "status_contexto") {
    const status = extrairValorDoContexto(contexto, "Status da titulação");
    const mensagem = extrairValorDoContexto(contexto, "Mensagem do sistema");
    const kfEfetivo = extrairValorDoContexto(contexto, "Kf efetivo");

    if (status) {
      return `\n\nPara este sistema, o status da titulação foi ${status}.${mensagem ? ` Mensagem do sistema: ${mensagem}.` : ""}${kfEfetivo ? ` O Kf efetivo calculado foi ${kfEfetivo}.` : ""}`;
    }
  }

  if (item.assunto === "sistema_quantitativo") {
    const kfEfetivo = extrairValorDoContexto(contexto, "Kf efetivo");
    const status = extrairValorDoContexto(contexto, "Status da titulação");
    const mensagem = extrairValorDoContexto(contexto, "Mensagem do sistema");
    const resumo = extrairValorDoContexto(contexto, "Resumo químico");
  
    const statusNormalizado = normalizarTexto(status);
  
    if (
      statusNormalizado.includes("ruim") ||
      statusNormalizado.includes("nao quantit") ||
      statusNormalizado.includes("inviavel")
    ) {
      return `\n\nNeste sistema, a titulação não deve ser interpretada como quantitativa.${status ? ` Status calculado: ${status}.` : ""}${kfEfetivo ? ` Kf efetivo: ${kfEfetivo}.` : ""}${mensagem ? ` Mensagem do sistema: ${mensagem}.` : ""}${resumo ? ` Resumo químico: ${resumo}.` : ""}`;
    }
  
    if (
      statusNormalizado.includes("parcial") ||
      statusNormalizado.includes("intermedi")
    ) {
      return `\n\nNeste sistema, a titulação deve ser interpretada como parcialmente quantitativa, não como totalmente quantitativa.${status ? ` Status calculado: ${status}.` : ""}${kfEfetivo ? ` Kf efetivo: ${kfEfetivo}.` : ""}${mensagem ? ` Mensagem do sistema: ${mensagem}.` : ""}${resumo ? ` Resumo químico: ${resumo}.` : ""}`;
    }
  
    if (statusNormalizado.includes("quantit")) {
      return `\n\nNeste sistema, a titulação foi classificada como quantitativa.${status ? ` Status calculado: ${status}.` : ""}${kfEfetivo ? ` Kf efetivo: ${kfEfetivo}.` : ""}${mensagem ? ` Mensagem do sistema: ${mensagem}.` : ""}`;
    }
  
    if (kfEfetivo || mensagem || resumo) {
      return `\n\nPara este sistema específico, a avaliação deve considerar os dados calculados.${kfEfetivo ? ` Kf efetivo: ${kfEfetivo}.` : ""}${mensagem ? ` Mensagem do sistema: ${mensagem}.` : ""}${resumo ? ` Resumo químico: ${resumo}.` : ""}`;
    }
  }

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
  const perguntaNormalizada = normalizarTexto(pergunta);
  const contextoNormalizadoDireto = normalizarTexto(contexto);

  if (
    perguntaNormalizada.includes("quantas equivalencias") ||
    perguntaNormalizada.includes("quantas equivalencia") ||
    perguntaNormalizada.includes("numero de equivalencias") ||
    perguntaNormalizada.includes("numero de equivalencia") ||
    perguntaNormalizada.includes("quantos pontos de equivalencia")
  ) {
    const item = baseConhecimento.find(
      (registro) => registro.assunto === "numero_equivalencias_contexto"
    );

    const numero =
      contextoNormalizadoDireto.match(/numero de equivalencias:\s*([^.;\n]+)/)
        ?.[1] ??
      contextoNormalizadoDireto.match(/numero de equivalencia:\s*([^.;\n]+)/)
        ?.[1] ??
      "";

      const tipoSistema =
      contextoNormalizadoDireto.match(/tipo de sistema:\s*([^.;\n]+)/)?.[1] ?? "";
    
    const volumes =
      contextoNormalizadoDireto.match(/volumes de equivalencia:\s*([^.\n]+)/)?.[1] ??
      "";

    return {
      encontrou: true,
      id: item?.id ?? "acido_base_numero_equivalencias_contexto",
      modulo: item?.modulo ?? "acido-base",
      topico: item?.topico ?? "Número de equivalências",
      assunto: "numero_equivalencias_contexto",
      intencao: item?.intencao ?? "interpretacao",
      pontuacao: 999,
      resposta: `${
        item?.respostaCompleta ??
        "O número de equivalências indica quantos pontos estequiométricos principais aparecem no sistema."
      }${
        numero
          ? `\n\nNeste sistema, o número de equivalências é ${numero.trim()}.${
              tipoSistema ? ` Tipo de sistema: ${tipoSistema}.` : ""
            }${volumes ? ` Volumes de equivalência: ${volumes}.` : ""}`
          : "\n\nNão encontrei o valor numérico de equivalências no contexto atual."
      }`,
    };
  }

  const assuntoPergunta = detectarAssunto(pergunta);

if (assuntoPergunta) {
  const itemDireto = baseConhecimento.find(
    (item) => item.assunto === assuntoPergunta
  );

  if (itemDireto) {
    const respostaBase = montarResposta(itemDireto, pergunta);
    const complemento = montarComplementoComDados(itemDireto, contexto);

    return {
      encontrou: true,
      id: itemDireto.id,
      modulo: itemDireto.modulo,
      topico: itemDireto.topico,
      assunto: itemDireto.assunto,
      intencao: itemDireto.intencao,
      pontuacao: 999,
      resposta: `${respostaBase}${complemento}`,
    };
  }
}

const contextoNormalizado = normalizarTexto(contexto);

  const contextoComplexometria =
    contextoNormalizado.includes("complexometria") ||
    contextoNormalizado.includes("edta");

  const contextoAcidoBase =
    contextoNormalizado.includes("acido-base") ||
    contextoNormalizado.includes("acido base") ||
    contextoNormalizado.includes("titulacoes acido-base") ||
    contextoNormalizado.includes("titulacoes acido base");

  const candidatos = baseConhecimento.filter((item) => {
    if (assuntoPergunta) {
      return (
        item.assunto === assuntoPergunta ||
        item.modulo === "geral" ||
        (contextoComplexometria && item.modulo === "complexometria") ||
        (contextoAcidoBase && item.modulo === "acido-base")
      );
    }

    return (
      item.modulo === "geral" ||
      (contextoComplexometria && item.modulo === "complexometria") ||
      (contextoAcidoBase && item.modulo === "acido-base")
    );
  });

  const ranking = candidatos
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