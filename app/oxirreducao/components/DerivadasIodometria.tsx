import type {
    ResultadoDerivadasIodometria,
  } from "@/lib/oxirreducao/iodometria";
  
  
  type DerivadasIodometriaProps = {
    derivadas:
      ResultadoDerivadasIodometria;
  
    volumeEquivalenciaMl:
      number;
  };
  
  
  type PontoGrafico = {
    volumeMl: number;
    valor: number;
  };
  
  
  function formatarNumero(
    valor: number,
    casas = 3
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      }
    ).format(valor);
  }
  
  
  function GraficoDerivadaIodometria({
    pontos,
    volumeEquivalenciaMl,
    volumePFMl,
    tituloEixoY,
    centralizarEmZero = false,
  }: {
    pontos: PontoGrafico[];
    volumeEquivalenciaMl: number;
    volumePFMl: number;
    tituloEixoY: string;
    centralizarEmZero?: boolean;
  }) {
    const largura = 1000;
    const altura = 420;
    const margemEsquerda = 100;
    const margemDireita = 40;
    const margemSuperior = 35;
    const margemInferior = 75;
  
    const larguraUtil =
      largura - margemEsquerda - margemDireita;
    const alturaUtil =
      altura - margemSuperior - margemInferior;
  
    const meiaJanela = Math.max(
      volumeEquivalenciaMl * 0.15,
      1
    );
  
    const inicio = Math.max(
      0,
      volumeEquivalenciaMl - meiaJanela
    );
  
    const fim =
      volumeEquivalenciaMl + meiaJanela;
  
    const janela = pontos.filter(
      (ponto) =>
        ponto.volumeMl >= inicio &&
        ponto.volumeMl <= fim
    );
  
    const dados =
      janela.length >= 3
        ? janela
        : pontos;
  
    if (dados.length < 2) {
      return (
        <div className="oxirreducaoEmptyChart">
          Não existem pontos suficientes para gerar a derivada.
        </div>
      );
    }
  
    const xmin = Math.min(
      ...dados.map((ponto) => ponto.volumeMl)
    );
    const xmax = Math.max(
      ...dados.map((ponto) => ponto.volumeMl)
    );
  
    const valores = dados.map(
      (ponto) => ponto.valor
    );
  
    let ymin = Math.min(...valores);
    let ymax = Math.max(...valores);
  
    if (centralizarEmZero) {
      const maxAbs = Math.max(
        Math.abs(ymin),
        Math.abs(ymax),
        1e-9
      );
      ymin = -1.1 * maxAbs;
      ymax = 1.1 * maxAbs;
    } else {
      const amplitude = Math.max(
        ymax - ymin,
        1e-9
      );
      ymin -= amplitude * 0.08;
      ymax += amplitude * 0.08;
    }
  
    const x = (volume: number) =>
      margemEsquerda +
      ((volume - xmin) / Math.max(xmax - xmin, 1e-12)) *
        larguraUtil;
  
    const y = (valor: number) =>
      margemSuperior +
      ((ymax - valor) / Math.max(ymax - ymin, 1e-12)) *
        alturaUtil;
  
        const polyline =
        dados
          .map(
            (ponto) =>
              `${x(
                ponto.volumeMl
              )},${y(
                ponto.valor
              )}`
          )
          .join(" ");
  
    const marcacoesX = Array.from(
      { length: 6 },
      (_, indice) =>
        xmin + ((xmax - xmin) / 5) * indice
    );
  
    const marcacoesY = Array.from(
      { length: 6 },
      (_, indice) =>
        ymin + ((ymax - ymin) / 5) * indice
    );
  
    return (
      <div className="oxirreducaoChartWrapper">
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label={tituloEixoY}
        >
          {marcacoesY.map((valor) => (
            <g key={`y-${valor}`}>
              <line
                x1={margemEsquerda}
                x2={largura - margemDireita}
                y1={y(valor)}
                y2={y(valor)}
                className="oxirreducaoChartGrid"
              />
              <text
                x={margemEsquerda - 12}
                y={y(valor) + 5}
                textAnchor="end"
                className="oxirreducaoChartTick"
              >
                {Math.abs(valor) >= 1000 ||
                (Math.abs(valor) > 0 && Math.abs(valor) < 0.001)
                  ? valor.toExponential(2)
                  : formatarNumero(valor, 3)}
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
                {formatarNumero(volume, 2)}
              </text>
            </g>
          ))}
  
          {centralizarEmZero && ymin < 0 && ymax > 0 && (
            <line
              x1={margemEsquerda}
              x2={largura - margemDireita}
              y1={y(0)}
              y2={y(0)}
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeDasharray="6 6"
            />
          )}
  
          <line
            x1={x(volumeEquivalenciaMl)}
            x2={x(volumeEquivalenciaMl)}
            y1={margemSuperior}
            y2={altura - margemInferior}
            className="oxirreducaoChartPELine"
          />
  
          <line
            x1={x(volumePFMl)}
            x2={x(volumePFMl)}
            y1={margemSuperior}
            y2={altura - margemInferior}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeOpacity="0.55"
          />
  
          <polyline
            points={polyline}
            fill="none"
            className="oxirreducaoChartCurve"
          />
  
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
            y={altura - 16}
            textAnchor="middle"
            className="oxirreducaoChartAxisLabel"
          >
            Volume de Na₂S₂O₃ (mL)
          </text>
        </svg>
      </div>
    );
  }
  
  
  export default function DerivadasIodometria({
    derivadas,
    volumeEquivalenciaMl,
  }: DerivadasIodometriaProps) {
    const erroAbsoluto =
      derivadas.volumePFPrimeiraDerivadaMl -
      volumeEquivalenciaMl;
  
    const erroRelativo =
      (erroAbsoluto / volumeEquivalenciaMl) *
      100;
  
    return (
      <div className="oxirreducaoTabPanel">
        <div className="resultsPanel">
          <span className="eyebrow">
            Localização do ponto final
          </span>
  
          <h2>
            Derivadas da curva iodimétrica
          </h2>
  
          <p>
            Como a adição de tiossulfato reduz o potencial, a primeira derivada apresenta um vale. O PF é localizado pelo extremo de maior magnitude de dE/dV; o zero da segunda derivada é refinado para o mesmo ponto de inflexão.
          </p>
  
          <div className="resultGrid">
            <div className="resultCard">
              <span>PE estequiométrico</span>
              <strong>{formatarNumero(volumeEquivalenciaMl, 3)} mL</strong>
            </div>
  
            <div className="resultCard">
              <span>PF — 1ª derivada</span>
              <strong>{formatarNumero(derivadas.volumePFPrimeiraDerivadaMl, 3)} mL</strong>
            </div>
  
            <div className="resultCard">
              <span>PF — 2ª derivada</span>
              <strong>{formatarNumero(derivadas.volumePFSegundaDerivadaMl, 3)} mL</strong>
            </div>
  
            <div className="resultCard">
              <span>PF − PE</span>
              <strong>{formatarNumero(erroAbsoluto, 4)} mL</strong>
            </div>
  
            <div className="resultCard">
              <span>Erro relativo</span>
              <strong>{formatarNumero(erroRelativo, 4)}%</strong>
            </div>
          </div>
        </div>
  
        <div className="resultsPanel">
          <h2>1ª derivada — dE/dV</h2>
          <GraficoDerivadaIodometria
            pontos={derivadas.primeiraDerivada.map((ponto) => ({
              volumeMl: ponto.volumeMl,
              valor: ponto.primeiraDerivada,
            }))}
            volumeEquivalenciaMl={volumeEquivalenciaMl}
            volumePFMl={derivadas.volumePFPrimeiraDerivadaMl}
            tituloEixoY="dE/dV"
          />
        </div>
  
        <div className="resultsPanel">
          <h2>2ª derivada — d²E/dV²</h2>
          <GraficoDerivadaIodometria
            pontos={derivadas.segundaDerivada.map((ponto) => ({
              volumeMl: ponto.volumeMl,
              valor: ponto.segundaDerivada,
            }))}
            volumeEquivalenciaMl={volumeEquivalenciaMl}
            volumePFMl={derivadas.volumePFSegundaDerivadaMl}
            tituloEixoY="d²E/dV²"
            centralizarEmZero
          />
        </div>
      </div>
    );
  }
  
  