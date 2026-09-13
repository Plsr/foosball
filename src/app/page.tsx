import { Simulator } from "./simulator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-5 pt-7 pb-6 min-[601px]:px-[5vw]">
      <nav
        className="flex items-center gap-3 text-xs tracking-[0.12em] uppercase"
        aria-label="Main navigation"
      >
        <span className="grid size-[34px] -skew-x-[8deg] place-items-center bg-lime font-black tracking-[-0.05em] text-night">
          FS
        </span>
        <span className="hidden font-extrabold min-[601px]:inline">
          Football Simulator
        </span>
        <span className="ml-auto rounded-full border border-line px-[11px] py-[7px] text-muted">
          Prototype
        </span>
      </nav>
      <Simulator />
      <footer className="text-center font-mono text-[10px] leading-none tracking-[0.08em] text-footer uppercase">
        Built to test the model, not predict the weekend.
      </footer>
    </main>
  );
}
