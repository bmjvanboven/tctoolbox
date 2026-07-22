# Reparatieprijzen op reparatiedeurne.nl koppelen aan de Toolbox

Doel: prijzen die in de Toolbox worden aangepast (Admin → Reparatieprijzen
beheren) staan automatisch en direct op de website, zonder dat iemand ze nog
handmatig hoeft over te typen.

## Hoe het werkt

1. De Toolbox heeft een nieuwe, beveiligde API: `GET /api/public/reparatieprijzen`
   ([src/app/api/public/reparatieprijzen/route.ts](../../src/app/api/public/reparatieprijzen/route.ts)).
   Die geeft alle merken/toestellen/reparaties + prijzen terug als JSON, maar
   alleen als het verzoek de juiste geheime sleutel meestuurt (header `X-Api-Key`).
2. Eén PHP-bestand ([reparatieprijzen-shortcode.php](reparatieprijzen-shortcode.php))
   registreert drie shortcodes die allemaal dezelfde live data gebruiken:
   - `[reparatieprijzen]` — de volledige prijzenlijst: tabs per merk met een
     kaartjes-grid per toestel (met foto), gegroepeerd per generatie. Klik op
     een kaartje voor de prijzentabel in een popup. Zoeken doorzoekt
     automatisch alle merken tegelijk.
   - `[reparatie_zoekbalk]` — compacte zoekbalk (bedoeld voor de homepage) die
     live filtert op toestelnaam en bij een klik doorlinkt naar de
     prijzenlijst-pagina met dat toestel meteen open.
   - `[uitgelichte_toestellen]` — klein kaartjes-rijtje met een paar
     handmatig gekozen toestellen (bedoeld voor de homepage), zelfde stijl en
     popup als de prijzenlijst.
3. Plaats `[reparatieprijzen]` op één centrale pagina (bijv. de bestaande
   "Reparaties"/tarievenlijst-pagina) — geen aparte koppeling per product
   nodig. Plaats de andere twee op de homepage, ter vervanging van de huidige
   AWS-zoekbalk en het "Recente reparaties"-blok (zie Stap 4 hieronder).

## Stap 1 — Sleutel instellen in de Toolbox (Vercel)

Er staat al een sleutel klaar in `.env.local` voor lokaal testen:

```
REPARATIEPRIJZEN_API_KEY="a35a093f321617f8779fdd9378e59b2271252e84746977e96630c5c7b5053a05"
```

Zet **dezelfde** waarde als environment variable in het Vercel-project van de
Toolbox (Project → Settings → Environment Variables), zodat de live API deze
ook kent. Wil je liever een eigen/nieuwe sleutel? Genereer er dan één (bijv.
`openssl rand -hex 32`) en gebruik die overal consequent.

## Stap 2 — Snippet plaatsen

Plak de volledige inhoud van
[reparatieprijzen-shortcode.php](reparatieprijzen-shortcode.php) in:

- een code-snippet via de **WPCode** of **Code Snippets** plugin (aanbevolen —
  survives theme-updates), ingesteld op "Run everywhere"/"Auto insert", of
- onderaan de `functions.php` van het (child-)theme.

De geheime sleutel staat al bovenin het bestand ingevuld (`TCTOOLBOX_API_KEY`)
— hoeft dus niet apart in `wp-config.php` gezet te worden. Wordt de sleutel
ooit gewijzigd, werk hem dan op **beide** plekken bij: hier in de snippet én
als `REPARATIEPRIJZEN_API_KEY` in Vercel.

## Stap 3 — Prijzenlijst plaatsen

Zet `[reparatieprijzen]` op de gewenste pagina in de WordPress-editor. Vul
daarna bovenin de snippet `TCTOOLBOX_TARIEVEN_URL` in met de URL van die
pagina — daar linkt de zoekbalk-shortcode straks naartoe. Staat op
`/reparatieprijzen/`, dan is dat dus:

