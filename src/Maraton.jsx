import { useEffect, useState } from "react";
import "./Maraton.css";

// Skrytá stránka s tréningovým plánom na Pražský maratón: /#maraton
// Všetko sa upravuje v dátach nižšie – stránka sa prekreslí sama.
//
// Dáta z hodiniek: python3 scripts/health-import.py ~/Downloads/export.zip
// zapíše src/maraton-data.json. Stránka si z nich sama spočíta skutočné km,
// formu a odporúčania. Bez súboru sa ukáže len plán.
const DATA =
  Object.values(import.meta.glob("./maraton-data.json", { eager: true, import: "default" }))[0] ?? null;

const PLAN_START = "2026-10-12";
// Od tohto dňa sa dáta z hodiniek rátajú do prípravy (týždeň pred plánom sa už behalo viac).
const PREP_START = "2026-10-05";
const RACE_DAY = "2027-05-02";

const PHASES = [
  { id: "base", name: "Základná", weeks: [1, 12], color: "#C4956A", text: "Objem 20 → 36 km, dlhý beh do 17 km. Len ľahké behy, strides a fartlek. Okolo svadby a v Peru zámerne menej, po návrate pokojný nábeh." },
  { id: "build", name: "Rozvojová", weeks: [13, 20], color: "#B8623E", text: "Objem 40 → 52 km, dlhý beh 18 → 27 km, tempo behy a intervaly. Zima: vrstvy, reflexné prvky, bezpečné trasy." },
  { id: "spec", name: "Špecifická", weeks: [21, 26], color: "#7A4028", text: "Objem 55 → 62 km, najdlhšie behy 30–32 km, bloky v maratónskom tempe, testovací polmaratón." },
  { id: "taper", name: "Tapering", weeks: [27, 29], color: "#6E8B5E", text: "Objem postupne klesá, svieže nohy aj hlava." },
];

// Plán upravený 16. 10. 2026 podľa dát z hodiniek: štart z reálnych ~17 km/týždeň
// (pôvodne 18), menej okolo svadby a v Peru, potom plynulý nábeh do vrcholu 62 km.
// [objem km, dlhý beh km, kľúčový tréning, odľahčovací týždeň]
const WEEKS = [
  [20, 10, "Ľahké behy podľa tepu (do 145), spoznaj tempo"],
  [25, 12, "+ 4 × 20 s strides po ľahkom behu"],
  [18, 10, "Svadobný týždeň: 2–3 ľahké behy, nič viac", true],
  [28, 14, "Fartlek 6 × 1 min svižne"],
  [32, 15, "Pridaj sobotný ľahký beh (5 km)"],
  [35, 16, "Fartlek 8 × 1 min"],
  [24, 12, "Dlhý beh už vo štvrtok, v piatok odlet do Peru", true],
  [12, null, "Peru: výška 2 400–3 400 m, 2–3 krátke ľahké behy, turistika sa počíta", true],
  [15, null, "Peru: ľahké behy v Arequipe a Lime, v sobotu návrat", true],
  [30, 14, "Návrat z výšky: len ľahké behy, telo sa prestavuje"],
  [36, 17, "Fartlek 6 × 2 min"],
  [32, 15, "Sviatky, uvoľni sa", true],
  [40, 18, "Tempo 2 × 10 min"],
  [42, 20, "Tempo 3 × 8 min"],
  [45, 21, "Intervaly 5 × 1 km"],
  [36, 16, "Odľahčenie", true],
  [47, 23, "Tempo 25–30 min súvisle"],
  [50, 25, "Intervaly 6 × 1 km"],
  [40, 18, "Odľahčenie", true],
  [52, 27, "Posledných 5 km dlhého behu v MP"],
  [55, 29, "Dlhý beh: 8 km v MP"],
  [57, 30, "Intervaly 5 × 1,5 km"],
  [44, 21, "Testovací polmaratón → podľa neho spresníme cieľ a tempá", true],
  [60, 32, "Najdlhší beh, posledná tretina v MP"],
  [62, 28, "Dlhý beh: 12 km v MP"],
  [60, 32, "Posledný veľký týždeň, generálka"],
  [46, 22, "Tapering: tempo 2 × 10 min"],
  [34, 14, "Tapering: 5 km v MP"],
  [20, null, "Pár krátkych behov so strides, maratón v nedeľu"],
].map(([km, long, key, easy], i) => ({
  n: i + 1,
  start: addDays(PLAN_START, i * 7),
  km,
  long,
  key,
  easy: !!easy,
  phase: PHASES.find((p) => i + 1 >= p.weeks[0] && i + 1 <= p.weeks[1]),
}));

// Udalosti, ktoré padnú do plánu – v grafe sú vyznačené nad stĺpcami.
const EVENTS = [
  { label: "Svadba", from: "2026-10-30", to: "2026-10-30", note: "svadobný týždeň, behaj len na pohodu" },
  { label: "Peru", from: "2026-11-27", to: "2026-12-13", note: "nadmorská výška: tep bude vyšší, tempo pomalšie, riaď sa pocitom" },
  { label: "Polmaratón", from: "2027-03-15", to: "2027-03-21" },
];

// Tempá v sekundách na km (od – do), tep v % maxima.
const PACES = [
  { name: "Ľahký / dlhý beh", from: 370, to: 400, hr: [0, 0.77], color: "#6E8B5E", feel: "Dá sa rozprávať v celých vetách" },
  { name: "Maratónske tempo (MP)", from: 330, to: 340, hr: [0.82, 0.86], color: "#C4956A", feel: "Kontrolované, udržateľné hodiny" },
  { name: "Tempo beh (prah)", from: 300, to: 310, hr: [0.87, 0.91], color: "#B8623E", feel: "„Komfortne ťažké“, 20–40 min" },
  { name: "Intervaly (1 km)", from: 280, to: 290, hr: [0.92, 0.97], color: "#7A4028", feel: "Ťažké, ale technicky čisté" },
];
const HR_MAX = DATA?.hrMax ?? 188;
const EASY_HR = Math.round(HR_MAX * 0.77);

// Fitko podľa fázy. Pondelok = nohy + core, piatok = celé telo ľahšie.
const GYM = {
  base: {
    mon: { min: "40–45 min", items: ["Drep 3 × 10", "Rumunský mŕtvy ťah 3 × 10", "Výpady 3 × 8 / noha", "Mostík 3 × 12", "Výpony lýtok 3 × 15", "Plank 3 × 40 s, bird-dog 3 × 8, Pallof press 3 × 10"] },
    fri: { min: "30–40 min", items: ["Kliky alebo tlak s jednoručkami 3 × 10", "Príťahy / veslovanie 3 × 10", "Bulharský drep 2 × 8 / noha", "Bočný plank 3 × 30 s", "Mŕtvy chrobák 3 × 10"] },
    note: "Ľahšie váhy, technika. Po fitku sa má dať v utorok normálne behať.",
  },
  build: {
    mon: { min: "45 min", items: ["Drep 4 × 6 (ťažšie)", "Rumunský mŕtvy ťah 4 × 6", "Výstup na lavičku 3 × 8 / noha", "Jednonožné výpony lýtok 3 × 12", "Copenhagen plank 3 × 20 s", "Pallof press 3 × 10"] },
    fri: { min: "30 min", items: ["Tlak + príťah 3 × 8", "Jednonožný RDL 3 × 8", "Bočný plank 3 × 40 s", "Mobilita bokov 5 min"] },
    note: "Ťažšie, ale málo opakovaní. Nikdy nie do zlyhania, nohy potrebujú štvrtkový kvalitný beh.",
  },
  spec: {
    mon: { min: "35 min", items: ["Drep 3 × 5", "Rumunský mŕtvy ťah 3 × 5", "Jednonožné výpony lýtok 2 × 12", "Core 10 min"] },
    fri: { min: "20–25 min alebo voľno", items: ["Core a stabilizácia bokov", "Mobilita"] },
    note: "Len udržiavanie sily. Ak je týždeň ťažký, piatok vynechaj.",
  },
  taper: {
    mon: { min: "25 min", items: ["Drep 2 × 5 ľahko", "Mostík 2 × 10", "Core 10 min"] },
    fri: { min: "voľno alebo 15 min mobility", items: ["Mobilita", "Bez záťaže nôh"] },
    note: "Posledný týždeň pred maratónom bez fitka. Žiadne nové cviky.",
  },
};

