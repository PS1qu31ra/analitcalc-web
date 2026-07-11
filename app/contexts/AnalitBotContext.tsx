"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type DadosAnalitBot = {
  moduloAtual: string;
  tipoSistema: string;
  resumoCalculo: string;
  contextoTexto: string;
};

type AnalitBotContextValue = {
  dados: DadosAnalitBot;
  atualizarDados: (novosDados: DadosAnalitBot) => void;
  limparDados: () => void;
};

const dadosIniciais: DadosAnalitBot = {
  moduloAtual: "AnalitCalc",
  tipoSistema: "Nenhum sistema avaliado",
  resumoCalculo: "Nenhum cálculo foi realizado ainda.",
  contextoTexto:
    "Nenhum sistema foi avaliado ainda. Oriente o usuário a realizar um cálculo em algum módulo.",
};

const AnalitBotContext = createContext<AnalitBotContextValue | null>(null);

export function AnalitBotProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosAnalitBot>(dadosIniciais);

  function atualizarDados(novosDados: DadosAnalitBot) {
    setDados(novosDados);
  }

  function limparDados() {
    setDados(dadosIniciais);
  }

  const valor = useMemo(
    () => ({
      dados,
      atualizarDados,
      limparDados,
    }),
    [dados]
  );

  return (
    <AnalitBotContext.Provider value={valor}>
      {children}
    </AnalitBotContext.Provider>
  );
}

export function useAnalitBot() {
  const contexto = useContext(AnalitBotContext);

  if (!contexto) {
    throw new Error("useAnalitBot deve ser usado dentro de AnalitBotProvider.");
  }

  return contexto;
}