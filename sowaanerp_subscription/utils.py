import frappe
from frappe import _


RESTRICTED_TOGGLE_FIELDS = {
    "enabled",
    "disabled",
    "is_disabled",
    "enable",
    "disable",
}


def _get_changed_fields(doc):
    meta = frappe.get_meta(doc.doctype)
    changed_fields = []
    for df in meta.fields:
        if df.fieldname and doc.has_value_changed(df.fieldname):
            changed_fields.append(df.fieldname)
    return changed_fields


def _is_toggle_only_change(doc):
    if doc.is_new():
        return False
    changed_fields = _get_changed_fields(doc)
    if not changed_fields:
        return True
    return set(changed_fields).issubset(RESTRICTED_TOGGLE_FIELDS)


def _is_restricted_toggle_allowed():
    quota = (frappe.get_site_config().get("quota") or {})
    value = quota.get("allow_restricted_toggle", 1)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"0", "false", "no"}:
            return False
        if normalized in {"1", "true", "yes"}:
            return True
    return bool(value)


def check_doctype_restriction(doc, method=None):
    site_config = frappe.get_site_config()
    restricted_doctypes = (site_config.get("quota") or {}).get("restricted_doctypes") or []
    if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
        return
    if doc.doctype in restricted_doctypes:
        if _is_restricted_toggle_allowed() and _is_toggle_only_change(doc):
            return
        frappe.throw(_("Error saving this DocType"))
