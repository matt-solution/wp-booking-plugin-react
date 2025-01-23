<?php

// Include WordPress functionality
define( 'WP_USE_THEMES', false );

// Get the root directory of the WordPress installation
$root_dir = dirname( dirname( __FILE__ ) ); // Adjust the number of dirname calls based on the folder structure
$wordpress_dir = dirname( dirname( dirname( $root_dir ) ) ); // Assuming your child theme is in a directory one level above the WordPress root directory
require( $wordpress_dir . '/wp-load.php' );

// Fetch data from API and return as JSON
$data = visbook_fetch_data_from_api();
header('Content-Type: application/json');
echo json_encode($data);