<?php 
/**
 * Enqueue shared editor styles for custom UI components.
 */
function sbtl_enqueue_editor_assets() {
	$css_file = plugin_dir_path( __FILE__ ) . '../build/sass/blocks-editor.css';
	wp_enqueue_style(
		'sbtl-blocks-editor-ui',
		plugins_url( '../build/sass/blocks-editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		file_exists( $css_file ) ? filemtime( $css_file ) : false
	);

    add_editor_style( plugins_url( '../build/sass/blocks-editor.css', __FILE__ ) );


	$editor_asset_file = plugin_dir_path( __FILE__ ) . '../build/editor/index.asset.php';
	if ( file_exists( $editor_asset_file ) ) {
		$editor_asset = include $editor_asset_file;
		wp_enqueue_script(
			'sbtl-editor-hooks',
			plugins_url( '../build/editor/index.js', __FILE__ ),
			$editor_asset['dependencies'],
			$editor_asset['version'],
			true
		);
	}
    
    // Localize icon SVGs, targeting sbtl/accordions editor script
    wp_localize_script( 'sbtl-accordions-editor-script', 'sbtl_icons', array(
        'chevronDown' => sbtl_default_svg__chevron_down(),
        'chevronUp'   => sbtl_default_svg__chevron_up(),
        'chevronRight'=> sbtl_default_svg__chevron_right(),
    ) );

	// Localize icon check for sbtl/icon-list block editor script
	wp_localize_script( 'sbtl-icon-list-editor-script', 'sbtl_list_icons', array(
		'check' => sbtl_default_svg__check(),
	) );

    // Localize arrow-right icon for sbtl/icon-button block editor script
    wp_localize_script( 'sbtl-icon-button-editor-script', 'sbtl_button_icons', array(
        'arrowRight' => sbtl_default_svg__arrow_right(),
    ) );

	// Localize info icon for sbtl-icon-text block editor script
	wp_localize_script( 'sbtl-icon-text-editor-script', 'sbtl_icon_text_icons', array(
		'info' => sbtl_default_svg__info(),
	) );
}
add_action( 'enqueue_block_editor_assets', 'sbtl_enqueue_editor_assets' );

/*
add_action('wp_footer', function () {
    $styles = wp_styles();
    if (isset($styles->registered['block-style-variation-styles'])) {
        $inline = $styles->get_data(
            'block-style-variation-styles',
            'after'
        );
        if ($inline) {
            echo '<style>' . implode('', $inline) . '</style>';
        }
    }
}, 1);

add_filter('render_block_data', function ($parsed_block) {
    if ($parsed_block['blockName'] === 'sbtl/icon-button') {
        $tree = WP_Theme_JSON_Resolver::get_merged_data();
        $raw = $tree->get_raw_data();
    }
    return $parsed_block;
}, 9);
// Before Gutenberg's variation handler (priority 10)
add_filter('render_block_data', function ($parsed_block) {
    if ($parsed_block['blockName'] === 'sbtl/icon-button') {
        $class_name = $parsed_block['attrs']['className'] ?? '';
        if (str_contains($class_name, 'is-style-')) {
            $parsed_block['attrs']['_sbtl_original_name'] = 'sbtl/icon-button';
            $parsed_block['blockName'] = 'core/button';
        }
    }
    return $parsed_block;
}, 9);*/
