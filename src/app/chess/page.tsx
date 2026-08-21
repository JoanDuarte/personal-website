import type { Metadata } from "next";
import Link from "next/link";
import { ChessWorkspace } from "@/components/chess/workspace";

export const metadata: Metadata = {
  title: "Ajedrez — Joan Duarte",
  description:
    "Repertorio, repaso y entrenamiento sobre mis propias partidas de chess.com. 638 de rapid y subiendo, en público.",
  openGraph: {
    title: "Ajedrez — Joan Duarte",
    description:
      "Repertorio, repaso y entrenamiento sobre mis propias partidas de chess.com.",
    type: "website",
  },
};

const RULES = [
  {
    n: "01",
    title: "La regla de los 30 segundos",
    body: "Cuando ganás material, pará. Ese es el momento exacto en que se te dan vuelta las partidas: llegaste a +5,5 de ventaja en la jugada 16 y perdiste igual, con 389 segundos sin usar.",
  },
  {
    n: "02",
    title: "El chequeo de una jugada",
    body: "Antes de mover: ¿queda algo colgado? ¿qué me captura? El 48% de tus errores graves es material regalado a una captura simple, no una combinación que no viste.",
  },
  {
    n: "03",
    title: "Un repertorio y nada más",
    body: "Londres con blancas, esquema indio con negras. No para saber más aperturas, sino para no tener que decidir nada antes de la jugada 10 y llegar entero a donde se decide.",
  },
];

export default function ChessPage() {
  return (
    <main className="mx-auto w-full max-w-[880px] px-5 py-16 md:py-24">
      <header className="max-w-[640px] space-y-6">
        <Link
          href="/"
          className="text-[13px] text-muted-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          ← joanduarte.vercel.app
        </Link>

        <h1 className="text-[28px] font-medium leading-[1.25] md:text-[32px]">
          Ajedrez
        </h1>

        <p className="text-[16px] leading-[1.7] text-muted-foreground md:text-[17px]">
          Bajé mis 311 partidas rapid de 2026 y las analicé una por una. El
          diagnóstico no fue el que esperaba: no pierdo por jugar rápido ni por
          no saber aperturas. Pierdo partidas que ya tenía ganadas. Llegué a
          tener tres piezas de ventaja en 216 partidas y no gané 87 de esas.
        </p>

        <p className="text-[16px] leading-[1.7] text-muted-foreground md:text-[17px]">
          Peor: la tasa empeoró mientras el elo bajaba, de tirar una de cada
          tres en enero a casi una de cada dos en junio. El reloj se mantuvo
          igual todo el año. No empecé a jugar peor, empecé a convertir peor.
          Esta página es lo que armé para arreglarlo.
        </p>
      </header>

      <section className="mt-14 max-w-[640px] space-y-8 border-t border-border pt-10">
        {RULES.map((rule) => (
          <div key={rule.n} className="flex gap-5">
            <span className="shrink-0 text-[13px] tabular-nums text-primary">
              {rule.n}
            </span>
            <div className="space-y-1.5">
              <h2 className="text-[17px] font-medium md:text-[18px]">
                {rule.title}
              </h2>
              <p className="text-[15px] leading-[1.7] text-muted-foreground md:text-[16px]">
                {rule.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <ChessWorkspace />
      </section>

      <footer className="mt-16 max-w-[640px] space-y-4 border-t border-border pt-8">
        <p className="text-[13px] leading-[1.7] text-muted-foreground">
          El repertorio se entrena antes de jugar y se cierra antes de empezar
          la partida. La política de juego limpio de chess.com permite libros de
          apertura solo en ajedrez por días, no en partidas en vivo, y las mías
          son de diez minutos. Un esquema que necesitás leer de una pantalla
          tampoco lo sabés todavía.
        </p>
        <p className="text-[13px] leading-[1.7] text-muted-foreground">
          Los datos salen de la API pública de chess.com. El análisis no usa
          motor: encuentra material colgado con evaluación estática de
          intercambios, que cubre la clase de error que me está costando el elo.
        </p>
      </footer>
    </main>
  );
}
