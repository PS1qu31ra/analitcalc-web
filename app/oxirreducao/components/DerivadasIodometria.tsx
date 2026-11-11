import { formatarCientificoPtBr } from "@/lib/oxirreducao/formatacao";
import type {
  ResultadoDerivadasIodometria,
} from "@/lib/oxirreducao/iodometria";

type Props = {
  derivadas: ResultadoDerivadasIodometria;
  volumeEquivalenciaMl: number;
};

type PontoGrafico = {
  volumeMl: number;
  valor: number;
};

function formatarNumero(valor: number, casas = 3) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

function formatarEixo(valor: number) {
  const absoluto = Math.abs(valor);
  if (absoluto !== 0 && (absoluto >= 1000 || absoluto < 0.001)) {
    return formatarCientificoPtBr(valor, 2);
  }
  if (absoluto >= 10) return formatarNumero(valor, 1);
  if (absoluto >= 1) return formatarNumero(valor, 2);
  return formatarNumero(valor, 3);
}

function GraficoDerivadaIodometria({
  pontos,
  tituloEixoY,
  volumeEquivalenciaMl,
  volumeDestaque = null,
  valorDestaque = null,
  centralizarEmZero = false,
}: {
  pontos: PontoGrafico[];
  tituloEixoY: string;
  volumeEquivalenciaMl: number;
  volumeDestaque?: number | null;
  valorDestaque?: number | null;
  centralizarEmZero?: boolean;
}) {
  const largura = 1000;
  const altura = 430;
  const margemEsquerda = 105;
  const margemDireita = 40;
  const margemSuperior = 42;
  const margemInferior = 78;
  const larguraUtil = largura - margemEsquerda - margemDireita;
  const alturaUtil = altura - margemSuperior - margemInferior;

  // Mesmo enquadramento usado na aba de derivadas da permanganatometria.
  const meiaJanela = Math.max(volumeEquivalenciaMl * 0.12, 1);
  const inicioJanela = Math.max(0, volumeEquivalenciaMl - meiaJanela);
  const fimJanela = volumeEquivalenciaMl + meiaJanela;
  const pontosJanela = pontos.filter(
    (ponto) =>
      ponto.volumeMl >= inicioJanela &&
      ponto.volumeMl <= fimJanela &&
      Number.isFinite(ponto.valor)
  );
  const pontosVisiveis = pontosJanela.length >= 3 ? pontosJanela : pontos;

  if (pontosVisiveis.length < 2) {
    return (
      <div className="oxirreducaoEmptyChart">
        Não existem pontos suficientes para gerar o gráfico.
      </div>
    );
  }

  const volumes = pontosVisiveis.map((ponto) => ponto.volumeMl);
  const valores = pontosVisiveis.map((ponto) => ponto.valor);
  const volumeMinimo = Math.min(...volumes);
  const volumeMaximo = Math.max(...volumes);
  const valorMinimoOriginal = Math.min(...valores);
  const valorMaximoOriginal = Math.max(...valores);

  let valorMinimo: number;
  let valorMaximo: number;

  if (centralizarEmZero) {
    const maximoAbsoluto = Math.max(
      Math.abs(valorMinimoOriginal),
      Math.abs(valorMaximoOriginal),
      1e-9
    );
    valorMinimo = -maximoAbsoluto * 1.1;
    valorMaximo = maximoAbsoluto * 1.1;
  } else {
    const amplitude = Math.max(
      valorMaximoOriginal - valorMinimoOriginal,
      Math.abs(valorMaximoOriginal) * 0.05,
      1e-9
    );
    valorMinimo =
      valorMinimoOriginal >= 0
        ? 0
        : valorMinimoOriginal - amplitude * 0.08;
    valorMaximo =
      Math.max(0, valorMaximoOriginal) + amplitude * 0.1;
  }

  const x = (volume: number) =>
    margemEsquerda +
    ((volume - volumeMinimo) /
      Math.max(volumeMaximo - volumeMinimo, 1e-12)) *
      larguraUtil;

  const y = (valor: number) =>
    margemSuperior +
    ((valorMaximo - valor) /
      Math.max(valorMaximo - valorMinimo, 1e-12)) *
      alturaUtil;

  const polyline = pontosVisiveis
    .map((ponto) => `${x(ponto.volumeMl)},${y(ponto.valor)}`)
    .join(" ");

  const marcacoesX = Array.from(
    { length: 6 },
    (_, indice) =>
      volumeMinimo + ((volumeMaximo - volumeMinimo) / 5) * indice
  );

  const marcacoesY = Array.from(
    { length: 6 },
    (_, indice) =>
      valorMinimo + ((valorMaximo - valorMinimo) / 5) * indice
  );

  const zeroDentro = valorMinimo <= 0 && valorMaximo >= 0;
  const peDentro =
    volumeEquivalenciaMl >= volumeMinimo &&
    volumeEquivalenciaMl <= volumeMaximo;
  const destaqueDentro =
    volumeDestaque !== null &&
    valorDestaque !== null &&
    volumeDestaque >= volumeMinimo &&
    volumeDestaque <= volumeMaximo &&
    valorDestaque >= valorMinimo &&
    valorDestaque <= valorMaximo;

  return (
    <div className="oxirreducaoDerivativeChart">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={tituloEixoY}
      >
        {marcacoesY.map((valor, indice) => (
          <g key={`y-${indice}`}>
            <line
              x1={margemEsquerda}
              x2={largura - margemDireita}
              y1={y(valor)}
              y2={y(valor)}
              className="oxirreducaoChartGrid"
            />
            <text
              x={margemEsquerda - 15}
              y={y(valor) + 5}
              textAnchor="end"
              className="oxirreducaoChartTick"
            >
              {formatarEixo(valor)}
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
              y={altura - margemInferior + 28}
              textAnchor="middle"
              className="oxirreducaoChartTick"
            >
              {formatarNumero(volume, 2)}
            </text>
          </g>
        ))}

        {centralizarEmZero && zeroDentro && (
          <line
            x1={margemEsquerda}
            x2={largura - margemDireita}
            y1={y(0)}
            y2={y(0)}
            className="oxirreducaoDerivativeZero"
          />
        )}

        {peDentro && (
          <line
            x1={x(volumeEquivalenciaMl)}
            x2={x(volumeEquivalenciaMl)}
            y1={margemSuperior}
            y2={altura - margemInferior}
            className="oxirreducaoChartPELine"
          />
        )}

        {destaqueDentro && (
          <line
            x1={x(volumeDestaque as number)}
            x2={x(volumeDestaque as number)}
            y1={margemSuperior}
            y2={altura - margemInferior}
            className="oxirreducaoDerivativePFLine"
          />
        )}

        <polyline
          points={polyline}
          fill="none"
          className="oxirreducaoChartCurve"
        />

        {destaqueDentro && (
          <circle
            cx={x(volumeDestaque as number)}
            cy={y(valorDestaque as number)}
            r="5.5"
            className="oxirreducaoChartPEPoint"
          />
        )}

        <text
          x="22"
          y={margemSuperior + alturaUtil / 2}
          textAnchor="middle"
          transform={`rotate(-90 22 ${margemSuperior + alturaUtil / 2})`}
          className="oxirreducaoChartAxisLabel"
        >
          {tituloEixoY}
        </text>

        <text
          x={margemEsquerda + larguraUtil / 2}
          y={altura - 17}
          textAnchor="middle"
          className="oxirreducaoChartAxisLabel"
        >
          Volume de Na₂S₂O₃ (mL)
        </text>
      </svg>

      <div className="oxirreducaoDerivativeLegend">
        <span>
          <i className="oxirreducaoDerivativeLegendPE" />
          Ponto de equivalência
        </span>
        <span>
          <i className="oxirreducaoDerivativeLegendPF" />
          Ponto final pela derivada
        </span>
      </div>
    </div>
  );
}

