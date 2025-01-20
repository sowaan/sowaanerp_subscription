import frappe
from frappe import get_site_config

def boot_session(bootinfo):
    # Fetch the site config
    site_config = get_site_config()

    # Add the custom value to the boot info
    bootinfo.quota = site_config.get("quota", None)