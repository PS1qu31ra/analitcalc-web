"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  analitosArgentometricosDiretos,
  type AnalitoArgentometricoDireto,
} from "@/lib/precipitacao/metodosDiretos";

import {
  saisPrecipitacao,
} from "@/lib/data/precipitacao/sais";

import {
  calcularTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/calculosTitulacaoRetorno";

import type {
  ResultadoTitulacaoRetornoPrecipitacao,
} from "@/lib/precipitacao/tipos";

import EntradaDados from "./EntradaDados";
import Resultados from "./Resultados";
import Graficos from "./Graficos";

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

export default function TitulacaoRetorno() {
  const primeiroAnalito =
    analitosArgentometricosDiretos[0];

  const [
    analitoId,
    setAnalitoId,
  ] = useState<AnalitoArgentometricoDireto>(
    primeiroAnalito.id
  );

  const [
    concentracaoAnalito,
    setConcentracaoAnalito,
  ] = useState("0,0100");

  const [
    volumeAmostra,
    setVolumeAmostra,
  ] = useState("25,00");

  const [
    concentracaoAgNO3,
    setConcentracaoAgNO3,
  ] = useState("0,0200");

  const [
    volumeAgNO3,
    setVolumeAgNO3,
  ] = useState("20,00");

  const [
    concentracaoSCN,
    setConcentracaoSCN,
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
    useState<ResultadoTitulacaoRetornoPrecipitacao | null>(
      null
    );

  const analito =
    useMemo(() => {
      return (
        analitosArgentometricosDiretos.find(
          (item) =>
            item.id === analitoId
        ) ?? primeiroAnalito
      );
    }, [
      analitoId,
      primeiroAnalito,
    ]);

  const salPrincipal =
    useMemo(() => {
      return (
        saisPrecipitacao.find(
          (sal) =>
            sal.id ===
              analito.precipitado ||
            sal.formula ===
              analito.precipitado ||
            sal.formulaExibicao ===
              analito.precipitado
        ) ?? null
      );
    }, [analito]);

  function alterarAnalito(
    novoAnalitoId:
      AnalitoArgentometricoDireto
  ) {
    setAnalitoId(
      novoAnalitoId
    );

    setResultado(null);
    setErro("");
  }

  function calcular(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setResultado(null);

    if (!salPrincipal) {
      setErro(
        "Não foi possível localizar o precipitado principal do analito selecionado na base de dados."
      );

      return;
    }

    const concentracaoAnalitoNumero =
      converterNumeroBR(
        concentracaoAnalito
      );

    const volumeAmostraNumero =
      converterNumeroBR(
        volumeAmostra
      );

    const concentracaoAgNO3Numero =
      converterNumeroBR(
        concentracaoAgNO3
      );

    const volumeAgNO3Numero =
      converterNumeroBR(
        volumeAgNO3
      );

    const concentracaoSCNNumero =
      converterNumeroBR(
        concentracaoSCN
      );

    const volumeMaximoBuretaNumero =
      converterNumeroBR(
        volumeMaximoBureta
      );

    const valores = [
      concentracaoAnalitoNumero,
      volumeAmostraNumero,
      concentracaoAgNO3Numero,
      volumeAgNO3Numero,
      concentracaoSCNNumero,
      volumeMaximoBuretaNumero,
    ];

    const dadosValidos =
      valores.every(
        (valor) =>
          Number.isFinite(valor) &&
          valor > 0
      );

    if (!dadosValidos) {
      setErro(
        "Informe valores numéricos positivos em todos os campos."
      );

      return;
    }

    const novoResultado =
      calcularTitulacaoRetornoPrecipitacao({
        salPrincipal,
        especieAnalito: "anion",

        concentracaoAnalito:
          concentracaoAnalitoNumero,

        volumeAmostra:
          volumeAmostraNumero,

        concentracaoPrecipitanteExcesso:
          concentracaoAgNO3Numero,

        volumePrecipitanteExcesso:
          volumeAgNO3Numero,

        concentracaoTitulanteRetorno:
          concentracaoSCNNumero,

        volumeMaximoBuretaRetorno:
          volumeMaximoBuretaNumero,
      });

    setResultado(
      novoResultado
    );
  }

  return (
    <section className="precipitacaoReturnSection">
      <EntradaDados
        analito={analito}
        concentracaoAnalito={
          concentracaoAnalito
        }
        volumeAmostra={
          volumeAmostra
        }
        concentracaoAgNO3={
          concentracaoAgNO3
        }
        volumeAgNO3={
          volumeAgNO3
        }
        concentracaoSCN={
          concentracaoSCN
        }
        volumeMaximoBureta={
          volumeMaximoBureta
        }
        erro={erro}
        onAnalitoChange={
          alterarAnalito
        }
        onConcentracaoAnalitoChange={
          setConcentracaoAnalito
        }
        onVolumeAmostraChange={
          setVolumeAmostra
        }
        onConcentracaoAgNO3Change={
          setConcentracaoAgNO3
        }
        onVolumeAgNO3Change={
          setVolumeAgNO3
        }
        onConcentracaoSCNChange={
          setConcentracaoSCN
        }
        onVolumeMaximoBuretaChange={
          setVolumeMaximoBureta
        }
        onSubmit={calcular}
      />

{resultado && (
  <>
    <Resultados
      resultado={resultado}
    />

    {(resultado.status === "adequado" ||
      resultado.status === "fora_da_bureta") && (
        <Graficos
        resultado={resultado}
      />
    )}
  </>
)}
    </section>
  );
}