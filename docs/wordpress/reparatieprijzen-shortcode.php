<?php
/**
 * Telecombinatie Toolbox - Reparatieprijzen shortcode
 *
 * Haalt de actuele reparatieprijzen live op uit de Toolbox en toont ze op
 * reparatiedeurne.nl via het shortcode [reparatieprijzen], als tabs per merk
 * met een kaartjes-grid (met productfoto) per toestel. Klik op een kaartje
 * voor de prijzentabel in een popup.
 *
 * INSTALLATIE
 * 1. Plak dit volledige bestand in een "Code Snippet" (bijv. via de WPCode of
 *    Code Snippets plugin) of onderaan de functions.php van een child theme.
 *    Zorg dat het snippet actief staat en overal geladen wordt ("Run everywhere").
 * 2. De geheime sleutel staat hieronder al ingevuld (TCTOOLBOX_API_KEY) en moet
 *    exact gelijk zijn aan de REPARATIEPRIJZEN_API_KEY die in de Toolbox
 *    (Vercel) is ingesteld. Niets aan te passen, tenzij de sleutel ooit
 *    gewijzigd wordt — dan hier en in Vercel allebei bijwerken.
 * 3. Plaats het shortcode [reparatieprijzen] op de gewenste pagina, bijv. de
 *    bestaande "Reparaties" / tarievenlijst-pagina.
 *
 * FOTO'S
 * De kaartjes gebruiken de bestaande productfoto's van de WooCommerce-
 * productpagina's op deze site (geen aparte upload nodig). Dat gebeurt via
 * TCTOOLBOX_PRODUCT_SLUGS hieronder: een koppeling van Toolbox-toestelsleutel
 * naar de slug van de bijbehorende productpagina. Heeft een toestel geen
 * (kloppende) match, dan verschijnt automatisch een neutraal icoon in plaats
 * van een foto — niets breekt daarvan.
 * Komt er een nieuw toestel bij in de Toolbox met een eigen productpagina op
 * de site? Voeg dan hieronder een regel toe: 'toestelsleutel' => 'product-slug'.
 * De toestelsleutel staat in de Toolbox bij Admin → Reparatieprijzen beheren.
 */

// Geheime sleutel — moet exact overeenkomen met REPARATIEPRIJZEN_API_KEY in Vercel.
define( 'TCTOOLBOX_API_KEY', 'a35a093f321617f8779fdd9378e59b2271252e84746977e96630c5c7b5053a05' );

// Adres van de Toolbox-API. Alleen aanpassen als de Toolbox ooit op een ander domein komt.
define( 'TCTOOLBOX_API_URL', 'https://app.tctoolbox.nl/api/public/reparatieprijzen' );

