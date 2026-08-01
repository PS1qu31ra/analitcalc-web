type EquacaoQuimicaProps = {
    equacao: string;
    className?: string;
  };
  
  /**
   * Divide uma equação química em partes textuais e
   * estados físicos.
   *
   * Exemplos reconhecidos:
   *
   * (aq)
   * (s)
   * (l)
   * (g)
   *
   * Os estados são exibidos em subscrito sem inserir
   * HTML diretamente nas strings da base de dados.
   */
  function separarEstadosFisicos(
    equacao: string
  ) {
    return equacao.split(
      /(\((?:aq|s|l|g)\))/gi
    );
  }
  
  function ehEstadoFisico(
    trecho: string
  ) {
    return /^\((aq|s|l|g)\)$/i.test(
      trecho
    );
  }
  
  export default function EquacaoQuimica({
    equacao,
    className,
  }: EquacaoQuimicaProps) {
    const partes =
      separarEstadosFisicos(
        equacao
      );
  
    return (
      <span
        className={[
          "precipitacaoChemicalEquation",
          className ?? "",
        ].join(" ")}
        aria-label={
          equacao
        }
      >
        {partes.map(
          (
            parte,
            indice
          ) => {
            if (
              ehEstadoFisico(
                parte
              )
            ) {
              return (
                <sub
  key={`${parte}-${indice}`}
  className="precipitacaoChemicalPhysicalState"
>
  {parte}
</sub>
              );
            }
  
            return (
              <span
                key={`${parte}-${indice}`}
              >
                {parte}
              </span>
            );
          }
        )}
      </span>
    );
  }