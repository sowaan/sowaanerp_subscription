import frappe
from frappe import get_site_config

def boot_session(bootinfo):
    # Fetch the site config
    site_config = get_site_config()
    quota = site_config.get("quota", None)

    # Add the custom value to the boot info
    bootinfo.quota = quota
    if quota is not None:
        quota.setdefault("restricted_doctypes", [])