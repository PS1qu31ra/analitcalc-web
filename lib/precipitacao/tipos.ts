/**
 * Tipos gerais utilizados pelo módulo de equilíbrio
 * e volumetria de precipitação.
 */

/* =========================================================
 * TIPOS GERAIS
 * ======================================================= */

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

/**
 * Identifica se uma espécie corresponde ao cátion
 * ou ao ânion do precipitado selecionado.
 */
export type EspeciePrecipitacao =
  | "cation"
  | "anion";

/**
 * Nome mantido por compatibilidade com os arquivos
 * e componentes atuais do projeto.
 */
export type EspecieAnalitoPrecipitacao =
  EspeciePrecipitacao;

/* =========================================================
 * ÍONS E SAIS
 * ======================================================= */

export type IonPrecipitacao = {
  /**
   * Identificador interno único.
   *
   * Exemplos:
   * "Ag+"
   * "Cl-"
   * "SO4-2"
   */
  id: string;

  /**
   * Nome por extenso.
   *
   * Exemplo:
   * "Íon prata"
   */
  nome: string;

  /**
   * Fórmula utilizada internamente.
   *
   * Exemplo:
   * "Ag+"
   */
  formula: string;

  /**
   * Fórmula preparada para exibição.
   *
   * Exemplo:
   * "Ag⁺"
   */
  formulaExibicao: string;

  /**
   * Carga algébrica do íon.
   *
   * Exemplos:
   * Ag⁺   → 1
   * Cl⁻   → -1
   * SO₄²⁻ → -2
   */
  carga: number;
};

export type SalPrecipitacao = {
  /**
   * Identificador interno único.
   *
   * Exemplo:
   * "AgCl"
   */
  id: string;

  /**
   * Nome do composto.
   *
   * Exemplo:
   * "Cloreto de prata"
   */
  nome: string;

  /**
   * Fórmula utilizada internamente.
   */
  formula: string;

  /**
   * Fórmula preparada para exibição.
   *
   * Exemplo:
   * "AgCl"
   */
  formulaExibicao: string;

  cation: IonPrecipitacao;
  anion: IonPrecipitacao;

  /**
   * Coeficientes da equação de dissolução:
   *
   * CₐAᵦ(s) ⇌ a C + b A
   */
  coeficienteCation: number;
  coeficienteAnion: number;

  /**
   * Produto de solubilidade termodinâmico ou
   * condicional adotado pela base de dados.
   */
  kps: number;

  /**
   * pKps = -log₁₀(Kps)
   */
  pKps: number;

  /**
   * Descrição visual do precipitado.
   *
   * Exemplos:
   * "branco"
   * "amarelo"
   */
  corPrecipitado: string;

  observacao?: string;

  /**
   * Estudos nos quais o sal está disponível.
   */
  usos: TipoEstudoPrecipitacao[];
};

/* =========================================================
 * EQUILÍBRIO DE SOLUBILIDADE
 * ======================================================= */

export type ResultadoEquilibrioPrecipitacao = {
  sal: SalPrecipitacao;

  /**
   * Solubilidade molar do precipitado em mol·L⁻¹.
   */
  solubilidadeMolar: number;

  /**
   * Concentrações livres no equilíbrio.
   */
  concentracaoCationEquilibrio: number;
  concentracaoAnionEquilibrio: number;

  /**
   * pCátion = -log₁₀[Cátion]
   * pÂnion  = -log₁₀[Ânion]
   */
  pCation: number;
  pAnion: number;

  expressaoKps: string;
  expressaoSolubilidade: string;

  mensagem: string;
};

/* =========================================================
 * TITULAÇÃO DIRETA
 * ======================================================= */

export type StatusTitulacaoDiretaPrecipitacao =
  | "adequado"
  | "fora_da_bureta"
  | "dados_invalidos";

export type EntradaTitulacaoDiretaPrecipitacao = {
  sal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  /**
   * Concentração formal inicial do analito,
   * antes da adição do titulante.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoAnalito: number;

  /**
   * Volume inicial da amostra.
   *
   * Unidade adotada pela interface: mL
   */
  volumeAmostra: number;

  /**
   * Concentração formal do titulante.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoTitulante: number;

  /**
   * Capacidade máxima da bureta.
   *
   * Unidade: mL
   */
  volumeMaximoBureta: number;
};

