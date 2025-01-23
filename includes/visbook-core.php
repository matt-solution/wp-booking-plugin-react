<?php

// Connect to the VisBook API
function visbook_fetch_data_from_api($language_code = 'EN')
{
    error_log("Fetching data from API for language code: $language_code");

    $webident = get_option('visbook_webentity');
    $api_url = "https://ws.visbook.com/api/{$webident}/webproducts";

    // Prepare the request args including the Accept-Language header if a language code is provided
    $args = [
        'timeout' => 30 // Increase timeout to 30 seconds
    ];
        if (!empty($language_code)) {
        $args['headers'] = [
            'Accept-Language' => $language_code,
        ];
    }

    $response = wp_remote_get($api_url, $args);

    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        error_log("API request failed: $error_message");
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        $json_error = json_last_error_msg();
        error_log("JSON decode error: $json_error");
        return ['error' => "JSON decode error: $json_error"];
    }

    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    error_log("API data successfully fetched and decoded.");
    return $data;
}  // end visbook_fetch_data_from_api


// Main Load json function
function visbook_load_json($language_code = 'EN')
{
    error_log('Starting to load JSON.');

    // if (!current_user_can('manage_options')) {
    //     wp_die('Unauthorized user');
    // }

    $products_data = visbook_fetch_data_from_api($language_code);
    if ($products_data) {
        if (isset($products_data['error'])) {
            error_log('Error in fetched data: ' . $products_data['error']);
            wp_die($products_data['error']);
        }

        // Assuming $products_data is an array of products data
        error_log('JSON data successfully loaded. Language code:' . $language_code);
        return $products_data; // Return the products data directly

    } else {
        error_log('Error: JSON data not loaded.');
        wp_die('Failed to fetch or parse JSON data.');
    }
    
} // End visbook_load_json



function visbook_sync_products_with_posts($products, $language_code = 'EN', $sync_images = true)
{
    // Add logging to track the function execution
    error_log('visbook_sync_products_with_posts started');

    update_option('visbook_process_status', 'running');

    if (!$products) {
        error_log('Error: No products to sync.');
        return;
    }

    foreach ($products as $product) {
        $post_id = visbook_find_post_by_product_id($product['webProductId']);

        // Insert or update post
        if (!$post_id) {
            $post_data = [
                'post_title' => wp_strip_all_tags($product['name']),
                'post_content' => $language_code === 'EN' ? ($product['description']['long'] ?: '') : '',
                'post_excerpt' => $language_code === 'EN' ? ($product['description']['short'] ?: '') : '',
                'post_status' => 'publish',
                'post_type' => 'product',
            ];

            $post_id = wp_insert_post($post_data);
            error_log('New post created with ID: ' . $post_id);
        } else {
            error_log('Post updated with ID: ' . $post_id);
        }

        // Update common fields applicable to all languages
        if ($language_code === 'EN') {
            visbook_update_common_fields($post_id, $product);
        } else {
            // Update language-specific fields
            visbook_update_language_specific_fields($post_id, $product, $language_code);
        }
        // Optionally track progress here if necessary
    }

    update_option('visbook_process_status', 'completed');
    error_log('All products are synced');
}


// 
// Helper functions
// 

// function to match products with posts
function visbook_find_post_by_product_id($webProductId)
{
    $args = [
        'post_type' => 'product',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'meta_query' => [
            [
                'key' => 'web_product_id',
                'value' => $webProductId,
                'compare' => '=',
            ],
        ],
    ];

    $query = new WP_Query($args);
    return $query->have_posts() ? $query->posts[0]->ID : 0;
}

