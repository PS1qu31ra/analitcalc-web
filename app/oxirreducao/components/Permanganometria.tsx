"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  gerarCurvaPermanganometriaFerro,
  type ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import {
  gerarCurvaPermanganometriaPeroxido,
  type ResultadoCurvaRedoxPeroxido,
} from "@/lib/oxirreducao/curvaRedoxPeroxido";

import {
  calcularSistemaPermanganometriaOxalato,
  type ResultadoPermanganometriaOxalato,
} from "@/lib/oxirreducao/permanganometriaOxalato";

import type {
  EntradaPermanganometriaFerro,
} from "@/lib/oxirreducao/permanganometria";

import type {
  EntradaPermanganometriaPeroxido,
} from "@/lib/oxirreducao/permanganometriaPeroxido";

import type {
  EntradaPermanganometriaOxalato,
} from "@/lib/oxirreducao/permanganometriaOxalato";

import {
  buscarSistemaPermanganometria,
  type SistemaPermanganometriaId,
} from "@/lib/oxirreducao/sistemasPermanganometria";

import PermanganometriaTabs, {
  type AbaPermanganometria,
} from "./PermanganometriaTabs";

import SeletorSistemaPermanganometria from "./SeletorSistemaPermanganometria";

import VisaoGeral from "./VisaoGeral";
import Semirreacoes from "./Semirreacoes";
import Estequiometria from "./Estequiometria";
import CurvaPotenciometrica from "./CurvaPotenciometrica";

import VisaoGeralPeroxido from "./VisaoGeralPeroxido";
import SemirreacoesPeroxido from "./SemirreacoesPeroxido";
import EstequiometriaPeroxido from "./EstequiometriaPeroxido";
import CurvaPotenciometricaPeroxido from "./CurvaPotenciometricaPeroxido";

import VisaoGeralOxalato from "./VisaoGeralOxalato";
import EstequiometriaOxalato from "./EstequiometriaOxalato";

import DerivadasRedox from "./DerivadasRedox";

import EfeitoConcentracaoRedox from "./EfeitoConcentracaoRedox";

import TempoRealRedox from "./TempoRealRedox";

import ErroExperimentalRedox from "./ErroExperimentalRedox";


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


function gerarResultadoFerroInicial() {
  return gerarCurvaPermanganometriaFerro({
    entrada: {
      concentracaoAnalitoMolL:
        0.1,

      volumeAnalitoMl:
        25,

      concentracaoTitulanteMolL:
        0.02,

      concentracaoHPlusMolL:
        1,

      temperaturaC:
        25,
    },
  });
}


function gerarResultadoPeroxidoInicial() {
  return gerarCurvaPermanganometriaPeroxido({
    entrada: {
      concentracaoAnalitoMolL:
        0.1,

      volumeAnalitoMl:
        25,

      concentracaoTitulanteMolL:
        0.02,

      concentracaoHPlusMolL:
        1,

      atividadeOxigenio:
        1,

      temperaturaC:
        25,
    },
  });
}


function gerarResultadoOxalatoInicial() {
  return calcularSistemaPermanganometriaOxalato({
    concentracaoAnalitoMolL:
      0.1,

    volumeAnalitoMl:
      25,

    concentracaoTitulanteMolL:
      0.02,

    concentracaoHPlusMolL:
      1,

    temperaturaC:
      25,
  });
}


