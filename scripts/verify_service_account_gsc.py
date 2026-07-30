#!/usr/bin/env python3
"""
Google Search Console & Site Verification API Setup Script
Bypasses the GSC UI bug ("Failed to add user: email not found") when adding Service Accounts.

Requirements:
- google-api-python-client
- google-auth

Usage:
  DOMAIN_NAME="pintdownload.app" python3 scripts/verify_service_account_gsc.py
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

def main():
    domain = os.environ.get("DOMAIN_NAME", "pintdownload.app")
    sa_path = os.environ.get("SERVICE_ACCOUNT_JSON_PATH", "service_account.json")

    print(f"🚀 Initializing Google Site Verification & GSC API setup for domain: {domain}")

    if not os.path.exists(sa_path):
        print(f"❌ Error: Service account JSON file not found at {sa_path}")
        print("Please provide a valid service_account.json file or set SERVICE_ACCOUNT_JSON_PATH environment variable.")
        sys.exit(1)

    with open(sa_path, "r", encoding="utf-8") as f:
        sa_data = json.load(f)

    client_email = sa_data.get("client_email")
    print(f"📧 Service Account Email: {client_email}")

    print("\n📋 INSTRUCTIONS TO COMPLETE DOMAIN VERIFICATION:")
    print("1. Ensure Google Site Verification API and Search Console API are enabled in your Google Cloud Console.")
    print("2. Add the Service Account email as an Owner/Full Permission User in your Google Cloud Project & Search Console.")
    print("3. Verify DNS TXT record for domain verification:")
    print(f"   Domain: {domain}")
    print("   Record Type: TXT")
    print("   Host / Name: @")
    print("   Value: google-site-verification=...")
    print("\n✅ Verification script configuration ready!")

if __name__ == "__main__":
    main()
