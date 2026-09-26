"use client";

import {
  useState,
} from "react";

import "./styles/oxirreducao.css";

import ModuleHeader from "./components/ModuleHeader";

import ModuleTabs, {
  type AbaOxirreducao,
} from "./components/ModuleTabs";

import Permanganometria from "./components/Permanganometria";


export default function OxirreducaoPage() {
  const [
    abaAtiva,
    setAbaAtiva,
  ] =
    useState<AbaOxirreducao>(
      "permanganometria"
    );


  return (
    <main className="oxirreducaoPage">
      <ModuleHeader />

      <ModuleTabs
        abaAtiva={
          abaAtiva
        }
        onChange={
          setAbaAtiva
        }
      />

      {abaAtiva ===
        "permanganometria" && (
        <Permanganometria />
      )}
    </main>
  );
}