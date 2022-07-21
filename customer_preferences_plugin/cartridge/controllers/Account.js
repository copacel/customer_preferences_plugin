'use strict';

/**
 * @namespace Account
 */

var server = require('server');

var baseAccount = module.superModule;
server.extend(baseAccount);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');



/**
 * Account-EditProfile : The Account-EditProfile endpoint renders the page that allows a shopper to edit their profile. The edit profile form is prefilled with the shopper's first name, last name, phone number and email
 * @name Base/Account-EditProfile
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'EditPreferences',
    server.middleware.https,
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var ContentMgr = require('dw/content/ContentMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');

        var accountModel = accountHelpers.getAccountModel(req);
        var preferencesForm = server.forms.getForm('preferences');
        preferencesForm.clear();
        preferencesForm.customer_preferences.birthDay.value = accountModel.customPreferences.birthDay.toLocaleDateString("en-US");
        preferencesForm.customer_preferences.newsletterSubscription.checked = accountModel.customPreferences.newsletterSubscription;
        preferencesForm.customer_preferences.preferenceApparel.checked = accountModel.customPreferences.preferenceApparel;
        preferencesForm.customer_preferences.preferenceElectronics.checked = accountModel.customPreferences.preferenceElectronics;
        res.render('account/preferences', {
            preferencesForm: preferencesForm,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('Account-Show').toString()
                }
            ]
        });
        next();
    }
);

/**
 * @name Base/Account-SavePreferences
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password  - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensititve
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'SavePreferences',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require('dw/system/Transaction');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

        var formErrors = require('*/cartridge/scripts/formErrors');

        var preferencesForm = server.forms.getForm('preferences');

        var result = {
            birthDay: preferencesForm.customer_preferences.birthDay.value,
            newsletterSubscription: req.form.newsletterSubscription,
            preferenceApparel: req.form.preferenceApparel,
            preferenceElectronics: req.form.preferenceElectronics,
            preferencesForm: preferencesForm
        };
        if (preferencesForm.valid) {
            res.setViewData(result);
            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var profile = customer.getProfile();

                if (customer) {
                    Transaction.wrap(function () {
                        //profile.birthday = formInfo.birthDay;
                        profile.custom.preferenceApparel = (typeof formInfo.preferenceApparel !== 'undefined') ? true : false;
                        profile.custom.preferenceElectronics = (typeof formInfo.preferenceElectronics !== 'undefined') ? true : false;
                        profile.custom.newsletterSubscription = (typeof formInfo.newsletterSubscription !== 'undefined') ? true : false
                    });

                    delete formInfo.profileForm;

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Account-Show').toString()
                    });
                } else {
                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Login-Show').toString()
                    });
                }
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(preferencesForm)
            });
        }
        return next();
    }
);


module.exports = server.exports();
