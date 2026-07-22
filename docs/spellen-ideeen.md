# TC Toolbox — Dagspelletjes: ideeën

Referentielijst voor het "dagspelletjes"-systeem (net als LinkedIn): elke gebruiker
speelt een spel maximaal 1x per dag, iedereen krijgt dezelfde dagelijkse puzzel,
gerankt op een dagelijks leaderboard. Deze lijst is bedoeld om op terug te vallen
zodra we een volgend spel gaan bouwen — niet alles hoeft gebouwd te worden.

Status: **Merk Pinpoint** is het eerste spel dat gebouwd wordt (zie `src/lib/pinpoint.ts`).

## Reskins van LinkedIn-mechanieken

- [x] **Merk Pinpoint** (reskin van Pinpoint) — *in ontwikkeling*
  Raad het telecommerk, -product of -concept via 5 steeds duidelijkere hints/woorden
  die één voor één onthuld worden. Score = aantal woorden nodig om te raden.
- [ ] **Kabel Zip** (reskin van Zip)
  Verbind genummerde zendmasten/routers in volgorde met een lijn die niet mag
  kruisen. Puur grid-logica, relatief simpel te bouwen. Sterke thematische fit.
- [ ] **Dekking Queens** (reskin van Queens)
  Plaats zendmasten zodat elke regio/rij/kolom precies één mast heeft en ze
  elkaar niet "storen" (geen twee naast elkaar) — verkocht als dekkingsplanning.
- [ ] **Bundel Tango** (reskin van Tango)
  Grid vullen met 4G/5G-iconen volgens balansregels (geen 3 op een rij, gelijk
  aantal per rij/kolom).
- [ ] **Raad het Toestel** (Wordle-achtig)
  Dagelijkse telefoon waarvan specs één voor één onthuld worden (opslag →
  camera → prijs → merk). Gebruiker raadt het model in zo min mogelijk stappen.
  Data-driven quiz, traint kennis van het assortiment — sterk voor sales.

## Losse, originele ideeën

- [ ] **Verbind de Merken** (reskin van NYT Connections)
  16 telecomtermen/producten groeperen in 4 groepen van 4 (bijv. "Apple-toestellen",
  "Reparatie-termen", "Providers", "Accessoires"). Sterke fit met assortimentskennis.
- [ ] **Cijfercode Kraken** (Mastermind-stijl)
  Raad een geheime cijfercode (bijv. in IMEI- of prijs-stijl) met feedback
  (goed cijfer/goede plek) per gok, binnen een beperkt aantal pogingen.
- [ ] **Los de Storing**
  Detective-achtig spel: op basis van symptomen (bijv. "toestel laadt niet, wel
  geluid bij aansluiten") raad je de meest waarschijnlijke oorzaak/reparatie-categorie.
- [ ] **Prijs is Juist**
  Schat de prijs van een reparatie of refurbished toestel — dichtstbij zonder
  overschatten wint, net als bij het tv-programma.
- [ ] **Emoji Raadsel**
  Raad het telecommerk of -product op basis van een reeks emoji's.
- [ ] **Wat Hoort Er Niet**
  Odd-one-out: 4 telecomtermen/producten, welke hoort er niet bij (en waarom)?
- [ ] **Mini Kruiswoordpuzzel**
  Kleine dagelijkse kruiswoordpuzzel met telecom-vocabulaire.
- [ ] **Woordzoeker**
  Dagelijkse woordzoeker met telecomtermen, tijd-gebaseerde ranking.
- [ ] **Geheugenspel (Memory)**
  Toestel-kaartjes omdraaien en matchen (bijv. model + specificatie), gerankt op
  tijd/aantal zetten.
- [ ] **Mini Sudoku**
  4x4 of 6x6 sudoku, dagelijks dezelfde puzzel via seed op datum, gerankt op tijd.
  (Oorspronkelijke voorbeeld van de gebruiker — kan alsnog gebouwd worden.)

## Ontwerpprincipes (afgesproken)

- **Eén gedeelde dagelijkse puzzel** voor iedereen (niet random per gebruiker),
  zodat het leaderboard eerlijk vergelijkbaar is.
- **Eén poging per gebruiker per dag** — daarna op slot tot de volgende dag.
- **Dagelijks leaderboard** per spel, met eigen resultaat gemarkeerd.
- Puzzelinhoud/antwoorden blijven server-side tot de ronde is afgelopen (niet
  vooraf naar de client sturen).
- Puzzeldata leeft in code (`src/lib/...`), niet in de database — makkelijker
  itereren, geen admin-CMS nodig voor content.