// Toolbox-toestelsleutel -> slug van de bestaande productpagina op deze site.
$GLOBALS['TCTOOLBOX_PRODUCT_SLUGS'] = array(
	// Apple iPhone
	'ip16pm' => 'apple-iphone-16-pro-max',
	'ip16p' => 'apple-iphone-16-pro',
	'ip16+' => 'apple-iphone-16-plus',
	'ip16' => 'apple-iphone-16',
	'ip15pm' => 'apple-iphone-15-pro-max',
	'ip15p' => 'apple-iphone-15-pro',
	'ip15+' => 'apple-iphone-15-plus',
	'ip15' => 'apple-iphone-15',
	'ip14pm' => 'apple-iphone-14-pro-max',
	'ip14p' => 'apple-iphone-14-pro',
	'ip14+' => 'apple-iphone-14-plus',
	'ip14' => 'apple-iphone-14',
	'ip13pm' => 'apple-iphone-13-pro-max-2',
	'ip13p' => 'apple-iphone-13-pro-max',
	'ip13' => 'apple-iphone-13',
	'ip13m' => 'apple-iphone-13-mini',
	'ip12pm' => 'apple-iphone-12-pro-max',
	'ip12p' => 'apple-iphone-12-pro',
	'ip12' => 'apple-iphone-12',
	'ip12m' => 'apple-iphone-12-mini',
	'ip11pm' => 'iphone-11-pro-max',
	'ip11p' => 'iphone-11-pro',
	'ip11' => 'iphone-11',
	'ipxsmax' => 'iphone-xs-max',
	'ipxs' => 'iphone-xs',
	'ipxr' => 'iphone-xr',
	'ipx' => 'iphone-x',
	'ip8+' => 'iphone-8-plus',
	'ip8' => 'iphone-8',
	'ipse' => 'iphone-se-2020',
	'ip7+' => 'iphone-7-plus',
	'ip7' => 'iphone-7',
	'ip6s' => 'iphone-6s',

	// Samsung
	'galaxys24ultra' => 'samsung-galaxy-s24-ultra',
	'galaxys24plus' => 'samsung-galaxy-s24-plus',
	'galaxys24' => 'samsung-galaxy-s24',
	'galaxya05' => 'samsung-galaxy-a05',
	'galaxya15' => 'samsung-galaxy-a15-2',
	'galaxya25' => 'samsung-galaxy-a25',
	'galaxya35' => 'samsung-galaxy-a35',
	'galaxya55' => 'samsung-galaxy-a15',
	'galaxys23ultra' => 'samsung-galaxy-s23-ultra',
	'galaxys23plus' => 'samsung-galaxy-s23-plus',
	'galaxys23' => 'samsung-galaxy-s23',
	'galaxya54' => 'samsung-galaxy-a54',
	'galaxya34' => 'samsung-galaxy-a34',
	'galaxya14' => 'samsung-galaxy-a14',
	'galaxya53' => 'samsung-galaxy-a53',
	'galaxya33' => 'samsung-galaxy-a33',
	'galaxya23' => 'samsung-galaxy-a23',
	'galaxya135g' => 'samsung-galaxy-a13-5g',
	'galaxya03s' => 'samsung-galaxy-a03s',
	'galaxya225g' => 'samsung-galaxy-a22-5g',
	'galaxys22' => 'samsung-galaxy-s22',
	'galaxys22plus' => 'samsung-galaxy-s22-plus',
	'galaxys22ultra' => 'samsung-galaxy-s22-ultra',
	'galaxys21fe' => 'samsung-galaxy-s21-fe',
	'galaxys20fe' => 'samsung-galaxy-s20-fe',
	'galaxya72' => 'samsung-galaxy-a72',
	'galaxya52' => 'samsung-galaxy-a52',
	'galaxya32' => 'samsung-galaxy-a32',
	'galaxys21ultra' => 'samsung-galaxy-s21-ultra',
	'galaxys21plus' => 'samsung-galaxy-s21-plus',
	'galaxys21' => 'samsung-galaxy-s21',
	'galaxya02' => 'samsung-galaxy-a02',
	'galaxya6' => 'galaxy-a6-2018',
	'galaxya7' => 'galaxy-a7-2018',
	'galaxya8' => 'galaxy-a8-2018',
	'note10plus' => 'samsung-galaxy-note-10-2',

	// Overig
	'xiaomimi9t' => 'xiaomi-mi-9t',
	'xiaomimi8lite' => 'xiaomi-mi-8-lite',
	'huaweihonorview20' => 'huawei-honor-view-20',
	'huaweimate20pro' => 'huawei-mate-20-pro',
	'huaweimate10pro' => 'huawei-mate-10-pro',
	'huaweimate10' => 'huawei-mate-10',
	'huaweimate10lite' => 'huawei-mate-10-lite',
	'huaweip30pro' => 'huawei-p30-pro',
	'huaweip30' => 'huawei-p30',
	'huaweip30lite' => 'huawei-p30-lite',
	'huaweip20pro' => 'huawei-p20-pro',
	'huaweip20' => 'huawei-p20',
	'huaweip20lite' => 'huawei-p20-lite',
	'huaweip8lite2017' => 'huawei-p8-lite-2017',
	'huaweipsmart2019' => 'p-smart-2019',
	'huaweipsmart' => 'p-smart',

	// Tablets
	'ipad2020' => 'ipad-2020',
	'ipadair2' => 'ipad-air-2',
	'ipadair' => 'ipad-air',
	'ipadmini' => 'ipad-mini',
	'ipadmini4' => 'ipad-mini-4',
	'ipadmini3' => 'ipad-mini-3',
	'ipadmini2' => 'ipad-mini-2',
	'ipad2017' => 'ipad-2017',
	'ipad2018' => 'ipad-2018',
	'galaxytaba101' => 'samsung-galaxy-tab-a-10-1-2016',
);

add_shortcode( 'reparatieprijzen', 'tctb_reparatieprijzen_shortcode' );

