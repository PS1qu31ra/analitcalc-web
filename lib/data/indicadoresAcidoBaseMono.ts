export type IndicadorAcidoBaseMono = {
    id: string;
    nome: string;
    phMin: number;
    phMax: number;
    phCentral: number;
    faixa: string;
    ativo: boolean;
  };
  
  function criarIdIndicador(nome: string) {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  function criarIndicador(
    nome: string,
    phMin: number,
    phMax: number
  ): IndicadorAcidoBaseMono {
    return {
      id: criarIdIndicador(nome),
      nome,
      phMin,
      phMax,
      phCentral: (phMin + phMax) / 2,
      faixa: `${phMin.toFixed(1).replace(".", ",")} a ${phMax
        .toFixed(1)
        .replace(".", ",")}`,
      ativo: true,
    };
  }
  
  export const indicadoresAcidoBaseMono: IndicadorAcidoBaseMono[] = [
    criarIndicador("Violeta de metila", 0, 1.6),
    criarIndicador("Violeta cristal", 0, 1.8),
    criarIndicador("Violeta de etila", 0, 2.4),
    criarIndicador("Verde Malaquita", 0.2, 1.8),
    criarIndicador("2-((p-(dimetilamino)fenil)azo)piridina (Prim.f.)", 0.2, 1.8),
    criarIndicador("Vermelho de quinaladina", 1, 2.2),
    criarIndicador("Vermelho de parametila", 1, 3),
    criarIndicador("Azul de tornassol", 1, 6.9),
    criarIndicador("Amarelo metanil", 1.2, 2.4),
    criarIndicador("4-fenilazodifenilamina", 1.2, 2.6),
    criarIndicador("Azul de timol", 1.2, 2.8),
    criarIndicador("Púrpura de metacresol", 1.2, 2.8),
    criarIndicador("Tropaeolina 00", 1.2, 3.2),
    criarIndicador("4-o-tolilazo-o-toluidina", 1.4, 2.8),
    criarIndicador("Sal de sódio da eritrosina", 2.2, 3.6),
    criarIndicador("Benzopurpurina 4B", 2.2, 4.2),
    criarIndicador("N,N-dimetil-p-(m-toliazo)anilina", 2.6, 4.8),
    criarIndicador("2,4-Dinitrofenol", 2.8, 4),
    criarIndicador("Amarelo de Metilo", 2.9, 4),
    criarIndicador(
      "Ácido 4,4'-bis(2-amino-1-naftiliazo)2,2'-stibenedissulfônico",
      3,
      4
    ),
    criarIndicador(
      "Sal de potássio do éster etílico da tetrabromofenolftaleína",
      3,
      4.2
    ),
    criarIndicador("Azul de bromofenol", 3, 4.6),
    criarIndicador("Vermelho do congo", 3, 5.2),
    criarIndicador("Laranja de metilo", 3.1, 4.4),
    criarIndicador("Solução de alaranjado de metila-xileno cianol", 3.2, 4.2),
    criarIndicador("Alaranjado de etila", 3.4, 4.8),
    criarIndicador("2-((p-(dimetilamino)fenil)azo)piridina (Seg.f)", 4.4, 5.6),
    criarIndicador(
      "Monocloridrato de 4-(p-etoxifenilazo)-m-fenilenodiamina",
      4.4,
      5.8
    ),
    criarIndicador("Vermelho de metila", 4.4, 6.2),
    criarIndicador("Lacmoide", 4.4, 6.2),
    criarIndicador("Púrpura de bromocresol", 5.2, 6.8),
    criarIndicador("Azul de bromotimol", 6, 7.6),
    criarIndicador("Vermelho de fenol", 6.6, 8),
    criarIndicador("Púrpura de metacresol (seg.f.)", 7.4, 9),
    criarIndicador("Azul de timol (seg. f.)", 8, 9.6),
    criarIndicador("Fenolftaleína", 8.2, 10),
    criarIndicador("Timolftaleína", 9.4, 10.6),
    criarIndicador("Amarelo de alizarina R", 10.1, 12),
    criarIndicador("Carmim de indigo", 11.4, 13),
    criarIndicador("2,5-Dinitrofenol", 2.6, 4),
    criarIndicador("Verde de bromocresol", 3.8, 5.4),
    criarIndicador("Vermelho de clorofenol", 5, 6.6),
    criarIndicador("Vermelho de bromofenol", 5.2, 7),
    criarIndicador("Vermelho neutro", 6.8, 8),
    criarIndicador("Ácido rosólico", 6.8, 8.2),
    criarIndicador("Vermelho de cresol", 7.2, 8.8),
    criarIndicador("o-Cresolftaleína", 8.2, 10.4),
    criarIndicador("Tropaeolina O", 11.1, 12.7),
  ];
  
  export function buscarIndicadorAcidoBaseMonoPorId(id: string) {
    return indicadoresAcidoBaseMono.find((indicador) => indicador.id === id);
  }
  
  export function listarIndicadoresAcidoBaseMono() {
    return indicadoresAcidoBaseMono.filter((indicador) => indicador.ativo);
  }
  
  export function ranquearIndicadoresPorPhMono(phAlvo: number) {
    return indicadoresAcidoBaseMono
      .filter((indicador) => indicador.ativo)
      .map((indicador) => {
        const cobrePh = phAlvo >= indicador.phMin && phAlvo <= indicador.phMax;
        const erro = Math.abs(phAlvo - indicador.phCentral);
  
        let score = Math.max(0, 100 - erro * 25);
  
        if (cobrePh) {
          score += 15;
        }
  
        return {
          ...indicador,
          cobrePh,
          erro,
          score: Math.min(100, Math.round(score)),
          justificativa: cobrePh
            ? `${indicador.nome} é recomendado porque sua faixa de viragem cobre o pH do ponto de equivalência.`
            : `${indicador.nome} não cobre exatamente o pH do ponto de equivalência, mas está entre os indicadores mais próximos.`,
        };
      })
      .sort((a, b) => {
        if (a.cobrePh !== b.cobrePh) {
          return a.cobrePh ? -1 : 1;
        }
  
        if (b.score !== a.score) {
          return b.score - a.score;
        }
  
        return a.erro - b.erro;
      });
  }