// function to udate fields that are not language-specific
function visbook_update_common_fields($post_id, $product)
{
    // Update ACF fields
    update_field('field_web_product_id', $product['webProductId'], $post_id);
    update_field('field_65e03f8a4318d', $product['unitName'], $post_id);
    update_field('field_65e03f3a4318c', $product['sortIndex'], $post_id);
    update_field('field_name', $product['type'], $post_id);
    update_field('field_65e03c409a847', $product['maxPeople'], $post_id);
    update_field('field_65e03c609a848', $product['minPeople'], $post_id);
    update_field('field_65e03c759a849', $product['defaultPeople'], $post_id);

    // error_log('Inserted values in fields for : ' . $product['name']);

    // Assuming $product['additionalServices'] is an array of services
    if (isset($product['additionalServices']) && is_array($product['additionalServices'])) {
        $services = array();
        foreach ($product['additionalServices'] as $service) {
            $service_entry = array(
                'field_price' => $service['price'],
                'field_65e03d56b6fbd' => $service['id'],
                'field_service_name' => $service['name'],
                'field_service_type' => $service['serviceType'],
                'field_service_relation_type' => $service['serviceRelationType'],
            );

            // Directly access 'rules' without a loop since it's not an array of arrays
            if (isset($service['rules']) && is_array($service['rules'])) {
                $rules = $service['rules']; // Assuming 'rules' is a directly accessible array

                // Directly create the rules array for ACF
                $rules_entry = array(
                    'field_65e03d99b6fbe' => $rules['minValue'],
                    'field_65e03dcab6fbf' => $rules['maxValue'],
                    'field_65e03de7b6fc0' => $rules['selectedByDefault'],
                    'field_65e5a51cfc73e' => $rules['maxValueType'],
                    'field_65e5a558fc73f' => $rules['minValueType'],
                    // Add other rule fields here
                );

                // Assuming 'field_rules' is a repeater field in ACF and expects an array of arrays
                $service_entry['field_rules'] = array($rules_entry);
            }

            $services[] = $service_entry;
        }
        update_field('field_additional_services', $services, $post_id);
        update_option('visbook_process_status', 'completed');
    }

    // Assuming $product['properties'] is an associative array of properties
    if (isset($product['properties']) && is_array($product['properties'])) {
        $properties = array();
        foreach ($product['properties'] as $key => $property) {
            // Create an entry for each property
            $property_entry = array(
                'field_65e041634318e' => $key, // Property name
                'field_65e87fe52b229' => $property['name'], // Property name
                'field_65e042394318f' => $property['type'], // Property type (text or integer)
                'field_65d8b29a03f46' => ($property['type'] === 'integer' && isset($property['value'])) ? (int) $property['value'] : '', // Convert to integer if type is integer
                'field_65e042f543190' => ($property['type'] === 'text') ? $property['text'] : '',
            );
            error_log('Property : ' . $property['name']);

            $properties[] = $property_entry;

        // Check for the 'position_city' property and assign it to a location taxonomy
        if ($key === 'position_city' && !empty($property['text'])) {
            $location = $property['text'];
            // Ensure the taxonomy term exists, or create it
            if (!term_exists($location, 'location')) {
                // Create the taxonomy term
                wp_insert_term($location, 'location');
            }
            // Assign the term to the post
            wp_set_object_terms($post_id, $location, 'location', true);
        }
        }
        // Update the properties repeater field for the post
        update_field('field_65d8b24e03f45', $properties, $post_id);
        // error_log('Inserted values in fields : ' . $product['name']);

    }

      // Assuming $product['images'] is an array of images
      if (isset($product['images']) && is_array($product['images'])) {
        $images = array();

            foreach ($product['images'] as $image) {
                // error_log( print_r( 'Bilde her: ' . $image['imagePath'], true ) );
                $images[] = array(
                    'field_image_type' => $image['imageType'], // Adjust the array keys based on your actual data structure
                    'field_image_path' => $image['imagePath']
                );
            }
            update_field('field_images', $images, $post_id);

        } else {
            error_log('No images here:');
        }
    
    
}

