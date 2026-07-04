"use client";

import { useRef } from "react";
import type {
  PontoPrimeiraDerivadaEDTA,
  PontoSegundaDerivadaEDTA,
} from "../lib/curvaEdta";
import { formatarNumeroBR } from "../lib/curvaEdta";

type PrimeiraDerivadaProps = {
  tipo: "primeira";
  titulo: string;
  descricao: string;
  pontos: PontoPrimeiraDerivadaEDTA[];
  volumePE: number | null;
  volumeDestaque?: number | null;
};

type SegundaDerivadaProps = {
  tipo: "segunda";
  titulo: string;
  descricao: string;
  pontos: PontoSegundaDerivadaEDTA[];
  volumePE: number | null;
  volumeDestaque?: number | null;
};

type Props = PrimeiraDerivadaProps | SegundaDerivadaProps;

export function DerivadaEdtaChart(props: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const pontosNormalizados =
  props.tipo === "primeira"
    ? props.pontos
        .map((ponto) => ({
          volume: ponto.volume,
          valor: ponto.derivada,
        }))
        .filter(
          (ponto) =>
            Number.isFinite(ponto.volume) && Number.isFinite(ponto.valor)
        )
    : props.pontos
        .map((ponto) => ({
          volume: ponto.volume,
          valor: ponto.segundaDerivada,
        }))
        .filter(
          (ponto) =>
            Number.isFinite(ponto.volume) && Number.isFinite(ponto.valor)
        );

  if (!pontosNormalizados.length) {
    return (
      <div className="chartEmpty">
        Nenhum ponto disponível para gerar o gráfico.
      </div>
    );
  }

  const largura = 1200;
  const altura = 560;

  const margem = {
    top: 44,
    right: 58,
    bottom: 104,
    left: 92,
  };

  const xMin = Math.min(...pontosNormalizados.map((ponto) => ponto.volume));
  const xMax = Math.max(...pontosNormalizados.map((ponto) => ponto.volume));

  const yBrutoMin = Math.min(...pontosNormalizados.map((ponto) => ponto.valor));
  const yBrutoMax = Math.max(...pontosNormalizados.map((ponto) => ponto.valor));

  const margemY = Math.max(Math.abs(yBrutoMax - yBrutoMin) * 0.12, 0.000001);

  const yMin = yBrutoMin - margemY;
  const yMax = yBrutoMax + margemY;

  const plotWidth = largura - margem.left - margem.right;
  const plotHeight = altura - margem.top - margem.bottom;

  function xScale(volume: number) {
    if (xMax === xMin) return margem.left;
    return margem.left + ((volume - xMin) / (xMax - xMin)) * plotWidth;
  }

  function yScale(valor: number) {
    if (yMax === yMin) return margem.top;
    return margem.top + ((yMax - valor) / (yMax - yMin)) * plotHeight;
  }

  const linha = pontosNormalizados
    .map((ponto) => `${xScale(ponto.volume)},${yScale(ponto.valor)}`)
    .join(" ");

  const ticksX = gerarTicks(xMin, xMax, 6);
  const ticksY = gerarTicks(yMin, yMax, 6);

  const xPE = props.volumePE ? xScale(props.volumePE) : null;
  const xDestaque = props.volumeDestaque
    ? xScale(props.volumeDestaque)
    : null;

  const pontoDestaque =
    props.volumeDestaque !== null && props.volumeDestaque !== undefined
      ? encontrarPontoMaisProximo(pontosNormalizados, props.volumeDestaque)
      : null;

  const yZero =
    yMin < 0 && yMax > 0
      ? yScale(0)
      : null;

  function baixarGraficoPNG() {
    const svg = svgRef.current;

    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = largura * 2;
      canvas.height = altura * 2;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download =
        props.tipo === "primeira"
          ? "primeira-derivada-edta-analitcalc.png"
          : "segunda-derivada-edta-analitcalc.png";

      link.click();
    };

    image.src = url;
  }

  const tituloEixoY =
    props.tipo === "primeira" ? "ΔpM/ΔV" : "Δ²pM/ΔV²";

  const tituloDestaque =
    props.tipo === "primeira" ? "Pico" : "Troca de sinal";

  return (
    <div className="chartBox derivativeChartBox">
      <div className="chartHeader">
        <div>
          <strong>{props.titulo}</strong>
          <span>{props.descricao}</span>
        </div>

        <button
          type="button"
          className="downloadChartButton"
          onClick={baixarGraficoPNG}
        >
          Baixar PNG
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={props.titulo}
        className="curveSvg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={largura} height={altura} fill="#ffffff" />

        <text
          x={margem.left}
          y={28}
          fill="#111111"
          fontSize="22"
          fontWeight="900"
        >
          {props.titulo}
        </text>

        <text
          x={margem.left}
          y={54}
          fill="#667085"
          fontSize="15"
          fontWeight="600"
        >
          {props.descricao}
        </text>

        <rect
          x={margem.left}
          y={margem.top + 28}
          width={plotWidth}
          height={plotHeight - 28}
          rx="16"
          fill="#fffafa"
          stroke="#f1d4d4"
          strokeWidth="1"
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
                strokeWidth="1"
              />

              <text
                x={margem.left - 14}
                y={y + 5}
                fill="#667085"
                fontSize="15"
                fontWeight="700"
                textAnchor="end"
              >
                {formatarNumeroBR(tick, 3)}
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
                y1={margem.top + 28}
                y2={altura - margem.bottom}
                stroke="#eeeeee"
                strokeWidth="1"
              />

              <text
                x={x}
                y={altura - 68}
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

        {yZero !== null && (
          <line
            x1={margem.left}
            x2={largura - margem.right}
            y1={yZero}
            y2={yZero}
            stroke="#111111"
            strokeWidth="2"
            strokeDasharray="7 7"
            opacity="0.65"
          />
        )}

        <line
          x1={margem.left}
          x2={largura - margem.right}
          y1={altura - margem.bottom}
          y2={altura - margem.bottom}
          stroke="#d0d5dd"
          strokeWidth="2"
        />

        <line
          x1={margem.left}
          x2={margem.left}
          y1={margem.top + 28}
          y2={altura - margem.bottom}
          stroke="#d0d5dd"
          strokeWidth="2"
        />

        <polyline
          points={linha}
          fill="none"
          stroke="#a80000"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {xPE !== null && (
          <line
            x1={xPE}
            x2={xPE}
            y1={margem.top + 28}
            y2={altura - margem.bottom}
            stroke="#111111"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />
        )}

        {xDestaque !== null && pontoDestaque && (
          <>
            <circle
              cx={xDestaque}
              cy={yScale(pontoDestaque.valor)}
              r="10"
              fill="#111111"
              stroke="#ffffff"
              strokeWidth="3"
            />

            <rect
              x={xDestaque + 14}
              y={yScale(pontoDestaque.valor) - 34}
              width="150"
              height="28"
              rx="8"
              fill="#ffffff"
              stroke="#e5e7eb"
            />

            <text
              x={xDestaque + 24}
              y={yScale(pontoDestaque.valor) - 15}
              fill="#111111"
              fontSize="15"
              fontWeight="900"
            >
              {tituloDestaque}: {formatarNumeroBR(props.volumeDestaque, 2)} mL
            </text>
          </>
        )}

        <text
          x={largura / 2}
          y={altura - 24}
          fill="#344054"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
        >
          Volume de EDTA adicionado em mL
        </text>

        <text
          x="28"
          y={altura / 2}
          fill="#344054"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
          transform={`rotate(-90 28 ${altura / 2})`}
        >
          {tituloEixoY}
        </text>
      </svg>

      <div className="chartLegend">
        <span>
          <i className="legendLine curve" /> {tituloEixoY}
        </span>

        <span>
          <i className="legendLine pe" /> PE estequiométrico
        </span>

        {props.volumeDestaque !== null && props.volumeDestaque !== undefined && (
          <span>
            <i className="legendLine consult" /> {tituloDestaque}
          </span>
        )}
      </div>
    </div>
  );
}

function gerarTicks(min: number, max: number, quantidade: number) {
  if (max === min) return [min];

  const intervalo = (max - min) / quantidade;

  return Array.from({ length: quantidade + 1 }, (_, index) =>
    Number((min + intervalo * index).toFixed(4))
  );
}

function encontrarPontoMaisProximo(
  pontos: { volume: number; valor: number }[],
  volume: number
) {
  return pontos.reduce((maisProximo, atual) => {
    const distanciaAtual = Math.abs(atual.volume - volume);
    const distanciaMaisProximo = Math.abs(maisProximo.volume - volume);

    return distanciaAtual < distanciaMaisProximo ? atual : maisProximo;
  }, pontos[0]);
}