import Game from "@/components/Game";

export default function Home() {
  return (
    <main className="container">
      <header className="top">
        <h1>
          Sports <span className="accent">Roulette</span>
        </h1>
        <p className="muted">Spin to draft. Spin for chaos. Win the title.</p>
      </header>
      <Game />
      <footer className="muted small foot">
        All players are fictional. Progress is saved in your browser.
      </footer>
    </main>
  );
}
