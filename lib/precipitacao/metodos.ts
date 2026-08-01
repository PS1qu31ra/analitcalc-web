import type {
  MetodoPrecipitacao,
  ResultadoTitulacaoDiretaPrecipitacao,
  TitulanteMetodoPrecipitacao,
} from "./tipos";

const IDS_SAIS_HALOGENETOS_PRATA =
  new Set([
    "AgCl",
    "AgBr",
    "AgI",
  ]);

const TITULANTE_NITRATO_PRATA:
  TitulanteMetodoPrecipitacao = {
    nome: "Nitrato de prata",
    formula: "AgNO₃",
    especieAtiva: "Ag⁺",
  };

  const TITULANTE_TIOCIANATO:
  TitulanteMetodoPrecipitacao = {
    nome:
      "Solução padrão de tiocianato de potássio ou de amônio",
    formula:
      "KSCN ou NH₄SCN",
    especieAtiva:
      "SCN⁻",
  };

function resultadoValido(
  resultado:
    ResultadoTitulacaoDiretaPrecipitacao | null
) {
  return (
    resultado !== null &&
    resultado.status !==
      "dados_invalidos"
  );
}

function ordenarMetodos(
  metodos:
    MetodoPrecipitacao[]
) {
  const pesoStatus: Record<
    MetodoPrecipitacao["status"],
    number
  > = {
    recomendado: 0,
    possivel: 1,
    nao_recomendado: 2,
  };

  return [...metodos].sort(
    (
      metodoA,
      metodoB
    ) =>
      pesoStatus[
        metodoA.status
      ] -
      pesoStatus[
        metodoB.status
      ]
  );
}