const DAY_NAMES = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
// type: run | long | quality | gym | swim | rest
const WEEK_BASE = [
  { type: "gym", text: "Fitko (nohy + core)" },
  { type: "run", text: "Ľahký beh" },
  { type: "swim", text: "Plávanie alebo voľno" },
  { type: "quality", text: "Strides / fartlek" },
  { type: "gym", text: "Fitko ľahšie alebo voľno" },
  { type: "rest", text: "Voľno (od T5 ľahký krátky beh)" },
  { type: "long", text: "Dlhý beh" },
];
const WEEK_BUILD = [
  { type: "gym", text: "Fitko (nohy + core)" },
  { type: "run", text: "Ľahký beh" },
  { type: "swim", text: "Plávanie alebo voľno" },
  { type: "quality", text: "Tempo, intervaly, MP" },
  { type: "gym", text: "Fitko ľahšie alebo voľno" },
  { type: "run", text: "Ľahký krátky beh" },
  { type: "long", text: "Dlhý beh" },
];
const TYPE_LABEL = {
  run: "Ľahký beh",
  long: "Dlhý beh",
  quality: "Kvalita",
  gym: "Fitko",
  swim: "Plávanie",
  rest: "Voľno",
};

const WEEK1 = [
  { date: "2026-10-12", title: "Fitko, 40 min", text: "Drepy, výpady, rumunský mŕtvy ťah, mostíky, lýtka (2–3 série po 10–12, ľahšie váhy). Core: plank, bird-dog, Pallof press. Na konci 5 min naťahovanie." },
  { date: "2026-10-13", title: "Ľahký beh 5 km", text: "5 min svižná chôdza, potom 5 km v ľahkom tempe. Pri únave krátko prejdi do chôdze, nie je to chyba. Po behu 5–10 min mobility." },
  { date: "2026-10-14", title: "Plávanie alebo voľno", text: "30 min voľne v pokojnom tempe. Ak si unavený po fitku a behu, daj voľno." },
  { date: "2026-10-15", title: "Ľahký beh 5 km", text: "Rovnaké tempo ako v utorok. Posledný kilometer môže byť živší (cca 6:00–6:10)." },
  { date: "2026-10-16", title: "Fitko 30–40 min alebo voľno", text: "Celé telo bez zaťaženia nôh: tlaky, ťahy, core, stabilizácia bokov. Ak sú nohy ťažké, nohy vynechaj." },
  { date: "2026-10-17", title: "Voľno alebo prechádzka", text: "V základnej fáze sobota bez behu. Prechádzka alebo ľahká turistika 45–60 min je v poriadku." },
  { date: "2026-10-18", title: "Dlhý beh 8 km", text: "Veľmi pomaly (6:30–6:50). Po 2 km skontroluj, že sa dá rozprávať. Potom 10 min chôdze, jedlo a pitie do hodiny." },
];

const RULES = [
  ["Zvyšuj postupne", "Týždenný nárast max ~10 %, každý 4. týždeň odľahči."],
  ["Ľahké dni sú ľahké", "Väčšina objemu v pohodovom tempe. Na tom stojí celý plán."],
  ["Spánok je tréning", "Spánok a regenerácia sú súčasť tréningu."],
  ["Bolesť ≠ únava", "Únava je v poriadku, ostrá alebo pretrvávajúca bolesť nie. Vtedy vynechaj a pozri sa na to."],
  ["Choroba", "Pri teplote nebehaj. Po uzdravení pokračuj od aktuálneho týždňa, nedobiehaj."],
  ["Návod, nie zákon", "Ak vynecháš týždeň, jednoducho pokračuj, nič sa nedeje."],
];

const HISTORY_SECTIONS = [
  ["roky", "Roky"],
  ["mesiace", "Mesiace"],
  ["tep", "Tempo a tep"],
  ["zdravie", "Zdravie"],
  ["zaznamy", "Všetky behy"],
];

const SECTIONS = [
  ["teraz", "Teraz"],
  ["forma", "Forma"],
  ["objem", "Objem"],
  ["fazy", "Fázy"],
  ["tempa", "Tempá"],
  ["tyzden", "Týždeň"],
  ["plan", "Plán"],
  ["den-d", "Deň D"],
  ["zasady", "Zásady"],
];

/* ─── Pomocné ─── */
function addDays(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function toISO(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
}

function fmtDate(iso) {
  const [, m, d] = iso.split("-");
  return `${+d}. ${+m}.`;
}

function fmtPace(sec) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function fmtTime(sec) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function fmtKm(km) {
  return (Math.round(km * 10) / 10).toLocaleString("sk-SK");
}

function plural(n, one, few, many) {
  return n === 1 ? one : n > 1 && n < 5 ? few : many;
}

function weekOf(iso) {
  const i = Math.floor(daysBetween(PLAN_START, iso) / 7);
  return i >= 0 && i < WEEKS.length ? WEEKS[i] : null;
}

function avg(xs) {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
}

// priemer metriky za dni [from, to)
function metricAvg(series, from, to) {
  return avg((series ?? []).filter(([d]) => d >= from && d < to).map(([, v]) => v));
}

/* ─── Dáta z hodiniek ─── */
// Behy pomalšie ako 8:30/km sú skôr turistika v teréne – do km sa rátajú, do tempa nie.
const RUNS = (DATA?.runs ?? []).map((r) => ({ ...r, pace: (r.min * 60) / r.km }));
const isRoadRun = (r) => r.pace < 510;

WEEKS.forEach((w) => {
  const end = addDays(w.start, 7);
  const runs = RUNS.filter((r) => r.d >= w.start && r.d < end);
  w.runs = runs;
  w.actual = DATA && w.start <= DATA.lastWorkout ? Math.round(runs.reduce((s, r) => s + r.km, 0) * 10) / 10 : null;
  w.actualLong = runs.length ? Math.max(...runs.map((r) => r.km)) : null;
});

// Polmaratóny: 20,8–21,8 km v cestnom tempe. Čas sa berie z hodiniek.
const HALVES = RUNS.filter((r) => r.km >= 20.8 && r.km <= 21.8 && r.pace < 360).map((r) => ({ d: r.d, time: r.min * 60, hr: r.hr }));
const HM_BEST = HALVES.length ? HALVES.reduce((a, b) => (b.time < a.time ? b : a)) : { d: "2025-04-19", time: 6594 };
const HM_BEST_PACE = HM_BEST.time / 21.0975;
// Riegel: T2 = T1 × (D2/D1)^1.06
const MARATHON_PRED = HM_BEST.time * Math.pow(2, 1.06);

/* ─── Stránka ─── */
const MODE_KEY = "maraton-mode";

function readMode() {
  try {
    return localStorage.getItem(MODE_KEY) === "history" ? "history" : "prep";
  } catch {
    return "prep";
  }
}

export default function Maraton() {
  const today = toISO(new Date());
  const current = weekOf(today);
  const [selected, setSelected] = useState(current ? current.n : 1);
  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    document.title = "Praha 2027 — maratón";
    window.scrollTo(0, 0);
    return () => {
      document.title = "Svadba — Eva & Michal";
    };
  }, []);

  function switchMode(m) {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // bez localStorage sa režim len nezapamätá
    }
    window.scrollTo(0, 0);
  }

  return (
    <div className="mar">
      <Header today={today} current={current} mode={mode} />
      <Nav mode={mode} onMode={switchMode} />
      <main className="mar-main">
        {mode === "prep" ? (
          <>
            <Now today={today} current={current} />
            <Form />
            <Volume current={current} selected={selected} onSelect={setSelected} />
            <Phases />
            <Paces />
            <WeekStructure today={today} current={current} />
            <Plan current={current} />
            <RaceDay />
            <Rules />
          </>
        ) : (
          <History />
        )}
        <a className="mar-back" href="#">← späť na svadobnú stránku</a>
      </main>
    </div>
  );
}

