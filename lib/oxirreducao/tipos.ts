/**
 * Tipos gerais utilizados pelo módulo
 * de volumetria de oxirredução.
 */

/* =========================================================
 * MODOS E CONDIÇÕES
 * ======================================================= */

export type MetodoOxirreducao =
  | "permanganometria"
  | "iodometria";

export type MeioRedox =
  | "acido"
  | "neutro"
  | "basico";

export type EstadoFisicoRedox =
  | "aq"
  | "l"
  | "s"
  | "g";


/* =========================================================
 * ESPÉCIES QUÍMICAS
 * ======================================================= */

export type EspecieRedox = {
  /**
   * Identificador interno único.
   *
   * Exemplos:
   * "MnO4-"
   * "Mn2+"
   * "Fe3+"
   */
  id: string;

  /**
   * Nome químico.
   */
  nome: string;

  /**
   * Fórmula utilizada internamente.
   */
  formula: string;

  /**
   * Fórmula preparada para exibição.
   *
   * Exemplos:
   * MnO₄⁻
   * Fe³⁺
   */
  formulaExibicao: string;

  /**
   * Carga algébrica.
   */
  carga: number;

  /**
   * Estado físico predominante
   * considerado na reação.
   */
  estado:
    EstadoFisicoRedox;
};


/* =========================================================
 * QUOCIENTE DE REAÇÃO
 * ======================================================= */

/**
 * Representa uma espécie participante
 * do quociente de reação utilizado
 * na equação de Nernst.
 */
export type TermoQuocienteRedox = {
  /**
   * Deve corresponder ao id de
   * uma EspecieRedox.
   */
  especieId: string;

  /**
   * Expoente estequiométrico
   * no quociente de reação.
   */
  expoente: number;
};


/**
 * Para uma semirreação de redução:
 *
 * Ox + n e⁻ ⇌ Red
 *
 * E = E° - (RT/nF) ln Q
 *
 * Q =
 * atividades dos produtos
 * ------------------------
 * atividades dos reagentes
 *
 * Elétrons, sólidos puros e líquidos
 * puros não entram no quociente.
 */
export type QuocienteReacaoRedox = {
  numerador:
    TermoQuocienteRedox[];

  denominador:
    TermoQuocienteRedox[];
};


/* =========================================================
 * PAR REDOX
 * ======================================================= */

export type ParRedox = {
  /**
   * Identificador interno.
   *
   * Exemplo:
   * "MnO4-/Mn2+"
   */
  id: string;

  /**
   * Nome apresentado na interface.
   */
  nome: string;

  /**
   * Espécie oxidada do par.
   */
  oxidante:
    EspecieRedox;

  /**
   * Espécie reduzida do par.
   */
  redutor:
    EspecieRedox;

  /**
   * Número de elétrons da
   * semirreação de redução.
   */
  numeroEletrons: number;

  /**
   * Potencial padrão de redução.
   *
   * Unidade: V
   */
  potencialPadraoReducao: number;

  /**
   * Semirreação escrita no sentido
   * de redução.
   */
  semirreacaoReducao: string;

  /**
   * Meios químicos nos quais
   * o par será disponibilizado
   * no AnalitCalc.
   */
  meios:
    MeioRedox[];

  /**
   * Estrutura utilizada para
   * calcular Q na equação de Nernst.
   */
  quocienteReacao:
    QuocienteReacaoRedox;

  /**
   * Observações químicas importantes.
   */
  observacao?: string;

  /**
   * Referência utilizada para
   * o potencial padrão.
   */
  referencia?: string;
};


/* =========================================================
 * NERNST
 * ======================================================= */

/**
 * As atividades são indexadas pelo
 * id da espécie química.
 *
 * Exemplo:
 *
 * {
 *   "Fe3+": 0.01,
 *   "Fe2+": 0.09
 * }
 *
 * No primeiro modelo do AnalitCalc,
 * concentrações poderão ser utilizadas
 * como aproximação de atividade.
 */
export type AtividadesRedox =
  Record<
    string,
    number
  >;


export type EntradaCalculoNernst = {
  par:
    ParRedox;

  atividades:
    AtividadesRedox;

  /**
   * Temperatura em °C.
   *
   * Se omitida:
   * 25 °C.
   */
  temperaturaC?: number;
};


export type StatusCalculoNernst =
  | "ok"
  | "dados_invalidos";


export type ResultadoCalculoNernst = {
  status:
    StatusCalculoNernst;

  par:
    ParRedox;

  temperaturaC: number;
  temperaturaK: number;

  numeroEletrons: number;

  /**
   * E°
   */
  potencialPadrao: number;

  /**
   * Q
   */
  quocienteReacao: number;

  /**
   * 2,303 RT / nF
   *
   * Unidade: V por década logarítmica.
   */
  fatorNernst: number;

  /**
   * E calculado.
   *
   * Unidade: V
   */
  potencial: number;

  mensagem: string;
};