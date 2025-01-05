<?php
/**
 * Theme functions and definitions
 *
 * @package HelloElementor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'HELLO_ELEMENTOR_VERSION', '3.1.0' );

if ( ! isset( $content_width ) ) {
	$content_width = 800; // Pixels.
}

if ( ! function_exists( 'hello_elementor_setup' ) ) {
	/**
	 * Set up theme support.
	 *
	 * @return void
	 */
	function hello_elementor_setup() {
		if ( is_admin() ) {
			hello_maybe_update_theme_version_in_db();
		}

		if ( apply_filters( 'hello_elementor_register_menus', true ) ) {
			register_nav_menus( [ 'menu-1' => esc_html__( 'Header', 'hello-elementor' ) ] );
			register_nav_menus( [ 'menu-2' => esc_html__( 'Footer', 'hello-elementor' ) ] );
		}

		if ( apply_filters( 'hello_elementor_post_type_support', true ) ) {
			add_post_type_support( 'page', 'excerpt' );
		}

		if ( apply_filters( 'hello_elementor_add_theme_support', true ) ) {
			add_theme_support( 'post-thumbnails' );
			add_theme_support( 'automatic-feed-links' );
			add_theme_support( 'title-tag' );
			add_theme_support(
				'html5',
				[
					'search-form',
					'comment-form',
					'comment-list',
					'gallery',
					'caption',
					'script',
					'style',
				]
			);
			add_theme_support(
				'custom-logo',
				[
					'height'      => 100,
					'width'       => 350,
					'flex-height' => true,
					'flex-width'  => true,
				]
			);

			/*
			 * Editor Style.
			 */
			add_editor_style( 'classic-editor.css' );

			/*
			 * Gutenberg wide images.
			 */
			add_theme_support( 'align-wide' );

			/*
			 * WooCommerce.
			 */
			if ( apply_filters( 'hello_elementor_add_woocommerce_support', true ) ) {
				// WooCommerce in general.
				add_theme_support( 'woocommerce' );
				// Enabling WooCommerce product gallery features (are off by default since WC 3.0.0).
				// zoom.
				add_theme_support( 'wc-product-gallery-zoom' );
				// lightbox.
				add_theme_support( 'wc-product-gallery-lightbox' );
				// swipe.
				add_theme_support( 'wc-product-gallery-slider' );
			}
		}
	}
}
add_action( 'after_setup_theme', 'hello_elementor_setup' );

function hello_maybe_update_theme_version_in_db() {
	$theme_version_option_name = 'hello_theme_version';
	// The theme version saved in the database.
	$hello_theme_db_version = get_option( $theme_version_option_name );

	// If the 'hello_theme_version' option does not exist in the DB, or the version needs to be updated, do the update.
	if ( ! $hello_theme_db_version || version_compare( $hello_theme_db_version, HELLO_ELEMENTOR_VERSION, '<' ) ) {
		update_option( $theme_version_option_name, HELLO_ELEMENTOR_VERSION );
	}
}

if ( ! function_exists( 'hello_elementor_display_header_footer' ) ) {
	/**
	 * Check whether to display header footer.
	 *
	 * @return bool
	 */
	function hello_elementor_display_header_footer() {
		$hello_elementor_header_footer = true;

		return apply_filters( 'hello_elementor_header_footer', $hello_elementor_header_footer );
	}
}

