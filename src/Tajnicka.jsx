import { useState } from "react";
import "./Tajnicka.css";

// Tajničky – každá sa vykreslí na vlastnom papieri (samostatný screenshot).
// `key` je index písmena, ktoré leží v zvýraznenom stĺpci.
// Medzera v slove (napr. "MALÁ FATRA") = prázdne políčko bez rámika.
// Zmena slov / poradia stačí tu, mriežka sa prepočíta sama.
const PUZZLES = [
  // Tajnička: YUSHAN
  [
    { word: "VYŠKOV", key: 1, q: "V akom meste pracuje nevesta?" },
    { word: "PERU", key: 3, q: "Kam letíte na svadobnú cestu?" },
    { word: "SLAVKOVSKÝ", key: 0, q: "Na ktorom štíte sa novomanželia spoznali?" },
    { word: "CHAMELEÓN", key: 1, q: "Aké domáce zviera chovajú novomanželia?" },
    { word: "ANTÓNIA", key: 0, q: "Meno ženíchovej mamy?" },
    { word: "MINO", key: 2, q: "Kto vás pozná najdlhšie z kamarátov?" },
  ],
  // Tajnička: WEISSKUGEL
  [
    { word: "TAJWAN", key: 3, q: "V ktorej krajine sa novomanželia zasnúbili?" },
    { word: "TRENČÍN", key: 2, q: "Ženíchovo najobľúbenejšie mesto?" },
    { word: "TRIATLON", key: 2, q: "Aký závod (plávanie, bicykel, beh) absolvovali novomanželia spolu?" },
    { word: "STAPRO", key: 0, q: "V akej firme pracuje ženích?" },
    { word: "SLAVKOVSKÝ", key: 0, q: "Na ktorom štíte sa novomanželia spoznali?" },
    { word: "STUDNIČKA", key: 7, q: "V akom folklórnom súbore hrá krstná mama nevesty?" },
    { word: "PERU", key: 3, q: "Kam letíte na svadobnú cestu?" },
    { word: "PROGRAMÁTOR", key: 3, q: "Aké povolanie má ženích?" },
    { word: "HRADEC KRÁLOVÉ", key: 4, q: "Kde nevesta predtým pracovala?" },
    { word: "MALÁ FATRA", key: 2, q: "Nevestino najobľúbenejšie slovenské pohorie?" },
  ],
  // Tajnička: STUBAI
  [
    { word: "SLAVKOVSKÝ", key: 0, q: "Na ktorom štíte sa novomanželia spoznali?" },
    { word: "TAJWAN", key: 0, q: "V ktorej krajine sa novomanželia zasnúbili?" },
    { word: "STUDNIČKA", key: 2, q: "V akom folklórnom súbore hrá krstná mama nevesty?" },
    { word: "BOB", key: 0, q: "Ako sa volá chameleón novomanželov?" },
    { word: "HRADEC KRÁLOVÉ", key: 2, q: "Kde nevesta predtým pracovala?" },
    { word: "TRIATLON", key: 2, q: "Aký závod (plávanie, bicykel, beh) absolvovali novomanželia spolu?" },
  ],
  // Tajnička: SLAVKOVSKY
  [
    { word: "RYSY", key: 2, q: "Na ktorý tatranský vrchol vynášali novomanželia náklad ako vysokohorskí nosiči?" },
    { word: "LADCE", key: 0, q: "Odkiaľ pochádza ženích?" },
    { word: "MALÁ FATRA", key: 1, q: "Nevestino najobľúbenejšie slovenské pohorie?" },
    { word: "VETERINÁRKA", key: 0, q: "Aké povolanie má nevesta?" },
    { word: "SKIALPY", key: 1, q: "Aký zimný šport novomanželia spolu robia?" },
    { word: "BOB", key: 1, q: "Ako sa volá chameleón novomanželov?" },
    { word: "ORAVA", key: 3, q: "Z akého regiónu pochádza nevesta?" },
    { word: "YUSHAN", key: 2, q: "Na ktorom vrchu sa novomanželia zasnúbili?" },
    { word: "KÔŇ", key: 0, q: "Aké je najobľúbenejšie zviera nevesty?" },
    { word: "VYŠKOV", key: 1, q: "V akom meste pracuje nevesta?" },
  ],
  // Tajnička: TRENČIN
  [
    { word: "TAJWAN", key: 0, q: "V ktorej krajine sa novomanželia zasnúbili?" },
    { word: "RADO", key: 0, q: "Ako sa volá muž, ktorý mal príhovor s nevestinou sestrou?" },
    { word: "CHAMELEÓN", key: 4, q: "Aké domáce zviera chovajú novomanželia?" },
    { word: "BRNO", key: 2, q: "V akom meste pracuje ženích?" },
    { word: "STUDNIČKA", key: 6, q: "V akom folklórnom súbore hrá krstná mama nevesty?" },
    { word: "TRIATLON", key: 2, q: "Aký závod (plávanie, bicykel, beh) absolvovali novomanželia spolu?" },
    { word: "MINO", key: 2, q: "Kto vás pozná najdlhšie z kamarátov?" },
  ],
  // Tajnička: RYSY
  [
    { word: "STAPRO", key: 4, q: "V akej firme pracuje ženích?" },
    { word: "YUSHAN", key: 0, q: "Na ktorom taiwanskom vrchole sa novomanželia zasnúbili?" },
    { word: "SLAVKOVSKÝ", key: 0, q: "Na ktorom štíte sa novomanželia spoznali?" },
    { word: "VYVET", key: 1, q: "Ako sa volá klinika, kde pracuje nevesta?" },
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
  const [showQuestions, setShowQuestions] = useState(false);

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
            checked={showQuestions}
            onChange={(e) => setShowQuestions(e.target.checked)}
          />
          Otázky
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
          {showQuestions && (
            <ol className="tajnicka-questions">
              {words.map((w, j) => (
                <li key={j}>
                  {w.q || "—"}
                  {showLetters && <span className="answer"> → {w.word}</span>}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}
