#!/usr/bin/env python3
"""
Parallax License Key Generator

Generates simple offline-verifiable license keys for Parallax platform.

Usage:
    python generate-license.py customer@email.com pro
    python generate-license.py customer@email.com team
    python generate-license.py customer@email.com enterprise

License key format: PRLX-XXXX-XXXX-XXXX-XXXX
"""

import sys
import hashlib
import secrets
from datetime import datetime

# IMPORTANT: Change this to a random 64-character string and keep it secret!
# Generate one with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = "CHANGE_THIS_TO_RANDOM_64_CHAR_STRING_KEEP_IT_SECRET_AND_SAFE"

def generate_license(email: str, tier: str) -> str:
    """
    Generate a license key in format: PRLX-XXXX-XXXX-XXXX-XXXX

    The key contains:
    - Prefix: PRLX (Parallax)
    - Tier code: P=Pro, T=Team, E=Enterprise
    - Expiry: LIFE (lifetime license)
    - Hash: SHA256 of (email + tier + secret) for validation

    Args:
        email: Customer email address
        tier: License tier (pro, team, or enterprise)

    Returns:
        License key string
    """

    # Tier codes
    tier_codes = {
        "pro": "P",
        "team": "T",
        "enterprise": "E"
    }

    tier_lower = tier.lower()
    if tier_lower not in tier_codes:
        raise ValueError(f"Invalid tier: {tier}. Must be pro, team, or enterprise")

    tier_code = tier_codes[tier_lower]

    # All licenses are lifetime for now
    expiry = "LIFE"

    # Create hash for validation
    hash_input = f"{email}|{tier_lower}|{SECRET_KEY}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).hexdigest()

    # Take first 12 characters of hash
    hash_part = hash_digest[:12].upper()

    # Format: PRLX-{TIER}{EXPIRY}-{HASH}
    # Example: PRLX-PLIFE-A7F29K3MX8V1
    key_raw = f"PRLX{tier_code}{expiry}{hash_part}"

    # Split into 4-character segments for readability
    segments = [key_raw[i:i+4] for i in range(0, len(key_raw), 4)]
    license_key = "-".join(segments)

    return license_key


def validate_license(license_key: str, email: str) -> dict:
    """
    Validate a license key against an email address.

    Args:
        license_key: License key to validate
        email: Email address to validate against

    Returns:
        dict with validation results:
        - valid: bool
        - tier: str (if valid)
        - expiry: str (if valid)
        - error: str (if invalid)
    """
    try:
        # Remove dashes and whitespace
        key_clean = license_key.replace("-", "").replace(" ", "").strip()

        # Check format
        if not key_clean.startswith("PRLX"):
            return {"valid": False, "error": "Invalid format: must start with PRLX"}

        if len(key_clean) < 17:
            return {"valid": False, "error": "Invalid format: key too short"}

        # Extract components
        tier_code = key_clean[4]
        expiry = key_clean[5:9]
        hash_provided = key_clean[9:]

        # Reverse tier code
        tier_map = {"P": "pro", "T": "team", "E": "enterprise"}
        if tier_code not in tier_map:
            return {"valid": False, "error": "Invalid tier code"}

        tier = tier_map[tier_code]

        # Generate expected hash
        hash_input = f"{email}|{tier}|{SECRET_KEY}".encode('utf-8')
        hash_expected = hashlib.sha256(hash_input).hexdigest()[:12].upper()

        # Verify hash
        if hash_provided != hash_expected:
            return {"valid": False, "error": "Invalid key: hash mismatch"}

        return {
            "valid": True,
            "tier": tier,
            "expiry": expiry,
            "email": email
        }

    except Exception as e:
        return {"valid": False, "error": f"Validation error: {str(e)}"}


def print_usage():
    """Print usage instructions"""
    print("Parallax License Key Generator")
    print("=" * 50)
    print("\nUsage:")
    print("  python generate-license.py <email> <tier>")
    print("\nTiers:")
    print("  pro        - Professional ($79)")
    print("  team       - Team ($299, 5 licenses)")
    print("  enterprise - Enterprise (custom pricing)")
    print("\nExamples:")
    print("  python generate-license.py customer@example.com pro")
    print("  python generate-license.py team@company.com team")
    print()


def main():
    """Main entry point"""

    # Check for help flag
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        print_usage()
        sys.exit(0)

    # Check arguments
    if len(sys.argv) < 3:
        print("Error: Missing required arguments\n")
        print_usage()
        sys.exit(1)

    email = sys.argv[1]
    tier = sys.argv[2]

    # Validate email format (basic check)
    if '@' not in email or '.' not in email:
        print(f"Error: Invalid email format: {email}")
        sys.exit(1)

    try:
        # Generate license key
        license_key = generate_license(email, tier)

        print()
        print("=" * 60)
        print("License Key Generated Successfully")
        print("=" * 60)
        print(f"Email:   {email}")
        print(f"Tier:    {tier.upper()}")
        print(f"License: {license_key}")
        print("=" * 60)
        print()

        # Test validation
        validation = validate_license(license_key, email)
        print("Validation Test:")
        if validation['valid']:
            print(f"  ✓ Valid")
            print(f"  Tier: {validation['tier']}")
            print(f"  Expiry: {validation['expiry']}")
        else:
            print(f"  ✗ Invalid: {validation.get('error', 'Unknown error')}")
        print()

        # Instructions
        print("Next Steps:")
        print("1. Send this license key to the customer via email")
        print("2. Customer activates in Settings → License")
        print("3. Track in your sales spreadsheet")
        print()

    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
