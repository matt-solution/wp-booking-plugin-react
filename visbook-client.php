<?php

/*
Plugin Name: VisBook Client
Description: Fetches and displays data from the VisBook API.
Version: 1.2
Author: Konsulenten Reidar Nygård
Domain Path: /languages
Text Domain: visbook-client
Author URI: https://www.konsulenten.no
 */

// Include necessary files
include_once plugin_dir_path(__FILE__) . 'admin/settings-page.php';

// Visbook includes
include_once plugin_dir_path(__FILE__) . 'includes/visbook-core.php';
include_once plugin_dir_path(__FILE__) . 'includes/visbook-filehandling.php';

// Include the register_cpt.php.php file
include_once plugin_dir_path(__FILE__) . 'includes/register-cpt.php';

// Include the add_acf_fields.php file
// include_once plugin_dir_path( __FILE__ ) . 'includes/add-acf-fields.php';

// TO DO: make sure the correct ACF-JSON file is included in plugin folder and invisible to backend users
function getOrdergroups_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/ordergroups', array(
      'methods' => 'GET',
      'callback' => 'getAllOrderGroups',
    ));
}

add_action('rest_api_init', 'getOrdergroups_endpoint');

function getAllOrderGroups($data)
{
    $webident = '10268';
    $cookieValue = isset($_COOKIE['_VisBook']) ? $_COOKIE['_VisBook'] : '';
    $cookie= ".VisBook={$cookieValue};";


    $url = "https://ws.visbook.com/api/{$webident}/ordergroups";

    $response = wp_remote_get($url, array(
        'headers' => array(
            'Cookie' => $cookie,
        ),
    ));
  
    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    return rest_ensure_response($data);
}

function checkout_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/checkout', array(
        'methods' => 'POST',
        'callback' => 'checkout'
    ));
}

add_action('rest_api_init', 'checkout_endpoint');

function checkout($request)
{
    $webident = '10268';
    $data = $request->get_json_params();

    $url = "https://ws.visbook.com/api/{$webident}/checkout";
    $payload = array(
        'reservations' => array(
            array(
                'reservationId' => $data['reservationId'],
                'encryptedCompanyId' => $data['encryptedCompanyId'],
            )
        ),
        'successUrl' => 'https://motorhome.dev/order?',
        'errorUrl' => 'https://motorhome.dev/10268/order?',
        'paymentType' => 'noOnlinePayment',
        'amount' => $data['amount'],
        'customer' => array(
          "company" => $data['company'],
          "city" => $data['city'],
          "country" => 826,
          "firstName" => $data['firstName'],
          "lastName" => $data['lastName'],
          "address" => $data['address'],
          "email" => $data['email'],
          "phone" => "string",
          "zipCode" => $data['zipCode'],
          "mobile" => $data['mobile'],
          "passportNumber" => "string",
          "title"=> "string",
          "extra1" => "string",
          "extra2" => "string",
          "extra3" => "string",
          "extra4" => "string",
          "extra5" => "string",
          "followupAccepted" => false,
          "organizationNumber" => "string"
        ),
       "acceptedTerms" => true
    );
//    return $payload;
    $cookieValue = isset($_COOKIE['_VisBook']) ? $_COOKIE['_VisBook'] : '';
    $cookie= ".VisBook={$cookieValue};";
  
    $response = wp_remote_post($url, array(
        'body' => json_encode($payload),
        'headers' => array(
            'Cookie' => $cookie,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Referer' => 'https://motorhome.dev',
        ),
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $decoded_body = json_decode($body, true);

    return new WP_REST_Response($decoded_body, 200);
}

function getUserData_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/user', array(
      'methods' => 'GET',
      'callback' => 'getUserDataWithTheMostRecentOrder',
    ));
}

add_action('rest_api_init', 'getUserData_endpoint');

