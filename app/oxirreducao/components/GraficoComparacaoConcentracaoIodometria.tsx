import type { ResultadoCurvaIodometria } from "@/lib/oxirreducao/iodometria";

type Props = {
  original: ResultadoCurvaIodometria;
  simulado: ResultadoCurvaIodometria;
};

function formatarNumero(valor: number, casas = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

export default function GraficoComparacaoConcentracaoIodometria({
  original,
  simulado,
}: Props) {
  const largura = 1000;
  const altura = 500;
  const margemEsquerda = 82;
  const margemDireita = 45;
  const margemSuperior = 55;
  const margemInferior = 78;
  const larguraUtil = largura - margemEsquerda - margemDireita;
  const alturaUtil = altura - margemSuperior - margemInferior;

  const pontosOriginal = original.pontosValidos.filter(
    (ponto) => Number.isFinite(ponto.potencialV)
  );
  const pontosSimulado = simulado.pontosValidos.filter(
    (ponto) => Number.isFinite(ponto.potencialV)
  );
  const todosPontos = [...pontosOriginal, ...pontosSimulado];

  if (pontosOriginal.length < 2 || pontosSimulado.length < 2) {
    return (
      <div className="oxirreducaoEmptyChart">
        Não existem pontos suficientes para comparar as curvas iodométricas.
      </div>
    );
  }

  const potenciais = todosPontos.map((ponto) => ponto.potencialV);
  const minimoOriginal = Math.min(...potenciais);
  const maximoOriginal = Math.max(...potenciais);
  const amplitude = Math.max(maximoOriginal - minimoOriginal, 0.1);
  const minimoPotencial = minimoOriginal - amplitude * 0.08;
  const maximoPotencial = maximoOriginal + amplitude * 0.08;
  const volumeMaximo = Math.max(
    original.volumeMaximoMl,
    simulado.volumeMaximoMl,
    original.volumeEquivalenciaMl,
    simulado.volumeEquivalenciaMl,
    1
  );

  const x = (volume: number) =>
    margemEsquerda + (volume / volumeMaximo) * larguraUtil;
  const y = (potencial: number) =>
    margemSuperior +
    ((maximoPotencial - potencial) / (maximoPotencial - minimoPotencial)) * alturaUtil;

  const montarPolyline = (pontos: typeof pontosOriginal) =>
    pontos
      .map((ponto) => `${x(ponto.volumeAdicionadoMl)},${y(ponto.potencialV)}`)
      .join(" ");

  const marcacoesX = Array.from(
    { length: 6 },
    (_, indice) => (volumeMaximo / 5) * indice
  );
  const marcacoesY = Array.from(
    { length: 6 },
    (_, indice) => minimoPotencial + ((maximoPotencial - minimoPotencial) / 5) * indice
  );

  const peOriginal = original.volumeEquivalenciaMl;
  const peSimulado = simulado.volumeEquivalenciaMl;
  const mesmoPE = Math.abs(peOriginal - peSimulado) < 1e-8;

  return (
    <div className="oxirreducaoComparisonChartWrapper">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Comparação entre a curva iodométrica original e a simulada"
      >
        {marcacoesY.map((potencial, indice) => (
          <g key={`y-${indice}`}>
            <line
              x1={margemEsquerda}
              x2={largura - margemDireita}
              y1={y(potencial)}
              y2={y(potencial)}
              className="oxirreducaoChartGrid"
            />
            <text
              x={margemEsquerda - 14}
              y={y(potencial) + 5}
              textAnchor="end"
              className="oxirreducaoChartTick"
            >
              {formatarNumero(potencial, 2)}
            </text>
          </g>
        ))}

        {marcacoesX.map((volume, indice) => (
          <g key={`x-${indice}`}>
            <line
              x1={x(volume)}
              x2={x(volume)}
              y1={margemSuperior}
              y2={altura - margemInferior}
              className="oxirreducaoChartGrid"
            />
            <text
              x={x(volume)}
              y={altura - margemInferior + 30}
              textAnchor="middle"
              className="oxirreducaoChartTick"
            >
              {formatarNumero(volume, 1)}
            </text>
          </g>
        ))}

        <line
          x1={margemEsquerda}
          x2={margemEsquerda}
          y1={margemSuperior}
          y2={altura - margemInferior}
          className="oxirreducaoChartAxis"
        />
        <line
          x1={margemEsquerda}
          x2={largura - margemDireita}
          y1={altura - margemInferior}
          y2={altura - margemInferior}
          className="oxirreducaoChartAxis"
        />

        <polyline
          points={montarPolyline(pontosOriginal)}
          className="oxirreducaoComparisonCurveOriginal"
        />
        <polyline
          points={montarPolyline(pontosSimulado)}
          className="oxirreducaoComparisonCurveSimulated"
        />

        {mesmoPE ? (
          <line
            x1={x(peOriginal)}
            x2={x(peOriginal)}
            y1={margemSuperior}
            y2={altura - margemInferior}
            className="oxirreducaoComparisonPEShared"
          />
        ) : (
          <>
            <line
              x1={x(peOriginal)}
              x2={x(peOriginal)}
              y1={margemSuperior}
              y2={altura - margemInferior}
              className="oxirreducaoComparisonPEOriginal"
            />
            <line
              x1={x(peSimulado)}
              x2={x(peSimulado)}
              y1={margemSuperior}
              y2={altura - margemInferior}
              className="oxirreducaoComparisonPESimulated"
            />
          </>
        )}

        <text
          x={margemEsquerda + larguraUtil / 2}
          y={altura - 17}
          textAnchor="middle"
          className="oxirreducaoChartAxisLabel"
        >
          Volume de Na₂S₂O₃ adicionado (mL)
        </text>
        <text
          x="23"
          y={margemSuperior + alturaUtil / 2}
          textAnchor="middle"
          transform={`rotate(-90 23 ${margemSuperior + alturaUtil / 2})`}
          className="oxirreducaoChartAxisLabel"
        >
          Potencial E (V)
        </text>
      </svg>

      <div className="oxirreducaoComparisonLegend">
        <div className="oxirreducaoComparisonLegendCard">
          <span className="oxirreducaoComparisonLegendMain">
            <i className="oxirreducaoLegendOriginal" />
            <strong>Condição original</strong>
          </span>
          <small>PE = {formatarNumero(peOriginal, 2)} mL</small>
        </div>
        <div className="oxirreducaoComparisonLegendCard">
          <span className="oxirreducaoComparisonLegendMain">
            <i className="oxirreducaoLegendSimulated" />
            <strong>Condição simulada</strong>
          </span>
          <small>PE = {formatarNumero(peSimulado, 2)} mL</small>
        </div>
      </div>
    </div>
  );
}
