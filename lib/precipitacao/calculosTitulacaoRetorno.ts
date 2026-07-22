import type {
  EntradaTitulacaoRetornoPrecipitacao,
  ResultadoTitulacaoRetornoPrecipitacao,
} from "./tipos";

const FORMULA_PRATA = "Ag⁺";
const FORMULA_TITULANTE_RETORNO = "SCN⁻";
const FORMULA_PRECIPITADO_RETORNO = "AgSCN";

function coeficientesValidos(
  coeficienteAnalito: number,
  coeficientePrecipitante: number
) {
  return (
    Number.isFinite(coeficienteAnalito) &&
    Number.isFinite(coeficientePrecipitante) &&
    Number.isInteger(coeficienteAnalito) &&
    Number.isInteger(coeficientePrecipitante) &&
    coeficienteAnalito > 0 &&
    coeficientePrecipitante > 0
  );
}

function criarResultadoBase({
  entrada,
  especiePrecipitante,
  relacaoPrincipal,
  relacaoRetorno,
  status,
  mensagem,
  volumeTitulanteRetorno = NaN,
  molPrecipitanteAdicionado = NaN,
  molPrecipitanteEmExcesso = NaN,
  molPrecipitanteConsumidoPeloAnalito = NaN,
  molAnalito = NaN,
}: {
  entrada: EntradaTitulacaoRetornoPrecipitacao;
  especiePrecipitante: "cation" | "anion";
  relacaoPrincipal: string;
  relacaoRetorno: string;
  status: ResultadoTitulacaoRetornoPrecipitacao["status"];
  mensagem: string;
  volumeTitulanteRetorno?: number;
  molPrecipitanteAdicionado?: number;
  molPrecipitanteEmExcesso?: number;
  molPrecipitanteConsumidoPeloAnalito?: number;
  molAnalito?: number;
}): ResultadoTitulacaoRetornoPrecipitacao {
  return {
    salPrincipal: entrada.salPrincipal,

    especieAnalito: entrada.especieAnalito,
    especiePrecipitante,

    volumeAmostra: entrada.volumeAmostra,

    concentracaoPrecipitanteExcesso:
      entrada.concentracaoPrecipitanteExcesso,

    volumePrecipitanteExcesso:
      entrada.volumePrecipitanteExcesso,

    concentracaoTitulanteRetorno:
      entrada.concentracaoTitulanteRetorno,

    volumeTitulanteRetorno,

    molPrecipitanteAdicionado,
    molPrecipitanteEmExcesso,
    molPrecipitanteConsumidoPeloAnalito,

    molAnalito,
    concentracaoAnalito: entrada.concentracaoAnalito,

    relacaoPrincipal,
    relacaoRetorno,

    status,
    mensagem,
  };
}

