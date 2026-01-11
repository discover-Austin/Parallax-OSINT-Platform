fn main() {
    // Get the public key from environment variable
    let public_key = std::env::var("PARALLAX_LICENSE_PUBLIC_KEY").unwrap_or_else(|_| {
        // Default development key (replace in production)
        eprintln!("WARNING: PARALLAX_LICENSE_PUBLIC_KEY not set, using development key");
        "DEV_MODE_INSECURE_KEY_REPLACE_IN_PRODUCTION".to_string()
    });

    // Set the public key as a compile-time environment variable
    println!("cargo:rustc-env=PARALLAX_LICENSE_PUBLIC_KEY={}", public_key);

    // Run the tauri build
    tauri_build::build()
}
