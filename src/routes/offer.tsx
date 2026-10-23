import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { actions, type Skill } from "@/lib/store";

export const Route = createFileRoute("/offer")({
  head: () => ({
    meta: [
      { title: "Offer or request a skill — Skill Exchange" },
      { name: "description", content: "List a skill you can teach or post something you want to learn." },
      { property: "og:title", content: "Offer a skill — Skill Exchange" },
      { property: "og:description", content: "Share what you know or ask for what you want to learn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Offer,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Offer() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [level, setLevel] = useState<Skill["level"]>("Beginner");
  const [mode, setMode] = useState<Skill["mode"]>("Online");
  const [availability, setAvailability] = useState<string[]>(["Sat"]);
  const [want, setWant] = useState("");
  const [wantNote, setWantNote] = useState("");

  const label = "text-xs font-bold uppercase tracking-widest text-muted-foreground";
  const ok = title && description && availability.length;

  return (
    <Shell>
      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <p className="eyebrow">Offer what you know</p>
          <h1 className="mt-2 font-display text-6xl">List a skill</h1>
          <div className="mt-6 space-y-4">
            <div><p className={label}>Your name</p><input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Abhishek Kushwaha" /></div>
            <div><p className={label}>Skill title</p><input className="field mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spoken English for interviews" /></div>
            <div><p className={label}>Description</p><textarea className="field mt-1 min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><p className={label}>Tags (comma separated)</p><input className="field mt-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Coding, Placement, Music" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className={label}>Level</p>
                <select className="field mt-1" value={level} onChange={(e) => setLevel(e.target.value as Skill["level"])}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select></div>
              <div><p className={label}>Mode</p>
                <select className="field mt-1" value={mode} onChange={(e) => setMode(e.target.value as Skill["mode"])}>
                  <option>Online</option><option>In person</option>
                </select></div>
            </div>
            <div><p className={label}>Availability</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = availability.includes(d);
                  return <button key={d} onClick={() => setAvailability(on ? availability.filter((x) => x !== d) : [...availability, d])}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{d}</button>;
                })}
              </div></div>
            <button disabled={!ok} className="btn bg-accent text-accent-foreground disabled:opacity-40"
              onClick={() => {
                actions.offerSkill({ title, description, level, mode, availability, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }, name);
                navigate({ to: "/" });
              }}>Publish skill ↗</button>
          </div>
        </section>
        <section className="h-fit rounded-xl border border-border bg-card p-6">
          <p className="eyebrow">Want to learn?</p>
          <h2 className="mt-2 font-display text-5xl">Request a skill</h2>
          <p className="mt-2 text-sm text-muted-foreground">Post what you're looking for — it'll show on your dashboard.</p>
          <div className="mt-5 space-y-4">
            <input className="field" value={want} onChange={(e) => setWant(e.target.value)} placeholder="e.g. Stock market and SIP basics" />
            <textarea className="field min-h-20" value={wantNote} onChange={(e) => setWantNote(e.target.value)} placeholder="Your goals, schedule…" />
            <button disabled={!want} className="btn border border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
              onClick={() => { actions.addWant(want, wantNote); navigate({ to: "/dashboard" }); }}>Post request</button>
          </div>
        </section>
      </div>
    </Shell>
  );
}
