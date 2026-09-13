"use client";

import { useActionState } from "react";
import { runSimulation, type SimulationState } from "./actions";

const initialState: SimulationState = null;

export function Simulator() {
  const [result, action, isPending] = useActionState(runSimulation, initialState);

  return (
    <section className="simulator" aria-labelledby="simulator-title">
      <div className="simulator-heading">
        <p className="eyebrow">Match lab · POC 01</p>
        <h1 id="simulator-title">Anything can happen in 90 minutes.</h1>
        <p className="intro">
          Two evenly matched teams. One league-calibrated model. No form, tactics,
          or home advantage—yet.
        </p>
      </div>

      <div className="scoreboard" aria-live="polite" aria-atomic="true">
        <div className="team">
          <span className="badge badge-a">A</span>
          <span>Team A</span>
        </div>

        <div className="score">
          {result ? (
            <>
              <strong>{result.teamAGoals}</strong>
              <span>:</span>
              <strong>{result.teamBGoals}</strong>
            </>
          ) : (
            <span className="waiting">— : —</span>
          )}
        </div>

        <div className="team team-right">
          <span className="badge badge-b">B</span>
          <span>Team B</span>
        </div>
      </div>

      <div className="result-line" aria-live="polite">
        {result ? result.outcome : "Ready for kick-off"}
      </div>

      <form action={action}>
        <button type="submit" disabled={isPending}>
          <span>{isPending ? "Simulating…" : result ? "Play again" : "Simulate match"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="model-note">
        <span className="pulse" />
        Poisson model · 1.576 expected goals per team
      </div>
    </section>
  );
}
