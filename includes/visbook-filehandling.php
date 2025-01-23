<?php 

// Functions for file handling
function visbook_file_handling_for_all_products($images, $webProductId) {
    require_once(ABSPATH . 'wp-admin/includes/file.php'); // For wp_mkdir_p()
    require_once(ABSPATH . 'wp-admin/includes/image.php'); // For wp_generate_attachment_metadata()

    $upload_dir = wp_upload_dir(); // Get WordPress upload directory.
    $file_location = trailingslashit($upload_dir['basedir']) . 'visbook/' . $webProductId;

    // Check if the directory exists, if not, create it.
    if (!file_exists($file_location)) {
        wp_mkdir_p($file_location);
    }


    foreach ($images as $image) {
        $img_url = $image['transformer'] . "/" . $image['imagePath'];
        $image_data = file_get_contents($img_url); // Get image data.

        if ($image_data === false) {
            error_log("Failed to download image from URL: $img_url");
            continue; // Skip to next image if download failed.
        }

    // Extract the last folder name from the imagePath and append it to the filename
    $path_info = pathinfo($image['imagePath']);
    $directories = explode('/', trim($path_info['dirname'], '/')); // Split the directory path
    $last_dir_name = end($directories); // Get the last directory name

    // Prepare image file name including the last directory name
    $imgName = $last_dir_name . '_' . $path_info['filename'] . '.' . $path_info['extension'];
    $file_path = $file_location . '/' . $imgName;

        if (file_exists($file_path)) {
            $existing_data = file_get_contents($file_path);
            if ($existing_data !== $image_data) {
                // Existing image is different, replace it
                file_put_contents($file_path, $image_data);
            }
        } else {
            // Image does not exist, save new image
            file_put_contents($file_path, $image_data);
        }
    }
    error_log("Image sync completed for product $webProductId");
}


// 
// Helper functions
// 

function visbook_cleanup_directories($valid_product_ids, $base_directory) {
    $existing_folders = scandir($base_directory);
    foreach ($existing_folders as $folder) {
        if ($folder === '.' || $folder === '..') continue; // Skip special directories
        if (!in_array($folder, $valid_product_ids)) {
            // This folder does not correspond to a current product ID, delete it
            $folder_path = $base_directory . '/' . $folder;
            visbook_recursive_delete($folder_path);
        }
    }
}

function visbook_recursive_delete($dir) {
    if (!is_dir($dir)) {
        return unlink($dir);
    }
    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') continue;
        if (!visbook_recursive_delete($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }
    }
    return rmdir($dir);
}