import { baseConhecimento } from "./baseConhecimento";
import type { LinhaConhecimento, ResultadoAnalito } from "./tipos";
import {
  normalizarTexto,
  perguntaCombinaComTermo,
  removerStopwords,
  termosSaoParecidos,
} from "./normalizacao";

function detectarIntencao(pergunta: string) {
  const p = normalizarTexto(pergunta);

  if (
    p.includes("o que e") ||
    p.includes("oque e") ||
    p.includes("significa") ||
    p.includes("defina") ||
    p.includes("conceito") ||
    p.includes("seria")
  ) {
    return "conceito";
  }

  if (
    p.includes("por que") ||
    p.includes("pq") ||
    p.includes("porque") ||
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
    p.includes("melhor indicador") ||
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
    p.includes("regiao")
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

  if (
    perguntaCombinaComTermo(pergunta, "titulação") ||
    perguntaCombinaComTermo(pergunta, "titulacao") ||
    perguntaCombinaComTermo(pergunta, "análise volumétrica")
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

  if (p.includes("ponto final")) {
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
    p.includes("regiao")
  ) {
    return "curva";
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
    p.includes("agente complexante edta") ||
    p.includes("quelante edta") ||
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
    p.includes("interferente") ||
    p.includes("interferencia") ||
    p.includes("atrapalha")
  ) {
    return "interferente";
  }

  if (
    p.includes("mascarante") ||
    p.includes("mascaramento")
  ) {
    return "mascarante";
  }

  if (
    p.includes("concentracao") ||
    p.includes("molaridade") ||
    p.includes("mol/l")
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
  const assuntoLinha = normalizarTexto(linha.assunto ?? "");

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
    ((contextoEhComplexometria && moduloLinha.includes("acido")) ||
      (contextoEhAcidoBase && moduloLinha.includes("complexometria")));

  if (linhaEhDoModuloAtual) pontuacao += 25;
  if (linhaEhGeral) pontuacao += 12;
  if (linhaEhDeOutroModulo) pontuacao -= 35;

  if (intencaoLinha && intencaoLinha === intencaoPergunta) {
    pontuacao += 16;
  }

  if (assuntoPergunta && assuntoLinha && assuntoPergunta === assuntoLinha) {
    pontuacao += 35;
    evidenciaPergunta += 25;
  }

  if (
    topicoLinha &&
    perguntaCombinaComTermo(pergunta, linha.topico)
  ) {
    pontuacao += 12;
    evidenciaPergunta += 12;
  }

  if (
    linha.perguntaBase &&
    perguntaCombinaComTermo(pergunta, linha.perguntaBase)
  ) {
    pontuacao += 15;
    evidenciaPergunta += 15;
  }

  for (const palavra of linha.palavrasChave) {
    if (perguntaCombinaComTermo(pergunta, palavra)) {
      pontuacao += 8;
      evidenciaPergunta += 8;
    }
  }

  for (const termo of linha.termosContexto) {
    if (contextoNormalizado.includes(normalizarTexto(termo))) {
      pontuacao += 3;
    }
  }

  for (const termo of linha.quandoUsar) {
    if (perguntaCombinaComTermo(pergunta, termo)) {
      pontuacao += 4;
      evidenciaPergunta += 4;
    }
  }

  for (const termo of linha.quandoNaoUsar) {
    if (
      perguntaNormalizada.includes(normalizarTexto(termo)) ||
      contextoNormalizado.includes(normalizarTexto(termo))
    ) {
      pontuacao -= 25;
    }
  }

  if (assuntoPergunta && assuntoLinha && assuntoPergunta !== assuntoLinha) {
    if (
      termosSaoParecidos(
        removerStopwords(pergunta),
        removerStopwords(linha.topico)
      )
    ) {
      pontuacao -= 15;
    }
  }

  pontuacao += linha.prioridade;

  if (evidenciaPergunta < 8) {
    return -999;
  }

  return pontuacao;
}

function montarResposta(linha: LinhaConhecimento, pergunta: string) {
  const intencao = detectarIntencao(pergunta);

  if (intencao === "conceito" && linha.respostaCompleta) {
    return linha.respostaCompleta;
  }

  if (intencao === "interpretacao" && linha.respostaCompleta) {
    return linha.respostaCompleta;
  }

  return linha.respostaCompleta || linha.respostaCurta;
}

function extrairValorDoContexto(contexto: string, rotulo: string) {
  const regex = new RegExp(`${rotulo}:\\s*([^\\n]+)`, "i");
  const resultado = contexto.match(regex);

  return resultado?.[1]?.trim().replace(/\.$/, "") ?? "";
}

function extrairDadosDaPlataforma(contexto: string) {
  return {
    metalPrincipal: extrairValorDoContexto(contexto, "Metal principal"),
    complexoFormado: extrairValorDoContexto(contexto, "Complexo formado"),
    pH: extrairValorDoContexto(contexto, "pH avaliado"),
    volumeEquivalencia: extrairValorDoContexto(
      contexto,
      "Volume de equivalência"
    ),
    alfaEDTA: extrairValorDoContexto(contexto, "α\\(Y⁴⁻\\)"),
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
  const assunto = linha.assunto ?? "";
  const intencao = detectarIntencao(pergunta);

  if (assunto === "indicador" || intencao === "indicador") {
    if (dados.indicador) {
      return `

Para este sistema, o indicador mais recomendado é ${dados.indicador}.${
        dados.metalPrincipal || dados.pH
          ? ` Essa escolha considera${
              dados.metalPrincipal
                ? ` o metal principal ${dados.metalPrincipal}`
                : ""
            }${dados.metalPrincipal && dados.pH ? "," : ""}${
              dados.pH ? ` o pH ${dados.pH}` : ""
            } e a compatibilidade calculada para a titulação.`
          : ""
      }`;
    }
  }

  if (assunto === "kf" || pergunta.toLowerCase().includes("quantitativo")) {
    if (dados.kfEfetivo || dados.status) {
      return `

No sistema atual, o Kf efetivo calculado foi ${
        dados.kfEfetivo || "não informado"
      } e o status da titulação foi ${dados.status || "não informado"}.`;
    }
  }

  if (assunto === "ph") {
    if (dados.pH || dados.alfaEDTA || dados.kfEfetivo) {
      return `

No sistema atual, o pH avaliado foi ${
        dados.pH || "não informado"
      }. A fração ativa do EDTA, α(Y⁴⁻), foi ${
        dados.alfaEDTA || "não informada"
      }, e o Kf efetivo foi ${dados.kfEfetivo || "não informado"}.`;
    }
  }

  if (assunto === "ponto_equivalencia") {
    if (dados.volumeEquivalencia) {
      return `

No sistema atual, o volume de equivalência calculado foi ${dados.volumeEquivalencia}.`;
    }
  }

  if (assunto === "metal_principal") {
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

export function responderAnalito(
  pergunta: string,
  contexto: string
): ResultadoAnalito {
  const ranking = baseConhecimento
    .map((linha) => ({
      linha,
      pontuacao: calcularPontuacao(linha, pergunta, contexto),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);

  const melhorLinha = ranking[0];

  if (!melhorLinha || melhorLinha.pontuacao < 18) {
    return {
      encontrou: false,
      resposta:
        "Ainda não encontrei uma resposta específica na base do Analito para essa pergunta.",
    };
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

  const resposta =
    devePriorizarDados && complementoDados
      ? `${complementoDados.trim()}\n\n${respostaBase}`
      : `${respostaBase}${complementoDados}`;

  return {
    encontrou: true,
    modulo: melhorLinha.linha.modulo,
    topico: melhorLinha.linha.topico,
    intencao: melhorLinha.linha.intencao,
    assunto: melhorLinha.linha.assunto,
    pontuacao: melhorLinha.pontuacao,
    resposta,
  };
}