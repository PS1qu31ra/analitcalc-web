export default function VisaoGeralIodometria() {
    return (
      <section className="oxirreducaoTabPanel">
        <header className="oxirreducaoTabHeader">
          <span className="oxirreducaoSectionLabel">
            Visão geral
          </span>
  
          <h3>
            Iodometria de cloro ativo
          </h3>
  
          <p>
            O cloro ativo é determinado indiretamente.
            Primeiro, o analito oxida iodeto em excesso e
            libera I₂. Em seguida, o iodo formado é titulado
            com solução padrão de tiossulfato de sódio.
          </p>
        </header>
  
  
        <div className="oxirreducaoOverviewGrid">
          <article>
            <span>
              Analito
            </span>
  
            <strong>
              Cl₂
            </strong>
  
            <p>
              Espécie oxidante determinada indiretamente
              pela quantidade de iodo liberada.
            </p>
          </article>
  
  
          <article>
            <span>
              Reagente auxiliar
            </span>
  
            <strong>
              KI
            </strong>
  
            <p>
              Fornece I⁻ em excesso para a formação
              quantitativa de I₂.
            </p>
          </article>
  
  
          <article>
            <span>
              Titulante
            </span>
  
            <strong>
              Na₂S₂O₃
            </strong>
  
            <p>
              O tiossulfato reduz o I₂ formado novamente
              a iodeto.
            </p>
          </article>
  
  
          <article>
            <span>
              Indicador
            </span>
  
            <strong>
              Amido
            </strong>
  
            <p>
              Forma uma coloração intensa com o iodo;
              próximo ao ponto final, o desaparecimento
              dessa coloração indica o consumo do I₂.
            </p>
          </article>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Reação de formação do iodo
          </span>
  
          <strong>
            Cl₂ + 2 I⁻ → 2 Cl⁻ + I₂
          </strong>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Reação de titulação
          </span>
  
          <strong>
            I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻
          </strong>
        </div>
  
  
        <div className="oxirreducaoOverviewReaction">
          <span>
            Relação estequiométrica global
          </span>
  
          <strong>
            1 Cl₂ : 1 I₂ : 2 S₂O₃²⁻
          </strong>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Por que a iodometria é indireta?
          </strong>
  
          <p>
            O Cl₂ não é titulado diretamente pelo
            tiossulfato no procedimento analítico. Sua
            quantidade é convertida estequiometricamente em
            I₂ pela reação com iodeto. A quantidade de
            tiossulfato necessária para consumir esse I₂
            permite calcular a quantidade original de
            cloro ativo.
          </p>
        </div>
  
  
        <div className="oxirreducaoEducationalNote">
          <strong>
            Visualização do ponto final
          </strong>
  
          <p>
            O amido é utilizado como indicador devido à
            intensa coloração produzida na presença de
            espécies de iodo. À medida que o tiossulfato
            consome o iodo, essa coloração desaparece no
            ponto final.
          </p>
        </div>
      </section>
    );
  }