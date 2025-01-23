<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}



// GET CURRENT LANGUAGE FOR REACT
add_action('wp_ajax_get_current_language', 'get_current_language');
add_action('wp_ajax_nopriv_get_current_language', 'get_current_language'); // For non-logged-in users

function get_current_language()
{
    if (function_exists('pll_current_language')) {
        // echo pll_current_language('locale');
        echo json_encode(array('result' => pll_current_language('locale')));
    } else {
        echo 'Current language: ' . get_bloginfo("language");
    }
    wp_die(); // Always include wp_die() to terminate the script
}



// TESTING CRON SETUP
require_once plugin_dir_path(__FILE__) . '../includes/visbook-core.php';
require_once plugin_dir_path(__FILE__) . 'settings-page.php'; // Ensure the refactored functions are available

// Load default language
add_action('wp_ajax_load_default_language', 'load_default_language_callback');
add_action('run_sync_commands_cron_event', 'load_default_language_callback');

function load_default_language_callback() {
    error_log('Starting to sync default language.');

    visbook_load_default_language(); // This will use 'EN' as default

    if (defined('DOING_CRON') && DOING_CRON) {
        error_log('Default language loaded successfully through cron.');
    } else {
        wp_send_json_success('Default language loaded successfully.');
    }
}

// Load other languages
add_action('wp_ajax_load_other_languages', 'load_other_languages_callback');
add_action('run_sync_commands_cron_event', 'load_other_languages_callback');

function load_other_languages_callback() {
    error_log('Starting to sync other languages.');

    visbook_load_other_languages();

    if (defined('DOING_CRON') && DOING_CRON) {
        error_log('Other languages loaded successfully through cron.');
    } else {
        wp_send_json_success('Other languages loaded successfully.');
    }
}

// Sync images
add_action('wp_ajax_sync_images', 'sync_images_callback');
add_action('run_sync_commands_cron_event', 'sync_images_callback');

function sync_images_callback() {
    error_log('Starting to sync images.');

    visbook_sync_images();

    if (defined('DOING_CRON') && DOING_CRON) {
        error_log('Images synced successfully through cron.');
    } else {
        wp_send_json_success('Images synced successfully.');
    }
}

// Ensure these functions are available globally
add_action('wp_ajax_run_sync_commands', 'load_default_language_callback');
add_action('wp_ajax_run_sync_commands', 'load_other_languages_callback');
add_action('wp_ajax_run_sync_commands', 'sync_images_callback');
