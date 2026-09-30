"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import type {
  ResultadoCurvaRedoxPeroxido,
} from "@/lib/oxirreducao/curvaRedoxPeroxido";

import {
  calcularPontoPermanganometriaFerro,
  type ResultadoPontoPermanganometria,
} from "@/lib/oxirreducao/permanganometria";

import {
  calcularPontoPermanganometriaPeroxido,
  type ResultadoPontoPermanganometriaPeroxido,
} from "@/lib/oxirreducao/permanganometriaPeroxido";

import {
  calcularDerivadasRedox,
} from "@/lib/oxirreducao/derivadas";

import SimulacaoTempoRealRedoxChart from "./SimulacaoTempoRealRedoxChart";


type SistemaTempoRealRedox =
  | "ferro-ii"
  | "peroxido-hidrogenio";


type ResultadoCurvaTempoRealRedox =
  | ResultadoCurvaRedox
  | ResultadoCurvaRedoxPeroxido;


type PontoTempoRealRedox =
  | ResultadoPontoPermanganometria
  | ResultadoPontoPermanganometriaPeroxido;


type TempoRealRedoxProps = {
  sistema:
    SistemaTempoRealRedox;

  resultadoBase:
    ResultadoCurvaTempoRealRedox;
};


function formatarNumero(
  valor:
    number | null,
  casas = 2
) {
  if (
    valor ===
    null ||
    !Number.isFinite(
      valor
    )
  ) {
    return "-";
  }


  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits:
        casas,

      maximumFractionDigits:
        casas,
    }
  ).format(
    valor
  );
}


function formatarCientifico(
  valor: number
) {
  if (
    !Number.isFinite(
      valor
    )
  ) {
    return "-";
  }


  if (
    valor ===
    0
  ) {
    return "0";
  }


  return valor
    .toExponential(
      3
    )
    .replace(
      ".",
      ","
    );
}


function nomeRegiao(
  ponto:
    PontoTempoRealRedox
) {
  if (
    ponto.regiao ===
    "antes_pe"
  ) {
    return "Antes do PE";
  }


  if (
    ponto.regiao ===
    "pe"
  ) {
    return "PE";
  }


  return "Após o PE";
}


