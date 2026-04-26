export type IconButtonAttributes = {
	// Core button schema inheritance
	tagName?: 'a' | 'button'; // Inherited from core/button block schema; saved as tag choice for the interactive element
	type?: 'button' | 'submit' | 'reset' | string; // Inherited from core/button block schema; saved to the <button type="..."> attribute when tagName is 'button'
	url?: string; // Inherited from core/button block schema; saved to the <a href="..."> attribute when tagName is 'a'
	title?: string; // Inherited from core/button block schema; saved to the <a>/<button> title attribute
	text?: string; // Inherited from core/button block schema; saved as rich text content inside [.wp-block-button__link-text]
	linkTarget?: string; // Inherited from core/button block schema; saved to the <a target="..."> attribute
	rel?: string; // Inherited from core/button block schema; saved to the <a rel="..."> attribute
	placeholder?: string; // Inherited from core/button block schema; editor-only placeholder for the button label field
	width?: 25 | 50 | 75 | 100 | number; // Inherited from core/button block schema; saved as wrapper class [.wp-block-button__width-*]

	// Icon Button block-specific attributes
	leadingIcon?: string; // Saved as raw SVG markup rendered inside [.sbtl-icon-button__icon]
	trailingIcon?: string; // Saved as raw SVG markup rendered after [.wp-block-button__link-text]
	disabledDefaultTrailingIcon?: boolean; // Saved in comment JSON to preserve an intentionally empty trailing icon instead of auto-restoring the default editor arrow
	iconLayout?: 'horizontal' | 'vertical'; // Stored as a semantic position value and rendered as class name [.has-icon-layout-*] on block root [.wp-block-sbtl-icon-button]
	iconOptions?: IconButtonIconOptions; //
	stateAppearance?: IconButtonAppearanceState; // Saved as stateful appearance settings
	// Inherited from block supports
	anchor?: string; // Inherited from supports.anchor; saved as the wrapper element id attribute for fragment links
	fontSize?: string; // Inherited from supports.typography.fontSize; saved as preset slug class [.has-*-font-size] when a preset is selected
	style?: IconButtonSupportStyle; // Inherited from supports.typography / supports.spacing / supports.__experimentalBorder plus custom default appearance data; saved as serialized style object in comment JSON
};

export type IconButtonSupportStyle = {
	spacing?: {
		padding?: SpacingBoxSides; // Inherited from supports.spacing.padding; saved as inline style padding declarations
	};
	border?: {
		radius?: string | BorderRadiusObject; // Inherited from supports.__experimentalBorder.radius; saved as inline style borderRadius / corner radii
		style?: string; // Inherited from supports.__experimentalBorder.style; saved as inline style borderStyle
		width?: string; // Inherited from supports.__experimentalBorder.width; saved as inline style borderWidth
	};
	typography?: {
		fontSize?: string; // Inherited from supports.typography.fontSize; saved as inline style fontSize for custom sizes
		lineHeight?: string; // Inherited from supports.typography.lineHeight; saved as inline style lineHeight
		textAlign?: 'left' | 'center' | 'right' | string; // Inherited from supports.typography.textAlign; saved as inline style textAlign
		fontFamily?: string; // Inherited from supports.typography.__experimentalFontFamily; saved as inline style fontFamily
		fontWeight?: string; // Inherited from supports.typography.__experimentalFontWeight; saved as inline style fontWeight
		fontStyle?: string; // Inherited from supports.typography.__experimentalFontStyle; saved as inline style fontStyle
		textTransform?: string; // Inherited from supports.typography.__experimentalTextTransform; saved as inline style textTransform
		textDecoration?: string; // Inherited from supports.typography.__experimentalTextDecoration; saved as inline style textDecoration
		letterSpacing?: string; // Inherited from supports.typography.__experimentalLetterSpacing; saved as inline style letterSpacing
		writingMode?: string; // Inherited from supports.typography.__experimentalWritingMode; saved as inline style writingMode on the wrapper/selector target
	};
};

export type IconButtonAppearanceValues = {
	background?: string; // Saved as inline background or `sbtl-button-<state>-bg`; accepts solid colors or gradient values
	text?: string; // Saved as inline color on the child or `sbtl-button-<state>-text` + `has-<state>-text` class
	color?: string; // Saved as inline borderColor or `sbtl-button-<state>-border` + `has-<state>-border` class
	leadingIcon?: string; // Saved as inline color on the leading icon element or `sbtl-button-<state>-icon-color` + `has-<state>-icon-color` class on the leading icon element
	trailingIcon?: string; // Saved as inline color on the trailing icon element or `sbtl-button-<state>-icon-color` + `has-<state>-icon-color` class on the trailing icon element
	shadow?: string; // Saved as inline boxShadow on the child [.wp-block-button__link] or `sbtl-button-<state>-shadow` + `has-<state>-shadow` class on the child [.wp-block-button__link]
};

// Button Stateful appearance: default values live at root
// while interactive variants are nested as state overrides.
export type IconButtonAppearanceState = IconButtonAppearanceValues & { // Saved as inline styles on the child [.wp-block-button__link] for the default state
	hover?: IconButtonAppearanceValues; // Saved as inline css state variables on the child [.wp-block-button__link] along with generated class `has-hover-<key>` for hover state
	active?: IconButtonAppearanceValues; // Saved as inline css state variables on the child [.wp-block-button__link] along with generated class `has-active-<key>` for active state
};

export type IconButtonIconOptions = {
	leading?: IconButtonIconAttributes;
	trailing?: IconButtonIconAttributes;
};

export type IconButtonIconAttributes = {
	size?: string; // Saved as inline width on the respective icon region wrapper (.sbtl-leading-icon or .sbtl-trailing-icon)
	gap?: string; // Saved as inline `sbtl-button-icon-gap` on the respective icon region wrapper
	stroke?: number; // Saved as inline `sbtl-button-icon-stroke` on the respective icon region wrapper
	align?: 'start' | 'center' | 'end'; // Saved as inline align-self on the respective icon region wrapper
	toggleIcon?: string; // Saved as raw SVG markup rendered in the respective icon region wrapper
};

export type SpacingBoxSides = {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
};

export type BorderRadiusObject = {
	topLeft?: string;
	topRight?: string;
	bottomRight?: string;
	bottomLeft?: string;
};

export type IconButtonStyleName = 'fill' | 'outline' | 'link';
