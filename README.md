## Sowaanerp Subscription

SowaanERP Subscription is a Frappe app that tracks subscription quota usage and enforces basic limits for users, companies, storage, and selected doctypes.

### Features

- Tracks and displays quota usage in the Usage Info single DocType.
- Enforces user and company limits through doc events.
- Enforces file and database space limits through doc events.
- Enforces document limits using a per-DocType limit table.
- Locks restricted doctypes so they cannot be edited, while still allowing enable/disable toggles to be changed and saved.
- Displays a subscription renewal banner in Desk when the expiry date is near.

### Requirements

- Frappe Framework installed (ERPNext compatible).
- A site with this app installed.

### Installation

From your bench folder:

```
bench get-app sowaanerp_subscription <repo-url>
bench --site <site-name> install-app sowaanerp_subscription
```

After install, run migrate if needed:

```
bench --site <site-name> migrate
```

### Configuration

The app stores quota settings in the site config under the `quota` key. A default quota is created during install/migrate. You can update values manually in `site_config.json`.

Example quota structure:

```json
{
	"quota": {
		"users": 5,
		"active_users": 0,
		"space": 0,
		"db_space": 0,
		"company": 2,
		"used_company": 1,
		"valid_till": "2026-12-31",
		"document_limit": {
			"Sales Invoice": { "limit": 10, "period": "Daily" },
			"Purchase Invoice": { "limit": 10, "period": "Weekly" }
		},
		"allow_restricted_toggle": 1,
		"restricted_doctypes": [
			"Client Script",
			"Server Script",
			"Print Format",
			"Custom Field",
			"DocType"
		]
	}
}
```

Restart the bench after updating site config.

### Restricted doctypes behavior

Restricted doctypes are not editable. If `allow_restricted_toggle` is set, the UI and server validation allow saving only when the change is limited to a toggle checkbox field.

Allowed toggle field names:

- enabled
- disabled
- is_disabled
- enable
- disable

If your doctype uses a different toggle field name, add it in the frontend and backend allow-lists.

### Usage Info

Open the Usage Info DocType to refresh usage and view limits. The app recalculates current usage and populates the child table with document usage per DocType.

### Scheduler

Daily tasks run via the app scheduler to keep usage data current.

### License

MIT