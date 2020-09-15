'use strict'
const { listRenewalUsers } = require('../../database/repositories/user-roles')
const { findCustomer } = require('./')
const { deleteUser } = require('../users')

module.exports = async () => {
    try {
        const USERS = await listRenewalUsers()

        for (const user of USERS) {
            const CUSTOMER = await findCustomer(user.stripe_id)
            if (!CUSTOMER) continue
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION) {
                if (!(await deleteUser(user.user_id))) continue
                console.log(`User '${user.username}' had renewal role without subscription. User's role has been removed.`)
            }
        }
    } catch (e) {
        console.error(e)
    }
}
