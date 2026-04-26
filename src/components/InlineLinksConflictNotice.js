import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { extractFirstInlineAnchorLink, removeInlineAnchors } from '../utils/inline-links';

/**
 * Popover notice shown inside LinkControl when richtext content has inline
 * anchors and no root-level link is set. Offers two resolution actions:
 *
 * - Add Block Link  — switches to the standard URL picker in the same popover.
 * - Move Inline Link to Block — promotes the first inline anchor to a root link
 *   and strips all inline anchors from the content.
 *
 * @param {Object}   props
 * @param {string}   props.content           Serialized richtext HTML.
 * @param {Function} props.showDefaultContent Render-prop helper from LinkControl that swaps to the default WpLinkControl.
 * @param {Function} props.closePopover       Render-prop helper from LinkControl that closes the popover.
 * @param {Function} props.onPromote          Called with `{ url, linkTarget, rel, content }` when the user chooses to move an inline link to root.
 */
const InlineLinksConflictNotice = ( {
	content,
	showDefaultContent,
	closePopover,
	onPromote,
} ) => {
	return (
		<div
			className="sbtl-link-control-popover-notice"
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
				maxWidth: '320px',
			} }
		>
			<p style={ { margin: 0, lineHeight: 1.4 } }>
				{ __(
					'You have active inline links in the text. Adding a block link will remove them.',
					'subtle-icons'
				) }
			</p>
			<div
				className="sbtl-link-control-popover-notice__actions"
				style={ {
					display: 'flex',
					flexDirection: 'column',
					gap: '8px',
				} }
			>
				<Button variant="primary" onClick={ showDefaultContent }>
					{ __( 'Add Block Link', 'subtle-icons' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => {
						const nextLink = extractFirstInlineAnchorLink( content );

						if ( ! nextLink.url ) {
							return;
						}

						onPromote( {
							url: nextLink.url,
							linkTarget: nextLink.linkTarget,
							rel: nextLink.rel,
							content: removeInlineAnchors( content ),
						} );

						closePopover();
					} }
				>
					{ __( 'Move Inline Link to Block', 'subtle-icons' ) }
				</Button>
			</div>
		</div>
	);
};

export default InlineLinksConflictNotice;
