export type TipoEstudoPrecipitacao =
  | "equilibrio"
  | "titulacaoDireta"
  | "titulacaoRetorno"
  | "seletividade";

export type AbaPrecipitacao =
  | "sistema"
  | "equilibrio"
  | "curva"
  | "metodo"
  | "interferencias"
  | "resultados";

export type IonPrecipitacao = {
  id: string;
  nome: string;
  formula: string;
  formulaExibicao: string;
  carga: number;
};

export type SalPrecipitacao = {
  id: string;
  nome: string;
  formula: string;
  formulaExibicao: string;

  cation: IonPrecipitacao;
  anion: IonPrecipitacao;

  coeficienteCation: number;
  coeficienteAnion: number;

  kps: number;
  pKps: number;

  corPrecipitado: string;
  observacao?: string;

  usos: TipoEstudoPrecipitacao[];
};

export type ResultadoEquilibrioPrecipitacao = {
  sal: SalPrecipitacao;

  solubilidadeMolar: number;

  concentracaoCationEquilibrio: number;
  concentracaoAnionEquilibrio: number;

  pCation: number;
  pAnion: number;

  expressaoKps: string;
  expressaoSolubilidade: string;

  mensagem: string;
};

export type EspecieAnalitoPrecipitacao = "cation" | "anion";

export type EntradaTitulacaoDiretaPrecipitacao = {
  sal: SalPrecipitacao;
  especieAnalito: EspecieAnalitoPrecipitacao;
  concentracaoAnalito: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximoBureta: number;
};

export type ResultadoTitulacaoDiretaPrecipitacao = {
  sal: SalPrecipitacao;
  especieAnalito: EspecieAnalitoPrecipitacao;

  especieTitulante: EspecieAnalitoPrecipitacao;

  concentracaoAnalito: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximoBureta: number;

  molAnalito: number;
  molTitulantePE: number;

  volumePE: number;

  coeficienteAnalito: number;
  coeficienteTitulante: number;

  relacaoEstequiometrica: string;

  status: "adequado" | "fora_da_bureta" | "dados_invalidos";
  mensagem: string;
};

export type RegiaoCurvaPrecipitacao =
  | "Antes do PE"
  | "No PE"
  | "Após o PE"
  | "Dados inválidos";

export type PontoCurvaTitulacaoDiretaPrecipitacao = {
  volumeAdicionado: number;
  volumeTotal: number;

  regiao: RegiaoCurvaPrecipitacao;

  concentracaoAnalitoLivre: number;
  concentracaoTitulanteLivre: number;

  concentracaoEspecieMonitorada: number;
  pEspecieMonitorada: number;

  percentualPrecipitado: number;
};

export type CurvaTitulacaoDiretaPrecipitacao = {
  pontos: PontoCurvaTitulacaoDiretaPrecipitacao[];
  volumePE: number;
  volumeMaximo: number;
  passo: number;
  especieMonitorada: EspecieAnalitoPrecipitacao;
};

export type MetodoPrecipitacaoId =
  | "mohr"
  | "volhard"
  | "fajans"
  | "potenciometrico";

export type StatusMetodoPrecipitacao =
  | "recomendado"
  | "possivel"
  | "nao_recomendado";

export type MetodoPrecipitacao = {
  id: MetodoPrecipitacaoId;
  nome: string;
  principio: string;
  status: StatusMetodoPrecipitacao;
  justificativa: string;
};

export type RiscoInterferenciaPrecipitacao =
  | "alto"
  | "moderado"
  | "baixo";

export type InterferenciaPrecipitacao = {
  salInterferente: SalPrecipitacao;
  especieConcorrente: IonPrecipitacao;
  risco: RiscoInterferenciaPrecipitacao;
  motivo: string;
  razaoKps: number;
};