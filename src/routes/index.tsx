import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Avatar, Stars } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skill Exchange — Teach what you know, learn what you love" },
      { name: "description", content: "Peer-to-peer skill exchange: browse skills, meet mentors and book learning sessions." },
      { property: "og:title", content: "Skill Exchange" },
      { property: "og:description", content: "Browse skills, meet mentors and book peer learning sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Browse,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Browse() {
  const { skills, mentors } = useStore();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const tags = useMemo(() => Array.from(new Set(skills.flatMap((s) => s.tags))).sort(), [skills]);

  const results = skills.filter((s) => {
    const m = mentors.find((x) => x.id === s.mentorId);
    const text = `${s.title} ${s.description} ${s.tags.join(" ")} ${m?.name}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!tag || s.tags.includes(tag)) && (!day || s.availability.includes(day));
  });

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`;

  return (
    <Shell>
      <section className="border-b border-border pb-10">
        <p className="eyebrow">Peer to peer learning</p>
        <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">
          Teach what you know.<br /><span className="text-primary">Learn what you love.</span>
        </h1>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input className="field md:max-w-md" placeholder="Search skills, topics or mentors…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Link to="/offer" className="btn bg-accent text-accent-foreground hover:opacity-90">Offer a skill ↗</Link>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Tags</span>
          <button className={chip(!tag)} onClick={() => setTag(null)}>All</button>
          {tags.map((t) => <button key={t} className={chip(tag === t)} onClick={() => setTag(tag === t ? null : t)}>{t}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Available</span>
          <button className={chip(!day)} onClick={() => setDay(null)}>Any day</button>
          {DAYS.map((d) => <button key={d} className={chip(day === d)} onClick={() => setDay(day === d ? null : d)}>{d}</button>)}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">{results.length} skills</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((s, i) => {
          const m = mentors.find((x) => x.id === s.mentorId)!;
          return (
            <Link key={s.id} to="/mentors/$id" params={{ id: m.id }} search={{ skill: s.id }}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xs font-semibold text-muted-foreground">{s.level} · {s.mode}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-primary">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.tags.map((t) => <span key={t} className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{t}</span>)}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Available: {s.availability.join(", ")}</div>
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <Avatar initials={m.avatar} />
                <div className="flex-1">
                  <div className="text-sm font-bold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.location}</div>
                </div>
                <Stars rating={m.rating} />
              </div>
            </Link>
          );
        })}
        {results.length === 0 && <p className="text-muted-foreground">No skills match. Try another search.</p>}
      </div>
    </Shell>
  );
}
