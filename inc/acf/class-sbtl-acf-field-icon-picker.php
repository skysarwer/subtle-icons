<?php
/**
 * ACF Icon Picker Field Class.
 *
 * @package sbtl
 */

// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName -- class name uses plugin prefix abbreviation, not full class name.
/**
 * ACF Icon Picker field type.
 */
class SubtleBlocks_ACF_Field_Icon_Picker extends acf_field {

	/**
	 * Constructor. Sets up the field type data.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function __construct() {
		$this->name     = 'sbtl_icon_picker';
		$this->label    = __( 'Subtle Icon Picker', 'subtle-icons' );
		$this->category = 'advanced';
		$this->defaults = array();

		parent::__construct();
	}

	/**
	 * Create the HTML interface for your field.
	 *
	 * @since  3.6
	 * @param  array $field The field being rendered.
	 * @return void
	 */
	public function render_field( $field ) {
		?>
		<div class="sbtl-acf-icon-picker-field" data-value="<?php echo esc_attr( $field['value'] ); ?>">
			<input type="hidden" name="<?php echo esc_attr( $field['name'] ); ?>" value="<?php echo esc_attr( $field['value'] ); ?>" class="sbtl-acf-icon-picker-input" />
			<div class="sbtl-acf-icon-picker-container"></div>
		</div>
		<?php
	}