if ( ! function_exists( 'hello_elementor_scripts_styles' ) ) {
	/**
	 * Theme Scripts & Styles.
	 *
	 * @return void
	 */
	function hello_elementor_scripts_styles() {
		$min_suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		if ( apply_filters( 'hello_elementor_enqueue_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor',
				get_template_directory_uri() . '/style' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( apply_filters( 'hello_elementor_enqueue_theme_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor-theme-style',
				get_template_directory_uri() . '/theme' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( hello_elementor_display_header_footer() ) {
			wp_enqueue_style(
				'hello-elementor-header-footer',
				get_template_directory_uri() . '/header-footer' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}
	}
}
add_action( 'wp_enqueue_scripts', 'hello_elementor_scripts_styles' );

if ( ! function_exists( 'hello_elementor_register_elementor_locations' ) ) {
	/**
	 * Register Elementor Locations.
	 *
	 * @param ElementorPro\Modules\ThemeBuilder\Classes\Locations_Manager $elementor_theme_manager theme manager.
	 *
	 * @return void
	 */
	function hello_elementor_register_elementor_locations( $elementor_theme_manager ) {
		if ( apply_filters( 'hello_elementor_register_elementor_locations', true ) ) {
			$elementor_theme_manager->register_all_core_location();
		}
	}
}
add_action( 'elementor/theme/register_locations', 'hello_elementor_register_elementor_locations' );

if ( ! function_exists( 'hello_elementor_content_width' ) ) {
	/**
	 * Set default content width.
	 *
	 * @return void
	 */
	function hello_elementor_content_width() {
		$GLOBALS['content_width'] = apply_filters( 'hello_elementor_content_width', 800 );
	}
}
add_action( 'after_setup_theme', 'hello_elementor_content_width', 0 );

if ( ! function_exists( 'hello_elementor_add_description_meta_tag' ) ) {
	/**
	 * Add description meta tag with excerpt text.
	 *
	 * @return void
	 */
	function hello_elementor_add_description_meta_tag() {
		if ( ! apply_filters( 'hello_elementor_description_meta_tag', true ) ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		$post = get_queried_object();
		if ( empty( $post->post_excerpt ) ) {
			return;
		}

		echo '<meta name="description" content="' . esc_attr( wp_strip_all_tags( $post->post_excerpt ) ) . '">' . "\n";
	}
}
add_action( 'wp_head', 'hello_elementor_add_description_meta_tag' );

// Admin notice
if ( is_admin() ) {
	require get_template_directory() . '/includes/admin-functions.php';
}

// Settings page
require get_template_directory() . '/includes/settings-functions.php';

// Header & footer styling option, inside Elementor
require get_template_directory() . '/includes/elementor-functions.php';

if ( ! function_exists( 'hello_elementor_customizer' ) ) {
	// Customizer controls
	function hello_elementor_customizer() {
		if ( ! is_customize_preview() ) {
			return;
		}

		if ( ! hello_elementor_display_header_footer() ) {
			return;
		}

		require get_template_directory() . '/includes/customizer-functions.php';
	}
}
add_action( 'init', 'hello_elementor_customizer' );

if ( ! function_exists( 'hello_elementor_check_hide_title' ) ) {
	/**
	 * Check whether to display the page title.
	 *
	 * @param bool $val default value.
	 *
	 * @return bool
	 */
	function hello_elementor_check_hide_title( $val ) {
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$current_doc = Elementor\Plugin::instance()->documents->get( get_the_ID() );
			if ( $current_doc && 'yes' === $current_doc->get_settings( 'hide_title' ) ) {
				$val = false;
			}
		}
		return $val;
	}
}
add_filter( 'hello_elementor_page_title', 'hello_elementor_check_hide_title' );

/**
 * BC:
 * In v2.7.0 the theme removed the `hello_elementor_body_open()` from `header.php` replacing it with `wp_body_open()`.
 * The following code prevents fatal errors in child themes that still use this function.
 */
if ( ! function_exists( 'hello_elementor_body_open' ) ) {
	function hello_elementor_body_open() {
		wp_body_open();
	}
}


/*-------------------------------*/


// Define the shortcode for your custom form


// Function to get options for Member Types from JetEngine custom post type
function get_member_types_options() {
    $options = array();

    $args = array(
        'post_type' => 'member-types', // Replace with your custom post type slug
        'posts_per_page' => -1, // Retrieve all posts
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $member_type_id = get_the_ID();
            $member_type_name = get_the_title($member_type_id);

            $options[$member_type_id] = $member_type_name;
        }
        wp_reset_postdata();
    }

    return $options;
}

// Function to get options for Position from JetEngine custom taxonomy
function get_position_options() {
    $options = array();

    $args = array(
        'taxonomy' => 'position', // Replace with your custom taxonomy slug
        'hide_empty' => false, // Show all terms, even if they have no posts
    );

    $terms = get_terms($args);

    if (!empty($terms) && !is_wp_error($terms)) {
        foreach ($terms as $term) {
            $options[$term->slug] = $term->name;
        }
    }

    return $options;
}


// Shortcode to display custom member form
function custom_member_form_shortcode() {
    ob_start();
    ?>
    <style>
        /* Custom CSS for form layout */
        .custom-member-form {
            font-family: Roboto, sans-serif;
        }

        .jet-form-row {
            margin-bottom: 15px;
            display: flex;
            flex-wrap: wrap;
        }

        .jet-form-row label {
            flex: 1 0 100%; /* Full width for labels to be on top */
            margin-bottom: 5px; /* Space between label and input */
            font-weight: bold; /* Make labels bold */
            position: relative; /* Position relative for pseudo elements */
        }

        .jet-form-row label .jet-form-required {
            display: none; /* Hide the asterisk */
        }

        .jet-form-row .jet-form-input,
        .jet-form-row .jet-form-select,
        .jet-form-row .jet-form-textarea,
        .jet-form-row .jet-form-file {
            flex: 1 0 calc(50% - 5px); /* Two columns per row */
            padding: 8px;
            font-size: 14px;
        }

        .jet-form-row .dob-fields {
            display: flex;
            gap: 5px;
        }

        .jet-form-row .dob-fields select {
            flex: 1 0 calc(33.33% - 5px); /* Three columns for date select fields */
        }

        .jet-form-row .jet-form-submit {
            margin-left: auto;
            padding: 10px 15px;
            background-color: yellow;
            color: black;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 400;
            font-family: 'Roboto';
        }
    </style>
<!-- HTML Structure -->
    <div class="custom-member-form">
        <form id="custom-member-form" class="jet-form" enctype="multipart/form-data" method="post">
    <?php wp_nonce_field('custom_member_form', 'custom_member_form_nonce'); ?>
    <!-- Step 1: Personal Information -->
    <div class="step-1">
        <!-- Member Types (Select) -->
        <div class="jet-form-row">
            <label for="member_types">Member Type</label>
            <select id="member_types" name="member_types" class="jet-form-select" required>
                <option value="">Select Member Type</option>
                <option value="general">General</option>
                <option value="active">Active</option>
            </select>
        </div>

        <!-- Position (Select) -->
        <div class="jet-form-row">
            <label for="position">Position</label>
            <select id="position" name="position" class="jet-form-select" required>
                <option value="">Select Position</option>
                <?php
                $positions = get_position_options();
                foreach ($positions as $position_slug => $position_name) {
                    echo '<option value="' . esc_attr($position_slug) . '">' . esc_html($position_name) . '</option>';
                }
                ?>
            </select>
        </div>

        <!-- Full Name -->
        <div class="jet-form-row">
            <label for="full_name">Full Name</label>
            <input type="text" id="full_name" name="full_name" class="jet-form-input" required>
        </div>

        <!-- Phone Number -->
        <div class="jet-form-row">
            <label for="phone_number">Phone Number</label>
            <input type="tel" id="phone_number" name="phone_number" class="jet-form-input" required>
        </div>

        <!-- Email Address -->
        <div class="jet-form-row">
            <label for="email_address">Email Address</label>
            <input type="email" id="email_address" name="email_address" class="jet-form-input" required>
        </div>

        <!-- Date of Birth -->
        <div class="advanced-date-of-birth">
            <label for="dob_day">Date of Birth</label>
            <div class="dob-fields">
                <select id="dob_day" name="dob_day" class="jet-form-select" required>
                    <option value="">Day</option>
                    <?php for ($i = 1; $i <= 31; $i++) { ?>
                        <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                    <?php } ?>
                </select>
                <select id="dob_month" name="dob_month" class="jet-form-select" required>
                    <option value="">Month</option>
                    <?php for ($i = 1; $i <= 12; $i++) { ?>
                        <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                    <?php } ?>
                </select>
                <select id="dob_year" name="dob_year" class="jet-form-select" required>
                    <option value="">Year</option>
                    <?php for ($i = date('Y'); $i >= 1920; $i--) { ?>
                        <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                    <?php } ?>
                </select>
            </div>
        </div>
    </div>

    <!-- Step 2: Address Information -->
    <div class="step-2" style="display: none;">
        <!-- Address -->
        <div class="jet-form-row">
            <label for="address">Address</label>
            <textarea id="address" name="address" class="jet-form-textarea" required></textarea>
        </div>

        <!-- State Select (Dynamic) -->
        <div class="jet-form-row">
            <label for="state">State</label>
            <select id="state" name="state" required>
                <option value="">Select State</option>
                <?php
                $indian_states = get_indian_states();
                foreach ($indian_states as $state) {
                    echo '<option value="' . esc_attr($state) . '">' . esc_html($state) . '</option>';
                }
                ?>
            </select>
        </div>

        <!-- District Select (Dynamic, dependent on State selection) -->
        <div class="jet-form-row">
            <label for="district">District</label>
            <select id="district" name="district" class="jet-form-select" required>
                <option value="">Select District</option>
            </select>
        </div>

        <!-- Pin Code -->
        <div class="jet-form-row">
            <label for="pin_code">Pin Code</label>
            <input type="text" id="pin_code" name="pin_code" class="jet-form-input" required>
        </div>
    </div>

    <div class="step-3" style="display: none;">
        <!-- Parliament Constituency Select (Dynamic) -->
        <div class="jet-form-row">
            <label for="loksabha">Parliament Constituency</label>
            <select id="loksabha" name="loksabha" required>
                <option value="">Select Parliament Constituency</option>
            </select>
        </div>

        <!-- Assembly Constituency -->
        <div class="jet-form-row">
            <label for="vidhansabha">Assembly Constituency</label>
            <input type="text" id="vidhansabha" name="vidhansabha" class="jet-form-input">
        </div>

        <!-- Panchayat -->
        <div class="jet-form-row">
            <label for="panchayat">Panchayat</label>
            <input type="text" id="panchayat" name="panchayat" class="jet-form-input">
        </div>
    </div>

    <div class="step-4" style="display: none;">
        <!-- Member Image Upload -->
        <div class="jet-form-row">
            <label for="member_image">Upload your photo</label>
            <input type="file" id="member_image" name="member_image" class="jet-form-file">
        </div>
    </div>

    <!-- Step navigation buttons -->
    <div class="jet-form-row step-buttons">
        <button type="button" id="prev-step" class="jet-form-button">Previous</button>
        <button type="button" id="next-step" class="jet-form-button">Next</button>
        <button type="submit" class="jet-form-submit" style="display: none;">Pay Membership Fees</button>
    </div>
</form>

    </div>
    
    

    


    <?php
    return ob_get_clean();
}
add_shortcode('custom_member_form', 'custom_member_form_shortcode');









// Add this code to your theme's functions.php file or a custom plugin

// Function to generate options for days
function generate_day_options() {
    $options = array();
    for ($day = 1; $day <= 31; $day++) {
        $options[sprintf('%02d', $day)] = sprintf('%02d', $day); // Leading zero for two-digit format
    }
    return $options;
}

// Function to generate options for months
function generate_month_options() {
    $months = array(
        '01' => 'January',
        '02' => 'February',
        '03' => 'March',
        '04' => 'April',
        '05' => 'May',
        '06' => 'June',
        '07' => 'July',
        '08' => 'August',
        '09' => 'September',
        '10' => 'October',
        '11' => 'November',
        '12' => 'December'
    );
    return $months;
}

// Function to generate options for years
function generate_year_options($start_year, $end_year) {
    $options = array();
    for ($year = $start_year; $year <= $end_year; $year++) {
        $options[$year] = $year;
    }
    return $options;
}



function get_indian_states() {
    return array(
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep',
        'Delhi',
        'Puducherry',
        'Jammu and Kashmir',
        'Ladakh'
    );
}






function handle_custom_member_form_submission() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['custom_member_form_nonce']) && wp_verify_nonce($_POST['custom_member_form_nonce'], 'custom_member_form')) {
        // Sanitize form inputs
        $member_types = sanitize_text_field($_POST['member_types']);
        $full_name = sanitize_text_field($_POST['full_name']);
        $phone_number = sanitize_text_field($_POST['phone_number']);
        $email_address = sanitize_email($_POST['email_address']);
        $dob_day = intval($_POST['dob_day']);
        $dob_month = intval($_POST['dob_month']);
        $dob_year = intval($_POST['dob_year']);
        $address = sanitize_textarea_field($_POST['address']);
        $state = sanitize_text_field($_POST['state']);
        $district = sanitize_text_field($_POST['district']);
        $pin_code = sanitize_text_field($_POST['pin_code']);
        $position = sanitize_text_field($_POST['position']);
        $loksabha = sanitize_text_field($_POST['loksabha']);
        $vidhansabha = sanitize_text_field($_POST['vidhansabha']);
        $panchayat = sanitize_text_field($_POST['panchayat']);

        // Convert day, month, year to a single date
        $date_of_birth = sprintf('%04d-%02d-%02d', $dob_year, $dob_month, $dob_day);

        // Create a new member post with status 'pending'
        $post_id = wp_insert_post(array(
            'post_title' => $full_name,
            'post_type' => 'members', // Adjust this to your actual custom post type slug
            'post_status' => 'pending',
            'meta_input' => array(
                'member-types' => $member_types,
                'phone-number' => $phone_number,
                'email-id' => $email_address,
                'date-of-birth' => $date_of_birth,
                'address_98' => $address,
                'state' => $state,
                'district' => $district,
                'pin-code' => $pin_code,
                'position' => $position,
                'loksabha' => $loksabha,
                'vidhansabha' => $vidhansabha,
                'panchayat' => $panchayat,
            ),
        ));

        // Handle file upload if a file was uploaded
        if (!empty($_FILES['member_image']['name'])) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            $uploadedfile = $_FILES['member_image'];
            $upload_overrides = array('test_form' => false);
            $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

            if ($movefile && !isset($movefile['error'])) {
                // File is uploaded successfully
                $attachment_id = wp_insert_attachment(array(
                    'post_mime_type' => $movefile['type'],
                    'post_title' => sanitize_file_name($movefile['file']),
                    'post_content' => '',
                    'post_status' => 'inherit',
                    'post_parent' => $post_id,
                ), $movefile['file']);

                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attach_data = wp_generate_attachment_metadata($attachment_id, $movefile['file']);
                wp_update_attachment_metadata($attachment_id, $attach_data);

                // Set the featured image for the member post
                set_post_thumbnail($post_id, $attachment_id);
            }
        }
        
        // Get the necessary post meta data for the API request payload
$mobile_number = $phone_number; // Use sanitized phone number

// Set the amount and validity based on member types
if ($member_types === 'general') {
    $amount = 20;  // General membership amount
    $validity = 36; // 3 years in months
} elseif ($member_types === 'active') {
    $amount = 100;  // Active membership amount
    $validity = 36;  // 3 years in months
} else {
    $amount = 0;     // Default amount for other types
    $validity = 0;   // Default validity for other types
}

// Prepare the payload data
$payload = array(
    'amount' => $amount,
    'validity' => $validity,
    'email' => sanitize_email($email_address), // Use sanitized email address
    'mobileNumber' => sanitize_text_field($mobile_number), // Use sanitized mobile number
);

// Make the API request using wp_remote_post()
$response = wp_remote_post('https://api.indiannationalleague.party/membership', array(
    'method' => 'POST',
    'body' => json_encode($payload),
    'headers' => array(
        'Content-Type' => 'application/json',
    ),
));

// Check for errors in the response
if (is_wp_error($response)) {
    error_log('Membership API Request Failed: ' . $response->get_error_message());
} else {
    // Retrieve the response body
    $response_body = wp_remote_retrieve_body($response);
    $response_data = json_decode($response_body, true);

    // Log the response body for debugging
    error_log('Response Body: ' . $response_body);

    // Check if the response contains the payment URL
    if (isset($response_data['data'])) {
        // Log the payment URL for debugging
        error_log('Payment URL: ' . $response_data['data']);

        // Redirect to the payment gateway URL via PHP
        wp_redirect(esc_url($response_data['data']));
        exit(); // Ensure exit after the redirect
    } else {
        error_log('Payment URL not found in API response');
    }
}


        // Send email notifications
        $admin_email = get_option('admin_email');
        $admin_name = 'Indian National League';
        $admin_from_email = 'info@indiannationalleague.party';
        $admin_subject = 'New Member Registration Pending Approval';
        $admin_message = "A new member has been registered and is pending approval.\nDetails are as follows:\n" .
            "Position: $position\n" .
            "Full Name: $full_name\n" .
            "Email Address: $email_address\n" .
            "Phone Number: $phone_number\n" .
            "Date of Birth: $date_of_birth\n" .
            "Address: $address\n" .
            "State: $state\n" .
            "District: $district\n" .
            "Pin Code: $pin_code\n" .
            "Parliament Constituency: $loksabha\n" .
            "Assembly Constituency: $vidhansabha\n" .
            "Panchayat: $panchayat\n";

        // Send email to admin
        $admin_headers = array(
            'From: ' . $admin_name . ' <' . $admin_from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );
        wp_mail($admin_email, $admin_subject, $admin_message, $admin_headers);

        // Send confirmation email to user
        $user_subject = 'Registration Received';
        $user_message = "Thank you for registering with the Indian National League. Your details are as follows and are pending approval:\n" .
            "Position: $position\n" .
            "Full Name: $full_name\n" .
            "Email Address: $email_address\n" .
            "Phone Number: $phone_number\n" .
            "Date of Birth: $date_of_birth\n" .
            "Address: $address\n" .
            "State: $state\n" .
            "District: $district\n" .
            "Pin Code: $pin_code\n" .
            "Parliament Constituency: $loksabha\n" .
            "Assembly Constituency: $vidhansabha\n" .
            "Panchayat: $panchayat\n";

        // Send email to user
        $user_headers = array(
            'From: ' . $admin_name . ' <' . $admin_from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );
        wp_mail($email_address, $user_subject, $user_message, $user_headers);

        

        // Final exit to ensure the script ends
        exit();
    }
}
add_action('template_redirect', 'handle_custom_member_form_submission');




