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
  { id: "m1", name: "Aarav Mehta", avatar: "AM", location: "Noida", bio: "Frontend engineer at a Noida startup. I teach React and clean UI the way I learned it — by shipping real projects.", rating: 4.9, reviews: 48, expertise: ["React", "TypeScript", "CSS"] },
  { id: "m2", name: "Ananya Sharma", avatar: "AS", location: "Greater Noida", bio: "Illustrator and brand designer. College fest posters to startup logos — Figma feels a lot less scary with me.", rating: 4.8, reviews: 31, expertise: ["Figma", "Branding", "Canva"] },
  { id: "m3", name: "Rohit Verma", avatar: "RV", location: "Delhi", bio: "Placement coach. Spoken English, group discussions and interview prep for campus placements — no textbook English, only confident English.", rating: 4.7, reviews: 62, expertise: ["Spoken English", "Group Discussion", "Interview Prep"] },
  { id: "m4", name: "Priya Nair", avatar: "PN", location: "Mumbai", bio: "Data scientist. Python, pandas and the stats you actually need — practised on Indian open-data projects.", rating: 5.0, reviews: 27, expertise: ["Python", "Data", "Machine Learning"] },
  { id: "m5", name: "Kavita Rawat", avatar: "KR", location: "Lucknow", bio: "Home cook turned teacher. Awadhi biryani, everyday thali and tiffin recipes that survive a hostel room.", rating: 4.6, reviews: 19, expertise: ["Indian Cooking", "Baking"] },
  { id: "m6", name: "Imran Qureshi", avatar: "IQ", location: "Jaipur", bio: "Tabla and guitar player, 12 years on stage. Bollywood rhythms to basic ragas, entirely at your pace.", rating: 4.9, reviews: 40, expertise: ["Tabla", "Guitar", "Music Theory"] },
];

const seedSkills: Skill[] = [
  { id: "s1", mentorId: "m1", title: "React from zero to shipping", description: "Components, state, hooks and a real mini-app built together in one weekend.", tags: ["Coding", "React", "Web"], level: "Beginner", availability: ["Mon", "Wed", "Sat"], mode: "Online" },
  { id: "s2", mentorId: "m1", title: "Advanced TypeScript patterns", description: "Generics, inference and types that make refactors painless.", tags: ["Coding", "TypeScript"], level: "Advanced", availability: ["Thu"], mode: "Online" },
  { id: "s3", mentorId: "m1", title: "Build your college fest website", description: "A live, responsive site for your fest or portfolio — hosted before the session ends.", tags: ["Coding", "Web", "Portfolio"], level: "Beginner", availability: ["Fri"], mode: "Online" },
  { id: "s4", mentorId: "m2", title: "Figma for non-designers", description: "Auto layout, components and wireframing in one session.", tags: ["Design", "Figma"], level: "Beginner", availability: ["Tue", "Fri"], mode: "Online" },
  { id: "s5", mentorId: "m2", title: "Poster & branding for college fests", description: "Logo, palette and type — a hands-on brand sprint for your event or startup.", tags: ["Design", "Branding"], level: "Intermediate", availability: ["Sat", "Sun"], mode: "Online" },
  { id: "s6", mentorId: "m3", title: "Spoken English: zero to confident", description: "Speak from minute one. Real topics, no textbook drills, no judgment on your accent.", tags: ["Language", "Communication"], level: "Beginner", availability: ["Mon", "Tue", "Thu"], mode: "Online" },
  { id: "s7", mentorId: "m3", title: "Crack the GD and interview round", description: "Mock group discussions and HR interviews with feedback you can use the same week.", tags: ["Placement", "Interviews"], level: "Intermediate", availability: ["Wed", "Sat"], mode: "In person" },
  { id: "s8", mentorId: "m4", title: "Data analysis with pandas", description: "Clean, explore and chart a real dataset end to end — IPL and census data included.", tags: ["Coding", "Data", "Python"], level: "Intermediate", availability: ["Wed", "Sun"], mode: "Online" },
  { id: "s9", mentorId: "m4", title: "Machine learning basics in Python", description: "From a trained model on your own laptop to a working notebook you can show in a viva.", tags: ["ML", "Python"], level: "Advanced", availability: ["Fri"], mode: "Online" },
  { id: "s10", mentorId: "m5", title: "Awadhi biryani and korma at home", description: "Dum, dum ki tehreek and the masalas that make Lucknow food Lucknow food.", tags: ["Cooking", "Indian Cooking"], level: "Beginner", availability: ["Sat"], mode: "In person" },
  { id: "s11", mentorId: "m5", title: "Everyday thali and hostel tiffin", description: "Five quick sabzi, roti that stays soft and a tiffin that survives till evening.", tags: ["Cooking", "Budget"], level: "Beginner", availability: ["Mon", "Wed"], mode: "Online" },
  { id: "s12", mentorId: "m6", title: "Tabla: rhythm from the basics", description: "Teentaal, keherwa and the hand position that fixes most beginner timing.", tags: ["Music", "Tabla"], level: "Beginner", availability: ["Tue", "Fri", "Sun"], mode: "In person" },
  { id: "s13", mentorId: "m6", title: "Guitar: Bollywood and indie songs", description: "Chords, strumming and the four progressions behind most songs you already know.", tags: ["Music", "Guitar"], level: "Beginner", availability: ["Tue", "Fri", "Sun"], mode: "Online" },
];

type State = { mentors: Mentor[]; skills: Skill[]; requests: SessionRequest[]; wants: WantRequest[] };
const KEY = "skill-exchange-v2";
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
      mentors = [...mentors, { id: ME_ID, name: name || "You", avatar: initials, location: "Greater Noida", bio: "New mentor on Skill Exchange — NIET College, Greater Noida.", rating: 5, reviews: 0, expertise: s.tags }];
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