function getUserDataWithTheMostRecentOrder($data)
{
    $webident = '10268';
    $cookieValue = isset($_COOKIE['_VisBook']) ? $_COOKIE['_VisBook'] : '';
    $cookie= ".VisBook={$cookieValue};";


    $url = "https://ws.visbook.com/api/{$webident}/user";

    $response = wp_remote_get($url, array(
        'headers' => array(
            'Cookie' => $cookie,
        ),
    ));
  
    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    return rest_ensure_response($data);
}

function emailLoginValidation_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/validation/email', array(
        'methods' => 'GET',
        'callback' => 'emailLoginValidation',
        'args' => array(
            'token' => array(
                'required' => true,
            )
        ),
    ));
}

add_action('rest_api_init', 'emailLoginValidation_endpoint');

function emailLoginValidation($data)
{
    $webident = '10268';
    $token = $data['token'];

    $url = "https://ws.visbook.com/api/{$webident}/validation/email/{$token}";

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    $headers = wp_remote_retrieve_headers($response);
    $cookies = isset($headers['set-cookie']) ? $headers['set-cookie'] : [];

    // If the cookie is set, add it to the response headers
     if (!empty($cookies)) {
        if (is_array($cookies)) {
            foreach ($cookies as $cookie) {
                header("Set-Cookie: $cookie", false);
            }
        } else {
            header("Set-Cookie: $cookies", false);
        }
    }

    return new WP_REST_Response($data, 200);

}

function checkout_PaymentType_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/checkout/paymentTypes', array(
        'methods' => 'GET',
        'callback' => 'checkoutPaymentType',
    ));
}

add_action('rest_api_init', 'checkout_PaymentType_endpoint');

function checkoutPaymentType($data)
{
    $webident = '10268';
    $url = "https://ws.visbook.com/api/{$webident}/checkout/paymenttypes";

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $decoded_body = json_decode($body, true);

    return new WP_REST_Response($decoded_body, 200);
}

function setup_Terms_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/setup/terms', array(
        'methods' => 'POST',
        'callback' => 'setupTerms',
        'args' => array(
            'reservationId' => array(
                'required' => false,
            ),
            'encryptedCompanyId' => array(
                'required' => false,
            ),
        ),
    ));
}

add_action('rest_api_init', 'setup_Terms_endpoint');

function setupTerms($data)
{
    $webident = '10268';
    $url = "https://ws.visbook.com/api/{$webident}/setup/terms";
    $postData = [
      [
        'reservationId' => $data['reservationId'],
        'encryptedCompanyId' => $data['encryptedCompanyId'],
      ]
    ];

    $response = wp_remote_post($url, array(
        'body' => json_encode($postData),
        'headers' => array(
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Referer' => 'https://motorhome.dev',
        ),
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $decoded_body = json_decode($body, true);

    return new WP_REST_Response($decoded_body, 200);
}

function pingReservervations_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/reservations/ping', array(
        'methods' => 'POST',
        'callback' => 'pingReservation',
        'args' => array(
            'reservationId' => array(
                'required' => true,
            ),
            'encryptedCompanyId' => array(
                'required' => true,
            ),
        ),
    ));
}

add_action('rest_api_init', 'pingReservervations_endpoint');

function pingReservation($data)
{
    $webident = '10268';
    $url = "https://ws.visbook.com/api/{$webident}/reservations/ping";
    $postData = [
      [
        'reservationId' => $data['reservationId'],
        'encryptedCompanyId' => $data['encryptedCompanyId'],
      ]
    ];

    $response = wp_remote_post($url, array(
        'body' => json_encode($postData),
        'headers' => array(
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Referer' => 'https://motorhome.dev',
        ),
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $decoded_body = json_decode($body, true);

    return new WP_REST_Response($decoded_body, 200);
}

function getProductById_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/getProductbyId', array(
        'methods' => 'GET',
        'callback' => 'getWebProduct',
        'args' => array(
            'from' => array(
                'required' => true,
            ),
            'to' => array(
                'required' => true,
            ),
            'webProductId' => array(
                'required' => true,
            ),
            'numberOfPersons' => array(
                'required' => false,
            ),
        )
    ));
}

