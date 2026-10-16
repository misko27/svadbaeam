#!/usr/bin/env python3
"""Import dát z Apple Health pre stránku #maraton.

Použitie (z priečinka svadbaeam):
    python3 scripts/health-import.py ~/Downloads/export.zip

Prečíta export.xml priamo zo zipu (netreba rozbaľovať) a zapíše
src/maraton-data.json. Po commite a pushi sa dáta ukážu aj na webe.
"""

import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

SINCE = "2000-01-01"  # všetko, čo hodinky kedy zaznamenali
HR_SINCE = (date.today() - timedelta(days=730)).isoformat()  # max tep len z posledných 2 rokov
OUT = Path(__file__).resolve().parent.parent / "src" / "maraton-data.json"

SPORTS = {
    "Running": "run",
    "Swimming": "swim",
    "Cycling": "bike",
    "Hiking": "hike",
    "Walking": "walk",
    "TraditionalStrengthTraining": "gym",
    "FunctionalStrengthTraining": "gym",
    "HighIntensityIntervalTraining": "gym",
    "CrossCountrySkiing": "ski",
    "SnowSports": "ski",
    "SwimBikeRun": "tri",
}
METRICS = {
    "HKQuantityTypeIdentifierVO2Max": "vo2",
    "HKQuantityTypeIdentifierRestingHeartRate": "rhr",
    "HKQuantityTypeIdentifierHeartRateVariabilitySDNN": "hrv",
}
UNITS_KM = {"km": 1, "m": 0.001, "mi": 1.609344, "yd": 0.0009144}


def open_export(path):
    p = Path(path).expanduser()
    if p.is_dir():
        return open(next(p.rglob("export.xml")), "rb")
    z = zipfile.ZipFile(p)
    name = next(n for n in z.namelist() if n.endswith("/export.xml") or n == "export.xml")
    return z.open(name)


def to_km(stat):
    return float(stat["sum"]) * UNITS_KM.get(stat["unit"], 1)


def main(path):
    workouts, metrics, hr_peaks = [], defaultdict(list), []
    for _, el in ET.iterparse(open_export(path), events=("end",)):
        if el.tag == "Record":
            t, start = el.get("type"), el.get("startDate", "")
            if start >= SINCE:
                if t in METRICS:
                    metrics[METRICS[t]].append((start[:10], float(el.get("value"))))
                elif t == "HKQuantityTypeIdentifierHeartRate":
                    v = float(el.get("value"))
                    if v > 150 and start >= HR_SINCE:
                        hr_peaks.append(v)
            el.clear()
        elif el.tag == "Workout":
            start = el.get("startDate", "")
            if start >= SINCE:
                w = {
                    "type": el.get("workoutActivityType", "").replace("HKWorkoutActivityType", ""),
                    "t": datetime.strptime(start, "%Y-%m-%d %H:%M:%S %z"),
                    "min": float(el.get("duration") or 0),
                    "strava": el.get("sourceName") == "Strava",
                }
                for c in el:
                    if c.tag == "WorkoutStatistics":
                        k = c.get("type", "").replace("HKQuantityTypeIdentifier", "")
                        if k.startswith("Distance") and c.get("sum"):
                            w["km"] = to_km({"sum": c.get("sum"), "unit": c.get("unit")})
                        elif k == "HeartRate":
                            w["hr"] = round(float(c.get("average")))
                            w["hrMax"] = round(float(c.get("maximum")))
                    elif c.tag == "MetadataEntry" and c.get("key") == "HKElevationAscended":
                        val, unit = c.get("value").split()
                        w["elev"] = round(float(val) / (100 if unit == "cm" else 1))
                workouts.append(w)
            el.clear()
        elif el.tag == "ActivitySummary":
            el.clear()

    # duplicity (Garmin + Strava + hodinky): rovnaký šport do 10 min → nechaj prvý, Strava až posledná
    workouts.sort(key=lambda w: (w["t"], w["strava"]))
    uniq = []
    for w in workouts:
        if any(w["type"] == u["type"] and abs((w["t"] - u["t"]).total_seconds()) < 600 for u in uniq[-5:]):
            continue
        uniq.append(w)

    runs = [
        {k: v for k, v in {
            "d": w["t"].date().isoformat(),
            "km": round(w.get("km", 0), 2),
            "min": round(w["min"], 1),
            "hr": w.get("hr"),
            "hrMax": w.get("hrMax"),
            "elev": w.get("elev"),
        }.items() if v is not None}
        for w in uniq
        if w["type"] == "Running" and w.get("km", 0) > 0.5
    ]

    # ostatné športy – minúty po týždňoch (pondelok)
    other = defaultdict(lambda: defaultdict(float))
    for w in uniq:
        kind = SPORTS.get(w["type"], "other")
        if kind == "run":
            continue
        d = w["t"].date()
        week = (d - timedelta(days=d.weekday())).isoformat()
        other[week][kind] += w["min"]
    other = [{"w": k, **{s: round(m) for s, m in v.items()}} for k, v in sorted(other.items())]

    # ostatné tréningy po dňoch za posledný rok – aby stránka vedela, čo sa v ktorý deň odtrénovalo
    year_ago = (date.today() - timedelta(days=365)).isoformat()
    acts = [
        {"d": w["t"].date().isoformat(), "t": SPORTS.get(w["type"], "other"), "min": round(w["min"])}
        for w in uniq
        if w["type"] != "Running" and w["t"].date().isoformat() >= year_ago
    ]

    def daily(key):
        by_day = defaultdict(list)
        for d, v in metrics[key]:
            by_day[d].append(v)
        return [[d, round(sum(v) / len(v), 1)] for d, v in sorted(by_day.items())]

    # max tep: tretia najvyššia hodnota (jednotlivé špičky bývajú chyba senzora)
    peaks = sorted(hr_peaks, reverse=True)
    hr_max = round(peaks[2]) if len(peaks) > 2 else None

    data = {
        "generated": date.today().isoformat(),
        "lastWorkout": uniq[-1]["t"].date().isoformat() if uniq else None,
        "hrMax": hr_max,
        "runs": runs,
        "other": other,
        "acts": acts,
        "vo2": daily("vo2"),
        "rhr": daily("rhr"),
        "hrv": daily("hrv"),
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"{OUT.name}: {len(runs)} behov, {len(other)} týždňov iných športov, max tep {hr_max}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
