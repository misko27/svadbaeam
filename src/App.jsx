import { useState, useEffect, useRef } from "react";
import "./App.css";
import Tajnicka from "./Tajnicka.jsx";
import Dovolenka from "./Dovolenka.jsx";
import Zasadaci from "./Zasadaci.jsx";

// Sem vlož URL z Apps Script deployu (Deploy → New deployment → Web app).
// Vyzerá takto: https://script.google.com/macros/s/AKfyc.../exec
const FORM_URL =
  "https://script.google.com/macros/s/AKfycbxS1iUD7cwccDRbaMxPQvN9yGFYPtGf7aWABF9QJRs4Ayvkc3MSh3QKqZgYO6HBLwnD/exec";

function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Skrytá stránka s tajničkou do svadobných novín: /#tajnicka
  if (hash === "#tajnicka") return <Tajnicka />;
  // Skrytá stránka so svadobnou cestou do Peru: /#dovolenka
  if (hash === "#dovolenka") return <Dovolenka />;
  // Skrytá stránka so zasadacím poriadkom (pre nás a hotel): /#zasadaci
  if (hash === "#zasadaci") return <Zasadaci />;

  return (
    <div className="app">
      <Hero />
      <Countdown />
      <Venues />
      <Program />
      <Organization />
      <Transport />
      <Accommodation />
      <RsvpForm />
      <Footer />
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-photo">
          <img
            src="/nasa-fotka.jpeg"
            alt="Eva a Michal"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <h1 className="names">Eva & Michal</h1>
        <p className="date">30. októbra 2026</p>
        <div className="ornament"></div>
      </div>
      <Mountains />
    </section>
  );
}

/* ─── Hory (abstraktná silueta) ─── */
function Mountains() {
  return (
    <svg
      className="mountains"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="mtn mtn-back"
        d="M0,220 L200,120 L380,205 L560,95 L760,190 L960,110 L1180,200 L1440,130 L1440,320 L0,320 Z"
      />
      <path
        className="mtn mtn-mid"
        d="M0,258 L260,180 L480,250 L700,160 L920,242 L1160,172 L1440,240 L1440,320 L0,320 Z"
      />
      <path
        className="mtn mtn-front"
        d="M0,300 L240,252 L520,300 L780,244 L1040,300 L1320,254 L1440,292 L1440,320 L0,320 Z"
      />
    </svg>
  );
}

/* ─── Countdown ─── */
function Countdown() {
  const targetDate = new Date("2026-10-30T14:00:00");

  function getTimeLeft() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown" id="countdown">
      <div className="countdown-grid">
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.days}</span>
          <span className="countdown-label">dní</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.hours}</span>
          <span className="countdown-label">hodín</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.minutes}</span>
          <span className="countdown-label">minút</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.seconds}</span>
          <span className="countdown-label">sekúnd</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Miesta (Obrad + Hostina vedľa seba) ─── */
