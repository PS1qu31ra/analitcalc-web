"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  saisPrecipitacao,
} from "@/lib/data/precipitacao/sais";

import {
  calcularSeletividadePrecipitacao,
} from "@/lib/precipitacao/calculosSeletividade";

import type {
  EntradaSeletividadePrecipitacao,
  EspeciePrecipitacao,
  ResultadoSeletividadePrecipitacao,
  SalPrecipitacao,
} from "@/lib/precipitacao/tipos";

import EntradaDados from "./EntradaDados";

import ResultadoSeletividade from "./ResultadoSeletividade";

type ItemMisturaFormulario = {
  id: string;
  sal: SalPrecipitacao;
  especieAnalito: EspeciePrecipitacao;
  concentracaoAnalito: string;
};

function converterNumeroBR(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return NaN;
  }

  return Number(
    texto.includes(",")
      ? texto
          .replace(/\./g, "")
          .replace(",", ".")
      : texto
  );
}
function obterIonTitulanteDoSal({
  sal,
  especieTitulante,
}: {
  sal: SalPrecipitacao;
  especieTitulante: EspeciePrecipitacao;
}) {
  return especieTitulante === "cation"
    ? sal.cation
    : sal.anion;
}

function obterEspecieAnalito(
  especieTitulante:
    EspeciePrecipitacao
): EspeciePrecipitacao {
  return especieTitulante ===
    "cation"
    ? "anion"
    : "cation";
}

