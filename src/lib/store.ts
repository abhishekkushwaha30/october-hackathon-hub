import { useSyncExternalStore } from "react";

export type Mentor = {
  id: string;
  name: string;
  avatar: string;
  location: string;
  bio: string;
  rating: number;
  reviews: number;
  expertise: string[];
};

export type Skill = {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  availability: string[]; // e.g. "Mon", "Wed"
  mode: "Online" | "In person";
};

export type SessionRequest = {
  id: string;
  skillId: string;
  mentorId: string;
  date: string;
  time: string;
  note: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
};

export type WantRequest = { id: string; topic: string; note: string; createdAt: number };

const seedMentors: Mentor[] = [
  { id: "m1", name: "Aarav Mehta", avatar: "AM", location: "Bengaluru", bio: "Frontend engineer who loves teaching React and the craft of clean UI.", rating: 4.9, reviews: 48, expertise: ["React", "TypeScript", "CSS"] },
  { id: "m2", name: "Sara Kim", avatar: "SK", location: "Seoul · Remote", bio: "Illustrator and brand designer. I make Figma feel less scary.", rating: 4.8, reviews: 31, expertise: ["Figma", "Branding", "Illustration"] },
  { id: "m3", name: "Diego Alvarez", avatar: "DA", location: "Madrid", bio: "Native Spanish speaker and conversation coach for busy people.", rating: 4.7, reviews: 62, expertise: ["Spanish", "Public speaking"] },
  { id: "m4", name: "Priya Nair", avatar: "PN", location: "Mumbai", bio: "Data scientist. Python, pandas and the stats you actually need.", rating: 5.0, reviews: 27, expertise: ["Python", "Data", "ML"] },
  { id: "m5", name: "Leo Laurent", avatar: "LL", location: "Lyon", bio: "Home cook turned pastry nerd. Sourdough is a lifestyle.", rating: 4.6, reviews: 19, expertise: ["Baking", "Cooking"] },
  { id: "m6", name: "Maya Osei", avatar: "MO", location: "Accra · Remote", bio: "Guitarist and music theory teacher, 12 years on stage.", rating: 4.9, reviews: 40, expertise: ["Guitar", "Music theory"] },
];

const seedSkills: Skill[] = [
  { id: "s1", mentorId: "m1", title: "React from zero to shipping", description: "Components, state, hooks and building a real mini-app together.", tags: ["Coding", "React", "Web"], level: "Beginner", availability: ["Mon", "Wed", "Sat"], mode: "Online" },
  { id: "s2", mentorId: "m1", title: "Advanced TypeScript patterns", description: "Generics, inference and types that make refactors painless.", tags: ["Coding", "TypeScript"], level: "Advanced", availability: ["Thu"], mode: "Online" },
  { id: "s3", mentorId: "m2", title: "Figma for non-designers", description: "Auto layout, components and wireframing in one session.", tags: ["Design", "Figma"], level: "Beginner", availability: ["Tue", "Fri"], mode: "Online" },
  { id: "s4", mentorId: "m2", title: "Build a personal brand identity", description: "Logo, palette and type — a hands-on brand sprint.", tags: ["Design", "Branding"], level: "Intermediate", availability: ["Sat", "Sun"], mode: "Online" },
  { id: "s5", mentorId: "m3", title: "Conversational Spanish", description: "Speak from minute one. Real topics, no textbook drills.", tags: ["Language", "Spanish"], level: "Beginner", availability: ["Mon", "Tue", "Thu"], mode: "Online" },
  { id: "s6", mentorId: "m4", title: "Data analysis with pandas", description: "Clean, explore and chart a real dataset end to end.", tags: ["Coding", "Data", "Python"], level: "Intermediate", availability: ["Wed", "Sun"], mode: "Online" },
  { id: "s7", mentorId: "m5", title: "Sourdough basics", description: "Starter care, shaping and baking your first loaf.", tags: ["Cooking", "Baking"], level: "Beginner", availability: ["Sat"], mode: "In person" },
  { id: "s8", mentorId: "m6", title: "Guitar: first 10 songs", description: "Chords, strumming and songs you will actually play.", tags: ["Music", "Guitar"], level: "Beginner", availability: ["Tue", "Fri", "Sun"], mode: "Online" },
];

type State = { mentors: Mentor[]; skills: Skill[]; requests: SessionRequest[]; wants: WantRequest[] };
const KEY = "skill-exchange-v1";
const initial: State = { mentors: seedMentors, skills: seedSkills, requests: [], wants: [] };
let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {}
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  load();
  listeners.add(l);
  l();
  return () => listeners.delete(l);
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

const uid = () => Math.random().toString(36).slice(2, 9);
export const ME_ID = "me";

export const actions = {
  requestSession(r: Omit<SessionRequest, "id" | "status" | "createdAt">) {
    set({ requests: [{ ...r, id: uid(), status: "pending", createdAt: Date.now() }, ...state.requests] });
  },
  setStatus(id: string, status: SessionRequest["status"]) {
    set({ requests: state.requests.map((r) => (r.id === id ? { ...r, status } : r)) });
  },
  cancel(id: string) {
    set({ requests: state.requests.filter((r) => r.id !== id) });
  },
  offerSkill(s: Omit<Skill, "id" | "mentorId">, name: string) {
    let mentors = state.mentors;
    if (!mentors.find((m) => m.id === ME_ID)) {
      const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "ME";
      mentors = [...mentors, { id: ME_ID, name: name || "You", avatar: initials, location: "Your city", bio: "New mentor on Skill Exchange.", rating: 5, reviews: 0, expertise: s.tags }];
    }
    set({ mentors, skills: [{ ...s, id: uid(), mentorId: ME_ID }, ...state.skills] });
  },
  addWant(topic: string, note: string) {
    set({ wants: [{ id: uid(), topic, note, createdAt: Date.now() }, ...state.wants] });
  },
  removeWant(id: string) {
    set({ wants: state.wants.filter((w) => w.id !== id) });
  },
};
