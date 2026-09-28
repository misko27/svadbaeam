import { useState } from "react";
import "./Tajnicka.css";

// Tajničky – každá sa vykreslí na vlastnom papieri (samostatný screenshot).
// `key` je index písmena, ktoré leží v zvýraznenom stĺpci.
// Medzera v slove (napr. "MALÁ FATRA") = prázdne políčko bez rámika.
// Zmena slov / poradia stačí tu, mriežka sa prepočíta sama.
const PUZZLES = [
  [
    { word: "VYŠKOV", key: 1 },
    { word: "KUNIKOVCI", key: 1 },
    { word: "STUDNIČKA", key: 0 },
    { word: "HOLUBY", key: 0 },
    { word: "ANTÓNIA", key: 0 },
    { word: "MINO", key: 2 },
  ],
  // Tajnička: WEISSKUGEL
  [
    { word: "TAJWAN", key: 3 },
    { word: "TRENČÍN", key: 2 },
    { word: "TRIATLON", key: 2 },
    { word: "ZÁSNUBY", key: 2 },
    { word: "SLAVKOVSKÝ", key: 0 },
    { word: "KRSTNÁ", key: 0 },
    { word: "KUBÍN", key: 1 },
    { word: "PROGRAMÁTOR", key: 3 },
    { word: "ŠVAGER", key: 4 },
    { word: "MALÁ FATRA", key: 2 },
  ],
  // Tajnička: STUBAI
  [
    { word: "SLAVKOVSKÝ", key: 0 },
    { word: "TAJWAN", key: 0 },
    { word: "STUDNIČKA", key: 2 },
    { word: "HOLUBY", key: 4 },
    { word: "HRADEC KRÁLOVÉ", key: 2 },
    { word: "TRIATLON", key: 2 },
  ],
];

function Grid({ words, showLetters, showNumbers }) {
  const rows = words.map((w) => ({ ...w, letters: [...w.word.normalize("NFC")] }));
  // Najväčší odsadenie zľava určuje, kde je zvýraznený stĺpec.
  const keyCol = Math.max(...rows.map((w) => w.key));
  const totalCols =
    keyCol + Math.max(...rows.map((w) => w.letters.length - w.key));

  return (
    <div
      className="tajnicka-grid"
      style={{
        gridTemplateColumns: `${showNumbers ? "auto " : ""}repeat(${totalCols}, var(--cell))`,
      }}
    >
      {rows.map((w, row) => {
        const offset = keyCol - w.key;
        const cells = [];
        for (let c = 0; c < totalCols; c++) {
          const li = c - offset;
          const ch = li >= 0 && li < w.letters.length ? w.letters[li] : " ";
          const empty = ch === " ";
          cells.push(
            <div
              key={c}
              className={[
                "cell",
                empty ? "empty" : "",
                c === keyCol ? "key" : "",
              ].join(" ")}
            >
              {showLetters && !empty && ch}
            </div>,
          );
        }
        return (
          <div className="row" key={row} style={{ display: "contents" }}>
            {showNumbers && <div className="row-num">{row + 1}</div>}
            {cells}
          </div>
        );
      })}
    </div>
  );
}

export default function Tajnicka() {
  const [showLetters, setShowLetters] = useState(false);
  const [showPaper, setShowPaper] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);

  return (
    <div className="tajnicka-page">
      <div className="tajnicka-toolbar">
        <label>
          <input
            type="checkbox"
            checked={showLetters}
            onChange={(e) => setShowLetters(e.target.checked)}
          />
          Zobraziť písmená (riešenie)
        </label>
        <label>
          <input
            type="checkbox"
            checked={showNumbers}
            onChange={(e) => setShowNumbers(e.target.checked)}
          />
          Čísla riadkov
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPaper}
            onChange={(e) => setShowPaper(e.target.checked)}
          />
          Papierové pozadie
        </label>
        <span className="tajnicka-hint">
          Screenshot spravte z každého krémového panelu zvlášť.
        </span>
      </div>

      {PUZZLES.map((words, i) => (
        <div key={i} className={`tajnicka-paper ${showPaper ? "" : "plain"}`}>
          <Grid
            words={words}
            showLetters={showLetters}
            showNumbers={showNumbers}
          />
        </div>
      ))}
    </div>
  );
}
