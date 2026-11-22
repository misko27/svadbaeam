import { useEffect, useState } from "react";
import "./Dovolenka.css";

// Svadobná cesta, dve verzie z tých istých dát:
//   /#dovolenka – verejná, na poslanie rodine a kamošom (bez dokladov, úloh, čísel lístkov, pasov…)
//   /#dvl       – plná verzia len pre nás (<Dovolenka full />)
// Čo je len pre nás: DOCS, TODO, LINKS, poznámky letov (`note`, `note2`),
//   `privTags` a `privText` pri dňoch, telefón/adresa/info pri hoteloch.
// Pozor: obe verzie sú v tom istom JS na webe – #dvl je skrytá, nie zaheslovaná.
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
  { cat: "Lety", title: "LATAM · Lima → Cusco", note: "28.11., 8:05 · LA2130 · boarding pass ešte nemáme, bude tu po online check-ine", file: "", url: "https://www.latamairlines.com/uy/en/my-trips" },
  { cat: "Lety", title: "LATAM · Arequipa → Lima", note: "10.12., 11:25 · LA2124 · boarding pass po online check-ine", file: "", url: "https://www.latamairlines.com/uy/en/my-trips" },
  { cat: "Machu Picchu", title: "1-A Montaña · 7:00 · oboch", note: "Boletos_3106805 (1).pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Machu Picchu", title: "3-B dolná citadela · 12:00 · oboch", note: "Boletos_3106812 (1).pdf", file: "", url: DRIVE_FOLDER },
  { cat: "Vlaky", title: "PeruRail · oba vlaky · oboch", note: "PeruRail_WEB3242904_aktualne.pdf · Vistadome 30.11. + Expedition 1.12. · Eva už ako Paska s novým pasom", file: "", url: DRIVE_FOLDER },
  { cat: "Machu Picchu", title: "Bus Consettur", note: "hore k Machu Picchu", file: "", url: "" },
  { cat: "Presuny", title: "Inka Express · Cusco → Puno", note: "potvrdené · Pi 4.12., zraz 5:40, odchod 6:10 · Av. Alameda Pachacútec 499-B · #916497 · lístok v e-maile", file: "", url: "" },
  { cat: "Ubytovanie", title: "Lima · A y J Familia (oproti letisku)", note: "27.–28.11. · Booking.com, bezplatné zrušenie · s odvozom z/na letisko", file: "", url: "" },
  { cat: "Ubytovanie", title: "Ollantaytambo · Picaflor Tambo Guest House", note: "28.–30.11. · Booking.com, bez možnosti vrátenia peňazí", file: "", url: "" },
  { cat: "Ubytovanie", title: "Aguas Calientes · Hotel Horizonte", note: "Booking.com_ Potvrdenie.pdf · 30.11.–1.12.", file: "", url: DRIVE_FOLDER },
  { cat: "Ubytovanie", title: "Cusco · Cusco Bed and Breakfast", note: "1.–4.12. · Booking.com · Calle Unión 140", file: "", url: "" },
  { cat: "Ubytovanie", title: "Puno · Sol Plaza Hotel", note: "4.–6.12. · Booking.com · Queen Room, ~81 € spolu", file: "", url: "" },
  { cat: "Ubytovanie", title: "Chivay", note: "6.–7.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Arequipa", note: "7.–10.12.", file: "", url: "" },
  { cat: "Ubytovanie", title: "Lima Miraflores / Barranco", note: "10.–11.12.", file: "", url: "" },
  { cat: "Ostatné", title: "Cestovné poistenie · asistenčná karta", note: "uzavreté 15.11. · číslo na asistenčnú službu pri úraze/chorobe", file: "", url: DRIVE_FOLDER },
  { cat: "Doklady totožnosti", title: "Sobášny list", note: "k Eviným lístkom na MP a vlaky (sú na meno Kubačková)", file: "", url: DRIVE_FOLDER },
  { cat: "Doklady totožnosti", title: "Pas · Eva (nový)", note: "sken, pre prípad straty", file: "", url: DRIVE_FOLDER },
  { cat: "Doklady totožnosti", title: "Pas · Michal", note: "sken, pre prípad straty", file: "", url: DRIVE_FOLDER },
  { cat: "Doklady totožnosti", title: "Občiansky · Michal", note: "sken", file: "", url: DRIVE_FOLDER },
];

