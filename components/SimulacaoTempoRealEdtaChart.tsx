"use client";

import type { CurvaEDTA, PontoCurvaEDTA } from "../lib/curvaEdta";
import { formatarNumeroBR } from "../lib/curvaEdta";

type Props = {
  curva: CurvaEDTA;
  pontosAdicionados: PontoCurvaEDTA[];
};

export function SimulacaoTempoRealEdtaChart({
  curva,
  pontosAdicionados,
}: Props) {
  const pontosCurva = curva.pontos.filter((ponto) => ponto.pM !== null);

  if (!pontosCurva.length) {
    return (
      <div className="liveChartEmpty">
        Avalie o sistema primeiro e inicie a titulação ao vivo.
      </div>
    );
  }

  const largura = 900;
  const altura = 620;

  const margem = {
    top: 40,
    right: 40,
    bottom: 82,
    left: 70,
  };

  const xMin = 0;
  const xMax = Math.max(...pontosCurva.map((ponto) => ponto.volume));

  const todosPM = [
    ...pontosCurva.map((ponto) => ponto.pM ?? 0),
    ...pontosAdicionados
      .filter((ponto) => ponto.pM !== null)
      .map((ponto) => ponto.pM ?? 0),
  ];

  const yMin = Math.floor(Math.min(...todosPM));
  const yMax = Math.ceil(Math.max(...todosPM));

  const plotWidth = largura - margem.left - margem.right;
  const plotHeight = altura - margem.top - margem.bottom;

  function xScale(volume: number) {
    if (xMax === xMin) return margem.left;
    return margem.left + ((volume - xMin) / (xMax - xMin)) * plotWidth;
  }

  function yScale(pM: number) {
    if (yMax === yMin) return margem.top;
    return margem.top + ((yMax - pM) / (yMax - yMin)) * plotHeight;
  }

  const linhaCurva = pontosCurva
    .map((ponto) => `${xScale(ponto.volume)},${yScale(ponto.pM ?? 0)}`)
    .join(" ");

  const linhaPontos = pontosAdicionados
    .filter((ponto) => ponto.pM !== null)
    .map((ponto) => `${xScale(ponto.volume)},${yScale(ponto.pM ?? 0)}`)
    .join(" ");

  const ticksX = gerarTicks(xMin, xMax, 5);
  const ticksY = gerarTicks(yMin, yMax, 6);

  return (
    <div className="liveChartBox">
      <div className="chartHeader">
        <div>
          <strong>Simulação em tempo real</strong>
          <span>
            A linha representa a curva ideal e os pontos mostram os volumes
            adicionados pelo usuário.
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="liveCurveSvg"
        role="img"
        aria-label="Simulação em tempo real da titulação com EDTA"
      >
        <rect width={largura} height={altura} fill="#ffffff" />

        <rect
          x={margem.left}
          y={margem.top}
          width={plotWidth}
          height={plotHeight}
          rx="18"
          fill="#ffffff"
          stroke="#e5e7eb"
        />

        {ticksY.map((tick) => {
          const y = yScale(tick);

          return (
            <g key={`y-${tick}`}>
              <line
                x1={margem.left}
                x2={largura - margem.right}
                y1={y}
                y2={y}
                stroke="#eeeeee"
              />

              <text
                x={margem.left - 12}
                y={y + 5}
                fill="#667085"
                fontSize="15"
                fontWeight="700"
                textAnchor="end"
              >
                {formatarNumeroBR(tick, 0)}
              </text>
            </g>
          );
        })}

        {ticksX.map((tick) => {
          const x = xScale(tick);

          return (
            <g key={`x-${tick}`}>
              <line
                x1={x}
                x2={x}
                y1={margem.top}
                y2={altura - margem.bottom}
                stroke="#eeeeee"
              />

              <text
                x={x}
                y={altura - 46}
                fill="#667085"
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
              >
                {formatarNumeroBR(tick, 0)}
              </text>
            </g>
          );
        })}

        <polyline
          points={linhaCurva}
          fill="none"
          stroke="#2563eb"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pontosAdicionados.length > 1 && (
          <polyline
            points={linhaPontos}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

{pontosAdicionados.map((ponto, index) => {
  if (ponto.pM === null) return null;

  const ehUltimoPonto = index === pontosAdicionados.length - 1;

  return (
    <g key={`${ponto.volume}-${index}`}>
      <circle
        cx={xScale(ponto.volume)}
        cy={yScale(ponto.pM)}
        r="10"
        fill="#f43f5e"
        stroke="#ffffff"
        strokeWidth="4"
      />

      {ehUltimoPonto && (
        <text
          x={xScale(ponto.volume)}
          y={yScale(ponto.pM) - 16}
          fill="#9f1239"
          fontSize="13"
          fontWeight="900"
          textAnchor="middle"
        >
          {formatarNumeroBR(ponto.volume, 2)}
        </text>
      )}
    </g>
  );
})}

        <text
          x={largura / 2}
          y={altura - 16}
          fill="#344054"
          fontSize="17"
          fontWeight="900"
          textAnchor="middle"
        >
          Volume de EDTA adicionado (mL)
        </text>

        <text
          x="24"
          y={altura / 2}
          fill="#344054"
          fontSize="17"
          fontWeight="900"
          textAnchor="middle"
          transform={`rotate(-90 24 ${altura / 2})`}
        >
          pM
        </text>
      </svg>

      <div className="chartLegend">
        <span>
          <i className="legendLine idealCurve" /> Curva ideal
        </span>

        <span>
          <i className="legendLine livePoints" /> Pontos adicionados
        </span>
      </div>
    </div>
  );
}

function gerarTicks(min: number, max: number, quantidade: number) {
  if (max === min) return [min];

  const intervalo = (max - min) / quantidade;

  return Array.from({ length: quantidade + 1 }, (_, index) =>
    Number((min + intervalo * index).toFixed(2))
  );
}