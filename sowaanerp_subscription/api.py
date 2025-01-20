# In your custom app's API file, e.g., sowaanerp_subscription/api.py
import frappe
from frappe.utils.data import date_diff, today

@frappe.whitelist(allow_guest=True)
def check_subscription():
    # Logic to check subscription status
    quota = frappe.get_site_config()['quota']
    valid_till = quota['valid_till']
    
    diff = date_diff(valid_till, today())
    if diff < 0:
        return {"status": "expired", "valid_till": valid_till, "message": "Your subscription has expired."}
    return {"status": "active"}
