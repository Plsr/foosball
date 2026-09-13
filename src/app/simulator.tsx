"use client";

import { useActionState } from "react";
import { runSimulation, type SimulationState } from "./actions";

const initialState: SimulationState = null;

export function Simulator() {
  const [result, action, isPending] = useActionState(runSimulation, initialState);

  return (
    <section
      className="mx-auto my-auto w-full max-w-[880px] pt-[52px] pb-[38px] text-center min-[601px]:py-[70px]"
      aria-labelledby="simulator-title"
    >
      <div className="mx-auto mb-9 max-w-[720px] min-[601px]:mb-14">
        <p className="font-mono text-[11px] leading-none font-bold tracking-[0.18em] text-lime uppercase">
          Match lab · POC 01
        </p>
        <h1
          id="simulator-title"
          className="my-[18px] text-[clamp(42px,7vw,76px)] leading-[0.97] font-bold tracking-[-0.055em]"
        >
          Anything can happen in 90 minutes.
        </h1>
        <p className="mx-auto max-w-[570px] text-[17px] leading-[1.65] text-muted">
          Two evenly matched teams. One league-calibrated model. No form, tactics,
          or home advantage—yet.
        </p>
      </div>

      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-line px-0.5 py-8 min-[601px]:gap-[clamp(18px,6vw,70px)] min-[601px]:px-[clamp(16px,5vw,50px)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-col items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase min-[601px]:flex-row min-[601px]:gap-3.5 min-[601px]:text-sm">
          <span className="grid size-[38px] place-items-center rounded-full bg-lime text-lg font-black text-night min-[601px]:size-12">
            A
          </span>
          <span>Team A</span>
        </div>

        <div className="flex min-w-[130px] items-baseline justify-center gap-[7px] text-[56px] tabular-nums min-[601px]:min-w-[190px] min-[601px]:gap-3.5">
          {result ? (
            <>
              <strong className="text-[clamp(64px,10vw,108px)] leading-none tracking-[-0.08em]">
                {result.teamAGoals}
              </strong>
              <span>:</span>
              <strong className="text-[clamp(64px,10vw,108px)] leading-none tracking-[-0.08em]">
                {result.teamBGoals}
              </strong>
            </>
          ) : (
            <span className="font-extrabold text-waiting">— : —</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase min-[601px]:flex-row-reverse min-[601px]:gap-3.5 min-[601px]:text-sm">
          <span className="grid size-[38px] place-items-center rounded-full bg-badge text-lg font-black text-night min-[601px]:size-12">
            B
          </span>
          <span>Team B</span>
        </div>
      </div>

      <div
        className="mt-[25px] mb-7 min-h-6 font-mono text-[13px] leading-normal font-bold tracking-[0.14em] text-lime uppercase"
        aria-live="polite"
      >
        {result ? result.outcome : "Ready for kick-off"}
      </div>

      <form action={action} className="flex justify-center">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full max-w-80 cursor-pointer justify-between rounded-sm border-0 bg-lime px-[22px] py-[19px] text-[15px] leading-none font-extrabold text-[#0b0e0c] transition-[transform,box-shadow] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_9px_28px_rgba(200,255,70,0.16)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none"
        >
          <span>{isPending ? "Simulating…" : result ? "Play again" : "Simulate match"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-[25px] flex items-center justify-center gap-[9px] font-mono text-[11px] leading-none tracking-[0.09em] text-note uppercase">
        <span className="size-1.5 rounded-full bg-lime shadow-[0_0_8px_var(--color-lime)]" />
        Poisson model · 1.576 expected goals per team
      </div>
    </section>
  );
}
