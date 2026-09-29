"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import {
  calcularPontoPermanganometriaFerro,
  type ResultadoPontoPermanganometria,
} from "@/lib/oxirreducao/permanganometria";

import {
  calcularDerivadasRedox,
} from "@/lib/oxirreducao/derivadas";

import SimulacaoTempoRealRedoxChart from "./SimulacaoTempoRealRedoxChart";


type TempoRealRedoxProps = {
  resultadoBase:
    ResultadoCurvaRedox;
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


export default function TempoRealRedox({
  resultadoBase,
}: TempoRealRedoxProps) {
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
      ResultadoPontoPermanganometria[]
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


  const derivadas =
    useMemo(
      () =>
        calcularDerivadasRedox(
          resultadoBase
            .pontosValidos
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
    ]
  );


  function calcularPonto(
    volume:
      number
  ) {
    return calcularPontoPermanganometriaFerro({
      entrada:
        resultadoBase
          .entrada,

      volumeAdicionadoMl:
        volume,
    });
  }


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


  function nomeRegiao(
    ponto:
      ResultadoPontoPermanganometria
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
            Esta aba simula a adição gradual de KMnO₄ sobre
            a curva potenciométrica ideal já calculada. A
            linha representa a curva completa e os pontos
            mostram os volumes adicionados pelo usuário.
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


          {pontoAtual ===
          null ? (
            <div className="resultGrid">
              <div className="resultCard">
                <span>
                  Volume KMnO₄
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  Potencial E
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  [Fe²⁺]
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  [Fe³⁺]
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  [MnO₄⁻]
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  [Mn²⁺]
                </span>

                <strong>
                  -
                </strong>
              </div>

              <div className="resultCard">
                <span>
                  Região
                </span>

                <strong>
                  -
                </strong>
              </div>
            </div>
          ) : (
            <div className="resultGrid">
              <div className="resultCard">
                <span>
                  Volume KMnO₄
                </span>

                <strong>
                  {formatarNumero(
                    pontoAtual
                      .volumeAdicionadoMl,
                    2
                  )}{" "}
                  mL
                </strong>
              </div>


              <div className="resultCard">
                <span>
                  Potencial E
                </span>

                <strong>
                  {pontoAtual
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


              <div className="resultCard">
                <span>
                  [Fe²⁺]
                </span>

                <strong>
                  {formatarCientifico(
                    pontoAtual
                      .concentracaoFe2MolL
                  )}
                </strong>
              </div>


              <div className="resultCard">
                <span>
                  [Fe³⁺]
                </span>

                <strong>
                  {formatarCientifico(
                    pontoAtual
                      .concentracaoFe3MolL
                  )}
                </strong>
              </div>


              <div className="resultCard">
                <span>
                  [MnO₄⁻]
                </span>

                <strong>
                  {formatarCientifico(
                    pontoAtual
                      .concentracaoMnO4MolL
                  )}
                </strong>
              </div>


              <div className="resultCard">
                <span>
                  [Mn²⁺]
                </span>

                <strong>
                  {formatarCientifico(
                    pontoAtual
                      .concentracaoMn2MolL
                  )}
                </strong>
              </div>


              <div className="resultCard">
                <span>
                  Região
                </span>

                <strong>
                  {nomeRegiao(
                    pontoAtual
                  )}
                </strong>
              </div>
            </div>
          )}
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
              Erro relativo (%) = ((VPF − VPE) / VPE) ×
              100.
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
                    ) => (
                      <tr
                        key={`${ponto.volumeAdicionadoMl}-${index}`}
                      >
                        <td>
                          {index +
                            1}
                        </td>

                        <td>
                          {formatarNumero(
                            ponto
                              .volumeAdicionadoMl,
                            2
                          )}{" "}
                          mL
                        </td>

                        <td>
                          <strong>
                            {formatarNumero(
                              ponto
                                .potencialV,
                              4
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatarCientifico(
                            ponto
                              .concentracaoFe2MolL
                          )}
                        </td>

                        <td>
                          {formatarCientifico(
                            ponto
                              .concentracaoFe3MolL
                          )}
                        </td>

                        <td>
                          {formatarCientifico(
                            ponto
                              .concentracaoMnO4MolL
                          )}
                        </td>

                        <td>
                          {formatarCientifico(
                            ponto
                              .concentracaoMn2MolL
                          )}
                        </td>

                        <td>
                          {nomeRegiao(
                            ponto
                          )}
                        </td>
                      </tr>
                    )
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