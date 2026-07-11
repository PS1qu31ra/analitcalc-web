import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header";
import { AnalitBotProvider } from "./contexts/AnalitBotContext";
import AnalitBotFloating from "../components/AnalitBotFloating";

export const metadata: Metadata = {
  title: "AnalitCalc",
  description:
    "Plataforma educacional para cálculos de Química Analítica com apoio inteligente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AnalitBotProvider>
          <Header />
          {children}
          <AnalitBotFloating />
        </AnalitBotProvider>
      </body>
    </html>
  );
}