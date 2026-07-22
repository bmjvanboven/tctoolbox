# Reparatieprijzen op reparatiedeurne.nl koppelen aan de Toolbox

Doel: prijzen die in de Toolbox worden aangepast (Admin → Reparatieprijzen
beheren) staan automatisch en direct op de website, zonder dat iemand ze nog
handmatig hoeft over te typen.

## Hoe het werkt

1. De Toolbox heeft een nieuwe, beveiligde API: `GET /api/public/reparatieprijzen`
   ([src/app/api/public/reparatieprijzen/route.ts](../../src/app/api/public/reparatieprijzen/route.ts)).
   Die geeft alle merken/toestellen/reparaties + prijzen terug als JSON, maar
   alleen als het verzoek de juiste geheime sleutel meestuurt (header `X-Api-Key`).
2. Op reparatiedeurne.nl komt één shortcode-snippet
   ([reparatieprijzen-shortcode.php](reparatieprijzen-shortcode.php)) die deze
   API bij elk paginabezoek live uitleest en toont als tabs per merk met een
   kaartjes-grid per toestel (met foto — zie hieronder), gegroepeerd per
   generatie. Klik op een kaartje voor de prijzentabel in een popup. Zoeken
   doorzoekt automatisch alle merken tegelijk.
3. Plaats het shortcode `[reparatieprijzen]` op één centrale pagina (bijv. de
   bestaande "Reparaties"/tarievenlijst-pagina) — geen aparte koppeling per
   product nodig.

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

## Stap 3 — Shortcode plaatsen

Zet `[reparatieprijzen]` op de gewenste pagina in de WordPress-editor
(bijv. de huidige tarievenlijst-pagina). De prijslijst verschijnt direct,
met een zoekbalk bovenaan en per merk/toestel een inklapbaar blokje met de
reparaties en prijzen.

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

## Wat dit (bewust) niet doet

- Geen koppeling met de bestaande WooCommerce-productpagina's per toestel
  (die met eigen foto's) — dit is een aparte, centrale prijzenpagina.
- Geen caching: elke paginabezoeker haalt de actuele prijzen live op. Merkt
  de site trager aan bij veel bezoek, dan is een korte cache (bijv. 15
  minuten via `set_transient`) later alsnog eenvoudig toe te voegen in
  `tctb_reparatieprijzen_shortcode()`.
