import { useEffect } from "react";
import "./Dovolenka.css";

// Skrytá stránka so svadobnou cestou: /#dovolenka
// Všetko sa upravuje v dátach nižšie – stránka sa prekreslí sama.

const TRIP_START = "2026-11-27";
const TRIP_END = "2026-12-13";

// Doklady (letenky, vstupenky, ubytovanie…).
// `file`: PDF v priečinku public/dovolenka/ (napr. "air-france.pdf") – ten je
//   v .gitignore, takže sa NEdostane do verejného repa ani na web, funguje len lokálne.
// `url`: odkaz napr. na Google Drive (zdieľanie "len my dvaja") – funguje všade.
//   DRIVE_FOLDER = celý priečinok "peru"; lepší je link priamo na súbor.
// Bez `file` aj `url` sa zobrazí ako "doplniť".
const DRIVE_FOLDER = "https://drive.google.com/drive/folders/1_V2MJ83ogQaJXQ1D1M1udpVJjadcEJWq";

const DOCS = [
  { cat: "Lety", title: "Air France · Michal", note: "Elektronická_letenka.pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Lety", title: "Air France · Eva", note: "Elektronická_letenka (1).pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Lety", title: "LATAM · Lima → Cusco", note: "28.11., 8:05 · boarding pass ešte nemáme, bude tu po online check-ine", file: "", url: "https://www.latamairlines.com/uy/en/my-trips" },
  { cat: "Lety", title: "Arequipa → Lima", note: "10.12. – ešte kúpiť", file: "", url: "" },
  { cat: "Machu Picchu", title: "1-A Montaña · 7:00 · oboch", note: "Boletos_3106805 (1).pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Machu Picchu", title: "3-B dolná citadela · 12:00 · oboch", note: "Boletos_3106812 (1).pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Vlaky", title: "PeruRail · oba vlaky · oboch", note: "WEB3242904.pdf · Vistadome 30.11. + Expedition 1.12.", file: "", url: DRIVE_FOLDER },
  { cat: "Machu Picchu", title: "Bus Consettur", note: "hore k Machu Picchu", file: "", url: "" },
  { cat: "Ubytovanie", title: "Lima pri letisku", note: "27.–28.11.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Posvätné údolie", note: "28.–30.11.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Aguas Calientes · Hotel Horizonte", note: "Booking.com_ Potvrdenie.pdf · 30.11.–1.12.", file: "", url: DRIVE_FOLDER },
  { cat: "Ubytovanie", title: "Cusco", note: "1.–4.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Puno", note: "4.–6.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Chivay", note: "6.–7.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Arequipa", note: "7.–10.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Lima Miraflores / Barranco", note: "10.–11.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Viedeň", note: "12.–13.12.", file: "", url: "" },
  { cat: "Ostatné", title: "Cestovné poistenie", note: "", file: "", url: "" },
  { cat: "Ostatné", title: "Kópia sobášneho listu", note: "k Evinej vstupenke na MP", file: "", url: "" },
];

const STOPS = [
  { place: "Lima", sub: "pri letisku", nights: 1, dates: "27.–28.11." },
  { place: "Posvätné údolie", sub: "Urubamba / Ollantaytambo", nights: 2, dates: "28.–30.11." },
  {
    place: "Aguas Calientes", sub: "Machu Picchu", nights: 1, dates: "30.11.–1.12.",
    hotel: {
      name: "Hotel Horizonte",
      address: "Av. Hermanos Ayar 503-H",
      phone: "+51 902 903 588",
      maps: "https://www.google.com/maps/search/?api=1&query=-13.15442,-72.52687",
      info: "Príchod od 12:00 · raňajky v cene · Booking.com",
    },
  },
  { place: "Cusco", nights: 3, dates: "1.–4.12." },
  { place: "Puno", sub: "Titicaca", nights: 2, dates: "4.–6.12." },
  { place: "Colca", sub: "Chivay", nights: 1, dates: "6.–7.12." },
  { place: "Arequipa", nights: 3, dates: "7.–10.12." },
  { place: "Lima", sub: "Miraflores / Barranco", nights: 1, dates: "10.–11.12." },
  { place: "Viedeň", nights: 1, dates: "12.–13.12." },
];

