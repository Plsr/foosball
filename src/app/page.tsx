import { Simulator } from "./simulator";
import { TeamList } from "./team-list";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getHomePageData } from "@/data/services/home-page.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const result = await getHomePageData({ cookies: cookieStore.getAll() });

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

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
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-44 truncate text-muted normal-case min-[601px]:inline">
            {result.data.viewerName}
          </span>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="cursor-pointer rounded-full border border-line px-[11px] py-[7px] text-muted transition-colors hover:border-lime hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <Simulator />
      <TeamList teams={result.data.teams} />
      <footer className="text-center font-mono text-[10px] leading-none tracking-[0.08em] text-footer uppercase">
        Built to test the model, not predict the weekend.
      </footer>
    </main>
  );
}
