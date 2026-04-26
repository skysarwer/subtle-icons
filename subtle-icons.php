<?php
/**
 * Plugin Name:       Subtle Icons
 * Plugin URI:        https://subtleicons.com
 * Description:       Unleash the power of icons in your WordPress site with Subtle Icons, a versatile plugin that offers thousands of icons to select from in custom blocks and an ACF field.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Subtle Blocks
 * Author URI:        https://subtleblocks.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       subtle-icons
 *
 * @package           sbtl
 */

define( 'SBTL_BLOCKS_PLUGIN_FILE', __FILE__ );
define( 'SBTL_BLOCKS_VERSION', '0.1.0' );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_sbtl_icons_block_init() {

	$blocks = array (
		'icon-button',
		'icon-list',
		'icon-list-item',
		'icon-text',
		'icon',
	);

	foreach ( $blocks as $block ) {

		$registry = WP_Block_Type_Registry::get_instance();

		// Array for passing block arguments outside of block.json. Mainly for render_callback property.
		$block_args = array();

		if ( ! $registry->get_registered( 'sbtl/' . $block ) ) {

			register_block_type( plugin_dir_path( __FILE__ ) . '/build/blocks/' . $block, $block_args );

		}
	}
}
add_action( 'init', 'create_block_sbtl_icons_block_init' );


function sbtl_block_categories( $categories ) {

	$sbtl_category = array(
		'slug'  => 'sbtl',
		'title' => __( 'Subtle Icons', 'subtle-icons' ),
		'icon'  => null,
	);

	$categories_sorted = array();
	$categories_sorted[0] = $sbtl_category;

	foreach ( $categories as $category ) {
		$categories_sorted[] = $category;
	}

    return $categories_sorted;

}
add_filter( 'block_categories_all', 'sbtl_block_categories', 9 );

/**
 * SVG Icons
 */
require_once plugin_dir_path( __FILE__ ) . 'inc/svg.php';

/**
 * Enqueue Scripts and Styles
 */
require_once plugin_dir_path( __FILE__ ) . 'inc/enqueue.php';

/**
 * REST API
 */
require_once plugin_dir_path( __FILE__ ) . 'inc/rest/icons.php';

/**
 * ACF Field Type
 */
function sbtl_register_acf_fields() {
	if ( function_exists( 'acf_register_field_type' ) ) {
		require_once plugin_dir_path( __FILE__ ) . 'inc/acf/class-sbtl-acf-field-icon-picker.php';
	}
}
add_action( 'acf/init', 'sbtl_register_acf_fields' );