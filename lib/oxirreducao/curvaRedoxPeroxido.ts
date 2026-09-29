import {
    calcularPontoPermanganometriaPeroxido,
    calcularSistemaPermanganometriaPeroxido,
    type EntradaPermanganometriaPeroxido,
    type ResultadoPontoPermanganometriaPeroxido,
  } from "./permanganometriaPeroxido";
  
  
  /* =========================================================
   * TIPOS
   * ======================================================= */
  
  export type PontoCurvaRedoxPeroxido =
    ResultadoPontoPermanganometriaPeroxido & {
      percentualPE: number;
    };
  
  
  export type ConfiguracaoCurvaRedoxPeroxido = {
    volumeMaximoMl?: number;
  
    passoBaseMl?: number;
  
    passoProximoPEMl?: number;
  
    faixaDensaFracao?: number;
  };
  
  
  export type ResultadoCurvaRedoxPeroxido = {
    entrada:
      EntradaPermanganometriaPeroxido;
  
    volumeEquivalenciaMl: number;
  
    potencialEquivalenciaV: number;
  
    volumeMaximoMl: number;
  
    passoBaseMl: number;
  
    passoProximoPEMl: number;
  
    pontos:
      PontoCurvaRedoxPeroxido[];
  
    pontosValidos:
      PontoCurvaRedoxPeroxido[];
  
    pontoEquivalencia:
      PontoCurvaRedoxPeroxido;
  
    minimoPotencialV:
      number | null;
  
    maximoPotencialV:
      number | null;
  };
  
  
  /* =========================================================
   * CONSTANTES
   * ======================================================= */
  
  const PRECISAO_VOLUME =
    9;
  
  
  /* =========================================================
   * UTILITÁRIOS
   * ======================================================= */
  
  function arredondarVolume(
    valor: number
  ) {
    return Number(
      valor.toFixed(
        PRECISAO_VOLUME
      )
    );
  }
  
  
  function numeroPositivo(
    valor: number
  ) {
    return (
      Number.isFinite(
        valor
      ) &&
      valor > 0
    );
  }
  
  
  function limitar({
    valor,
    minimo,
    maximo,
  }: {
    valor: number;
    minimo: number;
    maximo: number;
  }) {
    return Math.min(
      Math.max(
        valor,
        minimo
      ),
      maximo
    );
  }
  
  
  /* =========================================================
   * PASSOS
   * ======================================================= */
  
  function calcularPassoBaseAutomatico(
    volumeEquivalenciaMl: number
  ) {
    return Math.max(
      volumeEquivalenciaMl /
        50,
      0.02
    );
  }
  
  
  function calcularPassoDensoAutomatico(
    volumeEquivalenciaMl: number
  ) {
    return Math.max(
      volumeEquivalenciaMl /
        250,
      0.002
    );
  }
  
  
  /* =========================================================
   * VOLUMES
   * ======================================================= */
  
  function gerarVolumes({
    volumeEquivalenciaMl,
    volumeMaximoMl,
    passoBaseMl,
    passoProximoPEMl,
    faixaDensaFracao,
  }: {
    volumeEquivalenciaMl: number;
    volumeMaximoMl: number;
    passoBaseMl: number;
    passoProximoPEMl: number;
    faixaDensaFracao: number;
  }) {
    const volumes =
      new Set<number>();
  
  
    function adicionar(
      volume: number
    ) {
      if (
        !Number.isFinite(
          volume
        )
      ) {
        return;
      }
  
  
      volumes.add(
        arredondarVolume(
          limitar({
            valor:
              volume,
  
            minimo:
              0,
  
            maximo:
              volumeMaximoMl,
          })
        )
      );
    }
  
  
    for (
      let volume = 0;
      volume <=
      volumeMaximoMl +
        passoBaseMl /
          2;
      volume +=
        passoBaseMl
    ) {
      adicionar(
        volume
      );
    }
  
  
    const inicioDenso =
      Math.max(
        0,
        volumeEquivalenciaMl *
          (
            1 -
            faixaDensaFracao
          )
      );
  
  
    const fimDenso =
      Math.min(
        volumeMaximoMl,
        volumeEquivalenciaMl *
          (
            1 +
            faixaDensaFracao
          )
      );
  
  
    for (
      let volume =
        inicioDenso;
  
      volume <=
      fimDenso +
        passoProximoPEMl /
          2;
  
      volume +=
        passoProximoPEMl
    ) {
      adicionar(
        volume
      );
    }
  
  
    const fatores = [
      0,
      0.25,
      0.5,
      0.75,
      0.9,
      0.95,
      0.98,
      0.99,
      1,
      1.01,
      1.02,
      1.05,
      1.1,
      1.25,
      1.5,
    ];
  
  
    fatores.forEach(
      (fator) => {
        adicionar(
          volumeEquivalenciaMl *
            fator
        );
      }
    );
  
  
    adicionar(
      volumeEquivalenciaMl
    );
  
    adicionar(
      volumeMaximoMl
    );
  
  
    return Array.from(
      volumes
    ).sort(
      (a, b) =>
        a - b
    );
  }
  
  
  /* =========================================================
   * CURVA
   * ======================================================= */
  
  export function gerarCurvaPermanganometriaPeroxido({
    entrada,
    configuracao = {},
  }: {
    entrada:
      EntradaPermanganometriaPeroxido;
  
    configuracao?:
      ConfiguracaoCurvaRedoxPeroxido;
  }): ResultadoCurvaRedoxPeroxido {
    const sistema =
      calcularSistemaPermanganometriaPeroxido(
        entrada
      );
  
  
    const volumeEquivalenciaMl =
      sistema
        .volumeEquivalenciaMl;
  
  
    const volumeMaximoMl =
      configuracao
        .volumeMaximoMl ??
      volumeEquivalenciaMl *
        1.6;
  
  
    if (
      !numeroPositivo(
        volumeMaximoMl
      ) ||
      volumeMaximoMl <
        volumeEquivalenciaMl
    ) {
      throw new Error(
        "O volume máximo deve ser positivo e incluir o ponto de equivalência."
      );
    }
  
  
    const passoBaseMl =
      configuracao
        .passoBaseMl ??
      calcularPassoBaseAutomatico(
        volumeEquivalenciaMl
      );
  
  
    const passoProximoPEMl =
      configuracao
        .passoProximoPEMl ??
      calcularPassoDensoAutomatico(
        volumeEquivalenciaMl
      );
  
  
    const faixaDensaFracao =
      configuracao
        .faixaDensaFracao ??
      0.12;
  
  
    if (
      !numeroPositivo(
        passoBaseMl
      ) ||
      !numeroPositivo(
        passoProximoPEMl
      )
    ) {
      throw new Error(
        "Os passos da curva devem ser positivos."
      );
    }
  
  
    if (
      !Number.isFinite(
        faixaDensaFracao
      ) ||
      faixaDensaFracao <=
        0 ||
      faixaDensaFracao >=
        1
    ) {
      throw new Error(
        "A faixa densa deve estar entre 0 e 1."
      );
    }
  
  
    const volumes =
      gerarVolumes({
        volumeEquivalenciaMl,
  
        volumeMaximoMl,
  
        passoBaseMl,
  
        passoProximoPEMl,
  
        faixaDensaFracao,
      });
  
  
    const pontos:
      PontoCurvaRedoxPeroxido[] =
      volumes.map(
        (
          volumeAdicionadoMl
        ) => {
          const ponto =
            calcularPontoPermanganometriaPeroxido({
              entrada,
  
              volumeAdicionadoMl,
            });
  
  
          return {
            ...ponto,
  
            percentualPE:
              (
                volumeAdicionadoMl /
                volumeEquivalenciaMl
              ) *
              100,
          };
        }
      );
  
  
    const pontosValidos =
      pontos.filter(
        (ponto) =>
          ponto.potencialV !==
            null &&
          Number.isFinite(
            ponto.potencialV
          )
      );
  
  
    const pontoEquivalencia =
      pontos.find(
        (ponto) =>
          ponto.regiao ===
          "pe"
      );
  
  
    if (
      !pontoEquivalencia
    ) {
      throw new Error(
        "O ponto de equivalência não foi encontrado."
      );
    }
  
  
    const potenciais =
      pontosValidos
        .map(
          (ponto) =>
            ponto.potencialV
        )
        .filter(
          (
            valor
          ): valor is number =>
            valor !== null &&
            Number.isFinite(
              valor
            )
        );
  
  
    return {
      entrada,
  
      volumeEquivalenciaMl,
  
      potencialEquivalenciaV:
        sistema
          .potencialEquivalenciaV,
  
      volumeMaximoMl,
  
      passoBaseMl,
  
      passoProximoPEMl,
  
      pontos,
  
      pontosValidos,
  
      pontoEquivalencia,
  
      minimoPotencialV:
        potenciais.length > 0
          ? Math.min(
              ...potenciais
            )
          : null,
  
      maximoPotencialV:
        potenciais.length > 0
          ? Math.max(
              ...potenciais
            )
          : null,
    };
  }