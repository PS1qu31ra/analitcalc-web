"use client";
import { formatarCientificoPtBr } from "@/lib/oxirreducao/formatacao";

import {
  useEffect,
  useState,
} from "react";

import {
  calcularPontoPermanganometriaFerro,
} from "@/lib/oxirreducao/permanganometria";

import {
  calcularPontoPermanganometriaPeroxido,
} from "@/lib/oxirreducao/permanganometriaPeroxido";

import {
  calcularPontoPermanganometriaOxalato,
} from "@/lib/oxirreducao/permanganometriaOxalato";

import {
  calcularPontoIodometria,
  type ResultadoCurvaIodometria,
} from "@/lib/oxirreducao/iodometria";

import type {
  ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import type {
  ResultadoCurvaRedoxPeroxido,
} from "@/lib/oxirreducao/curvaRedoxPeroxido";

import type {
  ResultadoCurvaRedoxOxalato,
} from "@/lib/oxirreducao/curvaRedoxOxalato";


type Props =
  | {
      modo: "ferro";
      resultado: ResultadoCurvaRedox;
    }
  | {
      modo: "peroxido";
      resultado: ResultadoCurvaRedoxPeroxido;
    }
  | {
      modo: "oxalato";
      resultado: ResultadoCurvaRedoxOxalato;
    }
  | {
      modo: "iodometria";
      resultado: ResultadoCurvaIodometria;
    };


type EspecieConsulta = {
  rotulo: string;
  valor: string;
};


type ResultadoConsulta = {
  volumeMl: number;

  potencialV:
    number | null;

  regiao:
    string;

  controlador:
    string;

  descricao:
    string;

  especies:
    EspecieConsulta[];
};


type ResultadoGrafico = {
  volumeMaximoMl:
    number;

  volumeEquivalenciaMl:
    number;

  potencialEquivalenciaV:
    number;

  pontosValidos:
    {
      volumeAdicionadoMl:
        number;

      potencialV:
        number | null;

      regiao?:
        "antes_pe" | "pe" | "apos_pe";
    }[];
};


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
  ).format(valor);
}


function formatarCientifico(valor: number) {
  return formatarCientificoPtBr(valor, 3);
}

function renderizarValorComUnidade(valor: string) {
  const partes = valor.match(/^(.*)\s+(mol\/L|mol|atm)$/);

  if (!partes) {
    return valor;
  }

  return (
    <span className="curveSpeciesValueWithUnit">
      {partes[1]}{" "}
      <span className="curveSpeciesUnit">{partes[2]}</span>
    </span>
  );
}

function converterNumero(
  valor: string
) {
  return Number(
    valor
      .trim()
      .replace(",", ".")
  );
}


function nomeRegiao(
  regiao:
    "antes_pe" |
    "pe" |
    "apos_pe"
) {
  if (
    regiao ===
    "antes_pe"
  ) {
    return "Antes do PE";
  }

  if (
    regiao ===
    "pe"
  ) {
    return "Ponto de equivalência";
  }

  return "Após o PE";
}


function nomePar(
  valor:
    string
) {
  switch (valor) {
    case "Fe3+/Fe2+":
      return "Fe³⁺ / Fe²⁺";

    case "O2/H2O2":
      return "O₂ / H₂O₂";

    case "CO2/H2C2O4":
      return "CO₂ / H₂C₂O₄";

    case "MnO4-/Mn2+":
      return "MnO₄⁻ / Mn²⁺";

    case "equivalencia":
      return "Equivalência";

    default:
      return valor;
  }
}


/* =========================================================
 * GRÁFICO CONSULTÁVEL
 * ======================================================= */

