<?php

function my_acf_json_load_point( $paths ) {
    // Remove the original path (optional).
    unset($paths[0]);

    // Append the new path and return it.
    $paths[] = plugin_dir_path(__FILE__);

    return $paths;    
}

add_filter( 'acf/settings/load_json', 'my_acf_json_load_point' );