// Helper function to update language-specific fields
function visbook_update_language_specific_fields($post_id, $product, $language_code)
{
    // Update language-specific fields with suffix
    if ($language_code !== 'EN') { // Assuming 'EN' is the default language and doesn't need suffix
        error_log('Language found, updating fields. Language: ' . $language_code);

        $field_name = 'name_' . $language_code;
        update_field($field_name, $product['name'], $post_id);


        update_field('propertyName_' . $language_code, $product['name'], $post_id);
        update_field('name_' . $language_code, $product['name'], $post_id);

        // Repeat for other language-specific text fields
        // Assuming $product['additionalServices'] is an array of services
        if (isset($product['additionalServices']) && is_array($product['additionalServices'])) {
            $services = array();
            foreach ($product['additionalServices'] as $service) {
                $serviceName = 'name_' . $language_code;
                $service_entry = array(
                    $serviceName => $service['name']
                );
                $services[] = $service_entry;
            }
            update_field('field_additional_services', $services, $post_id);
        }

        // Assuming $product['properties'] is an associative array of properties
        if (isset($product['properties']) && is_array($product['properties'])) {
            $properties = array();
            foreach ($product['properties'] as $key => $property) {
                // $propertyName = 'propertyName_' . $language_code;
                // $propertyText = 'propertyText_' . $language_code;
                // $propertyDescription = 'propertyDescription_' . $language_code;
                // Create an entry for each property

                // $property_entry = array(
                //     $propertyName => $property['name'], // Property name
                //     $propertyText => ($property['type'] === 'text') ? $property['text'] : '',
                //     // $propertyDescription => $property['description']
                // );
                $property_entry = array(
                    'propertyName_' . $language_code => $property['name'], // Property name
                    'propertyText_' . $language_code => ($property['type'] === 'text') ? $property['text'] : '',
                    'propertyDescription_' . $language_code => $property['description']
                );
                error_log('Property : ' . $property['name']);
                $properties[] = $property_entry;
            }
            // Update the properties repeater field for the post
            update_field('field_65d8b24e03f45', $properties, $post_id);
            error_log('Inserted values in fields NO: ' . $product['name']);

        }
    }
}

// Clean up posts
function visbook_cleanup_posts($valid_web_product_ids) {
    // Step 1: Query all posts of your custom post type
    $args = [
        'post_type' => 'product', // Adjust with your custom post type
        'posts_per_page' => -1, // Query all posts
        'fields' => 'ids', // Fetch only the post IDs to improve performance
    ];

    $query = new WP_Query($args);
    $all_post_ids = $query->posts;

    // Step 2: Keep track of seen web_product_ids and their post IDs
    $seen_web_product_ids = [];

    foreach ($all_post_ids as $post_id) {
        $web_product_id = get_post_meta($post_id, 'web_product_id', true);

        // If web_product_id is not in the list of valid IDs, mark for deletion
        if (!in_array($web_product_id, $valid_web_product_ids)) {
            wp_delete_post($post_id, true); // Delete invalid post
            continue; // Move to the next post
        }

        // Check for duplicates and retain only one post per web_product_id
        if (isset($seen_web_product_ids[$web_product_id])) {
            // Duplicate found, delete post
            wp_delete_post($post_id, true);
        } else {
            // Not a duplicate, keep this post and mark web_product_id as seen
            $seen_web_product_ids[$web_product_id] = $post_id;
        }
    }

    // Step 3: Optionally, handle deletion of directories for removed posts
    // visbook_cleanup_directories($valid_web_product_ids, $base_directory);
}



// Languages sync function
function visbook_sync_languages($products_data, $language_code)
{
    foreach ($products_data as $product) {
        $post_id = visbook_find_post_by_product_id($product['webProductId']);

        // Skip if no post found
        if (!$post_id)
            continue;

        // Update language-specific fields
        visbook_update_language_specific_fields($post_id, $product, $language_code);
    }
    
}

// add_action('wp_ajax_visbook_check_completion', 'visbook_check_completion_callback');
// function visbook_check_completion_callback() {
//     $status = get_option('visbook_process_status', 'running'); // Assume 'running' as default
//     echo $status; // Echo the status for AJAX call to use
//     wp_die(); // Terminate AJAX request correctly
// }


//visbook_admin_notice('Other languages loaded successfully.');