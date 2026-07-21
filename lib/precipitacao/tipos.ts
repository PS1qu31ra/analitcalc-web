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
  | "Fora da curva"
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

export type EntradaTitulacaoRetornoPrecipitacao = {
  salPrincipal: SalPrecipitacao;

  especieAnalito: EspecieAnalitoPrecipitacao;

  volumeAmostra: number;

  concentracaoPrecipitanteExcesso: number;
  volumePrecipitanteExcesso: number;

  concentracaoTitulanteRetorno: number;
  volumeTitulanteRetorno: number;

  volumeMaximoBuretaRetorno: number;
};

export type ResultadoTitulacaoRetornoPrecipitacao = {
  salPrincipal: SalPrecipitacao;

  especieAnalito: EspecieAnalitoPrecipitacao;
  especiePrecipitante: EspecieAnalitoPrecipitacao;

  volumeAmostra: number;

  concentracaoPrecipitanteExcesso: number;
  volumePrecipitanteExcesso: number;

  concentracaoTitulanteRetorno: number;
  volumeTitulanteRetorno: number;

  molPrecipitanteAdicionado: number;
  molPrecipitanteEmExcesso: number;
  molPrecipitanteConsumidoPeloAnalito: number;

  molAnalito: number;
  concentracaoAnalito: number;

  relacaoPrincipal: string;
  relacaoRetorno: string;

  status:
    | "adequado"
    | "excesso_insuficiente"
    | "fora_da_bureta"
    | "dados_invalidos";

  mensagem: string;
};

export type IonMisturaSeletividadePrecipitacao = {
  sal: SalPrecipitacao;
  especieAnalito: EspecieAnalitoPrecipitacao;
  concentracaoAnalito: number;
};

export type EntradaSeletividadePrecipitacao = {
  especieTitulante: EspecieAnalitoPrecipitacao;
  itens: IonMisturaSeletividadePrecipitacao[];
};

export type ResultadoItemSeletividadePrecipitacao = {
  sal: SalPrecipitacao;
  especieAnalito: EspecieAnalitoPrecipitacao;
  concentracaoAnalito: number;

  especieTitulante: EspecieAnalitoPrecipitacao;
  concentracaoTitulanteInicioPrecipitacao: number;
  pTitulanteInicioPrecipitacao: number;

  ordemPrecipitacao: number;

  criterio: string;
  interpretacao: string;
};

export type ResultadoSeletividadePrecipitacao = {
  especieTitulante: EspecieAnalitoPrecipitacao;
  itens: ResultadoItemSeletividadePrecipitacao[];

  status: "adequado" | "dados_invalidos" | "mistura_insuficiente";

  mensagem: string;
};

export type RegiaoCurvaTitulacaoRetornoPrecipitacao =
  | "Antes do retorno"
  | "No ponto final do retorno"
  | "Após o retorno"
  | "Dados inválidos";

export type PontoCurvaTitulacaoRetornoPrecipitacao = {
  volumeAdicionado: number;
  volumeTotal: number;
  regiao: RegiaoCurvaTitulacaoRetornoPrecipitacao;

  molPrecipitanteRestante: number;
  molTitulanteRetornoLivre: number;

  concentracaoPrecipitanteLivre: number;
  concentracaoTitulanteRetornoLivre: number;

  pPrecipitante: number;
  percentualRetorno: number;
};

export type CurvaTitulacaoRetornoPrecipitacao = {
  pontos: PontoCurvaTitulacaoRetornoPrecipitacao[];
  volumePontoFinalRetorno: number;
  volumeMaximo: number;
  passo: number;
};