function tctb_reparatieprijzen_shortcode( $atts ) {
	if ( empty( TCTOOLBOX_API_KEY ) ) {
		return '<p><em>Reparatieprijzen konden niet geladen worden (geen API-sleutel ingesteld).</em></p>';
	}

	// Altijd live ophalen: geen caching, elke paginabezoek krijgt de actuele Toolbox-prijzen.
	$response = wp_remote_get(
		TCTOOLBOX_API_URL,
		array(
			'timeout' => 8,
			'headers' => array( 'X-Api-Key' => TCTOOLBOX_API_KEY ),
		)
	);

	if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
		return tctb_reparatieprijzen_foutmelding();
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $data ) || empty( $data['merken'] ) ) {
		return tctb_reparatieprijzen_foutmelding();
	}

	$merken = $data['merken'];

	ob_start();
	?>
	<div class="tctb-reparatieprijzen">
		<input
			type="search"
			class="tctb-zoek"
			placeholder="Zoek je toestel, bijv. iPhone 13 of Galaxy S22…"
			aria-label="Zoek je toestel"
		/>

		<div class="tctb-tabs" role="tablist">
			<?php foreach ( $merken as $i => $merk ) : ?>
				<button
					type="button"
					class="tctb-tab<?php echo 0 === $i ? ' tctb-tab-actief' : ''; ?>"
					data-merk-tab="<?php echo esc_attr( $merk['key'] ); ?>"
				><?php echo esc_html( $merk['label'] ); ?></button>
			<?php endforeach; ?>
		</div>

		<?php foreach ( $merken as $i => $merk ) : ?>
			<section
				class="tctb-merk-paneel<?php echo 0 === $i ? ' tctb-paneel-actief' : ''; ?>"
				data-merk-paneel="<?php echo esc_attr( $merk['key'] ); ?>"
			>
				<?php foreach ( tctb_groepeer_modellen( $merk['modellen'] ) as $groep_naam => $modellen ) : ?>
					<?php if ( $groep_naam ) : ?>
						<h3 class="tctb-groep-titel"><?php echo esc_html( $groep_naam ); ?></h3>
					<?php endif; ?>

					<div class="tctb-grid">
						<?php foreach ( $modellen as $model ) : ?>
							<?php
							$dialoog_id = 'tctb-dialoog-' . sanitize_html_class( $merk['key'] . '-' . $model['key'] );
							$foto = tctb_product_afbeelding( $model['key'] );
							?>
							<button
								type="button"
								class="tctb-kaart"
								data-zoekterm="<?php echo esc_attr( strtolower( $model['label'] ) ); ?>"
								data-dialoog="<?php echo esc_attr( $dialoog_id ); ?>"
							>
								<span class="tctb-kaart-beeld">
									<?php if ( $foto ) : ?>
										<img src="<?php echo esc_url( $foto ); ?>" alt="" loading="lazy" />
									<?php else : ?>
										<?php echo tctb_placeholder_icoon(); ?>
									<?php endif; ?>
								</span>
								<span class="tctb-kaart-naam"><?php echo esc_html( $model['label'] ); ?></span>
							</button>

							<dialog class="tctb-dialoog" id="<?php echo esc_attr( $dialoog_id ); ?>">
								<button type="button" class="tctb-dialoog-sluiten" aria-label="Sluiten">&times;</button>
								<h3><?php echo esc_html( $model['label'] ); ?></h3>
								<table class="tctb-prijzen-tabel">
									<thead>
										<tr>
											<th>Reparatie</th>
											<th>Prijs</th>
										</tr>
									</thead>
									<tbody>
										<?php foreach ( $model['reparaties'] as $reparatie ) : ?>
											<tr>
												<td><?php echo esc_html( $reparatie['naam'] ); ?></td>
												<td class="tctb-prijs"><?php echo esc_html( tctb_prijs_format( $reparatie['prijs'] ) ); ?></td>
											</tr>
										<?php endforeach; ?>
									</tbody>
								</table>
							</dialog>
						<?php endforeach; ?>
					</div>
				<?php endforeach; ?>
			</section>
		<?php endforeach; ?>

		<p class="tctb-geen-resultaten" hidden>Geen toestel gevonden met deze zoekterm.</p>

		<p class="tctb-contact-note">
			Staat jouw toestel er niet tussen of heb je een andere vraag?
			<a href="/contact/">Neem contact met ons op.</a>
		</p>
	</div>

	<?php echo tctb_reparatieprijzen_css_js(); ?>
	<?php
	return ob_get_clean();
}

/**
 * Zoekt de featured image van de bijbehorende productpagina op (via
 * TCTOOLBOX_PRODUCT_SLUGS). Geeft null terug als er geen match of geen
 * afbeelding is — de kaart toont dan het neutrale placeholder-icoon.
 */
