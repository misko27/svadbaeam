import { useEffect, useRef, useState } from "react";
import "./Zasadaci.css";

/* ─── Rozmery sály (v metroch) ─── */
// Sála je obdĺžnik, parket + DJ zaberajú pravú tretinu.
const HALL = { w: 26, h: 15 };
const PARKET_X = HALL.w * (2 / 3);
const DJ = { x: HALL.w - 3.4, y: 0.4, w: 3, h: 2 }; // DJ s aparatúrou v rohu
const ROUND_D = 1.8; // priemer okrúhleho stola
const CHAIR_GAP = 0.45; // o koľko sú stoličky odsadené od hrany stola

/* ─── Stoly ─── */
// Hosť môže byť len meno (string) alebo objekt:
//   { name: "Ema", kid: true, highChair: true, veg: true, diet: "bezlepková", note: "..." }
//   meal: "kid" = detská porcia, "none" = bez jedla (napr. bábätko v detskej stoličke)
// Meno začínajúce na "dieta" sa automaticky berie ako dieťa.
// x, y = stred stola v metroch; "Upraviť rozloženie" ich dovolí ťahať myšou.
const TABLES = [
  {
    id: 1,
    shape: "rect",
    name: "Hlavný stôl — mladomanželia + rodičia",
    x: PARKET_X / 2,
    y: 0.9,
    len: 5, // dĺžka stola (m), sedí sa len z jednej strany – tvárou do sály
    vysluzky: 0,
    guests: ["Mama nevesty", "Nevesta", { name: "Ženích", veg: true }, "Mama ženícha", "Otec ženícha"],
  },
  { id: 2, x: 4.55, y: 4.9, vysluzky: 0,
    guests: ["Igor", "Martina", "Danko", "Janka", "Andrea", "Dušan", "Ivet", "Majo",
      { name: "Sárka", kid: true, meal: "kid" }, { name: "Sofia", kid: true, meal: "kid" },
      { name: "Dominik", kid: true, meal: "kid" }] },
  { id: 3, x: 8.65, y: 4.9, vysluzky: 0,
    guests: [{ name: "Matúško", kid: true, meal: "kid" }, { name: "Alžbetka", kid: true, meal: "kid" }, "Ľubka", "Lukáš", "Majka",
      { name: "Petko", veg: true }, "Majka",
      { name: "Petko", kid: true, meal: "kid" }, { name: "Davidko", kid: true, meal: "kid" },
      { name: "Simonko", kid: true, highChair: true, meal: "none" }] },
  { id: 4, x: 12.75, y: 4.9, vysluzky: 0,
    guests: ["Litka", "Maroš", "Ingrid", { name: "Emka", kid: true, meal: "kid" }, "Janka", "Janko",
      { name: "Sonja", kid: true, meal: "kid" }, { name: "Janko", kid: true, meal: "kid" }] },
  { id: 5, x: 2.5, y: 8.6, vysluzky: 4,
    guests: ["Róbert", "Eva", "Michal", "teta Žofia", "Julka", "Miro",
      { name: "Emma", kid: true, meal: "kid" }, { name: "Dominik", kid: true, meal: "kid" }, "Lenka", "Peťo"] },
  { id: 6, x: 6.6, y: 8.6, vysluzky: 5,
    guests: ["Krstná", "Krstný", "Vlado", "Mirka", "Braňo", "Katka", "Janko", "Martina", "Katka"] },
  { id: 7, x: 10.7, y: 8.6, vysluzky: 5,
    guests: [{ name: "Lila", diet: "bezlepková" }, "Tomáš", { name: "Janka", veg: true }, "Ado", { name: "Kika", diet: "bezlepková" }, "Mihla", "Pipa", "Kovo", "Tomáš", { name: "Baša", veg: true }] },
  { id: 8, x: 14.8, y: 8.6, vysluzky: 6,
    guests: ["Boris", "Dominika", "Matúš", "Romi", "Mino", "Dávid", "Nika", "Rado", "Patrik", "Nelka"] },
  { id: 9, x: 4.55, y: 12.3, vysluzky: 5,
    guests: ["Tomáš", "Nika", { name: "Artur", kid: true, highChair: true, meal: "none" }, "Michal", "Dada", "Paťka", "Andrej", "Viki", { name: "Evka", diet: "bezlepková" }, "Richard"] },
  { id: 10, x: 8.65, y: 12.3, vysluzky: 5,
    guests: [{ name: "Lucia", veg: true }, "Lukáš", "Mery", { name: "Mára", diet: "bezlepková" }, "Sima", { name: "Lenka", veg: true }, "Igor", { name: "Veru", diet: "bezlepková" }, "Lukáš",
      { name: "Alžbetka", kid: true, highChair: true, meal: "none" }] },
  { id: 11, x: 12.75, y: 12.3, vysluzky: 3,
    guests: ["Cygo", "Tina", "Laco", "Marta", "Tomáš", "Julka", "Sandra", "Danka", "Veronika", "Jambi"] },
];

