# In your custom app's API file, e.g., sowaanerp_subscription/api.py
import frappe
from frappe.utils.data import date_diff, today
from frappe.installer import update_site_config

@frappe.whitelist(allow_guest=True)
def check_subscription():
    # Logic to check subscription status
    quota = frappe.get_site_config()['quota']
    valid_till = quota['valid_till']
    
    diff = date_diff(valid_till, today())
    if diff < 0:
        return {"status": "Expired", "valid_till": valid_till, "message": "Your subscription has expired."}
    return {"status": "Active", "valid_till": valid_till, "days_left": diff}

@frappe.whitelist()
def get_users():
    if frappe.session.user != 'Administrator':
        return {"error": "This action can only be performed by the Administrator."}
    users = frappe.get_all('User', fields=['name', 'email', 'enabled', 'creation'])
    user_permissions = []
    for user in users:
        perms = frappe.get_all('Has Role', filters={'parent': user['name']}, fields=['role'])
        user_permissions.append({
            'user': user['name'],
            'email': user['email'],
            'enabled': user['enabled'],
            'creation': user['creation'],
            'roles': [p['role'] for p in perms]
        })
    quota = frappe.get_site_config().get('quota', {})
    valid_till = quota.get('valid_till')
    status = 'Active'
    if valid_till:
        diff = date_diff(valid_till, today())
        if diff < 0:
            status = 'Expired'
    return {
        'users': user_permissions,
        'quota': quota,
        'valid_till': valid_till,
        'status': status
    }

@frappe.whitelist()
def update_quota(quota):
    """Update the quota in site_config.json."""
    if frappe.session.user != 'Administrator':
        return {"error": "This action can only be performed by the Administrator."}
    import json
    quota = json.loads(quota)
    update_site_config("quota", quota)
    return {"message": "Quota updated successfully."}

@frappe.whitelist()
def enable_disable_users(user_list, action):
    """Enable or disable users given a list of user names."""
    if frappe.session.user != 'Administrator':
        return {"error": "This action can only be performed by the Administrator."}
    import json
    user_list = json.loads(user_list)
    print('user_list', user_list)
    for user in user_list:
        if user in ['Administrator', 'Guest']:
            continue  # Prevent disabling the Administrator and Guest users
        try:
            print('user', user)
            frappe.db.set_value('User', user, 'enabled', 1 if action == 'enable' else 0)
        except Exception as e:
            frappe.log_error(f"Failed to {'enable' if action == 'enable' else 'disable'} user {user}: {e}")
    frappe.db.commit()
    # Return updated users list
    return get_users()
