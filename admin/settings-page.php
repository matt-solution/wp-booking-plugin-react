<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

function visbook_register_settings()
{
    add_option('visbook_webentity', '');
    register_setting('visbook_options_group', 'visbook_webentity');

    // Initialize with an empty array to ensure it's always an array.
    add_option('visbook_languages', []);
    register_setting('visbook_options_group', 'visbook_languages', [
        'type' => 'array',
        'sanitize_callback' => 'visbook_sanitize_languages',
    ]);
}
add_action('admin_init', 'visbook_register_settings');

function visbook_sanitize_languages($input)
{
    $valid_languages = ['nb-NO', 'de-de', 'sv-SE', 'da'];
    return is_array($input) ? array_intersect($input, $valid_languages) : [];
}

function visbook_add_options_page()
{
    add_options_page('VisBook Settings', 'VisBook', 'manage_options', 'visbook', 'visbook_options_page');
}
add_action('admin_menu', 'visbook_add_options_page');

function visbook_options_page()
{
    $log_path = ABSPATH . 'wp-content/debug.log'; // Adjust the path as necessary
    $log_contents = '';
    if (file_exists($log_path)) {
        $log_contents = file_get_contents($log_path);
    }
?>
    <div class="wrap">
        <h2><?php _e('VisBook Settings', 'visbook-client'); ?></h2>
        <form method="post" action="options.php">
            <?php
            settings_fields('visbook_options_group');
            do_settings_sections('visbook_options_group');
            $selected_languages = get_option('visbook_languages', []);
            ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row"><label for="visbook_webentity">Web Entity ID</label></th>
                    <td><input type="text" id="visbook_webentity" name="visbook_webentity" value="<?php echo esc_attr(get_option('visbook_webentity')); ?>" /></td>
                </tr>
            </table>
            <fieldset>
                <legend><?php _e('Select Languages', 'visbook-client'); ?></legend>
                <label><input type="checkbox" name="visbook_languages[]" value="EN" checked disabled> English (default)</label><br>
                <?php
                $languages = ['nb-NO' => 'Norwegian', 'de-de' => 'German', 'sv-SE' => 'Swedish', 'da' => 'Danish'];
                foreach ($languages as $code => $name) {
                    $checked = in_array($code, $selected_languages) ? 'checked' : '';
                    echo "<label><input type='checkbox' name='visbook_languages[]' value='$code' $checked> $name</label><br>";
                }
                    // Display current language
                    if (function_exists('pll_current_language')) {
                        echo 'Current language: ' .  pll_current_language('locale');
                    } else {
                        echo 'Current language: ' . get_bloginfo("language");
                    }
                ?>
            </fieldset>
            <?php submit_button(); ?>
        </form>

        <form method="post" action="">
            <?php wp_nonce_field('load_default_language_action', 'load_default_language_nonce'); ?>
            <input type="submit" name="load_default_language" class="button button-primary" value="<?php esc_html_e( 'Sync Products with Default Language', 'visbook-client' )?>">
        </form>

        <br>
        <form method="post" action="">
            <?php wp_nonce_field('load_other_languages_action', 'load_other_languages_nonce'); ?>
            <input type="submit" name="load_other_languages" class="button button-primary" value="<?php esc_html_e( 'Sync Other Languages', 'visbook-client' )?>">
        </form>

        <p>&nbsp;</p>
        <form method="post" action="" id="sync-images-form">
            <?php wp_nonce_field('sync_images_action', 'sync_images_nonce'); ?>
            <input type="submit" name="sync_images" class="button button-primary" value="<?php esc_html_e( 'Sync Images', 'visbook-client' )?>">
        </form>

        <p>&nbsp;</p>
        <form method="post" action="">
            <?php wp_nonce_field('clean_up_action', 'clean_up_nonce'); ?>
            <input type="submit" name="clean_up" class="button button-secondary" value="<?php esc_html_e( 'Clean Up', 'visbook-client' )?>">
        </form>

        <h3><?php _e('Log Messages', 'visbook-client'); ?></h3>
        <textarea readonly style="width: 100%; height: 200px;"><?php echo esc_textarea($log_contents); ?></textarea>

        <form method="post" action="">
            <?php wp_nonce_field('clear_debug_log_action', 'clear_debug_log_nonce'); ?>
            <p><input type="submit" name="clear_debug_log" id="clear_debug_log" class="button button-secondary" value="<?php esc_html_e( 'Clear Debug Log', 'visbook-client' )?>"></p>
        </form>


        <!-- Overlay for progress -->
        <div id="visbook-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; text-align: center;">
            <div style="position: relative; top: 50%; transform: translateY(-50%);">
                <img src="<?php echo plugin_dir_url(__DIR__) . '/img/wait.gif'; ?>" alt="Loading..." width="200px">
                <p style="color: white;"><?php _e('Processing..', 'visbook-client'); ?></p>
            </div>
        </div>

    </div>
<?php
}