// Malý stôl pre dodávateľov – hore pri parkete, oproti hlavnému stolu.
const CREW = {
  id: "crew",
  shape: "rect",
  name: "DJ · kameraman · fotograf",
  x: PARKET_X + 1.6,
  y: 0.9,
  len: 1.8,
  guests: [
    { name: "DJ", diet: "špeciál", note: "bez lepku, korenín, orechov a laktózy" },
    "Kameraman",
    "Fotograf",
  ],
};

const CAPACITY = 10;
const STORAGE_KEY = "zasadaci-pozicie-v2";

/* ─── Pomocné funkcie ─── */
const normGuest = (g) => {
  const o = typeof g === "string" ? { name: g } : g;
  const kid = o.kid ?? /^die(ť|t)a/i.test(o.name);
  return { ...o, kid };
};

// Pozície stoličiek okolo stola (v metroch, relatívne k stredu stola).
function chairSpots(table, n) {
  if (table.shape === "rect") {
    // Obdĺžnik pri hornej stene, stoličky len zospodu (tvárou do sály).
    return Array.from({ length: n }, (_, i) => ({
      x: -table.len / 2 + (table.len / n) * (i + 0.5),
      y: 0.4 + CHAIR_GAP,
      a: 180,
    }));
  }
  const r = ROUND_D / 2 + CHAIR_GAP;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: r * Math.cos(a), y: r * Math.sin(a), a: (a * 180) / Math.PI + 90 };
  });
}

const tableSize = (t) => (t.shape === "rect" ? { w: t.len, h: 0.8 } : null);

/* ─── Komponenty ─── */
function Chair({ x, y, a, guest }) {
  const cls = [
    "zs-chair",
    guest?.kid ? "kid" : "",
    guest?.highChair ? "high" : "",
    guest?.veg || guest?.diet ? "diet" : "",
  ].join(" ");
  return (
    <rect
      className={cls}
      x={x - 0.22}
      y={y - 0.2}
      width={0.44}
      height={0.4}
      rx={0.08}
      transform={`rotate(${a} ${x} ${y})`}
    />
  );
}

