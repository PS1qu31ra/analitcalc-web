"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  gerarCurvaPermanganometriaFerro,
  type ResultadoCurvaRedox,
} from "@/lib/oxirreducao/curvaRedox";

import type {
  EntradaPermanganometriaFerro,
} from "@/lib/oxirreducao/permanganometria";

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


function gerarResultadoInicial() {
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
    temperatura,
    setTemperatura,
  ] = useState(
    "25"
  );


  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoCurvaRedox>(
      gerarResultadoInicial
    );


  const [
    erro,
    setErro,
  ] = useState(
    ""
  );


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


    /*
     * Nesta etapa, apenas Fe²⁺ possui
     * motor de cálculo liberado.
     */
    if (
      sistemaAtivo !==
      "ferro-ii"
    ) {
      setErro(
        "O motor deste sistema ainda está em desenvolvimento."
      );

      return;
    }


    try {
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


      const novaCurva =
        gerarCurvaPermanganometriaFerro({
          entrada,
        });


      setResultado(
        novaCurva
      );

      setErro(
        ""
      );

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
          permanganato, a estequiometria, os potenciais redox
          e a curva potenciométrica da titulação.
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
            {
              sistema.titulante
            }
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

            <p>
              Informe as condições utilizadas no experimento.
            </p>
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
                    event
                      .target
                      .value
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
                    event
                      .target
                      .value
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
                    event
                      .target
                      .value
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
                    event
                      .target
                      .value
                  )
                }
              />

              <span>
                mol/L
              </span>
            </div>

            <small>
              A concentração de H⁺ influencia o comportamento
              do sistema MnO₄⁻/Mn²⁺.
            </small>
          </label>


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
                    event
                      .target
                      .value
                  )
                }
              />

              <span>
                °C
              </span>
            </div>
          </label>


          {erro && (
            <div
              className="oxirreducaoError"
              role="alert"
            >
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
                  resultado
                    .volumeEquivalenciaMl,
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
                {formatarNumero(
                  resultado
                    .potencialEquivalenciaV,
                  3
                )}{" "}
                V
              </strong>
            </article>


            <article className="oxirreducaoResultCard">
              <span>
                Relação
              </span>

              <strong>
                5 : 1
              </strong>

              <p>
                Fe²⁺ : MnO₄⁻
              </p>
            </article>


            <article className="oxirreducaoResultCard">
              <span>
                Meio
              </span>

              <strong>
                Ácido
              </strong>

              <p>
                H⁺ participa da redução do permanganato.
              </p>
            </article>
          </div>


          <div className="oxirreducaoReactionBox">
            <span>
              Reação global
            </span>

            <strong>
              MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O
            </strong>
          </div>
        </aside>
      </div>


      <PermanganometriaTabs
        abaAtiva={
          abaAtiva
        }
        onChange={
          setAbaAtiva
        }
      />


      {abaAtiva ===
        "visao-geral" && (
        <VisaoGeral
          resultado={
            resultado
          }
        />
      )}


      {abaAtiva ===
        "semirreacoes" && (
        <Semirreacoes />
      )}


      {abaAtiva ===
        "estequiometria" && (
        <Estequiometria
          resultado={
            resultado
          }
        />
      )}


      {abaAtiva ===
        "curva" && (
        <CurvaPotenciometrica
          resultado={
            resultado
          }
        />
      )}
    </section>
  );
}