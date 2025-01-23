<?php

// Register Custom Post Type Product
function register_product_post_type() {
    $labels = array(
        'name'                  => _x( 'Products', 'Post Type General Name', 'visbook-client' ),
        'singular_name'         => _x( 'Product', 'Post Type Singular Name', 'visbook-client' ),
        'menu_name'             => __( 'Products', 'visbook-client' ),
        'name_admin_bar'        => __( 'Product', 'visbook-client' ),
        'archives'              => __( 'Product Archives', 'visbook-client' ),
        'attributes'            => __( 'Product Attributes', 'visbook-client' ),
        'parent_item_colon'     => __( 'Parent Product:', 'visbook-client' ),
        'all_items'             => __( 'All Products', 'visbook-client' ),
        'add_new_item'          => __( 'Add New Product', 'visbook-client' ),
        'add_new'               => __( 'Add New', 'visbook-client' ),
        'new_item'              => __( 'New Product', 'visbook-client' ),
        'edit_item'             => __( 'Edit Product', 'visbook-client' ),
        'update_item'           => __( 'Update Product', 'visbook-client' ),
        'view_item'             => __( 'View Product', 'visbook-client' ),
        'view_items'            => __( 'View Products', 'visbook-client' ),
        'search_items'          => __( 'Search Product', 'visbook-client' ),
        'not_found'             => __( 'Not found', 'visbook-client' ),
        'not_found_in_trash'    => __( 'Not found in Trash', 'visbook-client' ),
        'featured_image'        => __( 'Featured Image', 'visbook-client' ),
        'set_featured_image'    => __( 'Set featured image', 'visbook-client' ),
        'remove_featured_image' => __( 'Remove featured image', 'visbook-client' ),
        'use_featured_image'    => __( 'Use as featured image', 'visbook-client' ),
        'insert_into_item'      => __( 'Insert into Product', 'visbook-client' ),
        'uploaded_to_this_item' => __( 'Uploaded to this Product', 'visbook-client' ),
        'items_list'            => __( 'Products list', 'visbook-client' ),
        'items_list_navigation' => __( 'Products list navigation', 'visbook-client' ),
        'filter_items_list'     => __( 'Filter Products list', 'visbook-client' )
    );
    $args = array(
        'label'                 => __( 'Product', 'visbook-client' ),
        'description'           => __( 'Products from VisBook system', 'visbook-client' ),
        'labels'                => $labels,
        'supports'              => array( 'title', 'content', 'editor', 'excerpt', 'custom-fields' ),
        'taxonomies'            => array(),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'map_meta_cap'          => true
    );
    register_post_type( 'product', $args );
}

// Register Custom Taxonomy
function register_location_taxonomy() {
    $labels = array(
        'name'                       => _x( 'Locations', 'Taxonomy General Name', 'visbook-client' ),
        'singular_name'              => _x( 'Location', 'Taxonomy Singular Name', 'visbook-client' ),
        'menu_name'                  => __( 'Location', 'visbook-client' ),
        'all_items'                  => __( 'All Locations', 'visbook-client' ),
        'parent_item'                => __( 'Parent Location', 'visbook-client' ),
        'parent_item_colon'          => __( 'Parent Location:', 'visbook-client' ),
        'new_item_name'              => __( 'New Location Name', 'visbook-client' ),
        'add_new_item'               => __( 'Add New Location', 'visbook-client' ),
        'edit_item'                  => __( 'Edit Location', 'visbook-client' ),
        'update_item'                => __( 'Update Location', 'visbook-client' ),
        'view_item'                  => __( 'View Location', 'visbook-client' ),
        'separate_items_with_commas' => __( 'Separate locations with commas', 'visbook-client' ),
        'add_or_remove_items'        => __( 'Add or remove locations', 'visbook-client' ),
        'choose_from_most_used'      => __( 'Choose from the most used', 'visbook-client' ),
        'popular_items'              => __( 'Popular Locations', 'visbook-client' ),
        'search_items'               => __( 'Search Locations', 'visbook-client' ),
        'not_found'                  => __( 'Not Found', 'visbook-client' ),
        'no_terms'                   => __( 'No locations', 'visbook-client' ),
        'items_list'                 => __( 'Locations list', 'visbook-client' ),
        'items_list_navigation'      => __( 'Locations list navigation', 'visbook-client' ),
    );
    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true, // Set this to false for non-hierarchical taxonomy (like tags)
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => true,
        'show_in_rest'               => true,
    );
    register_taxonomy('location', array('product'), $args);
}

add_action('init', 'register_product_post_type', 0);
add_action('init', 'register_location_taxonomy', 0);