function Header({ today, current, mode }) {
  if (mode === "history") {
    const km = RUNS.reduce((s, r) => s + r.km, 0);
    const first = RUNS[0]?.d;
    return (
      <header className="mar-hero">
        <p className="mar-eyebrow">Bežecký archív</p>
        <h1 className="mar-title">História</h1>
        <p className="mar-dates">{first ? `od ${fmtDate(first)} ${first.slice(0, 4)}` : "zatiaľ bez dát"}</p>
        <p className="mar-sub">všetko, čo hodinky kedy zaznamenali</p>
        <span className="mar-badge">{RUNS.length} {plural(RUNS.length, "beh", "behy", "behov")} · {Math.round(km).toLocaleString("sk-SK")} km</span>
        <svg className="mar-mtn" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,120 L180,60 L300,100 L470,30 L620,95 L780,50 L940,110 L1100,40 L1260,95 L1440,60 L1440,160 L0,160 Z" />
          <path d="M0,145 L220,105 L420,140 L640,95 L860,138 L1080,100 L1300,135 L1440,110 L1440,160 L0,160 Z" />
        </svg>
      </header>
    );
  }

  const toRace = daysBetween(today, RACE_DAY);
  let badge;
  if (daysBetween(today, PLAN_START) > 0) badge = "plán ešte nezačal";
  else if (toRace > 0) badge = `týždeň ${current.n} z ${WEEKS.length} · do štartu ${toRace} ${plural(toRace, "deň", "dni", "dní")}`;
  else if (toRace === 0) badge = "dnes je to tu! 🏃";
  else badge = "maratónec ♥";

  return (
    <header className="mar-hero">
      <p className="mar-eyebrow">Prvý maratón</p>
      <h1 className="mar-title">Praha</h1>
      <p className="mar-dates">12. októbra 2026 – 2. mája 2027</p>
      <p className="mar-sub">29 týždňov · cieľ 3:50 – 4:00</p>
      <span className="mar-badge">{badge}</span>
      <svg className="mar-mtn" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,120 L180,60 L300,100 L470,30 L620,95 L780,50 L940,110 L1100,40 L1260,95 L1440,60 L1440,160 L0,160 Z" />
        <path d="M0,145 L220,105 L420,140 L640,95 L860,138 L1080,100 L1300,135 L1440,110 L1440,160 L0,160 Z" />
      </svg>
    </header>
  );
}

