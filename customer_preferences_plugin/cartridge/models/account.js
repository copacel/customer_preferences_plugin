'use strict';

var base = module.superModule;

/**
 * Creates a plain object that contains preferences information
 * @param {Object} currentCustomer - current customer
 * @returns {Object} an object that contains information about the current customer's preferences
 */
function getPreferences(currentCustomer) {
    var result;
    if (currentCustomer) {
        result = {
            birthDay: Object.prototype.hasOwnProperty.call(currentCustomer.raw.profile, 'birthday') ? currentCustomer.raw.profile.birthday : null,
            newsletterSubscription: Object.prototype.hasOwnProperty.call(currentCustomer.raw.profile.custom, 'newsletterSubscription') ? currentCustomer.raw.profile.custom.newsletterSubscription : null,
            preferenceApparel: Object.prototype.hasOwnProperty.call(currentCustomer.raw.profile.custom, 'preferenceApparel') ? currentCustomer.raw.profile.custom.preferenceApparel : null,
            preferenceElectronics: Object.prototype.hasOwnProperty.call(currentCustomer.raw.profile.custom, 'preferenceElectronics') ? currentCustomer.raw.profile.custom.preferenceElectronics : null
        };
    } else {
        result = null;
    }
    return result;
}

function account(currentCustomer, addressModel, orderModel) {
    base.call(this, currentCustomer, addressModel, orderModel);
    this.customPreferences = getPreferences(currentCustomer);
}

module.exports = account;
