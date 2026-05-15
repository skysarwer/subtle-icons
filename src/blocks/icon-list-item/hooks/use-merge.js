/**
 * WordPress dependencies
 */
import { useRegistry, useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { isUnmodifiedBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import useOutdentListItem from './use-outdent-list-item';

export default function useMerge( clientId, onMerge ) {
	const registry = useRegistry();
	const {
		getPreviousBlockClientId,
		getNextBlockClientId,
		getBlockOrder,
		getBlockRootClientId,
		getBlockName,
		getBlock,
	} = useSelect( blockEditorStore );
	const { mergeBlocks, moveBlocksToPosition, removeBlock } =
		useDispatch( blockEditorStore );
	const outdentListItem = useOutdentListItem();

	// eslint-disable-next-line no-unused-vars
	function getTrailingId( id ) {
		const order = getBlockOrder( id );

		if ( ! order.length ) {
			return id;
		}

		return getTrailingId( order[ order.length - 1 ] );
	}

	function getParentListItemId( id ) {
		const listId = getBlockRootClientId( id );
		const parentListItemId = getBlockRootClientId( listId );
		if ( ! parentListItemId ) {
			return;
		}
		if ( getBlockName( parentListItemId ) !== 'sbtl/icon-list-item' ) {
			return;
		}
		return parentListItemId;
	}

	/**
	 * Return the next list item with respect to the given list item. If none,
	 * return the next list item of the parent list item if it exists.
	 *
	 * @param {string} id A list item client ID.
	 * @return {?string} The client ID of the next list item.
	 */
	function _getNextId( id ) {
		const next = getNextBlockClientId( id );
		if ( next ) {
			return next;
		}
		const parentListItemId = getParentListItemId( id );
		if ( ! parentListItemId ) {
			return;
		}
		return _getNextId( parentListItemId );
	}

	/**
	 * Given a client ID, return the client ID of the list item on the next
	 * line, regardless of indentation level.
	 *
	 * @param {string} id The client ID of the current list item.
	 * @return {?string} The client ID of the next list item.
	 */
	function getNextId( id ) {
		const order = getBlockOrder( id );

		// If the list item does not have a nested list, return the next list
		// item.
		if ( ! order.length ) {
			return _getNextId( id );
		}

		// Get the first list item in the nested list.
		return getBlockOrder( order[ 0 ] )[ 0 ];
	}

	return ( forward ) => {
		function mergeWithNested( clientIdA, clientIdB ) {
			registry.batch( () => {
				// When merging a sub list item with a higher next list item, we
				// also need to move any nested list items. Check if there's a
				// listed list, and append its nested list items to the current
				// list.
				const [ nestedListClientId ] = getBlockOrder( clientIdB );
				if ( nestedListClientId ) {
					// If we are merging with the previous list item, and the
					// previous list item does not have nested list, move the
					// nested list to the previous list item.
					if ( ! getBlockOrder( clientIdA ).length ) {
						moveBlocksToPosition(
							[ nestedListClientId ],
							clientIdA
						);
					} else {
						// If the previous list item has a nested list, move the
						// nested list items from the current list item to the
						// nested list of the previous list item.
						moveBlocksToPosition(
							getBlockOrder( nestedListClientId ),
							getBlockOrder( clientIdA )[ 0 ]
						);
						removeBlock( nestedListClientId );
					}
				}

				mergeBlocks( clientIdA, clientIdB );
			} );
		}

		if ( forward ) {
			const nextBlockClientId = getNextBlockClientId( clientId );

			if ( ! nextBlockClientId ) {
				const nextId = getNextId( clientId );

				// If there is a next list item (in a parent list), merge it with
				// the current one.
				if ( nextId ) {
					mergeWithNested( clientId, nextId );
				}
				return;
			} else if (
				getBlockName( nextBlockClientId ) === 'sbtl/icon-list-item'
			) {
				mergeWithNested( clientId, nextBlockClientId );
			}

			return;
		}

		// Merging backward.
		const previousBlockClientId = getPreviousBlockClientId( clientId );

		// If the previous block is a list item, match the core merging behavior.
		if ( getBlockName( previousBlockClientId ) === 'sbtl/icon-list-item' ) {
			mergeWithNested( previousBlockClientId, clientId );
		} else if (
			// If we are merging with a paragraph for instance, let the default
			// merging behavior happen.
			isUnmodifiedBlock( getBlock( clientId ) )
		) {
			onMerge( forward );
		} else if ( outdentListItem() ) {
			// If we can't merge with the previous block, try to outdent the
			// list item.
		} else {
			// If we can't outdent, let the default merging behavior happen.
			onMerge( forward );
		}
	};
}
