"use client";

import {
  useEffect,
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

import GraficoComparacaoConcentracaoRedox from "./GraficoComparacaoConcentracaoRedox";


type EfeitoConcentracaoRedoxProps = {
  resultadoBase:
    ResultadoCurvaRedox;
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
  casas = 4
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


function valorParaInput(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits:
        4,

      maximumFractionDigits:
        8,
    }
  ).format(
    valor
  );
}

function formatarValorRapido(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
      useGrouping: false,
    }
  ).format(
    valor
  );
}


export default function EfeitoConcentracaoRedox({
  resultadoBase,
}: EfeitoConcentracaoRedoxProps) {
  const entradaBase =
    resultadoBase.entrada;


  const [
    concentracaoFe2,
    setConcentracaoFe2,
  ] =
    useState(
      valorParaInput(
        entradaBase
          .concentracaoAnalitoMolL
      )
    );


  const [
    concentracaoKMnO4,
    setConcentracaoKMnO4,
  ] =
    useState(
      valorParaInput(
        entradaBase
          .concentracaoTitulanteMolL
      )
    );


  const [
    resultadoSimulado,
    setResultadoSimulado,
  ] =
    useState<ResultadoCurvaRedox>(
      resultadoBase
    );


  const [
    entradaSimulada,
    setEntradaSimulada,
  ] =
    useState<EntradaPermanganometriaFerro>(
      entradaBase
    );


  const [
    erro,
    setErro,
  ] =
    useState(
      ""
    );


  /*
   * Se o usuário recalcular o sistema
   * principal, a aba de concentração
   * passa a utilizar esse novo sistema
   * como referência.
   */
  useEffect(
    () => {
      setConcentracaoFe2(
        valorParaInput(
          resultadoBase
            .entrada
            .concentracaoAnalitoMolL
        )
      );


      setConcentracaoKMnO4(
        valorParaInput(
          resultadoBase
            .entrada
            .concentracaoTitulanteMolL
        )
      );


      setResultadoSimulado(
        resultadoBase
      );


      setEntradaSimulada(
        resultadoBase
          .entrada
      );


      setErro(
        ""
      );
    },
    [
      resultadoBase,
    ]
  );

  function aplicarFatorFe2(
    fator: number
  ) {
    const valorAtual =
      converterNumero(
        concentracaoFe2
      );
  
  
    const referencia =
      Number.isFinite(
        valorAtual
      ) &&
      valorAtual > 0
        ? valorAtual
        : entradaBase
            .concentracaoAnalitoMolL;
  
  
    const novoValor =
      referencia *
      fator;
  
  
    setConcentracaoFe2(
      formatarValorRapido(
        novoValor
      )
    );
  }
  
  
  function aplicarFatorKMnO4(
    fator: number
  ) {
    const valorAtual =
      converterNumero(
        concentracaoKMnO4
      );
  
  
    const referencia =
      Number.isFinite(
        valorAtual
      ) &&
      valorAtual > 0
        ? valorAtual
        : entradaBase
            .concentracaoTitulanteMolL;
  
  
    const novoValor =
      referencia *
      fator;
  
  
    setConcentracaoKMnO4(
      formatarValorRapido(
        novoValor
      )
    );
  }

  function aplicarSimulacao(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    try {
      const novaConcentracaoFe2 =
        converterNumero(
          concentracaoFe2
        );


      const novaConcentracaoKMnO4 =
        converterNumero(
          concentracaoKMnO4
        );


      if (
        !Number.isFinite(
          novaConcentracaoFe2
        ) ||
        novaConcentracaoFe2 <=
          0
      ) {
        throw new Error(
          "A concentração de Fe²⁺ deve ser positiva."
        );
      }


      if (
        !Number.isFinite(
          novaConcentracaoKMnO4
        ) ||
        novaConcentracaoKMnO4 <=
          0
      ) {
        throw new Error(
          "A concentração de KMnO₄ deve ser positiva."
        );
      }


      const novaEntrada:
        EntradaPermanganometriaFerro =
        {
          ...entradaBase,

          concentracaoAnalitoMolL:
            novaConcentracaoFe2,

          concentracaoTitulanteMolL:
            novaConcentracaoKMnO4,
        };


      const novaCurva =
        gerarCurvaPermanganometriaFerro({
          entrada:
            novaEntrada,
        });


      setEntradaSimulada(
        novaEntrada
      );


      setResultadoSimulado(
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
          : "Não foi possível aplicar a simulação."
      );
    }
  }


  function restaurarValoresOriginais() {
    setConcentracaoFe2(
      valorParaInput(
        entradaBase
          .concentracaoAnalitoMolL
      )
    );


    setConcentracaoKMnO4(
      valorParaInput(
        entradaBase
          .concentracaoTitulanteMolL
      )
    );


    setEntradaSimulada(
      entradaBase
    );


    setResultadoSimulado(
      resultadoBase
    );


    setErro(
      ""
    );
  }


  const deltaFe2 =
    entradaSimulada
      .concentracaoAnalitoMolL -
    entradaBase
      .concentracaoAnalitoMolL;


  const deltaKMnO4 =
    entradaSimulada
      .concentracaoTitulanteMolL -
    entradaBase
      .concentracaoTitulanteMolL;


  const deltaVPE =
    resultadoSimulado
      .volumeEquivalenciaMl -
    resultadoBase
      .volumeEquivalenciaMl;


  const deltaEPE =
    resultadoSimulado
      .potencialEquivalenciaV -
    resultadoBase
      .potencialEquivalenciaV;


  const razaoOriginal =
    entradaBase
      .concentracaoAnalitoMolL /
    entradaBase
      .concentracaoTitulanteMolL;


  const razaoSimulada =
    entradaSimulada
      .concentracaoAnalitoMolL /
    entradaSimulada
      .concentracaoTitulanteMolL;


  const fatorVolume =
    resultadoSimulado
      .volumeEquivalenciaMl /
    resultadoBase
      .volumeEquivalenciaMl;


  return (
    <section className="oxirreducaoTabPanel">
      <header className="oxirreducaoTabHeader">
        <span className="oxirreducaoSectionLabel">
          Efeito da concentração
        </span>

        <h3>
          Curva original × condição simulada
        </h3>

        <p>
          Altere livremente as concentrações de Fe²⁺ e de
          KMnO₄. Os dois valores podem ser modificados
          simultaneamente e o sistema será recalculado mantendo
          volume da amostra, acidez e temperatura constantes.
        </p>
      </header>


      <div className="oxirreducaoConcentracaoWorkspace">
        <form
          className="oxirreducaoConcentracaoEditor"
          onSubmit={
            aplicarSimulacao
          }
        >
          <header>
            <span>
              Nova condição
            </span>

            <h4>
              Concentrações da simulação
            </h4>

            <p>
              Digite os valores que deseja comparar com a
              condição original.
            </p>
          </header>


          <label>
            Concentração de Fe²⁺

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoFe2
                }
                onChange={(
                  event
                ) =>
                  setConcentracaoFe2(
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
              Original:{" "}
              {formatarNumero(
                entradaBase
                  .concentracaoAnalitoMolL,
                4
              )}{" "}
              mol/L
            </small>
          </label>


          <label>
            Concentração de KMnO₄

            <div className="oxirreducaoInputUnit">
              <input
                type="text"
                inputMode="decimal"
                value={
                  concentracaoKMnO4
                }
                onChange={(
                  event
                ) =>
                  setConcentracaoKMnO4(
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
              Original:{" "}
              {formatarNumero(
                entradaBase
                  .concentracaoTitulanteMolL,
                4
              )}{" "}
              mol/L
            </small>
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
            type="submit"
            className="oxirreducaoCalculateButton"
          >
            Aplicar simulação
          </button>


          <button
            type="button"
            className="oxirreducaoConcentracaoRestore"
            onClick={
              restaurarValoresOriginais
            }
          >
            Restaurar valores originais
          </button>
        </form>


        <div className="oxirreducaoConcentracaoComparison">
          <article>
            <span>
              Fe²⁺ original
            </span>

            <strong>
              {formatarNumero(
                entradaBase
                  .concentracaoAnalitoMolL,
                4
              )}{" "}
              mol/L
            </strong>
          </article>


          <article>
            <span>
              Fe²⁺ simulado
            </span>

            <strong>
              {formatarNumero(
                entradaSimulada
                  .concentracaoAnalitoMolL,
                4
              )}{" "}
              mol/L
            </strong>

            <small>
              Δ ={" "}
              {formatarNumero(
                deltaFe2,
                4
              )}{" "}
              mol/L
            </small>
          </article>


          <article>
            <span>
              KMnO₄ original
            </span>

            <strong>
              {formatarNumero(
                entradaBase
                  .concentracaoTitulanteMolL,
                4
              )}{" "}
              mol/L
            </strong>
          </article>


          <article>
            <span>
              KMnO₄ simulado
            </span>

            <strong>
              {formatarNumero(
                entradaSimulada
                  .concentracaoTitulanteMolL,
                4
              )}{" "}
              mol/L
            </strong>

            <small>
              Δ ={" "}
              {formatarNumero(
                deltaKMnO4,
                4
              )}{" "}
              mol/L
            </small>
          </article>

          <div className="oxirreducaoConcentracaoQuickActions">
  <section>
    <header>
      <div>
        <span>
          Titulado
        </span>

        <strong>
          Fe²⁺
        </strong>
      </div>

      <small>
        Ajuste rápido
      </small>
    </header>


    <div className="oxirreducaoConcentracaoQuickButtons">
      <button
        type="button"
        onClick={() =>
          aplicarFatorFe2(
            2
          )
        }
      >
        ×2
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorFe2(
            5
          )
        }
      >
        ×5
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorFe2(
            0.5
          )
        }
      >
        ÷2
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorFe2(
            0.2
          )
        }
      >
        ÷5
      </button>
    </div>


    <p>
      Valor atual no campo:
      <strong>
        {" "}
        {
          concentracaoFe2
        }{" "}
        mol/L
      </strong>
    </p>
  </section>


  <section>
    <header>
      <div>
        <span>
          Titulante
        </span>

        <strong>
          KMnO₄
        </strong>
      </div>

      <small>
        Ajuste rápido
      </small>
    </header>


    <div className="oxirreducaoConcentracaoQuickButtons">
      <button
        type="button"
        onClick={() =>
          aplicarFatorKMnO4(
            2
          )
        }
      >
        ×2
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorKMnO4(
            5
          )
        }
      >
        ×5
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorKMnO4(
            0.5
          )
        }
      >
        ÷2
      </button>

      <button
        type="button"
        onClick={() =>
          aplicarFatorKMnO4(
            0.2
          )
        }
      >
        ÷5
      </button>
    </div>


    <p>
      Valor atual no campo:
      <strong>
        {" "}
        {
          concentracaoKMnO4
        }{" "}
        mol/L
      </strong>
    </p>
  </section>
