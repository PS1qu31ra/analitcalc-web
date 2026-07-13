export type LinhaConhecimento = {
    modulo: string;
    topico: string;
    intencao: string;
    assunto?: string;
    palavrasChave: string[];
    termosContexto: string[];
    perguntaBase: string;
    respostaCurta: string;
    respostaCompleta: string;
    quandoUsar: string[];
    quandoNaoUsar: string[];
    prioridade: number;
  };
  
  export type ResultadoAnalito = {
    encontrou: boolean;
    modulo?: string;
    topico?: string;
    intencao?: string;
    assunto?: string;
    resposta: string;
    pontuacao?: number;
  };