// Hook into admin_init for form submission handling


function visbook_load_default_language() {
    $default_products_data = visbook_load_json();
    if ($default_products_data) {
        visbook_sync_products_with_posts($default_products_data, 'EN', false); // No image sync here
        visbook_admin_notice('Default language products loaded successfully.');
    }
}

function visbook_load_other_languages() {
    $selected_languages = array_filter((array) get_option('visbook_languages', []), function ($code) {
        return $code !== 'EN';
    });
    foreach ($selected_languages as $language_code) {
        $language_products_data = visbook_load_json($language_code);
        if ($language_products_data) {
            visbook_sync_products_with_posts($language_products_data, $language_code, false); // No image sync here
        }
    }
    visbook_admin_notice('Other languages loaded successfully.');
}

function visbook_sync_images() {
    $products_data = visbook_load_json(); // Load default language products for image sync
    foreach ($products_data as $product) {
        visbook_file_handling_for_all_products($product['images'], $product['webProductId']);
    }
    visbook_admin_notice('Images synced successfully.');
}

function visbook_cleanup() {
    $upload_dir = wp_upload_dir();
    $base_directory = trailingslashit($upload_dir['basedir']) . 'visbook';
    $default_products_data = visbook_load_json(); // Assuming this fetches the latest products data
    $valid_web_product_ids = array_map(function($product) {
        return $product['webProductId'];
    }, $default_products_data);
    visbook_cleanup_directories($valid_web_product_ids, $base_directory);
    visbook_cleanup_posts($valid_web_product_ids);
    visbook_admin_notice('Cleanup process completed successfully.');
}

function visbook_clear_debug_log() {
    $log_path = ABSPATH . 'wp-content/debug.log'; // Adjust the path as needed

    // Check if the log file exists and clear it
    if (file_exists($log_path)) {
        file_put_contents($log_path, '');
        visbook_admin_notice('Debug log cleared successfully.');
    } else {
        visbook_admin_notice('Debug log file does not exist.');
    }
}

function visbook_handle_form_submission() {
    // Load products with default language
    if (isset($_POST['load_default_language']) && check_admin_referer('load_default_language_action', 'load_default_language_nonce')) {
        visbook_load_default_language();
    }

    // Load other languages
    if (isset($_POST['load_other_languages']) && check_admin_referer('load_other_languages_action', 'load_other_languages_nonce')) {
        visbook_load_other_languages();
    }

    // Sync images
    if (isset($_POST['sync_images']) && check_admin_referer('sync_images_action', 'sync_images_nonce')) {
        visbook_sync_images();
    }

    // Clean up
    if (isset($_POST['clean_up']) && check_admin_referer('clean_up_action', 'clean_up_nonce')) {
        visbook_cleanup();
    }

    // Clear debug log
    if (isset($_POST['clear_debug_log']) && check_admin_referer('clear_debug_log_action', 'clear_debug_log_nonce')) {
        visbook_clear_debug_log();
    }
}

add_action('admin_init', 'visbook_handle_form_submission');




// function visbook_handle_form_submission()
// {
//     $upload_dir = wp_upload_dir();
//     $base_directory = trailingslashit($upload_dir['basedir']) . 'visbook';

//     // Load products with default language
//     if (isset($_POST['load_default_language']) && check_admin_referer('load_default_language_action', 'load_default_language_nonce')) {
//         $default_products_data = visbook_load_json();
//         if ($default_products_data) {
//             visbook_sync_products_with_posts($default_products_data, 'EN', false); // No image sync here
//             visbook_admin_notice('Default language products loaded successfully.');
//         }
//     }