add_action('rest_api_init', 'getProductById_endpoint');

function getWebProduct($data)
{
    $webident = '10268';
    $from = $data['from'];
    $to = $data['to'];
    $webProductId = $data['webProductId'];
    $numberOfPersons = $data['numberOfPersons'];
    
    $url = "https://ws.visbook.com/api/{$webident}/webproducts/{$from}/{$to}/{$webProductId}";

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    return $data;
}

function create_reservations_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/reservations', array(
        'methods' => 'POST',
        'callback' => 'createReservations',
        'args' => array(
            'fromDate' => array(
                'required' => true,
            ),
            'toDate' => array(
                'required' => true,
            ),
            'priceId' => array(
                'required' => true,
            ),
            'numberOfPeople' => array(
                'required' => true,
            ),
            'webProductId' => array(
                'required' => true,
            ),
            'notes' => array(
                'required' => false,
            ),
            'guestsNames' => array(
                'required' => false,
            ),
            'guestsAges' => array(
                'required' => false,
            ),
            'additionalServices' => array(
                'required' => false,
            ),
            'additionalMerchandises' => array(
                'required' => false,
            ),
        ),
    ));
}

add_action('rest_api_init', 'create_reservations_endpoint');

function createReservations($data)
{
    $webident = '10268';
    $url = "https://ws.visbook.com/api/{$webident}/reservations";
    $postData = array(
    'fromDate' => $data['fromDate'],
    'toDate' => $data['toDate'],
    'priceId' => intval($data['priceId']),
    'numberOfPeople' => intval($data['numberOfPeople']),
    'webProductId' => intval($data['webProductId']),
    'notes' => sanitize_textarea_field($data['notes'] ?? ""),
    'guestsNames' => sanitize_text_field($data['guestsNames'] ?? ""),
    'additionalServices' => $data['additionalServices'],
    'additionalMerchandises' => $data['additionalMerchandises'],
  );
//print_r($postData); exit();
    $response = wp_remote_post($url, array(
        'body' => json_encode($postData),
        'headers' => array(
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Referer' => 'https://motorhome.dev',
        ),
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $decoded_body = json_decode($body, true);

    return new WP_REST_Response($decoded_body, 200);

}

function email_confirmation_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/email-confirmation', array(
        'methods' => 'POST',
        'callback' => 'emailConfirmation',
        'args' => array(
            'email' => array(
                'required' => true,
            ),
        ),
    ));
}
add_action('rest_api_init', 'email_confirmation_endpoint');

function emailConfirmation($data)
{
    $webident = '10268';
    $email = sanitize_email($data['email']);
    $url = "https://ws.visbook.com/api/{$webident}/login/request/email";
    
    $data = array(
        'email' => $email
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: multipart/form-data',
        'Referer: https://motorhome.dev',
    ));
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
    }
    curl_close($ch);
    return $response;
}
function phonenumber_confirmation_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/phonenumber-confirmation', array(
        'methods' => 'POST',
        'callback' => 'phonenumberConfirmation',
        'args' => array(
            'countryCode' => array(
                'required' => true,
            ),
            'phoneNumber' => array(
                'required' => true,
            ),

        ),
    ));
}
add_action('rest_api_init', 'phonenumber_confirmation_endpoint');

function phonenumberConfirmation($data)
{
    $webident = '10268';
    $countryCode = $data['countryCode'];
    $phoneNumber = $data['phoneNumber'];

    $url = 'https://ws.visbook.com/api/10268/login/request/sms';
    $data = array(
        'countryCode' => $countryCode,
        'phoneNumber' => $phoneNumber,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: multipart/form-data',
        'Referer: https://motorhome.dev',
    ));
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
    }
    curl_close($ch);
    return $response;
}

