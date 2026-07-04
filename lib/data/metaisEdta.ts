export type SensibilidadePhMetalEdta = "Baixa" | "Média" | "Alta";
export type RiscoInterferenciaMetalEdta =
  | "Baixo"
  | "Médio"
  | "Alto"
  | "Muito alto";

export type MetalEdta = {
  idMetal: string;
  metal: string;
  nome: string;
  carga: number;
  classe: string;
  numeroCoordenacao: string;
  complexoFormado: string;
  cargaComplexo: number;
  reacaoGlobal: string;
  logKf: number;
  kf: number;
  estequiometria: string;
  sensibilidadePh: SensibilidadePhMetalEdta;
  riscoInterferencia: RiscoInterferenciaMetalEdta;
  observacao: string;
  referencia: string;
};

export const metaisEdta: MetalEdta[] = [
  {
    idMetal: "MG",
    metal: "Mg2+",
    nome: "Magnésio",
    carga: 2,
    classe: "Alcalino-terroso",
    numeroCoordenacao: "6",
    complexoFormado: "MgY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Mg²⁺ + Y⁴⁻ ⇌ MgY²⁻",
    logKf: 8.69,
    kf: 4.9e8,
    estequiometria: "1:1",
    sensibilidadePh: "Alta",
    riscoInterferencia: "Médio",
    observacao: "Depende de pH básico para complexação eficiente",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "CA",
    metal: "Ca2+",
    nome: "Cálcio",
    carga: 2,
    classe: "Alcalino-terroso",
    numeroCoordenacao: "6-8",
    complexoFormado: "CaY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Ca²⁺ + Y⁴⁻ ⇌ CaY²⁻",
    logKf: 10.7,
    kf: 5.0e10,
    estequiometria: "1:1",
    sensibilidadePh: "Alta",
    riscoInterferencia: "Médio",
    observacao: "Muito usado em dureza da água",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "CU",
    metal: "Cu2+",
    nome: "Cobre(II)",
    carga: 2,
    classe: "Metal de transição",
    numeroCoordenacao: "6",
    complexoFormado: "CuY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Cu²⁺ + Y⁴⁻ ⇌ CuY²⁻",
    logKf: 18.8,
    kf: 6.3e18,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Forma complexo muito estável com EDTA",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "ZN",
    metal: "Zn2+",
    nome: "Zinco(II)",
    carga: 2,
    classe: "Metal de transição",
    numeroCoordenacao: "4-6",
    complexoFormado: "ZnY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Zn²⁺ + Y⁴⁻ ⇌ ZnY²⁻",
    logKf: 16.5,
    kf: 3.2e16,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Titulação clássica por EDTA",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "FE3",
    metal: "Fe3+",
    nome: "Ferro(III)",
    carga: 3,
    classe: "Metal de transição",
    numeroCoordenacao: "6",
    complexoFormado: "FeY-",
    cargaComplexo: -1,
    reacaoGlobal: "Fe³⁺ + Y⁴⁻ ⇌ FeY⁻",
    logKf: 25.1,
    kf: 1.3e25,
    estequiometria: "1:1",
    sensibilidadePh: "Baixa",
    riscoInterferencia: "Muito alto",
    observacao: "Complexo extremamente estável, mas Fe3+ pode hidrolisar",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "AL",
    metal: "Al3+",
    nome: "Alumínio(III)",
    carga: 3,
    classe: "Metal pós-transição",
    numeroCoordenacao: "6",
    complexoFormado: "AlY-",
    cargaComplexo: -1,
    reacaoGlobal: "Al³⁺ + Y⁴⁻ ⇌ AlY⁻",
    logKf: 16.11,
    kf: 1.3e16,
    estequiometria: "1:1",
    sensibilidadePh: "Alta",
    riscoInterferencia: "Alto",
    observacao: "Sofre hidrólise significativa",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "PB",
    metal: "Pb2+",
    nome: "Chumbo(II)",
    carga: 2,
    classe: "Metal pesado",
    numeroCoordenacao: "6",
    complexoFormado: "PbY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Pb²⁺ + Y⁴⁻ ⇌ PbY²⁻",
    logKf: 18.04,
    kf: 1.1e18,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Interferente forte em complexometria",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "NI",
    metal: "Ni2+",
    nome: "Níquel(II)",
    carga: 2,
    classe: "Metal de transição",
    numeroCoordenacao: "6",
    complexoFormado: "NiY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Ni²⁺ + Y⁴⁻ ⇌ NiY²⁻",
    logKf: 18.62,
    kf: 4.2e18,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Complexo muito estável",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "CO",
    metal: "Co2+",
    nome: "Cobalto(II)",
    carga: 2,
    classe: "Metal de transição",
    numeroCoordenacao: "6",
    complexoFormado: "CoY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Co²⁺ + Y⁴⁻ ⇌ CoY²⁻",
    logKf: 16.3,
    kf: 2.0e16,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Compete com EDTA em soluções mistas",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "CD",
    metal: "Cd2+",
    nome: "Cádmio(II)",
    carga: 2,
    classe: "Metal pesado",
    numeroCoordenacao: "6",
    complexoFormado: "CdY2-",
    cargaComplexo: -2,
    reacaoGlobal: "Cd²⁺ + Y⁴⁻ ⇌ CdY²⁻",
    logKf: 16.46,
    kf: 2.9e16,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Alto",
    observacao: "Semelhante ao Zn2+",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "AG",
    metal: "Ag+",
    nome: "Prata(I)",
    carga: 1,
    classe: "Metal de transição",
    numeroCoordenacao: "2-4",
    complexoFormado: "AgY3-",
    cargaComplexo: -3,
    reacaoGlobal: "Ag⁺ + Y⁴⁻ ⇌ AgY³⁻",
    logKf: 7.32,
    kf: 2.1e7,
    estequiometria: "1:1",
    sensibilidadePh: "Média",
    riscoInterferencia: "Médio",
    observacao: "Complexo menos estável que metais divalentes",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
  {
    idMetal: "BI3",
    metal: "Bi3+",
    nome: "Bismuto(III)",
    carga: 3,
    classe: "Metal pós-transição",
    numeroCoordenacao: "6",
    complexoFormado: "BiY-",
    cargaComplexo: -1,
    reacaoGlobal: "Bi³⁺ + Y⁴⁻ ⇌ BiY⁻",
    logKf: 27.9,
    kf: 7.9e27,
    estequiometria: "1:1",
    sensibilidadePh: "Baixa",
    riscoInterferencia: "Muito alto",
    observacao: "Complexação extremamente forte",
    referencia: "Martell & Smith, Critical Stability Constants Vol.1",
  },
];

export function buscarMetalEdtaPorId(idMetal: string): MetalEdta | undefined {
  return metaisEdta.find(
    (item) => item.idMetal.toUpperCase() === idMetal.toUpperCase()
  );
}

export function buscarMetalEdtaPorFormula(metal: string): MetalEdta | undefined {
  return metaisEdta.find(
    (item) => item.metal.toUpperCase() === metal.toUpperCase()
  );
}

export function listarMetaisEdtaPorClasse(classe: string): MetalEdta[] {
  return metaisEdta.filter(
    (item) => item.classe.toUpperCase() === classe.toUpperCase()
  );
}

export function listarMetaisEdtaPorRisco(
  riscoInterferencia: RiscoInterferenciaMetalEdta
): MetalEdta[] {
  return metaisEdta.filter(
    (item) => item.riscoInterferencia === riscoInterferencia
  );
}

export function listarMetaisEdtaPorSensibilidadePh(
  sensibilidadePh: SensibilidadePhMetalEdta
): MetalEdta[] {
  return metaisEdta.filter(
    (item) => item.sensibilidadePh === sensibilidadePh
  );
}

export function calcularKfPorLogKf(logKf: number): number {
  return Math.pow(10, logKf);
}

export function calcularLogKf(kf: number): number {
  return Math.log10(kf);
}

export function calcularKfCondicionalEdta(params: {
  idMetal: string;
  alphaY4: number;
}) {
  const metal = buscarMetalEdtaPorId(params.idMetal);

  if (!metal) {
    return {
      encontrado: false,
      mensagem: "Metal não encontrado na base BD_METAIS_EDTA.",
    };
  }

  const kfCondicional = metal.kf * params.alphaY4;
  const logKfCondicional = Math.log10(kfCondicional);

  return {
    encontrado: true,
    metal,
    kfCondicional,
    logKfCondicional,
    mensagem: `Kf' calculado para ${metal.metal}: Kf × αY4 = ${kfCondicional}.`,
  };
}