export function calcularTitulacaoRetornoPrecipitacao(
  entrada: EntradaTitulacaoRetornoPrecipitacao
): ResultadoTitulacaoRetornoPrecipitacao {
  const {
    salPrincipal,
    especieAnalito,
    concentracaoAnalito,
    volumeAmostra,
    concentracaoPrecipitanteExcesso,
    volumePrecipitanteExcesso,
    concentracaoTitulanteRetorno,
    volumeMaximoBuretaRetorno,
  } = entrada;

  const especieAnalitoValida =
    especieAnalito === "cation" ||
    especieAnalito === "anion";

  /*
   * A espécie precipitante é o contraíon do analito
   * no precipitado principal selecionado.
   */
  const especiePrecipitante =
    especieAnalito === "anion"
      ? "cation"
      : "anion";

  const coeficienteAnalito =
    especieAnalito === "anion"
      ? salPrincipal.coeficienteAnion
      : salPrincipal.coeficienteCation;

  const coeficientePrecipitante =
    especiePrecipitante === "anion"
      ? salPrincipal.coeficienteAnion
      : salPrincipal.coeficienteCation;

  const formulaAnalito =
    especieAnalito === "anion"
      ? salPrincipal.anion.formulaExibicao
      : salPrincipal.cation.formulaExibicao;

  const formulaPrecipitante =
    especiePrecipitante === "anion"
      ? salPrincipal.anion.formulaExibicao
      : salPrincipal.cation.formulaExibicao;

  /*
   * Relação do precipitado principal:
   *
   * coeficienteAnalito × analito
   * reage com
   * coeficientePrecipitante × precipitante.
   */
  const relacaoPrincipal =
    `${coeficienteAnalito} ${formulaAnalito} : ` +
    `${coeficientePrecipitante} ${formulaPrecipitante}`;

  /*
   * No método de Volhard:
   *
   * Ag⁺ + SCN⁻ → AgSCN(s)
   *
   * A relação é sempre 1:1.
   */
  const relacaoRetorno =
    `1 ${FORMULA_PRATA} : ` +
    `1 ${FORMULA_TITULANTE_RETORNO}`;

  if (!especieAnalitoValida) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        "A espécie presente na amostra deve ser definida como cátion ou ânion.",
    });
  }

  if (
    !coeficientesValidos(
      coeficienteAnalito,
      coeficientePrecipitante
    )
  ) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        "Os coeficientes estequiométricos do precipitado principal devem ser números inteiros positivos.",
    });
  }

  const dadosNumericosValidos =
    Number.isFinite(concentracaoAnalito) &&
    Number.isFinite(volumeAmostra) &&
    Number.isFinite(concentracaoPrecipitanteExcesso) &&
    Number.isFinite(volumePrecipitanteExcesso) &&
    Number.isFinite(concentracaoTitulanteRetorno) &&
    Number.isFinite(volumeMaximoBuretaRetorno) &&
    concentracaoAnalito > 0 &&
    volumeAmostra > 0 &&
    concentracaoPrecipitanteExcesso > 0 &&
    volumePrecipitanteExcesso > 0 &&
    concentracaoTitulanteRetorno > 0 &&
    volumeMaximoBuretaRetorno > 0;

  if (!dadosNumericosValidos) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        "Informe valores positivos e finitos para as concentrações, os volumes das soluções e a capacidade da bureta.",
    });
  }

  /*
   * Este módulo representa especificamente a retrotitulação
   * pelo método de Volhard.
   *
   * Portanto, o reagente adicionado em excesso deve ser Ag⁺.
   */
  const sistemaCompativelComVolhard =
    especiePrecipitante === "cation" &&
    formulaPrecipitante === FORMULA_PRATA;

  if (!sistemaCompativelComVolhard) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        `O retorno com ${FORMULA_TITULANTE_RETORNO} é válido neste módulo somente quando o precipitante adicionado em excesso é ${FORMULA_PRATA}. O sistema selecionado utiliza ${formulaPrecipitante} como precipitante.`,
    });
  }

  const volumeAmostraL =
    volumeAmostra / 1000;

  const volumePrecipitanteExcessoL =
    volumePrecipitanteExcesso / 1000;

  /*
   * Quantidade de analito originalmente presente:
   *
   * n = C × V
   */
  const molAnalito =
    concentracaoAnalito *
    volumeAmostraL;

  /*
   * Quantidade total de Ag⁺ adicionada à amostra.
   *
   * O nome histórico da variável contém "Excesso",
   * mas este valor representa toda a solução de Ag⁺ adicionada,
   * e não apenas a quantidade que ficará sobrando.
   */
  const molPrecipitanteAdicionado =
    concentracaoPrecipitanteExcesso *
    volumePrecipitanteExcessoL;

  /*
   * Para o precipitado principal:
   *
   * n(precipitante consumido)
   * =
   * n(analito)
   * ×
   * coeficientePrecipitante / coeficienteAnalito
   */
  const molPrecipitanteConsumidoPeloAnalito =
    molAnalito *
    (
      coeficientePrecipitante /
      coeficienteAnalito
    );

  if (
    !Number.isFinite(molAnalito) ||
    !Number.isFinite(molPrecipitanteAdicionado) ||
    !Number.isFinite(
      molPrecipitanteConsumidoPeloAnalito
    ) ||
    molAnalito <= 0 ||
    molPrecipitanteAdicionado <= 0 ||
    molPrecipitanteConsumidoPeloAnalito <= 0
  ) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        "Não foi possível calcular as quantidades de matéria com os dados informados.",
    });
  }

  const molPrecipitanteEmExcessoCalculado =
    molPrecipitanteAdicionado -
    molPrecipitanteConsumidoPeloAnalito;

  /*
   * Proteção contra diferenças numéricas muito pequenas.
   * A tolerância não altera significativamente o resultado químico;
   * apenas evita tratar ruído computacional como excesso real.
   */
  const toleranciaMol =
    Math.max(
      molPrecipitanteAdicionado,
      molPrecipitanteConsumidoPeloAnalito,
      1
    ) * 1e-12;

  if (
    molPrecipitanteEmExcessoCalculado <=
    toleranciaMol
  ) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "excesso_insuficiente",
      mensagem:
        molPrecipitanteEmExcessoCalculado < -toleranciaMol
          ? `A quantidade de ${FORMULA_PRATA} adicionada é insuficiente para precipitar todo o ${formulaAnalito}. Aumente o volume ou a concentração da solução de ${FORMULA_PRATA}.`
          : `A quantidade de ${FORMULA_PRATA} adicionada é apenas estequiométrica. Na titulação por retorno é necessário adicionar um excesso mensurável de ${FORMULA_PRATA}.`,
      volumeTitulanteRetorno: 0,
      molPrecipitanteAdicionado,
      molPrecipitanteEmExcesso:
        molPrecipitanteEmExcessoCalculado,
      molPrecipitanteConsumidoPeloAnalito,
      molAnalito,
    });
  }

  const molPrecipitanteEmExcesso =
    molPrecipitanteEmExcessoCalculado;

  /*
   * Retorno de Volhard:
   *
   * Ag⁺ + SCN⁻ → AgSCN(s)
   *
   * n(SCN⁻) = n(Ag⁺ em excesso)
   */
  const molTitulanteRetorno =
    molPrecipitanteEmExcesso;

  const volumeTitulanteRetornoL =
    molTitulanteRetorno /
    concentracaoTitulanteRetorno;

  const volumeTitulanteRetorno =
    volumeTitulanteRetornoL * 1000;

  if (
    !Number.isFinite(volumeTitulanteRetorno) ||
    volumeTitulanteRetorno <= 0
  ) {
    return criarResultadoBase({
      entrada,
      especiePrecipitante,
      relacaoPrincipal,
      relacaoRetorno,
      status: "dados_invalidos",
      mensagem:
        `Não foi possível calcular o volume de ${FORMULA_TITULANTE_RETORNO} necessário para titular o excesso de ${FORMULA_PRATA}.`,
      molPrecipitanteAdicionado,
      molPrecipitanteEmExcesso,
      molPrecipitanteConsumidoPeloAnalito,
      molAnalito,
    });
  }

  const toleranciaVolume =
    Math.max(
      volumeTitulanteRetorno,
      volumeMaximoBuretaRetorno,
      1
    ) * 1e-10;

  const cabeNaBureta =
    volumeTitulanteRetorno <=
    volumeMaximoBuretaRetorno +
    toleranciaVolume;

  const status: ResultadoTitulacaoRetornoPrecipitacao["status"] =
    cabeNaBureta
      ? "adequado"
      : "fora_da_bureta";

  const mensagem =
    status === "adequado"
      ? `Após a precipitação de ${formulaAnalito}, o excesso restante de ${FORMULA_PRATA} corresponde ao volume previsto de ${FORMULA_TITULANTE_RETORNO} necessário para formar ${FORMULA_PRECIPITADO_RETORNO}(s).`
      : `O volume previsto de ${FORMULA_TITULANTE_RETORNO} ultrapassa a capacidade da bureta informada. Aumente a concentração do titulante de retorno, reduza o excesso de ${FORMULA_PRATA} ou utilize uma bureta de maior capacidade.`;

  return {
    salPrincipal,

    especieAnalito,
    especiePrecipitante,

    volumeAmostra,

    concentracaoPrecipitanteExcesso,
    volumePrecipitanteExcesso,

    concentracaoTitulanteRetorno,
    volumeTitulanteRetorno,

    molPrecipitanteAdicionado,
    molPrecipitanteEmExcesso,
    molPrecipitanteConsumidoPeloAnalito,

    molAnalito,
    concentracaoAnalito,

    relacaoPrincipal,
    relacaoRetorno,

    status,
    mensagem,
  };
}