function GraficoCurvaConsultavel({
  resultado,
  consulta,
  rotuloEixoX,
  modo,
}: {
  resultado:
    ResultadoGrafico;

  consulta:
    ResultadoConsulta | null;

  rotuloEixoX:
    string;

  modo:
    Props["modo"];
}) {
  const largura =
    1000;

  const altura =
    470;

  const margemEsquerda =
    78;

  const margemDireita =
    35;

  const margemSuperior =
    35;

  const margemInferior =
    72;


  const larguraUtil =
    largura -
    margemEsquerda -
    margemDireita;


  const alturaUtil =
    altura -
    margemSuperior -
    margemInferior;


  const pontos =
    resultado
      .pontosValidos
      .filter(
        (
          ponto
        ) =>
          ponto.potencialV !==
            null &&
          Number.isFinite(
            ponto.potencialV
          )
      );


  // O ponto exato do PE é a média formal da validação; o traçado da curva
  // mantém os ramos de Nernst e apresenta esse valor como marcador separado.
  const pontosLinha =
    modo === "iodometria"
      ? pontos.filter((ponto) => ponto.regiao !== "pe")
      : pontos;


  if (
    pontos.length === 0
  ) {
    return (
      <div className="oxirreducaoEmptyChart">
        Não foi possível gerar pontos válidos para a curva.
      </div>
    );
  }


  const potenciais =
    pontos.map(
      (
        ponto
      ) =>
        ponto.potencialV as number
    );


  if (
    consulta?.potencialV !==
      null &&
    consulta?.potencialV !==
      undefined &&
    Number.isFinite(
      consulta.potencialV
    )
  ) {
    potenciais.push(
      consulta.potencialV
    );
  }


  const minimoOriginal =
    Math.min(
      ...potenciais
    );


  const maximoOriginal =
    Math.max(
      ...potenciais
    );


  const amplitude =
    Math.max(
      maximoOriginal -
        minimoOriginal,
      0.1
    );


  const minimoPotencial =
    minimoOriginal -
    amplitude *
      0.08;


  const maximoPotencial =
    maximoOriginal +
    amplitude *
      0.08;


  const x = (
    volume: number
  ) =>
    margemEsquerda +
    (
      volume /
      resultado
        .volumeMaximoMl
    ) *
      larguraUtil;


  const y = (
    potencial: number
  ) =>
    margemSuperior +
    (
      (
        maximoPotencial -
        potencial
      ) /
      (
        maximoPotencial -
        minimoPotencial
      )
    ) *
      alturaUtil;


  const polyline =
    pontosLinha
      .map(
        (
          ponto
        ) =>
          `${x(
            ponto.volumeAdicionadoMl
          )},${y(
            ponto.potencialV as number
          )}`
      )
      .join(" ");


  const marcacoesX =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        indice
      ) =>
        (
          resultado
            .volumeMaximoMl /
          5
        ) *
        indice
    );


  const marcacoesY =
    Array.from(
      {
        length:
          6,
      },
      (
        _,
        indice
      ) =>
        minimoPotencial +
        (
          (
            maximoPotencial -
            minimoPotencial
          ) /
          5
        ) *
          indice
    );


  const xPE =
    x(
      resultado
        .volumeEquivalenciaMl
    );


  const yPE =
    y(
      resultado
        .potencialEquivalenciaV
    );


  const consultaValida =
    consulta !== null &&
    consulta.potencialV !==
      null &&
    Number.isFinite(
      consulta.potencialV
    );


  return (
    <div className="oxirreducaoChartWrapper">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Curva potenciométrica com consulta pontual de volume"
      >
        {marcacoesY.map(
          (
            potencial
          ) => (
            <g
              key={`y-${potencial}`}
            >
              <line
                x1={
                  margemEsquerda
                }
                x2={
                  largura -
                  margemDireita
                }
                y1={
                  y(
                    potencial
                  )
                }
                y2={
                  y(
                    potencial
                  )
                }
                className="oxirreducaoChartGrid"
              />

              <text
                x={
                  margemEsquerda -
                  14
                }
                y={
                  y(
                    potencial
                  ) +
                  5
                }
                textAnchor="end"
                className="oxirreducaoChartTick"
              >
                {formatarNumero(
                  potencial,
                  2
                )}
              </text>
            </g>
          )
        )}


        {marcacoesX.map(
          (
            volume
          ) => (
            <g
              key={`x-${volume}`}
            >
              <line
                x1={
                  x(
                    volume
                  )
                }
                x2={
                  x(
                    volume
                  )
                }
                y1={
                  margemSuperior
                }
                y2={
                  altura -
                  margemInferior
                }
                className="oxirreducaoChartGrid"
              />

              <text
                x={
                  x(
                    volume
                  )
                }
                y={
                  altura -
                  margemInferior +
                  28
                }
                textAnchor="middle"
                className="oxirreducaoChartTick"
              >
                {formatarNumero(
                  volume,
                  1
                )}
              </text>
            </g>
          )
        )}


        <line
          x1={
            margemEsquerda
          }
          x2={
            margemEsquerda
          }
          y1={
            margemSuperior
          }
          y2={
            altura -
            margemInferior
          }
          className="oxirreducaoChartAxis"
        />


        <line
          x1={
            margemEsquerda
          }
          x2={
            largura -
            margemDireita
          }
          y1={
            altura -
            margemInferior
          }
          y2={
            altura -
            margemInferior
          }
          className="oxirreducaoChartAxis"
        />


        <polyline
          points={
            polyline
          }
          className="oxirreducaoChartCurve"
        />


        <line
          x1={
            xPE
          }
          x2={
            xPE
          }
          y1={
            margemSuperior
          }
          y2={
            altura -
            margemInferior
          }
          className="oxirreducaoChartPELine"
        />


        <circle
          cx={
            xPE
          }
          cy={
            yPE
          }
          r="7"
          className="oxirreducaoChartPEPoint"
        />


        <text
          x={
            xPE +
            12
          }
          y={
            margemSuperior +
            22
          }
          className="oxirreducaoChartPELabel"
        >
          PE ={" "}
          {formatarNumero(
            resultado
              .volumeEquivalenciaMl,
            2
          )}{" "}
          mL{modo === "iodometria" ? " · média ponderada" : ""}
        </text>


        {consultaValida &&
          consulta && (
            <>
              <line
                x1={
                  x(
                    consulta
                      .volumeMl
                  )
                }
                x2={
                  x(
                    consulta
                      .volumeMl
                  )
                }
                y1={
                  margemSuperior
                }
                y2={
                  altura -
                  margemInferior
                }
                stroke="#e11d48"
                strokeWidth="1.8"
                strokeDasharray="4 5"
                opacity="0.75"
              />

              <circle
                cx={
                  x(
                    consulta
                      .volumeMl
                  )
                }
                cy={
                  y(
                    consulta
                      .potencialV as number
                  )
                }
                r="7"
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth="3"
              />

              <text
                x={
                  x(
                    consulta
                      .volumeMl
                  ) +
                  10
                }
                y={
                  y(
                    consulta
                      .potencialV as number
                  ) -
                  12
                }
                fill="#9f1239"
                fontSize="13"
                fontWeight="900"
              >
                {formatarNumero(
                  consulta
                    .volumeMl,
                  2
                )}{" "}
                mL
              </text>
            </>
          )}


        <text
          x="22"
          y={
            margemSuperior +
            alturaUtil /
              2
          }
          textAnchor="middle"
          transform={`rotate(-90 22 ${
            margemSuperior +
            alturaUtil /
              2
          })`}
          className="oxirreducaoChartAxisLabel"
        >
          Potencial E (V)
        </text>


        <text
          x={
            margemEsquerda +
            larguraUtil /
              2
          }
          y={
            altura -
            16
          }
          textAnchor="middle"
          className="oxirreducaoChartAxisLabel"
        >
          {rotuloEixoX}
        </text>
      </svg>
    </div>
  );
}


