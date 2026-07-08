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
    status: "Em desenvolvimento",
    area: "Equilíbrio ácido-base",
  },
];