import frappe
from frappe import _
from frappe.utils.data import date_diff, today


def successful_login(login_manager):
    """
    on_login verify if site is not expired
    """
    quota = frappe.get_site_config()['quota']
    valid_till = quota['valid_till']
    diff = date_diff(valid_till, today())
    if diff < 0:
        frappe.throw(_("Your subscription is expired. Please contact sales"), frappe.AuthenticationError)