function checkAvailability_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/availability/', array(
        'methods' => 'GET',
        'callback' => 'checkAvailability',
        'args' => array(
            'product_id' => array(
                'required' => true,
            ),
            'end_date' => array(
                'required' => true,
            ),
        ),
    ));
}

add_action('rest_api_init', 'checkAvailability_endpoint');

function checkAvailability($data)
{
    $webident = '10268';
    $product_id = $data['product_id'];
    $end_date = $data['end_date'];

    $url = "https://ws.visbook.com/api/{$webident}/availability/{$product_id}/{$end_date}";
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    return $data;
}

function getPrices_endpoint()
{
    register_rest_route('visbook-plugin/v2', '/webproducts/', array(
        'methods' => 'GET',
        'callback' => 'getPrices',
        'args' => array(
            'product_id' => array(
                'required' => false,
            ),
            'start_date' => array(
                'required' => true,
            ),
            'end_date' => array(
                'required' => true,
            ),
        ),
    ));
}

add_action('rest_api_init', 'getPrices_endpoint');

function getPrices($data)
{
    $webident = '10268';
    $product_id = $data['product_id'];
    $start_date = $data['start_date'];
    $end_date = $data['end_date'];

    $url = "https://ws.visbook.com/api/{$webident}/webproducts/{$start_date}/{$end_date}/{$product_id}";
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data)) {
        return ['error' => 'No data received from the API'];
    }
    return $data;
}

function get_current_language_rest()
{
    register_rest_route('visbook-plugin/v2', '/current-language', array(
        'methods' => 'GET',
        'callback' => 'getCurrentLanguage',
    ));
}

add_action('rest_api_init', 'get_current_language_rest');

function getCurrentLanguage()
{
    return get_locale();
}
function expose_current_language_to_js()
{
    // Get the current language
    $current_language = get_locale();

    // Localize the script with the current language data
    wp_enqueue_script('visbook-app-js', plugins_url('/dist/visbook-app.js', __FILE__), array(), '1.0.0', true);
    wp_localize_script('visbook-app-js', 'wpData', array(
        'currentLanguage' => $current_language,
    ));
}
add_action('wp_enqueue_scripts', 'expose_current_language_to_js');

// Enqueue scripts
function visbook_enqueue_scripts()
{
    wp_enqueue_script('visbook-app-js', plugins_url('/dist/visbook-app.js', __FILE__), array(), '1.0.0', true);
    wp_enqueue_style('visbook-app-css', plugins_url('/dist/visbook-app.css', __FILE__), array(), '1.0.0', 'all');
}
add_action('wp_enqueue_scripts', 'visbook_enqueue_scripts');

// Load text domain for i18n
function visbook_load_plugin_textdomain()
{
    load_plugin_textdomain('visbook-client', false, basename(dirname(__FILE__)) . '/languages/');
}
add_action('plugins_loaded', 'visbook_load_plugin_textdomain');

function visbook_handle_check_progress_ajax()
{
    // Get the progress of the load/setup process
    $progress = get_option('visbook_load_progress', '0');
    echo $progress;
    wp_die(); // End AJAX request
}
add_action('wp_ajax_visbook_check_progress', 'visbook_handle_check_progress_ajax');

add_action('wp_ajax_visbook_update_log', 'visbook_handle_update_log_ajax');
function visbook_handle_update_log_ajax()
{
    $log_contents = file_get_contents(ABSPATH . 'wp-content/debug.log'); // Adjust path as needed
    echo esc_textarea($log_contents);
    wp_die();
}

// Save ACF json to plugin directory

define('MY_PLUGIN_DIR_PATH', untrailingslashit(plugin_dir_path(__FILE__)));
add_filter('acf/settings/save_json', 'acf_json_save_point');

function acf_json_save_point($path)
{
    // Update path
    $path = MY_PLUGIN_DIR_PATH . '/acf-json';
    // Return path
    return $path;
}
