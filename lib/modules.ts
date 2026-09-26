export type AnalitCalcModule = {
  title: string;
  description: string;
  href: string;
  status: "Disponível" | "Em desenvolvimento";
  area: string;
};

export const modules: AnalitCalcModule[] = [
  {
    title: "Complexometria com EDTA",
    description:
      "Cálculo de pM, metal livre, complexo formado, percentual complexado, região da titulação e interpretação dos resultados.",
    href: "/complexometria",
    status: "Disponível",
    area: "Equilíbrio e titulação",
  },

  {
    title: "Titulações ácido-base",
    description:
      "Estrutura para titulações de ácidos monopróticos, bases monobásicas, ácidos polipróticos e bases polibásicas, com curvas de pH, regiões tampão, indicadores e base do cálculo.",
    href: "/acido-base",
    status: "Disponível",
    area: "Equilíbrio ácido-base",
  },

  {
    title: "Volumetria de precipitação",
    description:
      "Cálculos de equilíbrio de solubilidade, Kps, produto iônico, efeito do íon comum, curvas de titulação por precipitação, métodos, seletividade e interferências.",
    href: "/precipitacao",
    status: "Disponível",
    area: "Equilíbrio e titulação",
  },

  {
    title: "Volumetria de oxirredução",
    description:
      "Titulações redox com balanço eletrônico, potenciais padrão de redução, equação de Nernst, estequiometria e curvas potenciométricas E × V.",
    href: "/oxirreducao",
    status: "Em desenvolvimento",
    area: "Equilíbrio e titulação redox",
  },
];