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
];