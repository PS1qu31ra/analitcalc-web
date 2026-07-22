"use client";

import "./styles/precipitacao.css";

import { useState } from "react";

import ModuleHeader from "./components/ModuleHeader";
import ModuleTabs, {
  type AbaPrecipitacao,
} from "./components/ModuleTabs";

import TitulacaoDireta from "./components/TitulacaoDireta";
import TitulacaoRetorno from "./components/TitulacaoRetorno";
import PrecipitacaoSeletiva from "./components/PrecipitacaoSeletiva";

export default function PrecipitacaoPage() {
  const [abaAtiva, setAbaAtiva] =
    useState<AbaPrecipitacao>("direta");

  return (
    <main>
      <ModuleHeader />

      <ModuleTabs
        abaAtiva={abaAtiva}
        onChange={setAbaAtiva}
      />

      {abaAtiva === "direta" && <TitulacaoDireta />}

      {abaAtiva === "retorno" && <TitulacaoRetorno />}

      {abaAtiva === "seletiva" && (
        <PrecipitacaoSeletiva />
      )}
    </main>
  );
}