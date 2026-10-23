import type {
  PontoIodometria,
  ResultadoCurvaIodometria,
} from "@/lib/oxirreducao/iodometria";

type GraficoIodometriaProps = {
  resultado: ResultadoCurvaIodometria;
  pontosAdicionados?: PontoIodometria[];
  curvaComparacao?: ResultadoCurvaIodometria | null;
};

function formatarNumero(
  valor: number,
  casas = 2
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    }
  ).format(valor);
}

export default function GraficoIodometria({
  resultado,
  pontosAdicionados = [],
  curvaComparacao = null,
}: GraficoIodometriaProps) {
  const largura = 1000;
  const altura = 470;

  const margemEsquerda = 78;
  const margemDireita = 35;
  const margemSuperior = 35;
  const margemInferior = 72;

  const larguraUtil =
    largura - margemEsquerda - margemDireita;

  const alturaUtil =
    altura - margemSuperior - margemInferior;

  const pontos = resultado.pontosValidos.filter(
    (ponto) =>
      ponto.potencialV !== null &&
      Number.isFinite(ponto.potencialV)
  );

  const pontosComparacao =
    curvaComparacao?.pontosValidos.filter(
      (ponto) =>
        ponto.potencialV !== null &&
        Number.isFinite(ponto.potencialV)
    ) ?? [];

  const todosPontos = [
    ...pontos,
    ...pontosComparacao,
    ...pontosAdicionados,
  ];

  if (pontos.length === 0) {
    return (
      <div className="oxirreducaoEmptyChart">
        Não foi possível gerar pontos válidos para a curva iodimétrica.
      </div>
    );
  }

  const potenciais = todosPontos
    .map((ponto) => ponto.potencialV)
    .filter(
      (valor): valor is number =>
        valor !== null && Number.isFinite(valor)
    );

  const minimoOriginal = Math.min(...potenciais);
  const maximoOriginal = Math.max(...potenciais);

  const amplitude = Math.max(
    maximoOriginal - minimoOriginal,
    0.1
  );

  const minimoPotencial =
    minimoOriginal - amplitude * 0.08;

  const maximoPotencial =
    maximoOriginal + amplitude * 0.08;

  const volumeMaximo = Math.max(
    resultado.volumeMaximoMl,
    curvaComparacao?.volumeMaximoMl ?? 0,
    ...pontosAdicionados.map(
      (ponto) => ponto.volumeAdicionadoMl
    ),
    1
  );

  const x = (volume: number) =>
    margemEsquerda +
    (volume / volumeMaximo) * larguraUtil;

  const y = (potencial: number) =>
    margemSuperior +
    ((maximoPotencial - potencial) /
      (maximoPotencial - minimoPotencial)) *
      alturaUtil;

  const montarPolyline = (
    dados: PontoIodometria[]
  ) =>
    dados
      .map(
        (ponto) =>
          `${x(ponto.volumeAdicionadoMl)},${y(
            ponto.potencialV as number
          )}`
      )
      .join(" ");

  const marcacoesX = Array.from(
    { length: 6 },
    (_, indice) => (volumeMaximo / 5) * indice
  );

  const marcacoesY = Array.from(
    { length: 6 },
    (_, indice) =>
      minimoPotencial +
      ((maximoPotencial - minimoPotencial) / 5) *
        indice
  );

  const xPE = x(resultado.volumeEquivalenciaMl);
  const yPE = y(resultado.potencialEquivalenciaV);

  return (
    <div className="oxirreducaoChartWrapper">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Curva de potencial em função do volume de tiossulfato adicionado"
      >
        {marcacoesY.map((potencial) => (
          <g key={`y-${potencial}`}>
            <line
              x1={margemEsquerda}
              x2={largura - margemDireita}
              y1={y(potencial)}
              y2={y(potencial)}
              className="oxirreducaoChartGrid"
            />

            <text
              x={margemEsquerda - 12}
              y={y(potencial) + 5}
              textAnchor="end"
              className="oxirreducaoChartTick"
            >
              {formatarNumero(potencial, 2)}
            </text>
          </g>
        ))}

        {marcacoesX.map((volume) => (
          <g key={`x-${volume}`}>
            <line
              x1={x(volume)}
              x2={x(volume)}
              y1={margemSuperior}
              y2={altura - margemInferior}
              className="oxirreducaoChartGrid"
            />

            <text
              x={x(volume)}
              y={altura - margemInferior + 28}
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

        <text
          x="24"
          y={margemSuperior + alturaUtil / 2}
          textAnchor="middle"
          transform={`rotate(-90 24 ${
            margemSuperior + alturaUtil / 2
          })`}
          className="oxirreducaoChartAxisLabel"
        >
          Potencial E (V)
        </text>

        <text
          x={margemEsquerda + larguraUtil / 2}
          y={altura - 18}
          textAnchor="middle"
          className="oxirreducaoChartAxisLabel"
        >
          Volume de Na₂S₂O₃ adicionado (mL)
        </text>

        <line
          x1={xPE}
          x2={xPE}
          y1={margemSuperior}
          y2={altura - margemInferior}
          className="oxirreducaoChartPELine"
        />

        <polyline
          points={montarPolyline(pontos)}
          fill="none"
          className="oxirreducaoChartCurve"
        />

        {curvaComparacao &&
          pontosComparacao.length > 0 && (
            <polyline
              points={montarPolyline(pontosComparacao)}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.42"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          )}

        <circle
          cx={xPE}
          cy={yPE}
          r="7"
          className="oxirreducaoChartPEPoint"
        />

        <text
          x={xPE + 12}
          y={margemSuperior + 22}
          className="oxirreducaoChartPELabel"
        >
          PE = {formatarNumero(resultado.volumeEquivalenciaMl, 2)} mL
        </text>

        {pontosAdicionados.map((ponto, indice) => (
          <circle
            key={`${ponto.volumeAdicionadoMl}-${indice}`}
            cx={x(ponto.volumeAdicionadoMl)}
            cy={y(ponto.potencialV as number)}
            r="5"
            className="oxirreducaoChartPoint"
          />
        ))}
      </svg>
    </div>
  );
}