export type ResultadoTitulacaoDiretaPrecipitacao = {
  sal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  especieTitulante:
    EspeciePrecipitacao;

  concentracaoAnalito: number;
  volumeAmostra: number;
  concentracaoTitulante: number;
  volumeMaximoBureta: number;

  /**
   * Quantidades em mol.
   */
  molAnalito: number;
  molTitulantePE: number;

  /**
   * Volume de titulante no ponto de equivalência.
   *
   * Unidade: mL
   */
  volumePE: number;

  coeficienteAnalito: number;
  coeficienteTitulante: number;

  /**
   * Relação recomendada:
   *
   * analito : titulante
   */
  relacaoEstequiometrica: string;

  status:
    StatusTitulacaoDiretaPrecipitacao;

  mensagem: string;
};

/* =========================================================
 * CURVA DE TITULAÇÃO DIRETA
 * ======================================================= */

export type RegiaoCurvaPrecipitacao =
  | "Antes do PE"
  | "No PE"
  | "Após o PE"
  | "Fora da curva"
  | "Dados inválidos";

export type PontoCurvaTitulacaoDiretaPrecipitacao = {
  /**
   * Volumes em mL.
   */
  volumeAdicionado: number;
  volumeTotal: number;

  regiao: RegiaoCurvaPrecipitacao;

  /**
   * Concentrações livres no equilíbrio químico
   * do ponto avaliado.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoAnalitoLivre: number;
  concentracaoTitulanteLivre: number;

  /**
   * Pode representar o analito ou o titulante,
   * de acordo com especieMonitorada.
   */
  concentracaoEspecieMonitorada: number;

  /**
   * pX = -log₁₀[X]
   */
  pEspecieMonitorada: number;

  /**
   * Percentual do analito inicial que se encontra
   * precipitado no ponto avaliado.
   *
   * Intervalo esperado: 0 a 100.
   */
  percentualPrecipitado: number;
};

export type CurvaTitulacaoDiretaPrecipitacao = {
  pontos:
    PontoCurvaTitulacaoDiretaPrecipitacao[];

  volumePE: number;
  volumeMaximo: number;
  passo: number;

  especieMonitorada:
    EspeciePrecipitacao;
};

/* =========================================================
 * MÉTODOS DE DETERMINAÇÃO DO PONTO FINAL
 * ======================================================= */

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

/* =========================================================
 * INTERFERÊNCIAS
 * ======================================================= */

export type RiscoInterferenciaPrecipitacao =
  | "alto"
  | "moderado"
  | "baixo";

export type InterferenciaPrecipitacao = {
  salInterferente: SalPrecipitacao;

  /**
   * Espécie que compete com o analito pelo mesmo
   * titulante.
   */
  especieConcorrente: IonPrecipitacao;

  risco: RiscoInterferenciaPrecipitacao;
  motivo: string;

  /**
   * Mantido para compatibilidade com a interface.
   *
   * Não deve ser utilizado isoladamente para decidir
   * o risco quando os precipitados apresentam
   * estequiometrias diferentes.
   */
  razaoKps: number;

  /**
   * Concentração livre de titulante necessária para
   * iniciar a formação do precipitado principal.
   *
   * Campos opcionais para não quebrar os objetos
   * produzidos por implementações anteriores.
   */
  concentracaoCriticaPrincipal?: number;

  /**
   * Concentração livre de titulante necessária para
   * iniciar a formação do precipitado interferente.
   */
  concentracaoCriticaInterferente?: number;

  /**
   * Razão:
   *
   * [T]crítica,interferente
   * ----------------------
   * [T]crítica,principal
   */
  razaoConcentracoesCriticas?: number;
};

/* =========================================================
 * TITULAÇÃO POR RETORNO
 * ======================================================= */

export type StatusTitulacaoRetornoPrecipitacao =
  | "adequado"
  | "excesso_insuficiente"
  | "fora_da_bureta"
  | "dados_invalidos";

export type EntradaTitulacaoRetornoPrecipitacao = {
  salPrincipal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  /**
   * Concentração formal inicial do analito.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoAnalito: number;

  /**
   * Volume inicial da amostra em mL.
   */
  volumeAmostra: number;

  /**
   * Concentração e volume do reagente precipitante
   * adicionado em excesso.
   *
   * Concentração: mol·L⁻¹
   * Volume: mL
   */
  concentracaoPrecipitanteExcesso: number;
  volumePrecipitanteExcesso: number;

  /**
   * Concentração do titulante utilizado para medir
   * o precipitante remanescente.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoTitulanteRetorno: number;

  /**
   * Capacidade máxima da bureta de retorno.
   *
   * Unidade: mL
   */
  volumeMaximoBuretaRetorno: number;
};

