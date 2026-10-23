import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Avatar, Stars } from "@/components/Shell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/mentors/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ skill: typeof s.skill === "string" ? s.skill : undefined }),
  head: () => ({
    meta: [
      { title: "Mentor profile — Skill Exchange" },
      { name: "description", content: "Mentor expertise, ratings, skills offered and session booking." },
      { property: "og:title", content: "Mentor profile — Skill Exchange" },
      { property: "og:description", content: "See expertise and ratings, then request a learning session." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MentorPage,
});

const DAY_IDX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const TIMES = ["09:00", "11:00", "14:00", "16:00", "18:00", "20:00"];

function nextDates(days: string[], count = 8) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 1; out.length < count && i < 60; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    if (days.some((k) => DAY_IDX[k] === x.getDay())) out.push(x);
  }
  return out;
}

function MentorPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { mentors, skills } = useStore();
  const navigate = useNavigate();
  const mentor = mentors.find((m) => m.id === id);
  const mine = skills.filter((s) => s.mentorId === id);
  const [skillId, setSkillId] = useState(search.skill ?? mine[0]?.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  if (!mentor) return <Shell><p>Mentor not found. <Link to="/" className="text-primary">Back</Link></p></Shell>;
  const skill = mine.find((s) => s.id === skillId) ?? mine[0];
  const dates = skill ? nextDates(skill.availability) : [];

  const submit = () => {
    if (!skill || !date || !time) return;
    actions.requestSession({ skillId: skill.id, mentorId: mentor.id, date, time, note });
    navigate({ to: "/dashboard" });
  };

  return (
    <Shell>
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← All skills</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="flex items-center gap-5">
            <Avatar initials={mentor.avatar} size="lg" />
            <div>
              <p className="eyebrow">Mentor</p>
              <h1 className="font-display text-6xl leading-none">{mentor.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <Stars rating={mentor.rating} /> <span>{mentor.reviews} reviews</span> · <span>{mentor.location}</span>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{mentor.bio}</p>
          <p className="eyebrow mt-8">Expertise</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mentor.expertise.map((e) => <span key={e} className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">{e}</span>)}
          </div>
          <p className="eyebrow mt-10">Skills offered</p>
          <div className="mt-3 divide-y divide-border border-y border-border">
            {mine.map((s, i) => (
              <button key={s.id} onClick={() => { setSkillId(s.id); setDate(""); }}
                className={`flex w-full items-start gap-4 py-4 text-left ${s.id === skill?.id ? "text-primary" : ""}`}>
                <span className="font-display text-xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block font-bold">{s.title}</span>
                  <span className="block text-sm text-muted-foreground">{s.description}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{s.level} · {s.mode} · {s.availability.join(", ")}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Request a session</p>
          <h2 className="mt-2 font-display text-3xl">{skill?.title ?? "No skills yet"}</h2>
          {skill && (
            <>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Pick a date</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {dates.map((d) => {
                  const v = d.toISOString().slice(0, 10);
                  const on = date === v;
                  return (
                    <button key={v} onClick={() => setDate(v)}
                      className={`rounded-md border p-2 text-center ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                      <div className="text-[10px] font-bold uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</div>
                      <div className="font-display text-xl">{d.getDate()}</div>
                      <div className="text-[10px]">{d.toLocaleDateString("en", { month: "short" })}</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Pick a time</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TIMES.map((t) => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`rounded-md border py-2 text-sm font-semibold ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{t}</button>
                ))}
              </div>
              <textarea className="field mt-5 min-h-24" placeholder="What would you like to learn?" value={note} onChange={(e) => setNote(e.target.value)} />
              <button onClick={submit} disabled={!date || !time}
                className="btn mt-4 w-full bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40">Send request ↗</button>
            </>
          )}
        </aside>
      </div>
    </Shell>
  );
}