export default function Permanganometria() {
  const [
    sistemaAtivo,
    setSistemaAtivo,
  ] =
    useState<SistemaPermanganometriaId>(
      "ferro-ii"
    );


  const sistema =
    buscarSistemaPermanganometria(
      sistemaAtivo
    );


  const [
    abaAtiva,
    setAbaAtiva,
  ] =
    useState<AbaPermanganometria>(
      "visao-geral"
    );


  const [
    concentracaoAnalito,
    setConcentracaoAnalito,
  ] = useState(
    "0,100"
  );


  const [
    volumeAnalito,
    setVolumeAnalito,
  ] = useState(
    "25,00"
  );


  const [
    concentracaoTitulante,
    setConcentracaoTitulante,
  ] = useState(
    "0,0200"
  );


  const [
    concentracaoHPlus,
    setConcentracaoHPlus,
  ] = useState(
    "1,00"
  );


  const [
    atividadeOxigenio,
    setAtividadeOxigenio,
  ] = useState(
    "1,00"
  );


  const [
    temperatura,
    setTemperatura,
  ] = useState(
    "25"
  );


  const [
    resultadoFerro,
    setResultadoFerro,
  ] =
    useState<ResultadoCurvaRedox>(
      gerarResultadoFerroInicial
    );


  const [
    resultadoPeroxido,
    setResultadoPeroxido,
  ] =
    useState<ResultadoCurvaRedoxPeroxido>(
      gerarResultadoPeroxidoInicial
    );


  const [
    resultadoOxalato,
    setResultadoOxalato,
  ] =
    useState<ResultadoPermanganometriaOxalato>(
      gerarResultadoOxalatoInicial
    );


  const [
    erro,
    setErro,
  ] = useState(
    ""
  );


  const ehFerro =
    sistemaAtivo ===
    "ferro-ii";


  const ehPeroxido =
    sistemaAtivo ===
    "peroxido-hidrogenio";


  const ehOxalato =
    sistemaAtivo ===
    "oxalato";


  const volumeEquivalenciaAtivo =
    ehFerro
      ? resultadoFerro
          .volumeEquivalenciaMl
      : ehPeroxido
        ? resultadoPeroxido
            .volumeEquivalenciaMl
        : resultadoOxalato
            .volumeEquivalenciaMl;


  const potencialEquivalenciaAtivo =
    ehFerro
      ? resultadoFerro
          .potencialEquivalenciaV
      : ehPeroxido
        ? resultadoPeroxido
            .potencialEquivalenciaV
        : null;


  function alterarSistema(
    novoSistema:
      SistemaPermanganometriaId
  ) {
    setSistemaAtivo(
      novoSistema
    );

    setAbaAtiva(
      "visao-geral"
    );

    setErro(
      ""
    );
  }


  function calcular(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    try {
      if (
        ehFerro
      ) {
        const entrada:
          EntradaPermanganometriaFerro =
          {
            concentracaoAnalitoMolL:
              converterNumero(
                concentracaoAnalito
              ),

            volumeAnalitoMl:
              converterNumero(
                volumeAnalito
              ),

            concentracaoTitulanteMolL:
              converterNumero(
                concentracaoTitulante
              ),

            concentracaoHPlusMolL:
              converterNumero(
                concentracaoHPlus
              ),

            temperaturaC:
              converterNumero(
                temperatura
              ),
          };


        setResultadoFerro(
          gerarCurvaPermanganometriaFerro({
            entrada,
          })
        );


        setErro(
          ""
        );

        return;
      }


      if (
        ehPeroxido
      ) {
        const entrada:
          EntradaPermanganometriaPeroxido =
          {
            concentracaoAnalitoMolL:
              converterNumero(
                concentracaoAnalito
              ),

            volumeAnalitoMl:
              converterNumero(
                volumeAnalito
              ),

            concentracaoTitulanteMolL:
              converterNumero(
                concentracaoTitulante
              ),

            concentracaoHPlusMolL:
              converterNumero(
                concentracaoHPlus
              ),

            atividadeOxigenio:
              converterNumero(
                atividadeOxigenio
              ),

            temperaturaC:
              converterNumero(
                temperatura
              ),
          };


        setResultadoPeroxido(
          gerarCurvaPermanganometriaPeroxido({
            entrada,
          })
        );


        setErro(
          ""
        );

        return;
      }


      if (
        ehOxalato
      ) {
        const entrada:
          EntradaPermanganometriaOxalato =
          {
            concentracaoAnalitoMolL:
              converterNumero(
                concentracaoAnalito
              ),

            volumeAnalitoMl:
              converterNumero(
                volumeAnalito
              ),

            concentracaoTitulanteMolL:
              converterNumero(
                concentracaoTitulante
              ),

            concentracaoHPlusMolL:
              converterNumero(
                concentracaoHPlus
              ),

            temperaturaC:
              converterNumero(
                temperatura
              ),
          };


        setResultadoOxalato(
          calcularSistemaPermanganometriaOxalato(
            entrada
          )
        );


        setErro(
          ""
        );
      }

    } catch (
      error
    ) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o cálculo."
      );
    }
  }


  return (
    <section className="container oxirreducaoCalculatorSection">
      <header className="oxirreducaoMethodHeader">
        <span className="oxirreducaoSectionLabel">
          Permanganometria
        </span>

        <h2>
          Titulações com KMnO₄
        </h2>

        <p>
          Selecione o analito para estudar sua reação com
          permanganato, a estequiometria e o comportamento
          redox do sistema.
        </p>
      </header>


      <SeletorSistemaPermanganometria
        sistemaAtivo={
          sistemaAtivo
        }
        onChange={
          alterarSistema
        }
      />


      <div className="oxirreducaoSelectedSystem">
        <div>
          <span>
            Sistema selecionado
          </span>

          <strong>
            {
              sistema.nomeCompleto
            }
          </strong>
        </div>

        <div>
          <span>
            Titulante
          </span>

          <strong>
            KMnO₄
          </strong>
        </div>
      </div>


      <div className="oxirreducaoMainGrid">
        <form
          className="oxirreducaoForm"
          onSubmit={
            calcular
          }
          noValidate
        >
          <div className="oxirreducaoFormHeader">
            <span>
              Sistema experimental
            </span>

            <h3>
              Dados da titulação
            </h3>
          </div>


          <label>
            Concentração de{" "}
            {
              sistema.formulaAnalito
            }

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoAnalito
                }
                onChange={(
                  event
                ) =>
                  setConcentracaoAnalito(
                    event.target.value
                  )
                }
              />

              <span>
                mol/L
              </span>
            </div>
          </label>


          <label>
            Volume da amostra

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  volumeAnalito
                }
                onChange={(
                  event
                ) =>
                  setVolumeAnalito(
                    event.target.value
                  )
                }
              />

              <span>
                mL
              </span>
            </div>
          </label>


          <label>
            Concentração de KMnO₄

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoTitulante
                }
                onChange={(
                  event
                ) =>
                  setConcentracaoTitulante(
                    event.target.value
                  )
                }
              />

              <span>
                mol/L
              </span>
            </div>
          </label>


          <label>
            Concentração de H⁺

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoHPlus
                }
                onChange={(
                  event
                ) =>
                  setConcentracaoHPlus(
                    event.target.value
                  )
                }
              />

              <span>
                mol/L
              </span>
            </div>
          </label>


          {ehPeroxido && (
            <label>
              Atividade de O₂

              <div className="oxirreducaoInputUnit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    atividadeOxigenio
                  }
                  onChange={(
                    event
                  ) =>
                    setAtividadeOxigenio(
                      event.target.value
                    )
                  }
                />

                <span>
                  a(O₂)
                </span>
              </div>
            </label>
          )}


          <label>
            Temperatura

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  temperatura
                }
                onChange={(
                  event
                ) =>
                  setTemperatura(
                    event.target.value
                  )
                }
              />

              <span>
                °C
              </span>
            </div>
          </label>


          {erro && (
            <div className="oxirreducaoError">
              {erro}
            </div>
          )}


          <button
            type="submit"
            className="oxirreducaoCalculateButton"
          >
            Calcular sistema redox
          </button>
        </form>


        <aside className="oxirreducaoResults">
          <header className="oxirreducaoResultsHeader">
            <div>
              <span className="oxirreducaoSectionLabel">
                Resultado rápido
              </span>

              <h3>
                Sistema calculado
              </h3>
            </div>

            <span className="oxirreducaoStatus">
              Ativo
            </span>
          </header>


          <div className="oxirreducaoResultsGrid">
            <article className="oxirreducaoResultCard oxirreducaoResultCardMain">
              <span>
                Volume de equivalência
              </span>

              <strong>
                {formatarNumero(
                  volumeEquivalenciaAtivo,
                  2
                )}{" "}
                mL
              </strong>
            </article>


            <article className="oxirreducaoResultCard">
              <span>
                Potencial no PE
              </span>

              <strong>
                {potencialEquivalenciaAtivo !==
                null
                  ? `${formatarNumero(
                      potencialEquivalenciaAtivo,
                      3
                    )} V`
                  : "Em desenvolvimento"}
              </strong>
            </article>


            <article className="oxirreducaoResultCard">
              <span>
                Relação
              </span>

              <strong>
                {ehFerro
                  ? "5 : 1"
                  : "5 : 2"}
              </strong>

              <p>
                {
                  sistema.formulaAnalito
                }{" "}
                : MnO₄⁻
              </p>
            </article>


            <article className="oxirreducaoResultCard">
              <span>
                Meio
              </span>

              <strong>
                Ácido
              </strong>
            </article>
          </div>


          <div className="oxirreducaoReactionBox">
            <span>
              Reação global
            </span>

            <strong>
              {ehFerro
                ? "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O"
                : ehPeroxido
                  ? "2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O"
                  : "2 MnO₄⁻ + 5 C₂O₄²⁻ + 16 H⁺ → 2 Mn²⁺ + 10 CO₂ + 8 H₂O"}
            </strong>
          </div>
        </aside>
      </div>


      <PermanganometriaTabs
        abaAtiva={
          abaAtiva
        }
        sistemaAtivo={
          sistemaAtivo
        }
        onChange={
          setAbaAtiva
        }
      />


      {ehFerro &&
        abaAtiva === "visao-geral" && (
          <VisaoGeral
            resultado={
              resultadoFerro
            }
          />
        )}


      {ehFerro &&
        abaAtiva === "semirreacoes" && (
          <Semirreacoes />
        )}


      {ehFerro &&
        abaAtiva === "estequiometria" && (
          <Estequiometria
            resultado={
              resultadoFerro
            }
          />
        )}


      {ehFerro &&
        abaAtiva === "curva" && (
          <CurvaPotenciometrica
            resultado={
              resultadoFerro
            }
          />
        )}