const FLIGHTS = [
  {
    status: "done", from: "VIE", to: "LIM", fromCity: "Viedeň", toCity: "Lima",
    date: "Pi 27.11.", time: "6:15 → 16:55", carrier: "Air France", via: "AF1239 → CDG 8:35 · prestup 1:50 (2F → 2E) · AF0500 10:25",
    note: "Na letisku ~4:15, odbavenie končí 5:35. 1× 23 kg na osobu.",
  },
  {
    status: "done", from: "LIM", to: "CUZ", fromCity: "Lima", toCity: "Cusco",
    date: "So 28.11.", time: "8:05 → 9:30", carrier: "LATAM", via: "priamy",
    note2: "Boarding pass zatiaľ nemáme – nájdeš ho v LATAM „My trips“ po online check-ine.",
    note: "Eva: aktualizovať číslo nového pasu v rezervácii alebo pri check-ine",
  },
  {
    status: "todo", from: "AQP", to: "LIM", fromCity: "Arequipa", toCity: "Lima",
    date: "Št 10.12.", time: "", carrier: "LATAM / Sky / JetSMART", via: "",
    note: "Treba kúpiť. Pri Sky a JetSMART pozrieť poplatky za batožinu.",
  },
  {
    status: "done", from: "LIM", to: "VIE", fromCity: "Lima", toCity: "Viedeň",
    date: "Pi 11.12.", time: "19:20 → 17:25 (+1)", carrier: "Air France", via: "AF0501 → CDG 13:45 · prestup 1:40 (2E → 2F) · AF1738 15:25",
    note: "Odbavenie končí 18:20. Prílet v sobotu 12.12. Na letisko s rezervou, doprava v Lime je pomalá.",
  },
];

const DAYS = [
  { date: "2026-11-27", label: "Pi 27.11.", place: "Viedeň → Lima", text: "Odlet, prestup v Paríži, prílet večer. Noc v hoteli pri letisku.", tags: ["✈ 6:15 VIE"] },
  { date: "2026-11-28", label: "So 28.11.", place: "Posvätné údolie", text: "Ráno let do Cusca, taxi rovno dole do údolia (~1,5 h). Pomalý deň na aklimatizáciu, pri dobrom pocite trh a ruiny v Pisacu.", tags: ["✈ 8:05 LATAM"] },
  { date: "2026-11-29", label: "Ne 29.11.", place: "Posvätné údolie", text: "Chinchero (kostol, tkáčske družstvá), Moray (kruhové terasy), soľné polia Maras." },
  { date: "2026-11-30", label: "Po 30.11.", place: "Aguas Calientes", text: "Dopoludnia pevnosť a mesto Ollantaytambo, potom vlakom do Aguas Calientes. Spíme v Hotel Horizonte. Na stanici do 12:25. Vo vlaku max. 8 kg batožiny na osobu – veľké kufre nechať v údolí / poslať do Cusca.", tags: ["🚆 12:55 → 14:25 Vistadome", "vozeň A · 5, 6"] },
  { date: "2026-12-01", label: "Ut 1.12.", place: "Machu Picchu → Cusco", text: "Bus Consettur hore (vyraziť ~6:00). Machu Picchu Mountain, potom dolná citadela. Večer vlakom priamo do Cusca (San Pedro).", tags: ["⛰ 1-A 7:00", "3-B 12:00", "🚆 16:43 → 21:23", "vozeň F · 39, 40"], highlight: true },
  { date: "2026-12-02", label: "St 2.12.", place: "Cusco", text: "Plaza de Armas, katedrála, Qorikancha, štvrť San Blas, trh San Pedro. Večer dobrá reštaurácia." },
  { date: "2026-12-03", label: "Št 3.12.", place: "Cusco", text: "Ráno Sacsayhuamán a okolité ruiny, poobede Museo de Arte Precolombino alebo kurz varenia či čokolády." },
  { date: "2026-12-04", label: "Pi 4.12.", place: "Cusco → Puno", text: "Turistický bus (~10 h) so zastávkami: Andahuaylillas, Raqchi, La Raya, Pukara." },
  { date: "2026-12-05", label: "So 5.12.", place: "Titicaca", text: "Loďou na Uros a Taquile, obed u miestnych. Alternatíva: noc u rodiny na Amantaní." },
  { date: "2026-12-06", label: "Ne 6.12.", place: "Puno → Colca", text: "Bus (~6 h) cez náhornú plošinu a priesmyk Patapampa (~4 900 m). Poobede termály La Calera." },
  { date: "2026-12-07", label: "Po 7.12.", place: "Colca → Arequipa", text: "Skoro ráno kondory na Cruz del Cóndor, dedinky Yanque a Maca, poobede presun do Arequipy (~3–4 h)." },
  { date: "2026-12-08", label: "Ut 8.12.", place: "Arequipa", text: "Kláštor Santa Catalina, Plaza de Armas, Museo Santuarios Andinos, večer picantería. Sviatok, možné procesie." },
  { date: "2026-12-09", label: "St 9.12.", place: "Arequipa", text: "Oddychový deň: vyhliadka Yanahuara, trh San Camilo, Mundo Alpaca." },
  { date: "2026-12-10", label: "Št 10.12.", place: "Arequipa → Lima", text: "Let do Limy, poobede Barranco a západ slnka, večer slávnostná večera.", tags: ["✈ AQP → LIM"] },
  { date: "2026-12-11", label: "Pi 11.12.", place: "Lima → odlet", text: "Historické centrum a kláštor San Francisco alebo Museo Larco, obed ceviche. Na letisko s rezervou 1,5–2 h, večer odlet.", tags: ["✈ 19:20 LIM"] },
  { date: "2026-12-12", label: "So 12.12.", place: "Viedeň", text: "Prílet 17:25, noc vo Viedni." },
  { date: "2026-12-13", label: "Ne 13.12.", place: "Domov", text: "" },
];

