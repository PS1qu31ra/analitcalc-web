import {
    formatarCientificoBR,
    formatarNumeroBR,
  } from "@/lib/precipitacao/formatadores";
  
  import type {
    ResultadoTitulacaoRetornoPrecipitacao,
  } from "@/lib/precipitacao/tipos";
  
  type ResultadosProps = {
    resultado: ResultadoTitulacaoRetornoPrecipitacao;
  };
  
  function obterConfiguracaoStatus(
    status: ResultadoTitulacaoRetornoPrecipitacao["status"]
  ) {
    if (status === "adequado") {
      return {
        titulo: "Condição adequada",
        mensagem:
          "A quantidade de Ag⁺ adicionada apresenta excesso mensurável e o volume de SCN⁻ cabe na bureta informada.",
        classeStatus:
          "precipitacaoStatus precipitacaoStatusSuccess",
        classeMensagem:
          "precipitacaoResultMessage precipitacaoResultMessageSuccess",
      };
    }
  
    if (status === "fora_da_bureta") {
      return {
        titulo: "Volume fora da bureta",
        mensagem:
          "O excesso de Ag⁺ pode ser determinado, mas o volume previsto de SCN⁻ ultrapassa a capacidade da bureta.",
        classeStatus:
          "precipitacaoStatus precipitacaoStatusWarning",
        classeMensagem:
          "precipitacaoResultMessage precipitacaoResultMessageWarning",
      };
    }
  
    if (status === "excesso_insuficiente") {
      return {
        titulo: "Excesso de Ag⁺ insuficiente",
        mensagem:
          "A quantidade de nitrato de prata adicionada não produziu um excesso mensurável para a titulação de retorno.",
        classeStatus:
          "precipitacaoStatus precipitacaoStatusWarning",
        classeMensagem:
          "precipitacaoResultMessage precipitacaoResultMessageWarning",
      };
    }
  
    return {
      titulo: "Dados inválidos",
      mensagem:
        "Os dados informados não permitem realizar o cálculo da titulação por retorno.",
      classeStatus:
        "precipitacaoStatus precipitacaoStatusWarning",
      classeMensagem:
        "precipitacaoResultMessage precipitacaoResultMessageWarning",
    };
  }
  
  export default function Resultados({
    resultado,
  }: ResultadosProps) {
    const formulaAnalito =
      resultado.especieAnalito === "cation"
        ? resultado.salPrincipal.cation.formulaExibicao
        : resultado.salPrincipal.anion.formulaExibicao;
  
    const configuracaoStatus =
      obterConfiguracaoStatus(
        resultado.status
      );
  
    const possuiResultadoNumerico =
      Number.isFinite(
        resultado.volumeTitulanteRetorno
      ) &&
      Number.isFinite(
        resultado.molPrecipitanteAdicionado
      ) &&
      Number.isFinite(
        resultado.molPrecipitanteConsumidoPeloAnalito
      ) &&
      Number.isFinite(
        resultado.molPrecipitanteEmExcesso
      );
  
    return (
      <section
        className="precipitacaoResultsSection"
        aria-live="polite"
      >
        <header className="precipitacaoResultsHeader">
          <div>
            <span className="precipitacaoSectionLabel">
              Resultado calculado
            </span>
  
            <h3>
              Resumo da titulação por retorno
            </h3>
  
            <p>
              O método de Volhard adiciona uma quantidade
              conhecida de AgNO₃ em excesso à amostra. O Ag⁺
              remanescente é posteriormente titulado com SCN⁻
              em meio ácido.
            </p>
          </div>
  
          <span
            className={
              configuracaoStatus.classeStatus
            }
          >
            {configuracaoStatus.titulo}
          </span>
        </header>
  
        <div className="precipitacaoResultsGrid">
          <article className="precipitacaoResultCard precipitacaoResultCardMain">
            <span>
              Volume de SCN⁻ no ponto final
            </span>
  
            <strong>
              {formatarNumeroBR(
                resultado.volumeTitulanteRetorno,
                2
              )}
              <small> mL</small>
            </strong>
  
            <p>
              Volume teórico de tiocianato necessário para
              consumir o Ag⁺ que permaneceu em excesso.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ total adicionado
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteAdicionado,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade total de Ag⁺ adicionada inicialmente
              à amostra por meio da solução de AgNO₃.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ consumido pelo analito
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado
                  .molPrecipitanteConsumidoPeloAnalito,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade de Ag⁺ que reagiu com{" "}
              {formulaAnalito} para formar{" "}
              {resultado.salPrincipal.formulaExibicao}.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Ag⁺ remanescente
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteEmExcesso,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade de Ag⁺ que permaneceu em solução e
              será determinada pela titulação com SCN⁻.
            </p>
          </article>
        </div>
  
        <div className="precipitacaoResultInterpretation">
          <div className="precipitacaoResultInterpretationHeader">
            <span>
              Interpretação estequiométrica
            </span>
  
            <strong>
              Determinação indireta de{" "}
              {formulaAnalito}
            </strong>
          </div>
  
          <p>
            Foram adicionados{" "}
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteAdicionado,
                3
              )}{" "}
              mol
            </strong>{" "}
            de Ag⁺. Desse total,{" "}
            <strong>
              {formatarCientificoBR(
                resultado
                  .molPrecipitanteConsumidoPeloAnalito,
                3
              )}{" "}
              mol
            </strong>{" "}
            reagiram com {formulaAnalito}. O excesso restante,
            correspondente a{" "}
            <strong>
              {formatarCientificoBR(
                resultado.molPrecipitanteEmExcesso,
                3
              )}{" "}
              mol
            </strong>
            , é determinado pela reação 1:1 com SCN⁻.
          </p>
        </div>
  
        <div className="precipitacaoResultsGrid">
          <article className="precipitacaoResultCard">
            <span>
              Quantidade de analito
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.molAnalito,
                3
              )}
              <small> mol</small>
            </strong>
  
            <p>
              Quantidade inicial de {formulaAnalito} presente
              no volume de amostra informado.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Concentração do analito
            </span>
  
            <strong>
              {formatarCientificoBR(
                resultado.concentracaoAnalito,
                3
              )}
              <small> mol·L⁻¹</small>
            </strong>
  
            <p>
              Concentração formal de {formulaAnalito} na
              amostra original.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Relação da precipitação principal
            </span>
  
            <strong>
              {resultado.relacaoPrincipal}
            </strong>
  
            <p>
              Relação estequiométrica entre o analito e o
              Ag⁺ utilizado para sua precipitação.
            </p>
          </article>
  
          <article className="precipitacaoResultCard">
            <span>
              Relação da titulação de retorno
            </span>
  
            <strong>
              {resultado.relacaoRetorno}
            </strong>
  
            <p>
              No método de Volhard, Ag⁺ e SCN⁻ reagem na
              proporção molar de 1:1.
            </p>
          </article>
        </div>
  
        <div
          className={
            configuracaoStatus.classeMensagem
          }
        >
          <strong>
            {configuracaoStatus.titulo}
          </strong>
  
          <p>{resultado.mensagem}</p>
        </div>
  
        <div className="precipitacaoResultScientificNote">
          <strong>
            Como interpretar o volume de retorno?
          </strong>
  
          <p>
            O volume de{" "}
            {formatarNumeroBR(
              resultado.volumeTitulanteRetorno,
              2
            )}{" "}
            mL representa a quantidade teórica de solução de
            SCN⁻ necessária para reagir com o Ag⁺ que não foi
            consumido pelo analito. Quanto maior o volume de
            SCN⁻ utilizado, maior era o excesso de Ag⁺
            remanescente.
          </p>
        </div>
  
        {!possuiResultadoNumerico && (
          <div className="precipitacaoFormError">
            <strong>
              Resultado numérico indisponível
            </strong>
  
            <span>
              Corrija os dados experimentais para obter os
              valores completos da titulação por retorno.
            </span>
          </div>
        )}
      </section>
    );
  }