//League Forms code start here

function leagueFormShortCode() {
    ob_start();
    ?>
    <style>




/* Hide the increment and decrement buttons in number input */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        form {
            margin: 20px 0;
        }

        label {
            display: block;
            margin-bottom: 5px;
        }

        input[type="text"],
        input[type="number"],
        select {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #ffff
        }

        input[type="button"],
        input[type="submit"] {
            padding: 10px 20px;
            background-color: #006600;
            color: #fff;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            margin-right: 5px;
        }

        input[type="button"]:hover,
        input[type="submit"]:hover {
            background-color: #006433;
        }

        .step {
            display: none;
        }

        .step.active {
            display: block;
        }


        /* Styling for the photo upload section */
        .photo-upload {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .photo-upload label {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }

        .photo-upload input[type="file"] {
            width: 100%;
            padding: 10px;
            border: 2px solid #6f9263;
            border-radius: 5px;
            background-color: #f9f9f9;
            color: #333;
            font-size: 14px;
            cursor: pointer;
            transition: border-color 0.3s, background-color 0.3s;
        }

        .photo-upload input[type="file"]::-webkit-file-upload-button {
            background-color: #6f9263;
            color: #fff;
            border: none;
            border-radius: 30px;
            padding: 10px;
            cursor: pointer;
            font-size: 12px;
        }

        .photo-upload input[type="file"]:hover {
            border-color: #005f8d;
            background-color: #e0e0e0;
        }


</style>
    
    <!-- HTML Structure -->
    
    <div>
        <form id="league-form" method="post" enctype="multipart/form-data">
        <?php wp_nonce_field('league-form', 'league-form_nonce'); ?>

        <!-- Step 1 -->
        <div class="step active">
            <label for="league">Select League</label>
            <select id="league" name="league" onchange="showRelevantFields(this.value)" required>
                <option value="">Select a League</option>
                <option value="NYL">National Youth League (NYL)</option>
                <option value="NWL">National Women’s League (NWL)</option>
                <option value="NSL">National Student League (NSL)</option>
                <option value="NLU">National Labour Union (NLU)</option>
            </select>
            <div id="common-fields">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" placeholder="Enter your full name" required>

                <label for="age">Age</label>
                <input type="number" id="age" name="age" placeholder="Enter your age" required>
                <label for="aadhaar">Aadhaar</label>
                <input type="text" id="aadhaar" name="aadhaar" required placeholder="Enter aadhaar number" maxlength="12">
                <label for="phone-number">Phone Number</label>
                <input type="text" id="phone-number" name="phone-number" placeholder="Enter your phone number" required maxlength="10">
                <label for="email">Email</label>
                <input type="text" id="email" name="email" placeholder="Enter your email id" required>
                <label for="address">Address</label>
                <input type="text" id="address" name="address" placeholder="Enter your address" >
            </div>
            <input type="button" value="Next" onclick="nextStep()">
        </div>

        <!-- Step 2 -->
        <div class="step">
            <div id="common-fields">
                <label for="pin-code">Pin Code</label>
                <input type="text" id="pin-code" name="pin-code" placeholder="Enter your pin code" required>
                <label for="state">State</label>
                <select id="state" name="state" required>
                    <option value="">Select your state</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu
                    </option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    
                </select>


                <label for="district">District</label>
                <select id="district" name="district" required>
                    <option value="">Select your district</option>
                    <!-- Populate with district options based on state selection -->
                </select>
                <div class="photo-upload">
        <label for="photo">Upload your Photo</label>
        <input type="file" name="photo" id="photo">
    </div>
            </div>

            <input type="button" value="Previous" onclick="prevStep()">
            <input type="button" value="Next" onclick="nextStep()">
        </div>

        <!-- Step 3 -->
        <div class="step">
            <div id="league-specific-fields">
                <!-- This section will change based on the selected league -->
            </div>

            <input type="button" value="Previous" onclick="prevStep()">
            <input type="submit" value="Submit">
        </div>
    </form>
    </div>
    
    
    <?php
    return ob_get_clean();
}

add_shortcode('league_form', 'leagueFormShortCode');


function handle_league_form_submission() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['league-form_nonce']) && wp_verify_nonce($_POST['league-form_nonce'], 'league-form')) {
        // Sanitize form inputs
        $league = sanitize_text_field($_POST['league']);
        $full_name = sanitize_text_field($_POST['name']);
        $age = intval($_POST['age']);
        $aadhaar = sanitize_text_field($_POST['aadhaar']);
        $phone_number = sanitize_text_field($_POST['phone-number']);
        $email_address = sanitize_email($_POST['email']);
        $address = sanitize_text_field($_POST['address']);
        $state = sanitize_text_field($_POST['state']);
        $district = sanitize_text_field($_POST['district']);
        $pin_code = sanitize_text_field($_POST['pin-code']);


        // Handle league-specific fields & Insert Post
        if ($league === 'NYL') {
            $panchayat = sanitize_text_field($_POST['panchayat']);
            $assembly_constituency = sanitize_text_field($_POST['assembly-constituency']);
            $parliament_constituency = sanitize_text_field($_POST['parliament-constituency']);
            
            $post_type = 'nyl-members';
            
              // Insert the post NYL
        $post_id = wp_insert_post(array(
            'post_title' => $full_name,
            'post_type' => $post_type,
            'post_status' => 'pending', // Change to 'publish' if you want to publish immediately
            'meta_input' => array(
                'age' => $age,
                'aadhaar' => $aadhaar,
                'phone-number' => $phone_number,
                'email' => $email_address,
                'address' => $address,
                'state' => $state,
                'district' => $district,
                'pin-code' => $pin_code,
                'panchayat' => $panchayat,
                'assembly-constituency' => $assembly_constituency,
                'parliament-constituency' => $parliament_constituency,
            ),
        ));
            
        } elseif ($league === 'NWL') {
            $panchayat = sanitize_text_field($_POST['panchayat']);
            $assembly_constituency = sanitize_text_field($_POST['assembly-constituency']);
            $parliament_constituency = sanitize_text_field($_POST['parliament-constituency']);
            $post_type = 'nwl-members';
            
            
            // Insert the post NWL
        $post_id = wp_insert_post(array(
            'post_title' => $full_name,
            'post_type' => $post_type,
            'post_status' => 'pending', // Change to 'publish' if you want to publish immediately
            'meta_input' => array(
                'age' => $age,
                'aadhaar' => $aadhaar,
                'phone-number' => $phone_number,
                'email' => $email_address,
                'address' => $address,
                'state' => $state,
                'district' => $district,
                'pin-code' => $pin_code,
                'panchayat' => $panchayat,
                'assembly-constituency' => $assembly_constituency,
                'parliament-constituency' => $parliament_constituency,
            ),
        ));
            
        } elseif ($league === 'NSL') {
            $institution = sanitize_text_field($_POST['institution']);
            $institute_name = sanitize_text_field($_POST['institute-name']);
            $post_type = 'nsl-members';
            
            
            // Insert the post into NSL
        $post_id = wp_insert_post(array(
            'post_title' => $full_name,
            'post_type' => $post_type,
            'post_status' => 'pending', // Change to 'publish' if you want to publish immediately
            'meta_input' => array(
                'age' => $age,
                'aadhaar' => $aadhaar,
                'phone-number' => $phone_number,
                'email' => $email_address,
                'address' => $address,
                'state' => $state,
                'district' => $district,
                'pin-code' => $pin_code,
                'institution' => $institution,
                'institute-name' => $institute_name,
            ),
        ));
            
            
        } elseif ($league === 'NLU') {
            $unit = sanitize_text_field($_POST['unit']);
            $post_type = 'nlu-members';
            
            
            
            // Insert the post NLU
        $post_id = wp_insert_post(array(
            'post_title' => $full_name,
            'post_type' => $post_type,
            'post_status' => 'pending', // Change to 'publish' if you want to publish immediately
            'meta_input' => array(
                'age' => $age,
                'aadhaar' => $aadhaar,
                'phone-number' => $phone_number,
                'email' => $email_address,
                'address' => $address,
                'state' => $state,
                'district' => $district,
                'pin-code' => $pin_code,
                'areaunit' => $unit,
            ),
        ));
        }

        

        if (is_wp_error($post_id)) {
            // Handle the error here, maybe log it or display a message
            wp_redirect(home_url('/error-page'));
            exit;
        }

        // Handle photo upload if available
        if (!empty($_FILES['photo']['name'])) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            $uploadedfile = $_FILES['photo'];
            $upload_overrides = array('test_form' => false);
            $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

            if ($movefile && !isset($movefile['error'])) {
                // File uploaded successfully
                $attachment_id = wp_insert_attachment(array(
                    'post_mime_type' => $movefile['type'],
                    'post_title' => sanitize_file_name($movefile['file']),
                    'post_content' => '',
                    'post_status' => 'inherit',
                    'post_parent' => $post_id,
                ), $movefile['file']);

                if (!is_wp_error($attachment_id)) {
                    require_once(ABSPATH . 'wp-admin/includes/image.php');
                    $attach_data = wp_generate_attachment_metadata($attachment_id, $movefile['file']);
                    wp_update_attachment_metadata($attachment_id, $attach_data);

                    // Set the uploaded image as the featured image
                    set_post_thumbnail($post_id, $attachment_id);
                }
            } else {
                // Handle file upload error
                wp_redirect(home_url('/upload-error'));
                exit;
            }
        }

        // Redirect to a thank you page
        wp_redirect(home_url('/thank-you'));
        exit;
        
        
        // SEND EMAIL TO ADMIN & USER ---------------------------------

