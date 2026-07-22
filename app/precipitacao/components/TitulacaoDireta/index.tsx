"use client";

import { useMemo, useState } from "react";

import { saisPrecipitacao } from "@/lib/data/precipitacao/sais";
import { calcularTitulacaoDiretaPrecipitacao } from "@/lib/precipitacao/calculosTitulacaoDireta";
import {
  analitosArgentometricosDiretos,
  type ConfiguracaoAnalitoDireto,
  type MetodoArgentometricoDireto,
} from "@/lib/precipitacao/metodosDiretos";
import type { ResultadoTitulacaoDiretaPrecipitacao } from "@/lib/precipitacao/tipos";

import {
  converterNumeroPositivoBR,
  sanitizarEntradaNumerica,
} from "../../utilitarios/entradaNumerica";

import EntradaDados from "./EntradaDados";
import Resultados from "./Resultados";

const primeiroAnalito = analitosArgentometricosDiretos[0];

export default function TitulacaoDireta() {
  const [analitoSelecionado, setAnalitoSelecionado] =
    useState<ConfiguracaoAnalitoDireto>(primeiroAnalito);

  const [metodoId, setMetodoId] =
    useState<MetodoArgentometricoDireto>(
      primeiroAnalito.metodos[0].id
    );

  const [concentracaoAnalito, setConcentracaoAnalito] =
    useState("0,0100");

  const [volumeAmostra, setVolumeAmostra] =
    useState("25,00");

  const [concentracaoTitulante, setConcentracaoTitulante] =
    useState("0,0100");

  const [volumeMaximoBureta, setVolumeMaximoBureta] =
    useState("50,00");

  const [erro, setErro] = useState("");

  const [resultado, setResultado] =
    useState<ResultadoTitulacaoDiretaPrecipitacao | null>(
      null
    );

  const salSelecionado = useMemo(() => {
    const sal = saisPrecipitacao.find(
      (item) => item.id === analitoSelecionado.salId
    );

    if (!sal) {
      throw new Error(
        `O sal ${analitoSelecionado.salId} não foi encontrado na base de precipitação.`
      );
    }

    return sal;
  }, [analitoSelecionado]);

  function atualizarEntrada(
    setter: (valor: string) => void,
    valor: string
  ) {
    setter(sanitizarEntradaNumerica(valor));

    if (erro) {
      setErro("");
    }
  }

  function alterarAnalito(
    novoAnalitoId: ConfiguracaoAnalitoDireto["id"]
  ) {
    const novoAnalito =
      analitosArgentometricosDiretos.find(
        (item) => item.id === novoAnalitoId
      );

    if (!novoAnalito) {
      setErro(
        "O analito selecionado não foi encontrado na configuração da titulação direta."
      );
      return;
    }

    setAnalitoSelecionado(novoAnalito);
    setMetodoId(novoAnalito.metodos[0].id);
    setResultado(null);
    setErro("");
  }

  function alterarMetodo(
    novoMetodoId: MetodoArgentometricoDireto
  ) {
    const metodoCompativel =
      analitoSelecionado.metodos.some(
        (metodo) => metodo.id === novoMetodoId
      );

    if (!metodoCompativel) {
      setErro(
        "O método selecionado não é compatível com o analito atual."
      );
      return;
    }

    setMetodoId(novoMetodoId);
    setResultado(null);
    setErro("");
  }

  function calcular(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const concentracaoAnalitoNumero =
      converterNumeroPositivoBR(concentracaoAnalito);

    const volumeAmostraNumero =
      converterNumeroPositivoBR(volumeAmostra);

    const concentracaoTitulanteNumero =
      converterNumeroPositivoBR(concentracaoTitulante);

    const volumeMaximoBuretaNumero =
      converterNumeroPositivoBR(volumeMaximoBureta);

    if (
      concentracaoAnalitoNumero === null ||
      volumeAmostraNumero === null ||
      concentracaoTitulanteNumero === null ||
      volumeMaximoBuretaNumero === null
    ) {
      setResultado(null);

      setErro(
        "Todos os campos numéricos devem conter valores positivos e válidos."
      );

      return;
    }

    const novoResultado =
      calcularTitulacaoDiretaPrecipitacao({
        sal: salSelecionado,
        especieAnalito: "anion",
        concentracaoAnalito: concentracaoAnalitoNumero,
        volumeAmostra: volumeAmostraNumero,
        concentracaoTitulante:
          concentracaoTitulanteNumero,
        volumeMaximoBureta:
          volumeMaximoBuretaNumero,
      });

    if (novoResultado.status === "dados_invalidos") {
      setResultado(null);
      setErro(novoResultado.mensagem);
      return;
    }

    setErro("");
    setResultado(novoResultado);
  }

  return (
    <section className="container precipitacaoWorkspace">
      <header className="precipitacaoWorkspaceHeader">
        <div>
          <span className="precipitacaoSectionLabel">
            Estudo selecionado
          </span>

          <h2>Titulação Direta por Precipitação</h2>

          <p>
            Determine cloreto, brometo ou iodeto por
            titulação direta com nitrato de prata,
            utilizando apenas métodos e indicadores
            quimicamente compatíveis.
          </p>
        </div>

        <span className="precipitacaoWorkspaceBadge">
          Titulação direta
        </span>
      </header>

      <div className="precipitacaoGuidance">
        <strong>Princípio do cálculo</strong>

        <p>
          A quantidade de Ag⁺ no ponto de equivalência é
          determinada pela proporção estequiométrica 1:1
          com o haleto selecionado. O método e o indicador
          orientam a detecção experimental do ponto final.
        </p>
      </div>

      <EntradaDados
        analito={analitoSelecionado}
        metodoId={metodoId}
        concentracaoAnalito={concentracaoAnalito}
        volumeAmostra={volumeAmostra}
        concentracaoTitulante={concentracaoTitulante}
        volumeMaximoBureta={volumeMaximoBureta}
        kps={salSelecionado.kps}
        corPrecipitado={salSelecionado.corPrecipitado}
        erro={erro}
        onAnalitoChange={alterarAnalito}
        onMetodoChange={alterarMetodo}
        onConcentracaoAnalitoChange={(valor) =>
          atualizarEntrada(
            setConcentracaoAnalito,
            valor
          )
        }
        onVolumeAmostraChange={(valor) =>
          atualizarEntrada(
            setVolumeAmostra,
            valor
          )
        }
        onConcentracaoTitulanteChange={(valor) =>
          atualizarEntrada(
            setConcentracaoTitulante,
            valor
          )
        }
        onVolumeMaximoBuretaChange={(valor) =>
          atualizarEntrada(
            setVolumeMaximoBureta,
            valor
          )
        }
        onSubmit={calcular}
      />

      {resultado && (
        <Resultados resultado={resultado} />
      )}
    </section>
  );
}