const TODO = [
  {
    group: "Lety",
    items: [
      { text: "Dlhé lety Viedeň ⇄ Lima", note: "Air France", done: true },
      { text: "Let Lima → Cusco, 28.11.", note: "LATAM 8:05 → 9:30", done: true },
      { text: "Let Arequipa → Lima, 10.12." },
    ],
  },
  {
    group: "Machu Picchu",
    items: [
      { text: "Vstupenky na Machu Picchu, 1.12.", note: "1-A Montaña 7:00 a 3-B 12:00, 2 osoby", done: true },
      { text: "Vlak Ollantaytambo → Aguas Calientes, 30.11.", note: "PeruRail Vistadome 73P, 12:55 → 14:25", done: true },
      { text: "Vlak Aguas Calientes → Cusco (San Pedro), 1.12.", note: "PeruRail Expedition 32, 16:43 → 21:23", done: true },
      { text: "Bus Consettur hore k Machu Picchu", note: "kúpiť zvlášť" },
      { text: "Veľká batožina z údolia do Cusca", note: "vo vlaku max. 8 kg/os. – spýtať sa hotela v údolí alebo šoféra" },
      { text: "Opraviť číslo pasu na lístku 3-B (Michal)", note: "má deviatku navyše – napísať na tuboleto@cultura.gob.pe" },
    ],
  },
  {
    group: "Ubytovanie",
    items: [
      { text: "Lima pri letisku (27.11.)" },
      { text: "Posvätné údolie, 2 noci" },
      { text: "Aguas Calientes, 1 noc (30.11.)", note: "Hotel Horizonte, Booking.com", done: true },
      { text: "Hotel Horizonte: skorý odchod 1.12. ~6:00 a úschova batožiny do vlaku 16:43", note: "odchod je oficiálne 8:00–9:00 – napísať hotelu cez Booking" },
      { text: "Cusco, 3 noci" },
      { text: "Puno, 2 noci", note: "alebo 1 noc Puno + 1 noc Amantaní" },
      { text: "Chivay, 1 noc" },
      { text: "Arequipa, 3 noci" },
      { text: "Lima Miraflores / Barranco, 1 noc" },
      { text: "Viedeň, 1 noc (12.12.)" },
    ],
  },
  {
    group: "Presuny a výlety",
    items: [
      { text: "Transfer Cusco letisko → Posvätné údolie (28.11.)" },
      { text: "Šofér na výlet Chinchero, Moray, Maras (29.11.)" },
      { text: "Turistický bus Cusco → Puno (4.12.)" },
      { text: "Výlet loďou Uros + Taquile (5.12.)" },
      { text: "Bus / tour Puno → Colca → Arequipa (6.–7.12.)" },
    ],
  },
  {
    group: "Nahrať na Drive",
    items: [
      { text: "E-letenky Air France (oboch)", done: true },
      { text: "Vstupenky Machu Picchu 1-A a 3-B", done: true },
      { text: "Lístky PeruRail (oba vlaky)", done: true },
      { text: "Potvrdenie Hotel Horizonte", done: true },
      { text: "Kópia sobášneho listu", note: "po svadbe 30.10." },
      { text: "Scany pasov (oba Evine + Michalov)", note: "pre prípad straty" },
      { text: "Boarding pass LATAM Lima → Cusco", note: "po online check-ine" },
      { text: "Let Arequipa → Lima", note: "keď kúpime" },
      { text: "Lístky na bus Consettur", note: "keď kúpime" },
      { text: "Ostatné ubytovania, cestovné poistenie, busy a výlety", note: "priebežne" },
    ],
  },
  {
    group: "Ostatné",
    items: [
      { text: "Rezervácia večere v Lime (10.12.)", note: "ak chceme top reštauráciu" },
      { text: "Cestovné poistenie" },
      { text: "Platnosť pasov" },
      { text: "Chceme skúsiť aj Huayna Picchu?", note: "otázka" },
    ],
  },
];