function tctb_product_afbeelding( $toestel_key ) {
	static $cache = array();
	if ( array_key_exists( $toestel_key, $cache ) ) {
		return $cache[ $toestel_key ];
	}

	$slug = $GLOBALS['TCTOOLBOX_PRODUCT_SLUGS'][ $toestel_key ] ?? null;
	$url = null;

	if ( $slug ) {
		$post = get_page_by_path( $slug, OBJECT, 'product' );
		if ( $post ) {
			$url = get_the_post_thumbnail_url( $post->ID, 'medium' ) ?: null;
		}
	}

	$cache[ $toestel_key ] = $url;
	return $url;
}

function tctb_placeholder_icoon() {
	return '<svg class="tctb-icoon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">'
		. '<rect x="14" y="4" width="20" height="40" rx="4" stroke="currentColor" stroke-width="2.5"/>'
		. '<circle cx="24" cy="37" r="1.6" fill="currentColor"/>'
		. '</svg>';
}

/**
 * Groepeert modellen van een merk op hun "groep" (bijv. iPhone / iPad),
 * modellen zonder groep komen onder een lege sleutel (geen subkopje).
 */
function tctb_groepeer_modellen( $modellen ) {
	$groepen = array();
	foreach ( $modellen as $model ) {
		$naam = ! empty( $model['groep'] ) ? $model['groep'] : '';
		if ( ! isset( $groepen[ $naam ] ) ) {
			$groepen[ $naam ] = array();
		}
		$groepen[ $naam ][] = $model;
	}
	return $groepen;
}

function tctb_prijs_format( $prijs ) {
	return '€ ' . number_format( (float) $prijs, 2, ',', '.' );
}

function tctb_reparatieprijzen_foutmelding() {
	return '<p class="tctb-fout">De actuele reparatieprijzen konden op dit moment niet worden opgehaald. '
		. 'Neem gerust <a href="/contact/">contact met ons op</a> voor een prijsopgave.</p>';
}

/**
 * CSS + JS wordt inline meegegeven zodat het snippet zonder losse bestanden werkt.
 * Wordt maar één keer per pagina uitgevoerd, ook als het shortcode meerdere keren voorkomt.
 */
