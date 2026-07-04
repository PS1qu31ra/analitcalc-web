import Link from "next/link";
import type { AnalitCalcModule } from "../lib/modules";

type Props = {
  module: AnalitCalcModule;
};

export function ModuleCard({ module }: Props) {
  return (
    <Link href={module.href} className="moduleCard">
      <div className="moduleTop">
        <span className="moduleArea">{module.area}</span>

        <span
          className={
            module.status === "Disponível"
              ? "status available"
              : "status building"
          }
        >
          {module.status}
        </span>
      </div>

      <h3>{module.title}</h3>
      <p>{module.description}</p>

      <span className="moduleAction">Abrir módulo</span>
    </Link>
  );
}