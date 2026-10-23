import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Avatar } from "@/components/Shell";
import { actions, useStore, ME_ID } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — Skill Exchange" },
      { name: "description", content: "Your session requests, upcoming exchanges and learning wishlist." },
      { property: "og:title", content: "My dashboard — Skill Exchange" },
      { property: "og:description", content: "Track requests and upcoming learning sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { requests, skills, mentors, wants } = useStore();
  const enrich = (r: (typeof requests)[number]) => ({ r, s: skills.find((x) => x.id === r.skillId), m: mentors.find((x) => x.id === r.mentorId) });
  const upcoming = requests.filter((r) => r.status === "accepted").map(enrich).sort((a, b) => (a.r.date + a.r.time).localeCompare(b.r.date + b.r.time));
  const pending = requests.filter((r) => r.status === "pending").map(enrich);
  const declined = requests.filter((r) => r.status === "declined").map(enrich);
  const mySkills = skills.filter((s) => s.mentorId === ME_ID);
  const fmt = (d: string) => new Date(d + "T00:00").toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" });

  const stat = (n: number, l: string) => (
    <div className="rounded-xl border border-border bg-card p-5"><div className="font-display text-5xl text-primary">{n}</div><div className="eyebrow">{l}</div></div>
  );

  const Row = ({ r, s, m }: ReturnType<typeof enrich>) => (
    <div className="flex flex-wrap items-center gap-4 border-b border-border py-4">
      {m && <Avatar initials={m.avatar} />}
      <div className="min-w-48 flex-1">
        <div className="font-bold">{s?.title}</div>
        <div className="text-sm text-muted-foreground">with {m?.name} · {fmt(r.date)} at {r.time}</div>
        {r.note && <div className="mt-1 text-xs italic text-muted-foreground">"{r.note}"</div>}
      </div>
      {r.status === "pending" && (
        <div className="flex gap-2">
          <button className="btn bg-success text-primary-foreground" onClick={() => actions.setStatus(r.id, "accepted")} title="Simulate mentor accepting">Accept</button>
          <button className="btn border border-border" onClick={() => actions.setStatus(r.id, "declined")}>Decline</button>
        </div>
      )}
      {r.status === "accepted" && <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">Confirmed</span>}
      {r.status === "declined" && <span className="rounded-full bg-destructive/20 px-3 py-1 text-xs font-bold text-destructive">Declined</span>}
      <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => actions.cancel(r.id)}>Remove</button>
    </div>
  );

  return (
    <Shell>
      <p className="eyebrow">Personal dashboard</p>
      <h1 className="mt-2 font-display text-7xl">Your exchanges</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stat(upcoming.length, "Upcoming")}{stat(pending.length, "Pending")}{stat(mySkills.length, "Skills offered")}{stat(wants.length, "Want to learn")}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Upcoming sessions</h2>
        {upcoming.length ? upcoming.map((x) => <Row key={x.r.id} {...x} />) : <p className="mt-2 text-sm text-muted-foreground">No confirmed sessions yet.</p>}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Pending requests</h2>
        <p className="text-xs text-muted-foreground">Demo: accept or decline on the mentor's behalf.</p>
        {pending.length ? pending.map((x) => <Row key={x.r.id} {...x} />) : (
          <p className="mt-2 text-sm text-muted-foreground">Nothing pending. <Link to="/" className="text-primary">Find a skill →</Link></p>
        )}
        {declined.map((x) => <Row key={x.r.id} {...x} />)}
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="font-display text-3xl">Skills you offer</h2>
          {mySkills.length ? mySkills.map((s) => (
            <div key={s.id} className="border-b border-border py-3"><div className="font-bold">{s.title}</div><div className="text-xs text-muted-foreground">{s.availability.join(", ")} · {s.mode}</div></div>
          )) : <p className="mt-2 text-sm text-muted-foreground">None yet. <Link to="/offer" className="text-primary">Offer one →</Link></p>}
        </section>
        <section>
          <h2 className="font-display text-3xl">Want to learn</h2>
          {wants.length ? wants.map((w) => (
            <div key={w.id} className="flex items-start justify-between border-b border-border py-3">
              <div><div className="font-bold">{w.topic}</div>{w.note && <div className="text-xs text-muted-foreground">{w.note}</div>}</div>
              <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => actions.removeWant(w.id)}>Remove</button>
            </div>
          )) : <p className="mt-2 text-sm text-muted-foreground">Post a learning request on the <Link to="/offer" className="text-primary">offer page</Link>.</p>}
        </section>
      </div>
    </Shell>
  );
}