const CIRCUITS = [
  { name: "1 – Panoramic", what: "Horné terasy a vyhliadky bez vstupu do citadely; 1-A je túra na Machu Picchu Mountain.", us: "Máme 1-A o 7:00" },
  { name: "2 – Classic", what: "2-A klasický pohľad zhora + celá citadela; 2-B kratšia dolná trasa.", us: "Na 1.12. vypredané" },
  { name: "3 – Royalty", what: "Dolná časť citadely bez pohľadu zhora; 3-A je strmý výstup na Huayna Picchu.", us: "Máme 3-B o 12:00" },
];

const WEATHER = [
  { place: "Cusco, údolie, Machu Picchu", sky: "Poobedňajšie prehánky, Machu Picchu ráno často v hmle", temp: "~18–20 °C cez deň, v noci chladno", icon: "🌦" },
  { place: "Puno / Titicaca", alt: "3 800 m", sky: "Slnečné rána, poobede občas búrky", temp: "v noci okolo 0 °C", icon: "⛅" },
  { place: "Colca", sky: "Zväčša v pohode, dažde slabšie ako v Cuscu", temp: "chladné noci", icon: "🌤" },
  { place: "Arequipa", sky: "Takmer stále slnko a sucho", temp: "teplo", icon: "☀️" },
  { place: "Lima", sky: "Začína leto, sucho", temp: "~22–25 °C", icon: "☀️" },
];

const LINKS = [
  { title: "Vstupenky Machu Picchu", sub: "tuboleto.cultura.pe", url: "https://tuboleto.cultura.pe" },
  { title: "PeruRail", sub: "perurail.com", url: "https://www.perurail.com" },
  { title: "Inca Rail", sub: "incarail.com", url: "https://incarail.com" },
  { title: "Consettur (bus na MP)", sub: "consettur.com", url: "https://consettur.com" },
  { title: "Air France – moje rezervácie", sub: "airfrance.sk", url: "https://wwws.airfrance.sk/trip" },
  { title: "LATAM – my trips / boarding pass", sub: "latamairlines.com", url: "https://www.latamairlines.com/uy/en/my-trips" },
];

const SECTIONS = [
  ["prehlad", "Trasa"],
  ["doklady", "Doklady"],
  ["lety", "Lety"],
  ["den-po-dni", "Deň po dni"],
  ["machu-picchu", "Machu Picchu"],
  ["vybavit", "Treba vybaviť"],
  ["pocasie", "Počasie"],
  ["linky", "Linky"],
];

/* ─── Pomocné ─── */
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function docHref(doc) {
  if (doc.url) return doc.url;
  if (doc.file) return `${import.meta.env.BASE_URL}dovolenka/${doc.file}`;
  return null;
}

