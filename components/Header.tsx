import Link from "next/link";
import { logos } from "../lib/logos";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">
        <img
          src={logos.analitcalc}
          alt="Logo AnalitCalc"
          className="brandLogo"
        />

        <div className="brandText">
          <strong>AnalitCalc</strong>
          <small>Química Analítica Inteligente</small>
        </div>
      </Link>

      <nav className="nav">
        <Link href="/">Início</Link>
        <Link href="/complexometria">Complexometria</Link>
      </nav>
    </header>
  );
}