export default function TempoRealRedox({
  sistema,
  resultadoBase,
}: TempoRealRedoxProps) {
  const ehPeroxido =
    sistema ===
    "peroxido-hidrogenio";


  const nomeAnalito =
    ehPeroxido
      ? "H₂O₂"
      : "Fe²⁺";


  const [
    volumeAtualTempoReal,
    setVolumeAtualTempoReal,
  ] =
    useState(
      0
    );


  const [
    volumeManualTempoReal,
    setVolumeManualTempoReal,
  ] =
    useState(
      ""
    );


  const [
    pontosTempoReal,
    setPontosTempoReal,
  ] =
    useState<
      PontoTempoRealRedox[]
    >(
      []
    );


  const [
    erro,
    setErro,
  ] =
    useState(
      ""
    );


  /*
   * =======================================================
   * PE / PF
   * =======================================================
   */

  const derivadas =
    useMemo(
      () =>
        calcularDerivadasRedox(
          resultadoBase
            .pontosValidos
            .map(
              (
                ponto
              ) => ({
                volumeAdicionadoMl:
                  ponto
                    .volumeAdicionadoMl,

                potencialV:
                  ponto
                    .potencialV,
              })
            )
        ),
      [
        resultadoBase,
      ]
    );


  const volumePE =
    resultadoBase
      .volumeEquivalenciaMl;


  const volumePF =
    derivadas
      .volumePFPrimeiraDerivadaMl;


  const erroAbsoluto =
    volumePF -
    volumePE;


  const erroRelativo =
    (
      erroAbsoluto /
      volumePE
    ) *
    100;


  const pontoAtual =
    pontosTempoReal.length >
    0
      ? pontosTempoReal[
          pontosTempoReal.length -
          1
        ]
      : null;


  /*
   * =======================================================
   * TIPOS ESPECÍFICOS DO PONTO ATUAL
   * =======================================================
   */

  const pontoFerro =
    !ehPeroxido &&
    pontoAtual
      ? pontoAtual as
          ResultadoPontoPermanganometria
      : null;


  const pontoPeroxido =
    ehPeroxido &&
    pontoAtual
      ? pontoAtual as
          ResultadoPontoPermanganometriaPeroxido
      : null;


  const atividadeOxigenio =
    ehPeroxido
      ? (
          resultadoBase as
            ResultadoCurvaRedoxPeroxido
        ).entrada
          .atividadeOxigenio ??
        1
      : null;


  /*
   * =======================================================
   * RESET
   * =======================================================
   */

  useEffect(
    () => {
      setVolumeAtualTempoReal(
        0
      );

      setVolumeManualTempoReal(
        ""
      );

      setPontosTempoReal(
        []
      );

      setErro(
        ""
      );
    },
    [
      resultadoBase,
      sistema,
    ]
  );


  /*
   * =======================================================
   * CÁLCULO DO PONTO
   * =======================================================
   */

  function calcularPonto(
    volume:
      number
  ): PontoTempoRealRedox {
    if (
      sistema ===
      "peroxido-hidrogenio"
    ) {
      const resultadoPeroxido =
        resultadoBase as
          ResultadoCurvaRedoxPeroxido;


      return calcularPontoPermanganometriaPeroxido({
        entrada:
          resultadoPeroxido
            .entrada,

        volumeAdicionadoMl:
          volume,
      });
    }


    const resultadoFerro =
      resultadoBase as
        ResultadoCurvaRedox;


    return calcularPontoPermanganometriaFerro({
      entrada:
        resultadoFerro
          .entrada,

      volumeAdicionadoMl:
        volume,
    });
  }


  /*
   * =======================================================
   * ADIÇÃO DE TITULANTE
   * =======================================================
   */

  function adicionarVolumeTempoReal(
    incremento:
      number
  ) {
    if (
      !Number.isFinite(
        incremento
      ) ||
      incremento <=
        0
    ) {
      setErro(
        "Informe um volume válido para adicionar."
      );

      return;
    }


    const novoVolume =
      volumeAtualTempoReal +
      incremento;


    const ponto =
      calcularPonto(
        novoVolume
      );


    setErro(
      ""
    );


    setVolumeAtualTempoReal(
      novoVolume
    );


    setPontosTempoReal(
      (
        atuais
      ) => [
        ...atuais,
        ponto,
      ]
    );
  }


  function adicionarVolumeManualTempoReal() {
    const incremento =
      Number(
        volumeManualTempoReal
          .trim()
          .replace(
            ",",
            "."
          )
      );


    if (
      !Number.isFinite(
        incremento
      ) ||
      incremento <=
        0
    ) {
      setErro(
        "Informe um volume manual válido para adicionar."
      );

      return;
    }


    adicionarVolumeTempoReal(
      incremento
    );


    setVolumeManualTempoReal(
      ""
    );
  }


  /*
   * =======================================================
   * ATALHOS
   * =======================================================
   */

  function irParaPETempoReal() {
    const ponto =
      calcularPonto(
        volumePE
      );


    setErro(
      ""
    );


    setVolumeAtualTempoReal(
      volumePE
    );


    setPontosTempoReal(
      (
        atuais
      ) => [
        ...atuais,
        ponto,
      ]
    );
  }


  function irParaPFTempoReal() {
    const ponto =
      calcularPonto(
        volumePF
      );


    setErro(
      ""
    );


    setVolumeAtualTempoReal(
      volumePF
    );


    setPontosTempoReal(
      (
        atuais
      ) => [
        ...atuais,
        ponto,
      ]
    );
  }


  function limparTempoReal() {
    setVolumeAtualTempoReal(
      0
    );


    setVolumeManualTempoReal(
      ""
    );


    setPontosTempoReal(
      []
    );


    setErro(
      ""
    );
  }


  return (
    <section className="oxirreducaoTabPanel">
      <div className="liveSimulationDashboard">
        <div className="resultsPanel liveIntroPanel">
          <span className="eyebrow">
            Simulação em tempo real
          </span>

          <h2>
            Simulação em tempo real da permanganometria
          </h2>

          <p>
            Acompanhe a adição gradual de KMnO₄ ao sistema{" "}
            <strong>
              {nomeAnalito}
            </strong>
            . A linha representa a curva potenciométrica
            ideal e os pontos mostram os volumes adicionados
            durante a simulação.
          </p>
        </div>


        <div className="liveSimulationGrid">
          <div className="resultsPanel liveControlsPanel">
            <h2>
              Controles da titulação
            </h2>


            <div className="liveVolumeBox">
              <span>
                Volume atual
              </span>

              <strong>
                {formatarNumero(
                  volumeAtualTempoReal,
                  2
                )}{" "}
                mL
              </strong>
            </div>


            <div className="liveButtonGrid">
              <button
                type="button"
                onClick={() =>
                  adicionarVolumeTempoReal(
                    0.05
                  )
                }
              >
                +0,05 mL
              </button>

              <button
                type="button"
                onClick={() =>
                  adicionarVolumeTempoReal(
                    0.1
                  )
                }
              >
                +0,10 mL
              </button>

              <button
                type="button"
                onClick={() =>
                  adicionarVolumeTempoReal(
                    0.5
                  )
                }
              >
                +0,50 mL
              </button>

              <button
                type="button"
                onClick={() =>
                  adicionarVolumeTempoReal(
                    1
                  )
                }
              >
                +1,00 mL
              </button>

              <button
                type="button"
                onClick={() =>
                  adicionarVolumeTempoReal(
                    5
                  )
                }
              >
                +5,00 mL
              </button>
            </div>


            <div className="liveManualBox">
              <label>
                Adicionar volume personalizado (mL)

                <input
                  value={
                    volumeManualTempoReal
                  }
                  onChange={(
                    event
                  ) =>
                    setVolumeManualTempoReal(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Ex.: 5,00"
                  inputMode="decimal"
                />
              </label>


              {erro && (
                <div
                  className="oxirreducaoError"
                  role="alert"
                >
                  {
                    erro
                  }
                </div>
              )}


              <button
                type="button"
                className="primaryButton"
                onClick={
                  adicionarVolumeManualTempoReal
                }
              >
                Adicionar
              </button>


              <button
                type="button"
                className="secondaryButton"
                onClick={
                  irParaPFTempoReal
                }
              >
                Ir para PF
              </button>


              <button
                type="button"
                className="secondaryButton"
                onClick={
                  irParaPETempoReal
                }
              >
                Ir para PE
              </button>


              <button
                type="button"
                className="secondaryButton"
                onClick={
                  limparTempoReal
                }
              >
                Limpar
              </button>
            </div>
          </div>


          <div className="resultsPanel liveChartPanel">
            <SimulacaoTempoRealRedoxChart
              curva={
                resultadoBase
              }
              pontosAdicionados={
                pontosTempoReal
              }
            />
          </div>
        </div>


        <div className="resultsPanel">
          <h2>
            Ponto atual
          </h2>


          <div className="resultGrid">
            <div className="resultCard">
              <span>
                Volume KMnO₄
              </span>

              <strong>
                {pontoAtual
                  ? `${formatarNumero(
                      pontoAtual
                        .volumeAdicionadoMl,
                      2
                    )} mL`
                  : "-"}
              </strong>
            </div>


            <div className="resultCard">
              <span>
                Potencial E
              </span>

              <strong>
                {pontoAtual &&
                pontoAtual
                  .potencialV !==
                  null
                  ? `${formatarNumero(
                      pontoAtual
                        .potencialV,
                      4
                    )} V`
                  : "-"}
              </strong>
            </div>


            {ehPeroxido ? (
              <>
                <div className="resultCard">
                  <span>
                    [H₂O₂]
                  </span>

                  <strong>
                    {pontoPeroxido
                      ? formatarCientifico(
                          pontoPeroxido
                            .concentracaoH2O2MolL
                        )
                      : "-"}
                  </strong>

                  {pontoPeroxido && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    n(O₂)
                  </span>

                  <strong>
                    {pontoPeroxido
                      ? formatarCientifico(
                          pontoPeroxido
                            .molO2
                        )
                      : "-"}
                  </strong>

                  {pontoPeroxido && (
                    <small>
                      mol
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    [MnO₄⁻]
                  </span>

                  <strong>
                    {pontoPeroxido
                      ? formatarCientifico(
                          pontoPeroxido
                            .concentracaoMnO4MolL
                        )
                      : "-"}
                  </strong>

                  {pontoPeroxido && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    [Mn²⁺]
                  </span>

                  <strong>
                    {pontoPeroxido
                      ? formatarCientifico(
                          pontoPeroxido
                            .concentracaoMn2MolL
                        )
                      : "-"}
                  </strong>

                  {pontoPeroxido && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    a(O₂)
                  </span>

                  <strong>
                    {formatarNumero(
                      atividadeOxigenio,
                      3
                    )}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div className="resultCard">
                  <span>
                    [Fe²⁺]
                  </span>

                  <strong>
                    {pontoFerro
                      ? formatarCientifico(
                          pontoFerro
                            .concentracaoFe2MolL
                        )
                      : "-"}
                  </strong>

                  {pontoFerro && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    [Fe³⁺]
                  </span>

                  <strong>
                    {pontoFerro
                      ? formatarCientifico(
                          pontoFerro
                            .concentracaoFe3MolL
                        )
                      : "-"}
                  </strong>

                  {pontoFerro && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    [MnO₄⁻]
                  </span>

                  <strong>
                    {pontoFerro
                      ? formatarCientifico(
                          pontoFerro
                            .concentracaoMnO4MolL
                        )
                      : "-"}
                  </strong>

                  {pontoFerro && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>


                <div className="resultCard">
                  <span>
                    [Mn²⁺]
                  </span>

                  <strong>
                    {pontoFerro
                      ? formatarCientifico(
                          pontoFerro
                            .concentracaoMn2MolL
                        )
                      : "-"}
                  </strong>

                  {pontoFerro && (
                    <small>
                      mol/L
                    </small>
                  )}
                </div>
              </>
            )}


            <div className="resultCard">
              <span>
                Região
              </span>

              <strong>
                {pontoAtual
                  ? nomeRegiao(
                      pontoAtual
                    )
                  : "-"}
              </strong>
            </div>
          </div>
        </div>


        <div className="resultsPanel">
          <h2>
            Referências teóricas
          </h2>


          <div className="resultGrid">
            <div className="resultCard">
              <span>
                PE estequiométrico
              </span>

              <strong>
                {formatarNumero(
                  volumePE,
                  3
                )}{" "}
                mL
              </strong>
            </div>


            <div className="resultCard">
              <span>
                PF teórico
              </span>

              <strong>
                {formatarNumero(
                  volumePF,
                  3
                )}{" "}
                mL
              </strong>
            </div>


            <div className="resultCard">
              <span>
                PF − PE
              </span>

              <strong>
                {formatarNumero(
                  erroAbsoluto,
                  3
                )}{" "}
                mL
              </strong>
            </div>


            <div className="resultCard">
              <span>
                Erro relativo
              </span>

              <strong>
                {formatarNumero(
                  erroRelativo,
                  4
                )}
                %
              </strong>
            </div>
          </div>


          <div className="explanationBox">
            <p>
              O PF corresponde ao mesmo ponto de inflexão
              identificado pelo máximo da primeira derivada
              e pelo zero da segunda derivada. O erro relativo
              é calculado por ((VPF − VPE) / VPE) × 100.
            </p>
          </div>
        </div>


        <div className="resultsPanel">
          <h2>
            Pontos adicionados
          </h2>


          {pontosTempoReal.length ===
          0 ? (
            <div className="explanationBox">
              <p>
                Nenhum ponto adicionado ainda.
              </p>
            </div>
          ) : (
            <div className="curveTableScroll">
              <table className="curve-table">
                <thead>
                  <tr>
                    <th>
                      #
                    </th>

                    <th>
                      Volume
                    </th>

                    <th>
                      E (V)
                    </th>

                    {ehPeroxido ? (
                      <>
                        <th>
                          [H₂O₂]
                        </th>

                        <th>
                          n(O₂)
                        </th>

                        <th>
                          [MnO₄⁻]
                        </th>

                        <th>
                          [Mn²⁺]
                        </th>
                      </>
                    ) : (
                      <>
                        <th>
                          [Fe²⁺]
                        </th>

                        <th>
                          [Fe³⁺]
                        </th>

                        <th>
                          [MnO₄⁻]
                        </th>

                        <th>
                          [Mn²⁺]
                        </th>
                      </>
                    )}

                    <th>
                      Região
                    </th>
                  </tr>
                </thead>


                <tbody>
                  {pontosTempoReal.map(
                    (
                      ponto,
                      index
                    ) => {
                      if (
                        ehPeroxido
                      ) {
                        const pontoPeroxidoTabela =
                          ponto as
                            ResultadoPontoPermanganometriaPeroxido;


                        return (
                          <tr
                            key={`${pontoPeroxidoTabela.volumeAdicionadoMl}-${index}`}
                          >
                            <td>
                              {index +
                                1}
                            </td>

                            <td>
                              {formatarNumero(
                                pontoPeroxidoTabela
                                  .volumeAdicionadoMl,
                                2
                              )}{" "}
                              mL
                            </td>

                            <td>
                              <strong>
                                {formatarNumero(
                                  pontoPeroxidoTabela
                                    .potencialV,
                                  4
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatarCientifico(
                                pontoPeroxidoTabela
                                  .concentracaoH2O2MolL
                              )}
                            </td>

                            <td>
                              {formatarCientifico(
                                pontoPeroxidoTabela
                                  .molO2
                              )}
                            </td>

                            <td>
                              {formatarCientifico(
                                pontoPeroxidoTabela
                                  .concentracaoMnO4MolL
                              )}
                            </td>

                            <td>
                              {formatarCientifico(
                                pontoPeroxidoTabela
                                  .concentracaoMn2MolL
                              )}
                            </td>

                            <td>
                              {nomeRegiao(
                                pontoPeroxidoTabela
                              )}
                            </td>
                          </tr>
                        );
                      }


                      const pontoFerroTabela =
                        ponto as
                          ResultadoPontoPermanganometria;


                      return (
                        <tr
                          key={`${pontoFerroTabela.volumeAdicionadoMl}-${index}`}
                        >
                          <td>
                            {index +
                              1}
                          </td>

                          <td>
                            {formatarNumero(
                              pontoFerroTabela
                                .volumeAdicionadoMl,
                              2
                            )}{" "}
                            mL
                          </td>

                          <td>
                            <strong>
                              {formatarNumero(
                                pontoFerroTabela
                                  .potencialV,
                                4
                              )}
                            </strong>
                          </td>

                          <td>
                            {formatarCientifico(
                              pontoFerroTabela
                                .concentracaoFe2MolL
                            )}
                          </td>

                          <td>
                            {formatarCientifico(
                              pontoFerroTabela
                                .concentracaoFe3MolL
                            )}
                          </td>

                          <td>
                            {formatarCientifico(
                              pontoFerroTabela
                                .concentracaoMnO4MolL
                            )}
                          </td>

                          <td>
                            {formatarCientifico(
                              pontoFerroTabela
                                .concentracaoMn2MolL
                            )}
                          </td>

                          <td>
                            {nomeRegiao(
                              pontoFerroTabela
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}