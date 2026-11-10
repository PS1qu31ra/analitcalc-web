"use client";

import {
  useMemo,
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
  gerarCurvaPermanganometriaOxalato,
  type ResultadoCurvaRedoxOxalato,
} from "@/lib/oxirreducao/curvaRedoxOxalato";

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
import SemirreacoesOxalato from "./SemirreacoesOxalato";
import EstequiometriaOxalato from "./EstequiometriaOxalato";
import CurvaPotenciometricaOxalato from "./CurvaPotenciometricaOxalato";

import DerivadasRedox from "./DerivadasRedox";

import EfeitoConcentracaoRedox from "./EfeitoConcentracaoRedox";

import TempoRealRedox from "./TempoRealRedox";

import ErroExperimentalRedox from "./ErroExperimentalRedox";


const CONCENTRACAO_H_PLUS_FIXA_MOL_L = 1;
const TEMPERATURA_FIXA_C = 25;


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
  ] = useState("");


  const [
    volumeAnalito,
    setVolumeAnalito,
  ] = useState("");


  const [
    concentracaoTitulante,
    setConcentracaoTitulante,
  ] = useState("");


  const [
    resultadoFerro,
    setResultadoFerro,
  ] = useState<ResultadoCurvaRedox | null>(null);


  const [
    resultadoPeroxido,
    setResultadoPeroxido,
  ] = useState<ResultadoCurvaRedoxPeroxido | null>(null);


  const [
    resultadoOxalato,
    setResultadoOxalato,
  ] = useState<ResultadoCurvaRedoxOxalato | null>(null);


  const [
    erro,
    setErro,
  ] = useState(
    ""
  );

  const [jaCalculou, setJaCalculou] = useState(false);
  const [dadosAlterados, setDadosAlterados] = useState(false);


  const ehFerro =
    sistemaAtivo ===
    "ferro-ii";


  const ehPeroxido =
    sistemaAtivo ===
    "peroxido-hidrogenio";


  const ehOxalato =
    sistemaAtivo ===
    "oxalato";

    const resultadoOxalatoDerivadas =
    useMemo(
      () => {
        const abaUsaCurvaRefinada =
          abaAtiva === "derivadas" ||
          abaAtiva === "tempo-real" ||
          abaAtiva === "erro-experimental";


        if (
          !ehOxalato ||
          !resultadoOxalato ||
          !abaUsaCurvaRefinada
        ) {
          return null;
        }


        const volumePE =
          resultadoOxalato
            .volumeEquivalenciaMl;


        return gerarCurvaPermanganometriaOxalato({
          entrada:
            resultadoOxalato
              .entrada,

          configuracao: {
            volumeMaximoMl:
              resultadoOxalato
                .volumeMaximoMl,

            passoBaseMl:
              Math.max(
                volumePE / 100,
                0.05
              ),

            passoProximoPEMl:
              Math.max(
                volumePE / 10000,
                0.001
              ),

            faixaDensaFracao:
              0.02,
          },
        });
      },
      [
        abaAtiva,
        ehOxalato,
        resultadoOxalato,
      ]
    );


  const volumeEquivalenciaAtivo =
    ehFerro
      ? resultadoFerro?.volumeEquivalenciaMl ?? null
      : ehPeroxido
        ? resultadoPeroxido?.volumeEquivalenciaMl ?? null
        : resultadoOxalato?.volumeEquivalenciaMl ?? null;


  const potencialEquivalenciaAtivo =
    ehFerro
      ? resultadoFerro?.potencialEquivalenciaV ?? null
      : ehPeroxido
        ? resultadoPeroxido?.potencialEquivalenciaV ?? null
        : resultadoOxalato?.potencialEquivalenciaV ?? null;

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

    setConcentracaoAnalito("");
    setVolumeAnalito("");
    setConcentracaoTitulante("");
    setResultadoFerro(null);
    setResultadoPeroxido(null);
    setResultadoOxalato(null);

    setErro(
      ""
    );
    setJaCalculou(false);
    setDadosAlterados(false);
  }


  function calcular(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const camposObrigatorios = [
      concentracaoAnalito,
      volumeAnalito,
      concentracaoTitulante,
    ];

    const entradaCompleta = camposObrigatorios.every((valor) => {
      const numero = converterNumero(valor);
      return valor.trim() !== "" && Number.isFinite(numero) && numero > 0;
    });

    if (!entradaCompleta) {
      setErro("Preencha todos os campos com valores numéricos positivos antes de calcular.");
      return;
    }

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
              CONCENTRACAO_H_PLUS_FIXA_MOL_L,

            temperaturaC:
              TEMPERATURA_FIXA_C,
          };


        setResultadoFerro(
          gerarCurvaPermanganometriaFerro({
            entrada,
          })
        );


        setErro(
          ""
        );
        setJaCalculou(true);
        setDadosAlterados(false);

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
              CONCENTRACAO_H_PLUS_FIXA_MOL_L,

            temperaturaC:
              TEMPERATURA_FIXA_C,
          };


        setResultadoPeroxido(
          gerarCurvaPermanganometriaPeroxido({
            entrada,
          })
        );


        setErro(
          ""
        );
        setJaCalculou(true);
        setDadosAlterados(false);

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
              CONCENTRACAO_H_PLUS_FIXA_MOL_L,

            atividadeCO2:
              1,

            temperaturaC:
              TEMPERATURA_FIXA_C,
          };


          setResultadoOxalato(
            gerarCurvaPermanganometriaOxalato({
              entrada,
            })
          );


        setErro(
          ""
        );
        setJaCalculou(true);
        setDadosAlterados(false);
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
                value={concentracaoAnalito}
                placeholder="Ex.: 0,100"
                required
                onChange={(event) => {
                  setConcentracaoAnalito(event.target.value);
                  setDadosAlterados(true);
                  setJaCalculou(false);
                  setResultadoFerro(null);
                  setResultadoPeroxido(null);
                  setResultadoOxalato(null);
                  setErro("");
                }}
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
                value={volumeAnalito}
                placeholder={ehFerro ? "Ex.: 25,00" : "Ex.: 10,00"}
                required
                onChange={(event) => {
                  setVolumeAnalito(event.target.value);
                  setDadosAlterados(true);
                  setJaCalculou(false);
                  setResultadoFerro(null);
                  setResultadoPeroxido(null);
                  setResultadoOxalato(null);
                  setErro("");
                }}
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
                value={concentracaoTitulante}
                placeholder="Ex.: 0,0200"
                required
                onChange={(event) => {
                  setConcentracaoTitulante(event.target.value);
                  setDadosAlterados(true);
                  setJaCalculou(false);
                  setResultadoFerro(null);
                  setResultadoPeroxido(null);
                  setResultadoOxalato(null);
                  setErro("");
                }}
              />

              <span>
                mol/L
              </span>
            </div>
          </label>


          <div
            className="oxirreducaoFixedConditions"
            aria-label="Condições fixas da titulação"
          >
            <div className="oxirreducaoFixedCondition">
              <span>Concentração de H⁺</span>
              <strong>1,00 mol/L</strong>
            </div>

            <div className="oxirreducaoFixedCondition">
              <span>Temperatura</span>
              <strong>25 °C</strong>
            </div>

            <p className="oxirreducaoFixedConditionsNote">
              Condições padronizadas para os sistemas de permanganometria.
            </p>
          </div>


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


        {jaCalculou ? (
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

            <span
              className="oxirreducaoStatus"
            >
              Ativo
            </span>
          </header>


          <div className="oxirreducaoResultsGrid">
            <article className="oxirreducaoResultCard oxirreducaoResultCardMain">
              <span>
                Volume de equivalência
              </span>

              <strong>
                {volumeEquivalenciaAtivo !== null
                  ? `${formatarNumero(volumeEquivalenciaAtivo, 2)} mL`
                  : "—"}
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
                      4
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
                ? "MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ ⇌ Mn²⁺ + 5 Fe³⁺ + 4 H₂O"
                : ehPeroxido
                  ? "2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ ⇌ 2 Mn²⁺ + 5 O₂ + 8 H₂O"
                  : "2 MnO₄⁻ + 5 H₂C₂O₄ + 6 H⁺ ⇌ 2 Mn²⁺ + 10 CO₂ + 8 H₂O"}
            </strong>
          </div>

        </aside>
        ) : (
          <aside className="oxirreducaoResults">
            <header className="oxirreducaoResultsHeader">
              <div>
                <span className="oxirreducaoSectionLabel">
                  Aguardando cálculo
                </span>
                <h3>Resultados da titulação</h3>
              </div>
              <span className="oxirreducaoStatus oxirreducaoStatusPending">
                Pendente
              </span>
            </header>
            <p className="oxirreducaoReferenceHint">
              {dadosAlterados
                ? "Os dados foram alterados. Clique em “Calcular sistema redox” para visualizar os resultados atualizados."
                : "Preencha os dados da titulação e clique em “Calcular sistema redox” para visualizar os resultados."}
            </p>
          </aside>
        )}
      </div>


      {jaCalculou && (
      <>
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


      {ehFerro && resultadoFerro &&
        abaAtiva === "visao-geral" && (
          <VisaoGeral
            resultado={
              resultadoFerro
            }
          />
        )}


      {ehFerro && resultadoFerro &&
        abaAtiva === "semirreacoes" && (
          <Semirreacoes />
        )}


      {ehFerro && resultadoFerro &&
        abaAtiva === "estequiometria" && (
          <Estequiometria
            resultado={
              resultadoFerro
            }
          />
        )}


      {ehFerro && resultadoFerro &&
        abaAtiva === "curva" && (
          <CurvaPotenciometrica
            resultado={
              resultadoFerro
            }
          />
        )}

{ehFerro && resultadoFerro &&
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

{ehFerro && resultadoFerro &&
  abaAtiva ===
    "concentracao" && (
    <EfeitoConcentracaoRedox
      sistema="ferro-ii"
      resultadoBase={
        resultadoFerro
      }
    />
  )}

{ehFerro && resultadoFerro &&
  abaAtiva ===
    "tempo-real" && (
    <TempoRealRedox
      sistema="ferro-ii"
      resultadoBase={
        resultadoFerro
      }
    />
  )}

{ehFerro && resultadoFerro &&
  abaAtiva ===
    "erro-experimental" && (
    <ErroExperimentalRedox
      sistema="ferro-ii"
      resultadoBase={
        resultadoFerro
      }
    />
  )}
  
      {ehPeroxido && resultadoPeroxido &&
        abaAtiva === "visao-geral" && (
          <VisaoGeralPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}


      {ehPeroxido && resultadoPeroxido &&
        abaAtiva === "semirreacoes" && (
          <SemirreacoesPeroxido />
        )}


      {ehPeroxido && resultadoPeroxido &&
        abaAtiva === "estequiometria" && (
          <EstequiometriaPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}


      {ehPeroxido && resultadoPeroxido &&
        abaAtiva === "curva" && (
          <CurvaPotenciometricaPeroxido
            resultado={
              resultadoPeroxido
            }
          />
        )}

{ehPeroxido && resultadoPeroxido &&
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

{ehPeroxido && resultadoPeroxido &&
  abaAtiva ===
    "concentracao" && (
    <EfeitoConcentracaoRedox
      sistema="peroxido-hidrogenio"
      resultadoBase={
        resultadoPeroxido
      }
    />
  )}

{ehPeroxido && resultadoPeroxido &&
  abaAtiva ===
    "tempo-real" && (
    <TempoRealRedox
      sistema="peroxido-hidrogenio"
      resultadoBase={
        resultadoPeroxido
      }
    />
  )}


{ehPeroxido && resultadoPeroxido &&
  abaAtiva ===
    "erro-experimental" && (
    <ErroExperimentalRedox
      sistema="peroxido-hidrogenio"
      resultadoBase={
        resultadoPeroxido
      }
    />
  )}


      {ehOxalato && resultadoOxalato &&
        abaAtiva === "visao-geral" && (
          <VisaoGeralOxalato
            resultado={
              resultadoOxalato
            }
          />
        )}

{ehOxalato && resultadoOxalato &&
  abaAtiva === "semirreacoes" && (
    <SemirreacoesOxalato />
  )}


      {ehOxalato && resultadoOxalato &&
        abaAtiva === "estequiometria" && (
          <EstequiometriaOxalato
            resultado={
              resultadoOxalato
            }
          />
        )}

{ehOxalato && resultadoOxalato &&
  abaAtiva === "curva" && (
    <CurvaPotenciometricaOxalato
      resultado={
        resultadoOxalato
      }
    />
  )}

{ehOxalato && resultadoOxalato &&
  abaAtiva ===
    "derivadas" &&
  resultadoOxalatoDerivadas && (
    <DerivadasRedox
      sistema="oxalato"
      volumeEquivalenciaMl={
        resultadoOxalato
          .volumeEquivalenciaMl
      }
      pontos={
        resultadoOxalatoDerivadas
          .pontosValidos
      }
    />
  )}

{ehOxalato && resultadoOxalato &&
  abaAtiva ===
    "concentracao" && (
    <EfeitoConcentracaoRedox
      sistema="oxalato"
      resultadoBase={
        resultadoOxalato
      }
    />
  )}

{ehOxalato && resultadoOxalato &&
  abaAtiva ===
    "tempo-real" &&
  resultadoOxalatoDerivadas && (
    <TempoRealRedox
      sistema="oxalato"
      resultadoBase={
        resultadoOxalatoDerivadas
      }
    />
  )}

{ehOxalato && resultadoOxalato &&
  abaAtiva ===
    "erro-experimental" &&
  resultadoOxalatoDerivadas && (
    <ErroExperimentalRedox
      sistema="oxalato"
      resultadoBase={
        resultadoOxalatoDerivadas
      }
    />
  )}
      </>
      )}
    </section>
  );
}