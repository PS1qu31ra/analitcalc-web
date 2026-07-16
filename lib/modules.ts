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
      "Módulo em desenvolvimento para equilíbrio de solubilidade, Kps, produto iônico, efeito do íon comum, curvas de titulação por precipitação, métodos e interferências.",
    href: "/precipitacao",
    status: "Em desenvolvimento",
    area: "Equilíbrio e titulação",
  },
];