/* =========================================================
 * CONSULTA
 * ======================================================= */

export default function ConsultaCurvaOxirreducao(
  props: Props
) {
  const [
    volumeDigitado,
    setVolumeDigitado,
  ] =
    useState(
      ""
    );


  const [
    consulta,
    setConsulta,
  ] =
    useState<ResultadoConsulta | null>(
      null
    );


  const [
    erro,
    setErro,
  ] =
    useState(
      ""
    );


  useEffect(
    () => {
      setVolumeDigitado(
        ""
      );

      setConsulta(
        null
      );

      setErro(
        ""
      );
    },
    [
      props.resultado,
    ]
  );


  const volumeMaximo =
    props
      .resultado
      .volumeMaximoMl;


  const nomeTitulante =
    props.modo ===
      "iodometria"
      ? "Na₂S₂O₃"
      : "KMnO₄";


  const rotuloEixoX =
    props.modo ===
      "iodometria"
      ? "Volume de Na₂S₂O₃ adicionado (mL)"
      : "Volume de KMnO₄ adicionado (mL)";


  function consultar() {
    const volume =
      converterNumero(
        volumeDigitado
      );


    if (
      !Number.isFinite(
        volume
      ) ||
      volume <
        0
    ) {
      setErro(
        "Informe um volume válido, maior ou igual a zero."
      );

      setConsulta(
        null
      );

      return;
    }


    if (
      props.modo === "iodometria" &&
      volume === 0
    ) {
      setErro(
        "Em 0,00 mL ainda não há I⁻ formado pela reação com tiossulfato; a equação de Nernst pré-PE não fornece potencial finito."
      );

      setConsulta(null);
      return;
    }


    if (
      volume >
      volumeMaximo
    ) {
      setErro(
        `O volume deve estar entre 0 e ${formatarNumero(
          volumeMaximo,
          2
        )} mL para a curva atual.`
      );

      setConsulta(
        null
      );

      return;
    }


    try {
      if (
        props.modo ===
        "ferro"
      ) {
        const ponto =
          calcularPontoPermanganometriaFerro({
            entrada:
              props
                .resultado
                .entrada,

            volumeAdicionadoMl:
              volume,
          });


        setConsulta({
          volumeMl:
            volume,

          potencialV:
            ponto.potencialV,

          regiao:
            nomeRegiao(
              ponto.regiao
            ),

          controlador:
            nomePar(
              ponto
                .parControlador
            ),

          descricao:
            ponto.descricao,

          especies: [
            {
              rotulo:
                "[Fe²⁺]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoFe2MolL
                )} mol/L`,
            },

            {
              rotulo:
                "[Fe³⁺]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoFe3MolL
                )} mol/L`,
            },

            {
              rotulo:
                "[MnO₄⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoMnO4MolL
                )} mol/L`,
            },

            {
              rotulo:
                "[Mn²⁺]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoMn2MolL
                )} mol/L`,
            },
          ],
        });
      }


      if (
        props.modo ===
        "peroxido"
      ) {
        const ponto =
          calcularPontoPermanganometriaPeroxido({
            entrada:
              props
                .resultado
                .entrada,

            volumeAdicionadoMl:
              volume,
          });


        setConsulta({
          volumeMl:
            volume,

          potencialV:
            ponto.potencialV,

          regiao:
            nomeRegiao(
              ponto.regiao
            ),

          controlador:
            nomePar(
              ponto
                .parControlador
            ),

          descricao:
            ponto.descricao,

          especies: [
            {
              rotulo:
                "[H₂O₂]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoH2O2MolL
                )} mol/L`,
            },

            {
              rotulo:
                "n(O₂)",

              valor:
                `${formatarCientifico(
                  ponto.molO2
                )} mol`,
            },

            {
              rotulo:
                "[MnO₄⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoMnO4MolL
                )} mol/L`,
            },

            {
              rotulo:
                "[Mn²⁺]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoMn2MolL
                )} mol/L`,
            },
          ],
        });
      }


      if (
        props.modo ===
        "oxalato"
      ) {
        const ponto =
          calcularPontoPermanganometriaOxalato({
            entrada:
              props
                .resultado
                .entrada,

            volumeAdicionadoMl:
              volume,
          });


        setConsulta({
          volumeMl:
            volume,

          potencialV:
            ponto.potencialV,

          regiao:
            nomeRegiao(
              ponto.regiao
            ),

          controlador:
            nomePar(
              ponto
                .parControlador
            ),

          descricao:
            ponto.descricao,

          especies: [
            {
              rotulo: "[H₂C₂O₄]",
              valor: `${formatarCientifico(ponto.concentracaoH2C2O4MolL)} mol/L`,
            },
            {
              rotulo: "[MnO₄⁻]",
              valor: `${formatarCientifico(ponto.concentracaoMnO4MolL)} mol/L`,
            },
            {
              rotulo: "[Mn²⁺]",
              valor: `${formatarCientifico(ponto.concentracaoMn2MolL)} mol/L`,
            },
            {
              rotulo: "P(CO₂)",
              valor: `${formatarNumero(props.resultado.atividadeCO2, 2)} atm`,
            },
          ],
        });
      }


      if (
        props.modo ===
        "iodometria"
      ) {
        const ponto =
          calcularPontoIodometria({
            entrada:
              props
                .resultado
                .entrada,

            volumeAdicionadoMl:
              volume,
          });


        const controlador =
          ponto.regiao ===
            "antes_pe"
            ? "I₃⁻ / I⁻"
            : ponto.regiao ===
                "pe"
              ? "Média ponderada (2 e⁻ / 2 e⁻)"
              : "S₄O₆²⁻ / S₂O₃²⁻";


        const descricao =
          ponto.regiao ===
            "antes_pe"
            ? "Ainda há I₃⁻ disponível para reação com o tiossulfato. O potencial é calculado pelo par I₃⁻/I⁻ da amostra."
            : ponto.regiao ===
                "pe"
              ? "No volume exato do PE, a validação adota a média ponderada dos potenciais padrão: [2 × 0,536 + 2 × 0,080] / 4 = 0,308 V. Os balanços estequiométricos indicam consumo completo de I₃⁻ e S₂O₃²⁻."
              : "O tiossulfato está em excesso; o potencial é calculado pelo par S₄O₆²⁻/S₂O₃²⁻ do titulante.";


        setConsulta({
          volumeMl:
            volume,

          potencialV:
            ponto.potencialV,

          regiao:
            nomeRegiao(
              ponto.regiao
            ),

          controlador,

          descricao,

          especies: [
            {
              rotulo:
                "[I₃⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoI3MolL
                )} mol/L`,
            },

            {
              rotulo:
                "[I⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoIodetoMolL
                )} mol/L`,
            },

            {
              rotulo:
                "[S₂O₃²⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoTiossulfatoMolL
                )} mol/L`,
            },

            {
              rotulo:
                "[S₄O₆²⁻]",

              valor:
                `${formatarCientifico(
                  ponto
                    .concentracaoTetrationatoMolL
                )} mol/L`,
            },
          ],
        });
      }


      setErro(
        ""
      );
    } catch (
      error
    ) {
      setConsulta(
        null
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar esse volume."
      );
    }
  }


  return (
    <>
      <GraficoCurvaConsultavel
        resultado={
          props.resultado
        }
        consulta={
          consulta
        }
        rotuloEixoX={
          rotuloEixoX
        }
        modo={
          props.modo
        }
      />


      <div className="chartLegend">
        <span>
          <i className="legendLine curve" />
          Curva de titulação
        </span>

        <span>
          <i className="legendLine pe" />
          {props.modo === "iodometria"
            ? "PE — média formal dos E°"
            : "Ponto de equivalência"}
        </span>

        <span>
          <i className="legendLine consult" />
          Volume consultado
        </span>
      </div>


      <div className="curveConsultBox acidBaseConsultBox">
        <div className="acidBaseConsultHeader">
          <span className="eyebrow">
            Consulta pontual
          </span>

          <h3>
            Consultar ponto na curva
          </h3>

          <p>
            Informe um volume de {nomeTitulante} adicionado
            para calcular o potencial, localizar a região da
            titulação e destacar o ponto diretamente no gráfico.
          </p>
        </div>


        <div className="acidBaseConsultGrid">
          <label>
            Volume adicionado de {nomeTitulante} (mL)

            <input
              value={
                volumeDigitado
              }
              onChange={(
                event
              ) => {
                setVolumeDigitado(
                  event
                    .target
                    .value
                );

                setErro(
                  ""
                );
              }}
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  consultar();
                }
              }}
              inputMode="decimal"
              placeholder="Ex.: 12,50"
            />
          </label>


          <button
            type="button"
            className="primaryButton"
            onClick={
              consultar
            }
          >
            Consultar potencial
          </button>
        </div>


        {erro && (
          <div className="oxirreducaoError">
            {erro}
          </div>
        )}
      </div>


      {consulta && (
        <>
          <div className="resultGrid curvePointGrid">
            <div className="resultCard">
              <span>
                Volume consultado
              </span>

              <strong>
                {formatarNumero(
                  consulta
                    .volumeMl,
                  3
                )}{" "}
                mL
              </strong>
            </div>


            <div className="resultCard">
              <span>
                {props.modo === "iodometria" &&
                consulta.regiao === "Ponto de equivalência"
                  ? "Potencial formal no PE"
                  : "Potencial E"}
              </span>

              <strong>
                {consulta.potencialV ===
                null
                  ? "-"
                  : `${formatarNumero(
    consulta
      .potencialV,
    props.modo === "iodometria" ? 3 : 4
  )} V`}
              </strong>
            </div>


            <div className="resultCard">
              <span>
                Região
              </span>

              <strong>
                {consulta.regiao}
              </strong>
            </div>


            <div className="resultCard">
              <span>
                {props.modo === "iodometria" &&
                consulta.regiao === "Ponto de equivalência"
                  ? "Critério aplicado"
                  : "Sistema predominante"}
              </span>

              <strong>
                {props.modo === "iodometria" &&
                consulta.regiao === "Ponto de equivalência"
                  ? "Média ponderada dos E°"
                  : consulta.controlador}
              </strong>
            </div>


            {consulta
              .especies
              .map(
                (
                  especie
                ) => (
                  <div
                    className="resultCard"
                    key={
                      especie.rotulo
                    }
                  >
                    <span>
                      {especie.rotulo}
                    </span>

                    <strong>
                      {renderizarValorComUnidade(especie.valor)}
                    </strong>
                  </div>
                )
              )}
          </div>


          <div className="explanationBox">
            <h3>
              Interpretação do ponto consultado
            </h3>

            <p>
              {consulta.descricao}
            </p>
          </div>
        </>
      )}
    </>
  );
}