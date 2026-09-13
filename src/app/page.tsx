import { Simulator } from "./simulator";

export default function Home() {
  return (
    <main>
      <nav aria-label="Main navigation">
        <span className="brand-mark">FS</span>
        <span className="brand">Football Simulator</span>
        <span className="prototype">Prototype</span>
      </nav>
      <Simulator />
      <footer>Built to test the model, not predict the weekend.</footer>
    </main>
  );
}
