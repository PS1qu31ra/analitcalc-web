"use client";

import { useState } from "react";

import styles from "./AnalitoMaintenanceFloating.module.css";

export default function AnalitoMaintenanceFloating() {
  const [
    aberto,
    setAberto,
  ] = useState(false);

  return (
    <>
      <button
        type="button"
        className={
          styles.floatingButton
        }
        onClick={() =>
          setAberto(true)
        }
        aria-label="Ver informações sobre o Analito"
      >
        <span
          className={
            styles.floatingIcon
          }
        >
          🧪
        </span>

        <span
          className={
            styles.floatingContent
          }
        >
          <strong>
            Analito
          </strong>

          <span>
            em evolução
          </span>
        </span>

        <span
          className={
            styles.statusDot
          }
        />
      </button>

      {aberto && (
        <div
          className={
            styles.overlay
          }
          role="presentation"
          onClick={() =>
            setAberto(false)
          }
        >
          <section
            className={
              styles.modal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="analito-maintenance-title"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setAberto(false)
              }
              aria-label="Fechar"
            >
              ×
            </button>

            <div
              className={
                styles.iconWrapper
              }
            >
              🧪
            </div>

            <span
              className={
                styles.badge
              }
            >
              NOVA FASE
            </span>

            <h2
              id="analito-maintenance-title"
              className={
                styles.title
              }
            >
              O Analito está
              evoluindo
            </h2>

            <p
              className={
                styles.description
              }
            >
              Estamos preparando
              uma nova etapa para
              o Analito, agora
              como um projeto
              próprio, com uma
              experiência mais
              completa e focada
              em interpretação
              química.
            </p>

            <div
              className={
                styles.infoBox
              }
            >
              <span
                className={
                  styles.infoIcon
                }
              >
                ✓
              </span>

              <p>
                Enquanto isso,
                todos os módulos,
                cálculos,
                simulações e
                gráficos do
                AnalitCalc
                continuam
                disponíveis
                normalmente.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                setAberto(false)
              }
            >
              Continuar no
              AnalitCalc
            </button>

            <p
              className={
                styles.footerText
              }
            >
              Em breve, o Analito
              volta com novidades.
            </p>
          </section>
        </div>
      )}
    </>
  );
}