import type {
    ResultadoEquilibrioPrecipitacao,
    SalPrecipitacao,
  } from "./tipos";

  import { formatarPotenciaTexto } from "./formatadores";
  
  export function calcularSolubilidadeMolar(sal: SalPrecipitacao) {
    const a = sal.coeficienteCation;
    const b = sal.coeficienteAnion;
  
    if (
      !Number.isFinite(sal.kps) ||
      sal.kps <= 0 ||
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      a <= 0 ||
      b <= 0
    ) {
      return NaN;
    }
  
    const fatorEstequiometrico = Math.pow(a, a) * Math.pow(b, b);
    const ordemRaiz = a + b;
  
    return Math.pow(sal.kps / fatorEstequiometrico, 1 / ordemRaiz);
  }
  
  export function calcularEquilibrioPrecipitacao(
    sal: SalPrecipitacao
  ): ResultadoEquilibrioPrecipitacao {
    const solubilidadeMolar = calcularSolubilidadeMolar(sal);
  
    const concentracaoCationEquilibrio =
      sal.coeficienteCation * solubilidadeMolar;
  
    const concentracaoAnionEquilibrio =
      sal.coeficienteAnion * solubilidadeMolar;
  
    const pCation =
      concentracaoCationEquilibrio > 0
        ? -Math.log10(concentracaoCationEquilibrio)
        : NaN;
  
    const pAnion =
      concentracaoAnionEquilibrio > 0
        ? -Math.log10(concentracaoAnionEquilibrio)
        : NaN;
  
        const termoCation = formatarPotenciaTexto(
          `[${sal.cation.formulaExibicao}]`,
          sal.coeficienteCation
        );
        
        const termoAnion = formatarPotenciaTexto(
          `[${sal.anion.formulaExibicao}]`,
          sal.coeficienteAnion
        );
        
        const termoSolubilidadeCation = formatarPotenciaTexto(
          `(${sal.coeficienteCation}S)`,
          sal.coeficienteCation
        );
        
        const termoSolubilidadeAnion = formatarPotenciaTexto(
          `(${sal.coeficienteAnion}S)`,
          sal.coeficienteAnion
        );
        
        const expressaoKps = `Kps = ${termoCation} × ${termoAnion}`;
        
        const expressaoSolubilidade = `Kps = ${termoSolubilidadeCation} × ${termoSolubilidadeAnion}`;

    return {
      sal,
      solubilidadeMolar,
      concentracaoCationEquilibrio,
      concentracaoAnionEquilibrio,
      pCation,
      pAnion,
      expressaoKps,
      expressaoSolubilidade,
      mensagem:
        sal.coeficienteCation === 1 && sal.coeficienteAnion === 1
          ? "Para este sal 1:1, a solubilidade molar pode ser obtida por S = √Kps."
          : "Para este sal, a solubilidade molar depende da estequiometria da dissolução; portanto, não basta usar S = √Kps.",
    };
  }
  
  export function calcularProdutoIonicoPrecipitacao({
    sal,
    concentracaoCation,
    concentracaoAnion,
  }: {
    sal: SalPrecipitacao;
    concentracaoCation: number;
    concentracaoAnion: number;
  }) {
    if (
      !Number.isFinite(concentracaoCation) ||
      !Number.isFinite(concentracaoAnion) ||
      concentracaoCation < 0 ||
      concentracaoAnion < 0
    ) {
      return NaN;
    }
  
    return (
      Math.pow(concentracaoCation, sal.coeficienteCation) *
      Math.pow(concentracaoAnion, sal.coeficienteAnion)
    );
  }
  
  export function classificarProdutoIonico(pi: number, kps: number) {
    if (!Number.isFinite(pi) || !Number.isFinite(kps) || kps <= 0) {
      return {
        status: "Dados inválidos",
        interpretacao:
          "Informe concentrações válidas para comparar o produto iônico com o Kps.",
      };
    }
  
    const razao = pi / kps;
  
    if (razao < 0.98) {
      return {
        status: "Solução insaturada",
        interpretacao:
          "PI < Kps. A solução ainda comporta mais íons dissolvidos e não há tendência de precipitação.",
      };
    }
  
    if (razao <= 1.02) {
      return {
        status: "Solução saturada",
        interpretacao:
          "PI ≈ Kps. O sistema está próximo do equilíbrio de solubilidade.",
      };
    }
  
    return {
      status: "Precipitação provável",
      interpretacao:
        "PI > Kps. O produto iônico ultrapassou o Kps e há tendência de formação de precipitado.",
    };
  }
  
  export function calcularSolubilidadeComCationComum({
    sal,
    concentracaoCationComum,
  }: {
    sal: SalPrecipitacao;
    concentracaoCationComum: number;
  }) {
    if (
      !Number.isFinite(sal.kps) ||
      !Number.isFinite(concentracaoCationComum) ||
      sal.kps <= 0 ||
      concentracaoCationComum <= 0
    ) {
      return NaN;
    }
  
    const concentracaoAnionEquilibrio = Math.pow(
      sal.kps / Math.pow(concentracaoCationComum, sal.coeficienteCation),
      1 / sal.coeficienteAnion
    );
  
    return concentracaoAnionEquilibrio / sal.coeficienteAnion;
  }
  
  export function calcularSolubilidadeComAnionComum({
    sal,
    concentracaoAnionComum,
  }: {
    sal: SalPrecipitacao;
    concentracaoAnionComum: number;
  }) {
    if (
      !Number.isFinite(sal.kps) ||
      !Number.isFinite(concentracaoAnionComum) ||
      sal.kps <= 0 ||
      concentracaoAnionComum <= 0
    ) {
      return NaN;
    }
  
    const concentracaoCationEquilibrio = Math.pow(
      sal.kps / Math.pow(concentracaoAnionComum, sal.coeficienteAnion),
      1 / sal.coeficienteCation
    );
  
    return concentracaoCationEquilibrio / sal.coeficienteCation;
  }