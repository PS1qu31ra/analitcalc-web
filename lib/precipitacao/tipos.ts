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
   * Solubilidade molar do precipitado em mol L⁻¹.
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
   * Unidade: mol L⁻¹
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
   * Unidade: mol L⁻¹
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
   * Unidade: mol L⁻¹
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

/**
 * Tipo de mecanismo utilizado para indicar
 * visual ou instrumentalmente o ponto final.
 */
export type TipoIndicadorMetodoPrecipitacao =
  | "precipitacao"
  | "complexacao"
  | "adsorcao"
  | "eletroquimico";

/**
 * Informações sobre o titulante empregado
 * pelo método analítico.
 *
 * A fórmula do reagente preparado pode ser
 * diferente da espécie química efetivamente
 * envolvida na reação.
 *
 * Exemplo:
 *
 * Reagente: AgNO₃
 * Espécie ativa: Ag⁺
 */
export type TitulanteMetodoPrecipitacao = {
  /**
   * Nome do reagente usado como solução titulante.
   *
   * Exemplo:
   * "Nitrato de prata"
   */
  nome: string;

  /**
   * Fórmula do reagente preparado.
   *
   * Exemplo:
   * "AgNO₃"
   */
  formula: string;

  /**
   * Espécie química efetivamente responsável
   * pela reação de precipitação.
   *
   * Exemplo:
   * "Ag⁺"
   */
  especieAtiva: string;
};

/**
 * Condições de meio recomendadas para aplicação
 * do método.
 */
export type MeioMetodoPrecipitacao = {
  /**
   * Descrição geral do meio experimental.
   *
   * Exemplos:
   *
   * "Meio aproximadamente neutro."
   * "Meio ácido, normalmente acidificado com HNO₃."
   */
  descricao: string;

  /**
   * Limites de pH adotados quando houver uma faixa
   * definida na base.
   */
  phMinimo?: number;
  phMaximo?: number;

  /**
   * Reagentes ou condições adicionais importantes.
   */
  observacao?: string;
};

/**
 * Indicador visual, químico ou instrumental
 * associado a um método de determinação do
 * ponto final.
 */
export type IndicadorMetodoPrecipitacao = {
  /**
   * Identificador interno.
   *
   * Exemplos:
   *
   * "cromato"
   * "ferro-iii"
   * "fluoresceina"
   * "diclorofluoresceina"
   */
  id: string;

  /**
   * Nome exibido na interface.
   */
  nome: string;

  /**
   * Fórmula química, quando aplicável.
   */
  formula?: string;

  /**
   * Natureza do mecanismo de indicação.
   */
  tipo:
    TipoIndicadorMetodoPrecipitacao;

  /**
   * Faixa de pH recomendada para o indicador,
   * quando disponível na base.
   */
  phMinimo?: number;
  phMaximo?: number;

  /**
   * Mudança visual ou resposta observada no
   * ponto final.
   */
  mudancaVisual?: string;

  /**
   * Explicação química ou condição adicional.
   */
  observacao?: string;
};

/**
 * Reação associada à formação do precipitado
 * principal ou à indicação do ponto final.
 *
 * Os estados físicos são armazenados
 * separadamente para que possam ser exibidos
 * com subscrito na interface.
 */
export type ReacaoMetodoPrecipitacao = {
  /**
   * Texto simples para exportação, tabela
   * ou atributos de acessibilidade.
   *
   * Exemplo:
   *
   * "2 Ag⁺(aq) + CrO₄²⁻(aq) ⇌ Ag₂CrO₄(s)"
   */
  equacao: string;

  /**
   * Descrição da função dessa reação.
   *
   * Exemplos:
   *
   * "Reação principal"
   * "Reação indicadora"
   */
  descricao: string;
};

/**
 * Estrutura completa de um método de
 * determinação do ponto final.
 */
export type MetodoPrecipitacao = {
  id: MetodoPrecipitacaoId;

  nome: string;

  principio: string;

  status:
    StatusMetodoPrecipitacao;

  justificativa: string;

  /**
   * Solução titulante normalmente associada
   * ao método.
   */
  titulante?:
    TitulanteMetodoPrecipitacao;

  /**
   * Condições recomendadas de pH e meio.
   */
  meio?:
    MeioMetodoPrecipitacao;

  /**
   * Um método pode aceitar mais de um indicador.
   *
   * Exemplo:
   *
   * Fajans:
   * - fluoresceína;
   * - diclorofluoresceína.
   */
  indicadores?:
    IndicadorMetodoPrecipitacao[];

  /**
   * Reações principais ou indicadoras
   * apresentadas na interface.
   */
  reacoes?:
    ReacaoMetodoPrecipitacao[];

  /**
   * Recomendações e limitações adicionais.
   */
  observacoes?: string[];
};

/* =========================================================
 * INTERFERÊNCIAS
 * ======================================================= */

export type RiscoInterferenciaPrecipitacao =
  | "alto"
  | "moderado"
  | "baixo";

/**
 * Classificação predominante da separação por
 * precipitação fracionada.
 *
 * O critério principal é o percentual do primeiro
 * analito já precipitado quando o precipitado
 * seguinte começa a se formar.
 */
export type ClassificacaoSeparacaoPrecipitacao =
  | "nao_seletiva"
  | "separacao_ruim"
  | "separacao_parcial"
  | "separacao_quantitativa"
  | "separacao_muito_favoravel"
  | "precipitacao_simultanea"
  | "nao_avaliada";

/**
 * Resultado padronizado da avaliação da separação.
 *
 * O risco permanece compatível com os componentes
 * atuais. Quando a separação não puder ser avaliada,
 * o risco será null.
 */
export type AvaliacaoSeparacaoPrecipitacao = {
  classificacao:
    ClassificacaoSeparacaoPrecipitacao;
  risco:
    RiscoInterferenciaPrecipitacao | null;
  percentualPrecipitado:
    number | null;
  percentualRemanescente:
    number | null;
  titulo: string;
  interpretacao: string;
};

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

    /**
   * Avaliação predominante da separação entre
   * o precipitado principal e o concorrente.
   */
    avaliacaoSeparacao?:
    AvaliacaoSeparacaoPrecipitacao;

  /**
   * Percentual do precipitado principal já formado
   * quando o precipitado concorrente começa.
   */
  percentualPrincipalPrecipitado?:
    number | null;

  /**
   * Volume em que o precipitado concorrente começa
   * a se formar na mistura simulada.
   *
   * Unidade: mL
   */
  volumeInicioInterferente?:
    number | null;
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
   * Unidade: mol L⁻¹
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
   * Concentração: mol L⁻¹
   * Volume: mL
   */
  concentracaoPrecipitanteExcesso: number;
  volumePrecipitanteExcesso: number;

  /**
   * Concentração do titulante utilizado para medir
   * o precipitante remanescente.
   *
   * Unidade: mol L⁻¹
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
   * Unidade: mol L⁻¹
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
   * Unidade: mol L⁻¹
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
   * Unidade: mol L⁻¹
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
   * Concentrações livres em mol L⁻¹.
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