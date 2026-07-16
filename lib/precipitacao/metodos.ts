import type {
    MetodoPrecipitacao,
    ResultadoTitulacaoDiretaPrecipitacao,
  } from "./tipos";
  
  export function avaliarMetodosPrecipitacao(
    resultado: ResultadoTitulacaoDiretaPrecipitacao | null
  ): MetodoPrecipitacao[] {
    if (!resultado || resultado.status === "dados_invalidos") {
      return [
        {
          id: "potenciometrico",
          nome: "Potenciometria",
          principio: "Mede a variação do potencial associada à espécie livre.",
          status: "possivel",
          justificativa:
            "Informe dados válidos da titulação para comparar os métodos de ponto final.",
        },
      ];
    }
  
    const sal = resultado.sal;
  
    const ehAgCl = sal.id === "AgCl";
    const ehAgBr = sal.id === "AgBr";
    const ehAgI = sal.id === "AgI";
    const ehAgSCN = sal.id === "AgSCN";
    const ehCromatoPrata = sal.id === "Ag2CrO4";
  
    const metodos: MetodoPrecipitacao[] = [];
  
    metodos.push({
      id: "potenciometrico",
      nome: "Potenciometria",
      principio:
        "Acompanha a mudança de potencial causada pela variação da espécie livre na solução.",
      status: "recomendado",
      justificativa:
        "É um método geral para titulações de precipitação, especialmente útil quando a mudança visual do indicador não é suficientemente nítida.",
    });
  
    metodos.push({
      id: "mohr",
      nome: "Método de Mohr",
      principio:
        "Usa cromato como indicador; após consumir o haleto, o excesso de Ag⁺ forma Ag₂CrO₄ vermelho-tijolo.",
      status: ehAgCl || ehAgBr ? "recomendado" : "nao_recomendado",
      justificativa:
        ehAgCl || ehAgBr
          ? "É adequado para titulação direta de Cl⁻ ou Br⁻ com Ag⁺ em condições controladas de pH."
          : ehCromatoPrata
            ? "Não faz sentido usar cromato como indicador se o próprio precipitado selecionado já é Ag₂CrO₄."
            : "Não é a melhor escolha para este sistema, pois o método de Mohr é mais associado à determinação direta de Cl⁻ e Br⁻.",
    });
  
    metodos.push({
      id: "volhard",
      nome: "Método de Volhard",
      principio:
        "Usa SCN⁻ em meio ácido para titular Ag⁺, normalmente em procedimento por retorno com indicador Fe³⁺.",
      status: ehAgSCN || ehAgCl || ehAgBr || ehAgI ? "possivel" : "nao_recomendado",
      justificativa:
        ehAgSCN
          ? "O sistema envolve AgSCN, diretamente relacionado à etapa titulométrica do método de Volhard."
          : ehAgCl || ehAgBr || ehAgI
            ? "Pode ser usado principalmente em titulação por retorno, em que o excesso de Ag⁺ é titulado com SCN⁻."
            : "Não é o método mais coerente para este precipitado na forma direta.",
    });
  
    metodos.push({
      id: "fajans",
      nome: "Método de Fajans",
      principio:
        "Usa indicador de adsorção; a mudança ocorre quando a carga superficial do precipitado se altera próximo ao ponto final.",
      status: ehAgCl || ehAgBr || ehAgI ? "possivel" : "nao_recomendado",
      justificativa:
        ehAgCl || ehAgBr || ehAgI
          ? "Pode ser aplicado a haletos de prata quando há indicador de adsorção adequado e condições controladas."
          : "Depende fortemente das propriedades de adsorção do precipitado, sendo menos geral para este sistema.",
    });
  
    return metodos.sort((a, b) => {
      const peso = {
        recomendado: 0,
        possivel: 1,
        nao_recomendado: 2,
      };
  
      return peso[a.status] - peso[b.status];
    });
  }