```php
define( 'TCTOOLBOX_TARIEVEN_URL', '/reparatieprijzen/' );
```

## Stap 4 — Zoekbalk en uitgelichte toestellen op de homepage

**Zoekbalk vervangen**: de huidige zoekbalk op de homepage is de "Ajax
Search for WooCommerce"-plugin (`aws-search-form`) en zoekt in alle
WooCommerce-producten. Vervang die door `[reparatie_zoekbalk]` — dit zoekt
in de Toolbox-toestellen en linkt bij een klik naar de tarievenlijst-pagina
met dat toestel meteen open. De zoekbalk zit ingebouwd in een Smart
Slider 3-slide, dus dit vervang je via de Smart Slider-editor (de laag met
de huidige zoekbalk vervangen door een shortcode-laag met
`[reparatie_zoekbalk]`), niet via de gewone pagina-editor.

**"Recente reparaties" vervangen**: dit blok is het standaard WooCommerce
"recente producten"-blok en toont toevallig de laatst aangemaakte
productpagina's — geen echte activiteitsdata. Vervang dit blok door
`[uitgelichte_toestellen]`. Standaard toont dit iPhone 16, iPhone 16 Pro,
iPhone 15, Galaxy S24, Galaxy A55 en iPad 2019/2020 — pas dit aan met het
`toestellen`-attribuut, bijv.:

```
[uitgelichte_toestellen toestellen="apple:ip16,apple:ip15,samsung:galaxys24,samsung:galaxya55"]
```

Elke waarde is `merksleutel:toestelsleutel` — beide vind je in de Toolbox
bij Admin → Reparatieprijzen beheren.

## Foto's op de kaartjes

De kaartjes gebruiken de bestaande productfoto's die al op reparatiedeurne.nl
staan (geen aparte upload nodig). Dit werkt via een koppeltabel bovenin
`reparatieprijzen-shortcode.php` (`TCTOOLBOX_PRODUCT_SLUGS`): Toolbox-
toestelsleutel → slug van de bijbehorende productpagina. Voor alle 95
toestellen die nu in de Toolbox staan (Apple, Samsung, Overig, Tablets) is
deze koppeling al ingevuld.

Voeg je later een nieuw toestel toe in de Toolbox (Admin → Reparatieprijzen
beheren) dat ook een eigen productpagina op de site krijgt, voeg dan een
regel toe aan die tabel: `'toestelsleutel' => 'product-slug'`. De
toestelsleutel staat in de Toolbox-beheerpagina. Zonder match toont het
kaartje automatisch een neutraal icoon in plaats van een foto — niets
breekt daarvan.

## Wat als de Toolbox even niet bereikbaar is?

De shortcode toont dan een nette melding ("prijzen konden niet worden
opgehaald, neem contact op") in plaats van een kapotte pagina of oude,
foutieve prijzen.

## Snelheid: korte cache + directe laadstatus

De prijzen worden niet meer bij elk paginabezoek live opgehaald: sinds kort
worden ze na ophalen `TCTOOLBOX_CACHE_SECONDEN` (standaard 60) seconden
bewaard in een WordPress-transient. De eerste bezoeker na een wijziging
wacht dus nog op de live Toolbox-API, iedereen daarna binnen die 60 seconden
krijgt de pagina razendsnel uit de cache. Merkt de site dit nog steeds traag
aan, verhoog dan gerust `TCTOOLBOX_CACHE_SECONDEN` (bijv. naar 300).

Daarnaast toont de zoekbalk ([reparatie_zoekbalk]) meteen een spinner en
"… laden" zodra je op een toestel klikt, zodat je direct ziet dat de klik is
aangekomen — ook als de site of hosting even wat trager reageert.

## Wat dit (bewust) niet doet

- Geen koppeling met de bestaande WooCommerce-productpagina's per toestel
  (die met eigen foto's) — dit is een aparte, centrale prijzenpagina.
