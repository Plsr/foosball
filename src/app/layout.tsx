import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Simulator",
  description: "A simple Bundesliga match simulation proof of concept.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body className="bg-night bg-pitch-glow font-sans text-ink before:pointer-events-none before:fixed before:inset-0 before:bg-grid before:bg-[size:42px_42px] before:opacity-[0.22] before:content-['']">
        {children}
      </body>
    </html>
  );
}