export function avaliarMetodosPrecipitacao(
  resultado:
    ResultadoTitulacaoDiretaPrecipitacao | null
): MetodoPrecipitacao[] {
  if (
    !resultadoValido(
      resultado
    )
  ) {
    return [
      {
        id: "potenciometrico",
        nome: "Potenciometria",
        principio:
          "Acompanha a variação do potencial relacionada à concentração livre de uma espécie eletroativa.",
        status: "possivel",
        justificativa:
          "Informe dados válidos da titulação para que o sistema possa comparar os métodos de determinação do ponto final.",
      },
    ];
  }

  if (!resultado) {
    return [];
  }

  const sal =
    resultado.sal;

  const formulaAnalito =
    resultado.especieAnalito ===
    "cation"
      ? sal.cation
          .formulaExibicao
      : sal.anion
          .formulaExibicao;

  const formulaTitulante =
    resultado.especieTitulante ===
    "cation"
      ? sal.cation
          .formulaExibicao
      : sal.anion
          .formulaExibicao;
  
          const titulanteDoSistema:
  TitulanteMetodoPrecipitacao = {
    nome:
      resultado.especieTitulante ===
        "cation" &&
      sal.cation.id === "Ag+"
        ? "Nitrato de prata"
        : `Solução titulante de ${formulaTitulante}`,
    formula:
      resultado.especieTitulante ===
        "cation" &&
      sal.cation.id === "Ag+"
        ? "AgNO₃"
        : formulaTitulante,
    especieAtiva:
      formulaTitulante,
  };

  const titulanteEhPrata =
    resultado.especieTitulante ===
      "cation" &&
    sal.cation.id ===
      "Ag+";

  const analitoEhHaleto =
    resultado.especieAnalito ===
      "anion" &&
    (
      sal.anion.id ===
        "Cl-" ||
      sal.anion.id ===
        "Br-" ||
      sal.anion.id ===
        "I-"
    );

  const salEhHalogenetoPrata =
    IDS_SAIS_HALOGENETOS_PRATA.has(
      sal.id
    );

  const ehAgCl =
    sal.id === "AgCl";

  const ehAgBr =
    sal.id === "AgBr";

  const ehAgI =
    sal.id === "AgI";

  const ehAgSCN =
    sal.id === "AgSCN";

  const ehAg2CrO4 =
    sal.id ===
    "Ag2CrO4";

  const metodos:
    MetodoPrecipitacao[] =
    [];

  /*
   * =====================================================
   * POTENCIOMETRIA
   * =====================================================
   *
   * Método instrumental mais geral.
   *
   * A curva pode acompanhar:
   *
   * - concentração livre de Ag⁺;
   * - concentração livre do analito;
   * - potencial de um eletrodo seletivo;
   * - primeira e segunda derivadas da curva.
   */

  metodos.push({
    id:
      "potenciometrico",
    nome:
      "Potenciometria",
    principio:
      "Determina o ponto final pela variação do potencial de um eletrodo sensível à espécie livre presente na solução.",
    status:
      "recomendado",
    justificativa:
      `É uma alternativa geral para acompanhar a titulação de ${formulaAnalito} com ${formulaTitulante}, especialmente quando a mudança visual de um indicador é pouco nítida ou quando a amostra é colorida ou turva.`,
    titulante:
      titulanteDoSistema,
    meio: {
      descricao:
        "O meio deve ser compatível com o eletrodo utilizado e não deve favorecer reações paralelas, complexação significativa ou precipitações concorrentes.",
      observacao:
        "A faixa de pH deve ser definida conforme o sistema químico e o eletrodo selecionado.",
    },
    indicadores: [
      {
        id:
          "eletrodo-potenciometrico",
        nome:
          "Eletrodo potenciométrico",
        tipo:
          "eletroquimico",
        mudancaVisual:
          "Não há mudança visual obrigatória; o ponto final é identificado pela variação do potencial.",
        observacao:
          "Pode ser utilizado eletrodo indicador de prata ou outro eletrodo apropriado para a espécie monitorada.",
      },
    ],
    reacoes: [
      {
        descricao:
          "Reação principal de precipitação",
        equacao:
          `${formulaTitulante}(aq) + ${formulaAnalito}(aq) ⇌ ${sal.formulaExibicao}(s)`,
      },
    ],
    observacoes: [
      "Adequada para amostras coloridas ou turvas.",
      "Pode ser associada à análise da primeira e da segunda derivadas da curva.",
      "A resposta depende da estabilidade e da calibração do sistema de eletrodos.",
    ],
  });

  /*
   * =====================================================
   * MÉTODO DE MOHR
   * =====================================================
   *
   * Aplicação clássica:
   *
   * Cl⁻ ou Br⁻ titulados diretamente com solução
   * padrão de AgNO₃.
   *
   * Indicador:
   *
   * CrO₄²⁻, normalmente fornecido por K₂CrO₄.
   *
   * Reação principal:
   *
   * Ag⁺(aq) + X⁻(aq) ⇌ AgX(s)
   *
   * Reação do ponto final:
   *
   * 2 Ag⁺(aq) + CrO₄²⁻(aq)
   * ⇌ Ag₂CrO₄(s)
   *
   * Faixa recomendada:
   *
   * aproximadamente pH 6,5 a 10,0.
   */

  let statusMohr:
    MetodoPrecipitacao["status"];

  let justificativaMohr:
    string;

  if (
    titulanteEhPrata &&
    analitoEhHaleto &&
    (
      ehAgCl ||
      ehAgBr
    )
  ) {
    statusMohr =
      "recomendado";

    justificativaMohr =
      `O método de Mohr é adequado para a titulação direta de ${formulaAnalito} com solução padrão de nitrato de prata. Após o consumo do analito, um pequeno excesso de Ag⁺ reage com o cromato indicador e forma Ag₂CrO₄(s), de coloração vermelho-tijolo. O pH deve ser mantido aproximadamente entre 6,5 e 10,0.`;
  } else if (
    ehAgI
  ) {
    statusMohr =
      "nao_recomendado";

    justificativaMohr =
      "O método de Mohr não é normalmente recomendado para iodeto. A adsorção do iodeto e do cromato sobre o AgI(s) pode tornar a mudança do ponto final imprecisa.";
  } else if (
    ehAg2CrO4
  ) {
    statusMohr =
      "nao_recomendado";

    justificativaMohr =
      "O cromato é o indicador do método de Mohr. O sistema não deve ser tratado como uma aplicação convencional de Mohr quando o próprio precipitado principal é Ag₂CrO₄(s).";
  } else if (
    titulanteEhPrata &&
    analitoEhHaleto
  ) {
    statusMohr =
      "possivel";

    justificativaMohr =
      "O sistema envolve um haleto titulado com nitrato de prata, mas a aplicação clássica do método de Mohr é mais confiável para Cl⁻ e Br⁻. A identidade do haleto e as condições experimentais precisam ser avaliadas.";
  } else {
    statusMohr =
      "nao_recomendado";

    justificativaMohr =
      `O método de Mohr é destinado principalmente à titulação direta de Cl⁻ ou Br⁻ com solução de AgNO₃. O sistema selecionado envolve ${formulaAnalito} e ${formulaTitulante}, portanto não corresponde à sua aplicação clássica.`;
  }

  metodos.push({
    id:
      "mohr",
    nome:
      "Método de Mohr",
    principio:
      "Utiliza cromato como indicador de precipitação. Após o consumo do haleto, o primeiro excesso persistente de Ag⁺ forma Ag₂CrO₄(s), de coloração vermelho-tijolo.",
    status:
      statusMohr,
    justificativa:
      justificativaMohr,
    titulante:
      TITULANTE_NITRATO_PRATA,
    meio: {
      descricao:
        "Meio aproximadamente neutro ou levemente alcalino.",
      phMinimo:
        6.5,
      phMaximo:
        10,
      observacao:
        "Em meio muito ácido, o equilíbrio cromato–dicromato reduz a disponibilidade de CrO₄²⁻. Em meio excessivamente alcalino, podem ocorrer reações paralelas envolvendo Ag⁺.",
    },
    indicadores: [
      {
        id:
          "cromato",
        nome:
          "Cromato",
        formula:
          "CrO₄²⁻",
        tipo:
          "precipitacao",
        phMinimo:
          6.5,
        phMaximo:
          10,
        mudancaVisual:
          "Aparecimento persistente de Ag₂CrO₄(s), com coloração vermelho-tijolo.",
        observacao:
          "Normalmente adicionado na forma de solução de cromato de potássio, K₂CrO₄.",
      },
    ],
    reacoes: [
      {
        descricao:
          "Reação principal",
        equacao:
          `Ag⁺(aq) + ${formulaAnalito}(aq) ⇌ ${sal.formulaExibicao}(s)`,
      },
      {
        descricao:
          "Reação indicadora do ponto final",
        equacao:
          "2 Ag⁺(aq) + CrO₄²⁻(aq) ⇌ Ag₂CrO₄(s)",
      },
    ],
    observacoes: [
      "Aplicação clássica para determinação direta de Cl⁻ e Br⁻.",
      "O método não é normalmente recomendado para I⁻.",
      "O ponto final deve corresponder ao primeiro aparecimento persistente da coloração vermelho-tijolo.",
    ],
  });

  /*
   * =====================================================
   * MÉTODO DE VOLHARD
   * =====================================================
   *
   * Aplicação direta:
   *
   * Ag⁺ titulado com SCN⁻.
   *
   * Titulante:
   *
   * solução padrão de KSCN ou NH₄SCN.
   *
   * Indicador:
   *
   * Fe³⁺.
   *
   * Reação principal:
   *
   * Ag⁺(aq) + SCN⁻(aq) ⇌ AgSCN(s)
   *
   * Reação indicadora:
   *
   * Fe³⁺(aq) + SCN⁻(aq)
   * ⇌ [FeSCN]²⁺(aq)
   *
   * O método é realizado em meio ácido,
   * normalmente acidificado com HNO₃.
   */

  let statusVolhard:
    MetodoPrecipitacao["status"];

  let justificativaVolhard:
    string;

  if (
    ehAgSCN
  ) {
    statusVolhard =
      "recomendado";

    justificativaVolhard =
      "O sistema Ag⁺/SCN⁻ corresponde diretamente à reação titulométrica do método de Volhard. Após a precipitação da prata como AgSCN(s), o primeiro excesso de SCN⁻ forma um complexo vermelho com Fe³⁺ em meio ácido.";
  } else if (
    salEhHalogenetoPrata &&
    analitoEhHaleto
  ) {
    statusVolhard =
      "possivel";

    justificativaVolhard =
      `O método de Volhard pode ser utilizado para determinar ${formulaAnalito} por retrotitulação. Adiciona-se excesso conhecido de solução de AgNO₃, precipita-se o haleto como ${sal.formulaExibicao}(s) e titula-se o Ag⁺ remanescente com SCN⁻ em meio ácido.`;
  } else if (
    resultado.especieAnalito ===
      "cation" &&
    sal.cation.id ===
      "Ag+"
  ) {
    statusVolhard =
      "recomendado";

    justificativaVolhard =
      "O método de Volhard é diretamente aplicável à determinação de Ag⁺ por titulação com solução padrão de tiocianato em meio ácido, usando Fe³⁺ como indicador.";
  } else {
    statusVolhard =
      "nao_recomendado";

    justificativaVolhard =
      `O método de Volhard é destinado principalmente à determinação de Ag⁺ ou de haletos por retorno. O sistema selecionado, baseado em ${sal.formulaExibicao}, não corresponde diretamente a essa aplicação.`;
  }

  metodos.push({
    id:
      "volhard",
    nome:
      "Método de Volhard",
    principio:
      "Titula Ag⁺ com SCN⁻ em meio ácido. Após a precipitação da prata, o primeiro excesso de SCN⁻ forma um complexo vermelho com Fe³⁺.",
    status:
      statusVolhard,
    justificativa:
      justificativaVolhard,
    titulante:
      TITULANTE_TIOCIANATO,
    meio: {
      descricao:
        "Meio ácido, normalmente acidificado com ácido nítrico.",
      observacao:
        "O meio ácido reduz a hidrólise do Fe³⁺ e favorece a observação do complexo indicador.",
    },
    indicadores: [
      {
        id:
          "ferro-iii",
        nome:
          "Íon ferro(III)",
        formula:
          "Fe³⁺",
        tipo:
          "complexacao",
        mudancaVisual:
          "Formação de coloração vermelha persistente pelo complexo com SCN⁻.",
        observacao:
          "O indicador é frequentemente fornecido por uma solução de sal de ferro(III).",
      },
    ],
    reacoes: [
      {
        descricao:
          "Reação principal",
        equacao:
          "Ag⁺(aq) + SCN⁻(aq) ⇌ AgSCN(s)",
      },
      {
        descricao:
          "Reação indicadora do ponto final",
        equacao:
          "Fe³⁺(aq) + SCN⁻(aq) ⇌ [FeSCN]²⁺(aq)",
      },
    ],
    observacoes: [
      "Pode ser aplicado diretamente à determinação de Ag⁺.",
      "Para haletos, é normalmente empregado por retrotitulação.",
      "Na retrotitulação, adiciona-se excesso conhecido de AgNO₃ e determina-se o Ag⁺ remanescente com SCN⁻.",
    ],
  });

  /*
   * =====================================================
   * MÉTODO DE FAJANS
   * =====================================================
   *
   * Utiliza indicadores de adsorção.
   *
   * Antes do ponto de equivalência:
   *
   * a superfície do precipitado tende a adsorver
   * o íon do analito presente em excesso.
   *
   * Depois do ponto de equivalência:
   *
   * a superfície passa a adsorver o íon do
   * titulante em excesso.
   *
   * Essa inversão permite a adsorção do indicador
   * aniônico e a mudança de cor.
   *
   * Indicadores incluídos:
   *
   * - fluoresceína;
   * - diclorofluoresceína.
   */

  let statusFajans:
  MetodoPrecipitacao["status"];
let justificativaFajans:
  string;

if (
  titulanteEhPrata &&
  ehAgCl
) {
  statusFajans =
    "recomendado";

  justificativaFajans =
    "O AgCl(s) apresenta inversão de carga superficial próxima ao ponto de equivalência, permitindo o uso de fluoresceína ou diclorofluoresceína como indicadores de adsorção. O pH deve manter o indicador em sua forma aniônica e evitar reações paralelas envolvendo Ag⁺.";
} else if (
  titulanteEhPrata &&
  ehAgBr
) {
  statusFajans =
    "recomendado";

  justificativaFajans =
    "O AgBr(s) pode apresentar inversão de carga superficial próxima ao ponto de equivalência. Indicadores de adsorção, especialmente a diclorofluoresceína, podem ser utilizados com controle do pH, da força iônica e do estado de dispersão do precipitado.";
} else if (
  titulanteEhPrata &&
  ehAgI
) {
  statusFajans =
    "possivel";

  justificativaFajans =
    "Indicadores de adsorção podem ser empregados em alguns sistemas contendo AgI(s), mas a adsorção intensa e as características superficiais do precipitado exigem seleção cuidadosa do indicador e das condições experimentais.";
} else if (
  salEhHalogenetoPrata
) {
  statusFajans =
    "possivel";

  justificativaFajans =
    `O sistema forma ${sal.formulaExibicao}(s), que pode permitir a aplicação de um indicador de adsorção. A adequação depende da carga superficial, da ordem de adição, do pH e da ionização do indicador.`;
} else {
  statusFajans =
    "nao_recomendado";

  justificativaFajans =
    `O método de Fajans depende de uma inversão previsível da carga superficial do precipitado e da adsorção de um indicador ionizado. Não há, para ${sal.formulaExibicao}, uma aplicação geral tão estabelecida quanto para os haletos de prata.`;
}

metodos.push({
  id:
    "fajans",
  nome:
    "Método de Fajans",
  principio:
    "Utiliza um indicador de adsorção. Próximo ao ponto de equivalência, a inversão da carga superficial do precipitado favorece a adsorção do indicador e produz uma mudança visual.",
  status:
    statusFajans,
  justificativa:
    justificativaFajans,
  titulante:
    TITULANTE_NITRATO_PRATA,
  meio: {
    descricao:
      "O pH deve manter o indicador suficientemente ionizado e preservar a dispersão do precipitado.",
    observacao:
      "A faixa adequada depende do indicador selecionado, da composição da amostra e das características superficiais do precipitado.",
  },
  indicadores: [
    {
      id:
        "fluoresceina",
      nome:
        "Fluoresceína",
      tipo:
        "adsorcao",
      phMinimo:
        7,
      phMaximo:
        10,
      mudancaVisual:
        "Mudança de coloração associada à adsorção da forma aniônica do indicador na superfície do precipitado.",
      observacao:
        "Indicador de adsorção tradicionalmente associado a sistemas com AgCl. Requer meio capaz de manter uma fração adequada do indicador na forma ionizada.",
    },
    {
      id:
        "diclorofluoresceina",
      nome:
        "Diclorofluoresceína",
      tipo:
        "adsorcao",
      phMinimo:
        4,
      phMaximo:
        10,
      mudancaVisual:
        "Mudança de coloração provocada pela adsorção do indicador aniônico após a inversão da carga superficial.",
      observacao:
        "Por ser mais ácida que a fluoresceína, pode permanecer ionizada em condições menos alcalinas. A faixa efetiva deve seguir o procedimento experimental adotado.",
    },
  ],
  reacoes: [
    {
      descricao:
        "Reação principal de precipitação",
      equacao:
        `Ag⁺(aq) + ${formulaAnalito}(aq) ⇌ ${sal.formulaExibicao}(s)`,
    },
  ],
  observacoes: [
    "Antes do ponto de equivalência, a superfície tende a adsorver o íon do analito presente em excesso.",
    "Após o ponto de equivalência, a adsorção de Ag⁺ altera a carga superficial do precipitado.",
    "A forma aniônica do indicador é então adsorvida, produzindo a mudança de cor.",
    "A coagulação excessiva do precipitado pode prejudicar a nitidez do ponto final.",
  ],
});

return ordenarMetodos(
  metodos
);

  return ordenarMetodos(
    metodos
  );
}