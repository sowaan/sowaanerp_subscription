const frappe_cloud_base_endpoint = 'https://frappecloud.com';
const restrictedDoctypes = (frappe.boot && frappe.boot.quota && frappe.boot.quota.restricted_doctypes) || [];
const restrictedToggleFields = ["enabled", "disabled", "is_disabled", "enable", "disable"];

function getConfigFlag(value, defaultValue) {
	if (value === undefined || value === null) {
		return defaultValue;
	}
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "0" || normalized === "false" || normalized === "no") {
			return false;
		}
		if (normalized === "1" || normalized === "true" || normalized === "yes") {
			return true;
		}
	}
	return Boolean(value);
}

function isRestrictedToggleAllowed() {
	return getConfigFlag(frappe?.boot?.quota?.allow_restricted_toggle, true);
}

// Monkey-patch Form.prototype.refresh to apply restriction UI on every form render
(function () {

	const _originalRefresh = frappe.ui.form.Form.prototype.refresh;
	frappe.ui.form.Form.prototype.refresh = function (...args) {
		const result = _originalRefresh.apply(this, args);
		applyDoctypeRestrictionUI(this);
		// Delayed re-apply to catch buttons added by other scripts
		setTimeout(() => applyDoctypeRestrictionUI(this), 300);
		setTimeout(() => applyDoctypeRestrictionUI(this), 1000);
		return result;
	};
})();

function applyDoctypeRestrictionUI(frm) {
	if (!restrictedDoctypes.includes(frm.doctype)) {
		return;
	}

	const allowToggle = isRestrictedToggleAllowed();
	const toggleFields = allowToggle
		? restrictedToggleFields.filter((fieldname) => frm.fields_dict && frm.fields_dict[fieldname])
		: [];
	setReadOnlyForRestrictedForm(frm, toggleFields);

	if (toggleFields.length) {
		frm.enable_save();
		applyRestrictionActionVisibility(frm, true);
		return;
	}

	frm.disable_save();
	if (frm.page && frm.page.clear_primary_action) {
		frm.page.clear_primary_action();
	}
	applyRestrictionActionVisibility(frm, false);
}

function setReadOnlyForRestrictedForm(frm, toggleFields) {
	const allowedFields = new Set(toggleFields);
	const fields = (frm.meta && frm.meta.fields) || [];
	fields.forEach((df) => {
		if (!df.fieldname) {
			return;
		}
		const readOnly = allowedFields.has(df.fieldname) ? (df.read_only || 0) : 1;
		frm.set_df_property(df.fieldname, "read_only", readOnly);
	});
	frm.refresh_fields();
}

function applyRestrictionActionVisibility(frm, allowPrimary) {
	if (!frm.page || !frm.page.wrapper) {
		return;
	}

	const wrapper = frm.page.wrapper;
	if (!allowPrimary) {
		wrapper.find('.primary-action, .btn-primary-dark, .btn-primary, .btn-secondary').hide();
	} else {
		wrapper.find('.primary-action, .btn-primary-dark, .btn-primary').show();
		wrapper.find('.btn-secondary').hide();
	}

	wrapper.find('.custom-actions .btn, .custom-btn-group .btn').hide();
	wrapper.find('.custom-actions').hide();
	const standardButtons = wrapper.find('.standard-actions .btn').not('.menu-btn-group .btn');
	if (allowPrimary) {
		standardButtons.not('.primary-action, .btn-primary-dark, .btn-primary').hide();
	} else {
		standardButtons.hide();
	}
	wrapper.find('.menu-btn-group').hide();
	wrapper.find('.page-actions .btn-default').hide();

	if (frm.page.inner_toolbar) {
		frm.page.inner_toolbar.find('.btn').hide();
	}
}
function calculate_trial_end_days() {
	// try to check for trial_end_date in frappe.boot.subscription_conf
	if (frappe.boot.quota.valid_till) {
		const trial_end_date = new Date(
			frappe.boot.quota.valid_till,
		);
		const today = new Date();
		const diffTime = trial_end_date - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	} else {
		return 999;
	}
}
console.log(frappe.boot);
const trial_end_days = calculate_trial_end_days();

const trial_end_string =
	trial_end_days > 1 ? `${trial_end_days} days` : `${trial_end_days} day`;

let subscription_string = __(
	`Your subscription expires in ${trial_end_string}. Please renew promptly to avoid any interruption in services.`,
);

let $floatingBar = $(`
			<div class="flex justify-content-center flex-col px-2"
				style="
					background-color: rgb(254 243 199);
					border-radius: 10px;
					margin-bottom: 20px;
					z-index: 1;"
			>
			<svg xmlns="http://www.w3.org/2000/svg" width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-alert-triangle my-auto"
			>
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
				<line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			<p style="margin: auto 0; margin-right: 20px; padding-left: 10px;">
				${subscription_string}
			</p>
			<a type="button"
				class="dismiss-upgrade text-muted"
				data-dismiss="modal"
				aria-hidden="true"
				style="font-size:24px;
				margin-bottom: 5px;
				margin-right: 5px"
			>×</a>
			</div>
`);

$(document).ready(function () {
	// console.log('Trial end days:', trial_end_days);
	// console.log("frappe.is_mobile():", frappe.is_mobile());
	// console.log("frappe.boot.setup_complete:", frappe.boot.setup_complete);

	const setupComplete = frappe.boot?.setup_complete;

	if (setupComplete === 1 || setupComplete === true || setupComplete === "1") {
		if (
			!frappe.is_mobile() &&
			trial_end_days > 0 &&
			trial_end_days <= 30
		) {
			// console.log('Displaying subscription renewal notification bar.');
			$('.layout-main-section').before($floatingBar);

			$floatingBar.find('.dismiss-upgrade').on('click', () => {
				$floatingBar.remove();
			});
		}
		// if (frappe.user.has_role('System Manager')) {
		// 	add_frappe_cloud_dashboard_link();
		// }
	}
});

