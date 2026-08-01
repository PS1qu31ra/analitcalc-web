export type AnalitoArgentometricoDireto =
  | "Cl-"
  | "Br-"
  | "I-";

export type MetodoArgentometricoDireto =
  | "mohr"
  | "fajans";

export type ConfiguracaoMetodoDireto = {
  id: MetodoArgentometricoDireto;

  nome: string;

  indicador: string;

  /**
   * Faixa de pH recomendada para o método
   * ou para o indicador utilizado.
   */
  faixaPH: string;

  principio: string;

  /**
   * Reação utilizada para reconhecer o
   * ponto final da titulação.
   */
  equacaoIndicador: string;

  observacao: string;
};

export type ConfiguracaoAnalitoDireto = {
  id: AnalitoArgentometricoDireto;

  nome: string;

  formulaExibicao: string;

  salId:
    | "AgCl"
    | "AgBr"
    | "AgI";

  precipitado: string;

  /**
   * Solução preparada e utilizada na bureta.
   */
  titulante: string;

  /**
   * Espécie química do titulante que
   * participa efetivamente da reação.
   */
  especieAtivaTitulante: string;

  /**
   * Equação de precipitação.
   *
   * Utiliza seta de equilíbrio porque o
   * precipitado permanece em equilíbrio
   * com os íons dissolvidos.
   */
  equacao: string;

  metodos:
    ConfiguracaoMetodoDireto[];
};