/* ─── Stránka ─── */
export default function Dovolenka() {
  const today = todayISO();

  useEffect(() => {
    document.title = "Peru — svadobná cesta";
    window.scrollTo(0, 0);
    return () => {
      document.title = "Svadba — Eva & Michal";
    };
  }, []);

  return (
    <div className="dov">
      <Header today={today} />
      <Nav />
      <main className="dov-main">
        <Today today={today} />
        <Route />
        <Docs />
        <Flights />
        <Itinerary today={today} />
        <MachuPicchu />
        <Todo />
        <Weather />
        <Links />
        <a className="dov-back" href="#">← späť na svadobnú stránku</a>
      </main>
    </div>
  );
}

function Header({ today }) {
  const toStart = daysBetween(today, TRIP_START);
  const dayNo = daysBetween(TRIP_START, today) + 1;
  const total = daysBetween(TRIP_START, TRIP_END) + 1;

  let badge;
  if (toStart > 0) badge = `o ${toStart} ${toStart === 1 ? "deň" : toStart < 5 ? "dni" : "dní"} odlet`;
  else if (dayNo <= total) badge = `deň ${dayNo} z ${total}`;
  else badge = "vitajte doma ♥";

  return (
    <header className="dov-hero">
      <p className="dov-eyebrow">Svadobná cesta</p>
      <h1 className="dov-title">Peru</h1>
      <p className="dov-dates">27. novembra – 13. decembra 2026</p>
      <p className="dov-route">Cusco · Machu Picchu · Titicaca · Colca · Arequipa · Lima</p>
      <span className="dov-badge">{badge}</span>
      <svg className="dov-mtn" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,120 L180,60 L300,100 L470,30 L620,95 L780,50 L940,110 L1100,40 L1260,95 L1440,60 L1440,160 L0,160 Z" />
        <path d="M0,145 L220,105 L420,140 L640,95 L860,138 L1080,100 L1300,135 L1440,110 L1440,160 L0,160 Z" />
      </svg>
    </header>
  );
}