function Nav({ mode, onMode }) {
  const sections = mode === "prep" ? SECTIONS : HISTORY_SECTIONS;
  return (
    <nav className="mar-nav" aria-label="Sekcie">
      <div className="mar-mode" role="radiogroup" aria-label="Režim">
        <button type="button" role="radio" aria-checked={mode === "prep"} className={mode === "prep" ? "is-on" : ""} onClick={() => onMode("prep")}>
          Príprava
        </button>
        <button type="button" role="radio" aria-checked={mode === "history"} className={mode === "history" ? "is-on" : ""} onClick={() => onMode("history")}>
          História
        </button>
      </div>
      {sections.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function Section({ id, title, intro, children }) {
  return (
    <section className="mar-section" id={id}>
      <h2 className="mar-h2">{title}</h2>
      {intro && <p className="mar-intro">{intro}</p>}
      {children}
    </section>
  );
}

/* ─── Odporúčania z dát ─── */
// Lineárna regresia tempa podľa tepu z posledných behov → aké tempo zodpovedá danému tepu.
function paceAtHr(hr, asOf) {
  const pts = RUNS.filter((r) => r.hr && isRoadRun(r) && r.d >= addDays(asOf, -120) && r.d <= asOf);
  if (pts.length < 6) return null;
  const mx = avg(pts.map((p) => p.hr));
  const my = avg(pts.map((p) => p.pace));
  const b = pts.reduce((s, p) => s + (p.hr - mx) * (p.pace - my), 0) / pts.reduce((s, p) => s + (p.hr - mx) ** 2, 0);
  if (!(b < 0)) return null;
  return my + b * (hr - mx);
}

function buildAdvice(today, current) {
  if (!DATA || !current) return { items: [], target: current?.km };
  const asOf = DATA.generated;
  const items = [];
  let target = current.km;

  const age = daysBetween(DATA.lastWorkout, today);
  if (age > 7) {
    items.push({ level: "warn", title: "Staršie dáta", text: `Posledný tréning v dátach je z ${fmtDate(DATA.lastWorkout)}. Exportuj Zdravie znova a spusti import, nech odporúčania sedia.` });
  }

  // pripravenosť: posledných 7 dní vs. predchádzajúce 4 týždne
  if (daysBetween(asOf, today) <= 3) {
    const rhr7 = metricAvg(DATA.rhr, addDays(asOf, -6), addDays(asOf, 1));
    const rhrBase = metricAvg(DATA.rhr, addDays(asOf, -35), addDays(asOf, -6));
    const hrv7 = metricAvg(DATA.hrv, addDays(asOf, -6), addDays(asOf, 1));
    const hrvBase = metricAvg(DATA.hrv, addDays(asOf, -35), addDays(asOf, -6));
    if (rhr7 && rhrBase && hrv7 && hrvBase) {
      const dRhr = rhr7 - rhrBase;
      const rHrv = hrv7 / hrvBase;
      const nums = `Pokojový tep ${Math.round(rhr7)} (bežne ${Math.round(rhrBase)}), HRV ${Math.round(hrv7)} ms (bežne ${Math.round(hrvBase)}).`;
      if (dRhr >= 5 || rHrv < 0.8) {
        items.push({ level: "alert", title: "Telo je unavené", text: `${nums} Dnes len ľahko alebo voľno, kvalitný tréning presuň o deň–dva.` });
        target = Math.round(target * 0.85);
      } else if (dRhr >= 3 || rHrv < 0.9) {
        items.push({ level: "warn", title: "Mierna únava", text: `${nums} Ľahké behy drž naozaj ľahko, plávanie a piatkové fitko pokojne vynechaj.` });
      } else {
        items.push({ level: "ok", title: "Zotavený", text: `${nums} Môžeš trénovať podľa plánu.` });
      }
    }
  }

  // objem minulého týždňa vs. plán
  const prevStart = addDays(current.start, -7);
  const prevRuns = RUNS.filter((r) => r.d >= prevStart && r.d < current.start);
  const prevKm = prevRuns.reduce((s, r) => s + r.km, 0);
  const prevPlan = WEEKS[current.n - 2]?.km ?? current.km;
  const ratio = prevKm / prevPlan;
  if (ratio < 0.8) {
    target = Math.min(target, Math.max(10, Math.round((prevKm * 1.15) / 2) * 2));
    items.push({ level: "warn", title: "Objem pod plánom", text: `Minulý týždeň ${fmtKm(prevKm)} km z ${prevPlan}. Nedobiehaj, tento týždeň stačí ~${target} km a plán sa dorovná postupne.` });
  } else if (ratio > 1.2) {
    items.push({ level: "warn", title: "Nad plánom", text: `Minulý týždeň ${fmtKm(prevKm)} km, plán bol ${prevPlan}. Nepridávaj ďalej, šľachy si zvykajú pomalšie ako srdce.` });
  } else {
    items.push({ level: "ok", title: "Objem sedí", text: `Minulý týždeň ${fmtKm(prevKm)} km (plán ${prevPlan}).` });
  }

  // intenzita ľahkých behov
  const easyRuns = RUNS.filter((r) => r.hr && isRoadRun(r) && r.km < 12 && r.d >= addDays(asOf, -21) && r.d <= asOf);
  if (easyRuns.length >= 2) {
    const hot = easyRuns.filter((r) => r.hr > EASY_HR + 3);
    if (hot.length / easyRuns.length >= 0.5) {
      const p = paceAtHr(EASY_HR, asOf) ?? PACES[0].from;
      items.push({
        level: "warn",
        title: "Ľahké behy sú rýchle",
        text: `${hot.length} z ${easyRuns.length} kratších behov za 3 týždne bolo nad ${EASY_HR} tepov (priemer ${Math.round(avg(easyRuns.map((r) => r.hr)))}, tempo ${fmtPace(avg(easyRuns.map((r) => r.pace)))}). Ľahký beh drž do ${EASY_HR}, to je zhruba ${fmtPace(p)}–${fmtPace(p + 25)}/km. Spočiatku to bude pôsobiť smiešne pomaly, ale práve tu sa buduje vytrvalosť na maratón.`,
      });
    } else {
      items.push({ level: "ok", title: "Ľahké behy sú ľahké", text: `Priemerný tep kratších behov ${Math.round(avg(easyRuns.map((r) => r.hr)))}, cieľ do ${EASY_HR}.` });
    }
  }

  // ostatné športy minulý týždeň
  const other = DATA.other?.find((o) => o.w === prevStart);
  const otherMin = other ? Object.entries(other).filter(([k]) => k !== "w").reduce((s, [, v]) => s + v, 0) : 0;
  if (otherMin >= 180) {
    items.push({ level: "info", title: "Ďalšie športy", text: `Minulý týždeň ${Math.round(otherMin / 60)} h iných športov. Ráta sa to do únavy. Keď treba uberať, uber najprv z nich, nie z behov.` });
  }

  return { items, target };
}

/* ─── Teraz ─── */
function Now({ today, current }) {
  if (!current) return null;
  const dow = (new Date(today + "T12:00:00").getDay() + 6) % 7;
  const detail = WEEK1.find((d) => d.date === today);
  const structure = current.phase.id === "base" ? WEEK_BASE : WEEK_BUILD;
  const day = detail || { title: structure[dow].text };
  const gym = dow === 0 ? GYM[current.phase.id].mon : dow === 4 ? GYM[current.phase.id].fri : null;
  const todayRuns = RUNS.filter((r) => r.d === today);
  const { items, target } = buildAdvice(today, current);
  const weekPct = current.actual != null ? Math.min(100, Math.round((current.actual / target) * 100)) : null;

  return (
    <section className="mar-now" id="teraz">
      <span className="mar-now-label">
        Týždeň {current.n} · {fmtDate(current.start)} – {fmtDate(addDays(current.start, 6))} · {current.phase.name} fáza
      </span>
      <h3>{current.key}</h3>
      <div className="mar-now-stats">
        <div><strong>{target}</strong><span>{target !== current.km ? `km (plán ${current.km})` : "km za týždeň"}</span></div>
        <div><strong>{current.long ?? "–"}</strong><span>km dlhý beh</span></div>
        {current.easy && <div><strong>↓</strong><span>ľahší týždeň</span></div>}
      </div>

      {weekPct != null && (
        <div className="mar-progress">
          <div className="mar-progress-bar"><span style={{ width: `${weekPct}%` }} /></div>
          <span>Tento týždeň zatiaľ {fmtKm(current.actual)} z {target} km</span>
          {current.runs.length > 0 && (
            <div className="mar-now-runs">
              {current.runs.map((r) => (
                <span key={r.d + r.km}>
                  {DAY_NAMES[(new Date(r.d + "T12:00:00").getDay() + 6) % 7]} {fmtKm(r.km)} km · {fmtPace(r.pace)}{r.hr ? ` · ♥ ${r.hr}` : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mar-now-today">
        <span className="mar-k">Dnes · {DAY_NAMES[dow]} {fmtDate(today)}</span>
        <strong>{todayRuns.length ? `✓ Odbehnuté ${todayRuns.map((r) => `${fmtKm(r.km)} km`).join(" + ")}` : day.title}</strong>
        {day.text && !todayRuns.length && <p>{day.text}</p>}
        {gym && (
          <div className="mar-now-gym">
            <span>Fitko · {gym.min}</span>
            <ul>{gym.items.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <ul className="mar-advice">
          {items.map((a) => (
            <li key={a.title} className={`is-${a.level}`}>
              <strong>{a.title}</strong> {a.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─── Forma ─── */
function weekly(series, since) {
  const by = new Map();
  (series ?? []).forEach(([d, v]) => {
    if (d < since) return;
    const wd = (new Date(d + "T12:00:00").getDay() + 6) % 7;
    const k = addDays(d, -wd);
    by.set(k, [...(by.get(k) ?? []), v]);
  });
  return [...by.entries()].sort().map(([k, v]) => [k, avg(v)]);
}

const num = (v, d) => v.toLocaleString("sk-SK", { minimumFractionDigits: d, maximumFractionDigits: d });

// baseline: hodnota na porovnanie (napr. priemer pred prípravou), inak ~2 mesiace dozadu
function Spark({ label, series, unit, digits = 0, better, baseline, baselineLabel = "za ~2 mesiace", rangeLabel = "za rok" }) {
  if (series.length < 3) return null;
  const vals = series.map(([, v]) => v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const W = 220;
  const H = 54;
  const pts = series.map(([, v], i) => `${(i / (series.length - 1)) * W},${H - 4 - ((v - min) / (max - min || 1)) * (H - 8)}`).join(" ");
  const last = vals[vals.length - 1];
  const prev = baseline ?? avg(vals.slice(-14, -4)) ?? vals[0];
  const diff = last - prev;
  const good = better === "up" ? diff >= 0 : diff <= 0;
  return (
    <div className="mar-card mar-spark">
      <span className="mar-k">{label}</span>
      <strong>{num(last, digits)}<small> {unit}</small></strong>
      <span className={`mar-spark-diff ${good ? "is-good" : "is-bad"}`}>
        {diff >= 0 ? "▲" : "▼"} {num(Math.abs(diff), digits)} {baselineLabel}
      </span>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={pts} />
      </svg>
      <span className="mar-spark-range">{num(min, digits)}–{num(max, digits)} {rangeLabel}</span>
    </div>
  );
}

const SC = { w: 640, h: 330, l: 44, r: 12, t: 16, b: 40, pMin: 270, pMax: 420, hMin: 120, hMax: 185 };

function PaceHr({ asOf, since, title }) {
  const pts = RUNS.filter((r) => r.hr && isRoadRun(r) && r.d >= since);
  if (!pts.length) return null;
  const span = Math.max(1, daysBetween(since, asOf));
  // vľavo pomalšie, vpravo rýchlejšie – rovnako ako v tempách nižšie
  const x = (p) => SC.l + ((SC.pMax - Math.min(SC.pMax, Math.max(SC.pMin, p))) / (SC.pMax - SC.pMin)) * (SC.w - SC.l - SC.r);
  const y = (h) => SC.t + ((SC.hMax - Math.min(SC.hMax, Math.max(SC.hMin, h))) / (SC.hMax - SC.hMin)) * (SC.h - SC.t - SC.b);
  const bands = [
    { from: SC.hMin, to: EASY_HR, color: "#6E8B5E", label: "ľahko" },
    ...PACES.slice(1).map((p) => ({ from: Math.round(HR_MAX * p.hr[0]), to: Math.min(SC.hMax, Math.round(HR_MAX * p.hr[1])), color: p.color, label: p.name.split(" (")[0].replace(" beh", "") })),
  ];
  const ticksP = [270, 300, 330, 360, 390, 420];
  const ticksH = [120, 130, 140, 150, 160, 170, 180];

  return (
    <div className="mar-card mar-scatter">
      <h3 className="mar-h3">{title}</h3>
      <div className="mar-chart-wrap">
        <svg viewBox={`0 0 ${SC.w} ${SC.h}`} className="mar-chart mar-chart-sc" role="img" aria-label="Tempo a priemerný tep jednotlivých behov">
          {bands.map((b) => (
            <g key={b.label}>
              <rect x={SC.l} width={SC.w - SC.l - SC.r} y={y(b.to)} height={y(b.from) - y(b.to)} fill={b.color} opacity={0.12} />
              <text x={SC.w - SC.r - 6} y={y(b.to) + 13} textAnchor="end" className="mar-axis" style={{ fill: b.color, fontWeight: 600 }}>{b.label}</text>
            </g>
          ))}
          {ticksH.map((h) => (
            <g key={h}>
              <line x1={SC.l} x2={SC.w - SC.r} y1={y(h)} y2={y(h)} className="mar-grid" />
              <text x={SC.l - 8} y={y(h) + 4} textAnchor="end" className="mar-axis">{h}</text>
            </g>
          ))}
          {ticksP.map((p) => (
            <text key={p} x={x(p)} y={SC.h - SC.b + 18} textAnchor="middle" className="mar-axis">{fmtPace(p)}</text>
          ))}
          <text x={(SC.w + SC.l) / 2} y={SC.h - 4} textAnchor="middle" className="mar-axis">← pomalšie · min/km · rýchlejšie →</text>
          <text x={4} y={SC.t + 4} className="mar-axis">♥</text>
          {pts.map((r) => {
            const age = daysBetween(r.d, asOf) / span;
            return (
              <circle
                key={r.d + r.km}
                cx={x(r.pace)}
                cy={y(r.hr)}
                r={3 + Math.min(r.km, 21) / 4}
                className="mar-dot"
                style={{ opacity: 0.95 - age * 0.7 }}
              >
                <title>{`${fmtDate(r.d)} ${r.d.slice(0, 4)} · ${fmtKm(r.km)} km · ${fmtPace(r.pace)}/km · ♥ ${r.hr}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      <p className="mar-muted">
        Každý krúžok je jeden beh, väčší znamená dlhší a tmavší novší. Ľahké behy by mali ležať v zelenom páse, teda do {EASY_HR} tepov
        (77 % z maxima {HR_MAX}).
      </p>
    </div>
  );
}

const LOAD_KINDS = [
  ["run", "Beh", "#B8623E"],
  ["swim", "Plávanie", "#6A8CA6"],
  ["bike", "Bicykel", "#C4956A"],
  ["hike", "Turistika", "#6E8B5E"],
  ["rest", "Ostatné", "#CDBBA8"],
];

// minúty podľa športu za obdobie [from, to)
function loadBetween(from, to) {
  const o = { run: 0, swim: 0, bike: 0, hike: 0, rest: 0 };
  RUNS.filter((r) => r.d >= from && r.d < to).forEach((r) => (o.run += r.min));
  (DATA?.other ?? []).filter((x) => x.w >= from && x.w < to).forEach((x) => {
    o.swim += x.swim ?? 0;
    o.bike += x.bike ?? 0;
    o.hike += (x.hike ?? 0) + (x.walk ?? 0);
    o.rest += (x.ski ?? 0) + (x.gym ?? 0) + (x.tri ?? 0) + (x.other ?? 0);
  });
  return o;
}

// Stĺpce po týždňoch (unit "w") alebo mesiacoch (unit "m").
function Load({ cols, title, km }) {
  const rows = cols.map((c) => ({ ...c, ...loadBetween(c.from, c.to) }));
  const totals = rows.map((r) => LOAD_KINDS.reduce((s, [k]) => s + r[k], 0));
  const cap = Math.min(Math.max(300, ...totals), km ? 3000 : 900);

  return (
    <div className="mar-card">
      <h3 className="mar-h3">{title}</h3>
      {/* najnovšie stĺpce sú vpravo, preto začni odscrollované na koniec */}
      <div className="mar-chart-wrap" ref={(el) => el && (el.scrollLeft = el.scrollWidth)}>
        <div className="mar-load" style={{ gridTemplateColumns: `repeat(${Math.max(rows.length, 8)}, minmax(${km ? 22 : 14}px, 1fr))` }}>
          {rows.map((r, i) => {
            const runKm = km ? RUNS.filter((x) => x.d >= r.from && x.d < r.to).reduce((s, x) => s + x.km, 0) : 0;
            return (
              <div key={r.from} className="mar-load-col" title={`${r.label}: ${Math.round(totals[i] / 6) / 10} h${km ? `, beh ${fmtKm(runKm)} km` : ""}`}>
                <div className="mar-load-bar">
                  {LOAD_KINDS.map(([k, , c]) => r[k] > 0 && (
                    <span key={k} style={{ height: `${(Math.min(r[k], cap) / cap) * 100}%`, background: c }} />
                  ))}
                </div>
                <span className="mar-load-h">{totals[i] ? Math.round(totals[i] / 60) : ""}</span>
                <span className="mar-load-d">{r.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mar-legend">
        {LOAD_KINDS.map(([k, l, c]) => <span key={k}><i style={{ background: c }} />{l}</span>)}
        <span>čísla = hodiny</span>
      </div>
    </div>
  );
}

function weekCols(from, asOf) {
  const cols = [];
  const wd = (new Date(from + "T12:00:00").getDay() + 6) % 7;
  for (let w = addDays(from, -wd); w <= asOf; w = addDays(w, 7)) {
    cols.push({ from: w, to: addDays(w, 7), label: fmtDate(w).replace(/\s/g, "") });
  }
  return cols;
}

const MONTHS_SHORT = ["jan", "feb", "mar", "apr", "máj", "jún", "júl", "aug", "sep", "okt", "nov", "dec"];

function monthCols(from, to) {
  const cols = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    const next = m === 12 ? [y + 1, 1] : [y, m + 1];
    const iso = (yy, mm) => `${yy}-${String(mm).padStart(2, "0")}-01`;
    cols.push({ from: iso(y, m), to: iso(...next), label: m === 1 ? `${y}` : MONTHS_SHORT[m - 1] });
    [y, m] = next;
  }
  return cols;
}

function NoData() {
  return (
    <Section id="forma" title="Forma">
      <p className="mar-intro">
        Zatiaľ bez dát z hodiniek. Exportuj Zdravie a v priečinku svadbaeam spusti
        {" "}<code>python3 scripts/health-import.py ~/Downloads/export.zip</code>.
      </p>
    </Section>
  );
}

/* ─── Forma počas prípravy ─── */
function Form() {
  if (!DATA) return <NoData />;
  const asOf = DATA.generated;
  const runs = RUNS.filter((r) => r.d >= PREP_START);
  const km = runs.reduce((s, r) => s + r.km, 0);
  const longest = runs.length ? Math.max(...runs.map((r) => r.km)) : 0;
  const hrRuns = runs.filter((r) => r.hr);
  const baseFrom = addDays(PREP_START, -28);
  const firstLow = MARATHON_PRED * 1.01;
  const firstHigh = MARATHON_PRED * 1.04;
  const series = (s) => (s ?? []).filter(([d]) => d >= PREP_START);
  const before = { baselineLabel: "oproti mesiacu pred prípravou", rangeLabel: "od začiatku prípravy" };

  return (
    <Section
      id="forma"
      title="Forma v príprave"
      intro={`Len dáta od začiatku prípravy (${fmtDate(PREP_START)} ${PREP_START.slice(0, 4)}), aktuálne k ${fmtDate(asOf)} Staršie behy nájdeš v režime História.`}
    >
      <div className="mar-form-top">
        <div className="mar-card mar-stat">
          <span className="mar-k">Od začiatku prípravy</span>
          <strong>{fmtKm(km)} km</strong>
          <span>
            {runs.length} {plural(runs.length, "beh", "behy", "behov")} · najdlhší {fmtKm(longest)} km
            {hrRuns.length > 0 && ` · priemerný tep ${Math.round(avg(hrRuns.map((r) => r.hr)))}`}
          </span>
        </div>
        <div className="mar-card mar-stat mar-stat-accent">
          <span className="mar-k">Odhad na maratón</span>
          <strong>{fmtTime(firstLow).slice(0, 4)} – {fmtTime(firstHigh).slice(0, 4)}</strong>
          <span>
            Z polmaratónu {fmtTime(HM_BEST.time).slice(0, 7)} ({fmtDate(HM_BEST.d)} {HM_BEST.d.slice(0, 4)}) vychádza podľa Riegela
            {" "}{fmtTime(MARATHON_PRED).slice(0, 4)}, k tomu 1–4 % na prvý maratón. Cieľové tempo
            ~{fmtPace(firstLow / 42.195)}–{fmtPace(firstHigh / 42.195)}/km. Po testovacom polmaratóne v marci sa odhad spresní.
          </span>
        </div>
        <div className="mar-card mar-stat">
          <span className="mar-k">Max tep · ľahký beh</span>
          <strong>{HR_MAX} · ≤ {EASY_HR}</strong>
          <span>Max tep je z najvyšších hodnôt za posledné 2 roky. Pásma tepu sú v sekcii Tempá.</span>
        </div>
      </div>

      <PaceHr asOf={asOf} since={PREP_START} title="Tempo a tep · behy v príprave" />

      <div className="mar-sparks">
        <Spark label="VO2max (odhad hodiniek)" series={series(DATA.vo2)} unit="ml/kg/min" digits={1} better="up" baseline={metricAvg(DATA.vo2, baseFrom, PREP_START)} {...before} />
        <Spark label="Pokojový tep" series={series(DATA.rhr)} unit="/min" better="down" baseline={metricAvg(DATA.rhr, baseFrom, PREP_START)} {...before} />
        <Spark label="HRV (SDNN)" series={series(DATA.hrv)} unit="ms" better="up" baseline={metricAvg(DATA.hrv, baseFrom, PREP_START)} {...before} />
      </div>

      <Load cols={weekCols(PREP_START, asOf)} title="Tréningový čas po týždňoch prípravy" />
    </Section>
  );
}

/* ─── História: všetko, čo hodinky kedy zaznamenali ─── */
function History() {
  const [open, setOpen] = useState(null);
  if (!DATA) return <NoData />;
  const asOf = DATA.generated;
  const first = RUNS[0]?.d ?? asOf;
  const years = [...new Set(RUNS.map((r) => r.d.slice(0, 4)))].sort().reverse();
  const hrFrom = RUNS.find((r) => r.hr)?.d ?? asOf;
  const openYear = open ?? years[0];

  const yearRows = years.map((y) => {
    const rs = RUNS.filter((r) => r.d.startsWith(y));
    const road = rs.filter(isRoadRun);
    const halves = HALVES.filter((h) => h.d.startsWith(y));
    const other = loadBetween(`${y}-01-01`, `${+y + 1}-01-01`);
    return {
      y,
      count: rs.length,
      km: rs.reduce((s, r) => s + r.km, 0),
      longest: rs.length ? Math.max(...rs.map((r) => r.km)) : 0,
      pace: road.length ? road.reduce((s, r) => s + r.min * 60, 0) / road.reduce((s, r) => s + r.km, 0) : null,
      hm: halves.length ? Math.min(...halves.map((h) => h.time)) : null,
      otherH: (other.swim + other.bike + other.hike + other.rest) / 60,
    };
  });
  const maxKm = Math.max(...yearRows.map((r) => r.km));

  return (
    <>
      <Section id="roky" title="Roky" intro={`Všetky behy z hodiniek od ${fmtDate(first)} ${first.slice(0, 4)}, dáta k ${fmtDate(asOf)} ${asOf.slice(0, 4)}.`}>
        <div className="mar-table mar-years">
          <div className="mar-year mar-year-head">
            <span>Rok</span><span>Beh</span><span>Behov</span><span>Najdlhší</span><span>Ø tempo</span><span>Polmaratón</span><span>Iné športy</span>
          </div>
          {yearRows.map((r) => (
            <div key={r.y} className="mar-year">
              <strong>{r.y}</strong>
              <span className="mar-row-bar">
                <span style={{ width: `${(r.km / maxKm) * 100}%`, background: "var(--accent)", opacity: 0.85 }} />
                <b>{Math.round(r.km)}</b>
              </span>
              <span>{r.count}</span>
              <span>{fmtKm(r.longest)} km</span>
              <span>{r.pace ? fmtPace(r.pace) : "–"}</span>
              <span>{r.hm ? fmtTime(r.hm).slice(0, 7) : "–"}</span>
              <span>{Math.round(r.otherH)} h</span>
            </div>
          ))}
        </div>

        {HALVES.length > 0 && (
          <div className="mar-halves mar-halves-big">
            {HALVES.map((h) => (
              <span key={h.d} className={h.d === HM_BEST.d ? "is-best" : ""}>
                Polmaratón {fmtDate(h.d)} {h.d.slice(0, 4)} · {fmtTime(h.time).slice(0, 7)} · {fmtPace(h.time / 21.0975)}/km{h.hr ? ` · ♥ ${h.hr}` : ""}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section id="mesiace" title="Mesiace" intro="Tréningový čas po mesiacoch podľa športu. Podrž alebo ťukni na stĺpec pre detail.">
        <Load cols={monthCols(first, asOf)} title="Hodiny tréningu mesačne" km />
      </Section>

      <Section id="tep" title="Tempo a tep" intro={`Tep majú hodinky v Zdraví až od ${fmtDate(hrFrom)} ${hrFrom.slice(0, 4)}. Staršie behy z Garminu prišli bez tepu.`}>
        <PaceHr asOf={asOf} since={hrFrom} title="Všetky behy s tepom" />
      </Section>

      <Section id="zdravie" title="Zdravie" intro="Týždenné priemery za celé obdobie, ktoré hodinky merali.">
        <div className="mar-sparks">
          <Spark label="VO2max (odhad hodiniek)" series={weekly(DATA.vo2, "2000")} unit="ml/kg/min" digits={1} better="up" rangeLabel="celkovo" />
          <Spark label="Pokojový tep" series={weekly(DATA.rhr, "2000")} unit="/min" better="down" rangeLabel="celkovo" />
          <Spark label="HRV (SDNN)" series={weekly(DATA.hrv, "2000")} unit="ms" better="up" rangeLabel="celkovo" />
        </div>
      </Section>

      <Section id="zaznamy" title="Všetky behy">
        {years.map((y) => {
          const rs = RUNS.filter((r) => r.d.startsWith(y)).reverse();
          const isOpen = openYear === y;
          return (
            <div key={y} className="mar-log">
              <button type="button" className="mar-log-head" onClick={() => setOpen(isOpen ? "" : y)} aria-expanded={isOpen}>
                <strong>{y}</strong>
                <span>{rs.length} {plural(rs.length, "beh", "behy", "behov")} · {Math.round(rs.reduce((s, r) => s + r.km, 0))} km</span>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="mar-table">
                  {rs.map((r) => (
                    <div key={r.d + r.km} className={`mar-logrow${HALVES.some((h) => h.d === r.d) ? " is-race" : ""}`}>
                      <span>{fmtDate(r.d)}</span>
                      <b>{fmtKm(r.km)} km</b>
                      <span>{fmtTime(r.min * 60).replace(/^0:/, "")}</span>
                      <span>{isRoadRun(r) ? `${fmtPace(r.pace)}/km` : "terén"}</span>
                      <span>{r.hr ? `♥ ${r.hr}` : ""}</span>
                      <span>{r.elev ? `↑ ${r.elev} m` : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </>
  );
}

/* ─── Graf objemu ─── */
const CH = { w: 880, h: 300, l: 36, r: 8, t: 46, b: 44, max: 65 };

function Volume({ current, selected, onSelect }) {
  const bw = (CH.w - CH.l - CH.r) / WEEKS.length;
  const plotH = CH.h - CH.t - CH.b;
  const y = (km) => CH.t + plotH - (km / CH.max) * plotH;
  const x = (i) => CH.l + i * bw;
  const xDate = (iso) => CH.l + (daysBetween(PLAN_START, iso) / 7) * bw;
  const hasActual = WEEKS.some((w) => w.actual != null);
  const sel = WEEKS[selected - 1];

  const longPts = WEEKS.filter((w) => w.long).map((w) => `${x(w.n - 1) + bw / 2},${y(w.long)}`).join(" ");

  // mesiace pod osou – prvý týždeň, ktorý v mesiaci začína
  const months = [];
  WEEKS.forEach((w, i) => {
    const m = +w.start.split("-")[1];
    if (!months.length || months[months.length - 1].m !== m) months.push({ m, i });
  });
  const MONTHS = ["", "jan", "feb", "mar", "apr", "máj", "jún", "júl", "aug", "sep", "okt", "nov", "dec"];

  return (
    <Section
      id="objem"
      title="Objem po týždňoch"
      intro="Stĺpce sú týždenné kilometre podľa fáz, svetlejšie sú odľahčovacie týždne. Čiara ukazuje dlhý beh. Ťukni na týždeň pre detail."
    >
      <div className="mar-chart-wrap">
        <svg className="mar-chart" viewBox={`0 0 ${CH.w} ${CH.h}`} role="img" aria-label="Týždenný objem behu a dlhý beh">
          {[0, 20, 40, 60].map((v) => (
            <g key={v}>
              <line x1={CH.l} x2={CH.w - CH.r} y1={y(v)} y2={y(v)} className="mar-grid" />
              <text x={CH.l - 8} y={y(v) + 4} className="mar-axis" textAnchor="end">{v}</text>
            </g>
          ))}

          {EVENTS.map((e) => {
            const x1 = xDate(e.from);
            const x2 = Math.max(xDate(addDays(e.to, 1)), x1 + 3);
            return (
              <g key={e.label}>
                <rect x={x1} y={CH.t - 4} width={x2 - x1} height={plotH + 4} className="mar-event-band" />
                <rect x={x1} y={CH.t - 30} width={x2 - x1} height={4} rx={2} className="mar-event-bar" />
                <text x={x1} y={CH.t - 36} className="mar-event-label">{e.label}</text>
              </g>
            );
          })}

          {current && (
            <rect x={x(current.n - 1)} y={CH.t - 4} width={bw} height={plotH + 26} rx={4} className="mar-current" />
          )}

          {WEEKS.map((w, i) => (
            <g key={w.n} className="mar-bar" onClick={() => onSelect(w.n)}>
              <rect x={x(i)} y={CH.t - 4} width={bw} height={plotH + 26} fill="transparent" />
              <rect
                x={x(i) + bw * 0.16}
                y={y(w.km)}
                width={bw * 0.68}
                height={y(0) - y(w.km)}
                rx={3}
                fill={w.phase.color}
                opacity={w.easy ? 0.45 : 1}
                className={w.n === selected ? "is-selected" : ""}
              />
              {w.actual != null && (
                <line
                  x1={x(i) + bw * 0.08}
                  x2={x(i) + bw * 0.92}
                  y1={y(w.actual)}
                  y2={y(w.actual)}
                  className="mar-actual"
                />
              )}
              <text x={x(i) + bw / 2} y={y(0) + 16} className={`mar-axis${w.n === selected ? " is-sel" : ""}`} textAnchor="middle">
                {w.n}
              </text>
            </g>
          ))}

          <polyline points={longPts} className="mar-long" />
          {WEEKS.filter((w) => w.long).map((w) => (
            <circle key={w.n} cx={x(w.n - 1) + bw / 2} cy={y(w.long)} r={3} className="mar-long-dot" />
          ))}

          {months.map(({ m, i }) => (
            <text key={i} x={x(i) + 2} y={CH.h - 6} className="mar-axis mar-month">{MONTHS[m]}</text>
          ))}
          <text x={4} y={CH.t - 12} className="mar-axis">km</text>
        </svg>
      </div>

      <div className="mar-legend">
        {PHASES.map((p) => (
          <span key={p.id}><i style={{ background: p.color }} />{p.name}</span>
        ))}
        <span><i className="mar-legend-long" />Dlhý beh</span>
        {hasActual && <span><i className="mar-legend-actual" />Skutočnosť</span>}
      </div>

      <div className="mar-detail" style={{ borderColor: sel.phase.color }}>
        <div className="mar-detail-head">
          <strong>Týždeň {sel.n}</strong>
          <span>{fmtDate(sel.start)} – {fmtDate(addDays(sel.start, 6))} · {sel.phase.name}{sel.easy ? " · odľahčenie" : ""}</span>
        </div>
        <p>{sel.key}</p>
        <div className="mar-detail-nums">
          <span><b>{sel.km}</b> km</span>
          <span>dlhý <b>{sel.long ?? "–"}</b> km</span>
          {sel.actual != null && <span>skutočne <b>{fmtKm(sel.actual)}</b> km</span>}
        </div>
        {EVENTS.filter((e) => e.from <= addDays(sel.start, 6) && e.to >= sel.start && e.note).map((e) => (
          <p key={e.label} className="mar-detail-note">{e.label}: {e.note}</p>
        ))}
      </div>
    </Section>
  );
}

/* ─── Fázy ─── */
function Phases() {
  return (
    <Section id="fazy" title="Fázy plánu" intro="Každý 4. týždeň je odľahčovací (cca −20 % objemu) na regeneráciu.">
      <div className="mar-phase-strip" aria-hidden="true">
        {PHASES.map((p) => (
          <span key={p.id} style={{ flex: p.weeks[1] - p.weeks[0] + 1, background: p.color }}>
            {p.name}
          </span>
        ))}
      </div>
      <div className="mar-phase-grid">
        {PHASES.map((p) => {
          const ws = WEEKS.slice(p.weeks[0] - 1, p.weeks[1]);
          return (
            <div key={p.id} className="mar-card mar-phase" style={{ borderTopColor: p.color }}>
              <span className="mar-k">T{p.weeks[0]}–T{p.weeks[1]} · {fmtDate(ws[0].start)} – {fmtDate(addDays(ws[ws.length - 1].start, 6))}</span>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
              <span className="mar-phase-km">
                {Math.min(...ws.map((w) => w.km))}–{Math.max(...ws.map((w) => w.km))} km/týždeň
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─── Tempá ─── */
function hrRange(p) {
  return p.hr[0] ? `${Math.round(HR_MAX * p.hr[0])}–${Math.round(HR_MAX * p.hr[1])}` : `do ${EASY_HR}`;
}

function Paces() {
  const slow = 410;
  const fast = 270;
  const pos = (sec) => ((slow - sec) / (slow - fast)) * 100;
  const ticks = [];
  for (let s = 270; s <= 410; s += 30) ticks.push(s);

  return (
    <Section
      id="tempa"
      title="Tréningové tempá"
      intro={`Tempá sedia na tvoj polmaratón ${fmtTime(HM_BEST.time).slice(0, 7)}. Tep je počítaný z maxima ${HR_MAX}. Keď sa tempo a tep nezhodujú (teplo, únava, kopce), riaď sa tepom. Ľahké behy majú byť naozaj ľahké.`}
    >
      <div className="mar-card mar-pace">
        <div className="mar-pace-scale">
          {PACES.map((p) => (
            <div key={p.name} className="mar-pace-row">
              <span className="mar-pace-name">{p.name}</span>
              <div className="mar-pace-track">
                <span
                  className="mar-pace-zone"
                  style={{ left: `${pos(p.to)}%`, width: `${pos(p.from) - pos(p.to)}%`, background: p.color }}
                />
                <span className="mar-pace-val" style={{ left: `${(pos(p.to) + pos(p.from)) / 2}%` }}>
                  {fmtPace(p.to)}–{fmtPace(p.from)}
                </span>
              </div>
            </div>
          ))}
          <div className="mar-pace-row mar-pace-axis">
            <span className="mar-pace-name" />
            <div className="mar-pace-track">
              {ticks.map((s) => (
                <span key={s} style={{ left: `${pos(s)}%` }}>{fmtPace(s)}</span>
              ))}
              <span className="mar-pace-hm" style={{ left: `${pos(HM_BEST_PACE)}%` }} title="Najlepší polmaratón">
                PM {fmtTime(HM_BEST.time).slice(0, 4)}
              </span>
            </div>
          </div>
        </div>
        <p className="mar-pace-foot">← pomalšie · min/km · rýchlejšie →</p>
      </div>
      <ul className="mar-pace-feel">
        {PACES.map((p) => (
          <li key={p.name}><i style={{ background: p.color }} /><b>{p.name}:</b> {p.feel} · ♥ {hrRange(p)}</li>
        ))}
      </ul>
    </Section>
  );
}

/* ─── Týždenná štruktúra ─── */
function WeekStructure({ today, current }) {
  const [phase, setPhase] = useState(current && current.phase.id !== "base" ? "build" : "base");
  const [gymPhase, setGymPhase] = useState(current ? current.phase.id : "base");
  const days = phase === "base" ? WEEK_BASE : WEEK_BUILD;
  const dow = (new Date(today + "T12:00:00").getDay() + 6) % 7;

  return (
    <Section
      id="tyzden"
      title="Týždenná štruktúra"
      intro="Pri veľkej únave vynechaj najprv plávanie, potom piatkové fitko. Behy a dlhý beh majú prednosť."
    >
      <div className="mar-toggle" role="tablist">
        <button type="button" className={phase === "base" ? "is-on" : ""} onClick={() => setPhase("base")}>Základná (T1–T12)</button>
        <button type="button" className={phase === "build" ? "is-on" : ""} onClick={() => setPhase("build")}>Rozvojová a špecifická (T13–T26)</button>
      </div>
      <div className="mar-week">
        {days.map((d, i) => (
          <div key={i} className={`mar-day mar-t-${d.type}${current && i === dow ? " is-today" : ""}`}>
            <span className="mar-day-name">{DAY_NAMES[i]}</span>
            <span className="mar-day-type">{TYPE_LABEL[d.type]}</span>
            <span className="mar-day-text">{d.text}</span>
          </div>
        ))}
      </div>

      <div className="mar-two">
        <div className="mar-card">
          <h3 className="mar-h3">Fitko · {PHASES.find((p) => p.id === gymPhase).name.toLowerCase()} fáza</h3>
          <div className="mar-gym-tabs">
            {PHASES.map((p) => (
              <button key={p.id} type="button" className={gymPhase === p.id ? "is-on" : ""} onClick={() => setGymPhase(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
          {[["mon", "Pondelok · nohy + core"], ["fri", "Piatok · celé telo"]].map(([k, label]) => (
            <div key={k} className="mar-gym">
              <b>{label}</b> <span className="mar-muted">({GYM[gymPhase][k].min})</span>
              <ul>{GYM[gymPhase][k].items.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
          ))}
          <p className="mar-muted">{GYM[gymPhase].note}</p>
        </div>
        <div className="mar-card">
          <h3 className="mar-h3">Plávanie · voliteľné, 1× týždenne</h3>
          <p>30–40 min voľne, dobrá regenerácia. Ak je únava, vynechaj.</p>
          <h3 className="mar-h3">Týždeň 1 podrobne</h3>
          <ol className="mar-w1">
            {WEEK1.map((d, i) => (
              <li key={d.date} className={d.date === today ? "is-today" : ""}>
                <span>{DAY_NAMES[i]} {fmtDate(d.date)}</span> {d.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

/* ─── Celý plán ─── */
function Plan({ current }) {
  const max = Math.max(...WEEKS.map((w) => w.km));
  return (
    <Section id="plan" title="Plán po týždňoch" intro="V týždňoch 1–8 sú 3 behy (ut, št, ne), potom 4. Ak sa necítiš dobre, objem radšej zníž, než aby si dobiehal.">
      <div className="mar-table">
        {WEEKS.map((w) => (
          <div key={w.n} className={`mar-row${current && w.n === current.n ? " is-current" : ""}${current && w.n < current.n ? " is-past" : ""}`}>
            <span className="mar-row-n" style={{ background: w.phase.color, opacity: w.easy ? 0.55 : 1 }}>{w.n}</span>
            <span className="mar-row-date">{fmtDate(w.start)}</span>
            <span className="mar-row-bar">
              <span style={{ width: `${(w.km / max) * 100}%`, background: w.phase.color, opacity: w.easy ? 0.45 : 0.85 }} />
              <b>{w.km}</b>
            </span>
            <span className="mar-row-long">{w.long ? `${w.long} km` : "–"}</span>
            <span className="mar-row-key">{w.key}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Deň D ─── */
const MARATHON_KM = 42.195;
const GOALS = [3 * 3600 + 45 * 60, 3 * 3600 + 50 * 60, 3 * 3600 + 55 * 60, 4 * 3600];

function RaceDay() {
  const [pace, setPace] = useState(335);
  const finish = pace * MARATHON_KM;

  // gél každých ~40 min od 5. km
  const gels = [];
  for (let km = 5; km < MARATHON_KM - 2; km += (40 * 60) / pace) gels.push(km);

  const splits = [5, 10, 21.0975, 30, 35, MARATHON_KM];
  const pct = (km) => (km / MARATHON_KM) * 100;

  return (
    <Section id="den-d" title="Deň D · 2. 5. 2027" intro="Prvých 5–10 km zámerne pomalšie ako cieľové tempo, úsilie drž pod kontrolou až do 30. km. Zvyšok je o hlave.">
      <div className="mar-card mar-calc">
        <div className="mar-calc-top">
          <div>
            <span className="mar-k">Tempo</span>
            <strong className="mar-big">{fmtPace(pace)}<small> /km</small></strong>
          </div>
          <div>
            <span className="mar-k">Cieľový čas</span>
            <strong className="mar-big">{fmtTime(finish)}</strong>
          </div>
        </div>
        <input
          type="range"
          min={300}
          max={390}
          step={1}
          value={pace}
          onChange={(e) => setPace(+e.target.value)}
          aria-label="Maratónske tempo"
        />
        <div className="mar-goals">
          {GOALS.map((g) => (
            <button key={g} type="button" onClick={() => setPace(Math.round(g / MARATHON_KM))}>
              {fmtTime(g).slice(0, 4)}
            </button>
          ))}
        </div>

        <div className="mar-course" aria-hidden="true">
          <span className="mar-seg mar-seg-1" style={{ width: `${pct(10)}%` }}>pomalšie</span>
          <span className="mar-seg mar-seg-2" style={{ width: `${pct(20)}%` }}>kontrolovane v MP</span>
          <span className="mar-seg mar-seg-3" style={{ width: `${pct(MARATHON_KM - 30)}%` }}>hlava</span>
          {gels.map((km) => (
            <span key={km} className="mar-gel" style={{ left: `${pct(km)}%` }} title={`gél ~${fmtKm(km)} km`} />
          ))}
        </div>
        <div className="mar-course-axis">
          {[0, 10, 21.1, 30, 42.2].map((km) => (
            <span key={km} style={{ left: `${pct(km)}%` }}>{String(km).replace(".", ",")}</span>
          ))}
        </div>
        <p className="mar-muted mar-gel-note">
          <span className="mar-gel-dot" /> gél každých ~40 min od 5. km (pri tomto tempe {gels.length}×), piť na každom občerstvení
        </p>

        <div className="mar-splits">
          {splits.map((km) => (
            <div key={km}>
              <span className="mar-k">{km === MARATHON_KM ? "cieľ" : km === 21.0975 ? "polovica" : `${km} km`}</span>
              <b>{fmtTime(km * pace)}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="mar-two">
        <div className="mar-card">
          <h3 className="mar-h3">Pretekový týždeň</h3>
          <ul className="mar-list">
            <li>Štvrtok/piatok: ľahké uvoľnenie, 20–30 min.</li>
            <li>2–3 dni pred pretekmi viac sacharidov, nič nové v jedle.</li>
            <li>Ráno raňajky 2–3 hodiny pred štartom.</li>
          </ul>
        </div>
        <div className="mar-card">
          <h3 className="mar-h3">Výživa a vybavenie</h3>
          <ul className="mar-list">
            <li>Pri behoch nad 90 min trénuj príjem sacharidov, ~40–60 g/h. Rovnaké produkty ako na trati.</li>
            <li>Pitie podľa smädu, v teple s elektrolytmi.</li>
            <li>Preteky v topánkach, v ktorých máš aspoň 2–3 dlhé behy. Nové topánky nie.</li>
            <li>V zime vrstvy, reflexné prvky, grip na ľad.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ─── Zásady ─── */
function Rules() {
  return (
    <Section id="zasady" title="Dôležité pravidlá">
      <div className="mar-rules">
        {RULES.map(([t, d], i) => (
          <div key={t} className="mar-card mar-rule">
            <span className="mar-rule-n">{i + 1}</span>
            <div><strong>{t}</strong><p>{d}</p></div>
          </div>
        ))}
      </div>
      <p className="mar-closing">Veľa šťastia a užívaj si cestu!</p>
    </Section>
  );
}
