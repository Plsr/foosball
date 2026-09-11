import { simulateMatch, type Team } from "../domain/match";

const homeTeam: Team = { id: "northbridge", name: "Northbridge FC", strength: 70 };
const awayTeam: Team = { id: "riverside", name: "Riverside United", strength: 65 };
const result = simulateMatch(homeTeam, awayTeam, 42);

export default function HomePage() {
  return (
    <main className="shell">
      <header className="masthead">
        <p className="eyebrow">FOOSBALL / SIMULATION LAB</p>
        <h1>Build your club.<br />Shape the match.</h1>
        <p className="lede">A work-in-progress soccer simulator about decisions, matchdays, and the stories that emerge from them.</p>
      </header>

      <section className="match-panel" aria-labelledby="match-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PROTOTYPE MATCH</p>
            <h2 id="match-heading">Matchday one</h2>
          </div>
          <span className="status">SIMULATED</span>
        </div>
        <div className="scoreline">
          <div><span>{homeTeam.name}</span><strong>{result.homeGoals}</strong></div>
          <div><span>{awayTeam.name}</span><strong>{result.awayGoals}</strong></div>
        </div>
        <p className="muted">Seed {result.seed} · Home advantage enabled</p>
      </section>
    </main>
  );
}