// Send email to admin
$admin_email = get_option('admin_email'); // Fetch admin email from WordPress settings
$admin_name = 'Indian National League'; // Sender name for admin email
$admin_from_email = 'info@indiannationalleague.party'; // From email address for admin email
$admin_subject = 'New Member Registration Pending Approval';
$admin_message = 'A new member has been registered and is pending approval. Basic details are as follows:' . "\r\n" .
    'Full Name: ' . $full_name . "\r\n" .
    'Email Address: ' . $email_address . "\r\n" .
    'Phone Number: ' . $phone_number . "\r\n";

// Set headers for admin email
$admin_headers = array(
    'From: ' . $admin_name . ' <' . $admin_from_email . '>',
    'Content-Type: text/html; charset=UTF-8',
);

// Send email to admin
wp_mail($admin_email, $admin_subject, $admin_message, $admin_headers);

// Send confirmation email to the user
$user_subject = 'Registration Received';
$user_message = 'Thank you for registering with the Indian National League. Your details are as follows and are pending approval:' . "\r\n" .
    'Full Name: ' . $full_name . "\r\n" .
    'Email Address: ' . $email_address . "\r\n" .
    'Phone Number: ' . $phone_number . "\r\n";

// Set headers for user email
$user_headers = array(
    'From: ' . $admin_name . ' <' . $admin_from_email . '>',
    'Content-Type: text/html; charset=UTF-8',
);

// Send email to user
wp_mail($email_address, $user_subject, $user_message, $user_headers);

    }
}
add_action('template_redirect', 'handle_league_form_submission');















