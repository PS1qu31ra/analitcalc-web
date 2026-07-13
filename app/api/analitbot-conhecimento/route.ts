import { responderAnalito } from "../../../lib/analito/motorAnalito";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const pergunta = String(body.pergunta ?? "").trim();
    const contexto = String(body.contexto ?? "").trim();

    if (!pergunta) {
      return Response.json(
        {
          encontrou: false,
          resposta: "Digite uma pergunta para o Analito.",
        },
        { status: 400 }
      );
    }

    const resposta = responderAnalito(pergunta, contexto);

    return Response.json(resposta);
  } catch (erro) {
    return Response.json(
      {
        encontrou: false,
        resposta:
          erro instanceof Error
            ? `Erro ao consultar o Analito: ${erro.message}`
            : "Erro inesperado ao consultar o Analito.",
      },
      { status: 500 }
    );
  }
}