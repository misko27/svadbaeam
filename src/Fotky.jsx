import "./Fotky.css";

// Odkaz z Dropboxu (Žiadosť o súbory) – hostia nahrávajú bez registrácie.
// QR kód v novinách vedie na /#fotky, takže cieľ sa dá zmeniť iba tu.
const UPLOAD_URL = "https://www.dropbox.com/request/u8fi7zwug6b9yd0yrjyu";

/* ─── Fotky od hostí (stránka #fotky – QR kód zo svadobných novín) ─── */
export default function Fotky() {
  return (
    <div className="fotky-page">
      <div className="fotky-card">
        <p className="fotky-names">Eva a Michal</p>
        <p className="fotky-date">30. 10. 2026</p>
        <h1>Podeľte sa s nami o fotky</h1>
        <p className="fotky-text">
          Každá fotka a video z dnešného večera je pre nás vzácna spomienka.
          Nahrajte nám ich – bez registrácie, priamo z mobilu.
        </p>
        <a className="fotky-btn" href={UPLOAD_URL}>
          📸 Nahrať fotky a videá
        </a>
        <ol className="fotky-steps">
          <li>Ťuknite na tlačidlo vyššie</li>
          <li>Vyberte fotky z galérie (aj viac naraz)</li>
          <li>Zadajte svoje meno, aby sme vedeli, od koho sú</li>
        </ol>
        <p className="fotky-thanks">Ďakujeme! ♡</p>
      </div>
    </div>
  );
}