</div>
        </div>
      </div>


      <div className="oxirreducaoConcentracaoResumo">
        <article>
          <span>
            VPE original
          </span>

          <strong>
            {formatarNumero(
              resultadoBase
                .volumeEquivalenciaMl,
              3
            )}{" "}
            mL
          </strong>
        </article>


        <article>
          <span>
            VPE simulado
          </span>

          <strong>
            {formatarNumero(
              resultadoSimulado
                .volumeEquivalenciaMl,
              3
            )}{" "}
            mL
          </strong>

          <small>
            ΔV ={" "}
            {formatarNumero(
              deltaVPE,
              3
            )}{" "}
            mL
          </small>
        </article>


        <article>
          <span>
            EPE original
          </span>

          <strong>
            {formatarNumero(
              resultadoBase
                .potencialEquivalenciaV,
              4
            )}{" "}
            V
          </strong>
        </article>


        <article>
          <span>
            EPE simulado
          </span>

          <strong>
            {formatarNumero(
              resultadoSimulado
                .potencialEquivalenciaV,
              4
            )}{" "}
            V
          </strong>

          <small>
            ΔE ={" "}
            {formatarNumero(
              deltaEPE,
              4
            )}{" "}
            V
          </small>
        </article>
      </div>


      <div className="oxirreducaoDerivativeSection">
        <header>
          <span>
            Comparação
          </span>

          <h4>
            Curva original × simulada
          </h4>

          <p>
            As duas curvas utilizam o mesmo modelo de equilíbrio
            contínuo. A condição original permanece como
            referência enquanto a condição simulada utiliza as
            novas concentrações informadas.
          </p>
        </header>

        <div className="oxirreducaoComparacaoLegend">
          <article className="oxirreducaoComparacaoLegendItem oxirreducaoComparacaoLegendItemOriginal">
            <div className="oxirreducaoComparacaoLegendHead">
              <span className="oxirreducaoComparacaoLegendDot oxirreducaoComparacaoLegendDotOriginal" />

              <div>
                <strong>
                  Condição original
                </strong>

                <small>
                  PE ={" "}
                  {formatarNumero(
                    resultadoBase.volumeEquivalenciaMl,
                    3
                  )}{" "}
                  mL
                </small>
              </div>
            </div>
          </article>

          <article className="oxirreducaoComparacaoLegendItem oxirreducaoComparacaoLegendItemSimulada">
            <div className="oxirreducaoComparacaoLegendHead">
              <span className="oxirreducaoComparacaoLegendDot oxirreducaoComparacaoLegendDotSimulada" />

              <div>
                <strong>
                  Condição simulada
                </strong>

                <small>
                  PE ={" "}
                  {formatarNumero(
                    resultadoSimulado.volumeEquivalenciaMl,
                    3
                  )}{" "}
                  mL
                </small>
              </div>
            </div>
          </article>
        </div>

        <GraficoComparacaoConcentracaoRedox
          original={
            resultadoBase
          }
          simulado={
            resultadoSimulado
          }
        />
      </div>

      <div className="oxirreducaoConcentracaoInterpretacao">
        <header className="oxirreducaoConcentracaoInterpretacaoHeader">
          <span>
            Relação matemática
          </span>

          <h4>
            Relação entre as concentrações
          </h4>

          <p>
            Mantendo o volume inicial da amostra constante,
            a posição do ponto de equivalência depende da
            relação entre a concentração do titulado e a
            concentração do titulante.
          </p>
        </header>


        <div className="oxirreducaoConcentracaoRelationLayout">
          <div className="oxirreducaoConcentracaoFormulaPanel">
            <span>
              Relação fundamental
            </span>

            <strong>
              VPE ∝
            </strong>

            <div className="oxirreducaoConcentracaoFraction">
              <span>
                [Fe²⁺]
              </span>

              <i />

              <span>
                [MnO₄⁻]
              </span>
            </div>

            <p>
              Quanto maior essa razão, maior será o volume de
              titulante necessário para atingir a equivalência.
            </p>
          </div>


          <div className="oxirreducaoConcentracaoMetrics">
            <article>
              <span>
                Razão original
              </span>

              <strong>
                {formatarNumero(
                  razaoOriginal,
                  4
                )}
              </strong>

              <small>
                [Fe²⁺] / [MnO₄⁻]
              </small>
            </article>


            <div className="oxirreducaoConcentracaoRelationArrow">
              →
            </div>


            <article>
              <span>
                Razão simulada
              </span>

              <strong>
                {formatarNumero(
                  razaoSimulada,
                  4
                )}
              </strong>

              <small>
                [Fe²⁺] / [MnO₄⁻]
              </small>
            </article>


            <article className="oxirreducaoConcentracaoMetricHighlight">
              <span>
                Deslocamento relativo do PE
              </span>

              <strong>
                {formatarNumero(
                  fatorVolume,
                  4
                )}
                ×
              </strong>

              <small>
                VPE simulado / VPE original
              </small>
            </article>
          </div>
        </div>


        <div className="oxirreducaoConcentracaoInterpretacaoFooter">
          <div>
            <strong>
              ↑ [Fe²⁺]
            </strong>

            <span>
              tende a aumentar o VPE
            </span>
          </div>

          <div>
            <strong>
              ↑ [KMnO₄]
            </strong>

            <span>
              tende a diminuir o VPE
            </span>
          </div>

          <div>
            <strong>
              mesma proporção
            </strong>

            <span>
              pode manter o VPE constante
            </span>
          </div>
        </div>
      </div>

      <div className="oxirreducaoEducationalNote">
        <strong>
          O que permanece constante?
        </strong>

        <p>
          Esta simulação altera somente as duas concentrações
          informadas. O volume inicial da amostra, a
          concentração de H⁺ e a temperatura permanecem iguais
          ao sistema definido na calculadora principal.
        </p>
      </div>
    </section>
  );
}