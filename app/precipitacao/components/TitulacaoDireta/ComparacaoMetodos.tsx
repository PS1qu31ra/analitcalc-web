"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ConfiguracaoAnalitoDireto,
  ConfiguracaoMetodoDireto,
  MetodoArgentometricoDireto,
} from "@/lib/precipitacao/metodosDiretos";

type ComparacaoMetodosProps = {
  analito: ConfiguracaoAnalitoDireto;
};

const descricoesGerais: Record<
  MetodoArgentometricoDireto,
  {
    categoria: string;
    mecanismo: string;
    observacaoDidatica: string;
  }
> = {
  mohr: {
    categoria:
      "Método com indicador de precipitação",
    mecanismo:
      "O ponto final é reconhecido pelo aparecimento de um novo precipitado associado ao indicador.",
    observacaoDidatica:
      "O precipitado do analito deve se formar antes que o precipitado indicador produza uma mudança visual perceptível.",
  },

  fajans: {
    categoria:
      "Método com indicador de adsorção",
    mecanismo:
      "O ponto final é reconhecido pela adsorção do indicador na superfície do precipitado.",
    observacaoDidatica:
      "A resposta visual depende da alteração das condições superficiais do precipitado nas proximidades do ponto de equivalência.",
  },
};

export default function ComparacaoMetodos({
  analito,
}: ComparacaoMetodosProps) {
  const primeiroMetodo =
    analito.metodos[0];

  const [
    metodoSelecionadoId,
    setMetodoSelecionadoId,
  ] =
    useState<MetodoArgentometricoDireto>(
      primeiroMetodo.id
    );

  useEffect(() => {
    setMetodoSelecionadoId(
      analito.metodos[0].id
    );
  }, [analito]);

  const metodoSelecionado =
    useMemo(
      () =>
        analito.metodos.find(
          (metodo) =>
            metodo.id ===
            metodoSelecionadoId
        ) ?? analito.metodos[0],
      [
        analito.metodos,
        metodoSelecionadoId,
      ]
    );

  const existeMohr =
    analito.metodos.some(
      (metodo) =>
        metodo.id === "mohr"
    );

  const existeFajans =
    analito.metodos.some(
      (metodo) =>
        metodo.id === "fajans"
    );

  const possuiMaisDeUmMetodo =
    analito.metodos.length > 1;

  const diagnostico =
    possuiMaisDeUmMetodo
      ? `O analito ${analito.formulaExibicao} possui mais de uma configuração direta disponível. A escolha pode ser feita entre os métodos cadastrados, considerando o tipo de indicador e a forma de reconhecimento do ponto final.`
      : `Para ${analito.formulaExibicao}, esta configuração disponibiliza somente ${metodoSelecionado.nome}. Não é apresentada uma alternativa direta adicional na base atual.`;

  return (
    <section className="precipitacaoMethodsSection">
      <header className="precipitacaoMethodsIntro">
        <span className="precipitacaoSectionLabel">
          Comparação metodológica
        </span>

        <h5>
          Métodos disponíveis para{" "}
          {analito.formulaExibicao}
        </h5>

        <p>
          Compare os métodos compatíveis com o
          analito selecionado e observe como cada
          um identifica experimentalmente o ponto
          final da titulação.
        </p>
      </header>

      <section className="precipitacaoMethodsSystem">
        <header>
          <span className="precipitacaoSectionLabel">
            Sistema atual
          </span>

          <h6>
            Contexto químico da determinação
          </h6>
        </header>

        <div className="precipitacaoMethodsSystemGrid">
          <article>
            <span>Analito</span>

            <strong>
              {analito.nome}
            </strong>

            <small>
              {analito.formulaExibicao}
            </small>
          </article>

          <article>
            <span>Titulante</span>

            <strong>
              {analito.titulante}
            </strong>

            <small>
              Fonte de Ag⁺
            </small>
          </article>

          <article>
            <span>Precipitado</span>

            <strong>
              {analito.precipitado}
            </strong>

            <small>
              Produto principal
            </small>
          </article>

          <article className="precipitacaoMethodsSystemReaction">
            <span>Reação</span>

            <strong>
              {analito.equacao}
            </strong>

            <small>
              Reação de precipitação
            </small>
          </article>
        </div>
      </section>

      <div className="precipitacaoMethodsAvailability">
        <div>
          <span className="precipitacaoSectionLabel">
            Compatibilidade
          </span>

          <h6>
            Métodos cadastrados para este analito
          </h6>
        </div>

        <div className="precipitacaoMethodsAvailabilityBadges">
          <span
            className={[
              "precipitacaoMethodsAvailabilityBadge",
              existeMohr
                ? "precipitacaoMethodsAvailabilityBadgeAvailable"
                : "precipitacaoMethodsAvailabilityBadgeUnavailable",
            ].join(" ")}
          >
            Mohr
            <b>
              {existeMohr
                ? "Disponível"
                : "Não disponível"}
            </b>
          </span>

          <span
            className={[
              "precipitacaoMethodsAvailabilityBadge",
              existeFajans
                ? "precipitacaoMethodsAvailabilityBadgeAvailable"
                : "precipitacaoMethodsAvailabilityBadgeUnavailable",
            ].join(" ")}
          >
            Fajans
            <b>
              {existeFajans
                ? "Disponível"
                : "Não disponível"}
            </b>
          </span>
        </div>
      </div>

      <section className="precipitacaoMethodsSelection">
        <header>
          <span className="precipitacaoSectionLabel">
            Método em análise
          </span>

          <h6>
            Selecione um método para consultar
          </h6>

          <p>
            Somente métodos compatíveis com o
            analito atual são apresentados.
          </p>
        </header>

        <div className="precipitacaoMethodsSelectionGrid">
          {analito.metodos.map(
            (metodo) => {
              const ativo =
                metodo.id ===
                metodoSelecionado.id;

              return (
                <button
                  key={metodo.id}
                  type="button"
                  className={[
                    "precipitacaoMethodsSelectionCard",
                    ativo
                      ? "precipitacaoMethodsSelectionCardActive"
                      : "",
                  ].join(" ")}
                  onClick={() =>
                    setMetodoSelecionadoId(
                      metodo.id
                    )
                  }
                  aria-pressed={ativo}
                >
                  <span>
                    {ativo
                      ? "Selecionado"
                      : "Disponível"}
                  </span>

                  <strong>
                    {metodo.nome}
                  </strong>

                  <p>
                    {
                      descricoesGerais[
                        metodo.id
                      ].categoria
                    }
                  </p>

                  <small>
                    Indicador:{" "}
                    <b>
                      {metodo.indicador}
                    </b>
                  </small>
                </button>
              );
            }
          )}
        </div>
      </section>

      <section className="precipitacaoMethodsSelected">
        <header className="precipitacaoMethodsSelectedHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Método selecionado
            </span>

            <h6>
              {metodoSelecionado.nome}
            </h6>
          </div>

          <span className="precipitacaoMethodsSelectedBadge">
            Compatível com{" "}
            {analito.formulaExibicao}
          </span>
        </header>

        <div className="precipitacaoMethodsSelectedSummary">
          <article>
            <span>Indicador</span>

            <strong>
              {
                metodoSelecionado.indicador
              }
            </strong>

            <small>
              Indicador definido na configuração
            </small>
          </article>

          <article>
            <span>Tipo de método</span>

            <strong>
              {
                descricoesGerais[
                  metodoSelecionado.id
                ].categoria
              }
            </strong>

            <small>
              Classificação didática
            </small>
          </article>

          <article>
            <span>Precipitado principal</span>

            <strong>
              {analito.precipitado}
            </strong>

            <small>
              Formado entre Ag⁺ e{" "}
              {analito.formulaExibicao}
            </small>
          </article>
        </div>

        <div className="precipitacaoMethodsExplanationGrid">
          <article>
            <span className="precipitacaoSectionLabel">
              Princípio cadastrado
            </span>

            <h6>
              Como o ponto final é detectado?
            </h6>

            <p>
              {
                metodoSelecionado.principio
              }
            </p>
          </article>

          <article>
            <span className="precipitacaoSectionLabel">
              Mecanismo geral
            </span>

            <h6>
              O que produz a indicação visual?
            </h6>

            <p>
              {
                descricoesGerais[
                  metodoSelecionado.id
                ].mecanismo
              }
            </p>
          </article>

          <article>
            <span className="precipitacaoSectionLabel">
              Observação da base
            </span>

            <h6>
              Aplicação ao sistema atual
            </h6>

            <p>
              {
                metodoSelecionado.observacao
              }
            </p>
          </article>

          <article>
            <span className="precipitacaoSectionLabel">
              Interpretação didática
            </span>

            <h6>
              Ponto importante para o estudante
            </h6>

            <p>
              {
                descricoesGerais[
                  metodoSelecionado.id
                ].observacaoDidatica
              }
            </p>
          </article>
        </div>
      </section>

      {possuiMaisDeUmMetodo && (
        <section className="precipitacaoMethodsComparison">
          <header>
            <span className="precipitacaoSectionLabel">
              Comparação direta
            </span>

            <h6>
              Diferenças entre os métodos disponíveis
            </h6>

            <p>
              A comparação abaixo usa somente as
              informações cadastradas para{" "}
              {analito.formulaExibicao}.
            </p>
          </header>

          <div className="precipitacaoMethodsComparisonTableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Característica</th>

                  {analito.metodos.map(
                    (metodo) => (
                      <th key={metodo.id}>
                        {metodo.nome}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th>Indicador</th>

                  {analito.metodos.map(
                    (metodo) => (
                      <td key={metodo.id}>
                        {metodo.indicador}
                      </td>
                    )
                  )}
                </tr>

                <tr>
                  <th>Categoria</th>

                  {analito.metodos.map(
                    (metodo) => (
                      <td key={metodo.id}>
                        {
                          descricoesGerais[
                            metodo.id
                          ].categoria
                        }
                      </td>
                    )
                  )}
                </tr>

                <tr>
                  <th>Princípio</th>

                  {analito.metodos.map(
                    (metodo) => (
                      <td key={metodo.id}>
                        {metodo.principio}
                      </td>
                    )
                  )}
                </tr>

                <tr>
                  <th>Observação</th>

                  {analito.metodos.map(
                    (metodo) => (
                      <td key={metodo.id}>
                        {metodo.observacao}
                      </td>
                    )
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="precipitacaoMethodsDiagnosis">
        <div className="precipitacaoMethodsDiagnosisIcon">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 3h6" />
            <path d="M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3" />
            <path d="M8 15h8" />
          </svg>
        </div>

        <div>
          <span className="precipitacaoSectionLabel">
            Diagnóstico de compatibilidade
          </span>

          <h6>
            {
              analito.metodos.length
            }{" "}
            método(s) direto(s) disponível(is)
          </h6>

          <p>{diagnostico}</p>
        </div>
      </section>

      {!existeMohr && (
        <section className="precipitacaoMethodsUnavailableNotice">
          <strong>
            Por que Mohr não aparece?
          </strong>

          <p>
            O método de Mohr não está incluído
            entre as opções diretas cadastradas para{" "}
            {analito.formulaExibicao}. Por isso, o
            sistema não deve apresentá-lo como uma
            alternativa compatível nesta análise.
          </p>
        </section>
      )}
    </section>
  );
}