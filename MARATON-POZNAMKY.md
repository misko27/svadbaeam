# Maratón – poznámky k príprave

Stránka `/#maraton` (`src/Maraton.jsx`), dáta z hodiniek `src/maraton-data.json`
(import: `python3 scripts/health-import.py ~/Downloads/export.zip`).

Sem sa zapisuje všetko, na čom sme sa dohodli v chate: čo sa v pláne zmenilo a **prečo**.
Ďalšia session si to má prečítať skôr, než začne plán meniť alebo hodnotiť tréningy.

## Cieľ a rámec

- Pražský maratón **2. 5. 2027**. Plán 29 týždňov od 12. 10. 2026, dáta sa do prípravy
  rátajú od 5. 10. 2026.
- Najlepší polmaratón: 1:49:54 (19. 4. 2025). Z neho sa počítajú tempá a odhady.
- Max tep 188 (z hodiniek). Ľahký beh do 77 % (145), dlhý do 80 % (150).
- Svadba 30. 10. 2026, Peru 27. 11. – 13. 12. 2026. Okolo nich je plán zámerne ľahší.

## Ako o tom premýšľame

- **Väčšina behov naozaj ľahko.** Do polovice októbra 2026 Michal behal ľahké behy okolo
  5:00–5:20/km s tepom 152–155, čo je príliš rýchlo. Rýchlosť má prísť z objemu, nie
  z toho, že každý beh ide naplno. Od 16. 10. 2026 spomalil (6:00–6:15/km, tep 140–145).
  To je správne a treba ho v tom držať.
- **Riaď sa tepom, nie tempom**, keď sa nezhodujú (teplo, únava, kopce, výška v Peru).
- **Sledujeme celkovú únavu, nie len behy.** Fitko, bicykel a plávanie sa rátajú. Týždeň
  12.–18. 10. mal 7 tréningov za 7 dní a ani jeden deň voľna. Bicykel 17. 10. bol prepálený
  a deň pred dlhým behom. Ráno potom bol pokojový tep 58 a HRV 89 (predtým 51–55 a ~114).
  - Pravidlo: bicykel ani ťažké nohy vo fitku nie deň pred dlhým behom.
  - Pravidlo: aspoň 1 deň v týždni úplne voľno.
- **Fitko zapisovať na hodinky** („Silový tréning“). Bez toho ho import nevidí a stránka
  podceňuje únavu (dohodnuté 18. 10. 2026, Michal začne zapisovať).
- Behové zdravotné dáta (tep, HRV, VO2max) môžu byť na webe verejne.

## Testy na 5 km

**Prečo:** 5 km naplno je najjednoduchší a najspoľahlivejší test formy. Ukáže, či ide forma
hore, a z času sa spresnia všetky tempá (ľahké, MP, tempo, intervaly) aj cieľ na maratón.
Je lepší ako 12-minútový Cooperov test: ľahšie sa porovnáva s pretekmi aj so starými behmi
a lepšie sa rozkladá tempo. Častejšie ako raz za 6–8 týždňov nemá zmysel, lebo test unavuje
viac ako bežná kvalita.

**Termíny** (štvrtok namiesto kvality, v piatok voľno, bez fitka):
- 5. 11. 2026 (týždeň 4, po svadbe): vstupná hodnota
- 7. 1. 2027 (týždeň 13): začiatok rozvojovej fázy
- 18. 2. 2027 (týždeň 19, odľahčovací, svieže nohy)

**Ako bežať:** cieľ prvého testu je odhad z polmaratónu podľa Riegela, ~23:50 (4:47/km).
Najlepších 5 km v dátach: 23:24 (máj 2024). 1. km o 5 s pomalšie, 2.–4. km drž tempo,
po 3. km pridaj, ak je rezerva, posledný km čo dá. Ďalší test začína tempom predošlého.

**Výsledky:** (dopĺňať)
| Dátum | Čas | Tempo | Pozn. |
|---|---|---|---|

## Preteky

- **Testovací polmaratón** v týždni 23 (15.–21. 3. 2027). Podľa neho sa spresní cieľ a tempá.
- **Pardubický polmaratón 10. 4. 2027 (sobota, týždeň 26)**, lístky z práce. Dohodli sme
  sa, že **nie naplno**, ale ako generálka: 15 km v MP, posledných 6 km voľne rýchlejšie,
  rovnaké raňajky, topánky a gély ako na maratóne. Celkovo s rozklusom a vyklusom ~25 km.
  Preto sa generálka s 30 km (posledných 12 km v MP) presunula do týždňa 25.
  Týždeň 26 má 50 km: v piatok voľno a v nedeľu ľahko 8 km.

## Kontrolné body

Zatiaľ ideme podľa plánu, ako je (cieľ 3:50–4:00, MP 5:30–5:40/km). Pri každom bode
sa pozrieme na dáta, zapíšeme výsledok do tabuľky nižšie a rozhodneme, či plán, tempá
alebo cieľ meniť. Keď sa nič nemení, zapíše sa aj to.

