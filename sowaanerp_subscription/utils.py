import frappe
from frappe import _


def check_doctype_restriction(doc, method=None):
    restricted_doctypes = frappe.get_site_config().get("restricted_doctypes") or []
    if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
        return
    if doc.doctype in restricted_doctypes:
        frappe.throw(_("Error saving this DocType"))
