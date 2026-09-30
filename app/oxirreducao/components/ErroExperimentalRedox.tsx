"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type {
  ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import type {
  ResultadoCurvaRedoxPeroxido,
} from "@/lib/oxirreducao/curvaRedoxPeroxido";

import {
  calcularPontoPermanganometriaFerro,
} from "@/lib/oxirreducao/permanganometria";

import {
  calcularPontoPermanganometriaPeroxido,
} from "@/lib/oxirreducao/permanganometriaPeroxido";

import {
  calcularDerivadasRedox,
} from "@/lib/oxirreducao/derivadas";


type SistemaErroExperimentalRedox =
  | "ferro-ii"
  | "peroxido-hidrogenio";


type ResultadoCurvaErroExperimentalRedox =
  | ResultadoCurvaRedox
  | ResultadoCurvaRedoxPeroxido;


type ErroExperimentalRedoxProps = {
  sistema:
    SistemaErroExperimentalRedox;

  resultadoBase:
    ResultadoCurvaErroExperimentalRedox;
};


function converterNumero(
  valor: string
) {
  return Number(
    valor
      .trim()
      .replace(
        ",",
        "."
      )
  );
}


function formatarNumero(
  valor: number,
  casas = 3
) {
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


function formatarComSinal(
  valor: number,
  casas = 3
) {
  return `${
    valor > 0
      ? "+"
      : ""
  }${formatarNumero(
    valor,
    casas
  )}`;
}


export default function ErroExperimentalRedox({
  sistema,
  resultadoBase,
}: ErroExperimentalRedoxProps) {
  const ehPeroxido =
    sistema ===
    "peroxido-hidrogenio";


  const rotuloAnalito =
    ehPeroxido
      ? "H₂O₂"
      : "Fe²⁺";


  const derivadas =
    useMemo(
      () =>
        calcularDerivadasRedox(
          resultadoBase
            .pontosValidos
            .map(
              (ponto) => ({
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


  const volumePFTeorico =
    derivadas
      .volumePFPrimeiraDerivadaMl;


  const erroTeoricoAbsoluto =
    volumePFTeorico -
    volumePE;


  const erroTeoricoRelativo =
    (
      erroTeoricoAbsoluto /
      volumePE
    ) *
    100;


  const [
    volumeExperimentalDigitado,
    setVolumeExperimentalDigitado,
  ] =
    useState(
      formatarNumero(
        volumePFTeorico,
        3
      )
    );


  const [
    volumeExperimental,
    setVolumeExperimental,
  ] =
    useState(
      volumePFTeorico
    );


  const [
    toleranciaDigitada,
    setToleranciaDigitada,
  ] =
    useState(
      "0,10"
    );


  const [
    tolerancia,
    setTolerancia,
  ] =
    useState(
      0.1
    );


  const [
    erroEntrada,
    setErroEntrada,
  ] =
    useState(
      ""
    );


  useEffect(
    () => {
      setVolumeExperimental(
        volumePFTeorico
      );


      setVolumeExperimentalDigitado(
        formatarNumero(
          volumePFTeorico,
          3
        )
      );


      setToleranciaDigitada(
        "0,10"
      );


      setTolerancia(
        0.1
      );


      setErroEntrada(
        ""
      );
    },
    [
      volumePFTeorico,
    ]
  );


  const limiteVolume =
    Math.max(
      resultadoBase
        .volumeMaximoMl,

      volumePE,

      volumePFTeorico
    );


  /*
   * =======================================================
   * ERRO TOTAL EXPERIMENTAL EM RELAÇÃO AO PE
   * =======================================================
   *
   * Fórmula solicitada:
   *
   * ((VPF - VPE) / VPE) × 100
   */

  const erroExperimentalAbsoluto =
    volumeExperimental -
    volumePE;


  const erroExperimentalRelativo =
    (
      erroExperimentalAbsoluto /
      volumePE
    ) *
    100;


  const erroExperimentalRelativoModulo =
    Math.abs(
      erroExperimentalRelativo
    );


  /*
   * =======================================================
   * DESVIO OPERACIONAL EM RELAÇÃO AO PF TEÓRICO
   * =======================================================
   */

  const desvioPFAbsoluto =
    volumeExperimental -
    volumePFTeorico;


  const desvioPFRelativo =
    volumePFTeorico !==
    0
      ? (
          desvioPFAbsoluto /
          volumePFTeorico
        ) *
        100
      : 0;


  const dentroTolerancia =
    erroExperimentalRelativoModulo <=
    tolerancia;


  const coincideComPE =
    Math.abs(
      erroExperimentalAbsoluto
    ) <
    0.0005;


  const coincideComPF =
    Math.abs(
      desvioPFAbsoluto
    ) <
    0.0005;


    const pontoExperimental =
    ehPeroxido
      ? calcularPontoPermanganometriaPeroxido({
          entrada:
            (
              resultadoBase as
                ResultadoCurvaRedoxPeroxido
            ).entrada,
  
          volumeAdicionadoMl:
            volumeExperimental,
        })
      : calcularPontoPermanganometriaFerro({
          entrada:
            (
              resultadoBase as
                ResultadoCurvaRedox
            ).entrada,
  
          volumeAdicionadoMl:
            volumeExperimental,
        });


  const classificacaoPE =
    coincideComPE
      ? "Coincidente com o PE"
      : erroExperimentalAbsoluto <
          0
        ? "Antes do PE"
        : "Após o PE";


  const classificacaoPF =
    coincideComPF
      ? "Coincidente com o PF teórico"
      : desvioPFAbsoluto <
          0
        ? "Antes do PF teórico"
        : "Após o PF teórico";


  const impactoAnalitico =
    coincideComPE
      ? "Sem tendência de erro volumétrico"
      : erroExperimentalAbsoluto <
          0
        ? "Tendência de subestimação"
        : "Tendência de superestimação";


  const fatorResultado =
    volumePE !==
    0
      ? volumeExperimental /
        volumePE
      : 1;


  function analisarErroExperimental(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const volumeNumerico =
      converterNumero(
        volumeExperimentalDigitado
      );


    const toleranciaNumerica =
      converterNumero(
        toleranciaDigitada
      );


    if (
      !Number.isFinite(
        volumeNumerico
      ) ||
      volumeNumerico <
        0
    ) {
      setErroEntrada(
        "Informe um volume experimental válido."
      );

      return;
    }


    if (
      volumeNumerico >
      limiteVolume
    ) {
      setErroEntrada(
        `O volume experimental deve estar entre 0 e ${formatarNumero(
          limiteVolume,
          2
        )} mL para esta curva.`
      );

      return;
    }


    if (
      !Number.isFinite(
        toleranciaNumerica
      ) ||
      toleranciaNumerica <
        0
    ) {
      setErroEntrada(
        "Informe uma tolerância válida."
      );

      return;
    }


    setVolumeExperimental(
      volumeNumerico
    );


    setTolerancia(
      toleranciaNumerica
    );


    setErroEntrada(
      ""
    );
  }


  function usarPFTeorico() {
    setVolumeExperimental(
      volumePFTeorico
    );


    setVolumeExperimentalDigitado(
      formatarNumero(
        volumePFTeorico,
        3
      )
    );


    setErroEntrada(
      ""
    );
  }


  function usarPE() {
    setVolumeExperimental(
      volumePE
    );


    setVolumeExperimentalDigitado(
      formatarNumero(
        volumePE,
        3
      )
    );


    setErroEntrada(
      ""
    );
  }


  return (
    <section className="precipitacaoErrorExpanded">
      <header className="precipitacaoErrorExpandedIntro">
        <div>
          <span className="precipitacaoSectionLabel">
            Erro experimental
          </span>

          <h5>
            PE × PF teórico × PF experimental
          </h5>

          <p>
            Compare o ponto final observado
            experimentalmente com o ponto de equivalência
            estequiométrico e com o PF teórico determinado
            pelas derivadas da curva potenciométrica.
          </p>
        </div>
      </header>


      <section className="precipitacaoErrorContext">
        <div className="precipitacaoErrorContextHeading">
          <span className="precipitacaoSectionLabel">
            Contexto da análise
          </span>

          <h6>
            Sistema permanganométrico avaliado
          </h6>
        </div>


        <div className="precipitacaoErrorContextGrid">
        <article>
  <span>
    Titulado
  </span>

  <strong>
    {rotuloAnalito}
  </strong>
</article>


          <article>
            <span>
              Titulante
            </span>

            <strong>
              KMnO₄
            </strong>
          </article>


          <article>
            <span>
              PE teórico
            </span>

            <strong>
              {formatarNumero(
                volumePE,
                3
              )}{" "}
              mL
            </strong>
          </article>


          <article>
            <span>
              PF teórico
            </span>

            <strong>
              {formatarNumero(
                volumePFTeorico,
                3
              )}{" "}
              mL
            </strong>
          </article>


          <article>
            <span>
              Erro relativo teórico
            </span>

            <strong>
              {formatarComSinal(
                erroTeoricoRelativo,
                4
              )}
              %
            </strong>
          </article>
        </div>
      </section>


      <div className="precipitacaoErrorWorkspace">
        <aside className="precipitacaoErrorControls">
          <span className="precipitacaoSectionLabel">
            Determinação experimental
          </span>

          <h6>
            Informe o PF observado
          </h6>

          <p>
            Digite o volume em que a titulação foi
            considerada encerrada experimentalmente.
          </p>


          <form
            onSubmit={
              analisarErroExperimental
            }
            className="precipitacaoErrorForm"
          >
            <label htmlFor="volumeExperimentalRedox">
              PF experimental
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="volumeExperimentalRedox"
                type="text"
                inputMode="decimal"
                value={
                  volumeExperimentalDigitado
                }
                onChange={(
                  event
                ) => {
                  setVolumeExperimentalDigitado(
                    event.target.value
                  );

                  setErroEntrada(
                    ""
                  );
                }}
              />

              <span>
                mL
              </span>
            </div>


            <label htmlFor="toleranciaExperimentalRedox">
              Tolerância aceita
            </label>

            <div className="precipitacaoErrorInputGroup">
              <input
                id="toleranciaExperimentalRedox"
                type="text"
                inputMode="decimal"
                value={
                  toleranciaDigitada
                }
                onChange={(
                  event
                ) => {
                  setToleranciaDigitada(
                    event.target.value
                  );

                  setErroEntrada(
                    ""
                  );
                }}
              />

              <span>
                %
              </span>
            </div>


            {erroEntrada && (
              <p className="precipitacaoErrorInputMessage">
                {
                  erroEntrada
                }
              </p>
            )}


            <button
              type="submit"
              className="precipitacaoErrorPrimaryButton"
            >
              Analisar erro experimental
            </button>
          </form>


          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={
              usarPFTeorico
            }
          >
            Usar o PF teórico
          </button>


          <button
            type="button"
            className="precipitacaoErrorSecondaryButton"
            onClick={
              usarPE
            }
          >
            Usar o PE teórico
          </button>


          <div className="precipitacaoErrorControlReference">
            <span>
              Faixa analisada
            </span>

            <strong>
              0 a{" "}
              {formatarNumero(
                limiteVolume,
                2
              )}{" "}
              mL
            </strong>
          </div>
        </aside>


        <div className="precipitacaoErrorGraphCard">
          <header>
            <div>
              <span className="precipitacaoSectionLabel">
                Comparação visual
              </span>

              <h6>
                PE × PF teórico × PF experimental
              </h6>

              <p>
                A curva mostra simultaneamente o ponto de
                equivalência, o ponto final matemático e o
                volume observado experimentalmente.
              </p>
            </div>
          </header>


          <GraficoErroExperimentalRedox
  sistema={
    sistema
  }
  curva={
    resultadoBase
  }
  volumePE={
    volumePE
  }
            volumePFTeorico={
              volumePFTeorico
            }
            volumeExperimental={
              volumeExperimental
            }
          />


          <footer>
            <span>
              PE:{" "}
              <strong>
                {formatarNumero(
                  volumePE,
                  3
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF teórico:{" "}
              <strong>
                {formatarNumero(
                  volumePFTeorico,
                  3
                )}{" "}
                mL
              </strong>
            </span>

            <span>
              PF experimental:{" "}
              <strong>
                {formatarNumero(
                  volumeExperimental,
                  3
                )}{" "}
                mL
              </strong>
            </span>
          </footer>
        </div>
      </div>


      <section className="precipitacaoErrorMetrics">
        <article>
          <span>
            PE teórico
          </span>

          <strong>
            {formatarNumero(
              volumePE,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Estequiometria
          </small>
        </article>


        <article>
          <span>
            PF teórico
          </span>

          <strong>
            {formatarNumero(
              volumePFTeorico,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Máximo de ΔE/ΔV
          </small>
        </article>


        <article>
          <span>
            PF experimental
          </span>

          <strong>
            {formatarNumero(
              volumeExperimental,
              3
            )}{" "}
            mL
          </strong>

          <small>
            Valor observado
          </small>
        </article>


        <article>
          <span>
            Erro absoluto
          </span>

          <strong>
            {formatarComSinal(
              erroExperimentalAbsoluto,
              3
            )}{" "}
            mL
          </strong>

          <small>
            VPF(exp) − VPE
          </small>
        </article>


        <article>
          <span>
            Erro relativo
          </span>

          <strong>
            {formatarComSinal(
              erroExperimentalRelativo,
              4
            )}
            %
          </strong>

          <small>
            ((VPF − VPE) / VPE) × 100
          </small>
        </article>


        <article>
          <span>
            Tolerância
          </span>

          <strong>
            {dentroTolerancia
              ? "Dentro da faixa"
              : "Fora da faixa"}
          </strong>

          <small>
            Limite de ±
            {formatarNumero(
              tolerancia,
              2
            )}
            %
          </small>
        </article>
      </section>


      <div className="precipitacaoErrorInterpretationGrid">
        <section className="precipitacaoErrorChemicalState">
          <header>
            <span className="precipitacaoSectionLabel">
              Estado do sistema
            </span>

            <h6>
              Condição no PF experimental
            </h6>
          </header>


          <div className="precipitacaoErrorChemicalValues">
            <article>
              <span>
                Região
              </span>

              <strong>
                {pontoExperimental
                  .regiao ===
                "antes_pe"
                  ? "Antes do PE"
                  : pontoExperimental
                        .regiao ===
                      "pe"
                    ? "PE"
                    : "Após o PE"}
              </strong>
            </article>


            <article>
              <span>
                Potencial
              </span>

              <strong>
                {pontoExperimental
                  .potencialV ===
                null
                  ? "—"
                  : `${formatarNumero(
                      pontoExperimental
                        .potencialV,
                      4
                    )} V`}
              </strong>
            </article>


            <article>
              <span>
                Posição vs. PE
              </span>

              <strong>
                {
                  classificacaoPE
                }
              </strong>
            </article>


            <article>
              <span>
                Posição vs. PF
              </span>

              <strong>
                {
                  classificacaoPF
                }
              </strong>
            </article>
          </div>


          <div className="precipitacaoErrorChemicalExplanation">
            <strong>
              Desvio em relação ao PF teórico
            </strong>

            <p>
              O PF experimental está{" "}
              <strong>
                {formatarComSinal(
                  desvioPFAbsoluto,
                  3
                )}{" "}
                mL
              </strong>{" "}
              em relação ao PF matemático, correspondendo
              a{" "}
              <strong>
                {formatarComSinal(
                  desvioPFRelativo,
                  4
                )}
                %
              </strong>
              .
            </p>
          </div>
        </section>


        <section className="precipitacaoErrorAnalyticalImpact">
          <header>
            <span className="precipitacaoSectionLabel">
              Impacto analítico
            </span>

            <h6>
              Consequência do volume observado
            </h6>
          </header>


          <div className="precipitacaoErrorImpactMain">
            <span>
              Fator relativo do resultado
            </span>

            <strong>
              {formatarNumero(
                fatorResultado,
                5
              )}
            </strong>

            <small>
              VPF experimental ÷ VPE
            </small>
          </div>


          <div className="precipitacaoErrorImpactDirection">
            <span>
              Tendência
            </span>

            <strong>
              {
                impactoAnalitico
              }
            </strong>
          </div>


          <div
            className={
              dentroTolerancia
                ? "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisOk"
                : "precipitacaoErrorToleranceDiagnosis precipitacaoErrorToleranceDiagnosisAlert"
            }
          >
            <span>
              Avaliação da tolerância
            </span>

            <strong>
              {dentroTolerancia
                ? "Erro experimental aceitável para a tolerância informada."
                : "Erro experimental acima da tolerância informada."}
            </strong>
          </div>


          <p>
            O erro total considera o PF experimental em
            relação ao PE estequiométrico. O desvio
            operacional, por outro lado, compara o PF
            experimental diretamente com o PF teórico
            determinado pela curva.
          </p>
        </section>
      </div>


      <section className="precipitacaoErrorFinalDiagnosis">
        <span className="precipitacaoSectionLabel">
          Diagnóstico final
        </span>

        <h6>
          Interpretação do erro experimental
        </h6>

        <p>
          O PE teórico é{" "}
          <strong>
            {formatarNumero(
              volumePE,
              3
            )}{" "}
            mL
          </strong>
          , enquanto o PF teórico calculado pela primeira
          derivada é{" "}
          <strong>
            {formatarNumero(
              volumePFTeorico,
              3
            )}{" "}
            mL
          </strong>
          . O PF experimental informado foi{" "}
          <strong>
            {formatarNumero(
              volumeExperimental,
              3
            )}{" "}
            mL
          </strong>
          , produzindo erro relativo de{" "}
          <strong>
            {formatarComSinal(
              erroExperimentalRelativo,
              4
            )}
            %
          </strong>
          . Em relação ao PF teórico, o desvio operacional
          foi de{" "}
          <strong>
            {formatarComSinal(
              desvioPFAbsoluto,
              3
            )}{" "}
            mL
          </strong>
          .
        </p>
      </section>
    </section>
  );
}


/* =========================================================
 * GRÁFICO
 * ======================================================= */

function GraficoErroExperimentalRedox({
  sistema,
  curva,
  volumePE,
  volumePFTeorico,
  volumeExperimental,
}: {
  sistema:
    SistemaErroExperimentalRedox;

  curva:
    ResultadoCurvaErroExperimentalRedox;

  volumePE:
    number;

  volumePFTeorico:
    number;

  volumeExperimental:
    number;
}) {
  const largura =
    900;

  const altura =
    440;


  const margem = {
    top:
      60,

    right:
      35,

    bottom:
      70,

    left:
      70,
  };


  const pontos =
    curva
      .pontosValidos
      .filter(
        (
          ponto
        ) =>
          ponto.potencialV !==
          null
      );


      const pontoExperimental =
      sistema ===
      "peroxido-hidrogenio"
        ? calcularPontoPermanganometriaPeroxido({
            entrada:
              (
                curva as
                  ResultadoCurvaRedoxPeroxido
              ).entrada,
    
            volumeAdicionadoMl:
              volumeExperimental,
          })
        : calcularPontoPermanganometriaFerro({
            entrada:
              (
                curva as
                  ResultadoCurvaRedox
              ).entrada,
    
            volumeAdicionadoMl:
              volumeExperimental,
          });


  const xMax =
    Math.max(
      curva
        .volumeMaximoMl,

      volumeExperimental,

      volumePE,

      volumePFTeorico
    );


  const potenciais =
    pontos
      .map(
        (
          ponto
        ) =>
          ponto.potencialV
      )
      .filter(
        (
          valor
        ): valor is number =>
          valor !==
          null
      );


  if (
    pontoExperimental
      .potencialV !==
    null
  ) {
    potenciais.push(
      pontoExperimental
        .potencialV
    );
  }


  const yMinBruto =
    Math.min(
      ...potenciais
    );


  const yMaxBruto =
    Math.max(
      ...potenciais
    );


  const amplitude =
    Math.max(
      yMaxBruto -
        yMinBruto,
      0.1
    );


  const yMin =
    yMinBruto -
    amplitude *
      0.08;


  const yMax =
    yMaxBruto +
    amplitude *
      0.08;


  const plotWidth =
    largura -
    margem.left -
    margem.right;


  const plotHeight =
    altura -
    margem.top -
    margem.bottom;


  const x = (
    volume: number
  ) =>
    margem.left +
    (
      volume /
      xMax
    ) *
    plotWidth;


  const y = (
    potencial: number
  ) =>
    margem.top +
    (
      (
        yMax -
        potencial
      ) /
      (
        yMax -
        yMin
      )
    ) *
    plotHeight;


  const polyline =
    pontos
      .map(
        (
          ponto
        ) =>
          `${x(
            ponto
              .volumeAdicionadoMl
          )},${y(
            ponto
              .potencialV as number
          )}`
      )
      .join(
        " "
      );


  const ticksX =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        index
      ) =>
        (
          xMax /
          5
        ) *
        index
    );


  const ticksY =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        index
      ) =>
        yMin +
        (
          (
            yMax -
            yMin
          ) /
          5
        ) *
        index
    );


  const inicioFaixa =
    Math.min(
      volumePE,
      volumeExperimental
    );


  const fimFaixa =
    Math.max(
      volumePE,
      volumeExperimental
    );


  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label="Comparação entre PE, PF teórico e PF experimental"
    >
      {ticksY.map(
        (
          tick,
          index
        ) => (
          <g
            key={`y-${index}`}
          >
            <line
              x1={
                margem.left
              }
              x2={
                largura -
                margem.right
              }
              y1={
                y(
                  tick
                )
              }
              y2={
                y(
                  tick
                )
              }
              className="erroGraficoGrade"
            />

            <text
              x={
                margem.left -
                12
              }
              y={
                y(
                  tick
                ) +
                4
              }
              textAnchor="end"
              className="erroGraficoTexto"
            >
              {formatarNumero(
                tick,
                2
              )}
            </text>
          </g>
        )
      )}


      {ticksX.map(
        (
          tick,
          index
        ) => (
          <g
            key={`x-${index}`}
          >
            <line
              x1={
                x(
                  tick
                )
              }
              x2={
                x(
                  tick
                )
              }
              y1={
                margem.top
              }
              y2={
                altura -
                margem.bottom
              }
              className="erroGraficoGrade"
            />

            <text
              x={
                x(
                  tick
                )
              }
              y={
                altura -
                margem.bottom +
                25
              }
              textAnchor="middle"
              className="erroGraficoTexto"
            >
              {formatarNumero(
                tick,
                1
              )}
            </text>
          </g>
        )
      )}


      <rect
        x={
          x(
            inicioFaixa
          )
        }
        y={
          margem.top
        }
        width={
          Math.max(
            x(
              fimFaixa
            ) -
            x(
              inicioFaixa
            ),
            1
          )
        }
        height={
          plotHeight
        }
        className="erroGraficoFaixa"
      />


      <polyline
        points={
          polyline
        }
        className="erroGraficoCurva"
      />


      <line
        x1={
          x(
            volumePE
          )
        }
        x2={
          x(
            volumePE
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        className="erroGraficoPE"
      />


      <line
        x1={
          x(
            volumePFTeorico
          )
        }
        x2={
          x(
            volumePFTeorico
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        className="erroGraficoPF"
      />


      <line
        x1={
          x(
            volumeExperimental
          )
        }
        x2={
          x(
            volumeExperimental
          )
        }
        y1={
          margem.top
        }
        y2={
          altura -
            margem.bottom
        }
        stroke="#991b1b"
        strokeWidth="2"
        strokeDasharray="3 4"
      />


      <text
        x={
          x(
            volumePE
          ) +
          6
        }
        y="24"
        className="erroGraficoRotulo"
      >
        PE
      </text>


      <text
        x={
          x(
            volumePFTeorico
          ) +
          6
        }
        y="40"
        className="erroGraficoRotulo"
      >
        PF teórico
      </text>


      <text
        x={
          x(
            volumeExperimental
          ) +
          6
        }
        y="56"
        fill="#991b1b"
        fontSize="13"
        fontWeight="750"
      >
        PF experimental
      </text>


      {pontoExperimental
        .potencialV !==
        null && (
        <circle
          cx={
            x(
              volumeExperimental
            )
          }
          cy={
            y(
              pontoExperimental
                .potencialV
            )
          }
          r="6"
          className="erroGraficoMarcador"
        />
      )}


      <text
        x={
          margem.left +
          plotWidth /
            2
        }
        y={
          altura -
          16
        }
        textAnchor="middle"
        className="erroGraficoRotulo"
      >
        Volume de KMnO₄ adicionado (mL)
      </text>


      <text
        x="20"
        y={
          margem.top +
          plotHeight /
            2
        }
        textAnchor="middle"
        transform={`rotate(-90 20 ${
          margem.top +
          plotHeight /
            2
        })`}
        className="erroGraficoRotulo"
      >
        Potencial E (V)
      </text>
    </svg>
  );
}