export type ResultadoTitulacaoRetornoPrecipitacao = {
  salPrincipal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  especiePrecipitante:
    EspeciePrecipitacao;

  volumeAmostra: number;

  concentracaoPrecipitanteExcesso: number;
  volumePrecipitanteExcesso: number;
  concentracaoTitulanteRetorno: number;

  /**
   * Volume previsto para o ponto final da
   * retrotitulação.
   *
   * Unidade: mL
   */
  volumeTitulanteRetorno: number;

  /**
   * Quantidades químicas em mol.
   */
  molPrecipitanteAdicionado: number;
  molPrecipitanteEmExcesso: number;
  molPrecipitanteConsumidoPeloAnalito: number;
  molAnalito: number;

  /**
   * Concentração calculada do analito na amostra
   * original.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoAnalito: number;

  relacaoPrincipal: string;
  relacaoRetorno: string;

  status:
    StatusTitulacaoRetornoPrecipitacao;

  mensagem: string;
};

/* =========================================================
 * SELETIVIDADE DE PRECIPITAÇÃO
 * ======================================================= */

export type IonMisturaSeletividadePrecipitacao = {
  sal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  /**
   * Concentração formal inicial desse analito
   * na mistura.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoAnalito: number;
};

export type EntradaSeletividadePrecipitacao = {
  /**
   * Indica se o titulante corresponde ao cátion
   * ou ao ânion dos sais selecionados.
   */
  especieTitulante:
    EspeciePrecipitacao;

  itens:
    IonMisturaSeletividadePrecipitacao[];
};

export type ResultadoItemSeletividadePrecipitacao = {
  sal: SalPrecipitacao;

  especieAnalito:
    EspecieAnalitoPrecipitacao;

  concentracaoAnalito: number;

  especieTitulante:
    EspeciePrecipitacao;

  /**
   * Concentração livre de titulante necessária
   * para o início da precipitação.
   *
   * Unidade: mol·L⁻¹
   */
  concentracaoTitulanteInicioPrecipitacao:
    number;

  /**
   * pT = -log₁₀[T]início
   */
  pTitulanteInicioPrecipitacao: number;

  /**
   * 1 representa o primeiro precipitado previsto.
   */
  ordemPrecipitacao: number;

  criterio: string;
  interpretacao: string;
};

export type StatusSeletividadePrecipitacao =
  | "adequado"
  | "dados_invalidos"
  | "mistura_insuficiente";

export type ResultadoSeletividadePrecipitacao = {
  especieTitulante:
    EspeciePrecipitacao;

  itens:
    ResultadoItemSeletividadePrecipitacao[];

  status:
    StatusSeletividadePrecipitacao;

  mensagem: string;
};

/* =========================================================
 * CURVA DE TITULAÇÃO POR RETORNO
 * ======================================================= */

export type RegiaoCurvaTitulacaoRetornoPrecipitacao =
  | "Antes do retorno"
  | "No ponto final do retorno"
  | "Após o retorno"
  | "Dados inválidos";

export type PontoCurvaTitulacaoRetornoPrecipitacao = {
  /**
   * Volumes em mL.
   */
  volumeAdicionado: number;
  volumeTotal: number;

  regiao:
    RegiaoCurvaTitulacaoRetornoPrecipitacao;

  /**
   * Quantidades livres em mol.
   */
  molPrecipitanteRestante: number;
  molTitulanteRetornoLivre: number;

  /**
   * Concentrações livres em mol·L⁻¹.
   */
  concentracaoPrecipitanteLivre: number;
  concentracaoTitulanteRetornoLivre: number;

  /**
   * pPrecipitante =
   * -log₁₀[precipitante livre]
   */
  pPrecipitante: number;

  /**
   * Percentual do precipitante em excesso que já foi
   * consumido pelo titulante de retorno.
   *
   * Intervalo esperado: 0 a 100 antes do ponto final,
   * podendo ultrapassar 100 após o ponto final caso a
   * interface represente o excesso adicionado.
   */
  percentualRetorno: number;
};

export type CurvaTitulacaoRetornoPrecipitacao = {
  pontos:
    PontoCurvaTitulacaoRetornoPrecipitacao[];

  volumePontoFinalRetorno: number;
  volumeMaximo: number;
  passo: number;
};