	/**
	 * Update the field value. Returns raw SVG to prevent ACF sanitization from stripping HTML.
	 *
	 * @param  mixed $value   The value to save.
	 * @param  int   $post_id The post ID.
	 * @param  array $field   The field array.
	 * @return string|mixed
	 */
	public function update_value( $value, $post_id, $field ) {
		// Nav menu items submit field data under menu-item-acf[$id][$key] rather
		// than the standard $_POST['acf'] container. ACF either cannot find the
		// value (empty string) or partially sanitizes it through wp_kses before
		// reaching this method — the latter strips SVG tags like <use>.
		// Always prefer the raw POST value for nav menu items so that complex SVG
		// markup (including <use> elements) is preserved.
		// wp_unslash() removes the magic quotes WordPress applies to all $_POST data.
		// wp_kses() then enforces a strict SVG allowlist — no script, no event
		// handlers, no non-SVG elements — providing server-side sanitization
		// equivalent to the DOMPurify pass that runs in the browser.
		if ( is_numeric( $post_id )
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- ACF nav menu save callback, nonce verified by WordPress core nav menu save routine.
			&& isset( $_POST['menu-item-acf'][ $post_id ][ $field['key'] ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			// phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized via wp_kses() below.
			$raw  = wp_unslash( $_POST['menu-item-acf'][ $post_id ][ $field['key'] ] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$safe = wp_kses( $raw, self::svg_kses_allowed() );
			// wp_kses normalizes attribute names to lowercase and values to double-quoted,
			// so we can reliably strip href/xlink:href on <use> elements whose value is
			// not a local fragment reference (first char after the opening quote is not #).
			// This closes the gap that wp_kses cannot enforce natively (no per-attr value rules).
			$safe = preg_replace_callback(
				'/<use\b([^>]*\/?>)/i',
				static function ( $m ) {
					return '<use' . preg_replace( '/\s+(?:xlink:)?href="[^#][^"]*"/i', '', $m[1] );
				},
				$safe
			);
			return $safe;
		}

		return $value;
	}

	/**
	 * Returns the wp_kses allowlist for SVG icon markup.
	 *
	 * Covers all elements and attributes commonly found in icon SVGs.
	 * wp_kses lowercases attribute names, which is fine for HTML-embedded SVG
	 * where browsers treat them case-insensitively.
	 *
	 * Note: href / xlink:href on <use> are allowed so that local fragment
	 * references (e.g. href="#wing") survive. External sprite URLs would
	 * require a crafted POST by an edit_theme_options admin, who already has
	 * full site access — considered acceptable residual risk.
	 *
	 * @return array
	 */
	private static function svg_kses_allowed() {
		$pres = array(
			'fill'              => true,
			'fill-opacity'      => true,
			'fill-rule'         => true,
			'stroke'            => true,
			'stroke-width'      => true,
			'stroke-linecap'    => true,
			'stroke-linejoin'   => true,
			'stroke-dasharray'  => true,
			'stroke-dashoffset' => true,
			'stroke-opacity'    => true,
			'opacity'           => true,
			'color'             => true,
			'transform'         => true,
			'clip-path'         => true,
			'clip-rule'         => true,
			'mask'              => true,
			'class'             => true,
			'id'                => true,
			'style'             => true,
		);

		return array(
			'svg'            => array_merge(
				$pres,
				array(
					'xmlns'               => true,
					'xmlns:xlink'         => true,
					'viewbox'             => true,
					'width'               => true,
					'height'              => true,
					'preserveaspectratio' => true,
					'role'                => true,
					'aria-hidden'         => true,
					'aria-label'          => true,
					'focusable'           => true,
				)
			),
			'g'              => $pres,
			'defs'           => array( 'id' => true ),
			'title'          => array( 'id' => true ),
			'desc'           => array( 'id' => true ),
			'use'            => array_merge(
				$pres,
				array(
					'href'       => true,
					'xlink:href' => true,
					'x'          => true,
					'y'          => true,
					'width'      => true,
					'height'     => true,
				)
			),
			'symbol'         => array_merge(
				$pres,
				array(
					'viewbox'             => true,
					'width'               => true,
					'height'              => true,
					'preserveaspectratio' => true,
				)
			),
			'path'           => array_merge( $pres, array( 'd' => true ) ),
			'circle'         => array_merge(
				$pres,
				array(
					'cx' => true,
					'cy' => true,
					'r'  => true,
				)
			),
			'ellipse'        => array_merge(
				$pres,
				array(
					'cx' => true,
					'cy' => true,
					'rx' => true,
					'ry' => true,
				)
			),
			'rect'           => array_merge(
				$pres,
				array(
					'x'      => true,
					'y'      => true,
					'width'  => true,
					'height' => true,
					'rx'     => true,
					'ry'     => true,
				)
			),
			'line'           => array_merge(
				$pres,
				array(
					'x1' => true,
					'y1' => true,
					'x2' => true,
					'y2' => true,
				)
			),
			'polyline'       => array_merge( $pres, array( 'points' => true ) ),
			'polygon'        => array_merge( $pres, array( 'points' => true ) ),
			'clippath'       => array_merge( $pres, array( 'clippathhunits' => true ) ),
			'mask'           => array_merge(
				$pres,
				array(
					'x'                => true,
					'y'                => true,
					'width'            => true,
					'height'           => true,
					'maskunits'        => true,
					'maskcontentunits' => true,
				)
			),
			'marker'         => array_merge(
				$pres,
				array(
					'markerwidth'  => true,
					'markerheight' => true,
					'markerunits'  => true,
					'orient'       => true,
					'refx'         => true,
					'refy'         => true,
					'viewbox'      => true,
				)
			),
			'pattern'        => array_merge(
				$pres,
				array(
					'x'                   => true,
					'y'                   => true,
					'width'               => true,
					'height'              => true,
					'patternunits'        => true,
					'patterncontentunits' => true,
					'patterntransform'    => true,
					'viewbox'             => true,
				)
			),
			'lineargradient' => array_merge(
				$pres,
				array(
					'x1'                => true,
					'y1'                => true,
					'x2'                => true,
					'y2'                => true,
					'gradientunits'     => true,
					'gradienttransform' => true,
					'spreadmethod'      => true,
					'href'              => true,
					'xlink:href'        => true,
				)
			),
			'radialgradient' => array_merge(
				$pres,
				array(
					'cx'                => true,
					'cy'                => true,
					'r'                 => true,
					'fx'                => true,
					'fy'                => true,
					'gradientunits'     => true,
					'gradienttransform' => true,
					'spreadmethod'      => true,
					'href'              => true,
					'xlink:href'        => true,
				)
			),
			'stop'           => array_merge(
				$pres,
				array(
					'offset'       => true,
					'stop-color'   => true,
					'stop-opacity' => true,
				)
			),
			'text'           => array_merge(
				$pres,
				array(
					'x'           => true,
					'y'           => true,
					'dx'          => true,
					'dy'          => true,
					'text-anchor' => true,
					'font-size'   => true,
					'font-family' => true,
					'font-weight' => true,
					'rotate'      => true,
				)
			),
			'tspan'          => array_merge(
				$pres,
				array(
					'x'           => true,
					'y'           => true,
					'dx'          => true,
					'dy'          => true,
					'text-anchor' => true,
					'rotate'      => true,
				)
			),
		);
	}

	/**
	 * Returns the raw stored value without modification.
	 *
	 * @param  mixed $value   The value to load.
	 * @param  int   $post_id The post ID.
	 * @param  array $field   The field array.
	 * @return mixed
	 */
	public function load_value( $value, $post_id, $field ) {
		return $value;
	}

	/**
	 * Enqueue admin scripts and styles for the icon picker field.
	 *
	 * @return void
	 */
	public function input_admin_enqueue_scripts() {
		$url  = plugin_dir_url( __FILE__ ) . '../../build/';
		$path = plugin_dir_path( __FILE__ ) . '../../build/';

		$handle     = 'sbtl-acf-icon-picker';
		$asset_file = $path . 'acf/icon-picker-field/index.asset.php';

		if ( file_exists( $asset_file ) ) {
			$assets = require $asset_file;
			wp_enqueue_script( $handle, $url . 'acf/icon-picker-field/index.js', $assets['dependencies'], $assets['version'], true );
			wp_enqueue_style( $handle, $url . 'acf/icon-picker-field/style-index.css', array(), $assets['version'] );
		}
	}
}

// Initialize.
new SubtleBlocks_ACF_Field_Icon_Picker();
