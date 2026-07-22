import {
    calcularDerivadasCurva,
    obterPontosPrimeiraDerivada,
    obterPontosSegundaDerivada,
    type EstimativaPontoEquivalencia,
    type PontoCurvaComDerivadas,
  } from "./derivadas";
  
  export type RegiaoCurvaPrecipitacao =
    | "Antes do PE"
    | "No PE"
    | "Após o PE";
  
  export type TipoCurvaPrecipitacao =
    | "direta"
    | "retorno";
  
  export type GrandezaCurvaPrecipitacao =
    | "pAnalito"
    | "pTitulante"
    | "concentracaoAnalito"
    | "concentracaoTitulante"
    | "potencial"
    | "sinalPersonalizado";
  
  export type AvisoCurvaPrecipitacao = {
    codigo: string;
    mensagem: string;
    nivel:
      | "informacao"
      | "atencao"
      | "erro";
  };
  
  export type PontoCalculadoPrecipitacao = {
    /**
     * Valor que será exibido no eixo y.
     *
     * Exemplos:
     * - pAg;
     * - pCl;
     * - pSCN;
     * - concentração livre;
     * - potencial.
     */
    valor: number;
  
    /**
     * Campos químicos opcionais que podem ser usados
     * na tabela de resultados e na consulta da curva.
     */
    concentracaoAnalitoLivre?:
      | number
      | null;
  
    concentracaoTitulanteLivre?:
      | number
      | null;
  
    produtoIonico?:
      | number
      | null;
  
    kps?:
      | number
      | null;
  
    precipitadoFormado?:
      | number
      | null;
  
    /**
     * Permite preservar informações calculadas
     * pelo motor químico principal.
     */
    metadados?: Record<
      string,
      string | number | boolean | null
    >;
  };
  
  export type PontoCurvaPrecipitacao = {
    indice: number;
  
    volumeTitulante: number;
    volumeTotal: number;
  
    valor: number;
  
    regiao: RegiaoCurvaPrecipitacao;
  
    distanciaDoPE: number;
    fracaoDoPE: number | null;
  
    primeiraDerivada:
      | number
      | null;
  
    segundaDerivada:
      | number
      | null;
  
    concentracaoAnalitoLivre:
      | number
      | null;
  
    concentracaoTitulanteLivre:
      | number
      | null;
  
    produtoIonico:
      | number
      | null;
  
    kps:
      | number
      | null;
  
    precipitadoFormado:
      | number
      | null;
  
    metadados: Record<
      string,
      string | number | boolean | null
    >;
  };
  
  export type PontoGraficoCurvaPrecipitacao = {
    volume: number;
    valor: number;
    regiao: RegiaoCurvaPrecipitacao;
  };
  
  export type PontoGraficoPrimeiraDerivada = {
    volume: number;
    primeiraDerivada: number;
  };
  
  export type PontoGraficoSegundaDerivada = {
    volume: number;
    segundaDerivada: number;
  };
  
  export type ParametrosGeracaoCurvaPrecipitacao = {
    tipo: TipoCurvaPrecipitacao;
  
    grandeza:
      GrandezaCurvaPrecipitacao;
  
    volumeAmostra: number;
  
    /**
     * Volume de equivalência determinado pela estequiometria.
     *
     * A unidade deve ser a mesma utilizada em:
     * - volume inicial;
     * - volume final;
     * - incremento.
     */
    volumeEquivalencia: number;
  
    volumeInicial?: number;
  
    /**
     * Quando não for informado, será adotado
     * 2 vezes o volume de equivalência.
     */
    volumeFinal?: number;
  
    /**
     * Pode ser usado no lugar de numeroDePontos.
     */
    incremento?: number;
  
    /**
     * Quantidade total aproximada de pontos da curva.
     *
     * O padrão é 401 para fornecer resolução suficiente
     * nas derivadas.
     */
    numeroDePontos?: number;
  
    /**
     * Tolerância utilizada para classificar um ponto
     * como localizado no ponto de equivalência.
     */
    toleranciaPE?: number;
  
    /**
     * Função química responsável pelo cálculo de cada ponto.
     *
     * Ela deve chamar o motor já validado do módulo
     * de precipitação.
     */
    calcularPonto: (
      volumeTitulante: number
    ) => PontoCalculadoPrecipitacao;
  };
  
  export type ResultadoCurvaPrecipitacao = {
    tipo: TipoCurvaPrecipitacao;
  
    grandeza:
      GrandezaCurvaPrecipitacao;
  
    volumeEquivalenciaTeorico:
      number;
  
    volumeEquivalenciaDerivadas:
      number | null;
  
    diferencaEntrePEs:
      number | null;
  
    erroRelativoPEPercentual:
      number | null;
  
    estimativaDerivadas:
      EstimativaPontoEquivalencia;
  
    pontos:
      PontoCurvaPrecipitacao[];
  
    graficoCurva:
      PontoGraficoCurvaPrecipitacao[];
  
    graficoPrimeiraDerivada:
      PontoGraficoPrimeiraDerivada[];
  
    graficoSegundaDerivada:
      PontoGraficoSegundaDerivada[];
  
    pontoMaisProximoDoPE:
      PontoCurvaPrecipitacao | null;
  
    avisos:
      AvisoCurvaPrecipitacao[];
  };
  
  const EPSILON = 1e-12;
  
  const NUMERO_PADRAO_DE_PONTOS =
    401;
  
  const NUMERO_MINIMO_DE_PONTOS =
    5;
  
  const NUMERO_MAXIMO_DE_PONTOS =
    10_001;
  
  function validarNumeroFinito(
    valor: number,
    nome: string
  ): void {
    if (!Number.isFinite(valor)) {
      throw new Error(
        `${nome} precisa ser um número finito.`
      );
    }
  }
  
  function validarNumeroPositivo(
    valor: number,
    nome: string
  ): void {
    validarNumeroFinito(
      valor,
      nome
    );
  
    if (valor <= 0) {
      throw new Error(
        `${nome} precisa ser maior que zero.`
      );
    }
  }
  
  function limitarInteiro(
    valor: number,
    minimo: number,
    maximo: number
  ): number {
    if (!Number.isFinite(valor)) {
      return minimo;
    }
  
    return Math.min(
      Math.max(
        Math.round(valor),
        minimo
      ),
      maximo
    );
  }
  
  function determinarVolumeFinal(
    parametros:
      ParametrosGeracaoCurvaPrecipitacao
  ): number {
    const {
      volumeFinal,
      volumeEquivalencia,
    } = parametros;
  
    if (
      volumeFinal !== undefined
    ) {
      return volumeFinal;
    }
  
    return (
      volumeEquivalencia * 2
    );
  }
  
  function determinarToleranciaPE(
    parametros:
      ParametrosGeracaoCurvaPrecipitacao,
    passo: number
  ): number {
    const toleranciaInformada =
      parametros.toleranciaPE;
  
    if (
      toleranciaInformada !==
      undefined
    ) {
      validarNumeroFinito(
        toleranciaInformada,
        "A tolerância do ponto de equivalência"
      );
  
      if (
        toleranciaInformada < 0
      ) {
        throw new Error(
          "A tolerância do ponto de equivalência não pode ser negativa."
        );
      }
  
      return toleranciaInformada;
    }
  
    /*
     * Metade do passo permite classificar como "No PE"
     * o ponto amostrado mais próximo do volume teórico.
     */
    return Math.max(
      passo / 2,
      EPSILON
    );
  }
  
  function determinarNumeroDePontos(
    parametros:
      ParametrosGeracaoCurvaPrecipitacao,
    volumeInicial: number,
    volumeFinal: number
  ): number {
    const {
      incremento,
      numeroDePontos,
    } = parametros;
  
    if (
      incremento !== undefined
    ) {
      validarNumeroPositivo(
        incremento,
        "O incremento de volume"
      );
  
      const intervalo =
        volumeFinal -
        volumeInicial;
  
      return limitarInteiro(
        Math.floor(
          intervalo /
            incremento
        ) + 1,
        NUMERO_MINIMO_DE_PONTOS,
        NUMERO_MAXIMO_DE_PONTOS
      );
    }
  
    return limitarInteiro(
      numeroDePontos ??
        NUMERO_PADRAO_DE_PONTOS,
      NUMERO_MINIMO_DE_PONTOS,
      NUMERO_MAXIMO_DE_PONTOS
    );
  }
  
  function classificarRegiao(
    volumeTitulante: number,
    volumeEquivalencia: number,
    tolerancia: number
  ): RegiaoCurvaPrecipitacao {
    const diferenca =
      volumeTitulante -
      volumeEquivalencia;
  
    if (
      Math.abs(diferenca) <=
      tolerancia
    ) {
      return "No PE";
    }
  
    return diferenca < 0
      ? "Antes do PE"
      : "Após o PE";
  }
  
  function calcularFracaoDoPE(
    volumeTitulante: number,
    volumeEquivalencia: number
  ): number | null {
    if (
      Math.abs(
        volumeEquivalencia
      ) <= EPSILON
    ) {
      return null;
    }
  
    return (
      volumeTitulante /
      volumeEquivalencia
    );
  }
  
  function normalizarCampoOpcional(
    valor:
      | number
      | null
      | undefined
  ): number | null {
    if (
      valor === undefined ||
      valor === null ||
      !Number.isFinite(valor)
    ) {
      return null;
    }
  
    return valor;
  }
  
  function criarVolumesRegulares(
    volumeInicial: number,
    volumeFinal: number,
    numeroDePontos: number
  ): number[] {
    if (
      numeroDePontos <= 1
    ) {
      return [volumeInicial];
    }
  
    const passo =
      (
        volumeFinal -
        volumeInicial
      ) /
      (
        numeroDePontos -
        1
      );
  
    return Array.from(
      {
        length:
          numeroDePontos,
      },
      (_, indice) => {
        if (
          indice ===
          numeroDePontos - 1
        ) {
          return volumeFinal;
        }
  
        return (
          volumeInicial +
          indice * passo
        );
      }
    );
  }
  
  /**
   * Insere explicitamente o volume de equivalência na lista.
   *
   * Isso evita que a malha regular passe ao lado do PE,
   * melhorando a tabela e a análise das derivadas.
   */
  function inserirVolumeEquivalencia(
    volumes: number[],
    volumeEquivalencia: number,
    volumeInicial: number,
    volumeFinal: number
  ): number[] {
    const peDentroDoIntervalo =
      volumeEquivalencia >=
        volumeInicial &&
      volumeEquivalencia <=
        volumeFinal;
  
    if (!peDentroDoIntervalo) {
      return volumes;
    }
  
    const jaExiste =
      volumes.some(
        (volume) =>
          Math.abs(
            volume -
              volumeEquivalencia
          ) <= EPSILON
      );
  
    if (jaExiste) {
      return volumes;
    }
  
    return [
      ...volumes,
      volumeEquivalencia,
    ].sort(
      (volumeA, volumeB) =>
        volumeA -
        volumeB
    );
  }
  
  function encontrarPontoMaisProximo(
    pontos:
      PontoCurvaPrecipitacao[],
    volumeReferencia: number
  ): PontoCurvaPrecipitacao | null {
    if (pontos.length === 0) {
      return null;
    }
  
    return pontos.reduce(
      (
        melhorPonto,
        pontoAtual
      ) => {
        const distanciaMelhor =
          Math.abs(
            melhorPonto
              .volumeTitulante -
              volumeReferencia
          );
  
        const distanciaAtual =
          Math.abs(
            pontoAtual
              .volumeTitulante -
              volumeReferencia
          );
  
        return distanciaAtual <
          distanciaMelhor
          ? pontoAtual
          : melhorPonto;
      }
    );
  }
  
  function calcularComparacaoPE(
    volumeTeorico: number,
    volumeDerivadas:
      number | null
  ): {
    diferenca: number | null;
    erroRelativoPercentual:
      number | null;
  } {
    if (
      volumeDerivadas === null
    ) {
      return {
        diferenca: null,
        erroRelativoPercentual:
          null,
      };
    }
  
    const diferenca =
      volumeDerivadas -
      volumeTeorico;
  
    if (
      Math.abs(volumeTeorico) <=
      EPSILON
    ) {
      return {
        diferenca,
        erroRelativoPercentual:
          null,
      };
    }
  
    return {
      diferenca,
  
      erroRelativoPercentual:
        (
          Math.abs(diferenca) /
          Math.abs(
            volumeTeorico
          )
        ) * 100,
    };
  }
  
  function construirAvisos(
    pontos:
      PontoCurvaPrecipitacao[],
    volumeInicial: number,
    volumeFinal: number,
    volumeEquivalencia: number,
    estimativa:
      EstimativaPontoEquivalencia,
    erroRelativoPE:
      number | null
  ): AvisoCurvaPrecipitacao[] {
    const avisos:
      AvisoCurvaPrecipitacao[] =
      [];
  
    if (
      volumeEquivalencia <
        volumeInicial ||
      volumeEquivalencia >
        volumeFinal
    ) {
      avisos.push({
        codigo:
          "PE_FORA_DO_INTERVALO",
  
        mensagem:
          "O volume de equivalência teórico está fora do intervalo utilizado para gerar a curva.",
  
        nivel: "erro",
      });
    }
  
    if (
      pontos.length <
      101
    ) {
      avisos.push({
        codigo:
          "BAIXA_RESOLUCAO",
  
        mensagem:
          "A curva possui poucos pontos. A primeira e a segunda derivadas podem ficar pouco definidas próximas ao ponto de equivalência.",
  
        nivel: "atencao",
      });
    }
  
    if (
      estimativa.volumeEstimado ===
      null
    ) {
      avisos.push({
        codigo:
          "PE_DERIVADAS_NAO_ENCONTRADO",
  
        mensagem:
          "Não foi possível estimar o ponto de equivalência pelas derivadas da curva.",
  
        nivel: "atencao",
      });
    }
  
    if (
      estimativa.metodo ===
      "primeiraDerivada"
    ) {
      avisos.push({
        codigo:
          "PE_APENAS_PRIMEIRA_DERIVADA",
  
        mensagem:
          "O ponto de equivalência foi estimado apenas pelo máximo da primeira derivada, pois não foi localizado um cruzamento adequado da segunda derivada.",
  
        nivel: "informacao",
      });
    }
  
    if (
      erroRelativoPE !== null &&
      erroRelativoPE > 5
    ) {
      avisos.push({
        codigo:
          "DIVERGENCIA_PE",
  
        mensagem:
          "O ponto de equivalência estimado pelas derivadas apresentou diferença superior a 5% em relação ao valor estequiométrico. Verifique a resolução da curva e o cálculo químico dos pontos.",
  
        nivel: "atencao",
      });
    }
  
    return avisos;
  }
  
  function associarDerivadasAosPontos(
    pontosCalculados:
      Omit<
        PontoCurvaPrecipitacao,
        | "primeiraDerivada"
        | "segundaDerivada"
      >[],
    pontosComDerivadas:
      PontoCurvaComDerivadas[]
  ): PontoCurvaPrecipitacao[] {
    const derivadasPorVolume =
      new Map<
        number,
        PontoCurvaComDerivadas
      >();
  
    for (
      const ponto of
        pontosComDerivadas
    ) {
      derivadasPorVolume.set(
        ponto.volume,
        ponto
      );
    }
  
    return pontosCalculados.map(
      (ponto) => {
        const derivadas =
          derivadasPorVolume.get(
            ponto.volumeTitulante
          );
  
        return {
          ...ponto,
  
          primeiraDerivada:
            derivadas
              ?.primeiraDerivada ??
            null,
  
          segundaDerivada:
            derivadas
              ?.segundaDerivada ??
            null,
        };
      }
    );
  }
  
  /**
   * Gera a curva completa de uma titulação por precipitação.
   *
   * Esta função não substitui o motor químico validado.
   * Ela organiza os resultados produzidos por `calcularPonto`
   * e acrescenta derivadas, regiões e dados para os gráficos.
   */
  export function gerarCurvaPrecipitacao(
    parametros:
      ParametrosGeracaoCurvaPrecipitacao
  ): ResultadoCurvaPrecipitacao {
    const {
      tipo,
      grandeza,
      volumeAmostra,
      volumeEquivalencia,
      calcularPonto,
    } = parametros;
  
    validarNumeroPositivo(
      volumeAmostra,
      "O volume da amostra"
    );
  
    validarNumeroPositivo(
      volumeEquivalencia,
      "O volume de equivalência"
    );
  
    if (
      typeof calcularPonto !==
      "function"
    ) {
      throw new Error(
        "É necessário fornecer uma função para calcular os pontos da curva."
      );
    }
  
    const volumeInicial =
      parametros.volumeInicial ??
      0;
  
    const volumeFinal =
      determinarVolumeFinal(
        parametros
      );
  
    validarNumeroFinito(
      volumeInicial,
      "O volume inicial"
    );
  
    validarNumeroPositivo(
      volumeFinal,
      "O volume final"
    );
  
    if (
      volumeInicial < 0
    ) {
      throw new Error(
        "O volume inicial não pode ser negativo."
      );
    }
  
    if (
      volumeFinal <=
      volumeInicial
    ) {
      throw new Error(
        "O volume final precisa ser maior que o volume inicial."
      );
    }
  
    const numeroDePontos =
      determinarNumeroDePontos(
        parametros,
        volumeInicial,
        volumeFinal
      );
  
    const volumesRegulares =
      criarVolumesRegulares(
        volumeInicial,
        volumeFinal,
        numeroDePontos
      );
  
    const volumes =
      inserirVolumeEquivalencia(
        volumesRegulares,
        volumeEquivalencia,
        volumeInicial,
        volumeFinal
      );
  
    const passoMedio =
      (
        volumeFinal -
        volumeInicial
      ) /
      Math.max(
        volumes.length - 1,
        1
      );
  
    const toleranciaPE =
      determinarToleranciaPE(
        parametros,
        passoMedio
      );
  
    const pontosSemDerivadas =
      volumes.map(
        (
          volumeTitulante,
          indice
        ) => {
          const resultado =
            calcularPonto(
              volumeTitulante
            );
  
          if (
            !resultado ||
            !Number.isFinite(
              resultado.valor
            )
          ) {
            throw new Error(
              `O cálculo do ponto no volume ${volumeTitulante} retornou um valor inválido.`
            );
          }
  
          const volumeTotal =
            volumeAmostra +
            volumeTitulante;
  
          const distanciaDoPE =
            volumeTitulante -
            volumeEquivalencia;
  
          return {
            indice,
  
            volumeTitulante,
            volumeTotal,
  
            valor:
              resultado.valor,
  
            regiao:
              classificarRegiao(
                volumeTitulante,
                volumeEquivalencia,
                toleranciaPE
              ),
  
            distanciaDoPE,
  
            fracaoDoPE:
              calcularFracaoDoPE(
                volumeTitulante,
                volumeEquivalencia
              ),
  
            concentracaoAnalitoLivre:
              normalizarCampoOpcional(
                resultado
                  .concentracaoAnalitoLivre
              ),
  
            concentracaoTitulanteLivre:
              normalizarCampoOpcional(
                resultado
                  .concentracaoTitulanteLivre
              ),
  
            produtoIonico:
              normalizarCampoOpcional(
                resultado
                  .produtoIonico
              ),
  
            kps:
              normalizarCampoOpcional(
                resultado.kps
              ),
  
            precipitadoFormado:
              normalizarCampoOpcional(
                resultado
                  .precipitadoFormado
              ),
  
            metadados:
              resultado.metadados ??
              {},
          };
        }
      );
  
    const resultadoDerivadas =
      calcularDerivadasCurva(
        pontosSemDerivadas.map(
          (ponto) => ({
            volume:
              ponto.volumeTitulante,
  
            valor:
              ponto.valor,
          })
        )
      );
  
    const pontos =
      associarDerivadasAosPontos(
        pontosSemDerivadas,
        resultadoDerivadas.pontos
      );
  
    const graficoCurva =
      pontos.map(
        (ponto) => ({
          volume:
            ponto.volumeTitulante,
  
          valor:
            ponto.valor,
  
          regiao:
            ponto.regiao,
        })
      );
  
    const graficoPrimeiraDerivada =
      obterPontosPrimeiraDerivada(
        resultadoDerivadas
      );
  
    const graficoSegundaDerivada =
      obterPontosSegundaDerivada(
        resultadoDerivadas
      );
  
    const volumeEquivalenciaDerivadas =
      resultadoDerivadas
        .pontoEquivalencia
        .volumeEstimado;
  
    const comparacaoPE =
      calcularComparacaoPE(
        volumeEquivalencia,
        volumeEquivalenciaDerivadas
      );
  
    const pontoMaisProximoDoPE =
      encontrarPontoMaisProximo(
        pontos,
        volumeEquivalencia
      );
  
    const avisos =
      construirAvisos(
        pontos,
        volumeInicial,
        volumeFinal,
        volumeEquivalencia,
        resultadoDerivadas
          .pontoEquivalencia,
        comparacaoPE
          .erroRelativoPercentual
      );
  
    return {
      tipo,
      grandeza,
  
      volumeEquivalenciaTeorico:
        volumeEquivalencia,
  
      volumeEquivalenciaDerivadas,
  
      diferencaEntrePEs:
        comparacaoPE.diferenca,
  
      erroRelativoPEPercentual:
        comparacaoPE
          .erroRelativoPercentual,
  
      estimativaDerivadas:
        resultadoDerivadas
          .pontoEquivalencia,
  
      pontos,
  
      graficoCurva,
  
      graficoPrimeiraDerivada,
  
      graficoSegundaDerivada,
  
      pontoMaisProximoDoPE,
  
      avisos,
    };
  }