export default function DerivadasIodometria({
  derivadas,
  volumeEquivalenciaMl,
}: Props) {
  const erroPrimeira =
    derivadas.volumePFPrimeiraDerivadaMl - volumeEquivalenciaMl;
  const erroSegunda =
    derivadas.volumePFSegundaDerivadaMl !== null
      ? derivadas.volumePFSegundaDerivadaMl - volumeEquivalenciaMl
      : null;

  const pontosPrimeira = derivadas.primeiraDerivada.map((ponto) => ({
    volumeMl: ponto.volumeMl,
    valor: ponto.primeiraDerivada,
  }));

  const pontosSegunda = derivadas.segundaDerivada.map((ponto) => ({
    volumeMl: ponto.volumeMl,
    valor: ponto.segundaDerivada,
  }));

  return (
    <section className="oxirreducaoTabPanel">
      <header className="oxirreducaoTabHeader">
        <span className="oxirreducaoSectionLabel">Derivadas</span>
        <h3>PE estequiométrico × PF potenciométrico</h3>
        <p>
          A curva iodimétrica é descendente. Por isso, a primeira derivada
          apresenta um vale negativo próximo ao PE. A segunda derivada muda
          de sinal na região de maior inclinação. Ambas são calculadas sobre
          a mesma curva contínua de equilíbrio, sem interromper os dados na
          vizinhança da equivalência.
        </p>
      </header>

      <div className="oxirreducaoDerivativeSummary">
        <article>
          <span>PE estequiométrico</span>
          <strong>{formatarNumero(volumeEquivalenciaMl, 3)} mL</strong>
          <small>Determinado pela reação global</small>
        </article>
        <article>
          <span>PF — 1ª derivada</span>
          <strong>{formatarNumero(derivadas.volumePFPrimeiraDerivadaMl, 3)} mL</strong>
          <small>Vale de dE/dV</small>
        </article>
        <article>
          <span>Desvio — 1ª derivada</span>
          <strong>{formatarNumero(erroPrimeira, 4)} mL</strong>
          <small>PF₁ − PE</small>
        </article>
        <article>
          <span>PF — 2ª derivada</span>
          <strong>
            {derivadas.volumePFSegundaDerivadaMl !== null
              ? `${formatarNumero(derivadas.volumePFSegundaDerivadaMl, 3)} mL`
              : "Não localizado"}
          </strong>
          <small>
            {erroSegunda !== null
              ? `PF₂ − PE = ${formatarNumero(erroSegunda, 4)} mL`
              : "Sem cruzamento real por zero"}
          </small>
        </article>
        <article>
          <span>Extremo de dE/dV</span>
          <strong>{formatarNumero(derivadas.valorExtremoPrimeiraDerivada, 4)}</strong>
          <small>V·mL⁻¹</small>
        </article>
      </div>

      <section className="oxirreducaoDerivativeSection">
        <header>
          <span>1ª derivada</span>
          <h4>ΔE / ΔV</h4>
          <p>
            O potencial diminui com a adição de tiossulfato. O ponto final é
            estimado pelo mínimo algébrico (vale) da primeira derivada.
          </p>
        </header>
        <GraficoDerivadaIodometria
          pontos={pontosPrimeira}
          tituloEixoY="ΔE/ΔV (V·mL⁻¹)"
          volumeEquivalenciaMl={volumeEquivalenciaMl}
          volumeDestaque={derivadas.volumePFPrimeiraDerivadaMl}
          valorDestaque={derivadas.valorExtremoPrimeiraDerivada}
        />
      </section>

      <section className="oxirreducaoDerivativeSection">
        <header>
          <span>2ª derivada</span>
          <h4>Δ²E / ΔV²</h4>
          <p>
            O ponto final pela segunda derivada é identificado no cruzamento
            real por zero, que marca a mudança de concavidade da curva
            potenciométrica.
          </p>
        </header>
        <GraficoDerivadaIodometria
          pontos={pontosSegunda}
          tituloEixoY="Δ²E/ΔV² (V·mL⁻²)"
          volumeEquivalenciaMl={volumeEquivalenciaMl}
          volumeDestaque={derivadas.volumePFSegundaDerivadaMl}
          valorDestaque={
            derivadas.volumePFSegundaDerivadaMl !== null ? 0 : null
          }
          centralizarEmZero
        />
      </section>

      <div className="oxirreducaoEducationalNote">
        <strong>Como interpretar?</strong>
        <p>
          A linha tracejada marca o PE estequiométrico. O vale da primeira
          derivada e o cruzamento da segunda derivada são métodos
          independentes para estimar o ponto final. Como a curva é contínua,
          não há faixa artificialmente removida ao redor do PE.
        </p>
      </div>
    </section>
  );
}
