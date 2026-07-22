<?php
/**
 * Telecombinatie Toolbox - Reparatieprijzen shortcode
 *
 * Haalt de actuele reparatieprijzen live op uit de Toolbox en toont ze op
 * reparatiedeurne.nl via het shortcode [reparatieprijzen].
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
 */

// Geheime sleutel — moet exact overeenkomen met REPARATIEPRIJZEN_API_KEY in Vercel.
define( 'TCTOOLBOX_API_KEY', 'a35a093f321617f8779fdd9378e59b2271252e84746977e96630c5c7b5053a05' );

// Adres van de Toolbox-API. Alleen aanpassen als de Toolbox ooit op een ander domein komt.
define( 'TCTOOLBOX_API_URL', 'https://app.tctoolbox.nl/api/public/reparatieprijzen' );

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

	ob_start();
	?>
	<div class="tctb-reparatieprijzen">
		<input
			type="search"
			class="tctb-zoek"
			placeholder="Zoek je toestel, bijv. iPhone 13 of Galaxy S22…"
			aria-label="Zoek je toestel"
		/>

		<?php foreach ( $data['merken'] as $merk ) : ?>
			<section class="tctb-merk" data-merk="<?php echo esc_attr( $merk['key'] ); ?>">
				<h2 class="tctb-merk-titel"><?php echo esc_html( $merk['label'] ); ?></h2>

				<?php foreach ( tctb_groepeer_modellen( $merk['modellen'] ) as $groep_naam => $modellen ) : ?>
					<?php if ( $groep_naam ) : ?>
						<h3 class="tctb-groep-titel"><?php echo esc_html( $groep_naam ); ?></h3>
					<?php endif; ?>

					<div class="tctb-toestellen">
						<?php foreach ( $modellen as $model ) : ?>
							<details class="tctb-toestel" data-zoekterm="<?php echo esc_attr( strtolower( $model['label'] ) ); ?>">
								<summary class="tctb-toestel-titel">
									<?php echo esc_html( $model['label'] ); ?>
								</summary>
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
							</details>
						<?php endforeach; ?>
					</div>
				<?php endforeach; ?>
			</section>
		<?php endforeach; ?>

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
		.tctb-reparatieprijzen { max-width: 860px; margin: 0 auto; font-family: inherit; }
		.tctb-reparatieprijzen .tctb-zoek {
			width: 100%; box-sizing: border-box; padding: 12px 16px; margin-bottom: 28px;
			border: 1px solid #ddd; border-radius: 8px; font-size: 15px;
		}
		.tctb-reparatieprijzen .tctb-zoek:focus { outline: none; border-color: #840562; }
		.tctb-merk { margin-bottom: 32px; }
		.tctb-merk-titel {
			color: #840562; border-bottom: 2px solid #840562; padding-bottom: 6px; margin-bottom: 16px;
		}
		.tctb-groep-titel { color: #555; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; margin: 18px 0 8px; }
		.tctb-toestellen { display: flex; flex-direction: column; gap: 8px; }
		.tctb-toestel {
			border: 1px solid #e5e5e5; border-radius: 8px; padding: 4px 16px; background: #fafafa;
		}
		.tctb-toestel[open] { background: #fff; }
		.tctb-toestel-titel {
			cursor: pointer; padding: 10px 0; font-weight: 600; list-style: none;
		}
		.tctb-toestel-titel::-webkit-details-marker { display: none; }
		.tctb-toestel-titel::before { content: "+ "; color: #840562; font-weight: 700; }
		.tctb-toestel[open] .tctb-toestel-titel::before { content: "– "; }
		.tctb-prijzen-tabel { width: 100%; border-collapse: collapse; margin: 4px 0 14px; font-size: 14px; }
		.tctb-prijzen-tabel th { text-align: left; color: #888; font-weight: 600; padding: 6px 4px; border-bottom: 1px solid #eee; }
		.tctb-prijzen-tabel td { padding: 8px 4px; border-bottom: 1px solid #f2f2f2; }
		.tctb-prijzen-tabel .tctb-prijs { text-align: right; font-weight: 700; white-space: nowrap; }
		.tctb-toestel.tctb-verborgen { display: none; }
		.tctb-merk.tctb-verborgen { display: none; }
		.tctb-contact-note { margin-top: 24px; color: #666; font-size: 14px; }
		.tctb-fout { color: #a33; }
	</style>
	<script>
	(function () {
		var container = document.querySelector('.tctb-reparatieprijzen');
		if (!container) return;
		var zoekveld = container.querySelector('.tctb-zoek');
		if (!zoekveld) return;

		zoekveld.addEventListener('input', function () {
			var term = zoekveld.value.trim().toLowerCase();
			var merken = container.querySelectorAll('.tctb-merk');

			merken.forEach(function (merk) {
				var zichtbareToestellen = 0;
				var toestellen = merk.querySelectorAll('.tctb-toestel');

				toestellen.forEach(function (toestel) {
					var match = !term || toestel.getAttribute('data-zoekterm').indexOf(term) !== -1;
					toestel.classList.toggle('tctb-verborgen', !match);
					toestel.open = !!term && match;
					if (match) zichtbareToestellen++;
				});

				merk.classList.toggle('tctb-verborgen', zichtbareToestellen === 0);
			});
		});
	})();
	</script>
	<?php
	return ob_get_clean();
}