export default function PrecipitacaoSeletiva() {
  const saisCompativeis =
    useMemo(
      () =>
        saisPrecipitacao.filter(
          (sal) =>
            sal.usos.includes(
              "seletividade"
            )
        ),
      []
    );

  const primeiroSal =
    saisCompativeis[0];

    const segundoSal =
    saisCompativeis.find(
      (sal) =>
        sal.id !== primeiroSal.id &&
        sal.cation.id ===
          primeiroSal.cation.id
    ) ??
    saisCompativeis[1] ??
    primeiroSal;

  const [
    especieTitulante,
    setEspecieTitulante,
  ] =
    useState<EspeciePrecipitacao>(
      "cation"
    );

  const [
    itens,
    setItens,
  ] =
    useState<ItemMisturaFormulario[]>(
      [
        {
          id: "especie-1",
          sal: primeiroSal,
          especieAnalito:
            "anion",
          concentracaoAnalito:
            "0,0100",
        },
        {
          id: "especie-2",
          sal: segundoSal,
          especieAnalito:
            "anion",
          concentracaoAnalito:
            "0,0100",
        },
      ]
    );

  const [
    volumeAmostra,
    setVolumeAmostra,
  ] = useState("25,00");

  const [
    concentracaoTitulante,
    setConcentracaoTitulante,
  ] = useState("0,0100");

  const [
    volumeMaximoBureta,
    setVolumeMaximoBureta,
  ] = useState("50,00");

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoSeletividadePrecipitacao | null>(
      null
    );

    const [
      dadosCalculados,
      setDadosCalculados,
    ] = useState<{
      volumeAmostra: number;
      concentracaoTitulante: number;
      volumeMaximoBureta: number;
    } | null>(null);

  function alterarEspecieTitulante(
    novaEspecie:
      EspeciePrecipitacao
  ) {
    setEspecieTitulante(
      novaEspecie
    );

    setItens(
      (itensAtuais) =>
        itensAtuais.map(
          (item) => ({
            ...item,
            especieAnalito:
              obterEspecieAnalito(
                novaEspecie
              ),
          })
        )
    );

    setResultado(null);
    setDadosCalculados(null);
    setErro("");
  }

  function adicionarItem() {
    const primeiroItem =
  itens[0];

const ionTitulanteReferencia =
  primeiroItem
    ? obterIonTitulanteDoSal({
        sal: primeiroItem.sal,
        especieTitulante,
      })
    : null;

const salDisponivel =
  saisCompativeis.find(
    (sal) => {
      const aindaNaoSelecionado =
        !itens.some(
          (item) =>
            item.sal.id ===
            sal.id
        );

      if (
        !aindaNaoSelecionado ||
        !ionTitulanteReferencia
      ) {
        return false;
      }

      const ionDoSal =
        obterIonTitulanteDoSal({
          sal,
          especieTitulante,
        });

      return (
        ionDoSal.id ===
        ionTitulanteReferencia.id
      );
    }
  );

  if (!salDisponivel) {
    setErro(
      "Não existe outro precipitado disponível na base que utilize o mesmo titulante das espécies já selecionadas."
    );
    return;
  }

    setItens(
      (itensAtuais) => [
        ...itensAtuais,
        {
          id:
            `especie-${Date.now()}`,
          sal: salDisponivel,
          especieAnalito:
            obterEspecieAnalito(
              especieTitulante
            ),
          concentracaoAnalito:
            "0,0100",
        },
      ]
    );

    setResultado(null);
    setDadosCalculados(null);
    setErro("");
  }

  function removerItem(
    id: string
  ) {
    setItens(
      (itensAtuais) =>
        itensAtuais.filter(
          (item) =>
            item.id !== id
        )
    );

    setResultado(null);
    setDadosCalculados(null);
    setErro("");
  }

  function alterarSal(
    id: string,
    salId: string
  ) {
    const novoSal =
      saisCompativeis.find(
        (sal) =>
          sal.id === salId
      );
  
    if (!novoSal) {
      return;
    }
  
    const indiceAlterado =
      itens.findIndex(
        (item) =>
          item.id === id
      );
  
    if (indiceAlterado < 0) {
      return;
    }
  
    /*
     * Quando uma espécie diferente da primeira
     * é alterada, basta substituir o sal escolhido.
     */
    if (indiceAlterado !== 0) {
      setItens(
        (itensAtuais) =>
          itensAtuais.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    sal: novoSal,
                    especieAnalito:
                      obterEspecieAnalito(
                        especieTitulante
                      ),
                  }
                : item
          )
      );
  
      setResultado(null);
      setDadosCalculados(null);
      setErro("");
  
      return;
    }
  
    /*
     * A primeira espécie define o íon titulante
     * comum da mistura. Ao alterá-la, os demais
     * sais precisam ser reorganizados.
     */
    const ionTitulanteReferencia =
      obterIonTitulanteDoSal({
        sal: novoSal,
        especieTitulante,
      });
  
    const saisDoMesmoSistema =
      saisCompativeis.filter(
        (sal) => {
          const ionDoSal =
            obterIonTitulanteDoSal({
              sal,
              especieTitulante,
            });
  
          return (
            ionDoSal.id ===
            ionTitulanteReferencia.id
          );
        }
      );
  
    if (
      saisDoMesmoSistema.length <
      itens.length
    ) {
      setErro(
        `O sistema com ${ionTitulanteReferencia.formulaExibicao} possui apenas ${saisDoMesmoSistema.length} precipitado(s) disponível(is), quantidade insuficiente para manter ${itens.length} espécies diferentes.`
      );
  
      return;
    }
  
    const idsUtilizados =
      new Set<string>();
  
    idsUtilizados.add(
      novoSal.id
    );
  
    const novosItens =
      itens.map(
        (item, indice) => {
          if (indice === 0) {
            return {
              ...item,
              sal: novoSal,
              especieAnalito:
                obterEspecieAnalito(
                  especieTitulante
                ),
            };
          }
  
          const salAtualCompativel =
            saisDoMesmoSistema.find(
              (sal) =>
                sal.id ===
                  item.sal.id &&
                !idsUtilizados.has(
                  sal.id
                )
            );
  
          const salSubstituto =
            salAtualCompativel ??
            saisDoMesmoSistema.find(
              (sal) =>
                !idsUtilizados.has(
                  sal.id
                )
            );
  
          if (!salSubstituto) {
            return item;
          }
  
          idsUtilizados.add(
            salSubstituto.id
          );
  
          return {
            ...item,
            sal: salSubstituto,
            especieAnalito:
              obterEspecieAnalito(
                especieTitulante
              ),
          };
        }
      );
  
    setItens(
      novosItens
    );
  
    setResultado(null);
    setDadosCalculados(null);
    setErro("");
  }

  function alterarConcentracao(
    id: string,
    valor: string
  ) {
    setItens(
      (itensAtuais) =>
        itensAtuais.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  concentracaoAnalito:
                    valor,
                }
              : item
        )
    );

    setResultado(null);
    setDadosCalculados(null);
    setErro("");
  }

  function calcular(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setResultado(null);
    setDadosCalculados(null);

    if (
      itens.length < 2
    ) {
      setErro(
        "Adicione pelo menos duas espécies para avaliar a precipitação seletiva."
      );
      return;
    }

    const saisRepetidos =
      new Set(
        itens.map(
          (item) =>
            item.sal.id
        )
      ).size !==
      itens.length;

    if (saisRepetidos) {
      setErro(
        "Selecione precipitados diferentes para cada espécie da mistura."
      );
      return;
    }

    const ionsTitulantes =
  itens.map((item) =>
    obterIonTitulanteDoSal({
      sal: item.sal,
      especieTitulante,
    })
  );

const ionTitulanteReferencia =
  ionsTitulantes[0];

const mesmoTitulante =
  ionsTitulantes.every(
    (ion) =>
      ion.id ===
      ionTitulanteReferencia.id
  );

if (!mesmoTitulante) {
  setErro(
    `Todos os precipitados devem utilizar o mesmo titulante. O primeiro sistema utiliza ${ionTitulanteReferencia.formulaExibicao}, mas há espécies selecionadas com outro íon precipitante.`
  );
  return;
}

    const volumeAmostraNumero =
      converterNumeroBR(
        volumeAmostra
      );

    const concentracaoTitulanteNumero =
      converterNumeroBR(
        concentracaoTitulante
      );

    const volumeMaximoBuretaNumero =
      converterNumeroBR(
        volumeMaximoBureta
      );

    if (
      !Number.isFinite(
        volumeAmostraNumero
      ) ||
      volumeAmostraNumero <= 0
    ) {
      setErro(
        "Informe um volume de amostra positivo e válido."
      );
      return;
    }

    if (
      !Number.isFinite(
        concentracaoTitulanteNumero
      ) ||
      concentracaoTitulanteNumero <=
        0
    ) {
      setErro(
        "Informe uma concentração positiva e válida para o titulante."
      );
      return;
    }

    if (
      !Number.isFinite(
        volumeMaximoBuretaNumero
      ) ||
      volumeMaximoBuretaNumero <=
        0
    ) {
      setErro(
        "Informe uma capacidade de bureta positiva e válida."
      );
      return;
    }

    const itensCalculados =
      itens.map((item) => ({
        sal: item.sal,
        especieAnalito:
          obterEspecieAnalito(
            especieTitulante
          ),
        concentracaoAnalito:
          converterNumeroBR(
            item.concentracaoAnalito
          ),
      }));

    const concentracoesValidas =
      itensCalculados.every(
        (item) =>
          Number.isFinite(
            item.concentracaoAnalito
          ) &&
          item.concentracaoAnalito >
            0
      );

    if (
      !concentracoesValidas
    ) {
      setErro(
        "Informe concentrações positivas e válidas para todas as espécies."
      );
      return;
    }

    const entrada:
      EntradaSeletividadePrecipitacao =
      {
        especieTitulante,
        itens:
          itensCalculados,
      };

    const novoResultado =
      calcularSeletividadePrecipitacao(
        entrada
      );

      setDadosCalculados({
        volumeAmostra:
          volumeAmostraNumero,
        concentracaoTitulante:
          concentracaoTitulanteNumero,
        volumeMaximoBureta:
          volumeMaximoBuretaNumero,
      });

    setResultado(
      novoResultado
    );
  }

  return (
    <section>
      <EntradaDados
        especieTitulante={
          especieTitulante
        }
        itens={itens}
        volumeAmostra={
          volumeAmostra
        }
        concentracaoTitulante={
          concentracaoTitulante
        }
        volumeMaximoBureta={
          volumeMaximoBureta
        }
        erro={erro}
        onEspecieTitulanteChange={
          alterarEspecieTitulante
        }
        onAdicionarItem={
          adicionarItem
        }
        onRemoverItem={
          removerItem
        }
        onSalChange={
          alterarSal
        }
        onConcentracaoChange={
          alterarConcentracao
        }
        onVolumeAmostraChange={(valor) => {
          setVolumeAmostra(valor);
          setResultado(null);
          setDadosCalculados(null);
          setErro("");
        }}
        onConcentracaoTitulanteChange={(valor) => {
          setConcentracaoTitulante(valor);
          setResultado(null);
          setDadosCalculados(null);
          setErro("");
        }}
        onVolumeMaximoBuretaChange={(valor) => {
          setVolumeMaximoBureta(valor);
          setResultado(null);
          setDadosCalculados(null);
          setErro("");
        }}
        onSubmit={calcular}
      />

{resultado &&
  dadosCalculados && (
    <ResultadoSeletividade
      resultado={resultado}
      volumeAmostra={
        dadosCalculados.volumeAmostra
      }
      concentracaoTitulante={
        dadosCalculados.concentracaoTitulante
      }
      volumeMaximoBureta={
        dadosCalculados.volumeMaximoBureta
      }
    />
  )}
    </section>
  );
}