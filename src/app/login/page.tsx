import { getLoginPageData } from "@/data/services/login-page.service";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const data = getLoginPageData(await searchParams);

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-10">
      <section
        className="w-full max-w-[470px] rounded-sm border border-line bg-night/90 p-7 shadow-2xl backdrop-blur min-[601px]:p-10"
        aria-labelledby="login-title"
      >
        <div className="mb-10 flex items-center gap-3 text-xs tracking-[0.12em] uppercase">
          <span className="grid size-[34px] -skew-x-[8deg] place-items-center bg-lime font-black tracking-[-0.05em] text-night">
            FS
          </span>
          <span className="font-extrabold">Football Simulator</span>
        </div>

        <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-lime uppercase">
          Manager access
        </p>
        <h1
          id="login-title"
          className="mt-4 text-[clamp(36px,8vw,52px)] leading-[0.98] font-bold tracking-[-0.05em]"
        >
          Enter the dugout.
        </h1>
        <p className="mt-5 text-[16px] leading-7 text-muted">
          Sign in with GitHub to start building your football story.
        </p>

        {data.errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-sm border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100"
          >
            {data.errorMessage}
          </p>
        ) : null}

        <form action={data.signInAction} method="post" className="mt-8">
          <button
            type="submit"
            disabled={!data.configured}
            className="flex w-full cursor-pointer items-center justify-between rounded-sm bg-lime px-5 py-[18px] text-[15px] font-extrabold text-night transition-[transform,box-shadow] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_9px_28px_rgba(200,255,70,0.16)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
          >
            <span className="flex items-center gap-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 fill-current"
              >
                <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.94 10.94 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
              </svg>
              Continue with GitHub
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="mt-6 font-mono text-[10px] leading-5 tracking-[0.08em] text-note uppercase">
          Authentication is handled by Supabase. We never receive your GitHub password.
        </p>
      </section>
    </main>
  );
}