//     // Load other languages
//     if (isset($_POST['load_other_languages']) && check_admin_referer('load_other_languages_action', 'load_other_languages_nonce')) {
//         $selected_languages = array_filter((array) get_option('visbook_languages', []), function ($code) {
//             return $code !== 'EN';
//         });
//         foreach ($selected_languages as $language_code) {
//             $language_products_data = visbook_load_json($language_code);
//             if ($language_products_data) {
//                 visbook_sync_products_with_posts($language_products_data, $language_code, false); // No image sync here
//             }
//         }
//         visbook_admin_notice('Other languages loaded successfully.');
//     }

//     // Sync images
//     if (isset($_POST['sync_images']) && check_admin_referer('sync_images_action', 'sync_images_nonce')) {
//         $products_data = visbook_load_json(); // Load default language products for image sync
//         foreach ($products_data as $product) {
//             visbook_file_handling_for_all_products($product['images'], $product['webProductId']);
//         }
//         visbook_admin_notice('images_synced_successfully');
//     }

//     // Clean up
//     if (isset($_POST['clean_up']) && check_admin_referer('clean_up_action', 'clean_up_nonce')) {
//         $default_products_data = visbook_load_json(); // Assuming this fetches the latest products data
//         $valid_web_product_ids = array_map(function($product) {
//             return $product['webProductId'];
//         }, $default_products_data);
//         visbook_cleanup_directories($valid_web_product_ids, $base_directory);
//         visbook_cleanup_posts($valid_web_product_ids);
//         visbook_admin_notice('Cleanup process completed successfully.');
//     }


//     if (isset($_POST['clear_debug_log']) && check_admin_referer('clear_debug_log_action', 'clear_debug_log_nonce')) {
//         $log_path = ABSPATH . 'wp-content/debug.log'; // Adjust the path as needed

//         // Check if the log file exists and clear it
//         if (file_exists($log_path)) {
//             file_put_contents($log_path, '');
//             visbook_admin_notice('Debug log cleared successfully.');
//         } else {
//             visbook_admin_notice('Debug log file does not exist.');
//         }
//     }
// }
// add_action('admin_init', 'visbook_handle_form_submission');

// Helper function for admin notices
function visbook_admin_notice($message, $type = 'success')
{
    add_action('admin_notices', function () use ($message, $type) {
        $class = 'notice notice-' . $type . ' is-dismissible';
        $message = esc_html__($message, 'visbook-client'); // Assuming localization is required
        // Include JavaScript directly to hide the overlay when the notice is displayed
        $script = '<script type="text/javascript">jQuery(document).ready(function($) { $("#visbook-overlay").hide(); });</script>';
        printf('<div class="%1$s"><p>%2$s</p></div>%3$s', esc_attr($class), $message, $script);
    });
}

// Helper function to process each language
function process_language($language_code)
{
    $products_data = visbook_load_json($language_code);
    if ($products_data) {
        visbook_sync_products_with_posts($products_data, $language_code);
    }
}

function visbook_admin_scripts() {
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Define ajaxurl if it's not already available
            var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';

            // Bind on all form submissions
            $('form').on('submit', function(e) {
                var $form = $(this);
                var isAjaxForm = $form.hasClass('ajax-form'); // Let's differentiate AJAX forms

                $("#visbook-overlay").show(); // Show the overlay

                if (isAjaxForm) {
                    e.preventDefault(); // Prevent normal form submission for AJAX forms
                    var formData = $form.serialize(); // Serialize the form data

                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: formData,
                        success: function(response) {
                            // Handle response, hide overlay
                            $("#visbook-overlay").hide();
                            alert('Operation completed successfully');
                            // Optionally reload the page or redirect
                        }
                    });
                } else {
                    // For non-AJAX forms, let the form submit normally
                    // Overlay will be handled by the page reload
                }
            });

            // Check if the settings were saved and hide the overlay if so
            // This checks for the 'settings-updated' query param in the URL
            $(window).on('load', function() {
                var settingsUpdated = new URLSearchParams(window.location.search).has('settings-updated');
                if (settingsUpdated) {
                    $("#visbook-overlay").hide(); // Hide overlay if settings were updated
                }
            });
        });
    </script>
    <?php
}
add_action('admin_footer', 'visbook_admin_scripts');
