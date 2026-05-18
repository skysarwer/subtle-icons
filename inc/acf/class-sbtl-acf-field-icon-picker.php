<?php
/**
 * ACF Icon Picker Field Class.
 *
 * @package sbtl
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly.

// phpcs:ignore WordPress.Files.FileName.InvalidClassFileName -- class name uses plugin prefix abbreviation, not full class name.
/**
 * ACF Icon Picker field type.
 */
class SBTL_ACF_Field_Icon_Picker extends acf_field {

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
		// Output a plugin-owned nonce once per nav-menus.php page load so
		// update_value() can perform an explicit, first-party nonce check.
		// Only needed on nav menu screens — all other contexts use ACF's own
		// verified pipeline and never read $_POST directly.
		static $nonce_printed = false;
		if ( ! $nonce_printed && function_exists( 'get_current_screen' ) ) {
			$screen = get_current_screen();
			if ( $screen && 'nav-menus' === $screen->id ) {
				wp_nonce_field( 'sbtl_icon_picker_save', '_sbtl_nonce', false );
				$nonce_printed = true;
			}
		}
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
		// Determine the raw input. Nav menu items submit field data under
		// menu-item-acf[$id][$key] rather than the standard $_POST['acf']
		// container — ACF either cannot find the value (returns empty string)
		// or partially sanitizes it through wp_kses before reaching this method,
		// the latter stripping SVG tags like <use>. Prefer the raw POST value for
		// nav menu items so complex SVG markup is preserved for our own sanitizer.
		//
		// SECURITY — Nonce + capability verification for this $_POST read:
		// render_field() outputs a hidden _sbtl_nonce field (action 'sbtl_icon_picker_save')
		// that is specific to this field type. We verify that nonce here before reading
		// any raw POST data. current_user_can('edit_theme_options') is checked independently 
		// as the authorisation gate — nav-menus.php enforces the same capability before the
		// save routine runs, so this is defence-in-depth.
		if ( is_numeric( $post_id )
			&& current_user_can( 'edit_theme_options' )
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- existence check only; nonce is verified immediately inside the block before data is read.
			&& isset( $_POST['menu-item-acf'][ $post_id ][ $field['key'] ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			// Verify the plugin-owned nonce rendered by render_field().
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized by sanitize_text_field.
			$nonce = sanitize_text_field( wp_unslash( $_POST['_sbtl_nonce'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! wp_verify_nonce( $nonce, 'sbtl_icon_picker_save' ) ) {
				return $value;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- nonce verified above; sanitized via wp_kses() below.
			$raw = wp_unslash( $_POST['menu-item-acf'][ $post_id ][ $field['key'] ] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		} else {
			// Standard ACF save path (post/page/term edit screens).
			// wp_unslash() removes the magic quotes WordPress applies to all POST data.
			$raw = wp_unslash( (string) $value );
		}

		if ( '' === $raw ) {
			return '';
		}

		// wp_kses() enforces the strict SVG allowlist — no script, no event
		// handlers, no non-SVG elements — providing server-side sanitization
		// equivalent to the DOMPurify pass that runs in the browser.
		$safe = wp_kses( $raw, sbtl_svg_kses_allowed() );

		// wp_kses normalizes attribute names to lowercase and values to
		// double-quoted, so we can reliably strip href/xlink:href on <use>
		// elements whose value is not a local fragment reference (#…).
		// This closes the gap that wp_kses cannot enforce natively (no
		// per-attribute value rules).
		$safe = preg_replace_callback(
			'/<use\b([^>]*\/?>)/i',
			static function ( $m ) {
				return '<use' . preg_replace( '/\s+(?:xlink:)?href="[^#][^"]*"/i', '', $m[1] );
			},
			$safe
		);

		return $safe;
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
	 * Sanitize the value before it is returned to the template.
	 *
	 * Defense-in-depth: even if a value was written to the database by a path
	 * that bypassed update_value() (e.g. direct DB manipulation, WP-CLI import),
	 * the SVG allowlist is enforced here before the value reaches any template
	 * that calls get_field() / the_field().
	 *
	 * @param  mixed $value   The value to format.
	 * @param  int   $post_id The post ID.
	 * @param  array $field   The field array.
	 * @return string
	 */
	public function format_value( $value, $post_id, $field ) {
		if ( empty( $value ) || ! is_string( $value ) ) {
			return $value;
		}

		$safe = wp_kses( $value, sbtl_svg_kses_allowed() );

		$safe = preg_replace_callback(
			'/<use\b([^>]*\/?>)/i',
			static function ( $m ) {
				return '<use' . preg_replace( '/\s+(?:xlink:)?href="[^#][^"]*"/i', '', $m[1] );
			},
			$safe
		);

		return $safe;
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
new SBTL_ACF_Field_Icon_Picker();
