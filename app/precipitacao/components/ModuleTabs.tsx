export type AbaPrecipitacao =
  | "direta"
  | "retorno"
  | "seletiva";

type ModuleTabsProps = {
  abaAtiva: AbaPrecipitacao;
  onChange: (aba: AbaPrecipitacao) => void;
};

const estudos: {
  id: AbaPrecipitacao;
  numero: string;
  titulo: string;
  descricao: string;
  orientacao: string;
}[] = [
  {
    id: "direta",
    numero: "01",
    titulo: "Titulação Direta",
    descricao:
      "O titulante reage diretamente com o analito e forma um precipitado pouco solúvel.",
    orientacao:
      "Escolha esta opção quando o volume do titulante gasto for usado diretamente para determinar a quantidade de analito.",
  },
  {
    id: "retorno",
    numero: "02",
    titulo: "Titulação de Retorno",
    descricao:
      "Um reagente precipitante é adicionado em excesso e a quantidade restante é determinada por uma segunda titulação.",
    orientacao:
      "Escolha esta opção quando o analito não for determinado diretamente pelo primeiro titulante.",
  },
  {
    id: "seletiva",
    numero: "03",
    titulo: "Precipitação Seletiva",
    descricao:
      "Compara-se o início da precipitação de diferentes espécies presentes na mesma solução.",
    orientacao:
      "Escolha esta opção para avaliar ordem de precipitação, interferências e possibilidade de separação.",
  },
];

export default function ModuleTabs({
  abaAtiva,
  onChange,
}: ModuleTabsProps) {
  return (
    <section
      className="container precipitacaoStudySection"
      aria-labelledby="precipitacao-study-title"
    >
      <header className="precipitacaoStudyHeader">
        <span className="precipitacaoSectionLabel">
          Seleção do estudo
        </span>

        <h2 id="precipitacao-study-title">
          Qual análise você deseja realizar?
        </h2>

        <p>
          Selecione a modalidade que representa o procedimento analítico
          utilizado. Cada estudo possui entradas, cálculos e interpretações
          específicas.
        </p>
      </header>

      <div
        className="precipitacaoStudyGrid"
        role="tablist"
        aria-label="Tipos de estudo em volumetria de precipitação"
      >
        {estudos.map((estudo) => {
          const estaAtivo = abaAtiva === estudo.id;

          return (
            <button
              key={estudo.id}
              type="button"
              role="tab"
              aria-selected={estaAtivo}
              className={
                estaAtivo
                  ? "precipitacaoStudyCard precipitacaoStudyCardActive"
                  : "precipitacaoStudyCard"
              }
              onClick={() => onChange(estudo.id)}
            >
              <span className="precipitacaoStudyNumber">
                {estudo.numero}
              </span>

              <span className="precipitacaoStudyContent">
                <strong>{estudo.titulo}</strong>

                <span className="precipitacaoStudyDescription">
                  {estudo.descricao}
                </span>

                <span className="precipitacaoStudyOrientation">
                  {estudo.orientacao}
                </span>
              </span>

              <span
                className="precipitacaoStudyAction"
                aria-hidden="true"
              >
                {estaAtivo ? "Selecionado" : "Escolher estudo"}
                <span>→</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}