// public/js/check_subscription.js
frappe.ready(() => {
    frappe.call({
        method: "sowaanerp_subscription.api.check_subscription",
        callback: function (response) {
            console.log(response)
            if (response.message.status === "expired") {
                const valid_till = new Date(response.message.valid_till);
                const today = new Date();
                const diffTime = valid_till - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const trial_end_days = Math.abs(diffDays)
                // console.log(diffDays, response.message.valid_till)
                const trial_end_string =
                    trial_end_days > 1 ? `${trial_end_days} days ago` : `${trial_end_days} day ago`;
                let subscription_string = __(
                    `Your subscription has expired ${trial_end_string}. Please contact support to renew.`,
                );
                $("body").html(`
                    <div class="container mt-5">
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="alert alert-danger text-center">
                                    <img class="app-logo" src="/assets/erpnext/images/favicon.png" alt="App Logo" class="mb-4" style="max-width: 60px;">
                                    <h4 class="alert-heading">${__("Subscription Expired")}</h4>
                                    <p>${subscription_string}</p>
                                    <hr>
                                    <p class="mb-0">${__("Thank you for using SowaanERP.")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                // Redirect to a custom page or block further actions
                // window.location.href = "/subscription-expired";
            }
        },
    });
});