// `map` = čo sa hľadá v Google Maps (preklik pri každej zastávke, na oboch verziách stránky)
// `from`/`to` = noc príchodu a deň odchodu; podľa nich sa zvýrazní, kde práve sme.
const STOPS = [
  {
    place: "Lima", sub: "pri letisku", map: "Aeropuerto Internacional Jorge Chávez, Lima, Peru", nights: 1, dates: "27.–28.11.", from: "2026-11-27", to: "2026-11-28",
    hotel: {
      name: "Across from Lima Airport – A y J Familia",
      address: "Manzana G 60, Lote 1, Sector 5, Urb. Bocanegra, Callao",
      phone: "+51 955 142 101",
      maps: "https://www.google.com/maps/search/?api=1&query=Across+from+Lima+Airport+A+y+J+Familia+Bocanegra+Callao",
      info: "Príchod 11:00–24:00, odchod do 10:00 · odvoz z/na letisko (taxi) · Booking.com",
    },
  },
  { place: "Posvätné údolie", sub: "Ollantaytambo", map: "Ollantaytambo, Peru", nights: 2, dates: "28.–30.11.", from: "2026-11-28", to: "2026-11-30", hotel: { name: "Picaflor Tambo Guest House", info: "Príchod od 13:00 · Booking.com" } },
  {
    place: "Aguas Calientes", sub: "Machu Picchu", map: "Machu Picchu, Peru", nights: 1, dates: "30.11.–1.12.", from: "2026-11-30", to: "2026-12-01",
    hotel: {
      name: "Hotel Horizonte",
      address: "Av. Hermanos Ayar 503-H",
      phone: "+51 902 903 588",
      maps: "https://www.google.com/maps/search/?api=1&query=-13.15442,-72.52687",
      info: "Príchod od 12:00 · raňajky v cene (5:00–7:40) · 1.12. check-out 5:30, batohy u nich do 15:30 · Booking.com",
    },
  },
  { place: "Cusco", map: "Plaza de Armas, Cusco, Peru", nights: 3, dates: "1.–4.12.", from: "2026-12-01", to: "2026-12-04", hotel: { name: "Cusco Bed and Breakfast", address: "Calle Unión 140", maps: "https://www.google.com/maps/search/?api=1&query=Cusco+Bed+and+Breakfast+Calle+Union+140+Cusco", info: "Príchod od 11:00, odchod do 9:00 · Booking.com" } },
  { place: "Puno", sub: "Titicaca", map: "Puno, Peru", nights: 2, dates: "4.–6.12.", from: "2026-12-04", to: "2026-12-06", hotel: { name: "Sol Plaza Hotel", info: "Queen Room · ~81 € za 2 noci · Booking.com" } },
  { place: "Colca", sub: "Chivay", map: "Cañón del Colca, Peru", nights: 1, dates: "6.–7.12.", from: "2026-12-06", to: "2026-12-07" },
  { place: "Arequipa", map: "Plaza de Armas, Arequipa, Peru", nights: 3, dates: "7.–10.12.", from: "2026-12-07", to: "2026-12-10" },
  { place: "Lima", sub: "Miraflores / Barranco", map: "Barranco, Lima, Peru", nights: 1, dates: "10.–11.12.", from: "2026-12-10", to: "2026-12-11" },
  { place: "Viedeň", sub: "u rodiny", map: "Wien, Österreich", nights: 1, dates: "12.–13.12.", from: "2026-12-12", to: "2026-12-13" },
];