{ehFerro &&
  abaAtiva === "derivadas" && (
    <DerivadasRedox
      sistema="ferro-ii"
      volumeEquivalenciaMl={
        resultadoFerro
          .volumeEquivalenciaMl
      }
      pontos={
        resultadoFerro
          .pontosValidos
      }
    />
  )}

{ehFerro &&
  abaAtiva ===
    "concentracao" && (
    <EfeitoConcentracaoRedox
      sistema="ferro-ii"
      resultadoBase={
        resultadoFerro
      }
    />
  )}

{ehFerro &&
  abaAtiva ===
    "tempo-real" && (
    <TempoRealRedox
      resultadoBase={
        resultadoFerro
      }
    />
  )}

{ehFerro &&
  abaAtiva ===
    "erro-experimental" && (
    <ErroExperimentalRedox
      resultadoBase={
        resultadoFerro
      }
    />
  )}
  
      {ehPeroxido &&
        abaAtiva === "visao-geral" && (
          <VisaoGeralPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}


      {ehPeroxido &&
        abaAtiva === "semirreacoes" && (
          <SemirreacoesPeroxido />
        )}


      {ehPeroxido &&
        abaAtiva === "estequiometria" && (
          <EstequiometriaPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}


      {ehPeroxido &&
        abaAtiva === "curva" && (
          <CurvaPotenciometricaPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}

{ehPeroxido &&
  abaAtiva === "derivadas" && (
    <DerivadasRedox
      sistema="peroxido-hidrogenio"
      volumeEquivalenciaMl={
        resultadoPeroxido
          .volumeEquivalenciaMl
      }
      pontos={
        resultadoPeroxido
          .pontosValidos
      }
    />
  )}

{ehPeroxido &&
  abaAtiva ===
    "concentracao" && (
    <EfeitoConcentracaoRedox
      sistema="peroxido-hidrogenio"
      resultadoBase={
        resultadoPeroxido
      }
    />
  )}


      {ehOxalato &&
        abaAtiva === "visao-geral" && (
          <VisaoGeralOxalato
            resultado={
              resultadoOxalato
            }
          />
        )}


      {ehOxalato &&
        abaAtiva === "estequiometria" && (
          <EstequiometriaOxalato
            resultado={
              resultadoOxalato
            }
          />
        )}
    </section>
  );
}