**Priebežne pri každom importe dát**
- Ľahké behy: tempo pri tepe ~145. Čakáme, že sa bude postupne zrýchľovať
  (teraz ~6:15/km, na jar by malo byť okolo 5:45). To je hlavný znak, že základ funguje.
- Ranné hodnoty: pokojový tep (normál ~51–55) a HRV, porovnať s priemerom za posledné
  2 týždne (HRV kolíše od ~80 po ~110). Ak je pokojový tep o 5+ vyšší alebo HRV výrazne
  nižšie 2–3 dni po sebe, ubrať (kvalitu nahradiť ľahkým behom
  alebo voľnom).
- Týždeň: koľko km oproti plánu, aspoň 1 deň voľna, žiadny bicykel ani ťažké nohy
  deň pred dlhým behom.

**Termíny**
| Kedy | Čo | Na čo sa pozrieme / čo rozhodneme |
|---|---|---|
| 5. 11. 2026 (týž. 4) | 1. test 5 km | Vstupná hodnota (~23:50). Podľa času upraviť tempá kvality pre fartleky. |
| 14.–20. 12. 2026 (týž. 10) | Návrat z Peru | Tep pri ľahkom behu po výške, či sa dá nabiehať podľa plánu, alebo pridať ľahký týždeň. |
| 7. 1. 2027 (týž. 13) | 2. test 5 km | Začiatok rozvojovej fázy: nastaviť tempo behy a intervaly. Pre 3:45 orientačne ~23:15. |
| 18. 2. 2027 (týž. 19) | 3. test 5 km | Či forma ide hore. Pre 3:45 orientačne ~23:00. Prvý odhad cieľa. |
| 22.–28. 2. 2027 (týž. 20) | Prvé km v MP na konci dlhého behu | Tep a pocit v MP (má byť 82–86 % max, ~155–162). |
| 15.–21. 3. 2027 (týž. 23) | **Testovací polmaratón** | **Hlavné rozhodnutie o cieli a MP.** Okolo 1:46–1:47 → zvážiť 3:45 (MP 5:20). Okolo 1:50 → ostáva 3:50–3:55. |
| 22.–28. 3. 2027 (týž. 24) | Najdlhší beh 32 km | Gély, drift tepu v poslednej tretine, ako sa cíti MP po 20 km. |
| 29. 3.–4. 4. 2027 (týž. 25) | Generálka 30 km, posledných 12 v MP | Potvrdiť cieľové tempo. Ak MP na konci nejde udržať, cieľ ubrať. |
| 10. 4. 2027 (týž. 26) | Pardubice (15 km v MP) | Posledné overenie tempa, raňajok, topánok a gélov. Potom už len tapering, tempá sa nemenia. |

**Záznamy z kontrol** (dopĺňať)
| Dátum | Bod | Čo ukázali dáta | Rozhodnutie |
|---|---|---|---|

## História zmien plánu

- **16. 10. 2026:** štart z reálnych ~17 km/týždeň, menej okolo svadby a Peru.
- **18. 10. 2026:** import dát (behy 16. a 18. 10.). Týždeň 1 má 20,9 km z plánovaných 20,
  dlhý beh 10 km s tepom 140. VO2max stúpol zo 45,0 na 47,6.
  - Pridané Pardubice a tri testy na 5 km.
  - Na stránke pribudli „Pojmy“ (vysvetlivky: fartlek, strides, MP…).
- **21. 10. 2026:** import dát (fitko 19. 10. 50 min, už zapísané na hodinkách; beh 21. 10.
  7,1 km za 44:18, 6:15/km, tep 145). Ľahký beh naozaj ľahko, ako sme sa dohodli. VO2max 48,1.
  Pozor: pokojový tep 60 (20. 10.) a HRV 32,6 ráno 21. 10. (inak ~80). Ak HRV zostane nízko
  aj ďalšie dni, ubrať (pred svadbou radšej menej).
- **21. 10. 2026:** v Histórii pribudla sekcia „Beh po mesiacoch“ (len km behu, bez iných
  športov, vždy jeden rok s prepínačom rokov), je nad sekciou „Mesiace“. Tá s hodinami
  všetkých športov zostáva, ako bola.
- **21. 10. 2026:** rozoberali sme cieľ 3:45 (MP 5:20/km). Michal zatiaľ nechce meniť plán,
  cieľ ostáva 3:50–4:00. Orientačne pre 3:45: 5 km ~23:00 vo februári, testovací polmaratón
  1:46–1:47. Ak to tak vyjde, prehodnotiť MP pre posledných 7 týždňov.
- **21. 10. 2026:** pribudla sekcia „Kontrolné body“: čo sledovať priebežne a kedy plán
  prehodnotiť. Zatiaľ ideme podľa plánu, ako je.
