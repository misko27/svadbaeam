import "./Rozpocet.css";

// Lokálna stránka s rozpočtom svadby: /#rozpocet (len na `npm run dev`, na webe nie je).
// Dáta sú v src/rozpocet-data.js – ten je v .gitignore, takže sa nedostane
// do verejného repa. Keď súbor chýba (napr. čerstvý clone), stránka je prázdna.
const data = Object.values(import.meta.glob("./rozpocet-data.js", { eager: true }))[0] ?? {};
const VYDAVKY = data.VYDAVKY ?? [];
const DARY = data.DARY ?? [];

const eur = (n) =>
  n.toLocaleString("sk-SK", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

const sum = (list) => list.reduce((s, x) => s + (Number(x.amount) || 0), 0);

/* ─── Rozpočet (lokálna stránka #rozpocet) ─── */
export default function Rozpocet() {
  const spent = sum(VYDAVKY);
  const gifts = sum(DARY);
  const balance = gifts - spent;

  return (
    <div className="roz">
      <header className="roz-hero">
        <p className="roz-eyebrow">Eva a Michal · 30. 10. 2026</p>
        <h1 className="roz-title">Rozpočet</h1>
      </header>

      <main className="roz-wrap">
        <div className="roz-summary">
          <div className="roz-stat">
            <span>Výdavky</span>
            <strong>{eur(spent)}</strong>
          </div>
          <div className="roz-stat">
            <span>Dary</span>
            <strong>{eur(gifts)}</strong>
          </div>
          <div className={`roz-stat roz-balance ${balance >= 0 ? "is-plus" : "is-minus"}`}>
            <span>Bilancia</span>
            <strong>{balance > 0 ? "+" : ""}{eur(balance)}</strong>
          </div>
        </div>

        <div className="roz-cols">
          <section className="roz-col">
            <h2 className="roz-h2">Výdavky</h2>
            {VYDAVKY.length === 0 ? (
              <p className="roz-empty">Zatiaľ žiadne výdavky.</p>
            ) : (
              <ul className="roz-list">
                {VYDAVKY.map((v, i) => (
                  <li key={i} className="roz-row">
                    <div>
                      {v.cat && <span className="roz-cat">{v.cat}</span>}
                      <span className="roz-name">{v.title}</span>
                      {v.note && <span className="roz-note">{v.note}</span>}
                    </div>
                    <span className="roz-amount">
                      {v.amount ? eur(Number(v.amount)) : <em className="roz-gift">zadarmo</em>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="roz-total">
              <span>Spolu</span>
              <strong>{eur(spent)}</strong>
            </div>
          </section>

          <section className="roz-col">
            <h2 className="roz-h2">Dary</h2>
            {DARY.length === 0 ? (
              <p className="roz-empty">Zatiaľ žiadne dary.</p>
            ) : (
              <ul className="roz-list">
                {DARY.map((d, i) => (
                  <li key={i} className="roz-row">
                    <div>
                      <span className="roz-name">{d.from}</span>
                      {d.note && <span className="roz-note">{d.note}</span>}
                    </div>
                    <span className="roz-amount">
                      {d.amount ? eur(Number(d.amount)) : <em className="roz-gift">vecný dar</em>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="roz-total">
              <span>Spolu</span>
              <strong>{eur(gifts)}</strong>
            </div>
          </section>
        </div>

        <a className="roz-back" href="#">← späť na svadobnú stránku</a>
      </main>
    </div>
  );
}
