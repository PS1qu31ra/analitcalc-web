"use client";

import { useRef } from "react";
import type { CurvaEDTA, PontoCurvaEDTA } from "../lib/curvaEdta";
import { formatarNumeroBR } from "../lib/curvaEdta";

type CurvaInterferente = {
  metal: string;
  pontos: PontoCurvaEDTA[];
};

type Props = {
  curva: CurvaEDTA;
  pontoConsulta?: PontoCurvaEDTA | null;
  curvasInterferentes?: CurvaInterferente[];
  titulo?: string;
  descricao?: string;
  metalPrincipalLabel?: string;
};

const CORES_INTERFERENTES = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#be123c",
  "#4f46e5",
];

export function CurvaEdtaChart({
  curva,
  pontoConsulta,
  curvasInterferentes = [],
  titulo = "Curva pM × Volume de EDTA",
  descricao = "Relação entre pM e volume de titulante adicionado",
  metalPrincipalLabel = "Metal principal",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const pontosPrincipal = curva.pontos.filter((ponto) => ponto.pM !== null);

  const pontosInterferentes = curvasInterferentes.flatMap((curvaItem) =>
    curvaItem.pontos.filter((ponto) => ponto.pM !== null)
  );

  const todosPontos = [...pontosPrincipal, ...pontosInterferentes];

  if (!todosPontos.length) {
    return (
      <div className="chartEmpty">
        Nenhum ponto disponível para gerar o gráfico.
      </div>
    );
  }

  const largura = 1200;
  const altura = 620;

  const margem = {
    top: 44,
    right: 130,
    bottom: 112,
    left: 82,
  };

  const xMin = 0;
  const xMax = Math.max(...todosPontos.map((ponto) => ponto.volume));
  const yMin = Math.floor(Math.min(...todosPontos.map((ponto) => ponto.pM ?? 0)));
  const yMax = Math.ceil(Math.max(...todosPontos.map((ponto) => ponto.pM ?? 0)));

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

  function gerarLinha(pontos: PontoCurvaEDTA[]) {
    return pontos
      .filter((ponto) => ponto.pM !== null)
      .map((ponto) => `${xScale(ponto.volume)},${yScale(ponto.pM ?? 0)}`)
      .join(" ");
  }

  function obterUltimoPontoValido(pontos: PontoCurvaEDTA[]) {
    const validos = pontos.filter((ponto) => ponto.pM !== null);
    return validos.length ? validos[validos.length - 1] : null;
  }

  const linhaPrincipal = gerarLinha(pontosPrincipal);

  const pontoPE = curva.pontoPE;
  const volumePE = curva.volumePE;
  const xPE = volumePE ? xScale(volumePE) : null;

  const ticksX = gerarTicks(xMin, xMax, 6);
  const ticksY = gerarTicks(yMin, yMax, 6);

  const ultimoPontoPrincipal = obterUltimoPontoValido(pontosPrincipal);

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
        curvasInterferentes.length > 0
          ? "curvas-interferentes-edta-analitcalc.png"
          : "curva-edta-analitcalc.png";
      link.click();
    };

    image.src = url;
  }

  return (
    <div className="chartBox">
      <div className="chartHeader">
        <div>
          <strong>{titulo}</strong>
          <span>{descricao}</span>
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
        aria-label={titulo}
        className="curveSvg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={largura} height={altura} fill="#ffffff" />

        <text
          x={margem.left}
          y={24}
          fill="#111111"
          fontSize="22"
          fontWeight="900"
        >
          {titulo}
        </text>

        <text
          x={margem.left}
          y={50}
          fill="#667085"
          fontSize="15"
          fontWeight="600"
        >
          {descricao}
        </text>

        <rect
          x={margem.left}
          y={margem.top + 24}
          width={plotWidth}
          height={plotHeight - 24}
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
                fontSize="16"
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
                y1={margem.top + 24}
                y2={altura - margem.bottom}
                stroke="#eeeeee"
                strokeWidth="1"
              />

              <text
                x={x}
                y={altura - 72}
                fill="#667085"
                fontSize="16"
                fontWeight="700"
                textAnchor="middle"
              >
                {formatarNumeroBR(tick, 0)}
              </text>
            </g>
          );
        })}

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
          y1={margem.top + 24}
          y2={altura - margem.bottom}
          stroke="#d0d5dd"
          strokeWidth="2"
        />

        {curvasInterferentes.map((curvaInterferente, index) => {
          const cor = CORES_INTERFERENTES[index % CORES_INTERFERENTES.length];
          const linha = gerarLinha(curvaInterferente.pontos);
          const ultimoPonto = obterUltimoPontoValido(curvaInterferente.pontos);

          return (
            <g key={curvaInterferente.metal}>
              <polyline
                points={linha}
                fill="none"
                stroke={cor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 6"
                opacity="0.95"
              />

{ultimoPonto && (
  <text
    x={Math.min(xScale(ultimoPonto.volume) + 10, largura - 115)}
    y={yScale(ultimoPonto.pM ?? 0) - 12 + index * 22}
    fill={cor}
    fontSize="15"
    fontWeight="900"
  >
    {curvaInterferente.metal}
  </text>
)}
            </g>
          );
        })}

        <polyline
          points={linhaPrincipal}
          fill="none"
          stroke="#a80000"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {ultimoPontoPrincipal && (
          <text
            x={Math.min(xScale(ultimoPontoPrincipal.volume) + 10, largura - 145)}
            y={yScale(ultimoPontoPrincipal.pM ?? 0) - 10}
            fill="#a80000"
            fontSize="13"
            fontWeight="800"
          >
            {metalPrincipalLabel}
          </text>
        )}

{xPE !== null && pontoPE && pontoPE.pM !== null && (
  <>
    <line
      x1={xPE}
      x2={xPE}
      y1={margem.top + 24}
      y2={altura - margem.bottom}
      stroke="#111111"
      strokeWidth="2.5"
      strokeDasharray="8 6"
    />

    <circle
      cx={xPE}
      cy={yScale(pontoPE.pM)}
      r="9"
      fill="#111111"
      stroke="#ffffff"
      strokeWidth="3"
    />

    <rect
      x={xPE + 14}
      y={yScale(pontoPE.pM) - 34}
      width="132"
      height="28"
      rx="8"
      fill="#ffffff"
      stroke="#e5e7eb"
    />

    <text
      x={xPE + 24}
      y={yScale(pontoPE.pM) - 15}
      fill="#111111"
      fontSize="15"
      fontWeight="900"
    >
      PE: {formatarNumeroBR(volumePE ?? 0, 2)} mL
    </text>
  </>
)}

        {pontoConsulta && pontoConsulta.pM !== null && (
          <>
            <circle
              cx={xScale(pontoConsulta.volume)}
              cy={yScale(pontoConsulta.pM)}
              r="10"
              fill="#a80000"
              stroke="#ffffff"
              strokeWidth="3"
            />

            <rect
              x={xScale(pontoConsulta.volume) + 14}
              y={yScale(pontoConsulta.pM) + 8}
              width="112"
              height="28"
              rx="8"
              fill="#ffffff"
              stroke="#f1d4d4"
            />

            <text
              x={xScale(pontoConsulta.volume) + 24}
              y={yScale(pontoConsulta.pM) + 27}
              fill="#a80000"
              fontSize="15"
              fontWeight="900"
            >
              {formatarNumeroBR(pontoConsulta.volume, 2)} mL
            </text>
          </>
        )}

        <text
          x={largura / 2}
          y={altura - 26}
          fill="#344054"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
        >
          Volume de EDTA adicionado em mL
        </text>

        <text
          x="26"
          y={altura / 2}
          fill="#344054"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
          transform={`rotate(-90 26 ${altura / 2})`}
        >
          pM
        </text>
      </svg>

      <div className="chartLegend">
        <span>
          <i className="legendLine curve" /> {metalPrincipalLabel}
        </span>

        {curvasInterferentes.map((item, index) => {
          const cor = CORES_INTERFERENTES[index % CORES_INTERFERENTES.length];

          return (
            <span key={item.metal}>
              <i
                className="legendLine"
                style={{
                  backgroundColor: cor,
                  borderColor: cor,
                }}
              />{" "}
              {item.metal}
            </span>
          );
        })}

        <span>
          <i className="legendLine pe" /> Ponto de equivalência
        </span>

        {pontoConsulta && (
          <span>
            <i className="legendLine consult" /> Ponto consultado
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
    Number((min + intervalo * index).toFixed(2))
  );
}