function Venues() {
  return (
    <section className="info-section" id="miesta">
      <FadeIn>
        <div className="venue-grid">
          <div className="venue">
            <h2>Obrad</h2>
            <p className="info-time">o 14:00 hod.</p>
            <p className="info-place">
              Artikulárny drevený kostolík, Leštiny
            </p>
            <a
              href="https://maps.google.com/?q=Artikulárny+drevený+kostolík+Leštiny"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              📍 Zobraziť na mape
            </a>
          </div>
          <div className="venue">
            <h2>Hostina</h2>
            <p className="info-time">od 16:00 hod.</p>
            <p className="info-place">
              Hotel Park, Radlinského 21, 026 01 Dolný Kubín
            </p>
            <a
              href="https://maps.google.com/?q=Hotel+Park+Radlinského+21+Dolný+Kubín"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              📍 Zobraziť na mape
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Program ─── */
function Program() {
  return (
    <section className="info-section" id="program">
      <FadeIn>
        <h2>Program</h2>
        <p className="info-text">
          Podrobný program dňa ešte pripravujeme – doplníme ho sem čoskoro.
        </p>
        <p className="info-note">(text doladíme)</p>
      </FadeIn>
    </section>
  );
}

/* ─── Doprava / autobus + parkovanie ─── */
function Transport() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section className="info-section" id="doprava">
      <FadeIn>
        <h2>Doprava</h2>
        <p className="info-text">
          Pre hostí bude pripravený autobus. Vyráža z Kubínskej hole, okolo
          13:30 zastaví pri Hoteli Park v Dolnom Kubíne a odtiaľ pokračuje ku
          kostolíku v Leštinách tak, aby sme všetci boli na mieste pred obradom
          o 14:00. Po obrade autobus zabezpečí odvoz ku Hotelu Park.
        </p>
        <div className="transport-block">
          <h3 className="transport-title">Parkovanie pri hoteli</h3>
          <p className="info-text">
            Ak prídete autom, nechajte ho pokojne pri Hoteli Park a ku kostolu
            sa odvezte autobusom. Auto tam môže bez obáv zostať aj cez noc.
            K dispozícii sú dve parkoviská:
          </p>
          <ul className="parking-list">
            <li>
              <span className="parking-tag">P1</span> priamo pri Hoteli Park
            </li>
            <li>
              <span className="parking-tag">P2</span> väčšie parkovisko pri
              Daňovom úrade, cca 2 minúty pešo
            </li>
          </ul>
          <p className="parking-note">
            Ak sa už pri hoteli nezmestíte, využite parkovisko pri Daňovom
            úrade. Prvá hodina je tam zdarma a od 16:00 sa neplatí počas celého
            víkendu – ak teda prídete skôr, doplatíte si len čas do 16:00
            (0,60 € za hodinu).
          </p>
          <figure className="parking-map">
            <button
              type="button"
              className="parking-map-btn"
              onClick={() => setLightbox("/parkovanie-hotel.jpeg")}
            >
              <img
                src="/parkovanie-hotel.jpeg"
                alt="Mapa parkovania pri Hoteli Park v Dolnom Kubíne"
                loading="lazy"
              />
            </button>
          </figure>
        </div>

        <div className="transport-block">
          <h3 className="transport-title">Parkovanie pri kostole</h3>
          <p className="info-text">
            Kapacita autobusu je obmedzená, takže časť hostí pôjde ku kostolíku
            vlastným autom. Priamo pri kostole sa dá zaparkovať len ťažko, no v
            obci je niekoľko možností – všetky sú pár minút pešo od kostolíka:
          </p>
          <ul className="parking-list">
            <li>
              <span className="parking-tag">P1</span> pri evanjelickom farskom
              úrade
            </li>
            <li>
              <span className="parking-tag">P2</span> pri obecnom úrade
            </li>
            <li>
              <span className="parking-tag">P3</span> pri hlavnej ceste, smerom
              na Leštiny 83
            </li>
            <li>
              <span className="parking-tag">P4</span> pri firme Plastiks
            </li>
          </ul>
          <figure className="parking-map">
            <button
              type="button"
              className="parking-map-btn"
              onClick={() => setLightbox("/parkovanie-kostol.jpeg")}
            >
              <img
                src="/parkovanie-kostol.jpeg"
                alt="Mapa parkovania pri drevenom artikulárnom kostolíku v Leštinách"
                loading="lazy"
              />
            </button>
          </figure>
        </div>
      </FadeIn>

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

/* ─── Lightbox (zväčšená mapa) ─── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button type="button" className="lightbox-close" aria-label="Zavrieť">
        ×
      </button>
      <img src={src} alt="" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

/* ─── Organizácia ─── */
function Organization() {
  return (
    <section className="info-section" id="organizacia">
      <FadeIn>
        <h2>Organizácia</h2>
        <p className="info-text">
          Obrad a hostina sa konajú na dvoch rozdielnych miestach, vzdialených
          od seba približne 15 minút cesty. Pre tých, ktorí nebudú mať vlastný
          odvoz, bude zabezpečená autobusová doprava. Pri hoteli je parkovanie k
          dispozícii, no pri kostole sú miesta obmedzené, preto odporúčame prísť
          s predstihom alebo využiť spoločný odvoz.
        </p>
        <p className="info-text">
          Keďže sa naša svadba koná na sklonku jesene, v kostole aj vonku môže
          byť chladnejšie – oblečte sa elegantne, ale nezabudnite aj na niečo
          teplé navyše.
        </p>
      </FadeIn>
    </section>
  );
}

/* ─── Ubytovanie ─── */
function Accommodation() {
  return (
    <section className="info-section" id="ubytovanie">
      <FadeIn>
        <h2>Ubytovanie</h2>
        <p className="info-text">
          Ubytovať sa môžete priamo v Hoteli Park, kde sa koná hostina, alebo aj
          v okolí. Radi vám pomôžeme s výberom – neváhajte nás kontaktovať.
        </p>
      </FadeIn>
    </section>
  );
}

/* ─── RSVP Form ─── */
function RsvpForm() {
  const [guestCount, setGuestCount] = useState(1);
  const [guests, setGuests] = useState([createEmptyGuest()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function createEmptyGuest() {
    return { name: "", food: "", portion: "", drink: "", allergies: "" };
  }

  function handleGuestCountChange(e) {
    const count = parseInt(e.target.value, 10);
    setGuestCount(count);
    setGuests((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array(count - prev.length)
            .fill(null)
            .map(() => createEmptyGuest()),
        ];
      }
      return prev.slice(0, count);
    });
  }

  function updateGuest(index, field, value) {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  function validate() {
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name.trim() || !g.food || !g.portion || !g.drink) {
        return `Prosím vyplňte všetky povinné polia pre hosťa ${i + 1}.`;
      }
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(FORM_URL, {
        method: "POST",
        // text/plain = "simple request" → bez CORS preflightu, ktorý Apps Script nevie spracovať
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ guests }),
      });
      if (!res.ok) throw new Error("Network error");
      setSubmitted(true);
    } catch {
      setError("Niečo sa pokazilo. Skúste to prosím znova.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="rsvp" id="formular">
        <div className="rsvp-success">
          <h2>Ďakujeme!</h2>
          <p>Tešíme sa na vás 🤍</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rsvp" id="formular">
      <FadeIn>
        <h2>Povedzte nám o vás niečo viac</h2>
        <p className="rsvp-subtitle">
          Aby sme vedeli všetko dokonale pripraviť a nikto nezostal hladný či
          smädný, potrebujeme pár detailov o každom z vás.
        </p>

        <form onSubmit={handleSubmit} className="rsvp-form">
          <div className="form-group">
            <label htmlFor="guest-count">Koľko hostí prídete?</label>
            <select
              id="guest-count"
              value={guestCount}
              onChange={handleGuestCountChange}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {guests.map((guest, index) => (
            <div key={index} className="guest-block">
              <h3>Hosť {index + 1}</h3>

              <div className="form-group">
                <label htmlFor={`name-${index}`}>Meno a priezvisko *</label>
                <input
                  id={`name-${index}`}
                  type="text"
                  value={guest.name}
                  onChange={(e) => updateGuest(index, "name", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`food-${index}`}>Na čo máte chuť? *</label>
                <select
                  id={`food-${index}`}
                  value={guest.food}
                  onChange={(e) => updateGuest(index, "food", e.target.value)}
                  required
                >
                  <option value="">— Vyberte —</option>
                  <option value="Mäsová klasika">Mäsová klasika</option>
                  <option value="Vegetariánske jedlo">
                    Vegetariánske jedlo
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`portion-${index}`}>
                  Akú porciu vám pripravíme? *
                </label>
                <select
                  id={`portion-${index}`}
                  value={guest.portion}
                  onChange={(e) =>
                    updateGuest(index, "portion", e.target.value)
                  }
                  required
                >
                  <option value="">— Vyberte —</option>
                  <option value="Klasická dospeláčka">
                    Klasická dospeláčka
                  </option>
                  <option value="Menšia detská porcia">
                    Menšia detská porcia
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`drink-${index}`}>
                  Čo vám môžeme naliať? *
                </label>
                <textarea
                  id={`drink-${index}`}
                  value={guest.drink}
                  onChange={(e) => updateGuest(index, "drink", e.target.value)}
                  placeholder="Napr. víno – červené, prosecco, pivo, slivovica, gin, nealko..."
                  rows="2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`allergies-${index}`}>
                  Špeciálne požiadavky
                </label>
                <textarea
                  id={`allergies-${index}`}
                  value={guest.allergies}
                  onChange={(e) =>
                    updateGuest(index, "allergies", e.target.value)
                  }
                  placeholder="Napr. bez lepku, bez laktózy, alergia na orechy..."
                  rows="3"
                />
              </div>
            </div>
          ))}

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-submit"
            disabled={submitting}
          >
            {submitting ? "Odosielam..." : "Odoslať"}
          </button>
        </form>
      </FadeIn>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="footer" id="kontakt">
      <p>V prípade akýchkoľvek otázok nás neváhajte kontaktovať</p>
      <p>
        <a href="tel:+421910329045" className="footer-phone">
          +421 910 329 045
        </a>
      </p>
      <p className="footer-deadline">
        Prosíme o potvrdenie účasti do 1. 9. 2026
      </p>
      <p className="footer-copy">© 2026 Evka & Michal</p>
    </footer>
  );
}

/* ─── FadeIn helper ─── */
function FadeIn({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fade-in ${visible ? "visible" : ""}`}>
      {children}
    </div>
  );
}

export default App;