const FLIGHTS = [
  {
    status: "done", from: "VIE", to: "LIM", fromCity: "Viedeň", toCity: "Lima",
    date: "Pi 27.11.", time: "6:15 → 16:55", carrier: "Air France", via: "AF1239 → CDG 8:35 · prestup 1:50 (2F → 2E) · AF0500 10:25",
    note: "Na letisku ~4:15, odbavenie končí 5:35. 1× 23 kg na osobu.",
  },
  {
    status: "done", from: "LIM", to: "CUZ", fromCity: "Lima", toCity: "Cusco",
    date: "So 28.11.", time: "8:05 → 9:30", carrier: "LATAM", via: "LA2130 · priamy",
    note2: "Boarding pass zatiaľ nemáme – nájdeš ho v LATAM „My trips“ po online check-ine.",
    note: "Eva: aktualizovať číslo nového pasu v rezervácii alebo pri check-ine",
  },
  {
    status: "done", from: "AQP", to: "LIM", fromCity: "Arequipa", toCity: "Lima",
    date: "Št 10.12.", time: "11:25 → 13:00", carrier: "LATAM", via: "LA2124 · priamy",
    note: "Tarifa Basic, každý 1× 23 kg do podpalubia, v kabíne len malá vec pod sedadlo. Sedadlá náhodne. Eva: číslo nového pasu pri check-ine.",
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
  { date: "2026-11-30", label: "Po 30.11.", place: "Aguas Calientes", text: "Dopoludnia pevnosť a mesto Ollantaytambo, potom vlakom do Aguas Calientes. Spíme v Hotel Horizonte.", privText: "Na stanici do 12:25. Veľké batohy berieme so sebou: limit 1 batoh do 8 kg, navyše doplatok Ollantaytambo ~5 USD (do 12 kg) / ~10 USD (do 23 kg) za kus, alebo úschova na stanici zadarmo. Na stanicu s rezervou.", tags: ["🚆 12:55 → 14:25 Vistadome"], privTags: ["vozeň A · 5, 6"] },
  { date: "2026-12-01", label: "Ut 1.12.", place: "Machu Picchu → Cusco", text: "Bus Consettur hore (vyraziť ~6:00). Machu Picchu Mountain, potom dolná citadela. Večer vlakom priamo do Cusca (San Pedro).", tags: ["⛰ 1-A 7:00", "3-B 12:00", "🚆 16:43 → 21:23"], privTags: ["vozeň F · 39, 40"], highlight: true },
  { date: "2026-12-02", label: "St 2.12.", place: "Cusco", text: "Plaza de Armas, katedrála, Qorikancha, štvrť San Blas, trh San Pedro. Večer dobrá reštaurácia." },
  { date: "2026-12-03", label: "Št 3.12.", place: "Cusco", text: "Ráno Sacsayhuamán a okolité ruiny, poobede Museo de Arte Precolombino alebo kurz varenia či čokolády." },
  { date: "2026-12-04", label: "Pi 4.12.", place: "Cusco → Puno", text: "Turistický bus Inka Express (~10 h) so zastávkami: Andahuaylillas, Raqchi, La Raya, Pukara.", privText: "Zraz 5:40 na Av. Alameda Pachacútec 499-B (taxíkom z hotela).", tags: ["🚌 6:10 Inka Express"], privTags: ["#916497"] },
  { date: "2026-12-05", label: "So 5.12.", place: "Titicaca", text: "Loďou na Uros a Taquile, obed u miestnych, večer späť v Pune." },
  { date: "2026-12-06", label: "Ne 6.12.", place: "Puno → Colca", text: "Bus (~6 h) cez náhornú plošinu a priesmyk Patapampa (~4 900 m). Poobede termály La Calera." },
  { date: "2026-12-07", label: "Po 7.12.", place: "Colca → Arequipa", text: "Skoro ráno kondory na Cruz del Cóndor, dedinky Yanque a Maca, poobede presun do Arequipy (~3–4 h)." },
  { date: "2026-12-08", label: "Ut 8.12.", place: "Arequipa", text: "Kláštor Santa Catalina, Plaza de Armas, Museo Santuarios Andinos, večer picantería. Sviatok, možné procesie." },
  { date: "2026-12-09", label: "St 9.12.", place: "Arequipa", text: "Oddychový deň: vyhliadka Yanahuara, trh San Camilo, Mundo Alpaca." },
  { date: "2026-12-10", label: "Št 10.12.", place: "Arequipa → Lima", text: "Let do Limy, poobede Barranco a západ slnka, večer slávnostná večera.", tags: ["✈ 11:25 AQP → 13:00 LIM"] },
  { date: "2026-12-11", label: "Pi 11.12.", place: "Lima → odlet", text: "Historické centrum a kláštor San Francisco alebo Museo Larco, obed ceviche. Na letisko s rezervou 1,5–2 h, večer odlet.", tags: ["✈ 19:20 LIM"] },
  { date: "2026-12-12", label: "So 12.12.", place: "Viedeň", text: "Prílet 17:25, noc vo Viedni u rodiny." },
  { date: "2026-12-13", label: "Ne 13.12.", place: "Domov", text: "" },
];

const TODO = [
  {
    group: "Lety",
    items: [
      { text: "Dlhé lety Viedeň ⇄ Lima", note: "Air France", done: true },
      { text: "Let Lima → Cusco, 28.11.", note: "LATAM LA2130 8:05 → 9:30", done: true },
      { text: "Let Arequipa → Lima, 10.12.", note: "LATAM LA2124 11:25 → 13:00", done: true },
    ],
  },
  {
    group: "Machu Picchu",
    items: [
      { text: "Vstupenky na Machu Picchu, 1.12.", note: "1-A Montaña 7:00 a 3-B 12:00, 2 osoby", done: true },
      { text: "Vlak Ollantaytambo → Aguas Calientes, 30.11.", note: "PeruRail Vistadome 73P, 12:55 → 14:25", done: true },
      { text: "Vlak Aguas Calientes → Cusco (San Pedro), 1.12.", note: "PeruRail Expedition 32, 16:43 → 21:23", done: true },
      { text: "Bus Consettur hore k Machu Picchu", note: "kúpiť 30.11. poobede na pokladni v Aguas Calientes (Av. Hermanos Ayar, pri Horizonte) · spiatočný ~24 USD/os. · s pasom" },
      { text: "Veľká batožina z údolia do Cusca", note: "berieme do vlaku; doplatok za batoh do 23 kg: 30.11. ~10 USD, 1.12. ~25 USD za kus (dá sa aj vopred na perurail.com/es/equipaje)", done: true },
    ],
  },
  {
    group: "Keď príde Evin nový pas",
    items: [
      { text: "Air France: vložiť číslo nového pasu", note: "hotové 20.11., overiť pri check-ine 25.11.", done: true },
      { text: "LATAM (oba lety): nové číslo pasu", note: "pri online check-ine: LA2130 od 26.11. 14:05 nášho času, LA2124 od 8.12. 11:25 v Peru" },
      { text: "Tuboleto: jeden e-mail za oboch", note: "čísla pasov opravené v systéme, meno ostáva Kubackova – Eva vysvetlí pri vstupe", done: true },
      { text: "Stiahnuť nové lístky Machu Picchu", note: "tuboleto.cultura.pe → Mis compras · skontrolovať čísla pasov, nahradiť staré PDF na Drive" },
      { text: "PeruRail: zmena mena a pasu pre Evu", note: "hotovo 22.11. – nové lístky na Eva Paska prišli e-mailom", done: true },
      { text: "Vytlačiť na Machu Picchu", note: "sobášny list, žiadosť o nový pas z polície (číslo starého pasu), korešpondencia s Tuboleto", done: true },
    ],
  },
  {
    group: "Ubytovanie",
    items: [
      { text: "Lima pri letisku (27.11.)", note: "A y J Familia · s odvozom z/na letisko", done: true },
      { text: "Posvätné údolie, 2 noci", note: "Ollantaytambo · Picaflor Tambo Guest House", done: true },
      { text: "Picaflor Tambo: správa (WhatsApp)", note: "transfer potvrdený, batohy berieme sami · ostáva odpísať výber výletu 29.11.", done: true },
      { text: "Aguas Calientes, 1 noc (30.11.)", note: "Hotel Horizonte, Booking.com", done: true },
      { text: "Hotel Horizonte: skorý odchod 1.12. a úschova batožiny", note: "potvrdené: check-out o 5:30, batohy u nich do 15:30", done: true },
      { text: "Cusco, 3 noci", note: "Cusco Bed and Breakfast, Calle Unión 140", done: true },
      { text: "Cusco B&B: správa cez Booking", note: "neskorý check-in 1.12. schválený", done: true },
      { text: "Cusco B&B: balíček na cestu 4.12.", note: "dohodneme sa osobne na mieste (zraz 5:40)", done: true },
      { text: "Puno, 2 noci", note: "Sol Plaza Hotel · obe noci v Pune, nie Amantaní", done: true },
      { text: "Chivay, 1 noc" },
      { text: "Arequipa, 3 noci" },
      { text: "Lima Miraflores / Barranco, 1 noc" },
      { text: "Viedeň, 1 noc (12.12.)", note: "spíme u rodiny", done: true },
    ],
  },
  {
    group: "Presuny a výlety",
    items: [
      { text: "Transfer Cusco letisko → Posvätné údolie (28.11.)", note: "Picaflor, 60 USD, platí sa pri check-ine · LA2130", done: true },
      { text: "Šofér na výlet Chinchero, Moray, Maras (29.11.)", note: "Picaflor: šofér 120 USD alebo so sprievodcom 210 USD – rozhodnúť a odpísať" },
      { text: "Turistický bus Cusco → Puno (4.12.)", note: "Inka Express #916497 · zraz 5:40, odchod 6:10 · Av. Alameda Pachacútec 499-B", done: true },
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
      { text: "Nové lístky PeruRail (Eva Paska, 22.11.)", note: "PeruRail_WEB3242904_aktualne.pdf na Drive, starý zmazaný", done: true },
      { text: "Potvrdenie Hotel Horizonte", done: true },
      { text: "Kópia sobášneho listu", done: true },
      { text: "Scany pasov (Evin nový + Michalov) a Michalov občiansky", note: "pre prípad straty", done: true },
      { text: "Boarding pass LATAM Lima → Cusco", note: "po online check-ine" },
      { text: "Let Arequipa → Lima", note: "boarding pass po check-ine" },
      { text: "Lístky na bus Consettur", note: "keď kúpime" },
      { text: "Ostatné ubytovania, busy a výlety", note: "priebežne · poistenie už je na Drive" },
    ],
  },
  {
    group: "Ostatné",
    items: [
      { text: "Rezervácia večere v Lime (10.12.)", note: "nerezervujeme, vyberieme na mieste", done: true },
      { text: "Cestovné poistenie", note: "uzavreté 15.11.", done: true },
      { text: "Poistku nahrať na Drive", note: "asistenčná karta", done: true },
      { text: "Poistenie – rozsah a dátumy", note: "poistení sme obaja spolu, platnosť do 11.12. je v poriadku", done: true },
      { text: "Platnosť pasov", note: "v poriadku", done: true },
      { text: "Chceme skúsiť aj Huayna Picchu?", note: "nie, máme Montaña (1-A)", done: true },
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

// Núdzové kontakty (len #dvl). `tel` = číslo na vytočenie, `wa` = WhatsApp.
const EMERGENCY = [
  { title: "Poistenie Union – asistenčná služba (24 h, po slovensky)", sub: "Eurocross Assistance · číslo zmluvy na asistenčnej karte (Drive) · platí 27.11.–11.12.", tel: "+420 2 9633 9644" },
  { title: "Poistenie Union – asistencia cez WhatsApp", sub: "Eurocross Assistance", wa: "+420 608 038 490" },
  { title: "Infolinka Union zo zahraničia", sub: "nie pre akútne prípady", tel: "+421 2 2081 1811" },
  { title: "Núdzová linka MZV SR (24 h)", sub: "úmrtie, hospitalizácia, zadržanie, vážne ohrozenie", tel: "+421 2 5978 5978" },
  { title: "Veľvyslanectvo SR v Buenos Aires – pohotovosť", sub: "akreditované pre Peru · mimo úradných hodín, aj strata pasu", tel: "+54 9 11 3894 6931" },
  { title: "Veľvyslanectvo SR v Buenos Aires", sub: "cons.buenosaires@mzv.sk · Po–Pi 9–14 h (Argentína = Peru +2 h)", tel: "+54 11 4801 3917" },
  { title: "Honorárny konzul SR v Lime", sub: "Víctor Andrés Belaunde Gutiérrez · kontakt cez veľvyslanectvo v Buenos Aires", tel: "" },
  { title: "Veľvyslanectvo ČR v Lime (pomoc občanom EÚ)", sub: "Baltazar la Torre 398, San Isidro · lima.consulate@mzv.gov.cz", tel: "+51 908 918 578" },
  { title: "Peru – polícia", sub: "Policía Nacional", tel: "105" },
  { title: "Peru – záchranka (SAMU)", sub: "", tel: "106" },
  { title: "Peru – hasiči", sub: "", tel: "116" },
];

const LINKS = [
  { title: "Vstupenky Machu Picchu", sub: "tuboleto.cultura.pe", url: "https://tuboleto.cultura.pe" },
  { title: "PeruRail", sub: "perurail.com", url: "https://www.perurail.com" },
  { title: "Inca Rail", sub: "incarail.com", url: "https://incarail.com" },
  { title: "Consettur / Camino a la Maravilla (bus na MP)", sub: "comprar.caminoalamaravilla.com", url: "https://comprar.caminoalamaravilla.com" },
  { title: "Air France – moje rezervácie", sub: "airfrance.sk", url: "https://wwws.airfrance.sk/trip" },
  { title: "LATAM – my trips / boarding pass", sub: "latamairlines.com", url: "https://www.latamairlines.com/uy/en/my-trips" },
];

// tretí prvok `true` = sekcia len v plnej verzii (#dvl)
const SECTIONS = [
  ["prehlad", "Trasa"],
  ["doklady", "Doklady", true],
  ["lety", "Lety"],
  ["den-po-dni", "Deň po dni"],
  ["machu-picchu", "Machu Picchu"],
  ["vybavit", "Treba vybaviť", true],
  ["pocasie", "Počasie"],
  ["linky", "Linky", true],
  ["nudza", "Núdza", true],
];

/* ─── Pomocné ─── */
// Dnešný dátum podľa času v Peru (keď je u nás 1:00, v Lime je ešte predošlý večer).
// Na vyskúšanie iného dňa: svadbaeam.sk/?den=2026-12-02#dovolenka
function todayISO() {
  const test = new URLSearchParams(window.location.search).get("den");
  if (test && /^\d{4}-\d{2}-\d{2}$/.test(test)) return test;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

// Zastávka, kde dnes spíme (od príchodu do rána odchodu).
function currentStop(today) {
  return STOPS.find((s) => s.from <= today && today < s.to);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function mapsHref(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function docHref(doc) {
  if (doc.url) return doc.url;
  if (doc.file) return `${import.meta.env.BASE_URL}dovolenka/${doc.file}`;
  return null;
}

/* ─── Stránka ─── */
export default function Dovolenka({ full = false }) {
  const [today, setToday] = useState(todayISO);

  // Keď má niekto stránku otvorenú cez polnoc, prepne sa sama.
  useEffect(() => {
    const t = setInterval(() => setToday(todayISO()), 60000);
    return () => clearInterval(t);
  }, []);

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
      <Nav full={full} />
      <main className="dov-main">
        <Today today={today} full={full} />
        <Route full={full} today={today} />
        {full && <Docs />}
        <Flights full={full} />
        <Itinerary today={today} full={full} />
        <MachuPicchu full={full} />
        {full && <Todo />}
        <Weather />
        {full && <Links />}
        {full && <Emergency />}
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

function Nav({ full }) {
  return (
    <nav className="dov-nav" aria-label="Sekcie">
      {SECTIONS.filter(([, , priv]) => full || !priv).map(([id, label]) => (
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

function dayText(d, full) {
  return [d.text, full && d.privText].filter(Boolean).join(" ");
}

function dayTags(d, full) {
  return [...(d.tags || []), ...((full && d.privTags) || [])];
}

function Today({ today, full }) {
  const day = DAYS.find((d) => d.date === today);
  if (!day) return null;
  const text = dayText(day, full);
  const tags = dayTags(day, full);
  const stop = currentStop(today);
  return (
    <div className="dov-today">
      <span className="dov-today-label">Dnes · {day.label}</span>
      <h3>{day.place}</h3>
      {text && <p>{text}</p>}
      {tags.length > 0 && <Tags tags={tags} />}
      {stop && (
        <p className="dov-today-stop">
          🛏 Dnes spíme: <strong>{stop.place}{stop.sub ? ` · ${stop.sub}` : ""}</strong>
          {stop.map && (
            <>
              {" · "}
              <a href={mapsHref(stop.map)} target="_blank" rel="noreferrer">📍 na mape ↗</a>
            </>
          )}
        </p>
      )}
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

function Route({ full, today }) {
  const now = currentStop(today);
  const nights = STOPS.slice(0, -1).reduce((s, x) => s + x.nights, 0);
  return (
    <Section
      id="prehlad"
      title="Trasa"
      intro={`Odlet z Viedne v piatok 27.11., návrat do Viedne v sobotu 12.12., domov v nedeľu 13.12. V Peru máme ${nights} nocí.${full ? " V práci sme do 26.11. a znova od 14.12." : ""}`}
    >
      <ol className="dov-route-list">
        {STOPS.map((s, i) => (
          <li key={i} className={[s === now ? "is-now" : "", s.to <= today ? "is-past" : ""].join(" ")}>
            <span className="dov-route-dot" />
            <div>
              {s === now && <span className="dov-now-badge">📍 Tu sme teraz</span>}
              <strong>{s.place}</strong>
              {s.sub && <span className="dov-route-sub"> · {s.sub}</span>}
              <div className="dov-route-meta">
                {s.dates} · {s.nights} {s.nights === 1 ? "noc" : "noci"}
              </div>
              {s.map && (
                <a className="dov-route-map" href={mapsHref(s.map)} target="_blank" rel="noreferrer">
                  📍 na mape ↗
                </a>
              )}
              {s.hotel && (
                <div className="dov-hotel">
                  <strong>🏨 {s.hotel.name}</strong>
                  {full && <span>{s.hotel.info}</span>}
                  {full && (s.hotel.address || s.hotel.phone) && (
                    <span>
                      {s.hotel.address && <a href={s.hotel.maps} target="_blank" rel="noreferrer">{s.hotel.address} ↗</a>}
                      {s.hotel.address && s.hotel.phone && " · "}
                      {s.hotel.phone && <a href={`tel:${s.hotel.phone.replace(/\s/g, "")}`}>{s.hotel.phone}</a>}
                    </span>
                  )}
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

function Flights({ full }) {
  return (
    <Section
      id="lety"
      title="Lety"
      intro="Spiatočná Viedeň ⇄ Lima s Air France cez Paríž, s 23 kg batožinou pre oboch. Vnútroštátne lety s LATAM, tiež s 23 kg."
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
            {full && f.note && <p className="dov-ticket-note">{f.note}</p>}
            {full && f.note2 && <p className="dov-ticket-note">{f.note2}</p>}
          </article>
        ))}
      </div>
    </Section>
  );
}

function Itinerary({ today, full }) {
  return (
    <Section
      id="den-po-dni"
      title="Deň po dni"
      intro="Najprv Cusco a Machu Picchu, kým menej prší, na záver suchá Arequipa a letná Lima."
    >
      <ol className="dov-days">
        {DAYS.map((d) => {
          const text = dayText(d, full);
          const tags = dayTags(d, full);
          return (
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
              {text && <p>{text}</p>}
              {tags.length > 0 && <Tags tags={tags} />}
            </div>
          </li>
          );
        })}
      </ol>
    </Section>
  );
}

function MachuPicchu({ full }) {
  return (
    <Section id="machu-picchu" title="Machu Picchu · 1.12.">
      <div className="dov-mp-card">
        <div className="dov-mp-times">
          <div><span className="dov-k">~5:30–6:00</span>Bus Consettur hore</div>
          <div><span className="dov-k">7:00</span>1-A Machu Picchu Mountain (na kontrolu Montaña najneskôr do 8:00)</div>
          <div><span className="dov-k">12:00</span>3-B dolná citadela</div>
          <div><span className="dov-k">~14:00</span>Koniec, dole do mesta</div>
          <div><span className="dov-k">16:43</span>Vlak Expedition 32 → Cusco San Pedro 21:23{full && " (na stanici do 16:13, vozeň F, miesta 39 a 40)"}</div>
        </div>
        {full && (
          <>
            <div className="dov-callout">
              <strong>Evine lístky sú na starý pas a meno Kubačková</strong> – Machu Picchu aj oba vlaky.
              Tuboleto meno nezmení, Eva to vysvetlí pri vstupe. So sebou mať nový pas, vytlačený sobášny list (ideálne aj starý pas alebo jeho kópiu) a e-maily s Tuboleto.
            </div>
            <ul className="dov-list">
              <li>Mená a čísla pasov musia presne sedieť.</li>
              <li>Tolerancia pri vstupe je 30 minút oproti času na lístku.</li>
              <li>Spätný vlak s rezervou aspoň 2–3 h po konci návštevy.</li>
            </ul>
          </>
        )}
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
        <li>Letisko v Lime má od júna 2025 nový terminál na západnej strane. Hotely pri ulici Elmer Faucett sú pri starom, k novému sa ide autom okolo letiska. V Callao v noci nechodiť pešo.</li>
      </ul>
    </Section>
  );
}

function Emergency() {
  return (
    <Section id="nudza" title="Núdzové kontakty" intro="Pri úraze alebo v nemocnici najprv volať asistenčnú službu poisťovne – hovoria po slovensky a zariadia platbu.">
      <div className="dov-links">
        {EMERGENCY.map((e) => {
          const num = e.tel || e.wa;
          const href = e.wa ? `https://wa.me/${e.wa.replace(/\D/g, "")}` : e.tel ? `tel:${e.tel.replace(/\s/g, "")}` : null;
          const inner = (
            <>
              <strong>{e.title}</strong>
              <span>{[num && (e.wa ? `WhatsApp ${num}` : num), e.sub].filter(Boolean).join(" · ")}</span>
            </>
          );
          return href ? (
            <a key={e.title} href={href} target="_blank" rel="noreferrer" className="dov-link">{inner}</a>
          ) : (
            <div key={e.title} className="dov-link">{inner}</div>
          );
        })}
      </div>
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
