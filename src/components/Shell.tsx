import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore, ME_ID } from "@/lib/store";

export function Shell({ children }: { children: ReactNode }) {
  const { requests } = useStore();
  const pending = requests.filter((r) => r.status === "pending").length;
  const nav = "text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors";
  const active = { className: "text-sm font-semibold text-primary" };
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary">
              <span className="h-3.5 w-3.5 border-2 border-primary-foreground" />
            </span>
            <span className="font-display text-2xl tracking-wide">Skill Exchange</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className={nav} activeProps={active} activeOptions={{ exact: true }}>Browse</Link>
            <Link to="/offer" className={nav} activeProps={active}>Offer a skill</Link>
            <Link to="/dashboard" className={nav} activeProps={active}>
              Dashboard
              {pending > 0 && <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">{pending}</span>}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built for Code Catalyst Hackathon · 23 Oct 2026
      </footer>
    </div>
  );
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  const s = size === "lg" ? "h-20 w-20 text-3xl" : "h-11 w-11 text-lg";
  return <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-display text-primary ${s}`}>{initials}</span>;
}

export function Stars({ rating }: { rating: number }) {
  return <span className="text-sm font-bold text-primary">★ {rating.toFixed(1)}</span>;
}

export { ME_ID };