// Farebné štítky s počtami – rovnaké farby ako stoličky v pláne.
function Chips({ guests, x = 0, y, anchor = "middle" }) {
  const kids = guests.filter((g) => g.kid && !g.highChair).length;
  const items = [
    { cls: "kid", n: kids },
    { cls: "high", n: guests.filter((g) => g.highChair).length },
    { cls: "veg", n: guests.filter((g) => g.veg || g.diet).length },
  ].filter((c) => c.n > 0);
  const w = 0.42;
  const gap = 0.05;
  const total = items.length * w + (items.length - 1) * gap;
  const x0 = anchor === "middle" ? x - total / 2 : x;
  return (
    <g className="zs-chips">
      {items.map((c, i) => {
        const cx = x0 + i * (w + gap);
        return (
          <g key={c.cls} className={`zs-chip ${c.cls}`}>
            <rect x={cx} y={y - 0.2} width={w} height={0.4} rx={0.1} />
            <text x={cx + w / 2} y={y + 0.11} textAnchor="middle">
              {c.n}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function TableShape({ t, guests, showNames, onPointerDown, editing }) {
  const spots = chairSpots(t, guests.length);
  const size = tableSize(t);
  const over = t.id !== "crew" && t.shape !== "rect" && guests.length > CAPACITY;
  return (
    <g
      className={`zs-table ${over ? "over" : ""} ${t.id === "crew" ? "crew" : ""} ${editing ? "editing" : ""}`}
      transform={`translate(${t.x} ${t.y})`}
      onPointerDown={onPointerDown}
    >
      {spots.map((s, i) => (
        <Chair key={i} {...s} guest={guests[i]} />
      ))}
      {size ? (
        <rect className="zs-top" x={-size.w / 2} y={-size.h / 2} width={size.w} height={size.h} rx={0.08} />
      ) : (
        <circle className="zs-top" r={ROUND_D / 2} />
      )}

      {showNames &&
        t.id !== "crew" &&
        spots.map((s, i) => {
          const rect = t.shape === "rect";
          const k = 1.75;
          const x = rect ? s.x + 0.08 : s.x * k;
          const y = rect ? s.y + 0.35 : s.y * k + 0.1;
          return (
            <text
              key={`n${i}`}
              className="zs-name"
              x={x}
              y={y}
              textAnchor={rect ? "start" : "middle"}
              transform={rect ? `rotate(90 ${x} ${y})` : undefined}
            >
              {guests[i].name}
            </text>
          );
        })}

      {t.id === "crew" ? (
        <text className="zs-crew-label" y={1.4} textAnchor="middle">
          DJ · kamera · foto
        </text>
      ) : t.shape === "rect" ? (
        <>
          <text className="zs-num" x={0} y={0.25} textAnchor="middle">
            {t.id}
          </text>
          <text className="zs-count" x={t.len / 2 + 0.2} y={-0.12}>
            {guests.length} osôb
          </text>
          <Chips guests={guests} x={t.len / 2 + 0.2} y={0.25} anchor="start" />
        </>
      ) : (
        <>
          <text className="zs-count" y={-0.42} textAnchor="middle">
            {guests.length} osôb
          </text>
          <text className="zs-num" y={0.12} textAnchor="middle">
            {t.id}
          </text>
          <Chips guests={guests} y={0.5} />
        </>
      )}
    </g>
  );
}

function FloorPlan({ tables, setPos, editing, showNames }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const pad = 0.6;

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const start = (t) => (e) => {
    if (!editing) return;
    e.preventDefault();
    const p = toSvg(e);
    drag.current = { id: t.id, dx: p.x - t.x, dy: p.y - t.y };
    svgRef.current.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const p = toSvg(e);
    const snap = (v) => Math.round(v * 10) / 10;
    setPos(drag.current.id, snap(p.x - drag.current.dx), snap(p.y - drag.current.dy));
  };
  const end = () => (drag.current = null);

  return (
    <svg
      ref={svgRef}
      className="zs-plan"
      viewBox={`${-pad} ${-pad} ${HALL.w + pad * 2} ${HALL.h + pad * 2}`}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <defs>
        <pattern id="zs-parket" width="0.8" height="0.8" patternUnits="userSpaceOnUse">
          <rect width="0.8" height="0.8" className="zs-parket-a" />
          <rect width="0.4" height="0.4" className="zs-parket-b" />
          <rect x="0.4" y="0.4" width="0.4" height="0.4" className="zs-parket-b" />
        </pattern>
      </defs>

      <rect className="zs-hall" x={0} y={0} width={HALL.w} height={HALL.h} />

      {/* Parket */}
      <rect className="zs-floor" x={PARKET_X} y={0} width={HALL.w - PARKET_X} height={HALL.h} fill="url(#zs-parket)" />
      <text className="zs-area-label" x={PARKET_X + (HALL.w - PARKET_X) / 2} y={HALL.h / 2} textAnchor="middle">
        PARKET
      </text>

      {/* DJ */}
      <rect className="zs-dj" x={DJ.x} y={DJ.y} width={DJ.w} height={DJ.h} rx={0.15} />
      <text className="zs-dj-label" x={DJ.x + DJ.w / 2} y={DJ.y + DJ.h / 2 + 0.15} textAnchor="middle">
        DJ + aparatúra
      </text>

      {[...tables, CREW].map((t) => (
        <TableShape
          key={t.id}
          t={t}
          guests={t.guests.map(normGuest)}
          showNames={showNames}
          editing={editing}
          onPointerDown={start(t)}
        />
      ))}

    </svg>
  );
}

const flagIcons = (g) =>
  [g.kid && "👶", g.highChair && "🪑", g.veg && "🌱", g.diet && "⚠️"].filter(Boolean).join(" ");

function TableCard({ t }) {
  const guests = t.guests.map(normGuest);
  const isMain = t.shape === "rect";
  const cap = isMain ? guests.length : CAPACITY;
  const over = guests.length - cap;
  const kids = guests.filter((g) => g.kid).length;
  const high = guests.filter((g) => g.highChair).length;
  const veg = guests.filter((g) => g.veg).length;
  const diet = guests.filter((g) => g.diet).length;
  const kidMeal = guests.filter((g) => g.meal === "kid").length;
  const noMeal = guests.filter((g) => g.meal === "none").length;

  return (
    <article className={`zs-card ${over > 0 ? "over" : ""}`}>
      <header>
        <span className="zs-card-num">{t.id === "crew" ? "DJ" : t.id}</span>
        <div>
          <h3>{t.name ?? `Stôl ${t.id}`}</h3>
          <p className="zs-card-meta">
            {guests.length} {isMain ? "miest" : `/ ${cap} miest`}
            {kids > 0 && ` · ${kids} ${kids === 1 ? "dieťa" : kids < 5 ? "deti" : "detí"}`}
            {high > 0 && ` · ${high} ${high === 1 ? "detská stolička" : "detské stoličky"}`}
            {veg > 0 && ` · ${veg} vege`}
            {diet > 0 && ` · ${diet} ${diet === 1 ? "diéta" : diet < 5 ? "diéty" : "diét"}`}
            {kidMeal > 0 && ` · ${kidMeal} ${kidMeal === 1 ? "detská porcia" : "detské porcie"}`}
            {noMeal > 0 && ` · ${noMeal} bez jedla`}
            {t.vysluzky > 0 && ` · ${t.vysluzky} výslužky`}
          </p>
          {over > 0 && <p className="zs-warn">⚠ preplnené o {over}</p>}
        </div>
      </header>

      <svg
        className={`zs-mini ${isMain ? "wide" : ""}`}
        viewBox={isMain ? "-3 -0.6 6 2.3" : "-3.3 -3.3 6.6 6.6"}
        aria-hidden="true"
      >
        <TableShape t={{ ...t, x: 0, y: 0 }} guests={guests} showNames={false} />
        {chairSpots(t, guests.length).map((s, i) => {
          const k = 1.62;
          return (
            <text
              key={i}
              className="zs-mini-name"
              x={isMain ? s.x : s.x * k}
              y={isMain ? s.y + 0.6 : s.y * k + 0.08}
              textAnchor={isMain || Math.abs(s.x) < 0.3 ? "middle" : s.x > 0 ? "start" : "end"}
            >
              {i + 1}
            </text>
          );
        })}
      </svg>

      <ol className="zs-list">
        {guests.map((g, i) => (
          <li key={i} className={g.kid ? "kid" : ""}>
            <span className="zs-list-name">{g.name}</span>
            <span className="zs-list-flags">
              {flagIcons(g)}
              {g.meal === "kid" && <span className="zs-pill">detská porcia</span>}
              {g.meal === "none" && <span className="zs-pill none">bez jedla</span>}
              {g.diet && <em> {g.diet}</em>}
              {g.note && <em> {g.note}</em>}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function loadPositions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export default function Zasadaci() {
  const [positions, setPositions] = useState(loadPositions);
  const [editing, setEditing] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      /* nevadí */
    }
  }, [positions]);

  const tables = TABLES.map((t) => ({ ...t, ...positions[t.id] }));
  const setPos = (id, x, y) => setPositions((p) => ({ ...p, [id]: { x, y } }));

  const all = TABLES.flatMap((t) => t.guests.map(normGuest));
  const crew = CREW.guests.map(normGuest);
  const totals = {
    guests: all.length,
    adults: all.filter((g) => !g.kid).length,
    kids: all.filter((g) => g.kid).length,
    high: all.filter((g) => g.highChair).length,
    veg: all.filter((g) => g.veg).length,
    diet: [...all, ...crew].filter((g) => g.diet).length,
    kidMeal: all.filter((g) => g.meal === "kid").length,
    noMeal: all.filter((g) => g.meal === "none").length,
    vysluzky: TABLES.reduce((s, t) => s + (t.vysluzky ?? 0), 0),
  };

  const copyPositions = async () => {
    const txt = tables.map((t) => `{ id: ${t.id}, x: ${t.x}, y: ${t.y} }`).join(",\n");
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.log(txt);
    }
  };

  return (
    <div className="zs">
      <div className="zs-toolbar no-print">
        <label>
          <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} />
          Mená v pláne
        </label>
        <label>
          <input type="checkbox" checked={editing} onChange={(e) => setEditing(e.target.checked)} />
          Upraviť rozloženie (ťahať stoly)
        </label>
        {Object.keys(positions).length > 0 && (
          <>
            <button onClick={copyPositions}>{copied ? "Skopírované ✓" : "Kopírovať pozície"}</button>
            <button onClick={() => setPositions({})}>Reset pozícií</button>
          </>
        )}
        <button onClick={() => window.print()}>Tlačiť / PDF</button>
      </div>

      <header className="zs-head">
        <p className="zs-eyebrow">Eva &amp; Michal · pre hotel</p>
        <h1>Zasadací poriadok</h1>
        <ul className="zs-totals">
          <li><b>{totals.guests}</b> hostí</li>
          <li><b>+{crew.length}</b> DJ / foto / kamera</li>
          <li><b>{totals.adults}</b> dospelí</li>
          <li><b>{totals.kids}</b> deti</li>
          <li><b>{totals.high}</b> detské stoličky</li>
          <li><b>{totals.veg}</b> vege</li>
          <li><b>{totals.diet}</b> diéty</li>
          <li><b>{totals.kidMeal}</b> detské porcie</li>
          <li><b>{totals.noMeal}</b> bez jedla</li>
          <li><b>{totals.vysluzky}</b> výslužky</li>
          <li><b>{TABLES.length}</b> stolov + stôl DJ/foto/kamera</li>
        </ul>
      </header>

      <section className="zs-section">
        <h2>1 · Rozmiestnenie stolov</h2>
        <FloorPlan tables={tables} setPos={setPos} editing={editing} showNames={showNames} />
        <ul className="zs-legend">
          <li><i className="sw chair" /> dospelý</li>
          <li><i className="sw kid" /> dieťa</li>
          <li><i className="sw high" /> detská stolička</li>
          <li><i className="sw diet" /> vege / diéta</li>
          <li>farebné čísla v stole = počet detí / detských stoličiek / vege a diét</li>
        </ul>
      </section>

      <section className="zs-section">
        <h2>2 · Stoly a menovky</h2>
        <p className="zs-legend-inline">
          👶 dieťa · 🪑 detská stolička · 🌱 vegetarián · ⚠️ diéta / alergia
        </p>
        <div className="zs-cards">
          {[...tables, CREW].map((t) => (
            <TableCard key={t.id} t={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