export const analitosArgentometricosDiretos:
  ConfiguracaoAnalitoDireto[] = [
    {
      id: "Cl-",

      nome: "Cloreto",

      formulaExibicao:
        "Cl⁻",

      salId:
        "AgCl",

      precipitado:
        "AgCl(s)",

      titulante:
        "Solução padrão de nitrato de prata (AgNO₃)",

      especieAtivaTitulante:
        "Ag⁺",

      equacao:
        "Ag⁺(aq) + Cl⁻(aq) ⇌ AgCl(s)",

      metodos: [
        {
          id: "mohr",

          nome:
            "Método de Mohr",

          indicador:
            "Cromato de potássio (K₂CrO₄), fonte de CrO₄²⁻",

          faixaPH:
            "Aproximadamente pH 6,5 a 10,0",

          principio:
            "O cloreto é precipitado inicialmente como AgCl(s). Após o consumo do Cl⁻, o primeiro excesso persistente de Ag⁺ reage com o cromato do indicador, formando Ag₂CrO₄(s) de coloração vermelho-tijolo.",

          equacaoIndicador:
            "2 Ag⁺(aq) + CrO₄²⁻(aq) ⇌ Ag₂CrO₄(s)",

          observacao:
            "É um método direto clássico para cloreto. Em meio muito ácido, a concentração disponível de CrO₄²⁻ diminui; em meio excessivamente alcalino, a prata pode participar de reações paralelas. O ponto final corresponde ao aparecimento persistente de Ag₂CrO₄(s).",
        },

        {
          id: "fajans",

          nome:
            "Método de Fajans",

          indicador:
            "Fluoresceína ou diclorofluoresceína",

          faixaPH:
            "Fluoresceína: aproximadamente pH 7 a 10. Diclorofluoresceína: pode ser utilizada em meio menos alcalino, conforme o procedimento adotado.",

          principio:
            "Antes do ponto de equivalência, a superfície do AgCl(s) apresenta excesso de carga negativa devido à adsorção de Cl⁻. Após um pequeno excesso de Ag⁺, ocorre inversão da carga superficial e o indicador aniônico é adsorvido, provocando mudança de cor.",

          equacaoIndicador:
            "AgCl·Ag⁺(s) + Ind⁻(aq) ⇌ AgCl·Ag⁺·Ind⁻(s)",

          observacao:
            "A fluoresceína e a diclorofluoresceína são indicadores de adsorção. A escolha depende do pH e das condições experimentais. O precipitado deve permanecer suficientemente disperso, pois coagulação excessiva reduz a área superficial disponível para adsorção.",
        },
      ],
    },

    {
      id: "Br-",

      nome:
        "Brometo",

      formulaExibicao:
        "Br⁻",

      salId:
        "AgBr",

      precipitado:
        "AgBr(s)",

      titulante:
        "Solução padrão de nitrato de prata (AgNO₃)",

      especieAtivaTitulante:
        "Ag⁺",

      equacao:
        "Ag⁺(aq) + Br⁻(aq) ⇌ AgBr(s)",

      metodos: [
        {
          id: "mohr",

          nome:
            "Método de Mohr",

          indicador:
            "Cromato de potássio (K₂CrO₄), fonte de CrO₄²⁻",

          faixaPH:
            "Aproximadamente pH 6,5 a 10,0",

          principio:
            "O brometo é precipitado como AgBr(s). Após o consumo do Br⁻, o primeiro excesso persistente de Ag⁺ reage com CrO₄²⁻, produzindo Ag₂CrO₄(s) de coloração vermelho-tijolo.",

          equacaoIndicador:
            "2 Ag⁺(aq) + CrO₄²⁻(aq) ⇌ Ag₂CrO₄(s)",

          observacao:
            "A aplicação do método de Mohr ao brometo exige controle das condições experimentais e leitura cuidadosa da mudança de cor. O meio deve permanecer aproximadamente neutro ou levemente alcalino.",
        },

        {
          id: "fajans",

          nome:
            "Método de Fajans",

          indicador:
            "Eosina ou diclorofluoresceína, conforme o procedimento",

          faixaPH:
            "Dependente do indicador de adsorção selecionado e do procedimento validado",

          principio:
            "Próximo ao ponto de equivalência ocorre inversão da carga superficial do AgBr(s). Após pequeno excesso de Ag⁺, o indicador aniônico é adsorvido na superfície positiva do precipitado, produzindo a mudança visual do ponto final.",

          equacaoIndicador:
            "AgBr·Ag⁺(s) + Ind⁻(aq) ⇌ AgBr·Ag⁺·Ind⁻(s)",

          observacao:
            "A eosina é tradicionalmente associada a sistemas com brometo. A diclorofluoresceína também pode ser considerada quando prevista pelo procedimento. O pH, a força iônica e a dispersão do precipitado influenciam a adsorção e a nitidez do ponto final.",
        },
      ],
    },

    {
      id: "I-",

      nome:
        "Iodeto",

      formulaExibicao:
        "I⁻",

      salId:
        "AgI",

      precipitado:
        "AgI(s)",

      titulante:
        "Solução padrão de nitrato de prata (AgNO₃)",

      especieAtivaTitulante:
        "Ag⁺",

      equacao:
        "Ag⁺(aq) + I⁻(aq) ⇌ AgI(s)",

      metodos: [
        {
          id: "fajans",

          nome:
            "Método de Fajans",

          indicador:
            "Eosina ou indicador de adsorção específico para AgI",

          faixaPH:
            "Dependente do indicador e do procedimento experimental validado",

          principio:
            "O ponto final é identificado pela adsorção de um indicador aniônico na superfície do AgI(s) após a inversão da carga superficial provocada por pequeno excesso de Ag⁺.",

          equacaoIndicador:
            "AgI·Ag⁺(s) + Ind⁻(aq) ⇌ AgI·Ag⁺·Ind⁻(s)",

          observacao:
            "O AgI(s) apresenta forte adsorção superficial, tornando necessária uma seleção cuidadosa do indicador e das condições do meio. O método de Mohr não foi incluído para iodeto porque a adsorção do iodeto e do cromato pode prejudicar a definição do ponto final.",
        },
      ],
    },
  ];

export function obterAnalitoDireto(
  id: AnalitoArgentometricoDireto
) {
  return (
    analitosArgentometricosDiretos.find(
      (analito) =>
        analito.id === id
    ) ??
    analitosArgentometricosDiretos[0]
  );
}