function Nav() {
  return (
    <nav className="dov-nav" aria-label="Sekcie">
      {SECTIONS.map(([id, label]) => (
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
    <section className="dov-section" id={id}>
      <h2 className="dov-h2">{title}</h2>
      {intro && <p className="dov-intro">{intro}</p>}
      {children}
    </section>
  );
}

function Today({ today }) {
  const day = DAYS.find((d) => d.date === today);
  if (!day) return null;
  return (
    <div className="dov-today">
      <span className="dov-today-label">Dnes · {day.label}</span>
      <h3>{day.place}</h3>
      {day.text && <p>{day.text}</p>}
      {day.tags && <Tags tags={day.tags} />}
    </div>
  );
}

function Tags({ tags }) {
  return (
    <div className="dov-tags">
      {tags.map((t) => (
        <span key={t} className="dov-tag">{t}</span>
      ))}
    </div>
  );
}

function Route() {
  const nights = STOPS.slice(0, -1).reduce((s, x) => s + x.nights, 0);
  return (
    <Section
      id="prehlad"
      title="Trasa"
      intro={`Odlet z Viedne v piatok 27.11., návrat do Viedne v sobotu 12.12., domov v nedeľu 13.12. V Peru máme ${nights} nocí. V práci sme do 26.11. a znova od 14.12.`}
    >
      <ol className="dov-route-list">
        {STOPS.map((s, i) => (
          <li key={i}>
            <span className="dov-route-dot" />
            <div>
              <strong>{s.place}</strong>
              {s.sub && <span className="dov-route-sub"> · {s.sub}</span>}
              <div className="dov-route-meta">
                {s.dates} · {s.nights} {s.nights === 1 ? "noc" : "noci"}
              </div>
              {s.hotel && (
                <div className="dov-hotel">
                  <strong>🏨 {s.hotel.name}</strong>
                  <span>{s.hotel.info}</span>
                  <span>
                    <a href={s.hotel.maps} target="_blank" rel="noreferrer">{s.hotel.address} ↗</a>
                    {" · "}
                    <a href={`tel:${s.hotel.phone.replace(/\s/g, "")}`}>{s.hotel.phone}</a>
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Docs() {
  const cats = [...new Set(DOCS.map((d) => d.cat))];
  return (
    <Section id="doklady" title="Doklady" intro="Letenky, vstupenky a ubytovanie na jednom mieste. Súbory sú na Google Drive, otvoria sa len nám dvom.">
      <a className="dov-drive" href={DRIVE_FOLDER} target="_blank" rel="noreferrer">
        <span aria-hidden="true">📁</span>
        <span>
          <strong>Otvoriť priečinok „peru“ na Google Drive</strong>
          <span>Tip: v aplikácii Drive ho označ „Dostupné offline“</span>
        </span>
      </a>
      {cats.map((cat) => (
        <div key={cat} className="dov-doc-group">
          <h3 className="dov-h3">{cat}</h3>
          <div className="dov-doc-grid">
            {DOCS.filter((d) => d.cat === cat).map((d) => {
              const href = docHref(d);
              const inner = (
                <>
                  <span className="dov-doc-icon" aria-hidden="true">{href ? "📄" : "＋"}</span>
                  <span className="dov-doc-text">
                    <strong>{d.title}</strong>
                    <span>{href ? d.note || "otvoriť" : `doplniť${d.note ? " · " + d.note : ""}`}</span>
                  </span>
                </>
              );
              return href ? (
                <a key={d.title} className="dov-doc" href={href} target="_blank" rel="noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={d.title} className="dov-doc missing">{inner}</div>
              );
            })}
          </div>
        </div>
      ))}
    </Section>
  );
}

function Flights() {
  return (
    <Section
      id="lety"
      title="Lety"
      intro="Spiatočná Viedeň ⇄ Lima s Air France cez Paríž, s 23 kg batožinou pre oboch. Vnútroštátne lety zvlášť."
    >
      <div className="dov-flights">
        {FLIGHTS.map((f) => (
          <article key={f.from + f.to} className={`dov-ticket ${f.status}`}>
            <div className="dov-ticket-top">
              <span>{f.date}</span>
              <span className={`dov-pill ${f.status}`}>{f.status === "done" ? "kúpené" : "treba kúpiť"}</span>
            </div>
            <div className="dov-ticket-route">
              <div>
                <div className="dov-iata">{f.from}</div>
                <div className="dov-city">{f.fromCity}</div>
              </div>
              <div className="dov-plane" aria-hidden="true">✈</div>
              <div className="right">
                <div className="dov-iata">{f.to}</div>
                <div className="dov-city">{f.toCity}</div>
              </div>
            </div>
            <div className="dov-ticket-bottom">
              <div>
                <span className="dov-k">Čas</span>
                <span>{f.time || "—"}</span>
              </div>
              <div>
                <span className="dov-k">Spoločnosť</span>
                <span>{f.carrier}</span>
              </div>
              {f.via && (
                <div>
                  <span className="dov-k">Trasa</span>
                  <span>{f.via}</span>
                </div>
              )}
            </div>
            {f.note && <p className="dov-ticket-note">{f.note}</p>}
            {f.note2 && <p className="dov-ticket-note">{f.note2}</p>}
          </article>
        ))}
      </div>
    </Section>
  );
}

function Itinerary({ today }) {
  return (
    <Section
      id="den-po-dni"
      title="Deň po dni"
      intro="Najprv Cusco a Machu Picchu, kým menej prší, na záver suchá Arequipa a letná Lima."
    >
      <ol className="dov-days">
        {DAYS.map((d) => (
          <li
            key={d.date}
            className={[
              "dov-day",
              d.date === today ? "is-today" : "",
              d.date < today ? "is-past" : "",
              d.highlight ? "is-highlight" : "",
            ].join(" ")}
          >
            <div className="dov-day-date">{d.label}</div>
            <div className="dov-day-body">
              <h3>{d.place}</h3>
              {d.text && <p>{d.text}</p>}
              {d.tags && <Tags tags={d.tags} />}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function MachuPicchu() {
  return (
    <Section id="machu-picchu" title="Machu Picchu · 1.12.">
      <div className="dov-mp-card">
        <div className="dov-mp-times">
          <div><span className="dov-k">~5:30–6:00</span>Bus Consettur hore</div>
          <div><span className="dov-k">7:00</span>1-A Machu Picchu Mountain (na kontrolu Montaña najneskôr do 8:00)</div>
          <div><span className="dov-k">12:00</span>3-B dolná citadela</div>
          <div><span className="dov-k">~14:00</span>Koniec, dole do mesta</div>
          <div><span className="dov-k">16:43</span>Vlak Expedition 32 → Cusco San Pedro 21:23 (na stanici do 16:13, vozeň F, miesta 39 a 40)</div>
        </div>
        <div className="dov-callout">
          <strong>Evine lístky sú na starý pas a meno Kubačková</strong> – Machu Picchu aj oba vlaky.
          Požiadať políciu o vrátenie zneplatneného pasu a zobrať starý pas, nový pas a kópiu sobášneho listu.
        </div>
        <ul className="dov-list">
          <li>Mená a čísla pasov musia presne sedieť.</li>
          <li>Tolerancia pri vstupe je 30 minút oproti času na lístku.</li>
          <li>Spätný vlak s rezervou aspoň 2–3 h po konci návštevy.</li>
        </ul>
      </div>
      <details className="dov-details">
        <summary>Okruhy na Machu Picchu</summary>
        <div className="dov-circuits">
          {CIRCUITS.map((c) => (
            <div key={c.name}>
              <strong>{c.name}</strong>
              <p>{c.what}</p>
              <span className="dov-tag">{c.us}</span>
            </div>
          ))}
        </div>
      </details>
    </Section>
  );
}

function Todo() {
  const all = TODO.flatMap((g) => g.items);
  const done = all.filter((i) => i.done).length;
  return (
    <Section
      id="vybavit"
      title="Treba vybaviť"
      intro="Najskôr dlhé lety, potom Machu Picchu a vlak, lebo majú obmedzené kapacity. Busy a výlety sa dajú riešiť bližšie k termínu."
    >
      <div className="dov-progress" aria-label={`Hotovo ${done} z ${all.length}`}>
        <div className="dov-progress-bar" style={{ width: `${(done / all.length) * 100}%` }} />
        <span>{done} / {all.length} hotovo</span>
      </div>
      <div className="dov-todo-grid">
        {TODO.map((g) => (
          <div key={g.group} className="dov-todo-group">
            <h3 className="dov-h3">{g.group}</h3>
            <ul>
              {g.items.map((it) => (
                <li key={it.text} className={it.done ? "done" : ""}>
                  <span className="dov-check" aria-hidden="true">{it.done ? "✓" : ""}</span>
                  <span>
                    {it.text}
                    {it.note && <span className="dov-todo-note"> – {it.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Weather() {
  return (
    <Section
      id="pocasie"
      title="Počasie a praktické veci"
      intro="V Andách začína obdobie dažďov: rána bývajú jasné, poobede prehánky. December je o niečo vlhkejší ako november."
    >
      <div className="dov-weather">
        {WEATHER.map((w) => (
          <div key={w.place} className="dov-weather-card">
            <span className="dov-weather-icon" aria-hidden="true">{w.icon}</span>
            <strong>{w.place}</strong>
            {w.alt && <span className="dov-k">{w.alt}</span>}
            <p>{w.sky}</p>
            <span className="dov-weather-temp">{w.temp}</span>
          </div>
        ))}
      </div>
      <ul className="dov-list">
        <li>Prvý deň vo výške brať pomaly, preto hneď z Cusca dole do údolia (~2 800 m).</li>
        <li>8.12. je v Peru sviatok Nepoškvrneného počatia Panny Márie, niektoré podniky môžu mať iné otváracie hodiny.</li>
        <li>Oblečenie vo vrstvách a pláštenka, na Titicacu aj teplé veci.</li>
        <li>Doprava v Lime je pomalá, na letisko vždy s rezervou.</li>
      </ul>
    </Section>
  );
}

function Links() {
  return (
    <Section id="linky" title="Linky">
      <div className="dov-links">
        {LINKS.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="dov-link">
            <strong>{l.title}</strong>
            <span>{l.sub} ↗</span>
          </a>
        ))}
      </div>
    </Section>
  );
}
