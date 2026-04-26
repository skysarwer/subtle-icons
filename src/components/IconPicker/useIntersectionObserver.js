import { useEffect, useState } from '@wordpress/element';

const useIntersectionObserver = ({ root = null, rootMargin = '0px', threshold = 0 } = {}) => {
	const [node, setNode] = useState(null);
	const [isIntersecting, setIsIntersecting] = useState(false);

	useEffect(() => {
		if (!node) return;

		// Fallback for environments lacking IO (though unlikely in modern WP)
		if (!('IntersectionObserver' in window)) {
			setIsIntersecting(true);
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			setIsIntersecting(entry.isIntersecting);
		}, { root, rootMargin, threshold });

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [node, root, rootMargin, threshold]);

	return [setNode, isIntersecting];
};

export default useIntersectionObserver;
