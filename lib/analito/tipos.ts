export type ModuloAnalito =
  | "geral"
  | "complexometria"
  | "acido-base"
  | "precipitacao"
  | "oxirreducao"
  | "gravimetria";

export type IntencaoAnalito =
  | "conceito"
  | "interpretacao"
  | "decisao"
  | "comparacao"
  | "calculo"
  | "erro"
  | "limitacao"
  | "boas_praticas";

export type ItemConhecimento = {
  id: string;
  modulo: ModuloAnalito;
  topico: string;
  assunto: string;
  intencao: IntencaoAnalito;
  perguntasExemplo: string[];
  palavrasChave: string[];
  termosContexto?: string[];
  termosEvitar?: string[];
  respostaCurta: string;
  respostaCompleta: string;
  prioridade: number;
};

export type ResultadoAnalito = {
  encontrou: boolean;
  id?: string;
  modulo?: string;
  topico?: string;
  assunto?: string;
  intencao?: string;
  pontuacao?: number;
  resposta: string;
};