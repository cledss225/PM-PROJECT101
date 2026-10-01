/* =========================================================
   ALUMNIHUB
   SEAMLESS MORPH + FROSTED GLASS NAVIGATION

   Native Cross-Document View Transition
   + Smooth Fallback
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const FALLBACK_EXIT_DURATION = 240;

    let isNavigating = false;


    /* =====================================================
       CREATE FALLBACK TRANSITION LAYER
    ===================================================== */

    function createTransitionLayer() {

        if (
            document.querySelector(
                ".page-transition-layer"
            )
        ) {
            return;
        }


        const layer =
            document.createElement(
                "div"
            );


        layer.className =
            "page-transition-layer";


        layer.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.appendChild(
            layer
        );

    }


    /* =====================================================
       PAGE ENTRANCE
       Only needed for fallback browsers
    ===================================================== */

    function startFallbackEntrance() {

        document.body
            .classList
            .remove(
                "page-transition-exit"
            );


        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        document.body
                            .classList
                            .add(
                                "page-transition-ready"
                            );

                    }
                );

            }
        );

    }


    /* =====================================================
       INTERNAL LINK DETECTION
    ===================================================== */

    function getInternalLink(event) {

        const anchor =
            event.target.closest(
                "a"
            );


        if (!anchor) {
            return null;
        }


        const href =
            anchor.getAttribute(
                "href"
            );


        if (
            !href ||
            href === "#" ||
            href.startsWith("#") ||
            href.startsWith(
                "javascript:"
            )
        ) {
            return null;
        }


        if (
            anchor.target === "_blank" ||
            anchor.hasAttribute(
                "download"
            )
        ) {
            return null;
        }


        let destination;


        try {

            destination =
                new URL(
                    anchor.href,
                    window.location.href
                );

        } catch {

            return null;

        }


        if (
            destination.origin !==
            window.location.origin
        ) {
            return null;
        }


        return {
            anchor,
            destination
        };

    }


    /* =====================================================
       CHECK IF NATIVE CROSS-DOCUMENT
       VIEW TRANSITIONS ARE ENABLED
    ===================================================== */

    function supportsNativeNavigationTransition() {

        return (
            CSS.supports(
                "view-transition-name: alumni-main-content"
            )
        );

    }


    /* =====================================================
       FALLBACK TRANSITION
    ===================================================== */

    function runFallbackTransition(
        destination,
        anchor = null
    ) {

        if (isNavigating) {
            return;
        }


        isNavigating = true;


        if (anchor) {

            anchor.classList.add(
                "page-link-clicked"
            );

        }


        document.body
            .classList
            .remove(
                "page-transition-ready"
            );


        document.body
            .classList
            .add(
                "page-transition-exit"
            );


        window.setTimeout(
            () => {

                window.location.href =
                    destination;

            },
            FALLBACK_EXIT_DURATION
        );

    }


    /* =====================================================
       NATIVE CROSS-DOCUMENT NAVIGATION
    ===================================================== */

    function runNativeNavigation(
        destination,
        anchor = null
    ) {

        if (isNavigating) {
            return;
        }


        isNavigating = true;


        if (anchor) {

            anchor.classList.add(
                "page-link-clicked"
            );

        }


        /*
         * IMPORTANT:
         *
         * Do NOT prevent the browser from navigating.
         * Cross-document View Transitions are triggered
         * by normal navigation when:
         *
         * @view-transition {
         *     navigation: auto;
         * }
         *
         * is present in BOTH documents.
         */

        window.location.href =
            destination;

    }


    /* =====================================================
       NAVIGATE
    ===================================================== */

    function navigate(
        destination,
        anchor = null
    ) {

        if (!destination) {
            return;
        }


        if (
            supportsNativeNavigationTransition()
        ) {

            runNativeNavigation(
                destination,
                anchor
            );

            return;
        }


        runFallbackTransition(
            destination,
            anchor
        );

    }


    /* =====================================================
       CLICK HANDLER
    ===================================================== */

    function initializeNavigation() {

        document.addEventListener(
            "click",
            function (event) {

                /*
                 * Preserve normal browser controls.
                 */

                if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                ) {
                    return;
                }


                const navigation =
                    getInternalLink(
                        event
                    );


                if (!navigation) {
                    return;
                }


                const {
                    anchor,
                    destination
                } = navigation;


                /* Same-page hash link */
                if (
                    destination.pathname ===
                        window.location.pathname &&
                    destination.search ===
                        window.location.search &&
                    destination.hash
                ) {
                    return;
                }


                /* Current page */
                if (
                    destination.href ===
                    window.location.href
                ) {

                    event.preventDefault();

                    return;

                }


                /*
                 * Native cross-document transition:
                 * allow a standard navigation path.
                 *
                 * Fallback:
                 * intercept the navigation.
                 */

                if (
                    supportsNativeNavigationTransition()
                ) {

                    /*
                     * No event.preventDefault()
                     * so browser can perform
                     * cross-document transition.
                     */

                    if (anchor) {

                        anchor.classList.add(
                            "page-link-clicked"
                        );

                    }


                    isNavigating =
                        true;


                    return;

                }


                event.preventDefault();


                navigate(
                    destination.href,
                    anchor
                );

            }
        );

    }


    /* =====================================================
       PROGRAMMATIC NAVIGATION
    ===================================================== */

    window.adminNavigate =
        function (destination) {

            navigate(
                destination
            );

        };


    window.alumniNavigate =
        function (destination) {

            navigate(
                destination
            );

        };


    /* =====================================================
       BACK / FORWARD CACHE
    ===================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            isNavigating =
                false;


            document.body
                .classList
                .remove(
                    "page-transition-exit"
                );


            /*
             * Native transitions do not need
             * our entrance class.
             *
             * But adding it is harmless for
             * fallback mode.
             */

            startFallbackEntrance();

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializePageTransitions() {

        createTransitionLayer();

        initializeNavigation();

        startFallbackEntrance();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePageTransitions
        );

    } else {

        initializePageTransitions();

    }


})();