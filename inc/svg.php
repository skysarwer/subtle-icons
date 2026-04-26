<?php 

function sbtl_default_svg__chevron_down() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__chevron_down', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
}

function sbtl_default_svg__chevron_up() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__chevron_up', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';
}

function sbtl_default_svg__chevron_right() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__chevron_right', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
}

function sbtl_default_svg_chevron_left() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__chevron_left', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>';
}

function sbtl_default_svg__close() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__close', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '';
}

function sbtl_default_svg__arrow_right() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__arrow_right', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
}

function sbtl_default_svg__plus() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__plus', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '';
}

function sbtl_default_svg__minus() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__minus', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '';
}

function sbtl_default_svg__check() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__check', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
}

function sbtl_default_svg__info() {
    $filtered_svg = apply_filters( 'sbtl_default_svg__info', '' );
    if ( ! empty( $filtered_svg ) ) {
        return $filtered_svg;
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4m0-4h.01"></path></g></svg>';
}