function tctb_reparatieprijzen_css_js() {
	static $al_geladen = false;
	if ( $al_geladen ) {
		return '';
	}
	$al_geladen = true;
	ob_start();
	?>
	<style>
		.tctb-reparatieprijzen { max-width: 1000px; margin: 0 auto; font-family: inherit; }
		.tctb-reparatieprijzen .tctb-zoek {
			width: 100%; box-sizing: border-box; padding: 12px 16px; margin-bottom: 20px;
			border: 1px solid #ddd; border-radius: 8px; font-size: 15px;
		}
		.tctb-reparatieprijzen .tctb-zoek:focus { outline: none; border-color: #840562; }

		.tctb-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; }
		.tctb-tab {
			font: inherit; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #555;
			padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; transition: all .15s;
		}
		.tctb-tab:hover { border-color: #840562; color: #840562; }
		.tctb-tab-actief, .tctb-tab-actief:hover { background: #840562; border-color: #840562; color: #fff; }

		.tctb-merk-paneel { display: none; }
		.tctb-merk-paneel.tctb-paneel-actief { display: block; }
		.tctb-reparatieprijzen.tctb-zoeken-actief .tctb-merk-paneel { display: block; }
		.tctb-reparatieprijzen.tctb-zoeken-actief .tctb-merk-paneel.tctb-paneel-leeg { display: none; }
		.tctb-tabs.tctb-tabs-verborgen { display: none; }

		.tctb-groep-titel { color: #555; font-size: 14px; text-transform: uppercase; letter-spacing: .04em; margin: 20px 0 10px; }
		.tctb-groep-titel.tctb-verborgen { display: none; }

		.tctb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
		.tctb-kaart {
			font: inherit; cursor: pointer; text-align: center; background: #fff; border: 1px solid #e5e5e5;
			border-radius: 12px; padding: 14px 10px; display: flex; flex-direction: column; align-items: center;
			gap: 8px; transition: box-shadow .15s, border-color .15s;
		}
		.tctb-kaart:hover { border-color: #840562; box-shadow: 0 4px 14px rgba(132,5,98,.12); }
		.tctb-kaart.tctb-verborgen { display: none; }
		.tctb-kaart-beeld { width: 100%; height: 90px; display: flex; align-items: center; justify-content: center; }
		.tctb-kaart-beeld img { max-width: 100%; max-height: 90px; object-fit: contain; }
		.tctb-icoon { width: 40px; height: 40px; color: #ccc; }
		.tctb-kaart-naam { font-size: 13px; font-weight: 600; color: #333; line-height: 1.3; }

		.tctb-dialoog {
			border: none; border-radius: 14px; padding: 24px; max-width: 420px; width: 90vw;
			box-shadow: 0 10px 40px rgba(0,0,0,.2);
		}
		.tctb-dialoog::backdrop { background: rgba(0,0,0,.5); }
		.tctb-dialoog h3 { margin: 0 24px 14px 0; color: #840562; }
		.tctb-dialoog-sluiten {
			position: absolute; top: 14px; right: 14px; border: none; background: none; font-size: 22px;
			line-height: 1; cursor: pointer; color: #999; padding: 4px;
		}
		.tctb-dialoog-sluiten:hover { color: #840562; }

		.tctb-prijzen-tabel { width: 100%; border-collapse: collapse; font-size: 14px; }
		.tctb-prijzen-tabel th { text-align: left; color: #888; font-weight: 600; padding: 6px 4px; border-bottom: 1px solid #eee; }
		.tctb-prijzen-tabel td { padding: 8px 4px; border-bottom: 1px solid #f2f2f2; }
		.tctb-prijzen-tabel .tctb-prijs { text-align: right; font-weight: 700; white-space: nowrap; }

		.tctb-geen-resultaten { color: #666; font-size: 14px; }
		.tctb-contact-note { margin-top: 24px; color: #666; font-size: 14px; }
		.tctb-fout { color: #a33; }
	</style>
	<script>
	(function () {
		var container = document.querySelector('.tctb-reparatieprijzen');
		if (!container) return;

		var zoekveld = container.querySelector('.tctb-zoek');
		var tabsBalk = container.querySelector('.tctb-tabs');
		var tabs = container.querySelectorAll('.tctb-tab');
		var panelen = container.querySelectorAll('.tctb-merk-paneel');
		var geenResultaten = container.querySelector('.tctb-geen-resultaten');

		tabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				tabs.forEach(function (t) { t.classList.remove('tctb-tab-actief'); });
				tab.classList.add('tctb-tab-actief');
				var merk = tab.getAttribute('data-merk-tab');
				panelen.forEach(function (paneel) {
					paneel.classList.toggle('tctb-paneel-actief', paneel.getAttribute('data-merk-paneel') === merk);
				});
			});
		});

		zoekveld.addEventListener('input', function () {
			var term = zoekveld.value.trim().toLowerCase();
			var zoekActief = term.length > 0;
			container.classList.toggle('tctb-zoeken-actief', zoekActief);
			tabsBalk.classList.toggle('tctb-tabs-verborgen', zoekActief);

			var totaalZichtbaar = 0;

			panelen.forEach(function (paneel) {
				var zichtbareKaarten = 0;
				var groepen = paneel.querySelectorAll('.tctb-groep-titel');
				var kaarten = paneel.querySelectorAll('.tctb-kaart');

				kaarten.forEach(function (kaart) {
					var match = !zoekActief || kaart.getAttribute('data-zoekterm').indexOf(term) !== -1;
					kaart.classList.toggle('tctb-verborgen', !match);
					if (match) zichtbareKaarten++;
				});

				groepen.forEach(function (groep) {
					var grid = groep.nextElementSibling;
					var heeftZichtbare = grid && grid.querySelectorAll('.tctb-kaart:not(.tctb-verborgen)').length > 0;
					groep.classList.toggle('tctb-verborgen', zoekActief && !heeftZichtbare);
				});

				paneel.classList.toggle('tctb-paneel-leeg', zoekActief && zichtbareKaarten === 0);
				totaalZichtbaar += zichtbareKaarten;
			});

			geenResultaten.hidden = !zoekActief || totaalZichtbaar > 0;
		});

		container.querySelectorAll('.tctb-kaart').forEach(function (kaart) {
			kaart.addEventListener('click', function () {
				var dialoog = document.getElementById(kaart.getAttribute('data-dialoog'));
				if (dialoog && typeof dialoog.showModal === 'function') dialoog.showModal();
			});
		});

		container.querySelectorAll('.tctb-dialoog-sluiten').forEach(function (knop) {
			knop.addEventListener('click', function () {
				knop.closest('.tctb-dialoog').close();
			});
		});

		container.querySelectorAll('.tctb-dialoog').forEach(function (dialoog) {
			dialoog.addEventListener('click', function (e) {
				if (e.target === dialoog) dialoog.close();
			});
		});
	})();
	</script>
	<?php
	return ob_get_clean();
}
